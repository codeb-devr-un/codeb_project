require('dotenv').config({ path: '.env.local' })
const { initializeApp } = require('firebase/app')
const { getDatabase, ref, set, push } = require('firebase/database')
const { getAuth, createUserWithEmailAndPassword } = require('firebase/auth')

// Firebase 설정
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  databaseURL: process.env.NEXT_PUBLIC_FIREBASE_DATABASE_URL,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID
}

const app = initializeApp(firebaseConfig)
const db = getDatabase(app)
const auth = getAuth(app)

// 프로젝트 데이터
const streamingProject = {
  name: '라이브 스트리밍 플랫폼 개발',
  description: '실시간 방송 및 VOD 서비스를 제공하는 종합 스트리밍 플랫폼',
  status: 'development',
  progress: 25,
  startDate: '2025-07-03',
  endDate: '2025-08-15',
  budget: 500000000, // 5억원
  spentBudget: 125000000,
  team: ['김개발', '이디자인', '박기획', '최프론트', '정백엔드', '강인프라'],
  clientId: 'streaming-client',
  clientName: '스트리밍주식회사',
  createdAt: '2025-07-11T09:00:00Z',
  updatedAt: new Date().toISOString()
}

// 마일스톤 데이터
const milestones = [
  {
    title: '프로젝트 킥오프',
    date: '2025-07-03',
    completed: true,
    description: '프로젝트 팀 구성 및 요구사항 분석 완료'
  },
  {
    title: '기본 설계 완료',
    date: '2025-07-08',
    completed: true,
    description: '시스템 아키텍처 및 DB 설계 완료'
  },
  {
    title: '알파 버전 개발 완료',
    date: '2025-07-11',
    completed: false,
    description: '핵심 기능 구현 및 내부 테스트'
  },
  {
    title: '베타 버전 오픈',
    date: '2025-08-15',
    completed: false,
    description: '공개 베타 테스트 시작'
  }
]

// 칸반 컬럼 설정
const kanbanColumns = [
  { id: 'backlog', title: '백로그', color: '#94a3b8', order: 0 },
  { id: 'todo', title: '할 일', color: '#3b82f6', order: 1 },
  { id: 'in-progress', title: '진행 중', color: '#eab308', order: 2 },
  { id: 'review', title: '검토', color: '#8b5cf6', order: 3 },
  { id: 'done', title: '완료', color: '#10b981', order: 4 }
]

// 태스크 데이터 (페이즈1 - 알파개발)
const tasks = [
  // 완료된 태스크
  {
    title: '프로젝트 환경 설정',
    description: '개발 환경 구축 및 기본 프로젝트 설정',
    status: 'completed',
    columnId: 'done',
    assignee: '강인프라',
    priority: 'high',
    startDate: '2025-07-03',
    dueDate: '2025-07-04',
    progress: 100
  },
  {
    title: 'DB 스키마 설계',
    description: '사용자, 방송, VOD, 결제 등 전체 DB 구조 설계',
    status: 'completed',
    columnId: 'done',
    assignee: '정백엔드',
    priority: 'high',
    startDate: '2025-07-04',
    dueDate: '2025-07-06',
    progress: 100
  },
  {
    title: 'API 서버 기본 구조',
    description: 'RESTful API 서버 기본 틀 구축',
    status: 'completed',
    columnId: 'done',
    assignee: '정백엔드',
    priority: 'high',
    startDate: '2025-07-06',
    dueDate: '2025-07-08',
    progress: 100
  },
  
  // 진행 중 태스크
  {
    title: '회원가입/로그인 시스템',
    description: '이메일, SNS(구글/네이버/카카오) 로그인 구현',
    status: 'in-progress',
    columnId: 'in-progress',
    assignee: '김개발',
    priority: 'high',
    startDate: '2025-06-15',
    dueDate: '2025-06-25',
    progress: 70
  },
  {
    title: '스트리밍 서버 구축',
    description: 'RTMP 서버 설정 및 HLS 변환 시스템',
    status: 'in-progress',
    columnId: 'in-progress',
    assignee: '강인프라',
    priority: 'urgent',
    startDate: '2025-06-20',
    dueDate: '2025-07-01',
    progress: 60
  },
  {
    title: '실시간 채팅 시스템',
    description: 'WebSocket 기반 실시간 채팅 구현',
    status: 'in-progress',
    columnId: 'in-progress',
    assignee: '정백엔드',
    priority: 'high',
    startDate: '2025-06-25',
    dueDate: '2025-07-05',
    progress: 40
  },
  
  // 검토 중
  {
    title: '프로필 관리 UI',
    description: '사용자 프로필 설정 화면 구현',
    status: 'review',
    columnId: 'review',
    assignee: '최프론트',
    priority: 'medium',
    startDate: '2025-06-20',
    dueDate: '2025-06-28',
    progress: 90
  },
  
  // 할 일
  {
    title: '방송 송출 프로그램 가이드',
    description: 'OBS 연동 가이드 및 스트림 키 관리',
    status: 'todo',
    columnId: 'todo',
    assignee: '박기획',
    priority: 'medium',
    startDate: '2025-07-01',
    dueDate: '2025-07-05',
    progress: 0
  },
  {
    title: 'VOD 업로드 시스템',
    description: '동영상 업로드 및 인코딩 처리',
    status: 'todo',
    columnId: 'todo',
    assignee: '김개발',
    priority: 'high',
    startDate: '2025-07-01',
    dueDate: '2025-07-08',
    progress: 0
  },
  {
    title: '결제 시스템 연동',
    description: '카드/카카오페이/토스 결제 연동',
    status: 'todo',
    columnId: 'todo',
    assignee: '정백엔드',
    priority: 'high',
    startDate: '2025-07-05',
    dueDate: '2025-07-10',
    progress: 0
  },
  {
    title: '관리자 대시보드',
    description: '유저/콘텐츠/수익 관리 페이지',
    status: 'todo',
    columnId: 'todo',
    assignee: '최프론트',
    priority: 'medium',
    startDate: '2025-07-01',
    dueDate: '2025-07-09',
    progress: 0
  },
  
  // 백로그
  {
    title: '라이브 화질 선택',
    description: '480p/720p/1080p 화질 옵션',
    status: 'backlog',
    columnId: 'backlog',
    assignee: '미정',
    priority: 'medium',
    startDate: '2025-07-08',
    dueDate: '2025-07-11',
    progress: 0
  },
  {
    title: '후원 시스템',
    description: '실시간 후원 및 알림 기능',
    status: 'backlog',
    columnId: 'backlog',
    assignee: '미정',
    priority: 'medium',
    startDate: '2025-07-08',
    dueDate: '2025-07-11',
    progress: 0
  },
  {
    title: '구독 시스템',
    description: '월 단위 유료 구독 서비스',
    status: 'backlog',
    columnId: 'backlog',
    assignee: '미정',
    priority: 'high',
    startDate: '2025-07-05',
    dueDate: '2025-07-10',
    progress: 0
  },
  {
    title: '카테고리 시스템',
    description: '라이브/VOD 카테고리 분류',
    status: 'backlog',
    columnId: 'backlog',
    assignee: '미정',
    priority: 'medium',
    startDate: '2025-07-06',
    dueDate: '2025-07-10',
    progress: 0
  },
  {
    title: '검색 기능',
    description: '통합 검색 및 필터링',
    status: 'backlog',
    columnId: 'backlog',
    assignee: '미정',
    priority: 'low',
    startDate: '2025-07-09',
    dueDate: '2025-07-11',
    progress: 0
  },
  {
    title: '알림 시스템',
    description: '푸시/이메일 알림',
    status: 'backlog',
    columnId: 'backlog',
    assignee: '미정',
    priority: 'low',
    startDate: '2025-07-10',
    dueDate: '2025-07-11',
    progress: 0
  }
]

