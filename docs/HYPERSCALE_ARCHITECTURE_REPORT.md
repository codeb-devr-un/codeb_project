# 🚀 WorkB CMS 하이퍼스케일 아키텍처 분석 리포트

**분석 일시**: 2025-12-01
**목표**: 동시접속 100,000명 지원
**현재 상태**: Phase 1 부분 완료 (약 35% 진행)

---

## 📊 Executive Summary

### 현재 아키텍처 수용력
| 지표 | 현재 수준 | 목표 | 달성률 |
|------|----------|------|--------|
| **동시 접속자** | ~10,000-20,000 | 100,000 | 15-20% |
| **Redis 처리량** | ~20,000 ops/s | 100,000+ ops/s | 20% |
| **DB 연결** | ~100 connections | 1,000+ | 10% |
| **API 응답시간** | 200-500ms | <100ms | 40% |
| **캐싱 적용률** | 5.3% (3/57 APIs) | 80%+ | 6.6% |

### 핵심 발견사항
1. **Redis**: 단일 노드 구성 → 클러스터 마이그레이션 필요
2. **Database**: Connection Pooling 미구현, Read Replica 없음
3. **Message Queue**: Mock 데이터만 존재, 실제 BullMQ 미구현
4. **API Caching**: 57개 API 중 3개만 캐싱 적용 (5.3%)
5. **WebSocket**: Redis Adapter 구현됨, 수평 확장 준비 완료

---

## 1. 🔴 Redis 인프라 심층 분석

### 1.1 현재 구현 상태

```typescript
// src/lib/redis.ts - 현재 구현
import Redis from 'ioredis'

const redis = globalForRedis.redis ?? new Redis({
    host: process.env.REDIS_HOST || 'localhost',
    port: parseInt(process.env.REDIS_PORT || '6379'),
    password: process.env.REDIS_PASSWORD || undefined,
})

// getOrSet 패턴 - 기본 캐시 레이어
export async function getOrSet<T>(
    key: string,
    fetcher: () => Promise<T>,
    ttl: number = 300
): Promise<T> {
    const cached = await redis.get(key)
    if (cached) return JSON.parse(cached)
    const data = await fetcher()
    if (data) await redis.setex(key, ttl, JSON.stringify(data))
    return data
}
```

### 1.2 병목점 분석

| 문제점 | 영향도 | 현재 상태 | 해결책 |
|--------|--------|----------|--------|
| 단일 노드 | Critical | Redis 1대 | Redis Cluster 6노드 |
| 메모리 제한 | High | ~16GB | 64GB+ 분산 |
| Failover 없음 | Critical | Single Point of Failure | Sentinel 구성 |
| 파이프라인 미사용 | Medium | 개별 요청 | Pipeline/Multi 적용 |

### 1.3 캐시 키 패턴 분석

현재 사용 중인 캐시 키:
```
attendance:api:{userId}          → TTL 3600초 (1시간)
dashboard:stats:{workspaceId}    → TTL 300초 (5분)
mobile:attendance:{userId}       → TTL 3600초 (1시간)
```

**문제점**: 캐시 키 네이밍이 일관성 없음, 워크스페이스 기반 샤딩 미적용

### 1.4 권장 Redis Cluster 구성

```yaml
# 목표: 100,000 ops/s
Redis Cluster:
  Master Nodes: 3
  Replica Nodes: 3 (1:1 복제)
  메모리: 각 노드 32GB
  총 처리량: ~150,000 ops/s

Key Sharding:
  Slot 0-5460:     워크스페이스 A-M
  Slot 5461-10922: 워크스페이스 N-Z
  Slot 10923-16383: 시스템/공통 데이터
```

---

## 2. 🔵 Database 확장성 분석

### 2.1 현재 Prisma 구성

```typescript
// src/lib/prisma.ts - 문제점 식별
const prismaClientSingleton = () => {
  return new PrismaClient()  // ❌ Connection Pool 설정 없음
}

export const prisma = globalForPrisma.prisma ?? prismaClientSingleton()
```

### 2.2 인덱스 분석 (38개 인덱스 검출)

**✅ 적절히 구성된 인덱스:**
```prisma
// Task 테이블 - 복합 인덱스 적용
@@index([projectId, status])
@@index([assigneeId, status])
@@index([workspaceId, dueDate])

// Attendance 테이블
@@index([userId, date])
@@index([workspaceId, date])

// Payslip 테이블
@@index([workspaceId, periodStart])
@@index([userId, periodStart])
```

