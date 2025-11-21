# Development Guide

CodeB Platform 개발자를 위한 종합 가이드입니다.

## 🚀 시작하기

### 개발 환경 요구사항

- **Node.js**: 18.17.0 이상
- **npm**: 9.0.0 이상
- **Git**: 2.0 이상
- **Firebase CLI**: 12.0.0 이상

### 환경 설정

1. **저장소 복제**
```bash
git clone https://github.com/your-org/codeb-platform.git
cd codeb-platform
```

2. **의존성 설치**
```bash
npm install
```

3. **환경 변수 설정**
```bash
cp .env.example .env.local
```

`.env.local` 파일에 Firebase 설정 추가:
```env
NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_DATABASE_URL=https://your_project.firebaseio.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=123456789
NEXT_PUBLIC_FIREBASE_APP_ID=1:123456789:web:abcdef
NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID=G-ABCDEFGHIJ
```

4. **Firebase 설정**
```bash
# Firebase CLI 로그인
firebase login

# 프로젝트 초기화
firebase init

# Firebase 함수 배포 (선택사항)
firebase deploy --only functions
```

5. **개발 서버 실행**
```bash
# Next.js 개발 서버
npm run dev

# Socket.io 서버도 함께 실행
npm run dev:all
```

## 🏗️ 프로젝트 구조

### 디렉토리 구조 상세

```
project_cms/
├── 📁 src/
│   ├── 📁 app/                     # Next.js 13+ App Router
│   │   ├── 📁 (admin)/             # 관리자 전용 라우트 그룹
│   │   │   ├── finance/
│   │   │   └── operators/
│   │   ├── 📁 (auth)/              # 인증 라우트 그룹
│   │   │   ├── login/
│   │   │   └── forgot-password/
│   │   ├── 📁 (customer)/          # 고객 전용 라우트 그룹
│   │   │   ├── status/
│   │   │   ├── support/
│   │   │   └── review/
│   │   ├── 📁 (dashboard)/         # 대시보드 라우트 그룹
│   │   │   ├── ai/
│   │   │   ├── analytics/
│   │   │   ├── automation/
│   │   │   ├── chat/
│   │   │   ├── clients/
│   │   │   ├── dashboard/
│   │   │   ├── files/
│   │   │   ├── layout.tsx
│   │   │   ├── marketing/
│   │   │   ├── projects/
│   │   │   ├── review/
│   │   │   ├── status/
│   │   │   ├── support/
│   │   │   └── tasks/
│   │   ├── 📁 api/                 # API 라우트
│   │   │   ├── auth/
│   │   │   ├── projects/
│   │   │   ├── tasks/
│   │   │   ├── chat/
│   │   │   ├── files/
│   │   │   ├── ai/
│   │   │   └── automation/
│   │   ├── globals.css
│   │   ├── layout.tsx
│   │   └── page.tsx
│   ├── 📁 components/              # 재사용 가능한 컴포넌트
│   │   ├── ai/
│   │   ├── analytics/
│   │   ├── automation/
│   │   ├── chat/
│   │   ├── dashboard/
│   │   ├── files/
│   │   ├── finance/
│   │   ├── kanban/
│   │   ├── layout/
│   │   ├── notification/
│   │   ├── optimized/
│   │   ├── projects/
│   │   └── ui/
│   ├── 📁 hooks/                   # 커스텀 React 훅
│   │   ├── useAuth.ts
│   │   ├── useFirebase.ts
│   │   ├── useOptimization.ts
│   │   └── useRealTime.ts
│   ├── 📁 lib/                     # 라이브러리 및 유틸리티
│   │   ├── firebase.ts
│   │   ├── auth-context.tsx
│   │   ├── socket.ts
│   │   └── utils.ts
│   ├── 📁 services/                # 비즈니스 로직 서비스
│   │   ├── auth-service.ts
│   │   ├── project-service.ts
│   │   ├── task-service.ts
│   │   ├── chat-service.ts
│   │   ├── file-service.ts
│   │   └── notification-service.ts
│   ├── 📁 types/                   # TypeScript 타입 정의
│   │   ├── index.ts
│   │   ├── auth.ts
│   │   ├── project.ts
│   │   ├── task.ts
│   │   ├── chat.ts
│   │   ├── automation.ts
│   │   └── services.ts
│   ├── 📁 utils/                   # 유틸리티 함수
│   │   ├── date.ts
│   │   ├── format.ts
│   │   ├── validation.ts
│   │   └── logger.ts
│   └── 📁 styles/                  # 스타일 파일
│       ├── globals.css
│       ├── components.css
│       └── design-system.ts
├── 📁 public/                      # 정적 파일
│   ├── icons/
│   ├── images/
│   └── favicon.ico
├── 📁 scripts/                     # 유틸리티 스크립트
│   ├── seed-data.js
│   ├── create-test-accounts.js
│   ├── migrate-tasks.js
│   └── setup-ai-metrics.js
├── 📁 docs/                        # 문서
│   ├── API_REFERENCE.md
│   ├── COMPONENTS.md
│   ├── DEVELOPMENT_GUIDE.md
│   └── DEPLOYMENT_GUIDE.md
├── 📁 __tests__/                   # 테스트 파일
│   ├── components/
│   ├── pages/
│   └── utils/
├── 📄 next.config.js               # Next.js 설정
├── 📄 tailwind.config.ts           # Tailwind CSS 설정
├── 📄 tsconfig.json                # TypeScript 설정
├── 📄 package.json                 # 패키지 설정
├── 📄 firebase.json                # Firebase 설정
├── 📄 .eslintrc.json               # ESLint 설정
├── 📄 jest.config.js               # Jest 설정
└── 📄 README.md                    # 프로젝트 소개
```

