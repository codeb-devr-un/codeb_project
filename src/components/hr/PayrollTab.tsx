'use client'

import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import {
  DollarSign, CreditCard, Banknote, FileSpreadsheet,
  Eye, EyeOff, Loader2, TrendingUp, Calendar
} from 'lucide-react'
import { toast } from 'react-hot-toast'
import { PayrollInfo, PayslipSummary } from '@/types/hr'

interface PayrollTabProps {
  userId: string
  workspaceId: string
  isAdmin: boolean
  employeeId?: string
}

export default function PayrollTab({ userId, workspaceId, isAdmin, employeeId }: PayrollTabProps) {
  const [loading, setLoading] = useState(true)
  const [payrollInfo, setPayrollInfo] = useState<PayrollInfo | null>(null)
  const [showSalary, setShowSalary] = useState(false)
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear())
  const [selectedPayslip, setSelectedPayslip] = useState<any>(null)
  const [yearlyStats, setYearlyStats] = useState<any>(null)

  useEffect(() => {
    loadPayroll()
  }, [userId, workspaceId, employeeId, selectedYear])

  const loadPayroll = async () => {
    setLoading(true)
    try {
      const url = employeeId
        ? `/api/payroll/${employeeId}?year=${selectedYear}`
        : `/api/payroll?year=${selectedYear}`

      const res = await fetch(url, {
        headers: { 'x-workspace-id': workspaceId }
      })

      if (res.ok) {
        const data = await res.json()
        if (employeeId) {
          setPayrollInfo(data.payrollInfo)
          setYearlyStats(data.yearlyStats)
        } else {
          // 본인 급여 조회 - payrollRecords를 payslips 형식으로 변환
          setPayrollInfo({
            payrollType: 'MONTHLY',
            payslips: data.payrollRecords?.map((r: any) => ({
              id: r.id,
              period: r.period,
              grossPay: r.grossPay,
              netPay: r.netPay,
              status: r.status?.toLowerCase()
            })) || []
          })
          setYearlyStats(data.summary)
        }
      }
    } catch (e) {
      console.error('Failed to load payroll:', e)
    } finally {
      setLoading(false)
    }
  }

  const formatCurrency = (amount?: number, hidden?: boolean) => {
    if (amount === undefined || amount === null) return '-'
    if (hidden && !showSalary) return '***,***원'
    return amount.toLocaleString('ko-KR') + '원'
  }

  const getPayrollTypeBadge = (type?: string) => {
    const map: Record<string, { color: string; text: string }> = {
      MONTHLY: { color: 'bg-blue-100 text-blue-700', text: '월급제' },
      HOURLY: { color: 'bg-purple-100 text-purple-700', text: '시급제' },
      FREELANCER: { color: 'bg-green-100 text-green-700', text: '프리랜서' }
    }
    const v = map[type || ''] || { color: 'bg-slate-100 text-slate-600', text: type || '-' }
    return <Badge className={v.color}>{v.text}</Badge>
  }

  const getStatusBadge = (status?: string) => {
    const map: Record<string, { color: string; text: string }> = {
      draft: { color: 'bg-yellow-100 text-yellow-700', text: '초안' },
      DRAFT: { color: 'bg-yellow-100 text-yellow-700', text: '초안' },
      confirmed: { color: 'bg-blue-100 text-blue-700', text: '확정' },
      CONFIRMED: { color: 'bg-blue-100 text-blue-700', text: '확정' },
      paid: { color: 'bg-lime-100 text-lime-700', text: '지급완료' },
      PAID: { color: 'bg-lime-100 text-lime-700', text: '지급완료' }
    }
    const v = map[status || ''] || { color: 'bg-slate-100 text-slate-600', text: status || '-' }
    return <Badge className={v.color}>{v.text}</Badge>
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-lime-400" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* 급여 요약 */}
      <Card className="bg-white/60 backdrop-blur-xl border-white/40 shadow-sm rounded-3xl">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-slate-900 flex items-center gap-2">
            <DollarSign className="w-5 h-5 text-lime-600" />
            급여 정보
          </CardTitle>
          <Button variant="ghost" size="sm" onClick={() => setShowSalary(!showSalary)} className="text-slate-600 hover:bg-slate-100">
            {showSalary ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            <span className="ml-2">{showSalary ? '숨기기' : '보기'}</span>
          </Button>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* 급여 유형 */}
            <div className="p-4 rounded-xl bg-white/50 border border-white/60">
              <div className="flex items-center gap-2 mb-2 text-slate-500">
                <CreditCard className="w-4 h-4" />
                급여 유형
              </div>
              <div>{getPayrollTypeBadge(payrollInfo?.payrollType)}</div>
            </div>

            {/* 기본급 */}
            <div className="p-4 rounded-xl bg-white/50 border border-white/60">
              <div className="flex items-center gap-2 mb-2 text-slate-500">
                <Banknote className="w-4 h-4" />
                {payrollInfo?.payrollType === 'HOURLY' ? '시급' : '월 기본급'}
              </div>
              <p className="text-2xl font-bold text-slate-900">
                {payrollInfo?.payrollType === 'HOURLY'
                  ? formatCurrency(payrollInfo?.hourlyWage, true)
                  : formatCurrency(payrollInfo?.baseSalaryMonthly, true)}
              </p>
            </div>

            {/* 연간 누계 */}
            <div className="p-4 rounded-xl bg-white/50 border border-white/60">
              <div className="flex items-center gap-2 mb-2 text-slate-500">
                <TrendingUp className="w-4 h-4" />
                {selectedYear}년 누계
              </div>
              <p className="text-2xl font-bold text-lime-600">
                {formatCurrency(yearlyStats?.totalNetPay, true)}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 수당 및 공제 */}
      {payrollInfo?.allowances && payrollInfo?.deductions && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* 수당 */}
          <Card className="bg-white/60 backdrop-blur-xl border-white/40 shadow-sm rounded-3xl">
            <CardHeader>
              <CardTitle className="text-slate-900 text-lg">수당</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {payrollInfo.allowances.map((item, idx) => (
                  <div key={idx} className="flex items-center justify-between p-3 rounded-xl bg-white/50">
                    <span className="text-slate-600">{item.name}</span>
                    <span className="text-slate-900">{formatCurrency(item.amount, true)}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* 공제 */}
          <Card className="bg-white/60 backdrop-blur-xl border-white/40 shadow-sm rounded-3xl">
            <CardHeader>
              <CardTitle className="text-slate-900 text-lg">공제</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {payrollInfo.deductions.map((item, idx) => (
                  <div key={idx} className="flex items-center justify-between p-3 rounded-xl bg-white/50">
                    <span className="text-slate-600">{item.name}</span>
                    <span className="text-red-600">
                      {item.type === 'rate' ? `${item.amount}%` : formatCurrency(item.amount, true)}
                    </span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* 급여 명세서 목록 */}
      <Card className="bg-white/60 backdrop-blur-xl border-white/40 shadow-sm rounded-3xl">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-slate-900 flex items-center gap-2">
            <FileSpreadsheet className="w-5 h-5 text-slate-600" />
            급여 명세서
          </CardTitle>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setSelectedYear(selectedYear - 1)}
              className="border-slate-200 text-slate-700 hover:bg-slate-50"
            >
              이전 연도
            </Button>
            <span className="text-slate-900 px-2 font-medium">{selectedYear}년</span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setSelectedYear(selectedYear + 1)}
              disabled={selectedYear >= new Date().getFullYear()}
              className="border-slate-200 text-slate-700 hover:bg-slate-50"
            >
              다음 연도
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {!payrollInfo?.payslips?.length ? (
            <p className="text-center text-slate-500 py-8">급여 명세서가 없습니다</p>
          ) : (
            <div className="space-y-3">
              {payrollInfo.payslips.map((slip, idx) => (
                <div
                  key={idx}
                  onClick={() => setSelectedPayslip(slip)}
                  className="flex items-center justify-between p-4 rounded-xl bg-white/50 border border-white/60 hover:bg-white/70 cursor-pointer transition-colors"
                >
                  <div className="flex items-center gap-4">
                    <Calendar className="w-5 h-5 text-slate-500" />
                    <div>
                      <p className="text-slate-900 font-medium">{slip.period}</p>
                      <p className="text-slate-500 text-sm">급여 명세서</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-6">
                    <div className="text-right">
                      <p className="text-slate-500 text-sm">총지급액</p>
                      <p className="text-slate-900">{formatCurrency(slip.grossPay, true)}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-slate-500 text-sm">실수령액</p>
                      <p className="text-lime-600 font-bold">{formatCurrency(slip.netPay, true)}</p>
                    </div>
                    {getStatusBadge(slip.status)}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* 연간 통계 */}
      {yearlyStats && (
        <Card className="bg-white/60 backdrop-blur-xl border-white/40 shadow-sm rounded-3xl">
          <CardHeader>
            <CardTitle className="text-slate-900 flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-lime-600" />
              {selectedYear}년 급여 통계
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <StatCard label="총 지급액" value={formatCurrency(yearlyStats.totalGrossPay, true)} />
              <StatCard label="총 실수령액" value={formatCurrency(yearlyStats.totalNetPay, true)} color="green" />
              <StatCard label="총 공제액" value={formatCurrency(yearlyStats.totalDeduction, true)} color="red" />
              <StatCard label="월 평균" value={formatCurrency(yearlyStats.avgMonthlyPay || yearlyStats.avgGrossPay, true)} />
            </div>
          </CardContent>
        </Card>
      )}

      {/* 급여 명세서 상세 모달 */}
      <Dialog open={!!selectedPayslip} onOpenChange={() => setSelectedPayslip(null)}>
        <DialogContent className="bg-white border-slate-200 max-w-lg rounded-3xl">
          <DialogHeader>
            <DialogTitle className="text-slate-900">
              {selectedPayslip?.period} 급여 명세서
            </DialogTitle>
          </DialogHeader>
          {selectedPayslip && (
            <div className="space-y-4">
              <div className="p-4 rounded-xl bg-slate-50 space-y-3">
                <div className="flex justify-between">
                  <span className="text-slate-600">기본급</span>
                  <span className="text-slate-900">{formatCurrency(selectedPayslip.basePay)}</span>
                </div>
                <div className="flex justify-between border-t border-slate-200 pt-3">
                  <span className="text-slate-600 font-medium">총 지급액</span>
                  <span className="text-slate-900 font-bold">{formatCurrency(selectedPayslip.grossPay)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-600">공제액</span>
                  <span className="text-red-600">-{formatCurrency(selectedPayslip.totalDeduction)}</span>
                </div>
                <div className="flex justify-between border-t border-slate-200 pt-3">
                  <span className="text-slate-600 font-medium">실수령액</span>
                  <span className="text-lime-600 font-bold text-lg">{formatCurrency(selectedPayslip.netPay)}</span>
                </div>
              </div>
              <div className="flex justify-center">
                {getStatusBadge(selectedPayslip.status)}
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setSelectedPayslip(null)} className="border-slate-200 text-slate-700 hover:bg-slate-50">닫기</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

function StatCard({ label, value, color = 'white' }: { label: string; value: string; color?: string }) {
  const colorClass = color === 'green' ? 'text-lime-600' : color === 'red' ? 'text-red-600' : 'text-slate-900'
  return (
    <div className="p-4 rounded-xl bg-white/50 border border-white/60">
      <p className="text-slate-500 text-sm">{label}</p>
      <p className={`text-xl font-bold ${colorClass}`}>{value}</p>
    </div>
  )
}
