// =============================================================================
// 근태대장 엑셀 내보내기 API - 노무사 제출용
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
    const employeeId = searchParams.get('employeeId')

    // 날짜 범위
    const startDate = new Date(year, month - 1, 1)
    const endDate = new Date(year, month, 0)
    const daysInMonth = endDate.getDate()

    // 직원 목록 조회
    const employees = await prisma.employee.findMany({
      where: {
        workspaceId,
        status: { in: ['ACTIVE', 'ONBOARDING'] },
        ...(employeeId && { id: employeeId })
      },
      select: {
        id: true,
        nameKor: true,
        employeeNumber: true,
        department: true,
        position: true,
      },
      orderBy: [
        { department: 'asc' },
        { nameKor: 'asc' }
      ]
    })

    // 출퇴근 기록 조회
    const attendances = await prisma.attendance.findMany({
      where: {
        date: {
          gte: startDate,
          lte: endDate
        },
        userId: {
          in: (await prisma.employee.findMany({
            where: { workspaceId, id: { in: employees.map(e => e.id) } },
            select: { userId: true }
          })).filter(e => e.userId).map(e => e.userId!)
        }
      },
      include: {
        user: {
          select: {
            id: true,
            email: true
          }
        }
      }
    })

    // Employee와 User 매핑
    const employeeUserMap = await prisma.employee.findMany({
      where: { workspaceId, status: { in: ['ACTIVE', 'ONBOARDING'] } },
      select: { id: true, userId: true }
    })
    const userToEmployeeMap = new Map(employeeUserMap.filter(e => e.userId).map(e => [e.userId, e.id]))

    // 워크스페이스 정보
    const workspace = await prisma.workspace.findUnique({
      where: { id: workspaceId },
      select: { name: true, businessName: true }
    })

    // 엑셀 생성
    const workbook = new ExcelJS.Workbook()
    workbook.creator = 'WorkB CMS'

    const sheet = workbook.addWorksheet('근태대장', {
      pageSetup: { paperSize: 9, orientation: 'landscape', fitToPage: true }
    })

    // 제목
    sheet.mergeCells(1, 1, 1, daysInMonth + 7)
    sheet.getCell('A1').value = `근태대장 (${year}년 ${month}월)`
    sheet.getCell('A1').font = { bold: true, size: 16 }
    sheet.getCell('A1').alignment = { horizontal: 'center' }
    sheet.getRow(1).height = 30

    // 사업장 정보
    sheet.mergeCells(2, 1, 2, daysInMonth + 7)
    sheet.getCell('A2').value = `사업장: ${workspace?.businessName || workspace?.name || '-'} | 출력일: ${new Date().toLocaleDateString('ko-KR')}`
    sheet.getCell('A2').alignment = { horizontal: 'left' }

    // 헤더 행 (고정 컬럼 + 날짜 컬럼)
    const fixedHeaders = ['No', '사번', '성명', '부서', '직책']
    const dateHeaders: string[] = []
    for (let d = 1; d <= daysInMonth; d++) {
      const date = new Date(year, month - 1, d)
      const dayOfWeek = ['일', '월', '화', '수', '목', '금', '토'][date.getDay()]
      dateHeaders.push(`${d}\n(${dayOfWeek})`)
    }
    const summaryHeaders = ['출근', '지각', '결근', '반차', '재택', '연장(h)', '야간(h)']

    const allHeaders = [...fixedHeaders, ...dateHeaders, ...summaryHeaders]

    const headerRow = sheet.getRow(4)
    allHeaders.forEach((header, idx) => {
      const cell = headerRow.getCell(idx + 1)
      cell.value = header
      cell.font = { bold: true, size: 9, color: { argb: 'FFFFFFFF' } }
      cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF1976D2' } }
      cell.alignment = { horizontal: 'center', vertical: 'middle', wrapText: true }
      cell.border = {
        top: { style: 'thin' },
        left: { style: 'thin' },
        bottom: { style: 'thin' },
        right: { style: 'thin' }
      }
    })
    headerRow.height = 35

    // 컬럼 너비 설정
    sheet.getColumn(1).width = 4  // No
    sheet.getColumn(2).width = 10 // 사번
    sheet.getColumn(3).width = 10 // 성명
    sheet.getColumn(4).width = 12 // 부서
    sheet.getColumn(5).width = 10 // 직책
    for (let i = 6; i <= 5 + daysInMonth; i++) {
      sheet.getColumn(i).width = 5 // 날짜
    }
    for (let i = 6 + daysInMonth; i <= 5 + daysInMonth + 7; i++) {
      sheet.getColumn(i).width = 7 // 합계
    }

    // 상태 심볼
    const statusSymbol: Record<string, string> = {
      PRESENT: 'O',
      LATE: '△',
      ABSENT: 'X',
      HALF_DAY: '½',
      REMOTE: 'R',
    }

    // 데이터 행
    let rowNum = 5
    employees.forEach((emp, idx) => {
      const row = sheet.getRow(rowNum)

      // 해당 직원의 출퇴근 기록
      const empUserId = employeeUserMap.find(e => e.id === emp.id)?.userId
      const empAttendances = empUserId
        ? attendances.filter(a => a.userId === empUserId)
        : []

      // 일별 데이터 맵
      const dateMap = new Map<number, any>()
      empAttendances.forEach(a => {
        const day = a.date.getDate()
        dateMap.set(day, a)
      })

      // 통계
      let presentCount = 0
      let lateCount = 0
      let absentCount = 0
      let halfDayCount = 0
      let remoteCount = 0
      let totalOvertimeHours = 0
      let totalNightHours = 0

      // 고정 컬럼
      row.getCell(1).value = idx + 1
      row.getCell(2).value = emp.employeeNumber || '-'
      row.getCell(3).value = emp.nameKor
      row.getCell(4).value = emp.department || '-'
      row.getCell(5).value = emp.position || '-'

      // 날짜별 출퇴근
      for (let d = 1; d <= daysInMonth; d++) {
        const cellIdx = 5 + d
        const cell = row.getCell(cellIdx)
        const date = new Date(year, month - 1, d)
        const dayOfWeek = date.getDay()
        const attendance = dateMap.get(d)

        if (attendance) {
          cell.value = statusSymbol[attendance.status] || '-'

          switch (attendance.status) {
            case 'PRESENT': presentCount++; break
            case 'LATE': lateCount++; presentCount++; break
            case 'ABSENT': absentCount++; break
            case 'HALF_DAY': halfDayCount++; break
            case 'REMOTE': remoteCount++; presentCount++; break
          }

          // 근무시간 계산 (checkOut이 있는 경우)
          if (attendance.checkIn && attendance.checkOut) {
            const workHours = (attendance.checkOut.getTime() - attendance.checkIn.getTime()) / (1000 * 60 * 60)
            if (workHours > 8) {
              totalOvertimeHours += workHours - 8
            }
            // 야간근무 (22:00~06:00)
            const checkOutHour = attendance.checkOut.getHours()
            if (checkOutHour >= 22 || checkOutHour < 6) {
              totalNightHours += Math.min(workHours - 8, 2)
            }
          }
        } else if (dayOfWeek === 0 || dayOfWeek === 6) {
          // 주말
          cell.value = '-'
          cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFF5F5F5' } }
        } else {
          cell.value = ''
        }

        cell.alignment = { horizontal: 'center', vertical: 'middle' }
        cell.border = {
          top: { style: 'thin' },
          left: { style: 'thin' },
          bottom: { style: 'thin' },
          right: { style: 'thin' }
        }

        // 상태별 색상
        if (attendance?.status === 'LATE') {
          cell.font = { color: { argb: 'FFFF9800' } }
        } else if (attendance?.status === 'ABSENT') {
          cell.font = { color: { argb: 'FFF44336' }, bold: true }
        } else if (attendance?.status === 'REMOTE') {
          cell.font = { color: { argb: 'FF2196F3' } }
        }
      }

      // 합계 컬럼
      const summaryStart = 6 + daysInMonth
      row.getCell(summaryStart).value = presentCount
      row.getCell(summaryStart + 1).value = lateCount
      row.getCell(summaryStart + 2).value = absentCount
      row.getCell(summaryStart + 3).value = halfDayCount
      row.getCell(summaryStart + 4).value = remoteCount
      row.getCell(summaryStart + 5).value = Math.round(totalOvertimeHours * 10) / 10
      row.getCell(summaryStart + 6).value = Math.round(totalNightHours * 10) / 10

      // 스타일 적용
      for (let i = summaryStart; i <= summaryStart + 6; i++) {
        const cell = row.getCell(i)
        cell.alignment = { horizontal: 'center' }
        cell.border = {
          top: { style: 'thin' },
          left: { style: 'thin' },
          bottom: { style: 'thin' },
          right: { style: 'thin' }
        }
      }

      // 고정 컬럼 스타일
      for (let i = 1; i <= 5; i++) {
        row.getCell(i).border = {
          top: { style: 'thin' },
          left: { style: 'thin' },
          bottom: { style: 'thin' },
          right: { style: 'thin' }
        }
        row.getCell(i).alignment = { horizontal: 'center', vertical: 'middle' }
      }

      rowNum++
    })

    // 범례
    const legendRow = rowNum + 2
    sheet.getCell(`A${legendRow}`).value = '범례: O=출근, △=지각, X=결근, ½=반차, R=재택'
    sheet.getCell(`A${legendRow}`).font = { size: 9, italic: true }

    // 버퍼로 변환
    const buffer = await workbook.xlsx.writeBuffer()

    const filename = `근태대장_${year}년${month}월_${new Date().toISOString().split('T')[0]}.xlsx`

    secureLogger.info('Attendance report exported', {
      operation: 'hr.export.attendance',
      workspaceId,
      year,
      month,
      employeeCount: employees.length
    })

    return new NextResponse(buffer, {
      headers: {
        'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'Content-Disposition': `attachment; filename*=UTF-8''${encodeURIComponent(filename)}`,
      },
    })
  } catch (error) {
    secureLogger.error('Attendance export failed', error as Error, { operation: 'hr.export.attendance' })
    return createErrorResponse('Export failed', 500, 'EXPORT_FAILED')
  }
}
