'use client'

import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { motion } from 'framer-motion'
import { 
  Video, Calendar, Clock, Users, Link2, FileText, 
  Plus, ChevronRight, MapPin, Mic, MicOff, VideoOff,
  MoreVertical, Download
} from 'lucide-react'
import { useAuth } from '@/lib/auth-context'
import { getDatabase, ref, onValue, off, push, set, remove } from 'firebase/database'
import { app } from '@/lib/firebase'
import toast from 'react-hot-toast'
import { cn } from '@/lib/utils'

interface Meeting {
  id: string
  title: string
  description?: string
  date: string
  startTime: string
  endTime: string
  type: 'online' | 'offline' | 'hybrid'
  status: 'scheduled' | 'ongoing' | 'completed' | 'cancelled'
  meetingLink?: string
  location?: string
  participants: string[]
  agenda?: string[]
  minutes?: string
  attachments?: { name: string; url: string }[]
  createdBy: string
  createdByName: string
  projectId?: string
  projectName?: string
}

interface Project {
  id: string
  name: string
}

const meetingTypeConfig = {
  online: { label: '온라인', icon: Video, color: 'text-blue-600' },
  offline: { label: '오프라인', icon: MapPin, color: 'text-green-600' },
  hybrid: { label: '하이브리드', icon: Users, color: 'text-purple-600' }
}

const statusConfig = {
  scheduled: { label: '예정', variant: 'outline' as const },
  ongoing: { label: '진행 중', variant: 'default' as const },
  completed: { label: '완료', variant: 'secondary' as const },
  cancelled: { label: '취소', variant: 'destructive' as const }
}

