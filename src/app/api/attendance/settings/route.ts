// =============================================================================
// Attendance Settings API - CVE-CB-003 Fixed: Session-based Authentication
// =============================================================================

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { authenticateRequest, requireWorkspaceRole, secureLogger, createErrorResponse } from '@/lib/security'

export async function GET(request: NextRequest) {
  try {
    // CVE-CB-003 Fix: Use session-based authentication instead of x-user-id header
    const user = await authenticateRequest()
    if (!user) {
      return createErrorResponse('Unauthorized', 401, 'AUTH_REQUIRED')
    }

    const workspaceId = null

    // Find policy
    const policy = await prisma.workPolicy.findFirst({
      where: {
        workspaceId: workspaceId
      }
    })

    // If no policy exists, return defaults
    if (!policy) {
      return NextResponse.json({
        type: 'FIXED',
        dailyRequiredMinutes: 480,
        workStartTime: '09:00',
        workEndTime: '18:00',
        coreTimeStart: '11:00',
        coreTimeEnd: '16:00',
        presenceCheckEnabled: true,
        presenceIntervalMinutes: 90,
        officeIpWhitelist: [],
      })
    }

    return NextResponse.json(policy)
  } catch (error) {
    secureLogger.error('Failed to fetch settings', error as Error, { operation: 'attendance.settings.get' })
    return createErrorResponse('Failed to fetch settings', 500, 'FETCH_SETTINGS_FAILED')
  }
}

export async function POST(request: NextRequest) {
  try {
    // CVE-CB-003 Fix: Use session-based authentication instead of x-user-id header
    const user = await authenticateRequest()
    if (!user) {
      return createErrorResponse('Unauthorized', 401, 'AUTH_REQUIRED')
    }

    // CVE-CB-004 Fix: Only admins can update settings
    // Note: Add workspace-level role check when workspaceId is available
    if (user.role !== 'admin') {
      return createErrorResponse('Forbidden: Admin access required', 403, 'ADMIN_REQUIRED')
    }

    const body = await request.json()
    const {
      type,
      dailyRequiredMinutes,
      workStartTime,
      workEndTime,
      coreTimeStart,
      coreTimeEnd,
      presenceCheckEnabled,
      presenceIntervalMinutes,
      officeIpWhitelist,
    } = body

    const workspaceId = null

    // Upsert policy
    const existing = await prisma.workPolicy.findFirst({
      where: { workspaceId }
    })

    let policy
    if (existing) {
      policy = await prisma.workPolicy.update({
        where: { id: existing.id },
        data: {
          type,
          dailyRequiredMinutes,
          workStartTime,
          workEndTime,
          coreTimeStart,
          coreTimeEnd,
          presenceCheckEnabled,
          presenceIntervalMinutes,
          officeIpWhitelist,
        }
      })
    } else {
      policy = await prisma.workPolicy.create({
        data: {
          workspaceId,
          type,
          dailyRequiredMinutes,
          workStartTime,
          workEndTime,
          coreTimeStart,
          coreTimeEnd,
          presenceCheckEnabled,
          presenceIntervalMinutes,
          officeIpWhitelist,
        }
      })
    }

    // CVE-CB-005 Fix: Use secure logging
    secureLogger.info('Attendance settings updated', {
      operation: 'attendance.settings.update',
      userId: user.id,
      policyId: policy.id,
    })

    return NextResponse.json(policy)
  } catch (error) {
    secureLogger.error('Failed to update settings', error as Error, { operation: 'attendance.settings.update' })
    return createErrorResponse('Failed to update settings', 500, 'UPDATE_SETTINGS_FAILED')
  }
}