## 🔧 개발 워크플로우

### 브랜치 전략

```bash
main              # 프로덕션 브랜치
├── develop       # 개발 통합 브랜치
├── feature/xxx   # 기능 개발 브랜치
├── hotfix/xxx    # 긴급 수정 브랜치
└── release/xxx   # 릴리즈 준비 브랜치
```

### 기능 개발 프로세스

1. **브랜치 생성**
```bash
git checkout develop
git pull origin develop
git checkout -b feature/project-kanban-board
```

2. **개발 진행**
```bash
# 컴포넌트 생성
mkdir src/components/kanban
touch src/components/kanban/KanbanBoard.tsx

# 타입 정의
echo "export interface KanbanColumn { ... }" >> src/types/kanban.ts

# 개발 서버에서 테스트
npm run dev
```

3. **테스트 작성**
```bash
# 컴포넌트 테스트
touch __tests__/components/kanban/KanbanBoard.test.tsx

# 테스트 실행
npm test
```

4. **코드 품질 확인**
```bash
# 타입 체크
npm run type-check

# 린트 검사
npm run lint

# 빌드 테스트
npm run build
```

5. **커밋 및 푸시**
```bash
git add .
git commit -m "feat: add kanban board component with drag and drop"
git push origin feature/project-kanban-board
```

6. **Pull Request 생성**
- GitHub에서 PR 생성
- 코드 리뷰 요청
- CI/CD 파이프라인 통과 확인

### 커밋 메시지 규칙

```bash
# 형식: type(scope): description

feat(projects): add kanban board component
fix(auth): resolve login redirect issue
docs(readme): update installation guide
style(ui): improve button component styling
refactor(services): optimize Firebase queries
test(auth): add unit tests for login service
chore(deps): update dependencies
```

## 🧪 테스트 가이드

### 테스트 환경 설정

**Jest 설정** (`jest.config.js`):
```javascript
module.exports = {
  testEnvironment: 'jsdom',
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
  moduleNameMapping: {
    '^@/(.*)$': '<rootDir>/src/$1',
  },
  collectCoverageFrom: [
    'src/**/*.{js,jsx,ts,tsx}',
    '!src/**/*.d.ts',
    '!src/pages/api/**',
  ],
  coverageThreshold: {
    global: {
      branches: 70,
      functions: 70,
      lines: 70,
      statements: 70,
    },
  },
}
```

### 컴포넌트 테스트

