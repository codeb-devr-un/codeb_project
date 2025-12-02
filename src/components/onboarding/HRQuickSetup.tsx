'use client'

import { useState } from 'react'
import {
  Clock,
  CalendarClock,
  DollarSign,
  Gift,
  Check,
  ChevronRight,
  ChevronLeft,
  Info
} from 'lucide-react'
import { cn } from '@/lib/utils'

interface HRQuickSetupProps {
  onComplete: (settings: QuickSetupSettings) => void
  onBack?: () => void
}

export interface QuickSetupSettings {
  workPattern: 'FIXED' | 'FLEXIBLE' | 'SHIFT'
  payrollType: 'MONTHLY' | 'HOURLY'
  hourlyWage: number
  weeklyAllowance: boolean
}

const MINIMUM_WAGE_2025 = 10030 // 2025년 최저시급

const steps = [
  {
    id: 'workPattern',
    title: '근무 형태',
    description: '직원들의 주요 근무 형태를 선택하세요',
    icon: Clock,
  },
  {
    id: 'payrollType',
    title: '급여 유형',
    description: '급여 지급 방식을 선택하세요',
    icon: DollarSign,
  },
  {
    id: 'hourlyWage',
    title: '시급 설정',
    description: '기본 시급을 설정하세요',
    icon: CalendarClock,
  },
  {
    id: 'weeklyAllowance',
    title: '주휴수당',
    description: '주휴수당 자동 계산을 설정하세요',
    icon: Gift,
  },
]

