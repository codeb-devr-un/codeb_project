'use client'

import React, { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  Download, FileSpreadsheet, Loader2, Calendar,
  DollarSign, Shield, Clock, Plane, Building2, AlertCircle
} from 'lucide-react'

interface ExportTabProps {
  userId: string
  workspaceId: string
  isAdmin: boolean
}

interface ExportItem {
  id: string
  title: string
  description: string
  icon: React.ComponentType<{ className?: string }>
  endpoint: string
  params?: Record<string, string>
  color: string
}

export default function ExportTab({ userId, workspaceId, isAdmin }: ExportTabProps) {
  const [loading, setLoading] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear())
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1)

  // 관리자 권한 체크
  if (!isAdmin) {
    return (
      <div className="flex items-center justify-center h-64">
        <Card className="bg-white/60 backdrop-blur-xl border-white/40 p-8 rounded-3xl">
          <div className="text-center">
            <Shield className="w-12 h-12 text-slate-400 mx-auto mb-4" />
            <h2 className="text-slate-900 text-xl mb-2">관리자 전용 기능</h2>
            <p className="text-slate-500">이 기능은 관리자만 사용할 수 있습니다</p>
          </div>
        </Card>
      </div>
    )
  }

  const exportItems: ExportItem[] = [
    {
      id: 'payroll',
      title: '급여대장',
      description: '월별 급여명세 및 4대보험, 세금 내역',
      icon: DollarSign,
      endpoint: '/api/hr/export/payroll',
      color: 'bg-emerald-500'
    },
    {
      id: 'withholding',
      title: '원천징수이행상황신고서',
      description: '홈택스 제출용 원천징수 신고 데이터',
      icon: Building2,
      endpoint: '/api/hr/export/withholding',
      color: 'bg-blue-500'
    },
    {
      id: 'insurance',
      title: '4대보험 취득/상실 신고서',
      description: '국민연금, 건강보험, 고용보험 신고 데이터',
      icon: Shield,
      endpoint: '/api/hr/export/insurance',
      color: 'bg-purple-500'
    },
    {
      id: 'attendance',
      title: '근태대장',
      description: '출퇴근 기록, 연장근무, 지각/결근 현황',
      icon: Clock,
      endpoint: '/api/hr/export/attendance',
      color: 'bg-orange-500'
    },
    {
      id: 'leave',
      title: '연차대장',
      description: '연차 발생/사용/잔여 현황 및 휴가 내역',
      icon: Plane,
      endpoint: '/api/hr/export/leave',
      color: 'bg-pink-500'
    }
  ]

  const handleExport = async (item: ExportItem) => {
    setLoading(item.id)
    setError(null)

    try {
      const params = new URLSearchParams({
        year: selectedYear.toString(),
        month: selectedMonth.toString()
      })

      const response = await fetch(`${item.endpoint}?${params}`, {
        headers: {
          'x-workspace-id': workspaceId
        }
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.message || '내보내기에 실패했습니다')
      }

      // Content-Disposition 헤더에서 파일명 추출
      const contentDisposition = response.headers.get('Content-Disposition')
      let filename = `${item.id}_${selectedYear}${selectedMonth.toString().padStart(2, '0')}.xlsx`

      if (contentDisposition) {
        const filenameMatch = contentDisposition.match(/filename\*=UTF-8''(.+)/)
        if (filenameMatch) {
          filename = decodeURIComponent(filenameMatch[1])
        }
      }

      // Blob으로 변환 후 다운로드
      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = filename
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)
    } catch (err) {
      setError(err instanceof Error ? err.message : '내보내기에 실패했습니다')
    } finally {
      setLoading(null)
    }
  }

  const years = Array.from({ length: 5 }, (_, i) => new Date().getFullYear() - i)
  const months = Array.from({ length: 12 }, (_, i) => i + 1)

  return (
    <div className="space-y-6">
      {/* 기간 선택 */}
      <Card className="bg-white/60 backdrop-blur-xl border-white/40 rounded-3xl shadow-lg">
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center gap-2 text-slate-900">
            <Calendar className="w-5 h-5 text-lime-500" />
            기간 선택
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <label className="text-sm font-medium text-slate-600">연도</label>
              <select
                value={selectedYear}
                onChange={(e) => setSelectedYear(Number(e.target.value))}
                className="px-3 py-2 rounded-xl border border-slate-200 bg-white/80 text-slate-900 focus:outline-none focus:ring-2 focus:ring-lime-400"
              >
                {years.map(year => (
                  <option key={year} value={year}>{year}년</option>
                ))}
              </select>
            </div>
            <div className="flex items-center gap-2">
              <label className="text-sm font-medium text-slate-600">월</label>
              <select
                value={selectedMonth}
                onChange={(e) => setSelectedMonth(Number(e.target.value))}
                className="px-3 py-2 rounded-xl border border-slate-200 bg-white/80 text-slate-900 focus:outline-none focus:ring-2 focus:ring-lime-400"
              >
                {months.map(month => (
                  <option key={month} value={month}>{month}월</option>
                ))}
              </select>
            </div>
            <Badge className="bg-lime-100 text-lime-700 border-lime-200">
              {selectedYear}년 {selectedMonth}월 데이터
            </Badge>
          </div>
        </CardContent>
      </Card>

      {/* 에러 메시지 */}
      {error && (
        <Card className="bg-red-50 border-red-200 rounded-2xl">
          <CardContent className="flex items-center gap-3 py-4">
            <AlertCircle className="w-5 h-5 text-red-500" />
            <p className="text-red-700">{error}</p>
          </CardContent>
        </Card>
      )}

      {/* 내보내기 항목들 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {exportItems.map((item) => (
          <Card
            key={item.id}
            className="bg-white/60 backdrop-blur-xl border-white/40 rounded-3xl shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1"
          >
            <CardContent className="p-6">
              <div className="flex items-start gap-4">
                <div className={`${item.color} p-3 rounded-2xl`}>
                  <item.icon className="w-6 h-6 text-white" />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-slate-900 mb-1">{item.title}</h3>
                  <p className="text-sm text-slate-500 mb-4">{item.description}</p>
                  <Button
                    onClick={() => handleExport(item)}
                    disabled={loading !== null}
                    className="w-full bg-black text-lime-400 hover:bg-slate-800 rounded-xl"
                  >
                    {loading === item.id ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        내보내는 중...
                      </>
                    ) : (
                      <>
                        <Download className="w-4 h-4 mr-2" />
                        엑셀 다운로드
                      </>
                    )}
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* 안내 사항 */}
      <Card className="bg-slate-50/60 backdrop-blur-xl border-slate-200/40 rounded-3xl">
        <CardContent className="p-6">
          <div className="flex items-start gap-4">
            <FileSpreadsheet className="w-6 h-6 text-slate-400 flex-shrink-0 mt-0.5" />
            <div className="space-y-2">
              <h4 className="font-semibold text-slate-900">노무/세무 신고 안내</h4>
              <ul className="text-sm text-slate-600 space-y-1">
                <li>• <strong>급여대장</strong>: 매월 급여 지급 내역 관리 및 세무 자료 제출용</li>
                <li>• <strong>원천징수이행상황신고서</strong>: 매월 10일까지 홈택스에 제출</li>
                <li>• <strong>4대보험 신고서</strong>: 직원 입사/퇴사 시 해당 기관에 제출</li>
                <li>• <strong>근태대장</strong>: 근로기준법에 따른 근로시간 관리용</li>
                <li>• <strong>연차대장</strong>: 근로기준법 제60조에 따른 연차 관리용</li>
              </ul>
              <p className="text-xs text-slate-500 mt-3">
                * 다운로드한 파일은 노무사/세무사 검토 후 제출하시기 바랍니다.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
