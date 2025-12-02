# CodeB Platform - 확장성 분석 및 인프라 요구사항

**목표**: 1만 워크스페이스 × 10명 = 10만 동시접속자 대응

**분석 일자**: 2025-01-24
**작성자**: CodeB Development Team

---

## 📊 현재 아키텍처 분석

### 기술 스택
```yaml
Frontend:
  - Next.js 14.1.0 (App Router)
  - TypeScript 5.x
  - Socket.io-client 4.8.1

Backend:
  - Next.js API Routes + Server Actions
  - Prisma ORM 5.10
  - Socket.io Server 4.8.1

Database:
  - PostgreSQL 14+ (Primary DB)
  - Redis 7 (Cache & Session)

Real-time:
  - Socket.io 4.8.1 (WebSocket)
```

### 데이터 모델 복잡도
- **17개 주요 모델**: Workspace, User, Project, Task, Attendance 등
- **관계 복잡도**: 다대다 관계 5개, 일대다 관계 30+개
- **인덱스**: 10개 복합 인덱스 설정됨

---

## 🗄️ 데이터베이스 성능 분석

### 예상 데이터 규모

#### 워크스페이스당 데이터
```
- 워크스페이스: 1개
- 사용자: 10명
- 프로젝트: 평균 5개
- 태스크: 프로젝트당 50개 = 250개
- 근태 기록: 사용자당 월 20일 = 200개/월
- 활동 로그: 일 100개 = 3,000개/월
```

#### 전체 규모 (1만 워크스페이스)
```yaml
Users: 100,000명
Workspaces: 10,000개
Projects: 50,000개
Tasks: 2,500,000개
Attendance (월별): 2,000,000건
Activities (월별): 30,000,000건
```

### PostgreSQL 성능 예측

#### 데이터베이스 크기 추정
```
Users: 100K × 1KB = 100MB
Projects: 50K × 2KB = 100MB
Tasks: 2.5M × 2KB = 5GB
Attendance (1년): 24M × 0.5KB = 12GB
Activities (1년): 360M × 0.5KB = 180GB
Total (1년): ~200GB
인덱스 오버헤드 30%: ~260GB
```

#### 쿼리 성능 분석
```yaml
단순 SELECT (인덱스):
  - 응답시간: < 10ms
  - TPS: 10,000+

복잡 JOIN (3-4 테이블):
  - 응답시간: 50-100ms
  - TPS: 1,000-2,000

집계 쿼리 (GROUP BY):
  - 응답시간: 100-500ms
  - TPS: 200-500

전체 검색 (LIKE):
  - 응답시간: 500-2000ms
  - TPS: 50-100
```

#### 병목 구간
1. **복잡한 JOIN 쿼리**
   - Task + Project + User + Workspace (4-way JOIN)
   - 대시보드 통계 조회

2. **전문 검색**
   - 프로젝트/태스크 검색 (LIKE 쿼리)
   - 해결책: PostgreSQL Full-Text Search 또는 ElasticSearch

3. **활동 로그 누적**
   - 월 3천만건 누적 시 조회 성능 저하
   - 해결책: 파티셔닝 또는 별도 로그 DB

### 데이터베이스 확장 전략

#### 수직 확장 (Vertical Scaling)
```yaml
초기 (1-1000 워크스페이스):
  CPU: 4 vCPU
  RAM: 16GB
  Storage: 100GB SSD
  예상 비용: $100-150/월

중기 (1000-5000 워크스페이스):
  CPU: 8 vCPU
  RAM: 32GB
  Storage: 500GB SSD
  예상 비용: $300-400/월

목표 (5000-10000 워크스페이스):
  CPU: 16 vCPU
  RAM: 64GB
  Storage: 1TB SSD
  예상 비용: $600-800/월
```

#### 수평 확장 (Horizontal Scaling)
```yaml
Read Replica 전략:
  - Master: 1대 (Write)
  - Replica: 2-3대 (Read)
  - 읽기 부하 분산: 70-80% 개선

Connection Pooling:
  - PgBouncer 도입
  - 최대 연결: 1000개 → 100개로 감소
  - 성능: 2-3배 향상

파티셔닝:
  - Attendance: 월별 파티션
  - Activity: 월별 파티션
  - 쿼리 성능: 50-70% 향상
```

---

## ⚡ Redis 캐싱 전략

### 캐시 대상 데이터

