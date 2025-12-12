// =============================================================================
// 4대보험 취득/상실 신고서 데이터 API
// =============================================================================

import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth-options'
import { prisma } from '@/lib/prisma'
import { secureLogger, createErrorResponse } from '@/lib/security'
import ExcelJS from 'exceljs'

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
    const type = searchParams.get('type') || 'all' // 'acquisition' | 'loss' | 'all'
    const year = parseInt(searchParams.get('year') || new Date().getFullYear().toString())
    const month = searchParams.get('month') ? parseInt(searchParams.get('month')!) : null

    // 날짜 범위 설정
    const startDate = month
      ? new Date(year, month - 1, 1)
      : new Date(year, 0, 1)
    const endDate = month
      ? new Date(year, month, 0)
      : new Date(year, 11, 31)

    // 취득자 (입사자) 조회
    const acquisitions = type === 'loss' ? [] : await prisma.employee.findMany({
      where: {
        workspaceId,
        hireDate: {
          gte: startDate,
          lte: endDate
        },
        status: { in: ['ACTIVE', 'ONBOARDING'] }
      },
      select: {
        id: true,
        nameKor: true,
        residentNumber: true,
        employeeNumber: true,
        department: true,
        position: true,
        hireDate: true,
        employmentType: true,
        baseSalaryMonthly: true,
        hourlyWage: true,
        payrollType: true,
      },
      orderBy: { hireDate: 'asc' }
    })

    // 상실자 (퇴사자) 조회
    const losses = type === 'acquisition' ? [] : await prisma.employee.findMany({
      where: {
        workspaceId,
        resignDate: {
          gte: startDate,
          lte: endDate
        },
        status: 'RESIGNED'
      },
      select: {
        id: true,
        nameKor: true,
        residentNumber: true,
        employeeNumber: true,
        department: true,
        position: true,
        hireDate: true,
        resignDate: true,
        employmentType: true,
        baseSalaryMonthly: true,
      },
      orderBy: { resignDate: 'asc' }
    })

    // 워크스페이스 정보
    const workspace = await prisma.workspace.findUnique({
      where: { id: workspaceId },
      select: { name: true, businessName: true, ownerName: true }
    })

    // 고용형태 매핑
    const employmentTypeMap: Record<string, string> = {
      FULL_TIME: '상용',
      PART_TIME: '일용',
      CONTRACT: '계약',
      INTERN: '수습',
      FREELANCER: '기타'
    }

    // 엑셀 생성
    const workbook = new ExcelJS.Workbook()
    workbook.creator = 'WorkB CMS'

    // ========== 시트 1: 취득신고서 ==========
    if (type !== 'loss' && acquisitions.length > 0) {
      const acqSheet = workbook.addWorksheet('4대보험 취득신고', {
        pageSetup: { paperSize: 9, orientation: 'landscape' }
      })

      // 제목
      acqSheet.mergeCells('A1:L1')
      acqSheet.getCell('A1').value = `4대보험 자격취득 신고서 (${year}년 ${month ? month + '월' : '연간'})`
      acqSheet.getCell('A1').font = { bold: true, size: 14 }
      acqSheet.getCell('A1').alignment = { horizontal: 'center' }

      // 사업장 정보
      acqSheet.mergeCells('A2:L2')
      acqSheet.getCell('A2').value = `사업장: ${workspace?.businessName || workspace?.name || '-'} | 대표자: ${workspace?.ownerName || '-'}`
      acqSheet.getCell('A2').alignment = { horizontal: 'left' }

      // 헤더
      const acqColumns = [
        { header: 'No', key: 'no', width: 5 },
        { header: '성명', key: 'name', width: 12 },
        { header: '주민등록번호', key: 'residentNumber', width: 16 },
        { header: '취득일자', key: 'acquisitionDate', width: 12 },
        { header: '부서', key: 'department', width: 12 },
        { header: '직책', key: 'position', width: 10 },
        { header: '고용형태', key: 'employmentType', width: 10 },
        { header: '월급여(원)', key: 'monthlySalary', width: 14 },
        { header: '국민연금', key: 'nationalPension', width: 10 },
        { header: '건강보험', key: 'healthInsurance', width: 10 },
        { header: '고용보험', key: 'employmentInsurance', width: 10 },
        { header: '비고', key: 'note', width: 15 },
      ]

      acqSheet.columns = acqColumns.map(col => ({ key: col.key, width: col.width }))

      const headerRow = acqSheet.getRow(4)
      acqColumns.forEach((col, idx) => {
        const cell = headerRow.getCell(idx + 1)
        cell.value = col.header
        cell.font = { bold: true, color: { argb: 'FFFFFFFF' } }
        cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF1565C0' } }
        cell.alignment = { horizontal: 'center' }
        cell.border = { top: { style: 'thin' }, left: { style: 'thin' }, bottom: { style: 'thin' }, right: { style: 'thin' } }
      })

      // 데이터
      acquisitions.forEach((emp, idx) => {
        const row = acqSheet.getRow(5 + idx)
        const monthlySalary = emp.baseSalaryMonthly || (emp.hourlyWage ? emp.hourlyWage * 209 : 0)

        // 주민번호 마스킹
        const maskedRN = emp.residentNumber
          ? emp.residentNumber.substring(0, 6) + '-*******'
          : '-'

        row.values = [
          idx + 1,
          emp.nameKor,
          maskedRN,
          emp.hireDate ? emp.hireDate.toLocaleDateString('ko-KR') : '-',
          emp.department || '-',
          emp.position || '-',
          employmentTypeMap[emp.employmentType] || emp.employmentType,
          monthlySalary,
          '취득', // 국민연금
          '취득', // 건강보험
          '취득', // 고용보험
          emp.payrollType === 'HOURLY' ? '시급제' : ''
        ]

        row.getCell(8).numFmt = '#,##0'
        row.eachCell(cell => {
          cell.border = { top: { style: 'thin' }, left: { style: 'thin' }, bottom: { style: 'thin' }, right: { style: 'thin' } }
        })
      })
    }

    // ========== 시트 2: 상실신고서 ==========
    if (type !== 'acquisition' && losses.length > 0) {
      const lossSheet = workbook.addWorksheet('4대보험 상실신고', {
        pageSetup: { paperSize: 9, orientation: 'landscape' }
      })

      // 제목
      lossSheet.mergeCells('A1:L1')
      lossSheet.getCell('A1').value = `4대보험 자격상실 신고서 (${year}년 ${month ? month + '월' : '연간'})`
      lossSheet.getCell('A1').font = { bold: true, size: 14 }
      lossSheet.getCell('A1').alignment = { horizontal: 'center' }

      // 사업장 정보
      lossSheet.mergeCells('A2:L2')
      lossSheet.getCell('A2').value = `사업장: ${workspace?.businessName || workspace?.name || '-'}`

      // 헤더
      const lossColumns = [
        { header: 'No', key: 'no', width: 5 },
        { header: '성명', key: 'name', width: 12 },
        { header: '주민등록번호', key: 'residentNumber', width: 16 },
        { header: '취득일자', key: 'acquisitionDate', width: 12 },
        { header: '상실일자', key: 'lossDate', width: 12 },
        { header: '상실사유', key: 'lossReason', width: 12 },
        { header: '부서', key: 'department', width: 12 },
        { header: '최종급여', key: 'lastSalary', width: 14 },
        { header: '국민연금', key: 'nationalPension', width: 10 },
        { header: '건강보험', key: 'healthInsurance', width: 10 },
        { header: '고용보험', key: 'employmentInsurance', width: 10 },
        { header: '비고', key: 'note', width: 15 },
      ]

      lossSheet.columns = lossColumns.map(col => ({ key: col.key, width: col.width }))

      const headerRow = lossSheet.getRow(4)
      lossColumns.forEach((col, idx) => {
        const cell = headerRow.getCell(idx + 1)
        cell.value = col.header
        cell.font = { bold: true, color: { argb: 'FFFFFFFF' } }
        cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFC62828' } }
        cell.alignment = { horizontal: 'center' }
        cell.border = { top: { style: 'thin' }, left: { style: 'thin' }, bottom: { style: 'thin' }, right: { style: 'thin' } }
      })

      // 데이터
      losses.forEach((emp, idx) => {
        const row = lossSheet.getRow(5 + idx)

        // 주민번호 마스킹
        const maskedRN = emp.residentNumber
          ? emp.residentNumber.substring(0, 6) + '-*******'
          : '-'

        row.values = [
          idx + 1,
          emp.nameKor,
          maskedRN,
          emp.hireDate ? emp.hireDate.toLocaleDateString('ko-KR') : '-',
          emp.resignDate ? emp.resignDate.toLocaleDateString('ko-KR') : '-',
          '자진퇴사', // 기본값
          emp.department || '-',
          emp.baseSalaryMonthly || 0,
          '상실',
          '상실',
          '상실',
          ''
        ]

        row.getCell(8).numFmt = '#,##0'
        row.eachCell(cell => {
          cell.border = { top: { style: 'thin' }, left: { style: 'thin' }, bottom: { style: 'thin' }, right: { style: 'thin' } }
        })
      })
    }

    // ========== 시트 3: 현재 가입자 명부 ==========
    const currentSheet = workbook.addWorksheet('현재 가입자 명부')

    const currentEmployees = await prisma.employee.findMany({
      where: {
        workspaceId,
        status: 'ACTIVE'
      },
      select: {
        id: true,
        nameKor: true,
        residentNumber: true,
        employeeNumber: true,
        department: true,
        position: true,
        hireDate: true,
        employmentType: true,
        baseSalaryMonthly: true,
      },
      orderBy: { hireDate: 'asc' }
    })

    currentSheet.mergeCells('A1:J1')
    currentSheet.getCell('A1').value = `4대보험 현재 가입자 명부 (${new Date().toLocaleDateString('ko-KR')} 기준)`
    currentSheet.getCell('A1').font = { bold: true, size: 14 }
    currentSheet.getCell('A1').alignment = { horizontal: 'center' }

    const currentColumns = [
      { header: 'No', key: 'no', width: 5 },
      { header: '사번', key: 'employeeNumber', width: 10 },
      { header: '성명', key: 'name', width: 12 },
      { header: '주민등록번호', key: 'residentNumber', width: 16 },
      { header: '부서', key: 'department', width: 12 },
      { header: '직책', key: 'position', width: 10 },
      { header: '취득일자', key: 'acquisitionDate', width: 12 },
      { header: '고용형태', key: 'employmentType', width: 10 },
      { header: '보수월액', key: 'monthlySalary', width: 14 },
      { header: '근속기간', key: 'tenure', width: 12 },
    ]

    currentSheet.columns = currentColumns.map(col => ({ key: col.key, width: col.width }))

    const currentHeaderRow = currentSheet.getRow(3)
    currentColumns.forEach((col, idx) => {
      const cell = currentHeaderRow.getCell(idx + 1)
      cell.value = col.header
      cell.font = { bold: true, color: { argb: 'FFFFFFFF' } }
      cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF388E3C' } }
      cell.alignment = { horizontal: 'center' }
    })

    currentEmployees.forEach((emp, idx) => {
      const row = currentSheet.getRow(4 + idx)

      // 주민번호 마스킹
      const maskedRN = emp.residentNumber
        ? emp.residentNumber.substring(0, 6) + '-*******'
        : '-'

      // 근속기간 계산
      let tenure = '-'
      if (emp.hireDate) {
        const days = Math.floor((new Date().getTime() - emp.hireDate.getTime()) / (1000 * 60 * 60 * 24))
        const years = Math.floor(days / 365)
        const months = Math.floor((days % 365) / 30)
        tenure = years > 0 ? `${years}년 ${months}개월` : `${months}개월`
      }

      row.values = [
        idx + 1,
        emp.employeeNumber || '-',
        emp.nameKor,
        maskedRN,
        emp.department || '-',
        emp.position || '-',
        emp.hireDate ? emp.hireDate.toLocaleDateString('ko-KR') : '-',
        employmentTypeMap[emp.employmentType] || emp.employmentType,
        emp.baseSalaryMonthly || 0,
        tenure
      ]

      row.getCell(9).numFmt = '#,##0'
    })

    // 버퍼로 변환
    const buffer = await workbook.xlsx.writeBuffer()

    const typeLabel = type === 'acquisition' ? '취득' : type === 'loss' ? '상실' : '취득상실'
    const filename = `4대보험_${typeLabel}신고서_${year}년${month ? month + '월' : ''}_${new Date().toISOString().split('T')[0]}.xlsx`

    secureLogger.info('Insurance report exported', {
      operation: 'hr.export.insurance',
      workspaceId,
      type,
      year,
      month,
      acquisitionCount: acquisitions.length,
      lossCount: losses.length
    })

    return new NextResponse(buffer, {
      headers: {
        'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'Content-Disposition': `attachment; filename*=UTF-8''${encodeURIComponent(filename)}`,
      },
    })
  } catch (error) {
    secureLogger.error('Insurance export failed', error as Error, { operation: 'hr.export.insurance' })
    return createErrorResponse('Export failed', 500, 'EXPORT_FAILED')
  }
}
