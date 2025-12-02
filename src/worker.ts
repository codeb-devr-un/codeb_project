import 'dotenv/config'
import { initPayrollWorker } from './jobs/payroll.job'

console.log('🚀 Starting Background Workers...')

// Initialize Workers
const payrollWorker = initPayrollWorker()

payrollWorker.on('completed', (job) => {
    console.log(`✅ Job ${job.id} completed`)
})

payrollWorker.on('failed', (job, err) => {
    console.error(`❌ Job ${job?.id} failed:`, err)
})

console.log('Workers are running. Press Ctrl+C to exit.')

// Handle graceful shutdown
process.on('SIGTERM', async () => {
    console.log('Shutting down workers...')
    await payrollWorker.close()
    process.exit(0)
})
