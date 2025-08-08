"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { 
  Settings, 
  Lightbulb, 
  Home, 
  Fan, 
  Zap,
  Clock,
  Leaf,
  Flower,
  Droplet
} from "lucide-react"

interface SetupInfoCardProps {
  cultivation: {
    area_m2?: number
    custo_equip_iluminacao?: number
    custo_tenda_estrutura?: number
    custo_ventilacao_exaustao?: number
    custo_outros_equipamentos?: number
    potencia_watts?: number
    dias_vegetativo?: number
    dias_racao?: number
    dias_secagem_cura?: number
    horas_luz_flor?: number
  }
}

export function SetupInfoCard({ cultivation }: SetupInfoCardProps) {
  const formatCurrency = (value: number) =>
    new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(value)

  const formatWattage = (watts: number) => {
    if (watts >= 1000) return `${(watts / 1000).toFixed(1)}kW`
    return `${watts}W`
  }

  const totalSetupCost = 
    (cultivation.custo_equip_iluminacao || 0) + 
    (cultivation.custo_tenda_estrutura || 0) + 
    (cultivation.custo_ventilacao_exaustao || 0) + 
    (cultivation.custo_outros_equipamentos || 0)

  const area = cultivation.area_m2 || 2.25
  const potencia = cultivation.potencia_watts || 480
  const eficienciaWm2 = potencia / area

  return (
    <Card className="shadow-sm hover:shadow-md transition-shadow duration-300">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-lg">
          <Settings className="h-5 w-5 text-green-600" />
          Configuração do Setup
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Equipamentos */}
        <div className="space-y-2">
          <h4 className="text-sm font-medium text-gray-700 flex items-center gap-1">
            <Lightbulb className="h-4 w-4 text-yellow-500" />
            Equipamentos
          </h4>
          <div className="grid grid-cols-2 gap-2 text-xs">
            <div className="flex justify-between">
              <span>Iluminação:</span>
              <span className="font-medium">{formatWattage(potencia)}</span>
            </div>
            <div className="flex justify-between">
              <span>Área:</span>
              <span className="font-medium">{area}m²</span>
            </div>
            <div className="flex justify-between">
              <span>Eficiência:</span>
              <span className="font-medium">{eficienciaWm2.toFixed(0)}W/m²</span>
            </div>
            <div className="flex justify-between">
              <span>Total:</span>
              <span className="font-medium">{formatCurrency(totalSetupCost)}</span>
            </div>
          </div>
        </div>

        {/* Parâmetros do Ciclo */}
        <div className="space-y-2">
          <h4 className="text-sm font-medium text-gray-700 flex items-center gap-1">
            <Clock className="h-4 w-4 text-blue-500" />
            Parâmetros do Ciclo
          </h4>
          <div className="grid grid-cols-3 gap-2 text-xs">
            <div className="text-center">
              <div className="flex items-center justify-center gap-1 mb-1">
                <Leaf className="h-3 w-3 text-green-500" />
                <span>Veg</span>
              </div>
              <div className="font-medium text-green-600">
                {cultivation.dias_vegetativo || 60}d
              </div>
              <div className="text-xs text-gray-500">18h luz</div>
            </div>
            <div className="text-center">
              <div className="flex items-center justify-center gap-1 mb-1">
                <Flower className="h-3 w-3 text-purple-500" />
                <span>Flor</span>
              </div>
              <div className="font-medium text-purple-600">
                {cultivation.dias_racao || 70}d
              </div>
              <div className="text-xs text-gray-500">{cultivation.horas_luz_flor || 12}h luz</div>
            </div>
            <div className="text-center">
              <div className="flex items-center justify-center gap-1 mb-1">
                <Droplet className="h-3 w-3 text-blue-500" />
                <span>Cura</span>
              </div>
              <div className="font-medium text-blue-600">
                {cultivation.dias_secagem_cura || 20}d
              </div>
              <div className="text-xs text-gray-500">Sem luz</div>
            </div>
          </div>
        </div>

        {/* Resumo */}
        <div className="pt-2 border-t border-gray-100">
          <div className="flex justify-between items-center text-sm">
            <span className="text-gray-600">Duração Total:</span>
            <span className="font-medium">
              {(cultivation.dias_vegetativo || 60) + (cultivation.dias_racao || 70) + (cultivation.dias_secagem_cura || 20)} dias
            </span>
          </div>
          <div className="flex justify-between items-center text-sm">
            <span className="text-gray-600">Dias com Luz:</span>
            <span className="font-medium">
              {(cultivation.dias_vegetativo || 60) + (cultivation.dias_racao || 70)} dias
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  )
} 