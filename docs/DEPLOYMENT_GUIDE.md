# Deployment Guide

CodeB Platform의 배포 및 운영 가이드입니다.

## 🚀 배포 환경

### 지원하는 플랫폼

- **Vercel** (권장) - Next.js 최적화
- **Netlify** - JAMstack 지원
- **AWS Amplify** - AWS 생태계 통합
- **Firebase Hosting** - Firebase 통합
- **Docker** - 컨테이너 배포

## 🔧 환경별 설정

### Development 환경

```bash
# 로컬 개발 서버
npm run dev

# 환경 변수 (.env.local)
NEXT_PUBLIC_FIREBASE_API_KEY=dev_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=dev-project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_DATABASE_URL=https://dev-project.firebaseio.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=dev-project-id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=dev-project.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=123456789
NEXT_PUBLIC_FIREBASE_APP_ID=1:123456789:web:abcdef
NEXT_PUBLIC_SOCKET_URL=http://localhost:3001
```

### Staging 환경

```bash
# 빌드 및 배포
npm run build
npm run start

# 환경 변수 (.env.staging)
NEXT_PUBLIC_FIREBASE_API_KEY=staging_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=staging-project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_DATABASE_URL=https://staging-project.firebaseio.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=staging-project-id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=staging-project.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=987654321
NEXT_PUBLIC_FIREBASE_APP_ID=1:987654321:web:fedcba
NEXT_PUBLIC_SOCKET_URL=https://staging-api.codeb.com
```

### Production 환경

```bash
# 프로덕션 빌드
npm run build:production

# 환경 변수 (.env.production)
NEXT_PUBLIC_FIREBASE_API_KEY=prod_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=codeb-platform.firebaseapp.com
NEXT_PUBLIC_FIREBASE_DATABASE_URL=https://codeb-platform.firebaseio.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=codeb-platform
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=codeb-platform.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=555666777
NEXT_PUBLIC_FIREBASE_APP_ID=1:555666777:web:xyz123
NEXT_PUBLIC_SOCKET_URL=https://api.codeb.com
```

## 📦 Vercel 배포 (권장)

### 1. Vercel CLI 설치

```bash
npm install -g vercel
```

### 2. 프로젝트 설정

```bash
# Vercel 로그인
vercel login

# 프로젝트 초기화
vercel

# 환경 변수 설정
vercel env add NEXT_PUBLIC_FIREBASE_API_KEY
vercel env add NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN
# ... 모든 환경 변수 추가
```

### 3. vercel.json 설정

```json
{
  "version": 2,
  "builds": [
    {
      "src": "package.json",
      "use": "@vercel/next"
    }
  ],
  "routes": [
    {
      "src": "/api/(.*)",
      "dest": "/api/$1"
    }
  ],
  "env": {
    "NEXT_PUBLIC_FIREBASE_API_KEY": "@firebase_api_key",
    "NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN": "@firebase_auth_domain",
    "NEXT_PUBLIC_FIREBASE_DATABASE_URL": "@firebase_database_url",
    "NEXT_PUBLIC_FIREBASE_PROJECT_ID": "@firebase_project_id",
    "NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET": "@firebase_storage_bucket",
    "NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID": "@firebase_messaging_sender_id",
    "NEXT_PUBLIC_FIREBASE_APP_ID": "@firebase_app_id"
  },
  "headers": [
    {
      "source": "/(.*)",
      "headers": [
        {
          "key": "X-Content-Type-Options",
          "value": "nosniff"
        },
        {
          "key": "X-Frame-Options",
          "value": "DENY"
        },
        {
          "key": "X-XSS-Protection",
          "value": "1; mode=block"
        },
        {
          "key": "Referrer-Policy",
          "value": "strict-origin-when-cross-origin"
        }
      ]
    }
  ]
}
```

### 4. 자동 배포 설정

```bash
# GitHub 연동 후 자동 배포
# main 브랜치 → production
# develop 브랜치 → preview
```

## 🔥 Firebase 설정

### 1. Firebase 프로젝트 생성

