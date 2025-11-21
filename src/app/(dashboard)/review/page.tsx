'use client'

import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Project } from '@/types'
import { useAuth } from '@/lib/auth-context'
import { database } from '@/lib/firebase'
import { ref, push, get, query, orderByChild, equalTo, onValue, off } from 'firebase/database'
import toast from 'react-hot-toast'
import { useRouter } from 'next/navigation'
import { getDatabase } from 'firebase/database'
import { app } from '@/lib/firebase'

interface Review {
  id: string
  projectId: string
  projectName: string
  userId: string
  userName: string
  rating: number
  review: string
  categories: {
    result: number
    timeline: number
    communication: number
    expertise: number
  }
  createdAt: string
}

export default function CustomerReviewPage() {
  const { user, userProfile } = useAuth()
  const router = useRouter()
  const [rating, setRating] = useState(0)
  const [hoverRating, setHoverRating] = useState(0)
  const [review, setReview] = useState('')
  const [submitted, setSubmitted] = useState(false)
  const [existingReview, setExistingReview] = useState<Review | null>(null)
  const [loading, setLoading] = useState(true)
  const [projects, setProjects] = useState<Project[]>([])
  const [selectedProject, setSelectedProject] = useState<Project | null>(null)
  const [categories, setCategories] = useState({
    result: 0,
    timeline: 0,
    communication: 0,
    expertise: 0
  })

  // 고객이 아닌 경우 대시보드로 리다이렉트
  useEffect(() => {
    if (!loading && userProfile && userProfile.role !== 'customer' && userProfile.role !== 'external') {
      router.push('/dashboard')
    }
  }, [userProfile, loading, router])

  // Firebase에서 프로젝트 데이터 로드
  useEffect(() => {
    if (!user || !userProfile) return

    const db = getDatabase(app)
    const projectsRef = ref(db, 'projects')
    
    const unsubscribe = onValue(projectsRef, (snapshot) => {
      const data = snapshot.val()
      if (data) {
        const projectsList = Object.entries(data).map(([id, project]: [string, any]) => ({
          ...project,
          id,
          startDate: new Date(project.startDate),
          endDate: new Date(project.endDate),
          createdAt: new Date(project.createdAt),
          updatedAt: new Date(project.updatedAt)
        }))
        
        // 고객은 자신의 프로젝트 또는 같은 그룹의 프로젝트를 볼 수 있음
        let filteredProjects = projectsList
        if (userProfile.role === 'customer' || userProfile.role === 'external') {
          filteredProjects = projectsList.filter(p => 
            p.clientId === user.uid ||
            (userProfile.group && p.clientGroup === userProfile.group)
          )
        }
        
        setProjects(filteredProjects)
        if (filteredProjects.length > 0 && !selectedProject) {
          setSelectedProject(filteredProjects[0])
        }
      } else {
        setProjects([])
      }
      setLoading(false)
    })

    return () => off(projectsRef)
  }, [user, userProfile])

  // 기존 리뷰 확인
  useEffect(() => {
    if (!user || !selectedProject) {
      setLoading(false)
      return
    }

    const reviewsRef = ref(database, 'reviews')
    const userProjectQuery = query(
      reviewsRef,
      orderByChild('userId'),
      equalTo(user.uid)
    )
    
    const unsubscribe = onValue(userProjectQuery, (snapshot) => {
      if (snapshot.exists()) {
        const reviews = Object.entries(snapshot.val()).map(([id, data]: [string, any]) => ({
          id,
          ...data
        }))
        
        // 현재 프로젝트의 리뷰 찾기
        const projectReview = reviews.find(r => r.projectId === selectedProject.id)
        if (projectReview) {
          setExistingReview(projectReview)
          setRating(projectReview.rating)
          setReview(projectReview.review)
          setCategories(projectReview.categories || {
            result: 0,
            timeline: 0,
            communication: 0,
            expertise: 0
          })
          setSubmitted(true)
        } else {
          setExistingReview(null)
          setSubmitted(false)
          // 리셋
          setRating(0)
          setReview('')
          setCategories({
            result: 0,
            timeline: 0,
            communication: 0,
            expertise: 0
          })
        }
      } else {
        setExistingReview(null)
        setSubmitted(false)
      }
      setLoading(false)
    })

    return () => unsubscribe()
  }, [user, selectedProject])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!selectedProject) {
      toast.error('프로젝트를 선택해주세요.')
      return
    }
    
    if (rating === 0) {
      toast.error('별점을 선택해주세요.')
      return
    }
    
    if (!review.trim()) {
      toast.error('리뷰 내용을 입력해주세요.')
      return
    }

    try {
      const reviewData = {
        projectId: selectedProject.id,
        projectName: selectedProject.name,
        userId: user!.uid,
        userName: userProfile?.displayName || user!.email || '익명',
        rating,
        review: review.trim(),
        categories,
        createdAt: new Date().toISOString(),
        status: selectedProject.status
      }

      const reviewsRef = ref(database, 'reviews')
      await push(reviewsRef, reviewData)
      
      // 활동 로그 추가
      const activitiesRef = ref(database, 'activities')
      await push(activitiesRef, {
        type: 'review',
        projectId: selectedProject.id,
        projectName: selectedProject.name,
        title: '프로젝트 리뷰 작성',
        description: `${rating}점 평가와 함께 리뷰를 작성했습니다.`,
        userId: user!.uid,
        userName: userProfile?.displayName || user!.email,
        timestamp: new Date().toISOString()
      })

      toast.success('리뷰가 제출되었습니다!')
      setSubmitted(true)
    } catch (error) {
      console.error('리뷰 제출 실패:', error)
      toast.error('리뷰 제출에 실패했습니다.')
    }
  }

  const handleCategoryRating = (category: keyof typeof categories, score: number) => {
    setCategories(prev => ({
      ...prev,
      [category]: score
    }))
  }

  if (!selectedProject) {
    return (
      <div className="p-6 text-center">
        <p className="text-gray-500">프로젝트를 선택해주세요.</p>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="p-6 text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
      </div>
    )
  }

  if (submitted && existingReview) {
    return (
      <div className="p-6">
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          className="text-center py-8"
        >
          <div className="text-6xl mb-4">✅</div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">리뷰가 제출되었습니다!</h2>
          <p className="text-gray-600 mb-6">소중한 의견 감사합니다.</p>
          
          <div className="bg-gray-50 rounded-lg p-6 mt-6 text-left max-w-2xl mx-auto">
            <h3 className="font-semibold text-gray-900 mb-3">내가 작성한 리뷰</h3>
            <div className="mb-4">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-sm text-gray-600">프로젝트:</span>
                <span className="font-medium">{existingReview.projectName}</span>
              </div>
              <div className="flex items-center gap-2 mb-3">
                <span className="text-sm text-gray-600">평점:</span>
                <div className="flex">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <span key={star} className="text-lg">
                      {star <= existingReview.rating ? '⭐' : '☆'}
                    </span>
                  ))}
                </div>
                <span className="text-sm text-gray-700">({existingReview.rating}점)</span>
              </div>
              <div className="border-t pt-3">
                <p className="text-gray-700 whitespace-pre-wrap">{existingReview.review}</p>
              </div>
              {existingReview.categories && (
                <div className="mt-4 pt-4 border-t">
                  <h4 className="text-sm font-medium text-gray-700 mb-2">세부 평가</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">프로젝트 결과물</span>
                      <div className="flex">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <span key={star} className="text-xs">
                            {star <= existingReview.categories.result ? '⭐' : '☆'}
                          </span>
                        ))}
                      </div>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">일정 준수</span>
                      <div className="flex">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <span key={star} className="text-xs">
                            {star <= existingReview.categories.timeline ? '⭐' : '☆'}
                          </span>
                        ))}
                      </div>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">소통 및 협업</span>
                      <div className="flex">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <span key={star} className="text-xs">
                            {star <= existingReview.categories.communication ? '⭐' : '☆'}
                          </span>
                        ))}
                      </div>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">전문성</span>
                      <div className="flex">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <span key={star} className="text-xs">
                            {star <= existingReview.categories.expertise ? '⭐' : '☆'}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              )}
              <div className="mt-4 text-xs text-gray-500">
                작성일: {new Date(existingReview.createdAt).toLocaleDateString('ko-KR')}
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    )
  }

  // 프로젝트가 완료되지 않은 경우
  if (selectedProject.status !== 'completed') {
    return (
      <div className="p-6 text-center">
        <div className="max-w-md mx-auto">
          <div className="text-5xl mb-4">🚧</div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">아직 리뷰를 작성할 수 없습니다</h2>
          <p className="text-gray-600 mb-4">
            프로젝트가 완료된 후에 리뷰를 작성할 수 있습니다.
          </p>
          <div className="bg-blue-50 rounded-lg p-4">
            <p className="text-sm text-blue-700">
              <strong>{selectedProject.name}</strong>
            </p>
            <p className="text-xs text-blue-600 mt-1">
              현재 상태: {
                selectedProject.status === 'planning' && '기획 중'
              }{
                selectedProject.status === 'design' && '디자인 중'
              }{
                selectedProject.status === 'development' && '개발 중'
              }{
                selectedProject.status === 'testing' && '테스트 중'
              }
            </p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="p-6">
      <h2 className="text-xl font-semibold text-gray-900 mb-2">프로젝트 리뷰</h2>
      <p className="text-sm text-gray-600 mb-6">
        <strong>{selectedProject.name}</strong> 프로젝트에 대한 평가와 의견을 남겨주세요
      </p>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* 별점 */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            전반적인 만족도
          </label>
          <div className="flex gap-2">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                type="button"
                onClick={() => setRating(star)}
                onMouseEnter={() => setHoverRating(star)}
                onMouseLeave={() => setHoverRating(0)}
                className="text-3xl transition-colors"
              >
                {star <= (hoverRating || rating) ? '⭐' : '☆'}
              </button>
            ))}
          </div>
          <p className="text-sm text-gray-500 mt-1">
            {rating > 0 && `${rating}점을 선택하셨습니다.`}
          </p>
        </div>

        {/* 리뷰 내용 */}
        <div>
          <label htmlFor="review" className="block text-sm font-medium text-gray-700 mb-2">
            상세 리뷰
          </label>
          <textarea
            id="review"
            value={review}
            onChange={(e) => setReview(e.target.value)}
            rows={6}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
            placeholder="프로젝트 진행 과정, 결과물, 소통 등에 대한 의견을 자유롭게 작성해주세요."
          />
        </div>

        {/* 카테고리별 평가 */}
        <div className="space-y-4">
          <h3 className="text-sm font-medium text-gray-700">세부 평가</h3>
          {[
            { label: '프로젝트 결과물', id: 'result' as const },
            { label: '일정 준수', id: 'timeline' as const },
            { label: '소통 및 협업', id: 'communication' as const },
            { label: '전문성', id: 'expertise' as const },
          ].map((item) => (
            <div key={item.id} className="flex items-center justify-between">
              <span className="text-sm text-gray-600">{item.label}</span>
              <div className="flex gap-1">
                {[1, 2, 3, 4, 5].map((score) => (
                  <button
                    key={score}
                    type="button"
                    onClick={() => handleCategoryRating(item.id, score)}
                    className={`text-lg transition-colors ${
                      score <= categories[item.id] ? 'text-yellow-500' : 'text-gray-300'
                    } hover:text-yellow-500`}
                  >
                    ⭐
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* 제출 버튼 */}
        <div className="flex justify-end gap-3 pt-4">
          <button
            type="submit"
            className="px-6 py-2 bg-primary text-white rounded-lg hover:bg-primary-hover transition-colors"
          >
            리뷰 제출
          </button>
        </div>
      </form>
    </div>
  )
}