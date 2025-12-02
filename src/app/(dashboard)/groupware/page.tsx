'use client'

// ===========================================
// Glass Morphism Groupware Page
// ===========================================

import React, { useState, useEffect } from 'react'
import { useAuth } from '@/lib/auth-context'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Plus, Search, Pin, Calendar as CalendarIcon, MessageSquare, Megaphone, LayoutGrid, Loader2 } from 'lucide-react'
import { format } from 'date-fns'
import { ko } from 'date-fns/locale'
import { cn } from '@/lib/utils'

export default function GroupwarePage() {
  const [announcements, setAnnouncements] = useState<any[]>([])
  const [posts, setPosts] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('announcements')
  const [searchTerm, setSearchTerm] = useState('')

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    try {
      const [announcementsRes, postsRes] = await Promise.all([
        fetch('/api/announcements'),
        fetch('/api/board'),
      ])
      setAnnouncements(await announcementsRes.json())
      setPosts(await postsRes.json())
    } catch (error) {
      console.error('Failed to load data:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin text-lime-400 mx-auto" />
          <p className="mt-4 text-slate-500">데이터를 불러오는 중...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="w-full max-w-[1920px] mx-auto px-6 py-6 space-y-6">
      {/* 헤더 - Glass Morphism */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900 flex items-center gap-3">
            <div className="p-2 bg-lime-100 rounded-xl">
              <LayoutGrid className="w-6 h-6 text-lime-600" />
            </div>
            그룹웨어
          </h1>
          <p className="text-slate-500 mt-2">공지사항, 게시판, 캘린더를 한 곳에서 관리합니다</p>
        </div>
      </div>

      {/* 탭 네비게이션 - Glass Morphism */}
      <div className="bg-white/60 backdrop-blur-sm rounded-2xl shadow-lg shadow-black/5 p-1.5 border border-white/40">
        <div className="grid grid-cols-3 gap-1">
          {[
            { id: 'announcements', label: '공지사항', icon: Megaphone, count: announcements.length, hasNew: announcements.some((a: any) => a.isNew) },
            { id: 'board', label: '게시판', icon: MessageSquare, count: posts.length, hasNew: posts.some((p: any) => p.isNew) },
            { id: 'calendar', label: '캘린더', icon: CalendarIcon }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center justify-center gap-2 px-4 py-3 rounded-xl text-sm font-medium transition-all ${
                activeTab === tab.id
                  ? 'bg-black text-lime-400 shadow-lg'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-white/60'
              }`}
            >
              <tab.icon className="w-4 h-4" />
              {tab.label}
              {tab.count !== undefined && (
                <Badge className={cn(
                  "border-0 ml-1",
                  activeTab === tab.id ? 'bg-lime-400 text-black' : 'bg-lime-100 text-lime-700'
                )}>
                  {tab.count}
                </Badge>
              )}
              {tab.hasNew && (
                <Badge className="bg-rose-500 text-white border-0 text-xs px-1.5">N</Badge>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* 공지사항 탭 */}
      {activeTab === 'announcements' && (
        <div className="space-y-4">
          <div className="flex justify-end">
            <Button variant="limePrimary" className="rounded-xl">
              <Plus className="w-4 h-4 mr-2" />
              공지 작성
            </Button>
          </div>

          <Card variant="glass">
            <CardContent className="p-0">
              <div className="overflow-hidden rounded-2xl">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-white/40">
                      <th className="px-4 py-3 text-center text-sm font-semibold text-slate-700 w-20">번호</th>
                      <th className="px-4 py-3 text-left text-sm font-semibold text-slate-700">제목</th>
                      <th className="px-4 py-3 text-center text-sm font-semibold text-slate-700 w-32">작성자</th>
                      <th className="px-4 py-3 text-center text-sm font-semibold text-slate-700 w-32">작성일</th>
                    </tr>
                  </thead>
                  <tbody>
                    {announcements.length > 0 ? (
                      announcements.map((announcement: any, index: number) => (
                        <tr
                          key={announcement.id}
                          className={cn(
                            "border-b border-white/40 hover:bg-white/40 cursor-pointer transition-colors",
                            announcement.isPinned && 'bg-lime-50/50'
                          )}
                        >
                          <td className="px-4 py-4 text-center text-sm">
                            {announcement.isPinned ? (
                              <div className="mx-auto w-8 h-8 bg-lime-100 rounded-lg flex items-center justify-center">
                                <Pin className="w-4 h-4 text-lime-600" />
                              </div>
                            ) : (
                              <span className="text-slate-600">{announcements.length - index}</span>
                            )}
                          </td>
                          <td className="px-4 py-4">
                            <div className="flex items-center gap-2">
                              {announcement.isPinned && (
                                <Badge className="bg-lime-100 text-lime-700 border-0">공지</Badge>
                              )}
                              <span className="text-sm font-medium text-slate-900 hover:text-lime-600 transition-colors">
                                {announcement.title}
                              </span>
                            </div>
                          </td>
                          <td className="px-4 py-4 text-center text-sm text-slate-600">관리자</td>
                          <td className="px-4 py-4 text-center text-sm text-slate-500">
                            {format(new Date(announcement.createdAt), 'yyyy.MM.dd', { locale: ko })}
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={4} className="px-4 py-12 text-center">
                          <div className="flex flex-col items-center">
                            <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-lime-100 flex items-center justify-center">
                              <Megaphone className="h-8 w-8 text-lime-600" />
                            </div>
                            <p className="text-slate-500">등록된 공지사항이 없습니다</p>
                          </div>
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* 게시판 탭 */}
      {activeTab === 'board' && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
              <Input
                type="text"
                placeholder="제목, 내용, 작성자 검색"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Button variant="glass" className="rounded-xl">검색</Button>
            <Button variant="limePrimary" className="rounded-xl">
              <Plus className="w-4 h-4 mr-2" />
              글쓰기
            </Button>
          </div>

          <Card variant="glass">
            <CardContent className="p-0">
              <div className="overflow-hidden rounded-2xl">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-white/40">
                      <th className="px-4 py-3 text-center text-sm font-semibold text-slate-700 w-20">번호</th>
                      <th className="px-4 py-3 text-left text-sm font-semibold text-slate-700">제목</th>
                      <th className="px-4 py-3 text-center text-sm font-semibold text-slate-700 w-32">작성자</th>
                      <th className="px-4 py-3 text-center text-sm font-semibold text-slate-700 w-32">작성일</th>
                      <th className="px-4 py-3 text-center text-sm font-semibold text-slate-700 w-20">조회</th>
                    </tr>
                  </thead>
                  <tbody>
                    {posts.length > 0 ? (
                      posts.map((post: any, index: number) => (
                        <tr key={post.id} className="border-b border-white/40 hover:bg-white/40 cursor-pointer transition-colors">
                          <td className="px-4 py-4 text-center text-sm text-slate-600">{posts.length - index}</td>
                          <td className="px-4 py-4">
                            <div className="flex items-center gap-2">
                              <span className="text-sm font-medium text-slate-900 hover:text-lime-600 transition-colors">
                                {post.title}
                              </span>
                              {post.commentCount > 0 && (
                                <span className="text-xs text-lime-600 font-medium">[{post.commentCount}]</span>
                              )}
                              {post.isNew && (
                                <Badge className="bg-rose-500 text-white border-0 text-xs px-1.5">N</Badge>
                              )}
                            </div>
                          </td>
                          <td className="px-4 py-4 text-center text-sm text-slate-600">
                            {post.author?.name || '알 수 없음'}
                          </td>
                          <td className="px-4 py-4 text-center text-sm text-slate-500">
                            {format(new Date(post.createdAt), 'MM.dd', { locale: ko })}
                          </td>
                          <td className="px-4 py-4 text-center text-sm text-slate-500">{post.views || 0}</td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={5} className="px-4 py-12 text-center">
                          <div className="flex flex-col items-center">
                            <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-lime-100 flex items-center justify-center">
                              <MessageSquare className="h-8 w-8 text-lime-600" />
                            </div>
                            <p className="text-slate-500">등록된 게시글이 없습니다</p>
                          </div>
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* 캘린더 탭 */}
      {activeTab === 'calendar' && (
        <Card variant="glass" className="py-12">
          <CardContent>
            <div className="flex flex-col items-center justify-center">
              <div className="w-20 h-20 mx-auto mb-4 rounded-2xl bg-lime-100 flex items-center justify-center">
                <CalendarIcon className="w-10 h-10 text-lime-600" />
              </div>
              <h3 className="text-lg font-semibold text-slate-900 mb-2">캘린더 기능</h3>
              <p className="text-slate-500 mb-4">캘린더 기능은 준비 중입니다</p>
              <Button variant="limePrimary" className="rounded-xl" asChild>
                <a href="/calendar">캘린더 페이지로 이동</a>
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
