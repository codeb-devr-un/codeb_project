'use client'

// ===========================================
// Glass Morphism Analytics Page
// ===========================================

import React, { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  BarChart3, TrendingUp, Users, DollarSign, Calendar,
  ArrowUp, ArrowDown, Target, PieChart,
  LineChart, Download
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { useAuth } from '@/lib/auth-context'

export default function AnalyticsPage() {
  const { userProfile } = useAuth()
  const [timeRange, setTimeRange] = useState('month')

  const stats = [
    {
      label: '총 매출',
      value: '₩125.4M',
      change: '+23%',
      trend: 'up',
      icon: DollarSign,
      bgColor: 'bg-lime-100',
      iconColor: 'text-lime-600'
    },
    {
      label: '완료 프로젝트',
      value: '42',
      change: '+12%',
      trend: 'up',
      icon: Target,
      bgColor: 'bg-violet-100',
      iconColor: 'text-violet-600'
    },
    {
      label: '활성 사용자',
      value: '1,234',
      change: '+5%',
      trend: 'up',
      icon: Users,
      bgColor: 'bg-amber-100',
      iconColor: 'text-amber-600'
    },
    {
      label: '평균 완료 시간',
      value: '18일',
      change: '-8%',
      trend: 'down',
      icon: Calendar,
      bgColor: 'bg-emerald-100',
      iconColor: 'text-emerald-600'
    },
  ]

  const projectPerformance = [
    { name: '웹사이트 리뉴얼', revenue: 45000000, tasks: 124, completion: 92 },
    { name: '모바일 앱 개발', revenue: 38000000, tasks: 89, completion: 78 },
    { name: 'ERP 시스템 구축', revenue: 62000000, tasks: 156, completion: 85 },
    { name: 'AI 챗봇 개발', revenue: 28000000, tasks: 67, completion: 95 },
  ]

  const [activeTab, setActiveTab] = useState('revenue')

  return (
    <div className="w-full max-w-[1920px] mx-auto px-6 py-6 space-y-6">
      {/* 헤더 - Glass Morphism */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900 flex items-center gap-3">
            <div className="p-2 bg-lime-100 rounded-xl">
              <BarChart3 className="w-6 h-6 text-lime-600" />
            </div>
            통계 분석
          </h1>
          <p className="text-slate-500 mt-2">프로젝트와 팀의 성과를 한눈에 확인하세요</p>
        </div>

        <div className="flex items-center gap-3">
          {/* 기간 선택 */}
          <div className="flex gap-1">
            {[
              { value: 'week', label: '이번 주' },
              { value: 'month', label: '이번 달' },
              { value: 'quarter', label: '이번 분기' },
              { value: 'year', label: '올해' }
            ].map((option) => (
              <button
                key={option.value}
                type="button"
                onClick={() => setTimeRange(option.value)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-sm font-medium transition-all ${
                  timeRange === option.value
                    ? 'bg-lime-100 text-lime-700 ring-2 ring-lime-400'
                    : 'bg-white/60 border border-white/40 text-slate-600 hover:bg-white/80'
                }`}
              >
                {option.label}
              </button>
            ))}
          </div>

          <Button variant="glass" className="rounded-xl">
            <Download className="h-4 w-4 mr-2" />
            리포트 다운로드
          </Button>
        </div>
      </div>

      {/* 주요 지표 - Glass Morphism */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, index) => (
          <Card key={index} variant="glass" className="hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <p className="text-sm text-slate-500 font-medium">{stat.label}</p>
                  <p className="text-2xl font-bold text-slate-900">{stat.value}</p>
                  <div className="flex items-center gap-1">
                    {stat.trend === 'up' ? (
                      <ArrowUp className="h-4 w-4 text-emerald-600" />
                    ) : (
                      <ArrowDown className="h-4 w-4 text-rose-600" />
                    )}
                    <span className={cn(
                      "text-sm font-medium",
                      stat.trend === 'up' ? 'text-emerald-600' : 'text-rose-600'
                    )}>
                      {stat.change}
                    </span>
                    <span className="text-sm text-slate-400">vs 지난달</span>
                  </div>
                </div>
                <div className={cn("p-3 rounded-xl", stat.bgColor)}>
                  <stat.icon className={cn("h-6 w-6", stat.iconColor)} />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* 탭 네비게이션 - Glass Morphism */}
      <div className="bg-white/60 backdrop-blur-sm rounded-2xl shadow-lg shadow-black/5 p-1.5 border border-white/40 inline-flex">
        <div className="flex gap-1">
          {[
            { id: 'revenue', label: '매출 추이' },
            { id: 'projects', label: '프로젝트 현황' },
            { id: 'team', label: '팀 성과' },
            { id: 'clients', label: '고객 분석' }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                activeTab === tab.id
                  ? 'bg-black text-lime-400 shadow-lg'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-white/60'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* 탭 콘텐츠 */}
      {activeTab === 'revenue' && (
        <Card variant="glass">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-slate-900">
              <div className="p-2 bg-lime-100 rounded-xl">
                <LineChart className="h-5 w-5 text-lime-600" />
              </div>
              월별 매출 추이
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[400px] flex items-center justify-center text-slate-500 bg-white/40 rounded-2xl border border-white/40">
              <p>차트 컴포넌트가 여기에 표시됩니다</p>
            </div>
          </CardContent>
        </Card>
      )}

      {activeTab === 'projects' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card variant="glass">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-slate-900">
                <div className="p-2 bg-violet-100 rounded-xl">
                  <PieChart className="h-5 w-5 text-violet-600" />
                </div>
                프로젝트 상태별 분포
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-[300px] flex items-center justify-center text-slate-500 bg-white/40 rounded-2xl border border-white/40">
                <p>파이 차트가 여기에 표시됩니다</p>
              </div>
            </CardContent>
          </Card>

          <Card variant="glass">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-slate-900">
                <div className="p-2 bg-amber-100 rounded-xl">
                  <BarChart3 className="h-5 w-5 text-amber-600" />
                </div>
                프로젝트별 진행률
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-[300px] flex items-center justify-center text-slate-500 bg-white/40 rounded-2xl border border-white/40">
                <p>막대 차트가 여기에 표시됩니다</p>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {activeTab === 'team' && (
        <Card variant="glass">
          <CardHeader>
            <CardTitle className="text-slate-900">팀원별 성과</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {['김개발', '이디자인', '박기획', '최마케팅'].map((member, idx) => (
                <div key={idx} className="flex items-center justify-between p-4 bg-white/60 border border-white/40 rounded-2xl hover:bg-white/80 transition-colors">
                  <div className="flex items-center gap-4">
                    <div className={cn(
                      "w-10 h-10 rounded-xl flex items-center justify-center",
                      idx === 0 ? 'bg-lime-100' : idx === 1 ? 'bg-violet-100' : idx === 2 ? 'bg-amber-100' : 'bg-emerald-100'
                    )}>
                      <span className={cn(
                        "font-medium",
                        idx === 0 ? 'text-lime-600' : idx === 1 ? 'text-violet-600' : idx === 2 ? 'text-amber-600' : 'text-emerald-600'
                      )}>{member[0]}</span>
                    </div>
                    <div>
                      <p className="font-medium text-slate-900">{member}</p>
                      <p className="text-sm text-slate-500">완료 작업: {23 + idx * 7}개</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-slate-900">{95 - idx * 2}%</p>
                    <p className="text-sm text-slate-500">효율성</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {activeTab === 'clients' && (
        <Card variant="glass">
          <CardHeader>
            <CardTitle className="text-slate-900">주요 고객사별 프로젝트</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {projectPerformance.map((project, idx) => (
                <div key={idx} className="space-y-2 p-4 bg-white/60 rounded-2xl border border-white/40">
                  <div className="flex items-center justify-between">
                    <span className="font-medium text-slate-900">{project.name}</span>
                    <span className="text-sm text-slate-500">
                      ₩{(project.revenue / 1000000).toFixed(1)}M
                    </span>
                  </div>
                  <div className="w-full bg-slate-200 rounded-full h-2 overflow-hidden">
                    <div
                      className="bg-lime-400 h-2 rounded-full transition-all"
                      style={{ width: `${project.completion}%` }}
                    />
                  </div>
                  <div className="flex justify-between text-xs text-slate-500">
                    <span>진행률: {project.completion}%</span>
                    <span>작업: {project.tasks}개</span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
