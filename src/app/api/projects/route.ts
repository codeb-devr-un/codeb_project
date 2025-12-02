// =============================================================================
// Projects List API - CVE Fixes Applied
// CVE-CB-002: Session-based authentication required
// CVE-CB-003: No header-based authentication bypass
// CVE-CB-004: Workspace membership verification
// =============================================================================

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { authenticateRequest, secureLogger, createErrorResponse } from '@/lib/security'

export async function GET(request: NextRequest) {
  try {
    // CVE-CB-002 Fix: Require session-based authentication
    const user = await authenticateRequest()
    if (!user) {
      return createErrorResponse('Unauthorized', 401, 'AUTH_REQUIRED')
    }

    // Get workspace ID from query params (not header)
    const { searchParams } = new URL(request.url)
    const workspaceId = searchParams.get('workspaceId')

    if (!workspaceId) {
      return createErrorResponse('Workspace ID required', 400, 'WORKSPACE_ID_REQUIRED')
    }

    // CVE-CB-004 Fix: Verify user has access to workspace
    const membership = await prisma.workspaceMember.findUnique({
      where: {
        workspaceId_userId: {
          workspaceId,
          userId: user.id,
        },
      },
    })

    if (!membership) {
      return createErrorResponse('Forbidden: Not a workspace member', 403, 'NOT_A_MEMBER')
    }

    const projects = await prisma.project.findMany({
      where: {
        workspaceId: workspaceId,
      },
      orderBy: {
        updatedAt: 'desc',
      },
      select: {
        id: true,
        name: true,
        description: true,
        status: true,
        priority: true,
        startDate: true,
        endDate: true,
        createdAt: true,
        updatedAt: true,
      }
    })

    return NextResponse.json(projects)
  } catch (error) {
    secureLogger.error('Failed to fetch projects', error as Error, { operation: 'project.list' })
    return createErrorResponse('Failed to fetch projects', 500, 'FETCH_FAILED')
  }
}
