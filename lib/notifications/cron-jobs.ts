import { createLogger } from '@/lib/safe-logger'
import { notificationRulesEngine } from './rules-engine'
import { prisma } from '@/lib/prisma'
import { NotificationService } from './notification-service'
import { NotificationPriority } from '@/lib/types/notifications'

const logger = createLogger('NotificationCronJobs')

export class NotificationCronJobs {
  private static isRunning = false
  private static lastRun: Record<string, number> = {}

  /**
   * Verifica lembretes para todos os cultivos ativos
   * Executa a cada hora
   */
  static async checkReminders(): Promise<void> {
    const jobName = 'checkReminders'
    
    if (this.isRunning) {
      logger.warn(`Job ${jobName} already running, skipping`)
      return
    }

    try {
      this.isRunning = true
      const startTime = Date.now()
      
      logger.info(`Starting ${jobName} job`)

      // Buscar todos os cultivos ativos
      const activeCultivations = await prisma.cultivation.findMany({
        where: {
          status: {
            in: ['active', 'vegetative', 'flowering']
          }
        },
        select: {
          id: true,
          name: true,
          userId: true,
          status: true,
          startDate: true
        }
      })

      logger.info(`Found ${activeCultivations.length} active cultivations to check`)

      let processedCount = 0
      let errorCount = 0

      // Processar cada cultivo
      for (const cultivation of activeCultivations) {
        try {
          await notificationRulesEngine.evaluateRules(cultivation.id as string)
          processedCount++
          
          // Pequeno delay para não sobrecarregar o sistema
          await new Promise(resolve => setTimeout(resolve, 100))
          
        } catch (error) {
          errorCount++
          logger.error(`Error processing cultivation ${cultivation.id}:`, error)
        }
      }

      const duration = Date.now() - startTime
      this.lastRun[jobName] = Date.now()

      logger.info(`${jobName} job completed`, {
        duration: `${duration}ms`,
        totalCultivations: activeCultivations.length,
        processed: processedCount,
        errors: errorCount
      })

    } catch (error) {
      logger.error(`Error in ${jobName} job:`, error)
    } finally {
      this.isRunning = false
    }
  }

