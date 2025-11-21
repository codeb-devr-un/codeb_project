'use client'

import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { useAuth } from '@/lib/auth-context'
import { Project } from '@/types'
import { getDatabase, ref, onValue, off } from 'firebase/database'
import { app } from '@/lib/firebase'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { 
  Clock, Calendar, TrendingUp, CheckCircle2, Circle, 
  Loader2, Activity, Users, DollarSign, MessageSquare,
  FileText, Palette, Code, TestTube2, Package, BarChart3,
  Building2, Timer
} from 'lucide-react'

interface ProjectPhase {
  id: string
  name: string
  status: 'completed' | 'in_progress' | 'pending'
  progress: number
  startDate: string
  endDate: string
  description: string
  icon: any
}

interface ProjectUpdate {
  id: string
  projectId: string
  projectName: string
  title: string
  description: string
  date: string
  type: 'development' | 'design' | 'planning' | 'testing'
}

export default function CustomerStatusPage() {
  const { user, userProfile } = useAuth()
  const [projects, setProjects] = useState<Project[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedProject, setSelectedProject] = useState<Project | null>(null)
  const [activities, setActivities] = useState<ProjectUpdate[]>([])
  const router = useRouter()

  // 고객이 아닌 경우 대시보드로 리다이렉트
  useEffect(() => {
    if (!loading && userProfile && userProfile.role !== 'customer' && userProfile.role !== 'external') {
      router.push('/dashboard')
    }
  }, [userProfile, loading, router])

  // Firebase에서 프로젝트 데이터 로드
  useEffect(() => {
    if (!user || !userProfile) return

    const db = getDatabase(app)
    const projectsRef = ref(db, 'projects')
    
    const unsubscribe = onValue(projectsRef, (snapshot) => {
      const data = snapshot.val()
      
      if (data) {
        const projectsList = Object.entries(data).map(([id, project]: [string, any]) => ({
          ...project,
          id,
          startDate: new Date(project.startDate),
          endDate: new Date(project.endDate),
          createdAt: new Date(project.createdAt),
          updatedAt: new Date(project.updatedAt)
        }))
        
        // 고객은 자신의 그룹에 속한 프로젝트를 모두 볼 수 있음
        let filteredProjects = projectsList
        if (userProfile.role === 'customer' || userProfile.role === 'external') {
          filteredProjects = projectsList.filter(p => 
            // 자신의 프로젝트이거나
            p.clientId === user.uid ||
            // 같은 그룹의 프로젝트
            (userProfile.group && p.clientGroup === userProfile.group)
          )
        }
        
        setProjects(filteredProjects)
        if (filteredProjects.length > 0 && !selectedProject) {
          setSelectedProject(filteredProjects[0])
        }
      } else {
        setProjects([])
      }
      setLoading(false)
    })

    return () => off(projectsRef)
  }, [user, userProfile, selectedProject])

  // 활동 내역 로드
  useEffect(() => {
    if (!user) return

    const db = getDatabase(app)
    const activitiesRef = ref(db, 'activities')
    
    const unsubscribe = onValue(activitiesRef, (snapshot) => {
      const data = snapshot.val()
      if (data) {
        const activitiesList = Object.entries(data)
          .map(([id, activity]: [string, any]) => ({
            ...activity,
            id,
            date: activity.timestamp || activity.time || activity.createdAt
          }))
          .filter(activity => {
            // 선택된 프로젝트의 활동만 표시
            if (selectedProject && activity.projectId === selectedProject.id) {
              return true
            }
            // 그룹의 모든 프로젝트 활동 표시
            if (userProfile?.group && projects.some(p => p.id === activity.projectId)) {
              return true
            }
            return false
          })
          .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
          .slice(0, 10)
        
        setActivities(activitiesList)
      }
    })

    return () => off(activitiesRef)
  }, [user, userProfile, projects, selectedProject])

  const getProjectPhases = (project: Project): ProjectPhase[] => {
    const totalDays = Math.ceil((project.endDate.getTime() - project.startDate.getTime()) / (1000 * 60 * 60 * 24))
    const daysPassed = Math.ceil((new Date().getTime() - project.startDate.getTime()) / (1000 * 60 * 60 * 24))
    const progress = Math.min(100, Math.max(0, (daysPassed / totalDays) * 100))

    const phases: ProjectPhase[] = [
      {
        id: '1',
        name: '요구사항 분석',
        status: project.status !== 'planning' ? 'completed' : progress > 20 ? 'completed' : 'in_progress',
        progress: project.status !== 'planning' ? 100 : Math.min(100, progress * 5),
        startDate: project.startDate.toISOString().split('T')[0],
        endDate: new Date(project.startDate.getTime() + totalDays * 0.2 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        description: '프로젝트 요구사항 분석 및 기획',
        icon: FileText
      },
      {
        id: '2',
        name: '디자인',
        status: ['development', 'testing', 'completed'].includes(project.status) ? 'completed' : 
                project.status === 'design' ? 'in_progress' : 'pending',
        progress: ['development', 'testing', 'completed'].includes(project.status) ? 100 : 
                  project.status === 'design' ? (progress - 20) * 2.5 : 0,
        startDate: new Date(project.startDate.getTime() + totalDays * 0.2 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        endDate: new Date(project.startDate.getTime() + totalDays * 0.4 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        description: 'UI/UX 디자인 및 시안 작업',
        icon: Palette
      },
      {
        id: '3',
        name: '개발',
        status: ['testing', 'completed'].includes(project.status) ? 'completed' : 
                project.status === 'development' ? 'in_progress' : 'pending',
        progress: ['testing', 'completed'].includes(project.status) ? 100 : 
                  project.status === 'development' ? (progress - 40) * 1.67 : 0,
        startDate: new Date(project.startDate.getTime() + totalDays * 0.4 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        endDate: new Date(project.startDate.getTime() + totalDays * 0.8 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        description: '프론트엔드 및 백엔드 개발',
        icon: Code
      },
      {
        id: '4',
        name: '테스트',
        status: project.status === 'completed' ? 'completed' : 
                project.status === 'testing' ? 'in_progress' : 'pending',
        progress: project.status === 'completed' ? 100 : 
                  project.status === 'testing' ? (progress - 80) * 5 : 0,
        startDate: new Date(project.startDate.getTime() + totalDays * 0.8 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        endDate: new Date(project.startDate.getTime() + totalDays * 0.95 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        description: '기능 테스트 및 버그 수정',
        icon: TestTube2
      },
      {
        id: '5',
        name: '배포',
        status: project.status === 'completed' ? 'completed' : 'pending',
        progress: project.status === 'completed' ? 100 : 0,
        startDate: new Date(project.startDate.getTime() + totalDays * 0.95 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        endDate: project.endDate.toISOString().split('T')[0],
        description: '서버 배포 및 서비스 오픈',
        icon: Package
      }
    ]

    return phases
  }

  const getUpdateIcon = (type: string) => {
    switch (type) {
      case 'development': return Code
      case 'design': return Palette
      case 'planning': return FileText
      case 'testing': return TestTube2
      default: return Activity
    }
  }

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('ko-KR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    }).format(date)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin text-primary mx-auto" />
          <p className="mt-4 text-muted-foreground">프로젝트 정보를 불러오는 중...</p>
        </div>
      </div>
    )
  }

  if (projects.length === 0) {
    return (
      <div className="flex items-center justify-center h-96">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6">
            <div className="text-center">
              <BarChart3 className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
              <h2 className="text-xl font-semibold mb-2">진행 중인 프로젝트가 없습니다</h2>
              <p className="text-muted-foreground">프로젝트가 시작되면 여기에서 진행 상황을 확인할 수 있습니다.</p>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="w-full max-w-[1920px] mx-auto px-6 py-6 space-y-6">
      {/* 헤더 */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">프로젝트 현황</h1>
        <p className="text-muted-foreground mt-1">
          {userProfile?.group ? `${userProfile.company || '우리 회사'}의 모든 프로젝트 진행 상황을 확인하세요` : '프로젝트의 진행 상황을 확인하세요'}
        </p>
      </div>

      {/* 프로젝트 선택 탭 */}
      {projects.length > 1 && (
        <Tabs value={selectedProject?.id} onValueChange={(value) => {
          const project = projects.find(p => p.id === value)
          if (project) setSelectedProject(project)
        }}>
          <TabsList>
            {projects.map((project) => (
              <TabsTrigger key={project.id} value={project.id}>
                {project.name}
              </TabsTrigger>
            ))}
          </TabsList>
        </Tabs>
      )}

      {selectedProject && (
        <>
          {/* 프로젝트 정보 */}
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-lg font-semibold">{selectedProject.name}</h3>
                  <p className="text-sm text-muted-foreground mt-1">{selectedProject.description}</p>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold text-primary">{selectedProject.progress}%</div>
                  <Badge variant="outline" className="mt-1">
                    {selectedProject.status === 'planning' && '기획'}
                    {selectedProject.status === 'design' && '디자인'}
                    {selectedProject.status === 'development' && '개발'}
                    {selectedProject.status === 'testing' && '테스트'}
                    {selectedProject.status === 'completed' && '완료'}
                  </Badge>
                </div>
              </div>
              <Progress value={selectedProject.progress} className="h-3 mb-4" />
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
                <div>
                  <div className="flex items-center justify-center gap-2 text-muted-foreground mb-1">
                    <Calendar className="h-4 w-4" />
                    <span className="text-sm">시작일</span>
                  </div>
                  <div className="font-semibold">
                    {formatDate(selectedProject.startDate)}
                  </div>
                </div>
                <div>
                  <div className="flex items-center justify-center gap-2 text-muted-foreground mb-1">
                    <Timer className="h-4 w-4" />
                    <span className="text-sm">진행일</span>
                  </div>
                  <div className="font-semibold text-primary">
                    {Math.ceil((new Date().getTime() - selectedProject.startDate.getTime()) / (1000 * 60 * 60 * 24))}일
                  </div>
                </div>
                <div>
                  <div className="flex items-center justify-center gap-2 text-muted-foreground mb-1">
                    <Clock className="h-4 w-4" />
                    <span className="text-sm">완료 예정일</span>
                  </div>
                  <div className="font-semibold">
                    {formatDate(selectedProject.endDate)}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* 프로젝트 단계별 진행상황 */}
            <div>
              <Card>
                <CardHeader>
                  <CardTitle>단계별 진행상황</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {getProjectPhases(selectedProject).map((phase, index) => {
                      const Icon = phase.icon
                      return (
                        <motion.div
                          key={phase.id}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: index * 0.1 }}
                          className="border rounded-lg p-4"
                        >
                          <div className="flex items-center justify-between mb-3">
                            <div className="flex items-center gap-3">
                              <div className={`p-2 rounded-lg ${
                                phase.status === 'completed' ? 'bg-green-100' :
                                phase.status === 'in_progress' ? 'bg-blue-100' :
                                'bg-gray-100'
                              }`}>
                                <Icon className={`h-5 w-5 ${
                                  phase.status === 'completed' ? 'text-green-600' :
                                  phase.status === 'in_progress' ? 'text-blue-600' :
                                  'text-gray-400'
                                }`} />
                              </div>
                              <h4 className="font-medium">{phase.name}</h4>
                            </div>
                            <div className="flex items-center gap-2">
                              {phase.status === 'completed' && <CheckCircle2 className="h-4 w-4 text-green-600" />}
                              {phase.status === 'in_progress' && <Circle className="h-4 w-4 text-blue-600" />}
                              {phase.status === 'pending' && <Circle className="h-4 w-4 text-gray-400" />}
                              <Badge variant={
                                phase.status === 'completed' ? 'default' :
                                phase.status === 'in_progress' ? 'secondary' :
                                'outline'
                              }>
                                {phase.status === 'completed' && '완료'}
                                {phase.status === 'in_progress' && '진행중'}
                                {phase.status === 'pending' && '대기중'}
                              </Badge>
                              <span className="text-sm text-muted-foreground">{phase.progress}%</span>
                            </div>
                          </div>
                          
                          <Progress value={phase.progress} className="h-2 mb-3" />
                          
                          <div className="flex justify-between text-xs text-muted-foreground mb-2">
                            <span>{phase.startDate}</span>
                            <span>{phase.endDate}</span>
                          </div>
                          
                          <p className="text-sm text-muted-foreground">{phase.description}</p>
                        </motion.div>
                      )
                    })}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* 최근 업데이트 및 팀 정보 */}
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>최근 업데이트</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {activities.length > 0 ? (
                      activities.slice(0, 5).map((update, index) => {
                        const Icon = getUpdateIcon(update.type)
                        return (
                          <motion.div
                            key={update.id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.1 }}
                            className="flex gap-3"
                          >
                            <div className={`p-2 rounded-lg h-fit ${
                              update.type === 'development' ? 'bg-blue-100' :
                              update.type === 'design' ? 'bg-purple-100' :
                              update.type === 'planning' ? 'bg-green-100' :
                              'bg-orange-100'
                            }`}>
                              <Icon className={`h-4 w-4 ${
                                update.type === 'development' ? 'text-blue-600' :
                                update.type === 'design' ? 'text-purple-600' :
                                update.type === 'planning' ? 'text-green-600' :
                                'text-orange-600'
                              }`} />
                            </div>
                            <div className="flex-1">
                              <h4 className="font-medium text-sm">{update.title}</h4>
                              <p className="text-sm text-muted-foreground mb-1">{update.description}</p>
                              <div className="flex items-center justify-between">
                                <span className="text-xs text-muted-foreground">
                                  {new Date(update.date).toLocaleDateString('ko-KR')}
                                </span>
                                {update.projectId !== selectedProject.id && (
                                  <Badge variant="outline" className="text-xs">
                                    {update.projectName}
                                  </Badge>
                                )}
                              </div>
                            </div>
                          </motion.div>
                        )
                      })
                    ) : (
                      <div className="text-center py-8">
                        <Activity className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                        <p className="text-muted-foreground">아직 업데이트가 없습니다</p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* 프로젝트 상세 정보 */}
              <Card>
                <CardHeader>
                  <CardTitle>프로젝트 정보</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <DollarSign className="h-4 w-4" />
                        <span className="text-sm">예산</span>
                      </div>
                      <span className="font-medium">
                        {new Intl.NumberFormat('ko-KR', {
                          style: 'currency',
                          currency: 'KRW',
                          maximumFractionDigits: 0,
                        }).format(selectedProject.budget)}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <Users className="h-4 w-4" />
                        <span className="text-sm">팀 규모</span>
                      </div>
                      <span className="font-medium">
                        {selectedProject.team?.length || 0}명
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <TrendingUp className="h-4 w-4" />
                        <span className="text-sm">현재 상태</span>
                      </div>
                      <Badge>
                        {selectedProject.status === 'planning' && '기획'}
                        {selectedProject.status === 'design' && '디자인'}
                        {selectedProject.status === 'development' && '개발'}
                        {selectedProject.status === 'testing' && '테스트'}
                        {selectedProject.status === 'completed' && '완료'}
                      </Badge>
                    </div>
                  </div>

                  {/* 프로젝트 상세 보기 링크 */}
                  <Button asChild className="w-full mt-4">
                    <Link href={`/support?project=${selectedProject.id}`}>
                      <MessageSquare className="mr-2 h-4 w-4" />
                      문의하기
                    </Link>
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        </>
      )}
    </div>
  )
}