#### 고빈도 읽기 데이터
```yaml
사용자 세션:
  - TTL: 24시간
  - 크기: 1KB/유저
  - 총용량: 100MB (10만 유저)

워크스페이스 정보:
  - TTL: 1시간
  - 크기: 5KB/워크스페이스
  - 총용량: 50MB (1만 워크스페이스)

프로젝트 목록:
  - TTL: 10분
  - 크기: 100KB/워크스페이스
  - 총용량: 1GB (1만 워크스페이스)

대시보드 통계:
  - TTL: 5분
  - 크기: 10KB/워크스페이스
  - 총용량: 100MB (1만 워크스페이스)
```

### Redis 메모리 요구사항

```yaml
총 메모리 계산:
  세션: 100MB
  워크스페이스: 50MB
  프로젝트: 1GB
  통계: 100MB
  기타: 200MB
  총계: 1.45GB

안전 마진 (2배): 3GB
권장 메모리: 4-8GB
예상 비용: $30-60/월 (AWS ElastiCache)
```

### Redis Cluster 전략

```yaml
초기 (1-3000 워크스페이스):
  - 단일 인스턴스: 4GB
  - 비용: $30/월

중기 (3000-7000 워크스페이스):
  - Master-Replica: 2노드 × 8GB
  - 고가용성: Redis Sentinel
  - 비용: $120/월

목표 (7000-10000 워크스페이스):
  - Redis Cluster: 3-6 샤드
  - 메모리: 총 16-32GB
  - 비용: $200-300/월
```

---

## 🔌 Socket.io 실시간 통신 분석

### 동시접속 분석

#### 피크 시간대 예측
```yaml
전체 사용자: 100,000명
업무시간 동시접속률: 40%
피크 시간 동시접속: 40,000명

워크스페이스당:
  평균 동시접속: 4명 (10명 중 40%)
  활성 워크스페이스: 8,000개 (피크시)
```

#### WebSocket 연결 부하
```yaml
연결당 메모리: 10KB
40,000 연결: 400MB

메시지 처리:
  평균 메시지/초: 100개 (활성 사용자당)
  총 메시지/초: 4,000개
  대역폭: ~400KB/초 (메시지당 100바이트)
```

### Socket.io 확장 전략

#### 현재 구조 문제점
```javascript
// 단일 Node.js 프로세스
// - 최대 동시접속: 10,000-15,000
// - CPU 바운드: 단일 코어 사용
// - 메모리: 2-3GB
```

#### 권장 확장 구조

##### 1단계: Redis Adapter (1-20,000 동시접속)
```yaml
구성:
  - Socket.io + Redis Pub/Sub
  - 다중 Node.js 프로세스 (PM2 클러스터)
  - 로드밸런서 (Nginx/HAProxy)

서버 스펙:
  - CPU: 4 vCPU
  - RAM: 8GB
  - 프로세스: 4개
  - 예상 비용: $100/월

성능:
  - 동시접속: 최대 20,000
  - 메시지 처리: 10,000 msg/s
```

```javascript
// Socket.io with Redis Adapter
import { createAdapter } from '@socket.io/redis-adapter';
import { redis } from './lib/redis';

const io = new Server(httpServer);
io.adapter(createAdapter(redis, redis.duplicate()));
```

##### 2단계: 수평 확장 (20,000-50,000 동시접속)
```yaml
구성:
  - Socket.io 서버: 3-5대
  - Redis Cluster
  - 로드밸런서: Sticky Session 지원

서버당 스펙:
  - CPU: 2 vCPU
  - RAM: 4GB
  - 동시접속: 10,000

총 비용: $150-250/월
```

##### 3단계: 목표 확장 (40,000-100,000 동시접속)
```yaml
구성:
  - Socket.io 서버: 8-10대
  - Redis Cluster: 3-6 샤드
  - 로드밸런서: AWS ALB/NLB

서버당 스펙:
  - CPU: 2 vCPU
  - RAM: 4GB
  - 동시접속: 5,000-8,000

총 비용: $400-600/월
```

---

## 🖥️ Next.js 서버 요구사항

### 서버 사이드 렌더링 부하

#### 페이지별 렌더링 비용
```yaml
대시보드:
  - 렌더링 시간: 200-500ms
  - DB 쿼리: 5-10개
  - 메모리: 50-100MB

프로젝트 상세:
  - 렌더링 시간: 300-800ms
  - DB 쿼리: 10-20개
  - 메모리: 100-200MB

태스크 목록:
  - 렌더링 시간: 100-300ms
  - DB 쿼리: 3-5개
  - 메모리: 30-50MB
```

#### 동시 요청 처리
```yaml
피크 시간 요청:
  - 초당 페이지뷰: 500-1000 req/s
  - API 요청: 2000-3000 req/s

Next.js 서버 처리량:
  - 단일 인스턴스: 100-200 req/s
  - 필요 인스턴스: 5-10대
```

