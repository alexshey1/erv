"use client"

import { useState, useEffect, useCallback } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Progress } from "@/components/ui/progress"
import { 
  Brain, 
  AlertTriangle, 
  TrendingUp, 
  CheckCircle,
  Lightbulb,
  BarChart3,
  Zap,
  Clock,
  Target,
  Thermometer,
  Droplets,
  Gauge,
  Leaf
} from "lucide-react"
import { GeminiService } from "@/lib/gemini-service"
import { toast } from "sonner"

interface CultivationData {
  id: string
  name: string
  strain: string
  phase: string
  daysSinceStart: number
  numPlants: number
  status: "active" | "completed" | "planned"
  sensorData: Array<{
    sensorType: string
    value: number
    unit: string
    timestamp: string
  }>
}

interface IntelligentAnalysis {
  analysis: string
  recommendations: string[]
  predictions: {
    yield: number
    confidence: number
    factors: string[]
  }
  anomalies: Array<{
    parameter: string
    severity: 'low' | 'medium' | 'high' | 'critical'
    description: string
    recommendation: string
  }>
  timestamp: string
}

interface DashboardMetrics {
  totalCultivations: number
  activeCultivations: number
  averageYield: number
  successRate: number
  anomaliesDetected: number
  aiRecommendations: number
}

