"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { DonutChart } from "@/components/charts/donut-chart"
import { Progress } from "@/components/ui/progress"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { Slider } from "@/components/ui/slider"
import { useState } from "react"

interface CostsContentProps {
  results: any
  setupParams?: any
  cycleParams?: any
  marketParams?: any
}

const defaultResults = {
  custo_total_investimento: 4800.0,
  custo_operacional_total_ciclo: 1945.52,
  receita_bruta_ciclo: 21600.0,
  lucro_liquido_ciclo: 19654.48,
  custo_por_grama: 4.05,
  gramas_por_watt: 1.0,
  gramas_por_m2: 213.33,
  periodo_payback_ciclos: 0.24,
  roi_investimento_1_ano: 896.37,
  duracao_total_ciclo: 175,
  detalhe_custos_operacionais: {
    "Energia Elétrica": 875.52,
    "Nutrientes": 350,
    "Outros Custos (Ciclo)": 100,
    "Sementes/Clones": 500,
    "Substrato": 120,
  },
};

export function CostsContent({ results, setupParams, cycleParams, marketParams }: CostsContentProps) {
  const safeResults = { ...defaultResults, ...results };
  // Corrigir chave de outros custos para compatibilidade
  if (
    safeResults.detalhe_custos_operacionais &&
    safeResults.detalhe_custos_operacionais["Outros Custos"] === undefined &&
    safeResults.detalhe_custos_operacionais["Outros Custos (Ciclo)"] !== undefined
  ) {
    safeResults.detalhe_custos_operacionais["Outros Custos"] = safeResults.detalhe_custos_operacionais["Outros Custos (Ciclo)"];
    delete safeResults.detalhe_custos_operacionais["Outros Custos (Ciclo)"];
  }
  const formatCurrency = (value: number) =>
    new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(value)

  // Mapas de explicação para cada categoria
  const costExplanations: Record<string, string> = {
    "Energia Elétrica": "Custo total com consumo de energia elétrica durante o ciclo.",
    "Sementes/Clones": "Valor gasto na aquisição de sementes ou clones para o plantio.",
    "Substrato": "Custo do substrato utilizado para o cultivo.",
    "Nutrientes": "Valor investido em nutrientes e fertilizantes.",
    "Outros Custos": "Despesas diversas não classificadas nas outras categorias.",
    "Iluminação": "Investimento em equipamentos de iluminação.",
    "Tenda/Estrutura": "Custo com a estrutura física e tendas do cultivo.",
    "Ventilação/Exaustão": "Gastos com ventiladores e exaustores.",
    "Outros Equipamentos": "Equipamentos adicionais necessários para o cultivo.",
  }

  // Estado para simulação de redução de custos
  const [simulatedReductions, setSimulatedReductions] = useState<Record<string, number>>({})

  // Função para calcular valor simulado
  function getSimulatedValue(key: string, value: number) {
    const reduction = simulatedReductions[key] || 0
    return value * (1 - reduction / 100)
  }

  // Calcular novo total operacional simulado
  const simulatedOperationalTotal = Object.entries(safeResults.detalhe_custos_operacionais).reduce(
    (sum, [key, value]: [string, any]) => sum + getSimulatedValue(key, value),
    0
  )

  return (
    <TooltipProvider>
      <div className="w-full px-4 sm:px-6 lg:px-8 py-4 pt-8">
        {/* Page Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Análise de Custos</h1>
          <p className="text-gray-600 mt-2">Detalhamento completo dos custos operacionais e de investimento</p>
        </div>

        {/* Cost Overview */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-2 mb-4">
          <Card className="shadow-sm border-l-4 border-l-red-500">
            <CardContent className="p-2">
              <div className="text-2xl font-bold text-red-600">{formatCurrency(safeResults.custo_total_investimento)}</div>
              <div className="text-sm text-red-700 mt-1">Investimento Inicial</div>
            </CardContent>
          </Card>
          <Card className="shadow-sm border-l-4 border-l-orange-500">
            <CardContent className="p-2">
              <div className="text-2xl font-bold text-orange-600">
                {formatCurrency(simulatedOperationalTotal)}
              </div>
              <div className="text-sm text-orange-700 mt-1">Custo por Ciclo (Simulado)</div>
            </CardContent>
          </Card>
          <Card className="shadow-sm border-l-4 border-l-blue-500">
            <CardContent className="p-2">
              <div className="text-2xl font-bold text-blue-600">{formatCurrency(safeResults.custo_por_grama)}</div>
              <div className="text-sm text-blue-700 mt-1">Custo por Grama</div>
            </CardContent>
          </Card>
        </div>

        {/* Detailed Cost Analysis com tooltips e simulação */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-2 mt-4">
          {/* Cost Breakdown */}
          <Card className="shadow-sm">
            <CardHeader>
              <CardTitle className="text-lg font-semibold">Detalhamento de Custos Operacionais</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {Object.entries(safeResults.detalhe_custos_operacionais).map(([key, value]: [string, any]) => {
                const percentage = (value / safeResults.custo_operacional_total_ciclo) * 100
                const simulatedValue = getSimulatedValue(key, value)
                return (
                  <div key={key} className="space-y-2">
                    <div className="flex justify-between items-center gap-2">
                      <div className="flex items-center gap-1">
                        <span className="text-sm font-medium text-gray-900">{key}</span>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <button type="button" className="cursor-pointer text-gray-400" tabIndex={0} aria-label={`Mais informações sobre ${key}`}>
                              ℹ️
                            </button>
                          </TooltipTrigger>
                          <TooltipContent>{costExplanations[key]}</TooltipContent>
                        </Tooltip>
                      </div>
                      <span className="text-sm text-gray-600">
                        {formatCurrency(simulatedValue)} ({percentage.toFixed(1)}%)
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Progress value={percentage} className="h-2 flex-1" />
                      <Slider
                        min={0}
                        max={50}
                        step={5}
                        value={[simulatedReductions[key] || 0]}
                        onValueChange={([val]) => setSimulatedReductions((prev) => ({ ...prev, [key]: val }))}
                        className="w-24"
                        aria-label={`Simular redução em ${key}`}
                      />
                      <span className="text-xs text-gray-500 w-10 text-right">-{simulatedReductions[key] || 0}%</span>
                    </div>
                  </div>
                )
              })}
            </CardContent>
          </Card>

          {/* Equipment Cost Breakdown (mantém original, mas pode adicionar tooltips se quiser) */}
          {setupParams && (
            <Card className="shadow-sm">
              <CardHeader>
                <CardTitle className="text-lg font-semibold">Detalhamento de Custos com Equipamentos</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {(() => {
                  const totalInvest =
                    (setupParams.custo_equip_iluminacao || 0) +
                    (setupParams.custo_tenda_estrutura || 0) +
                    (setupParams.custo_ventilacao_exaustao || 0) +
                    (setupParams.custo_outros_equipamentos || 0)
                  const items = [
                    { label: 'Iluminação', value: setupParams.custo_equip_iluminacao || 0 },
                    { label: 'Tenda/Estrutura', value: setupParams.custo_tenda_estrutura || 0 },
                    { label: 'Ventilação/Exaustão', value: setupParams.custo_ventilacao_exaustao || 0 },
                    { label: 'Outros Equipamentos', value: setupParams.custo_outros_equipamentos || 0 },
                  ]
                  return items.map(({ label, value }) => {
                    const percentage = totalInvest > 0 ? (value / totalInvest) * 100 : 0
                    return (
                      <div key={label} className="space-y-2">
                        <div className="flex justify-between items-center gap-2">
                          <div className="flex items-center gap-1">
                            <span className="text-sm font-medium text-gray-900">{label}</span>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <button type="button" className="cursor-pointer text-gray-400" tabIndex={0} aria-label={`Mais informações sobre ${label}`}>
                                  ℹ️
                                </button>
                              </TooltipTrigger>
                              <TooltipContent>{costExplanations[label]}</TooltipContent>
                            </Tooltip>
                          </div>
                          <span className="text-sm text-gray-600">
                            {formatCurrency(value)} ({percentage.toFixed(1)}%)
                          </span>
                        </div>
                        <Progress value={percentage} className="h-2" />
                      </div>
                    )
                  })
                })()}
              </CardContent>
            </Card>
          )}
        </div>

        {/* Gráficos interativos abaixo do detalhamento */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-2 mt-4">
          <Card className="shadow-sm">
            <CardHeader>
              <CardTitle className="text-lg font-semibold">Distribuição de Custos Operacionais (Simulado)</CardTitle>
            </CardHeader>
            <CardContent>
              <DonutChart data={
                Object.fromEntries(
                  Object.entries(safeResults.detalhe_custos_operacionais).map(
                    ([key, value]) => [key, getSimulatedValue(key, Number(value))]
                  )
                )
              } />
            </CardContent>
          </Card>
          <Card className="shadow-sm">
            <CardHeader>
              <CardTitle className="text-lg font-semibold">Distribuição de Custos com Equipamentos</CardTitle>
            </CardHeader>
            <CardContent>
              <DonutChart data={{
                'Iluminação': setupParams?.custo_equip_iluminacao,
                'Tenda/Estrutura': setupParams?.custo_tenda_estrutura,
                'Ventilação/Exaustão': setupParams?.custo_ventilacao_exaustao,
                'Outros Equipamentos': setupParams?.custo_outros_equipamentos,
              }} />
            </CardContent>
          </Card>
        </div>
      </div>
    </TooltipProvider>
  )
}
