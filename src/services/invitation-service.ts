import { getDatabase, ref, push, set, get, update, query, orderByChild, equalTo } from 'firebase/database'
import { app } from '@/lib/firebase'
import { ProjectInvitation, ClientUser } from '@/types'

class InvitationService {
  private db = getDatabase(app)

  // 초대 링크 생성
  async createInvitation(
    projectId: string, 
    invitedBy: string,
    email?: string,
    expiresInDays: number = 7
  ): Promise<ProjectInvitation> {
    const inviteCode = this.generateInviteCode()
    const expiresAt = new Date()
    expiresAt.setDate(expiresAt.getDate() + expiresInDays)

    const invitation: Omit<ProjectInvitation, 'id'> = {
      projectId,
      projectName: '',
      invitedBy,
      inviteCode,
      email,
      invitationType: 'link',
      targetRole: 'client',
      expiresAt,
      status: 'pending',
      permissions: {
        viewProject: true,
        viewTasks: true,
        createTasks: false,
        viewFiles: true,
        uploadFiles: false,
        viewChat: false,
        sendChat: false
      },
      createdAt: new Date()
    }

    const invitationsRef = ref(this.db, 'projectInvitations')
    const newInvitationRef = push(invitationsRef)
    await set(newInvitationRef, {
      ...invitation,
      expiresAt: expiresAt.toISOString(),
      createdAt: new Date().toISOString()
    })

    return {
      id: newInvitationRef.key!,
      ...invitation
    }
  }

  // 초대 코드 생성
  private generateInviteCode(): string {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
    let code = ''
    for (let i = 0; i < 12; i++) {
      code += chars.charAt(Math.floor(Math.random() * chars.length))
    }
    return code
  }

  // 초대 코드로 초대 정보 조회
  async getInvitationByCode(inviteCode: string): Promise<ProjectInvitation | null> {
    const invitationsRef = ref(this.db, 'projectInvitations')
    const inviteQuery = query(invitationsRef, orderByChild('inviteCode'), equalTo(inviteCode))
    const snapshot = await get(inviteQuery)

    if (snapshot.exists()) {
      const data = snapshot.val()
      const key = Object.keys(data)[0]
      const invitation = data[key]
      
      return {
        id: key,
        ...invitation,
        expiresAt: new Date(invitation.expiresAt),
        createdAt: new Date(invitation.createdAt),
        usedAt: invitation.usedAt ? new Date(invitation.usedAt) : undefined
      }
    }

    return null
  }

  // 프로젝트의 모든 초대 목록 조회
  async getProjectInvitations(projectId: string): Promise<ProjectInvitation[]> {
    const invitationsRef = ref(this.db, 'projectInvitations')
    const projectQuery = query(invitationsRef, orderByChild('projectId'), equalTo(projectId))
    const snapshot = await get(projectQuery)

    if (!snapshot.exists()) return []

    const invitations: ProjectInvitation[] = []
    snapshot.forEach((child) => {
      const data = child.val()
      invitations.push({
        id: child.key!,
        ...data,
        expiresAt: new Date(data.expiresAt),
        createdAt: new Date(data.createdAt),
        usedAt: data.usedAt ? new Date(data.usedAt) : undefined
      })
    })

    return invitations.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
  }

  // 초대 사용 처리
  async useInvitation(inviteCode: string, userId: string, userEmail: string): Promise<void> {
    const invitation = await this.getInvitationByCode(inviteCode)
    
    if (!invitation) {
      throw new Error('유효하지 않은 초대 코드입니다.')
    }

    if (invitation.status !== 'pending') {
      throw new Error('이미 사용되었거나 만료된 초대입니다.')
    }

    if (new Date() > invitation.expiresAt) {
      // 만료된 초대 상태 업데이트
      await this.updateInvitationStatus(invitation.id, 'expired')
      throw new Error('초대가 만료되었습니다.')
    }

    // 초대 사용 처리
    await update(ref(this.db, `projectInvitations/${invitation.id}`), {
      status: 'used',
      usedAt: new Date().toISOString(),
      usedBy: userId
    })

    // 외부 사용자 생성 또는 업데이트
    await this.createOrUpdateClientUser(userId, userEmail, invitation)
  }

  // 외부 사용자 생성 또는 업데이트
  private async createOrUpdateClientUser(
    userId: string, 
    email: string, 
    invitation: ProjectInvitation
  ): Promise<void> {
    // users 컬렉션에 외부 사용자로 추가
    const userRef = ref(this.db, `users/${userId}`)
    const userSnapshot = await get(userRef)

    if (!userSnapshot.exists()) {
      // users 컬렉션에 외부 사용자로 생성
      await set(userRef, {
        uid: userId,
        email,
        displayName: email.split('@')[0],
        role: 'external',
        createdAt: new Date().toISOString(),
        lastLogin: new Date().toISOString(),
        isOnline: true,
        invitationId: invitation.id
      })
    }

    // externalUsers 컬렉션 관리
    const externalUserRef = ref(this.db, `externalUsers/${userId}`)
    const snapshot = await get(externalUserRef)

    if (snapshot.exists()) {
      // 기존 사용자 업데이트
      const userData = snapshot.val()
      const projectIds = userData.projectIds || []
      if (!projectIds.includes(invitation.projectId)) {
        projectIds.push(invitation.projectId)
      }

      await update(externalUserRef, {
        projectIds,
        lastAccess: new Date().toISOString()
      })
    } else {
      // 새 사용자 생성
      await set(externalUserRef, {
        email,
        name: email.split('@')[0], // 기본 이름
        invitationId: invitation.id,
        projectIds: [invitation.projectId],
        lastAccess: new Date().toISOString(),
        createdAt: new Date().toISOString()
      })
    }
  }

  // 초대 상태 업데이트
  async updateInvitationStatus(invitationId: string, status: ProjectInvitation['status']): Promise<void> {
    await update(ref(this.db, `projectInvitations/${invitationId}`), { status })
  }

  // 초대 취소
  async revokeInvitation(invitationId: string): Promise<void> {
    await this.updateInvitationStatus(invitationId, 'revoked')
  }

  // 초대 권한 업데이트
  async updateInvitationPermissions(
    invitationId: string, 
    permissions: Partial<ProjectInvitation['permissions']>
  ): Promise<void> {
    const invitationRef = ref(this.db, `projectInvitations/${invitationId}`)
    const snapshot = await get(invitationRef)
    
    if (snapshot.exists()) {
      const currentPermissions = snapshot.val().permissions || {}
      await update(invitationRef, {
        permissions: { ...currentPermissions, ...permissions }
      })
    }
  }

  // 외부 사용자가 접근 가능한 프로젝트 목록 조회
  async getClientUserProjects(userId: string): Promise<string[]> {
    const userRef = ref(this.db, `externalUsers/${userId}`)
    const snapshot = await get(userRef)

    if (snapshot.exists()) {
      const userData = snapshot.val()
      return userData.projectIds || []
    }

    return []
  }

  // 초대 링크 URL 생성
  getInvitationUrl(inviteCode: string): string {
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'
    return `${baseUrl}/invite/${inviteCode}`
  }
}

export default new InvitationService()