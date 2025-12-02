'use client'

import { useState } from 'react'
import {
  UtensilsCrossed,
  Coffee,
  ShoppingBag,
  Scissors,
  Stethoscope,
  GraduationCap,
  Truck,
  Factory,
  Code,
  Users,
  MoreHorizontal,
  Check,
  ChevronRight,
  ChevronLeft
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { BusinessType } from '@prisma/client'

interface BusinessTypeSelectorProps {
  selectedType?: BusinessType
  onSelect: (type: BusinessType) => void
  onNext?: () => void
  onBack?: () => void
}

const businessTypes = [
  {
    type: 'RESTAURANT' as BusinessType,
    title: '음식점',
    icon: UtensilsCrossed,
    color: 'red',
  },
  {
    type: 'CAFE' as BusinessType,
    title: '카페',
    icon: Coffee,
    color: 'amber',
  },
  {
    type: 'RETAIL' as BusinessType,
    title: '소매/편의점',
    icon: ShoppingBag,
    color: 'blue',
  },
  {
    type: 'BEAUTY' as BusinessType,
    title: '미용실/네일샵',
    icon: Scissors,
    color: 'pink',
  },
  {
    type: 'CLINIC' as BusinessType,
    title: '병원/의원',
    icon: Stethoscope,
    color: 'emerald',
  },
  {
    type: 'ACADEMY' as BusinessType,
    title: '학원',
    icon: GraduationCap,
    color: 'violet',
  },
  {
    type: 'LOGISTICS' as BusinessType,
    title: '물류/배송',
    icon: Truck,
    color: 'orange',
  },
  {
    type: 'MANUFACTURING' as BusinessType,
    title: '제조업',
    icon: Factory,
    color: 'slate',
  },
  {
    type: 'IT_SERVICE' as BusinessType,
    title: 'IT/소프트웨어',
    icon: Code,
    color: 'indigo',
  },
  {
    type: 'CONSULTING' as BusinessType,
    title: '컨설팅',
    icon: Users,
    color: 'cyan',
  },
  {
    type: 'OTHER' as BusinessType,
    title: '기타',
    icon: MoreHorizontal,
    color: 'gray',
  },
]

const colorClasses: Record<string, { bg: string; text: string; selected: string }> = {
  red: { bg: 'bg-red-100', text: 'text-red-600', selected: 'bg-red-500 text-white' },
  amber: { bg: 'bg-amber-100', text: 'text-amber-600', selected: 'bg-amber-500 text-white' },
  blue: { bg: 'bg-blue-100', text: 'text-blue-600', selected: 'bg-blue-500 text-white' },
  pink: { bg: 'bg-pink-100', text: 'text-pink-600', selected: 'bg-pink-500 text-white' },
  emerald: { bg: 'bg-emerald-100', text: 'text-emerald-600', selected: 'bg-emerald-500 text-white' },
  violet: { bg: 'bg-violet-100', text: 'text-violet-600', selected: 'bg-violet-500 text-white' },
  orange: { bg: 'bg-orange-100', text: 'text-orange-600', selected: 'bg-orange-500 text-white' },
  slate: { bg: 'bg-slate-100', text: 'text-slate-600', selected: 'bg-slate-500 text-white' },
  indigo: { bg: 'bg-indigo-100', text: 'text-indigo-600', selected: 'bg-indigo-500 text-white' },
  cyan: { bg: 'bg-cyan-100', text: 'text-cyan-600', selected: 'bg-cyan-500 text-white' },
  gray: { bg: 'bg-gray-100', text: 'text-gray-600', selected: 'bg-gray-500 text-white' },
}

export function BusinessTypeSelector({
  selectedType,
  onSelect,
  onNext,
  onBack,
}: BusinessTypeSelectorProps) {
  const [hoveredType, setHoveredType] = useState<BusinessType | null>(null)

  return (
    <div className="w-full max-w-3xl mx-auto">
      {/* Header */}
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold text-slate-900 mb-2">
          업종을 선택해주세요
        </h2>
        <p className="text-slate-500">
          업종에 맞는 근무 정책을 자동으로 설정해드립니다.
        </p>
      </div>

      {/* Business Type Grid */}
      <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-3 mb-8">
        {businessTypes.map((item) => {
          const isSelected = selectedType === item.type
          const isHovered = hoveredType === item.type
          const Icon = item.icon
          const colors = colorClasses[item.color]

          return (
            <button
              key={item.type}
              onClick={() => onSelect(item.type)}
              onMouseEnter={() => setHoveredType(item.type)}
              onMouseLeave={() => setHoveredType(null)}
              className={cn(
                'relative flex flex-col items-center p-4 rounded-2xl border-2 transition-all duration-300',
                'bg-white/70 backdrop-blur-xl',
                isSelected
                  ? 'border-lime-400 shadow-lg shadow-lime-400/20'
                  : 'border-white/40 hover:border-slate-200 hover:shadow-md',
                isHovered && !isSelected && 'bg-white/90'
              )}
            >
              {/* Selected Check */}
              {isSelected && (
                <div className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-lime-400 rounded-full flex items-center justify-center">
                  <Check className="w-3 h-3 text-black" />
                </div>
              )}

              {/* Icon */}
              <div
                className={cn(
                  'w-12 h-12 rounded-xl flex items-center justify-center mb-2 transition-all',
                  isSelected ? colors.selected : `${colors.bg} ${colors.text}`
                )}
              >
                <Icon className="w-6 h-6" />
              </div>

              {/* Title */}
              <span className={cn(
                'text-sm font-medium text-center',
                isSelected ? 'text-slate-900' : 'text-slate-600'
              )}>
                {item.title}
              </span>
            </button>
          )
        })}
      </div>

      {/* Navigation Buttons */}
      <div className="flex justify-between">
        {onBack && (
          <button
            onClick={onBack}
            className={cn(
              'flex items-center gap-2 px-6 py-3 rounded-xl font-medium transition-all duration-300',
              'bg-white/50 border border-white/40 text-slate-600 hover:bg-white/80'
            )}
          >
            <ChevronLeft className="w-5 h-5" />
            이전
          </button>
        )}

        {onNext && selectedType && (
          <button
            onClick={onNext}
            className={cn(
              'flex items-center gap-2 px-8 py-3 rounded-xl font-bold transition-all duration-300 ml-auto',
              'bg-black text-lime-400 hover:bg-slate-900 shadow-lg shadow-black/20'
            )}
          >
            다음 단계
            <ChevronRight className="w-5 h-5" />
          </button>
        )}
      </div>
    </div>
  )
}
