"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { TrendingUp, TrendingDown, Calendar, DollarSign, Leaf, Flower2 } from "lucide-react"
import type { CultivationSummary } from "@/lib/mock-data"
import { useEffect, useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { getEventIcon } from "@/lib/event-icons"

interface HistoryChartsProps {
  cultivations: CultivationSummary[]
  user?: any
}

// Função de tradução igual ao Diário de Bordo Rápido
function traduzirEvento(texto: string): string {
  if (!texto) return ""
  const key = texto.trim().replace(/\s+/g, "_").toLowerCase()
  const map: Record<string, string> = {
    fertilization: "Fertilização",
    fertilizacao: "Fertilização",
    germination: "Germinação",
    germinacao: "Germinação",
    seedling: "Plântula",
    vegetative: "Vegetativo",
    flowering: "Floração",
    drying: "Secagem",
    curing: "Cura",
    harvest: "Colheita",
    colheita: "Colheita",
    pruning: "Poda",
    poda: "Poda",
    irrigation: "Irrigação",
    irrigacao: "Irrigação",
    irrigação: "Irrigação",
    water: "Rega",
    nutrients: "Nutrientes",
    pest_control: "Controle de Pragas",
    pest: "Praga",
    action: "Ação",
    start_veg: "Início do vegetativo",
    startveg: "Início do vegetativo",
    start_flower: "Início da floração",
    startflower: "Início da floração",
    other: "Outro",
  }
  return map[key] || texto
}

export function HistoryCharts({ cultivations, user }: HistoryChartsProps) {
  // Agrupar cultivos por mês
  const monthlyData = cultivations.reduce((acc, cultivation) => {
    const date = new Date(cultivation.startDate)
    const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`
    
    if (!acc[monthKey]) {
      acc[monthKey] = {
        month: monthKey,
        count: 0,
        totalYield: 0,
        avgEfficiency: 0
      }
    }
    
    acc[monthKey].count++
    acc[monthKey].totalYield += cultivation.yield_g
    
    const efficiency = cultivation.yield_g > 0 && cultivation.durationDays > 0 
      ? cultivation.yield_g / cultivation.durationDays 
      : 0
    acc[monthKey].avgEfficiency = (acc[monthKey].avgEfficiency + efficiency) / acc[monthKey].count
    
    return acc
  }, {} as Record<string, any>)

  const sortedMonths = Object.values(monthlyData).sort((a, b) => a.month.localeCompare(b.month))

  // Calcular tendências
  const recentMonths = sortedMonths.slice(-3)
  const yieldTrend = recentMonths.length >= 2
    ? recentMonths[recentMonths.length - 1].totalYield - recentMonths[recentMonths.length - 2].totalYield
    : 0

  // Variedades cultivadas
  const strainCounts: Record<string, number> = {}
  cultivations.forEach(c => {
    if (c.seedStrain) {
      const parts = c.seedStrain.split(',').map(s => s.trim()).filter(Boolean)
      if (parts.length === 0) return
      parts.forEach(p => {
        strainCounts[p] = (strainCounts[p] || 0) + 1
      })
    }
  })
  const uniqueStrains = Object.keys(strainCounts)
  let mostFrequentStrains = uniqueStrains
    .map(strain => ({ strain, count: strainCounts[strain] }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 4)

  // Se todas as genéticas têm count 1, completar com as mais recentes até 4
  if (mostFrequentStrains.length < 4 && uniqueStrains.length > 0 && mostFrequentStrains.every(s => s.count === 1)) {
    // Pega as genéticas mais recentes cultivadas, sem repetir
    const recentStrains: string[] = [];
    for (let i = cultivations.length - 1; i >= 0 && recentStrains.length < 4; i--) {
      const strain = cultivations[i].seedStrain;
      if (strain && !recentStrains.includes(strain)) {
        recentStrains.push(strain);
      }
    }
    // Monta lista final sem repetir
    mostFrequentStrains = recentStrains.map(strain => ({ strain, count: strainCounts[strain] || 1 }));
  }

  const [showRecent, setShowRecent] = useState(false)
  const [recentActivities, setRecentActivities] = useState<any[]>([])

  useEffect(() => {
    let isMounted = true;
    async function fetchAllEvents() {
      const allEvents: any[] = []
      for (const cultivation of cultivations) {
        try {
          const res = await fetch(`/api/cultivation-events?cultivationId=${cultivation.id}`)
          const data = await res.json()
          if (data.success) {
            allEvents.push(...data.events.map((ev: any) => ({
              ...ev,
              cultivationName: cultivation.name
            })))
          }
        } catch {}
      }
      allEvents.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
      if (isMounted) setRecentActivities(allEvents.slice(0, 5))
    }
    if (cultivations.length > 0) fetchAllEvents()
    return () => { isMounted = false }
  }, [cultivations])

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
      {/* Primeira linha: Tendência de Rendimento e Atividade Recente Dinâmica */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Tendência de Rendimento */}
        <Card className="shadow-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Leaf className="h-5 w-5" />
              Tendência de Rendimento
              {yieldTrend > 0 ? (
                <TrendingUp className="h-4 w-4 text-green-500" />
              ) : yieldTrend < 0 ? (
                <TrendingDown className="h-4 w-4 text-red-500" />
              ) : null}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {recentMonths.every(m => m.totalYield === 0) ? (
              <div className="text-center text-muted-foreground py-6">
                A tendência só aparece após concluir pelo menos 1 cultivo com rendimento.
              </div>
              ) : (
              <div className="flex flex-col gap-4">
                {recentMonths.filter(m => m.totalYield > 0).map((month, idx) => (
                <div key={month.month} className="flex items-center justify-between">
                    <span className="flex items-center gap-2">
                      <span className="w-3 h-3 rounded-full bg-blue-400 inline-block" />
                      <span className="text-base font-medium">{new Date(month.month + '-01').toLocaleDateString('pt-BR', { month: 'short', year: 'numeric' })}</span>
                    </span>
                  <div className="text-right">
                    <div className="font-semibold">{month.totalYield.toFixed(1)}g</div>
                    <div className="text-xs text-muted-foreground">
                      {month.avgEfficiency.toFixed(1)} g/dia
                    </div>
                  </div>
                </div>
              ))}
                </div>
              )}
          </CardContent>
        </Card>
        {/* Atividade Recente */}
        <Card className="shadow-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Atividade Recente
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-center min-h-[100px]">
            {recentActivities.length === 0 ? (
                <div className="text-muted-foreground text-sm text-center">Nenhuma atividade registrada ainda.</div>
            ) : (
                <ul className="space-y-3 w-full">
                {recentActivities.map((act, idx) => {
                  const descricaoTraduzida = traduzirEvento(act.type || act.description)
                  return (
                    <li key={idx} className="flex items-center gap-2 text-sm text-gray-700 group">
                      <span className="w-5 flex-shrink-0 flex items-center justify-center">{getEventIcon(act.type)}</span>
                      <span className="truncate">{descricaoTraduzida}</span>
                      {act.cultivationName && (
                        <span className="ml-2 text-green-700 font-semibold truncate">{act.cultivationName}</span>
                      )}
                    <span className="ml-auto text-xs text-muted-foreground">{new Date(act.date).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' })}</span>
                  </li>
                  )
                })}
              </ul>
            )}
            </div>
          </CardContent>
        </Card>
      </div>
      {/* Segunda linha: Variedades Cultivadas e Top Performers */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Variedades Cultivadas */}
        <Card className="shadow-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Flower2 className="h-5 w-5 text-pink-600" />
              Variedades Cultivadas
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col items-center justify-center min-h-[100px]">
            <div className="text-2xl font-bold text-pink-600">{uniqueStrains.length}</div>
            <div className="text-sm text-muted-foreground mt-2">
              {uniqueStrains.length === 0 && "Nenhuma variedade registrada"}
              {uniqueStrains.length > 0 && (
                <>
                  Mais frequentes:
                  <ul className="mt-1 ml-2 list-disc text-xs">
                    {mostFrequentStrains.map(s => (
                      <li key={s.strain} className="text-pink-700">
                        {s.strain} <span className="text-muted-foreground">({s.count}x)</span>
                      </li>
                    ))}
                  </ul>
                </>
              )}
              </div>
            </div>
          </CardContent>
        </Card>
        {/* Top Performers */}
        <Card className="shadow-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Top Performers
            </CardTitle>
          </CardHeader>
          <CardContent>
            {(() => {
              const completed = cultivations.filter(c => c.status === 'completed' && c.yield_g > 0)
              if (completed.length === 0) {
                return <div className="text-center text-muted-foreground py-6">O ranking só aparece após concluir pelo menos 1 cultivo com rendimento.</div>
              }
              return (
                <div className="space-y-3">
                  {completed
                    .sort((a, b) => b.yield_g - a.yield_g)
                    .slice(0, 3)
                    .map((cultivation, index) => (
                      <div key={cultivation.id} className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                            index === 0 ? 'bg-yellow-500 text-white' :
                            index === 1 ? 'bg-gray-400 text-white' :
                            'bg-orange-500 text-white'
                          }`}>
                            {index + 1}
                          </div>
                          <div>
                            <div className="font-medium text-sm">{cultivation.name}</div>
                            <div className="text-xs text-muted-foreground">{cultivation.seedStrain}</div>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="font-semibold text-sm">{cultivation.yield_g}g</div>
                        </div>
                      </div>
                    ))}
                </div>
              )
            })()}
          </CardContent>
        </Card>
      </div>
    </div>
  )
} 