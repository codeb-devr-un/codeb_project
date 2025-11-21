'use client'

import React, { useState, useEffect } from 'react'
import { useAuth } from '@/lib/auth-context'
import { getDatabase, ref, onValue, update } from 'firebase/database'
import { app } from '@/lib/firebase'
import { motion } from 'framer-motion'
import toast from 'react-hot-toast'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Switch } from '@/components/ui/switch'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import { Separator } from '@/components/ui/separator'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { 
  User, Bell, Shield, Palette, Globe, Key, Database,
  Mail, Phone, Building, Camera, Save, RefreshCcw,
  Sun, Moon, Monitor, Loader2, AlertCircle, CheckCircle,
  Lock, Smartphone, Languages, CreditCard, Zap, Clock
} from 'lucide-react'

interface Settings {
  profile: {
    displayName: string
    email: string
    phone: string
    company: string
    bio: string
    avatar: string
  }
  notifications: {
    email: boolean
    push: boolean
    sms: boolean
    projectUpdates: boolean
    taskReminders: boolean
    newMessages: boolean
    invoices: boolean
    marketing: boolean
  }
  preferences: {
    theme: 'light' | 'dark' | 'system'
    language: string
    timezone: string
    dateFormat: string
    currency: string
    compactMode: boolean
  }
  privacy: {
    profileVisibility: 'public' | 'private' | 'team'
    showEmail: boolean
    showPhone: boolean
    activityStatus: boolean
    readReceipts: boolean
  }
  security: {
    twoFactorEnabled: boolean
    sessionTimeout: number
    passwordExpiry: number
    loginAlerts: boolean
  }
}

const defaultSettings: Settings = {
  profile: {
    displayName: '',
    email: '',
    phone: '',
    company: '',
    bio: '',
    avatar: ''
  },
  notifications: {
    email: true,
    push: true,
    sms: false,
    projectUpdates: true,
    taskReminders: true,
    newMessages: true,
    invoices: true,
    marketing: false
  },
  preferences: {
    theme: 'system',
    language: 'ko',
    timezone: 'Asia/Seoul',
    dateFormat: 'YYYY-MM-DD',
    currency: 'KRW',
    compactMode: false
  },
  privacy: {
    profileVisibility: 'team',
    showEmail: false,
    showPhone: false,
    activityStatus: true,
    readReceipts: true
  },
  security: {
    twoFactorEnabled: false,
    sessionTimeout: 30,
    passwordExpiry: 90,
    loginAlerts: true
  }
}

