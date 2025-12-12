// =============================================================================
// 원천징수이행상황신고서 데이터 API - 홈택스 제출용
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
    const month = parseInt(searchParams.get('month') || (new Date().getMonth() + 1).toString())

    // 해당 월 급여 데이터 조회
    const startDate = new Date(year, month - 1, 1)
    const endDate = new Date(year, month, 0)

    const payrollRecords = await prisma.payrollRecord.findMany({
      where: {
        workspaceId,
        periodStart: { gte: startDate },
        periodEnd: { lte: endDate },
        status: { in: ['CONFIRMED', 'PAID'] }
      },
      include: {
        employee: {
          select: {
            id: true,
            nameKor: true,
            residentNumber: true,
            employmentType: true,
          }
        }
      }
    })

    // 워크스페이스 정보
    const workspace = await prisma.workspace.findUnique({
      where: { id: workspaceId },
      select: { name: true, businessName: true, ownerName: true }
    })

    // 원천징수 집계
    const summary = {
      귀속년월: `${year}-${String(month).padStart(2, '0')}`,
      사업장명: workspace?.businessName || workspace?.name || '',
      대표자명: workspace?.ownerName || '',
      // 인원 현황
      근로소득_인원: payrollRecords.length,
      근로소득_총지급액: 0,
      근로소득_소득세: 0,
      근로소득_지방소득세: 0,
      // 4대보험 (사업주 부담분 포함)
      국민연금_근로자: 0,
      국민연금_사업주: 0,
      건강보험_근로자: 0,
      건강보험_사업주: 0,
      장기요양_근로자: 0,
      장기요양_사업주: 0,
      고용보험_근로자: 0,
      고용보험_사업주: 0,
    }

    // 사업주 부담 비율
    const EMPLOYER_RATES = {
      nationalPension: 1.0, // 국민연금 사업주 = 근로자와 동일
      healthInsurance: 1.0,
      longTermCare: 1.0,
      employmentInsurance: 1.0, // 기본 (150인 미만)
    }

    payrollRecords.forEach(record => {
      summary.근로소득_총지급액 += record.grossPay
      summary.근로소득_소득세 += record.incomeTax
      summary.근로소득_지방소득세 += record.localTax
      summary.국민연금_근로자 += record.nationalPension
      summary.국민연금_사업주 += Math.floor(record.nationalPension * EMPLOYER_RATES.nationalPension)
      summary.건강보험_근로자 += record.healthInsurance
      summary.건강보험_사업주 += Math.floor(record.healthInsurance * EMPLOYER_RATES.healthInsurance)
      summary.장기요양_근로자 += record.longTermCare
      summary.장기요양_사업주 += Math.floor(record.longTermCare * EMPLOYER_RATES.longTermCare)
      summary.고용보험_근로자 += record.employmentInsurance
      summary.고용보험_사업주 += Math.floor(record.employmentInsurance * EMPLOYER_RATES.employmentInsurance)
    })

    // 엑셀 생성
    const workbook = new ExcelJS.Workbook()
    workbook.creator = 'WorkB CMS'

    // ========== 시트 1: 원천징수이행상황신고서 요약 ==========
    const summarySheet = workbook.addWorksheet('원천징수신고서', {
      pageSetup: { paperSize: 9, orientation: 'portrait' }
    })

    // 제목
    summarySheet.mergeCells('A1:F1')
    summarySheet.getCell('A1').value = '원천징수이행상황신고서 (근로소득)'
    summarySheet.getCell('A1').font = { bold: true, size: 16 }
    summarySheet.getCell('A1').alignment = { horizontal: 'center' }
    summarySheet.getRow(1).height = 30

    // 귀속년월
    summarySheet.mergeCells('A2:F2')
    summarySheet.getCell('A2').value = `귀속년월: ${summary.귀속년월} | 신고일: ${new Date().toLocaleDateString('ko-KR')}`
    summarySheet.getCell('A2').alignment = { horizontal: 'center' }

    // 사업장 정보
    const infoData = [
      ['', '', '', '', '', ''],
      ['사업장명', summary.사업장명, '', '대표자명', summary.대표자명, ''],
    ]
    infoData.forEach((row, idx) => {
      summarySheet.getRow(4 + idx).values = row
    })

    // 원천징수 현황
    summarySheet.getRow(7).values = ['구분', '인원(명)', '총지급액', '소득세', '지방소득세', '합계']
    summarySheet.getRow(7).font = { bold: true }
    summarySheet.getRow(7).eachCell(cell => {
      cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF4CAF50' } }
      cell.font = { bold: true, color: { argb: 'FFFFFFFF' } }
      cell.alignment = { horizontal: 'center' }
      cell.border = { top: { style: 'thin' }, left: { style: 'thin' }, bottom: { style: 'thin' }, right: { style: 'thin' } }
    })

    summarySheet.getRow(8).values = [
      '근로소득',
      summary.근로소득_인원,
      summary.근로소득_총지급액,
      summary.근로소득_소득세,
      summary.근로소득_지방소득세,
      summary.근로소득_소득세 + summary.근로소득_지방소득세
    ]
    summarySheet.getRow(8).eachCell((cell, colNumber) => {
      if (colNumber >= 3) cell.numFmt = '#,##0'
      cell.border = { top: { style: 'thin' }, left: { style: 'thin' }, bottom: { style: 'thin' }, right: { style: 'thin' } }
    })

    // 4대보험 현황
    summarySheet.getRow(11).values = ['4대보험 현황', '', '', '', '', '']
    summarySheet.getRow(11).font = { bold: true }
    summarySheet.mergeCells('A11:F11')

    summarySheet.getRow(12).values = ['구분', '근로자 부담', '사업주 부담', '합계', '', '']
    summarySheet.getRow(12).font = { bold: true }
    summarySheet.getRow(12).eachCell(cell => {
      cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF2196F3' } }
      cell.font = { bold: true, color: { argb: 'FFFFFFFF' } }
      cell.alignment = { horizontal: 'center' }
    })

    const insuranceRows = [
      ['국민연금', summary.국민연금_근로자, summary.국민연금_사업주, summary.국민연금_근로자 + summary.국민연금_사업주],
      ['건강보험', summary.건강보험_근로자, summary.건강보험_사업주, summary.건강보험_근로자 + summary.건강보험_사업주],
      ['장기요양보험', summary.장기요양_근로자, summary.장기요양_사업주, summary.장기요양_근로자 + summary.장기요양_사업주],
      ['고용보험', summary.고용보험_근로자, summary.고용보험_사업주, summary.고용보험_근로자 + summary.고용보험_사업주],
    ]

    insuranceRows.forEach((row, idx) => {
      summarySheet.getRow(13 + idx).values = [...row, '', '']
      summarySheet.getRow(13 + idx).eachCell((cell, colNumber) => {
        if (colNumber >= 2 && colNumber <= 4) cell.numFmt = '#,##0'
        cell.border = { top: { style: 'thin' }, left: { style: 'thin' }, bottom: { style: 'thin' }, right: { style: 'thin' } }
      })
    })

    // 합계
    const totalInsuranceEmployee = summary.국민연금_근로자 + summary.건강보험_근로자 + summary.장기요양_근로자 + summary.고용보험_근로자
    const totalInsuranceEmployer = summary.국민연금_사업주 + summary.건강보험_사업주 + summary.장기요양_사업주 + summary.고용보험_사업주

    summarySheet.getRow(17).values = ['합계', totalInsuranceEmployee, totalInsuranceEmployer, totalInsuranceEmployee + totalInsuranceEmployer, '', '']
    summarySheet.getRow(17).font = { bold: true }
    summarySheet.getRow(17).eachCell((cell, colNumber) => {
      if (colNumber >= 2 && colNumber <= 4) cell.numFmt = '#,##0'
      cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFF5F5F5' } }
      cell.border = { top: { style: 'thin' }, left: { style: 'thin' }, bottom: { style: 'thin' }, right: { style: 'thin' } }
    })

    // 컬럼 너비
    summarySheet.columns = [
      { width: 15 },
      { width: 18 },
      { width: 18 },
      { width: 18 },
      { width: 12 },
      { width: 12 },
    ]

    // ========== 시트 2: 상세 내역 ==========
    const detailSheet = workbook.addWorksheet('상세내역')

    detailSheet.columns = [
      { header: 'No', key: 'no', width: 5 },
      { header: '성명', key: 'name', width: 12 },
      { header: '주민번호', key: 'residentNumber', width: 16 },
      { header: '총지급액', key: 'grossPay', width: 14 },
      { header: '소득세', key: 'incomeTax', width: 12 },
      { header: '지방소득세', key: 'localTax', width: 12 },
      { header: '국민연금', key: 'nationalPension', width: 12 },
      { header: '건강보험', key: 'healthInsurance', width: 12 },
      { header: '장기요양', key: 'longTermCare', width: 12 },
      { header: '고용보험', key: 'employmentInsurance', width: 12 },
      { header: '실수령액', key: 'netPay', width: 14 },
    ]

    // 헤더 스타일
    detailSheet.getRow(1).font = { bold: true }
    detailSheet.getRow(1).eachCell(cell => {
      cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF2E7D32' } }
      cell.font = { bold: true, color: { argb: 'FFFFFFFF' } }
      cell.alignment = { horizontal: 'center' }
    })

    // 데이터 행
    payrollRecords.forEach((record, idx) => {
      // 주민번호 마스킹 (앞 6자리만 표시)
      const maskedRN = record.employee.residentNumber
        ? record.employee.residentNumber.substring(0, 6) + '-*******'
        : '-'

      detailSheet.addRow({
        no: idx + 1,
        name: record.employee.nameKor,
        residentNumber: maskedRN,
        grossPay: record.grossPay,
        incomeTax: record.incomeTax,
        localTax: record.localTax,
        nationalPension: record.nationalPension,
        healthInsurance: record.healthInsurance,
        longTermCare: record.longTermCare,
        employmentInsurance: record.employmentInsurance,
        netPay: record.netPay,
      })
    })

    // 숫자 서식
    detailSheet.eachRow((row, rowNumber) => {
      if (rowNumber > 1) {
        for (let i = 4; i <= 11; i++) {
          row.getCell(i).numFmt = '#,##0'
        }
      }
    })

    // 버퍼로 변환
    const buffer = await workbook.xlsx.writeBuffer()

    const filename = `원천징수이행상황신고서_${year}년${month}월_${new Date().toISOString().split('T')[0]}.xlsx`

    secureLogger.info('Withholding tax report exported', {
      operation: 'hr.export.withholding',
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
    secureLogger.error('Withholding export failed', error as Error, { operation: 'hr.export.withholding' })
    return createErrorResponse('Export failed', 500, 'EXPORT_FAILED')
  }
}
