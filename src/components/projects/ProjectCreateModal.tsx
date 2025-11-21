'use client'

import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Project } from '@/types'

interface ProjectCreateModalProps {
  isOpen: boolean
  onClose: () => void
  onSubmit: (project: Omit<Project, 'id' | 'createdAt' | 'updatedAt'>) => void
}

// 서비스 패키지 데이터 (결제 상품 연동용)
const servicePackages = [
  {
    id: 'basic-web',
    name: '기본 웹사이트',
    description: '5페이지 이하의 기본 웹사이트 제작',
    duration: '4-6주',
    price: 3000000,
    features: ['반응형 디자인', '기본 SEO', '연락처 폼', '1년 유지보수']
  },
  {
    id: 'premium-web',
    name: '프리미엄 웹사이트',
    description: '10페이지 이하의 고급 웹사이트 제작',
    duration: '6-8주',
    price: 5000000,
    features: ['고급 반응형 디자인', '고급 SEO', 'CMS 연동', '소셜 미디어 연동', '2년 유지보수']
  },
  {
    id: 'ecommerce',
    name: '이커머스 플랫폼',
    description: '온라인 쇼핑몰 구축',
    duration: '8-12주',
    price: 8000000,
    features: ['상품 관리', '결제 시스템', '주문 관리', '재고 관리', '고객 관리', '3년 유지보수']
  },
  {
    id: 'mobile-app',
    name: '모바일 앱',
    description: 'iOS/Android 앱 개발',
    duration: '10-16주',
    price: 12000000,
    features: ['크로스 플랫폼', 'API 연동', '푸시 알림', '앱스토어 배포', '1년 유지보수']
  },
  {
    id: 'custom',
    name: '맞춤 개발',
    description: '고객 요구사항에 맞는 맞춤 개발',
    duration: '협의',
    price: 0,
    features: ['요구사항 분석', '맞춤 설계', '유연한 개발', '전담 PM']
  }
]

