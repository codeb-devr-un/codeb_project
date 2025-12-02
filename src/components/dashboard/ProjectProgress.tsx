'use client'

import React from 'react'

export default function ProjectProgress() {
  return (
    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">프로젝트 진행 현황</h3>
      <div className="text-center text-gray-500 py-8">
        <p>데이터를 불러오는 중...</p>
      </div>
    </div>
  )
}