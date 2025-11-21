'use client'

import React, { useState, useEffect } from 'react'
import { useAuth } from '@/lib/auth-context'
import { motion } from 'framer-motion'
import { getDatabase, ref, onValue, off, push, update, remove } from 'firebase/database'
import { app } from '@/lib/firebase'
import toast from 'react-hot-toast'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { 
  Ticket, Plus, Search, Filter, Clock, AlertCircle, 
  CheckCircle, XCircle, MessageSquare, User, Calendar,
  Loader2, MoreVertical, Edit, Trash2, Tag
} from 'lucide-react'

interface TicketData {
  id: string
  title: string
  description: string
  status: 'open' | 'in_progress' | 'resolved' | 'closed'
  priority: 'low' | 'medium' | 'high' | 'urgent'
  category: string
  assignee?: string
  assigneeId?: string
  createdBy: string
  createdByName: string
  createdAt: string
  updatedAt: string
  projectId?: string
  projectName?: string
  responses?: number
  lastResponse?: string
}

const statusConfig = {
  open: { label: '열림', color: 'bg-blue-500', icon: AlertCircle },
  in_progress: { label: '진행중', color: 'bg-yellow-500', icon: Clock },
  resolved: { label: '해결됨', color: 'bg-green-500', icon: CheckCircle },
  closed: { label: '닫힘', color: 'bg-gray-500', icon: XCircle }
}

const priorityConfig = {
  low: { label: '낮음', variant: 'outline' as const },
  medium: { label: '보통', variant: 'secondary' as const },
  high: { label: '높음', variant: 'default' as const },
  urgent: { label: '긴급', variant: 'destructive' as const }
}

