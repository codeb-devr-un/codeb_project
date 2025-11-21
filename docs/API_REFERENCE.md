# API Reference

CodeB Platform의 주요 API 엔드포인트와 데이터 구조에 대한 참조 문서입니다.

## 🔗 Base URL

```
Development: http://localhost:3000/api
Production: https://your-domain.com/api
```

## 🔐 Authentication

모든 API 호출은 Firebase Authentication 토큰이 필요합니다.

```typescript
// 헤더에 포함
Authorization: Bearer <firebase_id_token>
```

## 📡 API Endpoints

### Authentication APIs

#### POST /api/auth/login
사용자 로그인

**Request Body:**
```typescript
{
  email: string
  password: string
}
```

**Response:**
```typescript
{
  success: boolean
  user: {
    uid: string
    email: string
    role: 'admin' | 'manager' | 'developer' | 'customer'
    displayName?: string
  }
  token: string
}
```

#### POST /api/auth/register
사용자 회원가입

**Request Body:**
```typescript
{
  email: string
  password: string
  displayName: string
  role?: 'customer' | 'developer'
}
```

### Project APIs

#### GET /api/projects
프로젝트 목록 조회

**Query Parameters:**
- `page`: 페이지 번호 (기본값: 1)
- `limit`: 페이지당 항목 수 (기본값: 10)
- `status`: 프로젝트 상태 필터
- `clientId`: 고객 ID 필터

**Response:**
```typescript
{
  projects: Project[]
  total: number
  page: number
  limit: number
}
```

#### POST /api/projects
새 프로젝트 생성

**Request Body:**
```typescript
{
  name: string
  description: string
  clientId: string
  startDate: Date
  endDate: Date
  budget: number
  status: 'planning' | 'design' | 'development' | 'testing' | 'completed'
  team?: ProjectMember[]
}
```

#### GET /api/projects/:id
특정 프로젝트 조회

**Response:**
```typescript
{
  project: Project
}
```

#### PUT /api/projects/:id
프로젝트 업데이트

**Request Body:** Partial<Project>

#### DELETE /api/projects/:id
프로젝트 삭제

### Task APIs

#### GET /api/projects/:projectId/tasks
프로젝트의 작업 목록 조회

**Query Parameters:**
- `status`: 작업 상태 필터
- `assigneeId`: 담당자 ID 필터
- `priority`: 우선순위 필터

**Response:**
```typescript
{
  tasks: Task[]
}
```

#### POST /api/projects/:projectId/tasks
새 작업 생성

**Request Body:**
```typescript
{
  title: string
  description?: string
  status: 'todo' | 'in_progress' | 'review' | 'completed'
  priority: 'low' | 'medium' | 'high' | 'urgent'
  assigneeId?: string
  dueDate?: Date
  estimatedHours?: number
}
```

#### PUT /api/tasks/:id
작업 업데이트

**Request Body:** Partial<Task>

#### DELETE /api/tasks/:id
작업 삭제

### Chat APIs

#### GET /api/chat/rooms
채팅방 목록 조회

**Response:**
```typescript
{
  rooms: ChatRoom[]
}
```

#### POST /api/chat/rooms
새 채팅방 생성

**Request Body:**
```typescript
{
  name: string
  description?: string
  type: 'direct' | 'group' | 'project'
  participants: string[]
  projectId?: string
}
```

#### GET /api/chat/rooms/:id/messages
채팅방 메시지 조회

**Query Parameters:**
- `limit`: 메시지 수 제한
- `before`: 특정 시점 이전 메시지

**Response:**
```typescript
{
  messages: ChatMessage[]
}
```

#### POST /api/chat/rooms/:id/messages
새 메시지 전송

**Request Body:**
```typescript
{
  content: string
  type: 'text' | 'file' | 'image'
  fileUrl?: string
  fileName?: string
}
```

### File APIs

#### POST /api/files/upload
파일 업로드

**Request:** FormData with file

**Response:**
```typescript
{
  url: string
  fileName: string
  size: number
  mimeType: string
}
```

