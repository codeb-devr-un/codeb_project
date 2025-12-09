'use client'

const isDev = process.env.NODE_ENV === 'development'

// ===========================================
// Glass Morphism Finance Contracts Page
// ===========================================

import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { FileText, Plus, Calendar, DollarSign } from 'lucide-react'
import { format } from 'date-fns'

export default function ContractsPage() {
    const [contracts, setContracts] = useState<any[]>([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        loadContracts()
    }, [])

    const loadContracts = async () => {
        try {
            const response = await fetch('/api/contracts')
            const data = await response.json()
            setContracts(data)
        } catch (error) {
            if (isDev) console.error('Failed to load contracts:', error)
        } finally {
            setLoading(false)
        }
    }

    const getStatusStyle = (status: string) => {
        const styles = {
            DRAFT: 'bg-slate-100 text-slate-700',
            ACTIVE: 'bg-emerald-100 text-emerald-700',
            COMPLETED: 'bg-lime-100 text-lime-700',
            TERMINATED: 'bg-rose-100 text-rose-700',
        }
        return styles[status as keyof typeof styles] || 'bg-slate-100 text-slate-700'
    }

    if (loading) {
        return (
            <div className="flex items-center justify-center h-96">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-lime-400"></div>
            </div>
        )
    }

    return (
        <div className="p-6 space-y-6">
            {/* 헤더 */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-slate-900 flex items-center gap-3">
                        <div className="p-2 bg-lime-100 rounded-xl">
                            <FileText className="w-6 h-6 text-lime-600" />
                        </div>
                        계약 관리
                    </h1>
                    <p className="text-slate-500 mt-2">프로젝트 계약을 관리합니다</p>
                </div>
                <Button variant="limePrimary" className="rounded-xl">
                    <Plus className="w-4 h-4 mr-2" />
                    새 계약 등록
                </Button>
            </div>

            {/* 계약 목록 */}
            <div className="grid gap-4">
                {contracts.length === 0 ? (
                    <Card variant="glass" className="p-12 text-center">
                        <div className="p-4 w-fit mx-auto bg-lime-100 rounded-2xl mb-4">
                            <FileText className="w-10 h-10 text-lime-600" />
                        </div>
                        <h3 className="text-lg font-semibold text-slate-900 mb-2">등록된 계약이 없습니다</h3>
                        <p className="text-slate-500">새 계약을 등록해주세요.</p>
                    </Card>
                ) : (
                    contracts.map((contract) => (
                        <Card key={contract.id} variant="glass" className="hover:shadow-xl hover:-translate-y-0.5 transition-all duration-300">
                            <CardHeader>
                                <div className="flex items-start justify-between">
                                    <div>
                                        <CardTitle className="flex items-center gap-2 text-slate-900">
                                            <div className="p-2 bg-lime-100 rounded-lg">
                                                <FileText className="w-5 h-5 text-lime-600" />
                                            </div>
                                            {contract.title}
                                        </CardTitle>
                                        <p className="text-sm text-slate-500 mt-1">{contract.clientName}</p>
                                    </div>
                                    <span className={`px-3 py-1 rounded-lg text-xs font-medium ${getStatusStyle(contract.status)}`}>
                                        {contract.status}
                                    </span>
                                </div>
                            </CardHeader>
                            <CardContent>
                                <div className="grid grid-cols-3 gap-4 text-sm">
                                    <div className="flex items-center gap-2">
                                        <DollarSign className="w-4 h-4 text-lime-600" />
                                        <div>
                                            <div className="text-slate-500">계약 금액</div>
                                            <div className="font-medium text-slate-900">{contract.amount.toLocaleString()}원</div>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <Calendar className="w-4 h-4 text-emerald-600" />
                                        <div>
                                            <div className="text-slate-500">시작일</div>
                                            <div className="font-medium text-slate-900">{format(new Date(contract.startDate), 'yyyy-MM-dd')}</div>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <Calendar className="w-4 h-4 text-rose-600" />
                                        <div>
                                            <div className="text-slate-500">종료일</div>
                                            <div className="font-medium text-slate-900">{format(new Date(contract.endDate), 'yyyy-MM-dd')}</div>
                                        </div>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    ))
                )}
            </div>
        </div>
    )
}
