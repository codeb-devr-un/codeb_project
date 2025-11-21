import { auth } from './firebase'

/**
 * 안전한 사용자 역할 검증
 * Firebase ID 토큰에서 직접 역할을 가져와 검증
 */
export async function getVerifiedUserRole(): Promise<string | null> {
  try {
    const user = auth.currentUser
    if (!user) return null
    
    // Firebase ID 토큰 가져오기
    const idTokenResult = await user.getIdTokenResult()
    
    // 커스텀 클레임에서 역할 가져오기 (서버에서 설정)
    const role = idTokenResult.claims.role as string
    
    return role || 'customer' // 기본값
  } catch (error) {
    console.error('역할 검증 실패:', error)
    return null
  }
}

/**
 * 사용자 권한 검증
 */
export async function hasPermission(requiredRole: string): Promise<boolean> {
  const userRole = await getVerifiedUserRole()
  if (!userRole) return false
  
  const roleHierarchy: Record<string, number> = {
    admin: 4,
    manager: 3,
    developer: 2,
    customer: 1,
    external: 0
  }
  
  return (roleHierarchy[userRole] || 0) >= (roleHierarchy[requiredRole] || 0)
}

/**
 * CSRF 토큰 생성
 */
export function generateCSRFToken(): string {
  return Array.from(crypto.getRandomValues(new Uint8Array(32)))
    .map(b => b.toString(16).padStart(2, '0'))
    .join('')
}

/**
 * CSRF 토큰 검증
 */
export function verifyCSRFToken(token: string, storedToken: string): boolean {
  return token === storedToken && token.length === 64
}