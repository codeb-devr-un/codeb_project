# 보안 설정 가이드

## 긴급 보안 조치 사항

### 1. 환경 변수 설정

1. `.env.local` 파일을 프로젝트 루트에 생성하세요:

```bash
cp .env.example .env.local
```

2. `.env.local` 파일에 실제 값을 입력하세요:

```env
# Firebase Configuration
NEXT_PUBLIC_FIREBASE_API_KEY=your-actual-api-key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_DATABASE_URL=https://your-project.firebasedatabase.app
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your-project-id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your-sender-id
NEXT_PUBLIC_FIREBASE_APP_ID=your-app-id

# Admin Credentials for Seeding (개발 환경용)
SEED_ADMIN_EMAIL=admin@codeb.com
SEED_ADMIN_PASSWORD=your-secure-password-here

# SendGrid
SENDGRID_API_KEY=your-sendgrid-api-key
EMAIL_FROM=noreply@codeb.com
```

### 2. 즉시 수행해야 할 보안 조치

1. **Firebase 콘솔에서 기존 API 키 재생성**
   - Firebase Console → 프로젝트 설정 → 일반
   - 웹 API 키 재생성

2. **비밀번호 변경**
   - 모든 테스트 계정의 비밀번호를 강력한 비밀번호로 변경
   - 최소 12자 이상, 대소문자, 숫자, 특수문자 포함

3. **Firebase 보안 규칙 업데이트**
   - `firebase-database-rules.json` 파일의 공개 읽기 권한 제거
   - 인증된 사용자만 접근하도록 수정

### 3. 개선된 스크립트 사용법

seed-data.js 실행:
```bash
cd scripts
node seed-data.js
```

create-test-accounts.js 실행:
```bash
cd scripts
node create-test-accounts.js
```

### 4. 추가 보안 권장사항

1. **절대 커밋하지 말아야 할 파일들**:
   - `.env.local`
   - `.env.production`
   - 서비스 계정 키 파일
   - 비밀번호가 포함된 모든 파일

2. **.gitignore 확인**:
   ```
   .env.local
   .env.production
   *.key
   serviceAccountKey.json
   ```

3. **프로덕션 배포 전 체크리스트**:
   - [ ] 모든 console.log 제거
   - [ ] 환경 변수 설정 확인
   - [ ] Firebase 보안 규칙 검토
   - [ ] API 엔드포인트 인증 확인
   - [ ] HTTPS 강제 적용

## 문의사항

보안 관련 문의사항이 있으시면 즉시 보안 팀에 연락하세요.