import type { UserPermissions, SubscriptionPlan } from '@/types/auth'

// Permissões por plano (mantém a mesma lógica)
export const PLAN_PERMISSIONS: Record<SubscriptionPlan, UserPermissions> = {
  free: {
    canAccessDashboard: true,
    canAccessHistory: true,
    canAccessAnalytics: false,
    canAccessReports: false,
    canAccessAnomalies: false,
    canCreateCultivations: true,
    canExportData: false,
    canShareCultivations: false,
    canUseAdvancedFeatures: false,
    canAccessAPI: false,
    maxCultivations: 6,
    maxStorageGB: 1,
    canUseRealTimeData: false,
    canUsePredictiveAnalytics: false,
    canUseCustomReports: false,
    canUseTeamFeatures: false,
    canUsePrioritySupport: false,
    canAccessComparison: false,
    canUseVisualAnalysis: false,
  },
  basic: {
    canAccessDashboard: true,
    canAccessHistory: true,
    canAccessAnalytics: false,
    canAccessReports: true,
    canAccessAnomalies: false,
    canCreateCultivations: true,
    canExportData: true,
    canShareCultivations: true,
    canUseAdvancedFeatures: false,
    canAccessAPI: false,
    maxCultivations: 20,
    maxStorageGB: 5,
    canUseRealTimeData: false,
    canUsePredictiveAnalytics: false,
    canUseCustomReports: false,
    canUseTeamFeatures: false,
    canUsePrioritySupport: false,
    canAccessComparison: true,
    canUseVisualAnalysis: false,
  },
  premium: {
    canAccessDashboard: true,
    canAccessHistory: true,
    canAccessAnalytics: true,
    canAccessReports: true,
    canAccessAnomalies: true,
    canCreateCultivations: true,
    canExportData: true,
    canShareCultivations: true,
    canUseAdvancedFeatures: true,
    canAccessAPI: true,
    maxCultivations: 50,
    maxStorageGB: 20,
    canUseRealTimeData: true,
    canUsePredictiveAnalytics: true,
    canUseCustomReports: true,
    canUseTeamFeatures: false,
    canUsePrioritySupport: false,
    canAccessComparison: true,
    canUseVisualAnalysis: true,
  },
  enterprise: {
    canAccessDashboard: true,
    canAccessHistory: true,
    canAccessAnalytics: true,
    canAccessReports: true,
    canAccessAnomalies: true,
    canCreateCultivations: true,
    canExportData: true,
    canShareCultivations: true,
    canUseAdvancedFeatures: true,
    canAccessAPI: true,
    maxCultivations: -1, // Ilimitado
    maxStorageGB: 100,
    canUseRealTimeData: true,
    canUsePredictiveAnalytics: true,
    canUseCustomReports: true,
    canUseTeamFeatures: true,
    canUsePrioritySupport: true,
    canAccessComparison: true,
    canUseVisualAnalysis: true,
  },
}

// Função para obter permissões do usuário
export function getUserPermissions(user: any): UserPermissions {
  if (!user) return PLAN_PERMISSIONS.free

  // Admin tem todas as permissões
  if (user.role === 'admin') {
    return PLAN_PERMISSIONS.enterprise
  }

  // Verificar assinatura ativa
  if (user.subscription && user.subscription.status === 'active') {
    const plan = user.subscription.plan as SubscriptionPlan
    return PLAN_PERMISSIONS[plan] || PLAN_PERMISSIONS.free
  }

  // Fallback para free
  return PLAN_PERMISSIONS.free
}

// Função para verificar permissão específica
export function canAccess(user: any, permission: keyof UserPermissions): boolean {
  const permissions = getUserPermissions(user)
  return Boolean(permissions[permission])
}

// Função para verificar limite de cultivos
export function checkCultivationLimit(user: any, currentCount: number): boolean {
  const permissions = getUserPermissions(user)
  if (permissions.maxCultivations === -1) return true // Ilimitado
  return currentCount < permissions.maxCultivations
}

export const PLAN_PRICES: Record<SubscriptionPlan, { price: number; currency: string }> = {
  free: { price: 0, currency: 'BRL' },
  basic: { price: 14.9, currency: 'BRL' },
  premium: { price: 34.9, currency: 'BRL' },
  enterprise: { price: 119.9, currency: 'BRL' },
}

export const PLAN_FEATURES = {
  free: [
    "Dashboard Inteligente",
    "Histórico de Cultivos",
    "Até 6 cultivos ativos",
    "Suporte básico",
  ],
  basic: [
    "Tudo do Grátis",
    "Analytics Avançado",
    "Relatórios Básicos",
    "Exportação de dados",
    "Até 20 cultivos ativos",
    "Suporte prioritário",
  ],
  premium: [
    "Tudo do Básico",
    "Alertas Inteligentes IA",
    "Relatórios Detalhados",
    "Até 50 cultivos ativos",
    "Suporte premium",
  ],
  enterprise: [
    "Tudo do Premium",
    "Equipe e permissões",
    "API e integrações",
    "Cultivos ilimitados",
    "Suporte dedicado",
  ],
}