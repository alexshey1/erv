import type { AgronomicDataPoint, CultivationSummary } from "./mock-data"
import { AnomalyDismissalService } from "./anomaly-dismissal-service"

// Interface para definir os parâmetros que podem ser monitorados
export interface MonitoringParameter {
  name: string
  key: keyof AgronomicDataPoint
  unit: string
  minValue: number
  maxValue: number
  criticalThreshold: number // Percentual de desvio considerado crítico
  warningThreshold: number // Percentual de desvio para alerta
}

// Interface para o padrão normal de um cultivo
export interface CultivationPattern {
  cultivationId: string
  strain: string
  phase: "vegetative" | "flowering" | "curing"
  parameters: Record<string, ParameterBaseline>
  successRate: number // Taxa de sucesso baseada em cultivos anteriores
  sampleSize: number // Número de amostras usadas para calcular o padrão
}

// Interface para a linha base de um parâmetro
export interface ParameterBaseline {
  mean: number
  standardDeviation: number
  min: number
  max: number
  optimalRange: {
    min: number
    max: number
  }
}

// Interface para uma anomalia detectada
export interface DetectedAnomaly {
  id: string
  cultivationId: string
  cultivationName: string
  parameter: string
  currentValue: number
  expectedValue: number
  deviationPercent: number
  severity: "low" | "medium" | "high" | "critical"
  message: string
  timestamp: string
  phase: string
  strain: string
  actionable: boolean
  suggestedAction?: string
}

// Parâmetros que podem ser monitorados
export const MONITORING_PARAMETERS: MonitoringParameter[] = [
  {
    name: "pH",
    key: "ph",
    unit: "",
    minValue: 5.8,
    maxValue: 6.2, // Novo range ideal
    criticalThreshold: 20, // 20% de desvio
    warningThreshold: 20, // 20% de desvio para medium
  },
  {
    name: "Condutividade Elétrica (EC)",
    key: "ec",
    unit: "mS/cm",
    minValue: 1.0,
    maxValue: 1.6, // Base para vegetativo
    criticalThreshold: 20,
    warningThreshold: 15,
  },
  {
    name: "Temperatura",
    key: "temperature_c",
    unit: "°C",
    minValue: 24,
    maxValue: 30,
    criticalThreshold: 20,
    warningThreshold: 20,
  },
  {
    name: "Umidade",
    key: "humidity_percent",
    unit: "%",
    minValue: 60,
    maxValue: 70, // Base para vegetativo
    criticalThreshold: 25,
    warningThreshold: 15,
  },
]

// Classe principal para detecção de anomalias
export class AnomalyDetector {
  private patterns: Map<string, CultivationPattern> = new Map()

  // Aprende padrões de cultivos bem-sucedidos
  learnPatterns(successfulCultivations: CultivationSummary[], agronomicData: AgronomicDataPoint[][]) {
    successfulCultivations.forEach((cultivation, index) => {
      if (cultivation.yield_g > 0 && cultivation.profit_brl > 0) {
        const data = agronomicData[index] || []
        this.analyzeCultivationPattern(cultivation, data)
      }
    })
  }

  // Analisa o padrão de um cultivo específico
  private analyzeCultivationPattern(cultivation: CultivationSummary, data: AgronomicDataPoint[]) {
    const patternKey = `${cultivation.seedStrain}_${this.determinePhase(cultivation)}`

    const parameterBaselines: Record<string, ParameterBaseline> = {}

    MONITORING_PARAMETERS.forEach(param => {
      const values = data.map(d => d[param.key] as number).filter(v => !isNaN(v))

      if (values.length > 0) {
        const mean = values.reduce((a, b) => a + b, 0) / values.length
        const variance = values.reduce((acc, val) => acc + Math.pow(val - mean, 2), 0) / values.length
        const standardDeviation = Math.sqrt(variance)

        parameterBaselines[param.name] = {
          mean,
          standardDeviation,
          min: Math.min(...values),
          max: Math.max(...values),
          optimalRange: {
            min: mean - standardDeviation,
            max: mean + standardDeviation,
          }
        }
      }
    })

    const pattern: CultivationPattern = {
      cultivationId: cultivation.id,
      strain: cultivation.seedStrain,
      phase: this.determinePhase(cultivation),
      parameters: parameterBaselines,
      successRate: this.calculateSuccessRate(cultivation),
      sampleSize: data.length,
    }

    this.patterns.set(patternKey, pattern)
  }

