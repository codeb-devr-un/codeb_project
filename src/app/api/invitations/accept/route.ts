// =============================================================================
// Invitations Accept API - CVE-CB-005 Fixed: Secure Logging
// =============================================================================

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { secureLogger, createErrorResponse } from '@/lib/security';

// POST /api/invitations/accept - Accept invitation
export async function POST(request: NextRequest) {
  try {
    const { token, userId } = await request.json();

    if (!token) {
      return NextResponse.json(
        { error: 'Token is required' },
        { status: 400 }
      );
    }

    // Find invitation
    const invitation = await prisma.invitation.findUnique({
      where: { token },
      include: {
        workspace: true,
      },
    });

    if (!invitation) {
      return NextResponse.json(
        { error: 'Invalid invitation token' },
        { status: 404 }
      );
    }

    // Check if already accepted
    if (invitation.status === 'ACCEPTED') {
      return NextResponse.json(
        { error: 'This invitation has already been accepted' },
        { status: 400 }
      );
    }

    // Check if expired
    if (invitation.status === 'EXPIRED' || new Date() > invitation.expiresAt) {
      await prisma.invitation.update({
        where: { id: invitation.id },
        data: { status: 'EXPIRED' },
      });
      return NextResponse.json(
        { error: 'This invitation has expired' },
        { status: 400 }
      );
    }

    // Check if revoked
    if (invitation.status === 'REVOKED') {
      return NextResponse.json(
        { error: 'This invitation has been revoked' },
        { status: 400 }
      );
    }

    // For new users, create user account first
    let finalUserId = userId;
    if (!userId) {
      // User needs to be created via OAuth or email signup first
      // For now, we'll return the workspace info for the signup flow
      return NextResponse.json({
        requiresSignup: true,
        workspace: {
          id: invitation.workspace.id,
          name: invitation.workspace.name,
        },
        invitation: {
          email: invitation.email,
          role: invitation.role,
        },
      });
    }

    // Verify user exists
    const user = await prisma.user.findUnique({
      where: { id: finalUserId },
    });

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    // Verify email matches
    if (user.email !== invitation.email) {
      return NextResponse.json(
        { error: 'Email mismatch: This invitation was sent to a different email address' },
        { status: 403 }
      );
    }

    // Check if user is already a member
    const existingMember = await prisma.workspaceMember.findUnique({
      where: {
        workspaceId_userId: {
          workspaceId: invitation.workspaceId,
          userId: finalUserId,
        },
      },
    });

    if (existingMember) {
      // Update invitation status but don't add duplicate member
      await prisma.invitation.update({
        where: { id: invitation.id },
        data: {
          status: 'ACCEPTED',
          acceptedAt: new Date(),
        },
      });

      return NextResponse.json({
        success: true,
        message: 'You are already a member of this workspace',
        workspace: invitation.workspace,
      });
    }

    // Add user to workspace and mark invitation as accepted
    const [workspaceMember] = await prisma.$transaction([
      prisma.workspaceMember.create({
        data: {
          workspaceId: invitation.workspaceId,
          userId: finalUserId,
          role: invitation.role,
        },
      }),
      prisma.invitation.update({
        where: { id: invitation.id },
        data: {
          status: 'ACCEPTED',
          acceptedAt: new Date(),
        },
      }),
    ]);

    return NextResponse.json({
      success: true,
      workspace: invitation.workspace,
      member: workspaceMember,
    });
  } catch (error) {
    // CVE-CB-005: Secure logging
    secureLogger.error('Error accepting invitation', error as Error, { operation: 'invitations.accept' });
    return createErrorResponse('Failed to accept invitation', 500, 'ACCEPT_FAILED');
  }
}

// GET /api/invitations/accept?token=xxx - Get invitation details
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const token = searchParams.get('token');

    if (!token) {
      return NextResponse.json(
        { error: 'Token is required' },
        { status: 400 }
      );
    }

    const invitation = await prisma.invitation.findUnique({
      where: { token },
      include: {
        workspace: {
          select: {
            id: true,
            name: true,
            domain: true,
          },
        },
        inviter: {
          select: {
            name: true,
            email: true,
          },
        },
      },
    });

    if (!invitation) {
      return NextResponse.json(
        { error: 'Invalid invitation token' },
        { status: 404 }
      );
    }

    // Check expiration
    const isExpired = new Date() > invitation.expiresAt;
    if (isExpired && invitation.status === 'PENDING') {
      await prisma.invitation.update({
        where: { id: invitation.id },
        data: { status: 'EXPIRED' },
      });
    }

    return NextResponse.json({
      invitation: {
        id: invitation.id,
        email: invitation.email,
        role: invitation.role,
        status: isExpired ? 'EXPIRED' : invitation.status,
        expiresAt: invitation.expiresAt,
        workspace: invitation.workspace,
        inviter: invitation.inviter,
      },
    });
  } catch (error) {
    // CVE-CB-005: Secure logging
    secureLogger.error('Error fetching invitation', error as Error, { operation: 'invitations.get' });
    return createErrorResponse('Failed to fetch invitation', 500, 'FETCH_FAILED');
  }
}
