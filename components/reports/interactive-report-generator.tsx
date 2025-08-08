"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { 
  Download, 
  FileText, 
  Eye, 
  Share2, 
  BarChart3,
  TrendingUp,
  Target,
  AlertTriangle,
  CheckCircle,
  Clock,
  DollarSign,
  Leaf,
  Zap,
  Settings,
  Calculator,
  ChartBar,
  Calendar,
  Thermometer,
  Lightbulb,
  Shield,
  Activity
} from "lucide-react"
import { InteractiveReportCharts } from "@/components/charts/interactive-report-charts"
import { generateExecutiveSummary } from "@/lib/report-generator"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { DonutChart } from "@/components/charts/donut-chart"

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

interface InteractiveReportGeneratorProps {
  cultivations: CultivationData[]
  realMetrics: RealMetrics
  results?: any
  setupParams?: any
  cycleParams?: any
  marketParams?: any
}

export function InteractiveReportGeneratorLegacy({ cultivations, realMetrics, results, setupParams, cycleParams, marketParams }: InteractiveReportGeneratorProps) {
  const [selectedTemplate, setSelectedTemplate] = useState<string>("executive")
  const [isGenerating, setIsGenerating] = useState(false)
  const [previewMode, setPreviewMode] = useState(false)
  const [showPresentation, setShowPresentation] = useState(false)

  const formatCurrency = (value: number) =>
    new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(value)

  const getReportStatus = () => {
    if (realMetrics.completedCultivations === 0) {
      return {
        status: "Sem Dados",
        color: "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200",
        icon: "📊",
      }
    }
    
    if (realMetrics.successRate >= 80) {
      return {
        status: "Excelente",
        color: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200",
        icon: "✅",
      }
    } else if (realMetrics.successRate >= 60) {
      return {
        status: "Bom",
        color: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200",
        icon: "👍",
      }
    } else {
      return {
        status: "Precisa Melhorar",
        color: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200",
        icon: "⚠️",
      }
    }
  }

  const reportStatus = getReportStatus()

  const templates = [
    {
      id: "executive",
      name: "Resumo Executivo",
      description: "Para decisores e investidores",
      icon: <TrendingUp className="h-5 w-5" />,
      color: "border-l-green-500",
      sections: ["overview", "financial", "recommendations"],
      content: {
        overview: {
          title: "Visão Geral do Projeto",
          icon: <Target className="h-5 w-5" />,
          content: "Análise de viabilidade para cultivo indoor com foco em retorno financeiro e eficiência operacional."
        },
        financial: {
          title: "Métricas Financeiras",
          icon: <DollarSign className="h-5 w-5" />,
          content: "Análise detalhada de custos, receitas e indicadores de rentabilidade."
        },
        recommendations: {
          title: "Recomendações Estratégicas",
          icon: <CheckCircle className="h-5 w-5" />,
          content: "Diretrizes para implementação e otimização do projeto."
        }
      }
    },
    {
      id: "technical",
      name: "Relatório Técnico",
      description: "Detalhes operacionais e técnicos",
      icon: <Zap className="h-5 w-5" />,
      color: "border-l-blue-500",
      sections: ["technical", "efficiency", "timeline"],
      content: {
        technical: {
          title: "Especificações Técnicas",
          icon: <Settings className="h-5 w-5" />,
          content: "Detalhamento de equipamentos, configurações e parâmetros operacionais."
        },
        efficiency: {
          title: "Análise de Eficiência",
          icon: <Activity className="h-5 w-5" />,
          content: "Métricas de performance energética e produtividade do sistema."
        },
        timeline: {
          title: "Cronograma Operacional",
          icon: <Calendar className="h-5 w-5" />,
          content: "Planejamento detalhado de fases e marcos do projeto."
        }
      }
    },
    {
      id: "financial",
      name: "Análise Financeira",
      description: "Foco em métricas financeiras",
      icon: <DollarSign className="h-5 w-5" />,
      color: "border-l-purple-500",
      sections: ["financial", "costs", "projections"],
      content: {
        financial: {
          title: "Indicadores Financeiros",
          icon: <ChartBar className="h-5 w-5" />,
          content: "ROI, payback, fluxo de caixa e análise de rentabilidade."
        },
        costs: {
          title: "Estrutura de Custos",
          icon: <Calculator className="h-5 w-5" />,
          content: "Breakdown detalhado de investimentos, custos operacionais e variáveis."
        },
        projections: {
          title: "Projeções Financeiras",
          icon: <TrendingUp className="h-5 w-5" />,
          content: "Cenários de retorno e análise de sensibilidade."
        }
      }
    },
    {
      id: "comprehensive",
      name: "Relatório Completo",
      description: "Análise abrangente do projeto",
      icon: <FileText className="h-5 w-5" />,
      color: "border-l-orange-500",
      sections: ["overview", "financial", "technical", "efficiency", "timeline", "recommendations"],
      content: {
        overview: {
          title: "Visão Geral do Projeto",
          icon: <Target className="h-5 w-5" />,
          content: "Análise completa de viabilidade e contexto do projeto."
        },
        financial: {
          title: "Análise Financeira Completa",
          icon: <DollarSign className="h-5 w-5" />,
          content: "Todas as métricas financeiras e projeções detalhadas."
        },
        technical: {
          title: "Especificações Técnicas",
          icon: <Settings className="h-5 w-5" />,
          content: "Configurações técnicas e parâmetros operacionais."
        },
        efficiency: {
          title: "Análise de Eficiência",
          icon: <Activity className="h-5 w-5" />,
          content: "Métricas de performance e otimização."
        },
        timeline: {
          title: "Cronograma Detalhado",
          icon: <Calendar className="h-5 w-5" />,
          content: "Planejamento completo de implementação."
        },
        recommendations: {
          title: "Recomendações Estratégicas",
          icon: <CheckCircle className="h-5 w-5" />,
          content: "Diretrizes para sucesso do projeto."
        }
      }
    }
  ]

  const getSelectedTemplate = () => templates.find(t => t.id === selectedTemplate)!

  const renderSectionContent = (sectionId: string) => {
    const template = getSelectedTemplate()
    const section = template.content[sectionId as keyof typeof template.content]
    
    if (!section) return null

    return (
      <Card key={sectionId} className="shadow-sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            {section.icon}
            {section.title}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <p className="text-muted-foreground">{section.content}</p>
            
            {/* Conteúdo específico para cada seção baseado no template */}
            {sectionId === "overview" && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card className="shadow-sm">
                  <CardContent className="p-4 text-center">
                    <div className="text-2xl font-bold text-green-600">
                      {formatCurrency(realMetrics.totalProfit)}
                    </div>
                    <div className="text-sm text-muted-foreground">Lucro Total</div>
                  </CardContent>
                </Card>
                <Card className="shadow-sm">
                  <CardContent className="p-4 text-center">
                    <div className="text-2xl font-bold text-blue-600">
                      {realMetrics.successRate.toFixed(1)}%
                    </div>
                    <div className="text-sm text-muted-foreground">Taxa de Sucesso</div>
                  </CardContent>
                </Card>
                <Card className="shadow-sm">
                  <CardContent className="p-4 text-center">
                    <div className="text-2xl font-bold text-purple-600">
                      {realMetrics.totalYield.toFixed(0)}g
                    </div>
                    <div className="text-sm text-muted-foreground">Rendimento Total</div>
                  </CardContent>
                </Card>
              </div>
            )}

            {sectionId === "financial" && selectedTemplate === "executive" && (
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <h4 className="font-semibold">Cultivos Concluídos</h4>
                    <div className="text-2xl font-bold text-blue-600">
                      {realMetrics.completedCultivations}
                    </div>
                  </div>
                  <div className="space-y-2">
                    <h4 className="font-semibold">Cultivos Ativos</h4>
                    <div className="text-2xl font-bold text-green-600">
                      {realMetrics.activeCultivations}
                    </div>
                  </div>
                </div>
                <div className="p-4 bg-blue-50 rounded-lg">
                  <h4 className="font-semibold mb-2">Análise de Performance</h4>
                  <p className="text-sm text-muted-foreground">
                    {realMetrics.successRate >= 80
                      ? "Performance excelente com alta taxa de sucesso nos cultivos."
                      : realMetrics.successRate >= 60
                        ? "Performance boa com potencial de melhoria."
                        : "Performance precisa de otimização para aumentar taxa de sucesso."}
                  </p>
                </div>
              </div>
            )}

            {sectionId === "financial" && selectedTemplate === "financial" && (
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <Card className="shadow-sm">
                    <CardContent className="p-4 text-center">
                      <div className="text-2xl font-bold text-green-600">
                        {results.roi_investimento_1_ano.toFixed(1)}%
                      </div>
                      <div className="text-sm text-muted-foreground">ROI Anual</div>
                    </CardContent>
                  </Card>
                  <Card className="shadow-sm">
                    <CardContent className="p-4 text-center">
                      <div className="text-2xl font-bold text-blue-600">
                        {results.periodo_payback_ciclos.toFixed(1)}
                      </div>
                      <div className="text-sm text-muted-foreground">Meses para Payback</div>
                    </CardContent>
                  </Card>
                  <Card className="shadow-sm">
                    <CardContent className="p-4 text-center">
                      <div className="text-2xl font-bold text-purple-600">
                        {formatCurrency(results.lucro_liquido_ciclo * 12)}
                      </div>
                      <div className="text-sm text-muted-foreground">Lucro Anual</div>
                    </CardContent>
                  </Card>
                </div>
                <div className="p-4 bg-green-50 rounded-lg">
                  <h4 className="font-semibold mb-2">Análise Financeira Detalhada</h4>
                  <p className="text-sm text-muted-foreground">
                    Análise completa dos indicadores financeiros, incluindo fluxo de caixa, 
                    ponto de equilíbrio e projeções de longo prazo.
                  </p>
                </div>
              </div>
            )}

            {sectionId === "financial" && selectedTemplate === "comprehensive" && (
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <h4 className="font-semibold">Investimento Inicial</h4>
                    <div className="text-2xl font-bold text-blue-600">
                      {formatCurrency(results.investimento_inicial)}
                    </div>
                  </div>
                  <div className="space-y-2">
                    <h4 className="font-semibold">Receita por Ciclo</h4>
                    <div className="text-2xl font-bold text-green-600">
                      {formatCurrency(results.receita_ciclo)}
                    </div>
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <Card className="shadow-sm">
                    <CardContent className="p-4 text-center">
                      <div className="text-2xl font-bold text-green-600">
                        {results.roi_investimento_1_ano.toFixed(1)}%
                      </div>
                      <div className="text-sm text-muted-foreground">ROI Anual</div>
                    </CardContent>
                  </Card>
                  <Card className="shadow-sm">
                    <CardContent className="p-4 text-center">
                      <div className="text-2xl font-bold text-blue-600">
                        {results.periodo_payback_ciclos.toFixed(1)}
                      </div>
                      <div className="text-sm text-muted-foreground">Meses para Payback</div>
                    </CardContent>
                  </Card>
                  <Card className="shadow-sm">
                    <CardContent className="p-4 text-center">
                      <div className="text-2xl font-bold text-purple-600">
                        {formatCurrency(results.lucro_liquido_ciclo * 12)}
                      </div>
                      <div className="text-sm text-muted-foreground">Lucro Anual</div>
                    </CardContent>
                  </Card>
                </div>
              </div>
            )}



            {sectionId === "technical" && selectedTemplate === "technical" && (
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <h4 className="font-semibold">Configurações do Sistema</h4>
                    <ul className="space-y-1 text-sm">
                      <li>• Potência: {setupParams.potencia_sistema}W</li>
                      <li>• Área: {setupParams.area_cultivo}m²</li>
                      <li>• Temperatura: {setupParams.temperatura}°C</li>
                      <li>• Umidade: {setupParams.umidade}%</li>
                    </ul>
                  </div>
                  <div className="space-y-2">
                    <h4 className="font-semibold">Parâmetros de Ciclo</h4>
                    <ul className="space-y-1 text-sm">
                      <li>• Duração: {cycleParams.duracao_ciclo} dias</li>
                      <li>• Produção: {cycleParams.producao_esperada}g</li>
                      <li>• Eficiência: {results.gramas_por_watt.toFixed(2)} g/W</li>
                    </ul>
                  </div>
                </div>
                <div className="p-4 bg-blue-50 rounded-lg">
                  <h4 className="font-semibold mb-2">Especificações Técnicas Detalhadas</h4>
                  <p className="text-sm text-muted-foreground">
                    Configurações avançadas do sistema de cultivo, incluindo parâmetros de controle 
                    ambiental e otimizações técnicas para máxima eficiência.
                  </p>
                </div>
              </div>
            )}

            {sectionId === "technical" && selectedTemplate === "comprehensive" && (
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <h4 className="font-semibold">Configurações do Sistema</h4>
                    <ul className="space-y-1 text-sm">
                      <li>• Potência: {setupParams.potencia_sistema}W</li>
                      <li>• Área: {setupParams.area_cultivo}m²</li>
                      <li>• Temperatura: {setupParams.temperatura}°C</li>
                      <li>• Umidade: {setupParams.umidade}%</li>
                    </ul>
                  </div>
                  <div className="space-y-2">
                    <h4 className="font-semibold">Parâmetros de Ciclo</h4>
                    <ul className="space-y-1 text-sm">
                      <li>• Duração: {cycleParams.duracao_ciclo} dias</li>
                      <li>• Produção: {cycleParams.producao_esperada}g</li>
                      <li>• Eficiência: {results.gramas_por_watt.toFixed(2)} g/W</li>
                    </ul>
                  </div>
                </div>
              </div>
            )}

            {sectionId === "efficiency" && selectedTemplate === "technical" && (
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <Card className="shadow-sm">
                    <CardContent className="p-4 text-center">
                      <div className="text-2xl font-bold text-green-600">
                        {results.gramas_por_watt.toFixed(2)}
                      </div>
                      <div className="text-sm text-muted-foreground">g/W Eficiência</div>
                    </CardContent>
                  </Card>
                  <Card className="shadow-sm">
                    <CardContent className="p-4 text-center">
                      <div className="text-2xl font-bold text-blue-600">
                        {((results.receita_ciclo / results.investimento_inicial) * 100).toFixed(1)}%
                      </div>
                      <div className="text-sm text-muted-foreground">Retorno por Ciclo</div>
                    </CardContent>
                  </Card>
                  <Card className="shadow-sm">
                    <CardContent className="p-4 text-center">
                      <div className="text-2xl font-bold text-purple-600">
                        {results.periodo_payback_ciclos.toFixed(1)}
                      </div>
                      <div className="text-sm text-muted-foreground">Ciclos para Payback</div>
                    </CardContent>
                  </Card>
                </div>
                <div className="p-4 bg-green-50 rounded-lg">
                  <h4 className="font-semibold mb-2">Análise de Eficiência Energética</h4>
                  <p className="text-sm text-muted-foreground">
                    Métricas detalhadas de performance energética e produtividade do sistema, 
                    incluindo otimizações para máxima eficiência.
                  </p>
                </div>
              </div>
            )}

            {sectionId === "efficiency" && selectedTemplate === "comprehensive" && (
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <Card className="shadow-sm">
                    <CardContent className="p-4 text-center">
                      <div className="text-2xl font-bold text-green-600">
                        {realMetrics.avgEfficiency.toFixed(2)}
                      </div>
                      <div className="text-sm text-muted-foreground">g/dia Eficiência</div>
                    </CardContent>
                  </Card>
                  <Card className="shadow-sm">
                    <CardContent className="p-4 text-center">
                      <div className="text-2xl font-bold text-blue-600">
                        {realMetrics.avgDuration.toFixed(0)}
                      </div>
                      <div className="text-sm text-muted-foreground">Dias Média</div>
                    </CardContent>
                  </Card>
                  <Card className="shadow-sm">
                    <CardContent className="p-4 text-center">
                      <div className="text-2xl font-bold text-purple-600">
                        {realMetrics.completedCultivations}
                      </div>
                      <div className="text-sm text-muted-foreground">Cultivos Concluídos</div>
                    </CardContent>
                  </Card>
                </div>
              </div>
            )}

            {sectionId === "timeline" && selectedTemplate === "technical" && (
              <div className="space-y-4">
                <div className="space-y-3">
                  <div className="flex items-center gap-3 p-3 border rounded-lg">
                    <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                      <span className="text-sm font-bold text-blue-600">1</span>
                    </div>
                    <div>
                      <div className="font-medium">Fase de Setup</div>
                      <div className="text-sm text-muted-foreground">Instalação e configuração inicial</div>
                    </div>
                    <Badge variant="outline">Semana 1-2</Badge>
                  </div>
                  <div className="flex items-center gap-3 p-3 border rounded-lg">
                    <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                      <span className="text-sm font-bold text-green-600">2</span>
                    </div>
                    <div>
                      <div className="font-medium">Primeiro Ciclo</div>
                      <div className="text-sm text-muted-foreground">Cultivo inicial e validação</div>
                    </div>
                    <Badge variant="outline">Semana 3-{3 + cycleParams.duracao_ciclo}</Badge>
                  </div>
                  <div className="flex items-center gap-3 p-3 border rounded-lg">
                    <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
                      <span className="text-sm font-bold text-purple-600">3</span>
                    </div>
                    <div>
                      <div className="font-medium">Otimização</div>
                      <div className="text-sm text-muted-foreground">Ajustes baseados nos resultados</div>
                    </div>
                    <Badge variant="outline">Contínuo</Badge>
                  </div>
                </div>
                <div className="p-4 bg-blue-50 rounded-lg">
                  <h4 className="font-semibold mb-2">Cronograma Operacional Detalhado</h4>
                  <p className="text-sm text-muted-foreground">
                    Planejamento técnico detalhado de implementação, incluindo marcos críticos, 
                    dependências e recursos necessários para cada fase.
                  </p>
                </div>
              </div>
            )}

            {sectionId === "timeline" && selectedTemplate === "comprehensive" && (
              <div className="space-y-4">
                <div className="space-y-3">
                  <div className="flex items-center gap-3 p-3 border rounded-lg">
                    <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                      <span className="text-sm font-bold text-blue-600">1</span>
                    </div>
                    <div>
                      <div className="font-medium">Fase de Setup</div>
                      <div className="text-sm text-muted-foreground">Instalação e configuração inicial</div>
                    </div>
                    <Badge variant="outline">Semana 1-2</Badge>
                  </div>
                  <div className="flex items-center gap-3 p-3 border rounded-lg">
                    <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                      <span className="text-sm font-bold text-green-600">2</span>
                    </div>
                    <div>
                      <div className="font-medium">Primeiro Ciclo</div>
                      <div className="text-sm text-muted-foreground">Cultivo inicial e validação</div>
                    </div>
                    <Badge variant="outline">Semana 3-{3 + cycleParams.duracao_ciclo}</Badge>
                  </div>
                  <div className="flex items-center gap-3 p-3 border rounded-lg">
                    <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
                      <span className="text-sm font-bold text-purple-600">3</span>
                    </div>
                    <div>
                      <div className="font-medium">Otimização</div>
                      <div className="text-sm text-muted-foreground">Ajustes baseados nos resultados</div>
                    </div>
                    <Badge variant="outline">Contínuo</Badge>
                  </div>
                </div>
              </div>
            )}

            {sectionId === "costs" && selectedTemplate === "financial" && (
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-3">
                    <h4 className="font-semibold">Custos Fixos</h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span>Equipamentos:</span>
                        <span className="font-medium">{formatCurrency(results.investimento_inicial * 0.7)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Instalação:</span>
                        <span className="font-medium">{formatCurrency(results.investimento_inicial * 0.2)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Licenças:</span>
                        <span className="font-medium">{formatCurrency(results.investimento_inicial * 0.1)}</span>
                      </div>
                    </div>
                  </div>
                  <div className="space-y-3">
                    <h4 className="font-semibold">Custos Variáveis</h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span>Energia:</span>
                        <span className="font-medium">{formatCurrency(results.custo_energia_ciclo)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Nutrientes:</span>
                        <span className="font-medium">{formatCurrency(results.custo_nutrientes_ciclo)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Manutenção:</span>
                        <span className="font-medium">{formatCurrency(results.custo_manutencao_ciclo)}</span>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="p-4 bg-purple-50 rounded-lg">
                  <h4 className="font-semibold mb-2">Análise de Custos Detalhada</h4>
                  <p className="text-sm text-muted-foreground">
                    Breakdown completo da estrutura de custos, incluindo análise de ponto de equilíbrio 
                    e otimizações para redução de despesas.
                  </p>
                </div>
              </div>
            )}

            {sectionId === "projections" && selectedTemplate === "financial" && (
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <Card className="shadow-sm">
                    <CardContent className="p-4 text-center">
                      <div className="text-2xl font-bold text-green-600">
                        {formatCurrency(results.lucro_liquido_ciclo * 12)}
                      </div>
                      <div className="text-sm text-muted-foreground">Lucro Anual Projetado</div>
                    </CardContent>
                  </Card>
                  <Card className="shadow-sm">
                    <CardContent className="p-4 text-center">
                      <div className="text-2xl font-bold text-blue-600">
                        {results.roi_investimento_1_ano.toFixed(1)}%
                      </div>
                      <div className="text-sm text-muted-foreground">ROI Anual</div>
                    </CardContent>
                  </Card>
                  <Card className="shadow-sm">
                    <CardContent className="p-4 text-center">
                      <div className="text-2xl font-bold text-purple-600">
                        {results.periodo_payback_ciclos.toFixed(1)}
                      </div>
                      <div className="text-sm text-muted-foreground">Meses para Payback</div>
                    </CardContent>
                  </Card>
                </div>
                <div className="p-4 bg-orange-50 rounded-lg">
                  <h4 className="font-semibold mb-2">Projeções Financeiras Avançadas</h4>
                  <p className="text-sm text-muted-foreground">
                    Cenários de retorno detalhados, análise de sensibilidade e projeções de longo prazo 
                    para diferentes condições de mercado.
                  </p>
                </div>
              </div>
            )}

            {sectionId === "recommendations" && selectedTemplate === "executive" && (
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-3">
                    <h4 className="font-semibold">Pontos Fortes</h4>
                    <ul className="space-y-2 text-sm">
                      {realMetrics.successRate >= 80 && (
                        <li className="flex items-center gap-2">
                          <CheckCircle className="h-4 w-4 text-green-500" />
                          Alta taxa de sucesso ({realMetrics.successRate.toFixed(1)}%)
                        </li>
                      )}
                      {realMetrics.totalProfit > 0 && (
                        <li className="flex items-center gap-2">
                          <CheckCircle className="h-4 w-4 text-green-500" />
                          Lucro total de {formatCurrency(realMetrics.totalProfit)}
                        </li>
                      )}
                      {realMetrics.avgEfficiency >= 2.0 && (
                        <li className="flex items-center gap-2">
                          <CheckCircle className="h-4 w-4 text-green-500" />
                          Eficiência média de {realMetrics.avgEfficiency.toFixed(2)} g/dia
                        </li>
                      )}
                    </ul>
                  </div>
                  <div className="space-y-3">
                    <h4 className="font-semibold">Oportunidades</h4>
                    <ul className="space-y-2 text-sm">
                      {realMetrics.successRate < 80 && (
                        <li className="flex items-center gap-2">
                          <AlertTriangle className="h-4 w-4 text-yellow-500" />
                          Melhorar taxa de sucesso (atual: {realMetrics.successRate.toFixed(1)}%)
                        </li>
                      )}
                      {realMetrics.avgEfficiency < 2.0 && (
                        <li className="flex items-center gap-2">
                          <AlertTriangle className="h-4 w-4 text-yellow-500" />
                          Otimizar eficiência (atual: {realMetrics.avgEfficiency.toFixed(2)} g/dia)
                        </li>
                      )}
                      {realMetrics.completedCultivations < 3 && (
                        <li className="flex items-center gap-2">
                          <AlertTriangle className="h-4 w-4 text-yellow-500" />
                          Coletar mais dados ({realMetrics.completedCultivations} cultivos concluídos)
                        </li>
                      )}
                    </ul>
                  </div>
                </div>
                
                <div className="p-4 bg-blue-50 rounded-lg">
                  <h4 className="font-semibold mb-2">Recomendação Executiva</h4>
                  <p className="text-sm text-muted-foreground">
                    {realMetrics.successRate >= 80
                      ? "CONTINUAR - Excelente performance! Mantenha as práticas atuais e considere expansão."
                      : realMetrics.successRate >= 60
                        ? "OTIMIZAR - Performance boa. Foque em melhorar processos para aumentar taxa de sucesso."
                        : "ANALISAR - Identifique padrões nos cultivos com problemas para otimizar processos."}
                  </p>
                </div>
              </div>
            )}

            {sectionId === "recommendations" && selectedTemplate === "comprehensive" && (
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-3">
                    <h4 className="font-semibold">Pontos Fortes</h4>
                    <ul className="space-y-2 text-sm">
                      {realMetrics.successRate >= 80 && (
                        <li className="flex items-center gap-2">
                          <CheckCircle className="h-4 w-4 text-green-500" />
                          Alta taxa de sucesso ({realMetrics.successRate.toFixed(1)}%)
                        </li>
                      )}
                      {realMetrics.totalProfit > 0 && (
                        <li className="flex items-center gap-2">
                          <CheckCircle className="h-4 w-4 text-green-500" />
                          Lucro total de {formatCurrency(realMetrics.totalProfit)}
                        </li>
                      )}
                      {realMetrics.avgEfficiency >= 2.0 && (
                        <li className="flex items-center gap-2">
                          <CheckCircle className="h-4 w-4 text-green-500" />
                          Eficiência média de {realMetrics.avgEfficiency.toFixed(2)} g/dia
                        </li>
                      )}
                      {realMetrics.completedCultivations >= 3 && (
                        <li className="flex items-center gap-2">
                          <CheckCircle className="h-4 w-4 text-green-500" />
                          Base de dados sólida ({realMetrics.completedCultivations} cultivos)
                        </li>
                      )}
                    </ul>
                  </div>
                  <div className="space-y-3">
                    <h4 className="font-semibold">Oportunidades</h4>
                    <ul className="space-y-2 text-sm">
                      {realMetrics.successRate < 80 && (
                        <li className="flex items-center gap-2">
                          <AlertTriangle className="h-4 w-4 text-yellow-500" />
                          Melhorar taxa de sucesso (atual: {realMetrics.successRate.toFixed(1)}%)
                        </li>
                      )}
                      {realMetrics.avgEfficiency < 2.0 && (
                        <li className="flex items-center gap-2">
                          <AlertTriangle className="h-4 w-4 text-yellow-500" />
                          Otimizar eficiência (atual: {realMetrics.avgEfficiency.toFixed(2)} g/dia)
                        </li>
                      )}
                      {realMetrics.completedCultivations < 3 && (
                        <li className="flex items-center gap-2">
                          <AlertTriangle className="h-4 w-4 text-yellow-500" />
                          Coletar mais dados ({realMetrics.completedCultivations} cultivos concluídos)
                        </li>
                      )}
                      {realMetrics.avgDuration > 150 && (
                        <li className="flex items-center gap-2">
                          <AlertTriangle className="h-4 w-4 text-yellow-500" />
                          Otimizar duração dos ciclos (média: {realMetrics.avgDuration.toFixed(0)} dias)
                        </li>
                      )}
                    </ul>
                  </div>
                </div>
                
                <div className="p-4 bg-green-50 rounded-lg">
                  <h4 className="font-semibold mb-2">Recomendações Estratégicas Completas</h4>
                  <p className="text-sm text-muted-foreground">
                    {realMetrics.successRate >= 80 
                      ? "Excelente performance! Continue documentando técnicas bem-sucedidas e considere expansão."
                      : realMetrics.successRate >= 60
                        ? "Performance boa. Foque em otimizar processos e aumentar taxa de sucesso."
                        : "Foque em análise detalhada dos cultivos com problemas para identificar padrões e melhorar processos."}
                  </p>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    )
  }

  const handleGenerateReport = async (templateId: string) => {
    setIsGenerating(true)
    try {
      // Simular geração do relatório
      await new Promise(resolve => setTimeout(resolve, 2000))
      
      // Aqui seria a lógica real de geração do relatório
      console.log(`Gerando relatório: ${templateId}`)
      
      // Mock de sucesso
      alert(`Relatório ${templateId} gerado com sucesso!`)
    } catch (error) {
      console.error("Erro ao gerar relatório:", error)
      alert("Erro ao gerar relatório")
    } finally {
      setIsGenerating(false)
    }
  }

  return (
    <div className="space-y-6">
      {/* Seleção de Template */}
      <Card className="shadow-sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5" />
            Gerador de Relatórios Interativos
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {templates.map((template) => (
              <Card 
                key={template.id}
                className={`shadow-sm cursor-pointer transition-all hover:shadow-md ${
                  selectedTemplate === template.id ? 'ring-2 ring-blue-500' : ''
                } ${template.color}`}
                onClick={() => setSelectedTemplate(template.id)}
              >
                <CardContent className="p-4">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="text-blue-600">
                      {template.icon}
                    </div>
                    <div>
                      <h3 className="font-semibold">{template.name}</h3>
                      <p className="text-sm text-muted-foreground">{template.description}</p>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="text-xs text-muted-foreground">
                      Seções incluídas:
                    </div>
                    <div className="flex flex-wrap gap-1">
                      {template.sections.map((section) => (
                        <Badge key={section} variant="secondary" className="text-xs">
                          {section}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Controles de Ação */}
      <Card className="shadow-sm">
        <CardHeader>
          <CardTitle>Ações do Relatório</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-4">
            <Button
              variant="outline"
              onClick={() => setPreviewMode(!previewMode)}
              className="flex items-center gap-2"
            >
              <Eye className="h-4 w-4" />
              {previewMode ? "Ocultar" : "Mostrar"} Prévia
            </Button>
            <Button
              onClick={() => generateExecutiveSummary(results, setupParams, cycleParams, marketParams)}
              disabled={isGenerating}
              className="flex items-center gap-2"
            >
              <Download className="h-4 w-4" />
              Exportar PDF Completo
            </Button>
            <Button
              variant="outline"
              className="flex items-center gap-2"
              onClick={() => setShowPresentation(true)}
            >
              <Eye className="h-4 w-4 mr-2" />
              Criar
            </Button>
            <Button
              variant="outline"
              className="flex items-center gap-2"
            >
              <Share2 className="h-4 w-4" />
              Compartilhar
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Prévia do Relatório */}
      {previewMode && (
        <div className="space-y-6">
          <Card className="shadow-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Eye className="h-5 w-5" />
                Prévia do Relatório - {getSelectedTemplate().name}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {/* Cabeçalho do Relatório */}
                <div className="text-center border-b pb-6">
                  <h1 className="text-3xl font-bold text-foreground mb-2">
                    🌱 CULTIVO INDOOR ANALYTICS
                  </h1>
                  <h2 className="text-xl font-semibold text-muted-foreground mb-4">
                    {getSelectedTemplate().name}
                  </h2>
                  <div className="flex items-center justify-center gap-4">
                    <Badge className={reportStatus.color}>
                      {reportStatus.icon} Projeto {reportStatus.status}
                    </Badge>
                    <span className="text-sm text-muted-foreground">
                      Gerado em {new Date().toLocaleDateString("pt-BR")}
                    </span>
                  </div>
                </div>

                {/* Gráficos Interativos */}
                <InteractiveReportCharts 
                  cultivations={cultivations}
                  realMetrics={realMetrics}
                  results={results}
                  setupParams={setupParams}
                  cycleParams={cycleParams}
                  marketParams={marketParams}
                />

                {/* Seções Específicas do Template */}
                <div className="space-y-6">
                  {getSelectedTemplate().sections.map((sectionId) => 
                    renderSectionContent(sectionId)
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Modal de Apresentação Interativa */}
      <Dialog open={showPresentation} onOpenChange={setShowPresentation}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Apresentação Interativa</DialogTitle>
          </DialogHeader>
          <PresentationSlides results={results} />
        </DialogContent>
      </Dialog>
    </div>
  )
} 

// Exemplo mínimo funcional de PresentationSlides
function PresentationSlides({ results }: any) {
  const [slide, setSlide] = useState(0);
  const slides = [
    <div key="1">Slide 1 - Resumo Executivo</div>,
    <div key="2">Slide 2 - Gráficos</div>,
    <div key="3">Slide 3 - Recomendações</div>,
  ];
  return (
    <div>
      <div>{slides[slide]}</div>
      <div className="flex justify-between mt-6">
        <Button onClick={() => setSlide(s => Math.max(0, s - 1))} disabled={slide === 0}>Anterior</Button>
        <Button onClick={() => setSlide(s => Math.min(slides.length - 1, s + 1))} disabled={slide === slides.length - 1}>Próximo</Button>
      </div>
    </div>
  );
} 