### Next.js 확장 전략

#### Auto-Scaling 구성
```yaml
초기 (1-2000 워크스페이스):
  - 인스턴스: 2대
  - CPU: 2 vCPU
  - RAM: 4GB
  - 비용: $100/월

중기 (2000-5000 워크스페이스):
  - 인스턴스: 3-5대
  - CPU: 2 vCPU
  - RAM: 4GB
  - Auto-scaling: CPU 70%
  - 비용: $200-300/월

목표 (5000-10000 워크스페이스):
  - 인스턴스: 5-10대
  - CPU: 2 vCPU
  - RAM: 4GB
  - Auto-scaling: CPU 60%
  - CDN: Vercel Edge Network
  - 비용: $400-600/월
```

---

## 💰 총 인프라 비용 산정

### 단계별 비용 예측

#### 초기 단계 (1-2000 워크스페이스, 2만 동시접속)
```yaml
Next.js 서버: 2대 × $50 = $100
PostgreSQL: 4vCPU, 16GB = $150
Redis: 4GB = $30
Socket.io: 1대 = $50
CDN/로드밸런서: $50
총계: $380/월

예상 MRR (월 구독료):
  - 무료 플랜: 50%
  - 유료 플랜: 50% × $10 = $10,000
수익성: 매우 양호
```

#### 중기 단계 (2000-5000 워크스페이스, 5만 동시접속)
```yaml
Next.js 서버: 4대 × $50 = $200
PostgreSQL: 8vCPU, 32GB = $400
Redis Cluster: 2노드 = $120
Socket.io: 3대 × $50 = $150
CDN/로드밸런서: $100
모니터링/백업: $50
총계: $1,020/월

예상 MRR:
  - 유료 플랜: 2,500개 × $10 = $25,000
수익성: 양호
```

#### 목표 단계 (5000-10000 워크스페이스, 10만 동시접속)
```yaml
Next.js 서버: 8대 × $50 = $400
PostgreSQL: 16vCPU, 64GB + 2 Replica = $1,200
Redis Cluster: 6샤드 = $300
Socket.io: 8대 × $50 = $400
CDN/로드밸런서: $200
모니터링/백업/로그: $150
총계: $2,650/월

예상 MRR:
  - 유료 플랜: 5,000개 × $10 = $50,000
수익성: 양호 (수익률 95%)
```

---

## ⚠️ 현재 시스템의 한계

### 🔴 심각한 병목 구간

#### 1. Socket.io 단일 프로세스
```yaml
문제:
  - 현재: 단일 Node.js 프로세스
  - 최대 동시접속: 10,000-15,000
  - 목표: 40,000+ 동시접속
  - 부족분: 250%+

해결 필수:
  ✅ Redis Adapter 도입
  ✅ PM2 클러스터 모드
  ✅ 로드밸런서 구성
```

#### 2. 데이터베이스 연결 관리
```yaml
문제:
  - Prisma 기본 연결 풀: 10개
  - 10만 동시 사용자 → 연결 부족

해결 필수:
  ✅ PgBouncer 도입
  ✅ Connection Pooling
  ✅ Read Replica 구성
```

#### 3. 전문 검색 성능
```yaml
문제:
  - LIKE 쿼리: 500-2000ms
  - 250만 태스크 검색 시 타임아웃

해결 권장:
  ✅ PostgreSQL Full-Text Search
  ⚠️ ElasticSearch (비용 증가)
```

### 🟡 중간 우선순위 개선

#### 1. 정적 파일 캐싱
```yaml
현재: Next.js 자체 캐싱
개선: CDN (Vercel Edge, CloudFront)
효과: 서버 부하 50% 감소
```

#### 2. API 응답 캐싱
```yaml
현재: 캐싱 미구현
개선: Redis 기반 캐싱
대상: 대시보드 통계, 프로젝트 목록
효과: DB 부하 70% 감소
```

#### 3. 이미지 최적화
```yaml
현재: 원본 이미지 전송
개선: Next.js Image Optimization
효과: 대역폭 60% 감소
```

---

## ✅ 즉시 적용 가능한 최적화

### 1. Prisma Connection Pool 설정
```typescript
// prisma/schema.prisma
datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
  // 연결 풀 증가
  connection_limit = 100
}
```

