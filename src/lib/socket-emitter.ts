import { Emitter } from '@socket.io/redis-emitter'
import { redis } from '@/lib/redis' // Reuse the ioredis client or create a new one? Emitter needs a separate client usually? 
// Emitter takes a RedisClient. We can reuse the one from lib/redis if it's exported, but usually it's better to have a dedicated one or just pass the connection.
// Actually, Emitter needs a Redis client instance.
import Redis from 'ioredis'

let emitter: Emitter | null = null

export const getSocketEmitter = () => {
    if (!emitter) {
        const redisUrl = process.env.REDIS_URL || 'redis://localhost:6379'
        const redisClient = new Redis(redisUrl)
        emitter = new Emitter(redisClient)
    }
    return emitter
}

// CVE-CB-005: Silent fail for socket emission
export const emitToProject = (projectId: string, event: string, data: any) => {
    try {
        const io = getSocketEmitter()
        io.to(`project:${projectId}`).emit(event, data)
    } catch {
        // Silent fail - socket errors handled gracefully
    }
}