```typescript
// __tests__/components/projects/ProjectCard.test.tsx
import { render, screen, fireEvent } from '@testing-library/react'
import { ProjectCard } from '@/components/projects/ProjectCard'
import { mockProject } from '@/test-utils/mocks'

describe('ProjectCard', () => {
  it('renders project information correctly', () => {
    render(<ProjectCard project={mockProject} />)
    
    expect(screen.getByText(mockProject.name)).toBeInTheDocument()
    expect(screen.getByText(mockProject.description)).toBeInTheDocument()
  })

  it('handles click events', () => {
    const onClickMock = jest.fn()
    render(<ProjectCard project={mockProject} onClick={onClickMock} />)
    
    fireEvent.click(screen.getByRole('button'))
    expect(onClickMock).toHaveBeenCalledWith(mockProject)
  })

  it('displays progress correctly', () => {
    const projectWithProgress = { ...mockProject, progress: 75 }
    render(<ProjectCard project={projectWithProgress} />)
    
    expect(screen.getByText('75%')).toBeInTheDocument()
  })
})
```

### API 테스트

```typescript
// __tests__/api/projects.test.ts
import { createMocks } from 'node-mocks-http'
import handler from '@/pages/api/projects'

describe('/api/projects', () => {
  it('returns projects list', async () => {
    const { req, res } = createMocks({
      method: 'GET',
      headers: {
        authorization: 'Bearer mock-token',
      },
    })

    await handler(req, res)

    expect(res._getStatusCode()).toBe(200)
    const data = JSON.parse(res._getData())
    expect(data).toHaveProperty('projects')
    expect(Array.isArray(data.projects)).toBe(true)
  })

  it('creates new project', async () => {
    const projectData = {
      name: 'Test Project',
      description: 'Test Description',
      clientId: 'test-client',
    }

    const { req, res } = createMocks({
      method: 'POST',
      headers: {
        authorization: 'Bearer mock-token',
      },
      body: projectData,
    })

    await handler(req, res)

    expect(res._getStatusCode()).toBe(201)
    const data = JSON.parse(res._getData())
    expect(data.project.name).toBe(projectData.name)
  })
})
```

### 훅 테스트

```typescript
// __tests__/hooks/useAuth.test.ts
import { renderHook, act } from '@testing-library/react'
import { useAuth } from '@/hooks/useAuth'

describe('useAuth', () => {
  it('returns initial auth state', () => {
    const { result } = renderHook(() => useAuth())
    
    expect(result.current.user).toBeNull()
    expect(result.current.loading).toBe(true)
    expect(result.current.error).toBeNull()
  })

  it('handles login correctly', async () => {
    const { result } = renderHook(() => useAuth())
    
    await act(async () => {
      await result.current.login('test@example.com', 'password')
    })
    
    expect(result.current.user).not.toBeNull()
    expect(result.current.loading).toBe(false)
  })
})
```

### 테스트 실행

```bash
# 모든 테스트 실행
npm test

# 특정 파일 테스트
npm test ProjectCard.test.tsx

# 커버리지 포함 테스트
npm run test:coverage

# 감시 모드로 테스트
npm run test:watch
```

## 🎨 스타일링 가이드

### Tailwind CSS 사용법

**기본 클래스 구조:**
```typescript
// 컴포넌트 스타일
const buttonClasses = cn(
  // 기본 스타일
  'inline-flex items-center justify-center rounded-md text-sm font-medium',
  'ring-offset-background transition-colors focus-visible:outline-none',
  'focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
  'disabled:pointer-events-none disabled:opacity-50',
  
  // 변형별 스타일
  {
    'bg-primary text-primary-foreground hover:bg-primary/90': variant === 'default',
    'bg-destructive text-destructive-foreground hover:bg-destructive/90': variant === 'destructive',
    'border border-input bg-background hover:bg-accent hover:text-accent-foreground': variant === 'outline',
    'bg-secondary text-secondary-foreground hover:bg-secondary/80': variant === 'secondary',
    'hover:bg-accent hover:text-accent-foreground': variant === 'ghost',
    'text-primary underline-offset-4 hover:underline': variant === 'link',
  },
  
  // 크기별 스타일
  {
    'h-10 px-4 py-2': size === 'default',
    'h-9 rounded-md px-3': size === 'sm',
    'h-11 rounded-md px-8': size === 'lg',
    'h-10 w-10': size === 'icon',
  },
  
  className
)
```

