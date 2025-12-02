// =============================================================================
// Board API - CVE-CB-002 Fixed: Authentication Required
// =============================================================================

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { authenticateRequest, secureLogger, createErrorResponse } from '@/lib/security'
import {
  validateBody,
  validateQuery,
  validationErrorResponse,
  boardPostCreateSchema,
  boardQuerySchema,
} from '@/lib/validation'

export async function GET(request: NextRequest) {
  try {
    // CVE-CB-002 Fix: Require authentication
    const user = await authenticateRequest()
    if (!user) {
      return createErrorResponse('Unauthorized', 401, 'AUTH_REQUIRED')
    }

    const { searchParams } = new URL(request.url)

    // CVE-CB-007 Fix: Validate query parameters
    const validation = validateQuery(searchParams, boardQuerySchema)
    if (!validation.success) {
      return validationErrorResponse(validation.errors!)
    }

    const { workspaceId, category, page, limit, sortOrder } = validation.data!

    // If workspaceId provided, verify user has access
    if (workspaceId) {
      const membership = await prisma.workspaceMember.findUnique({
        where: {
          workspaceId_userId: {
            workspaceId,
            userId: user.id,
          },
        },
      })

      if (!membership) {
        return createErrorResponse('Forbidden', 403, 'NOT_A_MEMBER')
      }
    }

    const where: Record<string, unknown> = {}
    if (workspaceId) where.workspaceId = workspaceId
    if (category) where.category = category

    const posts = await prisma.board.findMany({
      where,
      orderBy: [
        { isPinned: 'desc' },
        { createdAt: sortOrder },
      ],
      include: {
        author: {
          select: { id: true, name: true, email: true, avatar: true }
        },
        _count: {
          select: { comments: true }
        }
      },
      skip: (page - 1) * limit,
      take: limit,
    })

    // Add isNew flag for posts created in last 24 hours
    const now = new Date()
    const oneDayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000)

    const postsWithMeta = posts.map(post => ({
      ...post,
      commentCount: post._count.comments,
      isNew: new Date(post.createdAt) > oneDayAgo,
      views: post.viewCount,
    }))

    return NextResponse.json(postsWithMeta)
  } catch (error) {
    // CVE-CB-005 Fix: Use secure logging
    secureLogger.error('Failed to fetch board posts', error as Error, { operation: 'board.list' })
    return createErrorResponse('Failed to fetch posts', 500, 'FETCH_FAILED')
  }
}

export async function POST(request: NextRequest) {
  try {
    // CVE-CB-002 Fix: Require authentication
    const user = await authenticateRequest()
    if (!user) {
      return createErrorResponse('Unauthorized', 401, 'AUTH_REQUIRED')
    }

    // CVE-CB-007 Fix: Validate request body with Zod schema
    const validation = await validateBody(request, boardPostCreateSchema.omit({ authorId: true }))
    if (!validation.success) {
      return validationErrorResponse(validation.errors!)
    }

    const { title, content, workspaceId, category, isPinned } = validation.data!

    // Verify user has access to workspace
    const membership = await prisma.workspaceMember.findUnique({
      where: {
        workspaceId_userId: {
          workspaceId,
          userId: user.id,
        },
      },
    })

    if (!membership) {
      return createErrorResponse('Forbidden', 403, 'NOT_A_MEMBER')
    }

    const post = await prisma.board.create({
      data: {
        title,
        content,
        authorId: user.id, // Use authenticated user's ID, not from request body
        workspaceId,
        category: category || '',
        isPinned: isPinned || false,
      },
      include: {
        author: {
          select: { id: true, name: true, email: true, avatar: true }
        }
      }
    })

    secureLogger.info('Board post created', {
      operation: 'board.create',
      userId: user.id,
      workspaceId,
      resourceId: post.id,
    })

    return NextResponse.json(post, { status: 201 })
  } catch (error) {
    secureLogger.error('Failed to create post', error as Error, { operation: 'board.create' })
    return createErrorResponse('Failed to create post', 500, 'CREATE_FAILED')
  }
}
