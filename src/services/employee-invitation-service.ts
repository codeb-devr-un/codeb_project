import { getDatabase, ref, push, set, get, update, query, orderByChild, equalTo } from 'firebase/database'
import { app } from '@/lib/firebase'
import { EmployeeInvitation, EmployeePermissions, ROLE_PERMISSION_TEMPLATES } from '@/types/employee'

class EmployeeInvitationService {
  private db = getDatabase(app)

  /**
   * 직원 초대 생성
   */
  async createInvitation(
    organizationId: string,
    organizationName: string,
    invitedBy: string,
    inviterName: string,
    data: {
      email: string
      targetRole: EmployeeInvitation['targetRole']
      department?: string
      departmentName?: string
      position?: string
      employmentType?: EmployeeInvitation['employmentType']
      startDate?: Date
      message?: string
      customPermissions?: Partial<EmployeePermissions>
      expiresInDays?: number
    }
  ): Promise<EmployeeInvitation> {
    const inviteCode = this.generateInviteCode()
    const expiresAt = new Date()
    expiresAt.setDate(expiresAt.getDate() + (data.expiresInDays || 7))

    // 역할에 따른 기본 권한 가져오기
    const defaultPermissions = ROLE_PERMISSION_TEMPLATES[data.targetRole]
    const permissions: EmployeePermissions = {
      ...this.getDefaultPermissions(),
      ...defaultPermissions,
      ...data.customPermissions,
    }

    const invitation: Omit<EmployeeInvitation, 'id'> = {
      organizationId,
      organizationName,
      invitedBy,
      inviterName,
      inviteCode,
      email: data.email,
      targetRole: data.targetRole,
      department: data.department,
      departmentName: data.departmentName,
      position: data.position,
      permissions,
      employmentType: data.employmentType,
      startDate: data.startDate,
      message: data.message,
      expiresAt,
      status: 'pending',
      createdAt: new Date(),
      updatedAt: new Date(),
    }

    const invitationsRef = ref(this.db, 'employeeInvitations')
    const newInvitationRef = push(invitationsRef)

    await set(newInvitationRef, {
      ...invitation,
      expiresAt: expiresAt.toISOString(),
      startDate: data.startDate?.toISOString(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    })

    return {
      id: newInvitationRef.key!,
      ...invitation,
    }
  }

  /**
   * 초대 코드로 초대 정보 조회
   */
  async getInvitationByCode(inviteCode: string): Promise<EmployeeInvitation | null> {
    const invitationsRef = ref(this.db, 'employeeInvitations')
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
        startDate: invitation.startDate ? new Date(invitation.startDate) : undefined,
        createdAt: new Date(invitation.createdAt),
        updatedAt: new Date(invitation.updatedAt),
        usedAt: invitation.usedAt ? new Date(invitation.usedAt) : undefined,
      }
    }

