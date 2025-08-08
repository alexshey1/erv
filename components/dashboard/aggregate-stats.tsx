"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Leaf, Clock, CheckCircle, Timer } from "lucide-react"
import type { CultivationSummary } from "@/lib/mock-data"

interface AggregateStatsProps {
  cultivations: CultivationSummary[]
}

export function AggregateStats({ cultivations }: AggregateStatsProps) {
  // Cálculos das estatísticas
  const totalCultivations = cultivations.length
  const activeCultivations = cultivations.filter(c => c.status === "active").length
  const completedCultivations = cultivations.filter(c => c.status === "completed").length
  const totalYield = cultivations.reduce((sum, c) => sum + c.yield_g, 0)
  const avgYield = totalCultivations > 0 ? totalYield / totalCultivations : 0
  const totalDuration = cultivations.reduce((sum, c) => sum + c.durationDays, 0)
  const avgDuration = totalCultivations > 0 ? totalDuration / totalCultivations : 0

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
      {/* Total de Cultivos */}
      <Card className="shadow-sm border-l-4 border-l-blue-500">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
            <Leaf className="h-4 w-4" />
            Total de Cultivos
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-blue-600">{totalCultivations}</div>
          <div className="flex items-center gap-2 mt-2">
            <Badge variant="secondary" className="text-xs">
              {activeCultivations} ativos
            </Badge>
          </div>
        </CardContent>
      </Card>

      {/* Cultivos Concluídos */}
      <Card className="shadow-sm border-l-4 border-l-green-500">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
            <CheckCircle className="h-4 w-4 text-green-600" />
            Cultivos Concluídos
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-green-600">{completedCultivations}</div>
          <div className="text-sm text-muted-foreground mt-2">Ciclos finalizados com sucesso</div>
        </CardContent>
      </Card>

      {/* Rendimento Médio */}
      <Card className="shadow-sm border-l-4 border-l-orange-500">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
            <Clock className="h-4 w-4" />
            Rendimento Médio
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-orange-600">{avgYield.toFixed(1)}g</div>
          <div className="flex items-center gap-2 mt-2">
            <span className="text-sm text-muted-foreground">
              Total: {totalYield.toFixed(1)}g
            </span>
          </div>
        </CardContent>
      </Card>

      {/* Tempo Médio */}
      <Card className="shadow-sm border-l-4 border-l-purple-500">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
            <Timer className="h-4 w-4 text-purple-600" />
            Tempo Médio
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-purple-600">{avgDuration.toFixed(0)} dias</div>
          <div className="text-sm text-muted-foreground mt-2">Tempo médio de todos os cultivos</div>
        </CardContent>
      </Card>
    </div>
  )
} 