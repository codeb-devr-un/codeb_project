import { useState, useEffect } from 'react'
import { ref, onValue, off } from 'firebase/database'
import { database } from '@/lib/firebase'
import { useAuth } from '@/lib/auth-context'

export interface DashboardData {
  totalProjects: number
  activeProjects: number
  completedProjects: number
  totalTasks: number
  pendingTasks: number
  completedTasks: number
  totalRevenue: number
  monthlyRevenue: number
  totalUsers: number
  activeUsers: number
  totalCustomers: number
  totalFiles: number
  recentActivities: any[]
}

const initialData: DashboardData = {
  totalProjects: 0,
  activeProjects: 0,
  completedProjects: 0,
  totalTasks: 0,
  pendingTasks: 0,
  completedTasks: 0,
  totalRevenue: 0,
  monthlyRevenue: 0,
  totalUsers: 0,
  activeUsers: 0,
  totalCustomers: 0,
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

    setLoading(true)
    setError(null)

    const listeners: Array<() => void> = []

    try {
      // 프로젝트 통계
      const projectsRef = ref(database, 'projects')
      const projectsListener = onValue(projectsRef, (snapshot) => {
        const projects = snapshot.val() || {}
        const projectList = Object.values(projects) as any[]
        
        setData(prev => ({
          ...prev,
          totalProjects: projectList.length,
          activeProjects: projectList.filter(p => 
            ['planning', 'design', 'development', 'testing'].includes(p.status)
          ).length,
          completedProjects: projectList.filter(p => p.status === 'completed').length
        }))
      })
      listeners.push(() => off(projectsRef, 'value', projectsListener))

      // 작업 통계
      const tasksRef = ref(database, 'tasks')
      const tasksListener = onValue(tasksRef, (snapshot) => {
        const tasks = snapshot.val() || {}
        const taskList = Object.values(tasks) as any[]
        
        setData(prev => ({
          ...prev,
          totalTasks: taskList.length,
          pendingTasks: taskList.filter(t => t.status === 'pending').length,
          completedTasks: taskList.filter(t => t.status === 'completed').length
        }))
      })
      listeners.push(() => off(tasksRef, 'value', tasksListener))

      // 관리자 전용 통계
      if (userProfile.role === 'admin') {
        // 사용자 통계
        const usersRef = ref(database, 'users')
        const usersListener = onValue(usersRef, (snapshot) => {
          const users = snapshot.val() || {}
          const userList = Object.values(users) as any[]
          
          setData(prev => ({
            ...prev,
            totalUsers: userList.length,
            activeUsers: userList.filter(u => u.isOnline).length,
            totalCustomers: userList.filter(u => u.role === 'customer').length
          }))
        })
        listeners.push(() => off(usersRef, 'value', usersListener))

        // 수익 통계 (모의 데이터)
        setData(prev => ({
          ...prev,
          totalRevenue: 15000000,
          monthlyRevenue: 3500000
        }))
      }

      // 최근 활동
      const activitiesRef = ref(database, 'activities')
      const activitiesListener = onValue(activitiesRef, (snapshot) => {
        const activities = snapshot.val() || {}
        const activityList = Object.entries(activities)
          .map(([id, data]: [string, any]) => ({ id, ...data }))
          .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
          .slice(0, 10)
        
        setData(prev => ({
          ...prev,
          recentActivities: activityList
        }))
      })
      listeners.push(() => off(activitiesRef, 'value', activitiesListener))

      setLoading(false)
    } catch (err) {
      console.error('대시보드 데이터 로드 실패:', err)
      setError('데이터를 불러오는 중 오류가 발생했습니다.')
      setLoading(false)
    }

    // 클린업
    return () => {
      listeners.forEach(cleanup => cleanup())
    }
  }, [userProfile])

  return { data, loading, error, refetch: () => {} }
}