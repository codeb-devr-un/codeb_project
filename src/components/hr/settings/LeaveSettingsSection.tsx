import React from 'react'
import { CalendarDays } from 'lucide-react'
import { LeavePolicySettings } from '@/types/hr'
import { InputField, ToggleSwitch } from './SharedComponents'

export function LeaveSettingsSection({
    settings,
    onChange
}: {
    settings: LeavePolicySettings
    onChange: (path: string, value: any) => void
}) {
    return (
        <div className="space-y-6">
            <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                <CalendarDays className="w-5 h-5 text-lime-600" />
                휴가 정책 설정
            </h3>

            {/* 연차 발생 기준 */}
            <div className="p-4 bg-lime-50 rounded-xl border border-lime-200">
                <h4 className="font-medium mb-4">연차휴가 발생 기준</h4>
                <div className="grid grid-cols-2 gap-4">
                    <InputField
                        label="입사 1년 미만 (최대 일수)"
                        type="number"
                        value={settings.annualLeave.firstYearDays}
                        onChange={(v) => onChange('leavePolicy.annualLeave.firstYearDays', parseInt(v))}
                    />
                    <InputField
                        label="입사 1년 이상 (기본 일수)"
                        type="number"
                        value={settings.annualLeave.afterFirstYearDays}
                        onChange={(v) => onChange('leavePolicy.annualLeave.afterFirstYearDays', parseInt(v))}
                    />
                    <InputField
                        label="최대 누적 일수"
                        type="number"
                        value={settings.annualLeave.maxAccumulatedDays}
                        onChange={(v) => onChange('leavePolicy.annualLeave.maxAccumulatedDays', parseInt(v))}
                    />
                </div>

                {/* 이월 설정 */}
                <div className="mt-4 pt-4 border-t border-lime-200">
                    <div className="flex items-center justify-between mb-3">
                        <span>연차 이월 허용</span>
                        <ToggleSwitch
                            checked={settings.annualLeave.carryOverEnabled}
                            onChange={(v) => onChange('leavePolicy.annualLeave.carryOverEnabled', v)}
                        />
                    </div>
                    {settings.annualLeave.carryOverEnabled && (
                        <div className="grid grid-cols-2 gap-4">
                            <InputField
                                label="이월 최대 일수"
                                type="number"
                                value={settings.annualLeave.carryOverMaxDays}
                                onChange={(v) => onChange('leavePolicy.annualLeave.carryOverMaxDays', parseInt(v))}
                            />
                            <InputField
                                label="이월 만료 기간 (개월)"
                                type="number"
                                value={settings.annualLeave.expiryMonths}
                                onChange={(v) => onChange('leavePolicy.annualLeave.expiryMonths', parseInt(v))}
                            />
                        </div>
                    )}
                </div>
            </div>

            {/* 병가 */}
            <div className="p-4 bg-slate-50 rounded-xl">
                <h4 className="font-medium mb-4">병가</h4>
                <div className="grid grid-cols-3 gap-4">
                    <InputField
                        label="유급 병가 일수"
                        type="number"
                        value={settings.sickLeave.paidDays}
                        onChange={(v) => onChange('leavePolicy.sickLeave.paidDays', parseInt(v))}
                    />
                    <div className="flex items-center gap-2">
                        <span className="text-sm">진단서 필요</span>
                        <ToggleSwitch
                            checked={settings.sickLeave.requiresDocument}
                            onChange={(v) => onChange('leavePolicy.sickLeave.requiresDocument', v)}
                        />
                    </div>
                    <InputField
                        label="진단서 필요 기준 (일)"
                        type="number"
                        value={settings.sickLeave.documentAfterDays}
                        onChange={(v) => onChange('leavePolicy.sickLeave.documentAfterDays', parseInt(v))}
                    />
                </div>
            </div>

            {/* 특별휴가 */}
            <div className="p-4 bg-slate-50 rounded-xl">
                <h4 className="font-medium mb-4">특별휴가</h4>
                <div className="grid grid-cols-2 gap-4">
                    <InputField
                        label="결혼 (일)"
                        type="number"
                        value={settings.specialLeave.marriage}
                        onChange={(v) => onChange('leavePolicy.specialLeave.marriage', parseInt(v))}
                    />
                    <InputField
                        label="경조사 (일)"
                        type="number"
                        value={settings.specialLeave.bereavement}
                        onChange={(v) => onChange('leavePolicy.specialLeave.bereavement', parseInt(v))}
                    />
                    <InputField
                        label="출산 (일)"
                        type="number"
                        value={settings.specialLeave.childBirth}
                        onChange={(v) => onChange('leavePolicy.specialLeave.childBirth', parseInt(v))}
                    />
                    <InputField
                        label="가족돌봄 (일)"
                        type="number"
                        value={settings.specialLeave.familyCare}
                        onChange={(v) => onChange('leavePolicy.specialLeave.familyCare', parseInt(v))}
                    />
                </div>
            </div>

            {/* 승인 프로세스 */}
            <div className="p-4 bg-slate-50 rounded-xl">
                <h4 className="font-medium mb-4">휴가 승인 프로세스</h4>
                <div className="space-y-3">
                    <InputField
                        label="자동 승인 기준 (N일 이하)"
                        type="number"
                        value={settings.approvalProcess.autoApproveUnder}
                        onChange={(v) => onChange('leavePolicy.approvalProcess.autoApproveUnder', parseInt(v))}
                    />
                    <div className="flex items-center justify-between p-3 bg-white rounded-xl">
                        <span>팀장 승인 필요</span>
                        <ToggleSwitch
                            checked={settings.approvalProcess.requireManagerApproval}
                            onChange={(v) => onChange('leavePolicy.approvalProcess.requireManagerApproval', v)}
                        />
                    </div>
                    <div className="flex items-center justify-between p-3 bg-white rounded-xl">
                        <span>HR 승인 필요</span>
                        <ToggleSwitch
                            checked={settings.approvalProcess.requireHRApproval}
                            onChange={(v) => onChange('leavePolicy.approvalProcess.requireHRApproval', v)}
                        />
                    </div>
                </div>
            </div>
        </div>
    )
}
