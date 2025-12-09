// =============================================================================
// Test DB API - CVE-CB-005 Fixed: Secure Logging
// =============================================================================

export const dynamic = 'force-dynamic'

import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { secureLogger, createErrorResponse } from '@/lib/security'

export async function GET() {
    try {
        secureLogger.info('Testing database connection', { operation: 'testDb.connect' })
        const userCount = await prisma.user.count()
        secureLogger.info('Database connection successful', { operation: 'testDb.success' })

        // Also try to read the first workspace to be sure
        const workspace = await prisma.workspace.findFirst()

        return NextResponse.json({
            status: 'success',
            message: 'Database connection successful',
            userCount,
            workspace: workspace ? workspace.name : 'No workspace found'
        })
    } catch (error: any) {
        // CVE-CB-005: Secure logging - don't expose stack traces
        secureLogger.error('Database connection failed', error as Error, { operation: 'testDb.connect' })
        return createErrorResponse('Database connection failed', 500, 'DB_CONNECTION_FAILED')
    }
}
