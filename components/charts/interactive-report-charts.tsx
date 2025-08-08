"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  Leaf, 
  Target, 
  Calendar,
  BarChart3,
  PieChart,
  Activity,
  Zap,
  Clock,
  AlertTriangle
} from "lucide-react"

interface CultivationData {
  id: string
  name: string
  startDate: string
  endDate: string | null
  yield_g: number
  profit_brl: number
  status: "active" | "completed" | "archived"
  seedStrain: string
  durationDays: number
  hasSevereProblems: boolean
}

interface RealMetrics {
  totalProfit: number
  totalYield: number
  avgEfficiency: number
  completedCultivations: number
  activeCultivations: number
  avgDuration: number
  successRate: number
}

interface InteractiveReportChartsProps {
  cultivations: CultivationData[]
  realMetrics: RealMetrics
  results?: any
  setupParams?: any
  cycleParams?: any
  marketParams?: any
}

export function InteractiveReportCharts({ cultivations, realMetrics, results, setupParams, cycleParams, marketParams }: InteractiveReportChartsProps) {
  const [selectedMetric, setSelectedMetric] = useState<string>("profit")
  const [timeframe, setTimeframe] = useState<string>("monthly")
  const [drillDownLevel, setDrillDownLevel] = useState<number>(0)

  const formatCurrency = (value: number) =>
    new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(value)

  // Dados reais dos cultivos para os gráficos
  const profitData = cultivations.length > 0 ? cultivations
    .filter(c => c.status === "completed")
    .map((cultivation, index) => ({
      month: new Date(cultivation.startDate).toLocaleDateString("pt-BR", { month: "short" }),
      profit: cultivation.profit_brl,
      cost: cultivation.profit_brl * 0.3, // Estimativa de custos
      revenue: cultivation.profit_brl * 1.3, // Estimativa de receita
      yield: cultivation.yield_g,
      efficiency: cultivation.durationDays > 0 ? cultivation.yield_g / cultivation.durationDays : 0
    })) : [
      { month: "Sem dados", profit: 0, cost: 0, revenue: 0, yield: 0, efficiency: 0 }
    ]

  const efficiencyData = [
    { metric: "Taxa Sucesso", value: realMetrics.successRate, target: 80, status: realMetrics.successRate >= 80 ? "excellent" : realMetrics.successRate >= 60 ? "good" : "warning" },
    { metric: "Eficiência g/dia", value: realMetrics.avgEfficiency, target: 2.0, status: realMetrics.avgEfficiency >= 2.0 ? "excellent" : realMetrics.avgEfficiency >= 1.5 ? "good" : "warning" },
    { metric: "Cultivos Concluídos", value: realMetrics.completedCultivations, target: 3, status: realMetrics.completedCultivations >= 3 ? "excellent" : realMetrics.completedCultivations >= 1 ? "good" : "warning" },
    { metric: "Duração Média", value: realMetrics.avgDuration, target: 120, status: realMetrics.avgDuration <= 120 ? "excellent" : realMetrics.avgDuration <= 150 ? "good" : "warning" },
  ]

  const costBreakdown = cultivations.length > 0 ? [
    { category: "Cultivos Concluídos", value: realMetrics.completedCultivations, percentage: (realMetrics.completedCultivations / (realMetrics.completedCultivations + realMetrics.activeCultivations)) * 100 },
    { category: "Cultivos Ativos", value: realMetrics.activeCultivations, percentage: (realMetrics.activeCultivations / (realMetrics.completedCultivations + realMetrics.activeCultivations)) * 100 },
    { category: "Lucro Total", value: realMetrics.totalProfit, percentage: realMetrics.totalProfit > 0 ? 100 : 0 },
    { category: "Rendimento Total", value: realMetrics.totalYield, percentage: realMetrics.totalYield > 0 ? 100 : 0 },
  ] : [
    { category: "Sem dados", value: 0, percentage: 0 },
  ]

  const getStatusColor = (status: string) => {
    switch (status) {
      case "excellent": return "text-green-600 bg-green-100"
      case "good": return "text-blue-600 bg-blue-100"
      case "warning": return "text-yellow-600 bg-yellow-100"
      case "poor": return "text-red-600 bg-red-100"
      default: return "text-gray-600 bg-gray-100"
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "excellent": return <TrendingUp className="h-4 w-4" />
      case "good": return <Target className="h-4 w-4" />
      case "warning": return <AlertTriangle className="h-4 w-4" />
      case "poor": return <TrendingDown className="h-4 w-4" />
      default: return <Activity className="h-4 w-4" />
    }
  }

  return (
    <div className="space-y-6">
      {/* Controles Interativos */}
      <Card className="shadow-sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5" />
            Controles de Visualização
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-4">
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium">Métrica:</span>
              <select 
                value={selectedMetric} 
                onChange={(e) => setSelectedMetric(e.target.value)}
                className="border rounded px-3 py-1 text-sm"
              >
                <option value="profit">Lucro</option>
                <option value="efficiency">Eficiência</option>
                <option value="costs">Custos</option>
                <option value="roi">ROI</option>
              </select>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium">Período:</span>
              <select 
                value={timeframe} 
                onChange={(e) => setTimeframe(e.target.value)}
                className="border rounded px-3 py-1 text-sm"
              >
                <option value="monthly">Mensal</option>
                <option value="quarterly">Trimestral</option>
                <option value="yearly">Anual</option>
              </select>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setDrillDownLevel(prev => Math.max(0, prev - 1))}
              disabled={drillDownLevel === 0}
            >
              Voltar
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setDrillDownLevel(prev => prev + 1)}
              disabled={drillDownLevel >= 2}
            >
              Detalhar
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Gráficos Interativos */}
      <Tabs defaultValue="profit" className="space-y-4">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="profit" className="flex items-center gap-2">
            <DollarSign className="h-4 w-4" />
            Lucro
          </TabsTrigger>
          <TabsTrigger value="efficiency" className="flex items-center gap-2">
            <Zap className="h-4 w-4" />
            Eficiência
          </TabsTrigger>
          <TabsTrigger value="costs" className="flex items-center gap-2">
            <PieChart className="h-4 w-4" />
            Custos
          </TabsTrigger>
          <TabsTrigger value="timeline" className="flex items-center gap-2">
            <Activity className="h-4 w-4" />
            Timeline
          </TabsTrigger>
        </TabsList>

        <TabsContent value="profit" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Gráfico de Lucro */}
            <Card className="shadow-sm">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5 text-green-600" />
                  Evolução do Lucro
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {profitData.map((item, index) => (
                    <div key={index} className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="font-medium">{item.month}</span>
                        <span className="text-green-600 font-bold">
                          {formatCurrency(item.profit)}
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-green-500 h-2 rounded-full transition-all"
                          style={{ width: `${(item.profit / 5000) * 100}%` }}
                        />
                      </div>
                      <div className="flex justify-between text-xs text-muted-foreground">
                        <span>Receita: {formatCurrency(item.revenue)}</span>
                        <span>Custo: {formatCurrency(item.cost)}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Métricas de Lucro */}
            <Card className="shadow-sm">
              <CardHeader>
                <CardTitle>Métricas de Lucratividade</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="text-center p-4 bg-green-50 rounded-lg">
                      <div className="text-2xl font-bold text-green-600">
                        {results.roi_investimento_1_ano.toFixed(1)}%
                      </div>
                      <div className="text-sm text-muted-foreground">ROI Anual</div>
                    </div>
                    <div className="text-center p-4 bg-blue-50 rounded-lg">
                      <div className="text-2xl font-bold text-blue-600">
                        {results.periodo_payback_ciclos.toFixed(1)}
                      </div>
                      <div className="text-sm text-muted-foreground">Ciclos Payback</div>
                    </div>
                  </div>
                  <div className="p-4 bg-muted rounded-lg">
                    <div className="text-sm font-medium mb-2">Análise de Viabilidade</div>
                    <div className="text-sm text-muted-foreground">
                      {results.roi_investimento_1_ano > 20 
                        ? "✅ Projeto altamente viável com excelente retorno"
                        : results.roi_investimento_1_ano > 10
                        ? "⚠️ Projeto viável, considere otimizações"
                        : "❌ Projeto requer revisão de parâmetros"
                      }
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="efficiency" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Gráfico de Eficiência */}
            <Card className="shadow-sm">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Zap className="h-5 w-5 text-blue-600" />
                  Indicadores de Eficiência
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {efficiencyData.map((item, index) => (
                    <div key={index} className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="font-medium">{item.metric}</span>
                        <div className="flex items-center gap-2">
                          <span className="font-bold">{item.value}</span>
                          <Badge className={getStatusColor(item.status)}>
                            {getStatusIcon(item.status)}
                          </Badge>
                        </div>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div 
                          className={`h-2 rounded-full transition-all ${
                            item.status === "excellent" ? "bg-green-500" :
                            item.status === "good" ? "bg-blue-500" :
                            item.status === "warning" ? "bg-yellow-500" :
                            "bg-red-500"
                          }`}
                          style={{ width: `${Math.min(100, (item.value / item.target) * 100)}%` }}
                        />
                      </div>
                      <div className="text-xs text-muted-foreground">
                        Meta: {item.target} | Atual: {item.value}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Análise de Performance */}
            <Card className="shadow-sm">
              <CardHeader>
                <CardTitle>Análise de Performance</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="p-4 bg-blue-50 rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                      <Target className="h-4 w-4 text-blue-600" />
                      <span className="font-medium">Eficiência Energética</span>
                    </div>
                    <div className="text-2xl font-bold text-blue-600">
                      {results.gramas_por_watt.toFixed(2)} g/W
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {results.gramas_por_watt > 1.0 
                        ? "Excelente eficiência energética"
                        : results.gramas_por_watt > 0.7
                        ? "Boa eficiência energética"
                        : "Eficiência pode ser melhorada"
                      }
                    </div>
                  </div>
                  
                  <div className="p-4 bg-green-50 rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                      <Leaf className="h-4 w-4 text-green-600" />
                      <span className="font-medium">Produtividade</span>
                    </div>
                    <div className="text-2xl font-bold text-green-600">
                      {cycleParams.producao_por_planta_g}g/planta
                    </div>
                    <div className="text-sm text-muted-foreground">
                      Produção média por planta no ciclo
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="costs" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Breakdown de Custos */}
            <Card className="shadow-sm">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <PieChart className="h-5 w-5 text-purple-600" />
                  Distribuição de Custos
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {costBreakdown.map((item, index) => (
                    <div key={index} className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="font-medium">{item.category}</span>
                        <span className="font-bold">{formatCurrency(item.value)}</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-purple-500 h-2 rounded-full transition-all"
                          style={{ width: `${item.percentage}%` }}
                        />
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {item.percentage}% do investimento total
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Análise de Custos */}
            <Card className="shadow-sm">
              <CardHeader>
                <CardTitle>Análise de Investimento</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="text-center p-4 bg-purple-50 rounded-lg">
                      <div className="text-2xl font-bold text-purple-600">
                        {formatCurrency(setupParams.custo_equip_iluminacao + setupParams.custo_tenda_estrutura)}
                      </div>
                      <div className="text-sm text-muted-foreground">Investimento Total</div>
                    </div>
                    <div className="text-center p-4 bg-orange-50 rounded-lg">
                      <div className="text-2xl font-bold text-orange-600">
                        {formatCurrency(results.lucro_liquido_ciclo)}
                      </div>
                      <div className="text-sm text-muted-foreground">Lucro por Ciclo</div>
                    </div>
                  </div>
                  <div className="p-4 bg-muted rounded-lg">
                    <div className="text-sm font-medium mb-2">Recomendação de Investimento</div>
                    <div className="text-sm text-muted-foreground">
                      {results.lucro_liquido_ciclo > 3000 
                        ? "✅ Investimento recomendado - alto retorno esperado"
                        : results.lucro_liquido_ciclo > 1500
                        ? "⚠️ Investimento moderado - avaliar otimizações"
                        : "❌ Revisar parâmetros antes do investimento"
                      }
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="timeline" className="space-y-4">
          <Card className="shadow-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Activity className="h-5 w-5 text-indigo-600" />
                Timeline do Projeto
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {[
                  { phase: "Setup Inicial", duration: "2-3 semanas", status: "completed", cost: setupParams.custo_equip_iluminacao + setupParams.custo_tenda_estrutura },
                  { phase: "Primeiro Ciclo", duration: `${cycleParams.duracao_vegetativa + cycleParams.duracao_floracao} dias`, status: "active", cost: 0 },
                  { phase: "Colheita", duration: "1 semana", status: "pending", cost: 0 },
                  { phase: "Análise de Resultados", duration: "1 semana", status: "pending", cost: 0 },
                ].map((item, index) => (
                  <div key={index} className="flex items-center gap-4">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-bold ${
                      item.status === "completed" ? "bg-green-500" :
                      item.status === "active" ? "bg-blue-500" :
                      "bg-gray-300"
                    }`}>
                      {index + 1}
                    </div>
                    <div className="flex-1">
                      <div className="font-medium">{item.phase}</div>
                      <div className="text-sm text-muted-foreground">
                        Duração: {item.duration}
                        {item.cost > 0 && ` • Investimento: ${formatCurrency(item.cost)}`}
                      </div>
                    </div>
                    <Badge className={
                      item.status === "completed" ? "bg-green-100 text-green-800" :
                      item.status === "active" ? "bg-blue-100 text-blue-800" :
                      "bg-gray-100 text-gray-800"
                    }>
                      {item.status === "completed" ? "Concluído" :
                       item.status === "active" ? "Em Andamento" :
                       "Pendente"}
                    </Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
} 