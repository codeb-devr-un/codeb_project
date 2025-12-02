// 프로젝트 관련 타입 정의
import { Project, Task, File } from './index'

export interface GanttTask {
  id: string
  projectId: string
  name: string
  startDate: Date
  endDate: Date
  progress: number
  dependencies?: string[] // 다른 task의 id들
  assignee?: string
  color?: string
  children?: GanttTask[]
}

export interface KanbanCard {
  id: string
  title: string
  description: string
  status: 'backlog' | 'todo' | 'in_progress' | 'review' | 'done'
  priority: 'low' | 'medium' | 'high' | 'urgent'
  assignee?: string
  labels: string[]
  dueDate?: Date
  checklist?: ChecklistItem[]
  attachments?: number
  comments?: number
  department?: string
}

export interface ChecklistItem {
  id: string
  text: string
  completed: boolean
}

export interface ProjectMember {
  id: string
  name: string
  role: string
  avatar?: string
  email: string
}

export interface ProjectDetail extends Project {
  members: ProjectMember[]
  tasks: Task[]
  ganttTasks?: GanttTask[]
  kanbanCards?: KanbanCard[]
  files?: File[]
  totalBudget: number
  spentBudget: number
}