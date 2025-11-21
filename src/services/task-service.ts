import { database } from '@/lib/firebase'
import { ref as dbRef, push, set, get, update, remove, onValue, off } from 'firebase/database'
import { 
  KanbanTask as Task, 
  TaskStatus, 
  TaskPriority, 
  ChecklistItem,
  taskToFirebase,
  taskFromFirebase,
  stringToTaskStatus
} from '@/types/task'

// 기존 인터페이스와의 호환성을 위해 export
export type { Task, ChecklistItem }

export interface KanbanColumn {
  id: string
  title: string
  color: string
  limit?: number
  order: number
}

class TaskService {
  // 프로젝트의 칸반 컬럼 가져오기
  async getKanbanColumns(projectId: string): Promise<KanbanColumn[]> {
    // 먼저 새로운 경로 확인
    let columnsRef = dbRef(database, `projects/${projectId}/kanbanColumns`)
    let snapshot = await get(columnsRef)
    
    // 새로운 경로에 없으면 기존 경로 확인
    if (!snapshot.exists()) {
      columnsRef = dbRef(database, `kanban/${projectId}/columns`)
      snapshot = await get(columnsRef)
    }
    
    if (!snapshot.exists()) {
      // 기본 컬럼 생성
      const defaultColumns: KanbanColumn[] = [
        { id: 'todo', title: '할 일', color: '#ef4444', order: 0 },
        { id: 'in_progress', title: '진행 중', color: '#eab308', order: 1 },
        { id: 'review', title: '검토', color: '#8b5cf6', order: 2 },
        { id: 'done', title: '완료', color: '#10b981', order: 3 }
      ]
      
      // 기본 컬럼 저장
      for (const column of defaultColumns) {
        await set(dbRef(database, `projects/${projectId}/kanbanColumns/${column.id}`), column)
      }
      
      return defaultColumns
    }
    
    // 데이터가 배열인지 객체인지 확인
    const data = snapshot.val()
    let columns: KanbanColumn[] = []
    
    if (Array.isArray(data)) {
      columns = data
    } else {
      snapshot.forEach((child) => {
        columns.push(child.val())
      })
    }
    
    return columns.sort((a, b) => a.order - b.order)
  }

  // 칸반 컬럼 업데이트
  async updateKanbanColumns(projectId: string, columns: KanbanColumn[]): Promise<void> {
    const updates: Record<string, any> = {}
    
    columns.forEach((column, index) => {
      updates[`projects/${projectId}/kanbanColumns/${column.id}`] = {
        ...column,
        order: index
      }
    })
    
    await update(dbRef(database), updates)
  }

  // 프로젝트의 모든 태스크 가져오기
  async getTasks(projectId: string): Promise<Task[]> {
    // 먼저 새로운 경로 확인
    let tasksRef = dbRef(database, `projects/${projectId}/tasks`)
    let snapshot = await get(tasksRef)
    
    // 새로운 경로에 없으면 기존 경로 확인
    if (!snapshot.exists()) {
      tasksRef = dbRef(database, `tasks/${projectId}`)
      snapshot = await get(tasksRef)
    }
    
    if (!snapshot.exists()) return []
    
    const tasks: Task[] = []
    snapshot.forEach((child) => {
      const taskData = child.val()
      const baseTask = taskFromFirebase({
        id: child.key!,
        ...taskData
      })
      tasks.push({
        ...baseTask,
        columnId: taskData.columnId || 'todo',
        order: taskData.order || 0
      } as Task)
    })
    
    return tasks.sort((a, b) => a.order - b.order)
  }

  // 태스크 생성
  async createTask(projectId: string, taskData: Omit<Task, 'id' | 'createdAt' | 'updatedAt'>): Promise<Task> {
    const tasksRef = dbRef(database, `projects/${projectId}/tasks`)
    const newTaskRef = push(tasksRef)
    
    const now = new Date()
    const newTask: Task = {
      ...taskData,
      id: newTaskRef.key!,
      createdAt: now,
      updatedAt: now
    }
    
    // Firebase에 저장할 때는 변환
    await set(newTaskRef, taskToFirebase(newTask))
    
    // 프로젝트 업데이트 시간 갱신
    await update(dbRef(database, `projects/${projectId}`), {
      updatedAt: now.toISOString()
    })
    
    return newTask
  }

  // 태스크 업데이트
  async updateTask(projectId: string, taskId: string, updates: Partial<Task>): Promise<void> {
    const taskRef = dbRef(database, `projects/${projectId}/tasks/${taskId}`)
    
    await update(taskRef, {
      ...updates,
      updatedAt: new Date().toISOString()
    })
    
    // 프로젝트 업데이트 시간 갱신
    await update(dbRef(database, `projects/${projectId}`), {
      updatedAt: new Date().toISOString()
    })
  }