```bash
# Firebase CLI 설치
npm install -g firebase-tools

# 로그인
firebase login

# 프로젝트 초기화
firebase init

# 선택사항:
# - Hosting
# - Realtime Database
# - Storage
# - Functions (선택사항)
```

### 2. firebase.json 설정

```json
{
  "hosting": {
    "public": "out",
    "ignore": ["firebase.json", "**/.*", "**/node_modules/**"],
    "rewrites": [
      {
        "source": "**",
        "destination": "/index.html"
      }
    ],
    "headers": [
      {
        "source": "**/*.@(jpg|jpeg|gif|png|svg|webp|js|css)",
        "headers": [
          {
            "key": "Cache-Control",
            "value": "max-age=31536000"
          }
        ]
      }
    ]
  },
  "database": {
    "rules": "firebase-database-rules.json"
  },
  "storage": {
    "rules": "storage.rules"
  }
}
```

### 3. 보안 규칙 설정

**Realtime Database** (`firebase-database-rules.json`):
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
    },
    "projects": {
      ".read": "auth != null",
      ".write": "auth != null && (root.child('users').child(auth.uid).child('role').val() === 'admin' || root.child('users').child(auth.uid).child('role').val() === 'manager')"
    },
    "chat": {
      "rooms": {
        "$roomId": {
          ".read": "auth != null && root.child('chat/rooms').child($roomId).child('participants').child(auth.uid).exists()",
          ".write": "auth != null && root.child('chat/rooms').child($roomId).child('participants').child(auth.uid).exists()"
        }
      }
    }
  }
}
```

**Storage** (`storage.rules`):
```javascript
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    // 인증된 사용자만 파일 업로드/다운로드 가능
    match /{allPaths=**} {
      allow read, write: if request.auth != null;
    }
    
    // 프로젝트 파일은 팀 멤버만 접근 가능
    match /projects/{projectId}/{allPaths=**} {
      allow read, write: if request.auth != null && 
        exists(/databases/(default)/documents/projects/$(projectId)/team/$(request.auth.uid));
    }
    
    // 프로필 사진은 본인만 수정 가능
    match /users/{userId}/profile/{allPaths=**} {
      allow read: if request.auth != null;
      allow write: if request.auth != null && request.auth.uid == userId;
    }
  }
}
```

## 🐳 Docker 배포

### 1. Dockerfile

```dockerfile
# Base image
FROM node:18-alpine AS base

# Install dependencies only when needed
FROM base AS deps
RUN apk add --no-cache libc6-compat
WORKDIR /app

# Install dependencies based on the preferred package manager
COPY package.json package-lock.json* ./
RUN npm ci --only=production

# Rebuild the source code only when needed
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Build the application
ENV NEXT_TELEMETRY_DISABLED 1
RUN npm run build

# Production image, copy all the files and run next
FROM base AS runner
WORKDIR /app

ENV NODE_ENV production
ENV NEXT_TELEMETRY_DISABLED 1

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

COPY --from=builder /app/public ./public

# Automatically leverage output traces to reduce image size
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs

EXPOSE 3000

ENV PORT 3000
ENV HOSTNAME "0.0.0.0"

CMD ["node", "server.js"]
```

### 2. docker-compose.yml

```yaml
version: '3.8'

services:
  app:
    build:
      context: .
      dockerfile: Dockerfile
    ports:
      - "3000:3000"
    environment:
      - NODE_ENV=production
      - NEXT_PUBLIC_FIREBASE_API_KEY=${FIREBASE_API_KEY}
      - NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=${FIREBASE_AUTH_DOMAIN}
      - NEXT_PUBLIC_FIREBASE_DATABASE_URL=${FIREBASE_DATABASE_URL}
      - NEXT_PUBLIC_FIREBASE_PROJECT_ID=${FIREBASE_PROJECT_ID}
      - NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=${FIREBASE_STORAGE_BUCKET}
      - NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=${FIREBASE_MESSAGING_SENDER_ID}
      - NEXT_PUBLIC_FIREBASE_APP_ID=${FIREBASE_APP_ID}
    volumes:
      - ./logs:/app/logs
    restart: unless-stopped

  socket-server:
    build:
      context: .
      dockerfile: Dockerfile.socket
    ports:
      - "3001:3001"
    environment:
      - NODE_ENV=production
    volumes:
      - ./logs:/app/logs
    restart: unless-stopped

  nginx:
    image: nginx:alpine
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./nginx.conf:/etc/nginx/nginx.conf
      - ./ssl:/etc/nginx/ssl
    depends_on:
      - app
      - socket-server
    restart: unless-stopped
