import { AIAssistantMessage } from '@/types/ai'
import { ProjectData, AIMetrics } from '@/types/services'
import logger from '@/utils/logger'

export interface AIContext {
  projectId?: string
  projectName?: string
  userRole?: string
  currentPage?: string
  recentActivities?: string[]
}

export interface AIAnalysis {
  type: 'project' | 'performance' | 'suggestion' | 'risk'
  title: string
  summary: string
  details: string[]
  metrics?: {
    progress: number
    quality: number
    budget: number
    efficiency: number
    satisfaction: number
  }
  recommendations?: string[]
  priority?: 'low' | 'medium' | 'high'
}

class AIService {
  private context: AIContext = {}

  setContext(context: Partial<AIContext>) {
    this.context = { ...this.context, ...context }
  }

  async processMessage(message: string): Promise<string> {
    // 실제 구현에서는 OpenAI API 또는 다른 AI 서비스 호출
    const analysis = this.analyzeMessage(message)
    return this.generateResponse(analysis, message)
  }

  private analyzeMessage(message: string): string {
    const lowerMessage = message.toLowerCase()
    
    // 의도 분석
    if (lowerMessage.includes('분석') || lowerMessage.includes('현황')) {
      return 'analysis'
    } else if (lowerMessage.includes('추천') || lowerMessage.includes('제안')) {
      return 'recommendation'
    } else if (lowerMessage.includes('문제') || lowerMessage.includes('이슈')) {
      return 'troubleshooting'
    } else if (lowerMessage.includes('일정') || lowerMessage.includes('계획')) {
      return 'planning'
    } else if (lowerMessage.includes('비용') || lowerMessage.includes('예산')) {
      return 'budget'
    }
    
    return 'general'
  }

  private generateResponse(intent: string, originalMessage: string): string {
    const contextInfo = this.context.projectName ? `(${this.context.projectName} 프로젝트)` : ''
    
    switch (intent) {
      case 'analysis':
        return this.generateAnalysisResponse(contextInfo)
      case 'recommendation':
        return this.generateRecommendationResponse(contextInfo)
      case 'troubleshooting':
        return this.generateTroubleshootingResponse(contextInfo)
      case 'planning':
        return this.generatePlanningResponse(contextInfo)
      case 'budget':
        return this.generateBudgetResponse(contextInfo)
      default:
        return this.generateGeneralResponse(originalMessage)
    }
  }

  private generateAnalysisResponse(contextInfo: string): string {
    return `프로젝트 분석 결과입니다 ${contextInfo}:

📊 **현재 상태 분석**
• 전체 진행률: 72%
• 예상 완료일: 2024년 3월 15일
• 리소스 효율성: 88%
• 품질 지표: 우수 (95점)

📈 **성과 지표**
• 일정 준수율: 94%
• 예산 집행률: 68%
• 팀 생산성: 평균 대비 +12%
• 고객 만족도: 4.8/5.0

⚡ **주요 인사이트**
1. 개발 단계가 예정보다 2일 앞서 진행 중
2. 코드 품질 메트릭이 지속적으로 개선됨
3. 팀 협업 효율성이 전월 대비 15% 향상

🎯 **추천 액션**
• 다음 스프린트 계획 시 리소스 재배치 검토
• 품질 관리 프로세스 문서화
• 고객 피드백 수집 주기 단축 (2주 → 1주)`
  }

  private generateRecommendationResponse(contextInfo: string): string {
    return `프로젝트 개선을 위한 AI 추천사항입니다 ${contextInfo}:

💡 **생산성 향상 방안**
1. **자동화 도입**
   • 반복적인 테스트 자동화 → 시간 30% 절감
   • CI/CD 파이프라인 최적화 → 배포 시간 50% 단축
   • 코드 리뷰 자동화 도구 도입

2. **프로세스 개선**
   • 데일리 스탠드업 시간 단축 (15분 → 10분)
   • 스프린트 주기 조정 검토 (2주 → 1주)
   • 비동기 커뮤니케이션 확대

3. **도구 최적화**
   • 프로젝트 관리 도구 통합
   • 실시간 협업 도구 업그레이드
   • 모니터링 대시보드 개선

🚀 **예상 효과**
• 전체 생산성 25% 향상
• 커뮤니케이션 오버헤드 40% 감소
• 품질 이슈 조기 발견율 60% 증가

📌 **우선순위 추천**
1. CI/CD 파이프라인 구축 (ROI: 높음)
2. 자동화 테스트 프레임워크 도입
3. 프로젝트 관리 도구 통합`
  }

