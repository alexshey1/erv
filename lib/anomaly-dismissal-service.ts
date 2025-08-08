import type { DetectedAnomaly } from "./anomaly-detector"

// Interface para anomalias dispensadas
export interface DismissedAnomaly {
  id: string
  cultivationId: string
  parameter: string
  dismissedAt: string
  reason: 'corrected' | 'acknowledged'
  dataTimestamp?: string // Timestamp do dado que gerou a anomalia
}

// Interface para rastrear último processamento por cultivo
export interface CultivationProcessingState {
  cultivationId: string
  lastProcessedTimestamp: string
  lastCheckTimestamp: string
}

export class AnomalyDismissalService {
  private static readonly DISMISSED_KEY = 'supa_dismissed_anomalies'
  private static readonly PROCESSING_STATE_KEY = 'supa_cultivation_processing_state'

  // Salvar dismissal de anomalia
  static saveDismissal(anomaly: DetectedAnomaly, reason: 'corrected' | 'acknowledged'): void {
    try {
      const dismissed: DismissedAnomaly = {
        id: anomaly.id,
        cultivationId: anomaly.cultivationId,
        parameter: anomaly.parameter,
        dismissedAt: new Date().toISOString(),
        reason,
        dataTimestamp: anomaly.timestamp
      }

      const existing = this.getDismissedAnomalies()
      existing.push(dismissed)
      
      localStorage.setItem(this.DISMISSED_KEY, JSON.stringify(existing))
      
      console.log(`✅ Anomalia dispensada: ${anomaly.parameter} - ${reason}`)
    } catch (error) {
      console.error('❌ Erro ao salvar dismissal:', error)
    }
  }

  // Verificar se anomalia já foi dispensada
  static isDismissed(anomaly: DetectedAnomaly): boolean {
    try {
      const dismissed = this.getDismissedAnomalies()
      
      // Verificar se existe dismissal para este cultivo + parâmetro
      return dismissed.some(d => 
        d.cultivationId === anomaly.cultivationId &&
        d.parameter === anomaly.parameter &&
        // Se há timestamp do dado, verificar se é posterior ao dismissal
        (!d.dataTimestamp || !anomaly.timestamp || anomaly.timestamp <= d.dataTimestamp)
      )
    } catch (error) {
      console.error('❌ Erro ao verificar dismissal:', error)
      return false
    }
  }

  // Obter todas as anomalias dispensadas
  static getDismissedAnomalies(): DismissedAnomaly[] {
    try {
      const stored = localStorage.getItem(this.DISMISSED_KEY)
      return stored ? JSON.parse(stored) : []
    } catch (error) {
      console.error('❌ Erro ao carregar dismissals:', error)
      return []
    }
  }

  // Limpar dismissals antigos (mais de 30 dias)
  static cleanOldDismissals(): void {
    try {
      const dismissed = this.getDismissedAnomalies()
      const thirtyDaysAgo = new Date()
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)

      const filtered = dismissed.filter(d => 
        new Date(d.dismissedAt) > thirtyDaysAgo
      )

      localStorage.setItem(this.DISMISSED_KEY, JSON.stringify(filtered))
      
      const removed = dismissed.length - filtered.length
      if (removed > 0) {
        console.log(`🧹 Removidos ${removed} dismissals antigos`)
      }
    } catch (error) {
      console.error('❌ Erro na limpeza de dismissals:', error)
    }
  }

  // Obter último timestamp processado para um cultivo
  static getLastProcessedTimestamp(cultivationId: string): string | null {
    try {
      const states = this.getProcessingStates()
      const state = states.find(s => s.cultivationId === cultivationId)
      return state?.lastProcessedTimestamp || null
    } catch (error) {
      console.error('❌ Erro ao obter último timestamp:', error)
      return null
    }
  }

  // Atualizar último timestamp processado
  static updateLastProcessedTimestamp(cultivationId: string, timestamp: string): void {
    try {
      const states = this.getProcessingStates()
      const existingIndex = states.findIndex(s => s.cultivationId === cultivationId)
      
      const newState: CultivationProcessingState = {
        cultivationId,
        lastProcessedTimestamp: timestamp,
        lastCheckTimestamp: new Date().toISOString()
      }

      if (existingIndex >= 0) {
        states[existingIndex] = newState
      } else {
        states.push(newState)
      }

      localStorage.setItem(this.PROCESSING_STATE_KEY, JSON.stringify(states))
    } catch (error) {
      console.error('❌ Erro ao atualizar timestamp:', error)
    }
  }

  // Obter estados de processamento
  static getProcessingStates(): CultivationProcessingState[] {
    try {
      const stored = localStorage.getItem(this.PROCESSING_STATE_KEY)
      return stored ? JSON.parse(stored) : []
    } catch (error) {
      console.error('❌ Erro ao carregar estados:', error)
      return []
    }
  }

  // Verificar se dados são novos (posteriores ao último processamento)
  static isNewData(cultivationId: string, dataTimestamp: string): boolean {
    const lastProcessed = this.getLastProcessedTimestamp(cultivationId)
    if (!lastProcessed) return true // Se nunca processou, considerar novo
    
    return new Date(dataTimestamp) > new Date(lastProcessed)
  }

  // Filtrar apenas dados novos de um array
  static filterNewData<T extends { timestamp?: string; date?: string }>(
    cultivationId: string, 
    data: T[]
  ): T[] {
    const lastProcessed = this.getLastProcessedTimestamp(cultivationId)
    if (!lastProcessed) return data

    return data.filter(item => {
      const itemTimestamp = item.timestamp || item.date
      return itemTimestamp && new Date(itemTimestamp) > new Date(lastProcessed)
    })
  }

  // Obter estatísticas de dismissals
  static getDismissalStats(): {
    total: number
    byCultivation: Record<string, number>
    byParameter: Record<string, number>
    byReason: Record<string, number>
  } {
    const dismissed = this.getDismissedAnomalies()
    
    const stats = {
      total: dismissed.length,
      byCultivation: {} as Record<string, number>,
      byParameter: {} as Record<string, number>,
      byReason: {} as Record<string, number>
    }

    dismissed.forEach(d => {
      stats.byCultivation[d.cultivationId] = (stats.byCultivation[d.cultivationId] || 0) + 1
      stats.byParameter[d.parameter] = (stats.byParameter[d.parameter] || 0) + 1
      stats.byReason[d.reason] = (stats.byReason[d.reason] || 0) + 1
    })

    return stats
  }

  // Limpar todos os dismissals (para debug/reset)
  static clearAllDismissals(): void {
    try {
      localStorage.removeItem(this.DISMISSED_KEY)
      localStorage.removeItem(this.PROCESSING_STATE_KEY)
      console.log('🗑️ Todos os dismissals foram limpos')
    } catch (error) {
      console.error('❌ Erro ao limpar dismissals:', error)
    }
  }
}
