/**
 * Task Server Actions Tests
 * Tests for core task management functionality
 */

// Create mock functions first
const mockFindMany = jest.fn()
const mockCreate = jest.fn()
const mockUpdate = jest.fn()
const mockDelete = jest.fn()
const mockTransaction = jest.fn()

// Mock dependencies before imports
jest.mock('@/lib/prisma', () => ({
  prisma: {
    task: {
      findMany: mockFindMany,
      create: mockCreate,
      update: mockUpdate,
      delete: mockDelete,
    },
    $transaction: mockTransaction,
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
    // Reset all mock implementations
    mockFindMany.mockReset()
    mockCreate.mockReset()
    mockUpdate.mockReset()
    mockDelete.mockReset()
    mockTransaction.mockReset()
  })

  describe('getTasks', () => {
    it('should return tasks for a project', async () => {
      mockFindMany.mockResolvedValue([mockTask])

      const { getTasks } = await import('../task')
      const result = await getTasks(mockProjectId)

      expect(mockFindMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { projectId: mockProjectId }
        })
      )
      expect(result).toHaveLength(1)
      expect(result[0]).toHaveProperty('title', 'Test Task')
    })

    it('should return empty array on error', async () => {
      mockFindMany.mockRejectedValue(new Error('Database error'))

      const { getTasks } = await import('../task')
      const result = await getTasks(mockProjectId)

      expect(result).toEqual([])
    })

    it('should map dates to ISO strings', async () => {
      mockFindMany.mockResolvedValue([mockTask])

      const { getTasks } = await import('../task')
      const result = await getTasks(mockProjectId)

      expect(result[0].startDate).toBe('2024-01-01T00:00:00.000Z')
      expect(result[0].dueDate).toBe('2024-12-31T00:00:00.000Z')
    })
  })

  describe('createTask', () => {
    it('should create a new task', async () => {
      mockCreate.mockResolvedValue(mockTask)

      const { createTask } = await import('../task')
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
      expect(mockCreate).toHaveBeenCalled()
    })

    it('should handle creation errors', async () => {
      mockCreate.mockRejectedValue(new Error('Creation failed'))

      const { createTask } = await import('../task')
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
      const updatedTask = { ...mockTask, title: 'Updated Title' }
      mockUpdate.mockResolvedValue(updatedTask)

      const { updateTask } = await import('../task')
      const result = await updateTask('task-1', { title: 'Updated Title' })

      expect(result.success).toBe(true)
      expect(mockUpdate).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { id: 'task-1' }
        })
      )
    })

    it('should handle update errors', async () => {
      mockUpdate.mockRejectedValue(new Error('Update failed'))

      const { updateTask } = await import('../task')
      const result = await updateTask('task-1', { title: 'Updated' })

      expect(result.success).toBe(false)
      expect(result.error).toBeDefined()
    })
  })

  describe('deleteTask', () => {
    it('should delete a task', async () => {
      mockDelete.mockResolvedValue(mockTask)

      const { deleteTask } = await import('../task')
      const result = await deleteTask('task-1')

      expect(result.success).toBe(true)
      expect(mockDelete).toHaveBeenCalledWith({
        where: { id: 'task-1' }
      })
    })

    it('should handle deletion errors', async () => {
      mockDelete.mockRejectedValue(new Error('Delete failed'))

      const { deleteTask } = await import('../task')
      const result = await deleteTask('task-1')

      expect(result.success).toBe(false)
    })
  })

  describe('updateTasksOrder', () => {
    it('should update multiple task orders', async () => {
      // updateTasksOrder first calls findMany to check existing tasks
      mockFindMany.mockResolvedValue([{ id: 'task-1' }, { id: 'task-2' }])
      mockTransaction.mockResolvedValue([])

      const { updateTasksOrder } = await import('../task')
      const updates = [
        { id: 'task-1', columnId: 'in_progress', order: 0 },
        { id: 'task-2', columnId: 'in_progress', order: 1 }
      ]

      const result = await updateTasksOrder(mockProjectId, updates)

      expect(result.success).toBe(true)
    })

    it('should handle transaction errors', async () => {
      // First findMany succeeds, then transaction fails
      mockFindMany.mockResolvedValue([{ id: 'task-1' }])
      mockTransaction.mockRejectedValue(new Error('Transaction failed'))

      const { updateTasksOrder } = await import('../task')
      const result = await updateTasksOrder(mockProjectId, [
        { id: 'task-1', columnId: 'todo', order: 0 }
      ])

      expect(result.success).toBe(false)
    })
  })
})
