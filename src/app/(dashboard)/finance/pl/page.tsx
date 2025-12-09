'use client'

const isDev = process.env.NODE_ENV === 'development'

// ===========================================
// Glass Morphism P&L Page
// ===========================================

import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { TrendingUp, TrendingDown, DollarSign, Wallet, ArrowUpRight, ArrowDownRight } from 'lucide-react'

export default function PLPage() {
    const [summary, setSummary] = useState({ income: 0, expense: 0, profit: 0 })
    const [transactions, setTransactions] = useState<any[]>([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        loadPLData()
    }, [])

    const loadPLData = async () => {
        try {
            const response = await fetch('/api/transactions/summary')
            const data = await response.json()
            setSummary(data.summary || { income: 0, expense: 0, profit: 0 })
            setTransactions(data.transactions || [])
        } catch (error) {
            if (isDev) console.error('Failed to load P&L data:', error)
        } finally {
            setLoading(false)
        }
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
            <div>
                <h1 className="text-3xl font-bold tracking-tight text-slate-900 flex items-center gap-3">
                    <div className="p-2 bg-lime-100 rounded-xl">
                        <Wallet className="w-6 h-6 text-lime-600" />
                    </div>
                    손익 관리
                </h1>
                <p className="text-slate-500 mt-2">수입과 지출을 관리합니다</p>
            </div>

            {/* 요약 카드 */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card variant="glass" className="hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium text-slate-500">총 수입</CardTitle>
                        <div className="p-2 bg-emerald-100 rounded-xl">
                            <TrendingUp className="w-4 h-4 text-emerald-600" />
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-emerald-600">
                            {summary.income.toLocaleString()}원
                        </div>
                    </CardContent>
                </Card>

                <Card variant="glass" className="hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium text-slate-500">총 지출</CardTitle>
                        <div className="p-2 bg-rose-100 rounded-xl">
                            <TrendingDown className="w-4 h-4 text-rose-600" />
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-rose-600">
                            {summary.expense.toLocaleString()}원
                        </div>
                    </CardContent>
                </Card>

                <Card variant="glass" className="hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium text-slate-500">순이익</CardTitle>
                        <div className="p-2 bg-lime-100 rounded-xl">
                            <DollarSign className="w-4 h-4 text-lime-600" />
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className={`text-2xl font-bold ${summary.profit >= 0 ? 'text-lime-600' : 'text-rose-600'}`}>
                            {summary.profit.toLocaleString()}원
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* 거래 내역 */}
            <Card variant="glass">
                <CardHeader>
                    <CardTitle className="text-slate-900">최근 거래 내역</CardTitle>
                </CardHeader>
                <CardContent>
                    {transactions.length === 0 ? (
                        <div className="text-center py-8 text-slate-500">
                            거래 내역이 없습니다.
                        </div>
                    ) : (
                        <div className="space-y-3">
                            {transactions.map((tx: any) => (
                                <div key={tx.id} className="flex items-center justify-between p-4 bg-white/60 border border-white/40 rounded-2xl hover:shadow-lg hover:-translate-y-0.5 transition-all">
                                    <div className="flex items-center gap-3">
                                        <div className={`p-2 rounded-xl ${tx.type === 'INCOME' ? 'bg-emerald-100' : 'bg-rose-100'}`}>
                                            {tx.type === 'INCOME' ? (
                                                <ArrowUpRight className="w-5 h-5 text-emerald-600" />
                                            ) : (
                                                <ArrowDownRight className="w-5 h-5 text-rose-600" />
                                            )}
                                        </div>
                                        <div>
                                            <div className="font-medium text-slate-900">{tx.description}</div>
                                            <div className="text-sm text-slate-500">{tx.category}</div>
                                        </div>
                                    </div>
                                    <div className={`font-bold ${tx.type === 'INCOME' ? 'text-emerald-600' : 'text-rose-600'}`}>
                                        {tx.type === 'INCOME' ? '+' : '-'}{tx.amount.toLocaleString()}원
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    )
}
