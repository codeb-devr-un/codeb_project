// 조직 및 부서 관련 타입 정의

export interface Organization {
  id: string
  name: string // 회사/조직명
  domain: string // 이메일 도메인 (예: codeb.com)
  logo?: string // 로고 URL
  description?: string
  plan: 'free' | 'startup' | 'business' | 'enterprise'
  settings: OrganizationSettings
  billingInfo?: BillingInfo
  departments: Department[]
  memberCount: number
  projectCount: number
  createdBy: string
  createdAt: Date
  updatedAt: Date
}

export interface OrganizationSettings {
  allowedEmailDomains: string[] // 자동 승인 이메일 도메인
  requireAdminApproval: boolean // 신규 직원 가입 시 관리자 승인 필요
  allowInviteLinks: boolean // 초대 링크 사용 허용
  maxMembers: number // 최대 멤버 수
  maxProjects: number // 최대 프로젝트 수
  enableDepartments: boolean // 부서 기능 활성화
  enableTimeTracking: boolean // 시간 추적 활성화
  enableBudgetManagement: boolean // 예산 관리 활성화
}

export interface BillingInfo {
  plan: Organization['plan']
  billingCycle: 'monthly' | 'yearly'
  nextBillingDate?: Date
  paymentMethod?: 'card' | 'bank' | 'invoice'
  billingEmail?: string
}

export interface Department {
  id: string
  organizationId: string
  name: string // 부서명 (개발팀, 디자인팀, 기획팀 등)
  description?: string
  managerId?: string // 부서장 사용자 ID
  managerName?: string // 부서장 이름
  parentDepartmentId?: string // 상위 부서 (조직도 계층)
  memberIds: string[] // 부서원 ID 목록
  memberCount: number
  budget?: number // 부서 예산
  color?: string // UI 표시용 색상
  order: number // 정렬 순서
  isActive: boolean
  createdAt: Date
  updatedAt: Date
}

export interface DepartmentMember {
  userId: string
  departmentId: string
  position?: string // 직책 (팀장, 시니어, 주니어 등)
  joinedAt: Date
  isActive: boolean
}

// 조직 초대 설정
export interface OrganizationInviteSettings {
  allowPublicInvites: boolean // 공개 초대 링크 허용
  defaultRole: 'developer' | 'designer' | 'manager' // 기본 역할
  autoApprove: boolean // 자동 승인
  inviteExpirationDays: number // 초대 만료 기간
}

// 조직 통계
export interface OrganizationStats {
  totalMembers: number
  activeMembers: number
  totalProjects: number
  activeProjects: number
  completedProjects: number
  totalTasks: number
  completedTasks: number
  departments: {
    id: string
    name: string
    memberCount: number
    activeProjects: number
  }[]
}

// 조직 활동 로그
export interface OrganizationActivity {
  id: string
  organizationId: string
  type: 'member_joined' | 'member_left' | 'department_created' | 'project_created' | 'settings_changed'
  userId: string
  userName: string
  description: string
  metadata?: Record<string, any>
  createdAt: Date
}
