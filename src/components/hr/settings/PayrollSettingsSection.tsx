import React from 'react'
import { DollarSign, Percent, Plus, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { PayrollEngineSettings, PayrollType } from '@/types/hr'
import { InputField } from './SharedComponents'

export function PayrollSettingsSection({
    settings,
    onChange
}: {
    settings: PayrollEngineSettings
    onChange: (path: string, value: any) => void
}) {
    return (
        <div className="space-y-6">
            <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                <DollarSign className="w-5 h-5 text-lime-600" />
                급여 계산 설정
            </h3>

            {/* 기본 급여 유형 */}
            <div className="grid grid-cols-3 gap-4">
                {(['MONTHLY', 'HOURLY', 'FREELANCER'] as PayrollType[]).map(type => (
                    <button
                        key={type}
                        onClick={() => onChange('payrollSettings.baseSalary.type', type)}
                        className={`p-4 rounded-xl border-2 text-center ${settings.baseSalary.type === type
                                ? 'border-lime-400 bg-lime-50'
                                : 'border-slate-200'
                            }`}
                    >
                        <div className="font-medium">
                            {type === 'MONTHLY' ? '월급제' : type === 'HOURLY' ? '시급제' : '프리랜서'}
                        </div>
                    </button>
                ))}
            </div>

            {/* 소정근로시간 */}
            <InputField
                label="월 소정근로시간 (통상 209시간)"
                type="number"
                value={settings.baseSalary.standardWorkingHoursPerMonth}
                onChange={(v) => onChange('payrollSettings.baseSalary.standardWorkingHoursPerMonth', parseInt(v))}
            />

            {/* 가산율 설정 */}
            <div className="p-4 bg-slate-50 rounded-xl">
                <h4 className="font-medium mb-4 flex items-center gap-2">
                    <Percent className="w-4 h-4" />
                    수당 가산율 (근로기준법 기준)
                </h4>
                <div className="grid grid-cols-2 gap-4">
                    <InputField
                        label="연장근로 (기본 1.5)"
                        type="number"
                        step="0.1"
                        value={settings.overtimeMultipliers.overtime}
                        onChange={(v) => onChange('payrollSettings.overtimeMultipliers.overtime', parseFloat(v))}
                    />
                    <InputField
                        label="야간근로 22-06시 (기본 1.5)"
                        type="number"
                        step="0.1"
                        value={settings.overtimeMultipliers.night}
                        onChange={(v) => onChange('payrollSettings.overtimeMultipliers.night', parseFloat(v))}
                    />
                    <InputField
                        label="휴일근로 (기본 1.5)"
                        type="number"
                        step="0.1"
                        value={settings.overtimeMultipliers.holiday}
                        onChange={(v) => onChange('payrollSettings.overtimeMultipliers.holiday', parseFloat(v))}
                    />
                    <InputField
                        label="휴일연장 (기본 2.0)"
                        type="number"
                        step="0.1"
                        value={settings.overtimeMultipliers.holidayOvertime}
                        onChange={(v) => onChange('payrollSettings.overtimeMultipliers.holidayOvertime', parseFloat(v))}
                    />
                </div>
            </div>

            {/* 고정 수당 */}
            <div className="border-t pt-6">
                <div className="flex items-center justify-between mb-4">
                    <h4 className="font-medium">고정 수당</h4>
                    <Button size="sm" variant="outline" className="gap-1">
                        <Plus className="w-4 h-4" /> 수당 추가
                    </Button>
                </div>
                {settings.fixedAllowances.length === 0 ? (
                    <div className="text-center py-8 text-slate-400">
                        등록된 고정 수당이 없습니다
                    </div>
                ) : (
                    <div className="space-y-2">
                        {settings.fixedAllowances.map(allowance => (
                            <div key={allowance.id} className="flex items-center justify-between p-3 bg-slate-50 rounded-xl">
                                <div>
                                    <span className="font-medium">{allowance.name}</span>
                                    <Badge className="ml-2" variant={allowance.taxable ? 'secondary' : 'outline'}>
                                        {allowance.taxable ? '과세' : '비과세'}
                                    </Badge>
                                </div>
                                <div className="flex items-center gap-2">
                                    <span className="font-semibold">{allowance.amount.toLocaleString()}원</span>
                                    <Button size="sm" variant="ghost">
                                        <Trash2 className="w-4 h-4 text-red-500" />
                                    </Button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* 공제 항목 */}
            <div className="border-t pt-6">
                <h4 className="font-medium mb-4">4대보험 및 세금 공제</h4>
                <div className="space-y-2">
                    {settings.deductions.map(deduction => (
                        <div key={deduction.id} className="flex items-center justify-between p-3 bg-slate-50 rounded-xl">
                            <div>
                                <span className="font-medium">{deduction.name}</span>
                                <span className="text-sm text-slate-500 ml-2">{deduction.description}</span>
                            </div>
                            <span className="font-semibold">
                                {deduction.type === 'RATE'
                                    ? `${(deduction.value * 100).toFixed(2)}%`
                                    : `${deduction.value.toLocaleString()}원`}
                            </span>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    )
}
