'use client'
const isDev = process.env.NODE_ENV === 'development'

import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  BarChart3, TrendingUp, Users, Clock, Target,
  Loader2, Building2, Calendar, Award, DollarSign
} from 'lucide-react'
import { AttendanceStats } from '@/types/hr'

interface StatsTabProps {
  userId: string
  workspaceId: string
  isAdmin: boolean
}

export default function StatsTab({ userId, workspaceId, isAdmin }: StatsTabProps) {
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState<AttendanceStats | null>(null)
  const [adminStats, setAdminStats] = useState<any>(null)
  const [period, setPeriod] = useState<'week' | 'month' | 'year'>('month')

  useEffect(() => {
    loadStats()
  }, [userId, workspaceId, period])

  const loadStats = async () => {
    setLoading(true)
    try {
      const res = await fetch(`/api/hr/stats?period=${period}`, {
        headers: { 'x-workspace-id': workspaceId }
      })
      if (res.ok) {
        const data = await res.json()
        if (isAdmin && data.overview) {
          setAdminStats(data)
        } else {
          setStats(data)
        }
      }
    } catch (e) {
      if (isDev) console.error('Failed to load stats:', e)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-lime-400" />
      </div>
    )
  }

  // 관리자 뷰
  if (isAdmin && adminStats) {
    return (
      <div className="space-y-6">
        {/* 기간 선택 */}
        <div className="flex justify-end gap-2">
          {(['week', 'month', 'year'] as const).map(p => (
            <Button
              key={p}
              size="sm"
              onClick={() => setPeriod(p)}
              className={period === p
                ? 'bg-black text-lime-400 hover:bg-black/90'
                : 'bg-white/60 border-slate-200 text-slate-700 hover:bg-slate-50'
              }
            >
              {p === 'week' ? '주간' : p === 'month' ? '월간' : '연간'}
            </Button>
          ))}
        </div>

        {/* 전체 현황 */}
        <Card className="bg-white/60 backdrop-blur-xl border-white/40 shadow-sm rounded-3xl">
          <CardHeader>
            <CardTitle className="text-slate-900 flex items-center gap-2">
              <Users className="w-5 h-5 text-lime-600" />
              직원 현황
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <StatCard
                icon={<Users className="w-5 h-5 text-blue-600" />}
                label="전체 직원"
                value={adminStats.overview?.totalEmployees || 0}
                suffix="명"
              />
              <StatCard
                icon={<Target className="w-5 h-5 text-lime-600" />}
                label="재직 중"
                value={adminStats.overview?.activeEmployees || 0}
                suffix="명"
              />
              <StatCard
                icon={<Award className="w-5 h-5 text-yellow-600" />}
                label="신규 입사"
                value={adminStats.overview?.newHires || 0}
                suffix="명"
              />
              <StatCard
                icon={<Clock className="w-5 h-5 text-purple-600" />}
                label="출근율"
                value={adminStats.attendance?.attendanceRate || 0}
                suffix="%"
              />
            </div>
          </CardContent>
        </Card>

        {/* 근태 현황 */}
        <Card className="bg-white/60 backdrop-blur-xl border-white/40 shadow-sm rounded-3xl">
          <CardHeader>
            <CardTitle className="text-slate-900 flex items-center gap-2">
              <Clock className="w-5 h-5 text-lime-600" />
              근태 현황
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <StatCard
                label="총 근무일"
                value={adminStats.attendance?.totalWorkDays || 0}
                suffix="일"
              />
              <StatCard
                label="출근"
                value={adminStats.attendance?.presentDays || 0}
                suffix="건"
                color="green"
              />
              <StatCard
                label="지각"
                value={adminStats.attendance?.lateDays || 0}
                suffix="건"
                color="yellow"
              />
              <StatCard
                label="재택근무"
                value={adminStats.attendance?.remoteDays || 0}
                suffix="건"
                color="blue"
              />
            </div>
          </CardContent>
        </Card>

        {/* 부서별 통계 */}
        {adminStats.departmentStats && (
          <Card className="bg-white/60 backdrop-blur-xl border-white/40 shadow-sm rounded-3xl">
            <CardHeader>
              <CardTitle className="text-slate-900 flex items-center gap-2">
                <Building2 className="w-5 h-5 text-lime-600" />
                부서별 현황
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {Object.entries(adminStats.departmentStats).map(([dept, data]: [string, any]) => (
                  <div
                    key={dept}
                    className="flex items-center justify-between p-4 rounded-xl bg-white/50 border border-white/60"
                  >
                    <div>
                      <p className="text-slate-900 font-medium">{dept}</p>
                      <p className="text-slate-500 text-sm">{data.count}명</p>
                    </div>
                    <div className="text-right">
                      <p className="text-slate-500 text-sm">평균 급여</p>
                      <p className="text-slate-900">{data.avgSalary?.toLocaleString()}원</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* 고용 유형별 */}
        {adminStats.employmentTypeStats && (
          <Card className="bg-white/60 backdrop-blur-xl border-white/40 shadow-sm rounded-3xl">
            <CardHeader>
              <CardTitle className="text-slate-900 flex items-center gap-2">
                <Users className="w-5 h-5 text-lime-600" />
                고용 유형별 현황
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {Object.entries(adminStats.employmentTypeStats).map(([type, count]: [string, any]) => (
                  <div key={type} className="p-4 rounded-xl bg-white/50 border border-white/60">
                    <Badge className="mb-2 bg-lime-100 text-lime-700">{getEmploymentTypeLabel(type)}</Badge>
                    <p className="text-2xl font-bold text-slate-900">{count}명</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* 급여 통계 */}
        {adminStats.payrollStats && (
          <Card className="bg-white/60 backdrop-blur-xl border-white/40 shadow-sm rounded-3xl">
            <CardHeader>
              <CardTitle className="text-slate-900 flex items-center gap-2">
                <DollarSign className="w-5 h-5 text-lime-600" />
                급여 통계
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <StatCard
                  label="총 지급액"
                  value={adminStats.payrollStats.totalGrossPay?.toLocaleString() || 0}
                  suffix="원"
                />
                <StatCard
                  label="총 실수령액"
                  value={adminStats.payrollStats.totalNetPay?.toLocaleString() || 0}
                  suffix="원"
                  color="green"
                />
                <StatCard
                  label="평균 급여"
                  value={adminStats.payrollStats.avgSalary?.toLocaleString() || 0}
                  suffix="원"
                />
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    )
  }

  // 일반 직원 뷰
  return (
    <div className="space-y-6">
      {/* 기간 선택 */}
      <div className="flex justify-end gap-2">
        {(['week', 'month', 'year'] as const).map(p => (
          <Button
            key={p}
            size="sm"
            onClick={() => setPeriod(p)}
            className={period === p
              ? 'bg-black text-lime-400 hover:bg-black/90'
              : 'bg-white/60 border-slate-200 text-slate-700 hover:bg-slate-50'
            }
          >
            {p === 'week' ? '주간' : p === 'month' ? '월간' : '연간'}
          </Button>
        ))}
      </div>

      {/* 근무 요약 */}
      <Card className="bg-white/60 backdrop-blur-xl border-white/40 shadow-sm rounded-3xl">
        <CardHeader>
          <CardTitle className="text-slate-900 flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-lime-600" />
            근무 요약
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <StatCard
              icon={<Calendar className="w-5 h-5 text-blue-600" />}
              label="총 근무일"
              value={stats?.monthly?.totalWorkDays || 0}
              suffix="일"
            />
            <StatCard
              icon={<Target className="w-5 h-5 text-lime-600" />}
              label="출근율"
              value={stats?.monthly?.attendanceRate || 0}
              suffix="%"
              color="green"
            />
            <StatCard
              icon={<Clock className="w-5 h-5 text-purple-600" />}
              label="평균 근무시간"
              value={stats?.monthly?.avgWorkHours?.toFixed(1) || 0}
              suffix="시간"
            />
            <StatCard
              icon={<TrendingUp className="w-5 h-5 text-yellow-600" />}
              label="지각"
              value={stats?.monthly?.lateDays || 0}
              suffix="일"
              color={stats?.monthly?.lateDays ? 'yellow' : 'green'}
            />
          </div>
        </CardContent>
      </Card>

      {/* 근무 유형 분포 */}
      <Card className="bg-white/60 backdrop-blur-xl border-white/40 shadow-sm rounded-3xl">
        <CardHeader>
          <CardTitle className="text-slate-900 flex items-center gap-2">
            <Building2 className="w-5 h-5 text-lime-600" />
            근무 유형 분포
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <WorkTypeCard
              label="사무실"
              value={stats?.workTypeDistribution?.office || stats?.monthly?.officeDays || 0}
              total={stats?.monthly?.totalWorkDays || 1}
              color="blue"
            />
            <WorkTypeCard
              label="재택"
              value={stats?.workTypeDistribution?.remote || stats?.monthly?.remoteDays || 0}
              total={stats?.monthly?.totalWorkDays || 1}
              color="green"
            />
            <WorkTypeCard
              label="정상 출근"
              value={stats?.workTypeDistribution?.present || stats?.monthly?.presentDays || 0}
              total={stats?.monthly?.totalWorkDays || 1}
              color="purple"
            />
            <WorkTypeCard
              label="지각"
              value={stats?.workTypeDistribution?.late || stats?.monthly?.lateDays || 0}
              total={stats?.monthly?.totalWorkDays || 1}
              color="yellow"
            />
          </div>
        </CardContent>
      </Card>

      {/* 요일별 근무시간 */}
      {stats?.weekly?.pattern && (
        <Card className="bg-white/60 backdrop-blur-xl border-white/40 shadow-sm rounded-3xl">
          <CardHeader>
            <CardTitle className="text-slate-900 flex items-center gap-2">
              <Clock className="w-5 h-5 text-lime-600" />
              요일별 평균 근무시간
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-end justify-between h-32 gap-2">
              {stats.weekly.pattern.map((day, idx) => (
                <div key={idx} className="flex-1 flex flex-col items-center">
                  <div
                    className="w-full bg-lime-500/60 rounded-t"
                    style={{ height: `${(day.hours / 10) * 100}%` }}
                  />
                  <p className="text-slate-500 text-sm mt-2">{day.day}</p>
                  <p className="text-slate-900 text-xs">{day.hours}h</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* 연간 통계 */}
      {stats?.yearly && (
        <Card className="bg-white/60 backdrop-blur-xl border-white/40 shadow-sm rounded-3xl">
          <CardHeader>
            <CardTitle className="text-slate-900 flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-lime-600" />
              연간 통계
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <StatCard label="총 근무일" value={stats.yearly.totalDays} suffix="일" />
              <StatCard label="출근율" value={stats.yearly.attendanceRate} suffix="%" color="green" />
              <StatCard label="평균 근무시간" value={stats.yearly.avgWorkHours?.toFixed(1) || 0} suffix="시간" />
              <StatCard label="지각 횟수" value={stats.yearly.lateDays} suffix="회" color="yellow" />
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

function StatCard({
  icon,
  label,
  value,
  suffix,
  color = 'white'
}: {
  icon?: React.ReactNode
  label: string
  value: number | string
  suffix?: string
  color?: 'white' | 'green' | 'yellow' | 'blue' | 'red'
}) {
  const colorClasses = {
    white: 'text-slate-900',
    green: 'text-lime-600',
    yellow: 'text-yellow-600',
    blue: 'text-blue-600',
    red: 'text-red-600'
  }

  return (
    <div className="p-4 rounded-xl bg-white/50 border border-white/60">
      {icon && <div className="mb-2">{icon}</div>}
      <p className="text-slate-500 text-sm">{label}</p>
      <p className={`text-2xl font-bold ${colorClasses[color]}`}>
        {value}{suffix && <span className="text-lg ml-1">{suffix}</span>}
      </p>
    </div>
  )
}

function WorkTypeCard({
  label,
  value,
  total,
  color
}: {
  label: string
  value: number
  total: number
  color: 'blue' | 'green' | 'purple' | 'yellow'
}) {
  const percentage = total > 0 ? Math.round((value / total) * 100) : 0
  const colorClasses = {
    blue: 'bg-blue-500',
    green: 'bg-lime-500',
    purple: 'bg-purple-500',
    yellow: 'bg-yellow-500'
  }

  return (
    <div className="p-4 rounded-xl bg-white/50 border border-white/60">
      <p className="text-slate-500 text-sm">{label}</p>
      <p className="text-2xl font-bold text-slate-900">{value}일</p>
      <div className="mt-2 h-2 bg-slate-200 rounded-full overflow-hidden">
        <div
          className={`h-full ${colorClasses[color]} rounded-full`}
          style={{ width: `${percentage}%` }}
        />
      </div>
      <p className="text-slate-500 text-xs mt-1">{percentage}%</p>
    </div>
  )
}

function getEmploymentTypeLabel(type: string) {
  const map: Record<string, string> = {
    FULL_TIME: '정규직',
    PART_TIME: '파트타임',
    CONTRACT: '계약직',
    INTERN: '인턴'
  }
  return map[type] || type
}