export default function ProjectCreateModal({ isOpen, onClose, onSubmit }: ProjectCreateModalProps) {
  const [step, setStep] = useState(1)
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    clientId: '',
    clientName: '',
    clientEmail: '',
    clientPhone: '',
    servicePackage: '',
    budget: 0,
    startDate: '',
    endDate: '',
    requirements: '',
    team: [] as string[],
    status: 'planning' as Project['status']
  })

  const [errors, setErrors] = useState<Record<string, string>>({})

  const validateStep = (currentStep: number): boolean => {
    const newErrors: Record<string, string> = {}

    if (currentStep === 1) {
      if (!formData.name.trim()) newErrors.name = '프로젝트명을 입력해주세요'
      if (!formData.description.trim()) newErrors.description = '프로젝트 설명을 입력해주세요'
      if (!formData.servicePackage) newErrors.servicePackage = '서비스 패키지를 선택해주세요'
    }

    if (currentStep === 2) {
      if (!formData.clientName.trim()) newErrors.clientName = '고객명을 입력해주세요'
      if (!formData.clientEmail.trim()) newErrors.clientEmail = '이메일을 입력해주세요'
      if (!formData.clientPhone.trim()) newErrors.clientPhone = '연락처를 입력해주세요'
      if (!/\S+@\S+\.\S+/.test(formData.clientEmail)) newErrors.clientEmail = '올바른 이메일을 입력해주세요'
    }

    if (currentStep === 3) {
      if (!formData.startDate) newErrors.startDate = '시작일을 선택해주세요'
      if (!formData.endDate) newErrors.endDate = '종료일을 선택해주세요'
      if (formData.budget <= 0 && formData.servicePackage !== 'custom') {
        newErrors.budget = '예산을 입력해주세요'
      }
      if (new Date(formData.startDate) >= new Date(formData.endDate)) {
        newErrors.endDate = '종료일은 시작일보다 늦어야 합니다'
      }
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleNext = () => {
    if (validateStep(step)) {
      setStep(step + 1)
    }
  }

  const handleSubmit = () => {
    if (validateStep(step)) {
      const selectedPackage = servicePackages.find(pkg => pkg.id === formData.servicePackage)
      
      const projectData: Omit<Project, 'id' | 'createdAt' | 'updatedAt'> = {
        name: formData.name,
        description: formData.description,
        clientId: formData.clientId || Date.now().toString(),
        status: formData.status,
        progress: 0,
        startDate: new Date(formData.startDate),
        endDate: new Date(formData.endDate),
        team: formData.team.map(memberId => ({ 
          userId: memberId, 
          name: memberId, 
          role: 'Developer',
          joinedAt: new Date()
        })),
        budget: formData.servicePackage === 'custom' ? formData.budget : (selectedPackage?.price || 0),
        priority: 'medium',
        createdBy: 'current-user',
        visibility: 'private',
        permissions: {
          viewerIds: [],
          editorIds: [],
          adminIds: []
        }
      }

      onSubmit(projectData)
      handleClose()
    }
  }

  const handleClose = () => {
    setStep(1)
    setFormData({
      name: '',
      description: '',
      clientId: '',
      clientName: '',
      clientEmail: '',
      clientPhone: '',
      servicePackage: '',
      budget: 0,
      startDate: '',
      endDate: '',
      requirements: '',
      team: [],
      status: 'planning'
    })
    setErrors({})
    onClose()
  }

  const selectedPackage = servicePackages.find(pkg => pkg.id === formData.servicePackage)

  if (!isOpen) return null

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
        onClick={handleClose}
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          className="bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto"
          onClick={(e) => e.stopPropagation()}
        >
          {/* 헤더 */}
          <div className="p-6 border-b">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold">새 프로젝트 생성</h2>
              <button
                onClick={handleClose}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                ✕
              </button>
            </div>
            
            {/* 진행 단계 */}
            <div className="flex items-center mt-4">
              {[1, 2, 3].map((stepNum) => (
                <React.Fragment key={stepNum}>
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                    stepNum <= step ? 'bg-primary text-white' : 'bg-gray-200 text-gray-600'
                  }`}>
                    {stepNum}
                  </div>
                  {stepNum < 3 && (
                    <div className={`flex-1 h-1 mx-2 ${
                      stepNum < step ? 'bg-primary' : 'bg-gray-200'
                    }`} />
                  )}
                </React.Fragment>
              ))}
            </div>
            
            <div className="mt-2 text-sm text-gray-600">
              {step === 1 && '프로젝트 기본 정보'}
              {step === 2 && '고객 정보'}
              {step === 3 && '일정 및 예산'}
            </div>
          </div>

          {/* 내용 */}
          <div className="p-6">
            {/* Step 1: 프로젝트 기본 정보 */}
            {step === 1 && (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    프로젝트명 *
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    className="w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                    placeholder="예: 회사 홈페이지 리뉴얼"
                  />
                  {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    프로젝트 설명 *
                  </label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData({...formData, description: e.target.value})}
                    rows={3}
                    className="w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                    placeholder="프로젝트에 대한 간단한 설명을 입력해주세요"
                  />
                  {errors.description && <p className="text-red-500 text-sm mt-1">{errors.description}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    서비스 패키지 *
                  </label>
                  <div className="grid grid-cols-1 gap-3">
                    {servicePackages.map((pkg) => (
                      <div
                        key={pkg.id}
                        className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                          formData.servicePackage === pkg.id
                            ? 'border-primary bg-blue-50'
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                        onClick={() => setFormData({...formData, servicePackage: pkg.id, budget: pkg.price})}
                      >
                        <div className="flex justify-between items-start">
                          <div className="flex-1">
                            <h4 className="font-medium text-gray-900">{pkg.name}</h4>
                            <p className="text-sm text-gray-600 mt-1">{pkg.description}</p>
                            <div className="flex items-center gap-4 mt-2 text-xs text-gray-500">
                              <span>⏱️ {pkg.duration}</span>
                              {pkg.price > 0 && (
                                <span>💰 {pkg.price.toLocaleString()}원</span>
                              )}
                            </div>
                          </div>
                          <div className={`w-5 h-5 rounded-full border-2 ${
                            formData.servicePackage === pkg.id
                              ? 'border-primary bg-primary'
                              : 'border-gray-300'
                          }`}>
                            {formData.servicePackage === pkg.id && (
                              <div className="w-full h-full rounded-full bg-white scale-50"></div>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                  {errors.servicePackage && <p className="text-red-500 text-sm mt-1">{errors.servicePackage}</p>}
                </div>
              </div>
            )}

            {/* Step 2: 고객 정보 */}
            {step === 2 && (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    고객명 *
                  </label>
                  <input
                    type="text"
                    value={formData.clientName}
                    onChange={(e) => setFormData({...formData, clientName: e.target.value})}
                    className="w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                    placeholder="고객 이름을 입력해주세요"
                  />
                  {errors.clientName && <p className="text-red-500 text-sm mt-1">{errors.clientName}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    이메일 *
                  </label>
                  <input
                    type="email"
                    value={formData.clientEmail}
                    onChange={(e) => setFormData({...formData, clientEmail: e.target.value})}
                    className="w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                    placeholder="customer@example.com"
                  />
                  {errors.clientEmail && <p className="text-red-500 text-sm mt-1">{errors.clientEmail}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    연락처 *
                  </label>
                  <input
                    type="tel"
                    value={formData.clientPhone}
                    onChange={(e) => setFormData({...formData, clientPhone: e.target.value})}
                    className="w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                    placeholder="010-0000-0000"
                  />
                  {errors.clientPhone && <p className="text-red-500 text-sm mt-1">{errors.clientPhone}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    추가 요구사항
                  </label>
                  <textarea
                    value={formData.requirements}
                    onChange={(e) => setFormData({...formData, requirements: e.target.value})}
                    rows={4}
                    className="w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                    placeholder="특별한 요구사항이나 참고사항을 입력해주세요"
                  />
                </div>
              </div>
            )}

            {/* Step 3: 일정 및 예산 */}
            {step === 3 && (
              <div className="space-y-4">
                {selectedPackage && (
                  <div className="p-4 bg-blue-50 rounded-lg mb-4">
                    <h4 className="font-medium text-gray-900 mb-2">선택된 서비스</h4>
                    <p className="text-sm text-gray-600">{selectedPackage.name}</p>
                    <div className="mt-2">
                      <span className="text-sm text-gray-500">예상 기간: {selectedPackage.duration}</span>
                      {selectedPackage.price > 0 && (
                        <span className="ml-4 text-sm text-gray-500">
                          예산: {selectedPackage.price.toLocaleString()}원
                        </span>
                      )}
                    </div>
                  </div>
                )}

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      프로젝트 시작일 *
                    </label>
                    <input
                      type="date"
                      value={formData.startDate}
                      onChange={(e) => setFormData({...formData, startDate: e.target.value})}
                      className="w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                    {errors.startDate && <p className="text-red-500 text-sm mt-1">{errors.startDate}</p>}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      목표 완료일 *
                    </label>
                    <input
                      type="date"
                      value={formData.endDate}
                      onChange={(e) => setFormData({...formData, endDate: e.target.value})}
                      className="w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                    {errors.endDate && <p className="text-red-500 text-sm mt-1">{errors.endDate}</p>}
                  </div>
                </div>

                {formData.servicePackage === 'custom' && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      예산 *
                    </label>
                    <input
                      type="number"
                      value={formData.budget}
                      onChange={(e) => setFormData({...formData, budget: parseInt(e.target.value)})}
                      className="w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                      placeholder="프로젝트 예산을 입력해주세요"
                    />
                    {errors.budget && <p className="text-red-500 text-sm mt-1">{errors.budget}</p>}
                  </div>
                )}

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    프로젝트 상태
                  </label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({...formData, status: e.target.value as Project['status']})}
                    className="w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                  >
                    <option value="planning">기획</option>
                    <option value="design">디자인</option>
                    <option value="development">개발</option>
                    <option value="testing">테스트</option>
                  </select>
                </div>
              </div>
            )}
          </div>

          {/* 푸터 */}
          <div className="p-6 border-t flex justify-between">
            <div>
              {step > 1 && (
                <button
                  onClick={() => setStep(step - 1)}
                  className="btn btn-secondary"
                >
                  이전
                </button>
              )}
            </div>
            
            <div className="flex gap-3">
              <button
                onClick={handleClose}
                className="btn btn-secondary"
              >
                취소
              </button>
              
              {step < 3 ? (
                <button
                  onClick={handleNext}
                  className="btn btn-primary"
                >
                  다음
                </button>
              ) : (
                <button
                  onClick={handleSubmit}
                  className="btn btn-primary"
                >
                  프로젝트 생성
                </button>
              )}
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}