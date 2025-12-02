'use client'

import React from 'react'

export default function OnlineStatus({ userId }: { userId: string }) {
  return (
    <span className="w-3 h-3 rounded-full bg-gray-300" title="오프라인 (시스템 점검중)" />
  )
}