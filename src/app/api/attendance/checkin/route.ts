// =============================================================================
// Attendance Check-in API - CVE-CB-003 Fixed: Session-based Authentication
// =============================================================================

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { redis } from '@/lib/redis'
import { authenticateRequest, secureLogger, createErrorResponse } from '@/lib/security'
import { validateBody, attendanceCheckInSchema, validationErrorResponse } from '@/lib/validation'

export async function POST(request: NextRequest) {
  try {
    // CVE-CB-003 Fix: Use session-based authentication instead of x-user-id header
    const user = await authenticateRequest()
    if (!user) {
      return createErrorResponse('Unauthorized', 401, 'AUTH_REQUIRED')
    }

    // CVE-CB-007 Fix: Validate request body
    const validation = await validateBody(request, attendanceCheckInSchema)
    if (!validation.success) {
      return validationErrorResponse(validation.errors!)
    }

    const { workLocation, note } = validation.data!

    const now = new Date()
    const today = new Date()
    today.setHours(0, 0, 0, 0)

    // Check if already checked in today
    const existing = await prisma.attendance.findFirst({
      where: {
        userId: user.id,
        date: {
          gte: today,
        },
      },
    })

    if (existing) {
      return createErrorResponse('Already checked in today', 400, 'ALREADY_CHECKED_IN')
    }

    // Fetch Work Policy
    const workspaceId = null

    const policy = await prisma.workPolicy.findFirst({
      where: { workspaceId }
    })

    // Determine status based on policy
    let status = 'PRESENT'
    const hour = now.getHours()
    const minute = now.getMinutes()
    const currentTime = hour * 60 + minute

    if (policy) {
      if (policy.type === 'FIXED') {
        const [startHour, startMinute] = (policy.workStartTime || "09:00").split(':').map(Number)
        const startTime = startHour * 60 + startMinute

        if (currentTime > startTime) {
          status = 'LATE'
        }
      } else if (policy.type === 'CORE_TIME') {
        const [coreStartHour, coreStartMinute] = (policy.coreTimeStart || "11:00").split(':').map(Number)
        const coreStartTime = coreStartHour * 60 + coreStartMinute

        if (currentTime > coreStartTime) {
          status = 'LATE'
        }
      }
    } else {
      // Default 9 AM
      if (hour >= 9 && minute > 0) {
        status = 'LATE'
      } else if (hour > 9) {
        status = 'LATE'
      }
    }

    if (workLocation === 'REMOTE') {
      status = 'REMOTE'
    }

    const attendance = await prisma.attendance.create({
      data: {
        userId: user.id,
        date: today,
        checkIn: now,
        status: status as any,
        note: note || `${workLocation} check-in`,
      },
    })

    // Invalidate attendance cache
    await redis.del(`attendance:api:${user.id}`)
    await redis.del(`attendance:mobile:${user.id}`)

    // CVE-CB-005 Fix: Use secure logging
    secureLogger.info('Attendance check-in successful', {
      operation: 'attendance.checkin',
      userId: user.id,
      status,
      workLocation,
    })

    return NextResponse.json(attendance)
  } catch (error) {
    secureLogger.error('Check-in failed', error as Error, { operation: 'attendance.checkin' })
    return createErrorResponse('Check-in failed', 500, 'CHECKIN_FAILED')
  }
}
