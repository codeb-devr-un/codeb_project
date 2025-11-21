'use client'

import React, { useState, useEffect } from 'react'
import { useAuth } from '@/lib/auth-context'
import { getDatabase, ref, onValue, off, set, push, update, remove } from 'firebase/database'
import { getAuth, createUserWithEmailAndPassword, updateProfile } from 'firebase/auth'
import { app } from '@/lib/firebase'
import toast from 'react-hot-toast'
import { motion } from 'framer-motion'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { Checkbox } from '@/components/ui/checkbox'
import { 
  Building2, Plus, Search, Mail, Phone, Globe, 
  MapPin, Edit, Trash2, FileText, Loader2, User,
  Briefcase, Calendar, Filter
} from 'lucide-react'

interface Client {
  id: string
  companyName: string
  contactPerson: string
  email: string
  phone: string
  address: string
  businessNumber?: string
  industry?: string
  website?: string
  notes?: string
  createdAt: string
  updatedAt: string
  status: 'active' | 'inactive'
  projects?: number
}

export default function ClientsPage() {
  const { userProfile } = useAuth()
  const [clients, setClients] = useState<Client[]>([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [editingClient, setEditingClient] = useState<Client | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterStatus, setFilterStatus] = useState<'all' | 'active' | 'inactive'>('all')
  const [showDetail, setShowDetail] = useState<string | null>(null)
  
  const [formData, setFormData] = useState({
    companyName: '',
    contactPerson: '',
    email: '',
    phone: '',
    address: '',
    businessNumber: '',
    industry: '',
    website: '',
    notes: '',
    createAccount: true,
    password: ''
  })

  // Firebase에서 거래처 목록 가져오기
  useEffect(() => {
    const db = getDatabase(app)
    const usersRef = ref(db, 'users')
    
    const unsubscribe = onValue(usersRef, (snapshot) => {
      const data = snapshot.val()
      if (data) {
        const clientsList: Client[] = Object.entries(data)
          .filter(([_, user]: [string, any]) => user.role === 'customer' || user.role === 'client')
          .map(([id, user]: [string, any]) => ({
            id,
            companyName: user.companyName || user.displayName || '미등록',
            contactPerson: user.contactPerson || user.displayName || '',
            email: user.email,
            phone: user.phone || '',
            address: user.address || '',
            businessNumber: user.businessNumber || '',
            industry: user.industry || '',
            website: user.website || '',
            notes: user.notes || '',
            createdAt: user.createdAt || new Date().toISOString(),
            updatedAt: user.updatedAt || user.createdAt || new Date().toISOString(),
            status: user.status || 'active',
            projects: user.projects || 0
          }))
        setClients(clientsList)
      }
      setLoading(false)
    })

    return () => off(usersRef)
  }, [])

  // 거래처 검색 및 필터링
  const filteredClients = clients.filter(client => {
    const matchesSearch = 
      client.companyName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      client.contactPerson.toLowerCase().includes(searchTerm.toLowerCase()) ||
      client.email.toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchesStatus = filterStatus === 'all' || client.status === filterStatus
    
    return matchesSearch && matchesStatus
  })

  // 거래처 등록/수정
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    try {
      const db = getDatabase(app)
      
      if (editingClient) {
        // 기존 거래처 수정
        const updates: any = {
          companyName: formData.companyName,
          contactPerson: formData.contactPerson,
          phone: formData.phone,
          address: formData.address,
          businessNumber: formData.businessNumber,
          industry: formData.industry,
          website: formData.website,
          notes: formData.notes,
          updatedAt: new Date().toISOString()
        }
        
        await update(ref(db, `users/${editingClient.id}`), updates)
        toast.success('거래처 정보가 수정되었습니다.')
      } else {
        // 새 거래처 등록
        if (formData.createAccount) {
          // Firebase Auth에 계정 생성
          const auth = getAuth(app)
          const userCredential = await createUserWithEmailAndPassword(
            auth, 
            formData.email, 
            formData.password || 'customer123!'
          )
          
          await updateProfile(userCredential.user, {
            displayName: formData.contactPerson
          })
          
          // 사용자 정보 저장
          await set(ref(db, `users/${userCredential.user.uid}`), {
            uid: userCredential.user.uid,
            email: formData.email,
            displayName: formData.contactPerson,
            companyName: formData.companyName,
            contactPerson: formData.contactPerson,
            phone: formData.phone,
            address: formData.address,
            businessNumber: formData.businessNumber,
            industry: formData.industry,
            website: formData.website,
            notes: formData.notes,
            role: 'client',
            status: 'active',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            isOnline: false
          })
          
          toast.success('거래처가 등록되었습니다.')
        }
      }
      
      handleCloseModal()
    } catch (error: any) {
      console.error('Error saving client:', error)
      if (error.code === 'auth/email-already-in-use') {
        toast.error('이미 사용 중인 이메일입니다.')
      } else if (error.code === 'auth/weak-password') {
        toast.error('비밀번호는 6자 이상이어야 합니다.')
      } else {
        toast.error('거래처 저장 중 오류가 발생했습니다.')
      }
    }
  }

  // 거래처 삭제
  const handleDelete = async (clientId: string) => {
    if (!confirm('정말 이 거래처를 삭제하시겠습니까?')) return
    
    try {
      const db = getDatabase(app)
      await remove(ref(db, `users/${clientId}`))
      toast.success('거래처가 삭제되었습니다.')
      setShowDetail(null)
    } catch (error) {
      console.error('Error deleting client:', error)
      toast.error('거래처 삭제 중 오류가 발생했습니다.')
    }
  }

  // 모달 닫기
  const handleCloseModal = () => {
    setShowModal(false)
    setEditingClient(null)
    setFormData({
      companyName: '',
      contactPerson: '',
      email: '',
      phone: '',
      address: '',
      businessNumber: '',
      industry: '',
      website: '',
      notes: '',
      createAccount: true,
      password: ''
    })
  }

  // 수정 모드로 모달 열기
  const handleEdit = (client: Client) => {
    setEditingClient(client)
    setFormData({
      companyName: client.companyName,
      contactPerson: client.contactPerson,
      email: client.email,
      phone: client.phone,
      address: client.address,
      businessNumber: client.businessNumber || '',
      industry: client.industry || '',
      website: client.website || '',
      notes: client.notes || '',
      createAccount: false,
      password: ''
    })
    setShowModal(true)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
      </div>
    )
  }

  return (
    <div className="w-full max-w-[1920px] mx-auto px-6 py-6 space-y-6">
      {/* 헤더 */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">거래처 관리</h1>
          <p className="text-muted-foreground mt-1">거래처를 등록하고 관리합니다</p>
        </div>
        
        {userProfile?.role === 'admin' && (
          <Button onClick={() => setShowModal(true)}>
            <Plus className="mr-2 h-4 w-4" />
            거래처 등록
          </Button>
        )}
      </div>

      {/* 통계 카드 */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">전체 거래처</p>
                <p className="text-2xl font-bold">{clients.length}</p>
              </div>
              <Building2 className="h-8 w-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">활성 거래처</p>
                <p className="text-2xl font-bold">
                  {clients.filter(c => c.status === 'active').length}
                </p>
              </div>
              <User className="h-8 w-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">이번 달 신규</p>
                <p className="text-2xl font-bold">
                  {clients.filter(c => {
                    const createdDate = new Date(c.createdAt)
                    const now = new Date()
                    return createdDate.getMonth() === now.getMonth() && 
                           createdDate.getFullYear() === now.getFullYear()
                  }).length}
                </p>
              </div>
              <Calendar className="h-8 w-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">비활성 거래처</p>
                <p className="text-2xl font-bold">
                  {clients.filter(c => c.status === 'inactive').length}
                </p>
              </div>
              <Briefcase className="h-8 w-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* 검색 및 필터 */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="거래처명, 담당자, 이메일 검색..."
            className="pl-10"
          />
        </div>
        
        <Select value={filterStatus} onValueChange={(value: any) => setFilterStatus(value)}>
          <SelectTrigger className="w-[200px]">
            <Filter className="h-4 w-4 mr-2" />
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">전체 ({clients.length})</SelectItem>
            <SelectItem value="active">활성 ({clients.filter(c => c.status === 'active').length})</SelectItem>
            <SelectItem value="inactive">비활성 ({clients.filter(c => c.status === 'inactive').length})</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* 거래처 목록 */}
      {filteredClients.length === 0 ? (
        <Card>
          <CardContent className="p-12 text-center">
            <Building2 className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
            <h3 className="text-lg font-medium mb-2">
              {searchTerm ? '검색 결과가 없습니다' : '등록된 거래처가 없습니다'}
            </h3>
            <p className="text-muted-foreground mb-4">
              {searchTerm ? '다른 검색어를 시도해보세요.' : '첫 번째 거래처를 등록해보세요.'}
            </p>
            {userProfile?.role === 'admin' && !searchTerm && (
              <Button onClick={() => setShowModal(true)}>
                거래처 등록하기
              </Button>
            )}
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredClients.map((client) => (
            <motion.div
              key={client.id}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              whileHover={{ scale: 1.02 }}
            >
              <Card 
                className="cursor-pointer hover:shadow-lg transition-all"
                onClick={() => setShowDetail(showDetail === client.id ? null : client.id)}
              >
                <CardContent className="p-6">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="text-lg font-semibold">{client.companyName}</h3>
                      <p className="text-sm text-muted-foreground">{client.contactPerson}</p>
                    </div>
                    <Badge variant={client.status === 'active' ? 'default' : 'secondary'}>
                      {client.status === 'active' ? '활성' : '비활성'}
                    </Badge>
                  </div>
                  
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Mail className="h-4 w-4" />
                      {client.email}
                    </div>
                    {client.phone && (
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <Phone className="h-4 w-4" />
                        {client.phone}
                      </div>
                    )}
                    {client.industry && (
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <Briefcase className="h-4 w-4" />
                        {client.industry}
                      </div>
                    )}
                  </div>

                  {/* 상세 정보 */}
                  {showDetail === client.id && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      className="mt-4 pt-4 border-t space-y-2"
                    >
                      {client.address && (
                        <div className="text-sm">
                          <div className="flex items-center gap-2 text-muted-foreground mb-1">
                            <MapPin className="h-4 w-4" />
                            <span>주소</span>
                          </div>
                          <p className="ml-6">{client.address}</p>
                        </div>
                      )}
                      {client.businessNumber && (
                        <div className="text-sm">
                          <div className="flex items-center gap-2 text-muted-foreground mb-1">
                            <FileText className="h-4 w-4" />
                            <span>사업자번호</span>
                          </div>
                          <p className="ml-6">{client.businessNumber}</p>
                        </div>
                      )}
                      {client.website && (
                        <div className="text-sm">
                          <div className="flex items-center gap-2 text-muted-foreground mb-1">
                            <Globe className="h-4 w-4" />
                            <span>웹사이트</span>
                          </div>
                          <a 
                            href={client.website} 
                            target="_blank" 
                            rel="noopener noreferrer" 
                            className="ml-6 text-primary hover:underline"
                          >
                            {client.website}
                          </a>
                        </div>
                      )}
                      {client.notes && (
                        <div className="text-sm">
                          <p className="text-muted-foreground mb-1">메모</p>
                          <p className="ml-6">{client.notes}</p>
                        </div>
                      )}
                      
                      {userProfile?.role === 'admin' && (
                        <div className="flex gap-2 pt-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={(e) => {
                              e.stopPropagation()
                              handleEdit(client)
                            }}
                            className="flex-1"
                          >
                            <Edit className="h-4 w-4 mr-2" />
                            수정
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={(e) => {
                              e.stopPropagation()
                              handleDelete(client.id)
                            }}
                            className="flex-1 text-destructive hover:bg-destructive hover:text-destructive-foreground"
                          >
                            <Trash2 className="h-4 w-4 mr-2" />
                            삭제
                          </Button>
                        </div>
                      )}
                    </motion.div>
                  )}
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      )}

      {/* 거래처 등록/수정 모달 */}
      <Dialog open={showModal} onOpenChange={setShowModal}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingClient ? '거래처 수정' : '거래처 등록'}
            </DialogTitle>
          </DialogHeader>

          <form onSubmit={handleSubmit}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="companyName">회사명 *</Label>
                <Input
                  id="companyName"
                  value={formData.companyName}
                  onChange={(e) => setFormData({ ...formData, companyName: e.target.value })}
                  required
                />
              </div>

              <div>
                <Label htmlFor="contactPerson">담당자명 *</Label>
                <Input
                  id="contactPerson"
                  value={formData.contactPerson}
                  onChange={(e) => setFormData({ ...formData, contactPerson: e.target.value })}
                  required
                />
              </div>

              <div>
                <Label htmlFor="email">이메일 *</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  required
                  disabled={!!editingClient}
                />
              </div>

              <div>
                <Label htmlFor="phone">전화번호</Label>
                <Input
                  id="phone"
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                />
              </div>

              <div className="md:col-span-2">
                <Label htmlFor="address">주소</Label>
                <Input
                  id="address"
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                />
              </div>

              <div>
                <Label htmlFor="businessNumber">사업자번호</Label>
                <Input
                  id="businessNumber"
                  value={formData.businessNumber}
                  onChange={(e) => setFormData({ ...formData, businessNumber: e.target.value })}
                />
              </div>

              <div>
                <Label htmlFor="industry">업종</Label>
                <Input
                  id="industry"
                  value={formData.industry}
                  onChange={(e) => setFormData({ ...formData, industry: e.target.value })}
                />
              </div>

              <div className="md:col-span-2">
                <Label htmlFor="website">웹사이트</Label>
                <Input
                  id="website"
                  type="url"
                  value={formData.website}
                  onChange={(e) => setFormData({ ...formData, website: e.target.value })}
                  placeholder="https://example.com"
                />
              </div>

              <div className="md:col-span-2">
                <Label htmlFor="notes">메모</Label>
                <Textarea
                  id="notes"
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  rows={3}
                />
              </div>

              {!editingClient && (
                <>
                  <div className="md:col-span-2 flex items-center space-x-2">
                    <Checkbox
                      id="createAccount"
                      checked={formData.createAccount}
                      onCheckedChange={(checked) => 
                        setFormData({ ...formData, createAccount: checked as boolean })
                      }
                    />
                    <Label 
                      htmlFor="createAccount" 
                      className="text-sm font-normal cursor-pointer"
                    >
                      로그인 계정 생성
                    </Label>
                  </div>

                  {formData.createAccount && (
                    <div className="md:col-span-2">
                      <Label htmlFor="password">초기 비밀번호</Label>
                      <Input
                        id="password"
                        type="password"
                        value={formData.password}
                        onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                        placeholder="비어있으면 customer123! 사용"
                      />
                    </div>
                  )}
                </>
              )}
            </div>

            <DialogFooter className="mt-6">
              <Button type="button" variant="outline" onClick={handleCloseModal}>
                취소
              </Button>
              <Button type="submit">
                {editingClient ? '수정' : '등록'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}