import DOMPurify from 'isomorphic-dompurify'

/**
 * XSS 방지를 위한 HTML 살균
 */
export function sanitizeHTML(dirty: string): string {
  return DOMPurify.sanitize(dirty, {
    ALLOWED_TAGS: ['b', 'i', 'u', 'strong', 'em', 'a', 'p', 'br'],
    ALLOWED_ATTR: ['href', 'target']
  })
}

/**
 * 일반 텍스트 입력 검증
 */
export function sanitizeText(text: string): string {
  return text
    .trim()
    .replace(/[<>]/g, '') // HTML 태그 제거
    .slice(0, 1000) // 최대 길이 제한
}

/**
 * 이메일 검증
 */
export function validateEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

/**
 * 프로젝트 이름 검증
 */
export function validateProjectName(name: string): { isValid: boolean; error?: string } {
  if (!name || name.trim().length === 0) {
    return { isValid: false, error: '프로젝트 이름을 입력해주세요.' }
  }
  if (name.length < 2) {
    return { isValid: false, error: '프로젝트 이름은 최소 2자 이상이어야 합니다.' }
  }
  if (name.length > 100) {
    return { isValid: false, error: '프로젝트 이름은 100자를 초과할 수 없습니다.' }
  }
  if (!/^[가-힣a-zA-Z0-9\s\-_]+$/.test(name)) {
    return { isValid: false, error: '프로젝트 이름에는 특수문자를 사용할 수 없습니다.' }
  }
  return { isValid: true }
}

/**
 * 파일 업로드 검증
 */
export function validateFileUpload(file: File): { isValid: boolean; error?: string } {
  const MAX_FILE_SIZE = 10 * 1024 * 1024 // 10MB
  const ALLOWED_TYPES = [
    'image/jpeg',
    'image/png',
    'image/gif',
    'image/webp',
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/vnd.ms-excel',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
  ]
  
  if (file.size > MAX_FILE_SIZE) {
    return { isValid: false, error: '파일 크기는 10MB를 초과할 수 없습니다.' }
  }
  
  if (!ALLOWED_TYPES.includes(file.type)) {
    return { isValid: false, error: '허용되지 않은 파일 형식입니다.' }
  }
  
  return { isValid: true }
}

/**
 * SQL Injection 방지를 위한 쿼리 파라미터 검증
 */
export function sanitizeQueryParam(param: string): string {
  return param
    .replace(/['"\\;]/g, '') // 위험한 문자 제거
    .trim()
    .slice(0, 100) // 최대 길이 제한
}