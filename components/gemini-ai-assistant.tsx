"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Textarea } from "@/components/ui/textarea"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { 
  Brain, 
  Zap, 
  Camera,
  MessageSquare,
  Lightbulb,
  TrendingUp,
  AlertTriangle,
  CheckCircle,
  Clock,
  Target,
  BarChart3,
  Upload
} from "lucide-react"
import { toast } from "sonner"

interface GeminiAIAssistantProps {
  cultivationId: string
  cultivationName: string
  currentSensorData?: Array<{
    sensorType: string
    value: number
    unit: string
    timestamp: string
  }>
}

interface AnalysisResult {
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

export function GeminiAIAssistant({ 
  cultivationId, 
  cultivationName, 
  currentSensorData = [] 
}: GeminiAIAssistantProps) {
  const [selectedAnalysisType, setSelectedAnalysisType] = useState<"data" | "vision" | "recommendations">("data")
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null)
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [userQuery, setUserQuery] = useState("")
  const [cultivationInfo, setCultivationInfo] = useState({
    strain: "OG Kush",
    phase: "flowering",
    daysSinceStart: 45,
    numPlants: 6
  })
  const [uploadedImage, setUploadedImage] = useState<string>("")
  const [imageFile, setImageFile] = useState<File | null>(null)

  const handleDataAnalysis = async () => {
    if (currentSensorData.length === 0) {
      toast.error("Nenhum dado de sensor disponível para análise")
      return
    }

    setIsAnalyzing(true)
    
    try {
      const response = await fetch('/api/ai/gemini/analyze', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          sensorData: currentSensorData,
          cultivationInfo,
          userQuery: userQuery || undefined,
          includeRecommendations: true,
          includePredictions: true
        })
      })

      if (!response.ok) {
        throw new Error(`Erro na API: ${response.status}`)
      }

      const result = await response.json()
      
      if (result.success) {
        setAnalysisResult(result.data)
        toast.success("Análise concluída com sucesso!")
      } else {
        throw new Error(result.error || "Erro na análise")
      }
    } catch (error) {
      console.error("Erro na análise:", error)
      toast.error("Erro ao executar análise. Tente novamente.")
    } finally {
      setIsAnalyzing(false)
    }
  }

  const handleVisionAnalysis = async () => {
    if (!uploadedImage) {
      toast.error("Por favor, faça upload de uma imagem")
      return
    }

    setIsAnalyzing(true)
    
    try {
      const response = await fetch('/api/ai/gemini/vision', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          imageData: uploadedImage,
          sensorData: currentSensorData,
          cultivationPhase: cultivationInfo.phase
        })
      })

      if (!response.ok) {
        throw new Error(`Erro na API: ${response.status}`)
      }

      const result = await response.json()
      
      if (result.success) {
        setAnalysisResult(result.data)
        toast.success("Análise visual concluída!")
      } else {
        throw new Error(result.error || "Erro na análise visual")
      }
    } catch (error) {
      console.error("Erro na análise visual:", error)
      toast.error("Erro ao executar análise visual. Tente novamente.")
    } finally {
      setIsAnalyzing(false)
    }
  }

  const handleRecommendations = async () => {
    if (currentSensorData.length === 0) {
      toast.error("Nenhum dado de sensor disponível")
      return
    }

    setIsAnalyzing(true)
    
    try {
      const response = await fetch('/api/ai/gemini/recommendations', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          sensorData: currentSensorData,
          cultivationInfo: {
            strain: cultivationInfo.strain,
            phase: cultivationInfo.phase,
            daysSinceStart: cultivationInfo.daysSinceStart
          },
          includeOptimization: true,
          includeTroubleshooting: true
        })
      })

      if (!response.ok) {
        throw new Error(`Erro na API: ${response.status}`)
      }

      const result = await response.json()
      
      if (result.success) {
        setAnalysisResult({
          analysis: "Recomendações geradas com sucesso",
          recommendations: result.data.recommendations,
          predictions: {
            yield: 0,
            confidence: 0,
            factors: []
          },
          anomalies: [],
          timestamp: result.data.timestamp
        })
        toast.success("Recomendações geradas!")
      } else {
        throw new Error(result.error || "Erro ao gerar recomendações")
      }
    } catch (error) {
      console.error("Erro ao gerar recomendações:", error)
      toast.error("Erro ao gerar recomendações. Tente novamente.")
    } finally {
      setIsAnalyzing(false)
    }
  }

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    if (file.size > 5 * 1024 * 1024) { // 5MB limit
      toast.error("Imagem muito grande. Máximo 5MB.")
      return
    }

    setImageFile(file)
    
    const reader = new FileReader()
    reader.onload = (e) => {
      const result = e.target?.result as string
      // Remover prefixo data:image/...;base64,
      const base64 = result.split(',')[1]
      setUploadedImage(base64)
    }
    reader.readAsDataURL(file)
  }

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'destructive'
      case 'high': return 'destructive'
      case 'medium': return 'secondary'
      case 'low': return 'outline'
      default: return 'outline'
    }
  }

  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case 'critical':
      case 'high':
        return <AlertTriangle className="h-4 w-4" />
      case 'medium':
        return <Clock className="h-4 w-4" />
      case 'low':
        return <CheckCircle className="h-4 w-4" />
      default:
        return <Target className="h-4 w-4" />
    }
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Brain className="h-5 w-5" />
            Assistente de IA - Google Gemini
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground mb-4">
            Utilize a inteligência artificial do Google Gemini para analisar seus dados de cultivo e obter insights valiosos.
          </p>

          <Tabs value={selectedAnalysisType} onValueChange={(value) => setSelectedAnalysisType(value as any)}>
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="data">Análise de Dados</TabsTrigger>
              <TabsTrigger value="vision">Análise Visual</TabsTrigger>
              <TabsTrigger value="recommendations">Recomendações</TabsTrigger>
            </TabsList>

            <TabsContent value="data" className="space-y-4">
              <Alert>
                <BarChart3 className="h-4 w-4" />
                <AlertDescription>
                  Analise dados dos sensores e obtenha insights sobre o estado do cultivo.
                </AlertDescription>
              </Alert>

              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="strain">Strain</Label>
                    <Input
                      id="strain"
                      value={cultivationInfo.strain}
                      onChange={(e) => setCultivationInfo(prev => ({ ...prev, strain: e.target.value }))}
                    />
                  </div>
                  <div>
                    <Label htmlFor="phase">Fase</Label>
                    <Select value={cultivationInfo.phase} onValueChange={(value) => setCultivationInfo(prev => ({ ...prev, phase: value }))}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="vegetative">Vegetativo</SelectItem>
                        <SelectItem value="flowering">Floração</SelectItem>
                        <SelectItem value="seedling">Muda</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="days">Dias desde o início</Label>
                    <Input
                      id="days"
                      type="number"
                      value={cultivationInfo.daysSinceStart}
                      onChange={(e) => setCultivationInfo(prev => ({ ...prev, daysSinceStart: parseInt(e.target.value) || 0 }))}
                    />
                  </div>
                  <div>
                    <Label htmlFor="plants">Número de plantas</Label>
                    <Input
                      id="plants"
                      type="number"
                      value={cultivationInfo.numPlants}
                      onChange={(e) => setCultivationInfo(prev => ({ ...prev, numPlants: parseInt(e.target.value) || 0 }))}
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="query">Consulta específica (opcional)</Label>
                  <Textarea
                    id="query"
                    placeholder="Ex: Como posso melhorar o rendimento? Quais problemas vejo nos dados?"
                    value={userQuery}
                    onChange={(e) => setUserQuery(e.target.value)}
                  />
                </div>

                <Button 
                  onClick={handleDataAnalysis} 
                  disabled={isAnalyzing || currentSensorData.length === 0}
                  className="w-full"
                >
                  {isAnalyzing ? (
                    <>
                      <Clock className="h-4 w-4 mr-2 animate-spin" />
                      Analisando...
                    </>
                  ) : (
                    <>
                      <Brain className="h-4 w-4 mr-2" />
                      Analisar Dados
                    </>
                  )}
                </Button>
              </div>
            </TabsContent>

            <TabsContent value="vision" className="space-y-4">
              <Alert>
                <Camera className="h-4 w-4" />
                <AlertDescription>
                  Faça upload de uma imagem da planta para análise visual combinada com dados dos sensores.
                </AlertDescription>
              </Alert>

              <div className="space-y-4">
                <div>
                  <Label htmlFor="image">Upload de Imagem</Label>
                  <div className="mt-2">
                    <Input
                      id="image"
                      type="file"
                      accept="image/*"
                      onChange={handleImageUpload}
                      className="cursor-pointer"
                    />
                  </div>
                  {imageFile && (
                    <p className="text-sm text-muted-foreground mt-1">
                      Arquivo selecionado: {imageFile.name}
                    </p>
                  )}
                </div>

                <Button 
                  onClick={handleVisionAnalysis} 
                  disabled={isAnalyzing || !uploadedImage}
                  className="w-full"
                >
                  {isAnalyzing ? (
                    <>
                      <Clock className="h-4 w-4 mr-2 animate-spin" />
                      Analisando imagem...
                    </>
                  ) : (
                    <>
                      <Camera className="h-4 w-4 mr-2" />
                      Analisar Imagem
                    </>
                  )}
                </Button>
              </div>
            </TabsContent>

            <TabsContent value="recommendations" className="space-y-4">
              <Alert>
                <Lightbulb className="h-4 w-4" />
                <AlertDescription>
                  Gere recomendações personalizadas baseadas nos dados atuais do cultivo.
                </AlertDescription>
              </Alert>

              <Button 
                onClick={handleRecommendations} 
                disabled={isAnalyzing || currentSensorData.length === 0}
                className="w-full"
              >
                {isAnalyzing ? (
                  <>
                    <Clock className="h-4 w-4 mr-2 animate-spin" />
                    Gerando recomendações...
                  </>
                ) : (
                  <>
                    <Lightbulb className="h-4 w-4 mr-2" />
                    Gerar Recomendações
                  </>
                )}
              </Button>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {/* Resultados da Análise */}
      {analysisResult && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Zap className="h-5 w-5" />
              Resultado da Análise - Google Gemini
              <Badge variant="outline" className="ml-2">
                {new Date(analysisResult.timestamp).toLocaleTimeString()}
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Análise Geral */}
            {analysisResult.analysis && (
              <div>
                <h4 className="font-medium mb-2 flex items-center gap-2">
                  <MessageSquare className="h-4 w-4" />
                  Análise Geral
                </h4>
                <p className="text-sm text-muted-foreground">{analysisResult.analysis}</p>
              </div>
            )}

                          {/* Desvios */}
            {analysisResult.anomalies && analysisResult.anomalies.length > 0 && (
              <div>
                <h4 className="font-medium mb-2 flex items-center gap-2">
                  <AlertTriangle className="h-4 w-4 text-orange-500" />
                  Alertas Inteligentes Detectados
                </h4>
                <div className="space-y-2">
                  {analysisResult.anomalies.map((anomaly, index) => (
                    <Alert key={index} className="border-l-4 border-orange-200">
                      <AlertDescription>
                        <div className="flex items-center justify-between">
                          <span className="font-medium">{anomaly.parameter}</span>
                          <Badge variant={getSeverityColor(anomaly.severity)}>
                            {getSeverityIcon(anomaly.severity)}
                            {anomaly.severity}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground mt-1">
                          {anomaly.description}
                        </p>
                        <p className="text-sm mt-1">{anomaly.recommendation}</p>
                      </AlertDescription>
                    </Alert>
                  ))}
                </div>
              </div>
            )}

            {/* Recomendações */}
            {analysisResult.recommendations && analysisResult.recommendations.length > 0 && (
              <div>
                <h4 className="font-medium mb-2 flex items-center gap-2">
                  <Lightbulb className="h-4 w-4 text-yellow-500" />
                  Recomendações
                </h4>
                <div className="space-y-2">
                  {analysisResult.recommendations.map((recommendation, index) => (
                    <div key={index} className="flex items-start gap-2 p-3 bg-muted rounded-lg">
                      <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                      <p className="text-sm">{recommendation}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Previsões */}
            {analysisResult.predictions && analysisResult.predictions.yield > 0 && (
              <div>
                <h4 className="font-medium mb-2 flex items-center gap-2">
                  <TrendingUp className="h-4 w-4 text-blue-500" />
                  Previsões
                </h4>
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-3 bg-muted rounded-lg">
                    <p className="text-sm font-medium">Rendimento Previsto</p>
                    <p className="text-lg font-bold">{analysisResult.predictions.yield}g</p>
                  </div>
                  <div className="p-3 bg-muted rounded-lg">
                    <p className="text-sm font-medium">Confiança</p>
                    <p className="text-lg font-bold">{(analysisResult.predictions.confidence * 100).toFixed(1)}%</p>
                  </div>
                </div>
                {analysisResult.predictions.factors && analysisResult.predictions.factors.length > 0 && (
                  <div className="mt-2">
                    <p className="text-sm font-medium mb-1">Fatores que afetam o rendimento:</p>
                    <ul className="text-sm text-muted-foreground space-y-1">
                      {analysisResult.predictions.factors.map((factor, index) => (
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
      )}
    </div>
  )
} 