// =============================================================================
// Presence Check API - CVE-CB-003 Fixed: Session-based Authentication
// =============================================================================

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { authenticateRequest, secureLogger, createErrorResponse } from '@/lib/security'

export async function POST(request: NextRequest) {
  try {
    // CVE-CB-003 Fix: Use session-based authentication instead of x-user-id header
    const user = await authenticateRequest()
    if (!user) {
      return createErrorResponse('Unauthorized', 401, 'AUTH_REQUIRED')
    }

    const body = await request.json()
    const { status } = body

    const today = new Date()
    today.setHours(0, 0, 0, 0)

    const attendance = await prisma.attendance.findFirst({
      where: {
        userId: user.id,
        date: {
          gte: today,
        },
      },
    })

    if (!attendance) {
      return createErrorResponse('No attendance record found', 404, 'NO_ATTENDANCE_RECORD')
    }

    const log = await prisma.presenceCheckLog.create({
      data: {
        userId: user.id,
        attendanceId: attendance.id,
        status: status || 'confirmed',
        respondedAt: new Date(),
      },
    })

    // CVE-CB-005 Fix: Use secure logging
    secureLogger.info('Presence check recorded', {
      operation: 'attendance.presence-check',
      userId: user.id,
      attendanceId: attendance.id,
      status: status || 'confirmed',
    })

    return NextResponse.json(log)
  } catch (error) {
    secureLogger.error('Presence check failed', error as Error, { operation: 'attendance.presence-check' })
    return createErrorResponse('Presence check failed', 500, 'PRESENCE_CHECK_FAILED')
  }
}
