# User Registration & Workspace Joining Implementation Summary

## Overview
두 가지 사용자 등록 방식이 완전히 구현되었습니다:
1. **이메일 초대 방식**: 관리자가 이메일로 초대 → 사용자가 수락
2. **직접 가입 방식**: 사용자가 먼저 가입 → 워크스페이스 검색 → 가입 요청 → 관리자 승인

## Database Schema Changes

### New Enums
```prisma
enum InvitationStatus {
  PENDING   // 초대 대기 중
  ACCEPTED  // 수락됨
  EXPIRED   // 만료됨
  REVOKED   // 취소됨
}

enum JoinRequestStatus {
  PENDING   // 승인 대기 중
  APPROVED  // 승인됨
  REJECTED  // 거절됨
  CANCELLED // 사용자가 취소함
}
```

### New Models

#### Invitation (초대)
```prisma
model Invitation {
  id          String           @id @default(uuid())
  workspaceId String
  email       String          // 초대받은 이메일
  token       String   @unique // 초대 토큰 (32자)
  role        Role     @default(member)
  invitedBy   String          // 초대한 사람
  status      InvitationStatus @default(PENDING)
  expiresAt   DateTime        // 7일 후 만료
  acceptedAt  DateTime?       // 수락 시간
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
}
```

#### JoinRequest (가입 요청)
```prisma
model JoinRequest {
  id          String            @id @default(uuid())
  workspaceId String
  userId      String
  message     String?           // 가입 요청 메시지
  status      JoinRequestStatus @default(PENDING)
  reviewedBy  String?           // 검토한 관리자
  reviewedAt  DateTime?         // 검토 시간
  reviewNote  String?           // 검토 메모
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt

  @@unique([workspaceId, userId]) // 중복 요청 방지
}
```

### Updated Models

#### Workspace
새로운 필드:
- `slug`: URL 친화적 식별자 (예: codeb-team)
- `inviteCode`: 짧은 초대 코드 (예: ABC123)
- `isPublic`: 공개 워크스페이스 여부
- `requireApproval`: 가입 요청 승인 필요 여부

#### User
새로운 관계:
- `sentInvitations`: 보낸 초대 목록
- `joinRequests`: 가입 요청 목록
- `reviewedRequests`: 검토한 가입 요청 목록

## API Endpoints

### Invitation Flow (이메일 초대)

#### 1. POST /api/workspaces/[workspaceId]/invitations
**목적**: 이메일 초대 발송
**권한**: 워크스페이스 관리자만
**요청**:
```json
{
  "email": "user@example.com",
  "role": "member",
  "invitedBy": "admin-user-id"
}
```
**응답**:
```json
{
  "success": true,
  "invitation": {
    "id": "inv-xxx",
    "email": "user@example.com",
    "role": "member",
    "status": "PENDING",
    "expiresAt": "2025-12-01T00:00:00Z"
  }
}
```
**동작**:
- 초대 토큰 생성 (nanoid 32자)
- 7일 만료 기한 설정
- noreply@workb.net에서 초대 이메일 발송
- 초대 링크: `/invitations/accept?token=xxx`

#### 2. GET /api/workspaces/[workspaceId]/invitations
**목적**: 초대 목록 조회
**쿼리**: `?status=PENDING` (선택)
**응답**:
```json
{
  "invitations": [
    {
      "id": "inv-xxx",
      "email": "user@example.com",
      "status": "PENDING",
      "inviter": {
        "name": "Admin User",
        "email": "admin@example.com"
      }
    }
  ]
}
```

#### 3. GET /api/invitations/accept?token=xxx
**목적**: 초대 정보 조회
**응답**:
```json
{
  "invitation": {
    "email": "user@example.com",
    "role": "member",
    "status": "PENDING",
    "expiresAt": "2025-12-01T00:00:00Z",
    "workspace": {
      "id": "ws-xxx",
      "name": "CodeB Team"
    },
    "inviter": {
      "name": "Admin User"
    }
  }
}
```

#### 4. POST /api/invitations/accept
**목적**: 초대 수락
**요청**:
```json
{
  "token": "invitation-token",
  "userId": "user-id" // 로그인한 사용자 (선택)
}
```
**응답 (로그인 필요)**:
```json
{
  "requiresSignup": true,
  "workspace": {
    "id": "ws-xxx",
    "name": "CodeB Team"
  },
  "invitation": {
    "email": "user@example.com",
    "role": "member"
  }
}
```
**응답 (성공)**:
```json
{
  "success": true,
  "workspace": { ... },
  "member": { ... }
}
```

