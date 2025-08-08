// Tipos para o Sistema de Notificações Inteligentes

export enum NotificationType {
  REMINDER = 'REMINDER',
  ALERT = 'ALERT', 
  ACHIEVEMENT = 'ACHIEVEMENT',
  SYSTEM = 'SYSTEM',
  MARKETING = 'MARKETING'
}

export enum NotificationPriority {
  LOW = 'LOW',
  MEDIUM = 'MEDIUM',
  HIGH = 'HIGH',
  CRITICAL = 'CRITICAL'
}

export enum NotificationChannel {
  IN_APP = 'IN_APP',
  PUSH = 'PUSH',
  EMAIL = 'EMAIL',
  SMS = 'SMS'
}

export interface Notification {
  id: string
  type: NotificationType
  title: string
  message: string
  isRead: boolean
  priority: NotificationPriority
  channels: NotificationChannel[]
  metadata?: Record<string, any>
  actionUrl?: string
  createdAt: Date
  readAt?: Date
  deliveredAt?: Date
  clickedAt?: Date
  userId: string
}

export interface NotificationPayload {
  title: string
  body: string
  icon?: string
  badge?: string
  data?: Record<string, any>
  actions?: NotificationAction[]
  requireInteraction?: boolean
}

export interface NotificationAction {
  action: string
  title: string
  icon?: string
}

export interface PushSubscription {
  id: string
  endpoint: string
  p256dh: string
  auth: string
  userAgent?: string
  isActive: boolean
  createdAt: Date
  lastUsed: Date
  userId: string
}

export interface NotificationPreferences {
  id: string
  reminders: boolean
  alerts: boolean
  achievements: boolean
  marketing: boolean
  pushEnabled: boolean
  emailEnabled: boolean
  quietHoursStart?: number
  quietHoursEnd?: number
  timezone: string
  createdAt: Date
  updatedAt: Date
  userId: string
}

export interface CreateNotificationRequest {
  type: NotificationType
  title: string
  message: string
  priority?: NotificationPriority
  channels?: NotificationChannel[]
  metadata?: Record<string, any>
  actionUrl?: string
  userId: string
}

export interface NotificationRule {
  id: string
  name: string
  condition: (cultivation: any) => boolean
  action: (cultivation: any) => NotificationPayload
  priority: NotificationPriority
  cooldown: number // minutes
  enabled: boolean
}

export interface NotificationMetrics {
  totalSent: number
  deliveryRate: number
  openRate: number
  clickRate: number
  unsubscribeRate: number
  errorRate: number
  averageResponseTime: number
}

export interface NotificationAnalytics {
  notificationId: string
  event: 'sent' | 'delivered' | 'opened' | 'clicked' | 'dismissed'
  timestamp: Date
  channel: NotificationChannel
  metadata?: Record<string, any>
}

// Tipos para erros de push notification
export enum PushErrorType {
  PERMISSION_DENIED = 'permission_denied',
  SUBSCRIPTION_EXPIRED = 'subscription_expired', 
  INVALID_SUBSCRIPTION = 'invalid_subscription',
  NETWORK_ERROR = 'network_error',
  QUOTA_EXCEEDED = 'quota_exceeded'
}

export class PushNotificationError extends Error {
  constructor(
    public type: PushErrorType,
    message: string,
    public subscription?: PushSubscription
  ) {
    super(message)
    this.name = 'PushNotificationError'
  }
}

// Tipos para contexto de notificação
export interface NotificationContext {
  userId: string
  cultivationId?: string
  eventId?: string
  strainName?: string
  phase?: string
  daysActive?: number
  lastActivity?: Date
}

// Tipos para templates de notificação
export interface NotificationTemplate {
  id: string
  name: string
  type: NotificationType
  titleTemplate: string
  messageTemplate: string
  defaultChannels: NotificationChannel[]
  variables: string[]
}

export interface TemplateVariables {
  [key: string]: string | number | Date
}