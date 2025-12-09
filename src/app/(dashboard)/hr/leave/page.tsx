'use client'

const isDev = process.env.NODE_ENV === 'development'

// ===========================================
// Glass Morphism Leave Management Page
// ===========================================

import React, { useState, useEffect } from 'react'
import { useAuth } from '@/lib/auth-context'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Calendar, Plus, Loader2, CalendarDays, CheckCircle, Clock } from 'lucide-react'
import { format } from 'date-fns'
import { ko } from 'date-fns/locale'
import { cn } from '@/lib/utils'

export default function LeavePage() {
  const { userProfile } = useAuth()
  const [leaveRequests, setLeaveRequests] = useState<any[]>([])
  const [leaveBalance, setLeaveBalance] = useState({ total: 15, used: 0, remaining: 15 })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadLeaveData()
  }, [])

  const loadLeaveData = async () => {
    try {
      const response = await fetch('/api/leave')
      const data = await response.json()
      setLeaveRequests(data.requests || [])
      setLeaveBalance(data.balance || { total: 15, used: 0, remaining: 15 })
    } catch (error) {
      if (isDev) console.error('Failed to load leave data:', error)
    } finally {
      setLoading(false)
    }
  }

  const getStatusBadge = (status: string) => {
    const styles = {
      PENDING: 'bg-amber-100 text-amber-700',
      APPROVED: 'bg-emerald-100 text-emerald-700',
      REJECTED: 'bg-rose-100 text-rose-700',
    }
    const labels = {
      PENDING: '대기중',
      APPROVED: '승인',
      REJECTED: '반려',
    }
    return { style: styles[status as keyof typeof styles], label: labels[status as keyof typeof labels] }
  }

  const getLeaveType = (type: string) => {
    const types: Record<string, string> = {
      ANNUAL: '연차',
      SICK: '병가',
      HALF_DAY: '반차',
      SPECIAL: '특별휴가',
    }
    return types[type] || type
  }

  const getLeaveTypeBadge = (type: string) => {
    const styles: Record<string, string> = {
      ANNUAL: 'bg-lime-100 text-lime-700',
      SICK: 'bg-rose-100 text-rose-700',
      HALF_DAY: 'bg-amber-100 text-amber-700',
      SPECIAL: 'bg-violet-100 text-violet-700',
    }
    return styles[type] || 'bg-slate-100 text-slate-700'
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin text-lime-400 mx-auto" />
          <p className="mt-4 text-slate-500">휴가 정보를 불러오는 중...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="w-full max-w-[1920px] mx-auto px-6 py-6 space-y-6">
      {/* 헤더 - Glass Morphism */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900 flex items-center gap-3">
            <div className="p-2 bg-lime-100 rounded-xl">
              <CalendarDays className="w-6 h-6 text-lime-600" />
            </div>
            휴가 관리
          </h1>
          <p className="text-slate-500 mt-2">휴가 신청 및 사용 현황을 관리합니다</p>
        </div>

        <Button variant="limePrimary" className="rounded-xl">
          <Plus className="w-4 h-4 mr-2" />
          휴가 신청
        </Button>
      </div>

      {/* 휴가 잔여 현황 - Glass Morphism */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card variant="glass" className="hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-500">총 연차</p>
                <p className="text-3xl font-bold text-slate-900 mt-1">{leaveBalance.total}일</p>
              </div>
              <div className="p-3 bg-lime-100 rounded-xl">
                <Calendar className="h-6 w-6 text-lime-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card variant="glass" className="hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-500">사용</p>
                <p className="text-3xl font-bold text-violet-600 mt-1">{leaveBalance.used}일</p>
              </div>
              <div className="p-3 bg-violet-100 rounded-xl">
                <CheckCircle className="h-6 w-6 text-violet-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card variant="glass" className="hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-500">잔여</p>
                <p className="text-3xl font-bold text-emerald-600 mt-1">{leaveBalance.remaining}일</p>
              </div>
              <div className="p-3 bg-emerald-100 rounded-xl">
                <Clock className="h-6 w-6 text-emerald-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* 휴가 신청 내역 - Glass Morphism */}
      <Card variant="glass">
        <CardHeader>
          <CardTitle className="text-slate-900 flex items-center gap-2">
            <div className="p-2 bg-lime-100 rounded-xl">
              <Calendar className="w-5 h-5 text-lime-600" />
            </div>
            신청 내역
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-hidden rounded-2xl">
            <table className="w-full">
              <thead>
                <tr className="border-b border-white/40">
                  <th className="px-4 py-3 text-left text-sm font-semibold text-slate-700">구분</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-slate-700">기간</th>
                  <th className="px-4 py-3 text-center text-sm font-semibold text-slate-700">일수</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-slate-700">사유</th>
                  <th className="px-4 py-3 text-center text-sm font-semibold text-slate-700">상태</th>
                  <th className="px-4 py-3 text-center text-sm font-semibold text-slate-700">신청일</th>
                </tr>
              </thead>
              <tbody>
                {leaveRequests.length > 0 ? (
                  leaveRequests.map((request: any) => {
                    const badge = getStatusBadge(request.status)
                    return (
                      <tr key={request.id} className="border-b border-white/40 hover:bg-white/40 transition-colors">
                        <td className="px-4 py-4">
                          <Badge className={cn("border-0", getLeaveTypeBadge(request.type))}>
                            {getLeaveType(request.type)}
                          </Badge>
                        </td>
                        <td className="px-4 py-4 text-sm text-slate-900">
                          {format(new Date(request.startDate), 'yyyy.MM.dd')} ~ {format(new Date(request.endDate), 'yyyy.MM.dd')}
                        </td>
                        <td className="px-4 py-4 text-center text-sm font-medium text-slate-900">
                          {request.days}일
                        </td>
                        <td className="px-4 py-4 text-sm text-slate-600">
                          {request.reason}
                        </td>
                        <td className="px-4 py-4 text-center">
                          <Badge className={cn("border-0", badge.style)}>
                            {badge.label}
                          </Badge>
                        </td>
                        <td className="px-4 py-4 text-center text-sm text-slate-500">
                          {format(new Date(request.createdAt), 'MM.dd')}
                        </td>
                      </tr>
                    )
                  })
                ) : (
                  <tr>
                    <td colSpan={6} className="px-4 py-12 text-center text-slate-500">
                      <div className="flex flex-col items-center">
                        <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-lime-100 flex items-center justify-center">
                          <CalendarDays className="h-8 w-8 text-lime-600" />
                        </div>
                        <p>신청 내역이 없습니다</p>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
