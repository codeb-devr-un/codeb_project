'use client'

import React, { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { signInWithEmailAndPassword, createUserWithEmailAndPassword } from 'firebase/auth'
import { auth } from '@/lib/firebase'
import invitationService from '@/services/invitation-service'
import { ProjectInvitation } from '@/types'

export default function InvitePage() {
  const params = useParams()
  const router = useRouter()
  const inviteCode = params.code as string
  
  const [invitation, setInvitation] = useState<ProjectInvitation | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [mode, setMode] = useState<'login' | 'register'>('login')
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    name: ''
  })
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    checkInvitation()
  }, [inviteCode])

  const checkInvitation = async () => {
    try {
      const invite = await invitationService.getInvitationByCode(inviteCode)
      
      if (!invite) {
        setError('유효하지 않은 초대 링크입니다.')
        setLoading(false)
        return
      }

      if (invite.status !== 'pending') {
        setError('이미 사용되었거나 취소된 초대입니다.')
        setLoading(false)
        return
      }

      if (new Date() > invite.expiresAt) {
        setError('만료된 초대 링크입니다.')
        setLoading(false)
        return
      }

      setInvitation(invite)
      if (invite.email) {
        setFormData({ ...formData, email: invite.email })
      }
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
        userCredential = await signInWithEmailAndPassword(
          auth,
          formData.email,
          formData.password
        )
      }

      // 초대 사용 처리
      await invitationService.useInvitation(
        inviteCode,
        userCredential.user.uid,
        formData.email
      )

      // 프로젝트 페이지로 이동
      router.push(`/projects/${invitation.projectId}`)
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
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    )
  }

  if (error && !invitation) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="max-w-md w-full bg-white rounded-xl shadow-lg p-8 text-center">
          <span className="text-6xl mb-4 block">❌</span>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">초대 링크 오류</h1>
          <p className="text-gray-600 mb-6">{error}</p>
          <Link href="/" className="text-primary hover:underline">
            홈으로 돌아가기
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-md w-full"
      >
        <div className="bg-white rounded-xl shadow-lg p-8">
          <div className="text-center mb-8">
            <span className="text-5xl mb-4 block">🎉</span>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">
              프로젝트 초대
            </h1>
            <p className="text-gray-600">
              프로젝트에 초대되었습니다
            </p>
          </div>

          {invitation && (
            <div className="bg-gray-50 rounded-lg p-4 mb-6">
              <p className="text-sm text-gray-600">
                <span className="font-medium">초대자:</span> {invitation.invitedBy}
              </p>
              <p className="text-sm text-gray-600 mt-1">
                <span className="font-medium">만료일:</span> {new Date(invitation.expiresAt).toLocaleDateString('ko-KR')}
              </p>
            </div>
          )}

          <div className="flex gap-2 mb-6">
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
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {mode === 'register' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  이름
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                  placeholder="홍길동"
                  required
                />
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                이메일
              </label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                placeholder="user@example.com"
                required
                disabled={!!invitation?.email}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                비밀번호
              </label>
              <input
                type="password"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                placeholder="••••••••"
                required
                minLength={6}
              />
              {mode === 'register' && (
                <p className="text-xs text-gray-500 mt-1">
                  최소 6자 이상 입력해주세요
                </p>
              )}
            </div>

            {error && (
              <div className="p-3 bg-red-50 text-red-700 text-sm rounded-lg">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={submitting}
              className="w-full py-3 px-4 bg-primary text-white rounded-lg font-medium hover:bg-primary-hover transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {submitting ? (
                <span className="flex items-center justify-center gap-2">
                  <span className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></span>
                  처리 중...
                </span>
              ) : (
                mode === 'login' ? '로그인하고 참여하기' : '가입하고 참여하기'
              )}
            </button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600">
              이미 계정이 있으신가요?{' '}
              <button
                onClick={() => setMode(mode === 'login' ? 'register' : 'login')}
                className="text-primary hover:underline"
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