import React from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Check, ChevronLeft, ChevronRight, Globe, Clock, Home, MapPin, Wifi, Users, Building2, Info, CalendarDays, Shield, Sliders, AlertTriangle, Timer } from 'lucide-react'
import { HRSystemSettings, QuickSetupConfig, WorkType } from '@/types/hr'
import { ToggleSwitch } from './SharedComponents'

interface QuickSetupWizardProps {
    settings: HRSystemSettings
    quickStep: number
    setQuickStep: (step: number) => void
    quickSteps: { step: number; title: string; description: string }[]
    handleQuickSetupChange: (field: keyof QuickSetupConfig, value: any) => void
    handleSettingChange: (path: string, value: any) => void
}

export function QuickSetupWizard({
    settings,
    quickStep,
    setQuickStep,
    quickSteps,
    handleQuickSetupChange,
    handleSettingChange
}: QuickSetupWizardProps) {
    const quickSetup = settings.quickSetup!

    return (
        <Card className="bg-white/60 backdrop-blur-xl border-white/40 rounded-3xl">
            <CardContent className="p-6">
                {/* 진행 단계 표시 */}
                <div className="flex items-center justify-between mb-8">
                    {quickSteps.map((step, idx) => (
                        <div key={step.step} className="flex items-center">
                            <button
                                onClick={() => setQuickStep(step.step)}
                                className={`flex flex-col items-center ${quickStep === step.step ? 'opacity-100' : 'opacity-50'
                                    }`}
                            >
                                <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold ${quickStep > step.step
                                        ? 'bg-lime-400 text-black'
                                        : quickStep === step.step
                                            ? 'bg-black text-lime-400'
                                            : 'bg-slate-200 text-slate-500'
                                    }`}>
                                    {quickStep > step.step ? <Check className="w-5 h-5" /> : step.step}
                                </div>
                                <span className="text-xs mt-1 text-slate-600">{step.title}</span>
                            </button>
                            {idx < quickSteps.length - 1 && (
                                <div className={`w-12 h-0.5 mx-2 ${quickStep > step.step ? 'bg-lime-400' : 'bg-slate-200'
                                    }`} />
                            )}
                        </div>
                    ))}
                </div>

                {/* 단계별 콘텐츠 */}
                <div className="min-h-[300px]">
                    {quickStep === 1 && (
                        <QuickStep1Country
                            value={quickSetup.country}
                            onChange={(v) => handleQuickSetupChange('country', v)}
                        />
                    )}
                    {quickStep === 2 && (
                        <QuickStep2WorkType
                            value={quickSetup.workType}
                            onChange={(v) => {
                                handleQuickSetupChange('workType', v)
                                handleSettingChange('workSettings.workSchedule.type', v)
                            }}
                        />
                    )}
                    {quickStep === 3 && (
                        <QuickStep3Remote
                            remoteEnabled={quickSetup.remoteWorkEnabled}
                            gpsEnabled={quickSetup.gpsVerification}
                            wifiEnabled={quickSetup.wifiVerification}
                            onRemoteChange={(v) => handleQuickSetupChange('remoteWorkEnabled', v)}
                            onGpsChange={(v) => {
                                handleQuickSetupChange('gpsVerification', v)
                                handleSettingChange('workSettings.verification.gpsEnabled', v)
                            }}
                            onWifiChange={(v) => {
                                handleQuickSetupChange('wifiVerification', v)
                                handleSettingChange('workSettings.verification.wifiEnabled', v)
                            }}
                        />
                    )}
                    {quickStep === 4 && (
                        <QuickStep4Hourly
                            value={quickSetup.hourlyWorkerEnabled}
                            onChange={(v) => handleQuickSetupChange('hourlyWorkerEnabled', v)}
                        />
                    )}
                    {quickStep === 5 && (
                        <QuickStep5Leave
                            value={quickSetup.leavePolicy}
                            onChange={(v) => {
                                handleQuickSetupChange('leavePolicy', v)
                                handleSettingChange('leavePolicy.annualLeave.type', v)
                            }}
                        />
                    )}
                    {quickStep === 6 && (
                        <QuickStep6Summary settings={settings} />
                    )}
                </div>

                {/* 네비게이션 버튼 */}
                <div className="flex justify-between mt-6">
                    <Button
                        variant="outline"
                        onClick={() => setQuickStep(Math.max(1, quickStep - 1))}
                        disabled={quickStep === 1}
                        className="border-slate-200"
                    >
                        <ChevronLeft className="w-4 h-4 mr-1" />
                        이전
                    </Button>
                    <Button
                        onClick={() => setQuickStep(Math.min(6, quickStep + 1))}
                        disabled={quickStep === 6}
                        className="bg-black text-lime-400 hover:bg-black/90"
                    >
                        다음
                        <ChevronRight className="w-4 h-4 ml-1" />
                    </Button>
                </div>
            </CardContent>
        </Card>
    )
}

// 퀵설정 Step 1: 국가 선택
function QuickStep1Country({ value, onChange }: { value: string; onChange: (v: any) => void }) {
    const countries = [
        { code: 'KR', name: '대한민국', flag: '🇰🇷', desc: '2025 한국 근로기준법 적용' },
        { code: 'US', name: '미국', flag: '🇺🇸', desc: 'Fair Labor Standards Act 적용' },
        { code: 'JP', name: '일본', flag: '🇯🇵', desc: '일본 노동기준법 적용' },
        { code: 'OTHER', name: '기타', flag: '🌍', desc: '직접 설정' }
    ]

    return (
        <div className="space-y-4">
            <div className="flex items-center gap-2 mb-4">
                <Globe className="w-5 h-5 text-lime-600" />
                <h3 className="text-lg font-semibold">국가 선택</h3>
            </div>
            <p className="text-slate-500 mb-6">
                선택한 국가의 근로기준법이 기본값으로 적용됩니다.
            </p>
            <div className="grid grid-cols-2 gap-4">
                {countries.map(country => (
                    <button
                        key={country.code}
                        onClick={() => onChange(country.code)}
                        className={`p-4 rounded-2xl border-2 text-left transition-all ${value === country.code
                                ? 'border-lime-400 bg-lime-50'
                                : 'border-slate-200 hover:border-slate-300'
                            }`}
                    >
                        <div className="text-3xl mb-2">{country.flag}</div>
                        <div className="font-semibold text-slate-900">{country.name}</div>
                        <div className="text-sm text-slate-500">{country.desc}</div>
                    </button>
                ))}
            </div>
        </div>
    )
}

// 퀵설정 Step 2: 근무형태
function QuickStep2WorkType({ value, onChange }: { value: WorkType; onChange: (v: WorkType) => void }) {
    const workTypes = [
        { type: 'FIXED' as WorkType, name: '고정 근로', icon: Clock, desc: '정해진 출퇴근 시간 (9-18시 등)' },
        { type: 'FLEXIBLE' as WorkType, name: '유연 근로', icon: Timer, desc: '코어타임 + 자유 시간 선택' },
        { type: 'AUTONOMOUS' as WorkType, name: '자율 근무', icon: Home, desc: '총 근무시간만 충족' }
    ]

    return (
        <div className="space-y-4">
            <div className="flex items-center gap-2 mb-4">
                <Clock className="w-5 h-5 text-lime-600" />
                <h3 className="text-lg font-semibold">근무형태 선택</h3>
            </div>
            <p className="text-slate-500 mb-6">
                회사의 기본 근무 방식을 선택합니다.
            </p>
            <div className="space-y-3">
                {workTypes.map(wt => (
                    <button
                        key={wt.type}
                        onClick={() => onChange(wt.type)}
                        className={`w-full p-4 rounded-2xl border-2 text-left transition-all flex items-center gap-4 ${value === wt.type
                                ? 'border-lime-400 bg-lime-50'
                                : 'border-slate-200 hover:border-slate-300'
                            }`}
                    >
                        <div className={`p-3 rounded-xl ${value === wt.type ? 'bg-lime-400' : 'bg-slate-100'}`}>
                            <wt.icon className={`w-5 h-5 ${value === wt.type ? 'text-black' : 'text-slate-500'}`} />
                        </div>
                        <div>
                            <div className="font-semibold text-slate-900">{wt.name}</div>
                            <div className="text-sm text-slate-500">{wt.desc}</div>
                        </div>
                        {value === wt.type && <Check className="w-5 h-5 text-lime-600 ml-auto" />}
                    </button>
                ))}
            </div>
        </div>
    )
}

// 퀵설정 Step 3: 재택근무
function QuickStep3Remote({
    remoteEnabled, gpsEnabled, wifiEnabled,
    onRemoteChange, onGpsChange, onWifiChange
}: {
    remoteEnabled: boolean
    gpsEnabled: boolean
    wifiEnabled: boolean
    onRemoteChange: (v: boolean) => void
    onGpsChange: (v: boolean) => void
    onWifiChange: (v: boolean) => void
}) {
    return (
        <div className="space-y-4">
            <div className="flex items-center gap-2 mb-4">
                <Home className="w-5 h-5 text-lime-600" />
                <h3 className="text-lg font-semibold">재택근무 설정</h3>
            </div>
            <p className="text-slate-500 mb-6">
                원격 근무 허용 여부와 출퇴근 인증 방식을 설정합니다.
            </p>

            {/* 재택근무 토글 */}
            <div className="p-4 rounded-2xl border border-slate-200 flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <Home className="w-5 h-5 text-slate-500" />
                    <div>
                        <div className="font-medium">재택근무 허용</div>
                        <div className="text-sm text-slate-500">직원들의 원격 근무를 허용합니다</div>
                    </div>
                </div>
                <ToggleSwitch checked={remoteEnabled} onChange={onRemoteChange} />
            </div>

            {remoteEnabled && (
                <div className="space-y-3 pl-4 border-l-2 border-lime-400 ml-2">
                    {/* GPS 인증 */}
                    <div className="p-4 rounded-2xl border border-slate-200 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <MapPin className="w-5 h-5 text-slate-500" />
                            <div>
                                <div className="font-medium">GPS 위치 인증</div>
                                <div className="text-sm text-slate-500">사무실 반경 내 위치 확인</div>
                            </div>
                        </div>
                        <ToggleSwitch checked={gpsEnabled} onChange={onGpsChange} />
                    </div>

                    {/* WiFi 인증 */}
                    <div className="p-4 rounded-2xl border border-slate-200 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <Wifi className="w-5 h-5 text-slate-500" />
                            <div>
                                <div className="font-medium">WiFi/IP 인증</div>
                                <div className="text-sm text-slate-500">사무실 네트워크 연결 확인</div>
                            </div>
                        </div>
                        <ToggleSwitch checked={wifiEnabled} onChange={onWifiChange} />
                    </div>
                </div>
            )}
        </div>
    )
}

// 퀵설정 Step 4: 알바 사용
function QuickStep4Hourly({ value, onChange }: { value: boolean; onChange: (v: boolean) => void }) {
    return (
        <div className="space-y-4">
            <div className="flex items-center gap-2 mb-4">
                <Users className="w-5 h-5 text-lime-600" />
                <h3 className="text-lg font-semibold">시급제 근로자</h3>
            </div>
            <p className="text-slate-500 mb-6">
                파트타임/알바 등 시급제 근로자 관리 기능을 활성화합니다.
            </p>

            <div className="grid grid-cols-2 gap-4">
                <button
                    onClick={() => onChange(false)}
                    className={`p-6 rounded-2xl border-2 text-center transition-all ${!value ? 'border-lime-400 bg-lime-50' : 'border-slate-200'
                        }`}
                >
                    <Building2 className={`w-8 h-8 mx-auto mb-3 ${!value ? 'text-lime-600' : 'text-slate-400'}`} />
                    <div className="font-semibold">월급제만 사용</div>
                    <div className="text-sm text-slate-500 mt-1">정규직 중심 운영</div>
                </button>
                <button
                    onClick={() => onChange(true)}
                    className={`p-6 rounded-2xl border-2 text-center transition-all ${value ? 'border-lime-400 bg-lime-50' : 'border-slate-200'
                        }`}
                >
                    <Users className={`w-8 h-8 mx-auto mb-3 ${value ? 'text-lime-600' : 'text-slate-400'}`} />
                    <div className="font-semibold">시급제 포함</div>
                    <div className="text-sm text-slate-500 mt-1">알바/파트타임 관리</div>
                </button>
            </div>

            {value && (
                <div className="mt-4 p-4 bg-lime-50 rounded-xl border border-lime-200">
                    <div className="flex items-start gap-2">
                        <Info className="w-5 h-5 text-lime-600 mt-0.5" />
                        <div className="text-sm text-lime-800">
                            <strong>시급제 기능 활성화:</strong>
                            <ul className="mt-1 list-disc pl-4">
                                <li>시급 기반 급여 계산</li>
                                <li>근무시간별 자동 급여 산정</li>
                                <li>가산수당 자동 적용 (연장/야간/휴일)</li>
                            </ul>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}

// 퀵설정 Step 5: 연차 정책
function QuickStep5Leave({ value, onChange }: {
    value: 'LEGAL_STANDARD' | 'CUSTOM'
    onChange: (v: 'LEGAL_STANDARD' | 'CUSTOM') => void
}) {
    return (
        <div className="space-y-4">
            <div className="flex items-center gap-2 mb-4">
                <CalendarDays className="w-5 h-5 text-lime-600" />
                <h3 className="text-lg font-semibold">연차 정책</h3>
            </div>
            <p className="text-slate-500 mb-6">
                연차휴가 발생 기준을 선택합니다.
            </p>

            <div className="space-y-3">
                <button
                    onClick={() => onChange('LEGAL_STANDARD')}
                    className={`w-full p-4 rounded-2xl border-2 text-left transition-all ${value === 'LEGAL_STANDARD' ? 'border-lime-400 bg-lime-50' : 'border-slate-200'
                        }`}
                >
                    <div className="flex items-center gap-3">
                        <div className={`p-2 rounded-lg ${value === 'LEGAL_STANDARD' ? 'bg-lime-400' : 'bg-slate-100'}`}>
                            <Shield className={`w-5 h-5 ${value === 'LEGAL_STANDARD' ? 'text-black' : 'text-slate-500'}`} />
                        </div>
                        <div>
                            <div className="font-semibold">법정 기준</div>
                            <div className="text-sm text-slate-500">근로기준법에 따른 연차 발생</div>
                        </div>
                    </div>
                    <div className="mt-3 text-sm text-slate-600 pl-12">
                        • 1년 미만: 매월 1일씩 (최대 11일)<br />
                        • 1년 이상: 15일 + 2년마다 1일 추가
                    </div>
                </button>

                <button
                    onClick={() => onChange('CUSTOM')}
                    className={`w-full p-4 rounded-2xl border-2 text-left transition-all ${value === 'CUSTOM' ? 'border-lime-400 bg-lime-50' : 'border-slate-200'
                        }`}
                >
                    <div className="flex items-center gap-3">
                        <div className={`p-2 rounded-lg ${value === 'CUSTOM' ? 'bg-lime-400' : 'bg-slate-100'}`}>
                            <Sliders className={`w-5 h-5 ${value === 'CUSTOM' ? 'text-black' : 'text-slate-500'}`} />
                        </div>
                        <div>
                            <div className="font-semibold">커스텀 설정</div>
                            <div className="text-sm text-slate-500">회사 정책에 맞게 직접 설정</div>
                        </div>
                    </div>
                    <div className="mt-3 text-sm text-slate-600 pl-12">
                        고급 모드에서 상세 설정 가능
                    </div>
                </button>
            </div>
        </div>
    )
}

// 퀵설정 Step 6: 요약
function QuickStep6Summary({ settings }: { settings: HRSystemSettings }) {
    const qs = settings.quickSetup!

    const countryNames: Record<string, string> = {
        KR: '대한민국', US: '미국', JP: '일본', OTHER: '기타'
    }
    const workTypeNames: Record<WorkType, string> = {
        FIXED: '고정 근로', FLEXIBLE: '유연 근로', AUTONOMOUS: '자율 근무'
    }

    return (
        <div className="space-y-4">
            <div className="flex items-center gap-2 mb-4">
                <Check className="w-5 h-5 text-lime-600" />
                <h3 className="text-lg font-semibold">설정 요약</h3>
            </div>
            <p className="text-slate-500 mb-6">
                설정 내용을 확인하고 저장하세요.
            </p>

            <div className="space-y-3">
                <SummaryItem label="국가" value={countryNames[qs.country]} icon={Globe} />
                <SummaryItem label="근무형태" value={workTypeNames[qs.workType]} icon={Clock} />
                <SummaryItem
                    label="재택근무"
                    value={qs.remoteWorkEnabled ? '허용' : '비허용'}
                    icon={Home}
                    extra={qs.remoteWorkEnabled ? (
                        <span className="text-xs text-slate-500">
                            GPS: {qs.gpsVerification ? '✓' : '✗'} / WiFi: {qs.wifiVerification ? '✓' : '✗'}
                        </span>
                    ) : null}
                />
                <SummaryItem
                    label="시급제"
                    value={qs.hourlyWorkerEnabled ? '활성화' : '비활성화'}
                    icon={Users}
                />
                <SummaryItem
                    label="연차 정책"
                    value={qs.leavePolicy === 'LEGAL_STANDARD' ? '법정 기준' : '커스텀'}
                    icon={CalendarDays}
                />
            </div>

            <div className="mt-6 p-4 bg-amber-50 rounded-xl border border-amber-200">
                <div className="flex items-start gap-2">
                    <AlertTriangle className="w-5 h-5 text-amber-600 mt-0.5" />
                    <div className="text-sm text-amber-800">
                        <strong>적용 전 확인:</strong> 설정 저장 후 대표 승인이 필요합니다.
                        승인 완료 시 전 직원에게 적용됩니다.
                    </div>
                </div>
            </div>
        </div>
    )
}

function SummaryItem({ label, value, icon: Icon, extra }: {
    label: string; value: string; icon: any; extra?: React.ReactNode
}) {
    return (
        <div className="flex items-center justify-between p-3 bg-slate-50 rounded-xl">
            <div className="flex items-center gap-3">
                <Icon className="w-4 h-4 text-slate-400" />
                <span className="text-slate-600">{label}</span>
            </div>
            <div className="text-right">
                <span className="font-medium text-slate-900">{value}</span>
                {extra && <div>{extra}</div>}
            </div>
        </div>
    )
}
