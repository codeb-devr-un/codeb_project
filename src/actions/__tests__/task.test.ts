/**
 * Task Server Actions Tests
 * Tests for core task management functionality
 */

// Mock dependencies first
jest.mock('@/lib/prisma', () => ({
  prisma: {
    task: {
      findMany: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
    $transaction: jest.fn(),
  }
}))

jest.mock('@/lib/redis', () => ({
  invalidateCache: jest.fn().mockResolvedValue(undefined)
}))

jest.mock('next/cache', () => ({
  revalidatePath: jest.fn()
}))

jest.mock('@/lib/security', () => ({
  secureLogger: {
    debug: jest.fn(),
    info: jest.fn(),
    warn: jest.fn(),
    error: jest.fn()
  }
}))

import { prisma } from '@/lib/prisma'

describe('Task Server Actions', () => {
  const mockProjectId = 'project-123'
  const mockUserId = 'user-123'

  const mockTask = {
    id: 'task-1',
    projectId: mockProjectId,
    title: 'Test Task',
    description: 'Test Description',
    status: 'TODO',
    priority: 'MEDIUM',
    order: 0,
    columnId: 'todo',
    createdBy: mockUserId,
    assigneeId: null,
    teamId: null,
    startDate: new Date('2024-01-01'),
    dueDate: new Date('2024-12-31'),
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-02'),
    labels: [],
    assignee: null,
    attachments: [],
    checklist: [],
    comments: [],
    team: null
  }

  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('getTasks', () => {
    it('should return tasks for a project', async () => {
      const { getTasks } = await import('../task')
      ;(prisma.task.findMany as jest.Mock).mockResolvedValue([mockTask])

      const result = await getTasks(mockProjectId)

      expect(prisma.task.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { projectId: mockProjectId }
        })
      )
      expect(result).toHaveLength(1)
      expect(result[0]).toHaveProperty('title', 'Test Task')
    })

    it('should return empty array on error', async () => {
      const { getTasks } = await import('../task')
      ;(prisma.task.findMany as jest.Mock).mockRejectedValue(new Error('Database error'))

      const result = await getTasks(mockProjectId)

      expect(result).toEqual([])
    })

    it('should map dates to ISO strings', async () => {
      const { getTasks } = await import('../task')
      ;(prisma.task.findMany as jest.Mock).mockResolvedValue([mockTask])

      const result = await getTasks(mockProjectId)

      expect(result[0].startDate).toBe('2024-01-01T00:00:00.000Z')
      expect(result[0].dueDate).toBe('2024-12-31T00:00:00.000Z')
    })
  })

  describe('createTask', () => {
    it('should create a new task', async () => {
      const { createTask } = await import('../task')
      ;(prisma.task.create as jest.Mock).mockResolvedValue(mockTask)

      const newTaskData = {
        title: 'Test Task',
        description: 'Test Description',
        status: 'TODO' as any,
        priority: 'MEDIUM' as any,
        createdBy: mockUserId,
        columnId: 'todo',
        order: 0
      }

      const result = await createTask(mockProjectId, newTaskData)

      expect(result.success).toBe(true)
      expect(result.task).toBeDefined()
      expect(prisma.task.create).toHaveBeenCalled()
    })

    it('should handle creation errors', async () => {
      const { createTask } = await import('../task')
      ;(prisma.task.create as jest.Mock).mockRejectedValue(new Error('Creation failed'))

      const result = await createTask(mockProjectId, {
        title: 'Test',
        createdBy: mockUserId
      } as any)

      expect(result.success).toBe(false)
      expect(result.error).toBeDefined()
    })
  })

  describe('updateTask', () => {
    it('should update an existing task', async () => {
      const { updateTask } = await import('../task')
      const updatedTask = { ...mockTask, title: 'Updated Title' }
      ;(prisma.task.update as jest.Mock).mockResolvedValue(updatedTask)

      const result = await updateTask('task-1', { title: 'Updated Title' })

      expect(result.success).toBe(true)
      expect(prisma.task.update).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { id: 'task-1' }
        })
      )
    })

    it('should handle update errors', async () => {
      const { updateTask } = await import('../task')
      ;(prisma.task.update as jest.Mock).mockRejectedValue(new Error('Update failed'))

      const result = await updateTask('task-1', { title: 'Updated' })

      expect(result.success).toBe(false)
      expect(result.error).toBeDefined()
    })
  })

  describe('deleteTask', () => {
    it('should delete a task', async () => {
      const { deleteTask } = await import('../task')
      ;(prisma.task.delete as jest.Mock).mockResolvedValue(mockTask)

      const result = await deleteTask('task-1')

      expect(result.success).toBe(true)
      expect(prisma.task.delete).toHaveBeenCalledWith({
        where: { id: 'task-1' }
      })
    })

    it('should handle deletion errors', async () => {
      const { deleteTask } = await import('../task')
      ;(prisma.task.delete as jest.Mock).mockRejectedValue(new Error('Delete failed'))

      const result = await deleteTask('task-1')

      expect(result.success).toBe(false)
    })
  })

  describe('updateTasksOrder', () => {
    it('should update multiple task orders', async () => {
      const { updateTasksOrder } = await import('../task')
      ;(prisma.$transaction as jest.Mock).mockResolvedValue([])

      const updates = [
        { id: 'task-1', columnId: 'in_progress', order: 0 },
        { id: 'task-2', columnId: 'in_progress', order: 1 }
      ]

      const result = await updateTasksOrder(mockProjectId, updates)

      expect(result.success).toBe(true)
    })

    it('should handle transaction errors', async () => {
      const { updateTasksOrder } = await import('../task')
      ;(prisma.$transaction as jest.Mock).mockRejectedValue(new Error('Transaction failed'))

      const result = await updateTasksOrder(mockProjectId, [
        { id: 'task-1', columnId: 'todo', order: 0 }
      ])

      expect(result.success).toBe(false)
    })
  })
})
