import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"

interface ChartsSectionProps {
  results: any
  cycleParams: any
}

export function ChartsSection({ results, cycleParams }: ChartsSectionProps) {
  const formatCurrency = (value: number) =>
    new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(value)

  const totalDays = results.duracao_total_ciclo
  const vegProgress = (cycleParams.dias_vegetativo / totalDays) * 100
  const florProgress = (cycleParams.dias_floracao / totalDays) * 100
  const curaProgress = (cycleParams.dias_secagem_cura / totalDays) * 100

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Custos Operacionais */}
      <Card>
        <CardHeader>
          <CardTitle>Distribuição de Custos Operacionais</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {Object.entries(results.detalhe_custos_operacionais).map(([key, value]: [string, any]) => {
            const percentage = (value / results.custo_operacional_total_ciclo) * 100
            return (
              <div key={key} className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium">{key}</span>
                  <span className="text-sm text-muted-foreground">
                    {formatCurrency(value)} ({percentage.toFixed(1)}%)
                  </span>
                </div>
                <Progress value={percentage} className="h-2" />
              </div>
            )
          })}
        </CardContent>
      </Card>

      {/* Timeline do Ciclo */}
      <Card>
        <CardHeader>
          <CardTitle>Timeline do Ciclo ({totalDays} dias)</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium">Vegetativo</span>
              <Badge variant="outline" className="bg-green-50">
                {cycleParams.dias_vegetativo} dias
              </Badge>
            </div>
            <Progress value={vegProgress} className="h-3 bg-green-100" />
          </div>

          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium">Floração</span>
              <Badge variant="outline" className="bg-yellow-50">
                {cycleParams.dias_floracao} dias
              </Badge>
            </div>
            <Progress value={florProgress} className="h-3 bg-yellow-100" />
          </div>

          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium">Secagem/Cura</span>
              <Badge variant="outline" className="bg-orange-50">
                {cycleParams.dias_secagem_cura} dias
              </Badge>
            </div>
            <Progress value={curaProgress} className="h-3 bg-orange-100" />
          </div>
        </CardContent>
      </Card>

      {/* Comparação de Custos */}
      <Card className="lg:col-span-2">
        <CardHeader>
          <CardTitle>Análise Financeira</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center p-4 bg-red-50 rounded-lg">
              <div className="text-2xl font-bold text-red-600">{formatCurrency(results.custo_total_investimento)}</div>
              <div className="text-sm text-red-700 mt-1">Investimento Inicial</div>
            </div>

            <div className="text-center p-4 bg-orange-50 rounded-lg">
              <div className="text-2xl font-bold text-orange-600">
                {formatCurrency(results.custo_operacional_total_ciclo)}
              </div>
              <div className="text-sm text-orange-700 mt-1">Custo por Ciclo</div>
            </div>

            <div className="text-center p-4 bg-green-50 rounded-lg">
              <div className="text-2xl font-bold text-green-600">{formatCurrency(results.lucro_liquido_ciclo)}</div>
              <div className="text-sm text-green-700 mt-1">Lucro por Ciclo</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
