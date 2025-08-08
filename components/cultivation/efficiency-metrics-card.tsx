"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { 
  Zap, 
  TrendingUp, 
  Target, 
  Clock,
  Leaf,
  Flower,
  Droplet,
  BarChart3
} from "lucide-react"

interface EfficiencyMetricsCardProps {
  cultivation: {
    area_m2?: number
    potencia_watts?: number
    producao_por_planta_g?: number
    dias_vegetativo?: number
    dias_racao?: number
    dias_secagem_cura?: number
    horas_luz_flor?: number
  }
}

export function EfficiencyMetricsCard({ cultivation }: EfficiencyMetricsCardProps) {
  const area = cultivation.area_m2 || 2.25
  const potencia = cultivation.potencia_watts || 480
  const producaoPorPlanta = cultivation.producao_por_planta_g || 80
  const numPlantas = (cultivation as any).num_plantas || 6

  // Cálculos de eficiência
  const eficienciaWm2 = potencia / area
  const producaoTotal = producaoPorPlanta * numPlantas
  const eficienciaGporW = producaoTotal / potencia
  const eficienciaGporM2 = producaoTotal / area

  // Duração das fases
  const diasVeg = cultivation.dias_vegetativo || 60
  const diasFlor = cultivation.dias_racao || 70
  const diasCura = cultivation.dias_secagem_cura || 20
  const duracaoTotal = diasVeg + diasFlor + diasCura
  const diasComLuz = diasVeg + diasFlor // Apenas veg e floração usam luz

  // Eficiência temporal (apenas dias com luz)
  const eficienciaTemporal = producaoTotal / diasComLuz // g/dia com luz

  return (
    <Card className="shadow-sm hover:shadow-md transition-shadow duration-300">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-lg">
          <Zap className="h-5 w-5 text-green-600" />
          Métricas de Eficiência
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Eficiência Energética */}
        <div className="space-y-2">
          <h4 className="text-sm font-medium text-gray-700 flex items-center gap-1">
            <Target className="h-4 w-4 text-blue-500" />
            Eficiência Energética
          </h4>
          <div className="grid grid-cols-2 gap-2 text-xs">
            <div className="flex justify-between">
              <span>W/m²:</span>
              <span className="font-medium">{eficienciaWm2.toFixed(0)}</span>
            </div>
            <div className="flex justify-between">
              <span>g/W:</span>
              <span className="font-medium">{eficienciaGporW.toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
              <span>g/m²:</span>
              <span className="font-medium">{eficienciaGporM2.toFixed(0)}</span>
            </div>
            <div className="flex justify-between">
              <span>g/dia (com luz):</span>
              <span className="font-medium">{eficienciaTemporal.toFixed(1)}</span>
            </div>
          </div>
        </div>

        {/* Distribuição Temporal */}
        <div className="space-y-2">
          <h4 className="text-sm font-medium text-gray-700 flex items-center gap-1">
            <Clock className="h-4 w-4 text-purple-500" />
            Distribuição Temporal
          </h4>
          <div className="grid grid-cols-3 gap-2 text-xs">
            <div className="text-center">
              <div className="flex items-center justify-center gap-1 mb-1">
                <Leaf className="h-3 w-3 text-green-500" />
                <span>Veg</span>
              </div>
              <div className="font-medium text-green-600">
                {((diasVeg / duracaoTotal) * 100).toFixed(0)}%
              </div>
            </div>
            <div className="text-center">
              <div className="flex items-center justify-center gap-1 mb-1">
                <Flower className="h-3 w-3 text-purple-500" />
                <span>Flor</span>
              </div>
              <div className="font-medium text-purple-600">
                {((diasFlor / duracaoTotal) * 100).toFixed(0)}%
              </div>
            </div>
            <div className="text-center">
              <div className="flex items-center justify-center gap-1 mb-1">
                <Droplet className="h-3 w-3 text-blue-500" />
                <span>Cura</span>
              </div>
              <div className="font-medium text-blue-600">
                {((diasCura / duracaoTotal) * 100).toFixed(0)}%
              </div>
            </div>
          </div>
        </div>

        {/* Resumo */}
        <div className="pt-2 border-t border-gray-100">
          <div className="flex justify-between items-center text-sm">
            <span className="text-gray-600">Produção Total:</span>
            <span className="font-medium text-green-600">{producaoTotal}g</span>
          </div>
        </div>
      </CardContent>
    </Card>
  )
} 