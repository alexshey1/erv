"use client"

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { 
  Clock, 
  Play, 
  CheckCircle, 
  AlertTriangle, 
  BarChart3,
  RefreshCw,
  Settings,
  Zap
} from 'lucide-react'
import { toast } from 'sonner'

interface JobStats {
  isRunning: boolean
  lastRuns: Record<string, number>
  rulesEngineStats: {
    totalRules: number
    activeRules: number
    cooldownsActive: number
  }
}

interface JobResult {
  job: string
  status: string
  stats: JobStats
  timestamp: string
}

export default function CronJobsAdminPage() {
  const [stats, setStats] = useState<JobStats | null>(null)
  const [loading, setLoading] = useState(false)
  const [runningJobs, setRunningJobs] = useState<Set<string>>(new Set())
  const [lastResults, setLastResults] = useState<Record<string, JobResult>>({})

  const jobs = [
    {
      id: 'reminders',
      name: 'Lembretes',
      description: 'Verifica lembretes de rega, nutrição e cuidados',
      icon: Clock,
      color: 'blue',
      frequency: 'A cada hora'
    },
    {
      id: 'alerts',
      name: 'Alertas Críticos',
      description: 'Verifica condições críticas e problemas urgentes',
      icon: AlertTriangle,
      color: 'red',
      frequency: 'A cada 30 minutos'
    },
    {
      id: 'achievements',
      name: 'Conquistas',
      description: 'Detecta marcos e conquistas dos usuários',
      icon: CheckCircle,
      color: 'green',
      frequency: 'Diariamente'
    },
    {
      id: 'cleanup',
      name: 'Limpeza',
      description: 'Remove notificações antigas e dados desnecessários',
      icon: RefreshCw,
      color: 'gray',
      frequency: 'Semanalmente'
    },
    {
      id: 'maintenance',
      name: 'Manutenção',
      description: 'Executa tarefas de manutenção do sistema',
      icon: Settings,
      color: 'purple',
      frequency: 'Semanalmente'
    }
  ]

  useEffect(() => {
    loadStats()
    // Atualizar stats a cada 30 segundos
    const interval = setInterval(loadStats, 30000)
    return () => clearInterval(interval)
  }, [])

  const loadStats = async () => {
    try {
      const response = await fetch('/api/cron/notifications')
      if (response.ok) {
        const data = await response.json()
        setStats(data.stats)
      }
    } catch (error) {
      console.error('Error loading stats:', error)
    }
  }

  const runJob = async (jobId: string) => {
    if (runningJobs.has(jobId)) return

    setRunningJobs(prev => new Set(prev).add(jobId))
    setLoading(true)

    try {
      toast.info(`Executando job: ${jobId}...`)

      const response = await fetch(`/api/cron/notifications?job=${jobId}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer your-cron-secret-key`, // Em produção, usar variável de ambiente
          'Content-Type': 'application/json'
        }
      })

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`)
      }

      const result = await response.json()
      
      setLastResults(prev => ({
        ...prev,
        [jobId]: result
      }))

      setStats(result.stats)
      toast.success(`Job ${jobId} executado com sucesso!`)

    } catch (error) {
      console.error(`Error running job ${jobId}:`, error)
      toast.error(`Erro ao executar job ${jobId}: ${error instanceof Error ? error.message : 'Erro desconhecido'}`)
    } finally {
      setRunningJobs(prev => {
        const newSet = new Set(prev)
        newSet.delete(jobId)
        return newSet
      })
      setLoading(false)
    }
  }

  const runAllJobs = async () => {
    await runJob('all')
  }

  const formatLastRun = (timestamp: number) => {
    if (!timestamp) return 'Nunca'
    const date = new Date(timestamp)
    const now = new Date()
    const diffMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60))
    
    if (diffMinutes < 1) return 'Agora mesmo'
    if (diffMinutes < 60) return `${diffMinutes} min atrás`
    if (diffMinutes < 1440) return `${Math.floor(diffMinutes / 60)}h atrás`
    return `${Math.floor(diffMinutes / 1440)} dias atrás`
  }

  const getJobColor = (color: string) => {
    const colors = {
      blue: 'bg-blue-500',
      red: 'bg-red-500',
      green: 'bg-green-500',
      gray: 'bg-gray-500',
      purple: 'bg-purple-500'
    }
    return colors[color as keyof typeof colors] || 'bg-gray-500'
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Cron Jobs - Sistema de Notificações</h1>
          <p className="text-muted-foreground">
            Monitore e execute jobs automáticos do sistema de notificações
          </p>
        </div>
        
        <div className="flex gap-2">
          <Button onClick={loadStats} variant="outline" size="sm">
            <RefreshCw className="w-4 h-4 mr-2" />
            Atualizar
          </Button>
          <Button onClick={runAllJobs} disabled={loading} size="sm">
            <Zap className="w-4 h-4 mr-2" />
            Executar Todos
          </Button>
        </div>
      </div>

      {/* Estatísticas Gerais */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <BarChart3 className="w-5 h-5 text-blue-500" />
                <div>
                  <p className="text-sm text-muted-foreground">Status</p>
                  <p className="font-semibold">
                    {stats.isRunning ? (
                      <Badge variant="destructive">Executando</Badge>
                    ) : (
                      <Badge variant="secondary">Inativo</Badge>
                    )}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <Settings className="w-5 h-5 text-green-500" />
                <div>
                  <p className="text-sm text-muted-foreground">Regras Ativas</p>
                  <p className="font-semibold">
                    {stats.rulesEngineStats.activeRules} / {stats.rulesEngineStats.totalRules}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <Clock className="w-5 h-5 text-orange-500" />
                <div>
                  <p className="text-sm text-muted-foreground">Cooldowns Ativos</p>
                  <p className="font-semibold">{stats.rulesEngineStats.cooldownsActive}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <CheckCircle className="w-5 h-5 text-purple-500" />
                <div>
                  <p className="text-sm text-muted-foreground">Jobs Disponíveis</p>
                  <p className="font-semibold">{jobs.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Lista de Jobs */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {jobs.map((job) => {
          const Icon = job.icon
          const isRunning = runningJobs.has(job.id)
          const lastRun = stats?.lastRuns[job.id]
          const lastResult = lastResults[job.id]

          return (
            <Card key={job.id} className="relative">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className={`p-2 rounded-lg ${getJobColor(job.color)}`}>
                      <Icon className="w-4 h-4 text-white" />
                    </div>
                    <div>
                      <CardTitle className="text-lg">{job.name}</CardTitle>
                      <p className="text-sm text-muted-foreground">{job.frequency}</p>
                    </div>
                  </div>
                  
                  {isRunning && (
                    <div className="animate-spin">
                      <RefreshCw className="w-4 h-4 text-blue-500" />
                    </div>
                  )}
                </div>
              </CardHeader>

              <CardContent className="space-y-3">
                <p className="text-sm text-muted-foreground">
                  {job.description}
                </p>

                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Última execução:</span>
                  <span className="font-medium">
                    {lastRun ? formatLastRun(lastRun!) : 'Nunca executado'}
                  </span>
                </div>

                {lastResult && (
                  <Alert>
                    <CheckCircle className="w-4 h-4" />
                    <AlertDescription>
                      Executado com sucesso em {new Date(lastResult.timestamp).toLocaleString()}
                    </AlertDescription>
                  </Alert>
                )}

                <Button 
                  onClick={() => runJob(job.id)}
                  disabled={isRunning || loading}
                  className="w-full"
                  size="sm"
                >
                  {isRunning ? (
                    <>
                      <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                      Executando...
                    </>
                  ) : (
                    <>
                      <Play className="w-4 h-4 mr-2" />
                      Executar Agora
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {/* Informações de Configuração */}
      <Card>
        <CardHeader>
          <CardTitle>Configuração de Produção</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Alert>
            <Settings className="w-4 h-4" />
            <AlertDescription>
              <strong>Para produção:</strong> Configure cron jobs externos para chamar os endpoints automaticamente:
            </AlertDescription>
          </Alert>

          <div className="space-y-2 text-sm font-mono bg-muted p-4 rounded-lg">
            <p># Lembretes (a cada hora)</p>
            <p>0 * * * * curl -X POST -H "Authorization: Bearer $CRON_SECRET" https://seu-dominio.com/api/cron/notifications?job=reminders</p>
            
            <p className="mt-3"># Alertas (a cada 30 minutos)</p>
            <p>*/30 * * * * curl -X POST -H "Authorization: Bearer $CRON_SECRET" https://seu-dominio.com/api/cron/notifications?job=alerts</p>
            
            <p className="mt-3"># Conquistas (diariamente às 9h)</p>
            <p>0 9 * * * curl -X POST -H "Authorization: Bearer $CRON_SECRET" https://seu-dominio.com/api/cron/notifications?job=achievements</p>
            
            <p className="mt-3"># Limpeza (semanalmente, domingo às 2h)</p>
            <p>0 2 * * 0 curl -X POST -H "Authorization: Bearer $CRON_SECRET" https://seu-dominio.com/api/cron/notifications?job=cleanup</p>
          </div>

          <Alert>
            <AlertTriangle className="w-4 h-4" />
            <AlertDescription>
              <strong>Importante:</strong> Configure a variável de ambiente CRON_SECRET com uma chave segura para autenticar os jobs.
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    </div>
  )
}