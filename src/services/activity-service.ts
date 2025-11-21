import { getDatabase, ref, push, set, onValue, off, query, orderByChild, limitToLast } from 'firebase/database'
import { app } from '@/lib/firebase'
import logger from '@/utils/logger'

export interface Activity {
  id: string
  type: 'project' | 'message' | 'task' | 'file' | 'user' | 'system'
  title: string
  description: string
  time: string
  icon: string
  userId?: string
  userName?: string
  projectId?: string
  projectName?: string
  metadata?: Record<string, any>
}

class ActivityService {
  private db = getDatabase(app)

  // 활동 생성
  async createActivity(activity: Omit<Activity, 'id' | 'time'>) {
    try {
      const activitiesRef = ref(this.db, 'activities')
      const newActivityRef = push(activitiesRef)
      
      await set(newActivityRef, {
        ...activity,
        time: new Date().toISOString()
      })

      return newActivityRef.key
    } catch (error) {
      logger.error('Error creating activity', 'ActivityService', error)
      throw error
    }
  }

  // 프로젝트별 활동 조회
  subscribeToProjectActivities(
    projectId: string,
    callback: (activities: Activity[]) => void
  ): () => void {
    const activitiesRef = query(
      ref(this.db, 'activities'),
      orderByChild('projectId'),
      limitToLast(50)
    )

    const unsubscribe = onValue(activitiesRef, (snapshot) => {
      const activities: Activity[] = []
      
      if (snapshot.exists()) {
        snapshot.forEach((child) => {
          const activity = child.val()
          if (activity.projectId === projectId) {
            activities.push({
              id: child.key!,
              ...activity
            })
          }
        })
      }

      // 최신순으로 정렬
      activities.sort((a, b) => 
        new Date(b.time).getTime() - new Date(a.time).getTime()
      )

      callback(activities)
    })

    return () => off(activitiesRef)
  }

  // 전체 활동 조회
  subscribeToActivities(
    limit: number = 50,
    callback: (activities: Activity[]) => void
  ): () => void {
    const activitiesRef = query(
      ref(this.db, 'activities'),
      orderByChild('time'),
      limitToLast(limit)
    )

    const unsubscribe = onValue(activitiesRef, (snapshot) => {
      const activities: Activity[] = []
      
      if (snapshot.exists()) {
        snapshot.forEach((child) => {
          activities.push({
            id: child.key!,
            ...child.val()
          })
        })
      }

      // 최신순으로 정렬
      activities.sort((a, b) => 
        new Date(b.time).getTime() - new Date(a.time).getTime()
      )

      callback(activities)
    })

    return () => off(activitiesRef)
  }

  // 사용자별 활동 조회
  subscribeToUserActivities(
    userId: string,
    callback: (activities: Activity[]) => void
  ): () => void {
    const activitiesRef = query(
      ref(this.db, 'activities'),
      orderByChild('userId'),
      limitToLast(50)
    )

    const unsubscribe = onValue(activitiesRef, (snapshot) => {
      const activities: Activity[] = []
      
      if (snapshot.exists()) {
        snapshot.forEach((child) => {
          const activity = child.val()
          if (activity.userId === userId) {
            activities.push({
              id: child.key!,
              ...activity
            })
          }
        })
      }

      // 최신순으로 정렬
      activities.sort((a, b) => 
        new Date(b.time).getTime() - new Date(a.time).getTime()
      )

      callback(activities)
    })

    return () => off(activitiesRef)
  }

  // 특정 이벤트에 대한 활동 로그
  async logActivity(type: string, data: any) {
    const { user } = data
    
    switch (type) {
      case 'project_created':
        await this.createActivity({
          type: 'project',
          title: '새 프로젝트 생성',
          description: `${user.displayName}님이 "${data.projectName}" 프로젝트를 생성했습니다.`,
          icon: '📁',
          userId: user.uid,
          userName: user.displayName,
          projectId: data.projectId,
          projectName: data.projectName
        })
        break

      case 'task_created':
        await this.createActivity({
          type: 'task',
          title: '새 작업 생성',
          description: `${user.displayName}님이 "${data.taskTitle}" 작업을 생성했습니다.`,
          icon: '✅',
          userId: user.uid,
          userName: user.displayName,
          projectId: data.projectId,
          projectName: data.projectName
        })
        break

      case 'task_completed':
        await this.createActivity({
          type: 'task',
          title: '작업 완료',
          description: `${user.displayName}님이 "${data.taskTitle}" 작업을 완료했습니다.`,
          icon: '🎉',
          userId: user.uid,
          userName: user.displayName,
          projectId: data.projectId,
          projectName: data.projectName
        })
        break

      case 'file_uploaded':
        await this.createActivity({
          type: 'file',
          title: '파일 업로드',
          description: `${user.displayName}님이 "${data.fileName}" 파일을 업로드했습니다.`,
          icon: '📄',
          userId: user.uid,
          userName: user.displayName,
          projectId: data.projectId,
          projectName: data.projectName,
          metadata: {
            fileName: data.fileName,
            fileSize: data.fileSize,
            fileType: data.fileType
          }
        })
        break

      case 'message_sent':
        await this.createActivity({
          type: 'message',
          title: '메시지 전송',
          description: `${user.displayName}님이 ${data.recipientName}님에게 메시지를 전송했습니다.`,
          icon: '💬',
          userId: user.uid,
          userName: user.displayName
        })
        break

      case 'user_joined':
        await this.createActivity({
          type: 'user',
          title: '새 사용자 가입',
          description: `${data.userName}님이 시스템에 가입했습니다.`,
          icon: '👋',
          userId: data.userId,
          userName: data.userName
        })
        break

      case 'client_registered':
        await this.createActivity({
          type: 'user',
          title: '새 거래처 등록',
          description: `${user.displayName}님이 "${data.clientName}" 거래처를 등록했습니다.`,
          icon: '🏢',
          userId: user.uid,
          userName: user.displayName
        })
        break

      case 'project_status_changed':
        await this.createActivity({
          type: 'project',
          title: '프로젝트 상태 변경',
          description: `${user.displayName}님이 "${data.projectName}" 프로젝트의 상태를 ${data.newStatus}로 변경했습니다.`,
          icon: '🔄',
          userId: user.uid,
          userName: user.displayName,
          projectId: data.projectId,
          projectName: data.projectName
        })
        break
    }
  }
}

export const activityService = new ActivityService()
export default activityService