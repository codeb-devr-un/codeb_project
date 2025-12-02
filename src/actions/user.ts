'use server'

// =============================================================================
// User Server Actions - CVE-CB-005 Fixed: Secure Logging
// =============================================================================

import { prisma } from '@/lib/prisma'
import { secureLogger } from '@/lib/security'

export async function getUsers() {
    try {
        const users = await prisma.user.findMany({
            select: {
                id: true,
                email: true,
                name: true,
                role: true,
                companyName: true,
                department: true
            },
            orderBy: {
                name: 'asc'
            }
        })

        return users
    } catch (error) {
        secureLogger.error('Failed to get users', error as Error, { operation: 'user.list' })
        return []
    }
}

export async function getCustomers() {
    try {
        // For now, return all users as potential customers
        // In the future, you might want to add a separate customer table
        const users = await prisma.user.findMany({
            select: {
                id: true,
                email: true,
                name: true,
                role: true,
                companyName: true,
                department: true
            },
            orderBy: {
                name: 'asc'
            }
        })

        return users
    } catch (error) {
        secureLogger.error('Failed to get customers', error as Error, { operation: 'user.listCustomers' })
        return []
    }
}

export async function getTeamMembers() {
    try {
        const users = await prisma.user.findMany({
            where: {
                role: 'admin'  // Only admins for now
            },
            select: {
                id: true,
                email: true,
                name: true,
                role: true
            },
            orderBy: {
                name: 'asc'
            }
        })

        return users
    } catch (error) {
        secureLogger.error('Failed to get team members', error as Error, { operation: 'user.listTeamMembers' })
        return []
    }
}

export async function getUserTeamColor(userId: string) {
    try {
        // Find the team membership for the user
        const teamMember = await prisma.teamMember.findFirst({
            where: { userId },
            include: { team: true }
        })

        // Return team color or default blue
        return teamMember?.team.color || '#3B82F6'
    } catch (error) {
        secureLogger.error('Failed to get user team color', error as Error, { operation: 'user.getTeamColor' })
        return '#3B82F6'
    }
}