  // Determina a fase do cultivo
  private determinePhase(cultivation: CultivationSummary): "vegetative" | "flowering" | "curing" {
    const daysSinceStart = Math.floor(
      (new Date().getTime() - new Date(cultivation.startDate).getTime()) / (1000 * 60 * 60 * 24)
    )

    // Assumindo 60 dias vegetativo, 70 dias floração
    if (daysSinceStart <= 60) return "vegetative"
    if (daysSinceStart <= 130) return "flowering"
    return "curing"
  }

  // Calcula taxa de sucesso baseada no rendimento e lucro
  private calculateSuccessRate(cultivation: CultivationSummary): number {
    const yieldScore = Math.min(cultivation.yield_g / 500, 1) // Normalizado para 500g
    const profitScore = Math.min(cultivation.profit_brl / 15000, 1) // Normalizado para R$ 15k
    return (yieldScore + profitScore) / 2
  }

  // Detecta anomalias em um cultivo atual
  detectAnomalies(
    currentCultivation: CultivationSummary,
    currentData: AgronomicDataPoint[]
  ): DetectedAnomaly[] {
    // Filtrar apenas dados novos (não processados anteriormente)
    const newData = AnomalyDismissalService.filterNewData(currentCultivation.id, currentData)

    if (newData.length === 0) {
      console.log(`📊 Nenhum dado novo para análise no cultivo ${currentCultivation.name}`)
      return []
    }

    const anomalies: DetectedAnomaly[] = []
    const currentPhase = this.determinePhase(currentCultivation)
    const patternKey = `${currentCultivation.seedStrain}_${currentPhase}`
    const pattern = this.patterns.get(patternKey)

    if (!pattern) {
      // Se não há padrão específico, usar padrões gerais
      const generalAnomalies = this.detectGeneralAnomalies(currentCultivation, newData)
      return this.filterDismissedAnomalies(generalAnomalies)
    }

    // Verificar cada parâmetro monitorado
    MONITORING_PARAMETERS.forEach(param => {
      const latestData = newData[newData.length - 1]
      if (!latestData) return

      const currentValue = latestData[param.key] as number
      if (isNaN(currentValue)) return

      const baseline = pattern.parameters[param.name]
      if (!baseline) return

      // Calcular desvio percentual
      const deviationPercent = Math.abs((currentValue - baseline.mean) / baseline.mean) * 100

      if (deviationPercent >= param.warningThreshold) {
        const severity = this.determineSeverity(deviationPercent, param)
        const message = this.generateAnomalyMessage(
          param.name,
          currentValue,
          baseline.mean,
          deviationPercent,
          currentCultivation.name,
          currentPhase
        )

        const dataTimestamp = (latestData as any).timestamp || latestData.date || new Date().toISOString()

        anomalies.push({
          id: `anomaly_${currentCultivation.id}_${param.key}_${Date.now()}`,
          cultivationId: currentCultivation.id,
          cultivationName: currentCultivation.name,
          parameter: param.name,
          currentValue,
          expectedValue: baseline.mean,
          deviationPercent,
          severity,
          message,
          timestamp: dataTimestamp,
          phase: currentPhase,
          strain: currentCultivation.seedStrain,
          actionable: true,
          suggestedAction: this.suggestCorrectiveAction(param.name, currentValue, baseline.mean, currentPhase),
        })
      }
    })

    // Filtrar anomalias já dispensadas e atualizar timestamp de processamento
    const filteredAnomalies = this.filterDismissedAnomalies(anomalies)

    // Atualizar último timestamp processado
    if (newData.length > 0) {
      const latestTimestamp = (newData[newData.length - 1] as any).timestamp ||
        newData[newData.length - 1].date ||
        new Date().toISOString()
      AnomalyDismissalService.updateLastProcessedTimestamp(currentCultivation.id, latestTimestamp)
    }

    return filteredAnomalies
  }

