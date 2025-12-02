# Design System Migration Report
## new_page → project_cms 마이그레이션 가이드

**작성일**: 2025-11-29
**분석 대상**: `new_page/` 디자인 시스템 → 기존 `src/` 프로젝트

---

## 1. Executive Summary

### 핵심 변경 사항
| 항목 | 기존 (project_cms) | 신규 (new_page) |
|------|-------------------|-----------------|
| **컬러 테마** | Gray/Blue 기반 | Lime/Black 기반 |
| **UI 스타일** | Flat Design | Glass Morphism |
| **모서리 처리** | rounded-md ~ rounded-xl | rounded-2xl ~ rounded-3xl |
| **CSS 변수** | 기본 Tailwind | oklch 컬러 시스템 |
| **레이아웃** | 커스텀 Sidebar | SidebarProvider 패턴 |
| **네비게이션** | 기본 Dock | macOS 스타일 Dock |

### 예상 작업량
- **Phase 1** (CSS/스타일 기반): 1-2일
- **Phase 2** (레이아웃 컴포넌트): 2-3일
- **Phase 3** (페이지 마이그레이션): 3-5일
- **총 예상**: 6-10일

---

## 2. 상세 분석

### 2.1 컬러 시스템 비교

#### 기존 시스템 (project_cms)
```css
/* 기본 Tailwind 컬러 사용 */
- 배경: bg-gray-50, bg-white
- 텍스트: text-gray-900, text-gray-500
- 강조: bg-primary (기본 파란색 계열)
- 버튼: bg-gray-900, hover:bg-gray-800
```

#### 신규 시스템 (new_page)
```css
/* oklch 기반 커스텀 컬러 */
:root {
  --primary: #030213;           /* 거의 블랙 */
  --background: #ffffff;
  --border: rgba(0, 0, 0, 0.1);
  --input-background: #f3f3f5;
}

/* 주요 액센트 */
- 강조색: lime-400 (#a3e635)
- 버튼: bg-black text-lime-400
- 호버: hover:bg-slate-900 hover:text-lime-300
```

#### 마이그레이션 액션
```css
/* globals.css에 추가할 변수 */
:root {
  --accent-lime: #a3e635;
  --accent-lime-light: #d9f99d;
  --accent-lime-dark: #65a30d;
}

/* Tailwind 확장 */
// tailwind.config.js
colors: {
  lime: {
    400: '#a3e635',
    // ...
  }
}
```

---

### 2.2 Glass Morphism 스타일

#### 신규 디자인 특징
```css
/* 기본 글래스 카드 */
.glass-card {
  background: rgba(255, 255, 255, 0.7);  /* bg-white/70 */
  backdrop-filter: blur(24px);           /* backdrop-blur-xl */
  border: 1px solid rgba(255, 255, 255, 0.4);  /* border-white/40 */
  box-shadow: 0 8px 30px rgb(0, 0, 0, 0.04);
}

/* Ambient Blob 효과 */
.ambient-blob {
  position: absolute;
  border-radius: 9999px;
  filter: blur(100px);
  pointer-events: none;
}
```

#### 기존 → 신규 클래스 매핑
| 기존 | 신규 |
|------|------|
| `bg-white` | `bg-white/70 backdrop-blur-xl` |
| `border border-gray-200` | `border border-white/40` |
| `shadow-sm` | `shadow-[0_8px_30px_rgb(0,0,0,0.04)]` |
| `rounded-xl` | `rounded-3xl` |
| `hover:shadow-md` | `hover:shadow-lg hover:-translate-y-1` |

---

### 2.3 레이아웃 아키텍처 비교

#### 기존 레이아웃 (project_cms)
```tsx
// src/app/(dashboard)/layout.tsx
<div className="flex h-screen bg-background">
  {mode === 'sidebar' && <Sidebar />}
  <div className="flex-1 flex flex-col">
    <Header />
    <main>{children}</main>
  </div>
  {mode === 'dock' && <DockNavigation />}
</div>
```

#### 신규 레이아웃 (new_page)
```tsx
// new_page/src/components/admin/AdminLayout.tsx
<SidebarProvider>
  {!isDockMode ? (
    <AdminSidebar currentPage={currentPage} onNavigate={onNavigate} />
  ) : (
    <AdminDock currentTab={currentPage} onNavigate={onNavigate} />
  )}

  <SidebarInset className="bg-[#F8F9FA] relative overflow-hidden">
    {/* Ambient Background Blobs */}
    <div className="absolute top-[-20%] left-[-10%] w-[500px] h-[500px]
                    bg-lime-200/40 rounded-full blur-[100px] pointer-events-none" />
    <div className="absolute bottom-[-20%] right-[-10%] w-[600px] h-[600px]
                    bg-emerald-100/40 rounded-full blur-[120px] pointer-events-none" />

    <header className="bg-white/50 backdrop-blur-md border-b border-white/40">
      {/* Header content */}
    </header>

    <div className="flex flex-1 flex-col gap-6 p-4 md:p-8">
      {children}
    </div>
  </SidebarInset>
</SidebarProvider>
```

