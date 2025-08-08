export type UserRole = 'guest' | 'free' | 'basic' | 'premium' | 'enterprise' | 'admin'

export type SubscriptionPlan = 'free' | 'basic' | 'premium' | 'enterprise'

export interface UserPermissions {
  canAccessDashboard: boolean
  canAccessHistory: boolean
  canAccessAnalytics: boolean
  canAccessReports: boolean
  canAccessAnomalies: boolean
  canCreateCultivations: boolean
  canExportData: boolean
  canShareCultivations: boolean
  canUseAdvancedFeatures: boolean
  canAccessAPI: boolean
  maxCultivations: number
  maxStorageGB: number
  canUseRealTimeData: boolean
  canUsePredictiveAnalytics: boolean
  canUseCustomReports: boolean
  canUseTeamFeatures: boolean
  canUsePrioritySupport: boolean
  canAccessComparison: boolean
  canUseVisualAnalysis: boolean
}

export interface Subscription {
  id: string
  userId: string
  plan: SubscriptionPlan
  status: 'active' | 'cancelled' | 'expired' | 'trial'
  startDate: Date
  endDate: Date
  autoRenew: boolean
  price: number
  currency: string
  features: string[]
}

export interface User {
  id: string
  email: string
  name: string
  role: UserRole
  subscription?: Subscription
  permissions: UserPermissions
  createdAt: Date
  updatedAt: Date
  lastLoginAt?: Date
  isEmailVerified: boolean
  avatar?: string
} 