import { createLogger } from '@/lib/safe-logger'
import { NotificationService } from './notification-service'
import { NotificationType, NotificationPriority, NotificationContext } from '@/lib/types/notifications'
import { prisma } from '@/lib/prisma'
import { GeminiService } from '@/lib/gemini-service'

const logger = createLogger('NotificationRulesEngine')

// Interface para uma regra de notificação
export interface NotificationRule {
  id: string
  name: string
  description: string
  enabled: boolean
  priority: NotificationPriority
  cooldownMinutes: number
  condition: (context: CultivationContext) => Promise<boolean>
  action: (context: CultivationContext) => Promise<NotificationPayload>
}

// Contexto de cultivo para avaliação de regras
export interface CultivationContext {
  cultivation: any // Dados do cultivo
  user: any // Dados do usuário
  lastEvents: any[] // Últimos eventos
  daysSinceLastWatering: number
  daysSinceLastNutrition: number
  daysSincePhaseChange: number
  currentPhase: string
  hasActiveProblems: boolean
  averageGrowthRate: number
  environmentalConditions?: {
    temperature?: number
    humidity?: number
    lightHours?: number
  }
}

// Payload da notificação gerada
export interface NotificationPayload {
  type: NotificationType
  title: string
  message: string
  priority: NotificationPriority
  actionUrl?: string
  metadata?: Record<string, any>
}

// Cache para cooldowns (evitar spam de notificações)
class CooldownManager {
  private cooldowns = new Map<string, number>()

  isInCooldown(ruleId: string, userId: string): boolean {
    const key = `${ruleId}:${userId}`
    const lastTrigger = this.cooldowns.get(key)
    
    if (!lastTrigger) return false
    
    const now = Date.now()
    return (now - lastTrigger) < (5 * 60 * 1000) // 5 minutos mínimo
  }

  setCooldown(ruleId: string, userId: string, minutes: number): void {
    const key = `${ruleId}:${userId}`
    this.cooldowns.set(key, Date.now())
    
    // Limpar após o período de cooldown
    setTimeout(() => {
      this.cooldowns.delete(key)
    }, minutes * 60 * 1000)
  }

  clear(): void {
    this.cooldowns.clear()
  }
}

export class NotificationRulesEngine {
  private rules: NotificationRule[] = []
  private cooldownManager = new CooldownManager()

  constructor() {
    this.initializeDefaultRules()
  }

