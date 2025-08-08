"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { X, TrendingUp, TrendingDown, Target, Calendar, DollarSign, Leaf, Clock, Award, BarChart3 } from "lucide-react"
import type { CultivationSummary } from "@/lib/mock-data"

interface CultivationComparisonProps {
  cultivations: CultivationSummary[]
  selectedIds: string[]
  onClose: () => void
}

export function CultivationComparison({ cultivations, selectedIds, onClose }: CultivationComparisonProps) {
  const [selectedMetric, setSelectedMetric] = useState<"profit" | "yield" | "duration" | "efficiency">("profit")
  
  const selectedCultivations = cultivations.filter(c => selectedIds.includes(c.id))
  
  const formatCurrency = (value: number) =>
    new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(value)

  const getMetricValue = (cultivation: CultivationSummary, metric: string) => {
    switch (metric) {
      case "profit":
        return cultivation.profit_brl
      case "yield":
        return cultivation.yield_g
      case "duration":
        return cultivation.durationDays
      case "efficiency":
        return cultivation.yield_g > 0 && cultivation.durationDays > 0 
          ? cultivation.yield_g / cultivation.durationDays 
          : 0
      default:
        return 0
    }
  }

  const getMetricLabel = (metric: string) => {
    switch (metric) {
      case "profit":
        return "Lucro (R$)"
      case "yield":
        return "Rendimento (g)"
      case "duration":
        return "Duração (dias)"
      case "efficiency":
        return "Eficiência (g/dia)"
      default:
        return ""
    }
  }

  const getMetricIcon = (metric: string) => {
    switch (metric) {
      case "profit":
        return <DollarSign className="h-4 w-4" />
      case "yield":
        return <Leaf className="h-4 w-4" />
      case "duration":
        return <Clock className="h-4 w-4" />
      case "efficiency":
        return <Target className="h-4 w-4" />
      default:
        return <BarChart3 className="h-4 w-4" />
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200"
      case "completed":
        return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
      case "archived":
        return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const getStatusLabel = (status: string) => {
    switch (status) {
      case "active":
        return "Ativo"
      case "completed":
        return "Concluído"
      case "archived":
        return "Arquivado"
      default:
        return status
    }
  }

  if (selectedCultivations.length === 0) {
    return null
  }

  const maxValue = Math.max(...selectedCultivations.map(c => getMetricValue(c, selectedMetric)))
  const minValue = Math.min(...selectedCultivations.map(c => getMetricValue(c, selectedMetric)))

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
      <div className="bg-white dark:bg-zinc-900 rounded-lg shadow-xl p-6 w-full max-w-6xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold">Comparação de Cultivos</h2>
            <p className="text-muted-foreground">
              Comparando {selectedCultivations.length} cultivos selecionados
            </p>
          </div>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="h-5 w-5" />
          </Button>
        </div>

        {/* Seletor de Métrica */}
        <div className="flex gap-2 mb-6">
          {[
            { key: "profit", label: "Lucro" },
            { key: "yield", label: "Rendimento" },
            { key: "duration", label: "Duração" },
            { key: "efficiency", label: "Eficiência" }
          ].map((metric) => (
            <Button
              key={metric.key}
              variant={selectedMetric === metric.key ? "default" : "outline"}
              size="sm"
              onClick={() => setSelectedMetric(metric.key as any)}
            >
              {getMetricIcon(metric.key)}
              <span className="ml-2">{metric.label}</span>
            </Button>
          ))}
        </div>

        {/* Cards de Comparação */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {selectedCultivations.map((cultivation) => {
            const metricValue = getMetricValue(cultivation, selectedMetric)
            const percentage = maxValue > 0 ? (metricValue / maxValue) * 100 : 0
            const isBest = metricValue === maxValue
            const isWorst = metricValue === minValue

            return (
              <Card key={cultivation.id} className={`shadow-sm ${isBest ? 'ring-2 ring-green-500' : ''}`}>
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg">{cultivation.name}</CardTitle>
                    {isBest && <Award className="h-5 w-5 text-green-500" />}
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge className={getStatusColor(cultivation.status)}>
                      {getStatusLabel(cultivation.status)}
                    </Badge>
                    <span className="text-sm text-muted-foreground">
                      {cultivation.seedStrain}
                    </span>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Métrica Principal */}
                  <div className="text-center">
                    <div className="text-3xl font-bold text-primary">
                      {selectedMetric === "profit" 
                        ? formatCurrency(metricValue)
                        : selectedMetric === "efficiency"
                        ? `${metricValue.toFixed(2)} g/dia`
                        : `${metricValue}${selectedMetric === "yield" ? "g" : " dias"}`
                      }
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {getMetricLabel(selectedMetric)}
                    </div>
                  </div>

                  {/* Barra de Progresso */}
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Progresso</span>
                      <span>{percentage.toFixed(1)}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className={`h-2 rounded-full transition-all ${
                          isBest ? 'bg-green-500' : 
                          isWorst ? 'bg-red-500' : 
                          'bg-blue-500'
                        }`}
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                  </div>

                  {/* Métricas Secundárias */}
                  <div className="grid grid-cols-2 gap-3 text-sm">
                    <div className="text-center p-2 bg-muted rounded">
                      <div className="font-medium">{formatCurrency(cultivation.profit_brl)}</div>
                      <div className="text-xs text-muted-foreground">Lucro</div>
                    </div>
                    <div className="text-center p-2 bg-muted rounded">
                      <div className="font-medium">{cultivation.yield_g}g</div>
                      <div className="text-xs text-muted-foreground">Rendimento</div>
                    </div>
                    <div className="text-center p-2 bg-muted rounded">
                      <div className="font-medium">{cultivation.durationDays}</div>
                      <div className="text-xs text-muted-foreground">Dias</div>
                    </div>
                    <div className="text-center p-2 bg-muted rounded">
                      <div className="font-medium">
                        {cultivation.yield_g > 0 && cultivation.durationDays > 0 
                          ? (cultivation.yield_g / cultivation.durationDays).toFixed(2)
                          : "0"
                        }
                      </div>
                      <div className="text-xs text-muted-foreground">g/dia</div>
                    </div>
                  </div>

                  {/* Período */}
                  <div className="text-center text-sm text-muted-foreground">
                    <Calendar className="h-4 w-4 inline mr-1" />
                    {new Date(cultivation.startDate).toLocaleDateString("pt-BR")} -{" "}
                    {cultivation.endDate 
                      ? new Date(cultivation.endDate).toLocaleDateString("pt-BR")
                      : "Em andamento"
                    }
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>

        {/* Resumo Comparativo */}
        <Card className="mt-6">
          <CardHeader>
            <CardTitle>Resumo Comparativo</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">
                  {formatCurrency(Math.max(...selectedCultivations.map(c => c.profit_brl)))}
                </div>
                <div className="text-sm text-muted-foreground">Maior Lucro</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">
                  {Math.max(...selectedCultivations.map(c => c.yield_g))}g
                </div>
                <div className="text-sm text-muted-foreground">Maior Rendimento</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-600">
                  {Math.min(...selectedCultivations.map(c => c.durationDays))} dias
                </div>
                <div className="text-sm text-muted-foreground">Ciclo Mais Rápido</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
} 