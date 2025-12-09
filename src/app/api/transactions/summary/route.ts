// =============================================================================
// Transactions Summary API - CVE-CB-005 Fixed: Secure Logging
// =============================================================================

export const dynamic = 'force-dynamic'

import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { secureLogger, createErrorResponse } from '@/lib/security'

export async function GET(request: Request) {
    try {
        const transactions = await prisma.transaction.findMany({
            orderBy: { date: 'desc' },
            take: 20,
        })

        const income = transactions
            .filter(t => t.type === 'INCOME')
            .reduce((sum, t) => sum + t.amount, 0)

        const expense = transactions
            .filter(t => t.type === 'EXPENSE')
            .reduce((sum, t) => sum + t.amount, 0)

        return NextResponse.json({
            summary: {
                income,
                expense,
                profit: income - expense,
            },
            transactions,
        })
    } catch (error) {
        // CVE-CB-005: Secure logging
        secureLogger.error('Failed to fetch transactions', error as Error, { operation: 'transactions.summary' })
        return createErrorResponse('Failed to fetch transactions', 500, 'FETCH_FAILED')
    }
}
