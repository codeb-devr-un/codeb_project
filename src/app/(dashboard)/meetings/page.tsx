'use client'

import React from 'react'
import { Video } from 'lucide-react'
import { Card } from '@/components/ui/card'

// ===========================================
// Glass Morphism Meetings Page
// ===========================================

export default function MeetingsPage() {
  return (
    <div className="flex items-center justify-center h-full p-6">
      <Card variant="glass" className="p-12 text-center max-w-md">
        <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-lime-100 flex items-center justify-center">
          <Video className="w-8 h-8 text-lime-600" />
        </div>
        <h2 className="text-xl font-bold text-slate-900 mb-2">회의 관리</h2>
        <p className="text-slate-500">이 기능은 현재 시스템 점검 중입니다.</p>
      </Card>
    </div>
  )
}