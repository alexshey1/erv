import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

interface ResultsTableProps {
  results: any
}

export function ResultsTable({ results }: ResultsTableProps) {
  const formatCurrency = (value: number) =>
    new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(value)

  const formatNumber = (value: number, decimals = 2) => value.toFixed(decimals)

  return (
    <Card>
      <CardHeader>
        <CardTitle>Resultados Detalhados</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Métricas Financeiras */}
          <div>
            <h3 className="font-semibold text-lg mb-4 flex items-center gap-2">💰 Métricas Financeiras</h3>
            <div className="space-y-3">
              <div className="flex justify-between items-center py-2 border-b">
                <span className="text-sm">Investimento Total</span>
                <Badge variant="outline">{formatCurrency(results.custo_total_investimento)}</Badge>
              </div>
              <div className="flex justify-between items-center py-2 border-b">
                <span className="text-sm">Custo Operacional/Ciclo</span>
                <Badge variant="outline">{formatCurrency(results.custo_operacional_total_ciclo)}</Badge>
              </div>
              <div className="flex justify-between items-center py-2 border-b">
                <span className="text-sm">Receita Bruta/Ciclo</span>
                <Badge variant="outline">{formatCurrency(results.receita_bruta_ciclo)}</Badge>
              </div>
              <div className="flex justify-between items-center py-2 border-b">
                <span className="text-sm font-medium">Lucro Líquido/Ciclo</span>
                <Badge variant={results.lucro_liquido_ciclo > 0 ? "default" : "destructive"}>
                  {formatCurrency(results.lucro_liquido_ciclo)}
                </Badge>
              </div>
            </div>
          </div>

          {/* Métricas de Eficiência */}
          <div>
            <h3 className="font-semibold text-lg mb-4 flex items-center gap-2">⚡ Métricas de Eficiência</h3>
            <div className="space-y-3">
              <div className="flex justify-between items-center py-2 border-b">
                <span className="text-sm">Custo por Grama</span>
                <Badge variant="outline">{formatCurrency(results.custo_por_grama)}</Badge>
              </div>
              <div className="flex justify-between items-center py-2 border-b">
                <span className="text-sm">Gramas por Watt</span>
                <Badge variant="outline">{formatNumber(results.gramas_por_watt)} g/W</Badge>
              </div>
              <div className="flex justify-between items-center py-2 border-b">
                <span className="text-sm">Gramas por m²</span>
                <Badge variant="outline">{formatNumber(results.gramas_por_m2, 0)} g/m²</Badge>
              </div>
              <div className="flex justify-between items-center py-2 border-b">
                <span className="text-sm">Duração do Ciclo</span>
                <Badge variant="outline">{results.duracao_total_ciclo} dias</Badge>
              </div>
            </div>
          </div>
        </div>

        {/* Métricas de Negócio */}
        <div className="mt-8">
          <h3 className="font-semibold text-lg mb-4 flex items-center gap-2">📊 Métricas de Negócio</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 bg-blue-50 rounded-lg">
              <div className="text-sm text-blue-700">Período de Payback</div>
              <div className="text-2xl font-bold text-blue-600">
                {formatNumber(results.periodo_payback_ciclos, 1)} ciclos
              </div>
            </div>
            <div className="p-4 bg-green-50 rounded-lg">
              <div className="text-sm text-green-700">ROI (1º Ano)</div>
              <div className="text-2xl font-bold text-green-600">
                {formatNumber(results.roi_investimento_1_ano, 1)}%
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
