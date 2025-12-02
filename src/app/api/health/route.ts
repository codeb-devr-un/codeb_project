import { NextResponse } from 'next/server'

// =============================================================================
// Health Check API - Kubernetes Liveness Probe
// Returns 200 if the application is running
// =============================================================================

export async function GET() {
  return NextResponse.json(
    {
      status: 'healthy',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      version: process.env.npm_package_version || '1.0.0',
      environment: process.env.NODE_ENV,
    },
    {
      status: 200,
      headers: {
        'Cache-Control': 'no-store, must-revalidate',
      },
    }
  )
}
