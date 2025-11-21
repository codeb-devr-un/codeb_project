import { database } from '@/lib/firebase'
import { ref, push, set, get, update, remove, DatabaseReference } from 'firebase/database'
import { v4 as uuidv4 } from 'uuid'
import * as cron from 'node-cron'
import { WorkflowEngineConfig } from '@/types/services'
import logger from '@/utils/logger'

interface Workflow {
  id: string
  name: string
  enabled: boolean
  trigger: {
    type: 'manual' | 'schedule' | 'event'
    schedule?: string
    event?: string
  }
  actions: Array<{
    id: string
    name: string
    type: 'notification' | 'email' | 'task' | 'webhook' | 'condition' | 'wait'
    config: Record<string, any>
  }>
  createdAt: string
  updatedAt: string
}

interface WorkflowExecution {
  id: string
  workflowId: string
  status: 'running' | 'completed' | 'failed'
  startedAt: string
  completedAt?: string
  logs: Array<{
    timestamp: string
    message: string
    type: 'info' | 'error' | 'success'
  }>
}

class WorkflowEngine {
  private scheduledJobs: Map<string, cron.ScheduledTask> = new Map()

  // 워크플로우 저장
  async saveWorkflow(workflow: Partial<Workflow>): Promise<Workflow> {
    const id = workflow.id || uuidv4()
    const fullWorkflow: Workflow = {
      ...workflow,
      id,
      createdAt: workflow.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString()
    } as Workflow

    const workflowRef = ref(database, `workflows/${id}`)
    await set(workflowRef, fullWorkflow)

    // 스케줄 기반 워크플로우 등록
    if (fullWorkflow.enabled && fullWorkflow.trigger.type === 'schedule') {
      this.scheduleWorkflow(fullWorkflow)
    }

    return fullWorkflow
  }

  // 워크플로우 목록 조회
  async getWorkflows(): Promise<Workflow[]> {
    const workflowsRef = ref(database, 'workflows')
    const snapshot = await get(workflowsRef)
    
    if (!snapshot.exists()) return []
    
    return Object.values(snapshot.val())
  }

  // 워크플로우 조회
  async getWorkflow(id: string): Promise<Workflow | null> {
    const workflowRef = ref(database, `workflows/${id}`)
    const snapshot = await get(workflowRef)
    
    if (!snapshot.exists()) return null
    
    return snapshot.val()
  }

  // 워크플로우 업데이트
  async updateWorkflow(id: string, updates: Partial<Workflow>): Promise<Workflow> {
    const existingWorkflow = await this.getWorkflow(id)
    if (!existingWorkflow) {
      throw new Error('Workflow not found')
    }

    // 기존 스케줄 제거
    if (this.scheduledJobs.has(id)) {
      this.scheduledJobs.get(id)!.stop()
      this.scheduledJobs.delete(id)
    }

    const updatedWorkflow: Workflow = {
      ...existingWorkflow,
      ...updates,
      id,
      updatedAt: new Date().toISOString()
    }

    const workflowRef = ref(database, `workflows/${id}`)
    await update(workflowRef, updatedWorkflow)

    // 새 스케줄 등록
    if (updatedWorkflow.enabled && updatedWorkflow.trigger.type === 'schedule') {
      this.scheduleWorkflow(updatedWorkflow)
    }

    return updatedWorkflow
  }

  // 워크플로우 삭제
  async deleteWorkflow(id: string): Promise<void> {
    // 스케줄 제거
    if (this.scheduledJobs.has(id)) {
      this.scheduledJobs.get(id)!.stop()
      this.scheduledJobs.delete(id)
    }

    const workflowRef = ref(database, `workflows/${id}`)
    await remove(workflowRef)
  }

  // 워크플로우 수동 실행
  async executeWorkflow(workflowId: string): Promise<string> {
    const workflow = await this.getWorkflow(workflowId)
    if (!workflow) {
      throw new Error('Workflow not found')
    }

    const executionId = uuidv4()
    const execution: WorkflowExecution = {
      id: executionId,
      workflowId,
      status: 'running',
      startedAt: new Date().toISOString(),
      logs: []
    }

    // Firebase에 실행 로그 저장
    const executionRef = ref(database, `workflow-executions/${executionId}`)
    await set(executionRef, execution)

    // 비동기로 워크플로우 실행
    this.runWorkflow(workflow, executionId).catch(error => 
      logger.error('Error running workflow', 'WorkflowEngine', error)
    )

    return executionId
  }

  // 실행 로그 조회
  async getExecutionLogs(workflowId: string): Promise<WorkflowExecution[]> {
    const executionsRef = ref(database, 'workflow-executions')
    const snapshot = await get(executionsRef)
    
    if (!snapshot.exists()) return []
    
    const allExecutions = Object.values(snapshot.val()) as WorkflowExecution[]
    return allExecutions
      .filter(exec => exec.workflowId === workflowId)
      .sort((a, b) => new Date(b.startedAt).getTime() - new Date(a.startedAt).getTime())
  }

  // 워크플로우 스케줄링
  private scheduleWorkflow(workflow: Workflow) {
    const { schedule } = workflow.trigger
    
    if (!schedule || !cron.validate(schedule)) {
      logger.error(`Invalid cron expression: ${schedule}`, 'WorkflowEngine')
      return
    }
    
    const job = cron.schedule(schedule, async () => {
      await this.executeWorkflow(workflow.id)
    })
    
    this.scheduledJobs.set(workflow.id, job)
    logger.info(`Scheduled workflow ${workflow.name} with cron: ${schedule}`, 'WorkflowEngine')
  }

