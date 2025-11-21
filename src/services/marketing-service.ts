import { database } from '@/lib/firebase'
import { ref as dbRef, push, set, get, update, remove, onValue, off } from 'firebase/database'
import { MarketingActivity } from '@/types/services'

export interface MarketingLead {
  id: string
  companyName: string
  contactPerson: string
  email: string
  phone?: string
  title: string
  description?: string
  budget?: number
  source: 'website' | 'email' | 'referral' | 'social' | 'event' | 'other'
  status: 'inquiry' | 'email-sent' | 'meeting-scheduled' | 'quote-requested' | 'contract-requested' | 'contract-success'
  priority: 'low' | 'medium' | 'high'
  assignedTo?: string
  scheduledMeetingDate?: string
  quotedAmount?: number
  notes?: string
  attachments?: string[]
  createdAt: string
  updatedAt: string
  createdBy: string
  columnOrder: number
}

export interface MarketingColumn {
  id: string
  title: string
  color: string
  order: number
}

class MarketingService {
  // 기본 칸반 컬럼
  private defaultColumns: MarketingColumn[] = [
    { id: 'inquiry', title: '의뢰 문의', color: '#3b82f6', order: 0 },
    { id: 'email-sent', title: '메일 전송', color: '#8b5cf6', order: 1 },
    { id: 'meeting-scheduled', title: '미팅 예정', color: '#ec4899', order: 2 },
    { id: 'quote-requested', title: '견적 요청', color: '#f59e0b', order: 3 },
    { id: 'contract-requested', title: '계약 요청', color: '#ef4444', order: 4 },
    { id: 'contract-success', title: '계약 성공', color: '#10b981', order: 5 }
  ]

  // 마케팅 칸반 컬럼 가져오기
  async getMarketingColumns(): Promise<MarketingColumn[]> {
    const columnsRef = dbRef(database, 'marketing/columns')
    const snapshot = await get(columnsRef)
    
    if (!snapshot.exists()) {
      // 기본 컬럼 생성
      for (const column of this.defaultColumns) {
        await set(dbRef(database, `marketing/columns/${column.id}`), column)
      }
      return this.defaultColumns
    }
    
    const columns: MarketingColumn[] = []
    snapshot.forEach((child) => {
      columns.push(child.val())
    })
    
    return columns.sort((a, b) => a.order - b.order)
  }

  // 모든 리드 가져오기
  async getLeads(): Promise<MarketingLead[]> {
    const leadsRef = dbRef(database, 'marketing/leads')
    const snapshot = await get(leadsRef)
    
    if (!snapshot.exists()) return []
    
    const leads: MarketingLead[] = []
    snapshot.forEach((child) => {
      leads.push({
        id: child.key!,
        ...child.val()
      })
    })
    
    return leads.sort((a, b) => a.columnOrder - b.columnOrder)
  }

  // 리드 생성
  async createLead(leadData: Omit<MarketingLead, 'id' | 'createdAt' | 'updatedAt'>): Promise<MarketingLead> {
    const leadsRef = dbRef(database, 'marketing/leads')
    const newLeadRef = push(leadsRef)
    
    const newLead = {
      ...leadData,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }
    
    await set(newLeadRef, newLead)
    
    // 활동 로그 추가
    await this.addActivity({
      type: 'lead',
      message: `새 리드 "${leadData.companyName}" 추가`,
      user: leadData.createdBy,
      leadId: newLeadRef.key!
    })
    
    return {
      id: newLeadRef.key!,
      ...newLead
    }
  }

  // 리드 업데이트
  async updateLead(leadId: string, updates: Partial<MarketingLead>): Promise<void> {
    const leadRef = dbRef(database, `marketing/leads/${leadId}`)
    
    // 상태 변경 시 활동 로그
    if (updates.status) {
      const currentLead = await get(leadRef)
      if (currentLead.exists()) {
        const oldStatus = currentLead.val().status
        if (oldStatus !== updates.status) {
          await this.addActivity({
            type: 'status',
            message: `상태 변경: ${this.getStatusLabel(oldStatus)} → ${this.getStatusLabel(updates.status)}`,
            user: updates.updatedAt || 'System',
            leadId
          })
        }
      }
    }
    
    await update(leadRef, {
      ...updates,
      updatedAt: new Date().toISOString()
    })
  }

