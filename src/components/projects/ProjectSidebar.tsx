'use client'

import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
    Calendar,
    DollarSign,
    Users,
    Clock,
    TrendingUp,
    Target,
    ChevronRight,
    Zap,
    CheckCircle2,
    AlertCircle,
    BarChart3,
    Sparkles,
    UserPlus,
    ArrowUpRight,
    Circle
} from 'lucide-react'
import { Progress } from '@/components/ui/progress'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Separator } from '@/components/ui/separator'
import { cn } from '@/lib/utils'

interface ProjectSidebarProps {
    project: {
        id: string
        name: string
        status: string
        progress: number
        startDate: Date | null
        endDate: Date | null
        budget: number | null
        spentBudget?: number
        team?: string[]
        teamMembers?: any[]
        createdAt: Date
        updatedAt: Date
        priority?: string
        visibility?: string
    }
    activities?: Array<{
        id: string
        type: string
        message: string
        userName: string
        timestamp: Date
        icon: string
    }>
}

const statusConfig: Record<string, { label: string; color: string; bgColor: string; icon: React.ElementType }> = {
    planning: { label: '기획', color: 'text-violet-600', bgColor: 'bg-violet-100', icon: Target },
    design: { label: '디자인', color: 'text-pink-600', bgColor: 'bg-pink-100', icon: Sparkles },
    development: { label: '개발', color: 'text-blue-600', bgColor: 'bg-blue-100', icon: Zap },
    testing: { label: '테스트', color: 'text-amber-600', bgColor: 'bg-amber-100', icon: AlertCircle },
    completed: { label: '완료', color: 'text-lime-600', bgColor: 'bg-lime-100', icon: CheckCircle2 },
    pending: { label: '대기', color: 'text-slate-600', bgColor: 'bg-slate-100', icon: Clock },
}

const priorityConfig: Record<string, { label: string; color: string }> = {
    low: { label: '낮음', color: 'text-slate-500' },
    medium: { label: '보통', color: 'text-amber-500' },
    high: { label: '높음', color: 'text-orange-500' },
    critical: { label: '긴급', color: 'text-red-500' },
}

const roleColors: Record<string, string> = {
    Admin: 'bg-red-500',
    PM: 'bg-purple-500',
    Developer: 'bg-blue-500',
    Designer: 'bg-pink-500',
    Viewer: 'bg-slate-400',
}

