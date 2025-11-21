import { 
  ProjectPrediction, 
  BudgetPrediction, 
  ResourcePrediction, 
  RiskFactor,
  TrendData,
  AnalyticsMetric 
} from '@/types/analytics'
import { AnalysisData } from '@/types/services'

class AnalyticsService {
  async predictProjectCompletion(projectId: string): Promise<ProjectPrediction> {
    // 실제 구현에서는 ML 모델을 사용하여 예측
    const currentProgress = 65
    const daysElapsed = 45
    const totalDays = 90
    const velocity = currentProgress / daysElapsed
    
    // 예측 진행률 생성 (향후 30일)
    const predictedProgress: number[] = []
    for (let i = 1; i <= 30; i++) {
      const progress = Math.min(100, currentProgress + (velocity * i))
      predictedProgress.push(Math.round(progress))
    }
    
    // 완료 예상일 계산
    const remainingProgress = 100 - currentProgress
    const daysToComplete = Math.ceil(remainingProgress / velocity)
    const completionDate = new Date()
    completionDate.setDate(completionDate.getDate() + daysToComplete)
    
    // 리스크 요인 분석
    const risks: RiskFactor[] = []
    
    if (velocity < 1.0) {
      risks.push({
        id: '1',
        type: 'schedule',
        severity: 'high',
        probability: 0.7,
        impact: '일정 지연 가능성',
        mitigation: '추가 리소스 투입 또는 범위 조정 필요'
      })
    }
    
    if (currentProgress < (daysElapsed / totalDays) * 100) {
      risks.push({
        id: '2',
        type: 'progress',
        severity: 'medium',
        probability: 0.6,
        impact: '계획 대비 진행 지연',
        mitigation: '병목 현상 파악 및 해결'
      })
    }
    
    return {
      projectId,
      completionDate,
      confidence: 0.85,
      currentProgress,
      predictedProgress,
      risks,
      recommendations: [
        '현재 속도 유지 시 예정일 내 완료 가능',
        '주요 마일스톤 점검 주기 단축 권장',
        '리스크 요인에 대한 대응 계획 수립 필요'
      ]
    }
  }

  async predictBudget(projectId: string): Promise<BudgetPrediction> {
    // 예산 사용 패턴 분석
    const currentBudget = 85000000
    const totalBudget = 150000000
    const monthsElapsed = 3
    const burnRate = currentBudget / monthsElapsed
    
    // 월별 예산 예측
    const monthlyForecast = []
    const months = ['1월', '2월', '3월', '4월', '5월', '6월']
    const actuals = [25000000, 28000000, 32000000]
    
    for (let i = 0; i < months.length; i++) {
      if (i < monthsElapsed) {
        monthlyForecast.push({
          month: months[i],
          predicted: actuals[i],
          actual: actuals[i],
          variance: 0
        })
      } else {
        const predicted = burnRate * (1 + (i - monthsElapsed) * 0.05) // 5% 증가 예측
        monthlyForecast.push({
          month: months[i],
          predicted: Math.round(predicted)
        })
      }
    }
    
    // 총 예상 비용 계산
    const remainingMonths = months.length - monthsElapsed
    const predictedRemaining = burnRate * remainingMonths * 1.1 // 10% 버퍼
    const predictedTotal = currentBudget + predictedRemaining
    
    return {
      projectId,
      currentBudget,
      predictedTotal: Math.round(predictedTotal),
      burnRate: Math.round(burnRate),
      estimatedCompletion: Math.round(predictedTotal),
      monthlyForecast,
      overrunRisk: predictedTotal > totalBudget ? 0.7 : 0.2
    }
  }

  async predictResourceUtilization(): Promise<ResourcePrediction> {
    // 리소스 활용도 예측
    const currentUtilization = 78
    const capacity = 100
    
    // 향후 4주간 예측
    const predictedUtilization = [82, 85, 88, 85]
    
    // 병목 현상 분석
    const bottlenecks = []
    
    if (Math.max(...predictedUtilization) > 85) {
      bottlenecks.push({
        resourceId: '1',
        resourceName: '개발팀',
        period: '3주차',
        utilization: 88,
        impact: '프로젝트 지연 가능성'
      })
    }
    
    return {
      totalCapacity: capacity,
      currentUtilization,
      predictedUtilization,
      bottlenecks,
      optimizationSuggestions: [
        '3주차 작업 부하 분산 필요',
        '추가 인력 투입 검토',
        '비핵심 작업 일정 조정'
      ]
    }
  }

