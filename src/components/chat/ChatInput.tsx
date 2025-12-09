'use client'

import React, { useState, useRef } from 'react'
import { motion } from 'framer-motion'

interface AttachedFile {
  id: string
  name: string
  size: number
  type: string
  preview?: string
}

interface ChatInputProps {
  onSend: (message: string, files?: AttachedFile[]) => void
  onTyping?: (isTyping: boolean) => void
  disabled?: boolean
}

export default function ChatInput({ onSend, onTyping, disabled }: ChatInputProps) {
  const [message, setMessage] = useState('')
  const [isTyping, setIsTyping] = useState(false)
  const [attachedFiles, setAttachedFiles] = useState<AttachedFile[]>([])
  const inputRef = useRef<HTMLTextAreaElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    if ((message.trim() || attachedFiles.length > 0) && !disabled) {
      onSend(message.trim(), attachedFiles.length > 0 ? attachedFiles : undefined)
      setMessage('')
      setAttachedFiles([])
      setIsTyping(false)
      if (onTyping) onTyping(false)
      
      // 입력창에 포커스 유지
      inputRef.current?.focus()
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSubmit(e)
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setMessage(e.target.value)
    
    // 타이핑 상태 관리
    if (!isTyping && e.target.value.length > 0) {
      setIsTyping(true)
      if (onTyping) onTyping(true)
    }
    
    // 타이핑을 멈추면 일정 시간 후 타이핑 상태 해제
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current)
    }
    
    typingTimeoutRef.current = setTimeout(() => {
      setIsTyping(false)
      if (onTyping) onTyping(false)
    }, 1000) as unknown as NodeJS.Timeout
  }

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || [])
    
    files.forEach(file => {
      // 파일 크기 제한 (10MB)
      if (file.size > 10 * 1024 * 1024) {
        alert(`파일 크기가 너무 큽니다: ${file.name}`)
        return
      }

      const attachedFile: AttachedFile = {
        id: `file-${Date.now()}-${Math.random()}`,
        name: file.name,
        size: file.size,
        type: file.type,
      }

      // 이미지인 경우 미리보기 생성
      if (file.type.startsWith('image/')) {
        const reader = new FileReader()
        reader.onload = (e) => {
          attachedFile.preview = e.target?.result as string
          setAttachedFiles(prev => [...prev, attachedFile])
        }
        reader.readAsDataURL(file)
      } else {
        setAttachedFiles(prev => [...prev, attachedFile])
      }
    })

    // 파일 입력 초기화
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  const removeFile = (fileId: string) => {
    setAttachedFiles(prev => prev.filter(f => f.id !== fileId))
  }

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  const getFileIcon = (type: string) => {
    if (type.startsWith('image/')) return '🖼️'
    if (type.startsWith('video/')) return '🎥'
    if (type.includes('pdf')) return '📄'
    if (type.includes('document') || type.includes('text')) return '📄'
    return '📎'
  }

  return (
    <form onSubmit={handleSubmit} className="border-t border-gray-200 p-4">
      {/* 첨부된 파일 미리보기 */}
      {attachedFiles.length > 0 && (
        <div className="mb-4 space-y-2">
          <p className="text-sm text-gray-600">첨부 파일 ({attachedFiles.length}개)</p>
          <div className="flex flex-wrap gap-2">
            {attachedFiles.map((file) => (
              <motion.div
                key={file.id}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                className="relative bg-gray-50 border rounded-lg p-2 max-w-xs"
              >
                <div className="flex items-center space-x-2">
                  {file.preview ? (
                    <img
                      src={file.preview}
                      alt={file.name}
                      className="w-8 h-8 object-cover rounded"
                    />
                  ) : (
                    <span className="text-lg">{getFileIcon(file.type)}</span>
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">
                      {file.name}
                    </p>
                    <p className="text-xs text-gray-500">
                      {formatFileSize(file.size)}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => removeFile(file.id)}
                    className="text-gray-400 hover:text-red-500 transition-colors"
                  >
                    ✕
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      )}

      <div className="flex items-end gap-3">
        <div className="flex-1 relative">
          <textarea
            ref={inputRef}
            value={message}
            onChange={handleChange}
            onKeyPress={handleKeyPress}
            placeholder="메시지를 입력하세요..."
            disabled={disabled}
            rows={1}
            className="w-full px-4 py-3 pr-12 border border-gray-300 rounded-2xl resize-none
                     focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary
                     disabled:bg-gray-100 disabled:cursor-not-allowed
                     max-h-32"
            style={{
              minHeight: '48px',
              height: 'auto'
            }}
          />
          
          {/* 파일 첨부 버튼 */}
          <input
            ref={fileInputRef}
            type="file"
            multiple
            onChange={handleFileSelect}
            className="hidden"
            accept="image/*,video/*,.pdf,.doc,.docx,.txt"
          />
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="absolute right-3 bottom-3 text-gray-400 hover:text-gray-600 transition-colors"
            disabled={disabled}
            aria-label="파일 첨부"
          >
            📎
          </button>
        </div>
        
        <motion.button
          type="submit"
          disabled={(!message.trim() && attachedFiles.length === 0) || disabled}
          aria-label="전송"
          className={`
            p-3 rounded-full transition-all
            ${(message.trim() || attachedFiles.length > 0) && !disabled
              ? 'bg-primary text-white hover:bg-primary-hover'
              : 'bg-gray-200 text-gray-400 cursor-not-allowed'
            }
          `}
          whileHover={(message.trim() || attachedFiles.length > 0) && !disabled ? { scale: 1.05 } : {}}
          whileTap={(message.trim() || attachedFiles.length > 0) && !disabled ? { scale: 0.95 } : {}}
        >
          <svg 
            width="20" 
            height="20" 
            viewBox="0 0 20 20" 
            fill="none" 
            xmlns="http://www.w3.org/2000/svg"
          >
            <path 
              d="M2 10L17 2L13 10L17 18L2 10Z" 
              fill="currentColor"
            />
          </svg>
        </motion.button>
      </div>
      
      {/* 빠른 답변 (고객 지원용) */}
      <div className="mt-3 flex gap-2 flex-wrap">
        {['안녕하세요', '감사합니다', '확인했습니다', '언제 완료되나요?'].map((quick) => (
          <button
            key={quick}
            type="button"
            onClick={() => setMessage(quick)}
            className="text-sm px-3 py-1 bg-gray-100 hover:bg-gray-200 rounded-full transition-colors"
          >
            {quick}
          </button>
        ))}
      </div>
    </form>
  )
}