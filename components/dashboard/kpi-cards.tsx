"use client"

import { Card, CardContent } from "@/components/ui/card"
import { TrendingUp, TrendingDown, DollarSign, Clock, Zap } from "lucide-react"
import { calculateResults } from "@/lib/cultivation-calculator";

interface KPICardsProps {
  results: any
}

export function KPICards({ results, setupParams, cycleParams, marketParams }: any) {
  const formatCurrency = (value: number) =>
    new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(value)

  // Sempre use o valor de results.lucro_liquido_ciclo, igual ao card de resultados detalhados
  const lucro_liquido_ciclo = results.lucro_liquido_ciclo;

  const kpis = [
    {
      title: "Economia por ciclo",
      value: formatCurrency(lucro_liquido_ciclo),
      icon: DollarSign,
      trend: lucro_liquido_ciclo > 0 ? "up" : "down",
      color: lucro_liquido_ciclo > 0 ? "green" : "red",
      subtitle: `Receita: ${formatCurrency(results.receita_bruta_ciclo)}`,
    },
    {
      title: "Payback",
      value: `${results.periodo_payback_ciclos.toFixed(1)} ciclos`,
      icon: Clock,
      trend: results.periodo_payback_ciclos < 10 ? "up" : "down", // Lower is better for payback
      color: "orange",
      subtitle: "Tempo para recuperar investimento",
    },
    {
      title: "Eficiência",
      value: `${results.gramas_por_watt.toFixed(2)} g/W`,
      icon: Zap,
      trend: results.gramas_por_watt > 1 ? "up" : "down", // Higher g/W is better
      color: "purple",
      subtitle: "Gramas por Watt",
    },
    {
      title: "Custo Total",
      value: formatCurrency((results.custo_total_investimento || 0) + (results.custo_operacional_total_ciclo || 0)),
      icon: DollarSign,
      trend: "down",
      color: "yellow",
      subtitle: "Setup + Operacional",
    },
  ]

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {kpis.map((kpi, index) => {
        const Icon = kpi.icon
        const TrendIcon = kpi.trend === "up" ? TrendingUp : TrendingDown

        return (
          <Card key={index} className="shadow-sm hover:shadow-md transition-shadow duration-200">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className={`p-3 rounded-full bg-${kpi.color}-100 dark:bg-${kpi.color}-900`}>
                  <Icon className={`h-6 w-6 text-${kpi.color}-600 dark:text-${kpi.color}-300`} />
                </div>
                <TrendIcon
                  className={`h-4 w-4 ${
                    kpi.trend === "up" ? "text-green-500" : "text-red-500"
                  } transition-transform duration-200`}
                />
              </div>

              <div className="space-y-1">
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">{kpi.title}</p>
                <p className={`text-2xl font-bold text-${kpi.color}-600 dark:text-${kpi.color}-300`}>{kpi.value}</p>
                <p className="text-xs text-gray-500 dark:text-gray-500">{kpi.subtitle}</p>
              </div>
            </CardContent>
          </Card>
        )
      })}
    </div>
  )
}
