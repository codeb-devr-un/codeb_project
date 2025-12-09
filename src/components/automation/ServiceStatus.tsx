'use client'
const isDev = process.env.NODE_ENV === 'development'

import { useEffect, useState } from 'react'
import { checkAllServices } from '@/config/services'

interface ServiceStatus {
  socket: { url: string; healthy: boolean }
  workflow: { url: string; healthy: boolean }
}

export default function ServiceStatus() {
  const [status, setStatus] = useState<ServiceStatus | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const checkStatus = async () => {
      setLoading(true)
      try {
        const services = await checkAllServices()
        setStatus(services)
      } catch (error) {
      if (isDev) console.error('서비스 상태 확인 실패:', error)
      } finally {
        setLoading(false)
      }
    }

    checkStatus()
    
    // 30초마다 상태 확인
    const interval = setInterval(checkStatus, 30000)
    
    return () => clearInterval(interval)
  }, [])

  if (loading || !status) {
    return (
      <div className="flex items-center gap-2 text-sm text-gray-500">
        <div className="w-2 h-2 bg-gray-300 rounded-full animate-pulse" />
        서비스 상태 확인 중...
      </div>
    )
  }

  return (
    <div className="flex items-center gap-4 text-sm">
      <ServiceIndicator
        name="Socket.io"
        url={status.socket.url}
        healthy={status.socket.healthy}
      />
      <ServiceIndicator
        name="워크플로우"
        url={status.workflow.url}
        healthy={status.workflow.healthy}
      />
    </div>
  )
}

function ServiceIndicator({ name, url, healthy }: { name: string; url: string; healthy: boolean }) {
  return (
    <div className="flex items-center gap-2" title={url}>
      <div className={`w-2 h-2 rounded-full ${healthy ? 'bg-green-500' : 'bg-red-500'}`} />
      <span className={healthy ? 'text-green-700' : 'text-red-700'}>
        {name}: {healthy ? '정상' : '오프라인'}
      </span>
    </div>
  )
}