  // Detecta anomalias usando padrões gerais quando não há dados específicos
  private detectGeneralAnomalies(
    cultivation: CultivationSummary,
    data: AgronomicDataPoint[]
  ): DetectedAnomaly[] {
    const anomalies: DetectedAnomaly[] = []
    const latestData = data[data.length - 1]
    const currentPhase = this.determinePhase(cultivation)

    if (!latestData) return anomalies

    // Parâmetros específicos por fase
    const phaseParameters = this.getPhaseParameters(currentPhase)

    phaseParameters.forEach(param => {
      const currentValue = latestData[param.key] as number
      if (isNaN(currentValue)) return

      // Usar valores ideais da fase como referência
      const expectedValue = (param.minValue + param.maxValue) / 2
      const deviationPercent = Math.abs((currentValue - expectedValue) / expectedValue) * 100

      if (deviationPercent >= param.warningThreshold) {
        const severity = this.determineSeverity(deviationPercent, param)
        const message = this.generateAnomalyMessage(
          param.name,
          currentValue,
          expectedValue,
          deviationPercent,
          cultivation.name,
          currentPhase
        )

        const dataTimestamp = (latestData as any).timestamp || latestData.date || new Date().toISOString()

        anomalies.push({
          id: `anomaly_${cultivation.id}_${param.key}_${Date.now()}`,
          cultivationId: cultivation.id,
          cultivationName: cultivation.name,
          parameter: param.name,
          currentValue,
          expectedValue,
          deviationPercent,
          severity,
          message,
          timestamp: dataTimestamp,
          phase: currentPhase,
          strain: cultivation.seedStrain,
          actionable: true,
          suggestedAction: this.suggestCorrectiveAction(param.name, currentValue, expectedValue, currentPhase),
        })
      }
    })

    // Atualizar último timestamp processado
    if (data.length > 0) {
      const latestTimestamp = (latestData as any).timestamp || latestData.date || new Date().toISOString()
      AnomalyDismissalService.updateLastProcessedTimestamp(cultivation.id, latestTimestamp)
    }

    return anomalies
  }

  // Retorna parâmetros específicos por fase
  private getPhaseParameters(phase: string): MonitoringParameter[] {
    const baseParameters = [...MONITORING_PARAMETERS]

    if (phase === "vegetative") {
      return baseParameters.map(param => {
        if (param.name === "Umidade") {
          return { ...param, minValue: 60, maxValue: 70 }
        }
        if (param.name === "Condutividade Elétrica (EC)") {
          return { ...param, minValue: 1.0, maxValue: 1.6 }
        }
        return param
      })
    } else if (phase === "flowering") {
      return baseParameters.map(param => {
        if (param.name === "Umidade") {
          return { ...param, minValue: 40, maxValue: 50 }
        }
        if (param.name === "Condutividade Elétrica (EC)") {
          return { ...param, minValue: 1.6, maxValue: 2.2 } // Novo range para floração
        }
        return param
      })
    }

    return baseParameters
  }

  // Determina a severidade da anomalia
  private determineSeverity(deviationPercent: number, param: MonitoringParameter): "low" | "medium" | "high" | "critical" {
    if (deviationPercent >= param.criticalThreshold) return "critical"
    if (deviationPercent >= param.warningThreshold) return "medium"
    return "low"
  }