**반응형 디자인:**
```typescript
// 모바일 우선 접근법
className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4"

// 조건부 렌더링
{isDesktop ? (
  <DesktopLayout />
) : (
  <MobileLayout />
)}
```

### 컴포넌트 스타일링 패턴

```typescript
// 스타일 변형 시스템
import { cva, type VariantProps } from 'class-variance-authority'

const cardVariants = cva(
  'rounded-lg border bg-card text-card-foreground shadow-sm',
  {
    variants: {
      variant: {
        default: 'border-border',
        destructive: 'border-destructive bg-destructive/10',
        success: 'border-green-500 bg-green-50',
      },
      size: {
        default: 'p-6',
        sm: 'p-4',
        lg: 'p-8',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  }
)

export interface CardProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof cardVariants> {}

const Card = React.forwardRef<HTMLDivElement, CardProps>(
  ({ className, variant, size, ...props }, ref) => (
    <div
      ref={ref}
      className={cn(cardVariants({ variant, size, className }))}
      {...props}
    />
  )
)
```

## 🔧 상태 관리

### React Context API

```typescript
// lib/auth-context.tsx
interface AuthContextType {
  user: User | null
  loading: boolean
  login: (email: string, password: string) => Promise<void>
  logout: () => Promise<void>
  updateProfile: (data: Partial<User>) => Promise<void>
}

const AuthContext = createContext<AuthContextType | null>(null)

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user)
      setLoading(false)
    })

    return unsubscribe
  }, [])

  const login = async (email: string, password: string) => {
    const userCredential = await signInWithEmailAndPassword(auth, email, password)
    setUser(userCredential.user)
  }

  const logout = async () => {
    await signOut(auth)
    setUser(null)
  }

  return (
    <AuthContext.Provider value={{ user, loading, login, logout, updateProfile }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider')
  }
  return context
}
```

### Zustand (선택적)

```typescript
// stores/project-store.ts
import { create } from 'zustand'

interface ProjectStore {
  projects: Project[]
  currentProject: Project | null
  loading: boolean
  error: string | null
  
  // Actions
  setProjects: (projects: Project[]) => void
  setCurrentProject: (project: Project) => void
  addProject: (project: Project) => void
  updateProject: (id: string, updates: Partial<Project>) => void
  deleteProject: (id: string) => void
  setLoading: (loading: boolean) => void
  setError: (error: string | null) => void
}

export const useProjectStore = create<ProjectStore>((set, get) => ({
  projects: [],
  currentProject: null,
  loading: false,
  error: null,

  setProjects: (projects) => set({ projects }),
  setCurrentProject: (project) => set({ currentProject: project }),
  
  addProject: (project) =>
    set((state) => ({ projects: [...state.projects, project] })),
    
  updateProject: (id, updates) =>
    set((state) => ({
      projects: state.projects.map((p) =>
        p.id === id ? { ...p, ...updates } : p
      ),
      currentProject:
        state.currentProject?.id === id
          ? { ...state.currentProject, ...updates }
          : state.currentProject,
    })),
    
  deleteProject: (id) =>
    set((state) => ({
      projects: state.projects.filter((p) => p.id !== id),
      currentProject:
        state.currentProject?.id === id ? null : state.currentProject,
    })),
    
  setLoading: (loading) => set({ loading }),
  setError: (error) => set({ error }),
}))
```

## 🚀 성능 최적화

### React 최적화 패턴

```typescript
// 컴포넌트 메모이제이션
const ProjectCard = React.memo<ProjectCardProps>(({ project, onClick }) => {
  const handleClick = useCallback(() => {
    onClick?.(project)
  }, [onClick, project])

  const formattedBudget = useMemo(() => {
    return new Intl.NumberFormat('ko-KR', {
      style: 'currency',
      currency: 'KRW',
    }).format(project.budget)
  }, [project.budget])

  return (
    <div onClick={handleClick}>
      <h3>{project.name}</h3>
      <p>{formattedBudget}</p>
    </div>
  )
})
```

