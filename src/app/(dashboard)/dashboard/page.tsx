'use client'

import React, { useEffect, useState } from 'react'
import { useAuth } from '@/lib/auth-context'
import Link from 'next/link'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { 
  LayoutDashboard, FolderOpen, Users, DollarSign, 
  TrendingUp, Calendar, Bell, MessageSquare,
  Plus, ChevronRight, Activity, Briefcase,
  AlertCircle, CheckCircle2, Clock, BarChart3,
  UserPlus, Mail, FileText, Target
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { app } from '@/lib/firebase'
import { getDatabase, ref, onValue, get } from 'firebase/database'

// 권한별 대시보드 컴포넌트
function AdminDashboard({ userProfile }: { userProfile: any }) {
  const [stats, setStats] = useState([
    { label: '전체 프로젝트', value: '0', change: '+0%', icon: FolderOpen, color: 'text-blue-600' },
    { label: '활성 사용자', value: '0', change: '+0%', icon: Users, color: 'text-green-600' },
    { label: '활성 작업', value: '0', change: '+0%', icon: Briefcase, color: 'text-purple-600' },
    { label: '평균 완료율', value: '0%', change: '+0%', icon: TrendingUp, color: 'text-orange-600' },
  ])
  
  const [projects, setProjects] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const db = getDatabase(app)
    
    // 프로젝트 통계 가져오기
    const fetchStats = async () => {
      try {
        // 프로젝트 수
        const projectsSnapshot = await get(ref(db, 'projects'))
        const projectsData = projectsSnapshot.val() || {}
        const totalProjects = Object.keys(projectsData).length
        const activeProjects = Object.values(projectsData as any).filter((p: any) => p.status === 'active').length
        
        // 사용자 수
        const usersSnapshot = await get(ref(db, 'users'))
        const usersData = usersSnapshot.val() || {}
        const totalUsers = Object.keys(usersData).length
        
        // 작업 수
        const tasksSnapshot = await get(ref(db, 'tasks'))
        const tasksData = tasksSnapshot.val() || {}
        let totalTasks = 0
        let completedTasks = 0
        
        Object.values(tasksData as any).forEach((projectTasks: any) => {
          if (projectTasks && typeof projectTasks === 'object') {
            const tasks = Object.values(projectTasks)
            totalTasks += tasks.length
            completedTasks += tasks.filter((t: any) => t.status === 'done').length
          }
        })
        
        const completionRate = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0
        
        setStats([
          { label: '전체 프로젝트', value: totalProjects.toString(), change: '+12%', icon: FolderOpen, color: 'text-blue-600' },
          { label: '활성 사용자', value: totalUsers.toString(), change: '+8%', icon: Users, color: 'text-green-600' },
          { label: '활성 작업', value: (totalTasks - completedTasks).toString(), change: '+5%', icon: Briefcase, color: 'text-purple-600' },
          { label: '평균 완료율', value: `${completionRate}%`, change: '+5%', icon: TrendingUp, color: 'text-orange-600' },
        ])
        
        // 최근 프로젝트 3개 가져오기
        const projectsList = Object.entries(projectsData)
          .map(([id, data]: [string, any]) => ({ id, ...data }))
          .filter((p: any) => p.status === 'active' || p.status === 'development')
          .sort((a: any, b: any) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
          .slice(0, 3)
          .map((p: any) => ({
            id: p.id,
            name: p.name,
            client: p.client || '미지정',
            progress: p.progress || 0,
            status: p.status,
            deadline: p.endDate
          }))
        
        setProjects(projectsList)
        setLoading(false)
      } catch (error) {
        console.error('Error fetching dashboard stats:', error)
        setLoading(false)
      }
    }
    
    fetchStats()
  }, [])

  return (
    <div className="w-full max-w-[1920px] mx-auto p-6 space-y-6">
      {/* 헤더 */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">관리자 대시보드</h1>
          <p className="text-muted-foreground mt-1">전체 플랫폼 현황을 한눈에 확인하세요</p>
        </div>
        <div className="flex gap-3">
          <Button variant="outline">
            <BarChart3 className="mr-2 h-4 w-4" />
            리포트 생성
          </Button>
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            새 프로젝트
          </Button>
        </div>
      </div>

      {/* 통계 카드 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => (
          <Card key={index}>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">{stat.label}</p>
                  <p className="text-2xl font-bold mt-1">{stat.value}</p>
                  <p className="text-xs text-green-600 mt-1">{stat.change}</p>
                </div>
                <stat.icon className={cn("h-8 w-8", stat.color)} />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* 메인 콘텐츠 */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* 프로젝트 목록 */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              진행중인 프로젝트
              <Button variant="ghost" size="sm">
                전체보기 <ChevronRight className="ml-1 h-4 w-4" />
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {loading ? (
                <div className="text-center py-8 text-muted-foreground">
                  데이터를 불러오는 중...
                </div>
              ) : projects.length > 0 ? (
                projects.map((project) => (
                  <Link key={project.id} href={`/projects/${project.id}`}>
                    <div className="border rounded-lg p-4 hover:bg-muted/50 transition-colors cursor-pointer">
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="font-semibold">{project.name}</h3>
                        <Badge variant={project.status === 'active' || project.status === 'development' ? 'default' : 'secondary'}>
                          {project.status === 'active' ? '진행중' : project.status === 'development' ? '개발중' : '검토중'}
                        </Badge>
                      </div>
                      <div className="space-y-2">
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-muted-foreground">클라이언트: {project.client}</span>
                          <span className="text-muted-foreground">마감: {new Date(project.deadline).toLocaleDateString('ko-KR')}</span>
                        </div>
                        <Progress value={project.progress} className="h-2" />
                        <p className="text-xs text-right text-muted-foreground">{project.progress}%</p>
                      </div>
                    </div>
                  </Link>
                ))
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  진행중인 프로젝트가 없습니다.
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* 최근 활동 */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5" />
              실시간 활동
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <ActivityItem icon={UserPlus} text="새 직원 등록" time="방금 전" color="text-blue-600" />
              <ActivityItem icon={FileText} text="프로젝트 계약 체결" time="5분 전" color="text-green-600" />
              <ActivityItem icon={AlertCircle} text="서버 점검 예정" time="1시간 전" color="text-orange-600" />
              <ActivityItem icon={CheckCircle2} text="백업 완료" time="3시간 전" color="text-purple-600" />
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

function EmployeeDashboard({ userProfile }: { userProfile: any }) {
  const [myTasks, setMyTasks] = useState<any[]>([])
  const [stats, setStats] = useState({
    assigned: 0,
    inProgress: 0,
    completed: 0,
    weeklyGoal: 0
  })
  const [loading, setLoading] = useState(true)
  
  useEffect(() => {
    const db = getDatabase(app)
    
    const fetchEmployeeData = async () => {
      try {
        // 모든 프로젝트의 태스크 가져오기
        const tasksSnapshot = await get(ref(db, 'tasks'))
        const tasksData = tasksSnapshot.val() || {}
        
        let allTasks: any[] = []
        let assignedCount = 0
        let inProgressCount = 0
        let completedCount = 0
        
        // 각 프로젝트의 태스크 확인
        Object.entries(tasksData).forEach(([projectId, projectTasks]: [string, any]) => {
          if (projectTasks && typeof projectTasks === 'object') {
            Object.entries(projectTasks).forEach(([taskId, task]: [string, any]) => {
              if (task.assignee === userProfile?.displayName || task.assigneeId === userProfile?.uid) {
                const taskWithId = { id: taskId, projectId, ...task }
                allTasks.push(taskWithId)
                
                if (task.status === 'done') {
                  completedCount++
                } else if (task.status === 'in-progress' || task.status === 'in_progress') {
                  inProgressCount++
                }
                assignedCount++
              }
            })
          }
        })
        
        // 완료되지 않은 태스크 중 최근 3개
        const activeTasks = allTasks
          .filter(task => task.status !== 'done')
          .sort((a, b) => {
            const dateA = a.dueDate ? new Date(a.dueDate).getTime() : Infinity
            const dateB = b.dueDate ? new Date(b.dueDate).getTime() : Infinity
            return dateA - dateB
          })
          .slice(0, 3)
        
        // 프로젝트 정보 가져오기
        const projectsSnapshot = await get(ref(db, 'projects'))
        const projectsData = projectsSnapshot.val() || {}
        
        const tasksWithProjects = activeTasks.map(task => {
          const project = projectsData[task.projectId]
          return {
            ...task,
            projectName: project?.name || '알 수 없는 프로젝트'
          }
        })
        
        const weeklyGoal = assignedCount > 0 ? Math.round((completedCount / assignedCount) * 100) : 0
        
        setMyTasks(tasksWithProjects)
        setStats({
          assigned: assignedCount,
          inProgress: inProgressCount,
          completed: completedCount,
          weeklyGoal
        })
        setLoading(false)
      } catch (error) {
        console.error('Error fetching employee data:', error)
        setLoading(false)
      }
    }
    
    if (userProfile) {
      fetchEmployeeData()
    }
  }, [userProfile])

  return (
    <div className="w-full max-w-[1920px] mx-auto p-6 space-y-6">
      {/* 헤더 */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">내 작업 공간</h1>
          <p className="text-muted-foreground mt-1">오늘도 멋진 하루 되세요, {userProfile?.displayName}님!</p>
        </div>
        <div className="flex gap-3">
          <Button variant="outline">
            <Calendar className="mr-2 h-4 w-4" />
            일정 관리
          </Button>
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            작업 추가
          </Button>
        </div>
      </div>

      {/* 통계 카드 */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <StatCard icon={Briefcase} label="할당된 작업" value={stats.assigned.toString()} color="text-blue-600" />
        <StatCard icon={Clock} label="진행중" value={stats.inProgress.toString()} color="text-orange-600" />
        <StatCard icon={CheckCircle2} label="완료됨" value={stats.completed.toString()} color="text-green-600" />
        <StatCard icon={Target} label="완료율" value={`${stats.weeklyGoal}%`} color="text-purple-600" />
      </div>

      {/* 메인 콘텐츠 */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* 내 작업 목록 */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>오늘의 작업</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {loading ? (
                <div className="text-center py-8 text-muted-foreground">
                  데이터를 불러오는 중...
                </div>
              ) : myTasks.length > 0 ? (
                myTasks.map((task) => (
                  <Link key={task.id} href={`/projects/${task.projectId}`}>
                    <div className="border rounded-lg p-4 hover:bg-muted/50 transition-colors cursor-pointer">
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="font-semibold">{task.title}</h3>
                        <Badge variant={
                          task.priority === 'high' || task.priority === 'urgent' ? 'destructive' : 
                          task.priority === 'medium' ? 'default' : 'secondary'
                        }>
                          {task.priority === 'high' || task.priority === 'urgent' ? '높음' : 
                           task.priority === 'medium' ? '보통' : '낮음'}
                        </Badge>
                      </div>
                      <div className="flex items-center justify-between text-sm text-muted-foreground">
                        <span>{task.projectName}</span>
                        <span>{task.dueDate ? new Date(task.dueDate).toLocaleDateString('ko-KR') : '기한 없음'}</span>
                      </div>
                    </div>
                  </Link>
                ))
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  할당된 작업이 없습니다.
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* 팀 활동 */}
        <Card>
          <CardHeader>
            <CardTitle>팀 활동</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <TeamActivity user="김개발" action="코드 커밋" project="웹사이트 리뉴얼" time="10분 전" />
              <TeamActivity user="이디자인" action="디자인 업데이트" project="모바일 앱" time="30분 전" />
              <TeamActivity user="박기획" action="문서 공유" project="ERP 시스템" time="1시간 전" />
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

function SupportDashboard({ userProfile }: { userProfile: any }) {
  const [tickets, setTickets] = useState<any[]>([])
  const [stats, setStats] = useState({
    waiting: 0,
    avgResponseTime: 0,
    resolvedToday: 0,
    satisfaction: 0
  })
  const [loading, setLoading] = useState(true)
  
  useEffect(() => {
    const db = getDatabase(app)
    
    const fetchSupportData = async () => {
      try {
        // 채팅 요청 데이터 가져오기
        const chatRequestsSnapshot = await get(ref(db, 'chatRequests'))
        const chatRequestsData = chatRequestsSnapshot.val() || {}
        
        const allTickets = Object.entries(chatRequestsData)
          .map(([id, data]: [string, any]) => ({
            id,
            ...data
          }))
          .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
          .slice(0, 5)
        
        // 통계 계산
        const today = new Date()
        today.setHours(0, 0, 0, 0)
        
        let waitingCount = 0
        let resolvedTodayCount = 0
        let totalResponseTime = 0
        let responseCount = 0
        
        Object.values(chatRequestsData).forEach((request: any) => {
          if (request.status === 'waiting' || request.status === 'open') {
            waitingCount++
          }
          
          if (request.resolvedAt) {
            const resolvedDate = new Date(request.resolvedAt)
            if (resolvedDate >= today) {
              resolvedTodayCount++
            }
            
            if (request.firstResponseAt && request.createdAt) {
              const responseTime = new Date(request.firstResponseAt).getTime() - new Date(request.createdAt).getTime()
              totalResponseTime += responseTime
              responseCount++
            }
          }
        })
        
        const avgResponseMinutes = responseCount > 0 
          ? Math.round(totalResponseTime / responseCount / 1000 / 60) 
          : 5
        
        setTickets(allTickets)
        setStats({
          waiting: waitingCount,
          avgResponseTime: avgResponseMinutes,
          resolvedToday: resolvedTodayCount,
          satisfaction: 4.8
        })
        setLoading(false)
      } catch (error) {
        console.error('Error fetching support data:', error)
        setLoading(false)
      }
    }
    
    fetchSupportData()
  }, [])

  return (
    <div className="w-full max-w-[1920px] mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">상담 센터</h1>
          <p className="text-muted-foreground mt-1">고객 만족을 위한 빠른 응대</p>
        </div>
        <Button>
          <MessageSquare className="mr-2 h-4 w-4" />
          실시간 채팅
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <StatCard icon={MessageSquare} label="대기중 티켓" value={stats.waiting.toString()} color="text-red-600" />
        <StatCard icon={Clock} label="평균 응답시간" value={`${stats.avgResponseTime}분`} color="text-blue-600" />
        <StatCard icon={CheckCircle2} label="오늘 해결" value={stats.resolvedToday.toString()} color="text-green-600" />
        <StatCard icon={Users} label="만족도" value={`${stats.satisfaction}/5`} color="text-yellow-600" />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>상담 티켓</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {loading ? (
              <div className="text-center py-8 text-muted-foreground">
                데이터를 불러오는 중...
              </div>
            ) : tickets.length > 0 ? (
              tickets.map((ticket) => (
                <div key={ticket.id} className="border rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-3">
                      <span className="font-mono text-sm">#{ticket.id.slice(-4)}</span>
                      <h3 className="font-semibold">{ticket.message || '문의 내용'}</h3>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant={
                        ticket.priority === 'high' || ticket.priority === 'urgent' ? 'destructive' : 
                        ticket.priority === 'medium' || ticket.priority === 'normal' ? 'default' : 'secondary'
                      }>
                        {ticket.priority === 'high' || ticket.priority === 'urgent' ? '긴급' : 
                         ticket.priority === 'medium' || ticket.priority === 'normal' ? '보통' : '낮음'}
                      </Badge>
                      <Badge variant={
                        ticket.status === 'waiting' || ticket.status === 'open' ? 'destructive' : 
                        ticket.status === 'assigned' || ticket.status === 'in-progress' ? 'default' : 'secondary'
                      }>
                        {ticket.status === 'waiting' || ticket.status === 'open' ? '대기중' : 
                         ticket.status === 'assigned' || ticket.status === 'in-progress' ? '처리중' : '해결됨'}
                      </Badge>
                    </div>
                  </div>
                  <div className="flex items-center justify-between text-sm text-muted-foreground">
                    <span>고객: {ticket.customerName || '알 수 없음'}</span>
                    <span>{new Date(ticket.createdAt).toLocaleString('ko-KR')}</span>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                대기중인 티켓이 없습니다.
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

function ClientDashboard({ userProfile }: { userProfile: any }) {
  const [myProjects, setMyProjects] = useState<any[]>([])
  const [recentUpdates, setRecentUpdates] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  
  useEffect(() => {
    const db = getDatabase(app)
    
    const fetchClientData = async () => {
      try {
        // 프로젝트 데이터 가져오기
        const projectsSnapshot = await get(ref(db, 'projects'))
        const projectsData = projectsSnapshot.val() || {}
        
        // 클라이언트가 속한 프로젝트 필터링
        const clientProjects = Object.entries(projectsData)
          .map(([id, data]: [string, any]) => ({ id, ...data }))
          .filter((project: any) => 
            project.client === userProfile?.companyName || 
            project.clientId === userProfile?.uid ||
            project.team?.includes(userProfile?.displayName)
          )
          .map((project: any) => ({
            id: project.id,
            name: project.name,
            progress: project.progress || 0,
            status: project.status,
            nextMilestone: project.milestones?.[0]?.title || '다음 단계 준비중',
            endDate: project.endDate
          }))
        
        // 최근 활동 가져오기
        const activitiesSnapshot = await get(ref(db, 'projectActivities'))
        const activitiesData = activitiesSnapshot.val() || {}
        
        const allActivities: any[] = []
        Object.entries(activitiesData).forEach(([projectId, activities]: [string, any]) => {
          if (clientProjects.some(p => p.id === projectId)) {
            Object.entries(activities).forEach(([activityId, activity]: [string, any]) => {
              allActivities.push({
                id: activityId,
                projectId,
                ...activity
              })
            })
          }
        })
        
        const recentActivities = allActivities
          .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
          .slice(0, 5)
        
        setMyProjects(clientProjects)
        setRecentUpdates(recentActivities)
        setLoading(false)
      } catch (error) {
        console.error('Error fetching client data:', error)
        setLoading(false)
      }
    }
    
    if (userProfile) {
      fetchClientData()
    }
  }, [userProfile])

  return (
    <div className="w-full max-w-[1920px] mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">프로젝트 현황</h1>
          <p className="text-muted-foreground mt-1">{userProfile?.companyName || '회사명'} 님의 프로젝트</p>
        </div>
        <div className="flex gap-3">
          <Button variant="outline">
            <Mail className="mr-2 h-4 w-4" />
            문의하기
          </Button>
          <Button variant="outline">
            <Bell className="mr-2 h-4 w-4" />
            알림
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {loading ? (
          <Card>
            <CardContent className="p-12">
              <div className="text-center text-muted-foreground">
                데이터를 불러오는 중...
              </div>
            </CardContent>
          </Card>
        ) : myProjects.length > 0 ? (
          myProjects.map((project) => (
          <Card key={project.id}>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                {project.name}
                <Badge>
                  {project.status === 'active' ? '진행중' : 
                   project.status === 'development' ? '개발중' : 
                   project.status === 'design' ? '디자인중' : '기획중'}
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <div className="flex items-center justify-between text-sm mb-2">
                    <span>진행률</span>
                    <span>{project.progress}%</span>
                  </div>
                  <Progress value={project.progress} />
                </div>
                <div className="pt-4 border-t">
                  <p className="text-sm text-muted-foreground">다음 단계</p>
                  <p className="font-semibold">{project.nextMilestone}</p>
                </div>
                <div className="flex gap-2">
                  <Link href={`/files?project=${project.id}`} className="flex-1">
                    <Button variant="outline" size="sm" className="w-full">
                      산출물 보기
                    </Button>
                  </Link>
                  <Link href={`/projects/${project.id}`} className="flex-1">
                    <Button size="sm" className="w-full">
                      진행상황 확인
                    </Button>
                  </Link>
                </div>
              </div>
            </CardContent>
          </Card>
        ))
        ) : (
          <Card className="lg:col-span-2">
            <CardContent className="p-12">
              <div className="text-center text-muted-foreground">
                진행중인 프로젝트가 없습니다.
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>최근 업데이트</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {recentUpdates.length > 0 ? (
              recentUpdates.map((update) => {
                const project = myProjects.find(p => p.id === update.projectId)
                return (
                  <UpdateItem 
                    key={update.id}
                    date={new Date(update.timestamp).toLocaleDateString('ko-KR')} 
                    title={update.message} 
                    description={project ? `${project.name} - ${update.user}` : update.user}
                  />
                )
              })
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                최근 업데이트가 없습니다.
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

// 공통 컴포넌트들
function StatCard({ icon: Icon, label, value, color }: any) {
  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-muted-foreground">{label}</p>
            <p className="text-2xl font-bold mt-1">{value}</p>
          </div>
          <Icon className={cn("h-8 w-8", color)} />
        </div>
      </CardContent>
    </Card>
  )
}

function ActivityItem({ icon: Icon, text, time, color }: any) {
  return (
    <div className="flex items-center gap-3">
      <div className={cn("p-2 rounded-full bg-muted", color)}>
        <Icon className="h-4 w-4" />
      </div>
      <div className="flex-1">
        <p className="text-sm">{text}</p>
        <p className="text-xs text-muted-foreground">{time}</p>
      </div>
    </div>
  )
}

function TeamActivity({ user, action, project, time }: any) {
  return (
    <div className="flex items-center gap-3">
      <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
        <span className="text-xs font-medium">{user[0]}</span>
      </div>
      <div className="flex-1">
        <p className="text-sm">
          <span className="font-medium">{user}</span> {action}
        </p>
        <p className="text-xs text-muted-foreground">{project} • {time}</p>
      </div>
    </div>
  )
}

function UpdateItem({ date, title, description }: any) {
  return (
    <div className="border-l-2 border-primary pl-4">
      <p className="text-xs text-muted-foreground">{date}</p>
      <h4 className="font-semibold text-sm mt-1">{title}</h4>
      <p className="text-sm text-muted-foreground mt-1">{description}</p>
    </div>
  )
}

export default function DashboardPage() {
  const { userProfile } = useAuth()
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (userProfile) {
      setLoading(false)
    }
  }, [userProfile])

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">로딩중...</p>
        </div>
      </div>
    )
  }

  // 권한별 대시보드 렌더링
  switch (userProfile?.role) {
    case 'admin':
      return <AdminDashboard userProfile={userProfile} />
    case 'developer':
    case 'manager':
      return <EmployeeDashboard userProfile={userProfile} />
    case 'external':
      return <SupportDashboard userProfile={userProfile} />
    case 'customer':
      return <ClientDashboard userProfile={userProfile} />
    default:
      return <ClientDashboard userProfile={userProfile} />
  }
}