'use client'

import React, { useState, useEffect } from 'react'
import { useAuth } from '@/lib/auth-context'
// import { getDatabase, ref, onValue, off, push, update } from 'firebase/database'
// import { app } from '@/lib/firebase'
import { motion } from 'framer-motion'
import { useRouter } from 'next/navigation'
import toast from 'react-hot-toast'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  MessageSquare, Send, Search, Filter, Star, Archive,
  Trash2, Reply, Forward, Paperclip, Calendar, User,
  Mail, Phone, Building2, Clock, CheckCheck, Loader2,
  Inbox, FileText, Hash, Briefcase, Bell
} from 'lucide-react'

// ===========================================
// Glass Morphism Messages Page
// ===========================================

interface Message {
  id: string
  subject: string
  content: string
  fromId: string
  fromName: string
  fromEmail: string
  toId: string
  toName: string
  toEmail: string
  projectId?: string
  projectName?: string
  type: 'general' | 'project' | 'announcement'
  priority: 'low' | 'normal' | 'high' | 'urgent'
  status: 'unread' | 'read' | 'replied' | 'forwarded'
  isStarred: boolean
  isArchived: boolean
  attachments?: string[]
  createdAt: string
  readAt?: string
  repliedAt?: string
}

const CHANNEL_TYPES = {
  general: { label: '일반', icon: Hash },
  project: { label: '프로젝트', icon: Briefcase },
  announcement: { label: '공지사항', icon: Bell },
}

const priorityConfig: Record<string, { label: string, variant: 'outline' | 'secondary' | 'destructive' }> = {
  low: { label: '낮음', variant: 'outline' },
  normal: { label: '보통', variant: 'secondary' },
  high: { label: '높음', variant: 'destructive' },
  urgent: { label: '긴급', variant: 'destructive' }
}

