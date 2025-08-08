// Sistema de permissões otimizado com cache e analytics
import { createClient } from '@/lib/supabase/server'
import { prisma } from '@/lib/prisma'
import { getUserPermissions, PLAN_PERMISSIONS } from '@/lib/permissions-supabase'

// Cache em memória para permissões (em produção, usar Redis)
const permissionsCache = new Map<string, { permissions: any; timestamp: number }>()
const CACHE_TTL = 5 * 60 * 1000 // 5 minutos

export class PermissionsService {
  
  // Obter permissões com cache
  static async getUserPermissionsWithCache(userId: string) {
    const cached = permissionsCache.get(userId)
    
    if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
      return cached.permissions
    }
    
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: { subscription: true }
    })
    
    if (!user) return PLAN_PERMISSIONS.free
    
    const permissions = getUserPermissions(user)
    
    // Cachear resultado
    permissionsCache.set(userId, {
      permissions,
      timestamp: Date.now()
    })
    
    return permissions
  }
  
  // Verificar permissão específica
  static async canAccess(userId: string, permission: keyof typeof PLAN_PERMISSIONS.free): Promise<boolean> {
    const permissions = await this.getUserPermissionsWithCache(userId)
    return Boolean(permissions[permission])
  }
  
  // Verificar limite de cultivos
  static async checkCultivationLimit(userId: string): Promise<boolean> {
    const permissions = await this.getUserPermissionsWithCache(userId)
    
    if (permissions.maxCultivations === -1) return true // Ilimitado
    
    const currentCount = await prisma.cultivation.count({
      where: { userId }
    })
    
    return currentCount < permissions.maxCultivations
  }
  
  // Invalidar cache quando plano muda
  static invalidateCache(userId: string) {
    permissionsCache.delete(userId)
  }
  
  // Obter estatísticas de uso
  static async getUsageStats(userId: string) {
    const [cultivationCount, storageUsed] = await Promise.all([
      prisma.cultivation.count({ where: { userId } }),
      prisma.cultivationImage.aggregate({
        where: { cultivation: { userId } },
        _sum: { fileSize: true }
      })
    ])
    
    const permissions = await this.getUserPermissionsWithCache(userId)
    
    return {
      cultivations: {
        used: cultivationCount,
        limit: permissions.maxCultivations,
        percentage: permissions.maxCultivations === -1 ? 0 : (cultivationCount / permissions.maxCultivations) * 100
      },
      storage: {
        used: Math.round((storageUsed._sum.fileSize || 0) / (1024 * 1024 * 1024) * 100) / 100, // GB
        limit: permissions.maxStorageGB,
        percentage: ((storageUsed._sum.fileSize || 0) / (permissions.maxStorageGB * 1024 * 1024 * 1024)) * 100
      }
    }
  }
  
  // Middleware para APIs
  static requirePermission(permission: keyof typeof PLAN_PERMISSIONS.free) {
    return async (userId: string) => {
      const hasPermission = await this.canAccess(userId, permission)
      
      if (!hasPermission) {
        const permissions = await this.getUserPermissionsWithCache(userId)
        const requiredPlan = this.getMinimumPlanFor(permission)
        
        throw new Error(`Acesso negado. Permissão '${permission}' requer plano '${requiredPlan}'. Plano atual permite: ${JSON.stringify(permissions)}`)
      }
      
      return true
    }
  }
  
  // Obter plano mínimo necessário para uma permissão
  static getMinimumPlanFor(permission: keyof typeof PLAN_PERMISSIONS.free): string {
    const plans = ['free', 'basic', 'premium', 'enterprise'] as const
    
    for (const plan of plans) {
      if (PLAN_PERMISSIONS[plan][permission]) {
        return plan
      }
    }
    
    return 'enterprise'
  }
  
  // Atualizar plano do usuário
  static async upgradePlan(userId: string, newPlan: 'basic' | 'premium' | 'enterprise', paymentData?: any) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: { subscription: true }
    })
    
    if (!user) throw new Error('Usuário não encontrado')
    
    const endDate = new Date()
    endDate.setMonth(endDate.getMonth() + 1) // 1 mês
    
    const subscription = await prisma.subscription.upsert({
      where: { userId },
      update: {
        plan: newPlan,
        status: 'active',
        endDate,
        price: PLAN_PERMISSIONS[newPlan] ? 29.90 : 0, // Preço baseado no plano
        updatedAt: new Date()
      },
      create: {
        userId,
        plan: newPlan,
        status: 'active',
        startDate: new Date(),
        endDate,
        price: 29.90,
        currency: 'BRL',
        features: Object.keys(PLAN_PERMISSIONS[newPlan]).filter(key => 
          PLAN_PERMISSIONS[newPlan][key as keyof typeof PLAN_PERMISSIONS.free] === true
        )
      }
    })
    
    // Invalidar cache
    this.invalidateCache(userId)
    
    // Log da mudança
    console.log(`Usuário ${userId} fez upgrade para ${newPlan}`)
    
    return subscription
  }
  
  // Verificar se assinatura está próxima do vencimento
  static async checkExpiringSubscriptions() {
    const sevenDaysFromNow = new Date()
    sevenDaysFromNow.setDate(sevenDaysFromNow.getDate() + 7)
    
    const expiringSubscriptions = await prisma.subscription.findMany({
      where: {
        status: 'active',
        endDate: {
          lte: sevenDaysFromNow
        }
      },
      include: { user: true }
    })
    
    return expiringSubscriptions
  }
}