  private generateTroubleshootingResponse(contextInfo: string): string {
    return `문제 해결을 위한 체계적 접근법입니다 ${contextInfo}:

🔍 **문제 진단 프레임워크**

1. **즉시 확인 사항**
   ✓ 최근 24시간 내 변경사항
   ✓ 시스템 로그 및 에러 메시지
   ✓ 리소스 사용률 (CPU/메모리/네트워크)
   ✓ 외부 서비스 상태

2. **근본 원인 분석 (RCA)**
   • 5 Why 기법 적용
   • 타임라인 재구성
   • 영향 범위 매핑
   • 재현 시나리오 작성

3. **해결 전략**
   🔧 **단기 조치** (0-24시간)
   - 핫픽스 배포
   - 모니터링 강화
   - 백업/롤백 준비
   
   📋 **중기 조치** (1-7일)
   - 근본 원인 해결
   - 테스트 커버리지 확대
   - 문서화 업데이트
   
   🏗️ **장기 조치** (1-4주)
   - 아키텍처 개선
   - 프로세스 재정립
   - 팀 교육 실시

💊 **예방 조치**
• 자동화된 헬스 체크 구현
• 조기 경보 시스템 구축
• 정기적인 부하 테스트
• 장애 대응 플레이북 작성`
  }

  private generatePlanningResponse(contextInfo: string): string {
    return `스마트 일정 계획 및 최적화 제안입니다 ${contextInfo}:

📅 **일정 최적화 분석**

🎯 **현재 상황**
• 남은 작업: 28개
• 가용 리소스: 5명
• 예상 소요 시간: 340시간
• 버퍼 시간: 15%

📊 **최적 일정 배치**
Week 1-2: 핵심 기능 개발 (60%)
Week 3: 통합 테스트 (20%)
Week 4: 버그 수정 및 최적화 (20%)

⚡ **크리티컬 패스**
1. API 개발 → 프론트엔드 통합 → 테스트
2. 데이터베이스 설계 → 백엔드 구현 → 성능 최적화
3. UI/UX 디자인 → 컴포넌트 개발 → 사용성 테스트

🔄 **리소스 최적화**
• 병렬 작업 가능 항목: 12개
• 의존성 해결 필요: 5개
• 아웃소싱 가능: 3개

💡 **AI 추천사항**
1. 개발자 A, B를 핵심 API 작업에 집중 배치
2. 주 2회 진행상황 체크포인트 설정
3. 위험 요소에 20% 추가 버퍼 할당
4. 매일 15분 블로커 해결 세션 운영

📈 **예상 결과**
• 일정 단축: 15%
• 리소스 효율: +22%
• 위험 감소: 35%`
  }