  // 워크플로우 실행 엔진
  private async runWorkflow(workflow: Workflow, executionId: string) {
    const executionRef = ref(database, `workflow-executions/${executionId}`)
    
    try {
      for (const action of workflow.actions) {
        await this.logExecution(executionRef, {
          timestamp: new Date().toISOString(),
          message: `Executing action: ${action.name}`,
          type: 'info'
        })
        
        await this.executeAction(action, workflow, executionRef)
      }
      
      await update(executionRef, {
        status: 'completed',
        completedAt: new Date().toISOString()
      })
      
      await this.logExecution(executionRef, {
        timestamp: new Date().toISOString(),
        message: 'Workflow completed successfully',
        type: 'success'
      })
    } catch (error) {
      await update(executionRef, {
        status: 'failed',
        completedAt: new Date().toISOString()
      })
      
      await this.logExecution(executionRef, {
        timestamp: new Date().toISOString(),
        message: `Workflow failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
        type: 'error'
      })
    }
  }

  // 액션 실행
  private async executeAction(action: { id: string; name: string; type: string; config: Record<string, any> }, workflow: Workflow, executionRef: DatabaseReference) {
    switch (action.type) {
      case 'notification':
        // Firebase에 알림 저장
        const notificationRef = ref(database, 'notifications')
        await push(notificationRef, {
          message: action.config.message,
          recipients: action.config.recipients,
          timestamp: new Date().toISOString(),
          workflowId: workflow.id
        })
        
        await this.logExecution(executionRef, {
          timestamp: new Date().toISOString(),
          message: `Notification sent: ${action.config.message}`,
          type: 'info'
        })
        break
        
      case 'email':
        // 이메일 서비스 호출 (API route 사용)
        try {
          const response = await fetch('/api/email/send', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              to: action.config.recipient,
              subject: action.config.subject,
              html: action.config.content
            })
          })
          
          if (!response.ok) throw new Error('Email send failed')
          
          await this.logExecution(executionRef, {
            timestamp: new Date().toISOString(),
            message: `Email sent to ${action.config.recipient}`,
            type: 'info'
          })
        } catch (error) {
          throw new Error(`Email failed: ${error instanceof Error ? error.message : 'Unknown error'}`)
        }
        break
        
      case 'task':
        // Firebase에 작업 생성
        const tasksRef = ref(database, 'tasks')
        await push(tasksRef, {
          title: action.config.title,
          description: action.config.description,
          assignee: action.config.assignee,
          priority: action.config.priority || 'medium',
          status: 'pending',
          createdAt: new Date().toISOString(),
          workflowId: workflow.id
        })
        
        await this.logExecution(executionRef, {
          timestamp: new Date().toISOString(),
          message: `Task created: ${action.config.title}`,
          type: 'info'
        })
        break
        
      case 'webhook':
        // 외부 API 호출
        try {
          const response = await fetch(action.config.url, {
            method: action.config.method || 'POST',
            headers: action.config.headers || {},
            body: action.config.body ? JSON.stringify(action.config.body) : undefined
          })
          
          if (!response.ok) throw new Error(`HTTP ${response.status}`)
          
          await this.logExecution(executionRef, {
            timestamp: new Date().toISOString(),
            message: `Webhook called: ${action.config.url}`,
            type: 'info'
          })
        } catch (error) {
          throw new Error(`Webhook failed: ${error instanceof Error ? error.message : 'Unknown error'}`)
        }
        break
        
      case 'condition':
        // 조건 평가 (간단한 예시)
        const condition = action.config.condition
        // 실제로는 안전한 평가 방법 사용 필요
        const result = false // eval 대신 안전한 방법으로 구현
        
        await this.logExecution(executionRef, {
          timestamp: new Date().toISOString(),
          message: `Condition evaluated: ${condition} = ${result}`,
          type: 'info'
        })
        
        if (!result) {
          throw new Error('Condition not met, stopping workflow')
        }
        break
        
      case 'wait':
        // 대기
        const delay = action.config.duration * 1000
        await new Promise(resolve => setTimeout(resolve, delay))
        
        await this.logExecution(executionRef, {
          timestamp: new Date().toISOString(),
          message: `Waited for ${action.config.duration} seconds`,
          type: 'info'
        })
        break
        
      default:
        logger.warn(`Unknown action type: ${action.type}`, 'WorkflowEngine')
    }
  }

  // 실행 로그 추가
  private async logExecution(executionRef: DatabaseReference, log: { timestamp: string; message: string; type: 'info' | 'error' | 'success' }) {
    const logsRef = ref(database, `${executionRef.key}/logs`)
    await push(logsRef, log)
  }

  // 모든 스케줄 시작
  async startAllSchedules() {
    const workflows = await this.getWorkflows()
    workflows
      .filter(w => w.enabled && w.trigger.type === 'schedule')
      .forEach(w => this.scheduleWorkflow(w))
  }

  // 모든 스케줄 중지
  stopAllSchedules() {
    this.scheduledJobs.forEach(job => job.stop())
    this.scheduledJobs.clear()
  }
}

export default new WorkflowEngine()