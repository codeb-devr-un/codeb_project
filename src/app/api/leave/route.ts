// =============================================================================
// Leave API - CVE-CB-005 Fixed: Secure Logging
// =============================================================================

import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { secureLogger, createErrorResponse } from '@/lib/security'

const MOCK_USER_ID = 'test-user-id'

// Mock data
const mockLeaveRequests = [
    {
        id: '1',
        type: 'ANNUAL',
        startDate: new Date('2024-01-25'),
        endDate: new Date('2024-01-26'),
        days: 2,
        reason: '개인 사유',
        status: 'APPROVED',
        createdAt: new Date('2024-01-15'),
    },
    {
        id: '2',
        type: 'SICK',
        startDate: new Date('2024-01-20'),
        endDate: new Date('2024-01-20'),
        days: 1,
        reason: '병원 진료',
        status: 'PENDING',
        createdAt: new Date('2024-01-19'),
    },
]

export async function GET(request: Request) {
    try {
        // TODO: Replace with actual database query
        const balance = {
            total: 15,
            used: 2,
            remaining: 13,
        }

        return NextResponse.json({
            requests: mockLeaveRequests,
            balance,
        })
    } catch (error) {
        // CVE-CB-005: Secure logging
        secureLogger.error('Failed to fetch leave data', error as Error, { operation: 'leave.list' })
        return createErrorResponse('Failed to fetch leave data', 500, 'FETCH_FAILED')
    }
}

export async function POST(request: Request) {
    try {
        const body = await request.json()
        // TODO: Create leave request in database
        return NextResponse.json({ success: true })
    } catch (error) {
        // CVE-CB-005: Secure logging
        secureLogger.error('Failed to create leave request', error as Error, { operation: 'leave.create' })
        return createErrorResponse('Failed to create leave request', 500, 'CREATE_FAILED')
    }
}
