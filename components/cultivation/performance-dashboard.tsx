"use client"

import { useMemo } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { 
  TrendingUp, 
  TrendingDown, 
  Target, 
  DollarSign, 
  Leaf, 
  Clock, 
  AlertTriangle,
  Award,
  BarChart3,
  Calendar,
  Zap
} from "lucide-react"
import type { CultivationSummary } from "@/lib/mock-data"
import { AgronomicLineChart, AgronomicDataPoint } from "@/components/charts/agronomic-line-chart"

interface PerformanceDashboardProps {
  cultivation: CultivationSummary
  allCultivations: CultivationSummary[]
}

interface PerformanceMetric {
  label: string
  value: number
  unit: string
  benchmark: number
  status: "excellent" | "good" | "average" | "poor"
  trend: "up" | "down" | "stable"
  icon: React.ComponentType<{ className?: string }>
}

export function PerformanceDashboard({ cultivation, allCultivations, events }: PerformanceDashboardProps & { events: any[] }) {
  const formatCurrency = (value: number) =>
    new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(value)

  // Calcular benchmarks baseados no histórico
  const benchmarks = useMemo(() => {
    const completed = allCultivations.filter(c => c.status === "completed")
    if (completed.length === 0) return null

    return {
      avgProfit: completed.reduce((sum, c) => sum + c.profit_brl, 0) / completed.length,
      avgYield: completed.reduce((sum, c) => sum + c.yield_g, 0) / completed.length,
      avgDuration: completed.reduce((sum, c) => sum + c.durationDays, 0) / completed.length,
      avgEfficiency: completed.reduce((sum, c) => sum + (c.yield_g / c.durationDays), 0) / completed.length,
      maxProfit: Math.max(...completed.map(c => c.profit_brl)),
      maxYield: Math.max(...completed.map(c => c.yield_g)),
      minDuration: Math.min(...completed.map(c => c.durationDays))
    }
  }, [allCultivations])

  // Calcular métricas de performance
  const metrics: PerformanceMetric[] = useMemo(() => {
    if (!benchmarks) return []

    const efficiency = cultivation.durationDays > 0 ? cultivation.yield_g / cultivation.durationDays : 0
    const profitPerDay = cultivation.durationDays > 0 ? cultivation.profit_brl / cultivation.durationDays : 0
    const roi = cultivation.profit_brl > 0 ? (cultivation.profit_brl / 1000) * 100 : 0 // Assumindo investimento base

    const getStatus = (value: number, benchmark: number, higherIsBetter = true): "excellent" | "good" | "average" | "poor" => {
      const ratio = higherIsBetter ? value / benchmark : benchmark / value
      if (ratio >= 1.2) return "excellent"
      if (ratio >= 1.1) return "good"
      if (ratio >= 0.9) return "average"
      return "poor"
    }

    return [
      {
        label: "Lucro Total",
        value: cultivation.profit_brl,
        unit: "R$",
        benchmark: benchmarks.avgProfit,
        status: getStatus(cultivation.profit_brl, benchmarks.avgProfit),
        trend: cultivation.profit_brl > benchmarks.avgProfit ? "up" : "down",
        icon: DollarSign
      },
      {
        label: "Rendimento",
        value: cultivation.yield_g,
        unit: "g",
        benchmark: benchmarks.avgYield,
        status: getStatus(cultivation.yield_g, benchmarks.avgYield),
        trend: cultivation.yield_g > benchmarks.avgYield ? "up" : "down",
        icon: Leaf
      },
      {
        label: "Eficiência",
        value: efficiency,
        unit: "g/dia",
        benchmark: benchmarks.avgEfficiency,
        status: getStatus(efficiency, benchmarks.avgEfficiency),
        trend: efficiency > benchmarks.avgEfficiency ? "up" : "down",
        icon: Zap
      },
      {
        label: "Duração",
        value: cultivation.durationDays,
        unit: "dias",
        benchmark: benchmarks.avgDuration,
        status: getStatus(cultivation.durationDays, benchmarks.avgDuration, false),
        trend: cultivation.durationDays < benchmarks.avgDuration ? "up" : "down",
        icon: Clock
      },
      {
        label: "ROI Estimado",
        value: roi,
        unit: "%",
        benchmark: 50, // 50% como benchmark padrão
        status: getStatus(roi, 50),
        trend: roi > 50 ? "up" : "down",
        icon: Target
      },
      {
        label: "Lucro/Dia",
        value: profitPerDay,
        unit: "R$/dia",
        benchmark: benchmarks.avgProfit / benchmarks.avgDuration,
        status: getStatus(profitPerDay, benchmarks.avgProfit / benchmarks.avgDuration),
        trend: profitPerDay > (benchmarks.avgProfit / benchmarks.avgDuration) ? "up" : "down",
        icon: BarChart3
      }
    ]
  }, [cultivation, benchmarks])

  // Extrair dados agronômicos dos eventos
  const agronomicData: AgronomicDataPoint[] = useMemo(() => {
    return events
      .filter(ev => ev.details && (ev.details.ph || ev.details.ec || ev.details.temperatura))
      .map(ev => ({
        date: ev.date,
        ph: Number(ev.details.ph) || 0,
        ec: Number(ev.details.ec) || 0,
        temperature_c: Number(ev.details.temperatura) || 0,
      }))
      .filter(d => d.ph !== 0 || d.ec !== 0 || d.temperature_c !== 0)
  }, [events])

  // Sempre renderizar o gráfico de linha
  const agronomicChartCard = (
    <Card className="shadow-sm mb-6">
      <CardHeader>
        <CardTitle>Parâmetros do Cultivo (pH, EC, Temperatura)</CardTitle>
      </CardHeader>
      <CardContent>
        {agronomicData.length > 0 ? (
          <AgronomicLineChart data={agronomicData} />
        ) : (
          <div className="text-center text-muted-foreground">Nenhum dado de pH, EC ou temperatura registrado nos eventos.</div>
        )}
      </CardContent>
    </Card>
  )

  const getStatusColor = (status: string) => {
    switch (status) {
      case "excellent": return "text-green-600 bg-green-50 border-green-200"
      case "good": return "text-blue-600 bg-blue-50 border-blue-200"
      case "average": return "text-yellow-600 bg-yellow-50 border-yellow-200"
      case "poor": return "text-red-600 bg-red-50 border-red-200"
      default: return "text-gray-600 bg-gray-50 border-gray-200"
    }
  }

  const getStatusLabel = (status: string) => {
    switch (status) {
      case "excellent": return "Excelente"
      case "good": return "Bom"
      case "average": return "Médio"
      case "poor": return "Ruim"
      default: return "N/A"
    }
  }

  const overallScore = metrics.length > 0 
    ? metrics.reduce((sum, metric) => {
        const scores = { excellent: 4, good: 3, average: 2, poor: 1 }
        return sum + scores[metric.status]
      }, 0) / metrics.length
    : 0

  const getOverallStatus = (score: number) => {
    if (score >= 3.5) return { label: "Excelente", color: "text-green-600", bg: "bg-green-50" }
    if (score >= 2.5) return { label: "Bom", color: "text-blue-600", bg: "bg-blue-50" }
    if (score >= 1.5) return { label: "Médio", color: "text-yellow-600", bg: "bg-yellow-50" }
    return { label: "Precisa Melhorar", color: "text-red-600", bg: "bg-red-50" }
  }

  const overallStatus = getOverallStatus(overallScore)

  if (!benchmarks) {
    return (
      <div className="space-y-6">
        {agronomicChartCard}
        <Card className="shadow-sm">
          <CardContent className="pt-6">
            <div className="text-center py-8 text-muted-foreground">
              <BarChart3 className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>Dados insuficientes para análise de performance.</p>
              <p className="text-sm">Complete mais cultivos para ver insights detalhados.</p>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {agronomicChartCard}
      {/* Score Geral */}
      <Card className={`shadow-sm border-2 ${overallStatus.bg} border-opacity-50`}>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Award className={`h-5 w-5 ${overallStatus.color}`} />
              Performance Geral
            </CardTitle>
            <Badge className={`${overallStatus.color} ${overallStatus.bg}`}>
              {overallStatus.label}
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4">
            <div className="flex-1">
              <div className="flex justify-between text-sm mb-2">
                <span>Score de Performance</span>
                <span className="font-medium">{(overallScore * 25).toFixed(0)}/100</span>
              </div>
              <Progress value={overallScore * 25} className="h-3" />
            </div>
            <div className={`text-3xl font-bold ${overallStatus.color}`}>
              {(overallScore * 25).toFixed(0)}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Métricas Detalhadas */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {metrics.map((metric, index) => {
          const Icon = metric.icon
          const TrendIcon = metric.trend === "up" ? TrendingUp : 
                           metric.trend === "down" ? TrendingDown : 
                           Clock
          const percentage = metric.benchmark > 0 ? (metric.value / metric.benchmark) * 100 : 0

          return (
            <Card key={index} className={`shadow-sm border ${getStatusColor(metric.status)}`}>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Icon className="h-4 w-4" />
                    <span className="text-sm font-medium">{metric.label}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <TrendIcon className={`h-3 w-3 ${
                      metric.trend === "up" ? "text-green-500" : 
                      metric.trend === "down" ? "text-red-500" : 
                      "text-gray-500"
                    }`} />
                    <Badge variant="secondary" className="text-xs">
                      {getStatusLabel(metric.status)}
                    </Badge>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="text-2xl font-bold">
                    {metric.unit === "R$" ? formatCurrency(metric.value) : 
                     `${metric.value.toFixed(metric.unit === "%" ? 1 : 2)}${metric.unit}`}
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex justify-between text-xs">
                      <span>vs. Média Histórica</span>
                      <span className={percentage >= 100 ? "text-green-600" : "text-red-600"}>
                        {percentage.toFixed(0)}%
                      </span>
                    </div>
                    <Progress value={Math.min(percentage, 200)} className="h-2" />
                  </div>

                  <div className="text-xs text-muted-foreground">
                    Benchmark: {metric.unit === "R$" ? formatCurrency(metric.benchmark) : 
                               `${metric.benchmark.toFixed(2)}${metric.unit}`}
                  </div>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>
    </div>
  )
}