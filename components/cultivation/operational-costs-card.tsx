"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { 
  DollarSign, 
  Zap, 
  Package, 
  Leaf, 
  FlaskConical,
  Settings,
  TrendingUp
} from "lucide-react"

interface OperationalCostsCardProps {
  cultivation: {
    preco_kwh?: number
    custo_sementes_clones?: number
    custo_substrato?: number
    custo_nutrientes?: number
    custos_operacionais_misc?: number
    potencia_watts?: number
    dias_vegetativo?: number
    dias_racao?: number
    dias_secagem_cura?: number
    horas_luz_flor?: number
  }
}

export function OperationalCostsCard({ cultivation }: OperationalCostsCardProps) {
  const formatCurrency = (value: number) =>
    new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(value)

  // Calcular consumo de energia
  const potencia = cultivation.potencia_watts || 480
  const precoKwh = cultivation.preco_kwh || 0.95
  const diasVeg = cultivation.dias_vegetativo || 60
  const diasFlor = cultivation.dias_racao || 70
  const diasCura = cultivation.dias_secagem_cura || 20
  const horasLuzVeg = (cultivation as any).horas_luz_veg || 18
  const horasLuzFlor = cultivation.horas_luz_flor || 12

  // Apenas veg e floração consomem energia (cura não usa luz)
  const consumoKwhVeg = (potencia / 1000) * horasLuzVeg * diasVeg
  const consumoKwhFlor = (potencia / 1000) * horasLuzFlor * diasFlor
  const consumoTotal = consumoKwhVeg + consumoKwhFlor
  const custoEnergia = consumoTotal * precoKwh

  // Custos operacionais
  const custoSementes = cultivation.custo_sementes_clones || 50
  const custoSubstrato = cultivation.custo_substrato || 120
  const custoNutrientes = cultivation.custo_nutrientes || 350
  const custoOutros = cultivation.custos_operacionais_misc || 10

  const totalOperacional = custoEnergia + custoSementes + custoSubstrato + custoNutrientes + custoOutros

  return (
    <Card className="shadow-sm hover:shadow-md transition-shadow duration-300">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-lg">
          <DollarSign className="h-5 w-5 text-green-600" />
          Custos Operacionais
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Custos por Categoria */}
        <div className="space-y-2">
          <h4 className="text-sm font-medium text-gray-700 flex items-center gap-1">
            <TrendingUp className="h-4 w-4 text-blue-500" />
            Por Ciclo
          </h4>
          <div className="grid grid-cols-2 gap-2 text-xs">
            <div className="flex justify-between">
              <span className="flex items-center gap-1">
                <Zap className="h-3 w-3 text-yellow-500" />
                Energia:
              </span>
              <span className="font-medium">{formatCurrency(custoEnergia)}</span>
            </div>
            <div className="flex justify-between">
              <span className="flex items-center gap-1">
                <Package className="h-3 w-3 text-orange-500" />
                Sementes:
              </span>
              <span className="font-medium">{formatCurrency(custoSementes)}</span>
            </div>
            <div className="flex justify-between">
              <span className="flex items-center gap-1">
                <Leaf className="h-3 w-3 text-brown-500" />
                Substrato:
              </span>
              <span className="font-medium">{formatCurrency(custoSubstrato)}</span>
            </div>
            <div className="flex justify-between">
              <span className="flex items-center gap-1">
                <FlaskConical className="h-3 w-3 text-purple-500" />
                Nutrientes:
              </span>
              <span className="font-medium">{formatCurrency(custoNutrientes)}</span>
            </div>
          </div>
        </div>

        {/* Consumo Energético */}
        <div className="space-y-2">
          <h4 className="text-sm font-medium text-gray-700 flex items-center gap-1">
            <Zap className="h-4 w-4 text-yellow-500" />
            Consumo Energético
          </h4>
          <div className="grid grid-cols-2 gap-2 text-xs">
            <div className="flex justify-between">
              <span>Total kWh:</span>
              <span className="font-medium">{consumoTotal.toFixed(0)} kWh</span>
            </div>
            <div className="flex justify-between">
              <span>Por dia (com luz):</span>
              <span className="font-medium">{(consumoTotal / (diasVeg + diasFlor)).toFixed(1)} kWh</span>
            </div>
            <div className="flex justify-between">
              <span>Custo/dia (com luz):</span>
              <span className="font-medium">{formatCurrency((custoEnergia / (diasVeg + diasFlor)))}</span>
            </div>
            <div className="flex justify-between">
              <span>Preço kWh:</span>
              <span className="font-medium">R$ {precoKwh}</span>
            </div>
          </div>
        </div>

        {/* Resumo */}
        <div className="pt-2 border-t border-gray-100">
          <div className="flex justify-between items-center text-sm">
            <span className="text-gray-600">Total Operacional:</span>
            <span className="font-medium text-green-600">{formatCurrency(totalOperacional)}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  )
} 