"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { 
  Calendar, 
  Clock, 
  Leaf, 
  Flower, 
  Scissors as Harvest, 
  TrendingUp, 
  AlertTriangle, 
  CheckCircle,
  Zap,
  Target,
  BarChart3,
  Info
} from "lucide-react"
import { useAdaptiveCultivation } from "@/hooks/useAdaptiveCultivation"
import { PlantType } from "@/types/plant-genetics"

interface AdaptiveCultivationDashboardProps {
  cultivationId: string
  startDate: string
  plantType: PlantType
  geneticsName?: string
  setupParams?: any
  marketParams?: any
  onConfigChange?: (config: any) => void
}

export function AdaptiveCultivationDashboard({
  cultivationId,
  startDate,
  plantType,
  geneticsName,
  setupParams,
  marketParams,
  onConfigChange
}: AdaptiveCultivationDashboardProps) {
  const {
    config,
    phaseInfo,
    harvestPrediction,
    efficiencyMetrics,
    financialResults,
    recommendations,
    totalDuration,
    cyclesPerYear,
    totalYearlyYield,
    traditionalComparison,
    validation,
    isAutoflowering,
    isPhotoperiod,
    criticalAlerts
  } = useAdaptiveCultivation({
    cultivationId,
    startDate,
    plantType,
    geneticsName,
    setupParams,
    marketParams
  })

  const getPhaseIcon = (phase: string) => {
    switch (phase) {
      case 'germination':
      case 'seedling':
        return <div className="w-2 h-2 bg-yellow-400 rounded-full" />
      case 'vegetative':
        return <Leaf className="h-4 w-4 text-green-500" />
      case 'flowering':
        return <Flower className="h-4 w-4 text-purple-500" />
      case 'drying':
      case 'curing':
        return <Clock className="h-4 w-4 text-orange-500" />
      case 'completed':
        return <CheckCircle className="h-4 w-4 text-green-600" />
      default:
        return <div className="w-2 h-2 bg-gray-400 rounded-full" />
    }
  }

  const getPhaseColor = (phase: string) => {
    switch (phase) {
      case 'germination':
      case 'seedling':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200'
      case 'vegetative':
        return 'bg-green-100 text-green-800 border-green-200'
      case 'flowering':
        return 'bg-purple-100 text-purple-800 border-purple-200'
      case 'drying':
      case 'curing':
        return 'bg-orange-100 text-orange-800 border-orange-200'
      case 'completed':
        return 'bg-emerald-100 text-emerald-800 border-emerald-200'
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    })
  }

  return (
    <div className="space-y-6">
      {/* Alertas Críticos */}
      {criticalAlerts.length > 0 && (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            <div className="space-y-1">
              {criticalAlerts.map((alert, index) => (
                <div key={index}>{alert}</div>
              ))}
            </div>
          </AlertDescription>
        </Alert>
      )}

      {/* Status Atual */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              {getPhaseIcon(phaseInfo.phase)}
              Fase Atual
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <Badge className={getPhaseColor(phaseInfo.phase)}>
                {phaseInfo.phaseDescription}
              </Badge>
              <div className="text-sm text-muted-foreground">
                Dia {phaseInfo.daysInCurrentPhase} desta fase
              </div>
              <Progress value={phaseInfo.progressPercent} className="h-2" />
              <div className="text-xs text-muted-foreground">
                {Math.round(phaseInfo.progressPercent)}% do ciclo completo
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              Cronograma
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Dias decorridos:</span>
                <span className="font-medium">{phaseInfo.daysSinceStart}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span>Dias restantes:</span>
                <span className="font-medium">{phaseInfo.expectedRemainingDays}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span>Total previsto:</span>
                <span className="font-medium">{totalDuration} dias</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Target className="h-4 w-4" />
              Tipo de Cultivo
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <Badge variant={isAutoflowering ? 'default' : 'secondary'}>
                {isAutoflowering ? 'Automática' : isPhotoperiod ? 'Fotoperíodo' : 'Fast Version'}
              </Badge>
              {config.genetics_name && (
                <div className="text-sm text-muted-foreground">
                  Genética: {config.genetics_name}
                </div>
              )}
              <div className="text-xs text-muted-foreground">
                {cyclesPerYear} ciclos/ano possíveis
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Previsões de Colheita */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Harvest className="h-5 w-5 text-orange-500" />
            Previsões de Colheita
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center p-4 bg-muted rounded-lg">
              <div className="text-sm text-muted-foreground mb-1">Colheita Prevista</div>
              <div className="font-medium">{formatDate(harvestPrediction.estimatedHarvestDate)}</div>
              <div className="text-xs text-muted-foreground mt-1">
                Confiança: {harvestPrediction.confidence === 'high' ? 'Alta' : 
                           harvestPrediction.confidence === 'medium' ? 'Média' : 'Baixa'}
              </div>
            </div>
            <div className="text-center p-4 bg-muted rounded-lg">
              <div className="text-sm text-muted-foreground mb-1">Secagem Completa</div>
              <div className="font-medium">{formatDate(harvestPrediction.estimatedDryDate)}</div>
            </div>
            <div className="text-center p-4 bg-muted rounded-lg">
              <div className="text-sm text-muted-foreground mb-1">Cura Completa</div>
              <div className="font-medium">{formatDate(harvestPrediction.estimatedCureDate)}</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Métricas de Eficiência */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5 text-blue-500" />
              Eficiência do Ciclo
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-sm">Eficiência Temporal</span>
                <span className="font-medium">{Math.round(efficiencyMetrics.timeEfficiency)}%</span>
              </div>
              <Progress value={efficiencyMetrics.timeEfficiency} className="h-2" />
            </div>
            
            {financialResults && (
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-sm">Ciclos por Ano</span>
                  <span className="font-medium">{cyclesPerYear}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm">Produção Anual</span>
                  <span className="font-medium">{totalYearlyYield}g</span>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {financialResults && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-green-500" />
                Análise Financeira
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4 text-center">
                <div className="p-3 bg-muted rounded-lg">
                  <div className="text-lg font-bold text-green-600">
                    R$ {financialResults.lucro_liquido_ciclo.toFixed(0)}
                  </div>
                  <div className="text-xs text-muted-foreground">Lucro/Ciclo</div>
                </div>
                <div className="p-3 bg-muted rounded-lg">
                  <div className="text-lg font-bold text-blue-600">
                    R$ {(financialResults.lucro_liquido_ciclo * cyclesPerYear).toFixed(0)}
                  </div>
                  <div className="text-xs text-muted-foreground">Lucro/Ano</div>
                </div>
              </div>
              
              <div className="space-y-2">
                <div className="flex justify-between items-center text-sm">
                  <span>Custo por Grama</span>
                  <span className="font-medium">R$ {financialResults.custo_por_grama.toFixed(2)}</span>
                </div>
                <div className="flex justify-between items-center text-sm">
                  <span>ROI (1º Ano)</span>
                  <span className="font-medium">{financialResults.roi_investimento_1_ano.toFixed(1)}%</span>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Comparação com Método Tradicional */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5 text-purple-500" />
            Comparação com Ciclo Tradicional
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center p-4 bg-muted rounded-lg">
              <div className="text-sm text-muted-foreground mb-1">Seu Ciclo</div>
              <div className="font-medium">{totalDuration} dias</div>
            </div>
            <div className="text-center p-4 bg-muted rounded-lg">
              <div className="text-sm text-muted-foreground mb-1">Tradicional</div>
              <div className="font-medium">{traditionalComparison.traditionalDuration} dias</div>
            </div>
            <div className="text-center p-4 bg-muted rounded-lg">
              <div className="text-sm text-muted-foreground mb-1">Vantagem</div>
              <div className={`font-medium ${traditionalComparison.timeAdvantage > 0 ? 'text-green-600' : 'text-red-600'}`}>
                {traditionalComparison.timeAdvantage > 0 ? '+' : ''}{traditionalComparison.timeAdvantage}%
              </div>
            </div>
          </div>
          
          {traditionalComparison.moreCycles > 0 && (
            <div className="mt-4 p-3 bg-green-50 rounded-lg border border-green-200">
              <div className="text-sm text-green-800">
                ✨ Você pode fazer <strong>{traditionalComparison.moreCycles} ciclos a mais</strong> por ano com esta configuração!
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Recomendações */}
      {recommendations.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Info className="h-5 w-5 text-blue-500" />
              Recomendações Inteligentes
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {recommendations.slice(0, 5).map((recommendation, index) => (
                <div key={index} className="flex items-start gap-2 p-3 bg-muted rounded-lg">
                  <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0" />
                  <span className="text-sm">{recommendation}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Problemas de Validação */}
      {!validation.valid && (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            <div className="space-y-1">
              <div className="font-medium">Problemas de Configuração:</div>
              {validation.warnings.map((warning, index) => (
                <div key={index} className="text-sm">• {warning}</div>
              ))}
            </div>
          </AlertDescription>
        </Alert>
      )}
    </div>
  )
}
