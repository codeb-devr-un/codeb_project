'use client';

export const dynamic = 'force-dynamic';

import { Suspense, useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { signIn, useSession } from 'next-auth/react';

interface InvitationData {
  invitation: {
    id: string;
    email: string;
    role: string;
    status: string;
    expiresAt: string;
    workspace: {
      id: string;
      name: string;
      domain?: string;
    };
    inviter: {
      name: string;
      email: string;
    };
  };
}

function AcceptInvitationContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { data: session, status } = useSession();
  const token = searchParams?.get('token');

  const [invitation, setInvitation] = useState<InvitationData | null>(null);
  const [loading, setLoading] = useState(true);
  const [accepting, setAccepting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!token) {
      setError('초대 토큰이 없습니다.');
      setLoading(false);
      return;
    }

    fetchInvitation();
  }, [token]);

  const fetchInvitation = async () => {
    try {
      const response = await fetch(`/api/invitations/accept?token=${token}`);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || '초대 정보를 불러오는데 실패했습니다.');
      }

      setInvitation(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleAccept = async () => {
    if (!session?.user) {
      // 로그인 필요 - 초대 정보를 세션에 저장하고 로그인 페이지로
      sessionStorage.setItem('pendingInvitation', JSON.stringify({
        token,
        email: invitation?.invitation.email,
        workspaceName: invitation?.invitation.workspace.name,
      }));
      router.push('/login?redirect=/invitations/accept&token=' + token);
      return;
    }

    setAccepting(true);
    setError(null);

    try {
      const response = await fetch('/api/invitations/accept', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          token,
          userId: session.user.id,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || '초대 수락에 실패했습니다.');
      }

      if (data.requiresSignup) {
        // 회원가입 필요
        router.push('/signup?invitation=' + token);
      } else {
        // 성공 - 워크스페이스로 이동
        router.push(`/dashboard?workspace=${data.workspace.id}`);
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setAccepting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">초대 정보를 불러오는 중...</p>
        </div>
      </div>
    );
  }

  if (error || !invitation) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8">
          <div className="text-center">
            <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100">
              <svg className="h-6 w-6 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </div>
            <h2 className="mt-4 text-2xl font-bold text-gray-900">초대가 유효하지 않습니다</h2>
            <p className="mt-2 text-gray-600">{error}</p>
            <button
              onClick={() => router.push('/login')}
              className="mt-6 w-full bg-indigo-600 text-white py-2 px-4 rounded-md hover:bg-indigo-700"
            >
              로그인 페이지로 이동
            </button>
          </div>
        </div>
      </div>
    );
  }

  const { invitation: inv } = invitation;
  const isExpired = inv.status === 'EXPIRED' || new Date(inv.expiresAt) < new Date();
  const isAccepted = inv.status === 'ACCEPTED';
  const isRevoked = inv.status === 'REVOKED';

  if (isExpired) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8">
          <div className="text-center">
            <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-yellow-100">
              <svg className="h-6 w-6 text-yellow-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h2 className="mt-4 text-2xl font-bold text-gray-900">초대가 만료되었습니다</h2>
            <p className="mt-2 text-gray-600">
              이 초대는 {new Date(inv.expiresAt).toLocaleDateString('ko-KR')}에 만료되었습니다.
            </p>
            <p className="mt-2 text-sm text-gray-500">
              새로운 초대를 요청하려면 {inv.inviter.name}님께 연락하세요.
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (isRevoked) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8">
          <div className="text-center">
            <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100">
              <svg className="h-6 w-6 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </div>
            <h2 className="mt-4 text-2xl font-bold text-gray-900">초대가 취소되었습니다</h2>
            <p className="mt-2 text-gray-600">이 초대는 더 이상 유효하지 않습니다.</p>
          </div>
        </div>
      </div>
    );
  }

  if (isAccepted) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8">
          <div className="text-center">
            <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-green-100">
              <svg className="h-6 w-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h2 className="mt-4 text-2xl font-bold text-gray-900">이미 수락된 초대입니다</h2>
            <p className="mt-2 text-gray-600">이 초대는 이미 수락되었습니다.</p>
            <button
              onClick={() => router.push('/dashboard')}
              className="mt-6 w-full bg-indigo-600 text-white py-2 px-4 rounded-md hover:bg-indigo-700"
            >
              대시보드로 이동
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8">
        {/* Header */}
        <div className="text-center">
          <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-indigo-100">
            <svg className="h-6 w-6 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
          </div>
          <h2 className="mt-4 text-2xl font-bold text-gray-900">워크스페이스 초대</h2>
        </div>

        {/* Invitation Details */}
        <div className="mt-6">
          <div className="bg-gray-50 rounded-lg p-4">
            <p className="text-sm text-gray-600">
              <span className="font-semibold">{inv.inviter.name}</span>님이 회원님을
            </p>
            <p className="text-lg font-bold text-gray-900 mt-2">{inv.workspace.name}</p>
            <p className="text-sm text-gray-600 mt-1">워크스페이스에 초대했습니다.</p>

            <div className="mt-4 pt-4 border-t border-gray-200">
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600">초대된 이메일</span>
                <span className="font-medium text-gray-900">{inv.email}</span>
              </div>
              <div className="flex items-center justify-between text-sm mt-2">
                <span className="text-gray-600">역할</span>
                <span className="font-medium text-gray-900">
                  {inv.role === 'admin' ? '관리자' : '멤버'}
                </span>
              </div>
              <div className="flex items-center justify-between text-sm mt-2">
                <span className="text-gray-600">만료일</span>
                <span className="font-medium text-gray-900">
                  {new Date(inv.expiresAt).toLocaleDateString('ko-KR')}
                </span>
              </div>
            </div>
          </div>

          {/* Session Info */}
          {session?.user && (
            <div className="mt-4 p-3 bg-blue-50 rounded-lg">
              <p className="text-sm text-blue-800">
                <span className="font-semibold">{session.user.email}</span> 계정으로 로그인됨
              </p>
              {session.user.email !== inv.email && (
                <p className="text-xs text-blue-600 mt-1">
                  ⚠️ 초대된 이메일과 다른 계정입니다. 초대를 수락하려면 {inv.email} 계정으로 로그인하세요.
                </p>
              )}
            </div>
          )}

          {!session?.user && (
            <div className="mt-4 p-3 bg-yellow-50 rounded-lg">
              <p className="text-sm text-yellow-800">
                초대를 수락하려면 먼저 로그인하거나 회원가입이 필요합니다.
              </p>
            </div>
          )}

          {/* Error Message */}
          {error && (
            <div className="mt-4 p-3 bg-red-50 rounded-lg">
              <p className="text-sm text-red-800">{error}</p>
            </div>
          )}

          {/* Action Buttons */}
          <div className="mt-6 space-y-3">
            {session?.user ? (
              <>
                <button
                  onClick={handleAccept}
                  disabled={accepting || session.user.email !== inv.email}
                  className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {accepting ? (
                    <>
                      <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      수락 중...
                    </>
                  ) : (
                    '초대 수락'
                  )}
                </button>
                {session.user.email !== inv.email && (
                  <button
                    onClick={() => signIn('google', { callbackUrl: `/invitations/accept?token=${token}` })}
                    className="w-full flex justify-center py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                  >
                    다른 계정으로 로그인
                  </button>
                )}
              </>
            ) : (
              <>
                <button
                  onClick={() => signIn('google', { callbackUrl: `/invitations/accept?token=${token}` })}
                  className="w-full flex items-center justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                >
                  <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
                    <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                    <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                    <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                    <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                  </svg>
                  Google로 로그인
                </button>
                <p className="text-center text-sm text-gray-600">
                  또는{' '}
                  <button
                    onClick={() => router.push('/signup?invitation=' + token)}
                    className="font-medium text-indigo-600 hover:text-indigo-500"
                  >
                    회원가입
                  </button>
                </p>
              </>
            )}
          </div>

          {/* Footer */}
          <div className="mt-6 text-center">
            <p className="text-xs text-gray-500">
              초대를 수락하지 않으려면 이 페이지를 닫으세요.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function AcceptInvitationPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">로딩 중...</p>
        </div>
      </div>
    }>
      <AcceptInvitationContent />
    </Suspense>
  );
}
