import 'dotenv/config'
import { initPayrollWorker } from './jobs/payroll.job'

const isDev = process.env.NODE_ENV === 'development'

if (isDev) {
    console.log('🚀 Starting Background Workers...')
}

// Initialize Workers
const payrollWorker = initPayrollWorker()

payrollWorker.on('completed', (job) => {
    if (isDev) {
        console.log(`✅ Job ${job.id} completed`)
    }
})

payrollWorker.on('failed', (job, err) => {
    if (isDev) {
        console.error(`❌ Job ${job?.id} failed:`, err)
    }
})

if (isDev) {
    console.log('Workers are running. Press Ctrl+C to exit.')
}

// Handle graceful shutdown
process.on('SIGTERM', async () => {
    if (isDev) {
        console.log('Shutting down workers...')
    }
    await payrollWorker.close()
    process.exit(0)
})
