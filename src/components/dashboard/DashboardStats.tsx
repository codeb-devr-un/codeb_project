'use client'

import React from 'react'
import { useAuth } from '@/lib/auth-context'
import { useDashboardStats } from '@/hooks/useDashboardStats'

interface StatCardProps {
  icon: string
  iconBg: string
  value: string | number
  label: string
  change?: {
    value: string
    isPositive: boolean
  }
  loading?: boolean
}

function StatCard({ icon, iconBg, value, label, change, loading }: StatCardProps) {
  return (
    <div className="card hover:shadow-md transition-shadow">
      <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-2xl mb-4 ${iconBg}`}>
        {icon}
      </div>
      {loading ? (
        <div className="space-y-2">
          <div className="h-8 bg-gray-200 rounded animate-pulse w-20"></div>
          <div className="h-4 bg-gray-200 rounded animate-pulse w-16"></div>
        </div>
      ) : (
        <>
          <div className="text-3xl font-bold text-gray-900 mb-1">{value}</div>
          <div className="text-sm text-gray-600">{label}</div>
          {change && (
            <div className={`inline-flex items-center gap-1 mt-3 px-2 py-1 rounded text-xs ${change.isPositive ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
              }`}>
              <span>{change.isPositive ? '↑' : '↓'}</span>
              <span>{change.value}</span>
            </div>
          )}
        </>
      )}
    </div>
  )
}

export default function DashboardStats() {
  const { userProfile } = useAuth()
  const { data, loading } = useDashboardStats()

  // Define stats based on user role
  const getStats = () => {
    if (!userProfile) return []

    const baseStats: Array<{
      icon: string
      iconBg: string
      value: string | number
      label: string
      change?: { value: string; isPositive: boolean }
    }> = [
        {
          icon: '📊',
          iconBg: 'bg-blue-100 text-blue-600',
          value: data.completedTasks,
          label: '완료된 작업',
          change: { value: '0% 변동', isPositive: true } // TODO: Calculate change
        },
        {
          icon: '⏱️',
          iconBg: 'bg-green-100 text-green-600',
          value: data.activeTasks,
          label: '진행 중인 작업',
          change: { value: '0개 추가', isPositive: true } // TODO: Calculate change
        },
        {
          icon: '📁',
          iconBg: 'bg-purple-100 text-purple-600',
          value: data.activeProjects,
          label: '진행중 프로젝트',
          change: { value: `총 ${data.totalProjects}개`, isPositive: true }
        }
      ]

    if (userProfile.role === 'admin' || userProfile.role === 'member') {
      // Messages removed for now
    }

    if (userProfile.role === 'admin') {
      baseStats.push(
        {
          icon: '💰',
          iconBg: 'bg-orange-100 text-orange-600',
          value: `₩${data.monthlyRevenue.toLocaleString()}`,
          label: '이번달 수익',
          change: { value: '0% 증가', isPositive: true } // TODO: Calculate change
        },
        {
          icon: '👥',
          iconBg: 'bg-pink-100 text-pink-600',
          value: data.activeCustomers,
          label: '활성 고객',
          change: { value: `총 ${data.totalCustomers}명`, isPositive: true }
        }
      )
    }

    return baseStats.slice(0, 4) // Show only 4 stats
  }

  const stats = getStats()

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {stats.map((stat, index) => (
        <StatCard key={index} {...stat} loading={loading} />
      ))}
    </div>
  )
}