```

### 3. Docker 명령어

```bash
# 이미지 빌드
docker build -t codeb-platform .

# 컨테이너 실행
docker run -p 3000:3000 --env-file .env.production codeb-platform

# Docker Compose로 실행
docker-compose up -d

# 로그 확인
docker-compose logs -f app

# 컨테이너 중지
docker-compose down
```

## ⚙️ CI/CD 파이프라인

### GitHub Actions

`.github/workflows/deploy.yml`:
```yaml
name: Deploy to Production

on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

jobs:
  test:
    runs-on: ubuntu-latest
    
    steps:
      - uses: actions/checkout@v3
      
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'
          cache: 'npm'
      
      - name: Install dependencies
        run: npm ci
      
      - name: Run tests
        run: npm test -- --coverage --watchAll=false
      
      - name: Type check
        run: npm run type-check
      
      - name: Lint check
        run: npm run lint
      
      - name: Build application
        run: npm run build
        env:
          NEXT_PUBLIC_FIREBASE_API_KEY: ${{ secrets.FIREBASE_API_KEY }}
          NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN: ${{ secrets.FIREBASE_AUTH_DOMAIN }}
          NEXT_PUBLIC_FIREBASE_DATABASE_URL: ${{ secrets.FIREBASE_DATABASE_URL }}
          NEXT_PUBLIC_FIREBASE_PROJECT_ID: ${{ secrets.FIREBASE_PROJECT_ID }}
          NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET: ${{ secrets.FIREBASE_STORAGE_BUCKET }}
          NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID: ${{ secrets.FIREBASE_MESSAGING_SENDER_ID }}
          NEXT_PUBLIC_FIREBASE_APP_ID: ${{ secrets.FIREBASE_APP_ID }}

  deploy:
    needs: test
    runs-on: ubuntu-latest
    if: github.ref == 'refs/heads/main'
    
    steps:
      - uses: actions/checkout@v3
      
      - name: Deploy to Vercel
        uses: amondnet/vercel-action@v20
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.ORG_ID }}
          vercel-project-id: ${{ secrets.PROJECT_ID }}
          vercel-args: '--prod'
```

### GitLab CI/CD

`.gitlab-ci.yml`:
```yaml
stages:
  - test
  - build
  - deploy

variables:
  NODE_VERSION: "18"

cache:
  paths:
    - node_modules/

test:
  stage: test
  image: node:$NODE_VERSION
  script:
    - npm ci
    - npm run test -- --coverage --watchAll=false
    - npm run type-check
    - npm run lint
  artifacts:
    reports:
      coverage_report:
        coverage_format: cobertura
        path: coverage/cobertura-coverage.xml

build:
  stage: build
  image: node:$NODE_VERSION
  script:
    - npm ci
    - npm run build
  artifacts:
    paths:
      - .next/
      - out/
    expire_in: 1 hour
  only:
    - main
    - develop

deploy_staging:
  stage: deploy
  script:
    - echo "Deploying to staging..."
    - npm run deploy:staging
  environment:
    name: staging
    url: https://staging.codeb.com
  only:
    - develop

deploy_production:
  stage: deploy
  script:
    - echo "Deploying to production..."
    - npm run deploy:production
  environment:
    name: production
    url: https://codeb.com
  only:
    - main
  when: manual
```

## 🔍 모니터링 및 로깅

### 1. 헬스 체크 엔드포인트

```typescript
// pages/api/health.ts
import type { NextApiRequest, NextApiResponse } from 'next'