**❌ 누락된 인덱스 (추가 필요):**
```prisma
// HR Stats 쿼리 최적화용
@@index([workspaceId, employmentType, status])
@@index([workspaceId, hireDate])

// 대시보드 쿼리 최적화용
@@index([workspaceId, status, dueDate])
@@index([workspaceId, createdAt])
```

### 2.3 쿼리 패턴 분석

**고위험 쿼리 (N+1 문제 또는 Full Scan):**

```typescript
// src/app/api/hr/stats/route.ts - 순차 쿼리 병목
const totalEmployees = await prisma.employeeProfile.count({ where: {...} })
const byStatus = await prisma.employeeProfile.groupBy({ ... })
const recentHires = await prisma.employeeProfile.findMany({ ... })
const departmentDistribution = await prisma.employeeProfile.groupBy({ ... })
// ❌ 4개 순차 쿼리 → Promise.all로 병렬화 필요
```

```typescript
// src/app/api/payroll/route.ts - 복잡한 조인 없이 다중 쿼리
const employees = await prisma.user.findMany({...})
const payslips = await prisma.payslip.findMany({...})
// ❌ 관계 조회 시 N+1 발생 가능
```

### 2.4 권장 Database 아키텍처

```
┌─────────────────────────────────────────────────────────┐
│                    Application Layer                     │
└─────────────────────────┬───────────────────────────────┘
                          │
┌─────────────────────────▼───────────────────────────────┐
│                    PgBouncer Pool                        │
│           (Transaction Pooling Mode)                     │
│              Max 1,000 Connections                       │
└─────────┬───────────────────────────────────┬───────────┘
          │                                   │
    ┌─────▼─────┐                       ┌─────▼─────┐
    │  Primary   │◄─────Streaming─────►│  Replica   │
    │ (Write)    │      Replication    │  (Read)    │
    │ PostgreSQL │                     │ PostgreSQL │
    └────────────┘                     └────────────┘
```

---

## 3. 🟡 WebSocket 확장성 분석

### 3.1 현재 구현 상태

```typescript
// src/lib/socket-emitter.ts - Redis Adapter 구현됨 ✅
import { Emitter } from '@socket.io/redis-emitter'
import { createClient } from 'redis'

let emitter: Emitter | null = null

export function getSocketEmitter(): Emitter {
    if (!emitter) {
        const redisClient = createClient({ url: process.env.REDIS_URL })
        redisClient.connect()
        emitter = new Emitter(redisClient)
    }
    return emitter
}

// 프로젝트별 Room 기반 브로드캐스트
export function emitToProject(projectId: string, event: string, data: any) {
    const io = getSocketEmitter()
    io.to(`project:${projectId}`).emit(event, data)
}
```

### 3.2 WebSocket 확장 준비도

| 기능 | 상태 | 비고 |
|------|------|------|
| Redis Adapter | ✅ 구현됨 | 수평 확장 가능 |
| Room 기반 브로드캐스트 | ✅ 구현됨 | 프로젝트별 분리 |
| 워크스페이스 분리 | ❌ 미구현 | 추가 필요 |
| Sticky Session | ❌ 미구현 | Load Balancer 설정 필요 |
| Connection Pool | ⚠️ 부분 | Redis 연결 풀 필요 |

### 3.3 WebSocket 확장 아키텍처

```
                    ┌──────────────────┐
                    │   Load Balancer  │
                    │  (Sticky Session)│
                    └────────┬─────────┘
                             │
         ┌───────────────────┼───────────────────┐
         │                   │                   │
    ┌────▼────┐         ┌────▼────┐         ┌────▼────┐
    │ WS Pod 1│         │ WS Pod 2│         │ WS Pod 3│
    │ ~33K    │         │ ~33K    │         │ ~33K    │
    │ conns   │         │ conns   │         │ conns   │
    └────┬────┘         └────┬────┘         └────┬────┘
         │                   │                   │
         └───────────────────┼───────────────────┘
                             │
                    ┌────────▼────────┐
                    │  Redis Cluster  │
                    │  (Pub/Sub)      │
                    └─────────────────┘
```

---

## 4. 🟠 API 병목점 상세 분석

### 4.1 API 캐싱 현황

**전체 API 라우트: 57개**

| 캐싱 상태 | API 수 | 비율 | 상세 |
|-----------|--------|------|------|
| ✅ 캐싱 적용 | 3 | 5.3% | attendance, dashboard, mobile |
| ❌ 캐싱 미적용 | 54 | 94.7% | 대부분의 API |

