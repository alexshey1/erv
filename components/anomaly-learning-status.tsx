"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { 
  Brain, 
  CheckCircle, 
  Clock, 
  TrendingUp,
  Database,
  Lightbulb
} from "lucide-react"
import type { CultivationSummary } from "@/lib/mock-data"
import type { CultivationPattern } from "@/lib/anomaly-detector"

interface AnomalyLearningStatusProps {
  cultivations: CultivationSummary[]
  patterns?: CultivationPattern[]
}

export function AnomalyLearningStatus({ 
  cultivations, 
  patterns = [] 
}: AnomalyLearningStatusProps) {
  const [learningProgress, setLearningProgress] = useState(0)
  const [isLearning, setIsLearning] = useState(false)

  // Calcular progresso de aprendizado baseado em dados reais
  useEffect(() => {
    const successfulCultivations = cultivations.filter(
      c => c.status === "completed" && c.yield_g > 0 && c.profit_brl > 0
    )
    
    const activeCultivations = cultivations.filter(c => c.status === "active")
    const totalCultivations = cultivations.length
    const patternsLearned = patterns.length
    const successfulCount = successfulCultivations.length
    
    let progress = 0
    
    // Curva de aprendizado mais realista e gradual
    if (totalCultivations === 0) {
      // Nenhum cultivo ainda
      progress = 0
    } else {
      // Base: 10% por ter começado
      progress = 10
      
      // +5% por cada cultivo ativo (coletando dados)
      progress += activeCultivations.length * 5
      
      // +8% por cada cultivo bem-sucedido (dados de qualidade)
      progress += successfulCount * 8
      
      // +3% por cada padrão aprendido (conhecimento extraído)
      progress += patternsLearned * 3
      
      // Bônus por diversidade de genéticas
      const uniqueStrains = new Set(cultivations.map(c => c.seedStrain)).size
      progress += Math.min(uniqueStrains * 2, 10) // Máximo 10% por diversidade
      
      // Bônus por consistência (múltiplos cultivos bem-sucedidos)
      if (successfulCount >= 2) progress += 5
      if (successfulCount >= 3) progress += 5
      if (successfulCount >= 5) progress += 5
      
      // Limitar a 100%
      progress = Math.min(progress, 100)
    }
    
    setLearningProgress(progress)
    
    // Sistema considerado "aprendendo" até 80% de progresso
    setIsLearning(progress < 80)
  }, [cultivations, patterns])

  const getLearningStatus = () => {
    if (learningProgress === 0) return "Aguardando"
    if (learningProgress < 20) return "Iniciando"
    if (learningProgress < 40) return "Coletando"
    if (learningProgress < 60) return "Analisando"
    if (learningProgress < 80) return "Aprendendo"
    if (learningProgress < 95) return "Otimizando"
    return "Especialista"
  }

  const getStatusColor = () => {
    if (learningProgress === 0) return "bg-gray-100 text-gray-600"
    if (learningProgress < 20) return "bg-yellow-100 text-yellow-700"
    if (learningProgress < 40) return "bg-orange-100 text-orange-700"
    if (learningProgress < 60) return "bg-blue-100 text-blue-700"
    if (learningProgress < 80) return "bg-indigo-100 text-indigo-700"
    if (learningProgress < 95) return "bg-green-100 text-green-700"
    return "bg-purple-100 text-purple-700"
  }

  const getStatusIcon = () => {
    if (learningProgress === 0) return Clock
    if (learningProgress < 20) return Clock
    if (learningProgress < 40) return Database
    if (learningProgress < 60) return TrendingUp
    if (learningProgress < 80) return Brain
    if (learningProgress < 95) return CheckCircle
    return Lightbulb
  }

  const StatusIcon = getStatusIcon()

  return (
    <Card className="shadow-sm">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg font-semibold">
          <Brain className="h-5 w-5" />
          Status do Sistema Inteligente
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <StatusIcon className="h-4 w-4" />
            <span className="font-medium">Status:</span>
            <Badge className={getStatusColor()}>
              {getLearningStatus()}
            </Badge>
          </div>
          <span className="text-sm text-muted-foreground">
            {learningProgress.toFixed(0)}% completo
          </span>
        </div>

        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span>Progresso de Aprendizado</span>
            <span>{learningProgress.toFixed(0)}%</span>
          </div>
          <Progress value={learningProgress} className="h-2" />
        </div>

        <div className="grid grid-cols-2 gap-4 text-sm">
          <div className="bg-blue-50 p-3 rounded-lg">
            <div className="flex items-center gap-2 mb-1">
              <CheckCircle className="h-4 w-4 text-blue-600" />
              <span className="font-medium text-blue-800">Cultivos Analisados</span>
            </div>
            <span className="text-blue-600 font-semibold">
              {cultivations.filter(c => c.status === "completed").length}
            </span>
          </div>

          <div className="bg-green-50 p-3 rounded-lg">
            <div className="flex items-center gap-2 mb-1">
              <TrendingUp className="h-4 w-4 text-green-600" />
              <span className="font-medium text-green-800">Padrões Aprendidos</span>
            </div>
            <span className="text-green-600 font-semibold">
              {patterns.length}
            </span>
            {patterns.length > 0 && (
              <div className="text-xs text-green-700 mt-1">
                {patterns.map(p => p.strain).slice(0, 2).join(', ')}
                {patterns.length > 2 && '...'}
              </div>
            )}
          </div>
        </div>

        {learningProgress === 0 && (
          <div className="bg-gray-50 p-3 rounded-lg border border-gray-200">
            <div className="flex items-start gap-2">
              <Clock className="h-4 w-4 text-gray-600 mt-0.5" />
              <div className="text-sm">
                <p className="font-medium text-gray-800 mb-1">
                  Sistema Aguardando Primeiro Cultivo
                </p>
                <p className="text-gray-700">
                  Crie seu primeiro cultivo para que o sistema comece a coletar dados e aprender seus padrões de sucesso.
                </p>
              </div>
            </div>
          </div>
        )}

        {learningProgress > 0 && learningProgress < 40 && (
          <div className="bg-yellow-50 p-3 rounded-lg border border-yellow-200">
            <div className="flex items-start gap-2">
              <Database className="h-4 w-4 text-yellow-600 mt-0.5" />
              <div className="text-sm">
                <p className="font-medium text-yellow-800 mb-1">
                  Coletando Dados Iniciais
                </p>
                <p className="text-yellow-700">
                  O sistema está coletando dados dos seus primeiros cultivos. Cada cultivo adiciona ~5% ao aprendizado.
                </p>
                <div className="mt-2 text-xs text-yellow-600">
                  <p>• Registrando parâmetros ambientais</p>
                  <p>• Correlacionando com resultados</p>
                  <p>• Próximo marco: {40 - Math.floor(learningProgress)}% para análise avançada</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {learningProgress >= 40 && learningProgress < 80 && (
          <div className="bg-blue-50 p-3 rounded-lg border border-blue-200">
            <div className="flex items-start gap-2">
              <Brain className="h-4 w-4 text-blue-600 mt-0.5" />
              <div className="text-sm">
                <p className="font-medium text-blue-800 mb-1">
                  Sistema Aprendendo Padrões
                </p>
                <p className="text-blue-700">
                  Analisando correlações entre parâmetros e resultados. Cada cultivo bem-sucedido adiciona ~8% ao conhecimento.
                </p>
                <div className="mt-2 text-xs text-blue-600">
                  <p>• Identificando padrões por genética</p>
                  <p>• Otimizando faixas ideais por fase</p>
                  <p>• Próximo marco: {80 - Math.floor(learningProgress)}% para sistema especialista</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {learningProgress >= 80 && learningProgress < 95 && (
          <div className="bg-green-50 p-3 rounded-lg border border-green-200">
            <div className="flex items-start gap-2">
              <CheckCircle className="h-4 w-4 text-green-600 mt-0.5" />
              <div className="text-sm">
                <p className="font-medium text-green-800 mb-1">
                  Sistema Inteligente Otimizando
                </p>
                <p className="text-green-700">
                  Sistema ativo com alertas personalizados. Refinando precisão com cada novo cultivo.
                </p>
                <div className="mt-2 text-xs text-green-600">
                  <p>• Alertas personalizados por genética</p>
                  <p>• Detecção automática de anomalias</p>
                  <p>• Próximo marco: {95 - Math.floor(learningProgress)}% para especialista</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {learningProgress >= 95 && (
          <div className="bg-purple-50 p-3 rounded-lg border border-purple-200">
            <div className="flex items-start gap-2">
              <Lightbulb className="h-4 w-4 text-purple-600 mt-0.5" />
              <div className="text-sm">
                <p className="font-medium text-purple-800 mb-1">
                  Sistema Especialista Ativo
                </p>
                <p className="text-purple-700">
                  Sistema altamente especializado nos seus padrões de cultivo. Precisão máxima nos alertas.
                </p>
                <div className="mt-2 text-xs text-purple-600">
                  <p>• Alertas ultra-personalizados</p>
                  <p>• Predições avançadas de rendimento</p>
                  <p>• Otimização contínua automática</p>
                  <p>• Recomendações proativas</p>
                </div>
              </div>
            </div>
          </div>
        )}

        <div className="text-xs text-muted-foreground text-center pt-2 border-t">
          <p>
            O sistema aprende continuamente com seus dados para melhorar a precisão dos alertas.
          </p>
        </div>
      </CardContent>
    </Card>
  )
} 