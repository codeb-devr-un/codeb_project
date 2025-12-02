'use server'

// =============================================================================
// Calendar Server Actions - CVE-CB-005 Fixed: Secure Logging
// =============================================================================

import { prisma } from '@/lib/prisma'
import { revalidatePath } from 'next/cache'
import { secureLogger } from '@/lib/security'

export async function getCalendarEvents(workspaceId: string, startDate: Date, endDate: Date) {
    try {
        const events = await prisma.calendarEvent.findMany({
            where: {
                workspaceId,
                startDate: {
                    gte: startDate,
                },
                endDate: {
                    lte: endDate,
                },
            },
            include: {
                creator: {
                    select: {
                        name: true,
                        avatar: true,
                    },
                },
                attendees: {
                    include: {
                        user: {
                            select: {
                                name: true,
                                avatar: true,
                            },
                        },
                    },
                },
            },
            orderBy: {
                startDate: 'asc',
            },
        })

        return events.map(event => ({
            ...event,
            startDate: event.startDate.toISOString(),
            endDate: event.endDate.toISOString(),
            createdAt: event.createdAt.toISOString(),
            updatedAt: event.updatedAt.toISOString(),
        }))
    } catch (error) {
        secureLogger.error('Error fetching calendar events', error as Error, { operation: 'calendar.list' })
        return []
    }
}

export async function createCalendarEvent(data: {
    workspaceId: string
    title: string
    description?: string
    startDate: Date
    endDate: Date
    location?: string
    color?: string
    isAllDay?: boolean
    createdBy: string
}) {
    try {
        const event = await prisma.calendarEvent.create({
            data: {
                ...data,
                attendees: {
                    create: {
                        userId: data.createdBy,
                        status: 'accepted',
                    },
                },
            },
        })

        revalidatePath('/calendar')
        return { success: true, event }
    } catch (error) {
        secureLogger.error('Error creating calendar event', error as Error, { operation: 'calendar.create' })
        return { success: false, error }
    }
}

export async function updateCalendarEvent(
    eventId: string,
    data: {
        title?: string
        description?: string
        startDate?: Date
        endDate?: Date
        location?: string
        color?: string
        isAllDay?: boolean
    }
) {
    try {
        const event = await prisma.calendarEvent.update({
            where: { id: eventId },
            data: {
                ...data,
                updatedAt: new Date(),
            },
        })

        revalidatePath('/calendar')
        return { success: true, event }
    } catch (error) {
        secureLogger.error('Error updating calendar event', error as Error, { operation: 'calendar.update' })
        return { success: false, error }
    }
}

export async function deleteCalendarEvent(eventId: string) {
    try {
        // 먼저 attendees 삭제
        await prisma.calendarEventAttendee.deleteMany({
            where: { eventId },
        })

        // 이벤트 삭제
        await prisma.calendarEvent.delete({
            where: { id: eventId },
        })

        revalidatePath('/calendar')
        return { success: true }
    } catch (error) {
        secureLogger.error('Error deleting calendar event', error as Error, { operation: 'calendar.delete' })
        return { success: false, error }
    }
}
