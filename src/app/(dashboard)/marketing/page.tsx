'use client'

import React, { useState, useEffect } from 'react'
import { useAuth } from '@/lib/auth-context'
import { KanbanBoardPro } from '@/components/kanban'
import marketingService, { MarketingLead, MarketingColumn } from '@/services/marketing-service'
import { motion, AnimatePresence } from 'framer-motion'
import toast from 'react-hot-toast'
import { TaskPriority, TaskStatus } from '@/types/task'

interface KanbanColumn {
  id: string
  title: string
  color: string
  limit?: number
  tasks: any[]
}

interface LeadFormData {
  companyName: string
  contactPerson: string
  email: string
  phone: string
  title: string
  description: string
  budget: string
  source: MarketingLead['source']
  priority: MarketingLead['priority']
  assignedTo: string
  scheduledMeetingDate: string
  notes: string
}

export default function MarketingPage() {
  const { user, userProfile } = useAuth()
  const [leads, setLeads] = useState<MarketingLead[]>([])
  const [columns, setColumns] = useState<MarketingColumn[]>([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [editingLead, setEditingLead] = useState<MarketingLead | null>(null)
  const [selectedColumnId, setSelectedColumnId] = useState<string>('inquiry')
  const [showStats, setShowStats] = useState(true)
  const [stats, setStats] = useState({
    totalLeads: 0,
    leadsByStatus: {} as Record<string, number>,
    conversionRate: 0,
    totalContractValue: 0
  })

  const [formData, setFormData] = useState<LeadFormData>({
    companyName: '',
    contactPerson: '',
    email: '',
    phone: '',
    title: '',
    description: '',
    budget: '',
    source: 'website',
    priority: 'medium',
    assignedTo: '',
    scheduledMeetingDate: '',
    notes: ''
  })

  // 초기 데이터 로드
  useEffect(() => {
    loadInitialData()
  }, [])

  const loadInitialData = async () => {
    try {
      const [columnsData, leadsData, statsData] = await Promise.all([
        marketingService.getMarketingColumns(),
        marketingService.getLeads(),
        marketingService.getStatistics()
      ])
      
      setColumns(columnsData)
      setLeads(leadsData)
      setStats(statsData)
      setLoading(false)
    } catch (error) {
      console.error('Error loading data:', error)
      toast.error('데이터를 불러오는데 실패했습니다.')
      setLoading(false)
    }
  }

  // 리드 실시간 구독
  useEffect(() => {
    const unsubscribe = marketingService.subscribeToLeads((updatedLeads) => {
      setLeads(updatedLeads)
      // 통계 업데이트
      marketingService.getStatistics().then(setStats)
    })

    return () => unsubscribe()
  }, [])

  // 칸반보드용 데이터 변환
  const kanbanColumns: KanbanColumn[] = columns.map(col => ({
    ...col,
    tasks: leads
      .filter(lead => lead.status === col.id)
      .map(lead => ({
        id: lead.id,
        columnId: col.id,
        order: lead.columnOrder,
        projectId: 'marketing', // Marketing leads don't have projectId
        title: lead.companyName,
        description: lead.title,
        priority: lead.priority === 'low' ? TaskPriority.LOW :
                  lead.priority === 'medium' ? TaskPriority.MEDIUM :
                  lead.priority === 'high' ? TaskPriority.HIGH : TaskPriority.MEDIUM,
        status: col.id === 'inquiry' ? TaskStatus.TODO :
                col.id === 'proposal-sent' ? TaskStatus.IN_PROGRESS :
                col.id === 'negotiation' ? TaskStatus.REVIEW :
                col.id === 'contract-success' ? TaskStatus.DONE : TaskStatus.TODO,
        labels: [lead.source],
        assignee: lead.assignedTo,
        assigneeId: lead.assignedTo,
        assigneeName: lead.assignedTo,
        dueDate: lead.scheduledMeetingDate ? new Date(lead.scheduledMeetingDate) : undefined,
        attachments: [],
        checklist: lead.quotedAmount ? [
          { id: 'budget', text: `예산: ${new Intl.NumberFormat('ko-KR', { style: 'currency', currency: 'KRW' }).format(lead.quotedAmount)}`, completed: true }
        ] : [],
        createdAt: new Date(lead.createdAt),
        updatedAt: new Date(lead.updatedAt),
        createdBy: lead.createdBy,
        attachmentCount: lead.attachments?.length || 0,
        commentCount: 0
      }))
  }))

  // 리드 생성/수정
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    try {
      if (editingLead) {
        // 리드 수정
        await marketingService.updateLead(editingLead.id, {
          companyName: formData.companyName,
          contactPerson: formData.contactPerson,
          email: formData.email,
          phone: formData.phone,
          title: formData.title,
          description: formData.description,
          budget: formData.budget ? Number(formData.budget) : undefined,
          source: formData.source,
          priority: formData.priority,
          assignedTo: formData.assignedTo,
          scheduledMeetingDate: formData.scheduledMeetingDate,
          notes: formData.notes
        })
        toast.success('리드가 수정되었습니다.')
      } else {
        // 리드 생성
        const columnLeads = leads.filter(l => l.status === selectedColumnId)
        await marketingService.createLead({
          companyName: formData.companyName,
          contactPerson: formData.contactPerson,
          email: formData.email,
          phone: formData.phone,
          title: formData.title,
          description: formData.description,
          budget: formData.budget ? Number(formData.budget) : undefined,
          source: formData.source,
          status: selectedColumnId as MarketingLead['status'],
          priority: formData.priority,
          assignedTo: formData.assignedTo,
          scheduledMeetingDate: formData.scheduledMeetingDate,
          notes: formData.notes,
          createdBy: userProfile?.displayName || user?.email || '알 수 없음',
          columnOrder: columnLeads.length
        })
        toast.success('새 리드가 추가되었습니다.')
      }
      
      handleCloseModal()
    } catch (error) {
      console.error('Error saving lead:', error)
      toast.error('리드 저장 중 오류가 발생했습니다.')
    }
  }

  // 모달 닫기
  const handleCloseModal = () => {
    setShowModal(false)
    setEditingLead(null)
    setFormData({
      companyName: '',
      contactPerson: '',
      email: '',
      phone: '',
      title: '',
      description: '',
      budget: '',
      source: 'website',
      priority: 'medium',
      assignedTo: '',
      scheduledMeetingDate: '',
      notes: ''
    })
  }

  // 리드 수정
  const handleTaskEdit = (task: any) => {
    const lead = leads.find(l => l.id === task.id)
    if (!lead) return

    setEditingLead(lead)
    setFormData({
      companyName: lead.companyName,
      contactPerson: lead.contactPerson,
      email: lead.email,
      phone: lead.phone || '',
      title: lead.title,
      description: lead.description || '',
      budget: lead.budget?.toString() || '',
      source: lead.source,
      priority: lead.priority,
      assignedTo: lead.assignedTo || '',
      scheduledMeetingDate: lead.scheduledMeetingDate || '',
      notes: lead.notes || ''
    })
    setShowModal(true)
  }

  // 리드 삭제
  const handleTaskDelete = async (taskId: string) => {
    if (!confirm('정말 이 리드를 삭제하시겠습니까?')) return
    
    try {
      await marketingService.deleteLead(taskId)
      toast.success('리드가 삭제되었습니다.')
    } catch (error) {
      console.error('Error deleting lead:', error)
      toast.error('리드 삭제 중 오류가 발생했습니다.')
    }
  }

  // 칸반보드 컬럼 변경 처리 (드래그 앤 드롭)
  const handleColumnsChange = async (newColumns: KanbanColumn[]) => {
    // Extract lead updates from the new column state
    const updates: Array<{ id: string; status: string; columnOrder: number }> = []
    
    newColumns.forEach(column => {
      column.tasks.forEach((task, index) => {
        const lead = leads.find(l => l.id === task.id)
        if (lead && (lead.status !== column.id || lead.columnOrder !== index)) {
          updates.push({
            id: task.id,
            status: column.id,
            columnOrder: index
          })
        }
      })
    })
    
    if (updates.length > 0) {
      await marketingService.updateLeadsOrder(updates)
    }
  }

  const sourceLabels: Record<MarketingLead['source'], string> = {
    website: '웹사이트',
    email: '이메일',
    referral: '추천',
    social: '소셜미디어',
    event: '이벤트',
    other: '기타'
  }

  const priorityColors = {
    low: 'text-green-600',
    medium: 'text-yellow-600',
    high: 'text-red-600'
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    )
  }

  return (
    <div className="w-full max-w-[1920px] mx-auto px-6 py-6 space-y-6">
      {/* 헤더 */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">마케팅 파이프라인</h1>
          <p className="text-gray-600 mt-1">영업 리드를 관리하고 추적합니다.</p>
        </div>
        
        <div className="flex gap-3">
          <button
            onClick={() => setShowStats(!showStats)}
            className="btn btn-secondary"
          >
            {showStats ? '통계 숨기기' : '통계 보기'}
          </button>
          <button
            onClick={() => {
              setSelectedColumnId('inquiry')
              setShowModal(true)
            }}
            className="btn btn-primary"
          >
            + 새 리드
          </button>
        </div>
      </div>

      {/* 통계 */}
      {showStats && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-white rounded-lg p-4 shadow-sm">
            <div className="text-sm text-gray-600">전체 리드</div>
            <div className="text-2xl font-bold text-gray-900">{stats.totalLeads}</div>
          </div>
          <div className="bg-white rounded-lg p-4 shadow-sm">
            <div className="text-sm text-gray-600">전환율</div>
            <div className="text-2xl font-bold text-green-600">{stats.conversionRate.toFixed(1)}%</div>
          </div>
          <div className="bg-white rounded-lg p-4 shadow-sm">
            <div className="text-sm text-gray-600">진행 중</div>
            <div className="text-2xl font-bold text-blue-600">
              {stats.totalLeads - (stats.leadsByStatus['contract-success'] || 0)}
            </div>
          </div>
          <div className="bg-white rounded-lg p-4 shadow-sm">
            <div className="text-sm text-gray-600">총 계약 금액</div>
            <div className="text-2xl font-bold text-purple-600">
              {new Intl.NumberFormat('ko-KR', { 
                style: 'currency', 
                currency: 'KRW',
                maximumFractionDigits: 0
              }).format(stats.totalContractValue)}
            </div>
          </div>
        </div>
      )}

      {/* 칸반보드 */}
      <div className="bg-white rounded-xl shadow-sm overflow-hidden" style={{ height: '600px' }}>
        <div className="h-full overflow-hidden">
          <KanbanBoardPro
            columns={kanbanColumns}
            onColumnsChange={handleColumnsChange}
            onTaskAdd={(columnId) => {
              setSelectedColumnId(columnId)
              setShowModal(true)
            }}
            onTaskEdit={handleTaskEdit}
            onTaskDelete={handleTaskDelete}
          />
        </div>
      </div>

      {/* 리드 생성/수정 모달 */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-xl w-full max-w-2xl max-h-[90vh] overflow-hidden"
          >
            <div className="px-6 py-4 border-b">
              <h2 className="text-xl font-bold text-gray-900">
                {editingLead ? '리드 수정' : '새 리드 추가'}
              </h2>
            </div>

            <form onSubmit={handleSubmit} className="p-6 overflow-y-auto max-h-[calc(90vh-120px)]">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    회사명 *
                  </label>
                  <input
                    type="text"
                    value={formData.companyName}
                    onChange={(e) => setFormData({ ...formData, companyName: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    담당자명 *
                  </label>
                  <input
                    type="text"
                    value={formData.contactPerson}
                    onChange={(e) => setFormData({ ...formData, contactPerson: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    이메일 *
                  </label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    전화번호
                  </label>
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    문의 제목 *
                  </label>
                  <input
                    type="text"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary"
                    required
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    상세 내용
                  </label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary"
                    rows={3}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    예상 예산
                  </label>
                  <input
                    type="number"
                    value={formData.budget}
                    onChange={(e) => setFormData({ ...formData, budget: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary"
                    placeholder="10000000"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    유입 경로
                  </label>
                  <select
                    value={formData.source}
                    onChange={(e) => setFormData({ ...formData, source: e.target.value as MarketingLead['source'] })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary"
                  >
                    {Object.entries(sourceLabels).map(([value, label]) => (
                      <option key={value} value={value}>{label}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    우선순위
                  </label>
                  <select
                    value={formData.priority}
                    onChange={(e) => setFormData({ ...formData, priority: e.target.value as MarketingLead['priority'] })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary"
                  >
                    <option value="low">낮음</option>
                    <option value="medium">보통</option>
                    <option value="high">높음</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    담당자
                  </label>
                  <input
                    type="text"
                    value={formData.assignedTo}
                    onChange={(e) => setFormData({ ...formData, assignedTo: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary"
                    placeholder="담당자 이름"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    미팅 예정일
                  </label>
                  <input
                    type="datetime-local"
                    value={formData.scheduledMeetingDate}
                    onChange={(e) => setFormData({ ...formData, scheduledMeetingDate: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    메모
                  </label>
                  <textarea
                    value={formData.notes}
                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary"
                    rows={3}
                  />
                </div>
              </div>

              <div className="flex gap-3 mt-6">
                <button
                  type="button"
                  onClick={handleCloseModal}
                  className="flex-1 btn btn-secondary"
                >
                  취소
                </button>
                <button
                  type="submit"
                  className="flex-1 btn btn-primary"
                >
                  {editingLead ? '수정' : '추가'}
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </div>
  )
}