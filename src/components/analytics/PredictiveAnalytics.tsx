'use client'
const isDev = process.env.NODE_ENV === 'development'

import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  LineChart, Line, AreaChart, Area, BarChart, Bar,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis
} from 'recharts'
import analyticsService from '@/services/analytics-service'
import { ProjectPrediction, BudgetPrediction, ResourcePrediction, RiskFactor } from '@/types/analytics'

interface PredictiveAnalyticsProps {
  projectId?: string
}

export default function PredictiveAnalytics({ projectId = '1' }: PredictiveAnalyticsProps) {
  const [activeTab, setActiveTab] = useState<'completion' | 'budget' | 'resource' | 'risk'>('completion')
  const [projectPrediction, setProjectPrediction] = useState<ProjectPrediction | null>(null)
  const [budgetPrediction, setBudgetPrediction] = useState<BudgetPrediction | null>(null)
  const [resourcePrediction, setResourcePrediction] = useState<ResourcePrediction | null>(null)
  const [risks, setRisks] = useState<RiskFactor[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    loadPredictions()
  }, [projectId])

  const loadPredictions = async () => {
    setIsLoading(true)
    try {
      const [project, budget, resource, riskData] = await Promise.all([
        analyticsService.predictProjectCompletion(projectId),
        analyticsService.predictBudget(projectId),
        analyticsService.predictResourceUtilization(),
        analyticsService.analyzeRisks(projectId)
      ])

      setProjectPrediction(project)
      setBudgetPrediction(budget)
      setResourcePrediction(resource)
      setRisks(riskData)
    } catch (error) {
      if (isDev) console.error('Failed to load predictions:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('ko-KR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    }).format(date)
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('ko-KR', {
      style: 'currency',
      currency: 'KRW',
      maximumFractionDigits: 0,
    }).format(amount)
  }

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'text-red-700 bg-red-100'
      case 'high': return 'text-orange-700 bg-orange-100'
      case 'medium': return 'text-yellow-700 bg-yellow-100'
      case 'low': return 'text-green-700 bg-green-100'
      default: return 'text-gray-700 bg-gray-100'
    }
  }

  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case 'critical': return '🚨'
      case 'high': return '⚠️'
      case 'medium': return '⚡'
      case 'low': return '💚'
      default: return '❓'
    }
  }

  // 진행률 차트 데이터
  const progressChartData = projectPrediction ? 
    projectPrediction.predictedProgress.map((progress, index) => ({
      week: `${index + 1}주`,
      진행률: progress,
      현재: index === 0 ? projectPrediction.currentProgress : null
    })) : []

  // 예산 차트 데이터
  const budgetChartData = budgetPrediction?.monthlyForecast || []

  // 리소스 차트 데이터
  const resourceChartData = resourcePrediction ?
    resourcePrediction.predictedUtilization.map((util, index) => ({
      week: `${index + 1}주`,
      활용도: util,
      임계값: 85
    })) : []

  // 리스크 레이더 차트 데이터
  const riskRadarData = risks.map(risk => ({
    risk: risk.type,
    probability: risk.probability * 100,
    severity: risk.severity === 'critical' ? 100 : 
              risk.severity === 'high' ? 75 :
              risk.severity === 'medium' ? 50 : 25
  }))

  if (isLoading) {
    return (
      <div className="bg-white rounded-xl shadow-sm p-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-4"></div>
          <div className="space-y-3">
            <div className="h-4 bg-gray-200 rounded"></div>
            <div className="h-4 bg-gray-200 rounded w-5/6"></div>
            <div className="h-4 bg-gray-200 rounded w-4/6"></div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* 헤더 */}
      <div className="bg-white rounded-xl shadow-sm p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">예측 분석</h2>
            <p className="text-sm text-gray-600 mt-1">AI 기반 프로젝트 예측 및 리스크 분석</p>
          </div>
          <button
            onClick={loadPredictions}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            title="새로고침"
          >
            🔄
          </button>
        </div>

        {/* 탭 네비게이션 */}
        <div className="flex gap-1 p-1 bg-gray-100 rounded-lg">
          {[
            { id: 'completion', label: '완료 예측', icon: '📈' },
            { id: 'budget', label: '예산 예측', icon: '💰' },
            { id: 'resource', label: '리소스 예측', icon: '👥' },
            { id: 'risk', label: '리스크 분석', icon: '⚠️' }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex-1 flex items-center justify-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                activeTab === tab.id
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <span>{tab.icon}</span>
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* 탭 컨텐츠 */}
      <AnimatePresence mode="wait">
        {activeTab === 'completion' && projectPrediction && (
          <motion.div
            key="completion"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="space-y-6"
          >
            {/* 완료 예측 요약 */}
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h3 className="text-lg font-semibold mb-4">프로젝트 완료 예측</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                <div className="text-center">
                  <p className="text-sm text-gray-600">현재 진행률</p>
                  <p className="text-3xl font-bold text-gray-900">{projectPrediction.currentProgress}%</p>
                </div>
                <div className="text-center">
                  <p className="text-sm text-gray-600">예상 완료일</p>
                  <p className="text-2xl font-bold text-primary">
                    {formatDate(new Date(projectPrediction.completionDate))}
                  </p>
                </div>
                <div className="text-center">
                  <p className="text-sm text-gray-600">예측 신뢰도</p>
                  <p className="text-3xl font-bold text-green-600">
                    {Math.round(projectPrediction.confidence * 100)}%
                  </p>
                </div>
              </div>

              {/* 진행률 예측 차트 */}
              <ResponsiveContainer width="100%" height={300}>
                <AreaChart data={progressChartData}>
                  <defs>
                    <linearGradient id="progressGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#4f7eff" stopOpacity={0.8}/>
                      <stop offset="95%" stopColor="#4f7eff" stopOpacity={0.1}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="week" />
                  <YAxis domain={[0, 100]} />
                  <Tooltip 
                    formatter={(value: number) => `${value}%`}
                    contentStyle={{ backgroundColor: 'rgba(255, 255, 255, 0.95)', border: '1px solid #e5e7eb' }}
                  />
                  <Area 
                    type="monotone" 
                    dataKey="진행률" 
                    stroke="#4f7eff" 
                    fillOpacity={1} 
                    fill="url(#progressGradient)" 
                  />
                  <Line 
                    type="monotone" 
                    dataKey="현재" 
                    stroke="#ef4444" 
                    strokeWidth={3}
                    dot={{ r: 6, fill: '#ef4444' }}
                  />
                </AreaChart>
              </ResponsiveContainer>

              {/* 권장사항 */}
              <div className="mt-6">
                <h4 className="font-medium text-gray-900 mb-3">AI 권장사항</h4>
                <div className="space-y-2">
                  {projectPrediction.recommendations.map((rec, idx) => (
                    <div key={idx} className="flex items-start gap-2">
                      <span className="text-primary mt-0.5">•</span>
                      <p className="text-sm text-gray-600">{rec}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {activeTab === 'budget' && budgetPrediction && (
          <motion.div
            key="budget"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="space-y-6"
          >
            {/* 예산 예측 요약 */}
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h3 className="text-lg font-semibold mb-4">예산 사용 예측</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                <div className="bg-gray-50 rounded-lg p-4">
                  <p className="text-sm text-gray-600">현재 사용액</p>
                  <p className="text-xl font-bold text-gray-900">
                    {formatCurrency(budgetPrediction.currentBudget)}
                  </p>
                </div>
                <div className="bg-blue-50 rounded-lg p-4">
                  <p className="text-sm text-gray-600">예상 총액</p>
                  <p className="text-xl font-bold text-blue-600">
                    {formatCurrency(budgetPrediction.predictedTotal)}
                  </p>
                </div>
                <div className="bg-yellow-50 rounded-lg p-4">
                  <p className="text-sm text-gray-600">월 평균 사용액</p>
                  <p className="text-xl font-bold text-yellow-600">
                    {formatCurrency(budgetPrediction.burnRate)}
                  </p>
                </div>
                <div className={`rounded-lg p-4 ${
                  budgetPrediction.overrunRisk > 0.5 ? 'bg-red-50' : 'bg-green-50'
                }`}>
                  <p className="text-sm text-gray-600">초과 위험도</p>
                  <p className={`text-xl font-bold ${
                    budgetPrediction.overrunRisk > 0.5 ? 'text-red-600' : 'text-green-600'
                  }`}>
                    {Math.round(budgetPrediction.overrunRisk * 100)}%
                  </p>
                </div>
              </div>

              {/* 월별 예산 차트 */}
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={budgetChartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis tickFormatter={(value) => `${(value / 1000000).toFixed(0)}M`} />
                  <Tooltip 
                    formatter={(value: number) => formatCurrency(value)}
                    contentStyle={{ backgroundColor: 'rgba(255, 255, 255, 0.95)', border: '1px solid #e5e7eb' }}
                  />
                  <Legend />
                  <Bar dataKey="actual" name="실제" fill="#4f7eff" />
                  <Bar dataKey="predicted" name="예측" fill="#94a3b8" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </motion.div>
        )}

        {activeTab === 'resource' && resourcePrediction && (
          <motion.div
            key="resource"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="space-y-6"
          >
            {/* 리소스 예측 요약 */}
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h3 className="text-lg font-semibold mb-4">리소스 활용도 예측</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <div>
                  <p className="text-sm text-gray-600 mb-2">현재 활용도</p>
                  <div className="flex items-center gap-4">
                    <div className="flex-1">
                      <div className="w-full bg-gray-200 rounded-full h-3">
                        <div 
                          className={`h-3 rounded-full transition-all duration-300 ${
                            resourcePrediction.currentUtilization > 85 ? 'bg-red-500' :
                            resourcePrediction.currentUtilization > 70 ? 'bg-yellow-500' : 'bg-green-500'
                          }`}
                          style={{ width: `${resourcePrediction.currentUtilization}%` }}
                        />
                      </div>
                    </div>
                    <span className="text-xl font-bold">{resourcePrediction.currentUtilization}%</span>
                  </div>
                </div>
                
                <div>
                  <p className="text-sm text-gray-600 mb-2">예측 최대 활용도</p>
                  <div className="flex items-center gap-4">
                    <div className="flex-1">
                      <div className="w-full bg-gray-200 rounded-full h-3">
                        <div 
                          className="bg-purple-500 h-3 rounded-full transition-all duration-300"
                          style={{ width: `${Math.max(...resourcePrediction.predictedUtilization)}%` }}
                        />
                      </div>
                    </div>
                    <span className="text-xl font-bold">
                      {Math.max(...resourcePrediction.predictedUtilization)}%
                    </span>
                  </div>
                </div>
              </div>

              {/* 활용도 예측 차트 */}
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={resourceChartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="week" />
                  <YAxis domain={[0, 100]} />
                  <Tooltip 
                    formatter={(value: number) => `${value}%`}
                    contentStyle={{ backgroundColor: 'rgba(255, 255, 255, 0.95)', border: '1px solid #e5e7eb' }}
                  />
                  <Legend />
                  <Line 
                    type="monotone" 
                    dataKey="활용도" 
                    stroke="#8b5cf6" 
                    strokeWidth={3}
                    dot={{ r: 4 }}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="임계값" 
                    stroke="#ef4444" 
                    strokeDasharray="5 5"
                    dot={false}
                  />
                </LineChart>
              </ResponsiveContainer>

              {/* 병목 현상 경고 */}
              {resourcePrediction.bottlenecks.length > 0 && (
                <div className="mt-6">
                  <h4 className="font-medium text-gray-900 mb-3">병목 현상 예측</h4>
                  <div className="space-y-3">
                    {resourcePrediction.bottlenecks.map((bottleneck, idx) => (
                      <div key={idx} className="p-4 bg-red-50 rounded-lg">
                        <div className="flex items-start gap-3">
                          <span className="text-red-500 text-xl">⚠️</span>
                          <div>
                            <p className="font-medium text-red-900">
                              {bottleneck.resourceName} - {bottleneck.period}
                            </p>
                            <p className="text-sm text-red-700 mt-1">
                              활용도 {bottleneck.utilization}% 예상 - {bottleneck.impact}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* 최적화 제안 */}
              <div className="mt-6">
                <h4 className="font-medium text-gray-900 mb-3">최적화 제안</h4>
                <div className="space-y-2">
                  {resourcePrediction.optimizationSuggestions.map((suggestion, idx) => (
                    <div key={idx} className="flex items-start gap-2">
                      <span className="text-blue-500 mt-0.5">💡</span>
                      <p className="text-sm text-gray-600">{suggestion}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {activeTab === 'risk' && risks.length > 0 && (
          <motion.div
            key="risk"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="space-y-6"
          >
            {/* 리스크 매트릭스 */}
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h3 className="text-lg font-semibold mb-4">리스크 분석 매트릭스</h3>
              
              {/* 리스크 레이더 차트 */}
              <div className="mb-6">
                <ResponsiveContainer width="100%" height={300}>
                  <RadarChart data={riskRadarData}>
                    <PolarGrid />
                    <PolarAngleAxis dataKey="risk" />
                    <PolarRadiusAxis angle={90} domain={[0, 100]} />
                    <Radar 
                      name="발생 가능성" 
                      dataKey="probability" 
                      stroke="#4f7eff" 
                      fill="#4f7eff" 
                      fillOpacity={0.3} 
                    />
                    <Radar 
                      name="심각도" 
                      dataKey="severity" 
                      stroke="#ef4444" 
                      fill="#ef4444" 
                      fillOpacity={0.3} 
                    />
                    <Legend />
                  </RadarChart>
                </ResponsiveContainer>
              </div>

              {/* 리스크 목록 */}
              <div className="space-y-4">
                {risks.map((risk) => (
                  <motion.div
                    key={risk.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="border rounded-lg p-4"
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex items-center gap-3">
                        <span className="text-2xl">{getSeverityIcon(risk.severity)}</span>
                        <div>
                          <h4 className="font-medium text-gray-900 capitalize">{risk.type} 리스크</h4>
                          <span className={`inline-flex px-2 py-1 text-xs rounded-full ${getSeverityColor(risk.severity)}`}>
                            {risk.severity === 'high' ? '높음' : 
                             risk.severity === 'medium' ? '중간' : 
                             risk.severity === 'low' ? '낮음' : '심각'}
                          </span>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-sm text-gray-600">발생 가능성</p>
                        <p className="text-lg font-bold text-gray-900">
                          {Math.round(risk.probability * 100)}%
                        </p>
                      </div>
                    </div>
                    
                    <div className="space-y-2 mt-3">
                      <div>
                        <p className="text-sm font-medium text-gray-700">영향</p>
                        <p className="text-sm text-gray-600">{risk.impact}</p>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-700">대응 방안</p>
                        <p className="text-sm text-gray-600">{risk.mitigation}</p>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}