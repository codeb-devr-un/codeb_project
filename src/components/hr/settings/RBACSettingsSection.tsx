import React from 'react'
import { Shield, UserCheck, Check } from 'lucide-react'

export function RBACSettingsSection({
    settings,
    onChange
}: {
    settings: any
    onChange: (path: string, value: any) => void
}) {
    const moduleNames: Record<string, string> = {
        ATTENDANCE: '근태',
        LEAVE: '휴가',
        PAYROLL: '급여',
        HR_RECORD: '인사기록',
        SETTINGS: '설정',
        APPROVAL: '결재'
    }

    const actionNames: Record<string, string> = {
        VIEW: '조회',
        CREATE: '생성',
        EDIT: '수정',
        DELETE: '삭제',
        APPROVE: '승인'
    }

    return (
        <div className="space-y-6">
            <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                <Shield className="w-5 h-5 text-lime-600" />
                권한 관리 (RBAC)
            </h3>

            <p className="text-slate-500">
                job.md 섹션 7 기반: 역할별 권한을 설정합니다.
            </p>

            <div className="space-y-4">
                {settings.roles.map((role: any) => (
                    <div key={role.id} className="p-4 bg-slate-50 rounded-xl">
                        <div className="flex items-center gap-3 mb-4">
                            <UserCheck className="w-5 h-5 text-lime-600" />
                            <div>
                                <span className="font-semibold">{role.nameKor}</span>
                                <span className="text-sm text-slate-500 ml-2">({role.name})</span>
                            </div>
                        </div>

                        <div className="overflow-x-auto">
                            <table className="w-full text-sm">
                                <thead>
                                    <tr className="text-left">
                                        <th className="pb-2 font-medium text-slate-600">모듈</th>
                                        <th className="pb-2 font-medium text-slate-600 text-center">조회</th>
                                        <th className="pb-2 font-medium text-slate-600 text-center">생성</th>
                                        <th className="pb-2 font-medium text-slate-600 text-center">수정</th>
                                        <th className="pb-2 font-medium text-slate-600 text-center">삭제</th>
                                        <th className="pb-2 font-medium text-slate-600 text-center">승인</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {role.permissions.map((perm: any) => (
                                        <tr key={perm.module} className="border-t border-slate-200">
                                            <td className="py-2">{moduleNames[perm.module]}</td>
                                            {['VIEW', 'CREATE', 'EDIT', 'DELETE', 'APPROVE'].map(action => (
                                                <td key={action} className="py-2 text-center">
                                                    {perm.actions.includes(action) ? (
                                                        <Check className="w-4 h-4 text-lime-600 mx-auto" />
                                                    ) : (
                                                        <span className="text-slate-300">-</span>
                                                    )}
                                                </td>
                                            ))}
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    )
}