  /**
   * Inicializa regras padrão do sistema
   */
  private initializeDefaultRules(): void {
    this.rules = [
      // Regra 1: Alerta de rega atrasada
      {
        id: 'watering-overdue',
        name: 'Rega Atrasada',
        description: 'Alerta quando cultivo não recebe água há mais de 3 dias',
        enabled: true,
        priority: NotificationPriority.HIGH,
        cooldownMinutes: 60, // 1 hora
        condition: async (context) => {
          return context.daysSinceLastWatering > 3
        },
        action: async (context) => ({
          type: NotificationType.ALERT,
          title: '💧 Rega Urgente Necessária!',
          message: `Seu cultivo ${context.cultivation.name} não recebe água há ${context.daysSinceLastWatering} dias. Regue imediatamente para evitar estresse hídrico.`,
          priority: NotificationPriority.HIGH,
          actionUrl: `/cultivations/${context.cultivation.id}`,
          metadata: {
            ruleId: 'watering-overdue',
            cultivationId: context.cultivation.id,
            daysSinceLastWatering: context.daysSinceLastWatering
          }
        })
      },

      // Regra 2: Lembrete de nutrição
      {
        id: 'nutrition-reminder',
        name: 'Lembrete de Nutrição',
        description: 'Lembrete para aplicar nutrientes baseado na fase do cultivo',
        enabled: true,
        priority: NotificationPriority.MEDIUM,
        cooldownMinutes: 120, // 2 horas
        condition: async (context) => {
          // Vegetativo: a cada 7 dias, Floração: a cada 5 dias
          const maxDays = context.currentPhase === 'flowering' ? 5 : 7
          return context.daysSinceLastNutrition > maxDays
        },
        action: async (context) => ({
          type: NotificationType.REMINDER,
          title: '🌱 Hora dos Nutrientes!',
          message: `Seu cultivo ${context.cultivation.name} precisa de nutrientes. Fase ${context.currentPhase}: aplicar fertilizante adequado.`,
          priority: NotificationPriority.MEDIUM,
          actionUrl: `/cultivations/${context.cultivation.id}`,
          metadata: {
            ruleId: 'nutrition-reminder',
            cultivationId: context.cultivation.id,
            currentPhase: context.currentPhase,
            daysSinceLastNutrition: context.daysSinceLastNutrition
          }
        })
      },

      // Regra 3: Mudança de fase detectada
      {
        id: 'phase-change-detected',
        name: 'Mudança de Fase',
        description: 'Notifica quando cultivo muda de fase e sugere ajustes',
        enabled: true,
        priority: NotificationPriority.MEDIUM,
        cooldownMinutes: 1440, // 24 horas
        condition: async (context) => {
          return context.daysSincePhaseChange === 0 // Mudança recente
        },
        action: async (context) => {
          const phaseMessages = {
            'seedling': 'Mantenha umidade alta e luz suave',
            'vegetative': 'Aumente nutrientes de nitrogênio e luz para 18h',
            'flowering': 'Mude para 12h de luz e nutrientes de fósforo/potássio',
            'harvest': 'Prepare para colheita - pare nutrientes e reduza rega'
          }
          
          return {
            type: NotificationType.REMINDER,
            title: `🌿 Nova Fase: ${context.currentPhase}`,
            message: `Seu cultivo ${context.cultivation.name} entrou na fase ${context.currentPhase}. ${phaseMessages[context.currentPhase] || 'Ajuste cuidados conforme necessário'}.`,
            priority: NotificationPriority.MEDIUM,
            actionUrl: `/cultivations/${context.cultivation.id}`,
            metadata: {
              ruleId: 'phase-change-detected',
              cultivationId: context.cultivation.id,
              newPhase: context.currentPhase
            }
          }
        }
      },

      // Regra 4: Cultivo estagnado
      {
        id: 'growth-stagnation',
        name: 'Crescimento Estagnado',
        description: 'Alerta quando cultivo não mostra progresso há muito tempo',
        enabled: true,
        priority: NotificationPriority.HIGH,
        cooldownMinutes: 720, // 12 horas
        condition: async (context) => {
          return context.daysSincePhaseChange > 14 && context.averageGrowthRate < 0.1
        },
        action: async (context) => ({
          type: NotificationType.ALERT,
          title: '⚠️ Crescimento Estagnado',
          message: `Seu cultivo ${context.cultivation.name} não mostra progresso há ${context.daysSincePhaseChange} dias. Verifique condições ambientais, nutrientes e possíveis problemas.`,
          priority: NotificationPriority.HIGH,
          actionUrl: `/cultivations/${context.cultivation.id}`,
          metadata: {
            ruleId: 'growth-stagnation',
            cultivationId: context.cultivation.id,
            daysSincePhaseChange: context.daysSincePhaseChange,
            averageGrowthRate: context.averageGrowthRate
          }
        })
      },

      // Regra 5: Condições ambientais inadequadas
      {
        id: 'environmental-alert',
        name: 'Condições Ambientais',
        description: 'Alerta sobre temperatura, umidade ou luz inadequadas',
        enabled: true,
        priority: NotificationPriority.HIGH,
        cooldownMinutes: 180, // 3 horas
        condition: async (context) => {
          const env = context.environmentalConditions
          if (!env) return false
          
          // Verificar temperatura (ideal: 20-28°C)
          if (env.temperature && (env.temperature < 18 || env.temperature > 30)) {
            return true
          }
          
          // Verificar umidade (ideal: 40-70%)
          if (env.humidity && (env.humidity < 30 || env.humidity > 80)) {
            return true
          }
          
          return false
        },
        action: async (context) => {
          const env = context.environmentalConditions!
          let issue = ''
          let suggestion = ''
          
          if (env.temperature && env.temperature < 18) {
            issue = `Temperatura muito baixa (${env.temperature}°C)`
            suggestion = 'Aumente aquecimento ou melhore isolamento'
          } else if (env.temperature && env.temperature > 30) {
            issue = `Temperatura muito alta (${env.temperature}°C)`
            suggestion = 'Melhore ventilação ou adicione ar condicionado'
          } else if (env.humidity && env.humidity < 30) {
            issue = `Umidade muito baixa (${env.humidity}%)`
            suggestion = 'Use umidificador ou recipientes com água'
          } else if (env.humidity && env.humidity > 80) {
            issue = `Umidade muito alta (${env.humidity}%)`
            suggestion = 'Melhore ventilação ou use desumidificador'
          }
          
          return {
            type: NotificationType.ALERT,
            title: '🌡️ Condições Ambientais Inadequadas',
            message: `${issue} no cultivo ${context.cultivation.name}. ${suggestion}.`,
            priority: NotificationPriority.HIGH,
            actionUrl: `/cultivations/${context.cultivation.id}`,
            metadata: {
              ruleId: 'environmental-alert',
              cultivationId: context.cultivation.id,
              environmentalConditions: env,
              issue,
              suggestion
            }
          }
        }
      },

      // Regra 6: Análise inteligente com IA
      {
        id: 'ai-analysis-alert',
        name: 'Análise Inteligente IA',
        description: 'Usa IA para detectar padrões e problemas complexos',
        enabled: true,
        priority: NotificationPriority.MEDIUM,
        cooldownMinutes: 360, // 6 horas
        condition: async (context) => {
          // Executar análise IA apenas se houver dados suficientes
          return context.lastEvents.length >= 3 && context.daysSinceLastWatering <= 7
        },
        action: async (context) => {
          try {
            // Usar Gemini para análise inteligente
            const apiKey = process.env.Chave_API_GEMINI
            if (!apiKey) {
              throw new Error('API Gemini não configurada')
            }

            const geminiService = new GeminiService(apiKey)
            
            // Preparar dados para análise
            const analysisData = {
              sensorData: [
                {
                  sensorType: 'daysSinceWatering',
                  value: context.daysSinceLastWatering,
                  unit: 'days',
                  timestamp: new Date().toISOString()
                },
                {
                  sensorType: 'daysSinceNutrition',
                  value: context.daysSinceLastNutrition,
                  unit: 'days',
                  timestamp: new Date().toISOString()
                },
                {
                  sensorType: 'growthRate',
                  value: context.averageGrowthRate,
                  unit: 'rate',
                  timestamp: new Date().toISOString()
                }
              ],
              cultivationInfo: {
                strain: context.cultivation.seedStrain || 'Unknown',
                phase: context.currentPhase,
                daysSinceStart: Math.floor((Date.now() - new Date(context.cultivation.startDate).getTime()) / (1000 * 60 * 60 * 24)),
                numPlants: 1 // Valor padrão já que não temos esse campo no modelo atual
              },
              userQuery: 'Analise os dados e identifique possíveis problemas ou recomendações importantes',
              includeRecommendations: true,
              includePredictions: true
            }

            const analysis = await geminiService.analyzeCultivationData(analysisData)
            
            // Verificar se há anomalias críticas ou de alta prioridade
            const criticalAnomalies = analysis.anomalies.filter(a => 
              a.severity === 'critical' || a.severity === 'high'
            )

            let payload: NotificationPayload
            if (criticalAnomalies.length === 0) {
              payload = {
                type: NotificationType.REMINDER,
                title: '🔍 Verificação Recomendada',
                message: `Seu cultivo ${context.cultivation.name} precisa de atenção. Verifique condições gerais e histórico de eventos.`,
                priority: NotificationPriority.MEDIUM,
                actionUrl: `/cultivations/${context.cultivation.id}`,
                metadata: {
                  ruleId: 'ai-analysis-alert',
                  cultivationId: context.cultivation.id,
                  error: 'AI analysis found no critical anomalies'
                }
              }
            } else {
              const mainAnomaly = criticalAnomalies[0]
              payload = {
                type: NotificationType.ALERT,
                title: '🤖 Análise IA: Atenção Necessária',
                message: `IA detectou: ${mainAnomaly.description}. ${mainAnomaly.recommendation}`,
                priority: mainAnomaly.severity === 'critical' ? NotificationPriority.CRITICAL : NotificationPriority.HIGH,
                actionUrl: `/cultivations/${context.cultivation.id}`,
                metadata: {
                  ruleId: 'ai-analysis-alert',
                  cultivationId: context.cultivation.id,
                  aiAnalysis: analysis,
                  mainAnomaly,
                  totalAnomalies: criticalAnomalies.length
                }
              }
            }
            return payload

          } catch (error) {
            logger.error('Error in AI analysis rule:', error)
            
            // Fallback para análise básica
            return {
              type: NotificationType.REMINDER,
              title: '🔍 Verificação Recomendada',
              message: `Seu cultivo ${context.cultivation.name} precisa de atenção. Verifique condições gerais e histórico de eventos.`,
              priority: NotificationPriority.MEDIUM,
              actionUrl: `/cultivations/${context.cultivation.id}`,
              metadata: {
                ruleId: 'ai-analysis-alert',
                cultivationId: context.cultivation.id,
                error: 'AI analysis failed, using fallback'
              }
            }
          }
        }
      }
    ]

    logger.info(`Initialized ${this.rules.length} default notification rules`)
  }

