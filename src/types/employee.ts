// 직원 초대 및 관리 관련 타입 정의

export interface EmployeeInvitation {
  id: string
  organizationId: string
  organizationName: string
  invitedBy: string
  inviterName: string
  inviteCode: string
  email: string // 직원 초대는 이메일 필수

  // 역할 및 권한
  targetRole: 'admin' | 'manager' | 'developer' | 'designer' | 'support' | 'qa'
  department?: string // 부서 ID
  departmentName?: string // 부서명
  position?: string // 직책 (Senior Developer, Junior Designer 등)

  // 직원 권한
  permissions: EmployeePermissions

  // 고용 정보
  employmentType?: 'full-time' | 'part-time' | 'contractor' | 'intern'
  startDate?: Date // 입사 예정일

  // 초대 메타데이터
  message?: string // 초대 메시지
  expiresAt: Date
  usedAt?: Date
  usedBy?: string
  status: 'pending' | 'accepted' | 'expired' | 'revoked'

  // 추가 정보
  metadata?: {
    salary?: number
    level?: string // Junior, Mid, Senior, Lead
    skills?: string[]
  }

  createdAt: Date
  updatedAt: Date
}

export interface EmployeePermissions {
  // 프로젝트 권한
  canCreateProject: boolean
  canDeleteProject: boolean
  canViewAllProjects: boolean
  canManageProjectMembers: boolean

  // 팀원 관리 권한
  canInviteMembers: boolean
  canRemoveMembers: boolean
  canManageRoles: boolean
  canViewAllMembers: boolean

  // 재무 권한
  canViewFinance: boolean
  canManageFinance: boolean
  canApproveBudget: boolean

  // 시스템 설정 권한
  canManageSettings: boolean
  canManageDepartments: boolean
  canViewAnalytics: boolean
  canExportData: boolean

  // 기타 권한
  canAccessAPI: boolean
  canManageIntegrations: boolean
}

// 직원 프로필 확장
export interface EmployeeProfile {
  userId: string
  organizationId: string

  // 기본 정보
  email: string
  displayName: string
  avatar?: string
  phoneNumber?: string

  // 고용 정보
  employeeId?: string // 사번
  role: EmployeeInvitation['targetRole']
  department?: string
  departmentName?: string
  position?: string
  employmentType: EmployeeInvitation['employmentType']

  // 날짜 정보
  startDate?: Date // 입사일
  endDate?: Date // 퇴사일 (비활성화된 경우)
  probationEndDate?: Date // 수습 종료일

  // 업무 정보
  skills: string[]
  bio?: string
  timezone?: string
  workingHours?: {
    start: string // "09:00"
    end: string // "18:00"
  }

  // 프로젝트 배정
  assignedProjects: string[]
  currentWorkload: number // 0-100 (업무 할당률)

  // 권한
  permissions: EmployeePermissions

  // 상태
  isActive: boolean
  isOnline: boolean
  lastLogin?: Date
  lastActivity?: Date

  // 성과 정보 (optional)
  performance?: {
    completedTasks: number
    onTimeDelivery: number // 퍼센티지
    rating?: number // 1-5
  }

  createdAt: Date
  updatedAt: Date
}

// 직원 활동 로그
export interface EmployeeActivity {
  id: string
  employeeId: string
  organizationId: string
  type: 'login' | 'logout' | 'project_joined' | 'task_completed' | 'file_uploaded' | 'comment_added'
  projectId?: string
  taskId?: string
  description: string
  metadata?: Record<string, any>
  ipAddress?: string
  userAgent?: string
  timestamp: Date
}

// 직원 통계
export interface EmployeeStats {
  totalProjects: number
  activeProjects: number
  completedTasks: number
  pendingTasks: number
  totalWorkHours?: number
  currentWorkload: number
  performanceScore?: number
}

// 직원 필터 옵션
export interface EmployeeFilter {
  department?: string[]
  role?: EmployeeInvitation['targetRole'][]
  employmentType?: EmployeeInvitation['employmentType'][]
  isActive?: boolean
  search?: string // 이름, 이메일 검색
}

// 직원 정렬 옵션
export type EmployeeSortOption =
  | 'name_asc'
  | 'name_desc'
  | 'start_date_asc'
  | 'start_date_desc'
  | 'department_asc'
  | 'role_asc'

// 역할별 기본 권한 템플릿
export const ROLE_PERMISSION_TEMPLATES: Record<EmployeeInvitation['targetRole'], Partial<EmployeePermissions>> = {
  admin: {
    canCreateProject: true,
    canDeleteProject: true,
    canViewAllProjects: true,
    canManageProjectMembers: true,
    canInviteMembers: true,
    canRemoveMembers: true,
    canManageRoles: true,
    canViewAllMembers: true,
    canViewFinance: true,
    canManageFinance: true,
    canApproveBudget: true,
    canManageSettings: true,
    canManageDepartments: true,
    canViewAnalytics: true,
    canExportData: true,
    canAccessAPI: true,
    canManageIntegrations: true,
  },
  manager: {
    canCreateProject: true,
    canDeleteProject: false,
    canViewAllProjects: true,
    canManageProjectMembers: true,
    canInviteMembers: true,
    canRemoveMembers: false,
    canManageRoles: false,
    canViewAllMembers: true,
    canViewFinance: true,
    canManageFinance: false,
    canApproveBudget: true,
    canManageSettings: false,
    canManageDepartments: false,
    canViewAnalytics: true,
    canExportData: true,
    canAccessAPI: false,
    canManageIntegrations: false,
  },
  developer: {
    canCreateProject: false,
    canDeleteProject: false,
    canViewAllProjects: false,
    canManageProjectMembers: false,
    canInviteMembers: false,
    canRemoveMembers: false,
    canManageRoles: false,
    canViewAllMembers: true,
    canViewFinance: false,
    canManageFinance: false,
    canApproveBudget: false,
    canManageSettings: false,
    canManageDepartments: false,
    canViewAnalytics: false,
    canExportData: false,
    canAccessAPI: true,
    canManageIntegrations: false,
  },
  designer: {
    canCreateProject: false,
    canDeleteProject: false,
    canViewAllProjects: false,
    canManageProjectMembers: false,
    canInviteMembers: false,
    canRemoveMembers: false,
    canManageRoles: false,
    canViewAllMembers: true,
    canViewFinance: false,
    canManageFinance: false,
    canApproveBudget: false,
    canManageSettings: false,
    canManageDepartments: false,
    canViewAnalytics: false,
    canExportData: false,
    canAccessAPI: false,
    canManageIntegrations: false,
  },
  support: {
    canCreateProject: false,
    canDeleteProject: false,
    canViewAllProjects: true,
    canManageProjectMembers: false,
    canInviteMembers: false,
    canRemoveMembers: false,
    canManageRoles: false,
    canViewAllMembers: true,
    canViewFinance: false,
    canManageFinance: false,
    canApproveBudget: false,
    canManageSettings: false,
    canManageDepartments: false,
    canViewAnalytics: false,
    canExportData: false,
    canAccessAPI: false,
    canManageIntegrations: false,
  },
  qa: {
    canCreateProject: false,
    canDeleteProject: false,
    canViewAllProjects: true,
    canManageProjectMembers: false,
    canInviteMembers: false,
    canRemoveMembers: false,
    canManageRoles: false,
    canViewAllMembers: true,
    canViewFinance: false,
    canManageFinance: false,
    canApproveBudget: false,
    canManageSettings: false,
    canManageDepartments: false,
    canViewAnalytics: false,
    canExportData: false,
    canAccessAPI: false,
    canManageIntegrations: false,
  },
}
