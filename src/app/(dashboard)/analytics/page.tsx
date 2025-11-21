'use client'

import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import { 
  BarChart3, TrendingUp, Users, DollarSign, Calendar,
  ArrowUp, ArrowDown, Activity, Target, PieChart,
  LineChart, Download, Filter
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { useAuth } from '@/lib/auth-context'

export default function AnalyticsPage() {
  const { userProfile } = useAuth()
  const [timeRange, setTimeRange] = useState('month')
  const [selectedProject, setSelectedProject] = useState('all')

  const stats = [
    { 
      label: '총 매출', 
      value: '₩125.4M', 
      change: '+23%', 
      trend: 'up', 
      icon: DollarSign,
      color: 'text-green-600',
      bgColor: 'bg-green-100'
    },
    { 
      label: '완료 프로젝트', 
      value: '42', 
      change: '+12%', 
      trend: 'up', 
      icon: Target,
      color: 'text-blue-600',
      bgColor: 'bg-blue-100'
    },
    { 
      label: '활성 사용자', 
      value: '1,234', 
      change: '+5%', 
      trend: 'up', 
      icon: Users,
      color: 'text-purple-600',
      bgColor: 'bg-purple-100'
    },
    { 
      label: '평균 완료 시간', 
      value: '18일', 
      change: '-8%', 
      trend: 'down', 
      icon: Calendar,
      color: 'text-orange-600',
      bgColor: 'bg-orange-100'
    },
  ]

  const projectPerformance = [
    { name: '웹사이트 리뉴얼', revenue: 45000000, tasks: 124, completion: 92 },
    { name: '모바일 앱 개발', revenue: 38000000, tasks: 89, completion: 78 },
    { name: 'ERP 시스템 구축', revenue: 62000000, tasks: 156, completion: 85 },
    { name: 'AI 챗봇 개발', revenue: 28000000, tasks: 67, completion: 95 },
  ]

  return (
    <div className="w-full max-w-[1920px] mx-auto px-6 py-6 space-y-6">
      {/* 헤더 */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">통계 분석</h1>
          <p className="text-muted-foreground mt-1">프로젝트와 팀의 성과를 한눈에 확인하세요</p>
        </div>
        
        <div className="flex items-center gap-3">
          {/* 기간 선택 */}
          <Select value={timeRange} onValueChange={setTimeRange}>
            <SelectTrigger className="w-[140px]">
              <Calendar className="h-4 w-4 mr-2" />
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="week">이번 주</SelectItem>
              <SelectItem value="month">이번 달</SelectItem>
              <SelectItem value="quarter">이번 분기</SelectItem>
              <SelectItem value="year">올해</SelectItem>
            </SelectContent>
          </Select>
          
          <Button variant="outline">
            <Download className="h-4 w-4 mr-2" />
            리포트 다운로드
          </Button>
        </div>
      </div>

      {/* 주요 지표 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => (
          <Card key={index}>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">{stat.label}</p>
                  <p className="text-2xl font-bold">{stat.value}</p>
                  <div className="flex items-center gap-1">
                    {stat.trend === 'up' ? (
                      <ArrowUp className="h-4 w-4 text-green-600" />
                    ) : (
                      <ArrowDown className="h-4 w-4 text-red-600" />
                    )}
                    <span className={cn(
                      "text-sm font-medium",
                      stat.trend === 'up' ? 'text-green-600' : 'text-red-600'
                    )}>
                      {stat.change}
                    </span>
                    <span className="text-sm text-muted-foreground">vs 지난달</span>
                  </div>
                </div>
                <div className={cn("p-3 rounded-full", stat.bgColor)}>
                  <stat.icon className={cn("h-6 w-6", stat.color)} />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* 차트 섹션 */}
      <Tabs defaultValue="revenue" className="space-y-4">
        <TabsList>
          <TabsTrigger value="revenue">매출 추이</TabsTrigger>
          <TabsTrigger value="projects">프로젝트 현황</TabsTrigger>
          <TabsTrigger value="team">팀 성과</TabsTrigger>
          <TabsTrigger value="clients">고객 분석</TabsTrigger>
        </TabsList>

        <TabsContent value="revenue" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <LineChart className="h-5 w-5" />
                월별 매출 추이
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-[400px] flex items-center justify-center text-muted-foreground">
                <p>차트 컴포넌트가 여기에 표시됩니다</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="projects" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <PieChart className="h-5 w-5" />
                  프로젝트 상태별 분포
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-[300px] flex items-center justify-center text-muted-foreground">
                  <p>파이 차트가 여기에 표시됩니다</p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="h-5 w-5" />
                  프로젝트별 진행률
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-[300px] flex items-center justify-center text-muted-foreground">
                  <p>막대 차트가 여기에 표시됩니다</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="team" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>팀원별 성과</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {['김개발', '이디자인', '박기획', '최마케팅'].map((member, idx) => (
                  <div key={idx} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                        <span className="font-medium">{member[0]}</span>
                      </div>
                      <div>
                        <p className="font-medium">{member}</p>
                        <p className="text-sm text-muted-foreground">완료 작업: {23 + idx * 7}개</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-medium">{95 - idx * 2}%</p>
                      <p className="text-sm text-muted-foreground">효율성</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="clients" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>주요 고객사별 프로젝트</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {projectPerformance.map((project, idx) => (
                  <div key={idx} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="font-medium">{project.name}</span>
                      <span className="text-sm text-muted-foreground">
                        ₩{(project.revenue / 1000000).toFixed(1)}M
                      </span>
                    </div>
                    <div className="w-full bg-secondary rounded-full h-2">
                      <div 
                        className="bg-primary h-2 rounded-full transition-all"
                        style={{ width: `${project.completion}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}