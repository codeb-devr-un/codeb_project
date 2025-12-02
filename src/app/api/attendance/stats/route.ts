// =============================================================================
// Attendance Stats API - CVE-CB-003 Fixed: Session-based Authentication
// =============================================================================

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { startOfMonth, endOfMonth, startOfWeek, endOfWeek, startOfYear, endOfYear, format, differenceInMinutes } from 'date-fns'
import { ko } from 'date-fns/locale'
import { authenticateRequest, secureLogger, createErrorResponse } from '@/lib/security'

// GET /api/attendance/stats - 근태 통계 조회
export async function GET(request: NextRequest) {
  try {
    // CVE-CB-003 Fix: Use session-based authentication instead of x-user-id header
    const user = await authenticateRequest()
    if (!user) {
      return createErrorResponse('Unauthorized', 401, 'AUTH_REQUIRED')
    }

    const { searchParams } = new URL(request.url)
    const workspaceId = searchParams.get('workspaceId')
    const period = searchParams.get('period') || 'month' // week, month, year

    const now = new Date()
    let startDate: Date
    let endDate: Date

    switch (period) {
      case 'week':
        startDate = startOfWeek(now, { locale: ko })
        endDate = endOfWeek(now, { locale: ko })
        break
      case 'year':
        startDate = startOfYear(now)
        endDate = endOfYear(now)
        break
      case 'month':
      default:
        startDate = startOfMonth(now)
        endDate = endOfMonth(now)
        break
    }

    // 기간 내 출근 기록 조회
    const attendances = await prisma.attendance.findMany({
      where: {
        userId: user.id,
        ...(workspaceId && { workspaceId }),
        date: {
          gte: startDate,
          lte: endDate
        }
      },
      orderBy: { date: 'asc' }
    })

    // 통계 계산
    const totalWorkDays = calculateWorkDays(startDate, endDate)
    const presentDays = attendances.filter(a => a.status === 'PRESENT' || a.status === 'REMOTE').length
    const lateDays = attendances.filter(a => a.status === 'LATE').length
    const absentDays = attendances.filter(a => a.status === 'ABSENT').length
    const halfDays = attendances.filter(a => a.status === 'HALF_DAY').length
    const remoteDays = attendances.filter(a => a.status === 'REMOTE').length
    const officeDays = presentDays - remoteDays

    // 총 근무 시간 계산
    let totalMinutes = 0
    attendances.forEach(a => {
      if (a.checkIn && a.checkOut) {
        totalMinutes += differenceInMinutes(new Date(a.checkOut), new Date(a.checkIn))
      }
    })

    const avgWorkMinutes = presentDays > 0 ? Math.round(totalMinutes / presentDays) : 0
    const avgWorkHours = (avgWorkMinutes / 60).toFixed(1)
    const totalWorkHours = Math.round(totalMinutes / 60)

    // 출근율 계산
    const attendanceRate = totalWorkDays > 0
      ? Math.round(((presentDays + remoteDays + halfDays * 0.5) / totalWorkDays) * 100)
      : 0

    // 주간 패턴 (요일별 평균 근무시간)
    const weeklyPattern = calculateWeeklyPattern(attendances)

    // 연간 통계 (별도 쿼리)
    const yearStart = startOfYear(now)
    const yearEnd = endOfYear(now)
    const yearlyAttendances = await prisma.attendance.findMany({
      where: {
        userId: user.id,
        ...(workspaceId && { workspaceId }),
        date: {
          gte: yearStart,
          lte: yearEnd
        }
      }
    })

    const yearlyPresentDays = yearlyAttendances.filter(a =>
      a.status === 'PRESENT' || a.status === 'REMOTE' || a.status === 'HALF_DAY'
    ).length
    const yearlyLateDays = yearlyAttendances.filter(a => a.status === 'LATE').length
    const yearlyTotalWorkDays = calculateWorkDays(yearStart, now)
    const yearlyAttendanceRate = yearlyTotalWorkDays > 0
      ? ((yearlyPresentDays / yearlyTotalWorkDays) * 100).toFixed(1)
      : '0'

    // 연간 평균 근무시간
    let yearlyTotalMinutes = 0
    yearlyAttendances.forEach(a => {
      if (a.checkIn && a.checkOut) {
        yearlyTotalMinutes += differenceInMinutes(new Date(a.checkOut), new Date(a.checkIn))
      }
    })
    const yearlyAvgWorkHours = yearlyPresentDays > 0
      ? (yearlyTotalMinutes / 60 / yearlyPresentDays).toFixed(1)
      : '0'

    return NextResponse.json({
      period: {
        type: period,
        start: format(startDate, 'yyyy-MM-dd'),
        end: format(endDate, 'yyyy-MM-dd')
      },
      monthly: {
        totalWorkDays,
        presentDays,
        lateDays,
        absentDays,
        halfDays,
        remoteDays,
        officeDays,
        attendanceRate,
        avgWorkHours: parseFloat(avgWorkHours),
        totalWorkHours
      },
      weekly: {
        pattern: weeklyPattern
      },
      yearly: {
        totalDays: yearlyPresentDays,
        attendanceRate: parseFloat(yearlyAttendanceRate as string),
        avgWorkHours: parseFloat(yearlyAvgWorkHours),
        lateDays: yearlyLateDays
      },
      workTypeDistribution: {
        office: officeDays,
        remote: remoteDays,
        present: presentDays - lateDays,
        late: lateDays
      }
    })

  } catch (error) {
    secureLogger.error('Failed to get attendance stats', error as Error, { operation: 'attendance.stats' })
    return createErrorResponse('Failed to get stats', 500, 'STATS_FAILED')
  }
}

// 근무일 계산 (주말 제외)
function calculateWorkDays(start: Date, end: Date): number {
  let count = 0
  const current = new Date(start)

  while (current <= end) {
    const dayOfWeek = current.getDay()
    if (dayOfWeek !== 0 && dayOfWeek !== 6) {
      count++
    }
    current.setDate(current.getDate() + 1)
  }

  return count
}

// 주간 패턴 계산
function calculateWeeklyPattern(attendances: any[]): { day: string; hours: number }[] {
  const dayMap: { [key: number]: { total: number; count: number } } = {
    1: { total: 0, count: 0 }, // 월
    2: { total: 0, count: 0 }, // 화
    3: { total: 0, count: 0 }, // 수
    4: { total: 0, count: 0 }, // 목
    5: { total: 0, count: 0 }  // 금
  }

  attendances.forEach(a => {
    if (a.checkIn && a.checkOut) {
      const dayOfWeek = new Date(a.date).getDay()
      if (dayOfWeek >= 1 && dayOfWeek <= 5) {
        const minutes = differenceInMinutes(new Date(a.checkOut), new Date(a.checkIn))
        dayMap[dayOfWeek].total += minutes
        dayMap[dayOfWeek].count++
      }
    }
  })

  const days = ['월', '화', '수', '목', '금']
  return days.map((day, idx) => {
    const data = dayMap[idx + 1]
    const avgHours = data.count > 0 ? data.total / 60 / data.count : 0
    return {
      day,
      hours: parseFloat(avgHours.toFixed(1))
    }
  })
}
