# Component Reference

CodeB Platform의 재사용 가능한 React 컴포넌트들에 대한 참조 문서입니다.

## 📁 컴포넌트 구조

```
src/components/
├── ai/                    # AI 관련 컴포넌트
├── analytics/            # 분석 관련 컴포넌트
├── automation/           # 자동화 관련 컴포넌트
├── chat/                 # 채팅 관련 컴포넌트
├── dashboard/            # 대시보드 컴포넌트
├── files/                # 파일 관리 컴포넌트
├── finance/              # 재무 관련 컴포넌트
├── kanban/               # 칸반 보드 컴포넌트
├── layout/               # 레이아웃 컴포넌트
├── notification/         # 알림 컴포넌트
├── optimized/            # 최적화된 컴포넌트
├── projects/             # 프로젝트 관련 컴포넌트
└── ui/                   # 기본 UI 컴포넌트
```

## 🎨 Layout Components

### Sidebar
사이드바 네비게이션 컴포넌트

**파일:** `src/components/layout/Sidebar.tsx`

```typescript
interface SidebarProps {
  isCollapsed?: boolean
  onToggle?: () => void
}

// 사용 예시
<Sidebar 
  isCollapsed={false}
  onToggle={() => setCollapsed(!collapsed)}
/>
```

**Features:**
- 역할 기반 메뉴 표시
- 반응형 디자인
- 접기/펼치기 기능
- 현재 페이지 하이라이트

### Header
헤더 컴포넌트 (알림, 프로필 등)

**파일:** `src/components/layout/Header.tsx`

```typescript
interface HeaderProps {
  title?: string
  showNotifications?: boolean
}

// 사용 예시
<Header 
  title="대시보드"
  showNotifications={true}
/>
```

## 📊 Dashboard Components

### StatsCard
통계 카드 컴포넌트

**파일:** `src/components/dashboard/StatsCard.tsx`

```typescript
interface StatsCardProps {
  title: string
  value: string | number
  icon: React.ReactNode
  trend?: {
    value: number
    isPositive: boolean
  }
  className?: string
}

// 사용 예시
<StatsCard
  title="총 프로젝트"
  value={42}
  icon={<ProjectIcon />}
  trend={{ value: 12, isPositive: true }}
/>
```

### RecentActivity
최근 활동 컴포넌트

**파일:** `src/components/dashboard/RecentActivity.tsx`

```typescript
interface Activity {
  id: string
  type: 'project_created' | 'task_completed' | 'comment_added'
  title: string
  description: string
  timestamp: Date
  user: {
    name: string
    avatar?: string
  }
}

interface RecentActivityProps {
  activities: Activity[]
  limit?: number
}

// 사용 예시
<RecentActivity 
  activities={activities}
  limit={10}
/>
```

## 📋 Project Components

### ProjectCard
프로젝트 카드 컴포넌트

**파일:** `src/components/projects/ProjectCard.tsx`

```typescript
interface ProjectCardProps {
  project: Project
  onClick?: (project: Project) => void
  showActions?: boolean
  compact?: boolean
}

// 사용 예시
<ProjectCard
  project={project}
  onClick={(p) => router.push(`/projects/${p.id}`)}
  showActions={true}
/>
```

**Features:**
- 프로젝트 정보 표시
- 진행률 표시
- 팀 아바타
- 상태 뱃지
- 액션 버튼

### ProjectCreateWizard
프로젝트 생성 마법사

**파일:** `src/components/projects/ProjectCreateWizard.tsx`

```typescript
interface ProjectCreateWizardProps {
  isOpen: boolean
  onClose: () => void
  onSubmit: (project: Omit<Project, 'id' | 'createdAt' | 'updatedAt'>) => void
}

// 사용 예시
<ProjectCreateWizard
  isOpen={showWizard}
  onClose={() => setShowWizard(false)}
  onSubmit={handleCreateProject}
/>
```

**Features:**
- 4단계 프로젝트 생성
- 유효성 검사
- 팀원 선택
- 미리보기

### ProjectGantt
간트 차트 컴포넌트

**파일:** `src/components/projects/ProjectGantt.tsx`

