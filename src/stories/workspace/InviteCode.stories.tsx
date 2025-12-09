import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import React, { useState } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import {
  Copy,
  Check,
  RefreshCw,
  Link2,
  QrCode,
  Share2,
  Users,
  Loader2,
  Building2,
  CheckCircle2,
  XCircle,
  ArrowRight,
  Sparkles
} from 'lucide-react'
import { cn } from '@/lib/utils'

// ================================
// 1. 초대 코드 모달 (관리자용)
// ================================
const InviteCodeModal = ({ isOpen = true }: { isOpen?: boolean }) => {
  const [copied, setCopied] = useState(false)
  const [copiedLink, setCopiedLink] = useState(false)
  const inviteCode = 'ABC123'
  const workspaceName = 'CodeB Team'

  const handleCopy = () => {
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const handleCopyLink = () => {
    setCopiedLink(true)
    setTimeout(() => setCopiedLink(false), 2000)
  }

  return (
    <div className="flex items-center justify-center min-h-[600px] bg-slate-100 p-8">
      <Dialog open={isOpen}>
        <DialogContent className="sm:max-w-md bg-white/95 backdrop-blur-xl border-white/60 rounded-3xl shadow-2xl">
          <DialogHeader className="space-y-3 pb-4">
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-lime-100 rounded-2xl">
                <Users className="w-5 h-5 text-lime-600" />
              </div>
              <div>
                <DialogTitle className="text-xl font-bold text-slate-900">
                  멤버 초대
                </DialogTitle>
                <DialogDescription className="text-slate-500 text-sm">
                  초대 코드 또는 링크를 공유하여 멤버를 초대하세요
                </DialogDescription>
              </div>
            </div>
          </DialogHeader>

          <div className="space-y-6">
            {/* 워크스페이스 정보 */}
            <div className="flex items-center gap-2 p-3 bg-slate-50 rounded-xl">
              <Badge variant="outline" className="bg-white">
                {workspaceName}
              </Badge>
              <span className="text-xs text-slate-500">워크스페이스</span>
            </div>

            {/* 초대 코드 표시 */}
            <div className="space-y-3">
              <label className="text-sm font-medium text-slate-700 flex items-center gap-2">
                <QrCode className="w-4 h-4 text-slate-400" />
                초대 코드
              </label>
              <div className="flex gap-2">
                <Input
                  value={inviteCode}
                  readOnly
                  className={cn(
                    "text-center text-2xl font-mono font-bold tracking-[0.3em] h-14",
                    "bg-gradient-to-r from-slate-50 to-slate-100",
                    "border-slate-200 rounded-xl",
                    "uppercase select-all"
                  )}
                />
                <Button
                  variant="outline"
                  size="icon"
                  className="h-14 w-14 rounded-xl border-slate-200 hover:bg-lime-50 hover:border-lime-300 transition-colors"
                  onClick={handleCopy}
                >
                  {copied ? (
                    <Check className="w-5 h-5 text-lime-600" />
                  ) : (
                    <Copy className="w-5 h-5 text-slate-500" />
                  )}
                </Button>
              </div>
            </div>

            {/* 초대 링크 */}
            <div className="space-y-3">
              <label className="text-sm font-medium text-slate-700 flex items-center gap-2">
                <Link2 className="w-4 h-4 text-slate-400" />
                초대 링크
              </label>
              <div className="flex gap-2">
                <Input
                  value={`https://workb.net/join/${inviteCode}`}
                  readOnly
                  className="flex-1 text-sm bg-slate-50 border-slate-200 rounded-xl text-slate-600 truncate"
                />
                <Button
                  variant="outline"
                  size="icon"
                  className="rounded-xl border-slate-200 hover:bg-lime-50 hover:border-lime-300 transition-colors"
                  onClick={handleCopyLink}
                >
                  {copiedLink ? (
                    <Check className="w-4 h-4 text-lime-600" />
                  ) : (
                    <Copy className="w-4 h-4 text-slate-500" />
                  )}
                </Button>
                <Button
                  variant="outline"
                  size="icon"
                  className="rounded-xl border-slate-200 hover:bg-violet-50 hover:border-violet-300 transition-colors"
                >
                  <Share2 className="w-4 h-4 text-slate-500" />
                </Button>
              </div>
            </div>

            {/* 안내 문구 */}
            <div className="p-4 bg-amber-50 border border-amber-100 rounded-xl">
              <p className="text-sm text-amber-800">
                <strong>사용 방법:</strong> 초대받은 사람이 링크를 클릭하거나 초대 코드를 입력하면
                <strong className="text-amber-900"> Google 로그인</strong> 후 자동으로 워크스페이스에 가입됩니다.
              </p>
            </div>

            {/* 버튼 영역 */}
            <div className="flex gap-3 pt-2">
              <Button
                variant="outline"
                className="flex-1 rounded-xl h-11 border-slate-200 hover:bg-slate-50"
              >
                <RefreshCw className="w-4 h-4 mr-2" />
                코드 재생성
              </Button>
              <Button
                variant="limePrimary"
                className="flex-1 rounded-xl h-11"
                onClick={handleCopyLink}
              >
                {copiedLink ? (
                  <>
                    <Check className="w-4 h-4 mr-2" />
                    복사됨!
                  </>
                ) : (
                  <>
                    <Link2 className="w-4 h-4 mr-2" />
                    링크 복사
                  </>
                )}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}

// ================================
// 2. 초대 수락 페이지 - 로딩 상태
// ================================
const JoinPageLoading = () => {
  return (
    <div className="min-h-[600px] flex items-center justify-center bg-gradient-to-br from-slate-50 via-lime-50/30 to-slate-50 p-4">
      <div className="flex flex-col items-center gap-4">
        <div className="relative">
          <div className="w-16 h-16 rounded-full border-4 border-lime-200 border-t-lime-500 animate-spin" />
          <div className="absolute inset-0 flex items-center justify-center">
            <Building2 className="w-6 h-6 text-lime-600" />
          </div>
        </div>
        <p className="text-slate-500 font-medium">워크스페이스 정보를 확인하는 중...</p>
      </div>
    </div>
  )
}

// ================================
// 3. 초대 수락 페이지 - 에러 상태
// ================================
const JoinPageError = () => {
  return (
    <div className="min-h-[600px] flex items-center justify-center bg-gradient-to-br from-slate-50 via-rose-50/30 to-slate-50 p-4">
      <Card className="max-w-md w-full bg-white/80 backdrop-blur-xl border-white/60 rounded-3xl shadow-2xl">
        <CardContent className="pt-8 pb-8 text-center">
          <div className="w-20 h-20 bg-rose-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <XCircle className="w-10 h-10 text-rose-500" />
          </div>
          <h1 className="text-2xl font-bold text-slate-900 mb-3">초대 코드 오류</h1>
          <p className="text-slate-600 mb-8">유효하지 않은 초대 코드입니다. 코드를 다시 확인해주세요.</p>
          <div className="flex gap-3">
            <Button
              variant="outline"
              className="flex-1 rounded-xl h-11"
            >
              홈으로
            </Button>
            <Button
              variant="limePrimary"
              className="flex-1 rounded-xl h-11"
            >
              다시 시도
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

// ================================
// 4. 초대 수락 페이지 - 가입 전
// ================================
const JoinPageReady = () => {
  const workspace = {
    name: 'CodeB Team',
    memberCount: 12,
    isPublic: false
  }
  const inviteCode = 'ABC123'

  return (
    <div className="min-h-[600px] flex items-center justify-center bg-gradient-to-br from-slate-50 via-lime-50/30 to-slate-50 p-4">
      <Card className="max-w-md w-full bg-white/80 backdrop-blur-xl border-white/60 rounded-3xl shadow-2xl overflow-hidden">
        {/* 헤더 배경 */}
        <div className="bg-gradient-to-r from-lime-500 to-lime-400 p-6 pb-12">
          <div className="flex items-center gap-2 text-lime-100 text-sm mb-2">
            <Building2 className="w-4 h-4" />
            <span>워크스페이스 초대</span>
          </div>
          <h1 className="text-2xl font-bold text-white">
            {workspace.name}
          </h1>
        </div>

        <CardContent className="-mt-8 relative">
          {/* 워크스페이스 카드 */}
          <div className="bg-white rounded-2xl shadow-lg p-6 mb-6 border border-slate-100">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 bg-gradient-to-br from-slate-100 to-slate-200 rounded-2xl flex items-center justify-center">
                <Building2 className="w-7 h-7 text-slate-600" />
              </div>
              <div className="flex-1">
                <h2 className="font-bold text-lg text-slate-900">{workspace.name}</h2>
                <div className="flex items-center gap-2 mt-1">
                  <Badge variant="secondary" className="gap-1 bg-slate-100 text-slate-600">
                    <Users className="w-3 h-3" />
                    {workspace.memberCount}명
                  </Badge>
                </div>
              </div>
            </div>
          </div>

          {/* 초대 코드 표시 */}
          <div className="text-center mb-6">
            <p className="text-sm text-slate-500 mb-2">초대 코드</p>
            <div className="inline-block px-6 py-2 bg-slate-100 rounded-xl">
              <span className="text-xl font-mono font-bold text-slate-700 tracking-widest">
                {inviteCode}
              </span>
            </div>
          </div>

          {/* 안내 문구 */}
          <div className="p-4 bg-amber-50 border border-amber-100 rounded-xl mb-6">
            <p className="text-sm text-amber-800">
              가입하려면 먼저 <strong>Google 계정</strong>으로 로그인해야 합니다.
            </p>
          </div>

          {/* 가입 버튼 */}
          <Button
            variant="limePrimary"
            className="w-full rounded-xl h-14 text-base font-semibold"
          >
            <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
              <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
              <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
            </svg>
            Google로 로그인하고 가입하기
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}

// ================================
// 5. 초대 수락 페이지 - 가입 완료
// ================================
const JoinPageSuccess = () => {
  const workspace = {
    name: 'CodeB Team'
  }

  return (
    <div className="min-h-[600px] flex items-center justify-center bg-gradient-to-br from-slate-50 via-lime-50/50 to-slate-50 p-4">
      <Card className="max-w-md w-full bg-white/80 backdrop-blur-xl border-lime-200 rounded-3xl shadow-2xl">
        <CardContent className="pt-8 pb-8 text-center">
          <div className="relative w-24 h-24 mx-auto mb-6">
            <div className="absolute inset-0 bg-lime-100 rounded-full animate-ping opacity-50" />
            <div className="relative w-24 h-24 bg-gradient-to-br from-lime-400 to-lime-500 rounded-full flex items-center justify-center">
              <CheckCircle2 className="w-12 h-12 text-white" />
            </div>
          </div>
          <div className="flex items-center justify-center gap-2 mb-4">
            <Sparkles className="w-5 h-5 text-lime-500" />
            <h1 className="text-2xl font-bold text-slate-900">가입 완료!</h1>
            <Sparkles className="w-5 h-5 text-lime-500" />
          </div>
          <p className="text-slate-600 mb-6">
            <strong className="text-lime-700">{workspace.name}</strong> 워크스페이스에
            <br />성공적으로 가입되었습니다.
          </p>
          <div className="p-4 bg-lime-50 rounded-2xl mb-6">
            <p className="text-sm text-lime-700">
              잠시 후 대시보드로 이동합니다...
            </p>
          </div>
          <Button
            variant="limePrimary"
            className="w-full rounded-xl h-12 text-base"
          >
            지금 바로 이동
            <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}

// ================================
// 통합 스토리
// ================================
const InviteCodeStories = () => {
  return (
    <div className="space-y-12 p-8 bg-[#F8F9FA] min-h-screen">
      <div>
        <h1 className="text-3xl font-bold text-slate-900 mb-2">워크스페이스 초대 시스템</h1>
        <p className="text-slate-500">초대 코드 생성, 공유, 가입 플로우</p>
      </div>

      {/* 1. 초대 코드 모달 */}
      <div className="space-y-4">
        <h2 className="text-xl font-bold text-slate-900">1. 초대 코드 모달 (관리자용)</h2>
        <p className="text-slate-500 text-sm">조직 관리 페이지에서 &quot;초대 코드&quot; 버튼 클릭 시 표시됩니다.</p>
        <div className="border border-slate-200 rounded-3xl overflow-hidden">
          <InviteCodeModal />
        </div>
      </div>

      {/* 2. 가입 페이지 상태들 */}
      <div className="space-y-4">
        <h2 className="text-xl font-bold text-slate-900">2. 초대 링크 접속 페이지</h2>
        <p className="text-slate-500 text-sm">https://workb.net/join/ABC123 형태의 링크로 접속 시 표시됩니다.</p>

        <div className="grid grid-cols-2 gap-6">
          <div className="space-y-2">
            <h3 className="font-semibold text-slate-700">2-1. 로딩 상태</h3>
            <div className="border border-slate-200 rounded-3xl overflow-hidden">
              <JoinPageLoading />
            </div>
          </div>

          <div className="space-y-2">
            <h3 className="font-semibold text-slate-700">2-2. 에러 상태</h3>
            <div className="border border-slate-200 rounded-3xl overflow-hidden">
              <JoinPageError />
            </div>
          </div>

          <div className="space-y-2">
            <h3 className="font-semibold text-slate-700">2-3. 가입 대기 상태</h3>
            <div className="border border-slate-200 rounded-3xl overflow-hidden">
              <JoinPageReady />
            </div>
          </div>

          <div className="space-y-2">
            <h3 className="font-semibold text-slate-700">2-4. 가입 완료 상태</h3>
            <div className="border border-slate-200 rounded-3xl overflow-hidden">
              <JoinPageSuccess />
            </div>
          </div>
        </div>
      </div>

      {/* 플로우 설명 */}
      <div className="space-y-4">
        <h2 className="text-xl font-bold text-slate-900">3. 초대 플로우</h2>
        <div className="bg-white rounded-3xl p-6 border border-slate-200">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-lime-100 rounded-full flex items-center justify-center text-lime-700 font-bold text-sm">1</div>
              <span className="text-sm text-slate-700">관리자가 초대 코드 생성</span>
            </div>
            <ArrowRight className="w-4 h-4 text-slate-400" />
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-lime-100 rounded-full flex items-center justify-center text-lime-700 font-bold text-sm">2</div>
              <span className="text-sm text-slate-700">링크/코드 공유</span>
            </div>
            <ArrowRight className="w-4 h-4 text-slate-400" />
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-lime-100 rounded-full flex items-center justify-center text-lime-700 font-bold text-sm">3</div>
              <span className="text-sm text-slate-700">사용자 링크 접속</span>
            </div>
            <ArrowRight className="w-4 h-4 text-slate-400" />
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-lime-100 rounded-full flex items-center justify-center text-lime-700 font-bold text-sm">4</div>
              <span className="text-sm text-slate-700">Google 로그인</span>
            </div>
            <ArrowRight className="w-4 h-4 text-slate-400" />
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-lime-500 rounded-full flex items-center justify-center text-white font-bold text-sm">✓</div>
              <span className="text-sm text-slate-700">자동 가입 완료</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

const meta: Meta<typeof InviteCodeStories> = {
  title: 'Workspace/InviteCode',
  component: InviteCodeStories,
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component: '워크스페이스 초대 코드 시스템 UI 컴포넌트들입니다.',
      },
    },
  },
}

export default meta
type Story = StoryObj<typeof InviteCodeStories>

export const Default: Story = {}

export const ModalOnly: Story = {
  render: () => <InviteCodeModal />,
  parameters: {
    docs: {
      description: {
        story: '관리자가 초대 코드를 확인하고 공유하는 모달입니다.',
      },
    },
  },
}

export const JoinLoading: Story = {
  render: () => <JoinPageLoading />,
  parameters: {
    docs: {
      description: {
        story: '초대 링크 접속 시 워크스페이스 정보를 로딩하는 상태입니다.',
      },
    },
  },
}

export const JoinError: Story = {
  render: () => <JoinPageError />,
  parameters: {
    docs: {
      description: {
        story: '유효하지 않은 초대 코드일 때 표시되는 에러 상태입니다.',
      },
    },
  },
}

export const JoinReady: Story = {
  render: () => <JoinPageReady />,
  parameters: {
    docs: {
      description: {
        story: '워크스페이스 정보 확인 후 가입 대기 상태입니다.',
      },
    },
  },
}

export const JoinSuccess: Story = {
  render: () => <JoinPageSuccess />,
  parameters: {
    docs: {
      description: {
        story: '워크스페이스 가입이 완료된 축하 화면입니다.',
      },
    },
  },
}
