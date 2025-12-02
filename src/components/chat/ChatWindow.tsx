'use client'

import React from 'react'

export default function ChatWindow({ chatId, onBack }: { chatId: string, onBack: () => void }) {
  return (
    <div className="flex flex-col h-full">
      <div className="p-4 border-b flex items-center gap-2">
        <button onClick={onBack} className="md:hidden p-2 hover:bg-gray-100 rounded-full">
          ←
        </button>
        <h3 className="font-semibold">채팅</h3>
      </div>
      <div className="flex-1 flex items-center justify-center text-gray-500">
        <p>채팅 기능은 현재 사용할 수 없습니다.</p>
      </div>
    </div>
  )
}