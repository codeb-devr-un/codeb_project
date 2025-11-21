'use client'

import React, { useState, useEffect } from 'react'
import { useAuth } from '@/lib/auth-context'
import { getDatabase, ref, onValue, off, push } from 'firebase/database'
import { app } from '@/lib/firebase'
import { motion } from 'framer-motion'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { 
  FileText, Search, Filter, Download, RefreshCcw,
  User, Shield, Activity, AlertCircle, Info,
  CheckCircle, XCircle, Clock, Calendar, Terminal,
  Loader2, ChevronDown, ChevronUp, Database,
  Zap, GitBranch, Mail, Lock
} from 'lucide-react'

interface LogEntry {
  id: string
  timestamp: string
  level: 'info' | 'warning' | 'error' | 'success'
  category: 'auth' | 'api' | 'database' | 'email' | 'system' | 'security' | 'user'
  action: string
  description: string
  userId?: string
  userEmail?: string
  metadata?: Record<string, any>
  ip?: string
  userAgent?: string
}

const levelConfig = {
  info: { icon: Info, color: 'text-blue-600', bgColor: 'bg-blue-100' },
  warning: { icon: AlertCircle, color: 'text-yellow-600', bgColor: 'bg-yellow-100' },
  error: { icon: XCircle, color: 'text-red-600', bgColor: 'bg-red-100' },
  success: { icon: CheckCircle, color: 'text-green-600', bgColor: 'bg-green-100' }
}

const categoryConfig = {
  auth: { label: '인증', icon: Lock },
  api: { label: 'API', icon: Zap },
  database: { label: '데이터베이스', icon: Database },
  email: { label: '이메일', icon: Mail },
  system: { label: '시스템', icon: Terminal },
  security: { label: '보안', icon: Shield },
  user: { label: '사용자', icon: User }
}