  // Gera mensagem de anomalia personalizada
  private generateAnomalyMessage(
    parameter: string,
    currentValue: number,
    expectedValue: number,
    deviationPercent: number,
    cultivationName: string,
    phase: string
  ): string {
    const direction = currentValue > expectedValue ? "acima" : "abaixo"
    const phaseText = phase === "vegetative" ? "vegetativo" :
      phase === "flowering" ? "floração" :
        phase === "curing" ? "cura" : "geral"

    return `Atenção: seu ${parameter} está ${deviationPercent.toFixed(1)}% ${direction} do ideal para esta fase (${phaseText}), comparado a seus ciclos de sucesso.`
  }

  // Sugere ação corretiva
  private suggestCorrectiveAction(
    parameter: string,
    currentValue: number,
    expectedValue: number,
    phase: string
  ): string {
    const direction = currentValue > expectedValue ? "diminuir" : "aumentar"
    const phaseText = phase === "vegetative" ? "vegetativo" :
      phase === "flowering" ? "floração" : "geral"

    switch (parameter) {
      case "pH":
        return direction === "diminuir"
          ? "Adicione pH down para reduzir o pH para 5.8-6.2"
          : "Adicione pH up para aumentar o pH para 5.8-6.2"

      case "Condutividade Elétrica (EC)":
        if (phase === "vegetative") {
          return direction === "diminuir"
            ? "Reduza nutrientes para EC 1.0-1.6 mS/cm (fase vegetativa)"
            : "Aumente nutrientes para EC 1.0-1.6 mS/cm (fase vegetativa)"
        } else {
          return direction === "diminuir"
            ? "Reduza nutrientes para EC 1.6-2.2 mS/cm (fase floração)"
            : "Aumente nutrientes para EC 1.6-2.2 mS/cm (fase floração)"
        }

      case "Temperatura":
        if (currentValue > 31) {
          return "URGENTE: Temperatura acima de 31°C diminui potência do THC. Aumente ventilação imediatamente"
        } else if (currentValue < 15.5) {
          return "URGENTE: Temperatura abaixo de 15.5°C diminui potência do THC. Aumente aquecimento"
        } else {
          return direction === "diminuir"
            ? "Ajuste para temperatura ideal 24-30°C"
            : "Ajuste para temperatura ideal 24-30°C"
        }

      case "Umidade":
        if (phase === "flowering" && currentValue > 70) {
          return "CRÍTICO: Umidade acima de 70% na floração pode causar mofo. Reduza para 40-50% imediatamente"
        } else if (phase === "vegetative") {
          return direction === "diminuir"
            ? "Ajuste umidade para 60-70% (fase vegetativa)"
            : "Ajuste umidade para 60-70% (fase vegetativa)"
        } else {
          return direction === "diminuir"
            ? "Ajuste umidade para 40-50% (fase floração)"
            : "Ajuste umidade para 40-50% (fase floração)"
        }

      default:
        return `Ajuste o ${parameter} para valores ideais da fase ${phaseText}`
    }
  }

  // Obtém padrões aprendidos
  getPatterns(): CultivationPattern[] {
    return Array.from(this.patterns.values())
  }

  // Filtra anomalias já dispensadas
  private filterDismissedAnomalies(anomalies: DetectedAnomaly[]): DetectedAnomaly[] {
    return anomalies.filter(anomaly => {
      const isDismissed = AnomalyDismissalService.isDismissed(anomaly)
      if (isDismissed) {
        console.log(`🚫 Anomalia filtrada (já dispensada): ${anomaly.parameter} - ${anomaly.cultivationName}`)
      }
      return !isDismissed
    })
  }

  // Verifica se há dados suficientes para análise
  hasEnoughData(cultivation: CultivationSummary): boolean {
    const phase = this.determinePhase(cultivation)
    const patternKey = `${cultivation.seedStrain}_${phase}`
    const pattern = this.patterns.get(patternKey)

    return pattern ? pattern.sampleSize >= 5 : false
  }

  // Limpar dismissals antigos automaticamente
  cleanupDismissals(): void {
    AnomalyDismissalService.cleanOldDismissals()
  }

  // Obter estatísticas de dismissals
  getDismissalStats() {
    return AnomalyDismissalService.getDismissalStats()
  }
} 