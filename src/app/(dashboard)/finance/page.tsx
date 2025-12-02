'use client'

// ===========================================
// Glass Morphism Finance Page
// ===========================================

import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { useAuth } from '@/lib/auth-context'
import { FinancialSummary } from '@/types/finance'
import ExpenseTracker from '@/components/finance/ExpenseTracker'
import BudgetManager from '@/components/finance/BudgetManager'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Wallet, TrendingUp, TrendingDown, Receipt, AlertCircle, FileText, CreditCard, BarChart3, Download } from 'lucide-react'
import {
  AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from 'recharts'

// Mock 재무 데이터
const mockFinancialSummary: FinancialSummary = {
  totalRevenue: 458500000,
  totalExpenses: 312300000,
  netProfit: 146200000,
  pendingInvoices: 12,
  overdueInvoices: 3,
  monthlyRevenue: [
    { month: '1월', amount: 35000000 },
    { month: '2월', amount: 42000000 },
    { month: '3월', amount: 38000000 },
    { month: '4월', amount: 45000000 },
    { month: '5월', amount: 52000000 },
    { month: '6월', amount: 48000000 },
    { month: '7월', amount: 55000000 },
    { month: '8월', amount: 51000000 },
    { month: '9월', amount: 47000000 },
    { month: '10월', amount: 43000000 },
    { month: '11월', amount: 49000000 },
    { month: '12월', amount: 53500000 },
  ],
  monthlyExpenses: [
    { month: '1월', amount: 28000000 },
    { month: '2월', amount: 30000000 },
    { month: '3월', amount: 27000000 },
    { month: '4월', amount: 29000000 },
    { month: '5월', amount: 32000000 },
    { month: '6월', amount: 31000000 },
    { month: '7월', amount: 33000000 },
    { month: '8월', amount: 30500000 },
    { month: '9월', amount: 29500000 },
    { month: '10월', amount: 28000000 },
    { month: '11월', amount: 31000000 },
    { month: '12월', amount: 33300000 },
  ],
  revenueByProject: [
    { projectId: '1', projectName: '웹사이트 리뉴얼', revenue: 120000000, percentage: 26.2 },
    { projectId: '2', projectName: '모바일 앱 개발', revenue: 95000000, percentage: 20.7 },
    { projectId: '3', projectName: '이커머스 플랫폼', revenue: 150000000, percentage: 32.7 },
    { projectId: '4', projectName: 'CRM 시스템', revenue: 93500000, percentage: 20.4 },
  ],
  expensesByCategory: [
    { category: '인건비', amount: 180000000, percentage: 57.6 },
    { category: '사무실 임대', amount: 48000000, percentage: 15.4 },
    { category: '장비/소프트웨어', amount: 35000000, percentage: 11.2 },
    { category: '마케팅', amount: 25000000, percentage: 8.0 },
    { category: '기타', amount: 24300000, percentage: 7.8 },
  ],
}

const COLORS = ['#a3e635', '#10b981', '#f59e0b', '#8b5cf6', '#06b6d4']

export default function FinancePage() {
  const { user, userProfile } = useAuth()
  const [selectedPeriod, setSelectedPeriod] = useState<'month' | 'quarter' | 'year'>('year')
  const [activeTab, setActiveTab] = useState<'overview' | 'expenses' | 'budget' | 'invoices'>('overview')
  const [financialData] = useState<FinancialSummary>(mockFinancialSummary)

  // 권한 체크
  if (userProfile?.role !== 'admin') {
    return (
      <div className="flex items-center justify-center h-96">
        <Card variant="glass" className="p-12 text-center max-w-md">
          <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-rose-100 flex items-center justify-center">
            <AlertCircle className="w-8 h-8 text-rose-600" />
          </div>
          <h2 className="text-2xl font-bold text-slate-900 mb-2">접근 권한 없음</h2>
          <p className="text-slate-500">재무 관리는 관리자만 접근할 수 있습니다.</p>
        </Card>
      </div>
    )
  }

  // 금액 포맷팅
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('ko-KR', {
      style: 'currency',
      currency: 'KRW',
      maximumFractionDigits: 0,
    }).format(amount)
  }

  // 수익률 계산
  const profitMargin = ((financialData.netProfit / financialData.totalRevenue) * 100).toFixed(1)

  // 월별 수익/지출 차트 데이터
  const monthlyChartData = financialData.monthlyRevenue.map((revenue, index) => ({
    month: revenue.month,
    수익: revenue.amount,
    지출: financialData.monthlyExpenses[index].amount,
    순이익: revenue.amount - financialData.monthlyExpenses[index].amount,
  }))

  return (
    <div className="space-y-6 p-6">
      {/* 헤더 - Glass Morphism */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900 flex items-center gap-3">
            <div className="p-2 bg-lime-100 rounded-xl">
              <Wallet className="w-6 h-6 text-lime-600" />
            </div>
            재무 관리
          </h1>
          <p className="text-slate-500 mt-2">수익, 지출, 청구서를 관리하고 재무 현황을 분석합니다.</p>
        </div>

        <div className="flex gap-2">
          <select
            value={selectedPeriod}
            onChange={(e) => setSelectedPeriod(e.target.value as any)}
            className="px-4 py-2 bg-white/60 border border-white/40 rounded-xl text-slate-700 focus:outline-none focus:ring-2 focus:ring-lime-400"
          >
            <option value="month">이번 달</option>
            <option value="quarter">이번 분기</option>
            <option value="year">올해</option>
          </select>
          <Button variant="limePrimary" className="rounded-xl">
            <Download className="w-4 h-4 mr-2" />
            보고서 다운로드
          </Button>
        </div>
      </div>

      {/* 탭 네비게이션 - Glass */}
      <div className="bg-white/60 backdrop-blur-sm rounded-2xl shadow-lg shadow-black/5 p-1.5 border border-white/40">
        <div className="flex gap-1">
          {[
            { id: 'overview', label: '대시보드', icon: BarChart3 },
            { id: 'expenses', label: '지출 관리', icon: CreditCard },
            { id: 'budget', label: '예산 관리', icon: Wallet },
            { id: 'invoices', label: '청구서', icon: FileText }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-xl text-sm font-medium transition-all ${
                activeTab === tab.id
                  ? 'bg-black text-lime-400 shadow-lg'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-white/60'
              }`}
            >
              <tab.icon className="w-4 h-4" />
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* 탭 컨텐츠 */}
      {activeTab === 'overview' && (
        <>
          {/* 주요 지표 - Glass Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
              <Card variant="glass" className="hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-sm font-medium text-slate-500">총 수익</span>
                  <div className="p-2 bg-lime-100 rounded-xl">
                    <TrendingUp className="w-5 h-5 text-lime-600" />
                  </div>
                </div>
                <div className="text-2xl font-bold text-slate-900">
                  {formatCurrency(financialData.totalRevenue)}
                </div>
                <div className="text-sm text-emerald-600 mt-2 flex items-center gap-1">
                  <TrendingUp className="w-3 h-3" /> +12.5% 전년 대비
                </div>
              </Card>
            </motion.div>

            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
              <Card variant="glass" className="hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-sm font-medium text-slate-500">총 지출</span>
                  <div className="p-2 bg-rose-100 rounded-xl">
                    <TrendingDown className="w-5 h-5 text-rose-600" />
                  </div>
                </div>
                <div className="text-2xl font-bold text-slate-900">
                  {formatCurrency(financialData.totalExpenses)}
                </div>
                <div className="text-sm text-rose-600 mt-2 flex items-center gap-1">
                  <TrendingUp className="w-3 h-3" /> +8.3% 전년 대비
                </div>
              </Card>
            </motion.div>

            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
              <Card variant="glass" className="hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-sm font-medium text-slate-500">순이익</span>
                  <div className="p-2 bg-emerald-100 rounded-xl">
                    <Wallet className="w-5 h-5 text-emerald-600" />
                  </div>
                </div>
                <div className="text-2xl font-bold text-slate-900">
                  {formatCurrency(financialData.netProfit)}
                </div>
                <div className="text-sm text-emerald-600 mt-2">
                  수익률 {profitMargin}%
                </div>
              </Card>
            </motion.div>

            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
              <Card variant="glass" className="hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-sm font-medium text-slate-500">미수금</span>
                  <div className="p-2 bg-amber-100 rounded-xl">
                    <Receipt className="w-5 h-5 text-amber-600" />
                  </div>
                </div>
                <div className="text-2xl font-bold text-slate-900">
                  {financialData.pendingInvoices}건
                </div>
                <div className="text-sm text-amber-600 mt-2">
                  검토 필요
                </div>
              </Card>
            </motion.div>

            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
              <Card variant="glass" className="hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-sm font-medium text-slate-500">연체</span>
                  <div className="p-2 bg-rose-100 rounded-xl">
                    <AlertCircle className="w-5 h-5 text-rose-600" />
                  </div>
                </div>
                <div className="text-2xl font-bold text-slate-900">
                  {financialData.overdueInvoices}건
                </div>
                <div className="text-sm text-rose-600 mt-2">
                  즉시 확인 필요
                </div>
              </Card>
            </motion.div>
          </div>

          {/* 차트 섹션 - Glass */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* 월별 수익/지출 추이 */}
            <Card variant="glass">
              <h3 className="text-lg font-semibold text-slate-900 mb-4">월별 수익/지출 추이</h3>
              <ResponsiveContainer width="100%" height={300}>
                <AreaChart data={monthlyChartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                  <XAxis dataKey="month" stroke="#64748b" />
                  <YAxis tickFormatter={(value) => `${(value / 1000000).toFixed(0)}M`} stroke="#64748b" />
                  <Tooltip
                    formatter={(value: number) => formatCurrency(value)}
                    contentStyle={{ backgroundColor: 'rgba(255, 255, 255, 0.95)', border: '1px solid rgba(255,255,255,0.4)', borderRadius: '12px' }}
                  />
                  <Legend />
                  <Area type="monotone" dataKey="수익" stackId="1" stroke="#a3e635" fill="#a3e635" fillOpacity={0.8} />
                  <Area type="monotone" dataKey="지출" stackId="2" stroke="#f87171" fill="#f87171" fillOpacity={0.8} />
                </AreaChart>
              </ResponsiveContainer>
            </Card>

            {/* 프로젝트별 수익 */}
            <Card variant="glass">
              <h3 className="text-lg font-semibold text-slate-900 mb-4">프로젝트별 수익</h3>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={financialData.revenueByProject}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={(entry) => `${entry.projectName} (${entry.percentage}%)`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="revenue"
                  >
                    {financialData.revenueByProject.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value: number) => formatCurrency(value)} />
                </PieChart>
              </ResponsiveContainer>
            </Card>

            {/* 지출 카테고리 */}
            <Card variant="glass">
              <h3 className="text-lg font-semibold text-slate-900 mb-4">지출 카테고리</h3>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={financialData.expensesByCategory} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                  <XAxis type="number" tickFormatter={(value) => `${(value / 1000000).toFixed(0)}M`} stroke="#64748b" />
                  <YAxis dataKey="category" type="category" stroke="#64748b" />
                  <Tooltip formatter={(value: number) => formatCurrency(value)} />
                  <Bar dataKey="amount" fill="#a3e635" radius={[0, 8, 8, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </Card>

            {/* 순이익 추이 */}
            <Card variant="glass">
              <h3 className="text-lg font-semibold text-slate-900 mb-4">월별 순이익</h3>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={monthlyChartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                  <XAxis dataKey="month" stroke="#64748b" />
                  <YAxis tickFormatter={(value) => `${(value / 1000000).toFixed(0)}M`} stroke="#64748b" />
                  <Tooltip formatter={(value: number) => formatCurrency(value)} />
                  <Bar dataKey="순이익" fill="#10b981" radius={[8, 8, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </Card>
          </div>

          {/* 빠른 액션 - Glass */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card variant="glass" className="cursor-pointer hover:shadow-xl hover:-translate-y-1 transition-all duration-300 text-left">
              <div className="p-3 w-fit bg-lime-100 rounded-xl mb-3">
                <FileText className="w-6 h-6 text-lime-600" />
              </div>
              <h4 className="font-semibold text-slate-900">새 청구서 생성</h4>
              <p className="text-sm text-slate-500 mt-1">프로젝트 청구서를 생성하고 발송합니다</p>
            </Card>

            <Card variant="glass" className="cursor-pointer hover:shadow-xl hover:-translate-y-1 transition-all duration-300 text-left">
              <div className="p-3 w-fit bg-violet-100 rounded-xl mb-3">
                <CreditCard className="w-6 h-6 text-violet-600" />
              </div>
              <h4 className="font-semibold text-slate-900">지출 기록</h4>
              <p className="text-sm text-slate-500 mt-1">새로운 지출 내역을 기록합니다</p>
            </Card>

            <Card variant="glass" className="cursor-pointer hover:shadow-xl hover:-translate-y-1 transition-all duration-300 text-left">
              <div className="p-3 w-fit bg-amber-100 rounded-xl mb-3">
                <BarChart3 className="w-6 h-6 text-amber-600" />
              </div>
              <h4 className="font-semibold text-slate-900">상세 보고서</h4>
              <p className="text-sm text-slate-500 mt-1">재무 상세 보고서를 확인합니다</p>
            </Card>
          </div>
        </>
      )}

      {activeTab === 'expenses' && <ExpenseTracker />}
      
      {activeTab === 'budget' && <BudgetManager />}
      
      {activeTab === 'invoices' && (
        <Card variant="glass" className="text-center py-12">
          <div className="p-4 w-fit mx-auto bg-lime-100 rounded-2xl mb-4">
            <FileText className="w-10 h-10 text-lime-600" />
          </div>
          <h3 className="text-lg font-semibold text-slate-900 mb-2">청구서 관리</h3>
          <p className="text-slate-500 mb-6">청구서 상세 관리는 별도 페이지에서 확인하세요.</p>
          <Button variant="limePrimary" asChild>
            <a href="/finance/invoices">청구서 페이지로 이동</a>
          </Button>
        </Card>
      )}
    </div>
  )
}