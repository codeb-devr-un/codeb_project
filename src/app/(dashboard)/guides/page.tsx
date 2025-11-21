'use client'

import React, { useState, useEffect } from 'react'
import { useAuth } from '@/lib/auth-context'
import { getDatabase, ref, onValue, off, push, update, remove } from 'firebase/database'
import { app } from '@/lib/firebase'
import { motion } from 'framer-motion'
import toast from 'react-hot-toast'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { 
  BookOpen, Plus, Search, Filter, Clock, Eye, 
  Edit2, Trash2, FileText, Video, Image, Link,
  ChevronRight, Star, Download, Share2, Loader2,
  GraduationCap, Zap, Users, Code
} from 'lucide-react'

interface Guide {
  id: string
  title: string
  description: string
  content: string
  category: string
  type: 'text' | 'video' | 'interactive'
  difficulty: 'beginner' | 'intermediate' | 'advanced'
  estimatedTime: number // minutes
  tags: string[]
  attachments?: string[]
  videoUrl?: string
  views: number
  likes: number
  isPublished: boolean
  createdAt: string
  updatedAt: string
  createdBy: string
  author: string
}

const categoryIcons = {
  getting_started: GraduationCap,
  features: Zap,
  integration: Code,
  collaboration: Users,
  advanced: BookOpen
}

const categoryLabels = {
  getting_started: '시작하기',
  features: '주요 기능',
  integration: '연동',
  collaboration: '협업',
  advanced: '고급'
}

const difficultyConfig = {
  beginner: { label: '초급', color: 'text-green-600', bgColor: 'bg-green-100' },
  intermediate: { label: '중급', color: 'text-yellow-600', bgColor: 'bg-yellow-100' },
  advanced: { label: '고급', color: 'text-red-600', bgColor: 'bg-red-100' }
}

