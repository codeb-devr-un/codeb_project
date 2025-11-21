import { Transporter } from 'nodemailer'
import { MailService } from '@sendgrid/mail'

// Email Service Types
export interface EmailTransporter extends Transporter {
  // Extended transporter interface if needed
}

export interface SendGridTransporter extends MailService {
  // SendGrid specific transporter
}

export interface EmailServiceTransporter {
  send?: (msg: SendGridMessage) => Promise<[SendGridResponse]>
  sendMail?: (mailOptions: NodemailerMailOptions) => Promise<NodemailerSentMessageInfo>
}

export interface SendGridMessage {
  to: string | string[]
  from: string
  subject: string
  text: string
  html: string
}

export interface SendGridResponse {
  headers: {
    'x-message-id': string
    [key: string]: string
  }
}

export interface NodemailerMailOptions {
  from: string
  to: string
  subject: string
  text?: string
  html?: string
}

export interface NodemailerSentMessageInfo {
  messageId: string
  accepted?: string[]
  rejected?: string[]
  response?: string
}

export interface EmailSendResult {
  success: boolean
  messageId?: string
  to?: string | string[]
  error?: string
}

export interface EmailTemplateData {
  name?: string
  taskTitle?: string
  assigneeName?: string
  priority?: string
  dueDate?: string
  description?: string
  taskUrl?: string
  projectName?: string
  userName?: string
  updateMessage?: string
  projectUrl?: string
}

export interface EmailTemplate {
  subject: string
  html: string
}

export type EmailTemplateFunction = (data: EmailTemplateData) => EmailTemplate

// AI Service Types
export interface AIMetrics {
  qualityMetrics?: {
    codeQualityScore: number
    bugCount: number
    testCoverage?: number
  }
  budgetMetrics?: {
    budgetUsed: number
    totalBudget: number
    burnRate?: number
  }
  efficiencyMetrics?: {
    teamProductivityScore: number
    onTimeDeliveryRate: number
    velocityTrend?: number
  }
  satisfactionMetrics?: {
    customerSatisfactionScore: string
    teamMorale?: number
  }
  riskMetrics?: {
    overallRiskLevel: 'low' | 'medium' | 'high'
    identifiedRisks: Array<{
      id: string
      description: string
      probability: 'low' | 'medium' | 'high'
      impact: 'low' | 'medium' | 'high'
      mitigation?: string
    }>
  }
  predictions?: {
    estimatedCompletionDate: string
    completionConfidence: string
    budgetOverrunProbability?: number
  }
}

export interface ProjectData {
  id: string
  name: string
  startDate: string
  endDate: string
  progress: number
  quality?: number
  budgetUsage?: number
  efficiency?: number
  satisfaction?: number | string
  status: string
  team?: Array<{
    id: string
    name: string
    role: string
  }>
  aiMetrics?: AIMetrics
}

// Integration Service Types
export interface GithubIssue {
  id: number
  number: number
  title: string
  body: string
  labels: string[]
  url: string
  created_at: Date
}

export interface GithubRepository {
  commits: number
  pullRequests: number
  issues: number
  branches: number
  contributors: number
}

export interface SlackMessage {
  channel: string
  text: string
  attachments?: SlackAttachment[]
  timestamp: Date
}

export interface SlackAttachment {
  fallback?: string
  color?: string
  pretext?: string
  author_name?: string
  author_link?: string
  author_icon?: string
  title?: string
  title_link?: string
  text?: string
  fields?: Array<{
    title: string
    value: string
    short?: boolean
  }>
  image_url?: string
  thumb_url?: string
  footer?: string
  footer_icon?: string
  ts?: number
}

export interface SlackChannel {
  id: string
  name: string
  is_private: boolean
  created: number
}

export interface GoogleCalendarEvent {
  id: string
  summary: string
  description: string
  start: Date
  end: Date
  attendees?: string[]
  htmlLink: string
}

export interface GoogleDriveFolder {
  id: string
  name: string
  mimeType: string
  webViewLink: string
}

export interface JiraTicket {
  id: string
  key: string
  summary: string
  description: string
  issueType: string
  status: string
}

export interface TrelloCard {
  id: string
  name: string
  desc: string
  idList: string
  url: string
}

export interface WebhookEvent {
  action?: string
  pull_request?: any
  type?: string
  [key: string]: any
}

// Notification Service Types
export interface NotificationData {
  assigneeId?: string
  taskTitle?: string
  projectId?: string
  teamMembers?: string[]
  userName?: string
  projectName?: string
  daysLeft?: number
  fileName?: string
  userId?: string
  leadName?: string
  stage?: string
}

// Workflow Service Types
export interface WorkflowContext {
  projectId?: string
  userId?: string
  taskId?: string
  [key: string]: any
}

export interface WorkflowExecutionResult {
  executionId: string
  status: 'running' | 'completed' | 'failed'
  logs?: Array<{
    timestamp: Date
    message: string
    level: 'info' | 'warning' | 'error'
  }>
}

