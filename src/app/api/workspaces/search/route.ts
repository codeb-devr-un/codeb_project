// =============================================================================
// Workspaces Search API - CVE-CB-005 Fixed: Secure Logging
// =============================================================================

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { secureLogger, createErrorResponse } from '@/lib/security';

// GET /api/workspaces/search - Search for workspaces by slug or invite code
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get('q');

    if (!query) {
      return NextResponse.json(
        { error: 'Search query is required' },
        { status: 400 }
      );
    }

    // Search by slug, invite code, or name
    const workspaces = await prisma.workspace.findMany({
      where: {
        AND: [
          {
            OR: [
              { slug: { contains: query.toLowerCase() } },
              { inviteCode: query.toUpperCase() },
              { name: { contains: query, mode: 'insensitive' } },
            ],
          },
          {
            // Only show public workspaces or workspaces that allow join requests
            OR: [
              { isPublic: true },
              { requireApproval: true },
            ],
          },
        ],
      },
      select: {
        id: true,
        name: true,
        slug: true,
        domain: true,
        isPublic: true,
        requireApproval: true,
        _count: {
          select: {
            members: true,
          },
        },
      },
      take: 10,
    });

    return NextResponse.json({ workspaces });
  } catch (error) {
    // CVE-CB-005: Secure logging
    secureLogger.error('Error searching workspaces', error as Error, { operation: 'workspaces.search' });
    return createErrorResponse('Failed to search workspaces', 500, 'SEARCH_FAILED');
  }
}

// GET /api/workspaces/search/by-code?code=ABC123 - Find workspace by invite code
export async function POST(request: NextRequest) {
  try {
    const { code } = await request.json();

    if (!code) {
      return NextResponse.json(
        { error: 'Invite code is required' },
        { status: 400 }
      );
    }

    const workspace = await prisma.workspace.findUnique({
      where: { inviteCode: code.toUpperCase() },
      select: {
        id: true,
        name: true,
        slug: true,
        domain: true,
        isPublic: true,
        requireApproval: true,
        _count: {
          select: {
            members: true,
          },
        },
      },
    });

    if (!workspace) {
      return NextResponse.json(
        { error: 'Workspace not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ workspace });
  } catch (error) {
    // CVE-CB-005: Secure logging
    secureLogger.error('Error finding workspace by code', error as Error, { operation: 'workspaces.findByCode' });
    return createErrorResponse('Failed to find workspace', 500, 'FIND_FAILED');
  }
}