export function IntelligentDashboard() {
  const [geminiService, setGeminiService] = useState<GeminiService | null>(null)
  const [cultivations, setCultivations] = useState<CultivationData[]>([])
  const [currentAnalysis, setCurrentAnalysis] = useState<Array<{ cultivation: CultivationData, analysis: IntelligentAnalysis }> | null>(null)
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [lastAnalysisTime, setLastAnalysisTime] = useState<number>(0)
  const [analysisTimeout, setAnalysisTimeout] = useState<NodeJS.Timeout | null>(null)
  const [metrics, setMetrics] = useState<DashboardMetrics>({
    totalCultivations: 0,
    activeCultivations: 0,
    averageYield: 0,
    successRate: 0,
    anomaliesDetected: 0,
    aiRecommendations: 0
  })

  // Inicializar serviço Gemini
  useEffect(() => {
    const apiKey = process.env.NEXT_PUBLIC_CHAVE_API_GEMINI
    if (!apiKey) {
      console.error('❌ Chave da API Gemini não configurada')
      return
    }
    const service = new GeminiService(apiKey)
    setGeminiService(service)
  }, [])

  // Carregar dados de cultivos
  useEffect(() => {
    const mockCultivations: CultivationData[] = [
      {
        id: "cultivation-1",
        name: "OG Kush - Floração",
        strain: "OG Kush",
        phase: "flowering",
        daysSinceStart: 45,
        numPlants: 6,
        status: "active",
        sensorData: [
          { sensorType: "ph", value: 6.2, unit: "", timestamp: "2024-01-15T10:00:00Z" },
          { sensorType: "temperature", value: 24.5, unit: "°C", timestamp: "2024-01-15T10:00:00Z" },
          { sensorType: "humidity", value: 65, unit: "%", timestamp: "2024-01-15T10:00:00Z" },
          { sensorType: "ec", value: 1.3, unit: "mS/cm", timestamp: "2024-01-15T10:00:00Z" }
        ]
      },
      {
        id: "cultivation-2",
        name: "Amnesia Haze - Vegetativo",
        strain: "Amnesia Haze",
        phase: "vegetative",
        daysSinceStart: 25,
        numPlants: 8,
        status: "active",
        sensorData: [
          { sensorType: "ph", value: 6.0, unit: "", timestamp: "2024-01-15T10:00:00Z" },
          { sensorType: "temperature", value: 26.2, unit: "°C", timestamp: "2024-01-15T10:00:00Z" },
          { sensorType: "humidity", value: 70, unit: "%", timestamp: "2024-01-15T10:00:00Z" },
          { sensorType: "ec", value: 1.1, unit: "mS/cm", timestamp: "2024-01-15T10:00:00Z" }
        ]
      },
      {
        id: "cultivation-3",
        name: "Gorilla Glue - Floração",
        strain: "Gorilla Glue",
        phase: "flowering",
        daysSinceStart: 35,
        numPlants: 4,
        status: "active",
        sensorData: [
          { sensorType: "ph", value: 6.5, unit: "", timestamp: "2024-01-15T10:00:00Z" },
          { sensorType: "temperature", value: 25.8, unit: "°C", timestamp: "2024-01-15T10:00:00Z" },
          { sensorType: "humidity", value: 58, unit: "%", timestamp: "2024-01-15T10:00:00Z" },
          { sensorType: "ec", value: 1.4, unit: "mS/cm", timestamp: "2024-01-15T10:00:00Z" }
        ]
      }
    ]
    
    setCultivations(mockCultivations)
    
    // Calcular métricas
    const activeCultivations = mockCultivations.filter(c => c.status === "active")
    setMetrics({
      totalCultivations: mockCultivations.length,
      activeCultivations: activeCultivations.length,
      averageYield: 480, // Simulado
      successRate: 85, // Simulado
      anomaliesDetected: 2, // Simulado
      aiRecommendations: 12 // Simulado
    })
  }, [])

  // Cleanup timeout ao desmontar
  useEffect(() => {
    return () => {
      if (analysisTimeout) {
        clearTimeout(analysisTimeout)
      }
    }
  }, [analysisTimeout])

  const runIntelligentAnalysis = useCallback(async () => {
    // Proteção contra múltiplas chamadas simultâneas
    if (isAnalyzing) {
      toast.info("Análise já em andamento. Aguarde a conclusão.")
      return
    }

    // Debounce: evitar chamadas muito frequentes (mínimo 5 segundos entre análises)
    const now = Date.now()
    const timeSinceLastAnalysis = now - lastAnalysisTime
    const minInterval = 5000 // 5 segundos

    if (timeSinceLastAnalysis < minInterval) {
      const remainingTime = Math.ceil((minInterval - timeSinceLastAnalysis) / 1000)
      toast.info(`Aguarde ${remainingTime} segundo(s) antes de executar nova análise.`)
      return
    }

    if (!geminiService || cultivations.length === 0) {
      toast.error("Serviço de IA não disponível ou nenhum cultivo encontrado")
      return
    }

    setIsAnalyzing(true)
    setLastAnalysisTime(now)
    
    try {
      // Analisar todos os cultivos ativos
      const activeCultivations = cultivations.filter(c => c.status === "active")
      
      if (activeCultivations.length === 0) {
        toast.error("Nenhum cultivo ativo encontrado")
        return
      }

      const analyses: { cultivation: CultivationData; analysis: IntelligentAnalysis }[] = []
      
      // Adicionar delay entre análises para evitar rate limiting
      for (let i = 0; i < activeCultivations.length; i++) {
        const cultivation = activeCultivations[i]
        
        // Delay entre análises (exceto a primeira)
        if (i > 0) {
          await new Promise(resolve => setTimeout(resolve, 1000)) // 1 segundo entre análises
        }

        const analysis = await geminiService.analyzeCultivationData({
          sensorData: cultivation.sensorData,
          cultivationInfo: {
            strain: cultivation.strain,
            phase: cultivation.phase,
            daysSinceStart: cultivation.daysSinceStart,
            numPlants: cultivation.numPlants
          },
          userQuery: "Forneça uma análise completa e inteligente do cultivo com foco em otimização",
          includeRecommendations: true,
          includePredictions: true
        })
        
        analyses.push({
          cultivation,
          analysis: {
            ...analysis,
            predictions: (analysis as any).predictions || {
              yield: 0,
              confidence: 0,
              factors: []
            }
          }
        })
      }
      
      // Converter análises para o formato esperado
      const convertedAnalyses = analyses.map(({ cultivation, analysis }) => ({
        cultivation,
        analysis: {
          ...analysis,
          predictions: (analysis as any).predictions || {
            yield: 0,
            confidence: 0,
            factors: []
          }
        }
      }))
      
      setCurrentAnalysis(convertedAnalyses)
      toast.success("Análise inteligente concluída!")
      
    } catch (error) {
      console.error("Erro na análise inteligente:", error)
      toast.error("Erro ao executar análise inteligente")
    } finally {
      setIsAnalyzing(false)
    }
  }, [isAnalyzing, lastAnalysisTime, geminiService, cultivations])

  const getParameterIcon = (parameter: string) => {
    const icons: Record<string, any> = {
      "ph": Gauge,
      "temperature": Thermometer,
      "humidity": Droplets,
      "ec": Leaf
    }
    return icons[parameter] || Target
  }

  const getSeverityColor = (severity: string) => {
    const colors: Record<string, string> = {
      "low": "text-blue-600",
      "medium": "text-yellow-600",
      "high": "text-orange-600",
      "critical": "text-red-600"
    }
    return colors[severity] || "text-gray-600"
  }

  // Calcular tempo restante para próxima análise
  const getTimeUntilNextAnalysis = () => {
    const now = Date.now()
    const timeSinceLastAnalysis = now - lastAnalysisTime
    const minInterval = 5000
    const remainingTime = Math.max(0, minInterval - timeSinceLastAnalysis)
    return Math.ceil(remainingTime / 1000)
  }

  const timeUntilNextAnalysis = getTimeUntilNextAnalysis()
  const canAnalyze = !isAnalyzing && timeUntilNextAnalysis === 0

  return (
    <div className="w-full px-4 sm:px-6 lg:px-8 pt-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Dashboard Inteligente</h1>
        <p className="text-gray-600 mt-2">Análise avançada com Google Gemini AI</p>
      </div>

      {/* Métricas Principais */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-6">
        <Card className="border-l-4 border-blue-500">
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5 text-blue-600" />
              <div>
                <p className="text-sm text-muted-foreground">Total Cultivos</p>
                <p className="text-2xl font-bold text-blue-600">{metrics.totalCultivations}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-green-500">
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-green-600" />
              <div>
                <p className="text-sm text-muted-foreground">Ativos</p>
                <p className="text-2xl font-bold text-green-600">{metrics.activeCultivations}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-purple-500">
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Target className="h-5 w-5 text-purple-600" />
              <div>
                <p className="text-sm text-muted-foreground">Rendimento Médio</p>
                <p className="text-2xl font-bold text-purple-600">{metrics.averageYield}g</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-yellow-500">
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-yellow-600" />
              <div>
                <p className="text-sm text-muted-foreground">Taxa de Sucesso</p>
                <p className="text-2xl font-bold text-yellow-600">{metrics.successRate}%</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-red-500">
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-red-600" />
              <div>
                <p className="text-sm text-muted-foreground">Alertas Inteligentes</p>
                <p className="text-2xl font-bold text-red-600">{metrics.anomaliesDetected}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-orange-500">
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Brain className="h-5 w-5 text-orange-600" />
              <div>
                <p className="text-sm text-muted-foreground">Recomendações IA</p>
                <p className="text-2xl font-bold text-orange-600">{metrics.aiRecommendations}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Análise Inteligente */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Brain className="h-5 w-5" />
                Análise Inteligente - Google Gemini
                <Badge variant="outline" className="ml-2">
                  IA Avançada
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between mb-4">
                <div>
                  <p className="text-sm text-muted-foreground">
                    Execute análise completa dos cultivos usando IA avançada
                  </p>
                  {currentAnalysis && (
                    <p className="text-xs text-muted-foreground mt-1">
                      Última análise: {new Date(currentAnalysis[0]?.analysis.timestamp).toLocaleTimeString()}
                    </p>
                  )}
                  {!canAnalyze && timeUntilNextAnalysis > 0 && (
                    <p className="text-xs text-orange-600 mt-1">
                      Próxima análise disponível em {timeUntilNextAnalysis} segundo(s)
                    </p>
                  )}
                </div>
                <Button 
                  onClick={runIntelligentAnalysis} 
                  disabled={!canAnalyze || !geminiService}
                  className="flex items-center gap-2"
                >
                  {isAnalyzing ? (
                    <>
                      <Clock className="h-4 w-4 animate-spin" />
                      Analisando...
                    </>
                  ) : !canAnalyze ? (
                    <>
                      <Clock className="h-4 w-4" />
                      Aguarde {timeUntilNextAnalysis}s
                    </>
                  ) : (
                    <>
                      <Zap className="h-4 w-4" />
                      Executar Análise
                    </>
                  )}
                </Button>
              </div>

              {currentAnalysis && currentAnalysis.length > 0 && (
                <div className="space-y-10">
                  {currentAnalysis.map(({ cultivation, analysis }, idx) => (
                    <Card key={cultivation.id}>
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <Brain className="h-5 w-5" />
                          Análise Inteligente - {cultivation.name} ({cultivation.phase})
                          <Badge variant="outline" className="ml-2">IA Avançada</Badge>
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        {/* Análise Geral */}
                        {analysis.analysis && (
                          <div>
                            <h4 className="font-medium mb-2 flex items-center gap-2">
                              <Target className="h-4 w-4" />
                              Análise Geral
                            </h4>
                            <p className="text-sm text-muted-foreground bg-muted p-3 rounded-lg">
                              {analysis.analysis}
                            </p>
                          </div>
                        )}
                        {/* Alertas Inteligentes */}
                        {analysis.anomalies && analysis.anomalies.length > 0 && (
                          <div>
                            <h4 className="font-medium mb-2 flex items-center gap-2">
                              <AlertTriangle className="h-4 w-4 text-orange-500" />
                              Desvios Detectados
                            </h4>
                            {analysis.anomalies.map((anomaly, index) => {
                              const Icon = getParameterIcon(anomaly.parameter)
                              return (
                                <Alert key={index} className="border-l-4 border-orange-200">
                                  <AlertDescription>
                                    <div className="flex items-center justify-between">
                                      <div className="flex items-center gap-2">
                                        <Icon className="h-4 w-4" />
                                        <span className="font-medium">{anomaly.parameter}</span>
                                      </div>
                                      <Badge variant={anomaly.severity === "critical" ? "destructive" : "secondary"}>
                                        {anomaly.severity}
                                      </Badge>
                                    </div>
                                    <p className="text-sm text-muted-foreground mt-1">
                                      {anomaly.description}
                                    </p>
                                    <p className="text-sm mt-1">{anomaly.recommendation}</p>
                                  </AlertDescription>
                                </Alert>
                              )
                            })}
                          </div>
                        )}
                        {/* Recomendações */}
                        {analysis.recommendations && analysis.recommendations.length > 0 && (
                          <div>
                            <h4 className="font-medium mb-2 flex items-center gap-2">
                              <Lightbulb className="h-4 w-4 text-yellow-500" />
                              Recomendações IA
                            </h4>
                            <div className="space-y-2">
                              {analysis.recommendations.map((recommendation, index) => (
                                <div key={index} className="flex items-start gap-2 p-3 bg-muted rounded-lg">
                                  <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                                  <p className="text-sm">{recommendation}</p>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                        {/* Previsões */}
                        {analysis.predictions && (
                          <div>
                            <h4 className="font-medium mb-2 flex items-center gap-2">
                              <TrendingUp className="h-4 w-4 text-blue-500" />
                              Previsões Inteligentes
                            </h4>
                            <div className="grid grid-cols-2 gap-4">
                              <div className="p-3 bg-muted rounded-lg">
                                <p className="text-sm font-medium">Rendimento Previsto</p>
                                <p className="text-lg font-bold">{analysis.predictions.yield}g</p>
                              </div>
                              <div className="p-3 bg-muted rounded-lg">
                                <p className="text-sm font-medium">Confiança da IA</p>
                                <p className="text-lg font-bold">{(analysis.predictions.confidence * 100).toFixed(1)}%</p>
                              </div>
                            </div>
                            {analysis.predictions.factors && analysis.predictions.factors.length > 0 && (
                              <div className="mt-2">
                                <p className="text-sm font-medium mb-1">Fatores que afetam o rendimento:</p>
                                <ul className="text-sm text-muted-foreground space-y-1">
                                  {analysis.predictions.factors.map((factor, index) => (
                                    <li key={index} className="flex items-center gap-2">
                                      <Target className="h-3 w-3" />
                                      {factor}
                                    </li>
                                  ))}
                                </ul>
                              </div>
                            )}
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        <div>
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Brain className="h-5 w-5" />
                Status da IA
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-green-500" />
                <span className="text-sm">Gemini AI Ativo</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-green-500" />
                <span className="text-sm">Análise em Tempo Real</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-green-500" />
                <span className="text-sm">Detecção de Desvios</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-green-500" />
                <span className="text-sm">Recomendações Personalizadas</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-green-500" />
                <span className="text-sm">Previsões Inteligentes</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-green-500" />
                <span className="text-sm">Otimização Contínua</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-green-500" />
                <span className="text-sm">Debounce Protegido</span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Informações sobre o Sistema */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Lightbulb className="h-5 w-5" />
              Como Funciona
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="space-y-2">
              <h4 className="font-semibold text-sm">1. Análise Inteligente</h4>
              <p className="text-sm text-muted-foreground">
                O Google Gemini AI analisa dados dos sensores em tempo real para identificar 
                padrões e detectar desvios.
              </p>
            </div>
            
            <div className="space-y-2">
              <h4 className="font-semibold text-sm">2. Otimização Avançada</h4>
              <p className="text-sm text-muted-foreground">
                O sistema compara parâmetros atuais com padrões ideais para cada strain 
                e fase do cultivo.
              </p>
            </div>
            
            <div className="space-y-2">
              <h4 className="font-semibold text-sm">3. Recomendações IA</h4>
              <p className="text-sm text-muted-foreground">
                Quando detecta desvios, a IA gera recomendações específicas e 
                acionáveis para otimizar o cultivo.
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Zap className="h-5 w-5" />
              Benefícios
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="space-y-2">
              <h4 className="font-semibold text-sm">Prevenção Proativa</h4>
              <p className="text-sm text-muted-foreground">
                Detecta problemas antes que afetem significativamente o rendimento.
              </p>
            </div>
            
            <div className="space-y-2">
              <h4 className="font-semibold text-sm">Otimização Contínua</h4>
              <p className="text-sm text-muted-foreground">
                Recomendações personalizadas para maximizar a qualidade e quantidade.
              </p>
            </div>
            
            <div className="space-y-2">
              <h4 className="font-semibold text-sm">Aprendizado Inteligente</h4>
              <p className="text-sm text-muted-foreground">
                O sistema aprende com cada cultivo para melhorar as previsões futuras.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}