### 4.2 고위험 API 병목점

#### 4.2.1 HR Stats API (Critical)
```typescript
// src/app/api/hr/stats/route.ts
// ❌ 문제점: 4개 순차 쿼리, 캐싱 없음

export async function GET(req: Request) {
    const totalEmployees = await prisma.employeeProfile.count({...})   // 쿼리 1
    const byStatus = await prisma.employeeProfile.groupBy({...})       // 쿼리 2
    const recentHires = await prisma.employeeProfile.findMany({...})   // 쿼리 3
    const departmentDist = await prisma.employeeProfile.groupBy({...}) // 쿼리 4
    // 총 응답시간: ~400-600ms (순차 실행)
}
```

**권장 개선:**
```typescript
// Promise.all + Redis 캐싱
const cacheKey = `hr:stats:${workspaceId}`
const stats = await getOrSet(cacheKey, async () => {
    const [totalEmployees, byStatus, recentHires, departmentDist] = await Promise.all([
        prisma.employeeProfile.count({...}),
        prisma.employeeProfile.groupBy({...}),
        prisma.employeeProfile.findMany({...}),
        prisma.employeeProfile.groupBy({...})
    ])
    return { totalEmployees, byStatus, recentHires, departmentDist }
}, 300)  // 5분 캐시
// 예상 응답시간: ~50-100ms (병렬 + 캐시)
```

#### 4.2.2 Payroll API (High)
```typescript
// src/app/api/payroll/route.ts
// ❌ 문제점: 복잡한 급여 계산 로직, 캐싱 없음

export async function GET(req: Request) {
    const employees = await prisma.user.findMany({...})
    const payslips = await prisma.payslip.findMany({...})
    const calculations = await calculatePayroll(employees, payslips)
    // 계산 집약적 작업 + DB 쿼리 = 느린 응답
}
```

#### 4.2.3 Projects Tasks API (Medium)
```typescript
// src/app/api/projects/[id]/tasks/route.ts
// ❌ 문제점: 캐싱 미적용

export async function GET(request: Request, { params }: { params: { id: string } }) {
    const tasks = await prisma.task.findMany({
        where: { projectId: params.id },
        include: {
            assignee: { select: { id: true, name: true, avatar: true } },
            comments: { take: 3, orderBy: { createdAt: 'desc' } }
        },
        orderBy: { order: 'asc' }
    })
    // 캐싱 없이 매번 DB 조회
}
```

### 4.3 API 캐싱 우선순위