---

### 2.4 컴포넌트별 스타일 차이

#### Card 컴포넌트
```tsx
// 기존
<Card className="p-6 bg-white rounded-3xl shadow-sm border-0">

// 신규
<Card className="rounded-3xl border-0 shadow-[0_8px_30px_rgb(0,0,0,0.04)]
                bg-white/80 backdrop-blur-md hover:-translate-y-1
                transition-all duration-300 border border-white/20">
```

#### Button 컴포넌트
```tsx
// 기존 Primary Button
<Button className="h-24 rounded-2xl bg-gray-900 hover:bg-gray-800 text-white">

// 신규 Primary Button
<Button className="rounded-xl bg-black text-lime-400 hover:bg-slate-900
                   hover:text-lime-300 shadow-lg shadow-black/20
                   transition-all hover:-translate-y-0.5 font-bold">
```

#### Badge 컴포넌트
```tsx
// 기존
<Badge className="bg-red-500 text-white text-xs">

// 신규
<Badge className="bg-black text-lime-400 hover:bg-slate-900
                  rounded-md px-2.5 py-0.5 font-bold text-xs shadow-sm">
```

---

### 2.5 Sidebar 비교

#### 기존 Sidebar
- 고정 너비 `w-64`
- `bg-white border-r border-gray-200`
- 단순 메뉴 그룹 확장/축소
- 기본 아바타 스타일

#### 신규 AdminSidebar
- Collapsible "icon" 모드 지원
- `bg-white/80 backdrop-blur-2xl`
- Workspace Switcher 포함
- 라운드된 메뉴 버튼 (`rounded-2xl`)
- 활성 상태: `bg-lime-400 text-slate-900 shadow-lg shadow-lime-400/20`
- Star 즐겨찾기 기능 호버 시 표시

---

### 2.6 Dock 네비게이션 비교

#### 기존 DockNavigation
```tsx
// 기본 플로팅 독
<div className="fixed bottom-8 left-1/2 -translate-x-1/2">
  {/* 기본 스타일 버튼들 */}
</div>
```

#### 신규 AdminDock
```tsx
<div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-50">
  <div className="flex items-end gap-3 px-4 py-3
                  bg-white/70 backdrop-blur-2xl rounded-[2rem]
                  border border-white/50 shadow-2xl shadow-black/5
                  hover:scale-[1.02] transition-transform duration-500">
    {/* 아이템별 애니메이션 */}
    <button className="transition-all duration-300
                       ${isActive ? '-translate-y-2' : 'hover:-translate-y-2'}">
      <div className={`w-12 h-12 rounded-2xl shadow-lg
        ${isActive
          ? 'bg-black text-lime-400 scale-110 shadow-lime-500/20'
          : 'bg-white text-slate-400 hover:bg-lime-400 hover:text-black'
        }`}>
        {/* Icon */}
      </div>
    </button>
  </div>
</div>
```

---

## 3. 마이그레이션 계획

### Phase 1: 기반 스타일 설정 (1-2일)

#### 1.1 CSS 변수 추가
```css
/* src/styles/globals.css 수정 */

:root {
  /* 기존 변수 유지 */

  /* 신규 Glass Morphism 변수 추가 */
  --glass-bg: rgba(255, 255, 255, 0.7);
  --glass-border: rgba(255, 255, 255, 0.4);
  --glass-shadow: 0 8px 30px rgb(0, 0, 0, 0.04);
  --glass-shadow-hover: 0 8px 30px rgb(0, 0, 0, 0.08);

  /* Lime 액센트 */
  --accent-lime: #a3e635;
  --accent-lime-hover: #bef264;
}
```

#### 1.2 Tailwind 설정 확장
```js
// tailwind.config.js
module.exports = {
  theme: {
    extend: {
      borderRadius: {
        '3xl': '1.5rem',
        '4xl': '2rem',
      },
      boxShadow: {
        'glass': '0 8px 30px rgb(0, 0, 0, 0.04)',
        'glass-hover': '0 8px 30px rgb(0, 0, 0, 0.08)',
        'lime': '0 4px 14px 0 rgba(163, 230, 53, 0.39)',
      },
      backdropBlur: {
        '2xl': '40px',
        '3xl': '64px',
      },
    },
  },
}
```