### 지연 로딩

```typescript
// 라우트 기반 코드 분할
const ProjectDetail = lazy(() => import('@/components/projects/ProjectDetail'))
const KanbanBoard = lazy(() => import('@/components/kanban/KanbanBoard'))

// 컴포넌트에서 사용
<Suspense fallback={<ProjectDetailSkeleton />}>
  <ProjectDetail projectId={projectId} />
</Suspense>
```

### 가상화

```typescript
// 긴 리스트 가상화
import { FixedSizeList as List } from 'react-window'

const VirtualizedProjectList: React.FC<{ projects: Project[] }> = ({ projects }) => {
  const Row = ({ index, style }: { index: number; style: React.CSSProperties }) => (
    <div style={style}>
      <ProjectCard project={projects[index]} />
    </div>
  )

  return (
    <List
      height={600}
      itemCount={projects.length}
      itemSize={120}
      width="100%"
    >
      {Row}
    </List>
  )
}
```

## 🔒 보안 가이드

### 클라이언트 사이드 보안

```typescript
// 환경 변수 보안
// ✅ 올바른 방법 - NEXT_PUBLIC_ 접두사 사용
const publicApiKey = process.env.NEXT_PUBLIC_FIREBASE_API_KEY

// ❌ 잘못된 방법 - 민감한 정보 노출
const secretKey = process.env.SECRET_API_KEY // 클라이언트에 노출됨

// Input sanitization
import DOMPurify from 'dompurify'

const sanitizeInput = (input: string) => {
  return DOMPurify.sanitize(input)
}

// XSS 방지
const SafeHTML: React.FC<{ html: string }> = ({ html }) => {
  const sanitizedHTML = useMemo(() => {
    return DOMPurify.sanitize(html)
  }, [html])

  return <div dangerouslySetInnerHTML={{ __html: sanitizedHTML }} />
}
```

### 서버 사이드 보안

```typescript
// API 라우트 보안
import { verifyIdToken } from '@/lib/firebase-admin'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    // 인증 확인
    const token = req.headers.authorization?.replace('Bearer ', '')
    if (!token) {
      return res.status(401).json({ error: 'Unauthorized' })
    }

    const decodedToken = await verifyIdToken(token)
    const userId = decodedToken.uid

    // 권한 확인
    const userRole = await getUserRole(userId)
    if (!hasPermission(userRole, req.method, req.url)) {
      return res.status(403).json({ error: 'Forbidden' })
    }

    // 입력 검증
    const validatedData = validateRequestData(req.body)
    
    // 비즈니스 로직 실행
    const result = await processRequest(validatedData, userId)
    
    res.status(200).json(result)
  } catch (error) {
    console.error('API Error:', error)
    res.status(500).json({ error: 'Internal Server Error' })
  }
}
```

## 📱 반응형 개발

### 브레이크포인트

```typescript
// tailwind.config.ts
module.exports = {
  theme: {
    screens: {
      'sm': '640px',   // 모바일 대형
      'md': '768px',   // 태블릿
      'lg': '1024px',  // 데스크톱 소형
      'xl': '1280px',  // 데스크톱 대형
      '2xl': '1536px', // 대형 모니터
    },
  },
}

// 커스텀 훅으로 화면 크기 감지
const useMediaQuery = (query: string) => {
  const [matches, setMatches] = useState(false)

  useEffect(() => {
    const media = window.matchMedia(query)
    if (media.matches !== matches) {
      setMatches(media.matches)
    }
    
    const listener = () => setMatches(media.matches)
    media.addListener(listener)
    
    return () => media.removeListener(listener)
  }, [matches, query])

  return matches
}

// 사용 예시
const isMobile = useMediaQuery('(max-width: 768px)')
const isDesktop = useMediaQuery('(min-width: 1024px)')
```

### 모바일 최적화

