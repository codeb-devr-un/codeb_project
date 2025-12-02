// =============================================================================
// Mobile Attendance API - CVE-CB-003 Fixed: Session-based Authentication
// =============================================================================

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getOrSet } from '@/lib/redis'
import { authenticateRequest, secureLogger, createErrorResponse } from '@/lib/security'

export async function GET(request: NextRequest) {
  try {
    // CVE-CB-003 Fix: Use session-based authentication instead of x-user-id header
    const user = await authenticateRequest()
    if (!user) {
      return createErrorResponse('Unauthorized', 401, 'AUTH_REQUIRED')
    }

    const cacheKey = `attendance:mobile:${user.id}`

    // Cache for 1 hour
    const data = await getOrSet(cacheKey, async () => {
      const today = new Date()
      today.setHours(0, 0, 0, 0)

      const todayAttendance = await prisma.attendance.findFirst({
        where: {
          userId: user.id,
          date: {
            gte: today,
          },
        },
        select: {
          status: true,
          checkIn: true,
          checkOut: true
        }
      })

      return {
        status: todayAttendance?.status || 'ABSENT',
        checkIn: todayAttendance?.checkIn || null,
        checkOut: todayAttendance?.checkOut || null
      }
    }, 3600)

    return NextResponse.json(data)
  } catch (error) {
    secureLogger.error('Failed to fetch mobile attendance', error as Error, { operation: 'mobile.attendance.get' })
    return createErrorResponse('Failed to fetch attendance', 500, 'FETCH_FAILED')
  }
}