export default function TicketsPage() {
  const { user, userProfile } = useAuth()
  const [tickets, setTickets] = useState<TicketData[]>([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [editingTicket, setEditingTicket] = useState<TicketData | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterStatus, setFilterStatus] = useState<string>('all')
  const [filterPriority, setFilterPriority] = useState<string>('all')
  const [selectedTicket, setSelectedTicket] = useState<TicketData | null>(null)
  
  const [formData, setFormData] = useState<{
    title: string
    description: string
    category: string
    priority: 'low' | 'medium' | 'high' | 'urgent'
    projectId: string
  }>({
    title: '',
    description: '',
    category: '',
    priority: 'medium',
    projectId: ''
  })

  useEffect(() => {
    if (!user) return

    const db = getDatabase(app)
    const ticketsRef = ref(db, 'tickets')
    
    const unsubscribe = onValue(ticketsRef, (snapshot) => {
      const data = snapshot.val()
      if (data) {
        const ticketsList = Object.entries(data).map(([id, ticket]: [string, any]) => ({
          id,
          ...ticket
        }))
        
        // 권한에 따른 필터링
        let filteredTickets = ticketsList
        if (userProfile?.role === 'customer' || userProfile?.role === 'external') {
          filteredTickets = ticketsList.filter(t => t.createdBy === user.uid)
        } else if (userProfile?.role === 'manager') {
          filteredTickets = ticketsList.filter(t => 
            t.assigneeId === user.uid || !t.assigneeId
          )
        }
        
        setTickets(filteredTickets.sort((a, b) => 
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        ))
      } else {
        setTickets([])
      }
      setLoading(false)
    })

    return () => off(ticketsRef)
  }, [user, userProfile])

  const filteredTickets = tickets.filter(ticket => {
    const matchesSearch = 
      ticket.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      ticket.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      ticket.category.toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchesStatus = filterStatus === 'all' || ticket.status === filterStatus
    const matchesPriority = filterPriority === 'all' || ticket.priority === filterPriority
    
    return matchesSearch && matchesStatus && matchesPriority
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    try {
      const db = getDatabase(app)
      
      if (editingTicket) {
        await update(ref(db, `tickets/${editingTicket.id}`), {
          title: formData.title,
          description: formData.description,
          category: formData.category,
          priority: formData.priority,
          updatedAt: new Date().toISOString()
        })
        toast.success('티켓이 수정되었습니다.')
      } else {
        await push(ref(db, 'tickets'), {
          title: formData.title,
          description: formData.description,
          category: formData.category,
          priority: formData.priority,
          status: 'open',
          createdBy: user!.uid,
          createdByName: userProfile?.displayName || user!.email || '알 수 없음',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          responses: 0
        })
        toast.success('티켓이 생성되었습니다.')
      }
      
      handleCloseModal()
    } catch (error) {
      console.error('Error saving ticket:', error)
      toast.error('티켓 저장 중 오류가 발생했습니다.')
    }
  }

  const handleDelete = async (ticketId: string) => {
    if (!confirm('정말 이 티켓을 삭제하시겠습니까?')) return
    
    try {
      const db = getDatabase(app)
      await remove(ref(db, `tickets/${ticketId}`))
      toast.success('티켓이 삭제되었습니다.')
      setSelectedTicket(null)
    } catch (error) {
      console.error('Error deleting ticket:', error)
      toast.error('티켓 삭제 중 오류가 발생했습니다.')
    }
  }

  const handleStatusChange = async (ticketId: string, newStatus: string) => {
    try {
      const db = getDatabase(app)
      await update(ref(db, `tickets/${ticketId}`), {
        status: newStatus,
        updatedAt: new Date().toISOString()
      })
      toast.success('상태가 변경되었습니다.')
    } catch (error) {
      console.error('Error updating status:', error)
      toast.error('상태 변경 중 오류가 발생했습니다.')
    }
  }

  const handleCloseModal = () => {
    setShowModal(false)
    setEditingTicket(null)
    setFormData({
      title: '',
      description: '',
      category: '',
      priority: 'medium',
      projectId: ''
    })
  }

  const handleEdit = (ticket: TicketData) => {
    setEditingTicket(ticket)
    setFormData({
      title: ticket.title,
      description: ticket.description,
      category: ticket.category,
      priority: ticket.priority,
      projectId: ticket.projectId || ''
    })
    setShowModal(true)
  }

  const getTicketStats = () => {
    const stats = {
      total: tickets.length,
      open: tickets.filter(t => t.status === 'open').length,
      inProgress: tickets.filter(t => t.status === 'in_progress').length,
      resolved: tickets.filter(t => t.status === 'resolved').length,
      urgent: tickets.filter(t => t.priority === 'urgent').length
    }
    return stats
  }

  const stats = getTicketStats()

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
      </div>
    )
  }

  return (
    <div className="w-full max-w-[1920px] mx-auto px-6 py-6 space-y-6">
      {/* 헤더 */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">티켓 관리</h1>
          <p className="text-muted-foreground mt-1">고객 문의 및 지원 요청을 관리합니다</p>
        </div>
        
        <Button onClick={() => setShowModal(true)}>
          <Plus className="mr-2 h-4 w-4" />
          새 티켓
        </Button>
      </div>

      {/* 통계 카드 */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">전체 티켓</p>
                <p className="text-2xl font-bold">{stats.total}</p>
              </div>
              <Ticket className="h-8 w-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">열린 티켓</p>
                <p className="text-2xl font-bold text-blue-600">{stats.open}</p>
              </div>
              <AlertCircle className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">진행중</p>
                <p className="text-2xl font-bold text-yellow-600">{stats.inProgress}</p>
              </div>
              <Clock className="h-8 w-8 text-yellow-600" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">해결됨</p>
                <p className="text-2xl font-bold text-green-600">{stats.resolved}</p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">긴급</p>
                <p className="text-2xl font-bold text-red-600">{stats.urgent}</p>
              </div>
              <AlertCircle className="h-8 w-8 text-red-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* 검색 및 필터 */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="티켓 검색..."
            className="pl-10"
          />
        </div>
        
        <Tabs value={filterStatus} onValueChange={setFilterStatus}>
          <TabsList>
            <TabsTrigger value="all">전체</TabsTrigger>
            <TabsTrigger value="open">열림</TabsTrigger>
            <TabsTrigger value="in_progress">진행중</TabsTrigger>
            <TabsTrigger value="resolved">해결됨</TabsTrigger>
            <TabsTrigger value="closed">닫힘</TabsTrigger>
          </TabsList>
        </Tabs>
        
        <Select value={filterPriority} onValueChange={setFilterPriority}>
          <SelectTrigger className="w-[150px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">모든 우선순위</SelectItem>
            <SelectItem value="low">낮음</SelectItem>
            <SelectItem value="medium">보통</SelectItem>
            <SelectItem value="high">높음</SelectItem>
            <SelectItem value="urgent">긴급</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* 티켓 목록 */}
      {filteredTickets.length === 0 ? (
        <Card>
          <CardContent className="p-12 text-center">
            <Ticket className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
            <h3 className="text-lg font-medium mb-2">
              {searchTerm || filterStatus !== 'all' || filterPriority !== 'all'
                ? '검색 결과가 없습니다'
                : '티켓이 없습니다'}
            </h3>
            <p className="text-muted-foreground">
              {searchTerm || filterStatus !== 'all' || filterPriority !== 'all'
                ? '다른 검색 조건을 시도해보세요.'
                : '새로운 티켓을 생성해보세요.'}
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4">
          {filteredTickets.map((ticket) => {
            const StatusIcon = statusConfig[ticket.status].icon
            return (
              <motion.div
                key={ticket.id}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                whileHover={{ scale: 1.02 }}
              >
                <Card 
                  className="cursor-pointer hover:shadow-lg transition-all"
                  onClick={() => setSelectedTicket(ticket)}
                >
                  <CardContent className="p-6">
                    <div className="flex justify-between items-start mb-3">
                      <div className="flex items-center gap-2">
                        <div className={`w-3 h-3 rounded-full ${statusConfig[ticket.status].color}`} />
                        <Badge variant={priorityConfig[ticket.priority].variant}>
                          {priorityConfig[ticket.priority].label}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-1">
                        <StatusIcon className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm text-muted-foreground">
                          {statusConfig[ticket.status].label}
                        </span>
                      </div>
                    </div>
                    
                    <h3 className="font-semibold mb-2 line-clamp-1">{ticket.title}</h3>
                    <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
                      {ticket.description}
                    </p>
                    
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <Tag className="h-3 w-3" />
                      <span>{ticket.category}</span>
                    </div>
                    
                    <div className="flex items-center justify-between mt-4 pt-4 border-t">
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <User className="h-3 w-3" />
                        <span>{ticket.createdByName}</span>
                      </div>
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <Calendar className="h-3 w-3" />
                        <span>{new Date(ticket.createdAt).toLocaleDateString('ko-KR')}</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            )
          })}
        </div>
      )}

      {/* 티켓 생성/수정 모달 */}
      <Dialog open={showModal} onOpenChange={setShowModal}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>
              {editingTicket ? '티켓 수정' : '새 티켓 만들기'}
            </DialogTitle>
          </DialogHeader>

          <form onSubmit={handleSubmit}>
            <div className="space-y-4">
              <div>
                <Label htmlFor="title">제목 *</Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  required
                />
              </div>

              <div>
                <Label htmlFor="description">설명 *</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows={4}
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="category">카테고리 *</Label>
                  <Input
                    id="category"
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    placeholder="예: 기술지원, 일반문의"
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="priority">우선순위</Label>
                  <Select
                    value={formData.priority}
                    onValueChange={(value: any) => setFormData({ ...formData, priority: value })}
                  >
                    <SelectTrigger id="priority">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="low">낮음</SelectItem>
                      <SelectItem value="medium">보통</SelectItem>
                      <SelectItem value="high">높음</SelectItem>
                      <SelectItem value="urgent">긴급</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>

            <DialogFooter className="mt-6">
              <Button type="button" variant="outline" onClick={handleCloseModal}>
                취소
              </Button>
              <Button type="submit">
                {editingTicket ? '수정' : '생성'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* 티켓 상세 모달 */}
      <Dialog open={!!selectedTicket} onOpenChange={() => setSelectedTicket(null)}>
        <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
          {selectedTicket && (
            <>
              <DialogHeader>
                <div className="flex items-center justify-between">
                  <DialogTitle className="text-xl">{selectedTicket.title}</DialogTitle>
                  <div className="flex items-center gap-2">
                    <Badge variant={priorityConfig[selectedTicket.priority].variant}>
                      {priorityConfig[selectedTicket.priority].label}
                    </Badge>
                    {(userProfile?.role === 'admin' || selectedTicket.createdBy === user?.uid) && (
                      <>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => {
                            handleEdit(selectedTicket)
                            setSelectedTicket(null)
                          }}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => {
                            handleDelete(selectedTicket.id)
                            setSelectedTicket(null)
                          }}
                          className="text-destructive hover:text-destructive"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </>
                    )}
                  </div>
                </div>
              </DialogHeader>

              <div className="space-y-4 mt-4">
                <div className="flex items-center gap-4">
                  <Select
                    value={selectedTicket.status}
                    onValueChange={(value) => handleStatusChange(selectedTicket.id, value)}
                    disabled={userProfile?.role === 'customer' || userProfile?.role === 'external'}
                  >
                    <SelectTrigger className="w-[150px]">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="open">열림</SelectItem>
                      <SelectItem value="in_progress">진행중</SelectItem>
                      <SelectItem value="resolved">해결됨</SelectItem>
                      <SelectItem value="closed">닫힘</SelectItem>
                    </SelectContent>
                  </Select>
                  
                  <Badge variant="outline">
                    <Tag className="h-3 w-3 mr-1" />
                    {selectedTicket.category}
                  </Badge>
                </div>

                <div className="bg-muted rounded-lg p-4">
                  <p className="whitespace-pre-wrap">{selectedTicket.description}</p>
                </div>

                <div className="flex items-center justify-between text-sm text-muted-foreground">
                  <div className="flex items-center gap-2">
                    <User className="h-4 w-4" />
                    <span>작성자: {selectedTicket.createdByName}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4" />
                    <span>작성일: {new Date(selectedTicket.createdAt).toLocaleString('ko-KR')}</span>
                  </div>
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}