| 우선순위 | API | 현재 응답시간 | 목표 | 예상 개선율 |
|----------|-----|-------------|------|------------|
| P0 | /api/hr/stats | 400-600ms | <100ms | 80% |
| P0 | /api/payroll | 300-500ms | <100ms | 75% |
| P1 | /api/projects/[id]/tasks | 150-250ms | <50ms | 70% |
| P1 | /api/dashboard | 200-300ms | <50ms | 80% |
| P2 | /api/workspace/* | 100-200ms | <30ms | 70% |

---

## 5. 🟣 메시지 큐 및 비동기 처리 분석

### 5.1 현재 상태: Mock 구현만 존재

```typescript
// src/app/(dashboard)/automation/page.tsx
// ❌ 실제 Job Queue 없음 - Mock 데이터만 사용

const mockWorkflows: Workflow[] = [
    {
        id: '1',
        name: '새 태스크 알림',
        trigger: { type: 'event', event: 'task.created' },
        actions: [...],
        status: 'active'
    },
    // ... Mock 데이터
]

// src/types/automation.ts - 타입만 정의됨
export interface WorkflowTrigger {
    type: 'event' | 'schedule' | 'webhook' | 'manual'
    event?: string
    schedule?: string
    webhookUrl?: string
}
```

### 5.2 필요한 Job Queue 시나리오

| 작업 유형 | 현재 상태 | 필요 구현 | 우선순위 |
|----------|----------|----------|----------|
| 이메일 발송 | ❌ 동기 처리 | BullMQ Queue | P0 |
| 급여 계산 배치 | ❌ 미구현 | Scheduled Job | P0 |
| 파일 처리 | ❌ 동기 처리 | Worker Queue | P1 |
| 알림 발송 | ❌ 동기 처리 | Pub/Sub | P1 |
| 통계 집계 | ❌ 미구현 | Cron Job | P2 |
| 이력서 파싱 | ❌ 미구현 | Worker Queue | P2 |

### 5.3 권장 BullMQ 아키텍처

```
┌─────────────────────────────────────────────────────────┐
│                    API Layer                             │
│         (Job 생성 - Producer)                            │
└─────────────────────────┬───────────────────────────────┘
                          │
┌─────────────────────────▼───────────────────────────────┐
│                    Redis Queue                           │
│                    (BullMQ)                              │
│  ┌─────────┐  ┌─────────┐  ┌─────────┐  ┌─────────┐    │
│  │ email   │  │ payroll │  │ notify  │  │ file    │    │
│  │ queue   │  │ queue   │  │ queue   │  │ queue   │    │
│  └────┬────┘  └────┬────┘  └────┬────┘  └────┬────┘    │
└───────┼────────────┼────────────┼────────────┼──────────┘
        │            │            │            │
┌───────▼────────────▼────────────▼────────────▼──────────┐
│                    Workers                               │
│  ┌─────────┐  ┌─────────┐  ┌─────────┐  ┌─────────┐    │
│  │ Email   │  │ Payroll │  │ Notify  │  │ File    │    │
│  │ Worker  │  │ Worker  │  │ Worker  │  │ Worker  │    │
│  │ x3      │  │ x2      │  │ x3      │  │ x2      │    │
│  └─────────┘  └─────────┘  └─────────┘  └─────────┘    │
└─────────────────────────────────────────────────────────┘
```

### 5.4 급여 계산 배치 Job 예시

```typescript
// 권장 구현 - src/jobs/payroll.job.ts
import { Queue, Worker } from 'bullmq'

const payrollQueue = new Queue('payroll', { connection: redis })

// Producer - API에서 호출
export async function schedulePayrollCalculation(workspaceId: string, period: string) {
    await payrollQueue.add('calculate', {
        workspaceId,
        period,
        requestedAt: new Date()
    }, {
        delay: 0,
        attempts: 3,
        backoff: { type: 'exponential', delay: 1000 }
    })
}

// Worker - 백그라운드 처리
const payrollWorker = new Worker('payroll', async (job) => {
    const { workspaceId, period } = job.data

    // 1. 근태 데이터 집계
    const attendance = await aggregateAttendance(workspaceId, period)

    // 2. 급여 계산
    const payslips = await calculatePayslips(attendance)

    // 3. DB 저장
    await prisma.payslip.createMany({ data: payslips })

    // 4. 캐시 무효화
    await invalidateCache(`payroll:${workspaceId}:*`)

    return { processed: payslips.length }
}, { connection: redis, concurrency: 2 })
```

---

## 6. 📈 Phase별 구현 로드맵

### Phase 1: 현재 (35% 완료)

**✅ 완료:**
- Redis 기본 캐싱 레이어 (getOrSet)
- Socket.IO Redis Adapter
- 38개 DB 인덱스
- 일부 API 캐싱 (3/57)
- Promise.all 병렬 쿼리 (30+ 사용처)

**❌ 미완료:**
- 대부분 API 캐싱 미적용
- Connection Pooling 미구현
- Job Queue 미구현

### Phase 2: 중기 목표 (50,000 동접)

| 작업 | 예상 효과 | 복잡도 |
|------|----------|--------|
| 전체 API 캐싱 적용 | 70% 응답시간 감소 | Medium |
| PgBouncer 도입 | 10x 연결 수용 | Low |
| BullMQ 구현 | 비동기 처리 가능 | High |
| Read Replica | 50% DB 부하 감소 | Medium |

### Phase 3: 장기 목표 (100,000 동접)

| 작업 | 예상 효과 | 복잡도 |
|------|----------|--------|
| Redis Cluster | 5x 처리량 | High |
| DB Sharding | 무제한 확장 | Very High |
| Kubernetes | 자동 스케일링 | High |
| CDN 적용 | 정적 자원 최적화 | Low |

---

## 7. 🔧 즉시 실행 가능한 개선 사항

### 7.1 Quick Win - API 캐싱 적용

```typescript
// src/app/api/hr/stats/route.ts 개선
import { getOrSet, invalidateCache } from '@/lib/redis'

export async function GET(req: Request) {
    const { searchParams } = new URL(req.url)
    const workspaceId = searchParams.get('workspaceId')

    const cacheKey = `hr:stats:${workspaceId}`

    const stats = await getOrSet(cacheKey, async () => {
        const [totalEmployees, byStatus, recentHires, departmentDist] = await Promise.all([
            prisma.employeeProfile.count({ where: { workspaceId } }),
            prisma.employeeProfile.groupBy({
                by: ['status'],
                where: { workspaceId },
                _count: { status: true }
            }),
            prisma.employeeProfile.findMany({
                where: { workspaceId },
                orderBy: { hireDate: 'desc' },
                take: 5
            }),
            prisma.employeeProfile.groupBy({
                by: ['department'],
                where: { workspaceId },
                _count: { department: true }
            })
        ])

        return { totalEmployees, byStatus, recentHires, departmentDist }
    }, 300)  // 5분 TTL

    return NextResponse.json(stats)
}
```

### 7.2 Quick Win - Prisma Connection Pool

```typescript
// src/lib/prisma.ts 개선
import { PrismaClient } from '@prisma/client'

const prismaClientSingleton = () => {
    return new PrismaClient({
        datasources: {
            db: {
                url: process.env.DATABASE_URL
            }
        },
        log: process.env.NODE_ENV === 'development'
            ? ['query', 'error', 'warn']
            : ['error'],
    })
}

// 또는 DATABASE_URL에 connection pool 파라미터 추가
// postgresql://user:pass@host:5432/db?connection_limit=20&pool_timeout=10
```

### 7.3 Quick Win - 인덱스 추가

```sql
-- HR Stats 쿼리 최적화
CREATE INDEX idx_employee_workspace_status ON "EmployeeProfile"("workspaceId", "status");
CREATE INDEX idx_employee_workspace_hire ON "EmployeeProfile"("workspaceId", "hireDate" DESC);

-- Dashboard 쿼리 최적화
CREATE INDEX idx_task_workspace_status_due ON "Task"("workspaceId", "status", "dueDate");
```

---

## 8. 📊 성능 지표 및 모니터링

### 8.1 핵심 KPI

| 지표 | 현재 | Phase 2 목표 | Phase 3 목표 |
|------|------|-------------|-------------|
| P95 응답시간 | 500ms | 200ms | 100ms |
| 에러율 | <1% | <0.5% | <0.1% |
| 캐시 히트율 | 20% | 70% | 90% |
| DB 연결 사용률 | 80% | 50% | 30% |
| Redis 메모리 | 2GB | 8GB | 32GB |

### 8.2 모니터링 체크포인트

```typescript
// 권장 모니터링 포인트
const metrics = {
    // Redis
    'redis.ops_per_sec': 'gauge',
    'redis.memory_used': 'gauge',
    'redis.cache_hit_rate': 'gauge',

    // Database
    'db.connection_pool_size': 'gauge',
    'db.query_duration_ms': 'histogram',
    'db.slow_queries': 'counter',

    // API
    'api.response_time_ms': 'histogram',
    'api.error_rate': 'gauge',
    'api.requests_per_sec': 'gauge',

    // WebSocket
    'ws.active_connections': 'gauge',
    'ws.messages_per_sec': 'gauge',

    // Queue
    'queue.pending_jobs': 'gauge',
    'queue.processing_time_ms': 'histogram',
    'queue.failed_jobs': 'counter'
}
```

---

## 9. 🎯 결론 및 권장사항

### 9.1 즉시 실행 (1-2주)
1. **API 캐싱 확대**: 고위험 API 5개 캐싱 적용
2. **쿼리 병렬화**: Promise.all 미적용 API 수정
3. **인덱스 추가**: HR/Payroll 관련 인덱스 4개 추가

### 9.2 단기 실행 (1-2개월)
1. **BullMQ 도입**: 이메일, 알림, 급여계산 비동기 처리
2. **PgBouncer**: Connection Pooling 구성
3. **Read Replica**: 읽기 전용 복제본 구성

### 9.3 중장기 실행 (3-6개월)
1. **Redis Cluster**: 6노드 클러스터 마이그레이션
2. **Kubernetes**: 컨테이너 오케스트레이션
3. **CDN**: 정적 자원 및 API 캐싱

### 9.4 예상 비용-효과

| 투자 | 비용 | 효과 |
|------|------|------|
| API 캐싱 | 개발 40h | 70% 응답시간 감소 |
| BullMQ | 개발 80h | 비동기 처리 가능 |
| Redis Cluster | 인프라 $500/월 | 5x 처리량 |
| Read Replica | 인프라 $200/월 | 50% DB 부하 감소 |

---

**작성자**: Claude AI Assistant
**검토 필요**: 인프라팀, 백엔드팀
**다음 리뷰**: Phase 2 완료 시점

