'use client'

import React, { useState, useEffect } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import {
  Copy,
  Check,
  RefreshCw,
  Link2,
  QrCode,
  Share2,
  Users,
  Loader2
} from 'lucide-react'
import { cn } from '@/lib/utils'
import toast from 'react-hot-toast'

interface InviteCodeModalProps {
  isOpen: boolean
  onClose: () => void
  workspaceId: string
  workspaceName: string
}

export default function InviteCodeModal({
  isOpen,
  onClose,
  workspaceId,
  workspaceName
}: InviteCodeModalProps) {
  const [inviteCode, setInviteCode] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [regenerating, setRegenerating] = useState(false)
  const [copied, setCopied] = useState(false)
  const [copiedLink, setCopiedLink] = useState(false)

  // 초대 코드 로드
  useEffect(() => {
    if (isOpen && workspaceId) {
      loadInviteCode()
    }
  }, [isOpen, workspaceId])

  const loadInviteCode = async () => {
    setLoading(true)
    try {
      const response = await fetch(`/api/workspace/${workspaceId}/invite-code`)
      if (response.ok) {
        const data = await response.json()
        setInviteCode(data.inviteCode)
      } else {
        toast.error('초대 코드를 불러오지 못했습니다')
      }
    } catch {
      toast.error('초대 코드를 불러오지 못했습니다')
    } finally {
      setLoading(false)
    }
  }

  const regenerateCode = async () => {
    setRegenerating(true)
    try {
      const response = await fetch(`/api/workspace/${workspaceId}/invite-code`, {
        method: 'POST'
      })
      if (response.ok) {
        const data = await response.json()
        setInviteCode(data.inviteCode)
        toast.success('새 초대 코드가 생성되었습니다')
      } else {
        toast.error('초대 코드 재생성에 실패했습니다')
      }
    } catch {
      toast.error('초대 코드 재생성에 실패했습니다')
    } finally {
      setRegenerating(false)
    }
  }

  const copyCode = async () => {
    if (!inviteCode) return
    try {
      await navigator.clipboard.writeText(inviteCode)
      setCopied(true)
      toast.success('초대 코드가 복사되었습니다')
      setTimeout(() => setCopied(false), 2000)
    } catch {
      toast.error('복사에 실패했습니다')
    }
  }

  const copyLink = async () => {
    if (!inviteCode) return
    const link = `${window.location.origin}/join/${inviteCode}`
    try {
      await navigator.clipboard.writeText(link)
      setCopiedLink(true)
      toast.success('초대 링크가 복사되었습니다')
      setTimeout(() => setCopiedLink(false), 2000)
    } catch {
      toast.error('복사에 실패했습니다')
    }
  }

  const shareLink = async () => {
    if (!inviteCode) return
    const link = `${window.location.origin}/join/${inviteCode}`

    if (navigator.share) {
      try {
        await navigator.share({
          title: `${workspaceName} 워크스페이스 초대`,
          text: `${workspaceName} 워크스페이스에 참여하세요!`,
          url: link
        })
      } catch {
        // 사용자가 공유를 취소한 경우
      }
    } else {
      copyLink()
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
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
              <div className="relative flex-1">
                <Input
                  value={loading ? '로딩 중...' : inviteCode || ''}
                  readOnly
                  className={cn(
                    "text-center text-2xl font-mono font-bold tracking-[0.3em] h-14",
                    "bg-gradient-to-r from-slate-50 to-slate-100",
                    "border-slate-200 rounded-xl",
                    "uppercase select-all"
                  )}
                />
                {loading && (
                  <div className="absolute inset-0 flex items-center justify-center bg-white/80 rounded-xl">
                    <Loader2 className="w-5 h-5 animate-spin text-lime-500" />
                  </div>
                )}
              </div>
              <Button
                variant="outline"
                size="icon"
                className="h-14 w-14 rounded-xl border-slate-200 hover:bg-lime-50 hover:border-lime-300 transition-colors"
                onClick={copyCode}
                disabled={loading || !inviteCode}
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
                value={inviteCode ? `${typeof window !== 'undefined' ? window.location.origin : ''}/join/${inviteCode}` : ''}
                readOnly
                className="flex-1 text-sm bg-slate-50 border-slate-200 rounded-xl text-slate-600 truncate"
              />
              <Button
                variant="outline"
                size="icon"
                className="rounded-xl border-slate-200 hover:bg-lime-50 hover:border-lime-300 transition-colors"
                onClick={copyLink}
                disabled={loading || !inviteCode}
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
                onClick={shareLink}
                disabled={loading || !inviteCode}
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
              onClick={regenerateCode}
              disabled={regenerating}
            >
              {regenerating ? (
                <Loader2 className="w-4 h-4 animate-spin mr-2" />
              ) : (
                <RefreshCw className="w-4 h-4 mr-2" />
              )}
              코드 재생성
            </Button>
            <Button
              variant="limePrimary"
              className="flex-1 rounded-xl h-11"
              onClick={copyLink}
              disabled={loading || !inviteCode}
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
  )
}