  /**
   * Avalia todas as regras para um cultivo específico
   */
  async evaluateRules(cultivationId: string): Promise<void> {
    try {
      logger.debug(`Evaluating rules for cultivation ${cultivationId}`)
      
      // Buscar dados do cultivo
      const cultivation = await prisma.cultivation.findUnique({
        where: { id: cultivationId },
        include: {
          user: true,
          events: {
            orderBy: { date: 'desc' },
            take: 10
          }
        }
      })

      if (!cultivation) {
        logger.warn(`Cultivation ${cultivationId} not found`)
        return
      }

      // Construir contexto
      const context = await this.buildContext(cultivation)
      
      // Avaliar cada regra ativa
      const activeRules = this.rules.filter(rule => rule.enabled)
      
      for (const rule of activeRules) {
        await this.evaluateRule(rule, context)
      }

    } catch (error) {
      logger.error(`Error evaluating rules for cultivation ${cultivationId}:`, error)
    }
  }

  /**
   * Avalia uma regra específica
   */
  private async evaluateRule(rule: NotificationRule, context: CultivationContext): Promise<void> {
    try {
      // Verificar cooldown
      if (this.cooldownManager.isInCooldown(rule.id, context.user.id)) {
        logger.debug(`Rule ${rule.id} is in cooldown for user ${context.user.id}`)
        return
      }

      // Avaliar condição
      const shouldTrigger = await rule.condition(context)
      
      if (!shouldTrigger) {
        logger.debug(`Rule ${rule.id} condition not met for cultivation ${context.cultivation.id}`)
        return
      }

      // Gerar payload da notificação
      const payload = await rule.action(context)
      
      // Verificar se a regra retornou um payload válido
      if (!payload) {
        logger.debug(`Rule ${rule.id} returned null payload, skipping notification`)
        return
      }
      
      // Criar notificação
      await NotificationService.createNotification({
        type: payload.type,
        title: payload.title,
        message: payload.message,
        priority: payload.priority,
        metadata: payload.metadata,
        actionUrl: payload.actionUrl,
        userId: context.user.id as string
      })

      // Definir cooldown
      this.cooldownManager.setCooldown(rule.id, context.user.id, rule.cooldownMinutes)
      
      logger.info(`Rule ${rule.id} triggered for cultivation ${context.cultivation.id}`, {
        ruleId: rule.id,
        cultivationId: context.cultivation.id,
        userId: context.user.id,
        notificationType: payload.type
      })

    } catch (error) {
      logger.error(`Error evaluating rule ${rule.id}:`, error)
    }
  }