  private generateBudgetResponse(contextInfo: string): string {
    return `예산 분석 및 최적화 제안입니다 ${contextInfo}:

💰 **예산 현황 분석**

📊 **전체 예산 상태**
• 총 예산: ₩150,000,000
• 집행액: ₩98,500,000 (65.7%)
• 잔여 예산: ₩51,500,000
• 예상 최종 집행률: 92%

📈 **카테고리별 분석**
1. **인건비** (60%)
   - 할당: ₩90,000,000
   - 사용: ₩58,000,000
   - 효율성: 우수 ✅

2. **인프라/도구** (20%)
   - 할당: ₩30,000,000
   - 사용: ₩22,000,000
   - 절감 가능: ₩3,000,000

3. **마케팅** (10%)
   - 할당: ₩15,000,000
   - 사용: ₩8,500,000
   - 추가 투자 검토 필요

4. **예비비** (10%)
   - 할당: ₩15,000,000
   - 사용: ₩10,000,000

💡 **비용 최적화 방안**
1. **즉시 실행 가능** (절감액: ₩5,000,000)
   • 클라우드 리소스 right-sizing
   • 미사용 라이선스 정리
   • 중복 도구 통합

2. **단기 개선** (절감액: ₩8,000,000)
   • 자동화를 통한 인건비 절감
   • 오픈소스 대체재 도입
   • 계약 재협상

3. **장기 전략** (절감액: ₩15,000,000/년)
   • 인프라 현대화
   • 프로세스 표준화
   • 예측 기반 예산 관리

⚠️ **위험 요소**
• 환율 변동 리스크: 중간
• 추가 인력 필요 가능성: 높음
• 라이선스 갱신 비용: ₩5,000,000

📌 **추천 액션**
1. 월별 예산 리뷰 미팅 정례화
2. 자동 예산 알림 시스템 구축
3. 비용-효익 분석 프로세스 도입`
  }

  private generateGeneralResponse(message: string): string {
    return `네, "${message}"에 대해 이해했습니다.

제가 도와드릴 수 있는 구체적인 영역들입니다:

🎯 **프로젝트 관리**
• 일정 및 리소스 최적화
• 위험 분석 및 대응 전략
• 성과 측정 및 개선

💻 **기술 지원**
• 아키텍처 설계 검토
• 코드 품질 개선 제안
• 성능 최적화 가이드

📊 **비즈니스 인텔리전스**
• 데이터 기반 의사결정 지원
• ROI 분석 및 예측
• 경쟁력 강화 전략

🤝 **팀 협업**
• 커뮤니케이션 개선
• 프로세스 최적화
• 생산성 향상 도구

어떤 부분에 대해 더 자세한 분석이나 제안을 원하시나요?`
  }

