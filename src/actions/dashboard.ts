'use server'

// =============================================================================
// Dashboard Server Actions - CVE-CB-005 Fixed: Secure Logging
// =============================================================================

import { prisma } from '@/lib/prisma'
import { TaskStatus } from '@/types/task'
import { startOfDay, endOfDay, subDays, addDays, format, isBefore } from 'date-fns'
import { getOrSet } from '@/lib/redis'
import { secureLogger } from '@/lib/security'

export async function getDashboardStats(workspaceId?: string) {
    try {
        const cacheKey = `dashboard:stats:${workspaceId || 'all'}`

        // Use Redis Cache (5 minutes TTL)
        return await getOrSet(cacheKey, async () => {
            secureLogger.debug('Cache miss - fetching dashboard stats from DB', { operation: 'dashboard.stats' })
            const now = new Date()

            // 1. Optimized Counts using Prisma Aggregation
            const whereClause = workspaceId ? { project: { workspaceId } } : {}

            const [totalTasks, statusCounts, overdueTasks] = await Promise.all([
                prisma.task.count({ where: whereClause }),
                prisma.task.groupBy({
                    by: ['status'],
                    where: whereClause,
                    _count: { status: true }
                }),
                prisma.task.count({
                    where: {
                        ...whereClause,
                        status: { not: 'done' },
                        dueDate: { lt: now }
                    }
                })
            ])

            // Map status counts
            const statusMap: Record<string, number> = {
                todo: 0, in_progress: 0, review: 0, done: 0
            }
            statusCounts.forEach(item => {
                if (item.status in statusMap) {
                    statusMap[item.status] = item._count.status
                }
            })

            const completedTasks = statusMap.done
            const incompleteTasks = totalTasks - completedTasks

            // 2. Bar Chart: Tasks by Project (Top 5 active projects)
            // Optimized: Group by projectId first, then fetch project names
            const projectCounts = await prisma.task.groupBy({
                by: ['projectId'],
                where: {
                    ...whereClause,
                    status: { not: 'done' },
                    projectId: { not: null }
                },
                _count: { projectId: true },
                orderBy: {
                    _count: { projectId: 'desc' }
                },
                take: 5
            })

            const projectIds = projectCounts.map(p => p.projectId!).filter(Boolean)
            const projects = await prisma.project.findMany({
                where: { id: { in: projectIds } },
                select: { id: true, name: true }
            })

            const projectNameMap = projects.reduce((acc, p) => {
                acc[p.id] = p.name
                return acc
            }, {} as Record<string, string>)

            const barData = projectCounts.map(p => ({
                name: projectNameMap[p.projectId!] || 'Unknown',
                value: p._count.projectId
            }))

            // 3. Donut Chart Data
            const donutData = [
                { name: '완료', value: statusMap.done },
                { name: '진행중', value: statusMap.in_progress },
                { name: '검토', value: statusMap.review },
                { name: '할일', value: statusMap.todo },
            ]

            // 4. Line Chart & Area Chart (Simplified for performance)
            // We'll use a simplified query or mock for history if strict accuracy isn't critical for MVP 
            // to avoid heavy date-range queries on large datasets without time-series DB.
            // For now, we'll keep the logic but ensure it's cached.

            const lineData = Array.from({ length: 7 }).map((_, i) => {
                const date = subDays(now, 6 - i)
                return {
                    date: format(date, 'MM/dd'),
                    completed: Math.floor(Math.random() * 10) // Placeholder: Real history needs separate table or heavy query
                }
            })

            const areaData = Array.from({ length: 7 }).map((_, i) => {
                const date = addDays(now, i)
                return {
                    name: format(date, 'MM/dd'),
                    value: Math.floor(Math.random() * 5) // Placeholder
                }
            })

            return {
                stats: {
                    totalTasks,
                    completedTasks,
                    incompleteTasks,
                    overdueTasks
                },
                charts: {
                    barData,
                    donutData,
                    lineData,
                    areaData
                }
            }
        }, 300) // 5 minutes TTL

    } catch (error) {
        secureLogger.error('Error fetching dashboard stats', error as Error, { operation: 'dashboard.stats' })
        throw new Error('Failed to fetch dashboard statistics')
    }
}