```typescript
// 터치 제스처 지원
const useTouchGestures = () => {
  const [touchStart, setTouchStart] = useState(null)
  const [touchEnd, setTouchEnd] = useState(null)

  const onTouchStart = (e: TouchEvent) => {
    setTouchEnd(null)
    setTouchStart(e.targetTouches[0].clientX)
  }

  const onTouchMove = (e: TouchEvent) => {
    setTouchEnd(e.targetTouches[0].clientX)
  }

  const onTouchEnd = () => {
    if (!touchStart || !touchEnd) return
    
    const distance = touchStart - touchEnd
    const isLeftSwipe = distance > 50
    const isRightSwipe = distance < -50

    if (isLeftSwipe) {
      // 왼쪽 스와이프 처리
    }
    if (isRightSwipe) {
      // 오른쪽 스와이프 처리
    }
  }

  return { onTouchStart, onTouchMove, onTouchEnd }
}
```

## 🔄 실시간 기능

### Firebase Realtime Database

```typescript
// 실시간 데이터 구독
const useRealTimeProjects = () => {
  const [projects, setProjects] = useState<Project[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const db = getDatabase()
    const projectsRef = ref(db, 'projects')

    const unsubscribe = onValue(projectsRef, (snapshot) => {
      const data = snapshot.val()
      if (data) {
        const projectList = Object.entries(data).map(([id, project]) => ({
          id,
          ...project as Project,
        }))
        setProjects(projectList)
      }
      setLoading(false)
    })

    return () => unsubscribe()
  }, [])

  return { projects, loading }
}

// 실시간 데이터 업데이트
const updateProjectRealTime = async (projectId: string, updates: Partial<Project>) => {
  const db = getDatabase()
  const projectRef = ref(db, `projects/${projectId}`)
  
  await update(projectRef, {
    ...updates,
    updatedAt: new Date().toISOString(),
  })
}
```

### Socket.io 통합

```typescript
// 클라이언트 Socket.io 설정
import io from 'socket.io-client'

const useSocket = () => {
  const [socket, setSocket] = useState(null)
  
  useEffect(() => {
    const socketInstance = io(process.env.NEXT_PUBLIC_SOCKET_URL)
    setSocket(socketInstance)
    
    return () => socketInstance.close()
  }, [])
  
  return socket
}

// 실시간 채팅
const useChatRoom = (roomId: string) => {
  const socket = useSocket()
  const [messages, setMessages] = useState<ChatMessage[]>([])
  
  useEffect(() => {
    if (!socket) return
    
    socket.emit('join-room', roomId)
    
    socket.on('new-message', (message: ChatMessage) => {
      setMessages(prev => [...prev, message])
    })
    
    socket.on('typing', (data) => {
      // 타이핑 인디케이터 처리
    })
    
    return () => {
      socket.off('new-message')
      socket.off('typing')
    }
  }, [socket, roomId])
  
  const sendMessage = (content: string) => {
    if (socket) {
      socket.emit('send-message', { roomId, content })
    }
  }
  
  return { messages, sendMessage }
}
```

## 🐛 디버깅 및 모니터링

### 로깅 시스템

```typescript
// utils/logger.ts
enum LogLevel {
  DEBUG = 0,
  INFO = 1,
  WARN = 2,
  ERROR = 3,
}

class Logger {
  private static instance: Logger
  private isDevelopment = process.env.NODE_ENV === 'development'
  private logLevel = LogLevel.INFO
  private logHistory: LogEntry[] = []

  static getInstance(): Logger {
    if (!Logger.instance) {
      Logger.instance = new Logger()
    }
    return Logger.instance
  }

  debug(message: string, context?: any) {
    this.log(LogLevel.DEBUG, message, context)
  }

  info(message: string, context?: any) {
    this.log(LogLevel.INFO, message, context)
  }

  warn(message: string, context?: any) {
    this.log(LogLevel.WARN, message, context)
  }

  error(message: string, error?: Error, context?: any) {
    this.log(LogLevel.ERROR, message, { error, ...context })
  }

  private log(level: LogLevel, message: string, context?: any) {
    if (level < this.logLevel) return

    const entry: LogEntry = {
      level: LogLevel[level],
      message,
      context,
      timestamp: new Date().toISOString(),
      stack: new Error().stack,
    }

    this.logHistory.push(entry)

    if (this.isDevelopment) {
      console.log(`[${entry.level}] ${entry.message}`, context)
    }

    // 프로덕션에서는 외부 로깅 서비스로 전송
    if (!this.isDevelopment) {
      this.sendToExternalService(entry)
    }
  }

  private sendToExternalService(entry: LogEntry) {
    // Sentry, LogRocket 등 외부 서비스로 로그 전송
  }
}

export const logger = Logger.getInstance()
```

