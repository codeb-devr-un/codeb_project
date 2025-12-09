'use client'

const isDev = process.env.NODE_ENV === 'development'

import React, { useState, useEffect } from 'react'
import FileUpload from '@/components/files/FileUpload'
import FileList, { FileItem } from '@/components/files/FileList'
import { useAuth } from '@/lib/auth-context'
import toast from 'react-hot-toast'
// import fileService from '@/services/file-service'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { File, HardDrive, Clock, Download } from 'lucide-react'

// ===========================================
// Glass Morphism Files Page
// ===========================================

interface DownloadHistory {
  id: string
  fileId: string
  fileName: string
  downloadedBy: string
  downloadedAt: Date
  userAgent?: string
}

export default function FilesPage() {
  const { user, userProfile } = useAuth()
  const [activeTab, setActiveTab] = useState<'files' | 'history'>('files')
  const [files, setFiles] = useState<FileItem[]>([])
  const [loading, setLoading] = useState(true)
  const [downloadHistory, setDownloadHistory] = useState<DownloadHistory[]>([])

  // Firebase에서 파일 목록 로드
  useEffect(() => {
    loadFiles()
  }, [])

  const loadFiles = async () => {
    try {
      setLoading(true)
      // const filesList = await fileService.getFiles()
      setFiles([])
    } catch (error) {
      if (isDev) console.error('Failed to load files:', error)
      toast.error('파일 목록을 불러오는데 실패했습니다.')
    } finally {
      setLoading(false)
    }
  }

  const handleUpload = async (newFiles: File[]) => {
    toast.error('파일 업로드 기능은 현재 사용할 수 없습니다.')
  }

  const getFileCategory = (type: string): FileItem['category'] => {
    if (type.startsWith('image/')) return 'image'
    if (type.startsWith('video/')) return 'video'
    if (type.includes('pdf') || type.includes('document') || type.includes('text')) return 'document'
    return 'other'
  }

  const handleDownload = async (file: FileItem) => {
    toast.error('파일 다운로드 기능은 현재 사용할 수 없습니다.')
  }

  const handleDelete = async (file: FileItem) => {
    toast.error('파일 삭제 기능은 현재 사용할 수 없습니다.')
  }

  const canDelete = userProfile?.role === 'admin'
  const canViewHistory = userProfile?.role === 'admin'

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('ko-KR', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-lime-400"></div>
      </div>
    )
  }

  // 통계 계산
  const stats = {
    totalFiles: files.length,
    totalSize: files.reduce((sum, file) => sum + file.size, 0),
    recentUploads: files.filter(file => {
      const dayAgo = new Date()
      dayAgo.setDate(dayAgo.getDate() - 7)
      return file.createdAt > dayAgo
    }).length,
    totalDownloads: downloadHistory.length
  }

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return bytes + ' B'
    if (bytes < 1048576) return Math.round(bytes / 1024) + ' KB'
    return (bytes / 1048576).toFixed(1) + ' MB'
  }

  return (
    <div className="w-full max-w-[1920px] mx-auto px-6 py-6 space-y-6">
      {/* 헤더 - Glass Style */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-slate-900">파일 관리</h1>
        <p className="text-slate-500 mt-1">프로젝트 관련 파일을 업로드하고 관리합니다.</p>
      </div>

      {/* 통계 카드 - Glass Style */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card variant="glass" className="hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-500">전체 파일</p>
                <p className="text-2xl font-bold text-slate-900">{stats.totalFiles}</p>
              </div>
              <div className="p-3 bg-lime-100 rounded-xl">
                <File className="h-6 w-6 text-lime-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card variant="glass" className="hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-500">전체 용량</p>
                <p className="text-2xl font-bold text-slate-900">{formatFileSize(stats.totalSize)}</p>
              </div>
              <div className="p-3 bg-slate-100 rounded-xl">
                <HardDrive className="h-6 w-6 text-slate-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card variant="glass" className="hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-500">최근 업로드</p>
                <p className="text-2xl font-bold text-slate-900">{stats.recentUploads}</p>
              </div>
              <div className="p-3 bg-amber-100 rounded-xl">
                <Clock className="h-6 w-6 text-amber-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card variant="glass" className="hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-500">다운로드</p>
                <p className="text-2xl font-bold text-slate-900">{stats.totalDownloads}</p>
              </div>
              <div className="p-3 bg-violet-100 rounded-xl">
                <Download className="h-6 w-6 text-violet-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* 탭 네비게이션 - Glass Style */}
      <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as 'files' | 'history')}>
        <TabsList className="bg-white/60 backdrop-blur-sm p-1 rounded-xl border border-white/40">
          <TabsTrigger value="files" className="data-[state=active]:bg-black data-[state=active]:text-lime-400 rounded-lg">파일 목록</TabsTrigger>
          {canViewHistory && (
            <TabsTrigger value="history" className="data-[state=active]:bg-black data-[state=active]:text-lime-400 rounded-lg">다운로드 이력</TabsTrigger>
          )}
        </TabsList>

        {/* 파일 관리 탭 */}
        <TabsContent value="files" className="space-y-6 mt-6">
          {/* 업로드 영역 */}
          {(userProfile?.role === 'admin' || userProfile?.role === 'member') && (
            <Card variant="glass">
              <CardHeader>
                <CardTitle className="text-slate-900">파일 업로드</CardTitle>
              </CardHeader>
              <CardContent>
                <FileUpload
                  onUpload={handleUpload}
                  maxSize={100}
                  acceptedTypes={['*']}
                />
              </CardContent>
            </Card>
          )}

          {/* 파일 목록 */}
          <Card variant="glass">
            <CardHeader>
              <CardTitle className="text-slate-900">파일 목록</CardTitle>
            </CardHeader>
            <CardContent>
              <FileList
                files={files}
                onDownload={handleDownload}
                onDelete={handleDelete}
                canDelete={canDelete}
              />
            </CardContent>
          </Card>
        </TabsContent>

        {/* 다운로드 이력 탭 */}
        {canViewHistory && (
          <TabsContent value="history" className="mt-6">
            <Card variant="glass">
              <CardHeader>
                <CardTitle className="text-slate-900">다운로드 이력</CardTitle>
              </CardHeader>
              <CardContent>
                {downloadHistory.length === 0 ? (
                  <div className="text-center py-12">
                    <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-slate-100 flex items-center justify-center">
                      <Download className="w-8 h-8 text-slate-400" />
                    </div>
                    <p className="text-slate-500">다운로드 이력이 없습니다.</p>
                  </div>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow className="border-white/40">
                        <TableHead className="text-slate-700">파일명</TableHead>
                        <TableHead className="text-slate-700">다운로드한 사용자</TableHead>
                        <TableHead className="text-slate-700">다운로드 시간</TableHead>
                        <TableHead className="text-slate-700">브라우저</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {downloadHistory.map((history) => (
                        <TableRow key={history.id} className="border-white/40 hover:bg-white/60">
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <Download className="h-4 w-4 text-slate-400" />
                              <span className="font-medium text-slate-900">{history.fileName}</span>
                            </div>
                          </TableCell>
                          <TableCell className="text-slate-700">{history.downloadedBy}</TableCell>
                          <TableCell className="text-slate-500">
                            {formatDate(history.downloadedAt)}
                          </TableCell>
                          <TableCell className="text-slate-500">
                            {history.userAgent}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        )}
      </Tabs>
    </div>
  )
}