  // 태스크 삭제
  async deleteTask(projectId: string, taskId: string): Promise<void> {
    const taskRef = dbRef(database, `projects/${projectId}/tasks/${taskId}`)
    await remove(taskRef)
    
    // 프로젝트 업데이트 시간 갱신
    await update(dbRef(database, `projects/${projectId}`), {
      updatedAt: new Date().toISOString()
    })
  }

  // 태스크 순서 업데이트 (드래그 앤 드롭)
  async updateTasksOrder(projectId: string, tasks: { id: string; columnId: string; order: number }[]): Promise<void> {
    const updates: Record<string, any> = {}
    
    tasks.forEach(task => {
      updates[`projects/${projectId}/tasks/${task.id}/columnId`] = task.columnId
      updates[`projects/${projectId}/tasks/${task.id}/order`] = task.order
      updates[`projects/${projectId}/tasks/${task.id}/updatedAt`] = new Date().toISOString()
    })
    
    await update(dbRef(database), updates)
  }

  // 태스크 실시간 구독
  subscribeToTasks(projectId: string, callback: (tasks: Task[]) => void): () => void {
    let unsubscribe: (() => void) | null = null
    
    // 비동기로 경로 확인 후 리스너 설정
    const setupListener = async () => {
      // 먼저 새로운 경로 시도
      let tasksRef = dbRef(database, `projects/${projectId}/tasks`)
      let snapshot = await get(tasksRef)
      
      // 새로운 경로에 없으면 기존 경로 사용
      if (!snapshot.exists()) {
        tasksRef = dbRef(database, `tasks/${projectId}`)
      }
      
      const listener = onValue(tasksRef, (snapshot) => {
        const tasks: Task[] = []
        
        if (snapshot.exists()) {
          snapshot.forEach((child) => {
            const taskData = child.val()
            const baseTask = taskFromFirebase({
              id: child.key!,
              ...taskData
            })
            tasks.push({
              ...baseTask,
              columnId: taskData.columnId || 'todo',
              order: taskData.order || 0
            } as Task)
          })
        }
        
        callback(tasks.sort((a, b) => a.order - b.order))
      })
      
      unsubscribe = () => off(tasksRef, 'value', listener)
    }
    
    setupListener()
    
    // 구독 해제 함수 반환
    return () => {
      if (unsubscribe) {
        unsubscribe()
      }
    }
  }

  // 칸반 컬럼 실시간 구독
  subscribeToColumns(projectId: string, callback: (columns: KanbanColumn[]) => void): () => void {
    let unsubscribe: (() => void) | null = null
    
    // 비동기로 경로 확인 후 리스너 설정
    const setupListener = async () => {
      let columnsRef = dbRef(database, `projects/${projectId}/kanbanColumns`)
      let snapshot = await get(columnsRef)
      
      // 새로운 경로에 없으면 기존 경로 사용
      if (!snapshot.exists()) {
        columnsRef = dbRef(database, `kanban/${projectId}/columns`)
      }
      
      const listener = onValue(columnsRef, (snapshot) => {
        if (snapshot.exists()) {
          const data = snapshot.val()
          let columns: KanbanColumn[] = []
          
          if (Array.isArray(data)) {
            columns = data
          } else {
            snapshot.forEach((child) => {
              columns.push(child.val())
            })
          }
          
          callback(columns.sort((a, b) => a.order - b.order))
        } else {
          // 기본 컬럼 반환
          callback([
            { id: 'todo', title: '할 일', color: '#ef4444', order: 0 },
            { id: 'in-progress', title: '진행 중', color: '#eab308', order: 1 },
            { id: 'review', title: '검토', color: '#8b5cf6', order: 2 },
            { id: 'done', title: '완료', color: '#10b981', order: 3 }
          ])
        }
      })
      
      unsubscribe = () => off(columnsRef, 'value', listener)
    }
    
    setupListener()
    
    // 구독 해제 함수 반환
    return () => {
      if (unsubscribe) {
        unsubscribe()
      }
    }
  }

  // 프로젝트 진행률 계산 및 업데이트
  async updateProjectProgress(projectId: string): Promise<void> {
    const tasks = await this.getTasks(projectId)
    
    if (tasks.length === 0) {
      await update(dbRef(database, `projects/${projectId}`), { progress: 0 })
      return
    }
    
    const completedTasks = tasks.filter(task => task.status === TaskStatus.DONE).length
    const progress = Math.round((completedTasks / tasks.length) * 100)
    
    await update(dbRef(database, `projects/${projectId}`), {
      progress,
      totalTasks: tasks.length,
      completedTasks,
      activeTasks: tasks.filter(task => task.status === TaskStatus.IN_PROGRESS).length
    })
  }

  // 활동 로그 추가
  async addActivity(projectId: string, activity: {
    type: string
    message: string
    user: string
    icon: string
  }): Promise<void> {
    const activityRef = dbRef(database, `projectActivities/${projectId}`)
    const newActivityRef = push(activityRef)
    
    await set(newActivityRef, {
      ...activity,
      timestamp: new Date().toISOString()
    })
  }
}

export default new TaskService()