  async analyzeRisks(projectId: string): Promise<RiskFactor[]> {
    // 종합적인 리스크 분석
    const risks: RiskFactor[] = [
      {
        id: '1',
        type: 'technical',
        severity: 'medium',
        probability: 0.4,
        impact: '기술적 난이도로 인한 개발 지연',
        mitigation: '기술 검토 및 프로토타입 개발'
      },
      {
        id: '2',
        type: 'resource',
        severity: 'low',
        probability: 0.3,
        impact: '핵심 인력 이탈',
        mitigation: '지식 공유 및 백업 인력 확보'
      },
      {
        id: '3',
        type: 'scope',
        severity: 'medium',
        probability: 0.5,
        impact: '요구사항 변경',
        mitigation: '변경 관리 프로세스 강화'
      },
      {
        id: '4',
        type: 'external',
        severity: 'low',
        probability: 0.2,
        impact: '외부 의존성 지연',
        mitigation: '대체 방안 준비'
      }
    ]
    
    return risks
  }

  async getProjectTrends(projectId: string, metric: string): Promise<TrendData[]> {
    // 프로젝트 트렌드 데이터
    const weeks = ['1주', '2주', '3주', '4주', '5주', '6주', '7주', '8주']
    const actualData = [10, 18, 28, 35, 45, 52, 65]
    const predictedData = [72, 78, 85, 92, 98, 100]
    
    const trends: TrendData[] = []
    
    for (let i = 0; i < weeks.length; i++) {
      if (i < actualData.length) {
        trends.push({
          label: weeks[i],
          value: actualData[i],
          predicted: false
        })
      } else {
        const predictedIndex = i - actualData.length
        if (predictedIndex < predictedData.length) {
          trends.push({
            label: weeks[i],
            value: predictedData[predictedIndex],
            predicted: true
          })
        }
      }
    }
    
    return trends
  }

  async getKeyMetrics(): Promise<AnalyticsMetric[]> {
    // 주요 지표 분석
    return [
      {
        id: '1',
        name: '프로젝트 완료율',
        value: 65,
        change: 12,
        trend: 'up',
        prediction: 92,
        confidence: 0.85
      },
      {
        id: '2',
        name: '예산 사용률',
        value: 56,
        change: 8,
        trend: 'up',
        prediction: 78,
        confidence: 0.9
      },
      {
        id: '3',
        name: '리소스 활용도',
        value: 78,
        change: -3,
        trend: 'down',
        prediction: 82,
        confidence: 0.75
      },
      {
        id: '4',
        name: '품질 점수',
        value: 92,
        change: 2,
        trend: 'stable',
        prediction: 93,
        confidence: 0.8
      }
    ]
  }

  async generateInsights(data: AnalysisData): Promise<string[]> {
    // AI 기반 인사이트 생성
    const insights: string[] = [
      '현재 프로젝트 진행 속도가 계획 대비 15% 빠르게 진행되고 있습니다.',
      '3주차에 리소스 부하가 예상되므로 사전 조치가 필요합니다.',
      '예산 사용 패턴이 안정적이며, 예산 내 완료 가능성이 높습니다.',
      '품질 지표가 지속적으로 향상되고 있어 긍정적입니다.',
      '외부 의존성에 대한 리스크가 낮아 일정 준수가 가능할 것으로 예상됩니다.'
    ]
    
    return insights
  }

  calculateConfidenceInterval(predictions: number[], confidence: number): { lower: number[], upper: number[] } {
    const margin = (1 - confidence) / 2
    const lower = predictions.map(p => Math.round(p * (1 - margin)))
    const upper = predictions.map(p => Math.round(p * (1 + margin)))
    
    return { lower, upper }
  }
}

export default new AnalyticsService()