export default function ProjectSidebar({ project, activities = [] }: ProjectSidebarProps) {
    const [expandedSection, setExpandedSection] = useState<string | null>('progress')

    const daysLeft = project.endDate
        ? Math.ceil((new Date(project.endDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))
        : 0

    const totalDays = project.startDate && project.endDate
        ? Math.ceil((new Date(project.endDate).getTime() - new Date(project.startDate).getTime()) / (1000 * 60 * 60 * 24))
        : 0

    const elapsedDays = project.startDate
        ? Math.ceil((new Date().getTime() - new Date(project.startDate).getTime()) / (1000 * 60 * 60 * 24))
        : 0

    const timeProgress = totalDays > 0 ? Math.min(100, Math.max(0, (elapsedDays / totalDays) * 100)) : 0

    const budgetUsagePercent = project.budget && project.spentBudget
        ? Math.round((project.spentBudget / project.budget) * 100)
        : 0

    const status = statusConfig[project.status] || statusConfig.pending
    const StatusIcon = status.icon

    const formatCurrency = (amount: number) => {
        if (amount >= 100000000) {
            return `${(amount / 100000000).toFixed(1)}억`
        } else if (amount >= 10000) {
            return `${(amount / 10000).toFixed(0)}만`
        }
        return new Intl.NumberFormat('ko-KR').format(amount)
    }

    const toggleSection = (section: string) => {
        setExpandedSection(expandedSection === section ? null : section)
    }

    return (
        <div className="w-80 bg-white/70 backdrop-blur-xl border-l border-white/40 flex flex-col overflow-hidden">
            {/* Sidebar Header - Glass */}
            <div className="p-5 border-b border-white/40 bg-gradient-to-r from-slate-50/80 to-white/60">
                <div className="flex items-center gap-3">
                    <div className={cn("w-10 h-10 rounded-2xl flex items-center justify-center", status.bgColor)}>
                        <StatusIcon className={cn("w-5 h-5", status.color)} />
                    </div>
                    <div className="flex-1 min-w-0">
                        <h2 className="text-sm font-bold text-slate-900 truncate">프로젝트 정보</h2>
                        <div className="flex items-center gap-2 mt-0.5">
                            <Badge variant="outline" className={cn("text-xs px-2 py-0 h-5 rounded-lg border-0", status.bgColor, status.color)}>
                                {status.label}
                            </Badge>
                            {project.priority && priorityConfig[project.priority] && (
                                <span className={cn("text-xs font-medium", priorityConfig[project.priority].color)}>
                                    {priorityConfig[project.priority].label}
                                </span>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* Sidebar Content */}
            <div className="flex-1 overflow-y-auto">
                {/* Progress Section */}
                <motion.div className="border-b border-white/40">
                    <button
                        onClick={() => toggleSection('progress')}
                        className="w-full p-4 flex items-center justify-between hover:bg-white/40 transition-colors"
                    >
                        <div className="flex items-center gap-2">
                            <BarChart3 className="w-4 h-4 text-lime-500" />
                            <span className="text-sm font-semibold text-slate-700">진행 상황</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <span className="text-sm font-bold text-lime-600">{project.progress}%</span>
                            <ChevronRight className={cn(
                                "w-4 h-4 text-slate-400 transition-transform",
                                expandedSection === 'progress' && "rotate-90"
                            )} />
                        </div>
                    </button>

                    <AnimatePresence>
                        {expandedSection === 'progress' && (
                            <motion.div
                                initial={{ height: 0, opacity: 0 }}
                                animate={{ height: 'auto', opacity: 1 }}
                                exit={{ height: 0, opacity: 0 }}
                                transition={{ duration: 0.2 }}
                                className="overflow-hidden"
                            >
                                <div className="px-4 pb-4 space-y-4">
                                    {/* Main Progress */}
                                    <div className="p-4 rounded-2xl bg-gradient-to-br from-lime-50 to-emerald-50 border border-lime-100">
                                        <div className="flex items-center justify-between mb-3">
                                            <span className="text-xs font-medium text-slate-500">전체 진행률</span>
                                            <span className="text-2xl font-black text-slate-900">{project.progress}%</span>
                                        </div>
                                        <Progress value={project.progress} className="h-3 bg-white/80" />
                                        <div className="flex justify-between mt-2 text-xs text-slate-500">
                                            <span>시작</span>
                                            <span>완료</span>
                                        </div>
                                    </div>

                                    {/* Time Progress */}
                                    <div className="p-3 rounded-xl bg-white/60 border border-white/40">
                                        <div className="flex items-center justify-between mb-2">
                                            <div className="flex items-center gap-2">
                                                <Clock className="w-4 h-4 text-blue-500" />
                                                <span className="text-xs font-medium text-slate-600">시간 경과</span>
                                            </div>
                                            <span className="text-xs font-bold text-blue-600">{Math.round(timeProgress)}%</span>
                                        </div>
                                        <Progress value={timeProgress} className="h-1.5 bg-slate-100" />
                                    </div>

                                    {/* Stats Grid */}
                                    <div className="grid grid-cols-2 gap-2">
                                        <div className="p-3 rounded-xl bg-white/60 border border-white/40 text-center">
                                            <div className="text-lg font-black text-slate-900">{elapsedDays}</div>
                                            <div className="text-xs text-slate-500">경과일</div>
                                        </div>
                                        <div className="p-3 rounded-xl bg-white/60 border border-white/40 text-center">
                                            <div className={cn(
                                                "text-lg font-black",
                                                daysLeft <= 7 ? "text-red-500" : daysLeft <= 14 ? "text-amber-500" : "text-slate-900"
                                            )}>
                                                {daysLeft > 0 ? daysLeft : 0}
                                            </div>
                                            <div className="text-xs text-slate-500">남은일</div>
                                        </div>
                                    </div>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </motion.div>

                {/* Schedule Section */}
                <motion.div className="border-b border-white/40">
                    <button
                        onClick={() => toggleSection('schedule')}
                        className="w-full p-4 flex items-center justify-between hover:bg-white/40 transition-colors"
                    >
                        <div className="flex items-center gap-2">
                            <Calendar className="w-4 h-4 text-violet-500" />
                            <span className="text-sm font-semibold text-slate-700">일정</span>
                        </div>
                        <ChevronRight className={cn(
                            "w-4 h-4 text-slate-400 transition-transform",
                            expandedSection === 'schedule' && "rotate-90"
                        )} />
                    </button>

                    <AnimatePresence>
                        {expandedSection === 'schedule' && (
                            <motion.div
                                initial={{ height: 0, opacity: 0 }}
                                animate={{ height: 'auto', opacity: 1 }}
                                exit={{ height: 0, opacity: 0 }}
                                transition={{ duration: 0.2 }}
                                className="overflow-hidden"
                            >
                                <div className="px-4 pb-4 space-y-3">
                                    {/* Timeline Visual */}
                                    <div className="relative p-4 rounded-2xl bg-gradient-to-r from-violet-50 to-purple-50 border border-violet-100">
                                        <div className="flex items-center justify-between">
                                            <div className="text-center">
                                                <div className="w-3 h-3 rounded-full bg-violet-500 mx-auto mb-2" />
                                                <div className="text-xs font-bold text-slate-900">
                                                    {project.startDate ? new Date(project.startDate).toLocaleDateString('ko-KR', {
                                                        month: 'short',
                                                        day: 'numeric'
                                                    }) : '-'}
                                                </div>
                                                <div className="text-[10px] text-slate-500">시작</div>
                                            </div>
                                            <div className="flex-1 mx-4 h-0.5 bg-gradient-to-r from-violet-300 to-purple-300 relative">
                                                <div
                                                    className="absolute top-1/2 -translate-y-1/2 w-2 h-2 rounded-full bg-violet-600 shadow-lg"
                                                    style={{ left: `${timeProgress}%` }}
                                                />
                                            </div>
                                            <div className="text-center">
                                                <div className="w-3 h-3 rounded-full bg-purple-500 mx-auto mb-2" />
                                                <div className="text-xs font-bold text-slate-900">
                                                    {project.endDate ? new Date(project.endDate).toLocaleDateString('ko-KR', {
                                                        month: 'short',
                                                        day: 'numeric'
                                                    }) : '-'}
                                                </div>
                                                <div className="text-[10px] text-slate-500">마감</div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Date Details */}
                                    <div className="grid grid-cols-2 gap-2">
                                        <div className="p-3 rounded-xl bg-white/60 border border-white/40">
                                            <div className="text-[10px] text-slate-500 uppercase tracking-wider mb-1">시작일</div>
                                            <div className="text-sm font-bold text-slate-900">
                                                {project.startDate ? new Date(project.startDate).toLocaleDateString('ko-KR', {
                                                    year: 'numeric',
                                                    month: 'short',
                                                    day: 'numeric'
                                                }) : '미정'}
                                            </div>
                                        </div>
                                        <div className="p-3 rounded-xl bg-white/60 border border-white/40">
                                            <div className="text-[10px] text-slate-500 uppercase tracking-wider mb-1">마감일</div>
                                            <div className={cn(
                                                "text-sm font-bold",
                                                daysLeft <= 7 ? "text-red-500" : "text-slate-900"
                                            )}>
                                                {project.endDate ? new Date(project.endDate).toLocaleDateString('ko-KR', {
                                                    year: 'numeric',
                                                    month: 'short',
                                                    day: 'numeric'
                                                }) : '미정'}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </motion.div>

                {/* Budget Section */}
                <motion.div className="border-b border-white/40">
                    <button
                        onClick={() => toggleSection('budget')}
                        className="w-full p-4 flex items-center justify-between hover:bg-white/40 transition-colors"
                    >
                        <div className="flex items-center gap-2">
                            <DollarSign className="w-4 h-4 text-emerald-500" />
                            <span className="text-sm font-semibold text-slate-700">예산</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <span className="text-xs font-bold text-emerald-600">₩{formatCurrency(project.budget || 0)}</span>
                            <ChevronRight className={cn(
                                "w-4 h-4 text-slate-400 transition-transform",
                                expandedSection === 'budget' && "rotate-90"
                            )} />
                        </div>
                    </button>

                    <AnimatePresence>
                        {expandedSection === 'budget' && (
                            <motion.div
                                initial={{ height: 0, opacity: 0 }}
                                animate={{ height: 'auto', opacity: 1 }}
                                exit={{ height: 0, opacity: 0 }}
                                transition={{ duration: 0.2 }}
                                className="overflow-hidden"
                            >
                                <div className="px-4 pb-4 space-y-3">
                                    {/* Budget Card */}
                                    <div className="p-4 rounded-2xl bg-gradient-to-br from-emerald-50 to-teal-50 border border-emerald-100">
                                        <div className="flex items-center justify-between mb-1">
                                            <span className="text-xs font-medium text-slate-500">총 예산</span>
                                            <span className="text-xl font-black text-slate-900">
                                                ₩{formatCurrency(project.budget || 0)}
                                            </span>
                                        </div>

                                        {project.spentBudget !== undefined && (
                                            <>
                                                <div className="mt-3 mb-2">
                                                    <Progress
                                                        value={budgetUsagePercent}
                                                        className={cn(
                                                            "h-2 bg-white/80",
                                                            budgetUsagePercent > 90 && "[&>div]:bg-red-500",
                                                            budgetUsagePercent > 70 && budgetUsagePercent <= 90 && "[&>div]:bg-amber-500"
                                                        )}
                                                    />
                                                </div>
                                                <div className="flex items-center justify-between text-xs">
                                                    <span className="text-slate-500">
                                                        사용: ₩{formatCurrency(project.spentBudget)}
                                                    </span>
                                                    <span className={cn(
                                                        "font-bold",
                                                        budgetUsagePercent > 90 ? "text-red-500" :
                                                        budgetUsagePercent > 70 ? "text-amber-500" : "text-emerald-600"
                                                    )}>
                                                        {budgetUsagePercent}% 사용
                                                    </span>
                                                </div>
                                            </>
                                        )}
                                    </div>

                                    {/* Budget Stats */}
                                    {project.spentBudget !== undefined && project.budget && (
                                        <div className="grid grid-cols-2 gap-2">
                                            <div className="p-3 rounded-xl bg-white/60 border border-white/40 text-center">
                                                <div className="text-lg font-black text-emerald-600">
                                                    ₩{formatCurrency(project.budget - project.spentBudget)}
                                                </div>
                                                <div className="text-xs text-slate-500">잔여 예산</div>
                                            </div>
                                            <div className="p-3 rounded-xl bg-white/60 border border-white/40 text-center">
                                                <div className={cn(
                                                    "text-lg font-black",
                                                    budgetUsagePercent > project.progress ? "text-red-500" : "text-emerald-600"
                                                )}>
                                                    {budgetUsagePercent > project.progress ? '+' : '-'}
                                                    {Math.abs(budgetUsagePercent - project.progress)}%
                                                </div>
                                                <div className="text-xs text-slate-500">예산 대비</div>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </motion.div>

                {/* Team Section */}
                <motion.div className="border-b border-white/40">
                    <button
                        onClick={() => toggleSection('team')}
                        className="w-full p-4 flex items-center justify-between hover:bg-white/40 transition-colors"
                    >
                        <div className="flex items-center gap-2">
                            <Users className="w-4 h-4 text-blue-500" />
                            <span className="text-sm font-semibold text-slate-700">팀원</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <div className="flex -space-x-2">
                                {(project.teamMembers || project.team || []).slice(0, 3).map((member: any, idx: number) => (
                                    <div
                                        key={idx}
                                        className="w-6 h-6 rounded-full bg-black text-lime-400 flex items-center justify-center text-[10px] font-bold border-2 border-white"
                                    >
                                        {(typeof member === 'string' ? member : member.name)?.charAt(0) || '?'}
                                    </div>
                                ))}
                            </div>
                            <span className="text-xs text-slate-500">
                                {(project.teamMembers?.length || project.team?.length || 0)}명
                            </span>
                            <ChevronRight className={cn(
                                "w-4 h-4 text-slate-400 transition-transform",
                                expandedSection === 'team' && "rotate-90"
                            )} />
                        </div>
                    </button>

                    <AnimatePresence>
                        {expandedSection === 'team' && (
                            <motion.div
                                initial={{ height: 0, opacity: 0 }}
                                animate={{ height: 'auto', opacity: 1 }}
                                exit={{ height: 0, opacity: 0 }}
                                transition={{ duration: 0.2 }}
                                className="overflow-hidden"
                            >
                                <div className="px-4 pb-4 space-y-2">
                                    {project.teamMembers && project.teamMembers.length > 0 ? (
                                        project.teamMembers.map((member, idx) => (
                                            <motion.div
                                                key={idx}
                                                initial={{ opacity: 0, x: -10 }}
                                                animate={{ opacity: 1, x: 0 }}
                                                transition={{ delay: idx * 0.05 }}
                                                className="flex items-center gap-3 p-2 rounded-xl bg-white/60 border border-white/40 hover:bg-white/80 transition-colors"
                                            >
                                                <div className="relative">
                                                    <div className="w-9 h-9 rounded-xl bg-black text-lime-400 flex items-center justify-center text-sm font-bold">
                                                        {member.name?.charAt(0) || '?'}
                                                    </div>
                                                    <div className={cn(
                                                        "absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2 border-white",
                                                        roleColors[member.role] || 'bg-slate-400'
                                                    )} />
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <div className="text-sm font-medium text-slate-900 truncate">{member.name}</div>
                                                    <div className="text-xs text-slate-500">{member.role}</div>
                                                </div>
                                            </motion.div>
                                        ))
                                    ) : project.team && project.team.length > 0 ? (
                                        project.team.map((member, idx) => (
                                            <motion.div
                                                key={idx}
                                                initial={{ opacity: 0, x: -10 }}
                                                animate={{ opacity: 1, x: 0 }}
                                                transition={{ delay: idx * 0.05 }}
                                                className="flex items-center gap-3 p-2 rounded-xl bg-white/60 border border-white/40 hover:bg-white/80 transition-colors"
                                            >
                                                <div className="w-9 h-9 rounded-xl bg-black text-lime-400 flex items-center justify-center text-sm font-bold">
                                                    {member.charAt(0)}
                                                </div>
                                                <div className="text-sm font-medium text-slate-900">{member}</div>
                                            </motion.div>
                                        ))
                                    ) : (
                                        <div className="text-center py-4">
                                            <Users className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                                            <p className="text-sm text-slate-500">팀원이 없습니다</p>
                                            <Button variant="ghost" size="sm" className="mt-2 text-lime-600 hover:text-lime-700">
                                                <UserPlus className="w-4 h-4 mr-1" />
                                                팀원 초대
                                            </Button>
                                        </div>
                                    )}
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </motion.div>

                {/* Recent Activity */}
                {activities.length > 0 && (
                    <motion.div>
                        <button
                            onClick={() => toggleSection('activity')}
                            className="w-full p-4 flex items-center justify-between hover:bg-white/40 transition-colors"
                        >
                            <div className="flex items-center gap-2">
                                <Zap className="w-4 h-4 text-amber-500" />
                                <span className="text-sm font-semibold text-slate-700">최근 활동</span>
                            </div>
                            <ChevronRight className={cn(
                                "w-4 h-4 text-slate-400 transition-transform",
                                expandedSection === 'activity' && "rotate-90"
                            )} />
                        </button>

                        <AnimatePresence>
                            {expandedSection === 'activity' && (
                                <motion.div
                                    initial={{ height: 0, opacity: 0 }}
                                    animate={{ height: 'auto', opacity: 1 }}
                                    exit={{ height: 0, opacity: 0 }}
                                    transition={{ duration: 0.2 }}
                                    className="overflow-hidden"
                                >
                                    <div className="px-4 pb-4 space-y-2">
                                        {activities.slice(0, 5).map((activity, idx) => (
                                            <motion.div
                                                key={activity.id}
                                                initial={{ opacity: 0, y: 10 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                transition={{ delay: idx * 0.05 }}
                                                className="flex gap-3 p-3 rounded-xl bg-white/60 border border-white/40"
                                            >
                                                <div className="text-lg flex-shrink-0">{activity.icon}</div>
                                                <div className="flex-1 min-w-0">
                                                    <div className="text-xs text-slate-700 leading-relaxed">{activity.message}</div>
                                                    <div className="flex items-center gap-2 mt-1 text-[10px] text-slate-400">
                                                        <span className="font-medium">{activity.userName}</span>
                                                        <Circle className="w-1 h-1 fill-slate-300" />
                                                        <span>{new Date(activity.timestamp).toLocaleDateString('ko-KR', {
                                                            month: 'short',
                                                            day: 'numeric',
                                                            hour: '2-digit',
                                                            minute: '2-digit'
                                                        })}</span>
                                                    </div>
                                                </div>
                                            </motion.div>
                                        ))}

                                        {activities.length > 5 && (
                                            <Button variant="ghost" size="sm" className="w-full text-slate-500 hover:text-slate-700">
                                                모든 활동 보기
                                                <ArrowUpRight className="w-3 h-3 ml-1" />
                                            </Button>
                                        )}
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </motion.div>
                )}
            </div>

            {/* Footer - Quick Actions */}
            <div className="p-4 border-t border-white/40 bg-gradient-to-r from-slate-50/80 to-white/60">
                <div className="text-[10px] text-slate-400 text-center">
                    마지막 업데이트: {new Date(project.updatedAt).toLocaleDateString('ko-KR', {
                        month: 'short',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                    })}
                </div>
            </div>
        </div>
    )
}
