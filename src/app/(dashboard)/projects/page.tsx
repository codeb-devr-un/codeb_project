'use client'

import React, { useState, useEffect, useMemo } from 'react'
import { motion } from 'framer-motion'
import Link from 'next/link'
import { useAuth } from '@/lib/auth-context'
import { Project } from '@/types'
import ProjectCreateWizard from '@/components/projects/ProjectCreateWizard'
import { getDatabase, ref, onValue, off, set, push } from 'firebase/database'
import { app } from '@/lib/firebase'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { cn } from '@/lib/utils'
import { Search, LayoutGrid, LayoutList, Plus, Calendar, Filter, ChevronRight, Users, DollarSign, FolderOpen, BarChart3, TrendingUp } from 'lucide-react'
import { Progress } from '@/components/ui/progress'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'

const statusLabels: Record<Project['status'], string> = {
  planning: '기획',
  design: '디자인',
  development: '개발',
  testing: '테스트',
  completed: '완료',
  pending: '대기'
}

const statusVariants: Record<Project['status'], 'default' | 'secondary' | 'outline' | 'destructive'> = {
  planning: 'outline',
  design: 'secondary',
  development: 'default',
  testing: 'secondary',
  completed: 'default',
  pending: 'outline'
}

export default function ProjectsPage() {
  const { user, userProfile } = useAuth()
  const router = useRouter()
  const [projects, setProjects] = useState<Project[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedTab, setSelectedTab] = useState<'all' | 'active' | 'completed'>('all')
  const [viewMode, setViewMode] = useState<'table' | 'grid'>('table')
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [filterStatus, setFilterStatus] = useState<Project['status'] | 'all'>('all')
  const [searchTerm, setSearchTerm] = useState('')
  const [sortBy, setSortBy] = useState<'name' | 'date' | 'progress'>('date')

  // Firebase에서 프로젝트 데이터 로드
  useEffect(() => {
    if (!user) return

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
        
        // 사용자 역할에 따른 필터링
        let filteredProjects = projectsList
        if (userProfile?.role === 'customer') {
          // 클라이언트는 자신의 프로젝트 또는 초대받은 프로젝트를 볼 수 있음
          filteredProjects = projectsList.filter(p => 
            p.clientId === user.uid ||
            p.permissions?.viewerIds?.includes(user.uid)
          )
        } else if (userProfile?.role === 'developer' || userProfile?.role === 'manager') {
          // 직원은 자신이 팀에 포함된 프로젝트만 볼 수 있음
          filteredProjects = projectsList.filter(p => 
            p.team?.some((member: any) => member.userId === user.uid) ||
            p.permissions?.editorIds?.includes(user.uid)
          )
        }
        
        setProjects(filteredProjects)
      } else {
        setProjects([])
      }
      setLoading(false)
    })

    return () => off(projectsRef)
  }, [user, userProfile])

  // 프로젝트 필터링 및 검색
  const filteredProjects = useMemo(() => {
    let filtered = projects
    
    // 탭 필터링
    if (selectedTab === 'active') {
      filtered = filtered.filter(project => project.status !== 'completed')
    } else if (selectedTab === 'completed') {
      filtered = filtered.filter(project => project.status === 'completed')
    }
    
    // 상태 필터링
    if (filterStatus !== 'all') {
      filtered = filtered.filter(project => project.status === filterStatus)
    }
    
    // 검색어 필터링
    if (searchTerm) {
      filtered = filtered.filter(project => 
        project.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        project.description.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }
    
    // 정렬
    filtered.sort((a, b) => {
      if (sortBy === 'name') {
        return a.name.localeCompare(b.name)
      } else if (sortBy === 'progress') {
        return b.progress - a.progress
      } else {
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      }
    })
    
    return filtered
  }, [projects, selectedTab, filterStatus, searchTerm, sortBy])

  // 예산 포맷팅
  const formatBudget = (amount: number) => {
    return new Intl.NumberFormat('ko-KR', {
      style: 'currency',
      currency: 'KRW',
      maximumFractionDigits: 0,
    }).format(amount)
  }

  // 프로젝트 생성 핸들러
  const handleCreateProject = async (projectData: Omit<Project, 'id' | 'createdAt' | 'updatedAt'>) => {
    try {
      const db = getDatabase(app)
      const projectsRef = ref(db, 'projects')
      const newProjectRef = push(projectsRef)
      
      const newProject = {
        ...projectData,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        createdBy: user?.uid,
        progress: 0,
        permissions: {
          viewerIds: [],
          editorIds: [],
          adminIds: [user?.uid]
        }
      }
      
      await set(newProjectRef, newProject)
      
      // 활동 로그 추가
      const activitiesRef = ref(db, 'activities')
      const newActivityRef = push(activitiesRef)
      await set(newActivityRef, {
        type: 'project',
        icon: '📁',
        title: '새 프로젝트 생성',
        description: `${projectData.name} 프로젝트가 생성되었습니다`,
        time: new Date().toISOString(),
        userId: user?.uid,
        userName: userProfile?.displayName || '알 수 없음'
      })
      
      setShowCreateModal(false)
      router.push(`/projects/${newProjectRef.key}`)
    } catch (error) {
      console.error('Error creating project:', error)
      alert('프로젝트 생성 중 오류가 발생했습니다.')
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    )
  }

  return (
    <div className="w-full max-w-[1920px] mx-auto px-6 py-6 space-y-6">
      {/* 헤더 */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">프로젝트 관리</h1>
          <p className="text-muted-foreground mt-1">전체 프로젝트를 관리하고 진행 상황을 확인합니다.</p>
        </div>
        
        {userProfile?.role === 'admin' && (
          <Button onClick={() => setShowCreateModal(true)}>
            <Plus className="mr-2 h-4 w-4" />
            새 프로젝트
          </Button>
        )}
      </div>

      {/* 필터 및 검색 - shadcn/ui */}
      <div className="space-y-4">
        {/* 첫 번째 줄: 탭 필터와 검색 */}
        <div className="flex items-center gap-4">
          {/* 탭 필터 */}
          <Tabs value={selectedTab} onValueChange={(v) => setSelectedTab(v as any)}>
            <TabsList>
              <TabsTrigger value="all">전체 ({projects.length})</TabsTrigger>
              <TabsTrigger value="active">진행 중 ({projects.filter(p => p.status !== 'completed').length})</TabsTrigger>
              <TabsTrigger value="completed">완료 ({projects.filter(p => p.status === 'completed').length})</TabsTrigger>
            </TabsList>
          </Tabs>

          {/* 검색 */}
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <Input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="프로젝트 검색..."
              className="pl-10"
            />
          </div>

          {/* 뷰 모드 전환 */}
          <div className="flex gap-1">
            <Button
              variant={viewMode === 'table' ? 'secondary' : 'ghost'}
              size="icon"
              onClick={() => setViewMode('table')}
            >
              <LayoutList className="h-4 w-4" />
            </Button>
            <Button
              variant={viewMode === 'grid' ? 'secondary' : 'ghost'}
              size="icon"
              onClick={() => setViewMode('grid')}
            >
              <LayoutGrid className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* 두 번째 줄: 상태 필터와 정렬 */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          {/* 상태 필터 */}
          <div className="flex flex-wrap gap-2">
            <Button
              variant={filterStatus === 'all' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setFilterStatus('all')}
            >
              전체
            </Button>
            {Object.entries(statusLabels).map(([status, label]) => (
              <Button
                key={status}
                variant={filterStatus === status ? 'default' : 'outline'}
                size="sm"
                onClick={() => setFilterStatus(status as any)}
              >
                {label}
              </Button>
            ))}
          </div>

          {/* 정렬 옵션 */}
          <Select value={sortBy} onValueChange={(value: any) => setSortBy(value)}>
            <SelectTrigger className="w-[160px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="date">
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  최신순
                </div>
              </SelectItem>
              <SelectItem value="name">
                <div className="flex items-center gap-2">
                  <FolderOpen className="h-4 w-4" />
                  이름순
                </div>
              </SelectItem>
              <SelectItem value="progress">
                <div className="flex items-center gap-2">
                  <TrendingUp className="h-4 w-4" />
                  진행률순
                </div>
              </SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* 프로젝트 목록 */}
      {filteredProjects.length === 0 ? (
        <Card className="p-12 text-center">
          <div className="text-muted-foreground mb-4">
            <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 13h6m-3-3v6m-9 1V7a2 2 0 012-2h6l2 2h6a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2z" />
            </svg>
          </div>
          <h3 className="text-lg font-medium mb-2">
            {searchTerm || filterStatus !== 'all' ? '검색 결과가 없습니다' : '프로젝트가 없습니다'}
          </h3>
          <p className="text-muted-foreground mb-4">
            {searchTerm || filterStatus !== 'all' 
              ? '다른 검색어나 필터를 시도해보세요.' 
              : userProfile?.role === 'admin' 
                ? '첫 번째 프로젝트를 생성해보세요.'
                : '아직 할당된 프로젝트가 없습니다.'}
          </p>
          {userProfile?.role === 'admin' && !searchTerm && filterStatus === 'all' && (
            <Button onClick={() => setShowCreateModal(true)}>
              <Plus className="mr-2 h-4 w-4" />
              새 프로젝트 만들기
            </Button>
          )}
        </Card>
      ) : viewMode === 'table' ? (
        <div className="overflow-hidden rounded-lg border bg-card">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[300px]">프로젝트</TableHead>
                <TableHead>상태</TableHead>
                <TableHead>진행률</TableHead>
                <TableHead>팀</TableHead>
                <TableHead>예산</TableHead>
                <TableHead>기간</TableHead>
                <TableHead className="text-right">액션</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredProjects.map((project) => (
                <TableRow
                  key={project.id}
                  className="cursor-pointer"
                  onClick={() => router.push(`/projects/${project.id}`)}
                >
                  <TableCell>
                    <div>
                      <div className="font-medium">{project.name}</div>
                      <div className="text-sm text-muted-foreground">{project.description}</div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant={statusVariants[project.status]}>
                      {statusLabels[project.status]}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-3 min-w-[120px]">
                      <Progress value={project.progress} className="flex-1" />
                      <span className="text-sm font-medium w-10 text-right">{project.progress}%</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex -space-x-2">
                      {project.team?.slice(0, 3).map((member, idx) => (
                        <div
                          key={idx}
                          className="w-8 h-8 bg-muted rounded-full flex items-center justify-center text-xs font-medium border-2 border-background"
                        >
                          {(typeof member === 'string' ? member : member.name)?.charAt(0) || '?'}
                        </div>
                      )) || <span className="text-sm text-muted-foreground">팀 미배정</span>}
                      {project.team && project.team.length > 3 && (
                        <div className="w-8 h-8 bg-muted rounded-full flex items-center justify-center text-xs font-medium border-2 border-background">
                          +{project.team.length - 3}
                        </div>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>{formatBudget(project.budget)}</TableCell>
                  <TableCell className="text-muted-foreground">
                    {project.startDate.toLocaleDateString('ko-KR')} - {project.endDate.toLocaleDateString('ko-KR')}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex gap-2 justify-end" onClick={(e) => e.stopPropagation()}>
                      <Button asChild variant="ghost" size="sm">
                        <Link href={`/projects/${project.id}`}>
                          상세보기
                        </Link>
                      </Button>
                      {userProfile?.role === 'admin' && (
                        <Button variant="link" size="sm">
                          수정
                        </Button>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredProjects.map((project) => (
            <motion.div
              key={project.id}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
            >
              <Card 
                className="cursor-pointer hover:shadow-lg transition-shadow h-full"
                onClick={() => router.push(`/projects/${project.id}`)}
              >
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <CardTitle className="text-lg">{project.name}</CardTitle>
                    <Badge variant={statusVariants[project.status]}>
                      {statusLabels[project.status]}
                    </Badge>
                  </div>
                  <CardDescription>{project.description}</CardDescription>
                </CardHeader>
                
                <CardContent className="space-y-4">
                  <div>
                    <div className="flex justify-between text-sm mb-2">
                      <span className="text-muted-foreground">진행률</span>
                      <span className="font-medium">{project.progress}%</span>
                    </div>
                    <Progress value={project.progress} className="h-2" />
                  </div>
                  
                  <div className="grid grid-cols-2 gap-3 text-sm">
                    <div className="flex items-center gap-2">
                      <DollarSign className="h-4 w-4 text-muted-foreground" />
                      <span className="text-muted-foreground">예산</span>
                    </div>
                    <span className="font-medium text-right">{formatBudget(project.budget)}</span>
                    
                    <div className="flex items-center gap-2">
                      <Users className="h-4 w-4 text-muted-foreground" />
                      <span className="text-muted-foreground">팀원</span>
                    </div>
                    <div className="flex -space-x-2 justify-end">
                      {project.team?.slice(0, 3).map((member, idx) => (
                        <div
                          key={idx}
                          className="w-6 h-6 bg-muted rounded-full flex items-center justify-center text-xs font-medium border-2 border-background"
                        >
                          {(typeof member === 'string' ? member : member.name)?.charAt(0) || '?'}
                        </div>
                      )) || <span className="text-sm text-muted-foreground">미배정</span>}
                      {project.team && project.team.length > 3 && (
                        <div className="w-6 h-6 bg-muted rounded-full flex items-center justify-center text-xs font-medium border-2 border-background">
                          +{project.team.length - 3}
                        </div>
                      )}
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-muted-foreground" />
                      <span className="text-muted-foreground">기간</span>
                    </div>
                    <span className="text-xs text-right text-muted-foreground">
                      {project.endDate.toLocaleDateString('ko-KR', { month: 'short', day: 'numeric' })}
                    </span>
                  </div>
                </CardContent>
                
                <CardFooter className="pt-0">
                  <Button
                    asChild
                    variant="outline"
                    size="sm"
                    className="w-full"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <Link href={`/projects/${project.id}`}>
                      상세보기
                    </Link>
                  </Button>
                </CardFooter>
              </Card>
            </motion.div>
          ))}
        </div>
      )}

      {/* 프로젝트 생성 위자드 */}
      <ProjectCreateWizard
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onSubmit={handleCreateProject}
      />
    </div>
  )
}