interface HealthResponse {
  status: 'healthy' | 'unhealthy'
  timestamp: string
  version: string
  services: {
    database: 'healthy' | 'unhealthy'
    storage: 'healthy' | 'unhealthy'
    auth: 'healthy' | 'unhealthy'
  }
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<HealthResponse>
) {
  try {
    // Firebase 서비스 상태 확인
    const databaseStatus = await checkDatabaseHealth()
    const storageStatus = await checkStorageHealth()
    const authStatus = await checkAuthHealth()

    const isHealthy = databaseStatus && storageStatus && authStatus

    res.status(isHealthy ? 200 : 503).json({
      status: isHealthy ? 'healthy' : 'unhealthy',
      timestamp: new Date().toISOString(),
      version: process.env.npm_package_version || '1.0.0',
      services: {
        database: databaseStatus ? 'healthy' : 'unhealthy',
        storage: storageStatus ? 'healthy' : 'unhealthy',
        auth: authStatus ? 'healthy' : 'unhealthy',
      },
    })
  } catch (error) {
    res.status(503).json({
      status: 'unhealthy',
      timestamp: new Date().toISOString(),
      version: process.env.npm_package_version || '1.0.0',
      services: {
        database: 'unhealthy',
        storage: 'unhealthy',
        auth: 'unhealthy',
      },
    })
  }
}
```

### 2. 성능 메트릭

```typescript
// lib/metrics.ts
import { NextApiRequest, NextApiResponse } from 'next'

export const withMetrics = (handler: Function) => {
  return async (req: NextApiRequest, res: NextApiResponse) => {
    const startTime = Date.now()
    
    try {
      await handler(req, res)
    } catch (error) {
      // 에러 메트릭 수집
      console.error('API Error:', {
        path: req.url,
        method: req.method,
        error: error.message,
        timestamp: new Date().toISOString(),
      })
      throw error
    } finally {
      const duration = Date.now() - startTime
      
      // 성능 메트릭 수집
      console.log('API Metrics:', {
        path: req.url,
        method: req.method,
        duration,
        statusCode: res.statusCode,
        timestamp: new Date().toISOString(),
      })
    }
  }
}
```

### 3. 외부 모니터링 서비스 연동

```typescript
// lib/monitoring.ts
import * as Sentry from '@sentry/nextjs'

// Sentry 설정
Sentry.init({
  dsn: process.env.SENTRY_DSN,
  environment: process.env.NODE_ENV,
  tracesSampleRate: 1.0,
})

// 커스텀 에러 리포팅
export const reportError = (error: Error, context?: any) => {
  Sentry.captureException(error, {
    contexts: {
      custom: context,
    },
  })
}

// 성능 메트릭 전송
export const trackPerformance = (name: string, value: number) => {
  Sentry.addBreadcrumb({
    category: 'performance',
    message: name,
    level: 'info',
    data: { value },
  })
}
```

## 🔧 환경별 설정 관리

### next.config.js

```javascript
/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  
  // 환경별 설정
  env: {
    CUSTOM_KEY: process.env.CUSTOM_KEY,
  },
  
  // 빌드 시 환경 변수
  publicRuntimeConfig: {
    NODE_ENV: process.env.NODE_ENV,
  },
  
  // 이미지 최적화
  images: {
    domains: ['firebasestorage.googleapis.com'],
    formats: ['image/webp', 'image/avif'],
  },
  
  // 보안 헤더
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'X-XSS-Protection',
            value: '1; mode=block',
          },
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin',
          },
        ],
      },
    ]
  },
  
  // 리다이렉트
  async redirects() {
    return [
      {
        source: '/',
        destination: '/dashboard',
        permanent: false,
        has: [
          {
            type: 'cookie',
            key: 'authenticated',
            value: 'true',
          },
        ],
      },
    ]
  },
  
  // 리라이트
  async rewrites() {
    return [
      {
        source: '/api/socket.io/:path*',
        destination: 'http://localhost:3001/socket.io/:path*',
      },
    ]
  },
  
  // Webpack 설정
  webpack: (config, { buildId, dev, isServer, defaultLoaders, webpack }) => {
    // 환경별 최적화
    if (!dev && !isServer) {
      config.optimization.splitChunks.chunks = 'all'
    }
    
    return config
  },
  
  // 실험적 기능
  experimental: {
    optimizeCss: true,
    scrollRestoration: true,
  },
}

