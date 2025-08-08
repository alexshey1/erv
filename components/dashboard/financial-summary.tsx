"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ArrowUpRight, ArrowDownRight } from "lucide-react"

interface FinancialSummaryProps {
  results: any
}

export function FinancialSummary({ results }: FinancialSummaryProps) {
  const formatCurrency = (value: number) =>
    new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(value)

  const financialItems = [
    {
      label: "Investimento Inicial",
      value: results.custo_total_investimento,
      type: "expense",
      icon: ArrowDownRight,
    },
    {
      label: "Custo Operacional/Ciclo",
      value: results.custo_operacional_total_ciclo,
      type: "expense",
      icon: ArrowDownRight,
    },
    {
      label: "Receita Bruta/Ciclo",
      value: results.receita_bruta_ciclo,
      type: "income",
      icon: ArrowUpRight,
    },
    {
      label: "Lucro Líquido/Ciclo",
      value: results.lucro_liquido_ciclo,
      type: results.lucro_liquido_ciclo > 0 ? "income" : "expense",
      icon: results.lucro_liquido_ciclo > 0 ? ArrowUpRight : ArrowDownRight,
    },
  ]

  const efficiencyMetrics = [
    {
      label: "Custo por Grama",
      value: formatCurrency(results.custo_por_grama),
      subtitle: "Custo de produção unitário",
    },
    {
      label: "Gramas por m²",
      value: `${results.gramas_por_m2.toFixed(0)} g/m²`,
      subtitle: "Produtividade por área",
    },
    {
      label: "Período de Payback",
      value: `${results.periodo_payback_ciclos.toFixed(1)} ciclos`,
      subtitle: "Tempo para recuperar investimento",
    },
    {
      label: "ROI Anual",
      value: `${results.roi_investimento_1_ano.toFixed(1)}%`,
      subtitle: "Retorno sobre investimento",
    },
  ]

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
      {/* Financial Flow */}
      <Card className="shadow-sm">
        <CardHeader>
          <CardTitle className="text-lg font-semibold">Fluxo Financeiro</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {financialItems.map((item, index) => {
            const Icon = item.icon
            return (
              <div key={index} className="flex items-center justify-between p-4 rounded-lg bg-gray-50">
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-full ${item.type === "income" ? "bg-green-100" : "bg-red-100"}`}>
                    <Icon className={`h-4 w-4 ${item.type === "income" ? "text-green-600" : "text-red-600"}`} />
                  </div>
                  <span className="font-medium text-gray-900">{item.label}</span>
                </div>
                <span className={`font-bold ${item.type === "income" ? "text-green-600" : "text-red-600"}`}>
                  {formatCurrency(item.value)}
                </span>
              </div>
            )
          })}
        </CardContent>
      </Card>

      {/* Efficiency Metrics */}
      <Card className="shadow-sm">
        <CardHeader>
          <CardTitle className="text-lg font-semibold">Métricas de Eficiência</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {efficiencyMetrics.map((metric, index) => (
            <div key={index} className="p-4 rounded-lg bg-gray-50">
              <div className="flex items-center justify-between mb-1">
                <span className="font-medium text-gray-900">{metric.label}</span>
                <span className="font-bold text-blue-600">{metric.value}</span>
              </div>
              <p className="text-sm text-gray-500">{metric.subtitle}</p>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  )
}
