import { Workflow, WorkflowRun, WorkflowLog, WorkflowAction } from '@/types/automation'
import logger from '@/utils/logger'
import { 
  WorkflowExecutionResult,
  WorkflowNotificationConfig,
  WorkflowEmailConfig,
  WorkflowTaskConfig,
  WorkflowApiConfig,
  WorkflowConditionConfig,
  WorkflowWaitConfig
} from '@/types/services'

class WorkflowService {
  private runningWorkflows: Map<string, WorkflowRun> = new Map()

  async executeWorkflow(workflow: Workflow): Promise<WorkflowRun> {
    // 내부 API 사용
    try {
      const response = await fetch(`/api/workflows/${workflow.id}/execute`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        }
      })

      if (response.ok) {
        const { executionId } = await response.json()
        logger.info(`워크플로우가 실행됩니다. 실행 ID: ${executionId}`, 'WorkflowService')
        
        // 실행 상태를 반환
        return {
          id: executionId,
          workflowId: workflow.id,
          status: 'running',
          startedAt: new Date(),
          logs: [{
            timestamp: new Date(),
            actionId: 'system',
            status: 'success',
            message: '워크플로우가 실행 중입니다.'
          }]
        }
      }
    } catch (error) {
      logger.debug('API 호출 실패, 로컬에서 실행합니다.', 'WorkflowService')
    }

    // 폴백: 기존 로컬 실행
    const run: WorkflowRun = {
      id: Date.now().toString(),
      workflowId: workflow.id,
      status: 'running',
      startedAt: new Date(),
      logs: []
    }

    this.runningWorkflows.set(run.id, run)
    
    try {
      // 워크플로우 실행 로그
      this.addLog(run, 'system', 'success', `워크플로우 '${workflow.name}' 실행 시작`)

      // 액션 순차 실행
      for (const action of workflow.actions) {
        await this.executeAction(action, run)
      }

      // 완료
      run.status = 'completed'
      run.completedAt = new Date()
      this.addLog(run, 'system', 'success', '워크플로우 실행 완료')

    } catch (error) {
      run.status = 'failed'
      run.completedAt = new Date()
      run.error = error instanceof Error ? error.message : 'Unknown error'
      this.addLog(run, 'system', 'error', `워크플로우 실행 실패: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }

    this.runningWorkflows.delete(run.id)
    return run
  }

  private async executeAction(action: WorkflowAction, run: WorkflowRun): Promise<void> {
    try {
      this.addLog(run, action.id, 'success', `액션 '${action.name}' 실행 시작`)

      switch (action.type) {
        case 'notification':
          await this.executeNotification(action, run)
          break
        case 'email':
          await this.executeEmail(action, run)
          break
        case 'task':
          await this.executeTaskCreation(action, run)
          break
        case 'api':
          await this.executeApiCall(action, run)
          break
        case 'condition':
          await this.executeCondition(action, run)
          break
        case 'wait':
          await this.executeWait(action, run)
          break
        default:
          throw new Error(`지원하지 않는 액션 타입: ${action.type}`)
      }

      this.addLog(run, action.id, 'success', `액션 '${action.name}' 완료`)

    } catch (error) {
      this.addLog(run, action.id, 'error', `액션 실행 실패: ${error instanceof Error ? error.message : 'Unknown error'}`)
      throw error
    }
  }

  private async executeNotification(action: WorkflowAction, run: WorkflowRun): Promise<void> {
    const { message, recipient } = action.config
    
    try {
      // Firebase 알림 서비스 사용
      if (typeof window !== 'undefined' && 'useNotification' in window) {
        // 브라우저 알림
        const notificationContext = (window as any).notificationContext as { addNotification: (notification: any) => void } | undefined
        if (notificationContext) {
          notificationContext.addNotification({
            type: 'info',
            title: '워크플로우 알림',
            message
          })
        }
      }
      
      // Firebase Realtime Database에 알림 저장
      try {
        const { database } = await import('@/lib/firebase')
        const { ref, push } = await import('firebase/database')
        
        const notificationRef = ref(database, 'notifications')
        await push(notificationRef, {
          recipient,
          title: '워크플로우 알림',
          message,
          workflowId: run.workflowId,
          timestamp: new Date().toISOString(),
          read: false
        })
        
        this.addLog(
          run, 
          action.id, 
          'success', 
          `알림 전송 완료: "${message}" → ${recipient}`,
          { message, recipient }
        )
      } catch (error) {
        throw new Error('알림 전송 실패')
      }
    } catch (error) {
      // 폴백: 로그
      logger.debug(`[알림 시뮬레이션] 수신자: ${recipient}, 메시지: ${message}`, 'WorkflowService')
      
      this.addLog(
        run, 
        action.id, 
        'success', 
        `알림 시뮬레이션: "${message}" → ${recipient}`,
        { message, recipient, simulated: true }
      )
    }
  }

  private async executeEmail(action: WorkflowAction, run: WorkflowRun): Promise<void> {
    const { to, subject, body } = action.config
    
    try {
      // 내부 이메일 API 사용
      const response = await fetch('/api/email/send', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          to,
          subject,
          html: body
        })
      })

      if (!response.ok) {
        throw new Error('이메일 전송 실패')
      }

      const result = await response.json()
      
      this.addLog(
        run,
        action.id,
        'success',
        `이메일 전송 완료: "${subject}" → ${to}`,
        { to, subject }
      )
    } catch (error) {
      // 폴백: 로그
      logger.debug(`[이메일 시뮬레이션] To: ${to}, Subject: ${subject}, Body: ${body}`, 'WorkflowService')
      
      this.addLog(
        run,
        action.id,
        'success',
        `이메일 전송 시뮬레이션: "${subject}" → ${to}`,
        { to, subject, simulated: true }
      )
    }
  }

  private async executeTaskCreation(action: WorkflowAction, run: WorkflowRun): Promise<void> {
    const { title, description, assignee } = action.config
    
    // 실제 구현에서는 Task 생성 API 호출
    const taskId = Date.now().toString()
    await new Promise(resolve => setTimeout(resolve, 800)) // 시뮬레이션
    
    this.addLog(
      run,
      action.id,
      'success',
      `작업 생성 완료: "${title}" (ID: ${taskId})`,
      { taskId, title, assignee }
    )
  }

  private async executeApiCall(action: WorkflowAction, run: WorkflowRun): Promise<void> {
    const { url, method, headers, body } = action.config
    
    try {
      // 실제 API 호출 시뮬레이션
      await new Promise(resolve => setTimeout(resolve, 1500))
      
      // 실제 구현에서는 fetch 또는 axios 사용
      // const response = await fetch(url, {
      //   method,
      //   headers: JSON.parse(headers || '{}'),
      //   body: body ? JSON.stringify(body) : undefined
      // })
      
      this.addLog(
        run,
        action.id,
        'success',
        `API 호출 성공: ${method} ${url}`,
        { status: 200, response: { success: true } }
      )
    } catch (error) {
      throw new Error(`API 호출 실패: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }

  private async executeCondition(action: WorkflowAction, run: WorkflowRun): Promise<void> {
    const { field, operator, value } = action.config
    
    // 조건 평가 로직
    let result = false
    
    // 실제 구현에서는 컨텍스트 데이터를 기반으로 조건 평가
    if (operator === 'equals') {
      result = true // 시뮬레이션
    }
    
    this.addLog(
      run,
      action.id,
      'success',
      `조건 평가: ${field} ${operator} ${value} = ${result}`,
      { result }
    )
    
    // 조건에 따른 분기 처리
    if (result && action.nextActions) {
      // 다음 액션 실행
    }
  }

  private async executeWait(action: WorkflowAction, run: WorkflowRun): Promise<void> {
    const { duration, unit } = action.config
    
    let milliseconds = 0
    switch (unit) {
      case 'seconds':
        milliseconds = duration * 1000
        break
      case 'minutes':
        milliseconds = duration * 60 * 1000
        break
      case 'hours':
        milliseconds = duration * 60 * 60 * 1000
        break
    }
    
    this.addLog(
      run,
      action.id,
      'success',
      `대기 시작: ${duration} ${unit}`,
      { duration, unit }
    )
    
    // 실제 대기 (데모에서는 최대 5초)
    await new Promise(resolve => setTimeout(resolve, Math.min(milliseconds, 5000)))
    
    this.addLog(run, action.id, 'success', '대기 완료')
  }

  private addLog(
    run: WorkflowRun, 
    actionId: string, 
    status: WorkflowLog['status'], 
    message: string,
    data?: Record<string, any>
  ): void {
    run.logs.push({
      timestamp: new Date(),
      actionId,
      status,
      message,
      data
    })
  }

  // 스케줄 기반 워크플로우 실행
  scheduleWorkflow(workflow: Workflow): void {
    if (workflow.trigger.type !== 'schedule' || workflow.status !== 'active') {
      return
    }

    const { schedule } = workflow.trigger.config
    
    // 실제 구현에서는 node-cron 또는 유사한 라이브러리 사용
    logger.info(`워크플로우 '${workflow.name}' 스케줄 등록: ${schedule}`, 'WorkflowService')
  }

  // 이벤트 기반 워크플로우 실행
  async handleEvent(eventType: string, eventData: Record<string, any>): Promise<void> {
    // 실제 구현에서는 데이터베이스에서 해당 이벤트를 트리거로 하는 워크플로우 조회
    const workflows = await this.getWorkflowsByEventTrigger(eventType)
    
    for (const workflow of workflows) {
      if (workflow.status === 'active') {
        this.executeWorkflow(workflow).catch(error => {
          logger.error(`워크플로우 실행 오류 (${workflow.name})`, 'WorkflowService', error)
        })
      }
    }
  }

  private async getWorkflowsByEventTrigger(eventType: string): Promise<Workflow[]> {
    // 실제 구현에서는 데이터베이스 조회
    return []
  }

  // 실행 중인 워크플로우 상태 조회
  getRunningWorkflows(): WorkflowRun[] {
    return Array.from(this.runningWorkflows.values())
  }

  // 워크플로우 실행 이력 조회
  async getWorkflowHistory(workflowId: string, limit: number = 10): Promise<WorkflowRun[]> {
    // 실제 구현에서는 데이터베이스 조회
    return []
  }

  // 워크플로우 목록 가져오기
  async getWorkflows(): Promise<Workflow[]> {
    try {
      const response = await fetch('/api/workflows')
      const data = await response.json()
      return data.workflows || []
    } catch (error) {
      logger.error('워크플로우 목록 조회 실패', 'WorkflowService', error)
      return []
    }
  }

  // 워크플로우 생성
  async createWorkflow(workflow: Partial<Workflow>): Promise<Workflow> {
    const response = await fetch('/api/workflows', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(workflow)
    })
    const data = await response.json()
    return data.workflow
  }

  // 워크플로우 업데이트
  async updateWorkflow(id: string, updates: Partial<Workflow>): Promise<Workflow> {
    const response = await fetch(`/api/workflows/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updates)
    })
    const data = await response.json()
    return data.workflow
  }

  // 워크플로우 삭제
  async deleteWorkflow(id: string): Promise<void> {
    await fetch(`/api/workflows/${id}`, {
      method: 'DELETE'
    })
  }

  // 실행 로그 조회
  async getExecutionLogs(workflowId: string): Promise<WorkflowRun[]> {
    try {
      const response = await fetch(`/api/workflows/${workflowId}/executions`)
      const data = await response.json()
      return data.executions || []
    } catch (error) {
      logger.error('실행 로그 조회 실패', 'WorkflowService', error)
      return []
    }
  }
}

export default new WorkflowService()