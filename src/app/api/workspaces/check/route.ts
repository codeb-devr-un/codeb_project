// =============================================================================
// Workspace Check API - 이름/도메인 중복 검사
// =============================================================================

export const dynamic = 'force-dynamic'

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth-options'
import { createErrorResponse } from '@/lib/security'

// GET /api/workspaces/check?name=xxx&domain=xxx
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.email) {
      return createErrorResponse('Unauthorized', 401, 'AUTH_REQUIRED')
    }

    const searchParams = request.nextUrl.searchParams
    const name = searchParams.get('name')
    const domain = searchParams.get('domain')

    const result: {
      nameAvailable?: boolean
      domainAvailable?: boolean
      nameError?: string
      domainError?: string
    } = {}

    // 이름 중복 검사
    if (name) {
      const trimmedName = name.trim()
      if (trimmedName.length < 2) {
        result.nameAvailable = false
        result.nameError = '이름은 2자 이상이어야 합니다.'
      } else {
        const existingByName = await prisma.workspace.findFirst({
          where: { name: { equals: trimmedName, mode: 'insensitive' } }
        })
        result.nameAvailable = !existingByName
        if (existingByName) {
          result.nameError = '이미 사용 중인 워크스페이스 이름입니다.'
        }
      }
    }

    // 도메인 중복 검사
    if (domain) {
      const trimmedDomain = domain.trim().toLowerCase()

      // 도메인 형식 검사 (영문 소문자, 숫자, 하이픈만 허용)
      const domainRegex = /^[a-z0-9]([a-z0-9-]*[a-z0-9])?$/
      if (!domainRegex.test(trimmedDomain)) {
        result.domainAvailable = false
        result.domainError = '도메인은 영문 소문자, 숫자, 하이픈(-)만 사용 가능합니다.'
      } else if (trimmedDomain.length < 2) {
        result.domainAvailable = false
        result.domainError = '도메인은 2자 이상이어야 합니다.'
      } else {
        const existingByDomain = await prisma.workspace.findUnique({
          where: { domain: trimmedDomain }
        })
        result.domainAvailable = !existingByDomain
        if (existingByDomain) {
          result.domainError = '이미 사용 중인 도메인입니다.'
        }
      }
    }

    return NextResponse.json(result)
  } catch (error) {
    console.error('Workspace check error:', error)
    return createErrorResponse('검사 중 오류가 발생했습니다.', 500, 'CHECK_FAILED')
  }
}
