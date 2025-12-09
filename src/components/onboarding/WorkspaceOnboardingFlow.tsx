'use client'
const isDev = process.env.NODE_ENV === 'development'

import { useState } from 'react'
import { WorkspaceType, BusinessType } from '@prisma/client'
import { WorkspaceTypeSelector } from './WorkspaceTypeSelector'
import { BusinessTypeSelector } from './BusinessTypeSelector'
import { HRQuickSetup, QuickSetupSettings } from './HRQuickSetup'
import { cn } from '@/lib/utils'
import {
  Building2,
  Store,
  Briefcase,
  Check,
  Sparkles,
  Users,
  Mail
} from 'lucide-react'

interface WorkspaceOnboardingFlowProps {
  workspaceId: string
  workspaceName: string
  onComplete: (data: OnboardingData) => Promise<void>
}

export interface OnboardingData {
  workspaceType: WorkspaceType
  businessType?: BusinessType
  quickSetupSettings?: QuickSetupSettings
  inviteEmails?: string[]
}

type OnboardingStep = 'type' | 'business' | 'quickSetup' | 'invite' | 'complete'

export function WorkspaceOnboardingFlow({
  workspaceId,
  workspaceName,
  onComplete,
}: WorkspaceOnboardingFlowProps) {
  const [currentStep, setCurrentStep] = useState<OnboardingStep>('type')
  const [data, setData] = useState<Partial<OnboardingData>>({})
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [inviteInput, setInviteInput] = useState('')
  const [inviteEmails, setInviteEmails] = useState<string[]>([])

  const handleTypeSelect = (type: WorkspaceType) => {
    setData({ ...data, workspaceType: type })
  }

  const handleTypeNext = () => {
    if (data.workspaceType === 'HR_ONLY') {
      setCurrentStep('business')
    } else {
      setCurrentStep('invite')
    }
  }

  const handleBusinessSelect = (type: BusinessType) => {
    setData({ ...data, businessType: type })
  }

  const handleBusinessNext = () => {
    setCurrentStep('quickSetup')
  }

  const handleQuickSetupComplete = (settings: QuickSetupSettings) => {
    setData({ ...data, quickSetupSettings: settings })
    setCurrentStep('invite')
  }

  const handleAddEmail = () => {
    const email = inviteInput.trim()
    if (email && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      if (!inviteEmails.includes(email)) {
        setInviteEmails([...inviteEmails, email])
      }
      setInviteInput('')
    }
  }

  const handleRemoveEmail = (email: string) => {
    setInviteEmails(inviteEmails.filter((e) => e !== email))
  }

  const handleComplete = async () => {
    setIsSubmitting(true)
    try {
      await onComplete({
        workspaceType: data.workspaceType!,
        businessType: data.businessType,
        quickSetupSettings: data.quickSetupSettings,
        inviteEmails: inviteEmails.length > 0 ? inviteEmails : undefined,
      })
      setCurrentStep('complete')
    } catch (error) {
      if (isDev) console.error('Onboarding failed:', error)
    } finally {
      setIsSubmitting(false)
    }
  }

  const getStepProgress = (): number => {
    const steps: OnboardingStep[] = data.workspaceType === 'HR_ONLY'
      ? ['type', 'business', 'quickSetup', 'invite', 'complete']
      : ['type', 'invite', 'complete']

    const currentIndex = steps.indexOf(currentStep)
    return ((currentIndex + 1) / steps.length) * 100
  }

  const renderStep = () => {
    switch (currentStep) {
      case 'type':
        return (
          <WorkspaceTypeSelector
            selectedType={data.workspaceType}
            onSelect={handleTypeSelect}
            onNext={data.workspaceType ? handleTypeNext : undefined}
          />
        )

      case 'business':
        return (
          <BusinessTypeSelector
            selectedType={data.businessType}
            onSelect={handleBusinessSelect}
            onNext={data.businessType ? handleBusinessNext : undefined}
            onBack={() => setCurrentStep('type')}
          />
        )

      case 'quickSetup':
        return (
          <HRQuickSetup
            onComplete={handleQuickSetupComplete}
            onBack={() => setCurrentStep('business')}
          />
        )

      case 'invite':
        return (
          <div className="w-full max-w-xl mx-auto">
            {/* Header */}
            <div className="text-center mb-8">
              <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-lime-100 flex items-center justify-center">
                <Users className="w-8 h-8 text-lime-600" />
              </div>
              <h2 className="text-2xl font-bold text-slate-900 mb-2">
                팀원을 초대하세요
              </h2>
              <p className="text-slate-500">
                함께 일할 팀원의 이메일을 입력하세요. 나중에 초대할 수도 있습니다.
              </p>
            </div>

            {/* Email Input */}
            <div className="mb-6">
              <div className="flex gap-2">
                <input
                  type="email"
                  value={inviteInput}
                  onChange={(e) => setInviteInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleAddEmail()}
                  placeholder="이메일 주소 입력"
                  className={cn(
                    'flex-1 h-12 rounded-xl border bg-white/60 border-white/40 px-4',
                    'focus:outline-none focus:ring-2 focus:ring-lime-400/20 focus:border-lime-400'
                  )}
                />
                <button
                  onClick={handleAddEmail}
                  className="px-6 h-12 rounded-xl bg-slate-100 text-slate-700 font-medium hover:bg-slate-200 transition-colors"
                >
                  추가
                </button>
              </div>
            </div>

            {/* Email List */}
            {inviteEmails.length > 0 && (
              <div className="mb-6 p-4 rounded-2xl bg-white/70 backdrop-blur-xl border border-white/40">
                <p className="text-sm font-medium text-slate-500 mb-3">
                  초대할 팀원 ({inviteEmails.length}명)
                </p>
                <div className="space-y-2">
                  {inviteEmails.map((email) => (
                    <div
                      key={email}
                      className="flex items-center justify-between p-2 rounded-lg bg-slate-50"
                    >
                      <div className="flex items-center gap-2">
                        <Mail className="w-4 h-4 text-slate-400" />
                        <span className="text-sm text-slate-700">{email}</span>
                      </div>
                      <button
                        onClick={() => handleRemoveEmail(email)}
                        className="text-slate-400 hover:text-red-500 transition-colors"
                      >
                        ×
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Actions */}
            <div className="flex gap-3">
              <button
                onClick={() => {
                  if (data.workspaceType === 'HR_ONLY') {
                    setCurrentStep('quickSetup')
                  } else {
                    setCurrentStep('type')
                  }
                }}
                className={cn(
                  'flex-1 px-6 py-3 rounded-xl font-medium transition-all duration-300',
                  'bg-white/50 border border-white/40 text-slate-600 hover:bg-white/80'
                )}
              >
                이전
              </button>
              <button
                onClick={handleComplete}
                disabled={isSubmitting}
                className={cn(
                  'flex-1 px-6 py-3 rounded-xl font-bold transition-all duration-300',
                  'bg-black text-lime-400 hover:bg-slate-900 shadow-lg shadow-black/20',
                  isSubmitting && 'opacity-50 cursor-not-allowed'
                )}
              >
                {isSubmitting ? '설정 중...' : inviteEmails.length > 0 ? '완료 및 초대' : '건너뛰고 완료'}
              </button>
            </div>
          </div>
        )

      case 'complete':
        return (
          <div className="w-full max-w-md mx-auto text-center">
            {/* Success Animation */}
            <div className="mb-8">
              <div className="w-24 h-24 mx-auto mb-4 rounded-3xl bg-lime-400 flex items-center justify-center animate-bounce">
                <Sparkles className="w-12 h-12 text-black" />
              </div>
              <h2 className="text-2xl font-bold text-slate-900 mb-2">
                설정 완료! 🎉
              </h2>
              <p className="text-slate-500">
                {workspaceName} 워크스페이스가 준비되었습니다.
              </p>
            </div>

            {/* Summary */}
            <div className="p-6 rounded-2xl bg-white/70 backdrop-blur-xl border border-white/40 text-left mb-8">
              <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-4">
                설정 요약
              </h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-slate-600">워크스페이스 유형</span>
                  <span className="font-semibold text-slate-900 flex items-center gap-2">
                    {data.workspaceType === 'ENTERPRISE' && <Building2 className="w-4 h-4" />}
                    {data.workspaceType === 'HR_ONLY' && <Store className="w-4 h-4" />}
                    {data.workspaceType === 'PROJECT_ONLY' && <Briefcase className="w-4 h-4" />}
                    {data.workspaceType === 'ENTERPRISE' && '엔터프라이즈'}
                    {data.workspaceType === 'HR_ONLY' && 'HR 전용'}
                    {data.workspaceType === 'PROJECT_ONLY' && '프로젝트 전용'}
                  </span>
                </div>
                {data.businessType && (
                  <div className="flex items-center justify-between">
                    <span className="text-slate-600">업종</span>
                    <span className="font-semibold text-slate-900">
                      {data.businessType === 'RESTAURANT' && '음식점'}
                      {data.businessType === 'CAFE' && '카페'}
                      {data.businessType === 'RETAIL' && '소매/편의점'}
                      {data.businessType === 'BEAUTY' && '미용실/네일샵'}
                      {data.businessType === 'CLINIC' && '병원/의원'}
                      {data.businessType === 'ACADEMY' && '학원'}
                      {data.businessType === 'LOGISTICS' && '물류/배송'}
                      {data.businessType === 'MANUFACTURING' && '제조업'}
                      {data.businessType === 'IT_SERVICE' && 'IT/소프트웨어'}
                      {data.businessType === 'CONSULTING' && '컨설팅'}
                      {data.businessType === 'OTHER' && '기타'}
                    </span>
                  </div>
                )}
                {data.quickSetupSettings && (
                  <>
                    <div className="flex items-center justify-between">
                      <span className="text-slate-600">기본 시급</span>
                      <span className="font-semibold text-slate-900">
                        {data.quickSetupSettings.hourlyWage.toLocaleString()}원
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-slate-600">주휴수당</span>
                      <span className="font-semibold text-slate-900">
                        {data.quickSetupSettings.weeklyAllowance ? '자동 계산' : '수동 관리'}
                      </span>
                    </div>
                  </>
                )}
                {inviteEmails.length > 0 && (
                  <div className="flex items-center justify-between">
                    <span className="text-slate-600">초대된 팀원</span>
                    <span className="font-semibold text-slate-900">
                      {inviteEmails.length}명
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* CTA */}
            <button
              onClick={() => window.location.href = '/dashboard'}
              className={cn(
                'w-full px-8 py-4 rounded-xl font-bold transition-all duration-300',
                'bg-black text-lime-400 hover:bg-slate-900 shadow-lg shadow-black/20'
              )}
            >
              대시보드로 이동
            </button>
          </div>
        )

      default:
        return null
    }
  }

  return (
    <div className="min-h-screen bg-[#F8F9FA] relative overflow-hidden">
      {/* Ambient Background */}
      <div className="absolute top-[-20%] left-[-10%] w-[500px] h-[500px] bg-lime-200/40 rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute bottom-[-20%] right-[-10%] w-[600px] h-[600px] bg-emerald-100/40 rounded-full blur-[120px] pointer-events-none" />

      {/* Progress Bar */}
      {currentStep !== 'complete' && (
        <div className="fixed top-0 left-0 right-0 h-1 bg-slate-200 z-50">
          <div
            className="h-full bg-lime-400 transition-all duration-500"
            style={{ width: `${getStepProgress()}%` }}
          />
        </div>
      )}

      {/* Content */}
      <div className="relative z-10 flex flex-col items-center justify-center min-h-screen p-8">
        {/* Logo/Brand */}
        {currentStep !== 'complete' && (
          <div className="mb-8">
            <h1 className="text-xl font-bold">
              <span className="text-black">Work</span>
              <span className="text-lime-500">B</span>
            </h1>
          </div>
        )}

        {/* Step Content */}
        {renderStep()}
      </div>
    </div>
  )
}
