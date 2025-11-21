'use client'

import React from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useAuth } from '@/lib/auth-context'
import { icons } from '@/styles/design-system'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { ScrollArea } from '@/components/ui/scroll-area'
import { ChevronDown, ChevronRight, LogOut, Menu, X } from 'lucide-react'

interface MenuItem {
  href: string
  label: string
  icon: keyof typeof icons
  roles?: string[]
}

interface MenuGroup {
  id: string
  label: string
  icon: keyof typeof icons
  items: MenuItem[]
  roles?: string[]
}

// 권한별 메뉴 구조 정의
const getMenuGroups = (role: string): MenuGroup[] => {
  // 관리자 메뉴
  const adminMenus: MenuGroup[] = [
    {
      id: 'overview',
      label: '개요',
      icon: 'dashboard',
      items: [
        { href: '/dashboard', label: '대시보드', icon: 'dashboard' },
        { href: '/analytics', label: '통계 분석', icon: 'analytics' },
      ]
    },
    {
      id: 'project-management',
      label: '프로젝트 관리',
      icon: 'projects',
      items: [
        { href: '/projects', label: '전체 프로젝트', icon: 'projects' },
        { href: '/gantt', label: '전체 간트차트', icon: 'gantt' },
        { href: '/kanban', label: '전체 칸반보드', icon: 'tasks' },
        { href: '/tasks', label: '작업 관리', icon: 'tasks' },
      ]
    },
    {
      id: 'user-management',
      label: '사용자 관리',
      icon: 'users',
      items: [
        { href: '/users', label: '전체 사용자', icon: 'users' },
        { href: '/users/employees', label: '직원 관리', icon: 'operators' },
        { href: '/users/clients', label: '거래처 관리', icon: 'clients' },
        { href: '/invitations', label: '초대 관리', icon: 'mail' },
      ]
    },
    {
      id: 'business',
      label: '비즈니스',
      icon: 'finance',
      items: [
        { href: '/finance', label: '재무 관리', icon: 'finance' },
        { href: '/marketing', label: '마케팅', icon: 'marketing' },
        { href: '/contracts', label: '계약 관리', icon: 'file' },
      ]
    },
    {
      id: 'system',
      label: '시스템',
      icon: 'settings',
      items: [
        { href: '/settings', label: '시스템 설정', icon: 'settings' },
        { href: '/logs', label: '활동 로그', icon: 'logs' },
        { href: '/automation', label: '자동화 규칙', icon: 'automation' },
      ]
    }
  ]

  // 직원 메뉴
  const employeeMenus: MenuGroup[] = [
    {
      id: 'overview',
      label: '개요',
      icon: 'dashboard',
      items: [
        { href: '/dashboard', label: '내 대시보드', icon: 'dashboard' },
        { href: '/projects', label: '내 프로젝트', icon: 'projects' },
      ]
    },
    {
      id: 'work',
      label: '업무',
      icon: 'tasks',
      items: [
        { href: '/tasks', label: '내 작업', icon: 'tasks' },
        { href: '/calendar', label: '일정 관리', icon: 'calendar' },
        { href: '/files', label: '파일 관리', icon: 'files' },
      ]
    },
    {
      id: 'collaboration',
      label: '협업',
      icon: 'chat',
      items: [
        { href: '/chat', label: '팀 채팅', icon: 'chat' },
        { href: '/meetings', label: '회의', icon: 'video' },
        { href: '/ai', label: 'AI 어시스턴트', icon: 'ai' },
      ]
    }
  ]

  // 상담 직원 메뉴
  const supportMenus: MenuGroup[] = [
    {
      id: 'overview',
      label: '개요',
      icon: 'dashboard',
      items: [
        { href: '/dashboard', label: '상담 대시보드', icon: 'dashboard' },
        { href: '/tickets', label: '상담 티켓', icon: 'support' },
      ]
    },
    {
      id: 'customer-support',
      label: '고객 지원',
      icon: 'support',
      items: [
        { href: '/support/chat', label: '실시간 상담', icon: 'chat' },
        { href: '/support/history', label: '상담 이력', icon: 'history' },
        { href: '/clients', label: '고객 정보', icon: 'clients' },
      ]
    },
    {
      id: 'knowledge',
      label: '지식 베이스',
      icon: 'book',
      items: [
        { href: '/faq', label: 'FAQ 관리', icon: 'help' },
        { href: '/guides', label: '가이드 문서', icon: 'file' },
      ]
    }
  ]

  // 거래처(클라이언트) 메뉴
  const clientMenus: MenuGroup[] = [
    {
      id: 'overview',
      label: '개요',
      icon: 'dashboard',
      items: [
        { href: '/dashboard', label: '프로젝트 현황', icon: 'dashboard' },
        { href: '/projects', label: '내 프로젝트', icon: 'projects' },
      ]
    },
    {
      id: 'project-detail',
      label: '프로젝트 상세',
      icon: 'status',
      items: [
        { href: '/progress', label: '진행 상황', icon: 'status' },
        { href: '/deliverables', label: '산출물', icon: 'files' },
        { href: '/invoices', label: '청구서', icon: 'finance' },
      ]
    },
    {
      id: 'communication',
      label: '커뮤니케이션',
      icon: 'chat',
      items: [
        { href: '/messages', label: '메시지', icon: 'mail' },
        { href: '/support', label: '문의하기', icon: 'support' },
        { href: '/review', label: '리뷰 작성', icon: 'review' },
      ]
    }
  ]

  // 역할별 메뉴 반환
  switch (role) {
    case 'admin':
      return adminMenus
    case 'employee':
      return employeeMenus
    case 'support':
      return supportMenus
    case 'client':
      return clientMenus
    default:
      return clientMenus // 기본값
  }
}

