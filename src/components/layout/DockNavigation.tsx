'use client'

import React from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Dock, DockIcon } from '@/components/ui/dock'
import { useNavigation } from '@/hooks/useNavigation'
import { icons } from '@/styles/design-system'
import {
    PanelLeft,
    FileText,
    LogOut
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
import { useAuth } from '@/lib/auth-context'

// ===========================================
// Glass Morphism Dock Navigation Component
// ===========================================

export default function DockNavigation() {
    const pathname = usePathname()
    const { favorites, toggleMode } = useNavigation()
    const { logout } = useAuth()

    // Define all possible menu items to map href to icon/label
    const allMenuItems = [
        // Workspace
        { href: '/dashboard', label: '홈', icon: 'dashboard' },
        { href: '/tasks', label: '내 작업', icon: 'tasks' },
        { href: '/files', label: '파일', icon: 'files' },
        { href: '/calendar', label: '캘린더', icon: 'calendar' },
        { href: '/workspace/organization', label: '조직 관리', icon: 'users' },

        // Projects
        { href: '/projects', label: '프로젝트', icon: 'projects' },

        // HR
        { href: '/hr/attendance', label: '근태 관리', icon: 'attendance' },
        { href: '/hr/leave', label: '휴가 관리', icon: 'vacation' },

        // Finance
        { href: '/finance/expenses', label: '지출 결의', icon: 'finance' },
        { href: '/finance/corporate-cards', label: '법인카드', icon: 'card' },

        // Groupware
        { href: '/groupware/board', label: '게시판', icon: 'board' },
        { href: '/chat', label: '메신저', icon: 'chat' },

        // Admin
        { href: '/admin/members', label: '멤버 관리', icon: 'users' },
        { href: '/admin/finance', label: '재무 관리', icon: 'finance' },
        { href: '/admin/marketing', label: '마케팅', icon: 'marketing' },
        { href: '/admin/system', label: '시스템 설정', icon: 'settings' },
        { href: '/admin/logs', label: '활동 로그', icon: 'logs' },
        { href: '/admin/automation', label: '자동화', icon: 'automation' },
    ]

    // Filter items that are in favorites
    const dockItems = allMenuItems.filter(item => favorites.includes(item.href))

    return (
        <div className="fixed bottom-12 left-0 right-0 z-50 flex justify-center pointer-events-none">
            <div className="pointer-events-auto">
                <TooltipProvider>
                    {/* Glass Morphism Dock Container */}
                    <Dock
                        direction="middle"
                        className="bg-white/70 backdrop-blur-2xl border border-white/50 shadow-2xl shadow-black/5 px-4 py-3 gap-3 rounded-[2rem]"
                    >
                        {/* Sidebar Toggle - Glass Style */}
                        <DockIcon onClick={toggleMode}>
                            <Tooltip>
                                <TooltipTrigger asChild>
                                    <div className="w-12 h-12 rounded-2xl bg-white text-slate-400 flex items-center justify-center shadow-lg hover:bg-lime-400 hover:text-black hover:scale-110 transition-all duration-300 cursor-pointer">
                                        <PanelLeft className="w-6 h-6" />
                                    </div>
                                </TooltipTrigger>
                                <TooltipContent className="bg-black text-lime-400 border-0 rounded-xl">
                                    <p>사이드바 모드</p>
                                </TooltipContent>
                            </Tooltip>
                        </DockIcon>

                        <div className="w-px h-10 bg-slate-200 mx-1 self-center" />

                        {/* Favorite Items - Glass Style */}
                        {dockItems.map((item) => {
                            // @ts-ignore - Dynamic icon access
                            const Icon = icons[item.icon] || FileText
                            const isActive = pathname === item.href || pathname?.startsWith(item.href + '/')

                            return (
                                <DockIcon key={item.href}>
                                    <Tooltip>
                                        <TooltipTrigger asChild>
                                            <Link href={item.href}>
                                                <div className={cn(
                                                    "relative w-12 h-12 rounded-2xl flex items-center justify-center shadow-lg transition-all duration-300 origin-bottom",
                                                    isActive
                                                        ? "bg-black text-lime-400 scale-110 shadow-lime-500/20 -translate-y-2"
                                                        : "bg-white text-slate-400 hover:bg-lime-400 hover:text-black hover:scale-110 hover:-translate-y-2 hover:shadow-lime-400/30"
                                                )}>
                                                    <Icon className="w-6 h-6" />
                                                </div>
                                                {/* Active Indicator Dot */}
                                                {isActive && (
                                                    <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-black" />
                                                )}
                                            </Link>
                                        </TooltipTrigger>
                                        <TooltipContent className="bg-black text-lime-400 border-0 rounded-xl">
                                            <p>{item.label}</p>
                                        </TooltipContent>
                                    </Tooltip>
                                </DockIcon>
                            )
                        })}

                        {/* Separator if there are favorites */}
                        {dockItems.length > 0 && (
                            <div className="w-px h-10 bg-slate-200 mx-1 self-center" />
                        )}

                        {/* Logout - Glass Style */}
                        <DockIcon onClick={logout}>
                            <Tooltip>
                                <TooltipTrigger asChild>
                                    <div className="w-12 h-12 rounded-2xl bg-white text-slate-400 flex items-center justify-center shadow-lg hover:bg-red-50 hover:text-red-500 hover:scale-110 transition-all duration-300 cursor-pointer group">
                                        <LogOut className="w-6 h-6" />
                                    </div>
                                </TooltipTrigger>
                                <TooltipContent className="bg-black text-lime-400 border-0 rounded-xl">
                                    <p>로그아웃</p>
                                </TooltipContent>
                            </Tooltip>
                        </DockIcon>
                    </Dock>
                </TooltipProvider>
            </div>
        </div>
    )
}
