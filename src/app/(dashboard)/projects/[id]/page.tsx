'use client'

import React, { useState, useEffect, useMemo } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { useAuth } from '@/lib/auth-context'
import { getDatabase, ref, onValue, off, set, push, update } from 'firebase/database'
import { app } from '@/lib/firebase'
import { motion } from 'framer-motion'
import ProjectInvitations from '@/components/projects/ProjectInvitations'
import { KanbanBoardPro } from '@/components/kanban'
import GanttChartIsolated from '@/components/gantt/GanttChartIsolated'
import GanttChartSimple from '@/components/gantt/GanttChartSimple'
import GanttChartTest from '@/components/gantt/GanttChartTest'
import GanttChartDebug from '@/components/gantt/GanttChartDebug'
import GanttChartHTML from '@/components/gantt/GanttChartHTML'
import GanttChartFinal from '@/components/gantt/GanttChartFinal'
import GanttChartFixed from '@/components/gantt/GanttChartFixed'
import GanttChartSimplified from '@/components/gantt/GanttChartSimplified'
import { Task as GanttTaskReact } from 'gantt-task-react'
import taskService, { Task as TaskType, KanbanColumn } from '@/services/task-service'
import { TaskStatus, TaskPriority } from '@/types/task'
import ganttStyles from './gantt.module.css'

interface ProjectDetail {
  id: string
  name: string
  description: string
  status: 'planning' | 'design' | 'development' | 'testing' | 'completed'
  progress: number
  startDate: string
  endDate: string
  budget: number
  spentBudget?: number
  team: string[]
  clientId: string
  clientName?: string
  createdAt: string
  updatedAt: string
  tasks?: Task[]
  milestones?: Milestone[]
  files?: FileItem[]
}

interface Task {
  id: string
  title: string
  description: string
  status: 'pending' | 'in_progress' | 'completed'
  assignee: string
  dueDate: string
  priority: 'low' | 'medium' | 'high'
}

interface Milestone {
  id: string
  title: string
  date: string
  completed: boolean
  description: string
}

interface FileItem {
  id: string
  name: string
  size: number
  uploadedBy: string
  uploadedAt: string
  type: string
  url: string
}

interface Activity {
  id: string
  type: string
  message: string
  user: string
  timestamp: string
  icon: string
}

const statusLabels = {
  planning: '기획',
  design: '디자인',
  development: '개발',
  testing: '테스트',
  completed: '완료'
}

const statusColors = {
  planning: 'bg-gray-100 text-gray-700',
  design: 'bg-blue-100 text-blue-700',
  development: 'bg-yellow-100 text-yellow-700',
  testing: 'bg-purple-100 text-purple-700',
  completed: 'bg-green-100 text-green-700'
}

