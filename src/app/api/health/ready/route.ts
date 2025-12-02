import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// =============================================================================
// Readiness Check API - Kubernetes Readiness Probe
// Returns 200 only if all dependencies are healthy
// =============================================================================

interface HealthStatus {
  status: 'healthy' | 'unhealthy' | 'degraded'
  latency?: number
  error?: string
}

interface ReadinessResponse {
  status: 'ready' | 'not_ready'
  timestamp: string
  checks: {
    database: HealthStatus
    redis: HealthStatus
  }
}

async function checkDatabase(): Promise<HealthStatus> {
  const start = Date.now()
  try {
    await prisma.$queryRaw`SELECT 1`
    return {
      status: 'healthy',
      latency: Date.now() - start,
    }
  } catch (error) {
    return {
      status: 'unhealthy',
      latency: Date.now() - start,
      error: error instanceof Error ? error.message : 'Unknown error',
    }
  }
}

async function checkRedis(): Promise<HealthStatus> {
  const start = Date.now()
  try {
    // Dynamic import to handle Redis not being available
    const { redis } = await import('@/lib/redis')

    if (!redis) {
      return {
        status: 'degraded',
        latency: Date.now() - start,
        error: 'Redis client not initialized',
      }
    }

    await redis.ping()
    return {
      status: 'healthy',
      latency: Date.now() - start,
    }
  } catch (error) {
    return {
      status: 'unhealthy',
      latency: Date.now() - start,
      error: error instanceof Error ? error.message : 'Unknown error',
    }
  }
}

export async function GET() {
  const [database, redis] = await Promise.all([
    checkDatabase(),
    checkRedis(),
  ])

  const response: ReadinessResponse = {
    status: database.status === 'healthy' ? 'ready' : 'not_ready',
    timestamp: new Date().toISOString(),
    checks: {
      database,
      redis,
    },
  }

  // Return 503 if not ready (for Kubernetes to route traffic away)
  const httpStatus = response.status === 'ready' ? 200 : 503

  return NextResponse.json(response, {
    status: httpStatus,
    headers: {
      'Cache-Control': 'no-store, must-revalidate',
    },
  })
}
