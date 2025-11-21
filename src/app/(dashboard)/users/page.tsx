'use client'

import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import { 
  Search, Plus, Edit, Trash2, Mail, Shield, UserCheck,
  Users, UserPlus, UserCog, Building2, Briefcase, HeadphonesIcon
} from 'lucide-react'
import { useAuth } from '@/lib/auth-context'
import { getDatabase, ref, onValue, off } from 'firebase/database'
import { app } from '@/lib/firebase'

interface UserData {
  uid: string
  email: string
  displayName: string
  role: 'admin' | 'employee' | 'support' | 'client' | 'customer'
  department?: string
  companyName?: string
  isActive: boolean
  createdAt: string
  lastLogin?: string
}

const roleConfig = {
  admin: { label: '관리자', icon: Shield, color: 'destructive' },
  employee: { label: '직원', icon: UserCog, color: 'default' },
  support: { label: '상담원', icon: HeadphonesIcon, color: 'secondary' },
  client: { label: '거래처', icon: Building2, color: 'outline' },
  customer: { label: '고객', icon: Users, color: 'outline' } // customer role 추가
}

export default function UsersPage() {
  const { userProfile } = useAuth()
  const [users, setUsers] = useState<UserData[]>([])
  const [filteredUsers, setFilteredUsers] = useState<UserData[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedRole, setSelectedRole] = useState<string>('all')

  useEffect(() => {
    const db = getDatabase(app)
    const usersRef = ref(db, 'users')

    const unsubscribe = onValue(usersRef, (snapshot) => {
      const data = snapshot.val()
      if (data) {
        const usersList = Object.entries(data).map(([uid, userData]: [string, any]) => ({
          uid,
          ...userData,
          isActive: userData.isActive ?? true
        }))
        setUsers(usersList)
        setFilteredUsers(usersList)
      }
      setLoading(false)
    })

    return () => off(usersRef)
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
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    )
  }

  return (
    <div className="w-full max-w-[1920px] mx-auto px-6 py-6 space-y-6">
      {/* 헤더 */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">사용자 관리</h1>
          <p className="text-muted-foreground mt-1">플랫폼의 모든 사용자를 관리합니다</p>
        </div>
        
        <Button>
          <UserPlus className="mr-2 h-4 w-4" />
          사용자 추가
        </Button>
      </div>

      {/* 통계 카드 */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">전체 사용자</p>
                <p className="text-2xl font-bold">{users.length}</p>
              </div>
              <Users className="h-8 w-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>
        
        {Object.entries(roleConfig).map(([role, config]) => {
          const count = users.filter(u => u.role === role).length
          return (
            <Card key={role}>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">{config.label}</p>
                    <p className="text-2xl font-bold">{count}</p>
                  </div>
                  <config.icon className="h-8 w-8 text-muted-foreground" />
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {/* 필터 및 검색 */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
          <Input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="이름, 이메일, 회사명으로 검색..."
            className="pl-10"
          />
        </div>
        
        <Tabs value={selectedRole} onValueChange={setSelectedRole}>
          <TabsList>
            <TabsTrigger value="all">전체</TabsTrigger>
            {Object.entries(roleConfig).map(([role, config]) => (
              <TabsTrigger key={role} value={role}>{config.label}</TabsTrigger>
            ))}
          </TabsList>
        </Tabs>
      </div>

      {/* 사용자 테이블 */}
      <Card>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>사용자</TableHead>
              <TableHead>역할</TableHead>
              <TableHead>소속</TableHead>
              <TableHead>상태</TableHead>
              <TableHead>가입일</TableHead>
              <TableHead>마지막 로그인</TableHead>
              <TableHead className="text-right">액션</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredUsers.map((user) => {
              const roleInfo = roleConfig[user.role] || roleConfig.client // 기본값으로 client 사용
              const RoleIcon = roleInfo.icon
              
              return (
                <TableRow key={user.uid}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                        <span className="font-medium">
                          {user.displayName?.charAt(0)?.toUpperCase() || 'U'}
                        </span>
                      </div>
                      <div>
                        <p className="font-medium">{user.displayName || '이름 없음'}</p>
                        <p className="text-sm text-muted-foreground">{user.email}</p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant={roleInfo.color as any} className="gap-1">
                      <RoleIcon className="h-3 w-3" />
                      {roleInfo.label}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {user.companyName || user.department || '-'}
                  </TableCell>
                  <TableCell>
                    <Badge variant={user.isActive ? 'default' : 'secondary'}>
                      {user.isActive ? '활성' : '비활성'}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {formatDate(user.createdAt)}
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {formatDate(user.lastLogin)}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex gap-1 justify-end">
                      <Button variant="ghost" size="icon">
                        <Mail className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon">
                        <Edit className="h-4 w-4" />
                      </Button>
                      {userProfile?.role === 'admin' && user.uid !== userProfile.uid && (
                        <Button variant="ghost" size="icon">
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              )
            })}
          </TableBody>
        </Table>
      </Card>
    </div>
  )
}