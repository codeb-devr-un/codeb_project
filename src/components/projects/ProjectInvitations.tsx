'use client'

import React, { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog'
import { Alert, AlertDescription } from '@/components/ui/alert'
import {
    UserPlus,
    Mail,
    Clock,
    CheckCircle2,
    XCircle,
    Loader2,
    Copy,
    Trash2,
    RefreshCw,
    Send,
} from 'lucide-react'
import { cn } from '@/lib/utils'

interface ProjectInvitation {
    id: string
    email: string
    role: string
    status: 'PENDING' | 'ACCEPTED' | 'EXPIRED' | 'REVOKED'
    expiresAt: string
    createdAt: string
    inviter: {
        name: string
        email: string
    }
}

const roleOptions = [
    { value: 'Viewer', label: '뷰어', description: '프로젝트 조회만 가능' },
    { value: 'Developer', label: '개발자', description: '코드 작업 및 태스크 관리' },
    { value: 'Designer', label: '디자이너', description: '디자인 작업 및 파일 관리' },
    { value: 'PM', label: 'PM', description: '프로젝트 매니저 권한' },
    { value: 'Admin', label: '관리자', description: '모든 권한 및 멤버 관리' },
]

const statusConfig = {
    PENDING: { label: '대기 중', color: 'bg-amber-100 text-amber-700', icon: Clock },
    ACCEPTED: { label: '수락됨', color: 'bg-green-100 text-green-700', icon: CheckCircle2 },
    EXPIRED: { label: '만료됨', color: 'bg-slate-100 text-slate-500', icon: Clock },
    REVOKED: { label: '취소됨', color: 'bg-red-100 text-red-700', icon: XCircle },
}

export default function ProjectInvitations({ projectId }: { projectId: string }) {
    const [invitations, setInvitations] = useState<ProjectInvitation[]>([])
    const [loading, setLoading] = useState(true)
    const [sending, setSending] = useState(false)
    const [dialogOpen, setDialogOpen] = useState(false)
    const [email, setEmail] = useState('')
    const [role, setRole] = useState('Viewer')
    const [error, setError] = useState<string | null>(null)
    const [success, setSuccess] = useState<string | null>(null)

    const fetchInvitations = async () => {
        try {
            const response = await fetch(`/api/projects/${projectId}/invitations`)
            if (response.ok) {
                const data = await response.json()
                setInvitations(data)
            }
        } catch (err) {
            console.error('Failed to fetch invitations:', err)
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        fetchInvitations()
    }, [projectId])

    const handleSendInvite = async () => {
        if (!email) {
            setError('이메일을 입력해주세요.')
            return
        }

        setSending(true)
        setError(null)

        try {
            const response = await fetch(`/api/projects/${projectId}/invitations`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, role }),
            })

            const data = await response.json()

            if (!response.ok) {
                setError(data.error || '초대 전송에 실패했습니다.')
                return
            }

            setSuccess('초대 이메일이 전송되었습니다.')
            setEmail('')
            setRole('Viewer')
            setDialogOpen(false)
            fetchInvitations()

            setTimeout(() => setSuccess(null), 3000)
        } catch (err) {
            setError('초대 전송 중 오류가 발생했습니다.')
        } finally {
            setSending(false)
        }
    }

    const handleRevoke = async (invitationId: string) => {
        try {
            const response = await fetch(
                `/api/projects/${projectId}/invitations?invitationId=${invitationId}`,
                { method: 'DELETE' }
            )

            if (response.ok) {
                fetchInvitations()
            }
        } catch (err) {
            console.error('Failed to revoke invitation:', err)
        }
    }

    const copyInviteLink = (token: string) => {
        const url = `${window.location.origin}/invite/project/${token}`
        navigator.clipboard.writeText(url)
        setSuccess('초대 링크가 복사되었습니다.')
        setTimeout(() => setSuccess(null), 2000)
    }

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('ko-KR', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
        })
    }

    if (loading) {
        return (
            <div className="flex items-center justify-center py-12">
                <Loader2 className="h-6 w-6 animate-spin text-lime-500" />
            </div>
        )
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h3 className="text-lg font-bold text-slate-900">프로젝트 초대</h3>
                    <p className="text-sm text-slate-500">팀원을 초대하여 함께 작업하세요</p>
                </div>
                <div className="flex items-center gap-2">
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={fetchInvitations}
                        className="rounded-xl hover:bg-slate-100"
                    >
                        <RefreshCw className="h-4 w-4" />
                    </Button>
                    <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                        <DialogTrigger asChild>
                            <Button className="rounded-xl bg-lime-500 hover:bg-lime-600 text-black font-bold gap-2">
                                <UserPlus className="h-4 w-4" />
                                멤버 초대
                            </Button>
                        </DialogTrigger>
                        <DialogContent className="rounded-3xl bg-white/95 backdrop-blur-xl border-white/60 shadow-2xl">
                            <DialogHeader>
                                <DialogTitle className="text-xl font-bold text-slate-900">팀원 초대</DialogTitle>
                                <DialogDescription className="text-slate-500">
                                    이메일로 프로젝트에 팀원을 초대합니다.
                                </DialogDescription>
                            </DialogHeader>
                            <div className="space-y-4 pt-4">
                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                                        이메일 주소
                                    </label>
                                    <Input
                                        type="email"
                                        placeholder="team@example.com"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        className="rounded-xl border-slate-200 focus:border-lime-500 focus:ring-lime-500"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                                        역할
                                    </label>
                                    <div className="flex flex-wrap gap-2">
                                        {roleOptions.map((option) => (
                                            <button
                                                key={option.value}
                                                type="button"
                                                onClick={() => setRole(option.value)}
                                                className={`flex flex-col items-start px-3 py-2 rounded-xl text-sm transition-all ${
                                                    role === option.value
                                                        ? 'bg-lime-100 text-lime-700 ring-2 ring-lime-400'
                                                        : 'bg-white/60 border border-slate-200 text-slate-600 hover:bg-slate-50'
                                                }`}
                                            >
                                                <span className="font-medium">{option.label}</span>
                                                <span className="text-xs opacity-70">{option.description}</span>
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                {error && (
                                    <Alert className="rounded-xl border-red-200 bg-red-50">
                                        <XCircle className="h-4 w-4 text-red-600" />
                                        <AlertDescription className="text-red-800">{error}</AlertDescription>
                                    </Alert>
                                )}

                                <Button
                                    onClick={handleSendInvite}
                                    disabled={sending}
                                    className="w-full rounded-xl bg-lime-500 hover:bg-lime-600 text-black font-bold h-12"
                                >
                                    {sending ? (
                                        <>
                                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                            전송 중...
                                        </>
                                    ) : (
                                        <>
                                            <Send className="mr-2 h-4 w-4" />
                                            초대 전송
                                        </>
                                    )}
                                </Button>
                            </div>
                        </DialogContent>
                    </Dialog>
                </div>
            </div>

            {/* Success Alert */}
            {success && (
                <Alert className="rounded-xl border-green-200 bg-green-50 animate-in fade-in slide-in-from-top-2">
                    <CheckCircle2 className="h-4 w-4 text-green-600" />
                    <AlertDescription className="text-green-800">{success}</AlertDescription>
                </Alert>
            )}

            {/* Invitations List */}
            {invitations.length === 0 ? (
                <div className="rounded-3xl bg-white/60 backdrop-blur-xl border border-white/60 p-8 text-center">
                    <div className="mx-auto w-16 h-16 rounded-2xl bg-slate-100 flex items-center justify-center mb-4">
                        <Mail className="h-8 w-8 text-slate-400" />
                    </div>
                    <h4 className="font-semibold text-slate-900 mb-2">초대 내역이 없습니다</h4>
                    <p className="text-sm text-slate-500 mb-4">
                        팀원을 초대하여 프로젝트를 함께 관리하세요.
                    </p>
                    <Button
                        onClick={() => setDialogOpen(true)}
                        className="rounded-xl bg-lime-500 hover:bg-lime-600 text-black font-bold"
                    >
                        <UserPlus className="mr-2 h-4 w-4" />
                        첫 팀원 초대하기
                    </Button>
                </div>
            ) : (
                <div className="space-y-3">
                    {invitations.map((invitation) => {
                        const status = statusConfig[invitation.status]
                        const StatusIcon = status.icon
                        const isPending = invitation.status === 'PENDING'

                        return (
                            <div
                                key={invitation.id}
                                className="group rounded-2xl bg-white/60 backdrop-blur-xl border border-white/60 p-4 hover:bg-white/80 transition-all duration-200"
                            >
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-4">
                                        <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center">
                                            <Mail className="h-5 w-5 text-slate-500" />
                                        </div>
                                        <div>
                                            <div className="flex items-center gap-2">
                                                <span className="font-semibold text-slate-900">
                                                    {invitation.email}
                                                </span>
                                                <Badge
                                                    variant="secondary"
                                                    className={cn('rounded-lg text-xs font-bold', status.color)}
                                                >
                                                    <StatusIcon className="mr-1 h-3 w-3" />
                                                    {status.label}
                                                </Badge>
                                            </div>
                                            <div className="flex items-center gap-3 mt-1 text-xs text-slate-500">
                                                <span className="font-medium text-slate-700">{invitation.role}</span>
                                                <span>•</span>
                                                <span>초대자: {invitation.inviter.name}</span>
                                                <span>•</span>
                                                <span>
                                                    {isPending
                                                        ? `만료: ${formatDate(invitation.expiresAt)}`
                                                        : formatDate(invitation.createdAt)}
                                                </span>
                                            </div>
                                        </div>
                                    </div>

                                    {isPending && (
                                        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                onClick={() => copyInviteLink(invitation.id)}
                                                className="h-8 w-8 rounded-lg hover:bg-slate-100"
                                                title="링크 복사"
                                            >
                                                <Copy className="h-4 w-4" />
                                            </Button>
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                onClick={() => handleRevoke(invitation.id)}
                                                className="h-8 w-8 rounded-lg hover:bg-red-100 hover:text-red-600"
                                                title="초대 취소"
                                            >
                                                <Trash2 className="h-4 w-4" />
                                            </Button>
                                        </div>
                                    )}
                                </div>
                            </div>
                        )
                    })}
                </div>
            )}
        </div>
    )
}
