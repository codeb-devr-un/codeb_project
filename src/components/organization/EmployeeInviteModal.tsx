'use client'
const isDev = process.env.NODE_ENV === 'development'

import React, { useState } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import toast from 'react-hot-toast'

interface EmployeeInviteModalProps {
  isOpen: boolean
  onClose: () => void
  onInvite: () => void
}

export default function EmployeeInviteModal({ isOpen, onClose, onInvite }: EmployeeInviteModalProps) {
  const [email, setEmail] = useState('')
  const [role, setRole] = useState('member')
  const [department, setDepartment] = useState('')
  const [loading, setLoading] = useState(false)

  const handleInvite = async () => {
    if (!email) {
      toast.error('이메일을 입력해주세요.')
      return
    }

    try {
      setLoading(true)
      // await employeeInvitationService.inviteEmployee(email, role, department)
      toast.error('초대 기능은 현재 사용할 수 없습니다.')
      onInvite()
      onClose()
    } catch (error) {
      if (isDev) console.error('Invite error:', error)
      toast.error('초대 중 오류가 발생했습니다.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>직원 초대</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="email" className="text-right">
              이메일
            </Label>
            <Input
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="col-span-3"
              placeholder="example@company.com"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="role">
              직책
            </Label>
            <div className="flex gap-2">
              {[
                { value: 'admin', label: '관리자', activeStyle: 'bg-rose-100 text-rose-700 ring-2 ring-rose-500' },
                { value: 'manager', label: '매니저', activeStyle: 'bg-amber-100 text-amber-700 ring-2 ring-amber-500' },
                { value: 'member', label: '팀원', activeStyle: 'bg-emerald-100 text-emerald-700 ring-2 ring-emerald-500' }
              ].map(r => (
                <button
                  key={r.value}
                  type="button"
                  onClick={() => setRole(r.value)}
                  className={`flex-1 px-3 py-2 rounded-xl text-sm font-medium transition-all ${
                    role === r.value
                      ? r.activeStyle
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  {r.label}
                </button>
              ))}
            </div>
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="department" className="text-right">
              부서
            </Label>
            <Input
              id="department"
              value={department}
              onChange={(e) => setDepartment(e.target.value)}
              className="col-span-3"
              placeholder="개발팀, 디자인팀 등"
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            취소
          </Button>
          <Button onClick={handleInvite} disabled={loading}>
            {loading ? '초대 중...' : '초대하기'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
