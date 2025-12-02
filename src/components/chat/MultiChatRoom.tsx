'use client'

import React from 'react'

export default function MultiChatRoom({ roomId, userName, userId }: { roomId: string, userName: string, userId: string }) {
  return (
    <div className="flex flex-col h-full items-center justify-center text-gray-500">
      <p>채팅방 기능은 현재 사용할 수 없습니다.</p>
    </div>
  )
}