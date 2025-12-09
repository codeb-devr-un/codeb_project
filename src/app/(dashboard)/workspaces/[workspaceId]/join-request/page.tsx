'use client';

const isDev = process.env.NODE_ENV === 'development'

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';

interface Workspace {
  id: string;
  name: string;
  slug: string;
  domain?: string;
  isPublic: boolean;
  requireApproval: boolean;
  _count: {
    members: number;
  };
}

export default function JoinRequestPage() {
  const params = useParams();
  const router = useRouter();
  const { data: session } = useSession();
  const workspaceId = params?.workspaceId as string;

  const [workspace, setWorkspace] = useState<Workspace | null>(null);
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [existingRequest, setExistingRequest] = useState<any>(null);

  useEffect(() => {
    if (!session?.user) {
      router.push('/login?redirect=' + encodeURIComponent(`/workspaces/${workspaceId}/join-request`));
      return;
    }

    fetchWorkspaceInfo();
    checkExistingRequest();
  }, [session, workspaceId]);

  const fetchWorkspaceInfo = async () => {
    try {
      const response = await fetch(`/api/workspaces/search`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ workspaceId }),
      });

      // Fallback: try to get workspace info from search by ID
      // In a real implementation, you'd have a dedicated endpoint
      // For now, we'll construct basic info
      setWorkspace({
        id: workspaceId,
        name: 'Workspace',
        slug: workspaceId,
        isPublic: true,
        requireApproval: true,
        _count: { members: 0 },
      });
    } catch (err) {
      if (isDev) console.error('Failed to fetch workspace:', err);
    } finally {
      setLoading(false);
    }
  };

  const checkExistingRequest = async () => {
    if (!session?.user?.id) return;

    try {
      const response = await fetch(
        `/api/workspaces/${workspaceId}/join-requests?userId=${session.user.id}`
      );

      if (response.ok) {
        const data = await response.json();
        if (data.joinRequests && data.joinRequests.length > 0) {
          setExistingRequest(data.joinRequests[0]);
        }
      }
    } catch (err) {
      if (isDev) console.error('Failed to check existing request:', err);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!session?.user?.id) return;

    setSubmitting(true);
    setError(null);

    try {
      const response = await fetch(`/api/workspaces/${workspaceId}/join-requests`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: session.user.id,
          message: message.trim(),
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || '가입 요청 전송에 실패했습니다.');
      }

      // Success - redirect to confirmation or dashboard
      router.push('/workspaces/join/success?workspace=' + workspaceId);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleCancelRequest = async () => {
    if (!existingRequest || !session?.user?.id) return;

    const confirmed = confirm('가입 요청을 취소하시겠습니까?');
    if (!confirmed) return;

    try {
      const response = await fetch(
        `/api/workspaces/${workspaceId}/join-requests/${existingRequest.id}/review?userId=${session.user.id}`,
        {
          method: 'DELETE',
        }
      );

      if (!response.ok) {
        throw new Error('가입 요청 취소에 실패했습니다.');
      }

      // Refresh page
      router.refresh();
      setExistingRequest(null);
    } catch (err: any) {
      setError(err.message);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">로딩 중...</p>
        </div>
      </div>
    );
  }

  // Existing request status
  if (existingRequest) {
    const statusColors = {
      PENDING: 'yellow',
      APPROVED: 'green',
      REJECTED: 'red',
      CANCELLED: 'gray',
    };

    const statusLabels = {
      PENDING: '승인 대기 중',
      APPROVED: '승인됨',
      REJECTED: '거절됨',
      CANCELLED: '취소됨',
    };

    const color = statusColors[existingRequest.status as keyof typeof statusColors];
    const label = statusLabels[existingRequest.status as keyof typeof statusLabels];

    return (
      <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-2xl mx-auto">
          <div className="bg-white rounded-lg shadow p-8">
            <div className="text-center">
              <div className={`mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-${color}-100`}>
                {existingRequest.status === 'PENDING' && (
                  <svg className={`h-6 w-6 text-${color}-600`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                )}
                {existingRequest.status === 'APPROVED' && (
                  <svg className={`h-6 w-6 text-${color}-600`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                )}
                {existingRequest.status === 'REJECTED' && (
                  <svg className={`h-6 w-6 text-${color}-600`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                )}
              </div>
              <h2 className="mt-4 text-2xl font-bold text-gray-900">가입 요청 {label}</h2>
              <p className="mt-2 text-gray-600">
                {workspace?.name || '워크스페이스'}에 대한 가입 요청이 이미 존재합니다.
              </p>

              <div className="mt-6 bg-gray-50 rounded-lg p-4">
                <div className="text-left space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">상태</span>
                    <span className={`font-medium text-${color}-600`}>{label}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">요청일</span>
                    <span className="font-medium text-gray-900">
                      {new Date(existingRequest.createdAt).toLocaleDateString('ko-KR')}
                    </span>
                  </div>
                  {existingRequest.message && (
                    <div className="pt-2 border-t border-gray-200">
                      <span className="text-sm text-gray-600">메시지</span>
                      <p className="mt-1 text-sm text-gray-900">{existingRequest.message}</p>
                    </div>
                  )}
                  {existingRequest.reviewNote && (
                    <div className="pt-2 border-t border-gray-200">
                      <span className="text-sm text-gray-600">검토 메모</span>
                      <p className="mt-1 text-sm text-gray-900">{existingRequest.reviewNote}</p>
                    </div>
                  )}
                </div>
              </div>

              <div className="mt-6 space-y-3">
                {existingRequest.status === 'PENDING' && (
                  <button
                    onClick={handleCancelRequest}
                    className="w-full inline-flex justify-center py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                  >
                    요청 취소
                  </button>
                )}
                {existingRequest.status === 'APPROVED' && (
                  <button
                    onClick={() => router.push('/dashboard')}
                    className="w-full inline-flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                  >
                    대시보드로 이동
                  </button>
                )}
                <button
                  onClick={() => router.push('/workspaces/join')}
                  className="w-full inline-flex justify-center py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
                >
                  다른 워크스페이스 찾기
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">워크스페이스 가입 요청</h1>
          <p className="mt-2 text-gray-600">
            {workspace?.name || '워크스페이스'}에 가입하려면 관리자의 승인이 필요합니다.
          </p>
        </div>

        {/* Workspace Info Card */}
        {workspace && (
          <div className="bg-white rounded-lg shadow mb-6 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">워크스페이스 정보</h3>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-600">이름</span>
                <span className="font-medium text-gray-900">{workspace.name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">슬러그</span>
                <span className="font-medium text-gray-900">@{workspace.slug}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">멤버 수</span>
                <span className="font-medium text-gray-900">{workspace._count.members}명</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">상태</span>
                <div className="flex gap-2">
                  {workspace.isPublic && (
                    <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-green-100 text-green-800">
                      공개
                    </span>
                  )}
                  {workspace.requireApproval && (
                    <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-yellow-100 text-yellow-800">
                      승인 필요
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Join Request Form */}
        <div className="bg-white rounded-lg shadow p-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="message" className="block text-sm font-medium text-gray-700">
                가입 요청 메시지
              </label>
              <div className="mt-1">
                <textarea
                  id="message"
                  rows={4}
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md"
                  placeholder="자기소개 및 가입 사유를 입력하세요 (선택사항)"
                />
              </div>
              <p className="mt-2 text-sm text-gray-500">
                관리자가 가입 요청을 검토할 때 참고할 메시지를 작성하세요.
              </p>
            </div>

            {/* User Info Display */}
            {session?.user && (
              <div className="bg-gray-50 rounded-lg p-4">
                <h4 className="text-sm font-medium text-gray-900 mb-2">요청자 정보</h4>
                <div className="space-y-1 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">이름</span>
                    <span className="font-medium text-gray-900">{session.user.name}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">이메일</span>
                    <span className="font-medium text-gray-900">{session.user.email}</span>
                  </div>
                </div>
              </div>
            )}

            {/* Error Message */}
            {error && (
              <div className="p-3 bg-red-50 rounded-lg">
                <p className="text-sm text-red-800">{error}</p>
              </div>
            )}

            {/* Submit Button */}
            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => router.back()}
                className="flex-1 bg-white py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                취소
              </button>
              <button
                type="submit"
                disabled={submitting}
                className="flex-1 bg-indigo-600 py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {submitting ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white inline" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    전송 중...
                  </>
                ) : (
                  '가입 요청 보내기'
                )}
              </button>
            </div>
          </form>

          {/* Info */}
          <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-blue-400" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm text-blue-700">
                  가입 요청을 보내면 워크스페이스 관리자가 검토하고 승인 여부를 결정합니다.
                  승인되면 이메일로 알림을 받게 됩니다.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
