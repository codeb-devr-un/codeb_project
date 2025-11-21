'use client'

import Image from 'next/image'
import { useState } from 'react'
import { cn } from '@/lib/utils'

interface OptimizedImageProps {
  src: string
  alt: string
  width?: number
  height?: number
  priority?: boolean
  className?: string
  objectFit?: 'contain' | 'cover' | 'fill' | 'none' | 'scale-down'
  quality?: number
  placeholder?: 'blur' | 'empty'
  blurDataURL?: string
  onLoad?: () => void
  onError?: () => void
}

export function OptimizedImage({
  src,
  alt,
  width = 400,
  height = 300,
  priority = false,
  className,
  objectFit = 'cover',
  quality = 75,
  placeholder = 'blur',
  blurDataURL,
  onLoad,
  onError
}: OptimizedImageProps) {
  const [isLoading, setIsLoading] = useState(true)
  const [hasError, setHasError] = useState(false)
  
  const handleLoad = () => {
    setIsLoading(false)
    onLoad?.()
  }
  
  const handleError = () => {
    setIsLoading(false)
    setHasError(true)
    onError?.()
  }
  
  if (hasError) {
    return (
      <div 
        className={cn(
          "flex items-center justify-center bg-gray-100 rounded",
          className
        )}
        style={{ width, height }}
      >
        <div className="text-center p-4">
          <svg 
            className="w-12 h-12 mx-auto text-gray-400 mb-2" 
            fill="none" 
            stroke="currentColor" 
            viewBox="0 0 24 24"
          >
            <path 
              strokeLinecap="round" 
              strokeLinejoin="round" 
              strokeWidth={2} 
              d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" 
            />
          </svg>
          <p className="text-sm text-gray-500">이미지를 불러올 수 없습니다</p>
        </div>
      </div>
    )
  }
  
  return (
    <div className={cn("relative overflow-hidden", className)}>
      {isLoading && (
        <div 
          className="absolute inset-0 bg-gray-200 animate-pulse"
          style={{ width, height }}
        />
      )}
      <Image
        src={src}
        alt={alt}
        width={width}
        height={height}
        priority={priority}
        quality={quality}
        placeholder={placeholder}
        blurDataURL={blurDataURL || generateBlurDataURL()}
        onLoad={handleLoad}
        onError={handleError}
        className={cn(
          "transition-opacity duration-300",
          isLoading ? "opacity-0" : "opacity-100"
        )}
        style={{ objectFit }}
      />
    </div>
  )
}

// 기본 blur 데이터 URL 생성
function generateBlurDataURL(): string {
  const shimmer = `
    <svg width="400" height="300" version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink">
      <defs>
        <linearGradient id="g">
          <stop stop-color="#f6f7f8" offset="20%" />
          <stop stop-color="#edeef1" offset="50%" />
          <stop stop-color="#f6f7f8" offset="70%" />
        </linearGradient>
      </defs>
      <rect width="400" height="300" fill="#f6f7f8" />
      <rect id="r" width="400" height="300" fill="url(#g)" />
      <animate xlink:href="#r" attributeName="x" from="-400" to="400" dur="1s" repeatCount="indefinite" />
    </svg>`
  
  return `data:image/svg+xml;base64,${btoa(shimmer)}`
}

// 반응형 이미지 컴포넌트
export function ResponsiveImage({
  src,
  alt,
  aspectRatio = '16/9',
  ...props
}: Omit<OptimizedImageProps, 'width' | 'height'> & {
  aspectRatio?: string
}) {
  return (
    <div className="relative w-full" style={{ aspectRatio }}>
      <Image
        src={src}
        alt={alt}
        fill
        {...props}
      />
    </div>
  )
}