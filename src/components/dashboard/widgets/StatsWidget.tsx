import React from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { FileText, Timer, AlertCircle, CheckCircle2 } from 'lucide-react'

interface StatsWidgetProps {
    stats: {
        totalTasks: number
        completedTasks: number
        incompleteTasks: number
        overdueTasks: number
    }
}

export function StatsWidget({ stats }: StatsWidgetProps) {
    const statItems = [
        { label: "대기 작업", count: stats.incompleteTasks, icon: FileText, color: "text-slate-600", bg: "bg-white/60 backdrop-blur-xl", iconBg: "bg-slate-100/80" },
        { label: "진행 중", count: stats.incompleteTasks, icon: Timer, color: "text-blue-600", bg: "bg-white/60 backdrop-blur-xl", iconBg: "bg-blue-50/80" },
        { label: "지연됨", count: stats.overdueTasks, icon: AlertCircle, color: "text-rose-600", bg: "bg-white/60 backdrop-blur-xl", iconBg: "bg-rose-50/80" },
        { label: "완료", count: stats.completedTasks, icon: CheckCircle2, color: "text-emerald-600", bg: "bg-white/60 backdrop-blur-xl", iconBg: "bg-emerald-50/80" },
    ]

    return (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {statItems.map((stat, index) => (
                <Card
                    key={index}
                    className={`rounded-3xl border border-white/40 shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)] transition-all duration-300 hover:-translate-y-1 cursor-pointer group relative overflow-hidden ${stat.bg}`}
                >
                    <div className="absolute inset-0 bg-gradient-to-br from-white/40 to-transparent pointer-events-none" />
                    <CardContent className="p-5 flex flex-col items-center justify-center text-center h-[140px] relative z-10">
                        <div className={`p-3 rounded-full mb-3 transition-transform duration-300 group-hover:scale-110 shadow-sm backdrop-blur-sm ${stat.iconBg} ${stat.color}`}>
                            <stat.icon className="h-6 w-6" />
                        </div>
                        <span className="text-3xl font-bold text-slate-800 tracking-tight drop-shadow-sm">{stat.count}</span>
                        <p className="text-xs text-slate-500 mt-1 font-medium">{stat.label}</p>
                    </CardContent>
                </Card>
            ))}
        </div>
    )
}