#### 1.3 유틸리티 클래스 생성
```css
/* Glass Card 유틸리티 */
@layer components {
  .glass-card {
    @apply bg-white/70 backdrop-blur-xl border border-white/40
           rounded-3xl shadow-glass transition-all duration-300;
  }

  .glass-card-hover {
    @apply hover:bg-white/90 hover:shadow-glass-hover hover:-translate-y-1;
  }

  .btn-lime {
    @apply bg-black text-lime-400 hover:bg-slate-900 hover:text-lime-300
           font-bold shadow-lg shadow-black/20 transition-all hover:-translate-y-0.5;
  }

  .btn-lime-outline {
    @apply bg-white/50 border-white/40 text-slate-600
           hover:bg-white hover:text-slate-900;
  }
}
```

---

### Phase 2: 레이아웃 컴포넌트 마이그레이션 (2-3일)

#### 2.1 SidebarProvider 도입
1. `new_page/src/components/ui/sidebar.tsx` → `src/components/ui/sidebar.tsx` 복사
2. Collapsible 관련 컴포넌트 확인 및 추가

#### 2.2 AdminLayout 적용
```tsx
// src/app/(dashboard)/layout.tsx 수정

import { SidebarProvider, SidebarInset } from '@/components/ui/sidebar'

export default function DashboardLayout({ children }) {
  return (
    <SidebarProvider>
      {mode === 'sidebar' && <AdminSidebar />}
      {mode === 'dock' && <AdminDock />}

      <SidebarInset className="bg-[#F8F9FA] relative overflow-hidden">
        {/* Ambient Blobs */}
        <div className="absolute top-[-20%] left-[-10%] w-[500px] h-[500px]
                        bg-lime-200/40 rounded-full blur-[100px] pointer-events-none" />
        <Header />
        <main className="p-4 md:p-8">{children}</main>
      </SidebarInset>
    </SidebarProvider>
  )
}
```

#### 2.3 Sidebar 마이그레이션
- WorkspaceSwitcher 스타일 업데이트
- 메뉴 아이템 스타일 변경 (rounded-2xl, lime 액센트)
- 활성 상태 스타일 적용
- Star 즐겨찾기 호버 효과 추가

#### 2.4 Dock 마이그레이션
- Glass morphism 배경 적용
- 아이템 호버 애니메이션 (`-translate-y-2`)
- 활성 인디케이터 (하단 점)
- Tooltip 스타일 업데이트

---

### Phase 3: 페이지 마이그레이션 (3-5일)

#### 3.1 Dashboard 페이지
```tsx
// src/app/(dashboard)/dashboard/page.tsx

// 1. 헤더 섹션
<div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
  <div className="space-y-1">
    <h1 className="text-3xl font-bold tracking-tight text-slate-900">
      반가워요, {userName}님 👋
    </h1>
    <p className="text-slate-500 font-medium">
      {formattedDate}
    </p>
  </div>
  <div className="flex items-center gap-2">
    <Button className="btn-lime-outline rounded-xl">
      <Calendar className="mr-2 h-4 w-4" /> 일정 관리
    </Button>
    <Button className="btn-lime rounded-xl">
      <Plus className="mr-2 h-4 w-4" /> 새 업무 작성
    </Button>
  </div>
</div>

// 2. 위젯 카드 업데이트
<Card className="glass-card glass-card-hover">
  {/* Gloss 효과 */}
  <div className="absolute right-0 top-0 w-24 h-24 bg-lime-50
                  rounded-full -mr-8 -mt-8 blur-2xl opacity-60" />
  {/* 콘텐츠 */}
</Card>

// 3. 근태 위젯 (Lime 강조)
<Card className="rounded-3xl bg-lime-400 text-slate-900 relative overflow-hidden">
  <div className="absolute top-0 right-0 p-32 bg-white opacity-20 blur-3xl" />
  <Badge className="bg-black text-lime-400">정상 근무</Badge>
</Card>
```

#### 3.2 Projects 페이지
- 리스트/그리드 뷰 토글 버튼 스타일
- 테이블 행 glass-card 적용
- 진행률 바 lime-400 색상
- Avatar 스택 스타일

#### 3.3 Tasks 페이지
- Kanban 카드 glass 스타일
- 우선순위 Badge 색상 체계
- 작업 상태 인디케이터

#### 3.4 Groupware 페이지들
- 공지사항/게시판 리스트 아이템
- TipTap 에디터 컨테이너 스타일
- 댓글 섹션 스타일

---

## 4. 컴포넌트 매핑 가이드

### 빠른 참조 테이블