```typescript
interface ProjectGanttProps {
  projectId: string
  tasks: Task[]
  onTaskUpdate?: (task: Task) => void
  readonly?: boolean
}

// 사용 예시
<ProjectGantt
  projectId={project.id}
  tasks={tasks}
  onTaskUpdate={updateTask}
/>
```

## 🗂️ Kanban Components

### KanbanBoard
칸반 보드 컴포넌트

**파일:** `src/components/kanban/KanbanBoard.tsx`

```typescript
interface KanbanBoardProps {
  projectId: string
  tasks: Task[]
  onTaskMove?: (taskId: string, newStatus: TaskStatus) => void
  onTaskCreate?: (columnId: string) => void
  onTaskEdit?: (task: Task) => void
}

// 사용 예시
<KanbanBoard
  projectId={project.id}
  tasks={tasks}
  onTaskMove={handleTaskMove}
  onTaskCreate={handleTaskCreate}
/>
```

**Features:**
- 드래그 앤 드롭
- 실시간 업데이트
- 작업 카드 미리보기
- 필터링

### KanbanColumn
칸반 열 컴포넌트

**파일:** `src/components/kanban/KanbanColumn.tsx`

```typescript
interface KanbanColumnProps {
  column: {
    id: string
    title: string
    color: string
  }
  tasks: Task[]
  onTaskMove?: (taskId: string) => void
  onTaskCreate?: () => void
}
```

### TaskCard
작업 카드 컴포넌트

**파일:** `src/components/kanban/TaskCard.tsx`

```typescript
interface TaskCardProps {
  task: Task
  onClick?: (task: Task) => void
  onEdit?: (task: Task) => void
  onDelete?: (taskId: string) => void
  compact?: boolean
}

// 사용 예시
<TaskCard
  task={task}
  onClick={viewTask}
  onEdit={editTask}
  onDelete={deleteTask}
/>
```

## 💬 Chat Components

### ChatRoom
채팅방 컴포넌트

**파일:** `src/components/chat/ChatRoom.tsx`

```typescript
interface ChatRoomProps {
  roomId: string
  messages: ChatMessage[]
  onSendMessage: (content: string) => void
  currentUser: User
}

// 사용 예시
<ChatRoom
  roomId={room.id}
  messages={messages}
  onSendMessage={sendMessage}
  currentUser={user}
/>
```

**Features:**
- 실시간 메시징
- 타이핑 인디케이터
- 파일 공유
- 읽음 확인

### ChatMessage
메시지 컴포넌트

**파일:** `src/components/chat/ChatMessage.tsx`

```typescript
interface ChatMessageProps {
  message: ChatMessage
  isOwn: boolean
  showAvatar?: boolean
  showTimestamp?: boolean
}
```

### TypingIndicator
타이핑 인디케이터

**파일:** `src/components/chat/TypingIndicator.tsx`

```typescript
interface TypingIndicatorProps {
  users: string[]
}

// 사용 예시
<TypingIndicator users={typingUsers} />
```

## 📁 File Components

### FileUpload
파일 업로드 컴포넌트

**파일:** `src/components/files/FileUpload.tsx`

```typescript
interface FileUploadProps {
  onUpload: (files: File[]) => void
  accept?: string
  multiple?: boolean
  maxSize?: number
  className?: string
}

// 사용 예시
<FileUpload
  onUpload={handleUpload}
  accept="image/*,.pdf,.doc,.docx"
  multiple={true}
  maxSize={10 * 1024 * 1024} // 10MB
/>
```

**Features:**
- 드래그 앤 드롭
- 파일 타입 검증
- 크기 제한
- 진행률 표시

### FilePreview
파일 미리보기 컴포넌트

**파일:** `src/components/files/FilePreview.tsx`

```typescript
interface FilePreviewProps {
  file: FileRecord
  onDownload?: () => void
  onDelete?: () => void
  compact?: boolean
}
```

## 🤖 AI Components

### AIChat
AI 어시스턴트 채팅

**파일:** `src/components/ai/AIChat.tsx`