### Join Request Flow (직접 가입)

#### 1. GET /api/workspaces/search?q=codeb
**목적**: 워크스페이스 검색
**검색 대상**: slug, inviteCode, name
**응답**:
```json
{
  "workspaces": [
    {
      "id": "ws-xxx",
      "name": "CodeB Team",
      "slug": "codeb-team",
      "isPublic": true,
      "requireApproval": true,
      "_count": {
        "members": 15
      }
    }
  ]
}
```

#### 2. POST /api/workspaces/search
**목적**: 초대 코드로 워크스페이스 찾기
**요청**:
```json
{
  "code": "ABC123"
}
```
**응답**:
```json
{
  "workspace": {
    "id": "ws-xxx",
    "name": "CodeB Team",
    "slug": "codeb-team"
  }
}
```

#### 3. POST /api/workspaces/[workspaceId]/join-requests
**목적**: 가입 요청 생성
**요청**:
```json
{
  "userId": "user-id",
  "message": "안녕하세요, 가입하고 싶습니다."
}
```
**응답**:
```json
{
  "success": true,
  "joinRequest": {
    "id": "req-xxx",
    "status": "PENDING",
    "user": {
      "name": "John Doe",
      "email": "john@example.com"
    },
    "workspace": {
      "name": "CodeB Team"
    }
  }
}
```

#### 4. GET /api/workspaces/[workspaceId]/join-requests
**목적**: 가입 요청 목록 조회
**쿼리**:
- `?status=PENDING` (상태 필터)
- `?userId=xxx` (특정 사용자)
**응답**:
```json
{
  "joinRequests": [
    {
      "id": "req-xxx",
      "status": "PENDING",
      "message": "가입하고 싶습니다",
      "user": {
        "name": "John Doe",
        "email": "john@example.com",
        "avatar": "..."
      },
      "createdAt": "2025-11-24T07:00:00Z"
    }
  ]
}
```

#### 5. POST /api/workspaces/[workspaceId]/join-requests/[requestId]/review
**목적**: 가입 요청 승인/거절
**권한**: 워크스페이스 관리자만
**요청**:
```json
{
  "reviewerId": "admin-user-id",
  "action": "approve", // or "reject"
  "reviewNote": "환영합니다!"
}
```
**응답 (승인)**:
```json
{
  "success": true,
  "joinRequest": {
    "status": "APPROVED",
    "reviewedBy": "admin-user-id",
    "reviewedAt": "2025-11-24T07:30:00Z"
  },
  "member": {
    "id": "member-xxx",
    "role": "member"
  }
}
```

#### 6. DELETE /api/workspaces/[workspaceId]/join-requests/[requestId]/review?userId=xxx
**목적**: 가입 요청 취소 (사용자 본인만)
**응답**:
```json
{
  "success": true,
  "joinRequest": {
    "status": "CANCELLED"
  }
}
```

## Email Configuration

### Mail Server Details
- **Host**: mail.workb.net
- **Port**: 587 (STARTTLS)
- **From**: noreply@workb.net
- **Authentication**: SMTP credentials

### Environment Variables
```env
MAIL_PASSWORD=<mail-server-password>
NEXT_PUBLIC_APP_URL=https://workb.net
```

### Invitation Email Template
```html
<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
  <h2>Join {workspace} on CodeB Platform</h2>
  <p>Hi there,</p>
  <p>{inviter} has invited you to join <strong>{workspace}</strong> on CodeB Platform.</p>
  <p>Click the button below to accept the invitation:</p>
  <div style="text-align: center; margin: 30px 0;">
    <a href="{invitationUrl}" style="background-color: #4F46E5; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">
      Accept Invitation
    </a>
  </div>
  <p>This invitation will expire in 7 days.</p>
</div>
```

## Security Features

### Invitation Security
- ✅ Unique 32-character tokens (nanoid)
- ✅ 7일 자동 만료
- ✅ 이메일 검증 (초대받은 이메일과 로그인 이메일 일치 확인)
- ✅ 중복 초대 방지
- ✅ 관리자 권한 검증

### Join Request Security
- ✅ 워크스페이스별 사용자별 1개 요청만 허용 (unique constraint)
- ✅ 이미 멤버인 경우 요청 불가
- ✅ 관리자만 승인/거절 가능
- ✅ 사용자 본인만 취소 가능
- ✅ 거절 후 재신청 가능

## Migration Status

### Completed ✅
- [x] Prisma schema 업데이트
- [x] Migration 파일 생성 및 적용
- [x] Prisma Client 재생성
- [x] 이메일 초대 API 구현
- [x] 가입 요청 API 구현
- [x] 워크스페이스 검색 API 구현