export default function MessagesPage() {
  const { user, userProfile } = useAuth()
  const router = useRouter()
  const [messages, setMessages] = useState<Message[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterType, setFilterType] = useState<string>('all')
  const [showCompose, setShowCompose] = useState(false)
  const [selectedMessage, setSelectedMessage] = useState<Message | null>(null)
  const [replyTo, setReplyTo] = useState<Message | null>(null)
  const [activeChannel, setActiveChannel] = useState<string | null>(null)
  const [messageInput, setMessageInput] = useState('')
  const [showSidebar, setShowSidebar] = useState(true)
  const [activeTab, setActiveTab] = useState('all')

  const [formData, setFormData] = useState({
    subject: '',
    content: '',
    type: 'general' as const,
    priority: 'normal' as const,
    toEmail: ''
  })



  // 고객이 아닌 경우 리다이렉트


  // 메시지 데이터 로드
  useEffect(() => {
    if (!user || !userProfile) return
    // Firebase logic removed
    setMessages([])
    setLoading(false)
  }, [user, userProfile])

  // 권한 체크
  if (userProfile?.role !== 'admin' && userProfile?.role !== 'member') {
    return (
      <div className="flex items-center justify-center h-full">
        <p className="text-muted-foreground">접근 권한이 없습니다.</p>
      </div>
    )
  }

  const filteredMessages = messages.filter(message => {
    const matchesSearch =
      message.subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
      message.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
      message.fromName.toLowerCase().includes(searchTerm.toLowerCase())

    const matchesType = filterType === 'all' || message.type === filterType
    const matchesFilter =
      filterType === 'starred' ? message.isStarred :
        filterType === 'archived' ? message.isArchived :
          filterType === 'unread' ? message.status === 'unread' :
            true

    return matchesSearch && matchesType && matchesFilter && !message.isArchived
  })

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault()
    toast.success('메시지 전송 기능은 현재 사용할 수 없습니다.')
    handleCloseCompose()
  }

  const handleView = async (message: Message) => {
    setSelectedMessage(message)
    // Firebase logic removed
  }

  const handleStar = async (messageId: string) => {
    // Firebase logic removed
  }

  const handleArchive = async (messageId: string) => {
    // Firebase logic removed
    toast.success('메시지 보관 기능은 현재 사용할 수 없습니다.')
    setSelectedMessage(null)
  }

  const handleReply = (message: Message) => {
    setReplyTo(message)
    setFormData({
      ...formData,
      toEmail: message.fromEmail,
      subject: `Re: ${message.subject}`
    })
    setShowCompose(true)
    setSelectedMessage(null)
  }

  const handleCloseCompose = () => {
    setShowCompose(false)
    setReplyTo(null)
    setFormData({
      subject: '',
      content: '',
      type: 'general',
      priority: 'normal',
      toEmail: ''
    })
  }

  const getUnreadCount = () => {
    return messages.filter(m => m.toId === user?.uid && m.status === 'unread').length
  }

  const unreadCount = getUnreadCount()

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-lime-400 mx-auto"></div>
          <p className="mt-4 text-slate-500">메시지를 불러오는 중...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="w-full max-w-[1920px] mx-auto px-6 py-6 space-y-6">
      {/* 헤더 - Glass Style */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900 flex items-center gap-3">
            <div className="p-2 bg-lime-100 rounded-xl">
              <MessageSquare className="w-6 h-6 text-lime-600" />
            </div>
            메시지
          </h1>
          <p className="text-slate-500 mt-1">
            {unreadCount > 0 ? `${unreadCount}개의 읽지 않은 메시지가 있습니다` : '모든 메시지를 확인했습니다'}
          </p>
        </div>

        <Button variant="limePrimary" onClick={() => setShowCompose(true)}>
          <Send className="mr-2 h-4 w-4" />
          메시지 작성
        </Button>
      </div>

      {/* 통계 카드 - Glass Style */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card variant="glass" className="hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-500">전체 메시지</p>
                <p className="text-2xl font-bold text-slate-900">{messages.length}</p>
              </div>
              <div className="p-3 bg-lime-100 rounded-xl">
                <Inbox className="h-6 w-6 text-lime-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card variant="glass" className="hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-500">읽지 않음</p>
                <p className="text-2xl font-bold text-slate-900">{unreadCount}</p>
              </div>
              <div className="p-3 bg-violet-100 rounded-xl">
                <Mail className="h-6 w-6 text-violet-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card variant="glass" className="hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-500">중요</p>
                <p className="text-2xl font-bold text-slate-900">
                  {messages.filter(m => m.isStarred).length}
                </p>
              </div>
              <div className="p-3 bg-amber-100 rounded-xl">
                <Star className="h-6 w-6 text-amber-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card variant="glass" className="hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-500">답장함</p>
                <p className="text-2xl font-bold text-slate-900">
                  {messages.filter(m => m.status === 'replied').length}
                </p>
              </div>
              <div className="p-3 bg-emerald-100 rounded-xl">
                <Reply className="h-6 w-6 text-emerald-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* 검색 및 필터 - Glass Style */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
          <Input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="메시지 검색..."
            className="pl-10 rounded-xl"
          />
        </div>

        <Tabs value={filterType} onValueChange={setFilterType}>
          <TabsList className="bg-white/60 backdrop-blur-sm p-1 rounded-xl border border-white/40">
            <TabsTrigger value="all" className="data-[state=active]:bg-black data-[state=active]:text-lime-400 rounded-lg">전체</TabsTrigger>
            <TabsTrigger value="unread" className="data-[state=active]:bg-black data-[state=active]:text-lime-400 rounded-lg">읽지않음</TabsTrigger>
            <TabsTrigger value="starred" className="data-[state=active]:bg-black data-[state=active]:text-lime-400 rounded-lg">중요</TabsTrigger>
            <TabsTrigger value="project" className="data-[state=active]:bg-black data-[state=active]:text-lime-400 rounded-lg">프로젝트</TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      {/* 메시지 목록 - Glass Style */}
      {filteredMessages.length === 0 ? (
        <Card variant="glass">
          <CardContent className="p-12 text-center">
            <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-slate-100 flex items-center justify-center">
              <Inbox className="h-8 w-8 text-slate-400" />
            </div>
            <h3 className="text-lg font-semibold text-slate-900 mb-2">메시지가 없습니다</h3>
            <p className="text-slate-500">
              {searchTerm || filterType !== 'all'
                ? '다른 검색 조건을 시도해보세요.'
                : '받은 메시지가 없습니다.'}
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-2">
          {filteredMessages.map((message) => {
            const TypeIcon = CHANNEL_TYPES[message.type as keyof typeof CHANNEL_TYPES]?.icon || Hash
            const isUnread = message.toId === user?.uid && message.status === 'unread'
            const isSent = message.fromId === user?.uid

            return (
              <motion.div
                key={message.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
              >
                <Card
                  variant="glass"
                  className={`hover:shadow-xl transition-all cursor-pointer ${isUnread ? 'border-lime-400/50 bg-lime-50/30' : ''}`}
                  onClick={() => handleView(message)}
                >
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex items-start gap-3 flex-1">
                        <Avatar className="bg-lime-100">
                          <AvatarFallback className="bg-lime-100 text-lime-700">
                            {isSent ? message.toName[0] : message.fromName[0]}
                          </AvatarFallback>
                        </Avatar>

                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <h3 className={`font-medium truncate text-slate-900 ${isUnread ? 'font-semibold' : ''}`}>
                              {message.subject}
                            </h3>
                            {message.priority !== 'normal' && (
                              <Badge variant={priorityConfig[message.priority].variant}>
                                {priorityConfig[message.priority].label}
                              </Badge>
                            )}
                            <Badge variant="outline" className="ml-auto border-white/40 bg-white/60">
                              {CHANNEL_TYPES[message.type as keyof typeof CHANNEL_TYPES]?.icon &&
                                React.createElement(CHANNEL_TYPES[message.type as keyof typeof CHANNEL_TYPES].icon, { className: "h-3 w-3 mr-1" })
                              }
                              {CHANNEL_TYPES[message.type as keyof typeof CHANNEL_TYPES]?.label || message.type}
                            </Badge>
                          </div>

                          <div className="flex items-center gap-2 text-sm text-slate-600 mb-1">
                            <span className="font-medium">
                              {isSent ? `받는 사람: ${message.toName}` : message.fromName}
                            </span>
                            <span>•</span>
                            <span className="text-slate-500">{message.fromEmail}</span>
                          </div>

                          <p className="text-sm text-slate-500 line-clamp-1">
                            {message.content}
                          </p>

                          {message.projectName && (
                            <div className="flex items-center gap-1 mt-2">
                              <Building2 className="h-3 w-3 text-slate-400" />
                              <span className="text-xs text-slate-500">{message.projectName}</span>
                            </div>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center gap-2 ml-4">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="hover:bg-amber-50"
                          onClick={(e) => {
                            e.stopPropagation()
                            handleStar(message.id)
                          }}
                        >
                          <Star className={`h-4 w-4 ${message.isStarred ? 'fill-amber-400 text-amber-400' : 'text-slate-400'}`} />
                        </Button>

                        <div className="text-right">
                          <p className="text-xs text-slate-500">
                            {new Date(message.createdAt).toLocaleDateString('ko-KR')}
                          </p>
                          <p className="text-xs text-slate-400">
                            {new Date(message.createdAt).toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' })}
                          </p>
                        </div>

                        {isUnread && (
                          <div className="w-2 h-2 bg-lime-400 rounded-full" />
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            )
          })}
        </div>
      )}

      {/* 메시지 작성 모달 - Glass Style */}
      <Dialog open={showCompose} onOpenChange={setShowCompose}>
        <DialogContent className="max-w-2xl bg-white/90 backdrop-blur-2xl border-white/40 rounded-3xl">
          <DialogHeader>
            <DialogTitle className="text-slate-900">
              {replyTo ? `답장: ${replyTo.subject}` : '새 메시지'}
            </DialogTitle>
          </DialogHeader>

          <form onSubmit={handleSend}>
            <div className="space-y-4">
              <div>
                <Label htmlFor="to" className="text-slate-700">받는 사람</Label>
                <Input
                  id="to"
                  type="email"
                  value={formData.toEmail}
                  onChange={(e) => setFormData({ ...formData, toEmail: e.target.value })}
                  placeholder="이메일 주소"
                  className="rounded-xl"
                  required
                />
              </div>

              {!replyTo && (
                <div>
                  <Label htmlFor="subject" className="text-slate-700">제목</Label>
                  <Input
                    id="subject"
                    value={formData.subject}
                    onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                    className="rounded-xl"
                    required
                  />
                </div>
              )}

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="type" className="text-slate-700">유형</Label>
                  <select
                    id="type"
                    value={formData.type}
                    onChange={(e) => setFormData({ ...formData, type: e.target.value as any })}
                    className="w-full px-3 py-2 bg-white/60 border border-white/40 rounded-xl focus:outline-none focus:ring-2 focus:ring-lime-400 text-slate-900"
                  >
                    <option value="general">일반</option>
                    <option value="project">프로젝트</option>
                    <option value="support">지원</option>
                  </select>
                </div>

                <div>
                  <Label htmlFor="priority" className="text-slate-700">우선순위</Label>
                  <select
                    id="priority"
                    value={formData.priority}
                    onChange={(e) => setFormData({ ...formData, priority: e.target.value as any })}
                    className="w-full px-3 py-2 bg-white/60 border border-white/40 rounded-xl focus:outline-none focus:ring-2 focus:ring-lime-400 text-slate-900"
                  >
                    <option value="low">낮음</option>
                    <option value="normal">보통</option>
                    <option value="high">높음</option>
                  </select>
                </div>
              </div>

              <div>
                <Label htmlFor="content" className="text-slate-700">내용</Label>
                <Textarea
                  id="content"
                  value={formData.content}
                  onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                  rows={8}
                  className="rounded-xl"
                  required
                />
              </div>
            </div>

            <DialogFooter className="mt-6">
              <Button type="button" variant="glass" onClick={handleCloseCompose}>
                취소
              </Button>
              <Button type="submit" variant="limePrimary">
                <Send className="h-4 w-4 mr-2" />
                전송
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* 메시지 상세 모달 - Glass Morphism */}
      {selectedMessage && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={() => setSelectedMessage(null)}>
          <Card variant="glass" className="w-full max-w-3xl max-h-[90vh] overflow-y-auto bg-white/90 backdrop-blur-2xl border-white/40 rounded-3xl shadow-2xl" onClick={(e) => e.stopPropagation()}>
            <CardHeader className="border-b border-white/40">
              <div className="flex items-start justify-between">
                <div>
                  <CardTitle className="text-xl text-slate-900">{selectedMessage.subject}</CardTitle>
                  <div className="flex items-center gap-3 mt-2">
                    <span className={`px-2.5 py-1 text-xs font-medium rounded-lg ${
                      selectedMessage.priority === 'urgent' ? 'bg-rose-100 text-rose-700' :
                      selectedMessage.priority === 'high' ? 'bg-amber-100 text-amber-700' :
                      selectedMessage.priority === 'normal' ? 'bg-lime-100 text-lime-700' :
                      'bg-slate-100 text-slate-600'
                    }`}>
                      {priorityConfig[selectedMessage.priority].label}
                    </span>
                    <span className="px-2.5 py-1 text-xs bg-white/60 border border-white/40 text-slate-600 rounded-lg">
                      {CHANNEL_TYPES[selectedMessage.type as keyof typeof CHANNEL_TYPES]?.label || selectedMessage.type}
                    </span>
                    {selectedMessage.projectName && (
                      <span className="px-2.5 py-1 text-xs bg-violet-100 text-violet-700 rounded-lg">
                        {selectedMessage.projectName}
                      </span>
                    )}
                  </div>
                </div>
                <Button variant="glass" size="sm" onClick={() => setSelectedMessage(null)} className="rounded-xl">
                  ✕
                </Button>
              </div>
            </CardHeader>
            <CardContent className="pt-6">
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <Avatar className="bg-lime-100 border-2 border-white/60">
                    <AvatarFallback className="bg-lime-100 text-lime-700 font-medium">{selectedMessage.fromName[0]}</AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <h4 className="font-medium text-slate-900">{selectedMessage.fromName}</h4>
                      <span className="text-sm text-slate-500">&lt;{selectedMessage.fromEmail}&gt;</span>
                    </div>
                    <p className="text-sm text-slate-500">
                      받는 사람: {selectedMessage.toName} &lt;{selectedMessage.toEmail}&gt;
                    </p>
                    <p className="text-sm text-slate-400">
                      {new Date(selectedMessage.createdAt).toLocaleString('ko-KR')}
                    </p>
                  </div>
                </div>

                <div className="border-t border-white/40 pt-4">
                  <div className="whitespace-pre-wrap text-slate-700 leading-relaxed">{selectedMessage.content}</div>
                </div>

                <div className="flex justify-end gap-2 pt-4 border-t border-white/40">
                  <Button
                    variant="glass"
                    onClick={() => handleReply(selectedMessage)}
                    className="rounded-xl"
                  >
                    <Reply className="h-4 w-4 mr-2" />
                    답장
                  </Button>
                  <Button
                    variant="limePrimary"
                    onClick={() => handleArchive(selectedMessage.id)}
                    className="rounded-xl"
                  >
                    <Archive className="h-4 w-4 mr-2" />
                    보관
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}