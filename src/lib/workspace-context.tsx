'use client'
// =============================================================================
// Workspace Context - CVE-CB-005 Fixed: Development-only Logging
// =============================================================================

import { createContext, useContext, useEffect, useState, ReactNode } from 'react'
import { useRouter } from 'next/navigation'
import toast from 'react-hot-toast'
import { getWorkspaces, getWorkspaceFeatures } from '@/actions/workspace'

const isDev = process.env.NODE_ENV === 'development'

interface WorkspaceFeatures {
    id: string
    workspaceId: string
    // 프로젝트 관리 기능
    projectEnabled: boolean
    kanbanEnabled: boolean
    ganttEnabled: boolean
    mindmapEnabled: boolean
    filesEnabled: boolean
    // HR 기능
    attendanceEnabled: boolean
    employeeEnabled: boolean
    payrollEnabled: boolean
    payslipEnabled: boolean
    leaveEnabled: boolean
    hrEnabled: boolean
    organizationEnabled: boolean
    // 재무 기능
    financeEnabled: boolean
    expenseEnabled: boolean
    invoiceEnabled: boolean
    corporateCardEnabled: boolean
    // 고급 기능
    resumeParsingEnabled: boolean
    approvalEnabled: boolean
    marketingEnabled: boolean
    automationEnabled: boolean
    logsEnabled: boolean
    // 그룹웨어 기능
    announcementEnabled: boolean
    boardEnabled: boolean
    calendarEnabled: boolean
    messageEnabled: boolean
    chatEnabled: boolean
}

interface Workspace {
    id: string
    name: string
    domain: string | null
    plan: string
    type?: 'ENTERPRISE' | 'HR_ONLY' | 'PROJECT_ONLY'
    features?: WorkspaceFeatures | null
    userRole?: 'admin' | 'member' // 현재 사용자의 워크스페이스 내 역할
}

interface WorkspaceContextType {
    currentWorkspace: Workspace | null
    workspaces: Workspace[]
    loading: boolean
    features: WorkspaceFeatures | null
    currentRole: 'admin' | 'member' // 현재 워크스페이스에서의 역할
    isAdmin: boolean // 관리자 여부 헬퍼
    switchWorkspace: (workspaceId: string) => Promise<void>
    createWorkspace: (name: string, domain: string) => Promise<Workspace>
    refreshWorkspaces: () => Promise<void>
    isFeatureEnabled: (featureKey: keyof WorkspaceFeatures) => boolean
}

const WorkspaceContext = createContext<WorkspaceContextType | null>(null)