### 에러 경계

```typescript
// components/ErrorBoundary.tsx
interface ErrorBoundaryState {
  hasError: boolean
  error?: Error
  errorInfo?: ErrorInfo
}

class ErrorBoundary extends React.Component<
  React.PropsWithChildren<{}>,
  ErrorBoundaryState
> {
  constructor(props: React.PropsWithChildren<{}>) {
    super(props)
    this.state = { hasError: false }
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    this.setState({ error, errorInfo })
    
    // 에러 로깅
    logger.error('React Error Boundary caught an error', error, {
      errorInfo,
      timestamp: new Date().toISOString(),
    })
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
          <div className="max-w-md w-full bg-white shadow-lg rounded-lg p-6">
            <div className="flex items-center mb-4">
              <AlertTriangle className="h-6 w-6 text-red-500 mr-2" />
              <h1 className="text-lg font-semibold text-gray-900">
                오류가 발생했습니다
              </h1>
            </div>
            <p className="text-gray-600 mb-4">
              예상치 못한 오류가 발생했습니다. 페이지를 새로고침해주세요.
            </p>
            <button
              onClick={() => window.location.reload()}
              className="w-full bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-600"
            >
              페이지 새로고침
            </button>
          </div>
        </div>
      )
    }

    return this.props.children
  }
}
```

### 성능 모니터링

```typescript
// hooks/usePerformanceMonitor.ts
const usePerformanceMonitor = (componentName: string) => {
  useEffect(() => {
    const startTime = performance.now()
    
    return () => {
      const endTime = performance.now()
      const renderTime = endTime - startTime
      
      if (renderTime > 100) { // 100ms 이상
        logger.warn(`Slow render detected`, {
          component: componentName,
          renderTime: `${renderTime.toFixed(2)}ms`,
        })
      }
    }
  }, [componentName])
}

// Web Vitals 측정
import { getCLS, getFID, getFCP, getLCP, getTTFB } from 'web-vitals'

const sendToAnalytics = ({ name, value, id }: Metric) => {
  logger.info('Web Vital', { name, value, id })
  
  // Google Analytics나 다른 분석 도구로 전송
  if (typeof gtag !== 'undefined') {
    gtag('event', name, {
      value: Math.round(name === 'CLS' ? value * 1000 : value),
      event_category: 'Web Vitals',
      event_label: id,
      non_interaction: true,
    })
  }
}

// 앱 시작 시 Web Vitals 측정 시작
getCLS(sendToAnalytics)
getFID(sendToAnalytics)
getFCP(sendToAnalytics)
getLCP(sendToAnalytics)
getTTFB(sendToAnalytics)
```

## 📚 추가 리소스

### 유용한 도구

- **개발 도구**: VS Code, Chrome DevTools, React DevTools
- **API 테스트**: Postman, Insomnia
- **디자인**: Figma, Adobe XD
- **문서화**: Storybook, Swagger
- **모니터링**: Sentry, LogRocket, Google Analytics

### 권장 VS Code 확장

```json
{
  "recommendations": [
    "bradlc.vscode-tailwindcss",
    "ms-vscode.vscode-typescript-next",
    "esbenp.prettier-vscode",
    "dbaeumer.vscode-eslint",
    "ms-playwright.playwright",
    "firebase.vscode-firebase-explorer",
    "GitLab.gitlab-workflow"
  ]
}
```

### 학습 자료

- [Next.js 공식 문서](https://nextjs.org/docs)
- [React 공식 문서](https://react.dev)
- [Firebase 문서](https://firebase.google.com/docs)
- [Tailwind CSS 문서](https://tailwindcss.com/docs)
- [TypeScript 핸드북](https://www.typescriptlang.org/docs)

---

문제가 발생하거나 질문이 있으시면 팀 슬랙 채널 #dev-support 에서 문의해주세요.