export default function Sidebar() {
  const pathname = usePathname()
  const { userProfile, logout } = useAuth()
  const [isOpen, setIsOpen] = React.useState(false)
  const [expandedGroups, setExpandedGroups] = React.useState<string[]>(['overview'])

  // 사용자 역할에 따른 메뉴 가져오기
  const menuGroups = React.useMemo(() => {
    return getMenuGroups(userProfile?.role || 'client')
  }, [userProfile?.role])

  // 그룹 토글
  const toggleGroup = (groupId: string) => {
    setExpandedGroups(prev => 
      prev.includes(groupId) 
        ? prev.filter(id => id !== groupId)
        : [...prev, groupId]
    )
  }

  // 현재 경로가 그룹에 속하는지 확인
  const isGroupActive = (group: MenuGroup) => {
    return group.items.some(item => pathname === item.href)
  }

  // 아이콘 컴포넌트 가져오기
  const getIcon = (iconName: keyof typeof icons) => {
    const IconComponent = icons[iconName]
    return IconComponent ? <IconComponent className="h-5 w-5" /> : null
  }

  return (
    <>
      {/* 모바일 메뉴 버튼 */}
      <Button
        variant="ghost"
        size="icon"
        onClick={() => setIsOpen(!isOpen)}
        className="lg:hidden fixed top-4 left-4 z-50 bg-background border"
      >
        {isOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
      </Button>

      {/* 모바일 오버레이 */}
      {isOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-background/80 backdrop-blur-sm z-40"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* 사이드바 */}
      <aside className={cn(
        "fixed left-0 top-0 h-full bg-background border-r flex flex-col z-40",
        "transition-transform duration-300 ease-in-out",
        "w-[280px] lg:w-[var(--sidebar-width)]",
        isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
      )}>
        <div className="p-6 border-b">
          <h1 className="text-2xl font-bold bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
            CodeB Platform
          </h1>
        </div>
      
        <ScrollArea className="flex-1 px-4 py-6">
          <div className="space-y-6">
            {menuGroups.map((group) => {
              const isExpanded = expandedGroups.includes(group.id)
              const isActive = isGroupActive(group)
              const GroupIcon = icons[group.icon]

              return (
                <div key={group.id}>
                  {/* 그룹 헤더 */}
                  <button
                    onClick={() => toggleGroup(group.id)}
                    className={cn(
                      "w-full flex items-center justify-between px-3 py-2 rounded-lg",
                      "text-sm font-medium transition-all duration-200",
                      "hover:bg-accent hover:text-accent-foreground",
                      isActive && "bg-accent/50 text-accent-foreground"
                    )}
                  >
                    <div className="flex items-center gap-3">
                      {GroupIcon && <GroupIcon className="h-4 w-4" />}
                      <span>{group.label}</span>
                    </div>
                    {isExpanded ? (
                      <ChevronDown className="h-4 w-4" />
                    ) : (
                      <ChevronRight className="h-4 w-4" />
                    )}
                  </button>

                  {/* 그룹 아이템 */}
                  {isExpanded && (
                    <div className="mt-2 space-y-1 pl-4">
                      {group.items.map((item) => {
                        const isItemActive = pathname === item.href
                        const ItemIcon = icons[item.icon]
                        
                        return (
                          <Link
                            key={item.href}
                            href={item.href as any}
                            className={cn(
                              "flex items-center gap-3 px-3 py-2 rounded-lg",
                              "text-sm transition-all duration-200",
                              "hover:bg-accent hover:text-accent-foreground",
                              isItemActive && "bg-primary text-primary-foreground font-medium"
                            )}
                          >
                            {ItemIcon && <ItemIcon className="h-4 w-4" />}
                            <span>{item.label}</span>
                          </Link>
                        )
                      })}
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        </ScrollArea>

        <div className="p-4 border-t">
          <div className="flex items-center gap-3 mb-3">
            <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
              <span className="text-sm font-medium">
                {userProfile?.displayName?.charAt(0)?.toUpperCase() || 'U'}
              </span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-medium text-sm truncate">{userProfile?.displayName}</p>
              <p className="text-xs text-muted-foreground">
                {userProfile?.role === 'admin' ? '관리자' : 
                 userProfile?.role === 'developer' ? '개발자' :
                 userProfile?.role === 'manager' ? '매니저' :
                 userProfile?.role === 'external' ? '상담원' :
                 userProfile?.role === 'customer' ? '고객' : '사용자'}
              </p>
            </div>
          </div>
          
          <Button
            variant="outline"
            size="sm"
            className="w-full"
            onClick={async () => {
              try {
                await logout()
              } catch (error) {
                console.error('로그아웃 실패:', error)
              }
            }}
          >
            <LogOut className="mr-2 h-4 w-4" />
            로그아웃
          </Button>
        </div>
      </aside>
    </>
  )
}