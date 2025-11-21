import { useState, useEffect } from 'react'
import { useAuth } from '@/lib/auth-context'
import taskService, { Task as TaskType, KanbanColumn } from '@/services/task-service'
import { TaskStatus, TaskPriority } from '@/types/task'

interface NewTaskData {
  title: string
  description: string
  assignee: string
  dueDate: string
  startDate: string
  priority: string
}

export function useProjectTasks(projectId: string | undefined) {
  const { userProfile } = useAuth()
  const [tasks, setTasks] = useState<TaskType[]>([])
  const [kanbanColumns, setKanbanColumns] = useState<KanbanColumn[]>([])
  const [selectedColumnId, setSelectedColumnId] = useState<string>('todo')

  useEffect(() => {
    if (!projectId) return

    // Subscribe to real-time task updates
    const unsubscribeTasks = taskService.subscribeToTasks(projectId, (tasks) => {
      console.log('Tasks loaded:', tasks)
      setTasks(tasks)
    })
    const unsubscribeColumns = taskService.subscribeToColumns(projectId, setKanbanColumns)

    return () => {
      unsubscribeTasks()
      unsubscribeColumns()
    }
  }, [projectId])

  const createTask = async (newTask: NewTaskData, projectTeam: string[] = []) => {
    if (!projectId || !newTask.title || !userProfile) return

    try {
      // Determine order based on current column tasks
      const columnTasks = tasks.filter(t => t.columnId === selectedColumnId)
      const order = columnTasks.length

      await taskService.createTask(projectId, {
        title: newTask.title,
        description: newTask.description,
        assignee: newTask.assignee,
        assigneeId: newTask.assignee ? projectTeam.find(m => m === newTask.assignee) || '' : '',
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
        projectId: projectId,
        attachments: []
      })

      // Log activity
      await taskService.addActivity(projectId, {
        type: 'task',
        message: `새 작업 "${newTask.title}" 생성`,
        user: userProfile.displayName || '알 수 없음',
        icon: '✅'
      })

      // Update project progress
      await taskService.updateProjectProgress(projectId)
    } catch (error) {
      console.error('Error creating task:', error)
      throw error
    }
  }

  const updateTask = async (taskId: string, updatedTask: TaskType) => {
    if (!projectId || !userProfile) return

    await taskService.updateTask(projectId, taskId, updatedTask)
    await taskService.updateProjectProgress(projectId)
    
    // Log activity
    await taskService.addActivity(projectId, {
      type: 'task',
      message: `"${updatedTask.title}" 작업을 수정했습니다`,
      user: userProfile.displayName || '알 수 없음',
      icon: '✏️'
    })
  }

  const deleteTask = async (taskId: string) => {
    if (!projectId || !userProfile) return

    await taskService.deleteTask(projectId, taskId)
    await taskService.updateProjectProgress(projectId)
    await taskService.addActivity(projectId, {
      type: 'task',
      message: '작업을 삭제했습니다',
      user: userProfile.displayName || '알 수 없음',
      icon: '🗑️'
    })
  }

  const updateColumnsAndTasks = async (newColumns: (KanbanColumn & { tasks: TaskType[] })[]) => {
    if (!projectId || !userProfile) return

    // Update column structure
    const columns = newColumns.map((col, index) => ({
      id: col.id,
      title: col.title,
      color: col.color,
      limit: col.limit || 0,
      order: index
    }))
    await taskService.updateKanbanColumns(projectId, columns)
    
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
      await taskService.updateTasksOrder(projectId, taskUpdates)
      await taskService.updateProjectProgress(projectId)
      
      // Log task movement activities
      for (const update of taskUpdates) {
        const task = tasks.find(t => t.id === update.id)
        const newColumn = columns.find(c => c.id === update.columnId)
        if (task && newColumn) {
          await taskService.addActivity(projectId, {
            type: 'task',
            message: `"${task.title}" 작업을 "${newColumn.title}"(으)로 이동`,
            user: userProfile.displayName || '알 수 없음',
            icon: '📋'
          })
        }
      }
    }
  }

  return {
    tasks,
    kanbanColumns,
    selectedColumnId,
    setSelectedColumnId,
    createTask,
    updateTask,
    deleteTask,
    updateColumnsAndTasks
  }
}