export default function SettingsPage() {
  const { user, userProfile } = useAuth()
  const [settings, setSettings] = useState<Settings>(defaultSettings)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [activeTab, setActiveTab] = useState('profile')
  const [hasChanges, setHasChanges] = useState(false)

  // 설정 데이터 로드
  useEffect(() => {
    if (!user) return

    const db = getDatabase(app)
    const settingsRef = ref(db, `settings/${user.uid}`)
    
    const unsubscribe = onValue(settingsRef, (snapshot) => {
      const data = snapshot.val()
      if (data) {
        setSettings(prevSettings => ({
          ...prevSettings,
          ...data,
          profile: {
            ...prevSettings.profile,
            ...data.profile,
            email: user.email || '',
            displayName: userProfile?.displayName || data.profile?.displayName || ''
          }
        }))
      } else {
        // 기본값 설정
        setSettings(prevSettings => ({
          ...prevSettings,
          profile: {
            ...prevSettings.profile,
            email: user.email || '',
            displayName: userProfile?.displayName || ''
          }
        }))
      }
      setLoading(false)
    })

    return () => unsubscribe()
  }, [user, userProfile])

  const handleSave = async () => {
    setSaving(true)
    
    try {
      const db = getDatabase(app)
      await update(ref(db, `settings/${user!.uid}`), settings)
      
      // 프로필 정보 업데이트
      if (settings.profile.displayName !== userProfile?.displayName) {
        await update(ref(db, `users/${user!.uid}`), {
          displayName: settings.profile.displayName
        })
      }
      
      toast.success('설정이 저장되었습니다.')
      setHasChanges(false)
    } catch (error) {
      console.error('Error saving settings:', error)
      toast.error('설정 저장 중 오류가 발생했습니다.')
    } finally {
      setSaving(false)
    }
  }

  const updateSettings = (category: keyof Settings, field: string, value: any) => {
    setSettings(prev => ({
      ...prev,
      [category]: {
        ...prev[category],
        [field]: value
      }
    }))
    setHasChanges(true)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin text-primary mx-auto" />
          <p className="mt-4 text-muted-foreground">설정을 불러오는 중...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="w-full max-w-[1920px] mx-auto px-6 py-6 space-y-6">
      {/* 헤더 */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">설정</h1>
          <p className="text-muted-foreground mt-1">계정 및 환경 설정을 관리합니다</p>
        </div>
        
        {hasChanges && (
          <div className="flex items-center gap-3">
            <Badge variant="outline" className="gap-1">
              <AlertCircle className="h-3 w-3" />
              변경사항 있음
            </Badge>
            <Button onClick={handleSave} disabled={saving}>
              {saving ? (
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
              ) : (
                <Save className="h-4 w-4 mr-2" />
              )}
              저장
            </Button>
          </div>
        )}
      </div>

      {/* 설정 탭 */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full max-w-[600px] grid-cols-5">
          <TabsTrigger value="profile">프로필</TabsTrigger>
          <TabsTrigger value="notifications">알림</TabsTrigger>
          <TabsTrigger value="preferences">환경설정</TabsTrigger>
          <TabsTrigger value="privacy">개인정보</TabsTrigger>
          <TabsTrigger value="security">보안</TabsTrigger>
        </TabsList>

        {/* 프로필 설정 */}
        <TabsContent value="profile" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>프로필 정보</CardTitle>
              <CardDescription>다른 사용자에게 표시되는 정보입니다</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-start gap-6">
                <div className="relative">
                  <div className="w-24 h-24 bg-primary/10 rounded-full flex items-center justify-center">
                    {settings.profile.avatar ? (
                      <img 
                        src={settings.profile.avatar} 
                        alt="Avatar" 
                        className="w-full h-full rounded-full object-cover"
                      />
                    ) : (
                      <User className="h-12 w-12 text-primary" />
                    )}
                  </div>
                  <Button 
                    size="icon" 
                    variant="outline" 
                    className="absolute bottom-0 right-0"
                  >
                    <Camera className="h-4 w-4" />
                  </Button>
                </div>
                
                <div className="flex-1 space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="displayName">표시 이름</Label>
                      <Input
                        id="displayName"
                        value={settings.profile.displayName}
                        onChange={(e) => updateSettings('profile', 'displayName', e.target.value)}
                        placeholder="홍길동"
                      />
                    </div>
                    
                    <div>
                      <Label htmlFor="email">이메일</Label>
                      <div className="relative">
                        <Input
                          id="email"
                          value={settings.profile.email}
                          disabled
                          className="pr-10"
                        />
                        <Mail className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      </div>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="phone">전화번호</Label>
                      <div className="relative">
                        <Input
                          id="phone"
                          value={settings.profile.phone}
                          onChange={(e) => updateSettings('profile', 'phone', e.target.value)}
                          placeholder="010-1234-5678"
                        />
                        <Phone className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      </div>
                    </div>
                    
                    <div>
                      <Label htmlFor="company">회사</Label>
                      <div className="relative">
                        <Input
                          id="company"
                          value={settings.profile.company}
                          onChange={(e) => updateSettings('profile', 'company', e.target.value)}
                          placeholder="코드비"
                        />
                        <Building className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      </div>
                    </div>
                  </div>
                  
                  <div>
                    <Label htmlFor="bio">소개</Label>
                    <Textarea
                      id="bio"
                      value={settings.profile.bio}
                      onChange={(e) => updateSettings('profile', 'bio', e.target.value)}
                      placeholder="간단한 자기소개를 작성해주세요"
                      rows={3}
                    />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* 알림 설정 */}
        <TabsContent value="notifications" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>알림 채널</CardTitle>
              <CardDescription>알림을 받을 방법을 선택하세요</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Mail className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <p className="font-medium">이메일 알림</p>
                    <p className="text-sm text-muted-foreground">중요한 업데이트를 이메일로 받습니다</p>
                  </div>
                </div>
                <Switch
                  checked={settings.notifications.email}
                  onCheckedChange={(checked) => updateSettings('notifications', 'email', checked)}
                />
              </div>
              
              <Separator />
              
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Bell className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <p className="font-medium">푸시 알림</p>
                    <p className="text-sm text-muted-foreground">브라우저 푸시 알림을 받습니다</p>
                  </div>
                </div>
                <Switch
                  checked={settings.notifications.push}
                  onCheckedChange={(checked) => updateSettings('notifications', 'push', checked)}
                />
              </div>
              
              <Separator />
              
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Smartphone className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <p className="font-medium">SMS 알림</p>
                    <p className="text-sm text-muted-foreground">긴급한 알림을 SMS로 받습니다</p>
                  </div>
                </div>
                <Switch
                  checked={settings.notifications.sms}
                  onCheckedChange={(checked) => updateSettings('notifications', 'sms', checked)}
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>알림 유형</CardTitle>
              <CardDescription>받고 싶은 알림 유형을 선택하세요</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-center justify-between">
                  <Label htmlFor="projectUpdates" className="flex items-center gap-2 cursor-pointer">
                    <Zap className="h-4 w-4" />
                    프로젝트 업데이트
                  </Label>
                  <Switch
                    id="projectUpdates"
                    checked={settings.notifications.projectUpdates}
                    onCheckedChange={(checked) => updateSettings('notifications', 'projectUpdates', checked)}
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <Label htmlFor="taskReminders" className="flex items-center gap-2 cursor-pointer">
                    <Clock className="h-4 w-4" />
                    작업 알림
                  </Label>
                  <Switch
                    id="taskReminders"
                    checked={settings.notifications.taskReminders}
                    onCheckedChange={(checked) => updateSettings('notifications', 'taskReminders', checked)}
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <Label htmlFor="newMessages" className="flex items-center gap-2 cursor-pointer">
                    <Mail className="h-4 w-4" />
                    새 메시지
                  </Label>
                  <Switch
                    id="newMessages"
                    checked={settings.notifications.newMessages}
                    onCheckedChange={(checked) => updateSettings('notifications', 'newMessages', checked)}
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <Label htmlFor="invoices" className="flex items-center gap-2 cursor-pointer">
                    <CreditCard className="h-4 w-4" />
                    청구서 알림
                  </Label>
                  <Switch
                    id="invoices"
                    checked={settings.notifications.invoices}
                    onCheckedChange={(checked) => updateSettings('notifications', 'invoices', checked)}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* 환경설정 */}
        <TabsContent value="preferences" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>표시 설정</CardTitle>
              <CardDescription>인터페이스 표시 방법을 설정합니다</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <Label className="mb-3">테마</Label>
                <div className="grid grid-cols-3 gap-3">
                  {[
                    { value: 'light', label: '라이트', icon: Sun },
                    { value: 'dark', label: '다크', icon: Moon },
                    { value: 'system', label: '시스템', icon: Monitor }
                  ].map((theme) => (
                    <Button
                      key={theme.value}
                      variant={settings.preferences.theme === theme.value ? 'default' : 'outline'}
                      className="justify-start"
                      onClick={() => updateSettings('preferences', 'theme', theme.value)}
                    >
                      <theme.icon className="h-4 w-4 mr-2" />
                      {theme.label}
                    </Button>
                  ))}
                </div>
              </div>
              
              <div>
                <Label htmlFor="language">언어</Label>
                <Select
                  value={settings.preferences.language}
                  onValueChange={(value) => updateSettings('preferences', 'language', value)}
                >
                  <SelectTrigger id="language">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ko">한국어</SelectItem>
                    <SelectItem value="en">English</SelectItem>
                    <SelectItem value="ja">日本語</SelectItem>
                    <SelectItem value="zh">中文</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="timezone">시간대</Label>
                  <Select
                    value={settings.preferences.timezone}
                    onValueChange={(value) => updateSettings('preferences', 'timezone', value)}
                  >
                    <SelectTrigger id="timezone">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Asia/Seoul">서울 (GMT+9)</SelectItem>
                      <SelectItem value="Asia/Tokyo">도쿄 (GMT+9)</SelectItem>
                      <SelectItem value="America/New_York">뉴욕 (GMT-5)</SelectItem>
                      <SelectItem value="Europe/London">런던 (GMT+0)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <Label htmlFor="dateFormat">날짜 형식</Label>
                  <Select
                    value={settings.preferences.dateFormat}
                    onValueChange={(value) => updateSettings('preferences', 'dateFormat', value)}
                  >
                    <SelectTrigger id="dateFormat">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="YYYY-MM-DD">2024-01-20</SelectItem>
                      <SelectItem value="MM/DD/YYYY">01/20/2024</SelectItem>
                      <SelectItem value="DD/MM/YYYY">20/01/2024</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">컴팩트 모드</p>
                  <p className="text-sm text-muted-foreground">더 많은 콘텐츠를 한 화면에 표시합니다</p>
                </div>
                <Switch
                  checked={settings.preferences.compactMode}
                  onCheckedChange={(checked) => updateSettings('preferences', 'compactMode', checked)}
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* 개인정보 설정 */}
        <TabsContent value="privacy" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>프로필 공개 설정</CardTitle>
              <CardDescription>프로필 정보 공개 범위를 설정합니다</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <Label>프로필 공개 범위</Label>
                <div className="grid grid-cols-3 gap-3 mt-3">
                  {[
                    { value: 'public', label: '전체 공개' },
                    { value: 'team', label: '팀원에게만' },
                    { value: 'private', label: '비공개' }
                  ].map((option) => (
                    <Button
                      key={option.value}
                      variant={settings.privacy.profileVisibility === option.value ? 'default' : 'outline'}
                      onClick={() => updateSettings('privacy', 'profileVisibility', option.value)}
                    >
                      {option.label}
                    </Button>
                  ))}
                </div>
              </div>
              
              <Separator />
              
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <Label htmlFor="showEmail" className="cursor-pointer">
                    이메일 주소 공개
                  </Label>
                  <Switch
                    id="showEmail"
                    checked={settings.privacy.showEmail}
                    onCheckedChange={(checked) => updateSettings('privacy', 'showEmail', checked)}
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <Label htmlFor="showPhone" className="cursor-pointer">
                    전화번호 공개
                  </Label>
                  <Switch
                    id="showPhone"
                    checked={settings.privacy.showPhone}
                    onCheckedChange={(checked) => updateSettings('privacy', 'showPhone', checked)}
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <Label htmlFor="activityStatus" className="cursor-pointer">
                    활동 상태 표시
                  </Label>
                  <Switch
                    id="activityStatus"
                    checked={settings.privacy.activityStatus}
                    onCheckedChange={(checked) => updateSettings('privacy', 'activityStatus', checked)}
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <Label htmlFor="readReceipts" className="cursor-pointer">
                    읽음 확인 표시
                  </Label>
                  <Switch
                    id="readReceipts"
                    checked={settings.privacy.readReceipts}
                    onCheckedChange={(checked) => updateSettings('privacy', 'readReceipts', checked)}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* 보안 설정 */}
        <TabsContent value="security" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>계정 보안</CardTitle>
              <CardDescription>계정을 안전하게 보호하는 설정입니다</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-primary/10 rounded-lg">
                    <Shield className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <p className="font-medium">2단계 인증</p>
                    <p className="text-sm text-muted-foreground">
                      {settings.security.twoFactorEnabled ? '활성화됨' : '비활성화됨'}
                    </p>
                  </div>
                </div>
                <Button variant={settings.security.twoFactorEnabled ? 'outline' : 'default'}>
                  {settings.security.twoFactorEnabled ? '비활성화' : '활성화'}
                </Button>
              </div>
              
              <div className="space-y-4">
                <div>
                  <Label htmlFor="sessionTimeout">세션 타임아웃 (분)</Label>
                  <Select
                    value={settings.security.sessionTimeout.toString()}
                    onValueChange={(value) => updateSettings('security', 'sessionTimeout', parseInt(value))}
                  >
                    <SelectTrigger id="sessionTimeout">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="15">15분</SelectItem>
                      <SelectItem value="30">30분</SelectItem>
                      <SelectItem value="60">1시간</SelectItem>
                      <SelectItem value="120">2시간</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <Label htmlFor="passwordExpiry">비밀번호 변경 주기 (일)</Label>
                  <Select
                    value={settings.security.passwordExpiry.toString()}
                    onValueChange={(value) => updateSettings('security', 'passwordExpiry', parseInt(value))}
                  >
                    <SelectTrigger id="passwordExpiry">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="30">30일</SelectItem>
                      <SelectItem value="60">60일</SelectItem>
                      <SelectItem value="90">90일</SelectItem>
                      <SelectItem value="180">180일</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="flex items-center justify-between">
                  <Label htmlFor="loginAlerts" className="cursor-pointer">
                    로그인 알림
                  </Label>
                  <Switch
                    id="loginAlerts"
                    checked={settings.security.loginAlerts}
                    onCheckedChange={(checked) => updateSettings('security', 'loginAlerts', checked)}
                  />
                </div>
              </div>
              
              <Separator />
              
              <div className="space-y-3">
                <Button variant="outline" className="w-full justify-start">
                  <Key className="h-4 w-4 mr-2" />
                  비밀번호 변경
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  <RefreshCcw className="h-4 w-4 mr-2" />
                  활성 세션 관리
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}