"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { 
  Activity, 
  Thermometer, 
  Droplets, 
  Gauge, 
  Lightbulb, 
  Leaf,
  Calendar,
  Clock,
  Brain,
  CheckCircle,
  AlertTriangle
} from "lucide-react"
import type { RealTimeSensorData } from "@/lib/real-time-data"
import { RealTimeDataService } from "@/lib/real-time-data"
import { AIAnalysisFactory } from "@/lib/ai-integration-examples"
import { GeminiService } from "@/lib/gemini-service"

interface ManualDataEntryProps {
  cultivationId: string
  cultivationName: string
  onDataAdded?: (data: RealTimeSensorData) => void
  onAnalysisComplete?: (analysis: any) => void
}

const sensorTypes = [
  { value: "ph", label: "pH", icon: Gauge, unit: "", range: { min: 0, max: 14 }, optimal: { min: 5.5, max: 6.5 } },
  { value: "ec", label: "Condutividade Elétrica", icon: Droplets, unit: "mS/cm", range: { min: 0, max: 5 }, optimal: { min: 0.8, max: 2.0 } },
  { value: "temperature", label: "Temperatura", icon: Thermometer, unit: "°C", range: { min: 0, max: 50 }, optimal: { min: 20, max: 28 } },
  { value: "humidity", label: "Umidade", icon: Droplets, unit: "%", range: { min: 0, max: 100 }, optimal: { min: 40, max: 70 } },
  { value: "light", label: "Intensidade Luminosa", icon: Lightbulb, unit: "lux", range: { min: 0, max: 100000 }, optimal: { min: 10000, max: 50000 } },
  { value: "co2", label: "CO2", icon: Activity, unit: "ppm", range: { min: 0, max: 2000 }, optimal: { min: 800, max: 1500 } },
  { value: "nutrients", label: "Nutrientes", icon: Leaf, unit: "ml/L", range: { min: 0, max: 10 }, optimal: { min: 1, max: 5 } }
]

