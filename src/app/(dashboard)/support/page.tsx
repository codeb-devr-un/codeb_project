'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/lib/auth-context'
import ChatWindow from '@/components/chat/ChatWindow'
import { database, app } from '@/lib/firebase'
import { ref, get, set, onValue, push, off } from 'firebase/database'
import { getDatabase } from 'firebase/database'
import chatAssignment from '@/lib/chat-assignment'
import { Project } from '@/types'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Label } from '@/components/ui/label'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { 
  MessageCircle, Clock, Users, Phone, X, Loader2,
  Building2, HeadphonesIcon, MessageSquare
} from 'lucide-react'

interface AssignedOperator {
  uid: string
  name: string
  email: string
  status: 'online' | 'offline'
}

export default function CustomerSupportPage() {
  const { user, userProfile } = useAuth()
  const router = useRouter()
  const [assignedOperator, setAssignedOperator] = useState<AssignedOperator | null>(null)
  const [isRequesting, setIsRequesting] = useState(false)
  const [requestStatus, setRequestStatus] = useState<'none' | 'waiting' | 'connected'>('none')
  const [projects, setProjects] = useState<Project[]>([])
  const [selectedProject, setSelectedProject] = useState<Project | null>(null)
  const [loading, setLoading] = useState(true)

  // 고객이 아닌 경우 대시보드로 리다이렉트
  useEffect(() => {
    if (!loading && userProfile && userProfile.role !== 'customer') {
      router.push('/dashboard')
    }
  }, [userProfile, loading, router])

  // Firebase에서 프로젝트 데이터 로드
  useEffect(() => {
    if (!user || !userProfile) return

    const db = getDatabase(app)
    const projectsRef = ref(db, 'projects')
    
    const unsubscribe = onValue(projectsRef, (snapshot) => {
      const data = snapshot.val()
      if (data) {
        const projectsList = Object.entries(data).map(([id, project]: [string, any]) => ({
          ...project,
          id,
          startDate: new Date(project.startDate),
          endDate: new Date(project.endDate),
          createdAt: new Date(project.createdAt),
          updatedAt: new Date(project.updatedAt)
        }))
        
        // 고객은 자신의 프로젝트 또는 같은 그룹의 프로젝트를 볼 수 있음
        let filteredProjects = projectsList
        if (userProfile.role === 'customer') {
          filteredProjects = projectsList.filter(p => 
            p.clientId === user.uid ||
            (userProfile.group && p.clientGroup === userProfile.group)
          )
        }
        
        setProjects(filteredProjects)
        if (filteredProjects.length > 0 && !selectedProject) {
          setSelectedProject(filteredProjects[0])
        }
      } else {
        setProjects([])
      }
      setLoading(false)
    })

    return () => off(projectsRef)
  }, [user, userProfile])

  useEffect(() => {
    if (!user) return

    // 기존 배정된 운영자 확인
    checkAssignedOperator()

    // 실시간으로 배정 상태 모니터링
    const assignmentRef = ref(database, `customerAssignments/${user.uid}`)
    const unsubscribe = onValue(assignmentRef, (snapshot) => {
      console.log('Assignment snapshot:', snapshot.exists(), snapshot.val())
      if (snapshot.exists()) {
        const assignment = snapshot.val()
        console.log('Realtime assignment update:', assignment)
        if (assignment.operatorId && assignment.status === 'active') {
          console.log('Loading operator info for:', assignment.operatorId)
          // 운영자 정보 가져오기
          loadOperatorInfo(assignment.operatorId)
          setRequestStatus('connected')
        } else if (assignment.status === 'completed') {
          // 상담이 종료됨
          console.log('Chat has been ended by operator')
          setRequestStatus('none')
          setAssignedOperator(null)
        }
      } else {
        // 할당이 삭제됨 (종료)
        console.log('Assignment removed - chat ended')
        setRequestStatus('none')
        setAssignedOperator(null)
      }
    })

    return () => unsubscribe()
  }, [user])

  const checkAssignedOperator = async () => {
    if (!user) return

    // 두 테이블 모두 확인
    const assignment = await chatAssignment.getAssignmentForCustomer(user.uid)
    console.log('Checking assignment from chatAssignments:', assignment)
    
    if (assignment) {
      console.log('Assignment details:', {
        status: assignment.status,
        operatorId: assignment.operatorId,
        operatorName: assignment.operatorName
      })
    }
    
    if (assignment && assignment.status === 'active' && assignment.operatorId) {
      await loadOperatorInfo(assignment.operatorId)
      setRequestStatus('connected')
      return
    }
    
    // customerAssignments에서도 확인
    const operator = await chatAssignment.getAssignedOperator(user.uid)
    console.log('Checking assigned operator from customerAssignments:', operator)
    if (operator) {
      setAssignedOperator({
        uid: operator.uid,
        name: operator.name || operator.displayName || operator.email,
        email: operator.email,
        status: operator.isOnline ? 'online' : 'offline'
      })
      setRequestStatus('connected')
    }
  }

  const loadOperatorInfo = async (operatorId: string) => {
    console.log('loadOperatorInfo called with:', operatorId)
    try {
      // 먼저 operators 테이블에서 찾기
      const operatorRef = ref(database, `operators/${operatorId}`)
      const operatorSnapshot = await get(operatorRef)
      
      if (operatorSnapshot.exists()) {
        const data = operatorSnapshot.val()
        setAssignedOperator({
          uid: operatorId,
          name: data.name || data.displayName || data.email || '운영자',
          email: data.email || '',
          status: data.isOnline ? 'online' : 'offline'
        })
        return
      }
      
      // operators에 없으면 users 테이블에서 찾기
      const userRef = ref(database, `users/${operatorId}`)
      const userSnapshot = await get(userRef)
      
      if (userSnapshot.exists()) {
        const userData = userSnapshot.val()
        setAssignedOperator({
          uid: operatorId,
          name: userData.displayName || userData.email || '운영자',
          email: userData.email || '',
          status: userData.isOnline ? 'online' : 'offline'
        })
      }
    } catch (error) {
      console.error('Error loading operator info:', error)
    }
  }

  const requestChat = async () => {
    if (!user || !userProfile) return

    setIsRequesting(true)
    try {
      // 상담 요청 생성 (프로젝트 정보 포함)
      const requestRef = ref(database, 'chatRequests')
      await push(requestRef, {
        customerId: user.uid,
        customerName: userProfile.displayName,
        customerEmail: userProfile.email,
        projectId: selectedProject?.id || null,
        projectName: selectedProject?.name || '프로젝트 미선택',
        message: selectedProject 
          ? `[${selectedProject.name}] 프로젝트 관련 상담 요청`
          : '상담 요청',
        createdAt: new Date().toISOString(),
        status: 'waiting'
      })

      // 자동 배정 시도
      console.log('Attempting auto assignment for:', user.uid)
      const assigned = await chatAssignment.autoAssignOperatorToCustomer(user.uid)
      console.log('Auto assignment result:', assigned)
      if (assigned) {
        setRequestStatus('connected')
        // 배정된 운영자 정보 바로 가져오기
        checkAssignedOperator()
      } else {
        setRequestStatus('waiting')
      }
    } catch (error) {
      console.error('상담 요청 실패:', error)
      alert('상담 요청에 실패했습니다. 잠시 후 다시 시도해주세요.')
    } finally {
      setIsRequesting(false)
    }
  }

  if (!user || !userProfile) {
    return (
      <div className="flex items-center justify-center h-96">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6">
            <div className="text-center">
              <MessageCircle className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
              <p className="text-muted-foreground">로그인이 필요합니다.</p>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin text-primary mx-auto" />
          <p className="mt-4 text-muted-foreground">로딩 중...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="w-full max-w-[1920px] mx-auto px-6 py-6 space-y-6">
      {/* 헤더 */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">실시간 상담</h1>
        <p className="text-muted-foreground mt-1">전문 상담원과 실시간으로 대화하세요</p>
      </div>

      {/* 프로젝트 선택 */}
      {projects.length > 0 && requestStatus === 'none' && (
        <Card>
          <CardContent className="p-4">
            <Label htmlFor="project-select">상담할 프로젝트 선택</Label>
            <Select
              value={selectedProject?.id || ''}
              onValueChange={(value) => {
                const project = projects.find(p => p.id === value)
                if (project) setSelectedProject(project)
              }}
            >
              <SelectTrigger id="project-select" className="mt-2">
                <SelectValue placeholder="프로젝트를 선택하세요" />
              </SelectTrigger>
              <SelectContent>
                {projects.map(project => (
                  <SelectItem key={project.id} value={project.id}>
                    {project.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </CardContent>
        </Card>
      )}

      <Card className="min-h-[600px]">
        <CardContent className="p-0 h-full">
          {requestStatus === 'none' && (
            <div className="flex flex-col items-center justify-center h-full p-12">
              <div className="text-center max-w-md">
                <div className="w-24 h-24 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-6">
                  <HeadphonesIcon className="w-12 h-12 text-primary" />
                </div>
                
                <h2 className="text-2xl font-semibold mb-4">상담을 시작하세요</h2>
                
                {selectedProject && (
                  <Card className="mb-6 border-primary/20">
                    <CardContent className="p-3">
                      <div className="flex items-center gap-2">
                        <Building2 className="h-4 w-4 text-primary" />
                        <p className="text-sm font-medium">{selectedProject.name}</p>
                      </div>
                      <p className="text-xs text-muted-foreground mt-1">프로젝트 관련 문의</p>
                    </CardContent>
                  </Card>
                )}
                
                <p className="text-muted-foreground mb-8">
                  궁금한 사항이 있으신가요?<br />
                  전문 상담원이 실시간으로 답변해드립니다.
                </p>
                
                <Button
                  onClick={requestChat}
                  disabled={isRequesting}
                  size="lg"
                  className="mb-8"
                >
                  {isRequesting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      요청 중...
                    </>
                  ) : (
                    <>
                      <MessageSquare className="mr-2 h-4 w-4" />
                      상담 시작하기
                    </>
                  )}
                </Button>
                
                <div className="flex items-center gap-4 text-sm text-muted-foreground justify-center">
                  <div className="flex items-center gap-1">
                    <Clock className="h-4 w-4" />
                    <span>평일 09:00 - 18:00</span>
                  </div>
                  <span>•</span>
                  <span>주말 및 공휴일 휴무</span>
                </div>
              </div>
            </div>
          )}

          {requestStatus === 'waiting' && (
            <div className="flex flex-col items-center justify-center h-full p-12">
              <div className="text-center">
                <Loader2 className="h-16 w-16 animate-spin text-primary mx-auto mb-6" />
                <h3 className="text-xl font-semibold mb-2">상담원 연결 중...</h3>
                <p className="text-muted-foreground">
                  잠시만 기다려주세요.<br />
                  곧 상담원이 연결됩니다.
                </p>
                {selectedProject && (
                  <Badge variant="outline" className="mt-4">
                    <Building2 className="h-3 w-3 mr-1" />
                    {selectedProject.name}
                  </Badge>
                )}
              </div>
            </div>
          )}

          {requestStatus === 'connected' && assignedOperator ? (
            <div className="h-[600px] flex flex-col">
              <div className="border-b px-6 py-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <Avatar>
                      <AvatarFallback className="bg-primary text-primary-foreground">
                        {(assignedOperator.name || assignedOperator.email || 'O').charAt(0).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <h3 className="font-medium">{assignedOperator.name || assignedOperator.email || '운영자'}</h3>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Badge variant={assignedOperator.status === 'online' ? 'default' : 'secondary'} className="h-5">
                          {assignedOperator.status === 'online' ? '온라인' : '오프라인'}
                        </Badge>
                        {selectedProject && (
                          <span className="flex items-center gap-1">
                            <Building2 className="h-3 w-3" />
                            {selectedProject.name}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      if (confirm('상담을 종료하시겠습니까?')) {
                        chatAssignment.endChat(user.uid, assignedOperator.uid)
                        setRequestStatus('none')
                        setAssignedOperator(null)
                      }
                    }}
                    className="text-destructive hover:text-destructive"
                  >
                    <X className="h-4 w-4 mr-2" />
                    상담 종료
                  </Button>
                </div>
              </div>
              
              <div className="flex-1 bg-muted/30">
                <ChatWindow
                  receiverId={assignedOperator.uid}
                  receiverName={assignedOperator.name || assignedOperator.email || '운영자'}
                />
              </div>
            </div>
          ) : requestStatus === 'connected' && !assignedOperator ? (
            <div className="flex items-center justify-center h-full p-12">
              <div className="text-center">
                <Loader2 className="h-16 w-16 animate-spin text-primary mx-auto mb-4" />
                <p className="text-muted-foreground">운영자 정보를 불러오고 있습니다...</p>
              </div>
            </div>
          ) : null}
        </CardContent>
      </Card>
    </div>
  )
}