export default function MeetingsPage() {
  const { user, userProfile } = useAuth()
  const [meetings, setMeetings] = useState<Meeting[]>([])
  const [projects, setProjects] = useState<Project[]>([])
  const [selectedTab, setSelectedTab] = useState<'upcoming' | 'past'>('upcoming')
  const [showMeetingModal, setShowMeetingModal] = useState(false)
  const [editingMeeting, setEditingMeeting] = useState<Meeting | null>(null)
  const [showDetailsModal, setShowDetailsModal] = useState(false)
  const [selectedMeeting, setSelectedMeeting] = useState<Meeting | null>(null)
  const [loading, setLoading] = useState(true)

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    date: '',
    startTime: '',
    endTime: '',
    type: 'online' as Meeting['type'],
    meetingLink: '',
    location: '',
    projectId: '',
    agenda: ['']
  })

  // Firebase에서 회의 가져오기
  useEffect(() => {
    if (!user) return

    const db = getDatabase(app)
    const meetingsRef = ref(db, 'meetings')
    
    const unsubscribe = onValue(meetingsRef, (snapshot) => {
      const data = snapshot.val()
      if (data) {
        const meetingsList = Object.entries(data).map(([id, meeting]: [string, any]) => ({
          id,
          ...meeting
        }))
        setMeetings(meetingsList)
      }
      setLoading(false)
    })

    return () => off(meetingsRef)
  }, [user])

  // 프로젝트 목록 가져오기
  useEffect(() => {
    if (!user) return

    const db = getDatabase(app)
    const projectsRef = ref(db, 'projects')
    
    const unsubscribe = onValue(projectsRef, (snapshot) => {
      const data = snapshot.val()
      if (data) {
        const projectsList = Object.entries(data).map(([id, project]: [string, any]) => ({
          id,
          name: project.name
        }))
        setProjects(projectsList)
      }
    })

    return () => off(projectsRef)
  }, [user])

  // 회의 필터링
  const filteredMeetings = React.useMemo(() => {
    const now = new Date()
    const today = now.toISOString().split('T')[0]
    
    if (selectedTab === 'upcoming') {
      return meetings.filter(meeting => 
        meeting.date >= today && meeting.status !== 'cancelled'
      ).sort((a, b) => {
        if (a.date === b.date) {
          return a.startTime.localeCompare(b.startTime)
        }
        return a.date.localeCompare(b.date)
      })
    } else {
      return meetings.filter(meeting => 
        meeting.date < today || meeting.status === 'completed'
      ).sort((a, b) => {
        if (a.date === b.date) {
          return b.startTime.localeCompare(a.startTime)
        }
        return b.date.localeCompare(a.date)
      })
    }
  }, [meetings, selectedTab])

  // 회의 생성/수정
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!user || !userProfile) return

    try {
      const db = getDatabase(app)
      const meetingsRef = ref(db, 'meetings')
      
      const meetingData = {
        ...formData,
        status: 'scheduled' as Meeting['status'],
        participants: [user.uid],
        createdBy: user.uid,
        createdByName: userProfile.displayName || userProfile.email,
        updatedAt: new Date().toISOString()
      }

      if (editingMeeting) {
        await set(ref(db, `meetings/${editingMeeting.id}`), {
          ...editingMeeting,
          ...meetingData
        })
        toast.success('회의가 수정되었습니다.')
      } else {
        const newMeetingRef = push(meetingsRef)
        await set(newMeetingRef, {
          ...meetingData,
          createdAt: new Date().toISOString()
        })
        toast.success('회의가 생성되었습니다.')
      }

      handleCloseModal()
    } catch (error) {
      console.error('Error saving meeting:', error)
      toast.error('회의 저장 중 오류가 발생했습니다.')
    }
  }

  // 회의 삭제
  const handleDelete = async (meetingId: string) => {
    if (!confirm('정말 이 회의를 삭제하시겠습니까?')) return

    try {
      const db = getDatabase(app)
      await remove(ref(db, `meetings/${meetingId}`))
      toast.success('회의가 삭제되었습니다.')
    } catch (error) {
      console.error('Error deleting meeting:', error)
      toast.error('회의 삭제 중 오류가 발생했습니다.')
    }
  }

  // 모달 닫기
  const handleCloseModal = () => {
    setShowMeetingModal(false)
    setEditingMeeting(null)
    setFormData({
      title: '',
      description: '',
      date: '',
      startTime: '',
      endTime: '',
      type: 'online',
      meetingLink: '',
      location: '',
      projectId: '',
      agenda: ['']
    })
  }

  // 안건 추가/삭제
  const handleAgendaChange = (index: number, value: string) => {
    const newAgenda = [...formData.agenda]
    newAgenda[index] = value
    setFormData({ ...formData, agenda: newAgenda })
  }

  const addAgendaItem = () => {
    setFormData({ ...formData, agenda: [...formData.agenda, ''] })
  }

  const removeAgendaItem = (index: number) => {
    const newAgenda = formData.agenda.filter((_, i) => i !== index)
    setFormData({ ...formData, agenda: newAgenda })
  }

  // 통계 계산
  const stats = {
    totalMeetings: meetings.length,
    upcomingMeetings: meetings.filter(m => m.status === 'scheduled').length,
    completedMeetings: meetings.filter(m => m.status === 'completed').length,
    totalHours: meetings.reduce((sum, meeting) => {
      const start = new Date(`2000-01-01T${meeting.startTime}`)
      const end = new Date(`2000-01-01T${meeting.endTime}`)
      const hours = (end.getTime() - start.getTime()) / (1000 * 60 * 60)
      return sum + hours
    }, 0)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    )
  }

  return (
    <div className="w-full max-w-[1920px] mx-auto px-6 py-6 space-y-6">
      {/* 헤더 */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">회의 관리</h1>
          <p className="text-muted-foreground mt-1">팀 회의를 일정을 관리하고 회의록을 작성합니다</p>
        </div>
        
        <Button onClick={() => setShowMeetingModal(true)}>
          <Plus className="mr-2 h-4 w-4" />
          회의 생성
        </Button>
      </div>

      {/* 통계 카드 */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">전체 회의</p>
                <p className="text-2xl font-bold">{stats.totalMeetings}</p>
              </div>
              <Users className="h-8 w-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">예정된 회의</p>
                <p className="text-2xl font-bold">{stats.upcomingMeetings}</p>
              </div>
              <Calendar className="h-8 w-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">완료된 회의</p>
                <p className="text-2xl font-bold">{stats.completedMeetings}</p>
              </div>
              <FileText className="h-8 w-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">총 회의 시간</p>
                <p className="text-2xl font-bold">{stats.totalHours.toFixed(1)}h</p>
              </div>
              <Clock className="h-8 w-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* 회의 목록 */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>회의 목록</CardTitle>
            <Tabs value={selectedTab} onValueChange={(v) => setSelectedTab(v as any)}>
              <TabsList>
                <TabsTrigger value="upcoming">예정된 회의</TabsTrigger>
                <TabsTrigger value="past">지난 회의</TabsTrigger>
              </TabsList>
            </Tabs>
          </div>
        </CardHeader>
        <CardContent>
          {filteredMeetings.length === 0 ? (
            <div className="text-center py-12">
              <Video className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
              <p className="text-muted-foreground">
                {selectedTab === 'upcoming' ? '예정된 회의가 없습니다' : '지난 회의가 없습니다'}
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredMeetings.map((meeting) => {
                const typeConfig = meetingTypeConfig[meeting.type]
                const TypeIcon = typeConfig.icon
                
                return (
                  <motion.div
                    key={meeting.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="border rounded-lg p-4 hover:shadow-md transition-shadow cursor-pointer"
                    onClick={() => {
                      setSelectedMeeting(meeting)
                      setShowDetailsModal(true)
                    }}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="font-semibold text-lg">{meeting.title}</h3>
                          <Badge variant={statusConfig[meeting.status].variant}>
                            {statusConfig[meeting.status].label}
                          </Badge>
                        </div>
                        
                        {meeting.description && (
                          <p className="text-muted-foreground mb-3">{meeting.description}</p>
                        )}
                        
                        <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
                          <div className="flex items-center gap-1">
                            <Calendar className="h-4 w-4" />
                            {new Date(meeting.date).toLocaleDateString('ko-KR')}
                          </div>
                          
                          <div className="flex items-center gap-1">
                            <Clock className="h-4 w-4" />
                            {meeting.startTime} - {meeting.endTime}
                          </div>
                          
                          <div className="flex items-center gap-1">
                            <TypeIcon className={cn("h-4 w-4", typeConfig.color)} />
                            {typeConfig.label}
                          </div>
                          
                          {meeting.location && (
                            <div className="flex items-center gap-1">
                              <MapPin className="h-4 w-4" />
                              {meeting.location}
                            </div>
                          )}
                          
                          {meeting.projectName && (
                            <Badge variant="outline">{meeting.projectName}</Badge>
                          )}
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        {meeting.type === 'online' && meeting.meetingLink && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={(e) => {
                              e.stopPropagation()
                              window.open(meeting.meetingLink, '_blank')
                            }}
                          >
                            <Video className="h-4 w-4 mr-2" />
                            참여
                          </Button>
                        )}
                        
                        <Button
                          size="icon"
                          variant="ghost"
                          onClick={(e) => {
                            e.stopPropagation()
                            setEditingMeeting(meeting)
                            setFormData({
                              title: meeting.title,
                              description: meeting.description || '',
                              date: meeting.date,
                              startTime: meeting.startTime,
                              endTime: meeting.endTime,
                              type: meeting.type,
                              meetingLink: meeting.meetingLink || '',
                              location: meeting.location || '',
                              projectId: meeting.projectId || '',
                              agenda: meeting.agenda || ['']
                            })
                            setShowMeetingModal(true)
                          }}
                        >
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </motion.div>
                )
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {/* 회의 생성/수정 모달 */}
      <Dialog open={showMeetingModal} onOpenChange={setShowMeetingModal}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingMeeting ? '회의 수정' : '새 회의 생성'}
            </DialogTitle>
          </DialogHeader>
          
          <form onSubmit={handleSubmit}>
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="title">회의 제목 *</Label>
                  <Input
                    id="title"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    required
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="type">회의 유형</Label>
                  <Select 
                    value={formData.type}
                    onValueChange={(value: Meeting['type']) => setFormData({ ...formData, type: value })}
                  >
                    <SelectTrigger id="type">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.entries(meetingTypeConfig).map(([type, config]) => (
                        <SelectItem key={type} value={type}>{config.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="date">날짜 *</Label>
                  <Input
                    id="date"
                    type="date"
                    value={formData.date}
                    onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                    required
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-2">
                  <div className="space-y-2">
                    <Label htmlFor="startTime">시작 시간 *</Label>
                    <Input
                      id="startTime"
                      type="time"
                      value={formData.startTime}
                      onChange={(e) => setFormData({ ...formData, startTime: e.target.value })}
                      required
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="endTime">종료 시간 *</Label>
                    <Input
                      id="endTime"
                      type="time"
                      value={formData.endTime}
                      onChange={(e) => setFormData({ ...formData, endTime: e.target.value })}
                      required
                    />
                  </div>
                </div>
                
                {(formData.type === 'online' || formData.type === 'hybrid') && (
                  <div className="space-y-2">
                    <Label htmlFor="meetingLink">회의 링크</Label>
                    <Input
                      id="meetingLink"
                      value={formData.meetingLink}
                      onChange={(e) => setFormData({ ...formData, meetingLink: e.target.value })}
                      placeholder="Zoom, Google Meet 등"
                    />
                  </div>
                )}
                
                {(formData.type === 'offline' || formData.type === 'hybrid') && (
                  <div className="space-y-2">
                    <Label htmlFor="location">장소</Label>
                    <Input
                      id="location"
                      value={formData.location}
                      onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                      placeholder="회의실, 카페 등"
                    />
                  </div>
                )}
                
                <div className="space-y-2">
                  <Label htmlFor="project">프로젝트</Label>
                  <Select 
                    value={formData.projectId}
                    onValueChange={(value) => setFormData({ ...formData, projectId: value })}
                  >
                    <SelectTrigger id="project">
                      <SelectValue placeholder="프로젝트 선택 (선택사항)" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">없음</SelectItem>
                      {projects.map(project => (
                        <SelectItem key={project.id} value={project.id}>
                          {project.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="description">설명</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows={3}
                />
              </div>
              
              <div className="space-y-2">
                <Label>회의 안건</Label>
                <div className="space-y-2">
                  {formData.agenda.map((item, index) => (
                    <div key={index} className="flex gap-2">
                      <Input
                        value={item}
                        onChange={(e) => handleAgendaChange(index, e.target.value)}
                        placeholder={`안건 ${index + 1}`}
                      />
                      {formData.agenda.length > 1 && (
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          onClick={() => removeAgendaItem(index)}
                        >
                          ✕
                        </Button>
                      )}
                    </div>
                  ))}
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={addAgendaItem}
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    안건 추가
                  </Button>
                </div>
              </div>
            </div>
            
            <DialogFooter className="mt-6 flex justify-between">
              <div className="flex gap-2">
                {editingMeeting && (
                  <Button
                    type="button"
                    variant="destructive"
                    onClick={() => {
                      handleDelete(editingMeeting.id)
                      handleCloseModal()
                    }}
                  >
                    삭제
                  </Button>
                )}
              </div>
              
              <div className="flex gap-2">
                <Button type="button" variant="outline" onClick={handleCloseModal}>
                  취소
                </Button>
                <Button type="submit">
                  {editingMeeting ? '수정' : '생성'}
                </Button>
              </div>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* 회의 상세 모달 */}
      <Dialog open={showDetailsModal} onOpenChange={setShowDetailsModal}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>{selectedMeeting?.title}</DialogTitle>
          </DialogHeader>
          
          {selectedMeeting && (
            <div className="space-y-4">
              {selectedMeeting.description && (
                <div>
                  <h4 className="font-medium mb-2">설명</h4>
                  <p className="text-muted-foreground">{selectedMeeting.description}</p>
                </div>
              )}
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h4 className="font-medium mb-2">일시</h4>
                  <p className="text-muted-foreground">
                    {new Date(selectedMeeting.date).toLocaleDateString('ko-KR', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })}
                  </p>
                  <p className="text-muted-foreground">
                    {selectedMeeting.startTime} - {selectedMeeting.endTime}
                  </p>
                </div>
                
                <div>
                  <h4 className="font-medium mb-2">회의 정보</h4>
                  <div className="space-y-1">
                    <p className="text-muted-foreground flex items-center gap-2">
                      {(() => {
                        const config = meetingTypeConfig[selectedMeeting.type]
                        const Icon = config.icon
                        return (
                          <>
                            <Icon className={cn("h-4 w-4", config.color)} />
                            {config.label}
                          </>
                        )
                      })()}
                    </p>
                    {selectedMeeting.location && (
                      <p className="text-muted-foreground flex items-center gap-2">
                        <MapPin className="h-4 w-4" />
                        {selectedMeeting.location}
                      </p>
                    )}
                  </div>
                </div>
              </div>
              
              {selectedMeeting.agenda && selectedMeeting.agenda.length > 0 && (
                <div>
                  <h4 className="font-medium mb-2">회의 안건</h4>
                  <ul className="list-disc list-inside space-y-1">
                    {selectedMeeting.agenda.map((item, index) => (
                      <li key={index} className="text-muted-foreground">{item}</li>
                    ))}
                  </ul>
                </div>
              )}
              
              {selectedMeeting.meetingLink && (
                <div>
                  <h4 className="font-medium mb-2">회의 링크</h4>
                  <Button
                    variant="outline"
                    onClick={() => window.open(selectedMeeting.meetingLink, '_blank')}
                  >
                    <Link2 className="h-4 w-4 mr-2" />
                    회의 참여
                  </Button>
                </div>
              )}
              
              {selectedMeeting.status === 'completed' && selectedMeeting.minutes && (
                <div>
                  <h4 className="font-medium mb-2">회의록</h4>
                  <p className="text-muted-foreground whitespace-pre-wrap">
                    {selectedMeeting.minutes}
                  </p>
                </div>
              )}
            </div>
          )}
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDetailsModal(false)}>
              닫기
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}