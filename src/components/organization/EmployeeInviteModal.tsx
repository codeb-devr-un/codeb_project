'use client'

import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Mail, User, Briefcase, Calendar, Shield, Copy, Check } from 'lucide-react'
import { useAuth } from '@/lib/auth-context'
import employeeInvitationService from '@/services/employee-invitation-service'
import { EmployeeInvitation, EmployeePermissions, ROLE_PERMISSION_TEMPLATES } from '@/types/employee'
import { Department } from '@/types/organization'

interface EmployeeInviteModalProps {
  isOpen: boolean
  onClose: () => void
  onSuccess?: (invitation: EmployeeInvitation) => void
  organizationId: string
  organizationName: string
  departments?: Department[]
}

const ROLE_LABELS: Record<EmployeeInvitation['targetRole'], string> = {
  admin: '관리자',
  manager: '매니저',
  developer: '개발자',
  designer: '디자이너',
  support: '지원',
  qa: 'QA',
}

const EMPLOYMENT_TYPE_LABELS = {
  'full-time': '정규직',
  'part-time': '계약직',
  'contractor': '프리랜서',
  'intern': '인턴',
}

export default function EmployeeInviteModal({
  isOpen,
  onClose,
  onSuccess,
  organizationId,
  organizationName,
  departments = [],
}: EmployeeInviteModalProps) {
  const { userProfile } = useAuth()
  const [step, setStep] = useState(1)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [generatedInvite, setGeneratedInvite] = useState<EmployeeInvitation | null>(null)
  const [copied, setCopied] = useState(false)

  const [formData, setFormData] = useState({
    email: '',
    targetRole: 'developer' as EmployeeInvitation['targetRole'],
    department: '',
    position: '',
    employmentType: 'full-time' as EmployeeInvitation['employmentType'],
    startDate: '',
    message: '',
    expiresInDays: 7,
  })

  const [permissions, setPermissions] = useState<EmployeePermissions>(
    ROLE_PERMISSION_TEMPLATES.developer as EmployeePermissions
  )

  useEffect(() => {
    if (isOpen) {
      setStep(1)
      setError(null)
      setGeneratedInvite(null)
      setCopied(false)
    }
  }, [isOpen])

  // 역할 변경 시 권한 자동 설정
  useEffect(() => {
    const rolePermissions = ROLE_PERMISSION_TEMPLATES[formData.targetRole]
    setPermissions(prev => ({ ...prev, ...rolePermissions }))
  }, [formData.targetRole])

  const handleSubmit = async () => {
    if (!userProfile) return

    // 유효성 검사
    if (!formData.email) {
      setError('이메일을 입력해주세요.')
      return
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(formData.email)) {
      setError('올바른 이메일 형식이 아닙니다.')
      return
    }

    setLoading(true)
    setError(null)

    try {
      // 중복 확인
      const existing = await employeeInvitationService.getInvitationByEmail(
        formData.email,
        organizationId
      )

      if (existing) {
        setError('이미 초대된 이메일입니다.')
        setLoading(false)
        return
      }

      const selectedDept = departments.find(d => d.id === formData.department)

      const invitation = await employeeInvitationService.createInvitation(
        organizationId,
        organizationName,
        userProfile.uid,
        userProfile.displayName || userProfile.email,
        {
          email: formData.email,
          targetRole: formData.targetRole,
          department: formData.department || undefined,
          departmentName: selectedDept?.name,
          position: formData.position || undefined,
          employmentType: formData.employmentType,
          startDate: formData.startDate ? new Date(formData.startDate) : undefined,
          message: formData.message || undefined,
          customPermissions: permissions,
          expiresInDays: formData.expiresInDays,
        }
      )

      setGeneratedInvite(invitation)
      setStep(3)
      onSuccess?.(invitation)
    } catch (err: any) {
      console.error('Failed to create invitation:', err)
      setError(err.message || '초대 생성에 실패했습니다.')
    } finally {
      setLoading(false)
    }
  }

  const copyInviteLink = () => {
    if (!generatedInvite) return
    const url = employeeInvitationService.getInvitationUrl(generatedInvite.inviteCode)
    navigator.clipboard.writeText(url)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const handleClose = () => {
    setFormData({
      email: '',
      targetRole: 'developer',
      department: '',
      position: '',
      employmentType: 'full-time',
      startDate: '',
      message: '',
      expiresInDays: 7,
    })
    setStep(1)
    setGeneratedInvite(null)
    onClose()
  }

  if (!isOpen) return null

  return (
    <AnimatePresence>
      <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
        >
          {/* 헤더 */}
          <div className="sticky top-0 bg-white border-b px-6 py-4 flex items-center justify-between z-10">
            <div>
              <h2 className="text-xl font-semibold">직원 초대</h2>
              <p className="text-sm text-gray-600 mt-1">
                {step === 1 && '기본 정보를 입력하세요'}
                {step === 2 && '권한을 설정하세요'}
                {step === 3 && '초대가 생성되었습니다'}
              </p>
            </div>
            <button
              onClick={handleClose}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* 진행 표시 */}
          <div className="px-6 py-4">
            <div className="flex items-center gap-2">
              {[1, 2, 3].map((s) => (
                <React.Fragment key={s}>
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                      s === step
                        ? 'bg-primary text-white'
                        : s < step
                        ? 'bg-green-500 text-white'
                        : 'bg-gray-200 text-gray-600'
                    }`}
                  >
                    {s < step ? <Check className="w-4 h-4" /> : s}
                  </div>
                  {s < 3 && (
                    <div
                      className={`flex-1 h-1 ${
                        s < step ? 'bg-green-500' : 'bg-gray-200'
                      }`}
                    />
                  )}
                </React.Fragment>
              ))}
            </div>
          </div>

          {/* 콘텐츠 */}
          <div className="px-6 pb-6">
            {/* Step 1: 기본 정보 */}
            {step === 1 && (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className="space-y-4"
              >
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    <Mail className="w-4 h-4 inline mr-1" />
                    이메일 주소 *
                  </label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                    placeholder="colleague@company.com"
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      <Shield className="w-4 h-4 inline mr-1" />
                      역할 *
                    </label>
                    <select
                      value={formData.targetRole}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          targetRole: e.target.value as EmployeeInvitation['targetRole'],
                        })
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary"
                    >
                      {Object.entries(ROLE_LABELS).map(([value, label]) => (
                        <option key={value} value={value}>
                          {label}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      <Briefcase className="w-4 h-4 inline mr-1" />
                      고용 형태
                    </label>
                    <select
                      value={formData.employmentType}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          employmentType: e.target.value as EmployeeInvitation['employmentType'],
                        })
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary"
                    >
                      {Object.entries(EMPLOYMENT_TYPE_LABELS).map(([value, label]) => (
                        <option key={value} value={value}>
                          {label}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {departments.length > 0 && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      부서
                    </label>
                    <select
                      value={formData.department}
                      onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary"
                    >
                      <option value="">선택 안함</option>
                      {departments.map((dept) => (
                        <option key={dept.id} value={dept.id}>
                          {dept.name}
                        </option>
                      ))}
                    </select>
                  </div>
                )}

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    <User className="w-4 h-4 inline mr-1" />
                    직책
                  </label>
                  <input
                    type="text"
                    value={formData.position}
                    onChange={(e) => setFormData({ ...formData, position: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary"
                    placeholder="예: Senior Developer, Lead Designer"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      <Calendar className="w-4 h-4 inline mr-1" />
                      입사 예정일
                    </label>
                    <input
                      type="date"
                      value={formData.startDate}
                      onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      초대 유효 기간
                    </label>
                    <select
                      value={formData.expiresInDays}
                      onChange={(e) =>
                        setFormData({ ...formData, expiresInDays: Number(e.target.value) })
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary"
                    >
                      <option value={1}>1일</option>
                      <option value={3}>3일</option>
                      <option value={7}>7일</option>
                      <option value={14}>14일</option>
                      <option value={30}>30일</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    초대 메시지
                  </label>
                  <textarea
                    value={formData.message}
                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary resize-none"
                    placeholder="환영 메시지를 입력하세요..."
                  />
                </div>

                {error && (
                  <div className="p-3 bg-red-50 text-red-700 text-sm rounded-lg">
                    {error}
                  </div>
                )}

                <div className="flex gap-3 pt-4">
                  <button
                    onClick={handleClose}
                    className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    취소
                  </button>
                  <button
                    onClick={() => {
                      if (!formData.email) {
                        setError('이메일을 입력해주세요.')
                        return
                      }
                      setError(null)
                      setStep(2)
                    }}
                    className="flex-1 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-hover transition-colors"
                  >
                    다음
                  </button>
                </div>
              </motion.div>
            )}

            {/* Step 2: 권한 설정 */}
            {step === 2 && (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className="space-y-4"
              >
                <div className="bg-blue-50 p-4 rounded-lg">
                  <p className="text-sm text-blue-800">
                    <strong>{ROLE_LABELS[formData.targetRole]}</strong> 역할의 기본 권한이
                    설정되었습니다. 필요한 경우 아래에서 수정할 수 있습니다.
                  </p>
                </div>

                <div className="space-y-3 max-h-96 overflow-y-auto">
                  <h3 className="font-medium text-gray-900 sticky top-0 bg-white py-2">
                    프로젝트 권한
                  </h3>
                  {[
                    { key: 'canCreateProject', label: '프로젝트 생성' },
                    { key: 'canDeleteProject', label: '프로젝트 삭제' },
                    { key: 'canViewAllProjects', label: '모든 프로젝트 보기' },
                    { key: 'canManageProjectMembers', label: '프로젝트 멤버 관리' },
                  ].map(({ key, label }) => (
                    <label key={key} className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={permissions[key as keyof EmployeePermissions] as boolean}
                        onChange={(e) =>
                          setPermissions({ ...permissions, [key]: e.target.checked })
                        }
                        className="w-4 h-4 text-primary focus:ring-primary border-gray-300 rounded"
                      />
                      <span className="text-sm">{label}</span>
                    </label>
                  ))}

                  <h3 className="font-medium text-gray-900 sticky top-0 bg-white py-2 pt-4">
                    팀원 관리 권한
                  </h3>
                  {[
                    { key: 'canInviteMembers', label: '멤버 초대' },
                    { key: 'canRemoveMembers', label: '멤버 제거' },
                    { key: 'canManageRoles', label: '역할 관리' },
                    { key: 'canViewAllMembers', label: '모든 멤버 보기' },
                  ].map(({ key, label }) => (
                    <label key={key} className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={permissions[key as keyof EmployeePermissions] as boolean}
                        onChange={(e) =>
                          setPermissions({ ...permissions, [key]: e.target.checked })
                        }
                        className="w-4 h-4 text-primary focus:ring-primary border-gray-300 rounded"
                      />
                      <span className="text-sm">{label}</span>
                    </label>
                  ))}

                  <h3 className="font-medium text-gray-900 sticky top-0 bg-white py-2 pt-4">
                    재무 및 설정 권한
                  </h3>
                  {[
                    { key: 'canViewFinance', label: '재무 보기' },
                    { key: 'canManageFinance', label: '재무 관리' },
                    { key: 'canManageSettings', label: '시스템 설정 관리' },
                    { key: 'canViewAnalytics', label: '분석 보기' },
                  ].map(({ key, label }) => (
                    <label key={key} className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={permissions[key as keyof EmployeePermissions] as boolean}
                        onChange={(e) =>
                          setPermissions({ ...permissions, [key]: e.target.checked })
                        }
                        className="w-4 h-4 text-primary focus:ring-primary border-gray-300 rounded"
                      />
                      <span className="text-sm">{label}</span>
                    </label>
                  ))}
                </div>

                <div className="flex gap-3 pt-4 border-t">
                  <button
                    onClick={() => setStep(1)}
                    className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    이전
                  </button>
                  <button
                    onClick={handleSubmit}
                    disabled={loading}
                    className="flex-1 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-hover transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {loading ? (
                      <span className="flex items-center justify-center gap-2">
                        <span className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></span>
                        생성 중...
                      </span>
                    ) : (
                      '초대 생성'
                    )}
                  </button>
                </div>
              </motion.div>
            )}

            {/* Step 3: 완료 */}
            {step === 3 && generatedInvite && (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="text-center space-y-6"
              >
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto">
                  <Check className="w-8 h-8 text-green-600" />
                </div>

                <div>
                  <h3 className="text-xl font-semibold mb-2">초대가 생성되었습니다!</h3>
                  <p className="text-gray-600">
                    <strong>{generatedInvite.email}</strong>님에게 초대 링크를 전송하세요.
                  </p>
                </div>

                <div className="bg-gray-50 p-4 rounded-lg space-y-3">
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <span className="font-medium">초대 코드:</span>
                    <code className="bg-white px-2 py-1 rounded border">
                      {generatedInvite.inviteCode}
                    </code>
                  </div>

                  <div className="flex gap-2">
                    <input
                      type="text"
                      readOnly
                      value={employeeInvitationService.getInvitationUrl(
                        generatedInvite.inviteCode
                      )}
                      className="flex-1 px-3 py-2 bg-white border border-gray-300 rounded-lg text-sm"
                    />
                    <button
                      onClick={copyInviteLink}
                      className="px-4 py-2 bg-gray-800 text-white rounded-lg hover:bg-gray-700 transition-colors flex items-center gap-2"
                    >
                      {copied ? (
                        <>
                          <Check className="w-4 h-4" />
                          복사됨
                        </>
                      ) : (
                        <>
                          <Copy className="w-4 h-4" />
                          복사
                        </>
                      )}
                    </button>
                  </div>

                  <p className="text-xs text-gray-500">
                    만료일: {new Date(generatedInvite.expiresAt).toLocaleString('ko-KR')}
                  </p>
                </div>

                <button
                  onClick={handleClose}
                  className="w-full px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-hover transition-colors"
                >
                  완료
                </button>
              </motion.div>
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  )
}