#### GET /api/files
파일 목록 조회

**Query Parameters:**
- `projectId`: 프로젝트 ID 필터
- `type`: 파일 타입 필터

**Response:**
```typescript
{
  files: FileRecord[]
}
```

#### DELETE /api/files/:id
파일 삭제

### Analytics APIs

#### GET /api/analytics/dashboard
대시보드 통계 데이터

**Response:**
```typescript
{
  stats: {
    totalProjects: number
    activeProjects: number
    completedProjects: number
    totalTasks: number
    completedTasks: number
    teamMembers: number
  }
}
```

#### GET /api/analytics/projects/:id
프로젝트 분석 데이터

**Response:**
```typescript
{
  progress: number
  tasksByStatus: Record<string, number>
  timeTracking: {
    estimatedHours: number
    actualHours: number
    efficiency: number
  }
  milestones: Milestone[]
}
```

### AI APIs

#### POST /api/ai/insights
AI 인사이트 생성

**Request Body:**
```typescript
{
  projectId: string
  type: 'risk_analysis' | 'schedule_optimization' | 'resource_allocation'
  context?: any
}
```

**Response:**
```typescript
{
  insights: AIInsight[]
  recommendations: string[]
  confidence: number
}
```

### Automation APIs

#### GET /api/automation/workflows
워크플로우 목록 조회

**Response:**
```typescript
{
  workflows: AutomationWorkflow[]
}
```

#### POST /api/automation/workflows
새 워크플로우 생성

**Request Body:**
```typescript
{
  name: string
  description: string
  trigger: WorkflowTrigger
  actions: WorkflowAction[]
  isActive: boolean
}
```

#### POST /api/automation/workflows/:id/execute
워크플로우 수동 실행

**Response:**
```typescript
{
  executionId: string
  status: 'success' | 'error'
  result?: any
  error?: string
}
```

## 📊 Data Models

### Project
```typescript
interface Project {
  id: string
  name: string
  description: string
  status: 'planning' | 'design' | 'development' | 'testing' | 'completed'
  progress: number
  startDate: Date
  endDate: Date
  budget: number
  clientId: string
  clientGroup?: string
  team: ProjectMember[]
  createdAt: Date
  updatedAt: Date
}
```

### ProjectMember
```typescript
interface ProjectMember {
  userId: string
  name: string
  role: string
  joinedAt: Date
}
```

### Task
```typescript
interface Task {
  id: string
  projectId: string
  title: string
  description?: string
  status: 'todo' | 'in_progress' | 'review' | 'completed'
  priority: 'low' | 'medium' | 'high' | 'urgent'
  assigneeId?: string
  assigneeName?: string
  createdBy: string
  dueDate?: Date
  estimatedHours?: number
  actualHours?: number
  tags?: string[]
  createdAt: Date
  updatedAt: Date
}
```

### ChatRoom
```typescript
interface ChatRoom {
  id: string
  name: string
  description?: string
  type: 'direct' | 'group' | 'project'
  participants: string[]
  projectId?: string
  lastMessage?: ChatMessage
  createdAt: Date
  updatedAt: Date
}
```

### ChatMessage
```typescript
interface ChatMessage {
  id: string
  roomId: string
  senderId: string
  senderName: string
  content: string
  type: 'text' | 'file' | 'image' | 'system'
  fileUrl?: string
  fileName?: string
  timestamp: Date
  readBy: string[]
}
```

### AutomationWorkflow
```typescript
interface AutomationWorkflow {
  id: string
  name: string
  description: string
  trigger: WorkflowTrigger
  actions: WorkflowAction[]
  isActive: boolean
  createdBy: string
  lastExecuted?: Date
  executionCount: number
  createdAt: Date
  updatedAt: Date
}
```

### WorkflowTrigger
```typescript
interface WorkflowTrigger {
  type: 'task_created' | 'task_completed' | 'project_status_changed' | 'deadline_approaching'
  conditions: Record<string, any>
}
```

### WorkflowAction
```typescript
interface WorkflowAction {
  type: 'send_notification' | 'update_task' | 'send_email' | 'create_task'
  parameters: Record<string, any>
}
```

