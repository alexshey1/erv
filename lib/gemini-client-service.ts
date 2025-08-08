// Serviço cliente para integração com Gemini via API routes do Next.js

export interface CultivationAnalysisRequest {
  sensorData: Array<{
    sensorType: string
    value: number
    unit: string
    timestamp: string
  }>
  cultivationInfo: {
    strain: string
    phase: string
    daysSinceStart: number
    numPlants: number
  }
  userQuery?: string
  includeRecommendations?: boolean
  includePredictions?: boolean
}

export interface CultivationAnalysisResponse {
  analysis: string
  recommendations: string[]
  anomalies: Array<{
    parameter: string
    severity: 'low' | 'medium' | 'high' | 'critical'
    description: string
    recommendation: string
  }>
  timestamp: string
}

export class GeminiClientService {
  private baseUrl: string

  constructor() {
    this.baseUrl = '/api/ai/gemini'
  }

  async analyzeCultivationData(request: CultivationAnalysisRequest): Promise<CultivationAnalysisResponse> {
    try {
      console.log('🤖 Iniciando análise com Gemini via API route...')
      
      const response = await fetch(`${this.baseUrl}/cultivation-analysis`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(request)
      })

      if (!response.ok) {
        let errorData: any = {};
        try {
          errorData = await response.json();
        } catch (e) {
          errorData = { error: `Erro na API: ${response.status}` };
        }
        console.error('❌ Erro na API route:', errorData);
        if (response.status === 503 || errorData?.error?.status === 'UNAVAILABLE') {
          throw new Error('O serviço de IA está temporariamente indisponível (modelo sobrecarregado). Por favor, tente novamente em alguns minutos.');
        }
        throw new Error(errorData.error || `Erro na API: ${response.status}`);
      }

      const data = await response.json()
      console.log('✅ Análise recebida com sucesso')
      
      return data
    } catch (error) {
      console.error('❌ Erro na análise Gemini (client):', error)
      
      return {
        analysis: `Erro na análise dos dados: ${error instanceof Error ? error.message : 'Erro desconhecido'}`,
        recommendations: [
          error instanceof Error && error.message.includes('temporariamente indisponível')
            ? 'O serviço de IA está sobrecarregado. Por favor, tente novamente em alguns minutos.'
            : 'Verifique a conexão com a internet',
          'Tente novamente mais tarde'
        ],
        anomalies: [],
        timestamp: new Date().toISOString()
      }
    }
  }

  async generateRecommendations(
    sensorData: Array<{sensorType: string, value: number, unit: string}>,
    cultivationInfo: {strain: string, phase: string, daysSinceStart: number}
  ): Promise<string[]> {
    try {
      console.log('💡 Gerando recomendações via API route...')
      
      const response = await fetch(`${this.baseUrl}/recommendations`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ sensorData, cultivationInfo })
      })

      if (!response.ok) {
        throw new Error(`Erro na API: ${response.status}`)
      }

      const data = await response.json()
      return data.recommendations || []
      
    } catch (error) {
      console.error('❌ Erro ao gerar recomendações (client):', error)
      return ["Verifique os dados dos sensores para gerar recomendações"]
    }
  }

  async analyzePlantHealth(
    imageData: string, 
    sensorData: Array<{sensorType: string, value: number, unit: string}>,
    cultivationPhase: string
  ): Promise<CultivationAnalysisResponse> {
    try {
      console.log('🌿 Analisando saúde da planta via API route...')
      
      const response = await fetch(`${this.baseUrl}/vision`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ imageData, sensorData, cultivationPhase })
      })

      if (!response.ok) {
        throw new Error(`Erro na API: ${response.status}`)
      }

      const data = await response.json()
      return data
      
    } catch (error) {
      console.error('❌ Erro na análise visual (client):', error)
      return {
        analysis: "Erro na análise visual da planta",
        recommendations: ["Verifique a qualidade da imagem"],
        anomalies: [],
        timestamp: new Date().toISOString()
      }
    }
  }
}