  // 리드 삭제
  async deleteLead(leadId: string): Promise<void> {
    const leadRef = dbRef(database, `marketing/leads/${leadId}`)
    await remove(leadRef)
    
    // 관련 활동 로그도 삭제
    const activitiesRef = dbRef(database, `marketing/activities`)
    const snapshot = await get(activitiesRef)
    
    if (snapshot.exists()) {
      const updates: Record<string, null> = {}
      snapshot.forEach((child) => {
        if (child.val().leadId === leadId) {
          updates[`marketing/activities/${child.key}`] = null
        }
      })
      await update(dbRef(database), updates)
    }
  }

  // 리드 순서 업데이트 (드래그 앤 드롭)
  async updateLeadsOrder(leads: { id: string; status: string; columnOrder: number }[]): Promise<void> {
    const updates: Record<string, any> = {}
    
    leads.forEach(lead => {
      updates[`marketing/leads/${lead.id}/status`] = lead.status
      updates[`marketing/leads/${lead.id}/columnOrder`] = lead.columnOrder
      updates[`marketing/leads/${lead.id}/updatedAt`] = new Date().toISOString()
    })
    
    await update(dbRef(database), updates)
  }

  // 활동 로그 추가
  async addActivity(activity: {
    type: string
    message: string
    user: string
    leadId?: string
  }): Promise<void> {
    const activityRef = dbRef(database, 'marketing/activities')
    const newActivityRef = push(activityRef)
    
    await set(newActivityRef, {
      ...activity,
      timestamp: new Date().toISOString()
    })
  }

  // 활동 로그 가져오기
  async getActivities(leadId?: string): Promise<MarketingActivity[]> {
    const activitiesRef = dbRef(database, 'marketing/activities')
    const snapshot = await get(activitiesRef)
    
    if (!snapshot.exists()) return []
    
    const activities: MarketingActivity[] = []
    snapshot.forEach((child) => {
      const activity = { id: child.key!, ...child.val() }
      if (!leadId || activity.leadId === leadId) {
        activities.push(activity)
      }
    })
    
    return activities.sort((a, b) => 
      new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    )
  }

  // 리드 실시간 구독
  subscribeToLeads(callback: (leads: MarketingLead[]) => void): () => void {
    const leadsRef = dbRef(database, 'marketing/leads')
    
    const listener = onValue(leadsRef, (snapshot) => {
      const leads: MarketingLead[] = []
      
      if (snapshot.exists()) {
        snapshot.forEach((child) => {
          leads.push({
            id: child.key!,
            ...child.val()
          })
        })
      }
      
      callback(leads.sort((a, b) => a.columnOrder - b.columnOrder))
    })
    
    return () => off(leadsRef, 'value', listener)
  }

  // 통계 가져오기
  async getStatistics(): Promise<{
    totalLeads: number
    leadsByStatus: Record<string, number>
    conversionRate: number
    totalContractValue: number
  }> {
    const leads = await this.getLeads()
    
    const stats = {
      totalLeads: leads.length,
      leadsByStatus: {} as Record<string, number>,
      conversionRate: 0,
      totalContractValue: 0
    }
    
    leads.forEach(lead => {
      stats.leadsByStatus[lead.status] = (stats.leadsByStatus[lead.status] || 0) + 1
      if (lead.status === 'contract-success' && lead.quotedAmount) {
        stats.totalContractValue += lead.quotedAmount
      }
    })
    
    if (stats.totalLeads > 0) {
      stats.conversionRate = ((stats.leadsByStatus['contract-success'] || 0) / stats.totalLeads) * 100
    }
    
    return stats
  }

  // 상태 라벨 가져오기
  private getStatusLabel(status: string): string {
    const labels: Record<string, string> = {
      'inquiry': '의뢰 문의',
      'email-sent': '메일 전송',
      'meeting-scheduled': '미팅 예정',
      'quote-requested': '견적 요청',
      'contract-requested': '계약 요청',
      'contract-success': '계약 성공'
    }
    return labels[status] || status
  }
}

export default new MarketingService()