export default function LogsPage() {
  const { user, userProfile } = useAuth()
  const [logs, setLogs] = useState<LogEntry[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterLevel, setFilterLevel] = useState<string>('all')
  const [filterCategory, setFilterCategory] = useState<string>('all')
  const [filterDateRange, setFilterDateRange] = useState<string>('today')
  const [expandedLog, setExpandedLog] = useState<string | null>(null)
  const [autoRefresh, setAutoRefresh] = useState(false)

  // 로그 데이터 로드
  useEffect(() => {
    if (userProfile?.role !== 'admin') {
      setLoading(false)
      return
    }
    const db = getDatabase(app)
    const logsRef = ref(db, 'logs')
    
    const unsubscribe = onValue(logsRef, (snapshot) => {
      const data = snapshot.val()
      if (data) {
        const logsList = Object.entries(data).map(([id, log]: [string, any]) => ({
          id,
          ...log
        }))
        
        setLogs(logsList.sort((a, b) => 
          new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
        ))
      } else {
        setLogs([])
      }
      setLoading(false)
    })

    return () => off(logsRef)
  }, [])

  // 자동 새로고침
  useEffect(() => {
    if (!autoRefresh) return

    const interval = setInterval(() => {
      // 실제로는 Firebase에서 데이터를 다시 가져옴
      console.log('Auto refresh logs...')
    }, 5000) // 5초마다

    return () => clearInterval(interval)
  }, [autoRefresh])

  // 날짜 필터링
  const getDateFilter = () => {
    const now = new Date()
    switch (filterDateRange) {
      case 'today':
        return new Date(now.getFullYear(), now.getMonth(), now.getDate())
      case 'week':
        return new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
      case 'month':
        return new Date(now.getFullYear(), now.getMonth() - 1, now.getDate())
      case 'all':
      default:
        return null
    }
  }

  const dateFilter = getDateFilter()

  const filteredLogs = logs.filter(log => {
    const matchesSearch = 
      log.action.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.userEmail?.toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchesLevel = filterLevel === 'all' || log.level === filterLevel
    const matchesCategory = filterCategory === 'all' || log.category === filterCategory
    const matchesDate = !dateFilter || new Date(log.timestamp) >= dateFilter
    
    return matchesSearch && matchesLevel && matchesCategory && matchesDate
  })

  // 통계 계산
  const getStats = () => {
    const levelCounts = logs.reduce((acc, log) => {
      acc[log.level] = (acc[log.level] || 0) + 1
      return acc
    }, {} as Record<string, number>)

    return {
      total: logs.length,
      info: levelCounts.info || 0,
      warning: levelCounts.warning || 0,
      error: levelCounts.error || 0,
      success: levelCounts.success || 0
    }
  }

  const stats = getStats()

  // 샘플 로그 생성 (개발용)
  const generateSampleLog = async () => {
    const db = getDatabase(app)
    const sampleLog: Omit<LogEntry, 'id'> = {
      timestamp: new Date().toISOString(),
      level: ['info', 'warning', 'error', 'success'][Math.floor(Math.random() * 4)] as any,
      category: ['auth', 'api', 'database', 'email', 'system', 'security', 'user'][Math.floor(Math.random() * 7)] as any,
      action: '샘플 로그 생성',
      description: '테스트를 위한 샘플 로그입니다.',
      userId: user?.uid,
      userEmail: user?.email || '',
      metadata: {
        source: 'manual',
        version: '1.0.0'
      },
      ip: '127.0.0.1',
      userAgent: navigator.userAgent
    }
    
    await push(ref(db, 'logs'), sampleLog)
  }

  const handleExport = () => {
    const csv = [
      ['Timestamp', 'Level', 'Category', 'Action', 'Description', 'User', 'IP'].join(','),
      ...filteredLogs.map(log => [
        log.timestamp,
        log.level,
        log.category,
        log.action,
        log.description,
        log.userEmail || '',
        log.ip || ''
      ].join(','))
    ].join('\n')

    const blob = new Blob([csv], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `logs-${new Date().toISOString().split('T')[0]}.csv`
    a.click()
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin text-primary mx-auto" />
          <p className="mt-4 text-muted-foreground">로그를 불러오는 중...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="w-full max-w-[1920px] mx-auto px-6 py-6 space-y-6">
      {/* 헤더 */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">시스템 로그</h1>
          <p className="text-muted-foreground mt-1">시스템 활동 및 이벤트 기록을 확인합니다</p>
        </div>
        
        <div className="flex items-center gap-2">
          <Button
            variant={autoRefresh ? 'default' : 'outline'}
            size="sm"
            onClick={() => setAutoRefresh(!autoRefresh)}
          >
            <RefreshCcw className={`h-4 w-4 mr-2 ${autoRefresh ? 'animate-spin' : ''}`} />
            {autoRefresh ? '자동 새로고침 중' : '자동 새로고침'}
          </Button>
          <Button variant="outline" size="sm" onClick={handleExport}>
            <Download className="h-4 w-4 mr-2" />
            내보내기
          </Button>
          {process.env.NODE_ENV === 'development' && (
            <Button variant="outline" size="sm" onClick={generateSampleLog}>
              <Zap className="h-4 w-4 mr-2" />
              샘플 생성
            </Button>
          )}
        </div>
      </div>

      {/* 통계 카드 */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">전체 로그</p>
                <p className="text-2xl font-bold">{stats.total}</p>
              </div>
              <Activity className="h-8 w-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">정보</p>
                <p className="text-2xl font-bold text-blue-600">{stats.info}</p>
              </div>
              <Info className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">경고</p>
                <p className="text-2xl font-bold text-yellow-600">{stats.warning}</p>
              </div>
              <AlertCircle className="h-8 w-8 text-yellow-600" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">오류</p>
                <p className="text-2xl font-bold text-red-600">{stats.error}</p>
              </div>
              <XCircle className="h-8 w-8 text-red-600" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">성공</p>
                <p className="text-2xl font-bold text-green-600">{stats.success}</p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* 필터 */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="로그 검색..."
            className="pl-10"
          />
        </div>
        
        <Select value={filterDateRange} onValueChange={setFilterDateRange}>
          <SelectTrigger className="w-[140px]">
            <Calendar className="h-4 w-4 mr-2" />
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="today">오늘</SelectItem>
            <SelectItem value="week">최근 7일</SelectItem>
            <SelectItem value="month">최근 30일</SelectItem>
            <SelectItem value="all">전체</SelectItem>
          </SelectContent>
        </Select>
        
        <Tabs value={filterLevel} onValueChange={setFilterLevel}>
          <TabsList>
            <TabsTrigger value="all">전체</TabsTrigger>
            <TabsTrigger value="info">정보</TabsTrigger>
            <TabsTrigger value="warning">경고</TabsTrigger>
            <TabsTrigger value="error">오류</TabsTrigger>
            <TabsTrigger value="success">성공</TabsTrigger>
          </TabsList>
        </Tabs>
        
        <Select value={filterCategory} onValueChange={setFilterCategory}>
          <SelectTrigger className="w-[160px]">
            <SelectValue placeholder="카테고리" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">모든 카테고리</SelectItem>
            {Object.entries(categoryConfig).map(([value, config]) => (
              <SelectItem key={value} value={value}>{config.label}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* 로그 목록 */}
      {filteredLogs.length === 0 ? (
        <Card>
          <CardContent className="p-12 text-center">
            <FileText className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
            <h3 className="text-lg font-medium mb-2">로그가 없습니다</h3>
            <p className="text-muted-foreground">
              {searchTerm || filterLevel !== 'all' || filterCategory !== 'all'
                ? '다른 검색 조건을 시도해보세요.'
                : '아직 기록된 로그가 없습니다.'}
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-2">
          {filteredLogs.map((log) => {
            const LevelIcon = levelConfig[log.level].icon
            const CategoryIcon = categoryConfig[log.category].icon
            const isExpanded = expandedLog === log.id
            
            return (
              <motion.div
                key={log.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
              >
                <Card>
                  <CardContent className="p-4">
                    <div 
                      className="flex items-start justify-between cursor-pointer"
                      onClick={() => setExpandedLog(isExpanded ? null : log.id)}
                    >
                      <div className="flex items-start gap-3 flex-1">
                        <div className={`p-2 rounded-lg ${levelConfig[log.level].bgColor}`}>
                          <LevelIcon className={`h-4 w-4 ${levelConfig[log.level].color}`} />
                        </div>
                        
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <h3 className="font-medium">{log.action}</h3>
                            <Badge variant="outline" className="text-xs">
                              <CategoryIcon className="h-3 w-3 mr-1" />
                              {categoryConfig[log.category].label}
                            </Badge>
                          </div>
                          
                          <p className="text-sm text-muted-foreground">{log.description}</p>
                          
                          <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                            <div className="flex items-center gap-1">
                              <Clock className="h-3 w-3" />
                              <span>{new Date(log.timestamp).toLocaleString('ko-KR')}</span>
                            </div>
                            {log.userEmail && (
                              <div className="flex items-center gap-1">
                                <User className="h-3 w-3" />
                                <span>{log.userEmail}</span>
                              </div>
                            )}
                            {log.ip && (
                              <div className="flex items-center gap-1">
                                <GitBranch className="h-3 w-3" />
                                <span>{log.ip}</span>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                      
                      <Button variant="ghost" size="icon">
                        {isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                      </Button>
                    </div>
                    
                    {isExpanded && log.metadata && (
                      <div className="mt-4 p-4 bg-muted rounded-lg">
                        <h4 className="font-medium mb-2 text-sm">상세 정보</h4>
                        <pre className="text-xs overflow-auto">
                          {JSON.stringify(log.metadata, null, 2)}
                        </pre>
                        {log.userAgent && (
                          <div className="mt-3 text-xs">
                            <span className="font-medium">User Agent: </span>
                            <span className="text-muted-foreground">{log.userAgent}</span>
                          </div>
                        )}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </motion.div>
            )
          })}
        </div>
      )}
    </div>
  )
}