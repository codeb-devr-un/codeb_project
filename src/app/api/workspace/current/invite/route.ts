// =============================================================================
// Workspace Current Invite API - CVE-CB-005 Fixed: Secure Logging
// =============================================================================

import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { secureLogger, createErrorResponse } from '@/lib/security'

export async function POST(request: Request) {
    try {
        const body = await request.json()
        const { email, name } = body

        if (!email || !name) {
            return NextResponse.json(
                { error: 'Email and name are required' },
                { status: 400 }
            )
        }

        // Check if user already exists
        const existingUser = await prisma.user.findUnique({
            where: { email },
        })

        if (existingUser) {
            return NextResponse.json(
                { error: 'User already exists' },
                { status: 400 }
            )
        }

        // CVE-CB-005: Secure logging - don't log email addresses
        secureLogger.info('Sending workspace invitation', { operation: 'workspace.current.invite' })

        // In a real implementation, you would:
        // 1. Generate a unique invitation token
        // 2. Store it in the database
        // 3. Send an email with a signup link containing the token
        // 4. When they click the link, verify the token and create their account

        return NextResponse.json({
            success: true,
            message: 'Invitation sent successfully',
        })
    } catch (error) {
        // CVE-CB-005: Secure logging
        secureLogger.error('Failed to send invitation', error as Error, { operation: 'workspace.current.invite' })
        return createErrorResponse('Failed to send invitation', 500, 'INVITE_FAILED')
    }
}