  /**
   * Verifica alertas críticos
   * Executa a cada 30 minutos
   */
  static async checkAlerts(): Promise<void> {
    const jobName = 'checkAlerts'
    
    try {
      logger.info(`Starting ${jobName} job`)
      const startTime = Date.now()

      // Buscar cultivos com possíveis problemas críticos
      const criticalCultivations = await prisma.cultivation.findMany({
        where: {
          OR: [
            { hasSevereProblems: true },
            { 
              status: 'active',
              // Cultivos muito antigos sem atualização
              updatedAt: {
                lt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) // 7 dias
              }
            }
          ]
        },
        include: {
          user: true,
          events: {
            orderBy: { date: 'desc' },
            take: 5
          }
        }
      })

      logger.info(`Found ${criticalCultivations.length} cultivations needing critical checks`)

      for (const cultivation of criticalCultivations) {
        try {
          // Verificar se há eventos recentes
          const lastEvent = cultivation.events[0]
          const daysSinceLastEvent = lastEvent 
            ? Math.floor((Date.now() - new Date(lastEvent.date).getTime()) / (1000 * 60 * 60 * 24))
            : 999

          // Alerta de abandono
          if (daysSinceLastEvent > 7) {
            await NotificationService.createAlert(
              cultivation.userId,
              '🚨 Cultivo Abandonado?',
              `Seu cultivo ${cultivation.name} não tem atividade há ${daysSinceLastEvent} dias. Verifique se está tudo bem!`,
              NotificationPriority.HIGH,
              {
                userId: cultivation.userId,
                cultivationId: cultivation.id
              }
            )
          }

          // Alerta de problemas severos
          if (cultivation.hasSevereProblems) {
            await NotificationService.createAlert(
              cultivation.userId,
              '⚠️ Problemas Críticos Detectados',
              `Seu cultivo ${cultivation.name} tem problemas severos que precisam de atenção imediata.`,
              NotificationPriority.CRITICAL,
              {
                userId: cultivation.userId,
                cultivationId: cultivation.id
              }
            )
          }

        } catch (error) {
          logger.error(`Error processing critical cultivation ${cultivation.id}:`, error)
        }
      }

      const duration = Date.now() - startTime
      this.lastRun[jobName] = Date.now()

      logger.info(`${jobName} job completed in ${duration}ms`)

    } catch (error) {
      logger.error(`Error in ${jobName} job:`, error)
    }
  }

  /**
   * Verifica conquistas e marcos
   * Executa diariamente
   */
  static async checkAchievements(): Promise<void> {
    const jobName = 'checkAchievements'
    
    try {
      logger.info(`Starting ${jobName} job`)
      const startTime = Date.now()

      // Buscar usuários ativos (com cultivos recentes)
      const activeUsers = await prisma.user.findMany({
        where: {
          cultivations: {
            some: {
              createdAt: {
                gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) // 30 dias
              }
            }
          }
        },
        include: {
          cultivations: {
            orderBy: { createdAt: 'desc' }
          }
        }
      })

      logger.info(`Checking achievements for ${activeUsers.length} active users`)

      for (const user of activeUsers) {
        try {
          await this.checkUserAchievements(user)
        } catch (error) {
          logger.error(`Error checking achievements for user ${user.id}:`, error)
        }
      }

      const duration = Date.now() - startTime
      this.lastRun[jobName] = Date.now()

      logger.info(`${jobName} job completed in ${duration}ms`)

    } catch (error) {
      logger.error(`Error in ${jobName} job:`, error)
    }
  }

  /**
   * Verifica conquistas específicas de um usuário
   */
  private static async checkUserAchievements(user: any): Promise<void> {
    const cultivations = user.cultivations
    const completedCultivations = cultivations.filter((c: any) => c.status === 'completed')
    
    // Conquista: Primeira colheita
    if (completedCultivations.length === 1) {
      const firstHarvest = completedCultivations[0]
      const isRecent = (Date.now() - new Date(firstHarvest.updatedAt).getTime()) < (24 * 60 * 60 * 1000)
      
      if (isRecent) {
        await NotificationService.createAchievement(
          user.id,
          '🏆 Primeira Colheita!',
          `Parabéns! Você completou seu primeiro cultivo: ${firstHarvest.name}. Yield: ${firstHarvest.yield_g}g`,
          {
            userId: user.id,
            cultivationId: firstHarvest.id
          }
        )
      }
    }

    // Conquista: Cultivador experiente (5+ cultivos)
    if (completedCultivations.length === 5) {
      await NotificationService.createAchievement(
        user.id,
        '🌟 Cultivador Experiente!',
        `Incrível! Você completou 5 cultivos com sucesso. Você está se tornando um expert!`,
        {
          userId: user.id
        }
      )
    }

    // Conquista: Alto rendimento (>100g)
    const highYieldCultivations = completedCultivations.filter((c: any) => c.yield_g > 100)
    if (highYieldCultivations.length === 1) {
      const highYield = highYieldCultivations[0]
      const isRecent = (Date.now() - new Date(highYield.updatedAt).getTime()) < (24 * 60 * 60 * 1000)
      
      if (isRecent) {
        await NotificationService.createAchievement(
          user.id,
          '💪 Alto Rendimento!',
          `Excelente! Seu cultivo ${highYield.name} produziu ${highYield.yield_g}g - acima de 100g!`,
          {
            userId: user.id,
            cultivationId: highYield.id
          }
        )
      }
    }

    // Conquista: Economia significativa (>R$ 1000)
    const profitableCultivations = completedCultivations.filter((c: any) => c.profit_brl > 1000)
    if (profitableCultivations.length === 1) {
      const profitable = profitableCultivations[0]
      const isRecent = (Date.now() - new Date(profitable.updatedAt).getTime()) < (24 * 60 * 60 * 1000)
      
      if (isRecent) {
        await NotificationService.createAchievement(
          user.id,
          '💰 Grande Economia!',
          `Fantástico! Seu cultivo ${profitable.name} gerou uma economia de R$ ${profitable.profit_brl.toFixed(2)}!`,
          {
            userId: user.id,
            cultivationId: profitable.id
          }
        )
      }
    }
  }

  /**
   * Limpeza de notificações antigas
   * Executa semanalmente
   */
  static async cleanupOldNotifications(): Promise<void> {
    const jobName = 'cleanupOldNotifications'
    
    try {
      logger.info(`Starting ${jobName} job`)
      const startTime = Date.now()

      const deletedCount = await NotificationService.cleanupOldNotifications()

      const duration = Date.now() - startTime
      this.lastRun[jobName] = Date.now()

      logger.info(`${jobName} job completed`, {
        duration: `${duration}ms`,
        deletedNotifications: deletedCount
      })

    } catch (error) {
      logger.error(`Error in ${jobName} job:`, error)
    }
  }

  /**
   * Executa todos os jobs de manutenção
   */
  static async runMaintenanceJobs(): Promise<void> {
    logger.info('Running maintenance jobs')
    
    try {
      await Promise.all([
        this.cleanupOldNotifications(),
        // Adicionar outros jobs de manutenção aqui
      ])
      
      logger.info('Maintenance jobs completed')
    } catch (error) {
      logger.error('Error running maintenance jobs:', error)
    }
  }

  /**
   * Obtém estatísticas dos jobs
   */
  static getJobStats(): Record<string, any> {
    return {
      isRunning: this.isRunning,
      lastRuns: this.lastRun,
      rulesEngineStats: notificationRulesEngine.getStats()
    }
  }

  /**
   * Executa job específico manualmente (para testes)
   */
  static async runJob(jobName: string): Promise<void> {
    logger.info(`Manually running job: ${jobName}`)
    
    switch (jobName) {
      case 'checkReminders':
        await this.checkReminders()
        break
      case 'checkAlerts':
        await this.checkAlerts()
        break
      case 'checkAchievements':
        await this.checkAchievements()
        break
      case 'cleanupOldNotifications':
        await this.cleanupOldNotifications()
        break
      default:
        throw new Error(`Unknown job: ${jobName}`)
    }
  }
}