// 활동 로그
const activities = [
  {
    type: 'project',
    message: '프로젝트를 시작했습니다',
    user: '박기획',
    timestamp: '2025-06-01T09:00:00Z',
    icon: '🚀'
  },
  {
    type: 'task',
    message: '프로젝트 환경 설정을 완료했습니다',
    user: '강인프라',
    timestamp: '2025-06-05T17:00:00Z',
    icon: '✅'
  },
  {
    type: 'task',
    message: 'DB 스키마 설계를 완료했습니다',
    user: '정백엔드',
    timestamp: '2025-06-10T18:00:00Z',
    icon: '✅'
  },
  {
    type: 'milestone',
    message: '기본 설계 완료 마일스톤을 달성했습니다',
    user: '시스템',
    timestamp: '2025-06-15T12:00:00Z',
    icon: '🎯'
  },
  {
    type: 'task',
    message: '회원가입/로그인 시스템 개발을 시작했습니다',
    user: '김개발',
    timestamp: '2025-06-15T14:00:00Z',
    icon: '🔨'
  }
]

async function createStreamingProject() {
  try {
    console.log('라이브 스트리밍 플랫폼 프로젝트 생성 중...')
    
    // 프로젝트 생성
    const projectRef = push(ref(db, 'projects'))
    const projectId = projectRef.key
    
    await set(projectRef, {
      ...streamingProject,
      id: projectId
    })
    
    console.log(`프로젝트 생성 완료: ${projectId}`)
    
    // 마일스톤 추가
    for (const milestone of milestones) {
      const milestoneRef = push(ref(db, `projects/${projectId}/milestones`))
      await set(milestoneRef, {
        ...milestone,
        id: milestoneRef.key
      })
    }
    console.log('마일스톤 추가 완료')
    
    // 칸반 컬럼 설정
    await set(ref(db, `kanban/${projectId}/columns`), kanbanColumns)
    console.log('칸반 컬럼 설정 완료')
    
    // 태스크 추가
    let taskOrder = 0
    for (const task of tasks) {
      const taskRef = push(ref(db, `tasks/${projectId}`))
      await set(taskRef, {
        ...task,
        id: taskRef.key,
        projectId: projectId,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        columnOrder: taskOrder++
      })
    }
    console.log('태스크 추가 완료')
    
    // 활동 로그 추가
    for (const activity of activities) {
      const activityRef = push(ref(db, `activities/${projectId}`))
      await set(activityRef, {
        ...activity,
        id: activityRef.key
      })
    }
    console.log('활동 로그 추가 완료')
    
    console.log('\n✅ 라이브 스트리밍 플랫폼 프로젝트가 성공적으로 생성되었습니다!')
    console.log(`프로젝트 ID: ${projectId}`)
    console.log('- 마일스톤: 4개')
    console.log('- 태스크: ' + tasks.length + '개')
    console.log('- 팀원: 6명')
    console.log('\n알파 오픈: 2025년 7월 11일')
    console.log('베타 오픈: 2025년 8월 15일')
    
  } catch (error) {
    console.error('프로젝트 생성 중 오류:', error)
  }
  
  process.exit(0)
}

// 스크립트 실행
createStreamingProject()