### Pending 🔄
- [ ] 초대 수락 UI 페이지 (`/invitations/accept`)
- [ ] 워크스페이스 검색 UI
- [ ] 가입 요청 폼 UI
- [ ] 관리자 가입 요청 관리 UI
- [ ] 이메일 알림 시스템 (가입 요청 알림, 승인/거절 알림)
- [ ] Port 25 승인 대기 (현재 이메일 발송 불가)

## Testing Plan

### Manual Testing (Port 25 승인 후)

#### Invitation Flow
1. 관리자로 로그인
2. POST `/api/workspaces/{id}/invitations` - 초대 생성
3. 이메일 수신 확인
4. 초대 링크 클릭
5. 로그인/회원가입
6. POST `/api/invitations/accept` - 초대 수락
7. 워크스페이스 멤버 확인

#### Join Request Flow
1. 사용자 회원가입 (Google OAuth)
2. GET `/api/workspaces/search?q=codeb` - 워크스페이스 검색
3. POST `/api/workspaces/{id}/join-requests` - 가입 요청
4. 관리자 알림 확인
5. POST `/api/workspaces/{id}/join-requests/{reqId}/review` - 승인
6. 사용자 알림 확인
7. 워크스페이스 멤버 확인

### Database Verification
```sql
-- Check invitations
SELECT * FROM "Invitation" WHERE "workspaceId" = 'ws-xxx';

-- Check join requests
SELECT * FROM "JoinRequest" WHERE "workspaceId" = 'ws-xxx';

-- Check workspace members
SELECT * FROM "WorkspaceMember" WHERE "workspaceId" = 'ws-xxx';

-- Check workspace slug and invite code
SELECT id, name, slug, "inviteCode", "isPublic", "requireApproval"
FROM "Workspace";
```

## Next Steps

### Immediate (Port 25 승인 전)
1. UI 페이지 구현
   - `/invitations/accept` 페이지
   - 워크스페이스 검색 페이지
   - 가입 요청 관리 대시보드

2. Google OAuth 통합
   - NextAuth.js 설정
   - OAuth 콜백 처리
   - 초대 수락 후 자동 로그인

### After Port 25 Approval
1. 이메일 발송 테스트
   - 초대 이메일 발송
   - 알림 이메일 발송
2. End-to-end 테스트
3. Production 배포

## File Structure
```
src/
├── app/
│   └── api/
│       ├── invitations/
│       │   └── accept/
│       │       └── route.ts         # 초대 수락 API
│       └── workspaces/
│           ├── search/
│           │   └── route.ts         # 워크스페이스 검색 API
│           └── [workspaceId]/
│               ├── invitations/
│               │   └── route.ts     # 초대 생성/목록 API
│               └── join-requests/
│                   ├── route.ts     # 가입 요청 생성/목록 API
│                   └── [requestId]/
│                       └── review/
│                           └── route.ts  # 가입 요청 검토 API
├── prisma/
│   ├── schema.prisma                # 업데이트된 스키마
│   └── migrations/
│       └── 20251124074731_add_invitation_and_join_request_models/
│           └── migration.sql        # Migration SQL
└── docs/
    ├── USER_REGISTRATION_FLOWS.md   # 플로우 문서
    └── IMPLEMENTATION_SUMMARY.md    # 본 문서
```

## Performance Considerations

### Database Indexes
```sql
-- Invitation indexes (already created)
CREATE INDEX "Invitation_email_idx" ON "Invitation"("email");
CREATE INDEX "Invitation_token_idx" ON "Invitation"("token");
CREATE INDEX "Invitation_workspaceId_idx" ON "Invitation"("workspaceId");
CREATE INDEX "Invitation_status_idx" ON "Invitation"("status");

-- JoinRequest indexes (already created)
CREATE INDEX "JoinRequest_userId_idx" ON "JoinRequest"("userId");
CREATE INDEX "JoinRequest_workspaceId_status_idx" ON "JoinRequest"("workspaceId", "status");
```

### Expected Load
- 초대 이메일: 최대 100,000건
- 동시 가입 요청: ~1,000건/일
- 워크스페이스 검색: ~10,000 쿼리/일

### Optimization
- Redis 캐싱 for 워크스페이스 검색 결과
- 이메일 발송 큐 시스템 (Bull/BullMQ)
- 만료된 초대 자동 정리 (Cron job)

---

**구현 완료**: 2025-11-24
**다음 단계**: Port 25 승인 대기 및 UI 구현