export function WorkspaceProvider({ children }: { children: ReactNode }) {
    const [currentWorkspace, setCurrentWorkspace] = useState<Workspace | null>(null)
    const [workspaces, setWorkspaces] = useState<Workspace[]>([])
    const [features, setFeatures] = useState<WorkspaceFeatures | null>(null)
    const [loading, setLoading] = useState(true)
    const router = useRouter()

    useEffect(() => {
        loadWorkspaces()
    }, [])

    // features 로드 - currentWorkspace 변경 시
    useEffect(() => {
        if (currentWorkspace?.id) {
            loadFeatures(currentWorkspace.id)
        }
    }, [currentWorkspace?.id])

    const loadFeatures = async (workspaceId: string) => {
        try {
            if (isDev) console.log('[DEV] Loading features for workspace:', workspaceId)
            const data = await getWorkspaceFeatures(workspaceId)

            if (data) {
                if (isDev) {
                    console.log('[DEV] Features loaded:', data)
                    console.log('[DEV] projectEnabled:', data.projectEnabled)
                    console.log('[DEV] hrEnabled:', data.hrEnabled)
                }
                setFeatures(data as WorkspaceFeatures)
            } else {
                // features가 없으면 기본값 (모두 활성화)
                if (isDev) console.log('[DEV] No features found, using defaults')
                setFeatures(null)
            }
        } catch {
            // CVE-CB-005: Silent fail for feature loading
            if (isDev) console.log('[DEV] Failed to load features')
            setFeatures(null)
        }
    }

    const isFeatureEnabled = (featureKey: keyof WorkspaceFeatures): boolean => {
        // features가 없으면 기본적으로 모두 활성화
        if (!features) return true
        // id, workspaceId 등 boolean이 아닌 필드는 true 반환
        if (featureKey === 'id' || featureKey === 'workspaceId') return true
        return features[featureKey] as boolean
    }

    const loadWorkspaces = async () => {
        try {
            if (isDev) console.log('[DEV] Loading workspaces...')
            const data = await getWorkspaces()

            if (isDev) console.log('[DEV] Loaded workspaces:', data.length)

            // Type assertion needed because Prisma types might slightly differ from interface
            setWorkspaces(data as unknown as Workspace[])

            // 저장된 워크스페이스 ID 가져오기
            const savedWorkspaceId = localStorage.getItem('currentWorkspaceId')
            if (isDev) console.log('[DEV] Saved workspace ID:', savedWorkspaceId)

            if (savedWorkspaceId && data.find((w: any) => w.id === savedWorkspaceId)) {
                // 저장된 워크스페이스가 있으면 사용
                const workspace = data.find((w: any) => w.id === savedWorkspaceId)
                if (isDev) console.log('[DEV] Using saved workspace')
                setCurrentWorkspace(workspace as unknown as Workspace)
            } else if (data.length > 0) {
                // 없으면 첫 번째 워크스페이스 사용
                if (isDev) console.log('[DEV] Using first workspace')
                setCurrentWorkspace(data[0] as unknown as Workspace)
                localStorage.setItem('currentWorkspaceId', data[0].id)
            } else {
                // 워크스페이스가 하나도 없으면 생성 페이지로
                if (isDev) console.log('[DEV] No workspaces found, redirecting')
                router.push('/workspace/create')
            }
        } catch (error) {
            // CVE-CB-005: Silent fail for workspace loading
            if (isDev) console.log('[DEV] Failed to load workspaces', error)
            toast.error('워크스페이스를 불러오는데 실패했습니다')
        } finally {
            if (isDev) console.log('[DEV] Loading complete')
            setLoading(false)
        }
    }

    const switchWorkspace = async (workspaceId: string) => {
        const workspace = workspaces.find(w => w.id === workspaceId)
        if (!workspace) {
            toast.error('워크스페이스를 찾을 수 없습니다')
            return
        }

        setCurrentWorkspace(workspace)
        localStorage.setItem('currentWorkspaceId', workspaceId)
        toast.success(`${workspace.name}(으)로 전환했습니다`)

        // 페이지 새로고침하여 데이터 갱신
        router.refresh()
    }

    const createWorkspace = async (name: string, domain: string): Promise<Workspace> => {
        try {
            const response = await fetch('/api/workspaces', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name, domain }),
            })

            if (!response.ok) throw new Error('Failed to create workspace')

            const workspace = await response.json()
            setWorkspaces([...workspaces, workspace])
            setCurrentWorkspace(workspace)
            localStorage.setItem('currentWorkspaceId', workspace.id)

            toast.success('워크스페이스가 생성되었습니다')
            return workspace
        } catch (error) {
            // CVE-CB-005: Development-only error logging
            if (isDev) console.log('[DEV] Failed to create workspace')
            toast.error('워크스페이스 생성에 실패했습니다')
            throw error
        }
    }

    const refreshWorkspaces = async () => {
        await loadWorkspaces()
    }

    // 현재 워크스페이스에서의 역할
    const currentRole = currentWorkspace?.userRole || 'member'
    const isAdmin = currentRole === 'admin'

    const value = {
        currentWorkspace,
        workspaces,
        loading,
        features,
        currentRole,
        isAdmin,
        switchWorkspace,
        createWorkspace,
        refreshWorkspaces,
        isFeatureEnabled,
    }

    return (
        <WorkspaceContext.Provider value={value}>
            {children}
        </WorkspaceContext.Provider>
    )
}

export function useWorkspace() {
    const context = useContext(WorkspaceContext)
    if (!context) {
        throw new Error('useWorkspace must be used within a WorkspaceProvider')
    }
    return context
}

export type { Workspace, WorkspaceFeatures }