  /**
   * Constrói contexto de cultivo para avaliação de regras
   */
  private async buildContext(cultivation: any): Promise<CultivationContext> {
    const now = new Date()
    
    // Calcular dias desde última rega
    const lastWateringEvent = cultivation.events.find((e: any) => 
      e.type === 'watering' || e.description?.toLowerCase().includes('rega')
    )
    const daysSinceLastWatering = lastWateringEvent 
      ? Math.floor((now.getTime() - new Date(lastWateringEvent.date).getTime()) / (1000 * 60 * 60 * 24))
      : 999

    // Calcular dias desde última nutrição
    const lastNutritionEvent = cultivation.events.find((e: any) => 
      e.type === 'nutrition' || e.description?.toLowerCase().includes('nutrient')
    )
    const daysSinceLastNutrition = lastNutritionEvent
      ? Math.floor((now.getTime() - new Date(lastNutritionEvent.date).getTime()) / (1000 * 60 * 60 * 24))
      : 999

    // Determinar fase atual (simplificado)
    const daysSinceStart = Math.floor((now.getTime() - new Date(cultivation.startDate).getTime()) / (1000 * 60 * 60 * 24))
    let currentPhase = 'seedling'
    if (daysSinceStart > 14) currentPhase = 'vegetative'
    if (daysSinceStart > 60) currentPhase = 'flowering'
    if (cultivation.status === 'completed') currentPhase = 'harvest'

    // Calcular dias desde mudança de fase (simplificado)
    const daysSincePhaseChange = this.calculateDaysSincePhaseChange(daysSinceStart, currentPhase)

    return {
      cultivation,
      user: cultivation.user,
      lastEvents: cultivation.events,
      daysSinceLastWatering,
      daysSinceLastNutrition,
      daysSincePhaseChange,
      currentPhase,
      hasActiveProblems: cultivation.hasSevereProblems || false,
      averageGrowthRate: this.calculateGrowthRate(cultivation.events),
      environmentalConditions: {
        // Dados simulados - em produção viriam de sensores
        temperature: 22 + Math.random() * 8, // 22-30°C
        humidity: 50 + Math.random() * 20,   // 50-70%
        lightHours: currentPhase === 'flowering' ? 12 : 18
      }
    }
  }

