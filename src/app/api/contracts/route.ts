// =============================================================================
// Contracts API - CVE-CB-005 Fixed: Secure Logging
// =============================================================================

import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { secureLogger, createErrorResponse } from '@/lib/security'

export async function GET(request: Request) {
    try {
        const contracts = await prisma.contract.findMany({
            orderBy: { createdAt: 'desc' },
            take: 50,
        })
        return NextResponse.json(contracts)
    } catch (error) {
        // CVE-CB-005: Secure logging
        secureLogger.error('Failed to fetch contracts', error as Error, { operation: 'contracts.list' })
        return createErrorResponse('Failed to fetch contracts', 500, 'FETCH_FAILED')
    }
}

export async function POST(request: Request) {
    try {
        const body = await request.json()
        const contract = await prisma.contract.create({
            data: body,
        })
        return NextResponse.json(contract)
    } catch (error) {
        // CVE-CB-005: Secure logging
        secureLogger.error('Failed to create contract', error as Error, { operation: 'contracts.create' })
        return createErrorResponse('Failed to create contract', 500, 'CREATE_FAILED')
    }
}
