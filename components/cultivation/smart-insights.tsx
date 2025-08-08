"use client"

import { useMemo, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { 
  Lightbulb, 
  TrendingUp, 
  AlertTriangle, 
  Target, 
  Calendar,
  Zap,
  Award,
  Brain,
  BarChart3,
  Clock
} from "lucide-react"
import type { CultivationSummary, CultivationEvent } from "@/lib/mock-data"

interface SmartInsightsProps {
  cultivation: CultivationSummary
  events: CultivationEvent[]
  allCultivations: CultivationSummary[]
}

interface Insight {
  id: string
  type: "success" | "warning" | "opportunity" | "prediction"
  title: string
  description: string
  impact: "high" | "medium" | "low"
  actionable: boolean
  recommendation?: string
  confidence: number
}

export function SmartInsights({ cultivation, events, allCultivations }: SmartInsightsProps) {
  const [showActionModal, setShowActionModal] = useState<null | Insight>(null)
  const [actionText, setActionText] = useState("")
  const insights = useMemo(() => {
    const insights: Insight[] = []
    
    // Análise de performance vs histórico
    const completedCultivations = allCultivations.filter(c => c.status === "completed")
    if (completedCultivations.length > 0) {
      const avgProfit = completedCultivations.reduce((sum, c) => sum + c.profit_brl, 0) / completedCultivations.length
      const avgYield = completedCultivations.reduce((sum, c) => sum + c.yield_g, 0) / completedCultivations.length
      
      // Insight de performance superior
      if (cultivation.profit_brl > avgProfit * 1.2) {
        insights.push({
          id: "high_performance",
          type: "success",
          title: "Performance Excepcional",
          description: `Este cultivo teve lucro ${((cultivation.profit_brl / avgProfit - 1) * 100).toFixed(0)}% acima da média histórica.`,
          impact: "high",
          actionable: true,
          recommendation: "Documente as técnicas utilizadas para replicar em futuros cultivos.",
          confidence: 95
        })
      }
      
      // Insight de baixa performance
      if (cultivation.profit_brl < avgProfit * 0.8 && cultivation.status === "completed") {
        insights.push({
          id: "low_performance",
          type: "warning",
          title: "Performance Abaixo da Média",
          description: `Este cultivo teve lucro ${((1 - cultivation.profit_brl / avgProfit) * 100).toFixed(0)}% abaixo da média histórica.`,
          impact: "high",
          actionable: true,
          recommendation: "Analise os eventos registrados para identificar possíveis causas.",
          confidence: 90
        })
      }
    }

    // Análise de duração
    if (cultivation.durationDays > 0) {
      const efficiency = cultivation.yield_g / cultivation.durationDays
      
      if (efficiency > 2.5) {
        insights.push({
          id: "high_efficiency",
          type: "success",
          title: "Alta Eficiência Temporal",
          description: `Excelente eficiência de ${efficiency.toFixed(2)}g/dia. Ciclo otimizado.`,
          impact: "medium",
          actionable: false,
          confidence: 85
        })
      }
      
      if (cultivation.durationDays > 150 && cultivation.status === "active") {
        insights.push({
          id: "long_cycle",
          type: "warning",
          title: "Ciclo Prolongado",
          description: "Este cultivo está durando mais que o esperado. Considere avaliar as condições.",
          impact: "medium",
          actionable: true,
          recommendation: "Verifique se as plantas estão prontas para colheita ou se há algum problema.",
          confidence: 75
        })
      }
    }

    // Análise de eventos
    const irrigationEvents = events.filter(e => e.type === "irrigation")
    const fertilizationEvents = events.filter(e => e.type === "fertilization")
    
    if (irrigationEvents.length > 0) {
      const avgDaysBetweenIrrigation = cultivation.durationDays / irrigationEvents.length
      
      if (avgDaysBetweenIrrigation > 7) {
        insights.push({
          id: "irrigation_frequency",
          type: "opportunity",
          title: "Frequência de Irrigação",
          description: `Média de ${avgDaysBetweenIrrigation.toFixed(1)} dias entre irrigações. Pode ser otimizada.`,
          impact: "medium",
          actionable: true,
          recommendation: "Considere irrigações mais frequentes para melhor desenvolvimento.",
          confidence: 70
        })
      }
    }

    // Análise de problemas
    if (cultivation.hasSevereProblems) {
      insights.push({
        id: "problem_recovery",
        type: "opportunity",
        title: "Recuperação de Problemas",
        description: "Este cultivo teve problemas graves mas ainda pode ser recuperado.",
        impact: "high",
        actionable: true,
        recommendation: "Implemente medidas corretivas imediatamente e monitore de perto.",
        confidence: 80
      })
    }

    // Previsões para cultivos ativos
    if (cultivation.status === "active" && completedCultivations.length > 0) {
      const similarCultivations = completedCultivations.filter(c => 
        c.seedStrain === cultivation.seedStrain
      )
      
      if (similarCultivations.length > 0) {
        const avgDuration = similarCultivations.reduce((sum, c) => sum + c.durationDays, 0) / similarCultivations.length
        const avgYield = similarCultivations.reduce((sum, c) => sum + c.yield_g, 0) / similarCultivations.length
        const avgProfit = similarCultivations.reduce((sum, c) => sum + c.profit_brl, 0) / similarCultivations.length
        
        const daysRemaining = Math.max(0, avgDuration - cultivation.durationDays)
        
        insights.push({
          id: "yield_prediction",
          type: "prediction",
          title: "Previsão de Rendimento",
          description: `Baseado em cultivos similares, rendimento esperado: ${avgYield.toFixed(0)}g`,
          impact: "medium",
          actionable: false,
          confidence: 75
        })
        
        if (daysRemaining > 0) {
          insights.push({
            id: "harvest_prediction",
            type: "prediction",
            title: "Previsão de Colheita",
            description: `Estimativa: ${daysRemaining} dias restantes para colheita`,
            impact: "low",
            actionable: true,
            recommendation: "Prepare-se para a fase de colheita e secagem.",
            confidence: 65
          })
        }
      }
    }

    // Análise de sazonalidade
    const startMonth = new Date(cultivation.startDate).getMonth()
    const seasonalCultivations = completedCultivations.filter(c => 
      new Date(c.startDate).getMonth() === startMonth
    )
    
    if (seasonalCultivations.length >= 2) {
      const seasonalAvgProfit = seasonalCultivations.reduce((sum, c) => sum + c.profit_brl, 0) / seasonalCultivations.length
      const allAvgProfit = completedCultivations.reduce((sum, c) => sum + c.profit_brl, 0) / completedCultivations.length
      
      if (seasonalAvgProfit > allAvgProfit * 1.1) {
        insights.push({
          id: "seasonal_advantage",
          type: "success",
          title: "Vantagem Sazonal",
          description: `Cultivos iniciados neste período tendem a ser ${((seasonalAvgProfit / allAvgProfit - 1) * 100).toFixed(0)}% mais lucrativos.`,
          impact: "medium",
          actionable: true,
          recommendation: "Considere planejar mais cultivos neste período do ano.",
          confidence: 80
        })
      }
    }

    return insights.sort((a, b) => {
      const impactOrder = { high: 3, medium: 2, low: 1 }
      return impactOrder[b.impact] - impactOrder[a.impact]
    })
  }, [cultivation, events, allCultivations])

  const getInsightIcon = (type: string) => {
    switch (type) {
      case "success": return <Award className="h-4 w-4 text-green-500" />
      case "warning": return <AlertTriangle className="h-4 w-4 text-yellow-500" />
      case "opportunity": return <Target className="h-4 w-4 text-blue-500" />
      case "prediction": return <Brain className="h-4 w-4 text-purple-500" />
      default: return <Lightbulb className="h-4 w-4 text-gray-500" />
    }
  }

  const getInsightColor = (type: string) => {
    switch (type) {
      case "success": return "border-green-200 bg-green-50"
      case "warning": return "border-yellow-200 bg-yellow-50"
      case "opportunity": return "border-blue-200 bg-blue-50"
      case "prediction": return "border-purple-200 bg-purple-50"
      default: return "border-gray-200 bg-gray-50"
    }
  }

  const getImpactBadge = (impact: string) => {
    const colors = {
      high: "bg-red-100 text-red-800",
      medium: "bg-yellow-100 text-yellow-800",
      low: "bg-green-100 text-green-800"
    }
    
    return (
      <Badge className={colors[impact as keyof typeof colors]}>
        {impact === "high" ? "Alto Impacto" : 
         impact === "medium" ? "Médio Impacto" : 
         "Baixo Impacto"}
      </Badge>
    )
  }

  if (insights.length === 0) {
    return (
      <Card className="shadow-sm">
        <CardContent className="pt-6">
          <div className="text-center py-8 text-muted-foreground">
            <Brain className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>Coletando dados para gerar insights...</p>
            <p className="text-sm">Complete mais eventos e cultivos para receber análises inteligentes.</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="shadow-sm">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Lightbulb className="h-5 w-5 text-yellow-500" />
          Insights Inteligentes
          <Badge variant="secondary" className="ml-auto">
            {insights.length} insights
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {insights.map((insight) => (
            <Card key={insight.id} className={`border ${getInsightColor(insight.type)}`}>
              <CardContent className="pt-4">
                <div className="space-y-3">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-2">
                      {getInsightIcon(insight.type)}
                      <h4 className="font-medium text-sm">{insight.title}</h4>
                    </div>
                    <div className="flex items-center gap-2">
                      {getImpactBadge(insight.impact)}
                      <Badge variant="outline" className="text-xs">
                        {insight.confidence}% confiança
                      </Badge>
                    </div>
                  </div>
                  
                  <p className="text-sm text-muted-foreground">
                    {insight.description}
                  </p>
                  
                  {insight.recommendation && (
                    <div className="p-3 bg-white/50 rounded-lg border border-dashed">
                      <div className="flex items-start gap-2">
                        <Zap className="h-4 w-4 text-blue-500 mt-0.5 flex-shrink-0" />
                        <div>
                          <p className="text-sm font-medium text-blue-800 mb-1">
                            Recomendação:
                          </p>
                          <p className="text-sm text-blue-700">
                            {insight.recommendation}
                          </p>
                        </div>
                      </div>
                    </div>
                  )}
                  
                  {insight.actionable && (
                    <div className="flex justify-end">
                      <Button size="sm" variant="outline" className="text-xs" onClick={() => { setShowActionModal(insight); setActionText("") }}>
                        <Target className="h-3 w-3 mr-1" />
                        Criar Ação
                      </Button>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
        
        {/* Resumo de Insights */}
        <Card className="mt-6 bg-gradient-to-r from-blue-50 to-purple-50 border-blue-200">
          <CardContent className="pt-4">
            <div className="flex items-center gap-2 mb-3">
              <BarChart3 className="h-4 w-4 text-blue-600" />
              <h4 className="font-medium text-blue-800">Resumo de Análise</h4>
            </div>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
              <div>
                <div className="text-2xl font-bold text-green-600">
                  {insights.filter(i => i.type === "success").length}
                </div>
                <div className="text-xs text-muted-foreground">Sucessos</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-yellow-600">
                  {insights.filter(i => i.type === "warning").length}
                </div>
                <div className="text-xs text-muted-foreground">Alertas</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-blue-600">
                  {insights.filter(i => i.type === "opportunity").length}
                </div>
                <div className="text-xs text-muted-foreground">Oportunidades</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-purple-600">
                  {insights.filter(i => i.type === "prediction").length}
                </div>
                <div className="text-xs text-muted-foreground">Previsões</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </CardContent>

      {/* Modal de ação */}
      {showActionModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-bold mb-2">Criar Ação para: {showActionModal.title}</h3>
            <p className="text-sm text-muted-foreground mb-4">{showActionModal.recommendation || showActionModal.description}</p>
            <textarea
              className="w-full border rounded p-2 mb-4"
              rows={3}
              placeholder="Descreva a ação a ser tomada..."
              value={actionText}
              onChange={e => setActionText(e.target.value)}
            />
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setShowActionModal(null)}>Cancelar</Button>
              <Button onClick={() => { setShowActionModal(null); setActionText(""); /* Aqui você pode salvar a ação */ }}>Salvar</Button>
            </div>
          </div>
        </div>
      )}
    </Card>
  )
}