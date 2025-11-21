import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { getDatabase, ref, onValue, off, set, push, update } from 'firebase/database'
import { app } from '@/lib/firebase'
import { useAuth } from '@/lib/auth-context'

export interface ProjectDetail {
  id: string
  name: string
  description: string
  status: 'planning' | 'design' | 'development' | 'testing' | 'completed'
  progress: number
  startDate: string
  endDate: string
  budget: number
  spentBudget?: number
  team: string[]
  clientId: string
  clientName?: string
  createdAt: string
  updatedAt: string
}

export interface Activity {
  id: string
  type: string
  message: string
  user: string
  timestamp: string
  icon: string
}

export const statusLabels = {
  planning: '기획',
  design: '디자인',
  development: '개발',
  testing: '테스트',
  completed: '완료'
}

export const statusColors = {
  planning: 'bg-gray-100 text-gray-700',
  design: 'bg-blue-100 text-blue-700',
  development: 'bg-yellow-100 text-yellow-700',
  testing: 'bg-purple-100 text-purple-700',
  completed: 'bg-green-100 text-green-700'
}

export function useProject(projectId: string | undefined) {
  const router = useRouter()
  const { userProfile } = useAuth()
  const [project, setProject] = useState<ProjectDetail | null>(null)
  const [activities, setActivities] = useState<Activity[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!projectId || !userProfile) return

    const db = getDatabase(app)
    const projectRef = ref(db, `projects/${projectId}`)
    
    onValue(projectRef, (snapshot) => {
      const data = snapshot.val()
      if (data) {
        setProject({
          id: projectId,
          ...data,
          startDate: data.startDate,
          endDate: data.endDate,
          createdAt: data.createdAt,
          updatedAt: data.updatedAt || data.createdAt
        })
      } else {
        router.push('/projects')
      }
      setLoading(false)
    })

    // Load project activities
    const activitiesRef = ref(db, `projectActivities/${projectId}`)
    onValue(activitiesRef, (snapshot) => {
      const data = snapshot.val() || {}
      const activitiesArray = Object.entries(data)
        .map(([id, activity]: [string, any]) => ({
          id,
          ...activity
        }))
        .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
        .slice(0, 20)
      
      setActivities(activitiesArray)
    })

    return () => {
      off(projectRef)
      off(activitiesRef)
    }
  }, [projectId, userProfile, router])

  const updateProjectStatus = async (newStatus: ProjectDetail['status']) => {
    if (!project || !userProfile) return

    try {
      const db = getDatabase(app)
      await set(ref(db, `projects/${project.id}/status`), newStatus)
      await set(ref(db, `projects/${project.id}/updatedAt`), new Date().toISOString())

      // Log activity
      const activityRef = ref(db, `projectActivities/${project.id}`)
      const newActivityRef = push(activityRef)
      await set(newActivityRef, {
        type: 'status',
        message: `프로젝트 상태를 "${statusLabels[newStatus]}"로 변경`,
        user: userProfile.displayName,
        timestamp: new Date().toISOString(),
        icon: '🔄'
      })
    } catch (error) {
      console.error('Error updating project status:', error)
    }
  }

  const deleteProject = async () => {
    if (!project) return

    try {
      const db = getDatabase(app)
      
      // Delete all project-related data
      const updates: Record<string, null> = {
        [`projects/${project.id}`]: null,
        [`projectActivities/${project.id}`]: null,
        [`files/${project.id}`]: null,
        [`invitations/${project.id}`]: null
      }
      
      await update(ref(db), updates)
      
      // Navigate to projects list after deletion
      router.push('/projects')
    } catch (error) {
      console.error('Error deleting project:', error)
      throw error
    }
  }

  return {
    project,
    activities,
    loading,
    updateProjectStatus,
    deleteProject
  }
}