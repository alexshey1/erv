"use client"

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { 
  Brain, 
  Zap, 
  Clock, 
  AlertTriangle, 
  Trophy,
  Settings,
  Play,
  CheckCircle
} from 'lucide-react'
import { toast } from 'sonner'

export default function TestSmartNotificationsPage() {
  const [loading, setLoading] = useState(false)
  const [results, setResults] = useState<Record<string, any>>({})

  const tests = [
    {
      id: 'create-test-cultivation',
      name: 'Criar Cultivo de Teste',
      description: 'Cria um cultivo com dados simulados para testar regras',
      icon: Settings,
      color: 'blue',
      action: async () => {
        const response = await fetch('/api/cultivation', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            name: 'Cultivo Teste - Notificações',
            seedStrain: 'Test Strain', // Campo correto é 'seedStrain'
            startDate: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(), // 5 dias atrás
            status: 'active',
            yield_g: 0,
            profit_brl: 0,
            durationDays: 5
          })
        })
        return await response.json()
      }
    },
    {
      id: 'test-reminders',
      name: 'Testar Lembretes',
      description: 'Executa verificação de lembretes (rega, nutrição, etc.)',
      icon: Clock,
      color: 'green',
      action: async () => {
        const response = await fetch('/api/cron/notifications?job=reminders', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${process.env.NEXT_PUBLIC_CRON_SECRET || 'your-super-secret-cron-key-change-in-production'}`
          }
        })
        return await response.json()
      }
    },
    {
      id: 'test-alerts',
      name: 'Testar Alertas Críticos',
      description: 'Executa verificação de alertas críticos e IA',
      icon: AlertTriangle,
      color: 'red',
      action: async () => {
        const response = await fetch('/api/cron/notifications?job=alerts', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${process.env.NEXT_PUBLIC_CRON_SECRET || 'your-super-secret-cron-key-change-in-production'}`
          }
        })
        return await response.json()
      }
    },
    {
      id: 'test-achievements',
      name: 'Testar Conquistas',
      description: 'Verifica marcos e conquistas dos usuários',
      icon: Trophy,
      color: 'yellow',
      action: async () => {
        const response = await fetch('/api/cron/notifications?job=achievements', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${process.env.NEXT_PUBLIC_CRON_SECRET || 'your-super-secret-cron-key-change-in-production'}`
          }
        })
        return await response.json()
      }
    },
    {
      id: 'test-ai-analysis',
      name: 'Testar Análise IA',
      description: 'Testa análise inteligente com Gemini AI',
      icon: Brain,
      color: 'purple',
      action: async () => {
        // Primeiro criar dados de teste
        const cultivationResponse = await fetch('/api/cultivation')
        const cultivations = await cultivationResponse.json()
        
        if (cultivations.length === 0) {
          throw new Error('Nenhum cultivo encontrado. Crie um cultivo primeiro.')
        }

        // Executar análise IA
        const response = await fetch('/api/ai/gemini/cultivation-analysis', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            sensorData: [
              {
                sensorType: 'temperature',
                value: 32, // Temperatura alta para trigger
                unit: '°C',
                timestamp: new Date().toISOString()
              },
              {
                sensorType: 'humidity',
                value: 85, // Umidade alta para trigger
                unit: '%',
                timestamp: new Date().toISOString()
              }
            ],
            cultivationInfo: {
              strain: cultivations[0].seedStrain || 'Test Strain',
              phase: 'flowering',
              daysSinceStart: 45,
              numPlants: 2
            },
            userQuery: 'Analise as condições e identifique problemas',
            includeRecommendations: true,
            includePredictions: true
          })
        })
        
        return await response.json()
      }
    },
    {
      id: 'create-manual-notification',
      name: 'Criar Notificação Manual',
      description: 'Cria uma notificação de teste manualmente',
      icon: Zap,
      color: 'indigo',
      action: async () => {
        const response = await fetch('/api/notifications', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            type: 'ALERT',
            title: '🧪 Teste do Sistema Inteligente',
            message: 'Esta é uma notificação de teste do sistema de notificações inteligentes. Todas as funcionalidades estão operacionais!',
            priority: 'HIGH',
            metadata: {
              testId: 'smart-notifications-test',
              timestamp: new Date().toISOString()
            }
          })
        })
        return await response.json()
      }
    }
  ]

  const runTest = async (test: any) => {
    setLoading(true)
    
    try {
      toast.info(`Executando: ${test.name}...`)
      
      const result = await test.action()
      
      setResults(prev => ({
        ...prev,
        [test.id]: {
          success: true,
          data: result,
          timestamp: new Date().toISOString()
        }
      }))
      
      toast.success(`${test.name} executado com sucesso!`)
      
    } catch (error) {
      console.error(`Error in test ${test.id}:`, error)
      
      setResults(prev => ({
        ...prev,
        [test.id]: {
          success: false,
          error: error instanceof Error ? error.message : 'Erro desconhecido',
          timestamp: new Date().toISOString()
        }
      }))
      
      toast.error(`Erro em ${test.name}: ${error instanceof Error ? error.message : 'Erro desconhecido'}`)
    } finally {
      setLoading(false)
    }
  }

  const runAllTests = async () => {
    for (const test of tests) {
      await runTest(test)
      // Pequeno delay entre testes
      await new Promise(resolve => setTimeout(resolve, 1000))
    }
  }

  const getColorClass = (color: string) => {
    const colors = {
      blue: 'bg-blue-500',
      green: 'bg-green-500',
      red: 'bg-red-500',
      yellow: 'bg-yellow-500',
      purple: 'bg-purple-500',
      indigo: 'bg-indigo-500'
    }
    return colors[color as keyof typeof colors] || 'bg-gray-500'
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Teste - Sistema de Notificações Inteligentes</h1>
          <p className="text-muted-foreground">
            Teste todas as funcionalidades do sistema de notificações com IA
          </p>
        </div>
        
        <Button onClick={runAllTests} disabled={loading}>
          <Play className="w-4 h-4 mr-2" />
          Executar Todos os Testes
        </Button>
      </div>

      <Alert>
        <Brain className="w-4 h-4" />
        <AlertDescription>
          <strong>Sistema Inteligente Ativo:</strong> Este sistema usa IA (Gemini) para análise avançada, 
          regras automáticas baseadas em dados de cultivo, e cron jobs para automação completa.
        </AlertDescription>
      </Alert>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {tests.map((test) => {
          const Icon = test.icon
          const result = results[test.id]

          return (
            <Card key={test.id} className="relative">
              <CardHeader className="pb-3">
                <div className="flex items-center gap-2">
                  <div className={`p-2 rounded-lg ${getColorClass(test.color)}`}>
                    <Icon className="w-4 h-4 text-white" />
                  </div>
                  <div className="flex-1">
                    <CardTitle className="text-lg">{test.name}</CardTitle>
                  </div>
                  {result && (
                    <Badge variant={result.success ? "default" : "destructive"}>
                      {result.success ? "✓" : "✗"}
                    </Badge>
                  )}
                </div>
              </CardHeader>

              <CardContent className="space-y-3">
                <p className="text-sm text-muted-foreground">
                  {test.description}
                </p>

                {result && (
                  <Alert className={result.success ? "border-green-200" : "border-red-200"}>
                    <CheckCircle className="w-4 h-4" />
                    <AlertDescription>
                      {result.success ? (
                        <div>
                          <strong>Sucesso!</strong>
                          <pre className="mt-2 text-xs bg-muted p-2 rounded overflow-auto max-h-32">
                            {JSON.stringify(result.data, null, 2)}
                          </pre>
                        </div>
                      ) : (
                        <div>
                          <strong>Erro:</strong> {result.error}
                        </div>
                      )}
                      <p className="text-xs text-muted-foreground mt-1">
                        {new Date(result.timestamp).toLocaleString()}
                      </p>
                    </AlertDescription>
                  </Alert>
                )}

                <Button 
                  onClick={() => runTest(test)}
                  disabled={loading}
                  className="w-full"
                  size="sm"
                >
                  <Play className="w-4 h-4 mr-2" />
                  Executar Teste
                </Button>
              </CardContent>
            </Card>
          )
        })}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Funcionalidades Implementadas</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <h4 className="font-semibold text-green-600">✅ Sistema Base</h4>
              <ul className="text-sm space-y-1 text-muted-foreground">
                <li>• Central de notificações completa</li>
                <li>• Push notifications funcionais</li>
                <li>• Sistema de preferências</li>
                <li>• APIs REST completas</li>
              </ul>
            </div>
            
            <div className="space-y-2">
              <h4 className="font-semibold text-green-600">✅ Automação Inteligente</h4>
              <ul className="text-sm space-y-1 text-muted-foreground">
                <li>• Engine de regras automáticas</li>
                <li>• Cron jobs configurados</li>
                <li>• Análise IA com Gemini</li>
                <li>• Sistema de conquistas</li>
              </ul>
            </div>
            
            <div className="space-y-2">
              <h4 className="font-semibold text-blue-600">🔄 Regras Ativas</h4>
              <ul className="text-sm space-y-1 text-muted-foreground">
                <li>• Lembretes de rega (&gt;3 dias)</li>
                <li>• Alertas de nutrição por fase</li>
                <li>• Detecção de mudança de fase</li>
                <li>• Alertas de crescimento estagnado</li>
                <li>• Condições ambientais inadequadas</li>
                <li>• Análise inteligente com IA</li>
              </ul>
            </div>
            
            <div className="space-y-2">
              <h4 className="font-semibold text-purple-600">🏆 Conquistas</h4>
              <ul className="text-sm space-y-1 text-muted-foreground">
                <li>• Primeira colheita</li>
                <li>• Cultivador experiente (5+ cultivos)</li>
                <li>• Alto rendimento (&gt;100g)</li>
                <li>• Grande economia (&gt;R$ 1000)</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}