## 🚨 Error Handling

모든 API는 다음과 같은 에러 형식을 반환합니다:

```typescript
{
  error: boolean
  message: string
  code?: string
  details?: any
}
```

### 일반적인 HTTP 상태 코드

- `200` - 성공
- `201` - 생성됨
- `400` - 잘못된 요청
- `401` - 인증 필요
- `403` - 권한 없음
- `404` - 찾을 수 없음
- `500` - 서버 오류

### 커스텀 에러 코드

- `INVALID_CREDENTIALS` - 잘못된 인증 정보
- `PROJECT_NOT_FOUND` - 프로젝트를 찾을 수 없음
- `INSUFFICIENT_PERMISSIONS` - 권한 부족
- `VALIDATION_ERROR` - 유효성 검사 실패
- `DUPLICATE_RESOURCE` - 중복된 리소스
- `WORKFLOW_EXECUTION_FAILED` - 워크플로우 실행 실패

## 🔄 Real-time Updates

Firebase Realtime Database를 통한 실시간 업데이트:

### 구독 가능한 경로

```typescript
// 프로젝트 업데이트
/projects/{projectId}

// 작업 업데이트
/projects/{projectId}/tasks

// 채팅 메시지
/chat/rooms/{roomId}/messages

// 사용자 상태
/users/{userId}/status

// 알림
/notifications/{userId}
```

### 사용 예시

```typescript
import { getDatabase, ref, onValue } from 'firebase/database'

const db = getDatabase()
const projectRef = ref(db, `projects/${projectId}`)

onValue(projectRef, (snapshot) => {
  const project = snapshot.val()
  // 프로젝트 업데이트 처리
})
```

## 📝 요청 및 응답 예시

### 프로젝트 생성 예시

```bash
curl -X POST https://your-domain.com/api/projects \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <firebase_token>" \
  -d '{
    "name": "웹사이트 리뉴얼",
    "description": "기업 웹사이트 완전 리뉴얼 프로젝트",
    "clientId": "client_123",
    "startDate": "2024-01-15T00:00:00Z",
    "endDate": "2024-04-15T00:00:00Z",
    "budget": 50000000,
    "status": "planning"
  }'
```

**응답:**
```json
{
  "success": true,
  "project": {
    "id": "proj_456",
    "name": "웹사이트 리뉴얼",
    "description": "기업 웹사이트 완전 리뉴얼 프로젝트",
    "status": "planning",
    "progress": 0,
    "startDate": "2024-01-15T00:00:00Z",
    "endDate": "2024-04-15T00:00:00Z",
    "budget": 50000000,
    "clientId": "client_123",
    "team": [],
    "createdAt": "2024-01-10T10:30:00Z",
    "updatedAt": "2024-01-10T10:30:00Z"
  }
}
```

## 🔒 보안 고려사항

1. **인증 토큰**: 모든 요청에 유효한 Firebase ID 토큰 필요
2. **권한 검사**: 역할 기반 접근 제어 (RBAC) 적용
3. **데이터 검증**: 모든 입력 데이터 서버 측 검증
4. **Rate Limiting**: API 호출 빈도 제한
5. **CORS**: 허용된 도메인에서만 API 접근 가능

## 📊 페이지네이션

목록 조회 API는 다음과 같은 페이지네이션을 지원합니다:

```typescript
// 요청
GET /api/projects?page=1&limit=10

// 응답
{
  "data": [...],
  "pagination": {
    "currentPage": 1,
    "totalPages": 5,
    "totalItems": 50,
    "hasNext": true,
    "hasPrev": false
  }
}
```

## 🔍 필터링 및 정렬

```typescript
// 필터링
GET /api/projects?status=active&clientId=client_123

// 정렬
GET /api/projects?sortBy=createdAt&sortOrder=desc

// 검색
GET /api/projects?search=웹사이트
```

---

이 문서는 계속 업데이트됩니다. 최신 정보는 [API 문서 사이트](https://docs.codeb.com/api)를 참조하세요.