```typescript
interface AIChatProps {
  projectId?: string
  onInsightGenerated?: (insight: AIInsight) => void
}

// 사용 예시
<AIChat
  projectId={project.id}
  onInsightGenerated={handleInsight}
/>
```

### InsightCard
AI 인사이트 카드

**파일:** `src/components/ai/InsightCard.tsx`

```typescript
interface InsightCardProps {
  insight: AIInsight
  onAccept?: () => void
  onDismiss?: () => void
}
```

## ⚙️ Automation Components

### WorkflowBuilder
워크플로우 빌더

**파일:** `src/components/automation/WorkflowBuilder.tsx`

```typescript
interface WorkflowBuilderProps {
  workflow?: AutomationWorkflow
  onSave: (workflow: AutomationWorkflow) => void
  onCancel: () => void
}

// 사용 예시
<WorkflowBuilder
  workflow={workflow}
  onSave={saveWorkflow}
  onCancel={() => setEditing(false)}
/>
```

### TriggerConfig
트리거 설정 컴포넌트

**파일:** `src/components/automation/TriggerConfig.tsx`

```typescript
interface TriggerConfigProps {
  trigger: WorkflowTrigger
  onChange: (trigger: WorkflowTrigger) => void
}
```

## 📈 Analytics Components

### ProgressChart
진행률 차트

**파일:** `src/components/analytics/ProgressChart.tsx`

```typescript
interface ProgressChartProps {
  data: {
    date: string
    planned: number
    actual: number
  }[]
  height?: number
}

// 사용 예시
<ProgressChart
  data={chartData}
  height={300}
/>
```

### MetricsGrid
메트릭 그리드

**파일:** `src/components/analytics/MetricsGrid.tsx`

```typescript
interface Metric {
  id: string
  name: string
  value: number
  unit: string
  trend?: number
  target?: number
}

interface MetricsGridProps {
  metrics: Metric[]
  columns?: number
}
```

## 🔔 Notification Components

### NotificationBell
알림 벨 컴포넌트

**파일:** `src/components/notification/NotificationBell.tsx`

```typescript
interface NotificationBellProps {
  notifications: Notification[]
  onMarkAsRead: (id: string) => void
  onMarkAllAsRead: () => void
}
```

### NotificationItem
알림 아이템 컴포넌트

**파일:** `src/components/notification/NotificationItem.tsx`

```typescript
interface NotificationItemProps {
  notification: Notification
  onMarkAsRead: () => void
  onAction?: () => void
}
```

## ⚡ Optimized Components

### VirtualizedList
가상화된 리스트 컴포넌트

**파일:** `src/components/optimized/VirtualizedList.tsx`

```typescript
interface VirtualizedListProps<T> {
  items: T[]
  itemHeight: number
  renderItem: (item: T, index: number) => React.ReactNode
  height?: number
  className?: string
}

// 사용 예시
<VirtualizedList
  items={largeDataSet}
  itemHeight={60}
  renderItem={(item, index) => <ItemComponent item={item} />}
  height={400}
/>
```

### LazyImage
지연 로딩 이미지 컴포넌트

**파일:** `src/components/optimized/LazyImage.tsx`

```typescript
interface LazyImageProps {
  src: string
  alt: string
  placeholder?: string
  className?: string
  onLoad?: () => void
}
```

## 🎨 UI Components

### Button
기본 버튼 컴포넌트

**파일:** `src/components/ui/button.tsx`

```typescript
interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 'link'
  size?: 'default' | 'sm' | 'lg' | 'icon'
}

// 사용 예시
<Button variant="primary" size="lg">
  버튼 텍스트
</Button>
```

### Input
입력 필드 컴포넌트

**파일:** `src/components/ui/input.tsx`

```typescript
interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  error?: string
  label?: string
}

// 사용 예시
<Input
  label="이메일"
  type="email"
  error={errors.email}
  {...register('email')}
/>
```

### Modal
모달 컴포넌트

**파일:** `src/components/ui/modal.tsx`

```typescript
interface ModalProps {
  isOpen: boolean
  onClose: () => void
  title?: string
  children: React.ReactNode
  size?: 'sm' | 'md' | 'lg' | 'xl'
}

// 사용 예시
<Modal
  isOpen={showModal}
  onClose={() => setShowModal(false)}
  title="확인"
  size="md"
>
  <p>정말 삭제하시겠습니까?</p>
</Modal>
```

