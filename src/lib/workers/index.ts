import 'server-only'
import { Worker, Job } from 'bullmq'
import {
  QueueNames,
  EmailJobData,
  NotificationJobData,
  PayrollJobData,
  AttendanceJobData,
  CacheInvalidationJobData,
  ReportJobData
} from '../queue'
import { invalidateCache, invalidateCachePattern, publishCacheInvalidation } from '../redis'

// =============================================================================
// BullMQ Workers - Job Processing System - CVE-CB-005 Fixed
// Target: Process 10,000+ jobs/minute
// Development-only logging for job processing
// =============================================================================

const isDev = process.env.NODE_ENV === 'development'
const devLog = (message: string) => isDev && console.log(message)

const getConnection = () => ({
  host: process.env.REDIS_HOST || 'localhost',
  port: parseInt(process.env.REDIS_PORT || '6379'),
  password: process.env.REDIS_PASSWORD || undefined,
  maxRetriesPerRequest: null as null
})

// Store workers for graceful shutdown
const workers: Worker[] = []

// =============================================================================
// Email Worker
// =============================================================================

export function startEmailWorker(): Worker {
  const worker = new Worker<EmailJobData>(
    QueueNames.EMAIL,
    async (job: Job<EmailJobData>) => {
      const { to, subject, template, data } = job.data

      devLog(`[DEV] 📧 Processing email job ${job.id}: ${subject}`)

      try {
        // Import email service dynamically to avoid circular deps
        const { sendEmail } = await import('../email')

        await sendEmail({
          to: Array.isArray(to) ? to : [to],
          subject,
          template,
          data
        })

        devLog(`[DEV] ✅ Email sent successfully: ${job.id}`)
        return { success: true, sentAt: new Date().toISOString() }
      } catch (error) {
        // CVE-CB-005: Silent fail in production
        devLog(`[DEV] ❌ Email failed: ${job.id}`)
        throw error
      }
    },
    {
      connection: getConnection(),
      concurrency: 10, // Process 10 emails concurrently
      limiter: {
        max: 100, // Max 100 jobs per minute (SendGrid rate limit)
        duration: 60000
      }
    }
  )

  workers.push(worker)
  return worker
}

// =============================================================================
// Notification Worker
// =============================================================================

export function startNotificationWorker(): Worker {
  const worker = new Worker<NotificationJobData>(
    QueueNames.NOTIFICATION,
    async (job: Job<NotificationJobData>) => {
      const { userId, type, title, message, data, actionUrl } = job.data

      devLog(`[DEV] 🔔 Processing notification job ${job.id}: ${title}`)

      try {
        // Store notification in database
        const { prisma } = await import('../prisma')

        // For now, we'll log it. In production, integrate with push services
        if (type === 'push' || type === 'all') {
          // TODO: Integrate with Firebase Cloud Messaging or similar
          devLog(`[DEV] 📱 Push notification to ${userId}: ${title}`)
        }

        if (type === 'in_app' || type === 'all') {
          // Store in-app notification (you'd need a Notification model)
          devLog(`[DEV] 💬 In-app notification to ${userId}: ${title}`)
        }

        return { success: true, processedAt: new Date().toISOString() }
      } catch (error) {
        // CVE-CB-005: Silent fail in production
        devLog(`[DEV] ❌ Notification failed: ${job.id}`)
        throw error
      }
    },
    {
      connection: getConnection(),
      concurrency: 50 // Notifications are lightweight
    }
  )

  workers.push(worker)
  return worker
}

// =============================================================================
// Payroll Processing Worker
// =============================================================================

export function startPayrollWorker(): Worker {
  const worker = new Worker<PayrollJobData>(
    QueueNames.PAYROLL,
    async (job: Job<PayrollJobData>) => {
      const { workspaceId, employeeIds, periodStart, periodEnd, options } = job.data

      devLog(`[DEV] 💰 Processing payroll job ${job.id}: ${workspaceId}`)

      try {
        const { prisma } = await import('../prisma')

        // Get employees to process
        const whereClause: any = { workspaceId, status: 'ACTIVE' }
        if (employeeIds && employeeIds.length > 0) {
          whereClause.id = { in: employeeIds }
        }

        const employees = await prisma.employee.findMany({
          where: whereClause
        })

        devLog(`[DEV] 📊 Processing payroll for ${employees.length} employees`)

        // Process each employee
        const results = []
        for (const employee of employees) {
          // Calculate payroll (simplified version)
          const basePay = employee.baseSalaryMonthly || (employee.hourlyWage || 0) * 160

          const payrollRecord = await prisma.payrollRecord.upsert({
            where: {
              workspaceId_employeeId_periodStart_periodEnd: {
                workspaceId,
                employeeId: employee.id,
                periodStart: new Date(periodStart),
                periodEnd: new Date(periodEnd)
              }
            },
            update: {
              basePay,
              grossPay: basePay,
              netPay: Math.round(basePay * 0.88), // Simplified: 12% deductions
              status: options?.autoApprove ? 'CONFIRMED' : 'DRAFT'
            },
            create: {
              workspaceId,
              employeeId: employee.id,
              periodStart: new Date(periodStart),
              periodEnd: new Date(periodEnd),
              basePay,
              grossPay: basePay,
              netPay: Math.round(basePay * 0.88),
              status: 'DRAFT'
            }
          })

          results.push(payrollRecord.id)
        }

        // Invalidate payroll cache
        await invalidateCache(`payroll:${workspaceId}:list`)

        devLog(`[DEV] ✅ Payroll processed: ${results.length} records`)
        return { success: true, recordIds: results }
      } catch (error) {
        // CVE-CB-005: Silent fail in production
        devLog(`[DEV] ❌ Payroll processing failed: ${job.id}`)
        throw error
      }
    },
    {
      connection: getConnection(),
      concurrency: 3, // Heavy processing, limit concurrency
      lockDuration: 300000 // 5 minutes lock for long-running jobs
    }
  )

  workers.push(worker)
  return worker
}

