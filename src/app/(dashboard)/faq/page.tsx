'use client'

import React, { useState, useEffect } from 'react'
import { useAuth } from '@/lib/auth-context'
import { getDatabase, ref, onValue, off, push, update, remove } from 'firebase/database'
import { app } from '@/lib/firebase'
import { motion, AnimatePresence } from 'framer-motion'
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
  HelpCircle, Plus, Search, ChevronDown, ChevronUp, 
  Edit2, Trash2, BookOpen, MessageCircle, Lightbulb,
  FileQuestion, Shield, CreditCard, Loader2
} from 'lucide-react'

interface FAQ {
  id: string
  question: string
  answer: string
  category: string
  tags: string[]
  views: number
  helpful: number
  notHelpful: number
  createdAt: string
  updatedAt: string
  createdBy: string
  isPublished: boolean
  order: number
}

const categoryIcons = {
  general: HelpCircle,
  technical: FileQuestion,
  billing: CreditCard,
  security: Shield,
  features: Lightbulb,
  support: MessageCircle
}

const categoryLabels = {
  general: '일반',
  technical: '기술',
  billing: '결제',
  security: '보안',
  features: '기능',
  support: '지원'
}

export default function FAQPage() {
  const { user, userProfile } = useAuth()
  const [faqs, setFaqs] = useState<FAQ[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState<string>('all')
  const [expandedItems, setExpandedItems] = useState<Set<string>>(new Set())
  const [showModal, setShowModal] = useState(false)
  const [editingFAQ, setEditingFAQ] = useState<FAQ | null>(null)
  
  const [formData, setFormData] = useState({
    question: '',
    answer: '',
    category: 'general',
    tags: '',
    isPublished: true
  })

  useEffect(() => {
    const db = getDatabase(app)
    const faqsRef = ref(db, 'faqs')
    
    const unsubscribe = onValue(faqsRef, (snapshot) => {
      const data = snapshot.val()
      if (data) {
        const faqsList = Object.entries(data).map(([id, faq]: [string, any]) => ({
          id,
          ...faq,
          tags: faq.tags || [],
          views: faq.views || 0,
          helpful: faq.helpful || 0,
          notHelpful: faq.notHelpful || 0,
          order: faq.order || 0
        }))
        
        // 관리자가 아닌 경우 게시된 FAQ만 표시
        const filteredFaqs = userProfile?.role === 'admin' 
          ? faqsList 
          : faqsList.filter(f => f.isPublished)
        
        setFaqs(filteredFaqs.sort((a, b) => a.order - b.order))
      } else {
        setFaqs([])
      }
      setLoading(false)
    })

    return () => off(faqsRef)
  }, [userProfile])

  const filteredFAQs = faqs.filter(faq => {
    const matchesSearch = 
      faq.question.toLowerCase().includes(searchTerm.toLowerCase()) ||
      faq.answer.toLowerCase().includes(searchTerm.toLowerCase()) ||
      faq.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()))
    
    const matchesCategory = selectedCategory === 'all' || faq.category === selectedCategory
    
    return matchesSearch && matchesCategory
  })

  const toggleExpanded = (faqId: string) => {
    const newExpanded = new Set(expandedItems)
    if (newExpanded.has(faqId)) {
      newExpanded.delete(faqId)
    } else {
      newExpanded.add(faqId)
      // 조회수 증가
      incrementViews(faqId)
    }
    setExpandedItems(newExpanded)
  }

  const incrementViews = async (faqId: string) => {
    const db = getDatabase(app)
    const faq = faqs.find(f => f.id === faqId)
    if (faq) {
      await update(ref(db, `faqs/${faqId}`), {
        views: (faq.views || 0) + 1
      })
    }
  }

  const handleHelpful = async (faqId: string, isHelpful: boolean) => {
    const db = getDatabase(app)
    const faq = faqs.find(f => f.id === faqId)
    if (faq) {
      const field = isHelpful ? 'helpful' : 'notHelpful'
      await update(ref(db, `faqs/${faqId}`), {
        [field]: (faq[field] || 0) + 1
      })
      toast.success('피드백을 남겨주셔서 감사합니다!')
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    try {
      const db = getDatabase(app)
      const faqData = {
        question: formData.question,
        answer: formData.answer,
        category: formData.category,
        tags: formData.tags.split(',').map(tag => tag.trim()).filter(tag => tag),
        isPublished: formData.isPublished,
        createdBy: user!.uid,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        order: editingFAQ?.order || faqs.length
      }
      
      if (editingFAQ) {
        await update(ref(db, `faqs/${editingFAQ.id}`), {
          ...faqData,
          createdAt: editingFAQ.createdAt
        })
        toast.success('FAQ가 수정되었습니다.')
      } else {
        await push(ref(db, 'faqs'), faqData)
        toast.success('FAQ가 추가되었습니다.')
      }
      
      handleCloseModal()
    } catch (error) {
      console.error('Error saving FAQ:', error)
      toast.error('FAQ 저장 중 오류가 발생했습니다.')
    }
  }

  const handleDelete = async (faqId: string) => {
    if (!confirm('정말 이 FAQ를 삭제하시겠습니까?')) return
    
    try {
      const db = getDatabase(app)
      await remove(ref(db, `faqs/${faqId}`))
      toast.success('FAQ가 삭제되었습니다.')
    } catch (error) {
      console.error('Error deleting FAQ:', error)
      toast.error('FAQ 삭제 중 오류가 발생했습니다.')
    }
  }

  const handleCloseModal = () => {
    setShowModal(false)
    setEditingFAQ(null)
    setFormData({
      question: '',
      answer: '',
      category: 'general',
      tags: '',
      isPublished: true
    })
  }

  const handleEdit = (faq: FAQ) => {
    setEditingFAQ(faq)
    setFormData({
      question: faq.question,
      answer: faq.answer,
      category: faq.category,
      tags: faq.tags.join(', '),
      isPublished: faq.isPublished
    })
    setShowModal(true)
  }

  const getCategoryCount = (category: string) => {
    return faqs.filter(f => f.category === category).length
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin text-primary mx-auto" />
          <p className="mt-4 text-muted-foreground">FAQ를 불러오는 중...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="w-full max-w-[1920px] mx-auto px-6 py-6 space-y-6">
      {/* 헤더 */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">자주 묻는 질문</h1>
          <p className="text-muted-foreground mt-1">궁금한 점을 빠르게 해결하세요</p>
        </div>
        
        {userProfile?.role === 'admin' && (
          <Button onClick={() => setShowModal(true)}>
            <Plus className="mr-2 h-4 w-4" />
            FAQ 추가
          </Button>
        )}
      </div>

      {/* 카테고리 카드 */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {Object.entries(categoryLabels).map(([key, label]) => {
          const Icon = categoryIcons[key as keyof typeof categoryIcons]
          const count = getCategoryCount(key)
          
          return (
            <Card 
              key={key}
              className={`cursor-pointer transition-all hover:shadow-md ${
                selectedCategory === key ? 'ring-2 ring-primary' : ''
              }`}
              onClick={() => setSelectedCategory(key)}
            >
              <CardContent className="p-4 text-center">
                <Icon className="h-8 w-8 mx-auto mb-2 text-primary" />
                <h3 className="font-medium">{label}</h3>
                <p className="text-sm text-muted-foreground">{count}개</p>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {/* 검색 및 필터 */}
      <div className="flex gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="질문 검색..."
            className="pl-10"
          />
        </div>
        
        <Button
          variant="outline"
          onClick={() => setSelectedCategory('all')}
          className={selectedCategory === 'all' ? 'ring-2 ring-primary' : ''}
        >
          전체 보기
        </Button>
      </div>

      {/* FAQ 목록 */}
      {filteredFAQs.length === 0 ? (
        <Card>
          <CardContent className="p-12 text-center">
            <BookOpen className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
            <h3 className="text-lg font-medium mb-2">FAQ가 없습니다</h3>
            <p className="text-muted-foreground">
              {searchTerm || selectedCategory !== 'all'
                ? '다른 검색어나 카테고리를 시도해보세요.'
                : '아직 등록된 FAQ가 없습니다.'}
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          <AnimatePresence>
            {filteredFAQs.map((faq, index) => {
              const Icon = categoryIcons[faq.category as keyof typeof categoryIcons]
              const isExpanded = expandedItems.has(faq.id)
              
              return (
                <motion.div
                  key={faq.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ delay: index * 0.05 }}
                >
                  <Card>
                    <CardContent className="p-0">
                      <div
                        className="p-6 cursor-pointer"
                        onClick={() => toggleExpanded(faq.id)}
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1 pr-4">
                            <div className="flex items-center gap-3 mb-2">
                              <Icon className="h-5 w-5 text-primary" />
                              <h3 className="font-semibold">{faq.question}</h3>
                              {!faq.isPublished && userProfile?.role === 'admin' && (
                                <Badge variant="outline">미게시</Badge>
                              )}
                            </div>
                            {faq.tags.length > 0 && (
                              <div className="flex flex-wrap gap-2 mt-2">
                                {faq.tags.map((tag, i) => (
                                  <Badge key={i} variant="secondary" className="text-xs">
                                    {tag}
                                  </Badge>
                                ))}
                              </div>
                            )}
                          </div>
                          <div className="flex items-center gap-2">
                            {userProfile?.role === 'admin' && (
                              <div className="flex gap-1" onClick={(e) => e.stopPropagation()}>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  onClick={() => handleEdit(faq)}
                                >
                                  <Edit2 className="h-4 w-4" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  onClick={() => handleDelete(faq.id)}
                                  className="text-destructive hover:text-destructive"
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </div>
                            )}
                            {isExpanded ? (
                              <ChevronUp className="h-5 w-5 text-muted-foreground" />
                            ) : (
                              <ChevronDown className="h-5 w-5 text-muted-foreground" />
                            )}
                          </div>
                        </div>
                      </div>
                      
                      <AnimatePresence>
                        {isExpanded && (
                          <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            transition={{ duration: 0.2 }}
                            className="overflow-hidden"
                          >
                            <div className="px-6 pb-6 border-t">
                              <div className="pt-4">
                                <p className="text-muted-foreground whitespace-pre-wrap">{faq.answer}</p>
                              </div>
                              
                              <div className="flex items-center justify-between mt-6">
                                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                                  <span>조회수: {faq.views}</span>
                                  <span>도움됨: {faq.helpful}</span>
                                </div>
                                
                                <div className="flex items-center gap-2">
                                  <span className="text-sm text-muted-foreground">이 답변이 도움이 되셨나요?</span>
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={(e) => {
                                      e.stopPropagation()
                                      handleHelpful(faq.id, true)
                                    }}
                                  >
                                    👍 네
                                  </Button>
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={(e) => {
                                      e.stopPropagation()
                                      handleHelpful(faq.id, false)
                                    }}
                                  >
                                    👎 아니오
                                  </Button>
                                </div>
                              </div>
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </CardContent>
                  </Card>
                </motion.div>
              )
            })}
          </AnimatePresence>
        </div>
      )}

      {/* FAQ 추가/수정 모달 */}
      <Dialog open={showModal} onOpenChange={setShowModal}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>{editingFAQ ? 'FAQ 수정' : 'FAQ 추가'}</DialogTitle>
          </DialogHeader>

          <form onSubmit={handleSubmit}>
            <div className="space-y-4">
              <div>
                <Label htmlFor="question">질문 *</Label>
                <Input
                  id="question"
                  value={formData.question}
                  onChange={(e) => setFormData({ ...formData, question: e.target.value })}
                  required
                />
              </div>

              <div>
                <Label htmlFor="answer">답변 *</Label>
                <Textarea
                  id="answer"
                  value={formData.answer}
                  onChange={(e) => setFormData({ ...formData, answer: e.target.value })}
                  rows={6}
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
                  <Label htmlFor="tags">태그 (쉼표로 구분)</Label>
                  <Input
                    id="tags"
                    value={formData.tags}
                    onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
                    placeholder="예: 결제, 환불, 카드"
                  />
                </div>
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
                {editingFAQ ? '수정' : '추가'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}