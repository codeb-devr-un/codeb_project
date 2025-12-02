'use client'

import React, { useMemo } from 'react'
import { Gantt, Willow } from '@svar-ui/react-gantt'
import '@svar-ui/react-gantt/all.css'
import { Task } from '@/types/task'

interface SvarGanttChartProps {
    tasks: any[]
    projectStartDate?: Date
    onTaskUpdate?: (taskId: string, startDate: Date, endDate: Date) => void
    onProgressUpdate?: (taskId: string, progress: number) => void
    onTaskEdit?: (task: any) => void
}

export default function SvarGanttChart({ tasks, projectStartDate, onTaskUpdate, onProgressUpdate, onTaskEdit }: SvarGanttChartProps) {
    const ganttTasks = useMemo(() => {
        const baseDate = projectStartDate || new Date()
        return tasks.map(task => {
            let startDate = task.startDate ? new Date(task.startDate) : (projectStartDate || new Date(task.createdAt))
            if (isNaN(startDate.getTime())) startDate = baseDate

            let endDate = task.dueDate ? new Date(task.dueDate) : new Date(startDate.getTime() + 24 * 60 * 60 * 1000)
            if (isNaN(endDate.getTime())) endDate = new Date(startDate.getTime() + 24 * 60 * 60 * 1000)

            if (endDate <= startDate) {
                endDate = new Date(startDate.getTime() + 24 * 60 * 60 * 1000)
            }

            return {
                id: task.id,
                text: task.title,
                start_date: startDate,
                end_date: endDate, // SVAR uses end_date (exclusive? need to check, usually inclusive or duration)
                // SVAR ITask has 'start' and 'end' in types.d.ts, but standard is often start_date/end_date or start/end.
                // types.d.ts said: start?: Date; end?: Date;
                start: startDate,
                end: endDate,
                // Strings for display columns
                start_str: startDate.toLocaleDateString('ko-KR'),
                end_str: endDate.toLocaleDateString('ko-KR'),
                progress: (task as any).progress || 0,
                parent: null, // Flat list for now
                type: 'task',
                color: task.color // Custom color
            }
        })
    }, [tasks, projectStartDate])

    const handleUpdateTask = (ev: any) => {
        // ev: { id, task, inProgress }
        if (ev.inProgress) return

        console.log('Update event:', ev)

        const { id, task } = ev
        if (!task) return

        // SVAR Gantt updates 'start' and 'end' properties during drag/resize.
        // We must prioritize these over our custom 'start_date'/'end_date' which might be stale.
        const newStartDate = task.start || task.start_date
        const newEndDate = task.end || task.end_date

        // Check for date changes
        if (newStartDate && newEndDate && onTaskUpdate) {
            onTaskUpdate(id, newStartDate, newEndDate)
        }

        // Check for progress changes
        if (typeof task.progress === 'number' && onProgressUpdate) {
            onProgressUpdate(id, task.progress)
        }
    }

    // Calculate timeline bounds
    const { minDate, maxDate } = useMemo(() => {
        if (ganttTasks.length === 0) {
            const start = projectStartDate || new Date()
            const end = new Date(start)
            end.setDate(end.getDate() + 30)
            return { minDate: start, maxDate: end }
        }

        let min = new Date(ganttTasks[0].start_date)
        let max = new Date(ganttTasks[0].end_date)

        ganttTasks.forEach(t => {
            if (t.start_date < min) min = new Date(t.start_date)
            if (t.end_date > max) max = new Date(t.end_date)
        })

        // Add padding
        min.setDate(min.getDate() - 7)
        max.setDate(max.getDate() + 7)

        return { minDate: min, maxDate: max }
    }, [ganttTasks, projectStartDate])

    return (
        <div className="h-full w-full">
            <Willow>
                <Gantt
                    tasks={ganttTasks}
                    onUpdateTask={handleUpdateTask}
                    onTaskDblClick={(ev: any) => {
                        if (onTaskEdit && ev.id) {
                            const task = tasks.find(t => t.id === ev.id)
                            if (task) onTaskEdit(task)
                        }
                    }}
                    start={minDate}
                    end={maxDate}
                    autoScale={true}
                    cellWidth={40}
                    highlightTime={(date) => {
                        const today = new Date()
                        if (date.getDate() === today.getDate() &&
                            date.getMonth() === today.getMonth() &&
                            date.getFullYear() === today.getFullYear()) {
                            return "today-cell"
                        }
                        return ""
                    }}
                    scales={[
                        {
                            unit: "month",
                            step: 1,
                            format: (date: Date) => `${date.getFullYear()}년 ${date.getMonth() + 1}월`
                        },
                        {
                            unit: "day",
                            step: 1,
                            format: (date: Date) => `${date.getDate()}`
                        }
                    ]}
                    columns={[
                        { id: "text", label: "작업명", width: 260, tree: true },
                        {
                            id: "start_str",
                            label: "시작",
                            width: 80,
                            align: "center",
                            cell: ({ row }: any) => (
                                <div onDoubleClick={() => onTaskEdit && onTaskEdit(row)} style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                    {row.start_str}
                                </div>
                            )
                        },
                        {
                            id: "end_str",
                            label: "종료",
                            width: 80,
                            align: "center",
                            cell: ({ row }: any) => (
                                <div onDoubleClick={() => onTaskEdit && onTaskEdit(row)} style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                    {row.end_str}
                                </div>
                            )
                        },
                        {
                            id: "progress",
                            label: "%",
                            width: 50,
                            align: "center",
                            cell: ({ row }: any) => (
                                <div onDoubleClick={() => onTaskEdit && onTaskEdit(row)} style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                    {row.progress}
                                </div>
                            )
                        }
                    ]}
                />
            </Willow>
            <style jsx global>{`
                .today-cell {
                    background-color: rgba(255, 255, 0, 0.1);
                    border-right: 2px solid #ef4444 !important;
                }
                /* Fix header text visibility - Aggressive Override */
                .wx-table .wx-grid .wx-header .wx-cell,
                .wx-table .wx-grid .wx-header .wx-cell .wx-text,
                .wx-table .wx-grid .wx-header .wx-cell span,
                .wx-table .wx-grid .wx-header .wx-cell div {
                    color: #111827 !important; /* gray-900 */
                    font-weight: 600 !important;
                    background-color: #f9fafb !important; /* gray-50 */
                    opacity: 1 !important;
                    visibility: visible !important;
                }
                
                /* Ensure grid cells are clickable and visible */
                .wx-table .wx-grid .wx-cell {
                    cursor: pointer;
                    color: #374151 !important; /* gray-700 */
                }
                
                /* Override CSS variables for the Willow theme */
                .wx-willow-theme {
                    --wx-grid-header-font-color: #111827 !important;
                    --wx-grid-body-font-color: #374151 !important;
                    --wx-color-font: #374151 !important;
                }
            `}</style>
        </div>
    )
}
