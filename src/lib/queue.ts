import { Queue, Worker, QueueEvents, ConnectionOptions } from 'bullmq'

const connection: ConnectionOptions = {
  host: process.env.REDIS_HOST || 'localhost',
  port: parseInt(process.env.REDIS_PORT || '6379'),
  password: process.env.REDIS_PASSWORD || undefined,
}

export const QUEUE_NAMES = {
  PAYROLL: 'payroll',
  EMAIL: 'email',
  NOTIFICATION: 'notification',
  ATTENDANCE: 'attendance',
  CACHE_INVALIDATION: 'cache-invalidation',
  REPORT: 'report'
} as const

// Alias for backwards compatibility
export const QueueNames = QUEUE_NAMES

// =============================================================================
// Job Data Types
// =============================================================================

export interface EmailJobData {
  to: string | string[]
  subject: string
  template: string
  data: Record<string, unknown>
}

export interface NotificationJobData {
  userId: string
  type: 'push' | 'in_app' | 'all'
  title: string
  message: string
  data?: Record<string, unknown>
  actionUrl?: string
}

export interface PayrollJobData {
  workspaceId: string
  employeeIds?: string[]
  periodStart: string
  periodEnd: string
  options?: {
    autoApprove?: boolean
  }
}

export interface AttendanceJobData {
  type: 'auto_checkout' | 'presence_check' | 'daily_summary'
  workspaceId: string
  userId?: string
  date?: string
}

export interface CacheInvalidationJobData {
  keys: string[]
  pattern?: string
  broadcast?: boolean
}

export interface ReportJobData {
  workspaceId: string
  type: string
  format: 'pdf' | 'xlsx' | 'csv'
  dateRange?: {
    start: string
    end: string
  }
  recipientEmail?: string
}

// =============================================================================
// Queue Email Helper
// =============================================================================

export async function queueEmail(
  to: string | string[],
  subject: string,
  template: string,
  data: Record<string, unknown>
): Promise<void> {
  const queue = getQueue(QUEUE_NAMES.EMAIL)
  await queue.add('send-email', { to, subject, template, data })
}

// Queue Map to hold singleton instances
const queues: Record<string, Queue> = {}

export function getQueue(name: string): Queue {
  if (!queues[name]) {
    queues[name] = new Queue(name, { connection })
  }
  return queues[name]
}

export function createWorker(name: string, processor: (job: any) => Promise<any>) {
  return new Worker(name, processor, {
    connection,
    concurrency: 5 // Default concurrency
  })
}

export function createQueueEvents(name: string) {
  return new QueueEvents(name, { connection })
}