  /**
   * Calcula dias desde mudança de fase
   */
  private calculateDaysSincePhaseChange(daysSinceStart: number, currentPhase: string): number {
    switch (currentPhase) {
      case 'seedling': return daysSinceStart
      case 'vegetative': return daysSinceStart - 14
      case 'flowering': return daysSinceStart - 60
      default: return 0
    }
  }

  /**
   * Calcula taxa de crescimento baseada em eventos
   */
  private calculateGrowthRate(events: any[]): number {
    // Simplificado - em produção seria baseado em medições reais
    const growthEvents = events.filter(e => 
      e.type === 'growth' || e.description?.toLowerCase().includes('crescimento')
    )
    
    if (growthEvents.length < 2) return 0.5 // Taxa padrão
    
    // Calcular taxa baseada na frequência de eventos de crescimento
    return Math.min(1.0, growthEvents.length / 10)
  }

  /**
   * Adiciona uma nova regra
   */
  addRule(rule: NotificationRule): void {
    this.rules.push(rule)
    logger.info(`Added new rule: ${rule.id}`)
  }

  /**
   * Remove uma regra
   */
  removeRule(ruleId: string): boolean {
    const index = this.rules.findIndex(rule => rule.id === ruleId)
    if (index !== -1) {
      this.rules.splice(index, 1)
      logger.info(`Removed rule: ${ruleId}`)
      return true
    }
    return false
  }

  /**
   * Habilita/desabilita uma regra
   */
  toggleRule(ruleId: string, enabled: boolean): boolean {
    const rule = this.rules.find(r => r.id === ruleId)
    if (rule) {
      rule.enabled = enabled
      logger.info(`Rule ${ruleId} ${enabled ? 'enabled' : 'disabled'}`)
      return true
    }
    return false
  }

  /**
   * Lista todas as regras
   */
  getRules(): NotificationRule[] {
    return [...this.rules]
  }

  /**
   * Obtém estatísticas das regras
   */
  getStats(): {
    totalRules: number
    activeRules: number
    cooldownsActive: number
  } {
    return {
      totalRules: this.rules.length,
      activeRules: this.rules.filter(r => r.enabled).length,
      cooldownsActive: this.cooldownManager['cooldowns'].size
    }
  }

  /**
   * Limpa todos os cooldowns (útil para testes)
   */
  clearCooldowns(): void {
    this.cooldownManager.clear()
    logger.info('All cooldowns cleared')
  }
}

// Instância singleton
export const notificationRulesEngine = new NotificationRulesEngine()