export function HRQuickSetup({ onComplete, onBack }: HRQuickSetupProps) {
  const [currentStep, setCurrentStep] = useState(0)
  const [settings, setSettings] = useState<QuickSetupSettings>({
    workPattern: 'FIXED',
    payrollType: 'HOURLY',
    hourlyWage: MINIMUM_WAGE_2025,
    weeklyAllowance: true,
  })

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1)
    } else {
      onComplete(settings)
    }
  }

  const handlePrev = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1)
    } else if (onBack) {
      onBack()
    }
  }

  const renderStepContent = () => {
    switch (currentStep) {
      case 0:
        return (
          <div className="space-y-3">
            {[
              { value: 'FIXED', label: '고정 근무', desc: '정해진 시간에 출퇴근 (예: 09:00-18:00)' },
              { value: 'FLEXIBLE', label: '유연 근무', desc: '총 근무시간만 채우면 됨' },
              { value: 'SHIFT', label: '교대 근무', desc: '오픈/미들/마감 등 시프트제' },
            ].map((option) => (
              <button
                key={option.value}
                onClick={() => setSettings({ ...settings, workPattern: option.value as any })}
                className={cn(
                  'w-full p-4 rounded-2xl border-2 text-left transition-all duration-300',
                  'bg-white/70 backdrop-blur-xl',
                  settings.workPattern === option.value
                    ? 'border-lime-400 shadow-lg shadow-lime-400/20'
                    : 'border-white/40 hover:border-slate-200'
                )}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-semibold text-slate-900">{option.label}</p>
                    <p className="text-sm text-slate-500">{option.desc}</p>
                  </div>
                  {settings.workPattern === option.value && (
                    <div className="w-6 h-6 bg-lime-400 rounded-full flex items-center justify-center">
                      <Check className="w-4 h-4 text-black" />
                    </div>
                  )}
                </div>
              </button>
            ))}
          </div>
        )

      case 1:
        return (
          <div className="space-y-3">
            {[
              { value: 'MONTHLY', label: '월급제', desc: '매월 정해진 급여 지급' },
              { value: 'HOURLY', label: '시급제', desc: '근무 시간에 따른 급여 계산', recommended: true },
            ].map((option) => (
              <button
                key={option.value}
                onClick={() => setSettings({ ...settings, payrollType: option.value as any })}
                className={cn(
                  'w-full p-4 rounded-2xl border-2 text-left transition-all duration-300 relative',
                  'bg-white/70 backdrop-blur-xl',
                  settings.payrollType === option.value
                    ? 'border-lime-400 shadow-lg shadow-lime-400/20'
                    : 'border-white/40 hover:border-slate-200'
                )}
              >
                {option.recommended && (
                  <span className="absolute -top-2 right-4 px-2 py-0.5 bg-orange-400 text-white text-xs font-bold rounded-full">
                    소상공인 추천
                  </span>
                )}
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-semibold text-slate-900">{option.label}</p>
                    <p className="text-sm text-slate-500">{option.desc}</p>
                  </div>
                  {settings.payrollType === option.value && (
                    <div className="w-6 h-6 bg-lime-400 rounded-full flex items-center justify-center">
                      <Check className="w-4 h-4 text-black" />
                    </div>
                  )}
                </div>
              </button>
            ))}
          </div>
        )

      case 2:
        return (
          <div className="space-y-4">
            {/* Minimum Wage Info */}
            <div className="p-4 rounded-2xl bg-lime-50 border border-lime-200">
              <div className="flex items-start gap-3">
                <Info className="w-5 h-5 text-lime-600 mt-0.5" />
                <div>
                  <p className="font-medium text-lime-900">2025년 최저시급</p>
                  <p className="text-2xl font-bold text-lime-600">
                    {MINIMUM_WAGE_2025.toLocaleString()}원
                  </p>
                </div>
              </div>
            </div>

            {/* Hourly Wage Input */}
            <div className="p-4 rounded-2xl bg-white/70 backdrop-blur-xl border border-white/40">
              <label className="block text-sm font-medium text-slate-700 mb-2">
                기본 시급 설정
              </label>
              <div className="relative">
                <input
                  type="number"
                  value={settings.hourlyWage}
                  onChange={(e) => setSettings({ ...settings, hourlyWage: parseInt(e.target.value) || 0 })}
                  min={MINIMUM_WAGE_2025}
                  className={cn(
                    'w-full h-12 rounded-xl border bg-white/60 border-white/40 px-4 text-lg font-semibold',
                    'focus:outline-none focus:ring-2 focus:ring-lime-400/20 focus:border-lime-400',
                    settings.hourlyWage < MINIMUM_WAGE_2025 && 'border-red-300 focus:border-red-400 focus:ring-red-400/20'
                  )}
                />
                <span className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500">원</span>
              </div>
              {settings.hourlyWage < MINIMUM_WAGE_2025 && (
                <p className="mt-2 text-sm text-red-500">
                  ⚠️ 최저시급 미만은 설정할 수 없습니다
                </p>
              )}
            </div>

            {/* Quick Presets */}
            <div className="flex flex-wrap gap-2">
              {[10030, 11000, 12000, 15000].map((wage) => (
                <button
                  key={wage}
                  onClick={() => setSettings({ ...settings, hourlyWage: wage })}
                  className={cn(
                    'px-4 py-2 rounded-xl text-sm font-medium transition-all',
                    settings.hourlyWage === wage
                      ? 'bg-lime-400 text-black'
                      : 'bg-white/60 text-slate-600 hover:bg-white/80'
                  )}
                >
                  {wage.toLocaleString()}원
                </button>
              ))}
            </div>
          </div>
        )

      case 3:
        return (
          <div className="space-y-4">
            {/* Weekly Allowance Explanation */}
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200">
              <div className="flex items-start gap-3">
                <Info className="w-5 h-5 text-slate-600 mt-0.5" />
                <div>
                  <p className="font-medium text-slate-900">주휴수당이란?</p>
                  <p className="text-sm text-slate-600 mt-1">
                    1주일에 15시간 이상 근무한 직원에게 1일분의 유급휴일 수당을 추가로 지급하는 것입니다.
                    법적으로 의무 지급해야 합니다.
                  </p>
                </div>
              </div>
            </div>

            {/* Toggle Options */}
            <div className="space-y-3">
              {[
                { value: true, label: '자동 계산', desc: '주 15시간 이상 근무 시 자동 계산됩니다' },
                { value: false, label: '수동 관리', desc: '직접 계산하여 입력합니다' },
              ].map((option) => (
                <button
                  key={String(option.value)}
                  onClick={() => setSettings({ ...settings, weeklyAllowance: option.value })}
                  className={cn(
                    'w-full p-4 rounded-2xl border-2 text-left transition-all duration-300',
                    'bg-white/70 backdrop-blur-xl',
                    settings.weeklyAllowance === option.value
                      ? 'border-lime-400 shadow-lg shadow-lime-400/20'
                      : 'border-white/40 hover:border-slate-200'
                  )}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-semibold text-slate-900">{option.label}</p>
                      <p className="text-sm text-slate-500">{option.desc}</p>
                    </div>
                    {settings.weeklyAllowance === option.value && (
                      <div className="w-6 h-6 bg-lime-400 rounded-full flex items-center justify-center">
                        <Check className="w-4 h-4 text-black" />
                      </div>
                    )}
                  </div>
                </button>
              ))}
            </div>

            {/* Calculation Preview */}
            {settings.weeklyAllowance && (
              <div className="p-4 rounded-2xl bg-lime-50 border border-lime-200">
                <p className="text-sm font-medium text-lime-900 mb-2">계산 예시 (주 20시간 근무)</p>
                <div className="space-y-1 text-sm text-lime-800">
                  <p>기본급: {settings.hourlyWage.toLocaleString()}원 × 20시간 = {(settings.hourlyWage * 20).toLocaleString()}원</p>
                  <p>주휴수당: {settings.hourlyWage.toLocaleString()}원 × 4시간 = {(settings.hourlyWage * 4).toLocaleString()}원</p>
                  <p className="font-bold pt-1 border-t border-lime-300">
                    합계: {((settings.hourlyWage * 20) + (settings.hourlyWage * 4)).toLocaleString()}원
                  </p>
                </div>
              </div>
            )}
          </div>
        )

      default:
        return null
    }
  }

  const canProceed = () => {
    if (currentStep === 2) {
      return settings.hourlyWage >= MINIMUM_WAGE_2025
    }
    return true
  }

  return (
    <div className="w-full max-w-xl mx-auto">
      {/* Progress Steps */}
      <div className="flex items-center justify-center gap-2 mb-8">
        {steps.map((step, idx) => {
          const Icon = step.icon
          const isActive = idx === currentStep
          const isCompleted = idx < currentStep

          return (
            <div key={step.id} className="flex items-center">
              <div
                className={cn(
                  'w-10 h-10 rounded-xl flex items-center justify-center transition-all',
                  isActive
                    ? 'bg-lime-400 text-black'
                    : isCompleted
                    ? 'bg-lime-100 text-lime-600'
                    : 'bg-slate-100 text-slate-400'
                )}
              >
                {isCompleted ? (
                  <Check className="w-5 h-5" />
                ) : (
                  <Icon className="w-5 h-5" />
                )}
              </div>
              {idx < steps.length - 1 && (
                <div
                  className={cn(
                    'w-8 h-0.5 mx-1',
                    isCompleted ? 'bg-lime-400' : 'bg-slate-200'
                  )}
                />
              )}
            </div>
          )
        })}
      </div>

      {/* Step Header */}
      <div className="text-center mb-6">
        <h2 className="text-xl font-bold text-slate-900 mb-1">
          {steps[currentStep].title}
        </h2>
        <p className="text-slate-500">
          {steps[currentStep].description}
        </p>
      </div>

      {/* Step Content */}
      <div className="mb-8">
        {renderStepContent()}
      </div>

      {/* Navigation */}
      <div className="flex justify-between">
        <button
          onClick={handlePrev}
          className={cn(
            'flex items-center gap-2 px-6 py-3 rounded-xl font-medium transition-all duration-300',
            'bg-white/50 border border-white/40 text-slate-600 hover:bg-white/80'
          )}
        >
          <ChevronLeft className="w-5 h-5" />
          이전
        </button>

        <button
          onClick={handleNext}
          disabled={!canProceed()}
          className={cn(
            'flex items-center gap-2 px-8 py-3 rounded-xl font-bold transition-all duration-300',
            canProceed()
              ? 'bg-black text-lime-400 hover:bg-slate-900 shadow-lg shadow-black/20'
              : 'bg-slate-200 text-slate-400 cursor-not-allowed'
          )}
        >
          {currentStep === steps.length - 1 ? '설정 완료' : '다음'}
          <ChevronRight className="w-5 h-5" />
        </button>
      </div>
    </div>
  )
}
