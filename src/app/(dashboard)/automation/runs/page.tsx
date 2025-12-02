'use client'

// ===========================================
// Glass Morphism Workflow Runs Page
// ===========================================

import React from 'react'
import Link from 'next/link'
import WorkflowMonitor from '@/components/automation/WorkflowMonitor'
import { useAuth } from '@/lib/auth-context'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { ChevronLeft, History, Bot } from 'lucide-react'

export default function WorkflowRunsPage() {
  const { userProfile } = useAuth()

  // 권한 체크
  if (userProfile?.role !== 'admin' && userProfile?.role !== 'member') {
    return (
      <div className="flex items-center justify-center h-96">
        <Card variant="glass" className="w-full max-w-md">
          <CardContent className="pt-6">
            <div className="text-center">
              <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-lime-100 flex items-center justify-center">
                <Bot className="h-8 w-8 text-lime-600" />
              </div>
              <h2 className="text-2xl font-bold text-slate-900 mb-2">접근 권한 없음</h2>
              <p className="text-slate-500">자동화 기능은 팀 멤버 이상만 사용할 수 있습니다.</p>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="w-full max-w-[1920px] mx-auto px-6 py-6 space-y-6">
      {/* 헤더 - Glass Morphism */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" className="rounded-xl hover:bg-white/60" asChild>
          <Link href="/automation">
            <ChevronLeft className="h-4 w-4" />
          </Link>
        </Button>
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900 flex items-center gap-3">
            <div className="p-2 bg-lime-100 rounded-xl">
              <History className="w-6 h-6 text-lime-600" />
            </div>
            워크플로우 실행 이력
          </h1>
          <p className="text-slate-500 mt-2">모든 워크플로우의 실행 상태와 로그를 확인하세요.</p>
        </div>
      </div>

      {/* 실행 모니터 */}
      <WorkflowMonitor />
    </div>
  )
}
