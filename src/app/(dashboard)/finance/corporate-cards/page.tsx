'use client'

// ===========================================
// Glass Morphism Corporate Cards Page
// ===========================================

import React, { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Plus, CreditCard, Calendar, TrendingUp, Wallet, BarChart3 } from 'lucide-react'

export default function CorporateCardsPage() {
    const [cards] = useState([
        {
            id: '1',
            cardNumber: '**** **** **** 1234',
            holder: '김철수',
            limit: 5000000,
            used: 1250000,
            status: 'active',
            type: 'corporate'
        },
        {
            id: '2',
            cardNumber: '**** **** **** 5678',
            holder: '이영희',
            limit: 3000000,
            used: 850000,
            status: 'active',
            type: 'corporate'
        },
    ])

    const [transactions] = useState([
        {
            id: '1',
            cardId: '1',
            date: '2025-11-23',
            merchant: '아마존 웹 서비스',
            amount: 250000,
            category: '클라우드 서비스',
            status: 'completed'
        },
        {
            id: '2',
            cardId: '1',
            date: '2025-11-22',
            merchant: '스타벅스',
            amount: 45000,
            category: '식비',
            status: 'completed'
        },
    ])

    const getUsagePercentage = (used: number, limit: number) => {
        return Math.round((used / limit) * 100)
    }

    return (
        <div className="p-6 space-y-6">
            {/* 헤더 */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-slate-900 flex items-center gap-3">
                        <div className="p-2 bg-lime-100 rounded-xl">
                            <CreditCard className="w-6 h-6 text-lime-600" />
                        </div>
                        법인카드 관리
                    </h1>
                    <p className="text-slate-500 mt-2">법인카드 사용 내역 및 한도를 관리합니다</p>
                </div>
                <Button variant="limePrimary" className="rounded-xl">
                    <Plus className="w-4 h-4 mr-2" />
                    카드 추가
                </Button>
            </div>

            {/* 통계 카드 */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <Card variant="glass" className="hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
                    <CardHeader className="pb-2">
                        <div className="flex items-center justify-between">
                            <CardDescription className="text-slate-500 font-medium">총 카드 수</CardDescription>
                            <div className="p-2 bg-lime-100 rounded-xl">
                                <CreditCard className="w-4 h-4 text-lime-600" />
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-slate-900">{cards.length}장</div>
                    </CardContent>
                </Card>
                <Card variant="glass" className="hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
                    <CardHeader className="pb-2">
                        <div className="flex items-center justify-between">
                            <CardDescription className="text-slate-500 font-medium">이번 달 사용액</CardDescription>
                            <div className="p-2 bg-violet-100 rounded-xl">
                                <Wallet className="w-4 h-4 text-violet-600" />
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-slate-900">₩2,100,000</div>
                    </CardContent>
                </Card>
                <Card variant="glass" className="hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
                    <CardHeader className="pb-2">
                        <div className="flex items-center justify-between">
                            <CardDescription className="text-slate-500 font-medium">총 한도</CardDescription>
                            <div className="p-2 bg-emerald-100 rounded-xl">
                                <TrendingUp className="w-4 h-4 text-emerald-600" />
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-slate-900">₩8,000,000</div>
                    </CardContent>
                </Card>
                <Card variant="glass" className="hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
                    <CardHeader className="pb-2">
                        <div className="flex items-center justify-between">
                            <CardDescription className="text-slate-500 font-medium">평균 사용률</CardDescription>
                            <div className="p-2 bg-amber-100 rounded-xl">
                                <BarChart3 className="w-4 h-4 text-amber-600" />
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-slate-900">26%</div>
                    </CardContent>
                </Card>
            </div>

            {/* 카드 목록 - Glass 스타일 카드 */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {cards.map((card) => {
                    const usagePercent = getUsagePercentage(card.used, card.limit)
                    return (
                        <div key={card.id} className="bg-gradient-to-br from-slate-900 to-slate-700 text-white rounded-3xl p-6 shadow-xl hover:shadow-2xl hover:-translate-y-1 transition-all duration-300">
                            <div className="flex items-center justify-between mb-6">
                                <CreditCard className="w-10 h-10 text-lime-400" />
                                <span className={`px-3 py-1 rounded-lg text-xs font-medium ${
                                    card.status === 'active' ? 'bg-lime-400/20 text-lime-400' : 'bg-white/20 text-white'
                                }`}>
                                    {card.status === 'active' ? '활성' : '비활성'}
                                </span>
                            </div>
                            <div className="space-y-4">
                                <div>
                                    <div className="text-2xl font-mono tracking-wider mb-2">
                                        {card.cardNumber}
                                    </div>
                                    <div className="text-sm text-slate-300">{card.holder}</div>
                                </div>
                                <div>
                                    <div className="flex items-center justify-between text-sm mb-2">
                                        <span className="text-slate-300">사용 한도</span>
                                        <span className="text-lime-400 font-medium">{usagePercent}%</span>
                                    </div>
                                    <div className="w-full bg-white/20 rounded-full h-2.5">
                                        <div
                                            className="bg-lime-400 rounded-full h-2.5 transition-all"
                                            style={{ width: `${usagePercent}%` }}
                                        />
                                    </div>
                                    <div className="flex items-center justify-between text-xs mt-2 text-slate-400">
                                        <span>₩{card.used.toLocaleString()}</span>
                                        <span>₩{card.limit.toLocaleString()}</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )
                })}
            </div>

            {/* 최근 거래 내역 */}
            <Card variant="glass">
                <CardHeader>
                    <CardTitle className="text-slate-900">최근 거래 내역</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="space-y-3">
                        {transactions.map((transaction) => (
                            <div key={transaction.id} className="flex items-center justify-between p-4 bg-white/60 border border-white/40 rounded-2xl hover:shadow-lg hover:-translate-y-0.5 transition-all">
                                <div className="flex items-center gap-4">
                                    <div className="p-2.5 bg-violet-100 rounded-xl">
                                        <CreditCard className="w-5 h-5 text-violet-600" />
                                    </div>
                                    <div>
                                        <div className="font-medium text-slate-900">{transaction.merchant}</div>
                                        <div className="text-sm text-slate-500">{transaction.category}</div>
                                        <div className="flex items-center gap-2 mt-1 text-xs text-slate-400">
                                            <Calendar className="w-3 h-3" />
                                            {transaction.date}
                                        </div>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <div className="font-bold text-slate-900">₩{transaction.amount.toLocaleString()}</div>
                                    <div className="text-sm text-slate-500">
                                        {cards.find(c => c.id === transaction.cardId)?.cardNumber}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}
