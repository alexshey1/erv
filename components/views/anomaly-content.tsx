"use client"

import { useState, useEffect } from "react"
import { AnomalyAlerts } from "@/components/anomaly-alerts"
import { AnomalyLearningStatus } from "@/components/anomaly-learning-status"
import { AnomalyPatternDetails } from "@/components/anomaly-pattern-details"
import { GeminiClientService } from "@/lib/gemini-client-service"
import { PageContainer } from "@/components/layout/page-container"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription } from "@/components/ui/alert"
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
  FileText
} from "lucide-react"
import { toast } from "sonner"
import { generateAnomalyAnalysisPDF } from "@/lib/report-generator"
import { LegalDisclaimer } from "@/components/ui/legal-disclaimer"
import React from "react"
import ErvaBotChatSuspense from "@/components/erva-bot-chat"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Checkbox } from "@/components/ui/checkbox"
import { ChevronDown } from "lucide-react"


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

interface AnomalyAnalysis {
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

interface AnomalyContentProps {
  user?: any;
  cultivations?: any;
}

export function AnomalyContent({ user, cultivations: initialCultivations }: AnomalyContentProps) {
  const [geminiService, setGeminiService] = useState<GeminiClientService | null>(null)
  const [cultivations, setCultivations] = useState<CultivationData[]>([])
  const [anomalyAnalysis, setAnomalyAnalysis] = useState<Record<string, any>>({})
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [isLoadingCultivations, setIsLoadingCultivations] = useState(true)
  const [lastAnalysisTime, setLastAnalysisTime] = useState<string>("")
  const [selectedCultivations, setSelectedCultivations] = useState<string[]>([])

  // Inicializar serviço Gemini
  useEffect(() => {
    console.log('🔑 Inicializando serviço Gemini Client...')
    const service = new GeminiClientService()
    setGeminiService(service)
  }, [])

  // Carregar dados reais dos cultivos e eventos
  useEffect(() => {
    const loadRealCultivationData = async () => {
      try {
        setIsLoadingCultivations(true)
        // 1. Carregar cultivos do banco
        const cultivationsResponse = await fetch('/api/cultivation')
        if (cultivationsResponse.ok) {
          const cultivationsData = await cultivationsResponse.json()
          
          if (cultivationsData.success) {
            const realCultivations: CultivationData[] = []
            
            // 2. Para cada cultivo, carregar eventos e converter para dados de sensores
            for (const cultivation of cultivationsData.cultivations) {
              try {
                const eventsResponse = await fetch(`/api/cultivation-events?cultivationId=${cultivation.id}`)
                if (eventsResponse.ok) {
                  const eventsData = await eventsResponse.json()
                  
                  if (eventsData.success && eventsData.events.length > 0) {
                    // Converter eventos para dados de sensores
                    const sensorData = eventsData.events
                      .filter((event: any) => event.details && (
                        event.details.ph || 
                        event.details.ec || 
                        event.details.temperatura || 
                        event.details.umidade
                      ))
                      .map((event: any) => {
                        const sensorDataPoints: { sensorType: string; value: number; unit: string; timestamp: any }[] = []
                        
                        if (event.details.ph) {
                          sensorDataPoints.push({
                            sensorType: "ph",
                            value: Number(event.details.ph),
                            unit: "",
                            timestamp: event.date
                          })
                        }
                        
                        if (event.details.ec) {
                          sensorDataPoints.push({
                            sensorType: "ec",
                            value: Number(event.details.ec),
                            unit: "mS/cm",
                            timestamp: event.date
                          })
                        }
                        
                        if (event.details.temperatura) {
                          sensorDataPoints.push({
                            sensorType: "temperature",
                            value: Number(event.details.temperatura),
                            unit: "°C",
                            timestamp: event.date
                          })
                        }
                        
                        if (event.details.umidade) {
                          sensorDataPoints.push({
                            sensorType: "humidity",
                            value: Number(event.details.umidade),
                            unit: "%",
                            timestamp: event.date
                          })
                        }
                        
                        return sensorDataPoints
                      })
                      .flat()
                      .filter((data: any) => data.value > 0) // Filtrar valores válidos
                    
                    // Calcular dias desde o início
                    const startDate = new Date(cultivation.startDate)
                    const currentDate = new Date()
                    const daysSinceStart = Math.floor((currentDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24))
                    
                    // Determinar fase correta
                    let phase = "vegetative"
                    if (daysSinceStart > 60 && daysSinceStart <= 130) phase = "flowering"
                    else if (daysSinceStart > 130) phase = "curing"

                    realCultivations.push({
                      id: cultivation.id,
                      name: cultivation.name,
                      strain: cultivation.seedStrain,
                      phase, // agora corretamente calculado
                      daysSinceStart: daysSinceStart,
                      numPlants: 6, // Valor padrão
                      status: cultivation.status as "active" | "completed" | "planned",
                      sensorData: sensorData
                    })
                  }
                }
              } catch (error) {
                console.error(`Erro ao carregar eventos do cultivo ${cultivation.id}:`, error)
              }
            }
            
            setCultivations(realCultivations)
            console.log('Cultivos carregados com dados reais:', realCultivations)
            
            // Log detalhado para debug
            if (realCultivations.length === 0) {
              console.log('⚠️ Nenhum cultivo com dados foi encontrado')
            } else {
              realCultivations.forEach((cultivation, index) => {
                console.log(`📊 Cultivo ${index + 1}:`, {
                  name: cultivation.name,
                  strain: cultivation.strain,
                  status: cultivation.status,
                  sensorDataCount: cultivation.sensorData.length,
                  sensorData: cultivation.sensorData
                })
              })
            }
          }
        }
      } catch (error) {
        console.error('Erro ao carregar dados dos cultivos:', error)
        toast.error('Erro ao carregar dados dos cultivos')
      } finally {
        setIsLoadingCultivations(false)
      }
    }

    loadRealCultivationData()
  }, [])

  const runAnomalyAnalysis = async () => {
    if (cultivations.length === 0) {
      toast.error("Nenhum cultivo encontrado")
      return
    }
    const toAnalyze = cultivations.filter(
      c => c.status === "active" && selectedCultivations.includes(c.id)
    );
    if (toAnalyze.length === 0) {
      toast.error("Selecione pelo menos um cultivo para analisar")
      return;
    }

    setIsAnalyzing(true)
    try {
      const results: Record<string, AnomalyAnalysis> = {}
      for (const cultivation of toAnalyze) {
        if (!cultivation.sensorData || cultivation.sensorData.length === 0) {
          toast.error(`Nenhum dado de sensor encontrado para o cultivo ${cultivation.name}`)
          continue
        }
      const analysisRequest = {
        sensorData: cultivation.sensorData,
        cultivationInfo: {
          strain: cultivation.strain,
          phase: cultivation.phase,
          daysSinceStart: cultivation.daysSinceStart,
          numPlants: cultivation.numPlants
        },
        userQuery: "Detecte anomalias e forneça recomendações específicas baseadas nos dados reais do cultivo",
        includeRecommendations: true,
        includePredictions: true
      }
        if (!geminiService) {
          toast.error("Serviço Gemini não disponível")
          continue
        }
      const analysis = await geminiService.analyzeCultivationData(analysisRequest)
        results[cultivation.id] = analysis
      }
      setAnomalyAnalysis(results)
      setLastAnalysisTime(new Date().toLocaleTimeString())
      toast.success("Análise de anomalias concluída!")
    } catch (error) {
      console.error("Erro na análise de anomalias:", error)
      toast.error("Erro ao executar análise de anomalias")
    } finally {
      setIsAnalyzing(false)
    }
  }

  const handleAnomalyAction = (anomaly: any) => {
    console.log("Ação tomada para anomalia:", anomaly)
    toast.success(`Ação aplicada: ${anomaly.recommendation}`)
  }

  const handleExportPDF = async (analysis: any, cultivation: any) => {
    try {
      await generateAnomalyAnalysisPDF(analysis, cultivation)
      toast.success("PDF exportado com sucesso!")
    } catch (error) {
      console.error("Erro ao exportar PDF:", error)
      toast.error("Erro ao exportar PDF")
    }
  }

  const getSystemStats = () => {
    const activeCultivations = cultivations.filter(c => c.status === "active")
    const completedCultivations = cultivations.filter(c => c.status === "completed")
    const totalAnomalies = anomalyAnalysis?.anomalies?.length || 0
    
    return {
      total: cultivations.length,
      active: activeCultivations.length,
      completed: completedCultivations.length,
      successful: completedCultivations.length, // Simplificado
      anomalies: totalAnomalies,
    }
  }

  const stats = getSystemStats()

  const phase = cultivations.find(c => c.status === "active")?.phase || "vegetative";
  const initialWhatIf: Record<string, number> = {
    ph: 6.0,
    humidity: phase === "vegetative" ? 60 : 40,
    ec: phase === "vegetative" ? 1.2 : 1.5,
    temperature: 25,
  };
  const [whatIf, setWhatIf] = React.useState<Record<string, number>>(initialWhatIf);
  // Adicione estado para fase simulada
  const [simPhase, setSimPhase] = React.useState<'vegetative' | 'flowering'>('vegetative');

  return (
    <div className="w-full px-4 sm:px-6 lg:px-8 pt-8">
      {/* Legal Disclaimer */}
      {/* Remover o <LegalDisclaimer variant="warning" className="mb-6" /> do topo */}
      
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Sistema de Alertas Inteligentes</h1>
        <p className="text-gray-600 mt-2">Monitore e receba alertas inteligentes em seus cultivos usando IA avançada do Google Gemini</p>
      </div>
      {/* Removido: Chat ErvaBot IA do topo */}

      {/* Header com estatísticas */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
        <Card className="border-l-4 border-blue-500">
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5 text-blue-600" />
              <div>
                <p className="text-sm text-muted-foreground">Total Cultivos</p>
                <p className="text-2xl font-bold text-blue-600">{stats.total}</p>
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
                <p className="text-2xl font-bold text-green-600">{stats.active}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-purple-500">
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-purple-600" />
              <div>
                <p className="text-sm text-muted-foreground">Bem-sucedidos</p>
                <p className="text-2xl font-bold text-purple-600">{stats.successful}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-orange-500">
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Brain className="h-5 w-5 text-orange-600" />
              <div>
                <p className="text-sm text-muted-foreground">IA Ativa</p>
                <p className="text-2xl font-bold text-orange-600">✓</p>
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
                <p className="text-2xl font-bold text-red-600">{stats.anomalies}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Botão de Análise */}
      <div className="mb-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Zap className="h-5 w-5" />
              Análise Inteligente
            </CardTitle>
          </CardHeader>
          <CardContent>
            {/* Seleção de cultivo ativo único (select nativo estilizado) */}
            <div className="mb-4">
              <p className="font-semibold mb-2">Selecione o cultivo para análise:</p>
              <select
                value={selectedCultivations[0] || ""} // Select only one
                onChange={e => setSelectedCultivations([e.target.value])}
                disabled={isLoadingCultivations}
                className={`w-full px-4 py-2 border border-green-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 bg-white text-green-900 font-medium shadow-sm ${
                  isLoadingCultivations ? 'opacity-50 cursor-not-allowed' : ''
                }`}
              >
                {isLoadingCultivations ? (
                  <option value="" disabled>🔄 Carregando cultivos...</option>
                ) : (
                  <>
                    <option value="" disabled>Selecione um cultivo</option>
                    {cultivations.filter(c => c.status === "active").map(cultivation => (
                      <option key={cultivation.id} value={cultivation.id}>{cultivation.name}</option>
                    ))}
                  </>
                )}
              </select>
            </div>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground mb-2">
                  Execute análise completa dos cultivos ativos usando IA avançada
                </p>
                {lastAnalysisTime && (
                  <p className="text-xs text-muted-foreground">
                    Última análise: {lastAnalysisTime}
                  </p>
                )}
                {isLoadingCultivations ? (
                  <div className="flex items-center gap-2">
                    <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-green-600"></div>
                    <p className="text-xs text-green-600">Identificando cultivos...</p>
                  </div>
                ) : cultivations.length > 0 ? (
                  <p className="text-xs text-green-600">
                    {cultivations.filter(c => c.status === "active").length} cultivo(s) ativo(s) encontrado(s)
                  </p>
                ) : (
                  <p className="text-xs text-orange-600">
                    Nenhum cultivo ativo encontrado
                  </p>
                )}
              </div>
              <Button 
                onClick={runAnomalyAnalysis} 
                disabled={isAnalyzing || !geminiService || isLoadingCultivations || selectedCultivations.length === 0}
                className="flex items-center gap-2"
              >
                {isAnalyzing ? (
                  <>
                    <Clock className="h-4 w-4 animate-spin" />
                    Analisando...
                  </>
                ) : (
                  <>
                    <Brain className="h-4 w-4" />
                    Executar Análise
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Resultados da Análise */}
      {/* Resultados da Análise para cada cultivo */}
      {anomalyAnalysis && Object.keys(anomalyAnalysis).length > 0 && (
        <div className="mb-10">
          {Object.entries(anomalyAnalysis).map(([cultivationId, analysis]) => {
            const cultivation = cultivations.find(c => c.id === cultivationId);
            return (
              <Card key={cultivationId} className="bg-white border-green-100 shadow-lg mb-6">
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Zap className="h-5 w-5 text-green-500" />
                    {cultivation ? cultivation.name : `Cultivo ${cultivationId}`}
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleExportPDF(analysis, cultivation)}
                    className="flex items-center gap-2"
                  >
                    <FileText className="h-4 w-4" />
                    Exportar PDF
                  </Button>
                </CardTitle>
                <p className="text-muted-foreground text-sm mt-2">Análise individual do cultivo selecionado.</p>
              </CardHeader>
                <CardContent>
                  <div className="mb-2 font-semibold text-green-700">Análise:</div>
                  <div className="mb-2 text-gray-800">{analysis.analysis}</div>
                  <div className="mb-2 font-semibold text-green-700">Recomendações:</div>
                  <ul className="list-disc pl-6 text-green-800 mb-2">
                    {analysis.recommendations.map((rec: any, idx: any) => <li key={idx}>{rec}</li>)}
                  </ul>
                  <div className="mb-2 font-semibold text-green-700">Alertas:</div>
                  <ul className="list-disc pl-6 text-red-700">
                    {analysis.anomalies.filter((anom: any) => {
                      // Filtrar alertas só se estiver fora da faixa ideal
                      const phase = cultivation?.phase || "vegetative";
                      if (anom.parameter === 'humidity') {
                        const value = parseFloat(anom.description.match(/\d+\.?\d*/)?.[0] || "0");
                        if (phase === "vegetative" && value >= 60 && value <= 70) return false;
                        if (phase === "flowering" && value >= 40 && value <= 50) return false;
                      }
                      if (anom.parameter === 'temperature') {
                        const value = parseFloat(anom.description.match(/\d+\.?\d*/)?.[0] || "0");
                        if (phase === "vegetative" && value >= 22 && value <= 30) return false;
                        if (phase === "flowering" && value >= 20 && value <= 26) return false;
                      }
                      if (anom.parameter === 'ph') {
                        const value = parseFloat(anom.description.match(/\d+\.?\d*/)?.[0] || "0");
                        if (phase === "vegetative" && value >= 5.8 && value <= 6.2) return false;
                        if (phase === "flowering" && value >= 6.0 && value <= 6.5) return false;
                      }
                      if (anom.parameter === 'ec') {
                        const value = parseFloat(anom.description.match(/\d+\.?\d*/)?.[0] || "0");
                        if (phase === "vegetative" && value >= 1.0 && value <= 1.6) return false;
                        if (phase === "flowering" && value >= 1.6 && value <= 2.2) return false;
                      }
                      return true;
                    }).map((anom: any, idx: any) => (
                      <li key={idx}>
                        <span className="font-bold">{
                          anom.parameter === 'humidity' ? 'Umidade' :
                          anom.parameter === 'temperature' ? 'Temperatura' :
                          anom.parameter === 'ph' ? 'pH' :
                          anom.parameter === 'ec' ? 'EC' :
                          anom.parameter
                        }</span>: {anom.description} <span className="text-green-700">{anom.recommendation}</span>
                      </li>
                    ))}
                  </ul>
                  <div className="text-xs text-gray-500 mt-2">Analisado em: {analysis.timestamp}</div>
              </CardContent>
            </Card>
            );
          })}
        </div>
      )}

      {/* Resumo de Saúde do Cultivo + Dicas Rápidas */}
      {/* anomalyAnalysis && ( */}
        <div className="mt-10 mb-10 flex flex-col md:flex-row gap-8 items-stretch">
          {/* Health Score */}
          <div className="flex-1 bg-white rounded-xl shadow p-6 flex flex-col items-center justify-center border border-green-100">
            <h3 className="text-lg font-bold text-green-700 mb-2 flex items-center gap-2">
              <BarChart3 className="h-5 w-5 text-green-500" />
              Resumo de Saúde do Cultivo
            </h3>
            {(() => {
              // Score: começa em 100, penaliza por anomalias
              let score = 100;
              if (anomalyAnalysis && Object.values(anomalyAnalysis).length > 0) {
                Object.values(anomalyAnalysis).forEach((a: any) => {
                  a.anomalies.forEach((anomaly: any) => {
                    switch (anomaly.severity) {
                    case 'critical': score -= 30; break;
                    case 'high': score -= 20; break;
                    case 'medium': score -= 10; break;
                    case 'low': score -= 5; break;
                    default: break;
                  }
                  });
                });
              }
              if (score < 0) score = 0;
              let color = score >= 80 ? 'bg-green-500' : score >= 60 ? 'bg-yellow-400' : score >= 40 ? 'bg-orange-400' : 'bg-red-500';
              let label = score >= 80 ? 'Excelente' : score >= 60 ? 'Bom' : score >= 40 ? 'Atenção' : 'Crítico';
              let text = score >= 80 ? 'Seu cultivo está saudável!' : score >= 60 ? 'Alguns ajustes recomendados.' : score >= 40 ? 'Atenção: corrija as anomalias.' : 'Risco alto! Aja imediatamente.';
              return (
                <>
                  <div className="w-full flex flex-col items-center mb-2">
                    <div className="relative w-full h-6 bg-gray-100 rounded-full overflow-hidden mb-2">
                      <div className={`absolute left-0 top-0 h-6 rounded-full transition-all duration-500 ${color}`} style={{ width: `${score}%` }} />
                      <span className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 font-bold text-sm text-gray-900">{score}%</span>
                    </div>
                    <span className={`font-semibold text-base ${color.replace('bg-', 'text-')}`}>{label}</span>
                  </div>
                  <p className="text-sm text-gray-600 text-center">{text}</p>
                </>
              );
            })()}
          </div>
          {/* Dicas Rápidas */}
          <div className="flex-1 bg-green-50 rounded-xl shadow p-6 flex flex-col justify-center border border-green-100">
            <h3 className="text-lg font-bold text-green-700 mb-2 flex items-center gap-2">
              <Lightbulb className="h-5 w-5 text-yellow-500" />
              Dicas Rápidas
            </h3>
            <ul className="list-disc ml-5 space-y-2 text-green-900 text-sm">
              {(() => {
                const dicas: string[] = [];
                const lastCultivation = cultivations.find(c => c.id === selectedCultivations[0]);
                const phase = lastCultivation?.phase || "vegetative";
                // Adicione recomendações da IA se disponíveis
                const lastAnalysis = anomalyAnalysis[selectedCultivations[0]];
                if (lastAnalysis && lastAnalysis.recommendations && lastAnalysis.recommendations.length > 0) {
                  lastAnalysis.recommendations.forEach((rec: any) => dicas.push(rec));
                } else {
                if (phase === "vegetative") {
                  dicas.push("Mantenha a umidade entre 60-70% para crescimento vigoroso.");
                  dicas.push("Garanta luz intensa e fotoperíodo adequado.");
                  }
                  if (phase === "flowering") {
                    dicas.push("Mantenha a umidade entre 40-50% para evitar mofo na floração.");
                    dicas.push("Reduza a rega e aumente a ventilação nesta fase.");
                    dicas.push("Garanta luz intensa e fotoperíodo de 12h/12h.");
                  }
                }
                return dicas.map((d, idx) => <li key={idx}>{d}</li>);
              })()}
            </ul>
          </div>
        </div>
      {/* ) */}

      {/* Após o bloco de Health Score + Dicas Rápidas, adicione o Simulador What-If */}

{/* anomalyAnalysis && ( */}
  <div className="mb-10">
    <Card className="bg-white border-green-100 shadow-lg">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Zap className="h-5 w-5 text-green-500" />
          Simulador de Impacto de Correções (What-If)
        </CardTitle>
        <p className="text-muted-foreground text-sm mt-2">Ajuste os parâmetros abaixo e veja como o score de saúde e as dicas mudariam se você corrigisse as anomalias.</p>
      </CardHeader>
      <CardContent>
        {(() => {
          // Parâmetros críticos e valores atuais
          const params = [
            { key: 'ph', label: 'pH', min: 5.0, max: 8.0, step: 0.1, idealMin: simPhase === 'vegetative' ? 5.8 : 6.0, idealMax: simPhase === 'vegetative' ? 6.2 : 6.5 },
            { key: 'humidity', label: 'Umidade (%)', min: 30, max: 90, step: 1, idealMin: simPhase === 'vegetative' ? 60 : 40, idealMax: simPhase === 'vegetative' ? 70 : 50 },
            { key: 'ec', label: 'EC (mS/cm)', min: 0.5, max: 2.5, step: 0.1, idealMin: simPhase === 'vegetative' ? 1.0 : 1.6, idealMax: simPhase === 'vegetative' ? 1.6 : 2.2 },
            { key: 'temperature', label: 'Temperatura (°C)', min: 10, max: 35, step: 0.5, idealMin: simPhase === 'vegetative' ? 22 : 20, idealMax: simPhase === 'vegetative' ? 30 : 26 },
          ];
          // Função para atualizar
          function updateParam(key: string, value: number) {
            setWhatIf(prev => ({ ...prev, [key]: value }));
          }
          // Calcular novo score
          let score = 100;
          let dicas: string[] = [];
          let foraIdeal = 0;
          params.forEach(param => {
            const v = whatIf[param.key];
            if (v < param.idealMin) {
              score -= 30;
              foraIdeal++;
              dicas.push(`Aumente o valor de ${param.label} para pelo menos ${param.idealMin}`);
            } else if (v > param.idealMax) {
              score -= 30;
              foraIdeal++;
              dicas.push(`Reduza o valor de ${param.label} para no máximo ${param.idealMax}`);
            }
          });
          if (foraIdeal === 0) score = 100;
          if (score < 0) score = 0;
          let color = score >= 80 ? 'bg-green-500' : score >= 60 ? 'bg-yellow-400' : score >= 40 ? 'bg-orange-400' : 'bg-red-500';
          let label = score >= 80 ? 'Excelente' : score >= 60 ? 'Bom' : score >= 40 ? 'Atenção' : 'Crítico';
          let text = score >= 80 ? 'Seu cultivo ficaria saudável!' : score >= 60 ? 'Alguns ajustes ainda recomendados.' : score >= 40 ? 'Atenção: corrija os parâmetros.' : 'Risco crítico! Corrija imediatamente todos os parâmetros fora do ideal.';
          return (
            <div className="flex flex-col md:flex-row gap-8 items-stretch">
              <div className="flex-1 flex flex-col items-center justify-center">
                <h4 className="font-semibold text-green-700 mb-2">Score Simulado</h4>
                <div className="relative w-full h-6 bg-gray-100 rounded-full overflow-hidden mb-2">
                  <div className={`absolute left-0 top-0 h-6 rounded-full transition-all duration-500 ${color}`} style={{ width: `${score}%` }} />
                  <span className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 font-bold text-sm text-gray-900">{score}%</span>
                </div>
                <span className={`font-semibold text-base ${color.replace('bg-', 'text-')}`}>{label}</span>
                <p className="text-sm text-gray-600 text-center mt-2">{text}</p>
              </div>
              <div className="flex-1">
                <h4 className="font-semibold text-green-700 mb-2">Ajuste os Parâmetros</h4>
                <div className="mb-4">
                  <label className="font-medium text-sm text-gray-700 mr-2">Fase do cultivo:</label>
                  <select
                    value={simPhase}
                    onChange={e => setSimPhase(e.target.value as 'vegetative' | 'flowering')}
                    className="px-2 py-1 border border-green-300 rounded focus:outline-none focus:ring-2 focus:ring-green-500 bg-white text-green-900 font-medium"
                  >
                    <option value="vegetative">Vegetativa</option>
                    <option value="flowering">Floração</option>
                  </select>
                </div>
                <div className="space-y-4">
                  {params.map(param => (
                    <div key={param.key} className="flex flex-col gap-1">
                      <label className="font-medium text-sm text-gray-700 flex justify-between">
                        {param.label}
                        <span className="ml-2 text-xs text-gray-500">Ideal: {param.idealMin} - {param.idealMax}</span>
                      </label>
                      <input
                        type="range"
                        min={param.min}
                        max={param.max}
                        step={param.step}
                        value={whatIf[param.key]}
                        onChange={e => updateParam(param.key, parseFloat(e.target.value))}
                        className="w-full accent-green-500"
                      />
                      <div className="flex justify-between text-xs text-gray-500">
                        <span>{param.min}</span>
                        <span className="font-bold text-green-700">{whatIf[param.key]}</span>
                        <span>{param.max}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              <div className="flex-1">
                <h4 className="font-semibold text-green-700 mb-2">Dicas Simuladas</h4>
                <ul className="list-disc ml-5 space-y-2 text-green-900 text-sm">
                  {dicas.length === 0 ? <li>Tudo dentro dos parâmetros ideais!</li> : dicas.map((d, idx) => <li key={idx}>{d}</li>)}
                </ul>
              </div>
            </div>
          );
        })()}
      </CardContent>
    </Card>
  </div>
{/* ) */}

      {/* Análise Visual de Plantas removida - funcionalidade agora disponível exclusivamente na página Análise Visual IA */}

      {/* Informações sobre o Sistema */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-10">
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
                padrões e detectar anomalias.
              </p>
            </div>
            <div className="space-y-2">
              <h4 className="font-semibold text-sm">2. Detecção Avançada</h4>
              <p className="text-sm text-muted-foreground">
                O sistema compara parâmetros atuais com padrões ideais para cada strain 
                e fase do cultivo.
              </p>
            </div>
            <div className="space-y-2">
              <h4 className="font-semibold text-sm">3. Recomendações IA</h4>
              <p className="text-sm text-muted-foreground">
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
      {/* Chat ErvaBot IA */}
      {/* <div className="mb-12 flex justify-center">
        <ErvaBotChatSuspense />
      </div> */}
      <div className="mt-8 mb-12">
        <LegalDisclaimer variant="warning" />
      </div>
    </div>
  )
}