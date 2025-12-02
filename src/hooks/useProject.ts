import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/lib/auth-context'
import { getProject, updateProject, deleteProject as deleteProjectAction } from '@/actions/project'
import { toast } from 'react-hot-toast'

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

  const fetchProject = async () => {
    if (!projectId || !userProfile) return

    try {
      const data = await getProject(projectId)
      if (data) {
        setProject({
          id: data.id,
          name: data.name,
          description: data.description,
          status: data.status as any,
          progress: data.progress,
          startDate: new Date(data.startDate).toISOString(),
          endDate: new Date(data.endDate).toISOString(),
          budget: data.budget,
          team: data.team,
          clientId: data.clientId,
          clientName: data.clientName,
          createdAt: new Date(data.createdAt).toISOString(),
          updatedAt: new Date(data.updatedAt).toISOString()
        })

        // Map activities
        // Assuming getProject returns activities in a compatible format or we map them
        // Prisma activities might need mapping
        const mappedActivities = (data.activities || []).map((a: any) => ({
          id: a.id,
          type: a.type,
          message: a.message,
          user: a.userId, // Or fetch user name? Prisma include user?
          timestamp: new Date(a.timestamp).toISOString(),
          icon: '📝' // Default icon
        }))
        setActivities(mappedActivities)
      } else {
        router.push('/projects')
      }
    } catch (error) {
      console.error('Error fetching project:', error)
      toast.error('프로젝트 정보를 불러오는데 실패했습니다.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchProject()
  }, [projectId, userProfile])

  const updateProjectStatus = async (newStatus: ProjectDetail['status']) => {
    if (!project || !userProfile) return

    try {
      const result = await updateProject(project.id, { status: newStatus as any })
      if (result.success) {
        toast.success('프로젝트 상태가 변경되었습니다.')
        fetchProject()
      } else {
        throw new Error('Update failed')
      }
    } catch (error) {
      console.error('Error updating project status:', error)
      toast.error('상태 변경 실패')
    }
  }

  const deleteProject = async () => {
    if (!project) return

    if (!confirm('정말로 이 프로젝트를 삭제하시겠습니까?')) return

    try {
      const result = await deleteProjectAction(project.id)
      if (result.success) {
        toast.success('프로젝트가 삭제되었습니다.')
        router.push('/projects')
      } else {
        throw new Error('Delete failed')
      }
    } catch (error) {
      console.error('Error deleting project:', error)
      toast.error('삭제 실패')
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