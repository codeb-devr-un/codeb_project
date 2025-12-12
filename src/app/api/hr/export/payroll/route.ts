// =============================================================================
// 급여대장 엑셀 내보내기 API - 세무사/노무사 제출용
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
    const year = parseInt(searchParams.get('year') || new Date().getFullYear().toString())
    const month = searchParams.get('month') ? parseInt(searchParams.get('month')!) : null

    // 급여 데이터 조회
    const startDate = month
      ? new Date(year, month - 1, 1)
      : new Date(year, 0, 1)
    const endDate = month
      ? new Date(year, month, 0)
      : new Date(year, 11, 31)

    const payrollRecords = await prisma.payrollRecord.findMany({
      where: {
        workspaceId,
        periodStart: { gte: startDate },
        periodEnd: { lte: endDate }
      },
      include: {
        employee: {
          select: {
            id: true,
            nameKor: true,
            employeeNumber: true,
            department: true,
            position: true,
            residentNumber: true,
            hireDate: true,
            employmentType: true,
          }
        }
      },
      orderBy: [
        { periodStart: 'asc' },
        { employee: { nameKor: 'asc' } }
      ]
    })

    // 워크스페이스 정보 조회
    const workspace = await prisma.workspace.findUnique({
      where: { id: workspaceId },
      select: { name: true, businessName: true, ownerName: true }
    })

    // 엑셀 생성
    const workbook = new ExcelJS.Workbook()
    workbook.creator = 'WorkB CMS'
    workbook.created = new Date()

    const sheet = workbook.addWorksheet('급여대장', {
      pageSetup: {
        paperSize: 9, // A4
        orientation: 'landscape',
        fitToPage: true,
      }
    })

    // 헤더 스타일
    const headerStyle: Partial<ExcelJS.Style> = {
      font: { bold: true, size: 10, color: { argb: 'FFFFFFFF' } },
      fill: { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF2E7D32' } },
      alignment: { horizontal: 'center', vertical: 'middle', wrapText: true },
      border: {
        top: { style: 'thin' },
        left: { style: 'thin' },
        bottom: { style: 'thin' },
        right: { style: 'thin' }
      }
    }

    const numberStyle: Partial<ExcelJS.Style> = {
      numFmt: '#,##0',
      alignment: { horizontal: 'right', vertical: 'middle' },
      border: {
        top: { style: 'thin' },
        left: { style: 'thin' },
        bottom: { style: 'thin' },
        right: { style: 'thin' }
      }
    }

    // 제목 행
    sheet.mergeCells('A1:V1')
    const titleCell = sheet.getCell('A1')
    titleCell.value = `급여대장 (${year}년 ${month ? month + '월' : '연간'})`
    titleCell.font = { bold: true, size: 16 }
    titleCell.alignment = { horizontal: 'center', vertical: 'middle' }
    sheet.getRow(1).height = 30

    // 사업장 정보
    sheet.mergeCells('A2:V2')
    const infoCell = sheet.getCell('A2')
    infoCell.value = `사업장: ${workspace?.businessName || workspace?.name || '-'} | 대표자: ${workspace?.ownerName || '-'} | 출력일: ${new Date().toLocaleDateString('ko-KR')}`
    infoCell.font = { size: 10 }
    infoCell.alignment = { horizontal: 'left', vertical: 'middle' }
    sheet.getRow(2).height = 20

    // 컬럼 헤더 정의
    const columns = [
      { header: 'No', key: 'no', width: 5 },
      { header: '사번', key: 'employeeNumber', width: 10 },
      { header: '성명', key: 'name', width: 10 },
      { header: '부서', key: 'department', width: 12 },
      { header: '직책', key: 'position', width: 10 },
      { header: '입사일', key: 'hireDate', width: 12 },
      { header: '고용형태', key: 'employmentType', width: 10 },
      { header: '귀속년월', key: 'period', width: 10 },
      { header: '기본급', key: 'basePay', width: 12 },
      { header: '연장수당', key: 'overtimePay', width: 12 },
      { header: '야간수당', key: 'nightPay', width: 12 },
      { header: '휴일수당', key: 'holidayPay', width: 12 },
      { header: '상여금', key: 'bonusPay', width: 12 },
      { header: '기타수당', key: 'otherAllowance', width: 12 },
      { header: '지급총액', key: 'grossPay', width: 14 },
      { header: '국민연금', key: 'nationalPension', width: 11 },
      { header: '건강보험', key: 'healthInsurance', width: 11 },
      { header: '장기요양', key: 'longTermCare', width: 11 },
      { header: '고용보험', key: 'employmentInsurance', width: 11 },
      { header: '소득세', key: 'incomeTax', width: 11 },
      { header: '지방소득세', key: 'localTax', width: 11 },
      { header: '실수령액', key: 'netPay', width: 14 },
    ]

    // 컬럼 설정
    sheet.columns = columns.map(col => ({ key: col.key, width: col.width }))

    // 헤더 행
    const headerRow = sheet.getRow(4)
    columns.forEach((col, idx) => {
      const cell = headerRow.getCell(idx + 1)
      cell.value = col.header
      cell.style = headerStyle
    })
    headerRow.height = 25

    // 고용형태 매핑
    const employmentTypeMap: Record<string, string> = {
      FULL_TIME: '정규직',
      PART_TIME: '파트타임',
      CONTRACT: '계약직',
      INTERN: '인턴',
      FREELANCER: '프리랜서'
    }

    // 데이터 행
    let rowNumber = 5
    let totalGross = 0
    let totalNet = 0

    payrollRecords.forEach((record, idx) => {
      const row = sheet.getRow(rowNumber)

      row.getCell(1).value = idx + 1
      row.getCell(2).value = record.employee.employeeNumber || '-'
      row.getCell(3).value = record.employee.nameKor
      row.getCell(4).value = record.employee.department || '-'
      row.getCell(5).value = record.employee.position || '-'
      row.getCell(6).value = record.employee.hireDate
        ? record.employee.hireDate.toLocaleDateString('ko-KR')
        : '-'
      row.getCell(7).value = employmentTypeMap[record.employee.employmentType] || record.employee.employmentType
      row.getCell(8).value = `${record.periodStart.getFullYear()}-${String(record.periodStart.getMonth() + 1).padStart(2, '0')}`
      row.getCell(9).value = record.basePay
      row.getCell(10).value = record.overtimePay
      row.getCell(11).value = record.nightPay
      row.getCell(12).value = record.holidayPay
      row.getCell(13).value = record.bonusPay
      row.getCell(14).value = record.otherAllowance
      row.getCell(15).value = record.grossPay
      row.getCell(16).value = record.nationalPension
      row.getCell(17).value = record.healthInsurance
      row.getCell(18).value = record.longTermCare
      row.getCell(19).value = record.employmentInsurance
      row.getCell(20).value = record.incomeTax
      row.getCell(21).value = record.localTax
      row.getCell(22).value = record.netPay

      // 숫자 서식 적용
      for (let i = 9; i <= 22; i++) {
        row.getCell(i).style = numberStyle
      }

      // 테두리 적용
      for (let i = 1; i <= 22; i++) {
        row.getCell(i).border = {
          top: { style: 'thin' },
          left: { style: 'thin' },
          bottom: { style: 'thin' },
          right: { style: 'thin' }
        }
      }

      totalGross += record.grossPay
      totalNet += record.netPay
      rowNumber++
    })

    // 합계 행
    const totalRow = sheet.getRow(rowNumber)
    totalRow.getCell(1).value = '합계'
    sheet.mergeCells(`A${rowNumber}:H${rowNumber}`)
    totalRow.getCell(1).font = { bold: true }
    totalRow.getCell(1).alignment = { horizontal: 'center' }

    totalRow.getCell(15).value = totalGross
    totalRow.getCell(22).value = totalNet

    for (let i = 9; i <= 22; i++) {
      totalRow.getCell(i).style = {
        ...numberStyle,
        font: { bold: true },
        fill: { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFF5F5F5' } }
      }
    }

    // 버퍼로 변환
    const buffer = await workbook.xlsx.writeBuffer()

    const filename = `급여대장_${year}년${month ? month + '월' : ''}_${new Date().toISOString().split('T')[0]}.xlsx`

    secureLogger.info('Payroll export generated', {
      operation: 'hr.export.payroll',
      workspaceId,
      year,
      month,
      recordCount: payrollRecords.length
    })

    return new NextResponse(buffer, {
      headers: {
        'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'Content-Disposition': `attachment; filename*=UTF-8''${encodeURIComponent(filename)}`,
      },
    })
  } catch (error) {
    secureLogger.error('Payroll export failed', error as Error, { operation: 'hr.export.payroll' })
    return createErrorResponse('Export failed', 500, 'EXPORT_FAILED')
  }
}