module.exports = nextConfig
```

## 📊 백업 및 복구

### 1. Firebase 백업

```bash
# Firestore 백업
gcloud firestore export gs://your-backup-bucket/backups/$(date +%Y%m%d)

# Realtime Database 백업
curl -X GET "https://your-project.firebaseio.com/.json?auth=YOUR_SECRET" -o backup.json

# Storage 백업
gsutil -m cp -r gs://your-project.appspot.com gs://your-backup-bucket/storage-backup
```

### 2. 자동 백업 스크립트

```bash
#!/bin/bash
# scripts/backup.sh

DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_DIR="backups/$DATE"

# 백업 디렉토리 생성
mkdir -p $BACKUP_DIR

# 데이터베이스 백업
echo "Backing up database..."
firebase database:get / > $BACKUP_DIR/database.json

# 설정 파일 백업
echo "Backing up configuration..."
cp .env.production $BACKUP_DIR/
cp firebase.json $BACKUP_DIR/
cp package.json $BACKUP_DIR/

# 압축
tar -czf $BACKUP_DIR.tar.gz $BACKUP_DIR

# 클라우드 스토리지에 업로드
gsutil cp $BACKUP_DIR.tar.gz gs://your-backup-bucket/

# 로컬 백업 파일 정리 (7일 이전 파일 삭제)
find backups/ -name "*.tar.gz" -mtime +7 -delete

echo "Backup completed: $BACKUP_DIR.tar.gz"
```

### 3. 복구 절차

```bash
# 1. 백업 파일 다운로드
gsutil cp gs://your-backup-bucket/20240115_120000.tar.gz ./

# 2. 압축 해제
tar -xzf 20240115_120000.tar.gz

# 3. 데이터베이스 복구
firebase database:set / backups/20240115_120000/database.json

# 4. 설정 파일 복구
cp backups/20240115_120000/.env.production ./
cp backups/20240115_120000/firebase.json ./

# 5. 애플리케이션 재시작
npm run build
npm run start
```

## 🚨 장애 대응

### 1. 모니터링 알림

```typescript
// lib/alerts.ts
interface Alert {
  type: 'error' | 'warning' | 'info'
  message: string
  timestamp: Date
  metadata?: any
}

export const sendAlert = async (alert: Alert) => {
  // Slack 알림
  if (process.env.SLACK_WEBHOOK_URL) {
    await fetch(process.env.SLACK_WEBHOOK_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        text: `🚨 ${alert.type.toUpperCase()}: ${alert.message}`,
        blocks: [
          {
            type: 'section',
            text: {
              type: 'mrkdwn',
              text: `*${alert.type.toUpperCase()}*: ${alert.message}\n*Time*: ${alert.timestamp.toISOString()}`,
            },
          },
        ],
      }),
    })
  }

  // 이메일 알림
  if (process.env.ALERT_EMAIL) {
    // SendGrid나 다른 이메일 서비스로 알림 전송
  }
}

// 자동 알림 트리거
export const checkAndAlert = async () => {
  try {
    const healthResponse = await fetch('/api/health')
    if (!healthResponse.ok) {
      await sendAlert({
        type: 'error',
        message: 'Application health check failed',
        timestamp: new Date(),
        metadata: { status: healthResponse.status },
      })
    }
  } catch (error) {
    await sendAlert({
      type: 'error',
      message: 'Health check request failed',
      timestamp: new Date(),
      metadata: { error: error.message },
    })
  }
}
```

### 2. 장애 대응 체크리스트

**서비스 다운 시:**
1. 헬스 체크 엔드포인트 확인 (`/api/health`)
2. Vercel/호스팅 서비스 상태 확인
3. Firebase 서비스 상태 확인
4. 최근 배포 로그 확인
5. 에러 로그 분석 (Sentry, 클라우드 로그)
6. 필요시 이전 버전으로 롤백

**성능 저하 시:**
1. 응답 시간 메트릭 확인
2. 데이터베이스 쿼리 성능 분석
3. CDN 캐시 상태 확인
4. 메모리/CPU 사용량 확인
5. 트래픽 패턴 분석

## 📈 확장성 고려사항

### 1. 수평 확장

```javascript
// next.config.js - 다중 인스턴스 설정
module.exports = {
  // ... 기타 설정
  
  // 정적 파일 CDN 사용
  assetPrefix: process.env.CDN_URL,
  
  // 이미지 최적화 외부 서비스 사용
  images: {
    loader: 'custom',
    loaderFile: './lib/image-loader.js',
  },
}

