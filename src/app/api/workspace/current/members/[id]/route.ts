// =============================================================================
// Workspace Current Members API - CVE-CB-005 Fixed: Secure Logging
// =============================================================================

import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { secureLogger, createErrorResponse } from '@/lib/security'

export async function PATCH(
    request: Request,
    { params }: { params: { id: string } }
) {
    try {
        const body = await request.json()

        const updatedMember = await prisma.user.update({
            where: { id: params.id },
            data: {
                department: body.department,
            },
        })

        return NextResponse.json(updatedMember)
    } catch (error) {
        // CVE-CB-005: Secure logging
        secureLogger.error('Failed to update member', error as Error, { operation: 'workspace.current.members.update' })
        return createErrorResponse('Failed to update member', 500, 'UPDATE_FAILED')
    }
}
