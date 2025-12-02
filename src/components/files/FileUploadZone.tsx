'use client'

import React from 'react'

export default function FileUploadZone({ onUpload }: { onUpload: (files: File[]) => void }) {
  return (
    <div className="border-2 border-dashed border-gray-300 rounded-lg p-12 text-center">
      <p className="text-gray-500">파일 업로드 기능은 현재 사용할 수 없습니다.</p>
    </div>
  )
}