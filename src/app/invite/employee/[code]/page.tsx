'use client'

import React from 'react'
import Link from 'next/link'

export default function EmployeeInvitePage({ params }: { params: { code: string } }) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="max-w-md w-full space-y-8 bg-white p-8 rounded-xl shadow-lg text-center">
        <h2 className="text-2xl font-bold text-gray-900">초대 링크 만료</h2>
        <p className="text-gray-600">
          이 초대 링크는 더 이상 유효하지 않거나 시스템 점검 중입니다.
          <br />
          관리자에게 문의해주세요.
        </p>
        <div className="mt-6">
          <Link href="/login" className="text-primary hover:underline">
            로그인 페이지로 이동
          </Link>
        </div>
      </div>
    </div>
  )
}