export default function GuidesPage() {
  const { user, userProfile } = useAuth()
  const [guides, setGuides] = useState<Guide[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState<string>('all')
  const [selectedDifficulty, setSelectedDifficulty] = useState<string>('all')
  const [showModal, setShowModal] = useState(false)
  const [editingGuide, setEditingGuide] = useState<Guide | null>(null)
  const [selectedGuide, setSelectedGuide] = useState<Guide | null>(null)
  
  const [formData, setFormData] = useState<{
    title: string
    description: string
    content: string
    category: string
    type: 'text' | 'video' | 'interactive'
    difficulty: 'beginner' | 'intermediate' | 'advanced'
    estimatedTime: number
    tags: string
    videoUrl: string
    isPublished: boolean
  }>({
    title: '',
    description: '',
    content: '',
    category: 'getting_started',
    type: 'text',
    difficulty: 'beginner',
    estimatedTime: 5,
    tags: '',
    videoUrl: '',
    isPublished: true
  })

  useEffect(() => {
    const db = getDatabase(app)
    const guidesRef = ref(db, 'guides')
    
    const unsubscribe = onValue(guidesRef, (snapshot) => {
      const data = snapshot.val()
      if (data) {
        const guidesList = Object.entries(data).map(([id, guide]: [string, any]) => ({
          id,
          ...guide,
          tags: guide.tags || [],
          views: guide.views || 0,
          likes: guide.likes || 0
        }))
        
        // 관리자가 아닌 경우 게시된 가이드만 표시
        const filteredGuides = userProfile?.role === 'admin' 
          ? guidesList 
          : guidesList.filter(g => g.isPublished)
        
        setGuides(filteredGuides.sort((a, b) => 
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        ))
      } else {
        setGuides([])
      }
      setLoading(false)
    })

    return () => off(guidesRef)
  }, [userProfile])

  const filteredGuides = guides.filter(guide => {
    const matchesSearch = 
      guide.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      guide.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      guide.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()))
    
    const matchesCategory = selectedCategory === 'all' || guide.category === selectedCategory
    const matchesDifficulty = selectedDifficulty === 'all' || guide.difficulty === selectedDifficulty
    
    return matchesSearch && matchesCategory && matchesDifficulty
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    try {
      const db = getDatabase(app)
      const guideData = {
        title: formData.title,
        description: formData.description,
        content: formData.content,
        category: formData.category,
        type: formData.type,
        difficulty: formData.difficulty,
        estimatedTime: formData.estimatedTime,
        tags: formData.tags.split(',').map(tag => tag.trim()).filter(tag => tag),
        videoUrl: formData.videoUrl,
        isPublished: formData.isPublished,
        author: userProfile?.displayName || user?.email || '관리자',
        createdBy: user!.uid,
        createdAt: editingGuide?.createdAt || new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }
      
      if (editingGuide) {
        await update(ref(db, `guides/${editingGuide.id}`), guideData)
        toast.success('가이드가 수정되었습니다.')
      } else {
        await push(ref(db, 'guides'), guideData)
        toast.success('가이드가 추가되었습니다.')
      }
      
      handleCloseModal()
    } catch (error) {
      console.error('Error saving guide:', error)
      toast.error('가이드 저장 중 오류가 발생했습니다.')
    }
  }

  const handleDelete = async (guideId: string) => {
    if (!confirm('정말 이 가이드를 삭제하시겠습니까?')) return
    
    try {
      const db = getDatabase(app)
      await remove(ref(db, `guides/${guideId}`))
      toast.success('가이드가 삭제되었습니다.')
    } catch (error) {
      console.error('Error deleting guide:', error)
      toast.error('가이드 삭제 중 오류가 발생했습니다.')
    }
  }

  const handleView = async (guide: Guide) => {
    setSelectedGuide(guide)
    
    // 조회수 증가
    const db = getDatabase(app)
    await update(ref(db, `guides/${guide.id}`), {
      views: (guide.views || 0) + 1
    })
  }

  const handleLike = async (guideId: string) => {
    const db = getDatabase(app)
    const guide = guides.find(g => g.id === guideId)
    if (guide) {
      await update(ref(db, `guides/${guideId}`), {
        likes: (guide.likes || 0) + 1
      })
      toast.success('가이드가 도움이 되셨다니 기쁩니다!')
    }
  }

  const handleCloseModal = () => {
    setShowModal(false)
    setEditingGuide(null)
    setFormData({
      title: '',
      description: '',
      content: '',
      category: 'getting_started',
      type: 'text',
      difficulty: 'beginner',
      estimatedTime: 5,
      tags: '',
      videoUrl: '',
      isPublished: true
    })
  }

  const handleEdit = (guide: Guide) => {
    setEditingGuide(guide)
    setFormData({
      title: guide.title,
      description: guide.description,
      content: guide.content,
      category: guide.category,
      type: guide.type,
      difficulty: guide.difficulty,
      estimatedTime: guide.estimatedTime,
      tags: guide.tags.join(', '),
      videoUrl: guide.videoUrl || '',
      isPublished: guide.isPublished
    })
    setShowModal(true)
  }

  const getCategoryStats = () => {
    const stats: Record<string, number> = {}
    Object.keys(categoryLabels).forEach(category => {
      stats[category] = guides.filter(g => g.category === category).length
    })
    return stats
  }

  const categoryStats = getCategoryStats()

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin text-primary mx-auto" />
          <p className="mt-4 text-muted-foreground">가이드를 불러오는 중...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="w-full max-w-[1920px] mx-auto px-6 py-6 space-y-6">
      {/* 헤더 */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">가이드</h1>
          <p className="text-muted-foreground mt-1">플랫폼 사용법을 자세히 알아보세요</p>
        </div>
        
        {userProfile?.role === 'admin' && (
          <Button onClick={() => setShowModal(true)}>
            <Plus className="mr-2 h-4 w-4" />
            가이드 추가
          </Button>
        )}
      </div>

      {/* 카테고리 통계 */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        {Object.entries(categoryLabels).map(([key, label]) => {
          const Icon = categoryIcons[key as keyof typeof categoryIcons]
          const count = categoryStats[key] || 0
          
          return (
            <Card 
              key={key}
              className={`cursor-pointer transition-all hover:shadow-md ${
                selectedCategory === key ? 'ring-2 ring-primary' : ''
              }`}
              onClick={() => setSelectedCategory(selectedCategory === key ? 'all' : key)}
            >
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Icon className="h-6 w-6 text-primary mb-1" />
                    <h3 className="font-medium">{label}</h3>
                    <p className="text-2xl font-bold">{count}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {/* 검색 및 필터 */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="가이드 검색..."
            className="pl-10"
          />
        </div>
        
        <Tabs value={selectedDifficulty} onValueChange={setSelectedDifficulty}>
          <TabsList>
            <TabsTrigger value="all">모든 난이도</TabsTrigger>
            <TabsTrigger value="beginner">초급</TabsTrigger>
            <TabsTrigger value="intermediate">중급</TabsTrigger>
            <TabsTrigger value="advanced">고급</TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      {/* 가이드 목록 */}
      {filteredGuides.length === 0 ? (
        <Card>
          <CardContent className="p-12 text-center">
            <BookOpen className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
            <h3 className="text-lg font-medium mb-2">가이드가 없습니다</h3>
            <p className="text-muted-foreground">
              {searchTerm || selectedCategory !== 'all' || selectedDifficulty !== 'all'
                ? '다른 검색 조건을 시도해보세요.'
                : '아직 등록된 가이드가 없습니다.'}
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredGuides.map((guide) => {
            const Icon = categoryIcons[guide.category as keyof typeof categoryIcons] || BookOpen
            const difficultyInfo = difficultyConfig[guide.difficulty]
            
            return (
              <motion.div
                key={guide.id}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                whileHover={{ scale: 1.02 }}
              >
                <Card 
                  className="h-full hover:shadow-lg transition-all cursor-pointer"
                  onClick={() => handleView(guide)}
                >
                  <CardContent className="p-6 h-full flex flex-col">
                    <div className="flex items-start justify-between mb-4">
                      <div className="p-2 bg-primary/10 rounded-lg">
                        <Icon className="h-6 w-6 text-primary" />
                      </div>
                      <div className="flex items-center gap-2">
                        {!guide.isPublished && userProfile?.role === 'admin' && (
                          <Badge variant="outline">미게시</Badge>
                        )}
                        {guide.type === 'video' && <Video className="h-4 w-4 text-muted-foreground" />}
                        {guide.type === 'interactive' && <Zap className="h-4 w-4 text-muted-foreground" />}
                      </div>
                    </div>
                    
                    <div className="flex-1">
                      <h3 className="font-semibold mb-2">{guide.title}</h3>
                      <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
                        {guide.description}
                      </p>
                    </div>
                    
                    <div className="space-y-3">
                      <div className="flex items-center gap-2">
                        <Badge 
                          variant="secondary"
                          className={`${difficultyInfo.bgColor} ${difficultyInfo.color}`}
                        >
                          {difficultyInfo.label}
                        </Badge>
                        <div className="flex items-center gap-1 text-sm text-muted-foreground">
                          <Clock className="h-3 w-3" />
                          <span>{guide.estimatedTime}분</span>
                        </div>
                      </div>
                      
                      {guide.tags.length > 0 && (
                        <div className="flex flex-wrap gap-1">
                          {guide.tags.slice(0, 3).map((tag, i) => (
                            <Badge key={i} variant="outline" className="text-xs">
                              {tag}
                            </Badge>
                          ))}
                          {guide.tags.length > 3 && (
                            <Badge variant="outline" className="text-xs">
                              +{guide.tags.length - 3}
                            </Badge>
                          )}
                        </div>
                      )}
                      
                      <div className="flex items-center justify-between pt-3 border-t">
                        <div className="flex items-center gap-3 text-sm text-muted-foreground">
                          <div className="flex items-center gap-1">
                            <Eye className="h-3 w-3" />
                            <span>{guide.views}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Star className="h-3 w-3" />
                            <span>{guide.likes}</span>
                          </div>
                        </div>
                        
                        {userProfile?.role === 'admin' && (
                          <div className="flex gap-1" onClick={(e) => e.stopPropagation()}>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleEdit(guide)}
                            >
                              <Edit2 className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleDelete(guide.id)}
                              className="text-destructive hover:text-destructive"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
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

      {/* 가이드 추가/수정 모달 */}
      <Dialog open={showModal} onOpenChange={setShowModal}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingGuide ? '가이드 수정' : '가이드 추가'}</DialogTitle>
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
                  rows={2}
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="category">카테고리</Label>
                  <select
                    id="category"
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="w-full px-3 py-2 border rounded-md"
                  >
                    {Object.entries(categoryLabels).map(([value, label]) => (
                      <option key={value} value={value}>{label}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <Label htmlFor="type">유형</Label>
                  <select
                    id="type"
                    value={formData.type}
                    onChange={(e) => setFormData({ ...formData, type: e.target.value as any })}
                    className="w-full px-3 py-2 border rounded-md"
                  >
                    <option value="text">텍스트</option>
                    <option value="video">비디오</option>
                    <option value="interactive">인터랙티브</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="difficulty">난이도</Label>
                  <select
                    id="difficulty"
                    value={formData.difficulty}
                    onChange={(e) => setFormData({ ...formData, difficulty: e.target.value as any })}
                    className="w-full px-3 py-2 border rounded-md"
                  >
                    <option value="beginner">초급</option>
                    <option value="intermediate">중급</option>
                    <option value="advanced">고급</option>
                  </select>
                </div>

                <div>
                  <Label htmlFor="estimatedTime">예상 소요 시간 (분)</Label>
                  <Input
                    id="estimatedTime"
                    type="number"
                    value={formData.estimatedTime}
                    onChange={(e) => setFormData({ ...formData, estimatedTime: parseInt(e.target.value) })}
                    min={1}
                    required
                  />
                </div>
              </div>

              {formData.type === 'video' && (
                <div>
                  <Label htmlFor="videoUrl">비디오 URL</Label>
                  <Input
                    id="videoUrl"
                    value={formData.videoUrl}
                    onChange={(e) => setFormData({ ...formData, videoUrl: e.target.value })}
                    placeholder="YouTube, Vimeo 등의 URL"
                  />
                </div>
              )}

              <div>
                <Label htmlFor="content">내용 *</Label>
                <Textarea
                  id="content"
                  value={formData.content}
                  onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                  rows={10}
                  placeholder="마크다운 형식을 지원합니다"
                  required
                />
              </div>

              <div>
                <Label htmlFor="tags">태그 (쉼표로 구분)</Label>
                <Input
                  id="tags"
                  value={formData.tags}
                  onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
                  placeholder="예: 프로젝트 관리, 협업, 자동화"
                />
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="isPublished"
                  checked={formData.isPublished}
                  onChange={(e) => setFormData({ ...formData, isPublished: e.target.checked })}
                />
                <Label htmlFor="isPublished">게시하기</Label>
              </div>
            </div>

            <DialogFooter className="mt-6">
              <Button type="button" variant="outline" onClick={handleCloseModal}>
                취소
              </Button>
              <Button type="submit">
                {editingGuide ? '수정' : '추가'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* 가이드 상세 보기 모달 */}
      {selectedGuide && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={() => setSelectedGuide(null)}>
          <Card className="w-full max-w-4xl max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <CardHeader>
              <div className="flex items-start justify-between">
                <div>
                  <CardTitle className="text-2xl">{selectedGuide.title}</CardTitle>
                  <p className="text-muted-foreground mt-2">{selectedGuide.description}</p>
                </div>
                <Button variant="ghost" size="sm" onClick={() => setSelectedGuide(null)}>
                  ✕
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex flex-wrap items-center gap-4 text-sm">
                  <Badge 
                    variant="secondary"
                    className={`${difficultyConfig[selectedGuide.difficulty].bgColor} ${difficultyConfig[selectedGuide.difficulty].color}`}
                  >
                    {difficultyConfig[selectedGuide.difficulty].label}
                  </Badge>
                  <div className="flex items-center gap-1 text-muted-foreground">
                    <Clock className="h-4 w-4" />
                    <span>{selectedGuide.estimatedTime}분</span>
                  </div>
                  <div className="flex items-center gap-1 text-muted-foreground">
                    <Eye className="h-4 w-4" />
                    <span>{selectedGuide.views}회 조회</span>
                  </div>
                  <div className="flex items-center gap-1 text-muted-foreground">
                    <Star className="h-4 w-4" />
                    <span>{selectedGuide.likes}명이 도움받음</span>
                  </div>
                </div>

                {selectedGuide.tags.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {selectedGuide.tags.map((tag, i) => (
                      <Badge key={i} variant="outline">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                )}

                {selectedGuide.videoUrl && (
                  <div className="bg-muted rounded-lg p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <Video className="h-5 w-5" />
                      <span className="font-medium">비디오 가이드</span>
                    </div>
                    <a 
                      href={selectedGuide.videoUrl} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-primary hover:underline"
                    >
                      {selectedGuide.videoUrl}
                    </a>
                  </div>
                )}

                <div className="prose prose-sm max-w-none">
                  <div className="whitespace-pre-wrap">{selectedGuide.content}</div>
                </div>

                <div className="flex items-center justify-between pt-6 border-t">
                  <div className="text-sm text-muted-foreground">
                    작성자: {selectedGuide.author} • 
                    작성일: {new Date(selectedGuide.createdAt).toLocaleDateString('ko-KR')}
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleLike(selectedGuide.id)}
                    >
                      <Star className="h-4 w-4 mr-2" />
                      도움이 됐어요
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                    >
                      <Share2 className="h-4 w-4 mr-2" />
                      공유
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}