export function ManualDataEntry({ 
  cultivationId, 
  cultivationName, 
  onDataAdded,
  onAnalysisComplete
}: ManualDataEntryProps) {
  const [selectedSensor, setSelectedSensor] = useState<string>("ph")
  const [sensorValue, setSensorValue] = useState<string>("")
  const [entryDate, setEntryDate] = useState<string>(new Date().toISOString().slice(0, 16))
  const [entryTime, setEntryTime] = useState<string>(new Date().toTimeString().slice(0, 5))
  const [notes, setNotes] = useState<string>("")
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [lastAnalysis, setLastAnalysis] = useState<any>(null)
  const [recentEntries, setRecentEntries] = useState<RealTimeSensorData[]>([])

  const dataService = new RealTimeDataService()
  const aiService = AIAnalysisFactory.createService("local", process.env.NEXT_PUBLIC_AI_API_KEY)

  const handleAddData = async () => {
    if (!sensorValue || isNaN(Number(sensorValue))) {
      alert("Por favor, insira um valor válido")
      return
    }

    const timestamp = new Date(`${entryDate}T${entryTime}`).toISOString()
    const sensorData: RealTimeSensorData = {
      id: `manual_${Date.now()}`,
      cultivationId,
      timestamp,
      sensorType: selectedSensor as any,
      value: Number(sensorValue),
      unit: sensorTypes.find(s => s.value === selectedSensor)?.unit || "",
      location: "Manual Entry",
      accuracy: 0.9, // Assumindo boa precisão manual
      batteryLevel: 100
    }

    // Adicionar ao serviço de dados
    dataService.addSensorData(sensorData)

    // Adicionar à lista de entradas recentes
    setRecentEntries(prev => [sensorData, ...prev.slice(0, 4)])

    // Notificar componente pai
    onDataAdded?.(sensorData)

    // Limpar formulário
    setSensorValue("")
    setNotes("")

    // Executar análise automática
    await runAIAnalysis()
  }

  const runAIAnalysis = async () => {
    setIsAnalyzing(true)
    
    try {
      // Obter dados recentes para análise
      const recentData = dataService.getDataForAnalysis(cultivationId, {
        start: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(), // Últimos 7 dias
        end: new Date().toISOString()
      })

      // Usar Gemini para análise
      const apiKey = process.env.NEXT_PUBLIC_CHAVE_API_GEMINI
      if (!apiKey) {
        throw new Error('Chave da API Gemini não configurada')
      }
      const geminiService = new GeminiService(apiKey)
      
      // Carregar informações do cultivo do banco
      const cultivationResponse = await fetch(`/api/cultivation/${cultivationId}`)
      let cultivationInfo = {
        strain: "OG Kush", // Fallback
        phase: "flowering",
        daysSinceStart: 45,
        numPlants: 6
      }
      
      if (cultivationResponse.ok) {
        const cultivationData = await cultivationResponse.json()
        if (cultivationData.success && cultivationData.cultivation) {
          const cultivation = cultivationData.cultivation
          const startDate = new Date(cultivation.startDate)
          const currentDate = new Date()
          const daysSinceStart = Math.floor((currentDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24))
          
          cultivationInfo = {
            strain: cultivation.seedStrain,
            phase: cultivation.status === "active" ? "flowering" : "completed",
            daysSinceStart: daysSinceStart,
            numPlants: 6 // Valor padrão
          }
        }
      }

      const analysis = await geminiService.analyzeCultivationData({
        sensorData: recentData.sensorData.map(data => ({
          sensorType: data.sensorType,
          value: data.value,
          unit: data.unit,
          timestamp: data.timestamp
        })),
        cultivationInfo: cultivationInfo,
        userQuery: "Analise os dados reais do cultivo e detecte desvios",
        includeRecommendations: true,
        includePredictions: true
      })

      const analysisResult = {
        anomalies: analysis.anomalies,
        yieldPrediction: (analysis as any).predictions || null,
        service: "Google Gemini AI",
        timestamp: analysis.timestamp,
        dataPoints: recentData.sensorData.length,
        analysis: analysis.analysis,
        recommendations: analysis.recommendations
      }

      setLastAnalysis(analysisResult)
      onAnalysisComplete?.(analysisResult)
    } catch (error) {
      console.error("Erro na análise:", error)
      // Fallback para análise local se Gemini falhar
      try {
        const recentData = dataService.getDataForAnalysis(cultivationId, {
          start: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
          end: new Date().toISOString()
        })

        const anomalies = aiService.detectAnomalies(recentData.sensorData)
        const yieldPrediction = aiService.predictYield({
          numPlants: 6,
          currentData: recentData.sensorData
        })

        const analysis = {
          anomalies,
          yieldPrediction,
          service: "Local AI (Fallback)",
          timestamp: new Date().toISOString(),
          dataPoints: recentData.sensorData.length
        }

        setLastAnalysis(analysis)
        onAnalysisComplete?.(analysis)
      } catch (fallbackError) {
        console.error("Erro no fallback:", fallbackError)
      }
    } finally {
      setIsAnalyzing(false)
    }
  }

  const getSensorIcon = (sensorType: string) => {
    const sensor = sensorTypes.find(s => s.value === sensorType)
    return sensor?.icon || Activity
  }

  const getOptimalRange = (sensorType: string) => {
    const sensor = sensorTypes.find(s => s.value === sensorType)
    return sensor?.optimal || { min: 0, max: 100 }
  }

  const isValueOptimal = (sensorType: string, value: number) => {
    const optimal = getOptimalRange(sensorType)
    return value >= optimal.min && value <= optimal.max
  }

  const getValueStatus = (sensorType: string, value: number) => {
    if (isValueOptimal(sensorType, value)) {
      return { status: "optimal", color: "text-green-600", icon: CheckCircle }
    } else {
      return { status: "warning", color: "text-orange-600", icon: AlertTriangle }
    }
  }

  return (
    <div className="space-y-6">
      {/* Formulário de Entrada */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5" />
            Adicionar Dados Manualmente
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <Label htmlFor="sensor-type">Tipo de Sensor</Label>
              <Select value={selectedSensor} onValueChange={setSelectedSensor}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {sensorTypes.map((sensor) => {
                    const Icon = sensor.icon
                    return (
                      <SelectItem key={sensor.value} value={sensor.value}>
                        <div className="flex items-center gap-2">
                          <Icon className="h-4 w-4" />
                          {sensor.label}
                        </div>
                      </SelectItem>
                    )
                  })}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="sensor-value">Valor</Label>
              <Input
                id="sensor-value"
                type="number"
                value={sensorValue}
                onChange={(e) => setSensorValue(e.target.value)}
                placeholder="Ex: 6.2"
                step="0.1"
              />
              {sensorValue && !isNaN(Number(sensorValue)) && (
                <div className="mt-1">
                  {(() => {
                    const status = getValueStatus(selectedSensor, Number(sensorValue))
                    const Icon = status.icon
                    return (
                      <div className={`flex items-center gap-1 text-xs ${status.color}`}>
                        <Icon className="h-3 w-3" />
                        {status.status === "optimal" ? "Ótimo" : "Atenção"}
                      </div>
                    )
                  })()}
                </div>
              )}
            </div>

            <div>
              <Label htmlFor="entry-date">Data</Label>
              <Input
                id="entry-date"
                type="date"
                value={entryDate}
                onChange={(e) => setEntryDate(e.target.value)}
              />
            </div>

            <div>
              <Label htmlFor="entry-time">Hora</Label>
              <Input
                id="entry-time"
                type="time"
                value={entryTime}
                onChange={(e) => setEntryTime(e.target.value)}
              />
            </div>
          </div>

          <div>
            <Label htmlFor="notes">Observações (opcional)</Label>
            <Input
              id="notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Ex: Primeira medição do dia, plantas respondendo bem..."
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="text-sm text-muted-foreground">
              <div>Range ideal: {getOptimalRange(selectedSensor).min} - {getOptimalRange(selectedSensor).max} {sensorTypes.find(s => s.value === selectedSensor)?.unit}</div>
            </div>
            <Button 
              onClick={handleAddData}
              disabled={!sensorValue || isNaN(Number(sensorValue)) || isAnalyzing}
            >
              <Activity className="h-4 w-4 mr-2" />
              {isAnalyzing ? "Analisando..." : "Adicionar e Analisar"}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Entradas Recentes */}
      {recentEntries.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5" />
              Entradas Recentes
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {recentEntries.map((entry, index) => {
                const status = getValueStatus(entry.sensorType, entry.value)
                const Icon = status.icon
                const SensorIcon = getSensorIcon(entry.sensorType)
                
                return (
                  <div key={index} className="flex items-center justify-between p-3 bg-muted rounded-lg">
                    <div className="flex items-center gap-3">
                      <SensorIcon className="h-4 w-4" />
                      <div>
                        <div className="font-medium capitalize">{entry.sensorType}</div>
                        <div className="text-sm text-muted-foreground">
                          {new Date(entry.timestamp).toLocaleString()}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold">{entry.value} {entry.unit}</span>
                      <Icon className={`h-4 w-4 ${status.color}`} />
                    </div>
                  </div>
                )
              })}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Análise de IA */}
      {lastAnalysis && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Brain className="h-5 w-5" />
              Análise Inteligente
              <Badge variant="outline" className="ml-2">
                {new Date(lastAnalysis.timestamp).toLocaleTimeString()}
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Alertas Inteligentes */}
            {lastAnalysis.anomalies && lastAnalysis.anomalies.length > 0 && (
              <div>
                <h4 className="font-medium mb-2 flex items-center gap-2">
                  <AlertTriangle className="h-4 w-4 text-orange-500" />
                  Desvios Detectados
                </h4>
                <div className="space-y-2">
                  {lastAnalysis.anomalies.map((anomaly: any, index: number) => (
                    <Alert key={index} className="border-l-4 border-orange-200">
                      <AlertDescription>
                        <div className="flex items-center justify-between">
                          <span className="font-medium capitalize">{anomaly.parameter}</span>
                          <Badge variant={anomaly.severity === "critical" ? "destructive" : "secondary"}>
                            {anomaly.severity}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground mt-1">
                          Valor: {anomaly.currentValue.toFixed(1)} | 
                          Esperado: {anomaly.expectedValue.toFixed(1)} | 
                          Desvio: {anomaly.deviationPercent.toFixed(1)}%
                        </p>
                        <p className="text-sm mt-1">{anomaly.recommendation}</p>
                      </AlertDescription>
                    </Alert>
                  ))}
                </div>
              </div>
            )}

            {/* Predição de Rendimento */}
            {lastAnalysis.yieldPrediction && (
              <div>
                <h4 className="font-medium mb-2 flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  Predição de Rendimento
                </h4>
                <div className="p-3 bg-green-50 rounded">
                  <div className="text-lg font-bold text-green-700">
                    {lastAnalysis.yieldPrediction.predictedYield}g
                  </div>
                  <div className="text-sm text-muted-foreground">
                    Confiança: {(lastAnalysis.yieldPrediction.confidence * 100).toFixed(0)}%
                  </div>
                </div>
              </div>
            )}

            {/* Estatísticas */}
            <div className="text-sm text-muted-foreground">
              <div>Dados analisados: {lastAnalysis.dataPoints} pontos</div>
              <div>Serviço: {lastAnalysis.service}</div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Informações do Cultivo */}
      <Card>
        <CardHeader>
          <CardTitle>Informações do Cultivo</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="font-medium">Cultivo:</span> {cultivationName}
            </div>
            <div>
              <span className="font-medium">ID:</span> {cultivationId}
            </div>
            <div>
              <span className="font-medium">Entradas:</span> {recentEntries.length}
            </div>
            <div>
              <span className="font-medium">Última análise:</span> 
              {lastAnalysis ? new Date(lastAnalysis.timestamp).toLocaleTimeString() : "Nenhuma"}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
} 