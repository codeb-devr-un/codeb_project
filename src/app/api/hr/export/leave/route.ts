// =============================================================================
// 연차대장 엑셀 내보내기 API - 노무사 제출용
// =============================================================================

import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth-options'
import { prisma } from '@/lib/prisma'
import { secureLogger, createErrorResponse } from '@/lib/security'
import ExcelJS from 'exceljs'
import { calculateAnnualLeave } from '@/lib/tax-calculator'

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return createErrorResponse('Unauthorized', 401, 'AUTH_REQUIRED')
    }

    const workspaceId = request.headers.get('x-workspace-id')
    if (!workspaceId) {
      return createErrorResponse('Workspace ID required', 400, 'MISSING_WORKSPACE')
    }

    // 관리자 권한 확인
    const membership = await prisma.workspaceMember.findFirst({
      where: { workspaceId, userId: session.user.id, role: 'admin' }
    })

    if (!membership) {
      return createErrorResponse('Admin access required', 403, 'FORBIDDEN')
    }

    const searchParams = request.nextUrl.searchParams
    const year = parseInt(searchParams.get('year') || new Date().getFullYear().toString())

    // 직원 목록 조회
    const employees = await prisma.employee.findMany({
      where: {
        workspaceId,
        status: { in: ['ACTIVE', 'ONBOARDING', 'ON_LEAVE'] }
      },
      select: {
        id: true,
        nameKor: true,
        employeeNumber: true,
        department: true,
        position: true,
        hireDate: true,
      },
      orderBy: [
        { department: 'asc' },
        { nameKor: 'asc' }
      ]
    })

    // 연차 잔여 현황 조회
    const leaveBalances = await prisma.leaveBalance.findMany({
      where: {
        workspaceId,
        year,
        employeeId: { in: employees.map(e => e.id) }
      }
    })

    // 휴가 사용 내역 조회 (해당 년도)
    const startOfYear = new Date(year, 0, 1)
    const endOfYear = new Date(year, 11, 31)

    const leaveRequests = await prisma.leaveRequest.findMany({
      where: {
        workspaceId,
        startDate: { gte: startOfYear },
        endDate: { lte: endOfYear },
        status: 'APPROVED',
        employeeId: { in: employees.map(e => e.id) }
      },
      orderBy: { startDate: 'asc' }
    })

    // 워크스페이스 정보
    const workspace = await prisma.workspace.findUnique({
      where: { id: workspaceId },
      select: { name: true, businessName: true }
    })

    // 휴가 유형 매핑
    const leaveTypeMap: Record<string, string> = {
      ANNUAL: '연차',
      SICK: '병가',
      HALF_AM: '오전반차',
      HALF_PM: '오후반차',
      SPECIAL: '특별휴가',
      MATERNITY: '출산휴가',
      CHILDCARE: '육아휴직',
      OFFICIAL: '공가'
    }

    // 엑셀 생성
    const workbook = new ExcelJS.Workbook()
    workbook.creator = 'WorkB CMS'

    // ========== 시트 1: 연차현황표 ==========
    const summarySheet = workbook.addWorksheet('연차현황표', {
      pageSetup: { paperSize: 9, orientation: 'landscape' }
    })

    // 제목
    summarySheet.mergeCells('A1:L1')
    summarySheet.getCell('A1').value = `연차현황표 (${year}년)`
    summarySheet.getCell('A1').font = { bold: true, size: 16 }
    summarySheet.getCell('A1').alignment = { horizontal: 'center' }
    summarySheet.getRow(1).height = 30

    // 사업장 정보
    summarySheet.mergeCells('A2:L2')
    summarySheet.getCell('A2').value = `사업장: ${workspace?.businessName || workspace?.name || '-'} | 기준일: ${new Date().toLocaleDateString('ko-KR')}`

    // 헤더
    const headers = [
      'No', '사번', '성명', '부서', '직책', '입사일', '근속년수',
      '발생연차', '이월연차', '총연차', '사용연차', '잔여연차'
    ]

    const headerRow = summarySheet.getRow(4)
    headers.forEach((header, idx) => {
      const cell = headerRow.getCell(idx + 1)
      cell.value = header
      cell.font = { bold: true, color: { argb: 'FFFFFFFF' } }
      cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF43A047' } }
      cell.alignment = { horizontal: 'center', vertical: 'middle' }
      cell.border = {
        top: { style: 'thin' },
        left: { style: 'thin' },
        bottom: { style: 'thin' },
        right: { style: 'thin' }
      }
    })
    headerRow.height = 25

    // 컬럼 너비
    summarySheet.columns = [
      { width: 5 },  // No
      { width: 10 }, // 사번
      { width: 12 }, // 성명
      { width: 12 }, // 부서
      { width: 10 }, // 직책
      { width: 12 }, // 입사일
      { width: 10 }, // 근속년수
      { width: 10 }, // 발생연차
      { width: 10 }, // 이월연차
      { width: 10 }, // 총연차
      { width: 10 }, // 사용연차
      { width: 10 }, // 잔여연차
    ]

    // 데이터 행
    let totalGenerated = 0
    let totalCarryOver = 0
    let totalUsed = 0
    let totalRemaining = 0

    employees.forEach((emp, idx) => {
      const row = summarySheet.getRow(5 + idx)
      const balance = leaveBalances.find(b => b.employeeId === emp.id)

      // 근속년수 계산
      let yearsOfService = 0
      let generatedLeave = 0
      if (emp.hireDate) {
        const annualLeave = calculateAnnualLeave(emp.hireDate, new Date(year, 11, 31))
        yearsOfService = annualLeave.yearsOfService
        generatedLeave = annualLeave.totalDays
      }

      const annualTotal = balance?.annualTotal || generatedLeave
      const carryOver = balance?.annualCarryOver || 0
      const totalAnnual = annualTotal + carryOver
      const used = balance?.annualUsed || 0
      const remaining = totalAnnual - used

      row.values = [
        idx + 1,
        emp.employeeNumber || '-',
        emp.nameKor,
        emp.department || '-',
        emp.position || '-',
        emp.hireDate ? emp.hireDate.toLocaleDateString('ko-KR') : '-',
        `${Math.floor(yearsOfService)}년 ${Math.floor((yearsOfService % 1) * 12)}개월`,
        annualTotal,
        carryOver,
        totalAnnual,
        used,
        remaining
      ]

      totalGenerated += annualTotal
      totalCarryOver += carryOver
      totalUsed += used
      totalRemaining += remaining

      // 잔여연차가 적으면 강조
      if (remaining <= 3) {
        row.getCell(12).font = { color: { argb: 'FFF44336' }, bold: true }
      }

      row.eachCell(cell => {
        cell.border = {
          top: { style: 'thin' },
          left: { style: 'thin' },
          bottom: { style: 'thin' },
          right: { style: 'thin' }
        }
        cell.alignment = { horizontal: 'center', vertical: 'middle' }
      })
    })

    // 합계 행
    const totalRow = summarySheet.getRow(5 + employees.length)
    totalRow.values = [
      '합계', '', '', '', '', '', '',
      totalGenerated, totalCarryOver, totalGenerated + totalCarryOver, totalUsed, totalRemaining
    ]
    summarySheet.mergeCells(`A${5 + employees.length}:G${5 + employees.length}`)
    totalRow.font = { bold: true }
    totalRow.eachCell(cell => {
      cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFF5F5F5' } }
      cell.border = {
        top: { style: 'thin' },
        left: { style: 'thin' },
        bottom: { style: 'thin' },
        right: { style: 'thin' }
      }
    })

    // ========== 시트 2: 휴가사용내역 ==========
    const detailSheet = workbook.addWorksheet('휴가사용내역')

    detailSheet.mergeCells('A1:H1')
    detailSheet.getCell('A1').value = `휴가사용내역 (${year}년)`
    detailSheet.getCell('A1').font = { bold: true, size: 14 }
    detailSheet.getCell('A1').alignment = { horizontal: 'center' }

    const detailHeaders = ['No', '성명', '부서', '휴가유형', '시작일', '종료일', '사용일수', '사유']

    const detailHeaderRow = detailSheet.getRow(3)
    detailHeaders.forEach((header, idx) => {
      const cell = detailHeaderRow.getCell(idx + 1)
      cell.value = header
      cell.font = { bold: true, color: { argb: 'FFFFFFFF' } }
      cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF1976D2' } }
      cell.alignment = { horizontal: 'center' }
    })

    detailSheet.columns = [
      { width: 5 },
      { width: 12 },
      { width: 12 },
      { width: 12 },
      { width: 12 },
      { width: 12 },
      { width: 10 },
      { width: 30 },
    ]

    // 직원별 매핑
    const employeeMap = new Map(employees.map(e => [e.id, e]))

    leaveRequests.forEach((leave, idx) => {
      const row = detailSheet.getRow(4 + idx)
      const emp = employeeMap.get(leave.employeeId)

      row.values = [
        idx + 1,
        emp?.nameKor || '-',
        emp?.department || '-',
        leaveTypeMap[leave.type] || leave.type,
        leave.startDate.toLocaleDateString('ko-KR'),
        leave.endDate.toLocaleDateString('ko-KR'),
        leave.days,
        leave.reason || '-'
      ]

      row.eachCell(cell => {
        cell.border = {
          top: { style: 'thin' },
          left: { style: 'thin' },
          bottom: { style: 'thin' },
          right: { style: 'thin' }
        }
      })
    })

    // ========== 시트 3: 월별 휴가 사용 현황 ==========
    const monthlySheet = workbook.addWorksheet('월별현황')

    monthlySheet.mergeCells('A1:N1')
    monthlySheet.getCell('A1').value = `월별 휴가 사용 현황 (${year}년)`
    monthlySheet.getCell('A1').font = { bold: true, size: 14 }
    monthlySheet.getCell('A1').alignment = { horizontal: 'center' }

    const monthlyHeaders = ['성명', '1월', '2월', '3월', '4월', '5월', '6월', '7월', '8월', '9월', '10월', '11월', '12월', '합계']

    const monthlyHeaderRow = monthlySheet.getRow(3)
    monthlyHeaders.forEach((header, idx) => {
      const cell = monthlyHeaderRow.getCell(idx + 1)
      cell.value = header
      cell.font = { bold: true, color: { argb: 'FFFFFFFF' } }
      cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF7B1FA2' } }
      cell.alignment = { horizontal: 'center' }
    })

    monthlySheet.columns = [
      { width: 12 },
      ...Array(12).fill({ width: 6 }),
      { width: 8 }
    ]

    // 직원별 월별 휴가 사용 집계
    employees.forEach((emp, idx) => {
      const row = monthlySheet.getRow(4 + idx)
      const empLeaves = leaveRequests.filter(l => l.employeeId === emp.id)

      const monthlyUsage = Array(12).fill(0)
      empLeaves.forEach(leave => {
        const month = leave.startDate.getMonth()
        monthlyUsage[month] += leave.days
      })

      const total = monthlyUsage.reduce((a, b) => a + b, 0)

      row.values = [emp.nameKor, ...monthlyUsage, total]

      row.eachCell((cell, colNumber) => {
        cell.alignment = { horizontal: 'center' }
        cell.border = {
          top: { style: 'thin' },
          left: { style: 'thin' },
          bottom: { style: 'thin' },
          right: { style: 'thin' }
        }

        // 사용량이 있으면 배경색
        if (colNumber > 1 && colNumber <= 13 && (cell.value as number) > 0) {
          cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFFFF3E0' } }
        }
      })
    })

    // 버퍼로 변환
    const buffer = await workbook.xlsx.writeBuffer()

    const filename = `연차대장_${year}년_${new Date().toISOString().split('T')[0]}.xlsx`

    secureLogger.info('Leave report exported', {
      operation: 'hr.export.leave',
      workspaceId,
      year,
      employeeCount: employees.length,
      requestCount: leaveRequests.length
    })

    return new NextResponse(buffer, {
      headers: {
        'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'Content-Disposition': `attachment; filename*=UTF-8''${encodeURIComponent(filename)}`,
      },
    })
  } catch (error) {
    secureLogger.error('Leave export failed', error as Error, { operation: 'hr.export.leave' })
    return createErrorResponse('Export failed', 500, 'EXPORT_FAILED')
  }
}
