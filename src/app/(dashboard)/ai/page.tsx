'use client'

// ===========================================
// Glass Morphism AI Intelligence Page
// ===========================================

import React, { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import {
  Brain, TrendingUp, Lightbulb, BarChart3,
  Target, AlertTriangle, CheckCircle, Clock, Activity,
  MessageSquare, Zap, Shield
} from 'lucide-react'
import { useAuth } from '@/lib/auth-context'
import { cn } from '@/lib/utils'

export default function AIPage() {
  const { userProfile } = useAuth()
  const [activeTab, setActiveTab] = useState<'overview' | 'insights' | 'automation'>('overview')

  // AI 기능 카드 데이터
  const features = [
    {
      icon: Brain,
      title: 'AI 어시스턴트',
      description: '프로젝트 관련 모든 질문에 즉시 답변',
      bgColor: 'bg-violet-100',
      iconColor: 'text-violet-600'
    },
    {
      icon: BarChart3,
      title: '스마트 분석',
      description: '실시간 프로젝트 데이터 분석 및 인사이트',
      bgColor: 'bg-lime-100',
      iconColor: 'text-lime-600'
    },
    {
      icon: Target,
      title: '예측 모델링',
      description: '프로젝트 완료 시기 및 리스크 예측',
      bgColor: 'bg-amber-100',
      iconColor: 'text-amber-600'
    },
    {
      icon: Lightbulb,
      title: '자동 추천',
      description: '상황에 맞는 최적의 액션 제안',
      bgColor: 'bg-emerald-100',
      iconColor: 'text-emerald-600'
    }
  ]

  // 샘플 인사이트 데이터
  const insights = [
    {
      type: 'success',
      icon: TrendingUp,
      title: '프로젝트 진행률 상승',
      description: '지난 주 대비 15% 향상된 진행률을 보이고 있습니다.',
      priority: 'low'
    },
    {
      type: 'warning',
      icon: AlertTriangle,
      title: '리소스 병목 감지',
      description: '다음 주 개발팀 일정이 과도하게 집중되어 있습니다.',
      priority: 'high'
    },
    {
      type: 'info',
      icon: Lightbulb,
      title: '프로세스 개선 제안',
      description: '코드 리뷰 자동화로 20% 시간 절약 가능합니다.',
      priority: 'medium'
    }
  ]

  return (
    <div className="w-full max-w-[1920px] mx-auto px-6 py-6 space-y-6">
      {/* 헤더 - Glass Morphism */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900 flex items-center gap-3">
            <div className="p-2 bg-lime-100 rounded-xl">
              <Brain className="w-6 h-6 text-lime-600" />
            </div>
            AI 인텔리전스
          </h1>
          <p className="text-slate-500 mt-2">인공지능이 프로젝트를 분석하고 최적의 솔루션을 제안합니다</p>
        </div>

        <Button variant="limePrimary" className="rounded-xl">
          <MessageSquare className="mr-2 h-4 w-4" />
          AI 어시스턴트 시작
        </Button>
      </div>

      {/* 통계 카드 - Glass Morphism */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card variant="glass" className="hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-500 font-medium">AI 사용량</p>
                <p className="text-2xl font-bold text-slate-900">1,234</p>
                <p className="text-xs text-emerald-600 mt-1">↑ 23% 증가</p>
              </div>
              <div className="p-3 bg-lime-100 rounded-xl">
                <Activity className="h-6 w-6 text-lime-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card variant="glass" className="hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-500 font-medium">정확도</p>
                <p className="text-2xl font-bold text-slate-900">94.5%</p>
                <div className="w-full bg-slate-200 rounded-full h-1.5 mt-2 overflow-hidden">
                  <div className="bg-lime-400 h-1.5 rounded-full" style={{ width: '94.5%' }} />
                </div>
              </div>
              <div className="p-3 bg-violet-100 rounded-xl">
                <Target className="h-6 w-6 text-violet-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card variant="glass" className="hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-500 font-medium">절감 시간</p>
                <p className="text-2xl font-bold text-slate-900">160h</p>
                <p className="text-xs text-slate-400 mt-1">이번 달</p>
              </div>
              <div className="p-3 bg-amber-100 rounded-xl">
                <Clock className="h-6 w-6 text-amber-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card variant="glass" className="hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-500 font-medium">자동화율</p>
                <p className="text-2xl font-bold text-slate-900">68%</p>
                <div className="w-full bg-slate-200 rounded-full h-1.5 mt-2 overflow-hidden">
                  <div className="bg-lime-400 h-1.5 rounded-full" style={{ width: '68%' }} />
                </div>
              </div>
              <div className="p-3 bg-emerald-100 rounded-xl">
                <Zap className="h-6 w-6 text-emerald-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* AI 기능 - Glass Morphism */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {features.map((feature, idx) => {
          const Icon = feature.icon
          return (
            <Card key={idx} variant="glass" className="cursor-pointer hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
              <CardContent className="p-6">
                <div className={cn("w-12 h-12 rounded-xl flex items-center justify-center mb-4", feature.bgColor)}>
                  <Icon className={cn("h-6 w-6", feature.iconColor)} />
                </div>
                <h3 className="font-semibold text-slate-900 mb-2">{feature.title}</h3>
                <p className="text-sm text-slate-500">{feature.description}</p>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {/* 탭 네비게이션 - Glass Morphism */}
      <div className="bg-white/60 backdrop-blur-sm rounded-2xl shadow-lg shadow-black/5 p-1.5 border border-white/40 inline-flex">
        <div className="flex gap-1">
          {[
            { id: 'overview', label: '개요' },
            { id: 'insights', label: '인사이트' },
            { id: 'automation', label: '자동화' }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`px-6 py-2.5 rounded-xl text-sm font-medium transition-all ${
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
      {activeTab === 'overview' && (
        <Card variant="glass">
          <CardHeader>
            <CardTitle className="text-slate-900">AI 활동 내역</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {[
                { icon: BarChart3, title: '프로젝트 분석 완료', desc: '웹사이트 리뉴얼 프로젝트', time: '5분 전', bgColor: 'bg-lime-100', iconColor: 'text-lime-600' },
                { icon: CheckCircle, title: '작업 우선순위 재정렬', desc: '긴급도 기반 자동 정렬', time: '1시간 전', bgColor: 'bg-emerald-100', iconColor: 'text-emerald-600' },
                { icon: Lightbulb, title: '코드 리뷰 제안', desc: '성능 개선 포인트 3개 발견', time: '2시간 전', bgColor: 'bg-violet-100', iconColor: 'text-violet-600' },
                { icon: Shield, title: '보안 취약점 스캔', desc: '모든 코드베이스 검사 완료', time: '3시간 전', bgColor: 'bg-amber-100', iconColor: 'text-amber-600' }
              ].map((activity, idx) => {
                const Icon = activity.icon
                return (
                  <div key={idx} className="flex items-center justify-between p-4 bg-white/60 border border-white/40 rounded-2xl hover:bg-white/80 transition-colors">
                    <div className="flex items-center gap-3">
                      <div className={cn("p-2 rounded-xl", activity.bgColor)}>
                        <Icon className={cn("h-5 w-5", activity.iconColor)} />
                      </div>
                      <div>
                        <p className="font-medium text-slate-900">{activity.title}</p>
                        <p className="text-sm text-slate-500">{activity.desc}</p>
                      </div>
                    </div>
                    <span className="text-sm text-slate-400">{activity.time}</span>
                  </div>
                )
              })}
            </div>
          </CardContent>
        </Card>
      )}

      {activeTab === 'insights' && (
        <div className="space-y-4">
          {insights.map((insight, idx) => {
            const Icon = insight.icon
            return (
              <Card key={idx} variant="glass" className="hover:shadow-lg transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-start gap-4">
                    <div className={cn(
                      "p-2 rounded-xl",
                      insight.type === 'success' ? 'bg-emerald-100' :
                      insight.type === 'warning' ? 'bg-amber-100' :
                      'bg-violet-100'
                    )}>
                      <Icon className={cn(
                        "h-5 w-5",
                        insight.type === 'success' ? 'text-emerald-600' :
                        insight.type === 'warning' ? 'text-amber-600' :
                        'text-violet-600'
                      )} />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-medium text-slate-900">{insight.title}</h4>
                        <Badge className={cn(
                          "border-0",
                          insight.priority === 'high' ? 'bg-rose-100 text-rose-700' :
                          insight.priority === 'medium' ? 'bg-amber-100 text-amber-700' :
                          'bg-lime-100 text-lime-700'
                        )}>
                          {insight.priority === 'high' ? '높음' :
                           insight.priority === 'medium' ? '보통' : '낮음'}
                        </Badge>
                      </div>
                      <p className="text-sm text-slate-500">{insight.description}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}

      {activeTab === 'automation' && (
        <div className="space-y-6">
          <Card variant="glass">
            <CardHeader>
              <CardTitle className="text-slate-900">자동화 설정</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {[
                  { title: '일일 프로젝트 분석', desc: '매일 오전 9시 자동 실행', enabled: true },
                  { title: '주간 리포트 생성', desc: '매주 월요일 오전 10시', enabled: true },
                  { title: '리스크 실시간 감지', desc: '24시간 모니터링', enabled: false },
                  { title: '코드 품질 검사', desc: 'PR 생성 시 자동 실행', enabled: true }
                ].map((automation, idx) => (
                  <div key={idx} className="flex items-center justify-between p-4 bg-white/60 border border-white/40 rounded-2xl">
                    <div>
                      <h4 className="font-medium text-slate-900">{automation.title}</h4>
                      <p className="text-sm text-slate-500">{automation.desc}</p>
                    </div>
                    <Badge className={cn(
                      "border-0",
                      automation.enabled ? 'bg-lime-100 text-lime-700' : 'bg-slate-100 text-slate-500'
                    )}>
                      {automation.enabled ? '활성' : '비활성'}
                    </Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card variant="glass">
            <CardHeader>
              <CardTitle className="text-slate-900">AI 모델 성능</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {[
                  { name: '프로젝트 분석', value: 98 },
                  { name: '리스크 예측', value: 92 },
                  { name: '작업 추천', value: 87 }
                ].map((metric, idx) => (
                  <div key={idx}>
                    <div className="flex justify-between mb-2">
                      <span className="text-sm font-medium text-slate-700">{metric.name}</span>
                      <span className="text-sm text-slate-500">{metric.value}%</span>
                    </div>
                    <div className="w-full bg-slate-200 rounded-full h-2 overflow-hidden">
                      <div
                        className="bg-lime-400 h-2 rounded-full transition-all"
                        style={{ width: `${metric.value}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}