  async analyzeProject(projectId: string): Promise<AIAnalysis> {
    try {
      // Firebase에서 실제 프로젝트 데이터 가져오기
      const { getDatabase, ref, get } = await import('firebase/database')
      const { app } = await import('@/lib/firebase')
      
      const db = getDatabase(app)
      const projectRef = ref(db, `projects/${projectId}`)
      const snapshot = await get(projectRef)
      
      if (!snapshot.exists()) {
        // 프로젝트가 없을 경우 기본값 반환
        return this.getDefaultAnalysis()
      }
      
      const projectData = snapshot.val()
      const aiMetrics = projectData.aiMetrics
      
      // AI 메트릭이 없으면 기본값 사용
      if (!aiMetrics) {
        return this.getDefaultAnalysis()
      }
      
      // 실제 데이터 기반 분석 생성
      const progress = projectData.progress || 0
      const quality = aiMetrics.qualityMetrics?.codeQualityScore || projectData.quality || 90
      const budgetUsage = projectData.budgetUsage || Math.round((aiMetrics.budgetMetrics?.budgetUsed / aiMetrics.budgetMetrics?.totalBudget) * 100) || 50
      const efficiency = aiMetrics.efficiencyMetrics?.teamProductivityScore || projectData.efficiency || 85
      const satisfaction = parseFloat(aiMetrics.satisfactionMetrics?.customerSatisfactionScore) || parseFloat(projectData.satisfaction) || 4.5
      
      // 동적 분석 내용 생성
      const details = []
      
      // 진행률 분석
      if (progress > 70) {
        details.push(`현재 진행률 ${progress}%로 프로젝트가 막바지 단계에 있습니다`)
      } else if (progress > 40) {
        details.push(`현재 진행률 ${progress}%로 중간 단계를 진행 중입니다`)
      } else {
        details.push(`현재 진행률 ${progress}%로 초기 단계입니다`)
      }
      
      // 품질 분석
      if (quality >= 90) {
        details.push('코드 품질이 매우 우수한 수준을 유지하고 있습니다')
      } else if (quality >= 80) {
        details.push('코드 품질이 양호한 수준입니다')
      } else {
        details.push('코드 품질 개선이 필요한 상황입니다')
      }
      
      // 효율성 분석
      if (efficiency >= 85) {
        details.push('팀 생산성이 매우 높은 수준을 보이고 있습니다')
      } else if (efficiency >= 70) {
        details.push('팀 생산성이 적정 수준을 유지하고 있습니다')
      } else {
        details.push('팀 생산성 향상을 위한 조치가 필요합니다')
      }
      
      // 예산 분석
      if (budgetUsage > 90) {
        details.push('예산 소진율이 높아 추가 예산 검토가 필요할 수 있습니다')
      } else if (budgetUsage < progress - 10) {
        details.push('예산 집행이 진행률 대비 효율적으로 관리되고 있습니다')
      } else {
        details.push('예산 집행이 계획대로 진행되고 있습니다')
      }
      
      // 리스크 기반 우선순위 결정
      let priority: 'low' | 'medium' | 'high' = 'medium'
      if (aiMetrics.riskMetrics?.overallRiskLevel === 'high') {
        priority = 'high'
      } else if (aiMetrics.riskMetrics?.overallRiskLevel === 'low' && progress > 80) {
        priority = 'low'
      }
      
      // 동적 추천사항 생성
      const recommendations = this.generateRecommendations(projectData, aiMetrics)
      
      return {
        type: 'project',
        title: this.generateAnalysisTitle(projectData, aiMetrics),
        summary: this.generateAnalysisSummary(projectData, aiMetrics),
        details,
        metrics: {
          progress,
          quality,
          budget: budgetUsage,
          efficiency,
          satisfaction
        },
        recommendations,
        priority
      }
    } catch (error) {
      logger.error('프로젝트 분석 중 오류', 'AIService', error)
      return this.getDefaultAnalysis()
    }
  }
  
  private getDefaultAnalysis(): AIAnalysis {
    return {
      type: 'project',
      title: '프로젝트 분석 준비 중',
      summary: '프로젝트 데이터를 수집하고 있습니다. 잠시 후 다시 확인해주세요.',
      details: [
        '프로젝트 메트릭 초기화 중',
        '데이터 수집 진행 중',
        'AI 분석 엔진 준비 중'
      ],
      metrics: {
        progress: 0,
        quality: 0,
        budget: 0,
        efficiency: 0,
        satisfaction: 0
      },
      recommendations: [
        '프로젝트 초기 설정 완료',
        '팀원 배정 및 역할 정의',
        '첫 번째 마일스톤 설정'
      ],
      priority: 'medium'
    }
  }
  
  private generateAnalysisTitle(projectData: ProjectData, aiMetrics: AIMetrics | undefined): string {
    const progress = projectData.progress || 0
    const riskLevel = aiMetrics?.riskMetrics?.overallRiskLevel || 'medium'
    
    if (progress >= 90) {
      return '프로젝트 마무리 단계 - 최종 점검 필요'
    } else if (progress >= 70) {
      return riskLevel === 'high' ? '주의 필요 - 리스크 관리 중요' : '프로젝트 후반부 - 순조로운 진행'
    } else if (progress >= 40) {
      return '프로젝트 중반 - 모멘텀 유지 중요'
    } else {
      return '프로젝트 초기 단계 - 기반 구축 중'
    }
  }
  
