# CodeB Platform - 프로젝트 관리 & CMS 플랫폼

CodeB Platform은 Next.js 14, React 18, TypeScript, Firebase를 기반으로 구축된 현대적인 프로젝트 관리 및 콘텐츠 관리 시스템(CMS)을 결합한 종합 비즈니스 플랫폼입니다. 

**✅ 프로덕션 배포 준비 완료** - 최신 개선으로 안전하고 최적화된 상태입니다.

## 🚀 주요 기능

### 1. **인증 및 권한 관리**
- Firebase Authentication 기반 로그인/회원가입
- 역할 기반 접근 제어 (RBAC)
  - Admin (관리자)
  - Manager (매니저)
  - Developer (개발자)
  - Customer (고객)
- Google 소셜 로그인 지원
- 실시간 온라인/오프라인 상태 관리

### 2. **대시보드**
- 역할별 맞춤형 통계 표시
- 실시간 데이터 업데이트
- 빠른 액션 버튼
- 최근 활동 피드
- 알림 센터
- 프로젝트 진행 상황 개요

### 3. **프로젝트 관리**
- 프로젝트 생성/수정/삭제
- 실시간 진행률 추적
- 팀 구성원 관리
- 예산 및 일정 관리
- 프로젝트 상태 관리 (기획/디자인/개발/테스트/완료)
- 검색 및 필터링 기능
- 그리드/테이블 뷰 전환

### 4. **프로젝트 상세 페이지**
- 종합적인 프로젝트 개요
- 작업 관리 시스템
  - 작업 생성/할당
  - 우선순위 설정
  - 진행 상태 추적
- 마일스톤 관리
- 파일 공유
- 활동 타임라인
- 팀 구성원 정보

### 5. **실시간 채팅**
- Firebase Realtime Database 기반 실시간 메시징
- 채팅방 생성 및 관리
- 온라인/오프라인 상태 표시
- 타이핑 인디케이터
- 파일 공유 지원
- 읽음 확인 기능
- 채팅방 검색

### 6. **파일 관리**
- 드래그 앤 드롭 파일 업로드
- 파일 미리보기
- 폴더 구조 관리
- 파일 공유 및 권한 설정
- 버전 관리

### 7. **AI 어시스턴트**
- 프로젝트 인사이트 제공
- 작업 추천
- 리스크 분석
- 일정 최적화 제안

### 8. **자동화 워크플로우**
- 워크플로우 빌더
- 트리거 및 액션 설정
- 실행 모니터링
- 워크플로우 템플릿

### 9. **분석 및 예측**
- 프로젝트 분석 대시보드
- 예측 분석
- 성과 지표 추적
- 맞춤형 보고서 생성

### 10. **재무 관리** (관리자 전용)
- 수익/지출 추적
- 인보이스 관리
- 재무 보고서
- 예산 모니터링

## 🛠 기술 스택

### Frontend
- **Framework**: Next.js 14.1.0 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **UI Components**: 
  - Framer Motion (애니메이션)
  - React Beautiful DnD (드래그 앤 드롭)
  - Chart.js (차트)
- **State Management**: React Context API
- **Form Handling**: React Hook Form

### Backend & Services
- **Authentication**: Firebase Auth
- **Database**: Firebase Realtime Database
- **Storage**: Firebase Storage
- **Real-time**: Socket.io
- **API**: Next.js API Routes

### Development Tools
- **Package Manager**: npm
- **Linting**: ESLint
- **Testing**: Jest
- **Build Tool**: Next.js built-in

## 📁 프로젝트 구조

```
project_cms/
├── src/
│   ├── app/                    # Next.js App Router 페이지
│   │   ├── (admin)/           # 관리자 전용 페이지
│   │   ├── (auth)/            # 인증 관련 페이지
│   │   ├── (customer)/        # 고객 전용 페이지
│   │   └── (dashboard)/       # 대시보드 관련 페이지
│   ├── components/            # 재사용 가능한 컴포넌트
│   │   ├── ai/               # AI 관련 컴포넌트
│   │   ├── analytics/        # 분석 관련 컴포넌트
│   │   ├── automation/       # 자동화 관련 컴포넌트
│   │   ├── chat/             # 채팅 관련 컴포넌트
│   │   ├── dashboard/        # 대시보드 컴포넌트
│   │   ├── files/            # 파일 관리 컴포넌트
│   │   ├── finance/          # 재무 관련 컴포넌트
│   │   ├── layout/           # 레이아웃 컴포넌트
│   │   ├── notification/     # 알림 컴포넌트
│   │   └── projects/         # 프로젝트 관련 컴포넌트
│   ├── lib/                   # 유틸리티 및 설정
│   │   ├── firebase.ts       # Firebase 설정
│   │   ├── auth-context.tsx  # 인증 컨텍스트
│   │   └── socket.ts         # Socket.io 설정
│   ├── services/             # 비즈니스 로직 서비스
│   └── types/                # TypeScript 타입 정의
├── public/                   # 정적 파일
├── scripts/                  # 유틸리티 스크립트
│   ├── create-test-accounts.js  # 테스트 계정 생성
│   └── seed-data.js            # 샘플 데이터 생성
└── server/
    └── socket-server.js      # Socket.io 서버

```

