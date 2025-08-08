// Estrutura para dados reais de cultivo
export interface RealTimeSensorData {
  id: string
  cultivationId: string
  timestamp: string
  sensorType: "ph" | "ec" | "temperature" | "humidity" | "light" | "co2" | "nutrients"
  value: number
  unit: string
  location?: string // Posição do sensor no grow
  accuracy?: number // Precisão da medição
  batteryLevel?: number // Para sensores sem fio
}

export interface CultivationEnvironment {
  cultivationId: string
  timestamp: string
  temperature_c: number
  humidity_percent: number
  co2_ppm?: number
  light_intensity_lux?: number
  air_flow_cfm?: number
  vpd?: number // Vapor Pressure Deficit
}

export interface PlantHealthData {
  cultivationId: string
  timestamp: string
  plantId?: string
  leaf_temperature_c?: number
  stem_diameter_mm?: number
  leaf_area_cm2?: number
  chlorophyll_index?: number
  stress_level?: "low" | "medium" | "high"
  visual_issues?: string[]
}

// Interface para APIs de IA
export interface AIAnalysisRequest {
  cultivationId: string
  timeRange: {
    start: string
    end: string
  }
  dataTypes: ("environmental" | "plant_health" | "nutrients" | "yield_prediction")[]
  includeHistorical?: boolean
  includeRecommendations?: boolean
}

export interface AIAnalysisResponse {
  analysisId: string
  timestamp: string
  insights: AIInsight[]
  predictions: AIPrediction[]
  recommendations: AIRecommendation[]
  confidence: number
  modelVersion: string
}

export interface AIInsight {
  type: "anomaly" | "trend" | "correlation" | "optimization"
  parameter: string
  description: string
  severity: "low" | "medium" | "high" | "critical"
  confidence: number
  supportingData: {
    currentValue: number
    expectedValue: number
    historicalTrend: number[]
  }
}

export interface AIPrediction {
  type: "yield" | "harvest_date" | "problem_occurrence" | "optimal_conditions"
  parameter: string
  predictedValue: number
  confidence: number
  timeframe: string
  factors: string[]
}

export interface AIRecommendation {
  type: "immediate_action" | "adjustment" | "preventive" | "optimization"
  priority: "low" | "medium" | "high" | "critical"
  action: string
  expectedImpact: string
  implementationTime: string
  cost?: number
}

// Serviço para gerenciar dados em tempo real
export class RealTimeDataService {
  private sensorData: RealTimeSensorData[] = []
  private environmentData: CultivationEnvironment[] = []
  private plantHealthData: PlantHealthData[] = []

  // Adicionar dados de sensor
  addSensorData(data: RealTimeSensorData) {
    this.sensorData.push(data)
    this.processNewData(data)
  }

  // Adicionar dados ambientais
  addEnvironmentData(data: CultivationEnvironment) {
    this.environmentData.push(data)
    this.processNewData(data)
  }

  // Adicionar dados de saúde da planta
  addPlantHealthData(data: PlantHealthData) {
    this.plantHealthData.push(data)
    this.processNewData(data)
  }

  // Processar novos dados
  private processNewData(data: RealTimeSensorData | CultivationEnvironment | PlantHealthData) {
    // Verificar anomalias imediatas
    this.checkImmediateAnomalies(data)
    
    // Atualizar análises em tempo real
    this.updateRealTimeAnalysis(data)
    
    // Enviar para API de IA se necessário
    this.sendToAIAnalysis(data)
  }

  // Verificar anomalias críticas imediatas
  private checkImmediateAnomalies(data: any) {
    const criticalThresholds = {
      ph: { min: 5.0, max: 7.0 },
      temperature_c: { min: 15, max: 35 },
      humidity_percent: { min: 30, max: 80 },
      ec: { min: 0.5, max: 3.0 }
    }

    // Implementar lógica de detecção imediata
  }

  // Atualizar análises em tempo real
  private updateRealTimeAnalysis(data: any) {
    // Implementar análise local
  }

  // Enviar para API de IA
  private async sendToAIAnalysis(data: any) {
    // Implementar integração com API de IA
  }

  // Obter dados para análise
  getDataForAnalysis(cultivationId: string, timeRange: { start: string, end: string }) {
    return {
      sensorData: this.sensorData.filter(d => 
        d.cultivationId === cultivationId && 
        d.timestamp >= timeRange.start && 
        d.timestamp <= timeRange.end
      ),
      environmentData: this.environmentData.filter(d => 
        d.cultivationId === cultivationId && 
        d.timestamp >= timeRange.start && 
        d.timestamp <= timeRange.end
      ),
      plantHealthData: this.plantHealthData.filter(d => 
        d.cultivationId === cultivationId && 
        d.timestamp >= timeRange.start && 
        d.timestamp <= timeRange.end
      )
    }
  }
}

// Serviço para integração com APIs de IA
export class AIAnalysisService {
  private apiKey: string
  public baseUrl: string

  constructor(apiKey: string, baseUrl: string) {
    this.apiKey = apiKey
    this.baseUrl = baseUrl
  }

  // Enviar dados para análise de IA
  async analyzeCultivationData(request: AIAnalysisRequest): Promise<AIAnalysisResponse> {
    try {
      const response = await fetch(`${this.baseUrl}/analyze`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.apiKey}`
        },
        body: JSON.stringify(request)
      })

      if (!response.ok) {
        throw new Error(`API Error: ${response.status}`)
      }

      return await response.json()
    } catch (error) {
      console.error('Erro na análise de IA:', error)
      throw error
    }
  }

  // Obter recomendações específicas
  async getRecommendations(cultivationId: string, currentData: any): Promise<AIRecommendation[]> {
    const request: AIAnalysisRequest = {
      cultivationId,
      timeRange: {
        start: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(), // Últimos 7 dias
        end: new Date().toISOString()
      },
      dataTypes: ["environmental", "plant_health", "nutrients"],
      includeRecommendations: true
    }

    const analysis = await this.analyzeCultivationData(request)
    return analysis.recommendations
  }

  // Predizer rendimento
  async predictYield(cultivationId: string): Promise<AIPrediction[]> {
    const request: AIAnalysisRequest = {
      cultivationId,
      timeRange: {
        start: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(), // Últimos 30 dias
        end: new Date().toISOString()
      },
      dataTypes: ["yield_prediction"],
      includeHistorical: true
    }

    const analysis = await this.analyzeCultivationData(request)
    return analysis.predictions
  }
} 