// lib/image-loader.js
export default function cloudinaryLoader({ src, width, quality }) {
  const params = ['f_auto', 'c_limit', `w_${width}`, `q_${quality || 'auto'}`]
  return `https://res.cloudinary.com/your-cloud/image/fetch/${params.join(',')}/${src}`
}
```

### 2. 데이터베이스 최적화

```typescript
// 인덱스 최적화
const projectsRef = ref(database, 'projects')
const indexedQuery = query(
  projectsRef,
  orderByChild('status'),
  equalTo('active'),
  limitToFirst(20)
)

// 페이지네이션
const paginatedQuery = query(
  projectsRef,
  orderByChild('createdAt'),
  startAfter(lastItemTimestamp),
  limitToFirst(10)
)

// 데이터 정규화
const normalizedData = {
  projects: {
    project1: { id: 'project1', name: 'Project 1', teamIds: ['user1', 'user2'] },
  },
  users: {
    user1: { id: 'user1', name: 'John Doe' },
    user2: { id: 'user2', name: 'Jane Smith' },
  },
}
```

### 3. 캐싱 전략

```typescript
// Redis 캐싱 (선택사항)
import Redis from 'ioredis'

const redis = new Redis(process.env.REDIS_URL)

export const withCache = (key: string, ttl: number = 300) => {
  return async (data: any) => {
    // 캐시에서 데이터 조회
    const cached = await redis.get(key)
    if (cached) {
      return JSON.parse(cached)
    }

    // 캐시에 데이터 저장
    await redis.setex(key, ttl, JSON.stringify(data))
    return data
  }
}

// SWR을 활용한 클라이언트 캐싱
import useSWR from 'swr'

const useProjects = () => {
  const { data, error } = useSWR('/api/projects', fetcher, {
    refreshInterval: 30000, // 30초마다 재검증
    revalidateOnFocus: false,
  })

  return {
    projects: data,
    loading: !error && !data,
    error,
  }
}
```

## 🔐 보안 운영

### 1. SSL/TLS 설정

```nginx
# nginx.conf
server {
    listen 443 ssl http2;
    server_name codeb.com;

    ssl_certificate /etc/nginx/ssl/codeb.com.crt;
    ssl_certificate_key /etc/nginx/ssl/codeb.com.key;

    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers ECDHE-RSA-AES256-GCM-SHA512:DHE-RSA-AES256-GCM-SHA512;
    ssl_prefer_server_ciphers off;

    # HSTS
    add_header Strict-Transport-Security "max-age=63072000" always;
    
    # 보안 헤더
    add_header X-Frame-Options DENY always;
    add_header X-Content-Type-Options nosniff always;
    add_header X-XSS-Protection "1; mode=block" always;

    location / {
        proxy_pass http://localhost:3000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

### 2. 보안 검사 자동화

```yaml
# .github/workflows/security.yml
name: Security Scan

on:
  schedule:
    - cron: '0 2 * * *'  # 매일 오전 2시
  push:
    branches: [main]

jobs:
  security-scan:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Run npm audit
        run: npm audit --audit-level high
      
      - name: Run Snyk security scan
        uses: snyk/actions/node@master
        env:
          SNYK_TOKEN: ${{ secrets.SNYK_TOKEN }}
        with:
          args: --severity-threshold=high
```

---

배포 관련 문의사항은 DevOps 팀 (devops@codeb.com) 또는 Slack #devops 채널로 연락주세요.