// =============================================================================
// Attendance Processing Worker
// =============================================================================

export function startAttendanceWorker(): Worker {
  const worker = new Worker<AttendanceJobData>(
    QueueNames.ATTENDANCE,
    async (job: Job<AttendanceJobData>) => {
      const { type, workspaceId, userId, date } = job.data

      devLog(`[DEV] ⏰ Processing attendance job ${job.id}: ${type}`)

      try {
        const { prisma } = await import('../prisma')

        switch (type) {
          case 'auto_checkout': {
            // Auto checkout users who forgot to clock out
            const today = new Date()
            today.setHours(0, 0, 0, 0)

            const unclockedAttendance = await prisma.attendance.findMany({
              where: {
                ...(workspaceId !== '*' ? { workspaceId } : {}),
                date: today,
                checkIn: { not: null },
                checkOut: null
              }
            })

            for (const record of unclockedAttendance) {
              await prisma.attendance.update({
                where: { id: record.id },
                data: {
                  checkOut: new Date(),
                  note: '자동 퇴근 처리'
                }
              })
            }

            devLog(`[DEV] ✅ Auto checkout: ${unclockedAttendance.length} records`)
            return { success: true, processed: unclockedAttendance.length }
          }

          case 'presence_check': {
            // Trigger presence check for remote workers
            devLog('[DEV] 🔍 Presence check triggered')
            // Implementation would create PresenceCheckLog entries
            return { success: true, type: 'presence_check' }
          }

          case 'daily_summary': {
            // Generate daily attendance summary
            devLog('[DEV] 📋 Daily attendance summary generated')
            return { success: true, type: 'daily_summary' }
          }

          default:
            return { success: false, error: 'Unknown type' }
        }
      } catch (error) {
        // CVE-CB-005: Silent fail in production
        devLog(`[DEV] ❌ Attendance processing failed: ${job.id}`)
        throw error
      }
    },
    {
      connection: getConnection(),
      concurrency: 5
    }
  )

  workers.push(worker)
  return worker
}

// =============================================================================
// Cache Invalidation Worker
// =============================================================================

export function startCacheInvalidationWorker(): Worker {
  const worker = new Worker<CacheInvalidationJobData>(
    QueueNames.CACHE_INVALIDATION,
    async (job: Job<CacheInvalidationJobData>) => {
      const { keys, pattern, broadcast } = job.data

      devLog(`[DEV] 🗑️ Processing cache invalidation job ${job.id}`)

      try {
        // Invalidate specific keys
        for (const key of keys) {
          await invalidateCache(key)
        }

        // Invalidate by pattern if specified
        if (pattern) {
          await invalidateCachePattern(pattern)
        }

        // Broadcast to other nodes if running in cluster
        if (broadcast) {
          await publishCacheInvalidation(keys)
        }

        devLog(`[DEV] ✅ Cache invalidated: ${keys.length} keys`)
        return { success: true, keysInvalidated: keys.length }
      } catch (error) {
        // CVE-CB-005: Silent fail in production
        devLog(`[DEV] ❌ Cache invalidation failed: ${job.id}`)
        throw error
      }
    },
    {
      connection: getConnection(),
      concurrency: 20 // High concurrency for fast cache ops
    }
  )

  workers.push(worker)
  return worker
}

// =============================================================================
// Report Generation Worker
// =============================================================================

export function startReportWorker(): Worker {
  const worker = new Worker<ReportJobData>(
    QueueNames.REPORT,
    async (job: Job<ReportJobData>) => {
      const { workspaceId, type, format, dateRange, recipientEmail } = job.data

      devLog(`[DEV] 📊 Processing report job ${job.id}: ${type}`)

      try {
        // Report generation logic would go here
        // This is a placeholder implementation

        const reportUrl = `/reports/${workspaceId}/${type}-${Date.now()}.${format}`

        // If recipient email specified, send the report
        if (recipientEmail) {
          const { queueEmail } = await import('../queue')
          await queueEmail(
            recipientEmail,
            `[CodeB] ${type} Report Ready`,
            'report-ready',
            {
              reportType: type,
              reportUrl,
              dateRange
            }
          )
        }

        devLog(`[DEV] ✅ Report generated: ${reportUrl}`)
        return { success: true, reportUrl }
      } catch (error) {
        // CVE-CB-005: Silent fail in production
        devLog(`[DEV] ❌ Report generation failed: ${job.id}`)
        throw error
      }
    },
    {
      connection: getConnection(),
      concurrency: 2, // Heavy processing
      lockDuration: 600000 // 10 minutes for large reports
    }
  )

  workers.push(worker)
  return worker
}

// =============================================================================
// Start All Workers
// =============================================================================

export function startAllWorkers(): Worker[] {
  devLog('[DEV] 🚀 Starting all BullMQ workers...')

  startEmailWorker()
  startNotificationWorker()
  startPayrollWorker()
  startAttendanceWorker()
  startCacheInvalidationWorker()
  startReportWorker()

  devLog(`[DEV] ✅ ${workers.length} workers started`)
  return workers
}

// =============================================================================
// Graceful Shutdown
// =============================================================================

export async function stopAllWorkers(): Promise<void> {
  devLog('[DEV] 🛑 Stopping all workers...')

  await Promise.all(workers.map(worker => worker.close()))

  devLog('[DEV] ✅ All workers stopped')
}

// Handle graceful shutdown
process.on('SIGTERM', stopAllWorkers)
process.on('SIGINT', stopAllWorkers)
