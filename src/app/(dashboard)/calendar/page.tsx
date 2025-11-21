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
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { 
  Calendar as CalendarIcon, Clock, ChevronLeft, ChevronRight,
  Plus, Users, MapPin, Video, Phone, AlertCircle
} from 'lucide-react'
import { useAuth } from '@/lib/auth-context'
import { getDatabase, ref, onValue, off, push, set, remove } from 'firebase/database'
import { app } from '@/lib/firebase'
import toast from 'react-hot-toast'
import { cn } from '@/lib/utils'

interface Event {
  id: string
  title: string
  description?: string
  date: string
  startTime: string
  endTime: string
  type: 'meeting' | 'task' | 'reminder' | 'holiday'
  location?: string
  participants?: string[]
  meetingLink?: string
  createdBy: string
  createdByName: string
  projectId?: string
  projectName?: string
}

interface Project {
  id: string
  name: string
}

const eventTypeConfig = {
  meeting: { label: '회의', color: 'bg-blue-500', icon: Users },
  task: { label: '작업', color: 'bg-green-500', icon: AlertCircle },
  reminder: { label: '알림', color: 'bg-yellow-500', icon: Clock },
  holiday: { label: '휴일', color: 'bg-red-500', icon: CalendarIcon }
}

export default function CalendarPage() {
  const { user, userProfile } = useAuth()
  const [events, setEvents] = useState<Event[]>([])
  const [projects, setProjects] = useState<Project[]>([])
  const [currentDate, setCurrentDate] = useState(new Date())
  const [selectedDate, setSelectedDate] = useState<Date | null>(null)
  const [viewType, setViewType] = useState<'month' | 'week' | 'day'>('month')
  const [showEventModal, setShowEventModal] = useState(false)
  const [editingEvent, setEditingEvent] = useState<Event | null>(null)
  const [loading, setLoading] = useState(true)

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    date: '',
    startTime: '',
    endTime: '',
    type: 'meeting' as Event['type'],
    location: '',
    meetingLink: '',
    projectId: ''
  })

  // Firebase에서 이벤트 가져오기
  useEffect(() => {
    if (!user) return

    const db = getDatabase(app)
    const eventsRef = ref(db, 'events')
    
    const unsubscribe = onValue(eventsRef, (snapshot) => {
      const data = snapshot.val()
      if (data) {
        const eventsList = Object.entries(data).map(([id, event]: [string, any]) => ({
          id,
          ...event
        }))
        setEvents(eventsList)
      }
      setLoading(false)
    })

    return () => off(eventsRef)
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

  // 날짜 관련 유틸리티 함수
  const getDaysInMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate()
  }

  const getFirstDayOfMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth(), 1).getDay()
  }

  const formatDate = (date: Date) => {
    return date.toISOString().split('T')[0]
  }

  const getEventsForDate = (date: Date) => {
    const dateStr = formatDate(date)
    return events.filter(event => event.date === dateStr)
  }

  // 이벤트 생성/수정
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!user || !userProfile) return

    try {
      const db = getDatabase(app)
      const eventsRef = ref(db, 'events')
      
      const eventData = {
        ...formData,
        createdBy: user.uid,
        createdByName: userProfile.displayName || userProfile.email,
        updatedAt: new Date().toISOString()
      }

      if (editingEvent) {
        await set(ref(db, `events/${editingEvent.id}`), eventData)
        toast.success('일정이 수정되었습니다.')
      } else {
        const newEventRef = push(eventsRef)
        await set(newEventRef, {
          ...eventData,
          createdAt: new Date().toISOString()
        })
        toast.success('일정이 추가되었습니다.')
      }

      handleCloseModal()
    } catch (error) {
      console.error('Error saving event:', error)
      toast.error('일정 저장 중 오류가 발생했습니다.')
    }
  }

  // 이벤트 삭제
  const handleDelete = async (eventId: string) => {
    if (!confirm('정말 이 일정을 삭제하시겠습니까?')) return

    try {
      const db = getDatabase(app)
      await remove(ref(db, `events/${eventId}`))
      toast.success('일정이 삭제되었습니다.')
    } catch (error) {
      console.error('Error deleting event:', error)
      toast.error('일정 삭제 중 오류가 발생했습니다.')
    }
  }

  // 모달 닫기
  const handleCloseModal = () => {
    setShowEventModal(false)
    setEditingEvent(null)
    setFormData({
      title: '',
      description: '',
      date: '',
      startTime: '',
      endTime: '',
      type: 'meeting',
      location: '',
      meetingLink: '',
      projectId: ''
    })
  }

  // 달력 렌더링
  const renderCalendar = () => {
    const daysInMonth = getDaysInMonth(currentDate)
    const firstDay = getFirstDayOfMonth(currentDate)
    const days = []
    
    // 빈 날짜 채우기
    for (let i = 0; i < firstDay; i++) {
      days.push(<div key={`empty-${i}`} className="h-24 bg-gray-50" />)
    }
    
    // 실제 날짜
    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(currentDate.getFullYear(), currentDate.getMonth(), day)
      const dateEvents = getEventsForDate(date)
      const isToday = formatDate(date) === formatDate(new Date())
      const isSelected = selectedDate && formatDate(date) === formatDate(selectedDate)
      
      days.push(
        <div
          key={day}
          onClick={() => setSelectedDate(date)}
          className={cn(
            "h-24 p-2 border cursor-pointer hover:bg-gray-50 transition-colors",
            isToday && "bg-blue-50 border-blue-300",
            isSelected && "ring-2 ring-primary"
          )}
        >
          <div className="flex items-center justify-between mb-1">
            <span className={cn(
              "text-sm font-medium",
              isToday && "text-blue-600"
            )}>
              {day}
            </span>
            {dateEvents.length > 0 && (
              <Badge variant="secondary" className="text-xs">
                {dateEvents.length}
              </Badge>
            )}
          </div>
          <div className="space-y-1">
            {dateEvents.slice(0, 2).map(event => {
              const config = eventTypeConfig[event.type]
              return (
                <div
                  key={event.id}
                  className={cn(
                    "text-xs p-1 rounded text-white truncate",
                    config.color
                  )}
                >
                  {event.title}
                </div>
              )
            })}
            {dateEvents.length > 2 && (
              <div className="text-xs text-gray-500">
                +{dateEvents.length - 2} more
              </div>
            )}
          </div>
        </div>
      )
    }
    
    return days
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
          <h1 className="text-3xl font-bold tracking-tight">캘린더</h1>
          <p className="text-muted-foreground mt-1">팀의 일정을 관리하고 확인합니다</p>
        </div>
        
        <div className="flex items-center gap-3">
          <Tabs value={viewType} onValueChange={(v) => setViewType(v as any)}>
            <TabsList>
              <TabsTrigger value="month">월</TabsTrigger>
              <TabsTrigger value="week">주</TabsTrigger>
              <TabsTrigger value="day">일</TabsTrigger>
            </TabsList>
          </Tabs>
          
          <Button onClick={() => {
            setSelectedDate(new Date())
            setFormData({ ...formData, date: formatDate(new Date()) })
            setShowEventModal(true)
          }}>
            <Plus className="mr-2 h-4 w-4" />
            일정 추가
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* 캘린더 */}
        <div className="lg:col-span-3">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <CalendarIcon className="h-5 w-5" />
                  {currentDate.toLocaleDateString('ko-KR', { year: 'numeric', month: 'long' })}
                </CardTitle>
                
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1))}
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentDate(new Date())}
                  >
                    오늘
                  </Button>
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1))}
                  >
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-7 gap-px bg-gray-200">
                {['일', '월', '화', '수', '목', '금', '토'].map(day => (
                  <div key={day} className="bg-gray-50 p-2 text-center text-sm font-medium">
                    {day}
                  </div>
                ))}
                {renderCalendar()}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* 일정 목록 */}
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">
                {selectedDate 
                  ? selectedDate.toLocaleDateString('ko-KR', { month: 'long', day: 'numeric' }) + ' 일정'
                  : '오늘의 일정'}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {(() => {
                const dateEvents = getEventsForDate(selectedDate || new Date())
                
                if (dateEvents.length === 0) {
                  return (
                    <div className="text-center py-8">
                      <CalendarIcon className="h-12 w-12 mx-auto mb-3 text-muted-foreground" />
                      <p className="text-muted-foreground">일정이 없습니다</p>
                    </div>
                  )
                }
                
                return (
                  <div className="space-y-3">
                    {dateEvents.map(event => {
                      const config = eventTypeConfig[event.type]
                      const Icon = config.icon
                      
                      return (
                        <div
                          key={event.id}
                          className="p-3 border rounded-lg hover:bg-gray-50 cursor-pointer"
                          onClick={() => {
                            setEditingEvent(event)
                            setFormData({
                              title: event.title,
                              description: event.description || '',
                              date: event.date,
                              startTime: event.startTime,
                              endTime: event.endTime,
                              type: event.type,
                              location: event.location || '',
                              meetingLink: event.meetingLink || '',
                              projectId: event.projectId || ''
                            })
                            setShowEventModal(true)
                          }}
                        >
                          <div className="flex items-start gap-3">
                            <div className={cn("p-2 rounded", config.color)}>
                              <Icon className="h-4 w-4 text-white" />
                            </div>
                            <div className="flex-1">
                              <h4 className="font-medium">{event.title}</h4>
                              <p className="text-sm text-muted-foreground">
                                {event.startTime} - {event.endTime}
                              </p>
                              {event.location && (
                                <p className="text-sm text-muted-foreground flex items-center gap-1 mt-1">
                                  <MapPin className="h-3 w-3" />
                                  {event.location}
                                </p>
                              )}
                            </div>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                )
              })()}
            </CardContent>
          </Card>

          {/* 일정 유형별 범례 */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">일정 유형</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {Object.entries(eventTypeConfig).map(([type, config]) => {
                  const Icon = config.icon
                  return (
                    <div key={type} className="flex items-center gap-3">
                      <div className={cn("p-1.5 rounded", config.color)}>
                        <Icon className="h-3 w-3 text-white" />
                      </div>
                      <span className="text-sm">{config.label}</span>
                    </div>
                  )
                })}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* 일정 추가/수정 모달 */}
      <Dialog open={showEventModal} onOpenChange={setShowEventModal}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>
              {editingEvent ? '일정 수정' : '새 일정 추가'}
            </DialogTitle>
          </DialogHeader>
          
          <form onSubmit={handleSubmit}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="title">제목 *</Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="type">유형</Label>
                <Select 
                  value={formData.type}
                  onValueChange={(value: Event['type']) => setFormData({ ...formData, type: value })}
                >
                  <SelectTrigger id="type">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(eventTypeConfig).map(([type, config]) => (
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
              
              <div className="space-y-2">
                <Label htmlFor="location">장소</Label>
                <Input
                  id="location"
                  value={formData.location}
                  onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                  placeholder="회의실, 카페 등"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="meetingLink">미팅 링크</Label>
                <Input
                  id="meetingLink"
                  value={formData.meetingLink}
                  onChange={(e) => setFormData({ ...formData, meetingLink: e.target.value })}
                  placeholder="Zoom, Google Meet 등"
                />
              </div>
              
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
              
              <div className="md:col-span-2 space-y-2">
                <Label htmlFor="description">설명</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows={3}
                />
              </div>
            </div>
            
            <DialogFooter className="mt-6 flex justify-between">
              <div className="flex gap-2">
                {editingEvent && (
                  <Button
                    type="button"
                    variant="destructive"
                    onClick={() => {
                      handleDelete(editingEvent.id)
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
                  {editingEvent ? '수정' : '추가'}
                </Button>
              </div>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}