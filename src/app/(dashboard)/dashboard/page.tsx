'use client'

import React, { useEffect, useState, useMemo } from 'react'
import { useAuth } from '@/lib/auth-context'
import { useWorkspace } from '@/lib/workspace-context'
import { getDashboardStats } from '@/actions/dashboard'
import { getRandomQuote } from '@/constants/quotes'
import { HRDashboard } from '@/components/dashboard/layouts/HRDashboard'
import { ProjectDashboard } from '@/components/dashboard/layouts/ProjectDashboard'
import { EnterpriseDashboard } from '@/components/dashboard/layouts/EnterpriseDashboard'

// ===========================================
// Glass Morphism Dashboard Page
// ===========================================

export default function DashboardPage() {
  const { userProfile } = useAuth()
  const { currentWorkspace, loading: workspaceLoading } = useWorkspace()
  const [stats, setStats] = useState({
    totalTasks: 0,
    completedTasks: 0,
    incompleteTasks: 0,
    overdueTasks: 0
  })

  // 워크스페이스 타입 확인
  const isHROnly = currentWorkspace?.type === 'HR_ONLY'
  const isProjectOnly = currentWorkspace?.type === 'PROJECT_ONLY'

  // HR 통계 상태
  const [hrStats, setHrStats] = useState({
    totalEmployees: 12,
    presentToday: 10,
    absentToday: 2,
    onLeave: 1,
    lateArrivals: 0,
    pendingApprovals: 3
  })
  const [loading, setLoading] = useState(true)
  const [currentTime, setCurrentTime] = useState(new Date())
  const [weather, setWeather] = useState({
    temp: 18,
    condition: 'sunny',
    humidity: 65,
    wind: 12
  })
  const [todayAttendance, setTodayAttendance] = useState<any>(null)
  const [announcements, setAnnouncements] = useState([
    { id: 1, title: '11월 전사 회의 안내', date: '2025-11-23', isNew: true },
    { id: 2, title: '연말 휴가 신청 마감 안내', date: '2025-11-22', isNew: true },
    { id: 3, title: '보안 정책 업데이트', date: '2025-11-20', isNew: false },
  ])
  const [boardPosts, setBoardPosts] = useState([
    { id: 1, title: '점심 메뉴 추천 받습니다', author: '김철수', team: '개발팀', date: '11.29', comments: 5 },
    { id: 2, title: '개발팀 스터디 모집', author: '이영희', team: '디자인팀', date: '11.28', comments: 12 },
    { id: 3, title: '주차장 이용 관련 문의', author: '박민수', team: '인사팀', date: '11.27', comments: 3 },
    { id: 4, title: '다음 주 워크샵 장소 투표해주세요', author: '정수진', team: '경영지원팀', date: '11.26', comments: 24 },
  ])

  // 명언 - 페이지 로드 시 한번만 생성
  const quote = useMemo(() => getRandomQuote(), [])

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000)
    return () => clearInterval(timer)
  }, [])

  useEffect(() => {
    const fetchData = async () => {
      try {
        const data = await getDashboardStats(currentWorkspace?.id)
        setStats(data.stats)
        setLoading(false)
      } catch (error) {
        console.error('Error fetching dashboard data:', error)
        setLoading(false)
      }
    }

    if (!workspaceLoading) {
      if (userProfile && currentWorkspace) {
        fetchData()
        loadAttendance()
      } else {
        setLoading(false)
      }
    }
  }, [userProfile, currentWorkspace, workspaceLoading])

  const loadAttendance = async () => {
    if (!userProfile?.uid) return
    try {
      const response = await fetch('/api/attendance', {
        headers: { 'x-user-id': userProfile.uid }
      })
      const data = await response.json()
      setTodayAttendance(data.today)
    } catch (error) {
      console.error('Failed to load attendance:', error)
    }
  }

  const getGreeting = () => {
    const hour = currentTime.getHours()
    if (hour < 12) return '좋은 아침입니다'
    if (hour < 18) return '좋은 오후입니다'
    return '좋은 저녁입니다'
  }

  if (loading || workspaceLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-lime-400"></div>
      </div>
    )
  }

  // ==========================================
  // HR_ONLY 워크스페이스 전용 대시보드
  // ==========================================
  if (isHROnly) {
    return (
      <HRDashboard
        userProfile={userProfile}
        currentWorkspace={currentWorkspace}
        currentTime={currentTime}
        quote={quote}
        weather={weather}
        todayAttendance={todayAttendance}
        hrStats={hrStats}
        announcements={announcements}
        boardPosts={boardPosts}
        getGreeting={getGreeting}
      />
    )
  }

  // ==========================================
  // PROJECT_ONLY (프리랜서) 워크스페이스 전용 대시보드
  // ==========================================
  if (isProjectOnly) {
    return (
      <ProjectDashboard
        userProfile={userProfile}
        currentWorkspace={currentWorkspace}
        currentTime={currentTime}
        quote={quote}
        weather={weather}
        stats={stats}
        announcements={announcements}
        boardPosts={boardPosts}
        getGreeting={getGreeting}
      />
    )
  }

  // ==========================================
  // ENTERPRISE 워크스페이스 대시보드 (전체 기능)
  // ==========================================
  return (
    <EnterpriseDashboard
      userProfile={userProfile}
      currentTime={currentTime}
      quote={quote}
      weather={weather}
      todayAttendance={todayAttendance}
      stats={stats}
      announcements={announcements}
      boardPosts={boardPosts}
      getGreeting={getGreeting}
    />
  )
}
