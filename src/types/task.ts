// 통합된 Task 타입 정의

// Task 상태 Enum
export enum TaskStatus {
  BACKLOG = 'backlog',
  TODO = 'todo',
  IN_PROGRESS = 'in_progress',
  REVIEW = 'review',
  DONE = 'done'
}

// Task 우선순위 Enum
export enum TaskPriority {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  URGENT = 'urgent'
}

// 체크리스트 아이템
export interface ChecklistItem {
  id: string
  text: string
  completed: boolean
}

// 첨부파일
export interface TaskAttachment {
  id: string
  name: string
  url: string
  size: number
  type: string
  uploadedAt: Date
  uploadedBy: string
}

// 댓글
export interface TaskComment {
  id: string
  text: string
  userId: string
  userName: string
  createdAt: Date
  updatedAt?: Date
}

// 기본 Task 인터페이스
export interface BaseTask {
  id: string
  projectId?: string
  title: string
  description?: string
  assignee?: string
  assigneeId?: string
  assigneeName?: string
  status: TaskStatus
  priority: TaskPriority
  startDate?: Date
  dueDate?: Date
  labels: string[]
  attachments: TaskAttachment[]
  checklist?: ChecklistItem[]
  comments?: TaskComment[]
  createdAt: Date
  updatedAt: Date
  createdBy: string
  createdByName?: string
  department?: string // 부서 ID
  color?: string
}

// 칸반보드용 Task
export interface KanbanTask extends BaseTask {
  columnId: string
  order: number
  progress?: number  // 0-100, 간트차트 연동용
  // 칸반 특화 필드
  attachmentCount?: number  // UI 표시용
  commentCount?: number     // UI 표시용
}

export interface KanbanColumn {
  id: string
  title: string
  color: string
  limit?: number
  order: number
}

// 간트차트용 Task
export interface GanttTask extends BaseTask {
  progress: number  // 0-100
  dependencies?: string[]  // 다른 task ID들
  color?: string
  children?: GanttTask[]
  type?: 'task' | 'project' | 'milestone'
}

// 간단한 뷰용 Task (목록 표시 등)
export interface TaskSummary {
  id: string
  title: string
  status: TaskStatus
  priority: TaskPriority
  assignee?: string
  dueDate?: Date
}

// 타입 변환 유틸리티
export const taskStatusToString = (status: TaskStatus): string => {
  return status.toLowerCase().replace('_', ' ')
}

export const stringToTaskStatus = (status: string): TaskStatus => {
  if (!status) return TaskStatus.TODO
  const normalized = status.toUpperCase().replace(/[\s-]/g, '_')
  return TaskStatus[normalized as keyof typeof TaskStatus] || TaskStatus.TODO
}

export const taskPriorityToString = (priority: TaskPriority): string => {
  return priority.toLowerCase()
}

export const stringToTaskPriority = (priority: string): TaskPriority => {
  if (!priority) return TaskPriority.MEDIUM
  const normalized = priority.toUpperCase()
  return TaskPriority[normalized as keyof typeof TaskPriority] || TaskPriority.MEDIUM
}

// Firebase 저장용 변환 (Date -> string)
export const taskToFirebase = (task: Partial<BaseTask>): any => {
  return {
    ...task,
    startDate: task.startDate?.toISOString(),
    dueDate: task.dueDate?.toISOString(),
    createdAt: task.createdAt?.toISOString(),
    updatedAt: task.updatedAt?.toISOString(),
    attachments: task.attachments?.map(a => ({
      ...a,
      uploadedAt: a.uploadedAt.toISOString()
    })),
    comments: task.comments?.map(c => ({
      ...c,
      createdAt: c.createdAt.toISOString(),
      updatedAt: c.updatedAt?.toISOString()
    }))
  }
}

// Firebase에서 가져올 때 변환 (string -> Date)
export const taskFromFirebase = (data: any): BaseTask => {
  return {
    ...data,
    status: stringToTaskStatus(data.status),
    priority: stringToTaskPriority(data.priority),
    startDate: data.startDate ? new Date(data.startDate) : undefined,
    dueDate: data.dueDate ? new Date(data.dueDate) : undefined,
    createdAt: new Date(data.createdAt),
    updatedAt: new Date(data.updatedAt),
    labels: data.labels || [],
    attachments: (data.attachments || []).map((a: any) => ({
      ...a,
      uploadedAt: new Date(a.uploadedAt)
    })),
    comments: (data.comments || []).map((c: any) => ({
      ...c,
      createdAt: new Date(c.createdAt),
      updatedAt: c.updatedAt ? new Date(c.updatedAt) : undefined
    }))
  }
}

// 기존 타입과의 호환성을 위한 타입 별칭
export type Task = BaseTask
export type KanbanCard = KanbanTask