  private generateAnalysisSummary(projectData: ProjectData, aiMetrics: AIMetrics | undefined): string {
    const progress = projectData.progress || 0
    const quality = aiMetrics?.qualityMetrics?.codeQualityScore || 90
    const onTimeRate = aiMetrics?.efficiencyMetrics?.onTimeDeliveryRate || 85
    
    if (progress >= 80 && quality >= 90 && onTimeRate >= 80) {
      return '프로젝트가 매우 우수한 상태로 진행되고 있으며, 성공적인 완료가 예상됩니다.'
    } else if (progress >= 50 && quality >= 80) {
      return '프로젝트가 전반적으로 양호한 상태이며, 일부 개선 사항에 주의가 필요합니다.'
    } else if (onTimeRate < 70) {
      return '일정 관리에 특별한 주의가 필요하며, 리소스 재배치를 검토해야 합니다.'
    } else {
      return '프로젝트 진행 상황을 면밀히 모니터링하고 있으며, 지속적인 개선을 진행 중입니다.'
    }
  }
  
  private generateRecommendations(projectData: ProjectData, aiMetrics: AIMetrics | undefined): string[] {
    const recommendations: string[] = []
    const progress = projectData.progress || 0
    const quality = aiMetrics?.qualityMetrics?.codeQualityScore || 90
    const budgetUsage = projectData.budgetUsage || 50
    const riskLevel = aiMetrics?.riskMetrics?.overallRiskLevel || 'medium'
    const onTimeRate = aiMetrics?.efficiencyMetrics?.onTimeDeliveryRate || 85
    
    // 진행률 기반 추천
    if (progress >= 80) {
      recommendations.push('최종 테스트 및 품질 검증 강화')
      recommendations.push('배포 준비 및 롤백 계획 수립')
    } else if (progress >= 50) {
      recommendations.push('중간 점검 회의를 통한 진행 상황 평가')
    }
    
    // 품질 기반 추천
    if (quality < 85) {
      recommendations.push('코드 리뷰 프로세스 강화 필요')
      recommendations.push('자동화 테스트 커버리지 확대')
    }
    
    // 예산 기반 추천
    if (budgetUsage > progress + 10) {
      recommendations.push('예산 사용 현황 검토 및 비용 최적화 방안 모색')
    }
    
    // 리스크 기반 추천
    if (riskLevel === 'high') {
      recommendations.push('식별된 리스크에 대한 즉각적인 대응 계획 수립')
      recommendations.push('리스크 완화를 위한 추가 리소스 할당 검토')
    }
    
    // 효율성 기반 추천
    if (onTimeRate < 80) {
      recommendations.push('작업 우선순위 재조정 및 병목 현상 해결')
      recommendations.push('팀 커뮤니케이션 개선을 위한 일일 스탠드업 미팅 강화')
    }
    
    // 기본 추천사항 추가 (최대 3개까지만 반환)
    if (recommendations.length === 0) {
      recommendations.push('현재 진행 상황 유지 및 모니터링 지속')
      recommendations.push('팀원 피드백 수집 및 개선 사항 도출')
      recommendations.push('다음 마일스톤 준비 및 리소스 사전 확보')
    }
    
    return recommendations.slice(0, 3)
  }

  async predictProjectCompletion(projectId: string): Promise<{
    estimatedDate: Date
    confidence: number
    risks: string[]
  }> {
    try {
      // Firebase에서 프로젝트 데이터 가져오기
      const { getDatabase, ref, get } = await import('firebase/database')
      const { app } = await import('@/lib/firebase')
      
      const db = getDatabase(app)
      const projectRef = ref(db, `projects/${projectId}`)
      const snapshot = await get(projectRef)
      
      if (!snapshot.exists()) {
        // 기본값 반환
        return this.getDefaultPrediction()
      }
      
      const projectData = snapshot.val()
      const aiMetrics = projectData.aiMetrics
      
      // AI 예측 데이터가 있으면 사용
      if (aiMetrics?.predictions) {
        const risks: string[] = []
        
        // 리스크 분석
        if (aiMetrics.riskMetrics?.identifiedRisks) {
          aiMetrics.riskMetrics.identifiedRisks.forEach((risk) => {
            if (risk.probability !== 'low' || risk.impact === 'high') {
              risks.push(risk.description)
            }
          })
        }
        
        // 추가 리스크 평가
        if (aiMetrics.efficiencyMetrics?.onTimeDeliveryRate < 70) {
          risks.push('과거 지연 이력으로 인한 일정 지연 가능성')
        }
        
        if (aiMetrics.budgetMetrics?.budgetUsed / aiMetrics.budgetMetrics?.totalBudget > 0.9) {
          risks.push('예산 초과로 인한 범위 축소 가능성')
        }
        
        if (aiMetrics.qualityMetrics?.bugCount > 10) {
          risks.push('품질 이슈로 인한 추가 테스트 기간 필요')
        }
        
        return {
          estimatedDate: new Date(aiMetrics.predictions.estimatedCompletionDate),
          confidence: parseFloat(aiMetrics.predictions.completionConfidence),
          risks: risks.length > 0 ? risks : ['현재 식별된 주요 리스크 없음']
        }
      }
      
      // AI 메트릭이 없으면 간단한 계산으로 예측
      const startDate = new Date(projectData.startDate)
      const endDate = new Date(projectData.endDate)
      const progress = projectData.progress || 0
      
      // 남은 기간 계산
      const totalDays = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24))
      const elapsedDays = Math.ceil((new Date().getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24))
      const remainingDays = totalDays - elapsedDays
      
