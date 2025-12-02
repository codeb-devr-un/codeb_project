'use client'

// ===========================================
// Glass Morphism Expenses Page
// ===========================================

import React, { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Plus, Receipt, Calendar, User, Filter, DollarSign, Clock, CheckCircle, TrendingUp } from 'lucide-react'

export default function ExpensesPage() {
    const [expenses] = useState([
        {
            id: '1',
            date: '2025-11-23',
            category: '식비',
            amount: 45000,
            merchant: '스타벅스',
            description: '팀 미팅',
            status: 'pending',
            submittedBy: '김철수'
        },
        {
            id: '2',
            date: '2025-11-22',
            category: '교통비',
            amount: 15000,
            merchant: '택시',
            description: '고객 미팅 이동',
            status: 'approved',
            submittedBy: '이영희'
        },
    ])

    const getStatusBadge = (status: string) => {
        const styles = {
            pending: 'bg-amber-100 text-amber-700',
            approved: 'bg-emerald-100 text-emerald-700',
            rejected: 'bg-rose-100 text-rose-700',
        }
        const labels = {
            pending: '대기중',
            approved: '승인됨',
            rejected: '반려됨',
        }
        return { style: styles[status as keyof typeof styles], label: labels[status as keyof typeof labels] }
    }

    return (
        <div className="p-6 space-y-6">
            {/* 헤더 */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-slate-900 flex items-center gap-3">
                        <div className="p-2 bg-lime-100 rounded-xl">
                            <Receipt className="w-6 h-6 text-lime-600" />
                        </div>
                        지출 관리
                    </h1>
                    <p className="text-slate-500 mt-2">팀 지출 내역을 관리합니다</p>
                </div>
                <div className="flex gap-2">
                    <Button variant="glass" className="rounded-xl">
                        <Filter className="w-4 h-4 mr-2" />
                        필터
                    </Button>
                    <Button variant="limePrimary" className="rounded-xl">
                        <Plus className="w-4 h-4 mr-2" />
                        지출 추가
                    </Button>
                </div>
            </div>

            {/* 통계 카드 */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <Card variant="glass" className="hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
                    <CardHeader className="pb-2">
                        <div className="flex items-center justify-between">
                            <CardDescription className="text-slate-500 font-medium">이번 달 총 지출</CardDescription>
                            <div className="p-2 bg-lime-100 rounded-xl">
                                <DollarSign className="w-4 h-4 text-lime-600" />
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-slate-900">₩1,250,000</div>
                    </CardContent>
                </Card>
                <Card variant="glass" className="hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
                    <CardHeader className="pb-2">
                        <div className="flex items-center justify-between">
                            <CardDescription className="text-slate-500 font-medium">승인 대기</CardDescription>
                            <div className="p-2 bg-amber-100 rounded-xl">
                                <Clock className="w-4 h-4 text-amber-600" />
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-slate-900">3건</div>
                    </CardContent>
                </Card>
                <Card variant="glass" className="hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
                    <CardHeader className="pb-2">
                        <div className="flex items-center justify-between">
                            <CardDescription className="text-slate-500 font-medium">승인 완료</CardDescription>
                            <div className="p-2 bg-emerald-100 rounded-xl">
                                <CheckCircle className="w-4 h-4 text-emerald-600" />
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-slate-900">12건</div>
                    </CardContent>
                </Card>
                <Card variant="glass" className="hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
                    <CardHeader className="pb-2">
                        <div className="flex items-center justify-between">
                            <CardDescription className="text-slate-500 font-medium">평균 지출</CardDescription>
                            <div className="p-2 bg-violet-100 rounded-xl">
                                <TrendingUp className="w-4 h-4 text-violet-600" />
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-slate-900">₩83,333</div>
                    </CardContent>
                </Card>
            </div>

            {/* 지출 목록 */}
            <Card variant="glass">
                <CardHeader>
                    <CardTitle className="text-slate-900">지출 내역</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="space-y-3">
                        {expenses.map((expense) => {
                            const statusBadge = getStatusBadge(expense.status)
                            return (
                                <div key={expense.id} className="flex items-center justify-between p-4 bg-white/60 border border-white/40 rounded-2xl hover:shadow-lg hover:-translate-y-0.5 transition-all">
                                    <div className="flex items-center gap-4">
                                        <div className="p-2.5 bg-lime-100 rounded-xl">
                                            <Receipt className="w-5 h-5 text-lime-600" />
                                        </div>
                                        <div>
                                            <div className="font-medium text-slate-900">{expense.merchant}</div>
                                            <div className="text-sm text-slate-500">{expense.description}</div>
                                            <div className="flex items-center gap-2 mt-1 text-xs text-slate-400">
                                                <Calendar className="w-3 h-3" />
                                                {expense.date}
                                                <User className="w-3 h-3 ml-2" />
                                                {expense.submittedBy}
                                            </div>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-4">
                                        <div className="text-right">
                                            <div className="font-bold text-slate-900">₩{expense.amount.toLocaleString()}</div>
                                            <div className="text-sm text-slate-500">{expense.category}</div>
                                        </div>
                                        <span className={`px-3 py-1 text-xs font-medium rounded-lg ${statusBadge.style}`}>
                                            {statusBadge.label}
                                        </span>
                                    </div>
                                </div>
                            )
                        })}
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}
