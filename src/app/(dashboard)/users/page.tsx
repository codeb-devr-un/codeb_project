'use client'

// ===========================================
// Glass Morphism Users Page
// ===========================================

import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import {
  Search, Edit, Trash2, Mail, Shield,
  Users, UserPlus, Loader2
} from 'lucide-react'
import { useAuth } from '@/lib/auth-context'
import { cn } from '@/lib/utils'

interface UserData {
  uid: string
  email: string
  displayName: string
  role: 'admin' | 'member'
  department?: string
  companyName?: string
  isActive: boolean
  createdAt: string
  lastLogin?: string
}

type UserRole = {
  label: string
  icon: any
  bgColor: string
  textColor: string
}

const ROLE_CONFIG: Record<string, UserRole> = {
  admin: { label: '관리자', icon: Shield, bgColor: 'bg-rose-100', textColor: 'text-rose-700' },
  member: { label: '팀원', icon: Users, bgColor: 'bg-lime-100', textColor: 'text-lime-700' },
}

export default function UsersPage() {
  const { userProfile } = useAuth()
  const [users, setUsers] = useState<UserData[]>([])
  const [filteredUsers, setFilteredUsers] = useState<UserData[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedRole, setSelectedRole] = useState<string>('all')

  useEffect(() => {
    // Firebase logic removed
    setUsers([])
    setLoading(false)
  }, [])

  useEffect(() => {
    let filtered = users

    // 역할 필터
    if (selectedRole !== 'all') {
      filtered = filtered.filter(user => user.role === selectedRole)
    }

    // 검색 필터
    if (searchTerm) {
      filtered = filtered.filter(user =>
        user.displayName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.companyName?.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }

    setFilteredUsers(filtered)
  }, [users, selectedRole, searchTerm])

  const formatDate = (dateString?: string) => {
    if (!dateString) return '-'
    return new Date(dateString).toLocaleDateString('ko-KR')
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin text-lime-400 mx-auto" />
          <p className="mt-4 text-slate-500">사용자 정보를 불러오는 중...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="w-full max-w-[1920px] mx-auto px-6 py-6 space-y-6">
      {/* 헤더 - Glass Morphism */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900 flex items-center gap-3">
            <div className="p-2 bg-lime-100 rounded-xl">
              <Users className="w-6 h-6 text-lime-600" />
            </div>
            사용자 관리
          </h1>
          <p className="text-slate-500 mt-2">플랫폼의 모든 사용자를 관리합니다</p>
        </div>

        <Button variant="limePrimary" className="rounded-xl">
          <UserPlus className="mr-2 h-4 w-4" />
          사용자 추가
        </Button>
      </div>

      {/* 통계 카드 - Glass Morphism */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card variant="glass" className="hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-500">전체 사용자</p>
                <p className="text-2xl font-bold text-slate-900 mt-1">{users.length}</p>
              </div>
              <div className="p-3 bg-lime-100 rounded-xl">
                <Users className="h-6 w-6 text-lime-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        {Object.entries(ROLE_CONFIG).map(([role, config]) => {
          const count = users.filter(u => u.role === role).length
          return (
            <Card variant="glass" key={role} className="hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-slate-500">{config.label}</p>
                    <p className="text-2xl font-bold text-slate-900 mt-1">{count}</p>
                  </div>
                  <div className={cn("p-3 rounded-xl", config.bgColor)}>
                    <config.icon className={cn("h-6 w-6", config.textColor)} />
                  </div>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {/* 필터 및 검색 - Glass Morphism */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 h-4 w-4" />
          <Input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="이름, 이메일, 회사명으로 검색..."
            className="pl-10"
          />
        </div>

        <div className="bg-white/60 backdrop-blur-sm rounded-2xl shadow-lg shadow-black/5 p-1.5 border border-white/40">
          <div className="flex gap-1">
            {[
              { id: 'all', label: '전체' },
              { id: 'admin', label: '관리자' },
              { id: 'member', label: '팀원' }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setSelectedRole(tab.id)}
                className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                  selectedRole === tab.id
                    ? 'bg-black text-lime-400 shadow-lg'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-white/60'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* 사용자 테이블 - Glass Morphism */}
      <Card variant="glass">
        <div className="overflow-hidden rounded-2xl">
          <Table>
            <TableHeader>
              <TableRow className="border-b border-white/40">
                <TableHead className="text-slate-700 font-semibold">사용자</TableHead>
                <TableHead className="text-slate-700 font-semibold">역할</TableHead>
                <TableHead className="text-slate-700 font-semibold">소속</TableHead>
                <TableHead className="text-slate-700 font-semibold">상태</TableHead>
                <TableHead className="text-slate-700 font-semibold">가입일</TableHead>
                <TableHead className="text-slate-700 font-semibold">마지막 로그인</TableHead>
                <TableHead className="text-right text-slate-700 font-semibold">액션</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredUsers.length > 0 ? (
                filteredUsers.map((user) => {
                  const roleConfig = ROLE_CONFIG[user.role]
                  return (
                    <TableRow key={user.uid} className="border-b border-white/40 hover:bg-white/40 transition-colors">
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <div className={cn("p-2 rounded-xl", roleConfig?.bgColor || 'bg-slate-100')}>
                            {roleConfig?.icon ? React.createElement(roleConfig.icon, { className: cn("h-4 w-4", roleConfig?.textColor || 'text-slate-600') }) : <Users className="h-4 w-4 text-slate-600" />}
                          </div>
                          <div>
                            <p className="font-medium text-slate-900">{user.displayName}</p>
                            <p className="text-sm text-slate-500">{user.email}</p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge className={cn("border-0", roleConfig?.bgColor, roleConfig?.textColor)}>
                          {roleConfig?.label || user.role}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-slate-600">
                        {user.companyName || user.department || '-'}
                      </TableCell>
                      <TableCell>
                        <Badge className={user.isActive ? 'bg-emerald-100 text-emerald-700 border-0' : 'bg-slate-100 text-slate-500 border-0'}>
                          {user.isActive ? '활성' : '비활성'}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-slate-500">
                        {formatDate(user.createdAt)}
                      </TableCell>
                      <TableCell className="text-slate-500">
                        {formatDate(user.lastLogin)}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex gap-1 justify-end">
                          <Button variant="ghost" size="icon" className="hover:bg-white/60 rounded-xl">
                            <Mail className="h-4 w-4 text-slate-500" />
                          </Button>
                          <Button variant="ghost" size="icon" className="hover:bg-white/60 rounded-xl">
                            <Edit className="h-4 w-4 text-slate-500" />
                          </Button>
                          {userProfile?.role === 'admin' && user.uid !== userProfile.uid && (
                            <Button variant="ghost" size="icon" className="hover:bg-rose-100 rounded-xl">
                              <Trash2 className="h-4 w-4 text-rose-500" />
                            </Button>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  )
                })
              ) : (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-12 text-slate-500">
                    등록된 사용자가 없습니다
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </Card>
    </div>
  )
}