export default function ProjectDetailPage() {
  const params = useParams()
  const router = useRouter()
  const { userProfile } = useAuth()
  const [project, setProject] = useState<ProjectDetail | null>(null)
  const [activities, setActivities] = useState<Activity[]>([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<'overview' | 'kanban' | 'gantt' | 'files' | 'team' | 'activity' | 'invitations'>('overview')
  const [showTaskModal, setShowTaskModal] = useState(false)
  const [newTask, setNewTask] = useState({
    title: '',
    description: '',
    assignee: '',
    dueDate: '',
    startDate: '',
    priority: 'medium'
  })
  const [editingTask, setEditingTask] = useState<TaskType | null>(null)
  const [showEditModal, setShowEditModal] = useState(false)
  const [tasks, setTasks] = useState<TaskType[]>([])
  const [kanbanColumns, setKanbanColumns] = useState<KanbanColumn[]>([])
  const [selectedColumnId, setSelectedColumnId] = useState<string>('todo')
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [deleteConfirmText, setDeleteConfirmText] = useState('')

  useEffect(() => {
    if (!params.id || !userProfile) return

    const db = getDatabase(app)
    const projectRef = ref(db, `projects/${params.id}`)
    
    onValue(projectRef, (snapshot) => {
      const data = snapshot.val()
      if (data) {
        setProject({
          id: params.id as string,
          ...data,
          startDate: data.startDate,
          endDate: data.endDate,
          createdAt: data.createdAt,
          updatedAt: data.updatedAt || data.createdAt
        })
      } else {
        router.push('/projects')
      }
      setLoading(false)
    })

    // 프로젝트 활동 내역 가져오기
    const activitiesRef = ref(db, `projectActivities/${params.id}`)
    onValue(activitiesRef, (snapshot) => {
      const data = snapshot.val() || {}
      const activitiesArray = Object.entries(data)
        .map(([id, activity]: [string, any]) => ({
          id,
          ...activity
        }))
        .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
        .slice(0, 20)
      
      setActivities(activitiesArray)
    })

    // 태스크 실시간 구독
    const unsubscribeTasks = taskService.subscribeToTasks(params.id as string, (tasks) => {
      console.log('Tasks loaded:', tasks)
      setTasks(tasks)
    })
    const unsubscribeColumns = taskService.subscribeToColumns(params.id as string, setKanbanColumns)

    return () => {
      off(projectRef)
      off(activitiesRef)
      unsubscribeTasks()
      unsubscribeColumns()
    }
  }, [params.id, userProfile, router])

  const handleCreateTask = async () => {
    if (!project || !newTask.title || !userProfile) return

    try {
      // 현재 컬럼의 태스크 수를 기반으로 순서 결정
      const columnTasks = tasks.filter(t => t.columnId === selectedColumnId)
      const order = columnTasks.length

      await taskService.createTask(project.id, {
        title: newTask.title,
        description: newTask.description,
        assignee: newTask.assignee,
        assigneeId: newTask.assignee ? project.team?.find(m => m === newTask.assignee) || '' : '',
        dueDate: newTask.dueDate ? new Date(newTask.dueDate) : undefined,
        startDate: newTask.startDate ? new Date(newTask.startDate) : (newTask.dueDate ? new Date(newTask.dueDate) : new Date()),
        priority: newTask.priority as TaskPriority,
        status: selectedColumnId === 'done' ? TaskStatus.DONE : 
                selectedColumnId === 'review' ? TaskStatus.REVIEW : 
                selectedColumnId === 'in-progress' ? TaskStatus.IN_PROGRESS : TaskStatus.TODO,
        columnId: selectedColumnId,
        createdBy: userProfile.uid,
        order,
        labels: [],
        checklist: [],
        projectId: project.id,
        attachments: []
      })

      // 활동 기록
      await taskService.addActivity(project.id, {
        type: 'task',
        message: `새 작업 "${newTask.title}" 생성`,
        user: userProfile.displayName || '알 수 없음',
        icon: '✅'
      })

      // 프로젝트 진행률 업데이트
      await taskService.updateProjectProgress(project.id)

      setShowTaskModal(false)
      setNewTask({
        title: '',
        description: '',
        assignee: '',
        dueDate: '',
        startDate: '',
        priority: 'medium'
      })
    } catch (error) {
      console.error('Error creating task:', error)
      alert('작업 생성 중 오류가 발생했습니다.')
    }
  }

  const updateProjectStatus = async (newStatus: ProjectDetail['status']) => {
    if (!project) return

    try {
      const db = getDatabase(app)
      await set(ref(db, `projects/${project.id}/status`), newStatus)
      await set(ref(db, `projects/${project.id}/updatedAt`), new Date().toISOString())

      // 활동 기록
      const activityRef = ref(db, `projectActivities/${project.id}`)
      const newActivityRef = push(activityRef)
      await set(newActivityRef, {
        type: 'status',
        message: `프로젝트 상태를 "${statusLabels[newStatus]}"로 변경`,
        user: userProfile?.displayName,
        timestamp: new Date().toISOString(),
        icon: '🔄'
      })
    } catch (error) {
      console.error('Error updating project status:', error)
    }
  }

  const handleDeleteProject = async () => {
    if (!project || deleteConfirmText !== '삭제') return

    try {
      const db = getDatabase(app)
      
      // 프로젝트 관련 데이터 모두 삭제
      const updates: Record<string, null> = {
        [`projects/${project.id}`]: null,
        [`projectActivities/${project.id}`]: null,
        [`files/${project.id}`]: null,
        [`invitations/${project.id}`]: null
      }
      
      await update(ref(db), updates)
      
      // 삭제 완료 후 프로젝트 목록으로 이동
      router.push('/projects')
    } catch (error) {
      console.error('Error deleting project:', error)
      alert('프로젝트 삭제 중 오류가 발생했습니다.')
    }
  }
  
  // 간트차트용 tasks 메모이제이션 - Hook은 조건문 전에 호출해야 함
  const ganttTasks = useMemo(() => {
    console.log('Creating ganttTasks from tasks:', tasks)
    const filteredTasks = tasks
      .filter(task => task.startDate && task.dueDate)
      .map(task => ({
        id: task.id,
        name: task.title,
        start: new Date(task.startDate!),
        end: new Date(task.dueDate!),
        progress: task.status === TaskStatus.DONE ? 100 : 
                 task.status === TaskStatus.IN_PROGRESS ? 50 : 
                 task.status === TaskStatus.REVIEW ? 75 : 0,
        type: 'task' as const,
        displayOrder: 1,
        dependencies: [],
        styles: {
          backgroundColor: task.priority === TaskPriority.URGENT ? '#ef4444' :
                         task.priority === TaskPriority.HIGH ? '#f97316' :
                         task.priority === TaskPriority.MEDIUM ? '#3b82f6' : '#10b981',
          backgroundSelectedColor: task.priority === TaskPriority.URGENT ? '#dc2626' :
                                 task.priority === TaskPriority.HIGH ? '#ea580c' :
                                 task.priority === TaskPriority.MEDIUM ? '#2563eb' : '#059669',
        }
      } as GanttTaskReact))
    console.log('Filtered ganttTasks:', filteredTasks)
    return filteredTasks
  }, [tasks])

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    )
  }

  if (!project) {
    return <div>프로젝트를 찾을 수 없습니다.</div>
  }

  const progressPercentage = project.progress || 0
  const budgetPercentage = project.spentBudget ? (project.spentBudget / project.budget) * 100 : 0
  const daysLeft = Math.ceil((new Date(project.endDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))
  const totalDays = Math.ceil((new Date(project.endDate).getTime() - new Date(project.startDate).getTime()) / (1000 * 60 * 60 * 24))
  const timeProgress = ((totalDays - daysLeft) / totalDays) * 100

  return (
    <div className="h-full flex flex-col overflow-hidden">
      {/* 고정 헤더 영역 */}
      <div className="flex-shrink-0 space-y-6 p-6 pb-0">
        {/* 헤더 */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-sm text-gray-600 mb-2">
              <Link href="/projects" className="hover:text-primary">프로젝트</Link>
              <span>/</span>
              <span>{project.name}</span>
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">{project.name}</h1>
            <p className="text-gray-600">{project.description}</p>
          </div>
          
        </div>
      </div>

        {/* 주요 지표 */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl shadow-sm p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-medium text-gray-600">진행률</h3>
            <span className="text-2xl">📊</span>
          </div>
          <div className="text-2xl font-bold text-gray-900 mb-2">{progressPercentage}%</div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className="bg-blue-500 h-2 rounded-full transition-all"
              style={{ width: `${progressPercentage}%` }}
            />
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-medium text-gray-600">예산 사용</h3>
            <span className="text-2xl">💰</span>
          </div>
          <div className="text-2xl font-bold text-gray-900 mb-2">
            {new Intl.NumberFormat('ko-KR').format(project.spentBudget || 0)}원
          </div>
          <div className="text-sm text-gray-500">
            총 {new Intl.NumberFormat('ko-KR').format(project.budget)}원
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-medium text-gray-600">남은 기간</h3>
            <span className="text-2xl">📅</span>
          </div>
          <div className="text-2xl font-bold text-gray-900 mb-2">{daysLeft}일</div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className={`h-2 rounded-full transition-all ${
                timeProgress > 90 ? 'bg-red-500' : 
                timeProgress > 75 ? 'bg-yellow-500' : 'bg-green-500'
              }`}
              style={{ width: `${timeProgress}%` }}
            />
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-medium text-gray-600">팀원</h3>
            <span className="text-2xl">👥</span>
          </div>
          <div className="text-2xl font-bold text-gray-900 mb-2">{project.team?.length || 0}명</div>
          <div className="flex -space-x-2">
            {project.team?.slice(0, 4).map((member, idx) => (
              <div
                key={idx}
                className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center text-xs font-medium text-gray-700 border-2 border-white"
              >
                {member.charAt(0)}
              </div>
            ))}
            {(project.team?.length || 0) > 4 && (
              <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center text-xs font-medium text-gray-600 border-2 border-white">
                +{project.team.length - 4}
              </div>
            )}
          </div>
          </div>
        </div>
      </div>

      {/* 스크롤 가능한 탭 영역 */}
      <div className="flex-1 bg-white rounded-xl shadow-sm mx-6 mb-6 overflow-hidden flex flex-col min-h-0">
        <div className="border-b border-gray-200 flex-shrink-0">
          <nav className="flex gap-6 px-6 overflow-x-auto">
            {[
              { id: 'overview', label: '📋 개요' },
              { id: 'kanban', label: '📊 칸반보드' },
              { id: 'gantt', label: '📈 간트차트' },
              { id: 'files', label: '📁 파일' },
              { id: 'team', label: '👥 팀' },
              { id: 'activity', label: '📝 활동' },
              { id: 'invitations', label: '✉️ 초대' }
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors whitespace-nowrap ${
                  activeTab === tab.id
                    ? 'border-primary text-primary'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </nav>
        </div>

        <div className="flex-1 overflow-hidden min-h-0">
          {activeTab === 'overview' && (
            <div className="p-6 h-full overflow-y-auto">
              <div className="space-y-6">
              <div>
                <h3 className="text-lg font-medium mb-4">프로젝트 정보</h3>
                <dl className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <dt className="text-sm font-medium text-gray-500">시작일</dt>
                    <dd className="mt-1 text-sm text-gray-900">
                      {new Date(project.startDate).toLocaleDateString('ko-KR')}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-sm font-medium text-gray-500">종료일</dt>
                    <dd className="mt-1 text-sm text-gray-900">
                      {new Date(project.endDate).toLocaleDateString('ko-KR')}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-sm font-medium text-gray-500">생성일</dt>
                    <dd className="mt-1 text-sm text-gray-900">
                      {new Date(project.createdAt).toLocaleDateString('ko-KR')}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-sm font-medium text-gray-500">최종 수정일</dt>
                    <dd className="mt-1 text-sm text-gray-900">
                      {new Date(project.updatedAt).toLocaleDateString('ko-KR')}
                    </dd>
                  </div>
                </dl>
              </div>

              <div>
                <h3 className="text-lg font-medium mb-4">마일스톤</h3>
                {project.milestones && project.milestones.length > 0 ? (
                  <div className="space-y-4">
                    {project.milestones.map(milestone => (
                      <div key={milestone.id} className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg">
                        <div className={`w-4 h-4 rounded-full ${
                          milestone.completed ? 'bg-green-500' : 'bg-gray-300'
                        }`} />
                        <div className="flex-1">
                          <h4 className="font-medium">{milestone.title}</h4>
                          <p className="text-sm text-gray-600">{milestone.description}</p>
                        </div>
                        <div className="text-sm text-gray-500">
                          {new Date(milestone.date).toLocaleDateString('ko-KR')}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-500">마일스톤이 없습니다.</p>
                )}
              </div>
              </div>
            </div>
          )}

          {activeTab === 'kanban' && (
            <div className="h-full">
              <KanbanBoardPro
                columns={kanbanColumns.map(col => ({
                  ...col,
                  tasks: tasks.filter(task => task.columnId === col.id).map(task => ({
                    ...task,
                    dueDate: task.dueDate ? new Date(task.dueDate) : undefined,
                    priority: task.priority === 'low' ? TaskPriority.LOW :
                              task.priority === 'medium' ? TaskPriority.MEDIUM :
                              task.priority === 'high' ? TaskPriority.HIGH :
                              task.priority === 'urgent' ? TaskPriority.URGENT : TaskPriority.MEDIUM
                  }))
                }))}
                onColumnsChange={async (newColumns) => {
                  // Update column structure
                  const columns = newColumns.map((col, index) => ({
                    id: col.id,
                    title: col.title,
                    color: col.color,
                    limit: col.limit || 0,
                    order: index
                  }))
                  await taskService.updateKanbanColumns(project.id, columns)
                  
                  // Update task positions if they've changed
                  const taskUpdates: Array<{ id: string; columnId: string; order: number }> = []
                  newColumns.forEach(column => {
                    column.tasks.forEach((task, index) => {
                      const originalTask = tasks.find(t => t.id === task.id)
                      if (originalTask && (originalTask.columnId !== column.id || originalTask.order !== index)) {
                        taskUpdates.push({
                          id: task.id,
                          columnId: column.id,
                          order: index
                        })
                      }
                    })
                  })
                  
                  if (taskUpdates.length > 0) {
                    await taskService.updateTasksOrder(project.id, taskUpdates)
                    await taskService.updateProjectProgress(project.id)
                    
                    // 태스크 이동 활동 로그 기록
                    for (const update of taskUpdates) {
                      const task = tasks.find(t => t.id === update.id)
                      const newColumn = columns.find(c => c.id === update.columnId)
                      if (task && newColumn) {
                        await taskService.addActivity(project.id, {
                          type: 'task',
                          message: `"${task.title}" 작업을 "${newColumn.title}"(으)로 이동`,
                          user: userProfile?.displayName || '알 수 없음',
                          icon: '📋'
                        })
                      }
                    }
                  }
                }}
                onTaskAdd={(columnId) => {
                  setSelectedColumnId(columnId)
                  setShowTaskModal(true)
                }}
                onTaskEdit={(task) => {
                  setEditingTask(task)
                  setShowEditModal(true)
                }}
                onTaskDelete={async (taskId) => {
                  if (confirm('정말로 이 작업을 삭제하시겠습니까?')) {
                    await taskService.deleteTask(project.id, taskId)
                    await taskService.updateProjectProgress(project.id)
                    await taskService.addActivity(project.id, {
                      type: 'task',
                      message: '작업을 삭제했습니다',
                      user: userProfile?.displayName || '알 수 없음',
                      icon: '🗑️'
                    })
                  }
                }}
              />
            </div>
          )}

          {activeTab === 'gantt' && (
            <div className="h-full">
              {ganttTasks.length > 0 ? (
                <GanttChartSimplified tasks={ganttTasks} />
              ) : (
                <div className="flex flex-col items-center justify-center h-full py-12">
                  <div className="text-6xl mb-4 opacity-50">📊</div>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">간트차트가 비어있습니다</h3>
                  <p className="text-gray-600 mb-6 text-center">
                    시작일과 마감일이 설정된 태스크를 생성하면<br />
                    간트차트에서 확인할 수 있습니다.
                  </p>
                  <button
                    onClick={() => setShowTaskModal(true)}
                    className="px-6 py-3 bg-primary text-white rounded-lg hover:bg-primary-hover transition-colors"
                  >
                    첫 번째 태스크 만들기
                  </button>
                </div>
              )}
            </div>
          )}

          {activeTab === 'files' && (
            <div className="p-6 h-full overflow-y-auto">
              <h3 className="text-lg font-medium mb-4">파일</h3>
              {project.files && project.files.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {project.files.map(file => (
                    <div key={file.id} className="border rounded-lg p-4 hover:bg-gray-50">
                      <div className="flex items-start gap-3">
                        <div className="text-3xl">📄</div>
                        <div className="flex-1">
                          <h4 className="font-medium text-sm">{file.name}</h4>
                          <p className="text-xs text-gray-500 mt-1">
                            {(file.size / 1024 / 1024).toFixed(2)} MB
                          </p>
                          <p className="text-xs text-gray-500">
                            {file.uploadedBy} • {new Date(file.uploadedAt).toLocaleDateString('ko-KR')}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500 text-center py-8">파일이 없습니다.</p>
              )}
            </div>
          )}

          {activeTab === 'team' && (
            <div className="p-6 h-full overflow-y-auto">
              <h3 className="text-lg font-medium mb-4">팀 구성원</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {project.team?.map((member, idx) => (
                  <div key={idx} className="flex items-center gap-3 p-4 border rounded-lg">
                    <div className="w-12 h-12 bg-gray-300 rounded-full flex items-center justify-center text-lg font-medium text-gray-700">
                      {member.charAt(0)}
                    </div>
                    <div>
                      <h4 className="font-medium">{member}</h4>
                      <p className="text-sm text-gray-500">팀원</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'activity' && (
            <div className="p-6 h-full overflow-y-auto">
              <h3 className="text-lg font-medium mb-4">활동 내역</h3>
              {activities.length > 0 ? (
                <div className="space-y-3">
                  {activities.map(activity => (
                    <div key={activity.id} className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                      <div className="text-2xl">{activity.icon}</div>
                      <div className="flex-1">
                        <p className="text-sm">
                          <span className="font-medium">{activity.user}</span>님이 {activity.message}
                        </p>
                        <p className="text-xs text-gray-500 mt-1">
                          {new Date(activity.timestamp).toLocaleString('ko-KR')}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500 text-center py-8">활동 내역이 없습니다.</p>
              )}
            </div>
          )}

          {activeTab === 'invitations' && (
            <div className="p-6 h-full overflow-y-auto">
              <ProjectInvitations projectId={params.id as string} projectName={project.name} />
            </div>
          )}
        </div>
      </div>

      {/* 작업 생성 모달 */}
      {showTaskModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-md">
            <h3 className="text-lg font-medium mb-4">새 작업 만들기</h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  작업 제목
                </label>
                <input
                  type="text"
                  value={newTask.title}
                  onChange={(e) => setNewTask({ ...newTask, title: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary"
                  placeholder="작업 제목을 입력하세요"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  설명
                </label>
                <textarea
                  value={newTask.description}
                  onChange={(e) => setNewTask({ ...newTask, description: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary"
                  rows={3}
                  placeholder="작업 설명을 입력하세요"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  담당자
                </label>
                <select
                  value={newTask.assignee}
                  onChange={(e) => setNewTask({ ...newTask, assignee: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary"
                >
                  <option value="">담당자 선택</option>
                  {project.team?.map((member, idx) => (
                    <option key={idx} value={member}>{member}</option>
                  ))}
                </select>
              </div>
              
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    시작일
                  </label>
                  <input
                    type="date"
                    value={newTask.startDate}
                    onChange={(e) => setNewTask({ ...newTask, startDate: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    마감일
                  </label>
                  <input
                    type="date"
                    value={newTask.dueDate}
                    onChange={(e) => setNewTask({ ...newTask, dueDate: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary"
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  우선순위
                </label>
                <div className="flex gap-2">
                  {[
                    { value: 'low', label: '🟢 낮음' },
                    { value: 'medium', label: '🟡 보통' },
                    { value: 'high', label: '🟠 높음' },
                    { value: 'urgent', label: '🔴 긴급' }
                  ].map(priority => (
                    <button
                      key={priority.value}
                      type="button"
                      onClick={() => setNewTask({ ...newTask, priority: priority.value as any })}
                      className={`flex-1 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                        newTask.priority === priority.value
                          ? priority.value === 'low' ? 'bg-green-100 text-green-700' :
                            priority.value === 'medium' ? 'bg-yellow-100 text-yellow-700' :
                            priority.value === 'high' ? 'bg-orange-100 text-orange-700' :
                            'bg-red-100 text-red-700'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      {priority.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
            
            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setShowTaskModal(false)}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                취소
              </button>
              <button
                onClick={handleCreateTask}
                className="flex-1 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-hover"
              >
                생성
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 태스크 수정 모달 */}
      {showEditModal && editingTask && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <h3 className="text-lg font-semibold mb-4">작업 수정</h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  작업 제목
                </label>
                <input
                  type="text"
                  value={editingTask.title}
                  onChange={(e) => setEditingTask({ ...editingTask, title: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary"
                  placeholder="작업 제목을 입력하세요"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  설명
                </label>
                <textarea
                  value={editingTask.description || ''}
                  onChange={(e) => setEditingTask({ ...editingTask, description: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary"
                  rows={3}
                  placeholder="작업 설명을 입력하세요"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  담당자
                </label>
                <select
                  value={editingTask.assignee || ''}
                  onChange={(e) => setEditingTask({ ...editingTask, assignee: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary"
                >
                  <option value="">담당자 선택</option>
                  {project.team?.map((member, idx) => (
                    <option key={idx} value={member}>{member}</option>
                  ))}
                </select>
              </div>
              
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    시작일
                  </label>
                  <input
                    type="date"
                    value={editingTask.startDate ? new Date(editingTask.startDate).toISOString().split('T')[0] : ''}
                    onChange={(e) => setEditingTask({ ...editingTask, startDate: e.target.value ? new Date(e.target.value) : undefined })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    마감일
                  </label>
                  <input
                    type="date"
                    value={editingTask.dueDate ? new Date(editingTask.dueDate).toISOString().split('T')[0] : ''}
                    onChange={(e) => setEditingTask({ ...editingTask, dueDate: e.target.value ? new Date(e.target.value) : undefined })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary"
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  우선순위
                </label>
                <select
                  value={editingTask.priority}
                  onChange={(e) => setEditingTask({ ...editingTask, priority: e.target.value as TaskPriority })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary"
                >
                  <option value={TaskPriority.LOW}>낮음</option>
                  <option value={TaskPriority.MEDIUM}>중간</option>
                  <option value={TaskPriority.HIGH}>높음</option>
                  <option value={TaskPriority.URGENT}>긴급</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  상태
                </label>
                <select
                  value={editingTask.columnId}
                  onChange={(e) => setEditingTask({ ...editingTask, columnId: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary"
                >
                  {kanbanColumns.map(column => (
                    <option key={column.id} value={column.id}>{column.title}</option>
                  ))}
                </select>
              </div>
            </div>
            
            <div className="flex gap-3 mt-6">
              <button
                onClick={() => {
                  setShowEditModal(false)
                  setEditingTask(null)
                }}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                취소
              </button>
              <button
                onClick={async () => {
                  if (editingTask && project) {
                    await taskService.updateTask(project.id, editingTask.id, editingTask)
                    await taskService.updateProjectProgress(project.id)
                    
                    // 태스크 수정 활동 로그 기록
                    await taskService.addActivity(project.id, {
                      type: 'task',
                      message: `"${editingTask.title}" 작업을 수정했습니다`,
                      user: userProfile?.displayName || '알 수 없음',
                      icon: '✏️'
                    })
                    
                    setShowEditModal(false)
                    setEditingTask(null)
                  }
                }}
                className="flex-1 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-hover"
              >
                수정 완료
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 프로젝트 삭제 확인 모달 */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold text-red-800 mb-4">프로젝트 삭제 확인</h3>
            
            <div className="space-y-4">
              <div className="p-4 bg-red-50 rounded-lg">
                <p className="text-sm text-red-700 mb-2">
                  <strong>경고:</strong> 이 작업은 되돌릴 수 없습니다!
                </p>
                <p className="text-sm text-gray-700">
                  프로젝트 <strong>&quot;{project?.name}&quot;</strong>을(를) 삭제하면 다음 항목들이 모두 영구적으로 삭제됩니다:
                </p>
                <ul className="mt-2 text-sm text-gray-600 list-disc list-inside">
                  <li>모든 작업 ({tasks.length}개)</li>
                  <li>모든 파일 및 첨부파일</li>
                  <li>모든 활동 기록</li>
                  <li>모든 초대 링크</li>
                </ul>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  계속하려면 <strong className="text-red-600">삭제</strong>라고 입력하세요:
                </label>
                <input
                  type="text"
                  value={deleteConfirmText}
                  onChange={(e) => setDeleteConfirmText(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500"
                  placeholder="삭제"
                />
              </div>
            </div>
            
            <div className="flex gap-3 mt-6">
              <button
                onClick={() => {
                  setShowDeleteModal(false)
                  setDeleteConfirmText('')
                }}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                취소
              </button>
              <button
                onClick={handleDeleteProject}
                disabled={deleteConfirmText !== '삭제'}
                className={`flex-1 px-4 py-2 rounded-lg transition-colors ${
                  deleteConfirmText === '삭제'
                    ? 'bg-red-600 text-white hover:bg-red-700'
                    : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                }`}
              >
                프로젝트 삭제
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
