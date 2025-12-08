'use client'

import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import {
  ClipboardList, Search, Clock, CheckCircle, XCircle,
  Filter, Loader2, AlertCircle, Users
} from 'lucide-react'
import { toast } from 'react-hot-toast'
import { LeaveRequestWithEmployee } from '@/types/hr'
import LeaveRequestCard from './LeaveRequestCard'

interface AdminLeaveManagementProps {
  workspaceId: string
  userId: string
  onUpdate?: () => void
}

type StatusFilter = 'all' | 'pending' | 'approved' | 'rejected'

interface LeaveStats {
  total: number
  pending: number
  approved: number
  rejected: number
}

export default function AdminLeaveManagement({
  workspaceId,
  userId,
  onUpdate,
}: AdminLeaveManagementProps) {
  const [loading, setLoading] = useState(true)
  const [allRequests, setAllRequests] = useState<LeaveRequestWithEmployee[]>([])
  const [stats, setStats] = useState<LeaveStats>({ total: 0, pending: 0, approved: 0, rejected: 0 })
  const [activeTab, setActiveTab] = useState<StatusFilter>('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [processingId, setProcessingId] = useState<string | null>(null)

  useEffect(() => {
    loadAllRequests()
  }, [workspaceId, activeTab])

  const loadAllRequests = async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams()
      if (activeTab !== 'all') {
        params.set('status', activeTab)
      }

      const res = await fetch(`/api/leave?${params.toString()}`, {
        headers: {
          'x-user-id': userId,
          'x-workspace-id': workspaceId,
          'x-is-admin': 'true',
        },
      })

      if (res.ok) {
        const data = await res.json()
        setAllRequests(data.allRequests || [])
        if (data.stats) {
          setStats(data.stats)
        }
      }
    } catch (error) {
      console.error('Failed to load leave requests:', error)
      toast.error('휴가 신청 목록을 불러오는데 실패했습니다.')
    } finally {
      setLoading(false)
    }
  }

  const handleApprove = async (requestId: string) => {
    setProcessingId(requestId)
    try {
      const res = await fetch(`/api/leave/${requestId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'x-user-id': userId,
          'x-workspace-id': workspaceId,
        },
        body: JSON.stringify({ status: 'approved' }),
      })

      if (res.ok) {
        toast.success('휴가가 승인되었습니다.')
        loadAllRequests()
        onUpdate?.()
      } else {
        const err = await res.json()
        toast.error(err.error || '승인 처리에 실패했습니다.')
      }
    } catch (error) {
      toast.error('승인 처리 중 오류가 발생했습니다.')
    } finally {
      setProcessingId(null)
    }
  }

  const handleReject = async (requestId: string) => {
    setProcessingId(requestId)
    try {
      const res = await fetch(`/api/leave/${requestId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'x-user-id': userId,
          'x-workspace-id': workspaceId,
        },
        body: JSON.stringify({ status: 'rejected' }),
      })

      if (res.ok) {
        toast.success('휴가가 반려되었습니다.')
        loadAllRequests()
        onUpdate?.()
      } else {
        const err = await res.json()
        toast.error(err.error || '반려 처리에 실패했습니다.')
      }
    } catch (error) {
      toast.error('반려 처리 중 오류가 발생했습니다.')
    } finally {
      setProcessingId(null)
    }
  }

  // 검색 필터링
  const filteredRequests = allRequests.filter((request) => {
    if (!searchQuery) return true
    const query = searchQuery.toLowerCase()
    return (
      request.employee.name.toLowerCase().includes(query) ||
      request.employee.department?.toLowerCase().includes(query) ||
      request.reason?.toLowerCase().includes(query)
    )
  })

  // 대기중인 요청만 추출
  const pendingRequests = allRequests.filter((r) => r.status === 'pending')

  const tabs: { key: StatusFilter; label: string; count: number; icon: React.ElementType }[] = [
    { key: 'all', label: '전체', count: stats.total, icon: ClipboardList },
    { key: 'pending', label: '대기중', count: stats.pending, icon: Clock },
    { key: 'approved', label: '승인됨', count: stats.approved, icon: CheckCircle },
    { key: 'rejected', label: '반려됨', count: stats.rejected, icon: XCircle },
  ]

  return (
    <Card className="bg-white/60 backdrop-blur-xl border-white/40 shadow-sm rounded-3xl">
      <CardHeader className="pb-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <CardTitle className="text-slate-900 flex items-center gap-2">
            <ClipboardList className="w-5 h-5 text-lime-600" />
            전체 휴가 신청 관리
          </CardTitle>
          <div className="relative w-full sm:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <Input
              placeholder="이름, 부서, 사유 검색..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 bg-white/50 border-white/60 text-slate-900 placeholder:text-slate-400"
            />
          </div>
        </div>

        {/* 탭 필터 */}
        <div className="flex gap-2 mt-4 overflow-x-auto pb-2">
          {tabs.map((tab) => (
            <Button
              key={tab.key}
              variant={activeTab === tab.key ? 'default' : 'outline'}
              size="sm"
              onClick={() => setActiveTab(tab.key)}
              className={
                activeTab === tab.key
                  ? 'bg-black text-lime-400 hover:bg-black/90'
                  : 'border-slate-200 text-slate-600 hover:bg-slate-50'
              }
            >
              <tab.icon className="w-4 h-4 mr-1" />
              {tab.label}
              <Badge
                variant="secondary"
                className={`ml-2 ${
                  activeTab === tab.key
                    ? 'bg-lime-400/20 text-lime-400'
                    : 'bg-slate-100 text-slate-600'
                }`}
              >
                {tab.count}
              </Badge>
            </Button>
          ))}
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* 빠른 승인 섹션 - 대기중인 건이 있을 때만 표시 */}
        {activeTab === 'all' && pendingRequests.length > 0 && (
          <div className="p-4 rounded-2xl bg-yellow-50/50 border border-yellow-200/50">
            <div className="flex items-center gap-2 mb-3">
              <AlertCircle className="w-5 h-5 text-yellow-600" />
              <h3 className="font-semibold text-slate-900">
                빠른 처리 필요
                <Badge className="ml-2 bg-yellow-100 text-yellow-700">
                  {pendingRequests.length}건
                </Badge>
              </h3>
            </div>
            <div className="space-y-2">
              {pendingRequests.slice(0, 3).map((request) => (
                <LeaveRequestCard
                  key={request.id}
                  request={request}
                  onApprove={handleApprove}
                  onReject={handleReject}
                  showActions={true}
                  compact={true}
                />
              ))}
              {pendingRequests.length > 3 && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="w-full text-slate-500 hover:text-slate-700"
                  onClick={() => setActiveTab('pending')}
                >
                  +{pendingRequests.length - 3}건 더 보기
                </Button>
              )}
            </div>
          </div>
        )}

        {/* 전체 목록 */}
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-lime-400" />
          </div>
        ) : filteredRequests.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-slate-500">
            <Users className="w-12 h-12 mb-3 text-slate-300" />
            <p>
              {searchQuery
                ? '검색 결과가 없습니다.'
                : activeTab === 'pending'
                ? '대기중인 휴가 신청이 없습니다.'
                : '휴가 신청 내역이 없습니다.'}
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {filteredRequests.map((request) => (
              <LeaveRequestCard
                key={request.id}
                request={request}
                onApprove={handleApprove}
                onReject={handleReject}
                showActions={request.status === 'pending'}
                compact={false}
              />
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
