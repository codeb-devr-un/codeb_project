'use client';

import { useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { useWorkspace } from '@/lib/workspace-context';

export default function JoinRequestSuccessPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { refreshWorkspaces } = useWorkspace();
  const workspaceId = searchParams?.get('workspace');
  const [countdown, setCountdown] = useState(10);
  const [refreshed, setRefreshed] = useState(false);

  // 가입 성공 후 워크스페이스 목록 새로고침
  useEffect(() => {
    const refreshAndSetWorkspace = async () => {
      if (refreshed) return;
      setRefreshed(true);

      try {
        await refreshWorkspaces();
        // 새로 가입한 워크스페이스를 현재 워크스페이스로 설정
        if (workspaceId) {
          localStorage.setItem('currentWorkspaceId', workspaceId);
        }
      } catch (error) {
        console.error('Failed to refresh workspaces:', error);
      }
    };

    refreshAndSetWorkspace();
  }, [refreshWorkspaces, workspaceId, refreshed]);

  useEffect(() => {
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          router.push('/dashboard');
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [router]);

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full">
        <div className="bg-white rounded-lg shadow-lg p-8">
          {/* Success Icon */}
          <div className="text-center">
            <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-green-100 animate-bounce">
              <svg
                className="h-10 w-10 text-green-600"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M5 13l4 4L19 7"
                />
              </svg>
            </div>

            {/* Success Message */}
            <h2 className="mt-6 text-3xl font-bold text-gray-900">가입 요청 완료!</h2>
            <p className="mt-3 text-gray-600">
              워크스페이스 가입 요청이 성공적으로 전송되었습니다.
            </p>

            {/* Details */}
            <div className="mt-6 bg-gray-50 rounded-lg p-4">
              <div className="space-y-3 text-sm text-left">
                <div className="flex items-start">
                  <svg
                    className="h-5 w-5 text-green-500 mr-3 mt-0.5 flex-shrink-0"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                  <p className="text-gray-700">
                    워크스페이스 관리자가 요청을 검토하고 있습니다.
                  </p>
                </div>
                <div className="flex items-start">
                  <svg
                    className="h-5 w-5 text-green-500 mr-3 mt-0.5 flex-shrink-0"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                    />
                  </svg>
                  <p className="text-gray-700">
                    승인 여부는 이메일로 알려드립니다.
                  </p>
                </div>
                <div className="flex items-start">
                  <svg
                    className="h-5 w-5 text-green-500 mr-3 mt-0.5 flex-shrink-0"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                  <p className="text-gray-700">
                    일반적으로 1-3일 이내에 검토가 완료됩니다.
                  </p>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="mt-8 space-y-3">
              <button
                onClick={() => router.push('/dashboard')}
                className="w-full inline-flex justify-center items-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                대시보드로 이동
              </button>
              <button
                onClick={() => router.push('/workspaces/join')}
                className="w-full inline-flex justify-center items-center px-6 py-3 border border-gray-300 text-base font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                다른 워크스페이스 찾기
              </button>
            </div>

            {/* Auto Redirect Notice */}
            <div className="mt-6">
              <p className="text-sm text-gray-500">
                {countdown}초 후 자동으로 대시보드로 이동합니다.
              </p>
            </div>
          </div>
        </div>

        {/* Additional Info */}
        <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg
                className="h-5 w-5 text-blue-400"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fillRule="evenodd"
                  d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                  clipRule="evenodd"
                />
              </svg>
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-blue-800">다음 단계</h3>
              <div className="mt-2 text-sm text-blue-700">
                <ul className="list-disc list-inside space-y-1">
                  <li>대시보드에서 요청 상태를 확인할 수 있습니다.</li>
                  <li>승인되면 자동으로 워크스페이스에 추가됩니다.</li>
                  <li>거절된 경우 다시 신청할 수 있습니다.</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