    return null
  }

  /**
   * 조직의 모든 초대 목록 조회
   */
  async getOrganizationInvitations(organizationId: string): Promise<EmployeeInvitation[]> {
    const invitationsRef = ref(this.db, 'employeeInvitations')
    const orgQuery = query(invitationsRef, orderByChild('organizationId'), equalTo(organizationId))
    const snapshot = await get(orgQuery)

    if (!snapshot.exists()) return []

    const invitations: EmployeeInvitation[] = []
    snapshot.forEach((child) => {
      const data = child.val()
      invitations.push({
        id: child.key!,
        ...data,
        expiresAt: new Date(data.expiresAt),
        startDate: data.startDate ? new Date(data.startDate) : undefined,
        createdAt: new Date(data.createdAt),
        updatedAt: new Date(data.updatedAt),
        usedAt: data.usedAt ? new Date(data.usedAt) : undefined,
      })
    })

    return invitations.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
  }

  /**
   * 이메일로 초대 조회 (중복 체크용)
   */
  async getInvitationByEmail(email: string, organizationId: string): Promise<EmployeeInvitation | null> {
    const invitationsRef = ref(this.db, 'employeeInvitations')
    const snapshot = await get(invitationsRef)

    if (!snapshot.exists()) return null

    let foundInvitation: EmployeeInvitation | null = null
    snapshot.forEach((child) => {
      const data = child.val()
      if (data.email === email && data.organizationId === organizationId && data.status === 'pending') {
        foundInvitation = {
          id: child.key!,
          ...data,
          expiresAt: new Date(data.expiresAt),
          startDate: data.startDate ? new Date(data.startDate) : undefined,
          createdAt: new Date(data.createdAt),
          updatedAt: new Date(data.updatedAt),
        }
      }
    })

    return foundInvitation
  }

  /**
   * 초대 사용 처리
   */
  async useInvitation(inviteCode: string, userId: string, userEmail: string): Promise<EmployeeInvitation> {
    const invitation = await this.getInvitationByCode(inviteCode)

    if (!invitation) {
      throw new Error('유효하지 않은 초대 코드입니다.')
    }

    if (invitation.status !== 'pending') {
      throw new Error('이미 사용되었거나 만료된 초대입니다.')
    }

    if (invitation.email.toLowerCase() !== userEmail.toLowerCase()) {
      throw new Error('초대된 이메일 주소와 일치하지 않습니다.')
    }

    if (new Date() > invitation.expiresAt) {
      await this.updateInvitationStatus(invitation.id, 'expired')
      throw new Error('초대가 만료되었습니다.')
    }

    // 초대 사용 처리
    await update(ref(this.db, `employeeInvitations/${invitation.id}`), {
      status: 'accepted',
      usedAt: new Date().toISOString(),
      usedBy: userId,
      updatedAt: new Date().toISOString(),
    })

    // 사용자 프로필에 직원 정보 추가
    await this.createEmployeeProfile(userId, userEmail, invitation)

    return {
      ...invitation,
      status: 'accepted',
      usedAt: new Date(),
      usedBy: userId,
    }
  }

  /**
   * 직원 프로필 생성
   */
  private async createEmployeeProfile(
    userId: string,
    email: string,
    invitation: EmployeeInvitation
  ): Promise<void> {
    const userRef = ref(this.db, `users/${userId}`)
    const userSnapshot = await get(userRef)

    const employeeData = {
      uid: userId,
      email,
      displayName: email.split('@')[0],
      role: invitation.targetRole,
      organizationId: invitation.organizationId,
      department: invitation.department,
      position: invitation.position,
      employmentType: invitation.employmentType || 'full-time',
      permissions: invitation.permissions,
      isActive: true,
      isOnline: true,
      invitationId: invitation.id,
      startDate: invitation.startDate?.toISOString(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      lastLogin: new Date().toISOString(),
    }

    if (!userSnapshot.exists()) {
      // 신규 사용자 생성
      await set(userRef, employeeData)
    } else {
      // 기존 사용자 업데이트
      await update(userRef, employeeData)
    }
  }

  /**
   * 초대 상태 업데이트
   */
  async updateInvitationStatus(
    invitationId: string,
    status: EmployeeInvitation['status']
  ): Promise<void> {
    await update(ref(this.db, `employeeInvitations/${invitationId}`), {
      status,
      updatedAt: new Date().toISOString(),
    })
  }

  /**
   * 초대 취소
   */
  async revokeInvitation(invitationId: string): Promise<void> {
    await this.updateInvitationStatus(invitationId, 'revoked')
  }

  /**
   * 초대 재전송 (새 코드 생성)
   */
  async resendInvitation(invitationId: string): Promise<EmployeeInvitation> {
    const invitationRef = ref(this.db, `employeeInvitations/${invitationId}`)
    const snapshot = await get(invitationRef)

    if (!snapshot.exists()) {
      throw new Error('초대를 찾을 수 없습니다.')
    }

    const newCode = this.generateInviteCode()
    const expiresAt = new Date()
    expiresAt.setDate(expiresAt.getDate() + 7)

    await update(invitationRef, {
      inviteCode: newCode,
      expiresAt: expiresAt.toISOString(),
      status: 'pending',
      updatedAt: new Date().toISOString(),
    })

    const data = snapshot.val()
    return {
      id: invitationId,
      ...data,
      inviteCode: newCode,
      expiresAt,
      status: 'pending',
    }
  }

  /**
   * 초대 권한 업데이트
   */
  async updateInvitationPermissions(
    invitationId: string,
    permissions: Partial<EmployeePermissions>
  ): Promise<void> {
    const invitationRef = ref(this.db, `employeeInvitations/${invitationId}`)
    const snapshot = await get(invitationRef)

    if (snapshot.exists()) {
      const currentPermissions = snapshot.val().permissions || {}
      await update(invitationRef, {
        permissions: { ...currentPermissions, ...permissions },
        updatedAt: new Date().toISOString(),
      })
    }
  }

  /**
   * 초대 링크 URL 생성
   */
  getInvitationUrl(inviteCode: string): string {
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'
    return `${baseUrl}/invite/employee/${inviteCode}`
  }

  /**
   * 만료된 초대 자동 처리
   */
  async expireOldInvitations(organizationId: string): Promise<number> {
    const invitations = await this.getOrganizationInvitations(organizationId)
    const now = new Date()
    let expiredCount = 0

    for (const invitation of invitations) {
      if (invitation.status === 'pending' && now > invitation.expiresAt) {
        await this.updateInvitationStatus(invitation.id, 'expired')
        expiredCount++
      }
    }

    return expiredCount
  }

  /**
   * 초대 코드 생성 (12자리)
   */
  private generateInviteCode(): string {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
    let code = ''
    for (let i = 0; i < 12; i++) {
      code += chars.charAt(Math.floor(Math.random() * chars.length))
    }
    return code
  }

  /**
   * 기본 권한 템플릿
   */
  private getDefaultPermissions(): EmployeePermissions {
    return {
      canCreateProject: false,
      canDeleteProject: false,
      canViewAllProjects: false,
      canManageProjectMembers: false,
      canInviteMembers: false,
      canRemoveMembers: false,
      canManageRoles: false,
      canViewAllMembers: false,
      canViewFinance: false,
      canManageFinance: false,
      canApproveBudget: false,
      canManageSettings: false,
      canManageDepartments: false,
      canViewAnalytics: false,
      canExportData: false,
      canAccessAPI: false,
      canManageIntegrations: false,
    }
  }

  /**
   * 초대 통계
   */
  async getInvitationStats(organizationId: string) {
    const invitations = await this.getOrganizationInvitations(organizationId)

    return {
      total: invitations.length,
      pending: invitations.filter(i => i.status === 'pending').length,
      accepted: invitations.filter(i => i.status === 'accepted').length,
      expired: invitations.filter(i => i.status === 'expired').length,
      revoked: invitations.filter(i => i.status === 'revoked').length,
      byRole: {
        admin: invitations.filter(i => i.targetRole === 'admin').length,
        manager: invitations.filter(i => i.targetRole === 'manager').length,
        developer: invitations.filter(i => i.targetRole === 'developer').length,
        designer: invitations.filter(i => i.targetRole === 'designer').length,
        support: invitations.filter(i => i.targetRole === 'support').length,
        qa: invitations.filter(i => i.targetRole === 'qa').length,
      },
    }
  }
}

export default new EmployeeInvitationService()
