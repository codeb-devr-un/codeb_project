import React from 'react'
import { Clock } from 'lucide-react'
import { AdvancedWorkSettings, WorkType } from '@/types/hr'
import { InputField, ToggleSwitch } from './SharedComponents'

export function WorkSettingsSection({
    settings,
    onChange
}: {
    settings: AdvancedWorkSettings
    onChange: (path: string, value: any) => void
}) {
    return (
        <div className="space-y-6">
            <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                <Clock className="w-5 h-5 text-lime-600" />
                근무 시간 설정
            </h3>

            {/* 근무 유형 */}
            <div className="grid grid-cols-3 gap-4">
                {(['FIXED', 'FLEXIBLE', 'AUTONOMOUS'] as WorkType[]).map(type => (
                    <button
                        key={type}
                        onClick={() => onChange('workSettings.workSchedule.type', type)}
                        className={`p-4 rounded-xl border-2 text-center ${settings.workSchedule.type === type
                                ? 'border-lime-400 bg-lime-50'
                                : 'border-slate-200'
                            }`}
                    >
                        <div className="font-medium">
                            {type === 'FIXED' ? '고정 근로' : type === 'FLEXIBLE' ? '유연 근로' : '자율 근무'}
                        </div>
                    </button>
                ))}
            </div>

            {/* 시간 설정 */}
            <div className="grid grid-cols-2 gap-4">
                <InputField
                    label="출근 시간"
                    type="time"
                    value={settings.workSchedule.workStartTime}
                    onChange={(v) => onChange('workSettings.workSchedule.workStartTime', v)}
                />
                <InputField
                    label="퇴근 시간"
                    type="time"
                    value={settings.workSchedule.workEndTime}
                    onChange={(v) => onChange('workSettings.workSchedule.workEndTime', v)}
                />
                <InputField
                    label="일 소정근로시간 (분)"
                    type="number"
                    value={settings.workSchedule.dailyRequiredMinutes}
                    onChange={(v) => onChange('workSettings.workSchedule.dailyRequiredMinutes', parseInt(v))}
                />
                <InputField
                    label="주 소정근로시간"
                    type="number"
                    value={settings.workSchedule.weeklyRequiredHours}
                    onChange={(v) => onChange('workSettings.workSchedule.weeklyRequiredHours', parseInt(v))}
                />
            </div>

            {/* 유연근무 코어타임 */}
            {settings.workSchedule.type === 'FLEXIBLE' && (
                <div className="p-4 bg-lime-50 rounded-xl border border-lime-200">
                    <h4 className="font-medium mb-3">코어타임 설정</h4>
                    <div className="grid grid-cols-2 gap-4">
                        <InputField
                            label="코어타임 시작"
                            type="time"
                            value={settings.workSchedule.coreTimeStart || '10:00'}
                            onChange={(v) => onChange('workSettings.workSchedule.coreTimeStart', v)}
                        />
                        <InputField
                            label="코어타임 종료"
                            type="time"
                            value={settings.workSchedule.coreTimeEnd || '16:00'}
                            onChange={(v) => onChange('workSettings.workSchedule.coreTimeEnd', v)}
                        />
                    </div>
                </div>
            )}

            {/* 점심시간 */}
            <div className="grid grid-cols-3 gap-4">
                <InputField
                    label="점심 시작"
                    type="time"
                    value={settings.workSchedule.lunchBreakStart}
                    onChange={(v) => onChange('workSettings.workSchedule.lunchBreakStart', v)}
                />
                <InputField
                    label="점심 종료"
                    type="time"
                    value={settings.workSchedule.lunchBreakEnd}
                    onChange={(v) => onChange('workSettings.workSchedule.lunchBreakEnd', v)}
                />
                <InputField
                    label="점심 시간 (분)"
                    type="number"
                    value={settings.workSchedule.lunchBreakMinutes}
                    onChange={(v) => onChange('workSettings.workSchedule.lunchBreakMinutes', parseInt(v))}
                />
            </div>

            {/* 인증 설정 */}
            <div className="border-t pt-6 mt-6">
                <h4 className="font-medium mb-4">출퇴근 인증 설정</h4>
                <div className="space-y-3">
                    <div className="flex items-center justify-between p-3 bg-slate-50 rounded-xl">
                        <span>재석 확인 기능</span>
                        <ToggleSwitch
                            checked={settings.verification.presenceCheckEnabled}
                            onChange={(v) => onChange('workSettings.verification.presenceCheckEnabled', v)}
                        />
                    </div>
                    {settings.verification.presenceCheckEnabled && (
                        <InputField
                            label="재석 확인 간격 (분)"
                            type="number"
                            value={settings.verification.presenceIntervalMinutes}
                            onChange={(v) => onChange('workSettings.verification.presenceIntervalMinutes', parseInt(v))}
                        />
                    )}
                    <div className="flex items-center justify-between p-3 bg-slate-50 rounded-xl">
                        <span>GPS 위치 인증</span>
                        <ToggleSwitch
                            checked={settings.verification.gpsEnabled}
                            onChange={(v) => onChange('workSettings.verification.gpsEnabled', v)}
                        />
                    </div>
                    {settings.verification.gpsEnabled && (
                        <InputField
                            label="GPS 인증 반경 (m)"
                            type="number"
                            value={settings.verification.gpsRadius}
                            onChange={(v) => onChange('workSettings.verification.gpsRadius', parseInt(v))}
                        />
                    )}
                    <div className="flex items-center justify-between p-3 bg-slate-50 rounded-xl">
                        <span>WiFi/IP 인증</span>
                        <ToggleSwitch
                            checked={settings.verification.wifiEnabled}
                            onChange={(v) => onChange('workSettings.verification.wifiEnabled', v)}
                        />
                    </div>
                </div>
            </div>

            {/* 지각 정책 */}
            <div className="border-t pt-6 mt-6">
                <h4 className="font-medium mb-4">지각/조퇴 규정</h4>
                <div className="grid grid-cols-3 gap-4">
                    <InputField
                        label="지각 유예 시간 (분)"
                        type="number"
                        value={settings.latePolicy.graceMinutes}
                        onChange={(v) => onChange('workSettings.latePolicy.graceMinutes', parseInt(v))}
                    />
                    <InputField
                        label="지각 1회당 공제액"
                        type="number"
                        value={settings.latePolicy.deductionPerLate}
                        onChange={(v) => onChange('workSettings.latePolicy.deductionPerLate', parseInt(v))}
                    />
                    <InputField
                        label="월 최대 지각 허용"
                        type="number"
                        value={settings.latePolicy.maxLatePerMonth}
                        onChange={(v) => onChange('workSettings.latePolicy.maxLatePerMonth', parseInt(v))}
                    />
                </div>
            </div>
        </div>
    )
}
