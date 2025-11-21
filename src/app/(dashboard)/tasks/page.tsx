'use client'

import React, { useState, useEffect, useMemo } from 'react'
import { useAuth } from '@/lib/auth-context'
import { motion } from 'framer-motion'
import taskService, { Task } from '@/services/task-service'
import { TaskStatus, TaskPriority } from '@/types/task'
import { getDatabase, ref, onValue, off } from 'firebase/database'
import { app } from '@/lib/firebase'
import Link from 'next/link'
import toast from 'react-hot-toast'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Checkbox } from '@/components/ui/checkbox'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { 
  Search, Plus, Edit2, Trash2, Calendar, Clock, CheckCircle,
  AlertCircle, FolderOpen, User, CalendarRange, SortAsc
} from 'lucide-react'

interface Project {
  id: string
  name: string
  status: string
}

interface TaskWithProject extends Task {
  projectId: string
  projectName: string
}

export default function TasksPage() {
  const { user, userProfile } = useAuth()
  const [tasks, setTasks] = useState<TaskWithProject[]>([])
  const [projects, setProjects] = useState<Project[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedProject, setSelectedProject] = useState<string>('all')
  const [selectedStatus, setSelectedStatus] = useState<string>('all')
  const [selectedPriority, setSelectedPriority] = useState<string>('all')
  const [searchTerm, setSearchTerm] = useState('')
  const [sortBy, setSortBy] = useState<'dueDate' | 'priority' | 'createdAt'>('dueDate')
  const [showModal, setShowModal] = useState(false)
  const [editingTask, setEditingTask] = useState<TaskWithProject | null>(null)

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    projectId: '',
    priority: TaskPriority.MEDIUM,
    assignee: '',
    startDate: '',
    dueDate: '',
    status: TaskStatus.TODO
  })

  // 프로젝트 목록 가져오기
  useEffect(() => {
    if (!user || !userProfile) return

    const db = getDatabase(app)
    const projectsRef = ref(db, 'projects')
    
    const unsubscribe = onValue(projectsRef, (snapshot) => {
      const data = snapshot.val()
      if (data) {
        const projectsList = Object.entries(data).map(([id, project]: [string, any]) => ({
          id,
          name: project.name,
          status: project.status
        }))
        
        // 사용자 권한에 따른 필터링
        let filteredProjects = projectsList
        if (userProfile.role === 'customer') {
          filteredProjects = projectsList.filter(p => data[p.id].clientId === user.uid)
        } else if (userProfile.role === 'developer') {
          filteredProjects = projectsList.filter(p => 
            data[p.id].team?.includes(userProfile.email)
          )
        }
        
        setProjects(filteredProjects)
      }
      setLoading(false)
    })

    return () => off(projectsRef)
  }, [user, userProfile])

  // 모든 프로젝트의 태스크 가져오기
  useEffect(() => {
    if (projects.length === 0) {
      setTasks([])
      return
    }

    const allTasks: TaskWithProject[] = []
    let loadedProjects = 0

    projects.forEach(project => {
      const unsubscribe = taskService.subscribeToTasks(project.id, (projectTasks) => {
        // 이전 프로젝트의 태스크 제거
        const otherProjectTasks = allTasks.filter(t => t.projectId !== project.id)
        
        // 현재 프로젝트의 태스크 추가
        const tasksWithProject = projectTasks.map(task => ({
          ...task,
          projectId: project.id,
          projectName: project.name
        }))
        
        allTasks.length = 0
        allTasks.push(...otherProjectTasks, ...tasksWithProject)
        
        loadedProjects++
        if (loadedProjects === projects.length) {
          setTasks([...allTasks])
        }
      })

      return () => unsubscribe()
    })
  }, [projects])

  // 태스크 필터링 및 정렬
  const filteredTasks = useMemo(() => {
    let filtered = tasks

    // 프로젝트 필터
    if (selectedProject !== 'all') {
      filtered = filtered.filter(task => task.projectId === selectedProject)
    }

    // 상태 필터
    if (selectedStatus !== 'all') {
      filtered = filtered.filter(task => task.status === selectedStatus)
    }

    // 우선순위 필터
    if (selectedPriority !== 'all') {
      filtered = filtered.filter(task => task.priority === selectedPriority)
    }

    // 검색어 필터
    if (searchTerm) {
      filtered = filtered.filter(task => 
        task.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        task.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        task.assignee?.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }

    // 사용자 권한에 따른 필터링
    if (userProfile?.role === 'developer') {
      filtered = filtered.filter(task => 
        task.assignee === userProfile.email || 
        task.assigneeId === user?.uid
      )
    }

    // 정렬
    filtered.sort((a, b) => {
      if (sortBy === 'dueDate') {
        if (!a.dueDate) return 1
        if (!b.dueDate) return -1
        return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime()
      } else if (sortBy === 'priority') {
        const priorityOrder = { urgent: 0, high: 1, medium: 2, low: 3 }
        return priorityOrder[a.priority] - priorityOrder[b.priority]
      } else {
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      }
    })

    return filtered
  }, [tasks, selectedProject, selectedStatus, selectedPriority, searchTerm, sortBy, userProfile, user])

  // 태스크 생성/수정
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!formData.projectId) {
      toast.error('프로젝트를 선택해주세요.')
      return
    }

    try {
      if (editingTask) {
        // 태스크 수정
        await taskService.updateTask(editingTask.projectId, editingTask.id, {
          title: formData.title,
          description: formData.description,
          priority: formData.priority,
          assignee: formData.assignee,
          startDate: formData.startDate ? new Date(formData.startDate) : undefined,
          dueDate: formData.dueDate ? new Date(formData.dueDate) : undefined,
          status: formData.status
        })
        
        await taskService.addActivity(editingTask.projectId, {
          type: 'task',
          message: `작업 "${formData.title}"을(를) 수정했습니다`,
          user: userProfile?.displayName || '알 수 없음',
          icon: '✏️'
        })
        
        toast.success('작업이 수정되었습니다.')
      } else {
        // 태스크 생성
        const project = projects.find(p => p.id === formData.projectId)
        if (!project) return

        await taskService.createTask(formData.projectId, {
          projectId: formData.projectId,
          title: formData.title,
          description: formData.description,
          priority: formData.priority,
          assignee: formData.assignee,
          assigneeId: formData.assignee,
          startDate: formData.startDate ? new Date(formData.startDate) : undefined,
          dueDate: formData.dueDate ? new Date(formData.dueDate) : undefined,
          status: formData.status,
          columnId: formData.status === TaskStatus.DONE ? 'done' : 
                   formData.status === TaskStatus.REVIEW ? 'review' : 
                   formData.status === TaskStatus.IN_PROGRESS ? 'in-progress' : 'todo',
          createdBy: user?.uid || '',
          order: 0,
          labels: [],
          attachments: []
        })
        
        await taskService.addActivity(formData.projectId, {
          type: 'task',
          message: `새 작업 "${formData.title}"을(를) 생성했습니다`,
          user: userProfile?.displayName || '알 수 없음',
          icon: '✅'
        })
        
        toast.success('작업이 생성되었습니다.')
      }
      
      await taskService.updateProjectProgress(formData.projectId)
      handleCloseModal()
    } catch (error) {
      console.error('Error saving task:', error)
      toast.error('작업 저장 중 오류가 발생했습니다.')
    }
  }

  // 태스크 삭제
  const handleDelete = async (task: TaskWithProject) => {
    if (!confirm('정말 이 작업을 삭제하시겠습니까?')) return

    try {
      await taskService.deleteTask(task.projectId, task.id)
      await taskService.updateProjectProgress(task.projectId)
      
      await taskService.addActivity(task.projectId, {
        type: 'task',
        message: `작업 "${task.title}"을(를) 삭제했습니다`,
        user: userProfile?.displayName || '알 수 없음',
        icon: '🗑️'
      })
      
      toast.success('작업이 삭제되었습니다.')
    } catch (error) {
      console.error('Error deleting task:', error)
      toast.error('작업 삭제 중 오류가 발생했습니다.')
    }
  }

  // 모달 닫기
  const handleCloseModal = () => {
    setShowModal(false)
    setEditingTask(null)
    setFormData({
      title: '',
      description: '',
      projectId: '',
      priority: TaskPriority.MEDIUM,
      assignee: '',
      startDate: '',
      dueDate: '',
      status: TaskStatus.TODO
    })
  }

  // 수정 모드로 모달 열기
  const handleEdit = (task: TaskWithProject) => {
    setEditingTask(task)
    setFormData({
      title: task.title,
      description: task.description || '',
      projectId: task.projectId,
      priority: task.priority === 'low' ? TaskPriority.LOW :
                task.priority === 'medium' ? TaskPriority.MEDIUM :
                task.priority === 'high' ? TaskPriority.HIGH :
                task.priority === 'urgent' ? TaskPriority.URGENT : TaskPriority.MEDIUM,
      assignee: task.assignee || '',
      startDate: task.startDate instanceof Date ? task.startDate.toISOString().split('T')[0] : 
                 typeof task.startDate === 'string' ? task.startDate : '',
      dueDate: task.dueDate instanceof Date ? task.dueDate.toISOString().split('T')[0] : 
               typeof task.dueDate === 'string' ? task.dueDate : '',
      status: task.status === 'backlog' ? TaskStatus.BACKLOG :
              task.status === 'todo' ? TaskStatus.TODO :
              task.status === 'in_progress' ? TaskStatus.IN_PROGRESS :
              task.status === 'review' ? TaskStatus.REVIEW :
              task.status === 'done' ? TaskStatus.DONE : TaskStatus.TODO
    })
    setShowModal(true)
  }

  const statusConfig = {
    'todo': { label: '할 일', variant: 'outline' as const, icon: AlertCircle },
    'in-progress': { label: '진행 중', variant: 'default' as const, icon: Clock },
    'in_progress': { label: '진행 중', variant: 'default' as const, icon: Clock },
    'review': { label: '검토', variant: 'secondary' as const, icon: CheckCircle },
    'done': { label: '완료', variant: 'default' as const, icon: CheckCircle },
    'backlog': { label: '대기', variant: 'outline' as const, icon: AlertCircle }
  }

  const priorityConfig = {
    'low': { label: '낮음', variant: 'outline' as const, color: 'text-green-600' },
    'medium': { label: '보통', variant: 'secondary' as const, color: 'text-yellow-600' },
    'high': { label: '높음', variant: 'default' as const, color: 'text-orange-600' },
    'urgent': { label: '긴급', variant: 'destructive' as const, color: 'text-red-600' }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    )
  }

  return (
    <div className="w-full max-w-[1920px] mx-auto px-6 py-6 space-y-6">
      {/* 헤더 */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">작업 관리</h1>
          <p className="text-muted-foreground mt-1">모든 프로젝트의 작업을 한눈에 관리합니다.</p>
        </div>
        
        {(userProfile?.role === 'admin' || userProfile?.role === 'developer' || userProfile?.role === 'manager') && (
          <Button onClick={() => setShowModal(true)}>
            <Plus className="mr-2 h-4 w-4" />
            새 작업
          </Button>
        )}
      </div>

      {/* 통계 카드 */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">전체 작업</p>
                <p className="text-2xl font-bold">{tasks.length}</p>
              </div>
              <AlertCircle className="h-8 w-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">진행 중</p>
                <p className="text-2xl font-bold text-blue-600">
                  {tasks.filter(t => (t.status as any) === 'in-progress' || (t.status as any) === 'in_progress' || t.status === TaskStatus.IN_PROGRESS).length}
                </p>
              </div>
              <Clock className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">오늘 마감</p>
                <p className="text-2xl font-bold text-orange-600">
                  {tasks.filter(t => {
                    if (!t.dueDate) return false
                    const today = new Date().toDateString()
                    const dueDate = new Date(t.dueDate).toDateString()
                    return today === dueDate
                  }).length}
                </p>
              </div>
              <Calendar className="h-8 w-8 text-orange-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">완료</p>
                <p className="text-2xl font-bold text-green-600">
                  {tasks.filter(t => (t.status as any) === 'done' || t.status === TaskStatus.DONE).length}
                </p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* 필터 및 검색 */}
      <div className="space-y-4">
        {/* 검색 */}
        <div className="flex items-center gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <Input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="작업 검색..."
              className="pl-10"
            />
          </div>
          
          {/* 정렬 옵션 */}
          <Select value={sortBy} onValueChange={(value: any) => setSortBy(value)}>
            <SelectTrigger className="w-[160px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="dueDate">
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  마감일순
                </div>
              </SelectItem>
              <SelectItem value="priority">
                <div className="flex items-center gap-2">
                  <AlertCircle className="h-4 w-4" />
                  우선순위순
                </div>
              </SelectItem>
              <SelectItem value="createdAt">
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4" />
                  최신순
                </div>
              </SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* 프로젝트 필터 */}
        <div className="flex gap-2 flex-wrap">
          <Button
            variant={selectedProject === 'all' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setSelectedProject('all')}
          >
            <FolderOpen className="mr-2 h-4 w-4" />
            모든 프로젝트
          </Button>
          {projects.map(project => (
            <Button
              key={project.id}
              variant={selectedProject === project.id ? 'default' : 'outline'}
              size="sm"
              onClick={() => setSelectedProject(project.id)}
            >
              {project.name}
            </Button>
          ))}
        </div>

        {/* 상태 및 우선순위 필터 */}
        <div className="flex flex-col sm:flex-row gap-4">
          {/* 상태 필터 */}
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-sm text-muted-foreground">상태:</span>
            <Tabs value={selectedStatus} onValueChange={setSelectedStatus}>
              <TabsList>
                <TabsTrigger value="all">전체</TabsTrigger>
                {Object.entries(statusConfig).map(([status, config]) => (
                  <TabsTrigger key={status} value={status}>
                    {config.label}
                  </TabsTrigger>
                ))}
              </TabsList>
            </Tabs>
          </div>

          {/* 우선순위 필터 */}
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-sm text-muted-foreground">우선순위:</span>
            <Tabs value={selectedPriority} onValueChange={setSelectedPriority}>
              <TabsList>
                <TabsTrigger value="all">전체</TabsTrigger>
                {Object.entries(priorityConfig).map(([priority, config]) => (
                  <TabsTrigger key={priority} value={priority}>
                    {config.label}
                  </TabsTrigger>
                ))}
              </TabsList>
            </Tabs>
          </div>
        </div>
      </div>

      {/* 작업 목록 */}
      {filteredTasks.length === 0 ? (
        <Card className="p-12 text-center">
          <div className="text-muted-foreground mb-4">
            <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
            </svg>
          </div>
          <h3 className="text-lg font-medium mb-2">
            {searchTerm || selectedProject !== 'all' || selectedStatus !== 'all' 
              ? '검색 결과가 없습니다' 
              : '작업이 없습니다'}
          </h3>
          <p className="text-muted-foreground">
            {searchTerm || selectedProject !== 'all' || selectedStatus !== 'all'
              ? '다른 검색 조건을 시도해보세요.'
              : '새로운 작업을 생성해보세요.'}
          </p>
        </Card>
      ) : (
        <Card>
          <div className="divide-y">
            {filteredTasks.map((task) => {
              const statusInfo = statusConfig[task.status] || statusConfig['todo']
              const priorityInfo = priorityConfig[task.priority] || priorityConfig['medium']
              
              return (
                <motion.div
                  key={task.id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="p-4 hover:bg-muted/50 transition-colors"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-start gap-3">
                        <Checkbox
                          checked={(task.status as any) === 'done' || task.status === TaskStatus.DONE}
                          onCheckedChange={async (checked) => {
                            const newStatus = checked ? TaskStatus.DONE : TaskStatus.TODO
                            await taskService.updateTask(task.projectId, task.id, {
                              status: newStatus,
                              columnId: newStatus === TaskStatus.DONE ? 'done' : 'todo'
                            })
                            await taskService.updateProjectProgress(task.projectId)
                          }}
                          className="mt-1"
                        />
                        <div className="flex-1 space-y-1">
                          <div className="flex items-center gap-2">
                            <h3 className={`font-medium ${(task.status as any) === 'done' || task.status === TaskStatus.DONE ? 'line-through text-muted-foreground' : ''}`}>
                              {task.title}
                            </h3>
                            <Badge variant={priorityInfo.variant} className={priorityInfo.color}>
                              {priorityInfo.label}
                            </Badge>
                            <Badge variant={statusInfo.variant}>
                              {statusInfo.label}
                            </Badge>
                          </div>
                          
                          {task.description && (
                            <p className="text-sm text-muted-foreground">{task.description}</p>
                          )}
                          
                          <div className="flex items-center gap-4 text-sm text-muted-foreground">
                            <Link 
                              href={`/projects/${task.projectId}`} 
                              className="flex items-center gap-1 hover:text-primary"
                            >
                              <FolderOpen className="h-3 w-3" />
                              {task.projectName}
                            </Link>
                            
                            {task.assignee && (
                              <span className="flex items-center gap-1">
                                <User className="h-3 w-3" />
                                {task.assignee}
                              </span>
                            )}
                            
                            {task.dueDate && (
                              <span className={`flex items-center gap-1 ${
                                new Date(task.dueDate) < new Date() && task.status !== 'done'
                                  ? 'text-destructive' 
                                  : ''
                              }`}>
                                <Calendar className="h-3 w-3" />
                                {new Date(task.dueDate).toLocaleDateString('ko-KR')}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex gap-1">
                      {(userProfile?.role === 'admin' || userProfile?.role === 'developer' || userProfile?.role === 'manager' || 
                        task.createdBy === user?.uid) && (
                        <>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleEdit(task)}
                          >
                            <Edit2 className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleDelete(task)}
                            className="text-destructive hover:text-destructive"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </>
                      )}
                    </div>
                  </div>
                </motion.div>
              )
            })}
          </div>
        </Card>
      )}

      {/* 작업 생성/수정 모달 */}
      <Dialog open={showModal} onOpenChange={setShowModal}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingTask ? '작업 수정' : '새 작업 만들기'}
            </DialogTitle>
          </DialogHeader>

          <form onSubmit={handleSubmit}>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="project">프로젝트 *</Label>
                <Select 
                  value={formData.projectId}
                  onValueChange={(value) => setFormData({ ...formData, projectId: value })}
                  required
                  disabled={!!editingTask}
                >
                  <SelectTrigger id="project">
                    <SelectValue placeholder="프로젝트를 선택하세요" />
                  </SelectTrigger>
                  <SelectContent>
                    {projects.map(project => (
                      <SelectItem key={project.id} value={project.id}>
                        {project.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="title">작업 제목 *</Label>
                <Input
                  id="title"
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="작업 제목을 입력하세요"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">설명</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows={3}
                  placeholder="작업에 대한 상세 설명을 입력하세요"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>상태</Label>
                  <div className="flex gap-2">
                    {[
                      { value: TaskStatus.TODO, label: '할 일', variant: 'outline' as const },
                      { value: TaskStatus.IN_PROGRESS, label: '진행 중', variant: 'default' as const },
                      { value: TaskStatus.REVIEW, label: '검토', variant: 'secondary' as const },
                      { value: TaskStatus.DONE, label: '완료', variant: 'default' as const }
                    ].map(status => (
                      <Button
                        key={status.value}
                        type="button"
                        variant={formData.status === status.value ? status.variant : 'outline'}
                        size="sm"
                        onClick={() => setFormData({ ...formData, status: status.value })}
                        className="flex-1"
                      >
                        {status.label}
                      </Button>
                    ))}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>우선순위</Label>
                  <div className="flex gap-2">
                    {[
                      { value: TaskPriority.LOW, ...priorityConfig['low'] },
                      { value: TaskPriority.MEDIUM, ...priorityConfig['medium'] },
                      { value: TaskPriority.HIGH, ...priorityConfig['high'] },
                      { value: TaskPriority.URGENT, ...priorityConfig['urgent'] }
                    ].map(priority => (
                      <Button
                        key={priority.value}
                        type="button"
                        variant={formData.priority === priority.value ? priority.variant : 'outline'}
                        size="sm"
                        onClick={() => setFormData({ ...formData, priority: priority.value })}
                        className="flex-1"
                      >
                        {priority.label}
                      </Button>
                    ))}
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="assignee">담당자</Label>
                <Input
                  id="assignee"
                  type="text"
                  value={formData.assignee}
                  onChange={(e) => setFormData({ ...formData, assignee: e.target.value })}
                  placeholder="담당자 이메일"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="startDate">시작일</Label>
                  <Input
                    id="startDate"
                    type="date"
                    value={formData.startDate}
                    onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="dueDate">마감일</Label>
                  <Input
                    id="dueDate"
                    type="date"
                    value={formData.dueDate}
                    onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
                  />
                </div>
              </div>
            </div>

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={handleCloseModal}
              >
                취소
              </Button>
              <Button type="submit">
                {editingTask ? '수정' : '생성'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}