export interface WorkflowNotificationConfig {
  message: string
  recipient: string
  channel?: string
}

export interface WorkflowEmailConfig {
  to: string
  subject: string
  body: string
  cc?: string[]
  bcc?: string[]
}

export interface WorkflowTaskConfig {
  title: string
  description: string
  assignee: string
  priority?: 'low' | 'medium' | 'high'
  dueDate?: string
}

export interface WorkflowApiConfig {
  url: string
  method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH'
  headers?: string
  body?: any
  authentication?: {
    type: 'none' | 'basic' | 'bearer' | 'api-key'
    credentials?: string
  }
}

export interface WorkflowConditionConfig {
  field: string
  operator: 'equals' | 'not-equals' | 'greater-than' | 'less-than' | 'contains' | 'not-contains'
  value: any
}

export interface WorkflowWaitConfig {
  duration: number
  unit: 'seconds' | 'minutes' | 'hours' | 'days'
}

// Activity Service Types
export interface ActivityLog {
  id: string
  type: 'project' | 'task' | 'file' | 'user' | 'system'
  action: string
  description: string
  userId: string
  userName?: string
  projectId?: string
  timestamp: Date
  metadata?: {
    before?: any
    after?: any
    fileSize?: number
    fileName?: string
    taskId?: string
    [key: string]: any
  }
}

// File Service Types
export interface FileMetadata {
  id: string
  name: string
  size: number
  type: string
  url: string
  thumbnailUrl?: string
  uploadedBy: string
  uploadedAt: Date
  projectId?: string
  folderId?: string
  tags?: string[]
  description?: string
  version?: number
  checksum?: string
}

export interface FileUploadResult {
  success: boolean
  file?: FileMetadata
  error?: string
}

export interface FileFolder {
  id: string
  name: string
  parentId?: string
  projectId?: string
  createdBy: string
  createdAt: Date
  updatedAt: Date
  permissions?: {
    read: string[]
    write: string[]
    delete: string[]
  }
}

// Stats Service Types
export interface ProjectStats {
  totalProjects: number
  activeProjects: number
  completedProjects: number
  onHoldProjects: number
  totalBudget: number
  usedBudget: number
  averageProgress: number
  averageQuality: number
}

export interface TaskStats {
  totalTasks: number
  completedTasks: number
  inProgressTasks: number
  pendingTasks: number
  overdueTasks: number
  tasksByPriority: {
    low: number
    medium: number
    high: number
  }
  tasksByStatus: {
    [status: string]: number
  }
}

export interface UserStats {
  totalUsers: number
  activeUsers: number
  newUsersThisMonth: number
  usersByRole: {
    [role: string]: number
  }
  averageTasksPerUser: number
}

export interface SystemStats {
  uptime: number
  responseTime: number
  errorRate: number
  activeConnections: number
  memoryUsage: number
  cpuUsage: number
}

// Analytics Service Additional Types
export interface AnalysisData {
  projectId?: string
  dateRange?: {
    start: Date
    end: Date
  }
  metrics?: string[]
  filters?: {
    [key: string]: any
  }
}

// Marketing Service Activity Types
export interface MarketingActivity {
  id: string
  type: string
  message: string
  user: string
  leadId?: string
  timestamp: string
}

export interface MarketingStatistics {
  totalLeads: number
  leadsByStatus: Record<string, number>
  conversionRate: number
  totalContractValue: number
}

// Invitation Service Types
export interface ProjectInvitation {
  id: string
  projectId: string
  email: string
  role: 'viewer' | 'editor' | 'admin'
  invitedBy: string
  invitedAt: Date
  expiresAt: Date
  status: 'pending' | 'accepted' | 'rejected' | 'expired'
  token?: string
}

export interface InvitationEmailData {
  inviteeName?: string
  projectName: string
  inviterName: string
  role: string
  acceptUrl: string
  rejectUrl: string
}

// Workflow Engine Types
export interface WorkflowEngineConfig {
  maxConcurrentWorkflows?: number
  defaultTimeout?: number
  retryPolicy?: {
    maxRetries: number
    retryDelay: number
    backoffMultiplier?: number
  }
}

export interface WorkflowExecutionContext {
  workflowId: string
  executionId: string
  startTime: Date
  variables: Map<string, any>
  logs: WorkflowExecutionLog[]
}

export interface WorkflowExecutionLog {
  timestamp: Date
  level: 'debug' | 'info' | 'warning' | 'error'
  message: string
  actionId?: string
  data?: any
}

// Type Guards
export function isSendGridTransporter(
  transporter: EmailServiceTransporter
): transporter is EmailServiceTransporter {
  return 'send' in transporter && typeof transporter.send === 'function'
}

export function isNodemailerTransporter(
  transporter: EmailServiceTransporter
): transporter is EmailServiceTransporter {
  return 'sendMail' in transporter && typeof transporter.sendMail === 'function'
}