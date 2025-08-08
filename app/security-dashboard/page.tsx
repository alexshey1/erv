"use client"

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { 
  Shield, 
  AlertTriangle, 
  CheckCircle, 
  XCircle, 
  TrendingUp, 
  Eye,
  RefreshCw,
  Download,
  Settings
} from 'lucide-react'

interface CSPReport {
  'csp-report': {
    'violated-directive': string
    'blocked-uri': string
    'source-file': string
    'line-number': number
  }
  timestamp: string
  userAgent: string
  ip: string
  analysis: {
    severity: 'low' | 'medium' | 'high'
    recommendation: string
    autoFix?: string
  }
}

interface SecurityMetrics {
  total: number
  filtered: number
  summary: {
    high: number
    medium: number
    low: number
  }
}

export default function SecurityDashboard() {
  const [reports, setReports] = useState<CSPReport[]>([])
  const [metrics, setMetrics] = useState<SecurityMetrics | null>(null)
  const [loading, setLoading] = useState(true)
  const [selectedSeverity, setSelectedSeverity] = useState<string>('all')

  useEffect(() => {
    fetchReports()
  }, [selectedSeverity])

  const fetchReports = async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams({
        limit: '50',
        ...(selectedSeverity !== 'all' && { severity: selectedSeverity })
      })
      
      const response = await fetch(`/api/csp-report?${params}`)
      const data = await response.json()
      
      if (data.success) {
        setReports(data.reports)
        setMetrics({
          total: data.total,
          filtered: data.filtered,
          summary: data.summary
        })
      }
    } catch (error) {
      console.error('Erro ao buscar relatórios:', error)
    } finally {
      setLoading(false)
    }
  }

  const exportReports = () => {
    const csvContent = [
      'Timestamp,Severity,Violated Directive,Blocked URI,Source File,Recommendation',
      ...reports.map(report => [
        report.timestamp,
        report.analysis.severity,
        report['csp-report']['violated-directive'],
        report['csp-report']['blocked-uri'],
        report['csp-report']['source-file'] || 'N/A',
        report.analysis.recommendation
      ].join(','))
    ].join('\n')

    const blob = new Blob([csvContent], { type: 'text/csv' })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `csp-reports-${new Date().toISOString().split('T')[0]}.csv`
    a.click()
    window.URL.revokeObjectURL(url)
  }

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'high': return 'bg-red-100 text-red-800'
      case 'medium': return 'bg-yellow-100 text-yellow-800'
      case 'low': return 'bg-green-100 text-green-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case 'high': return <XCircle className="h-4 w-4 text-red-500" />
      case 'medium': return <AlertTriangle className="h-4 w-4 text-yellow-500" />
      case 'low': return <CheckCircle className="h-4 w-4 text-green-500" />
      default: return <Eye className="h-4 w-4 text-gray-500" />
    }
  }

  return (
    <div className="container mx-auto p-6 max-w-6xl">
      <div className="mb-6">
        <h1 className="text-3xl font-bold flex items-center gap-2">
          <Shield className="h-8 w-8 text-blue-600" />
          Dashboard de Segurança
        </h1>
        <p className="text-muted-foreground mt-2">
          Monitoramento em tempo real de violações de CSP e métricas de segurança
        </p>
      </div>

      {/* Métricas Gerais */}
      {metrics && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Total de Relatórios</p>
                  <p className="text-2xl font-bold">{metrics.total}</p>
                </div>
                <TrendingUp className="h-8 w-8 text-blue-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Alta Severidade</p>
                  <p className="text-2xl font-bold text-red-600">{metrics.summary.high}</p>
                </div>
                <XCircle className="h-8 w-8 text-red-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Média Severidade</p>
                  <p className="text-2xl font-bold text-yellow-600">{metrics.summary.medium}</p>
                </div>
                <AlertTriangle className="h-8 w-8 text-yellow-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Baixa Severidade</p>
                  <p className="text-2xl font-bold text-green-600">{metrics.summary.low}</p>
                </div>
                <CheckCircle className="h-8 w-8 text-green-500" />
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      <Tabs defaultValue="reports" className="space-y-4">
        <div className="flex items-center justify-between">
          <TabsList>
            <TabsTrigger value="reports">Relatórios CSP</TabsTrigger>
            <TabsTrigger value="analysis">Análise</TabsTrigger>
            <TabsTrigger value="config">Configuração</TabsTrigger>
          </TabsList>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={fetchReports}
              disabled={loading}
            >
              <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
              Atualizar
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={exportReports}
              disabled={reports.length === 0}
            >
              <Download className="h-4 w-4 mr-2" />
              Exportar CSV
            </Button>
          </div>
        </div>

        <TabsContent value="reports">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Violações de CSP</CardTitle>
                <div className="flex items-center gap-2">
                  <span className="text-sm text-muted-foreground">Filtrar por severidade:</span>
                  <select
                    value={selectedSeverity}
                    onChange={(e) => setSelectedSeverity(e.target.value)}
                    className="px-3 py-1 border rounded-md text-sm"
                  >
                    <option value="all">Todas</option>
                    <option value="high">Alta</option>
                    <option value="medium">Média</option>
                    <option value="low">Baixa</option>
                  </select>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="text-center py-8">
                  <RefreshCw className="h-8 w-8 animate-spin mx-auto mb-2" />
                  <p>Carregando relatórios...</p>
                </div>
              ) : reports.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <CheckCircle className="h-12 w-12 mx-auto mb-2 text-green-500" />
                  <p>Nenhuma violação de CSP encontrada!</p>
                  <p className="text-sm">Sua aplicação está segura.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {reports.map((report, index) => (
                    <div key={index} className="border rounded-lg p-4">
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex items-center gap-2">
                          {getSeverityIcon(report.analysis.severity)}
                          <Badge className={getSeverityColor(report.analysis.severity)}>
                            {report.analysis.severity.toUpperCase()}
                          </Badge>
                          <span className="font-medium">
                            {report['csp-report']['violated-directive']}
                          </span>
                        </div>
                        <span className="text-sm text-muted-foreground">
                          {new Date(report.timestamp).toLocaleString()}
                        </span>
                      </div>
                      
                      <div className="space-y-2 text-sm">
                        <div>
                          <span className="font-medium">URI Bloqueada:</span>
                          <span className="ml-2 font-mono bg-gray-100 px-2 py-1 rounded">
                            {report['csp-report']['blocked-uri']}
                          </span>
                        </div>
                        
                        {report['csp-report']['source-file'] && (
                          <div>
                            <span className="font-medium">Arquivo:</span>
                            <span className="ml-2">
                              {report['csp-report']['source-file']}:{report['csp-report']['line-number']}
                            </span>
                          </div>
                        )}
                        
                        <div>
                          <span className="font-medium">Recomendação:</span>
                          <span className="ml-2">{report.analysis.recommendation}</span>
                        </div>
                        
                        {report.analysis.autoFix && (
                          <div className="bg-blue-50 p-2 rounded">
                            <span className="font-medium text-blue-800">Correção Sugerida:</span>
                            <span className="ml-2 text-blue-700">{report.analysis.autoFix}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analysis">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Análise de Tendências</CardTitle>
              </CardHeader>
              <CardContent>
                {metrics ? (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span>Violações de Alta Severidade</span>
                      <div className="flex items-center gap-2">
                        <div className="w-20 bg-gray-200 rounded-full h-2">
                          <div 
                            className="bg-red-500 h-2 rounded-full" 
                            style={{ width: `${(metrics.summary.high / metrics.total) * 100}%` }}
                          />
                        </div>
                        <span className="text-sm">{metrics.summary.high}</span>
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <span>Violações de Média Severidade</span>
                      <div className="flex items-center gap-2">
                        <div className="w-20 bg-gray-200 rounded-full h-2">
                          <div 
                            className="bg-yellow-500 h-2 rounded-full" 
                            style={{ width: `${(metrics.summary.medium / metrics.total) * 100}%` }}
                          />
                        </div>
                        <span className="text-sm">{metrics.summary.medium}</span>
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <span>Violações de Baixa Severidade</span>
                      <div className="flex items-center gap-2">
                        <div className="w-20 bg-gray-200 rounded-full h-2">
                          <div 
                            className="bg-green-500 h-2 rounded-full" 
                            style={{ width: `${(metrics.summary.low / metrics.total) * 100}%` }}
                          />
                        </div>
                        <span className="text-sm">{metrics.summary.low}</span>
                      </div>
                    </div>
                  </div>
                ) : (
                  <p className="text-muted-foreground">Carregando análise...</p>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Recomendações de Segurança</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <Alert>
                    <CheckCircle className="h-4 w-4" />
                    <AlertDescription>
                      CSP está ativo e funcionando corretamente
                    </AlertDescription>
                  </Alert>
                  
                  <Alert>
                    <Settings className="h-4 w-4" />
                    <AlertDescription>
                      Monitore regularmente as violações para ajustar a política
                    </AlertDescription>
                  </Alert>
                  
                  <Alert>
                    <Shield className="h-4 w-4" />
                    <AlertDescription>
                      Considere usar nonces para scripts inline em produção
                    </AlertDescription>
                  </Alert>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="config">
          <Card>
            <CardHeader>
              <CardTitle>Configuração Atual do CSP</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <h4 className="font-medium mb-2">Política Ativa:</h4>
                  <div className="bg-gray-100 p-4 rounded-lg font-mono text-sm overflow-x-auto">
                    default-src 'self'; script-src 'self' 'unsafe-inline' https://vercel.live; 
                    style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; 
                    img-src 'self' data: blob: https://res.cloudinary.com; 
                    connect-src 'self' https://api.cloudinary.com https://generativelanguage.googleapis.com;
                  </div>
                </div>
                
                <div>
                  <h4 className="font-medium mb-2">Status:</h4>
                  <div className="flex items-center gap-2">
                    <Badge className="bg-green-100 text-green-800">✅ Ativo</Badge>
                    <Badge className="bg-blue-100 text-blue-800">🔍 Monitoramento Ativo</Badge>
                    <Badge className="bg-purple-100 text-purple-800">📊 Relatórios Habilitados</Badge>
                  </div>
                </div>
                
                <div>
                  <h4 className="font-medium mb-2">Próximas Melhorias:</h4>
                  <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground">
                    <li>Implementar nonces para scripts inline</li>
                    <li>Remover unsafe-inline em produção</li>
                    <li>Configurar report-uri para produção</li>
                    <li>Implementar CSP mais restritivo</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}