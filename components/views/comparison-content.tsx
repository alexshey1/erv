"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { SetupForm } from "@/components/forms/setup-form"
import { CycleForm } from "@/components/forms/cycle-form"
import { MarketForm } from "@/components/forms/market-form"
import { calculateResults } from "@/lib/cultivation-calculator"
import { Plus, X, GitCompare } from "lucide-react"

interface ComparisonContentProps {
  setupParams: any
  cycleParams: any
  marketParams: any
}

interface Scenario {
  id: string
  name: string
  setupParams: any
  cycleParams: any
  marketParams: any
  results: any
}

export function ComparisonContent({ setupParams, cycleParams, marketParams }: ComparisonContentProps) {
  const [scenarios, setScenarios] = useState<Scenario[]>([
    {
      id: "1",
      name: "Cenário Base",
      setupParams,
      cycleParams,
      marketParams,
      results: calculateResults(setupParams, cycleParams, marketParams),
    },
  ])

  const [editingScenario, setEditingScenario] = useState<string | null>(null)

  const formatCurrency = (value: number) =>
    new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(value)

  const addScenario = () => {
    const newScenario: Scenario = {
      id: Date.now().toString(),
      name: `Cenário ${scenarios.length + 1}`,
      setupParams: { ...setupParams },
      cycleParams: { ...cycleParams },
      marketParams: { ...marketParams },
      results: calculateResults(setupParams, cycleParams, marketParams),
    }
    setScenarios([...scenarios, newScenario])
  }

  const removeScenario = (id: string) => {
    if (scenarios.length > 1) {
      setScenarios(scenarios.filter((s) => s.id !== id))
    }
  }

  const updateScenario = (id: string, type: string, params: any) => {
    setScenarios(
      scenarios.map((scenario) => {
        if (scenario.id === id) {
          const updated = { ...scenario, [type]: params }
          updated.results = calculateResults(updated.setupParams, updated.cycleParams, updated.marketParams)
          return updated
        }
        return scenario
      }),
    )
  }

  const getBestScenario = () => {
    return scenarios.reduce((best, current) =>
      current.results.lucro_liquido_ciclo > best.results.lucro_liquido_ciclo ? current : best,
    )
  }

  const bestScenario = getBestScenario()

  return (
    <div className="p-8">
      {/* Page Header */}
      <div className="mb-8">
        <div className="flex flex-col items-start gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Comparação de Cenários</h1>
            <p className="text-muted-foreground mt-2">Compare diferentes configurações e encontre a melhor opção</p>
          </div>
          <div className="w-full sm:w-auto">
            <Button onClick={addScenario} className="flex items-center gap-2 w-full sm:w-auto mt-2 sm:mt-0">
              <Plus className="h-4 w-4" />
              Adicionar Cenário
            </Button>
          </div>
        </div>
      </div>

      {/* Best Scenario Alert */}
      <Card className="mb-8 border-green-200 dark:border-green-800 bg-green-50 dark:bg-green-950">
        <CardContent className="p-6">
          <div className="flex items-center gap-3">
            <GitCompare className="h-6 w-6 text-green-600" />
            <div>
              <h3 className="font-semibold text-green-800 dark:text-green-200">Melhor Cenário: {bestScenario.name}</h3>
              <p className="text-green-600 dark:text-green-400">
                Economia: {formatCurrency(bestScenario.results.lucro_liquido_ciclo)} | ROI: {bestScenario.results.roi_investimento_1_ano.toFixed(1)}%
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Scenarios Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6 mb-8">
        {scenarios.map((scenario) => (
          <Card key={scenario.id} className="shadow-sm">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg">{scenario.name}</CardTitle>
                <div className="flex items-center gap-2">
                  {scenario.id === bestScenario.id && (
                    <Badge variant="default" className="bg-green-600">
                      Melhor
                    </Badge>
                  )}
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setEditingScenario(editingScenario === scenario.id ? null : scenario.id)}
                  >
                    Editar
                  </Button>
                  {scenarios.length > 1 && (
                    <Button variant="ghost" size="sm" onClick={() => removeScenario(scenario.id)}>
                      <X className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {editingScenario === scenario.id ? (
                <Tabs defaultValue="setup" className="w-full">
                  <TabsList className="grid w-full grid-cols-3">
                    <TabsTrigger value="setup">Setup</TabsTrigger>
                    <TabsTrigger value="cycle">Ciclo</TabsTrigger>
                    <TabsTrigger value="market">Mercado</TabsTrigger>
                  </TabsList>

                  <TabsContent value="setup" className="mt-4">
                    <SetupForm
                      params={scenario.setupParams}
                      onChange={(params) => updateScenario(scenario.id, "setupParams", params)}
                    />
                  </TabsContent>

                  <TabsContent value="cycle" className="mt-4">
                    <CycleForm
                      params={scenario.cycleParams}
                      onChange={(params) => updateScenario(scenario.id, "cycleParams", params)}
                    />
                  </TabsContent>

                  <TabsContent value="market" className="mt-4">
                    <MarketForm
                      params={scenario.marketParams}
                      onChange={(params) => updateScenario(scenario.id, "marketParams", params)}
                    />
                  </TabsContent>
                </Tabs>
              ) : (
                <div className="space-y-4">
                  {/* KPIs */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="text-center p-3 bg-green-50 dark:bg-green-950 rounded-lg w-full">
                      <div className="text-lg font-bold text-green-600 break-words">
                        {formatCurrency(scenario.results.lucro_liquido_ciclo)}
                      </div>
                      <div className="text-xs text-green-700 dark:text-green-300">Economia/Ciclo</div>
                    </div>
                    <div className="text-center p-3 bg-blue-50 dark:bg-blue-950 rounded-lg w-full">
                      <div className="text-lg font-bold text-blue-600 break-words">
                        {scenario.results.roi_investimento_1_ano.toFixed(1)}%
                      </div>
                      <div className="text-xs text-blue-700 dark:text-blue-300">ROI Anual</div>
                    </div>
                  </div>

                  {/* Details */}
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Payback:</span>
                      <span>{scenario.results.periodo_payback_ciclos.toFixed(1)} ciclos</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Eficiência:</span>
                      <span>{scenario.results.gramas_por_watt.toFixed(2)} g/W</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Investimento:</span>
                      <span>{formatCurrency(scenario.results.custo_total_investimento)}</span>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Comparison Table */}
      <Card className="shadow-sm">
        <CardHeader>
          <CardTitle>Tabela Comparativa</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b">
                  <th className="text-left p-2">Métrica</th>
                  {scenarios.map((scenario) => (
                    <th key={scenario.id} className="text-center p-2">
                      {scenario.name}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                <tr className="border-b">
                  <td className="p-2 font-medium">Economia por Ciclo</td>
                  {scenarios.map((scenario) => (
                    <td key={scenario.id} className="text-center p-2">
                      {formatCurrency(scenario.results.lucro_liquido_ciclo)}
                    </td>
                  ))}
                </tr>
                <tr className="border-b">
                  <td className="p-2 font-medium">ROI Anual</td>
                  {scenarios.map((scenario) => (
                    <td key={scenario.id} className="text-center p-2">
                      {scenario.results.roi_investimento_1_ano.toFixed(1)}%
                    </td>
                  ))}
                </tr>
                <tr className="border-b">
                  <td className="p-2 font-medium">Payback (ciclos)</td>
                  {scenarios.map((scenario) => (
                    <td key={scenario.id} className="text-center p-2">
                      {scenario.results.periodo_payback_ciclos.toFixed(1)}
                    </td>
                  ))}
                </tr>
                <tr className="border-b">
                  <td className="p-2 font-medium">Eficiência (g/W)</td>
                  {scenarios.map((scenario) => (
                    <td key={scenario.id} className="text-center p-2">
                      {scenario.results.gramas_por_watt.toFixed(2)}
                    </td>
                  ))}
                </tr>
                <tr>
                  <td className="p-2 font-medium">Investimento Total</td>
                  {scenarios.map((scenario) => (
                    <td key={scenario.id} className="text-center p-2">
                      {formatCurrency(scenario.results.custo_total_investimento)}
                    </td>
                  ))}
                </tr>
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
