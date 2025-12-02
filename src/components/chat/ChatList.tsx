'use client'

import React from 'react'

export default function ChatList({ onSelectChat }: { onSelectChat: (chatId: string) => void }) {
  return (
    <div className="p-4 text-center text-gray-500">
      <p>채팅 기능은 현재 사용할 수 없습니다.</p>
      <p className="text-xs mt-2">(PostgreSQL 마이그레이션 진행 중)</p>
    </div>
  )
}