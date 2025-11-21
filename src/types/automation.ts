export interface WorkflowTrigger {
  id: string
  type: 'event' | 'schedule' | 'webhook' | 'manual'
  name: string
  config: Record<string, any>
}

export interface WorkflowAction {
  id: string
  type: 'notification' | 'email' | 'task' | 'api' | 'condition' | 'wait'
  name: string
  config: Record<string, any>
  nextActions?: string[] // IDs of next actions
}

export interface Workflow {
  id: string
  name: string
  description: string
  status: 'active' | 'inactive' | 'draft'
  trigger: WorkflowTrigger
  actions: WorkflowAction[]
  createdBy: string
  createdAt: Date
  updatedAt: Date
  lastRun?: Date
  runCount: number
}

export interface WorkflowRun {
  id: string
  workflowId: string
  status: 'running' | 'completed' | 'failed'
  startedAt: Date
  completedAt?: Date
  logs: WorkflowLog[]
  error?: string
}

export interface WorkflowLog {
  timestamp: Date
  actionId: string
  status: 'success' | 'error' | 'skipped'
  message: string
  data?: any
}

export interface WorkflowTemplate {
  id: string
  name: string
  description: string
  category: string
  icon: any
  trigger: Partial<WorkflowTrigger>
  actions: Partial<WorkflowAction>[]
}