'use client'

import React, { useState, useEffect } from 'react'
import { KanbanBoardPro } from '@/components/kanban'
import { KanbanTask } from '@/types/task'
import { getDatabase, ref, onValue, off } from 'firebase/database'
import { app } from '@/lib/firebase'
import { useAuth } from '@/lib/auth-context'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Input } from '@/components/ui/input'
import { Search, Filter, Plus, Settings } from 'lucide-react'
import { Badge } from '@/components/ui/badge'

interface KanbanColumn {
  id: string
  title: string
  color: string
  limit?: number
  tasks: KanbanTask[]
}

export default function GlobalKanbanPage() {
  const { user, userProfile } = useAuth()
  const [columns, setColumns] = useState<KanbanColumn[]>([
    { id: 'todo', title: '할 일', color: '#ef4444', tasks: [] },
    { id: 'in-progress', title: '진행 중', color: '#eab308', tasks: [] },
    { id: 'review', title: '검토', color: '#8b5cf6', tasks: [] },
    { id: 'done', title: '완료', color: '#10b981', tasks: [] }
  ])
  const [projects, setProjects] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  // 필터 상태
  const [selectedProject, setSelectedProject] = useState<string>('all')
  const [selectedAssignee, setSelectedAssignee] = useState<string>('all')
  const [searchTerm, setSearchTerm] = useState('')

  // Firebase에서 전체 프로젝트 및 태스크 데이터 로드
  useEffect(() => {
    if (!user) return

    const db = getDatabase(app)

    // 프로젝트 목록 로드
    const projectsRef = ref(db, 'projects')
    const projectsUnsubscribe = onValue(projectsRef, (snapshot) => {
      const data = snapshot.val()
      if (data) {
        const projectsList = Object.entries(data).map(([id, project]: [string, any]) => ({
          id,
          name: project.name,
        }))
        setProjects(projectsList)

        // 프로젝트별 태스크 로드
        loadAllTasks(projectsList)
      }
      setLoading(false)
    })

    return () => {
      off(projectsRef)
    }
  }, [user])

  const loadAllTasks = (projectsList: any[]) => {
    const db = getDatabase(app)
    const allTasks: { [columnId: string]: KanbanTask[] } = {
      'todo': [],
      'in-progress': [],
      'review': [],
      'done': []
    }

    projectsList.forEach((project) => {
      // 각 프로젝트의 태스크 로드
      const tasksRef = ref(db, `projects/${project.id}/tasks`)
      onValue(tasksRef, (snapshot) => {
        const tasksData = snapshot.val()
        if (tasksData) {
          Object.entries(tasksData).forEach(([taskId, taskData]: [string, any]) => {
            const columnId = taskData.columnId || taskData.status || 'todo'
            const task: KanbanTask = {
              id: taskId,
              projectId: project.id,
              columnId: columnId,
              order: taskData.order || 0,
              title: taskData.title,
              description: taskData.description,
              priority: taskData.priority || 'medium',
              status: taskData.status || 'todo',
              labels: taskData.labels || [],
              assignee: taskData.assignee,
              assigneeId: taskData.assigneeId,
              assigneeName: taskData.assigneeName,
              attachments: taskData.attachments || [],
              attachmentCount: taskData.attachmentCount || 0,
              commentCount: taskData.commentCount || 0,
              dueDate: taskData.dueDate ? new Date(taskData.dueDate) : undefined,
              createdAt: new Date(taskData.createdAt),
              updatedAt: new Date(taskData.updatedAt),
              createdBy: taskData.createdBy,
            }

            // 프로젝트 이름을 라벨에 추가
            if (!task.labels.includes(project.name)) {
              task.labels = [...task.labels, project.name]
            }

            if (allTasks[columnId]) {
              allTasks[columnId].push(task)
            }
          })
        }

        // 컬럼 업데이트
        setColumns([
          { id: 'todo', title: '할 일', color: '#ef4444', tasks: allTasks['todo'] },
          { id: 'in-progress', title: '진행 중', color: '#eab308', tasks: allTasks['in-progress'] },
          { id: 'review', title: '검토', color: '#8b5cf6', tasks: allTasks['review'] },
          { id: 'done', title: '완료', color: '#10b981', tasks: allTasks['done'] }
        ])
      })
    })
  }

  // 필터링된 컬럼 계산
  const getFilteredColumns = (): KanbanColumn[] => {
    return columns.map(column => {
      let filteredTasks = [...column.tasks]

      // 프로젝트 필터
      if (selectedProject !== 'all') {
        filteredTasks = filteredTasks.filter(task => task.projectId === selectedProject)
      }

      // 담당자 필터
      if (selectedAssignee !== 'all') {
        filteredTasks = filteredTasks.filter(task => task.assigneeId === selectedAssignee)
      }

      // 검색어 필터
      if (searchTerm) {
        filteredTasks = filteredTasks.filter(task =>
          task.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
          task.description?.toLowerCase().includes(searchTerm.toLowerCase())
        )
      }

      return {
        ...column,
        tasks: filteredTasks
      }
    })
  }

  const handleColumnsChange = (newColumns: KanbanColumn[]) => {
    setColumns(newColumns)
    console.log('Columns updated:', newColumns)
  }

  const handleTaskAdd = (columnId: string) => {
    console.log('Add task to column:', columnId)
  }

  const handleTaskEdit = (task: KanbanTask) => {
    console.log('Edit task:', task)
  }

  const handleTaskDelete = (taskId: string, columnId: string) => {
    console.log('Delete task:', taskId, 'from column:', columnId)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    )
  }

  const filteredColumns = getFilteredColumns()
  const totalTasks = filteredColumns.reduce((sum, col) => sum + col.tasks.length, 0)

  return (
    <div className="h-full flex flex-col space-y-6 p-6">
      {/* 헤더 */}
      <div className="flex items-center justify-between flex-shrink-0">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">전체 칸반보드</h1>
          <p className="text-sm text-gray-600 mt-1">모든 프로젝트의 작업을 한눈에 관리하세요</p>
        </div>

        <div className="flex gap-3">
          <Button variant="outline">
            <Settings className="mr-2 h-4 w-4" />
            설정
          </Button>
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            작업 추가
          </Button>
        </div>
      </div>

      {/* 필터 영역 */}
      <div className="flex items-center gap-4 flex-shrink-0">
        {/* 검색 */}
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <Input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="작업 검색..."
            className="pl-10"
          />
        </div>

        {/* 프로젝트 필터 */}
        <Select value={selectedProject} onValueChange={setSelectedProject}>
          <SelectTrigger className="w-[200px]">
            <SelectValue placeholder="프로젝트 선택" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">전체 프로젝트</SelectItem>
            {projects.map((project) => (
              <SelectItem key={project.id} value={project.id}>
                {project.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* 필터 버튼 */}
        <Button variant="outline" size="icon">
          <Filter className="h-4 w-4" />
        </Button>
      </div>

      {/* 통계 */}
      <div className="grid grid-cols-5 gap-4 flex-shrink-0">
        <div className="bg-white rounded-lg border p-4">
          <div className="text-sm text-gray-600">전체 작업</div>
          <div className="text-2xl font-bold mt-1">{totalTasks}</div>
        </div>
        {filteredColumns.map((column) => (
          <div key={column.id} className="bg-white rounded-lg border p-4">
            <div className="flex items-center justify-between mb-2">
              <div className="text-sm text-gray-600">{column.title}</div>
              <div
                className="w-3 h-3 rounded-full"
                style={{ backgroundColor: column.color }}
              />
            </div>
            <div className="text-2xl font-bold" style={{ color: column.color }}>
              {column.tasks.length}
            </div>
          </div>
        ))}
      </div>

      {/* 칸반보드 */}
      <div className="flex-1 overflow-hidden">
        {totalTasks > 0 ? (
          <KanbanBoardPro
            columns={filteredColumns}
            onColumnsChange={handleColumnsChange}
            onTaskAdd={handleTaskAdd}
            onTaskEdit={handleTaskEdit}
            onTaskDelete={handleTaskDelete}
          />
        ) : (
          <div className="flex items-center justify-center h-full bg-white rounded-lg border">
            <div className="text-center text-gray-500">
              <p className="text-lg font-medium">표시할 작업이 없습니다</p>
              <p className="text-sm mt-2">필터를 조정하거나 새 작업을 추가해보세요</p>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