      // 진행률 기반 예측
      let estimatedDaysToComplete = remainingDays
      if (progress > 0) {
        const daysPerPercent = elapsedDays / progress
        estimatedDaysToComplete = Math.ceil(daysPerPercent * (100 - progress))
      }
      
      const estimatedDate = new Date()
      estimatedDate.setDate(estimatedDate.getDate() + estimatedDaysToComplete)
      
      // 신뢰도 계산 (진행률이 높을수록 신뢰도 증가)
      const confidence = 0.5 + (progress / 100) * 0.4 + (progress > 50 ? 0.1 : 0)
      
      return {
        estimatedDate,
        confidence: Math.min(confidence, 0.95),
        risks: this.generateDefaultRisks(projectData)
      }
      
    } catch (error) {
      logger.error('프로젝트 완료 예측 중 오류', 'AIService', error)
      return this.getDefaultPrediction()
    }
  }
  
  private getDefaultPrediction() {
    const estimatedDate = new Date()
    estimatedDate.setDate(estimatedDate.getDate() + 30)
    
    return {
      estimatedDate,
      confidence: 0.7,
      risks: [
        '프로젝트 데이터 수집 중',
        '정확한 예측을 위해 추가 데이터 필요',
        '초기 단계로 인한 불확실성 존재'
      ]
    }
  }
  
  private generateDefaultRisks(projectData: ProjectData): string[] {
    const risks: string[] = []
    const progress = projectData.progress || 0
    
    if (progress < 30) {
      risks.push('초기 단계의 불확실성으로 인한 일정 변동 가능성')
    }
    
    if (projectData.team?.length < 3) {
      risks.push('제한된 팀 리소스로 인한 병목 현상 가능성')
    }
    
    if (projectData.status === 'development') {
      risks.push('개발 단계의 기술적 난제 발생 가능성')
    }
    
    if (risks.length === 0) {
      risks.push('일반적인 프로젝트 리스크 모니터링 필요')
    }
    
    return risks
  }

  async generateReport(type: 'weekly' | 'monthly' | 'project'): Promise<string> {
    // 실제 구현에서는 데이터를 수집하여 리포트 생성
    return `# ${type === 'weekly' ? '주간' : type === 'monthly' ? '월간' : '프로젝트'} 리포트

## 요약
프로젝트가 전반적으로 순조롭게 진행되고 있으며, 주요 마일스톤을 성공적으로 달성했습니다.

## 주요 성과
- 핵심 기능 개발 완료율: 85%
- 버그 해결률: 92%
- 고객 만족도: 4.8/5.0

## 다음 단계
1. 통합 테스트 진행
2. 성능 최적화
3. 문서화 보완

## 권장사항
- 테스트 커버리지 확대
- 코드 리뷰 프로세스 강화
- 배포 자동화 개선`
  }
}

export default new AIService()