### DataTable
데이터 테이블 컴포넌트

**파일:** `src/components/ui/data-table.tsx`

```typescript
interface Column<T> {
  key: keyof T
  title: string
  render?: (value: any, item: T) => React.ReactNode
  sortable?: boolean
  width?: string
}

interface DataTableProps<T> {
  data: T[]
  columns: Column<T>[]
  onSort?: (key: keyof T, direction: 'asc' | 'desc') => void
  onRowClick?: (item: T) => void
  loading?: boolean
}

// 사용 예시
<DataTable
  data={projects}
  columns={projectColumns}
  onSort={handleSort}
  onRowClick={viewProject}
/>
```

## 🎯 Custom Hooks

주요 컴포넌트들이 사용하는 커스텀 훅들:

### useOptimization
성능 최적화 훅

**파일:** `src/hooks/useOptimization.ts`

```typescript
// 디바운스
const debouncedValue = useDebounce(searchTerm, 300)

// 스로틀
const throttledCallback = useThrottle(handleScroll, 100)

// 교차 관찰자
const [ref, isVisible] = useIntersectionObserver()
```

### useFirebaseData
Firebase 데이터 훅

```typescript
const { data, loading, error } = useFirebaseData('projects')
```

### useRealTimeUpdates
실시간 업데이트 훅

```typescript
useRealTimeUpdates('projects', (data) => {
  setProjects(data)
})
```

## 🎨 Styling Guidelines

### CSS Classes
Tailwind CSS 클래스 사용 패턴:

```typescript
// 버튼 스타일
const buttonClasses = cn(
  'px-4 py-2 rounded-lg font-medium transition-colors',
  {
    'bg-blue-500 text-white hover:bg-blue-600': variant === 'primary',
    'bg-gray-200 text-gray-900 hover:bg-gray-300': variant === 'secondary',
  }
)

// 카드 스타일
const cardClasses = 'bg-white rounded-lg shadow-sm border border-gray-200 p-6'

// 입력 필드 스타일
const inputClasses = cn(
  'w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500',
  {
    'border-red-500': error,
    'border-gray-300': !error,
  }
)
```

### Animation
Framer Motion 애니메이션 패턴:

```typescript
// 페이드 인/아웃
const fadeInOut = {
  initial: { opacity: 0 },
  animate: { opacity: 1 },
  exit: { opacity: 0 }
}

// 슬라이드 효과
const slideInOut = {
  initial: { x: 20, opacity: 0 },
  animate: { x: 0, opacity: 1 },
  exit: { x: -20, opacity: 0 }
}
```

## 🧪 Testing

컴포넌트 테스트 패턴:

```typescript
// React Testing Library
import { render, screen, fireEvent } from '@testing-library/react'
import { Button } from './Button'

test('Button renders correctly', () => {
  render(<Button>Click me</Button>)
  expect(screen.getByRole('button')).toHaveTextContent('Click me')
})

test('Button handles click events', () => {
  const handleClick = jest.fn()
  render(<Button onClick={handleClick}>Click me</Button>)
  
  fireEvent.click(screen.getByRole('button'))
  expect(handleClick).toHaveBeenCalledTimes(1)
})
```

## 📱 Responsive Design

모바일 우선 반응형 디자인:

```typescript
// 반응형 클래스
className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4"

// 조건부 렌더링
{isMobile ? <MobileView /> : <DesktopView />}
```

## ♿ Accessibility

접근성 고려사항:

```typescript
// ARIA 속성
<button
  aria-label="프로젝트 삭제"
  aria-expanded={isOpen}
  aria-controls="menu"
>

// 키보드 네비게이션
onKeyDown={(e) => {
  if (e.key === 'Enter' || e.key === ' ') {
    handleClick()
  }
}}

// 스크린 리더 지원
<div role="status" aria-live="polite">
  {statusMessage}
</div>
```

---

이 문서는 컴포넌트 추가 및 수정에 따라 지속적으로 업데이트됩니다.