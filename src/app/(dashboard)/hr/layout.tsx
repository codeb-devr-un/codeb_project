'use client'

import { ReactNode } from 'react'

interface HRLayoutProps {
  children: ReactNode
}

/**
 * HR 모듈 레이아웃
 * 모든 워크스페이스 멤버 접근 가능
 * 페이지 내부에서 역할별 기능 제한 (설정 탭은 admin만)
 */
export default function HRLayout({ children }: HRLayoutProps) {
  return <>{children}</>
}