### 2. Redis 캐싱 구현
```typescript
// src/lib/cache.ts
import { redis } from './redis';

export async function getCached<T>(
  key: string,
  fetcher: () => Promise<T>,
  ttl: number = 300
): Promise<T> {
  const cached = await redis.get(key);
  if (cached) return JSON.parse(cached);

  const data = await fetcher();
  await redis.setex(key, ttl, JSON.stringify(data));
  return data;
}

// 사용 예시
const stats = await getCached(
  `stats:${workspaceId}`,
  () => prisma.project.count({ where: { workspaceId } }),
  300 // 5분 TTL
);
```

### 3. Socket.io Redis Adapter
```bash
npm install @socket.io/redis-adapter
```

```typescript
// src/pages/api/socket/io.ts
import { createAdapter } from '@socket.io/redis-adapter';
import { createClient } from 'redis';

const pubClient = createClient({ url: process.env.REDIS_URL });
const subClient = pubClient.duplicate();

await Promise.all([pubClient.connect(), subClient.connect()]);

io.adapter(createAdapter(pubClient, subClient));
```

### 4. Database 인덱스 추가
```sql
-- 자주 조회되는 필드에 인덱스 추가
CREATE INDEX idx_task_status ON "Task"(status);
CREATE INDEX idx_task_assignee ON "Task"("assigneeId");
CREATE INDEX idx_project_workspace ON "Project"("workspaceId");
CREATE INDEX idx_activity_project_time ON "Activity"("projectId", "timestamp" DESC);
```

---

## 📈 단계별 확장 로드맵

### Phase 1: 즉시 적용 (현재 → 1개월)
```yaml
목표: 2,000 워크스페이스, 2만 동시접속

작업:
  ✅ Prisma Connection Pool 증가
  ✅ Redis 캐싱 구현
  ✅ 필수 인덱스 추가
  ✅ Socket.io Redis Adapter

예상 비용: $380/월
예상 수익: $10,000/월
```

### Phase 2: 중기 확장 (1-3개월)
```yaml
목표: 5,000 워크스페이스, 5만 동시접속

작업:
  ✅ PgBouncer 도입
  ✅ Read Replica 구성
  ✅ Next.js Auto-Scaling
  ✅ Redis Cluster
  ✅ Socket.io 수평 확장

예상 비용: $1,020/월
예상 수익: $25,000/월
```

### Phase 3: 목표 달성 (3-6개월)
```yaml
목표: 10,000 워크스페이스, 10만 동시접속

작업:
  ✅ PostgreSQL Sharding 검토
  ✅ ElasticSearch 도입 (검색)
  ✅ CDN 최적화
  ✅ 모니터링 강화 (DataDog/NewRelic)
  ✅ 장애 대응 자동화

예상 비용: $2,650/월
예상 수익: $50,000/월
```

---

## 🎯 결론 및 권장사항

### ✅ 현재 시스템 대응 가능 여부

**10만 동시접속 대응**: ⚠️ **부분 가능** (즉시 개선 필요)

```yaml
현재 상태:
  - 동시접속 한계: 10,000-15,000명 (Socket.io 단일 프로세스)
  - DB 연결 한계: 10개 (Prisma 기본 설정)
  - 캐싱: 미구현

즉시 개선 후:
  - 동시접속 한계: 40,000-50,000명 (Redis Adapter + 클러스터)
  - DB 연결 한계: 100-200개 (PgBouncer)
  - 캐싱: 구현 완료
  - 대응 가능: ✅ 충분

비용 대비 수익:
  - 초기 비용: $380/월
  - 예상 수익: $10,000-50,000/월
  - 수익률: 95%+ (매우 우수)
```

### 🚀 즉시 실행 필수 작업

#### 우선순위 1 (필수)
1. Socket.io Redis Adapter 구현
2. Prisma Connection Pool 증가
3. Redis 캐싱 구현
4. 필수 DB 인덱스 추가

#### 우선순위 2 (1개월 내)
1. PgBouncer 도입
2. Read Replica 구성
3. Next.js Auto-Scaling 설정
4. 모니터링 구축

#### 우선순위 3 (3개월 내)
1. Redis Cluster 구성
2. Socket.io 수평 확장
3. CDN 최적화
4. ElasticSearch 검토

### 💡 핵심 메시지

> **현재 시스템은 즉시 개선 작업 후 10만 동시접속 대응 가능합니다.**
>
> - 비용: 월 $380-2,650 (단계별)
> - 수익: 월 $10,000-50,000 (무료+유료 혼합)
> - ROI: 95%+ (매우 우수)
>
> **SaaS 서비스로 충분히 수익성 확보 가능합니다.**

---

**다음 단계**: [IMPLEMENTATION_PLAN.md](./IMPLEMENTATION_PLAN.md) 참조

**문서 버전**: 1.0.0
**최종 업데이트**: 2025-01-24
**작성자**: CodeB Development Team