| 기존 클래스 | 신규 클래스 |
|------------|------------|
| `bg-white` | `bg-white/70 backdrop-blur-xl` |
| `bg-gray-50` | `bg-[#F8F9FA]` |
| `bg-gray-900` | `bg-black` |
| `text-primary` | `text-lime-400` |
| `border-gray-200` | `border-white/40` |
| `rounded-xl` | `rounded-2xl` 또는 `rounded-3xl` |
| `shadow-sm` | `shadow-glass` |
| `hover:shadow-md` | `hover:shadow-glass-hover hover:-translate-y-1` |
| `bg-gray-100` | `bg-slate-100/80 backdrop-blur-sm` |

### 색상 매핑

| 용도 | 기존 | 신규 |
|------|------|------|
| 주요 배경 | `bg-gray-50` | `bg-[#F8F9FA]` |
| 카드 배경 | `bg-white` | `bg-white/70` |
| 주요 텍스트 | `text-gray-900` | `text-slate-900` |
| 보조 텍스트 | `text-gray-500` | `text-slate-500` |
| 강조 버튼 | `bg-gray-900` | `bg-black text-lime-400` |
| 활성 상태 | `bg-gray-100` | `bg-lime-400 text-slate-900` |
| 호버 상태 | `hover:bg-gray-50` | `hover:bg-white/50` |

---

## 5. 주의사항 및 권장사항

### 5.1 호환성 고려
- `backdrop-blur`는 일부 구형 브라우저에서 지원되지 않음
- Fallback 스타일 제공 권장
```css
@supports not (backdrop-filter: blur()) {
  .glass-card {
    background: rgba(255, 255, 255, 0.95);
  }
}
```

### 5.2 성능 최적화
- `backdrop-blur`는 렌더링 비용이 높음
- 모바일에서는 `blur` 값 감소 고려
- 애니메이션 많은 요소에 `will-change` 적용

### 5.3 점진적 마이그레이션
1. 공통 컴포넌트 먼저 업데이트
2. 새 페이지부터 신규 스타일 적용
3. 기존 페이지는 점진적으로 마이그레이션
4. A/B 테스트로 사용자 피드백 수집

### 5.4 다크모드 고려
- new_page는 라이트 모드 전용으로 설계됨
- 다크모드 지원 시 별도 테마 변수 필요
```css
.dark {
  --glass-bg: rgba(0, 0, 0, 0.7);
  --glass-border: rgba(255, 255, 255, 0.1);
}
```

---

## 6. 파일 복사 목록

### 필수 복사 파일
```
new_page/src/components/ui/sidebar.tsx    → src/components/ui/sidebar.tsx
new_page/src/components/ui/tooltip.tsx    → src/components/ui/tooltip.tsx (있으면 비교)
new_page/src/components/ui/collapsible.tsx → src/components/ui/collapsible.tsx (확인)
```

### 참조용 파일
```
new_page/src/components/admin/AdminLayout.tsx   → 레이아웃 참조
new_page/src/components/admin/AdminSidebar.tsx  → 사이드바 참조
new_page/src/components/admin/AdminDock.tsx     → 독 네비게이션 참조
new_page/src/components/admin/Dashboard.tsx     → 대시보드 참조
new_page/src/components/admin/Projects.tsx      → 프로젝트 목록 참조
new_page/src/components/admin/MyTasks.tsx       → 작업 목록 참조
new_page/src/styles/globals.css                 → CSS 변수 참조
```

---

## 7. 체크리스트

### Phase 1 체크리스트
- [ ] globals.css에 Glass Morphism 변수 추가
- [ ] tailwind.config.js 확장
- [ ] 유틸리티 클래스 생성
- [ ] 테스트 페이지에서 스타일 검증

### Phase 2 체크리스트
- [ ] SidebarProvider 컴포넌트 복사/수정
- [ ] Collapsible 컴포넌트 확인
- [ ] AdminSidebar 구현
- [ ] AdminDock 구현
- [ ] Layout 컴포넌트 업데이트
- [ ] Header 컴포넌트 업데이트

### Phase 3 체크리스트
- [ ] Dashboard 페이지 마이그레이션
- [ ] Tasks 페이지 마이그레이션
- [ ] Projects 페이지 마이그레이션
- [ ] Groupware 페이지들 마이그레이션
- [ ] Settings 페이지 마이그레이션
- [ ] 반응형 디자인 검증
- [ ] 브라우저 호환성 테스트

---

## 8. 결론

new_page 디자인 시스템은 현대적인 Glass Morphism UI와 Lime 액센트 컬러를 특징으로 합니다.
기존 프로젝트에 적용 시 다음 순서를 권장합니다:

1. **CSS 기반 작업**을 먼저 완료하여 스타일 시스템 구축
2. **레이아웃 컴포넌트**를 업데이트하여 전체 구조 변경
3. **개별 페이지**를 점진적으로 마이그레이션

이 접근 방식은 기존 기능을 유지하면서 점진적으로 새로운 디자인을 적용할 수 있게 해줍니다.
