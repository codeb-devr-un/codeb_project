'use client'

import React, { useState, useEffect } from 'react'
import { useAuth } from '@/lib/auth-context'
import { getDatabase, ref, onValue, off, query, orderByChild, equalTo } from 'firebase/database'
import { app } from '@/lib/firebase'
import { motion } from 'framer-motion'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { 
  MessageSquare, Calendar, Clock, User, Search, 
  CheckCircle, XCircle, AlertCircle, Loader2,
  HeadphonesIcon, Filter, ChevronRight, Timer
} from 'lucide-react'

interface SupportSession {
  id: string
  customerId: string
  customerName: string
  customerEmail: string
  operatorId: string
  operatorName: string
  projectId?: string
  projectName?: string
  startTime: string
  endTime?: string
  duration?: number
  status: 'active' | 'completed' | 'abandoned'
  rating?: number
  feedback?: string
  chatCount?: number
  issue?: string
  resolution?: string
}

const statusConfig = {
  active: { label: '진행중', color: 'bg-green-500', icon: AlertCircle },
  completed: { label: '완료', color: 'bg-blue-500', icon: CheckCircle },
  abandoned: { label: '중단', color: 'bg-gray-500', icon: XCircle }
}

export default function SupportHistoryPage() {
  const { user, userProfile } = useAuth()
  const [sessions, setSessions] = useState<SupportSession[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterStatus, setFilterStatus] = useState<string>('all')
  const [selectedSession, setSelectedSession] = useState<SupportSession | null>(null)

  useEffect(() => {
    if (!user || !userProfile) return

    const db = getDatabase(app)
    let sessionsQuery

    // 권한에 따른 쿼리 설정
    if (userProfile.role === 'customer' || userProfile.role === 'external') {
      // 고객은 자신의 상담 이력만
      sessionsQuery = query(
        ref(db, 'supportSessions'),
        orderByChild('customerId'),
        equalTo(user.uid)
      )
    } else if (userProfile.role === 'manager') {
      // 매니저는 자신이 담당한 상담만
      sessionsQuery = query(
        ref(db, 'supportSessions'),
        orderByChild('operatorId'),
        equalTo(user.uid)
      )
    } else {
      // 관리자는 모든 상담 이력
      sessionsQuery = ref(db, 'supportSessions')
    }

    const unsubscribe = onValue(sessionsQuery, (snapshot) => {
      const data = snapshot.val()
      if (data) {
        const sessionsList = Object.entries(data).map(([id, session]: [string, any]) => ({
          id,
          ...session,
          duration: session.endTime 
            ? Math.floor((new Date(session.endTime).getTime() - new Date(session.startTime).getTime()) / 1000 / 60)
            : null
        }))
        
        setSessions(sessionsList.sort((a, b) => 
          new Date(b.startTime).getTime() - new Date(a.startTime).getTime()
        ))
      } else {
        setSessions([])
      }
      setLoading(false)
    })

    return () => off(sessionsQuery)
  }, [user, userProfile])

  const filteredSessions = sessions.filter(session => {
    const matchesSearch = 
      session.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      session.customerEmail.toLowerCase().includes(searchTerm.toLowerCase()) ||
      session.operatorName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      session.projectName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      session.issue?.toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchesStatus = filterStatus === 'all' || session.status === filterStatus
    
    return matchesSearch && matchesStatus
  })

  const getStats = () => {
    const totalSessions = sessions.length
    const completedSessions = sessions.filter(s => s.status === 'completed').length
    const averageDuration = sessions
      .filter(s => s.duration)
      .reduce((acc, s) => acc + (s.duration || 0), 0) / completedSessions || 0
    const satisfactionRate = sessions
      .filter(s => s.rating)
      .reduce((acc, s) => acc + (s.rating || 0), 0) / sessions.filter(s => s.rating).length || 0

    return {
      totalSessions,
      completedSessions,
      averageDuration: Math.round(averageDuration),
      satisfactionRate: satisfactionRate.toFixed(1)
    }
  }

  const stats = getStats()

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin text-primary mx-auto" />
          <p className="mt-4 text-muted-foreground">상담 이력을 불러오는 중...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="w-full max-w-[1920px] mx-auto px-6 py-6 space-y-6">
      {/* 헤더 */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">상담 이력</h1>
        <p className="text-muted-foreground mt-1">
          {userProfile?.role === 'customer' || userProfile?.role === 'external' 
            ? '나의 상담 이력을 확인하세요'
            : '고객 상담 이력을 관리하고 분석합니다'}
        </p>
      </div>

      {/* 통계 카드 */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">전체 상담</p>
                <p className="text-2xl font-bold">{stats.totalSessions}</p>
              </div>
              <MessageSquare className="h-8 w-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">완료된 상담</p>
                <p className="text-2xl font-bold text-green-600">{stats.completedSessions}</p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">평균 상담 시간</p>
                <p className="text-2xl font-bold">{stats.averageDuration}분</p>
              </div>
              <Timer className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">만족도</p>
                <p className="text-2xl font-bold text-yellow-600">{stats.satisfactionRate}/5</p>
              </div>
              <HeadphonesIcon className="h-8 w-8 text-yellow-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* 검색 및 필터 */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="상담 내역 검색..."
            className="pl-10"
          />
        </div>
        
        <Tabs value={filterStatus} onValueChange={setFilterStatus}>
          <TabsList>
            <TabsTrigger value="all">전체</TabsTrigger>
            <TabsTrigger value="active">진행중</TabsTrigger>
            <TabsTrigger value="completed">완료</TabsTrigger>
            <TabsTrigger value="abandoned">중단</TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      {/* 상담 이력 목록 */}
      {filteredSessions.length === 0 ? (
        <Card>
          <CardContent className="p-12 text-center">
            <MessageSquare className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
            <h3 className="text-lg font-medium mb-2">상담 이력이 없습니다</h3>
            <p className="text-muted-foreground">
              {searchTerm || filterStatus !== 'all'
                ? '다른 검색 조건을 시도해보세요.'
                : '아직 상담 이력이 없습니다.'}
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {filteredSessions.map((session) => {
            const StatusIcon = statusConfig[session.status].icon
            
            return (
              <motion.div
                key={session.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
              >
                <Card 
                  className="hover:shadow-lg transition-shadow cursor-pointer"
                  onClick={() => setSelectedSession(session)}
                >
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-3">
                          <div className={`w-3 h-3 rounded-full ${statusConfig[session.status].color}`} />
                          <h3 className="font-semibold">
                            {userProfile?.role === 'customer' || userProfile?.role === 'external'
                              ? `상담원: ${session.operatorName}`
                              : `고객: ${session.customerName}`}
                          </h3>
                          <Badge variant="outline">
                            <StatusIcon className="h-3 w-3 mr-1" />
                            {statusConfig[session.status].label}
                          </Badge>
                          {session.projectName && (
                            <Badge variant="secondary">
                              {session.projectName}
                            </Badge>
                          )}
                        </div>
                        
                        {session.issue && (
                          <p className="text-sm text-muted-foreground mb-2">
                            문의: {session.issue}
                          </p>
                        )}
                        
                        <div className="flex items-center gap-4 text-sm text-muted-foreground">
                          <div className="flex items-center gap-1">
                            <Calendar className="h-4 w-4" />
                            <span>{new Date(session.startTime).toLocaleDateString('ko-KR')}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Clock className="h-4 w-4" />
                            <span>{new Date(session.startTime).toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' })}</span>
                          </div>
                          {session.duration && (
                            <div className="flex items-center gap-1">
                              <Timer className="h-4 w-4" />
                              <span>{session.duration}분</span>
                            </div>
                          )}
                          {session.rating && (
                            <div className="flex items-center gap-1">
                              <span>⭐</span>
                              <span>{session.rating}/5</span>
                            </div>
                          )}
                        </div>
                      </div>
                      
                      <ChevronRight className="h-5 w-5 text-muted-foreground" />
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            )
          })}
        </div>
      )}

      {/* 상담 상세 모달 */}
      {selectedSession && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={() => setSelectedSession(null)}>
          <Card className="w-full max-w-2xl" onClick={(e) => e.stopPropagation()}>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>상담 상세 정보</CardTitle>
                <Button variant="ghost" size="sm" onClick={() => setSelectedSession(null)}>
                  <XCircle className="h-4 w-4" />
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-muted-foreground">고객</p>
                    <p className="font-medium">{selectedSession.customerName}</p>
                    <p className="text-sm text-muted-foreground">{selectedSession.customerEmail}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">상담원</p>
                    <p className="font-medium">{selectedSession.operatorName}</p>
                  </div>
                </div>
                
                {selectedSession.projectName && (
                  <div>
                    <p className="text-sm text-muted-foreground">프로젝트</p>
                    <p className="font-medium">{selectedSession.projectName}</p>
                  </div>
                )}
                
                <div>
                  <p className="text-sm text-muted-foreground">상담 시간</p>
                  <p className="font-medium">
                    {new Date(selectedSession.startTime).toLocaleString('ko-KR')}
                    {selectedSession.endTime && (
                      <> ~ {new Date(selectedSession.endTime).toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' })}</>
                    )}
                  </p>
                  {selectedSession.duration && (
                    <p className="text-sm text-muted-foreground">소요 시간: {selectedSession.duration}분</p>
                  )}
                </div>
                
                {selectedSession.issue && (
                  <div>
                    <p className="text-sm text-muted-foreground">문의 내용</p>
                    <p className="font-medium">{selectedSession.issue}</p>
                  </div>
                )}
                
                {selectedSession.resolution && (
                  <div>
                    <p className="text-sm text-muted-foreground">해결 내용</p>
                    <p className="font-medium">{selectedSession.resolution}</p>
                  </div>
                )}
                
                {selectedSession.rating && (
                  <div>
                    <p className="text-sm text-muted-foreground">만족도 평가</p>
                    <div className="flex items-center gap-2">
                      <div className="flex">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <span key={star} className="text-lg">
                            {star <= selectedSession.rating! ? '⭐' : '☆'}
                          </span>
                        ))}
                      </div>
                      <span className="text-sm text-muted-foreground">({selectedSession.rating}/5)</span>
                    </div>
                    {selectedSession.feedback && (
                      <p className="text-sm mt-2">{selectedSession.feedback}</p>
                    )}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}