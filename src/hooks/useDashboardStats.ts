import { useState, useEffect } from 'react'
import { useAuth } from '@/lib/auth-context'

export interface DashboardData {
  totalProjects: number
  activeProjects: number
  completedProjects: number
  totalTasks: number
  pendingTasks: number
  activeTasks: number
  completedTasks: number
  totalRevenue: number
  monthlyRevenue: number
  totalUsers: number
  activeUsers: number
  totalCustomers: number
  activeCustomers: number
  totalFiles: number
  recentActivities: any[]
}

const initialData: DashboardData = {
  totalProjects: 0,
  activeProjects: 0,
  completedProjects: 0,
  totalTasks: 0,
  pendingTasks: 0,
  activeTasks: 0,
  completedTasks: 0,
  totalRevenue: 0,
  monthlyRevenue: 0,
  totalUsers: 0,
  activeUsers: 0,
  totalCustomers: 0,
  activeCustomers: 0,
  totalFiles: 0,
  recentActivities: []
}

export function useDashboardStats() {
  const { userProfile } = useAuth()
  const [data, setData] = useState<DashboardData>(initialData)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!userProfile) {
      setLoading(false)
      return
    }

    // TODO: Implement PostgreSQL data fetching
    // For now, return dummy data to fix build
    setLoading(true)
    setTimeout(() => {
      setData({
        totalProjects: 5,
        activeProjects: 3,
        completedProjects: 2,
        totalTasks: 12,
        pendingTasks: 5,
        activeTasks: 5,
        completedTasks: 7,
        totalRevenue: 15000000,
        monthlyRevenue: 3500000,
        totalUsers: 4,
        activeUsers: 2,
        totalCustomers: 1,
        activeCustomers: 1,
        totalFiles: 10,
        recentActivities: []
      })
      setLoading(false)
    }, 500)

  }, [userProfile])

  return { data, loading, error, refetch: () => { } }
}