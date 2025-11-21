'use client'

import React, { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { motion } from 'framer-motion'
import {
  Building2,
  Mail,
  Shield,
  Briefcase,
  Calendar,
  AlertCircle,
  CheckCircle,
  Loader2,
} from 'lucide-react'
import { signInWithEmailAndPassword, createUserWithEmailAndPassword } from 'firebase/auth'
import { auth } from '@/lib/firebase'
import employeeInvitationService from '@/services/employee-invitation-service'
import { EmployeeInvitation } from '@/types/employee'

const ROLE_LABELS: Record<EmployeeInvitation['targetRole'], string> = {
  admin: '관리자',
  manager: '매니저',
  developer: '개발자',
  designer: '디자이너',
  support: '지원',
  qa: 'QA',
}

const EMPLOYMENT_TYPE_LABELS: Record<string, string> = {
  'full-time': '정규직',
  'part-time': '계약직',
  'contractor': '프리랜서',
  'intern': '인턴',
}

export default function EmployeeInvitePage() {
  const params = useParams()
  const router = useRouter()
  const inviteCode = params.code as string

  const [invitation, setInvitation] = useState<EmployeeInvitation | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [mode, setMode] = useState<'login' | 'register'>('register')
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    displayName: '',
  })
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    checkInvitation()
  }, [inviteCode])

  const checkInvitation = async () => {
    try {
      const invite = await employeeInvitationService.getInvitationByCode(inviteCode)

      if (!invite) {
        setError('유효하지 않은 초대 링크입니다.')
        setLoading(false)
        return
      }

      if (invite.status !== 'pending') {
        if (invite.status === 'accepted') {
          setError('이미 사용된 초대입니다.')
        } else if (invite.status === 'expired') {
          setError('만료된 초대 링크입니다.')
        } else {
          setError('취소된 초대입니다.')
        }
        setLoading(false)
        return
      }

      if (new Date() > invite.expiresAt) {
        setError('만료된 초대 링크입니다.')
        setLoading(false)
        return
      }

      setInvitation(invite)
      setFormData({ ...formData, email: invite.email })
    } catch (err) {
      console.error('Failed to check invitation:', err)
      setError('초대 정보를 확인할 수 없습니다.')
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!invitation) return

    setSubmitting(true)
    setError(null)

    try {
      // 유효성 검사
      if (mode === 'register') {
        if (!formData.displayName) {
          setError('이름을 입력해주세요.')
          setSubmitting(false)
          return
        }
        if (formData.password.length < 6) {
          setError('비밀번호는 최소 6자 이상이어야 합니다.')
          setSubmitting(false)
          return
        }
        if (formData.password !== formData.confirmPassword) {
          setError('비밀번호가 일치하지 않습니다.')
          setSubmitting(false)
          return
        }
      }

      let userCredential

      if (mode === 'register') {
        // 회원가입
        userCredential = await createUserWithEmailAndPassword(
          auth,
          formData.email,
          formData.password
        )
      } else {
        // 로그인
        userCredential = await signInWithEmailAndPassword(auth, formData.email, formData.password)
      }

      // 초대 사용 처리
      await employeeInvitationService.useInvitation(
        inviteCode,
        userCredential.user.uid,
        formData.email
      )

      // 대시보드로 이동
      router.push('/dashboard')
    } catch (err: any) {
      console.error('Authentication error:', err)

      if (err.code === 'auth/email-already-in-use') {
        setError('이미 사용 중인 이메일입니다. 로그인해주세요.')
        setMode('login')
      } else if (err.code === 'auth/user-not-found') {
        setError('등록되지 않은 이메일입니다. 회원가입해주세요.')
        setMode('register')
      } else if (err.code === 'auth/wrong-password') {
        setError('잘못된 비밀번호입니다.')
      } else if (err.code === 'auth/weak-password') {
        setError('비밀번호는 최소 6자 이상이어야 합니다.')
      } else {
        setError(err.message || '인증 중 오류가 발생했습니다.')
      }
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin text-primary mx-auto mb-4" />
          <p className="text-gray-600">초대 정보를 확인하는 중...</p>
        </div>
      </div>
    )
  }

  if (error && !invitation) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 text-center"
        >
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <AlertCircle className="w-8 h-8 text-red-600" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">초대 링크 오류</h1>
          <p className="text-gray-600 mb-6">{error}</p>
          <Link
            href="/"
            className="inline-block px-6 py-2 bg-primary text-white rounded-lg hover:bg-primary-hover transition-colors"
          >
            홈으로 돌아가기
          </Link>
        </motion.div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-2xl w-full bg-white rounded-2xl shadow-xl overflow-hidden"
      >
        {/* 헤더 */}
        <div className="bg-gradient-to-r from-primary to-indigo-600 px-8 py-6 text-white">
          <div className="flex items-center gap-3 mb-2">
            <Building2 className="w-8 h-8" />
            <div>
              <h1 className="text-2xl font-bold">직원 초대</h1>
              <p className="text-blue-100 text-sm">
                {invitation?.organizationName}에 참여하세요
              </p>
            </div>
          </div>
        </div>

        <div className="p-8">
          {/* 초대 정보 */}
          {invitation && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-6 mb-6 space-y-3"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center">
                  <Shield className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">역할</p>
                  <p className="font-semibold text-gray-900">
                    {ROLE_LABELS[invitation.targetRole]}
                  </p>
                </div>
              </div>

              {invitation.departmentName && (
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center">
                    <Building2 className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">부서</p>
                    <p className="font-semibold text-gray-900">{invitation.departmentName}</p>
                  </div>
                </div>
              )}

              {invitation.position && (
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center">
                    <Briefcase className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">직책</p>
                    <p className="font-semibold text-gray-900">{invitation.position}</p>
                  </div>
                </div>
              )}

              {invitation.employmentType && (
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center">
                    <Briefcase className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">고용 형태</p>
                    <p className="font-semibold text-gray-900">
                      {EMPLOYMENT_TYPE_LABELS[invitation.employmentType]}
                    </p>
                  </div>
                </div>
              )}

              {invitation.startDate && (
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center">
                    <Calendar className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">입사 예정일</p>
                    <p className="font-semibold text-gray-900">
                      {new Date(invitation.startDate).toLocaleDateString('ko-KR')}
                    </p>
                  </div>
                </div>
              )}

              {invitation.message && (
                <div className="mt-4 pt-4 border-t border-blue-200">
                  <p className="text-sm text-gray-600 mb-1">초대 메시지</p>
                  <p className="text-gray-800">{invitation.message}</p>
                </div>
              )}

              <div className="mt-4 pt-4 border-t border-blue-200">
                <p className="text-xs text-gray-500">
                  초대자: {invitation.inviterName} | 만료일:{' '}
                  {new Date(invitation.expiresAt).toLocaleDateString('ko-KR')}
                </p>
              </div>
            </motion.div>
          )}

          {/* 로그인/회원가입 탭 */}
          <div className="flex gap-2 mb-6">
            <button
              onClick={() => setMode('register')}
              className={`flex-1 py-2 px-4 rounded-lg font-medium transition-colors ${
                mode === 'register'
                  ? 'bg-primary text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              회원가입
            </button>
            <button
              onClick={() => setMode('login')}
              className={`flex-1 py-2 px-4 rounded-lg font-medium transition-colors ${
                mode === 'login'
                  ? 'bg-primary text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              로그인
            </button>
          </div>

          {/* 폼 */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {mode === 'register' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">이름 *</label>
                <input
                  type="text"
                  value={formData.displayName}
                  onChange={(e) => setFormData({ ...formData, displayName: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                  placeholder="홍길동"
                  required
                />
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                이메일 주소 *
              </label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent bg-gray-50"
                placeholder="email@company.com"
                required
                disabled
              />
              <p className="text-xs text-gray-500 mt-1">초대된 이메일 주소입니다.</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">비밀번호 *</label>
              <input
                type="password"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                placeholder="••••••••"
                required
                minLength={6}
              />
              {mode === 'register' && (
                <p className="text-xs text-gray-500 mt-1">최소 6자 이상 입력해주세요</p>
              )}
            </div>

            {mode === 'register' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  비밀번호 확인 *
                </label>
                <input
                  type="password"
                  value={formData.confirmPassword}
                  onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                  placeholder="••••••••"
                  required
                  minLength={6}
                />
              </div>
            )}

            {error && (
              <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg flex items-start gap-2">
                <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <button
              type="submit"
              disabled={submitting}
              className="w-full py-3 px-4 bg-primary text-white rounded-lg font-medium hover:bg-primary-hover transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {submitting ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  처리 중...
                </>
              ) : (
                <>
                  <CheckCircle className="w-5 h-5" />
                  {mode === 'login' ? '로그인하고 참여하기' : '가입하고 참여하기'}
                </>
              )}
            </button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600">
              {mode === 'login' ? '계정이 없으신가요?' : '이미 계정이 있으신가요?'}{' '}
              <button
                onClick={() => setMode(mode === 'login' ? 'register' : 'login')}
                className="text-primary hover:underline font-medium"
              >
                {mode === 'login' ? '회원가입' : '로그인'}
              </button>
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  )
}
