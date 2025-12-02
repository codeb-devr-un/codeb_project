'use client'

// ===========================================
// Glass Morphism Admin Join Requests Page
// ===========================================

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import { useSession } from 'next-auth/react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Users, Clock, CheckCircle, XCircle, Ban, Loader2, FileText, Search } from 'lucide-react'
import { cn } from '@/lib/utils'

interface JoinRequest {
  id: string
  message?: string
  status: 'PENDING' | 'APPROVED' | 'REJECTED' | 'CANCELLED'
  reviewNote?: string
  createdAt: string
  reviewedAt?: string
  user: {
    id: string
    name: string
    email: string
    avatar?: string
  }
  reviewer?: {
    id: string
    name: string
    email: string
  }
}

export default function AdminJoinRequestsPage() {
  const params = useParams()
  const { data: session } = useSession()
  const workspaceId = params?.workspaceId as string

  const [requests, setRequests] = useState<JoinRequest[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [statusFilter, setStatusFilter] = useState<string>('PENDING')
  const [processingId, setProcessingId] = useState<string | null>(null)
  const [reviewNote, setReviewNote] = useState<Record<string, string>>({})

  useEffect(() => {
    fetchJoinRequests()
  }, [workspaceId, statusFilter])

  const fetchJoinRequests = async () => {
    setLoading(true)
    setError(null)

    try {
      const url = `/api/workspaces/${workspaceId}/join-requests${
        statusFilter ? `?status=${statusFilter}` : ''
      }`
      const response = await fetch(url)
      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || '가입 요청 목록을 불러오는데 실패했습니다.')
      }

      setRequests(data.joinRequests)
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const handleReview = async (requestId: string, action: 'approve' | 'reject') => {
    if (!session?.user?.id) return

    const note = reviewNote[requestId] || ''
    const confirmMessage =
      action === 'approve'
        ? '이 가입 요청을 승인하시겠습니까?'
        : '이 가입 요청을 거절하시겠습니까?'

    if (!confirm(confirmMessage)) return

    setProcessingId(requestId)
    setError(null)

    try {
      const response = await fetch(
        `/api/workspaces/${workspaceId}/join-requests/${requestId}/review`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            reviewerId: session.user.id,
            action,
            reviewNote: note,
          }),
        }
      )

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || '처리에 실패했습니다.')
      }

      await fetchJoinRequests()
      setReviewNote((prev) => {
        const updated = { ...prev }
        delete updated[requestId]
        return updated
      })

      alert(action === 'approve' ? '가입이 승인되었습니다.' : '가입이 거절되었습니다.')
    } catch (err: any) {
      setError(err.message)
      alert('오류: ' + err.message)
    } finally {
      setProcessingId(null)
    }
  }

  const getStatusConfig = (status: string) => {
    const configs = {
      PENDING: { style: 'bg-amber-100 text-amber-700', label: '대기 중', icon: Clock },
      APPROVED: { style: 'bg-emerald-100 text-emerald-700', label: '승인됨', icon: CheckCircle },
      REJECTED: { style: 'bg-rose-100 text-rose-700', label: '거절됨', icon: XCircle },
      CANCELLED: { style: 'bg-slate-100 text-slate-700', label: '취소됨', icon: Ban },
    }
    return configs[status as keyof typeof configs] || configs.PENDING
  }

  if (loading && requests.length === 0) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin text-lime-400 mx-auto" />
          <p className="mt-4 text-slate-500">데이터를 불러오는 중...</p>
        </div>
      </div>
    )
  }

  const stats = {
    pending: requests.filter((r) => r.status === 'PENDING').length,
    approved: requests.filter((r) => r.status === 'APPROVED').length,
    rejected: requests.filter((r) => r.status === 'REJECTED').length,
    cancelled: requests.filter((r) => r.status === 'CANCELLED').length,
  }

  return (
    <div className="w-full max-w-[1920px] mx-auto px-6 py-6 space-y-6">
      {/* 헤더 - Glass Morphism */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-slate-900 flex items-center gap-3">
          <div className="p-2 bg-lime-100 rounded-xl">
            <Users className="w-6 h-6 text-lime-600" />
          </div>
          가입 요청 관리
        </h1>
        <p className="text-slate-500 mt-2">워크스페이스 가입 요청을 검토하고 승인하세요</p>
      </div>

      {/* 통계 카드 - Glass Morphism */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {[
          { label: '대기 중', value: stats.pending, color: 'amber', icon: Clock },
          { label: '승인됨', value: stats.approved, color: 'emerald', icon: CheckCircle },
          { label: '거절됨', value: stats.rejected, color: 'rose', icon: XCircle },
          { label: '취소됨', value: stats.cancelled, color: 'slate', icon: Ban },
        ].map((stat, idx) => (
          <Card key={idx} variant="glass" className="hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-500">{stat.label}</p>
                  <p className={cn(
                    "text-2xl font-bold mt-1",
                    stat.color === 'amber' && 'text-amber-600',
                    stat.color === 'emerald' && 'text-emerald-600',
                    stat.color === 'rose' && 'text-rose-600',
                    stat.color === 'slate' && 'text-slate-600'
                  )}>
                    {stat.value}
                  </p>
                </div>
                <div className={cn(
                  "p-3 rounded-xl",
                  stat.color === 'amber' && 'bg-amber-100',
                  stat.color === 'emerald' && 'bg-emerald-100',
                  stat.color === 'rose' && 'bg-rose-100',
                  stat.color === 'slate' && 'bg-slate-100'
                )}>
                  <stat.icon className={cn(
                    "h-6 w-6",
                    stat.color === 'amber' && 'text-amber-600',
                    stat.color === 'emerald' && 'text-emerald-600',
                    stat.color === 'rose' && 'text-rose-600',
                    stat.color === 'slate' && 'text-slate-600'
                  )} />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* 필터 탭 - Glass Morphism */}
      <div className="bg-white/60 backdrop-blur-sm rounded-2xl shadow-lg shadow-black/5 p-1.5 border border-white/40 inline-flex">
        <div className="flex gap-1">
          {[
            { id: 'PENDING', label: '대기 중' },
            { id: 'APPROVED', label: '승인됨' },
            { id: 'REJECTED', label: '거절됨' },
            { id: 'CANCELLED', label: '취소됨' },
            { id: '', label: '전체' }
          ].map((filter) => (
            <button
              key={filter.id}
              onClick={() => setStatusFilter(filter.id)}
              className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                statusFilter === filter.id
                  ? 'bg-black text-lime-400 shadow-lg'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-white/60'
              }`}
            >
              {filter.label}
            </button>
          ))}
        </div>
      </div>

      {/* 에러 메시지 */}
      {error && (
        <div className="p-4 bg-rose-50 border border-rose-200 rounded-xl">
          <p className="text-sm text-rose-700">{error}</p>
        </div>
      )}

      {/* 요청 목록 */}
      {requests.length === 0 ? (
        <Card variant="glass" className="py-12">
          <CardContent>
            <div className="flex flex-col items-center justify-center">
              <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-lime-100 flex items-center justify-center">
                <FileText className="h-8 w-8 text-lime-600" />
              </div>
              <h3 className="text-lg font-semibold text-slate-900 mb-2">가입 요청 없음</h3>
              <p className="text-slate-500">
                {statusFilter
                  ? `${getStatusConfig(statusFilter).label} 상태의 가입 요청이 없습니다.`
                  : '아직 가입 요청이 없습니다.'}
              </p>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {requests.map((request) => {
            const statusConfig = getStatusConfig(request.status)
            const StatusIcon = statusConfig.icon
            return (
              <Card key={request.id} variant="glass" className="hover:shadow-lg transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-start gap-4">
                    {/* 아바타 */}
                    <div className="flex-shrink-0">
                      {request.user.avatar ? (
                        <img
                          src={request.user.avatar}
                          alt={request.user.name}
                          className="h-12 w-12 rounded-xl"
                        />
                      ) : (
                        <div className="h-12 w-12 rounded-xl bg-lime-100 flex items-center justify-center">
                          <span className="text-lime-600 font-semibold text-lg">
                            {request.user.name.charAt(0).toUpperCase()}
                          </span>
                        </div>
                      )}
                    </div>

                    {/* 정보 */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-3 mb-1">
                        <h3 className="text-lg font-semibold text-slate-900">{request.user.name}</h3>
                        <Badge className={cn("border-0", statusConfig.style)}>
                          <StatusIcon className="w-3 h-3 mr-1" />
                          {statusConfig.label}
                        </Badge>
                      </div>
                      <p className="text-sm text-slate-500">{request.user.email}</p>

                      {request.message && (
                        <div className="mt-3 p-3 bg-white/60 border border-white/40 rounded-xl">
                          <p className="text-sm text-slate-700 whitespace-pre-wrap">{request.message}</p>
                        </div>
                      )}

                      <div className="mt-3 flex items-center gap-4 text-xs text-slate-500">
                        <span>
                          요청일: {new Date(request.createdAt).toLocaleDateString('ko-KR', {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </span>
                        {request.reviewedAt && (
                          <span>
                            검토일: {new Date(request.reviewedAt).toLocaleDateString('ko-KR', {
                              year: 'numeric',
                              month: 'long',
                              day: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit',
                            })}
                          </span>
                        )}
                      </div>

                      {request.reviewer && (
                        <p className="mt-2 text-xs text-slate-500">
                          검토자: {request.reviewer.name}
                        </p>
                      )}

                      {request.reviewNote && (
                        <div className="mt-3 p-3 bg-lime-50 border border-lime-200 rounded-xl">
                          <p className="text-xs text-slate-600 font-medium mb-1">검토 메모:</p>
                          <p className="text-sm text-slate-700">{request.reviewNote}</p>
                        </div>
                      )}

                      {/* 대기 중인 요청에 대한 액션 */}
                      {request.status === 'PENDING' && (
                        <div className="mt-4 space-y-3">
                          <div>
                            <label className="block text-xs font-medium text-slate-700 mb-1">
                              검토 메모 (선택사항)
                            </label>
                            <textarea
                              value={reviewNote[request.id] || ''}
                              onChange={(e) =>
                                setReviewNote((prev) => ({
                                  ...prev,
                                  [request.id]: e.target.value,
                                }))
                              }
                              className="w-full px-3 py-2 text-sm bg-white/60 border border-white/40 rounded-xl focus:ring-2 focus:ring-lime-400 focus:border-transparent"
                              rows={2}
                              placeholder="승인/거절 사유를 입력하세요"
                            />
                          </div>
                          <div className="flex gap-3">
                            <Button
                              onClick={() => handleReview(request.id, 'approve')}
                              disabled={processingId === request.id}
                              className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl"
                            >
                              {processingId === request.id ? (
                                <Loader2 className="w-4 h-4 animate-spin mr-2" />
                              ) : (
                                <CheckCircle className="w-4 h-4 mr-2" />
                              )}
                              승인
                            </Button>
                            <Button
                              onClick={() => handleReview(request.id, 'reject')}
                              disabled={processingId === request.id}
                              className="flex-1 bg-rose-600 hover:bg-rose-700 text-white rounded-xl"
                            >
                              {processingId === request.id ? (
                                <Loader2 className="w-4 h-4 animate-spin mr-2" />
                              ) : (
                                <XCircle className="w-4 h-4 mr-2" />
                              )}
                              거절
                            </Button>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}
    </div>
  )
}
