'use client'

// ===========================================
// Glass Morphism Workspace Join Page
// ===========================================

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Search, Key, Users, Globe, Clock, Building2, Loader2 } from 'lucide-react'
import { cn } from '@/lib/utils'

interface Workspace {
  id: string
  name: string
  slug: string
  domain?: string
  isPublic: boolean
  requireApproval: boolean
  _count: {
    members: number
  }
}

export default function JoinWorkspacePage() {
  const router = useRouter()
  const { data: session } = useSession()
  const [searchQuery, setSearchQuery] = useState('')
  const [inviteCode, setInviteCode] = useState('')
  const [workspaces, setWorkspaces] = useState<Workspace[]>([])
  const [selectedWorkspace, setSelectedWorkspace] = useState<Workspace | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState<'search' | 'code'>('search')

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!searchQuery.trim()) return

    setLoading(true)
    setError(null)
    setWorkspaces([])

    try {
      const response = await fetch(`/api/workspaces/search?q=${encodeURIComponent(searchQuery)}`)
      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || '검색에 실패했습니다.')
      }

      setWorkspaces(data.workspaces)
      if (data.workspaces.length === 0) {
        setError('검색 결과가 없습니다.')
      }
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const handleCodeSearch = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!inviteCode.trim()) return

    setLoading(true)
    setError(null)
    setSelectedWorkspace(null)

    try {
      const response = await fetch('/api/workspaces/search', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ code: inviteCode }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || '워크스페이스를 찾을 수 없습니다.')
      }

      setSelectedWorkspace(data.workspace)
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const handleJoinRequest = (workspace: Workspace) => {
    if (!session?.user) {
      router.push('/login?redirect=/workspaces/join')
      return
    }
    router.push(`/workspaces/${workspace.id}/join-request`)
  }

  return (
    <div className="w-full max-w-[1920px] mx-auto px-6 py-6 space-y-6">
      {/* 헤더 - Glass Morphism */}
      <div className="text-center">
        <h1 className="text-3xl font-bold tracking-tight text-slate-900 flex items-center justify-center gap-3">
          <div className="p-2 bg-lime-100 rounded-xl">
            <Building2 className="w-6 h-6 text-lime-600" />
          </div>
          워크스페이스 찾기
        </h1>
        <p className="text-slate-500 mt-2">
          가입하고 싶은 워크스페이스를 검색하거나 초대 코드를 입력하세요
        </p>
      </div>

      {/* 탭 네비게이션 - Glass Morphism */}
      <div className="max-w-2xl mx-auto">
        <div className="bg-white/60 backdrop-blur-sm rounded-2xl shadow-lg shadow-black/5 p-1.5 border border-white/40">
          <div className="grid grid-cols-2 gap-1">
            {[
              { id: 'search', label: '검색하기', icon: Search },
              { id: 'code', label: '초대 코드 입력', icon: Key }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as 'search' | 'code')}
                className={`flex items-center justify-center gap-2 px-4 py-3 rounded-xl text-sm font-medium transition-all ${
                  activeTab === tab.id
                    ? 'bg-black text-lime-400 shadow-lg'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-white/60'
                }`}
              >
                <tab.icon className="w-4 h-4" />
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* 콘텐츠 카드 */}
      <div className="max-w-2xl mx-auto">
        <Card variant="glass">
          <CardContent className="p-6">
            {/* 검색 탭 */}
            {activeTab === 'search' && (
              <div className="space-y-6">
                <form onSubmit={handleSearch} className="space-y-4">
                  <div>
                    <label htmlFor="search" className="block text-sm font-medium text-slate-700 mb-2">
                      워크스페이스 이름 또는 슬러그
                    </label>
                    <div className="flex gap-2">
                      <div className="flex-1 relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
                        <Input
                          type="text"
                          id="search"
                          value={searchQuery}
                          onChange={(e) => setSearchQuery(e.target.value)}
                          className="pl-10"
                          placeholder="예: codeb-team"
                        />
                      </div>
                      <Button type="submit" variant="limePrimary" disabled={loading} className="rounded-xl">
                        {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : '검색'}
                      </Button>
                    </div>
                  </div>
                </form>

                {/* 에러 메시지 */}
                {error && (
                  <div className="p-4 bg-rose-50 border border-rose-200 rounded-xl">
                    <p className="text-sm text-rose-700">{error}</p>
                  </div>
                )}

                {/* 검색 결과 */}
                {workspaces.length > 0 && (
                  <div className="space-y-3">
                    <h3 className="text-sm font-semibold text-slate-900">검색 결과</h3>
                    {workspaces.map((workspace) => (
                      <div
                        key={workspace.id}
                        className="p-4 bg-white/60 border border-white/40 rounded-2xl hover:bg-white/80 hover:shadow-lg transition-all"
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <h4 className="text-lg font-semibold text-slate-900">{workspace.name}</h4>
                            <p className="text-sm text-slate-500 mt-1">@{workspace.slug}</p>
                            <div className="flex items-center gap-3 mt-3">
                              <span className="inline-flex items-center text-sm text-slate-600">
                                <Users className="w-4 h-4 mr-1" />
                                {workspace._count.members} 멤버
                              </span>
                              {workspace.isPublic && (
                                <Badge className="bg-emerald-100 text-emerald-700 border-0">
                                  <Globe className="w-3 h-3 mr-1" />
                                  공개
                                </Badge>
                              )}
                              {workspace.requireApproval && (
                                <Badge className="bg-amber-100 text-amber-700 border-0">
                                  <Clock className="w-3 h-3 mr-1" />
                                  승인 필요
                                </Badge>
                              )}
                            </div>
                          </div>
                          <Button
                            onClick={() => handleJoinRequest(workspace)}
                            variant="limePrimary"
                            className="rounded-xl"
                          >
                            가입 요청
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* 초대 코드 탭 */}
            {activeTab === 'code' && (
              <div className="space-y-6">
                <form onSubmit={handleCodeSearch} className="space-y-4">
                  <div>
                    <label htmlFor="code" className="block text-sm font-medium text-slate-700 mb-2">
                      초대 코드
                    </label>
                    <div className="flex gap-2">
                      <div className="flex-1 relative">
                        <Key className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
                        <Input
                          type="text"
                          id="code"
                          value={inviteCode}
                          onChange={(e) => setInviteCode(e.target.value.toUpperCase())}
                          className="pl-10 uppercase"
                          placeholder="ABC123"
                          maxLength={6}
                        />
                      </div>
                      <Button type="submit" variant="limePrimary" disabled={loading} className="rounded-xl">
                        {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : '확인'}
                      </Button>
                    </div>
                    <p className="mt-2 text-xs text-slate-500">
                      6자리 초대 코드를 입력하세요 (예: ABC123)
                    </p>
                  </div>
                </form>

                {/* 에러 메시지 */}
                {error && (
                  <div className="p-4 bg-rose-50 border border-rose-200 rounded-xl">
                    <p className="text-sm text-rose-700">{error}</p>
                  </div>
                )}

                {/* 찾은 워크스페이스 */}
                {selectedWorkspace && (
                  <div className="space-y-3">
                    <h3 className="text-sm font-semibold text-slate-900">워크스페이스 찾음</h3>
                    <div className="p-4 bg-lime-50/50 border border-lime-200 rounded-2xl">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h4 className="text-lg font-semibold text-slate-900">{selectedWorkspace.name}</h4>
                          <p className="text-sm text-slate-500 mt-1">@{selectedWorkspace.slug}</p>
                          <div className="flex items-center gap-3 mt-3">
                            <span className="inline-flex items-center text-sm text-slate-600">
                              <Users className="w-4 h-4 mr-1" />
                              {selectedWorkspace._count.members} 멤버
                            </span>
                          </div>
                        </div>
                        <Button
                          onClick={() => handleJoinRequest(selectedWorkspace)}
                          variant="limePrimary"
                          className="rounded-xl"
                        >
                          가입 요청
                        </Button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        {/* 안내 카드 */}
        <Card variant="glass" className="mt-6">
          <CardContent className="p-6">
            <div className="flex gap-4">
              <div className="p-2 bg-lime-100 rounded-xl h-fit">
                <Building2 className="h-5 w-5 text-lime-600" />
              </div>
              <div>
                <h3 className="text-sm font-semibold text-slate-900">알림</h3>
                <ul className="mt-2 text-sm text-slate-600 space-y-1">
                  <li>• 공개 워크스페이스는 누구나 가입 요청을 보낼 수 있습니다.</li>
                  <li>• 승인이 필요한 워크스페이스는 관리자의 승인 후 가입됩니다.</li>
                  <li>• 초대 코드는 워크스페이스 관리자에게 문의하세요.</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