## 🚀 시작하기

### 1. 환경 설정

```bash
# 의존성 설치
npm install
```

### 2. 환경 변수 설정

`.env.local` 파일을 생성하고 Firebase 설정을 추가합니다:

```env
# Firebase Configuration
NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_auth_domain
NEXT_PUBLIC_FIREBASE_DATABASE_URL=your_database_url
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_storage_bucket
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id
NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID=your_measurement_id

# Socket.io Server URL
NEXT_PUBLIC_SOCKET_URL=http://localhost:3001
```

### 3. Firebase 설정

1. Firebase Console에서 프로젝트 생성
2. Authentication 활성화 (이메일/비밀번호 및 Google 로그인)
3. Realtime Database 생성
4. Storage 활성화
5. Firebase 보안 규칙 설정 (`firebase-database-rules.json` 참조)

### 4. 개발 서버 실행

```bash
# Next.js 개발 서버
npm run dev

# Socket.io 서버 (별도 터미널)
npm run socket-server
```

### 5. 테스트 계정 생성

```bash
# 테스트 계정 생성
npm run create-accounts

# 샘플 데이터 생성
npm run seed
```

생성되는 테스트 계정:
- **관리자**: admin@codeb.com / admin123!
- **고객**: customer@test.com / customer123!
- **개발자**: developer@codeb.com / dev123!

## 📝 주요 페이지 및 경로

### 인증 페이지
- `/login` - 로그인
- `/forgot-password` - 비밀번호 찾기

### 대시보드
- `/dashboard` - 메인 대시보드
- `/projects` - 프로젝트 목록
- `/projects/[id]` - 프로젝트 상세
- `/projects/[id]/gantt` - 간트 차트
- `/projects/[id]/kanban` - 칸반 보드

### 커뮤니케이션
- `/chat` - 채팅
- `/chat/multi` - 멀티 채팅 (운영자용)

### 관리 도구
- `/files` - 파일 관리
- `/ai` - AI 어시스턴트
- `/automation` - 자동화 워크플로우
- `/automation/runs` - 워크플로우 실행 내역
- `/analytics` - 분석 및 예측

### 관리자 전용
- `/finance` - 재무 관리
- `/finance/invoices` - 인보이스 관리
- `/operators` - 운영자 관리

### 고객 전용
- `/status` - 프로젝트 상태 확인
- `/support` - 고객 지원
- `/review` - 프로젝트 리뷰

## 🔐 보안 및 권한

### 역할별 접근 권한

| 기능 | Admin | Manager | Developer | Customer |
|------|-------|---------|-----------|----------|
| 대시보드 | ✅ | ✅ | ✅ | ✅ |
| 프로젝트 관리 | ✅ | ✅ | ✅ | 읽기만 |
| 채팅 | ✅ | ✅ | ✅ | ✅ |
| 파일 관리 | ✅ | ✅ | ✅ | 제한적 |
| AI 어시스턴트 | ✅ | ✅ | ✅ | ❌ |
| 자동화 | ✅ | ✅ | ✅ | ❌ |
| 분석 | ✅ | ✅ | ❌ | ❌ |
| 재무 관리 | ✅ | ❌ | ❌ | ❌ |
| 운영자 관리 | ✅ | ❌ | ❌ | ❌ |

### Firebase 보안 규칙

```json
{
  "rules": {
    ".read": "auth != null",
    ".write": "auth != null",
    "users": {
      "$uid": {
        ".read": true,
        ".write": "$uid === auth.uid || (auth != null && root.child('users').child(auth.uid).child('role').val() === 'admin')"
      }
    }
  }
}
```

## 🧪 테스트

```bash
# 단위 테스트 실행
npm test

# 테스트 감시 모드
npm run test:watch

# 테스트 커버리지
npm run test:coverage
```

## 📦 빌드 및 배포

### 프로덕션 빌드

```bash
# 프로덕션 빌드
npm run build

# 프로덕션 서버 실행
npm start
```

### Vercel 배포

1. Vercel에 프로젝트 연결
2. 환경 변수 설정
3. 자동 배포 설정

## 🐛 문제 해결

### 일반적인 문제

1. **Firebase 연결 오류**
   - 환경 변수 확인
   - Firebase 프로젝트 설정 확인
   - 네트워크 연결 확인

2. **타입 오류**
   - `npm run type-check` 실행
   - TypeScript 설정 확인

3. **포트 충돌**
   - `pkill -f "next dev"` 실행
   - 다른 포트 사용: `npm run dev -- -p 3002`

## 🤝 기여하기

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 라이선스

This project is licensed under the MIT License - see the LICENSE file for details.

## 👥 개발팀

- **프로젝트 매니저**: CodeB Team
- **개발**: Full Stack Development Team
- **디자인**: UI/UX Team

## 📞 연락처

- **이메일**: support@codeb.com
- **웹사이트**: https://codeb.com
- **문서**: https://docs.codeb.com

---

Made with ❤️ by CodeB Team