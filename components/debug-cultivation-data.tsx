"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { 
  Database, 
  AlertTriangle, 
  CheckCircle,
  Info,
  RefreshCw
} from "lucide-react"

interface CultivationData {
  id: string
  name: string
  strain: string
  phase: string
  daysSinceStart: number
  numPlants: number
  status: "active" | "completed" | "planned"
  sensorData: Array<{
    sensorType: string
    value: number
    unit: string
    timestamp: string
  }>
}

export function DebugCultivationData() {
  const [cultivations, setCultivations] = useState<CultivationData[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const loadCultivationData = async () => {
    setIsLoading(true)
    setError(null)
    
    try {
      console.log('🔄 Carregando dados dos cultivos...')
      
      // 1. Carregar cultivos do banco
      const cultivationsResponse = await fetch('/api/cultivation')
      console.log('📊 Resposta da API de cultivos:', cultivationsResponse.status)
      
      if (cultivationsResponse.ok) {
        const cultivationsData = await cultivationsResponse.json()
        console.log('📋 Dados dos cultivos:', cultivationsData)
        
        if (cultivationsData.success) {
          const realCultivations: CultivationData[] = []
          
          // 2. Para cada cultivo, carregar eventos e converter para dados de sensores
          for (const cultivation of cultivationsData.cultivations) {
            console.log(`🔍 Processando cultivo: ${cultivation.name} (ID: ${cultivation.id})`)
            
            try {
              const eventsResponse = await fetch(`/api/cultivation-events?cultivationId=${cultivation.id}`)
              console.log(`📊 Resposta da API de eventos para ${cultivation.name}:`, eventsResponse.status)
              
              if (eventsResponse.ok) {
                const eventsData = await eventsResponse.json()
                console.log(`📋 Eventos do cultivo ${cultivation.name}:`, eventsData)
                
                if (eventsData.success && eventsData.events.length > 0) {
                  console.log(`📊 ${eventsData.events.length} eventos encontrados para ${cultivation.name}`)
                  
                  // Converter eventos para dados de sensores
                  const sensorData = eventsData.events
                    .filter((event: any) => {
                      const hasData = event.details && (
                        event.details.ph || 
                        event.details.ec || 
                        event.details.temperatura || 
                        event.details.umidade
                      )
                      console.log(`🔍 Evento ${event.id}:`, {
                        hasDetails: !!event.details,
                        ph: event.details?.ph,
                        ec: event.details?.ec,
                        temperatura: event.details?.temperatura,
                        umidade: event.details?.umidade,
                        hasData
                      })
                      return hasData
                    })
                    .map((event: any) => {
                      const sensorDataPoints: { sensorType: string; value: number; unit: string; timestamp: any }[] = []
                      
                      if (event.details.ph) {
                        sensorDataPoints.push({
                          sensorType: "ph",
                          value: Number(event.details.ph),
                          unit: "",
                          timestamp: event.date
                        })
                      }
                      
                      if (event.details.ec) {
                        sensorDataPoints.push({
                          sensorType: "ec",
                          value: Number(event.details.ec),
                          unit: "mS/cm",
                          timestamp: event.date
                        })
                      }
                      
                      if (event.details.temperatura) {
                        sensorDataPoints.push({
                          sensorType: "temperature",
                          value: Number(event.details.temperatura),
                          unit: "°C",
                          timestamp: event.date
                        })
                      }
                      
                      if (event.details.umidade) {
                        sensorDataPoints.push({
                          sensorType: "humidity",
                          value: Number(event.details.umidade),
                          unit: "%",
                          timestamp: event.date
                        })
                      }
                      
                      return sensorDataPoints
                    })
                    .flat()
                    .filter((data: any) => data.value > 0) // Filtrar valores válidos
                  
                  console.log(`📊 ${sensorData.length} pontos de dados de sensor para ${cultivation.name}`)
                  
                  // Calcular dias desde o início
                  const startDate = new Date(cultivation.startDate)
                  const currentDate = new Date()
                  const daysSinceStart = Math.floor((currentDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24))
                  
                  const cultivationData: CultivationData = {
                    id: cultivation.id,
                    name: cultivation.name,
                    strain: cultivation.seedStrain,
                    phase: cultivation.status === "active" ? "flowering" : "completed",
                    daysSinceStart: daysSinceStart,
                    numPlants: 6,
                    status: cultivation.status as "active" | "completed" | "planned",
                    sensorData: sensorData
                  }
                  
                  realCultivations.push(cultivationData)
                  console.log(`✅ Cultivo ${cultivation.name} processado com ${sensorData.length} pontos de dados`)
                } else {
                  console.log(`⚠️ Nenhum evento encontrado para ${cultivation.name}`)
                }
              } else {
                console.error(`❌ Erro ao carregar eventos para ${cultivation.name}:`, eventsResponse.status)
              }
            } catch (error) {
              console.error(`❌ Erro ao processar cultivo ${cultivation.name}:`, error)
            }
          }
          
          setCultivations(realCultivations)
          console.log('🎉 Processamento concluído:', realCultivations)
          
          if (realCultivations.length === 0) {
            setError('Nenhum cultivo com dados de sensores foi encontrado')
          }
        } else {
          setError('Erro ao carregar dados dos cultivos')
        }
      } else {
        setError(`Erro na API: ${cultivationsResponse.status}`)
      }
    } catch (error) {
      console.error('❌ Erro geral:', error)
      setError('Erro ao carregar dados')
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    loadCultivationData()
  }, [])

  return (
    <div className="w-full px-4 sm:px-6 lg:px-8 pt-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Debug - Dados dos Cultivos</h1>
        <p className="text-gray-600 mt-2">Verifique os dados reais carregados dos cultivos</p>
      </div>

      <div className="mb-6">
        <Button 
          onClick={loadCultivationData} 
          disabled={isLoading}
          className="flex items-center gap-2"
        >
          <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
          {isLoading ? 'Carregando...' : 'Recarregar Dados'}
        </Button>
      </div>

      {error && (
        <Card className="border-l-4 border-red-500 mb-6">
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-red-600" />
              <span className="text-red-600">{error}</span>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="space-y-6">
        {cultivations.map((cultivation, index) => (
          <Card key={cultivation.id}>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Database className="h-5 w-5" />
                {cultivation.name}
                <Badge variant={cultivation.status === "active" ? "default" : "secondary"}>
                  {cultivation.status}
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div>
                  <p className="text-sm font-medium">Strain</p>
                  <p className="text-sm text-muted-foreground">{cultivation.strain}</p>
                </div>
                <div>
                  <p className="text-sm font-medium">Fase</p>
                  <p className="text-sm text-muted-foreground">{cultivation.phase}</p>
                </div>
                <div>
                  <p className="text-sm font-medium">Dias desde início</p>
                  <p className="text-sm text-muted-foreground">{cultivation.daysSinceStart}</p>
                </div>
                <div>
                  <p className="text-sm font-medium">Plantas</p>
                  <p className="text-sm text-muted-foreground">{cultivation.numPlants}</p>
                </div>
              </div>

              <div>
                <p className="text-sm font-medium mb-2">Dados dos Sensores ({cultivation.sensorData.length} pontos)</p>
                {cultivation.sensorData.length > 0 ? (
                  <div className="space-y-2">
                    {cultivation.sensorData.map((data, dataIndex) => (
                      <div key={dataIndex} className="flex items-center gap-2 p-2 bg-muted rounded">
                        <CheckCircle className="h-4 w-4 text-green-500" />
                        <span className="font-medium">{data.sensorType}:</span>
                        <span>{data.value} {data.unit}</span>
                        <span className="text-xs text-muted-foreground">
                          {new Date(data.timestamp).toLocaleDateString()}
                        </span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="flex items-center gap-2 p-2 bg-yellow-50 rounded">
                    <Info className="h-4 w-4 text-yellow-500" />
                    <span className="text-sm text-yellow-700">Nenhum dado de sensor encontrado</span>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        ))}

        {cultivations.length === 0 && !isLoading && !error && (
          <Card>
            <CardContent className="p-8 text-center">
              <Info className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">Nenhum cultivo encontrado</p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}