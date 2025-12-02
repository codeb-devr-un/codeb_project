// =============================================================================
// Invite Code API - CVE-CB-005 Fixed: Secure Logging
// =============================================================================

import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { secureLogger, createErrorResponse } from '@/lib/security'

export async function GET(
    request: Request,
    { params }: { params: { code: string } }
) {
    try {
        const invite = await prisma.invitation.findUnique({
            where: { token: params.code },
            include: {
                workspace: {
                    select: {
                        name: true,
                    },
                },
                inviter: {
                    select: {
                        name: true,
                        email: true,
                    },
                },
            },
        })

        if (!invite) {
            return createErrorResponse('Invalid invite code', 404, 'INVALID_CODE')
        }

        if (invite.status !== 'PENDING') {
            return createErrorResponse('Invite already accepted or expired', 400, 'INVITE_USED')
        }

        if (new Date() > invite.expiresAt) {
            return createErrorResponse('Invite expired', 400, 'INVITE_EXPIRED')
        }

        return NextResponse.json(invite)
    } catch (error) {
        // CVE-CB-005: Secure logging
        secureLogger.error('Failed to fetch invite', error as Error, { operation: 'invite.get' })
        return createErrorResponse('Failed to fetch invite', 500, 'FETCH_FAILED')
    }
}
