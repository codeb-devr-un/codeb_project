'use client'

import React, { useState, useEffect, useRef } from 'react'
import ChatWindow from '@/components/chat/ChatWindow'
import { useAuth } from '@/lib/auth-context'
import chatAssignmentService, { 
  ChatAssignment, 
  ChatRequest, 
  OperatorStatus 
} from '@/lib/chat-assignment'
import { ref, set, onValue } from 'firebase/database'
import { database } from '@/lib/firebase'
import toast, { Toaster } from 'react-hot-toast'

export default function MultiChatPage() {
  const { user, userProfile } = useAuth()
  const [assignments, setAssignments] = useState<ChatAssignment[]>([])
  const [pendingRequests, setPendingRequests] = useState<ChatRequest[]>([])
  const [selectedAssignment, setSelectedAssignment] = useState<ChatAssignment | null>(null)
  const [operatorStatus, setOperatorStatus] = useState<OperatorStatus | null>(null)
  const [showRequests, setShowRequests] = useState(false)
  const audioRef = useRef<HTMLAudioElement | null>(null)
  const isFirstLoad = useRef(true)

  useEffect(() => {
    if (!user || !userProfile) return

    // 운영자 상태 초기화
    const initOperatorStatus = async () => {
      const status: OperatorStatus = {
        id: user.uid,
        name: userProfile.displayName || user.email || 'Operator',
        isOnline: true,
        isAvailable: true,
        activeChats: 0,
        maxChats: 5
      }
      
      // operators 테이블에 전체 정보 저장
      const operatorData = {
        ...status,
        email: user.email || userProfile.email,
        displayName: userProfile.displayName || user.email || 'Operator',
        role: userProfile.role || 'operator'
      }
      console.log('Saving operator status:', operatorData)
      await set(ref(database, `operators/${user.uid}`), operatorData)
      
      setOperatorStatus(status)
    }

    initOperatorStatus()

    // 할당된 고객 목록 가져오기
    const loadAssignments = async () => {
      const customerAssignments = await chatAssignmentService.getCustomersForOperator(user.uid)
      setAssignments(customerAssignments)
      
      // 활성 채팅 수 업데이트
      setOperatorStatus(prev => prev ? { ...prev, activeChats: customerAssignments.length } : null)
    }

    loadAssignments()
    
    // 할당 상태 실시간 모니터링
    const monitorAssignments = () => {
      const assignmentsRef = ref(database, 'chatAssignments')
      return onValue(assignmentsRef, (snapshot) => {
        if (snapshot.exists()) {
          const allAssignments = snapshot.val()
          const myAssignments: ChatAssignment[] = []
          
          Object.entries(allAssignments).forEach(([id, assignment]: [string, any]) => {
            if (assignment.operatorId === user.uid && assignment.status === 'active') {
              myAssignments.push({ ...assignment, id })
            }
          })
          
          setAssignments(myAssignments)
          setOperatorStatus(prev => prev ? { ...prev, activeChats: myAssignments.length } : null)
          
          // 선택된 할당이 종료되었는지 확인
          if (selectedAssignment && !myAssignments.find(a => a.id === selectedAssignment.id)) {
            setSelectedAssignment(null)
            toast('상담이 종료되었습니다.', { icon: 'ℹ️' })
          }
        }
      })
    }
    
    const unsubscribeAssignments = monitorAssignments()

    // 알림음 초기화 - 간단한 비프음
    const audioData = 'data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEARKwAAIhYAQACABAAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhBSuBzvLZiTcIG2m98OScTgwOUarm7blmFgU7k9n1yHMlBSeDzvTWgjEEFWq+8+OWTAsOUqzn77ViFAg5k9n1yHQnBiiCzPLbiTUHGWi78OScTgwOUqzl77RmGAU7k9n1x3MlBSh+zPDeiTYIGGq+8eCcUAoLTqjj77ZpGAU7k9f1yHQnBSh+zPDeiTYIGGq+8eCcUAoLTqjj77VpGAU7k9f1yHQnBSh+zPDeiTYIGGq+8eCcUAoLTqjj77VpGAU7k9f1yHQnBSh+zPDeiTYIGGq+8eCcUAoLTqjj77VpGAU7k9f1yHQnBSh9y/HeiTYIGGq+8eCcUAoLTqjj77VpGAU7k9f1yHQnBSh9y/HeiTYIGGq+8eCcUAoLTqjj77VpGAU7k9f1yHQnBSh9y/HeiTYIGGq+8eCcUAoLTqjj77VpGAU7k9f1yHQoBiiEzPDbiTcIGGq+8eCcTgwLTqjj77VpGAU7k9f1yHQoBiiEzPDbiTcIGGq+8eCcTgwLTqjj77VpGAU7k9f1yHQoBiiEzPDbiTcIGGq+8eCcTgwLTqjj77VpGAU7k9n1yHQoBiiEzPDbiTcIGGq+8eCcTgwLTqjj77VpGAU7k9n1yHQoBiiEzPDbiTcIGGq+8eCcTgwLTqjj77VpGAU7k9n1yHQoBiiEzPDbiTcIGGq+8eCcTgwLTqjj77VpGAU7k9n1yHQoBiiEzPDbiTcIGGq+8eCcTgwLTqjj77VpHAU7k9n1yHQoBiiEzPDbiTcIGGq+8eCcTgwLTqjj77VpHAU7k9n1yHQoBiiEzPDbiTcIGGq+8eCcTgwLTqjj77VpHAU7k9n1yHQoBiiEzPDbiTcIGGq+8eCcTgwLTqjj77VpHAU7k9n1yHQoBiiEzPDbiTcIGGq+8eCcTgwLTqjj77VpHAU7k9n1yHQoBiiEzPDbiTcIGGq+8eCcTgwLTqjj77VpHAU7k9n1yHQoBiiEzPDbiTcIGGq+8eCcTgwLTqjj77VpHAU7k9n1yHQoBiiEzPDbiTcIGGq+8eCcTgwLTqjj77VpHAU7k9n1yHQoBiiEzPDbiTcIGGq+8eCcTgwLTqjj77VpHAU7k9n1yHQoBiiEzPDbiTcIGGq+8eCcTgwLTqjj77VpHAU7k9n1yHQoBiiEzPDbiTcIGGq+8eGcTgwLTqjj77ZpHAU7k9n1yHQoBiiEzPDbiTcIGGq+8eGcTgwLTqjj77ZpHAU7k9n1yHQoBiiEzPDbiTcIGGq+8eGcTgwLTqjj77ZpHAU7k9n1yHQoBiiEzPDbiTcIGGq+8eGcTgwLTqjj77ZpHAU7k9n1yHQoBiiEzPDbiTcIGGq+8eGcTgwLTqjj77ZpHAU7k9n1yHQoBiiEzPDbiTcIGGq+8eGcTgwLTqjj77ZpHAU7k9n1yHQoBiiEzPDbiTcIGGq+8eGcTgwLTqjj77ZpHAU7k9n1yHQoBiiEzPDbiTcIGGq+8eGcTgwLTqjj77Zp'
    audioRef.current = new Audio(audioData)
    
    // 대기 중인 요청 구독
    const unsubscribeRequests = chatAssignmentService.subscribeToPendingRequests(
      (requests) => {
        console.log('Pending requests updated:', requests)
        
        // 초기 로드가 아니고 새 요청이 있으면 알림
        if (!isFirstLoad.current && requests.length > pendingRequests.length) {
          const newRequest = requests.find(r => !pendingRequests.some(pr => pr.id === r.id))
          if (newRequest) {
            console.log('새로운 상담 요청 발견:', newRequest)
            
            // 토스트 알림 표시
            toast.success(`새로운 상담 요청: ${newRequest.customerName}`, {
              duration: 5000,
              icon: '🔔',
              style: {
                background: '#4F46E5',
                color: '#fff',
              },
            })
            
            // 알림음 재생
            if (audioRef.current) {
              audioRef.current.volume = 0.5 // 볼륨 조절
              const playPromise = audioRef.current.play()
              if (playPromise !== undefined) {
                playPromise
                  .then(() => console.log('알림음 재생 성공'))
                  .catch(err => {
                    console.log('알림음 재생 실패:', err)
                    // 사용자 상호작용 후 다시 시도
                    document.addEventListener('click', () => {
                      audioRef.current?.play().catch(e => console.log('클릭 후 재생 실패:', e))
                    }, { once: true })
                  })
              }
            } else {
              console.log('audioRef.current가 없습니다')
            }
            
            // 브라우저 알림 표시
            if (Notification.permission === 'granted') {
              new Notification('새로운 상담 요청', {
                body: `${newRequest.customerName}님이 상담을 요청했습니다.`,
                icon: '/favicon.ico'
              })
            }
          }
        }
        
        if (isFirstLoad.current && requests.length > 0) {
          isFirstLoad.current = false
        }
        
        setPendingRequests(requests)
      }
    )

    // 컴포넌트 언마운트 시 오프라인 상태로 변경
    return () => {
      unsubscribeRequests()
      unsubscribeAssignments()
      chatAssignmentService.updateOperatorStatus(user.uid, {
        isOnline: false,
        lastSeen: new Date().toISOString()
      })
    }
  }, [user, userProfile])
  
  // 브라우저 알림 권한 요청
  useEffect(() => {
    if (Notification.permission === 'default') {
      Notification.requestPermission()
    }
  }, [])

  const handleAcceptRequest = async (request: ChatRequest) => {
    if (!user || !operatorStatus) return

    // 최대 채팅 수 체크
    if (operatorStatus.activeChats >= operatorStatus.maxChats) {
      alert('최대 채팅 수에 도달했습니다. 진행 중인 채팅을 완료한 후 시도해주세요.')
      return
    }

    try {
      const assignment = await chatAssignmentService.acceptChatRequest(request.id, user.uid)
      if (assignment) {
        // 할당 목록 새로고침
        const updatedAssignments = await chatAssignmentService.getCustomersForOperator(user.uid)
        setAssignments(updatedAssignments)
        setSelectedAssignment(assignment)
        setShowRequests(false)
        
        // 활성 채팅 수 업데이트
        setOperatorStatus(prev => prev ? { 
          ...prev, 
          activeChats: updatedAssignments.length 
        } : null)
      }
    } catch (error) {
      console.error('Error accepting request:', error)
      alert('요청 수락에 실패했습니다.')
    }
  }

  const handleCompleteChat = async (assignmentId: string) => {
    if (!user) return

    if (confirm('이 채팅을 종료하시겠습니까?')) {
      try {
        await chatAssignmentService.completeChat(assignmentId)
        
        // 할당 목록 새로고침
        const updatedAssignments = await chatAssignmentService.getCustomersForOperator(user.uid)
        setAssignments(updatedAssignments)
        
        if (selectedAssignment?.id === assignmentId) {
          setSelectedAssignment(null)
        }
        
        // 활성 채팅 수 업데이트
        setOperatorStatus(prev => prev ? { 
          ...prev, 
          activeChats: updatedAssignments.length 
        } : null)
      } catch (error) {
        console.error('Error completing chat:', error)
      }
    }
  }

  const toggleAvailability = async () => {
    if (!user || !operatorStatus) return

    const newAvailability = !operatorStatus.isAvailable
    await chatAssignmentService.updateOperatorStatus(user.uid, {
      isAvailable: newAvailability
    })
    
    setOperatorStatus({ ...operatorStatus, isAvailable: newAvailability })
  }

  // 시간 포맷팅
  const formatTime = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diff = now.getTime() - date.getTime()
    const minutes = Math.floor(diff / 60000)
    const hours = Math.floor(diff / 3600000)
    const days = Math.floor(diff / 86400000)

    if (minutes < 60) return `${minutes}분 전`
    if (hours < 24) return `${hours}시간 전`
    return `${days}일 전`
  }

  // 권한 체크 - Hook 호출 이후에 수행
  if (userProfile?.role !== 'admin' && userProfile?.role !== 'manager' && userProfile?.role !== 'developer') {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">접근 권한 없음</h2>
          <p className="text-gray-600">멀티 채팅은 관리자와 팀원만 사용할 수 있습니다.</p>
        </div>
      </div>
    )
  }

  return (
    <>
      <Toaster position="top-right" />
      <div className="flex h-[calc(100vh-8rem)] gap-4">
      {/* 사이드바 */}
      <div className={`${selectedAssignment ? 'w-80' : 'w-full max-w-md'} bg-white rounded-xl shadow-sm overflow-hidden transition-all`}>
        {/* 운영자 상태 */}
        <div className="p-4 bg-gray-50 border-b">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center space-x-2">
              <div className={`w-2 h-2 rounded-full ${operatorStatus?.isAvailable ? 'bg-green-500' : 'bg-gray-400'}`}></div>
              <span className="font-medium text-sm">
                {operatorStatus?.isAvailable ? '상담 가능' : '상담 불가'}
              </span>
            </div>
            <button
              onClick={toggleAvailability}
              className="text-sm text-primary hover:text-primary-dark"
            >
              상태 변경
            </button>
            <button
              onClick={() => {
                console.log('알림음 테스트')
                if (audioRef.current) {
                  audioRef.current.volume = 0.5
                  audioRef.current.play().catch(err => console.log('테스트 알림음 재생 실패:', err))
                }
              }}
              className="ml-2 text-xs text-gray-500 hover:text-gray-700"
            >
              🔔 테스트
            </button>
          </div>
          
          {operatorStatus && (
            <div className="text-sm text-gray-600">
              활성 채팅: {operatorStatus.activeChats}/{operatorStatus.maxChats}
            </div>
          )}
        </div>

        {/* 탭 */}
        <div className="flex border-b">
          <button
            onClick={() => setShowRequests(false)}
            className={`flex-1 py-3 text-sm font-medium transition-colors ${
              !showRequests 
                ? 'text-primary border-b-2 border-primary' 
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            진행 중 ({assignments.length})
          </button>
          <button
            onClick={() => setShowRequests(true)}
            className={`flex-1 py-3 text-sm font-medium transition-colors relative ${
              showRequests 
                ? 'text-primary border-b-2 border-primary' 
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            대기 중 ({pendingRequests.length})
            {pendingRequests.length > 0 && !showRequests && (
              <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full"></span>
            )}
          </button>
        </div>

        {/* 리스트 */}
        <div className="overflow-y-auto" style={{ height: 'calc(100% - 140px)' }}>
          {!showRequests ? (
            // 진행 중인 채팅
            <div className="p-2">
              {assignments.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  진행 중인 채팅이 없습니다
                </div>
              ) : (
                <div className="space-y-2">
                  {assignments.map((assignment) => (
                    <div
                      key={assignment.id}
                      onClick={() => setSelectedAssignment(assignment)}
                      className={`
                        p-3 rounded-lg cursor-pointer transition-all
                        ${selectedAssignment?.id === assignment.id 
                          ? 'bg-primary text-white' 
                          : 'hover:bg-gray-50'
                        }
                      `}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h3 className={`font-medium ${
                            selectedAssignment?.id === assignment.id ? 'text-white' : 'text-gray-900'
                          }`}>
                            {assignment.customerName}
                          </h3>
                          <p className={`text-sm mt-1 ${
                            selectedAssignment?.id === assignment.id ? 'text-white/80' : 'text-gray-600'
                          }`}>
                            {formatTime(assignment.createdAt)}
                          </p>
                        </div>
                        <button
                          onClick={(e) => {
                            e.stopPropagation()
                            handleCompleteChat(assignment.id)
                          }}
                          className={`p-1 rounded hover:bg-gray-200 transition-colors ${
                            selectedAssignment?.id === assignment.id 
                              ? 'text-white hover:bg-white/20' 
                              : 'text-gray-400'
                          }`}
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ) : (
            // 대기 중인 요청
            <div className="p-2">
              {pendingRequests.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  대기 중인 요청이 없습니다
                </div>
              ) : (
                <div className="space-y-2">
                  {pendingRequests.map((request) => (
                    <div
                      key={request.id}
                      className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg"
                    >
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <h3 className="font-medium text-gray-900">
                            {request.customerName}
                          </h3>
                          <p className="text-sm text-gray-600">
                            {formatTime(request.createdAt)}
                          </p>
                        </div>
                      </div>
                      <p className="text-sm text-gray-700 mb-3">
                        {request.message}
                      </p>
                      <button
                        onClick={() => handleAcceptRequest(request)}
                        disabled={!!operatorStatus && operatorStatus.activeChats >= operatorStatus.maxChats}
                        className="w-full py-2 px-3 bg-primary text-white text-sm rounded-lg hover:bg-primary-dark disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                      >
                        요청 수락
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* 채팅창 */}
      {selectedAssignment ? (
        <div className="flex-1">
          <ChatWindow
            receiverId={selectedAssignment.customerId}
            receiverName={selectedAssignment.customerName}
            onClose={() => setSelectedAssignment(null)}
          />
        </div>
      ) : (
        <div className="flex-1 flex items-center justify-center bg-gray-50 rounded-xl">
          <div className="text-center">
            <div className="text-6xl mb-4">💬</div>
            <p className="text-gray-600">
              {showRequests 
                ? '대기 중인 요청을 선택하여 채팅을 시작하세요'
                : '채팅을 선택하여 대화를 계속하세요'
              }
            </p>
          </div>
        </div>
      )}
      </div>
    </>
  )
}