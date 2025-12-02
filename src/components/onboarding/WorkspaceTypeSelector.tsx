'use client'

import { useState } from 'react'
import {
  Building2,
  Store,
  Briefcase,
  Check,
  ChevronRight,
  Users,
  Clock,
  DollarSign,
  Kanban,
  GanttChart,
  CalendarCheck,
  FileText
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { WorkspaceType } from '@prisma/client'

interface WorkspaceTypeSelectorProps {
  selectedType?: WorkspaceType
  onSelect: (type: WorkspaceType) => void
  onNext?: () => void
}

const workspaceTypes = [
  {
    type: 'ENTERPRISE' as WorkspaceType,
    title: '엔터프라이즈',
    subtitle: '프로젝트 + HR + 급여',
    description: '프로젝트 관리와 HR/급여 시스템을 모두 사용하는 기업을 위한 풀패키지',
    icon: Building2,
    color: 'lime',
    features: [
      { icon: Kanban, label: '칸반/간트 보드' },
      { icon: Users, label: '직원 관리' },
      { icon: Clock, label: '근태 관리' },
      { icon: DollarSign, label: '급여 계산' },
    ],
    recommended: true,
  },
  {
    type: 'HR_ONLY' as WorkspaceType,
    title: 'HR 전용',
    subtitle: '근태 + 급여 관리',
    description: '소상공인, 자영업자를 위한 간편한 직원/알바 근태 및 급여 관리',
    icon: Store,
    color: 'orange',
    features: [
      { icon: CalendarCheck, label: '출퇴근 기록' },
      { icon: Clock, label: '시간제 근무' },
      { icon: DollarSign, label: '시급 계산' },
      { icon: FileText, label: '급여명세서' },
    ],
    recommended: false,
    badge: '소상공인 추천',
  },
  {
    type: 'PROJECT_ONLY' as WorkspaceType,
    title: '프로젝트 전용',
    subtitle: '프로젝트 관리만',
    description: '프리랜서, 에이전시를 위한 프로젝트 협업 도구',
    icon: Briefcase,
    color: 'sky',
    features: [
      { icon: Kanban, label: '칸반 보드' },
      { icon: GanttChart, label: '간트 차트' },
      { icon: Users, label: '팀 협업' },
      { icon: FileText, label: '파일 관리' },
    ],
    recommended: false,
  },
]

export function WorkspaceTypeSelector({
  selectedType,
  onSelect,
  onNext,
}: WorkspaceTypeSelectorProps) {
  const [hoveredType, setHoveredType] = useState<WorkspaceType | null>(null)

  return (
    <div className="w-full max-w-4xl mx-auto">
      {/* Header */}
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold text-slate-900 mb-2">
          워크스페이스 유형 선택
        </h2>
        <p className="text-slate-500">
          비즈니스에 맞는 워크스페이스를 선택하세요. 나중에 변경할 수 있습니다.
        </p>
      </div>

      {/* Type Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        {workspaceTypes.map((item) => {
          const isSelected = selectedType === item.type
          const isHovered = hoveredType === item.type
          const Icon = item.icon

          return (
            <button
              key={item.type}
              onClick={() => onSelect(item.type)}
              onMouseEnter={() => setHoveredType(item.type)}
              onMouseLeave={() => setHoveredType(null)}
              className={cn(
                'relative p-6 rounded-3xl border-2 text-left transition-all duration-300',
                'bg-white/70 backdrop-blur-xl',
                isSelected
                  ? 'border-lime-400 shadow-xl shadow-lime-400/20'
                  : 'border-white/40 hover:border-slate-200 hover:shadow-lg',
                isHovered && !isSelected && 'bg-white/90'
              )}
            >
              {/* Recommended Badge */}
              {item.recommended && (
                <span className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 bg-lime-400 text-black text-xs font-bold rounded-full">
                  추천
                </span>
              )}

              {/* Badge */}
              {item.badge && !item.recommended && (
                <span className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 bg-orange-400 text-white text-xs font-bold rounded-full whitespace-nowrap">
                  {item.badge}
                </span>
              )}

              {/* Selected Check */}
              {isSelected && (
                <div className="absolute top-4 right-4 w-6 h-6 bg-lime-400 rounded-full flex items-center justify-center">
                  <Check className="w-4 h-4 text-black" />
                </div>
              )}

              {/* Icon */}
              <div
                className={cn(
                  'w-14 h-14 rounded-2xl flex items-center justify-center mb-4 transition-all',
                  isSelected
                    ? 'bg-black text-lime-400'
                    : item.color === 'lime'
                    ? 'bg-lime-100 text-lime-600'
                    : item.color === 'orange'
                    ? 'bg-orange-100 text-orange-600'
                    : 'bg-sky-100 text-sky-600'
                )}
              >
                <Icon className="w-7 h-7" />
              </div>

              {/* Title & Description */}
              <h3 className="text-lg font-bold text-slate-900 mb-1">
                {item.title}
              </h3>
              <p className="text-sm font-medium text-lime-600 mb-2">
                {item.subtitle}
              </p>
              <p className="text-sm text-slate-500 mb-4">
                {item.description}
              </p>

              {/* Features */}
              <div className="space-y-2">
                {item.features.map((feature, idx) => {
                  const FeatureIcon = feature.icon
                  return (
                    <div
                      key={idx}
                      className="flex items-center gap-2 text-sm text-slate-600"
                    >
                      <FeatureIcon className="w-4 h-4 text-slate-400" />
                      <span>{feature.label}</span>
                    </div>
                  )
                })}
              </div>
            </button>
          )
        })}
      </div>

      {/* Next Button */}
      {onNext && selectedType && (
        <div className="flex justify-center">
          <button
            onClick={onNext}
            className={cn(
              'flex items-center gap-2 px-8 py-3 rounded-xl font-bold transition-all duration-300',
              'bg-black text-lime-400 hover:bg-slate-900 shadow-lg shadow-black/20'
            )}
          >
            다음 단계
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      )}
    </div>
  )
}
