// =============================================================================
// Current Workspace Members API - CVE-CB-003, CVE-CB-005 Fixed
// =============================================================================

import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth-options'
import { secureLogger, createErrorResponse } from '@/lib/security'

export async function GET(request: Request) {
    try {
        const session = await getServerSession(authOptions)
        if (!session?.user?.email) {
            return createErrorResponse('Unauthorized', 401, 'AUTH_REQUIRED')
        }

        // CVE-CB-003 Fix: Prefer query parameter over header for workspace ID
        const { searchParams } = new URL(request.url)
        const workspaceId = searchParams.get('workspaceId') || request.headers.get('x-workspace-id')

        if (!workspaceId) {
            return createErrorResponse('Workspace ID required', 400, 'WORKSPACE_ID_REQUIRED')
        }

        // Verify user is a member of this workspace
        const currentUser = await prisma.user.findUnique({
            where: { email: session.user.email }
        })

        if (!currentUser) {
            return createErrorResponse('User not found', 404, 'USER_NOT_FOUND')
        }

        const membership = await prisma.workspaceMember.findUnique({
            where: {
                workspaceId_userId: {
                    workspaceId,
                    userId: currentUser.id
                }
            }
        })

        if (!membership) {
            return createErrorResponse('Not a member of this workspace', 403, 'NOT_A_MEMBER')
        }

        // 워크스페이스의 멤버 조회
        const workspaceMembers = await prisma.workspaceMember.findMany({
            where: {
                workspaceId: workspaceId,
            },
            include: {
                user: {
                    select: {
                        id: true,
                        email: true,
                        name: true,
                        department: true,
                        role: true,
                        avatar: true,
                    },
                },
            },
        })

        // User 정보만 반환
        const members = workspaceMembers.map(wm => wm.user)
        return NextResponse.json(members)
    } catch (error) {
        // CVE-CB-005: Secure logging
        secureLogger.error('Failed to fetch members', error as Error, { operation: 'workspace.current.members' })
        return createErrorResponse('Failed to fetch members', 500, 'FETCH_FAILED')
    }
}
