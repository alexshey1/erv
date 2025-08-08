"use client"

import { useState, useEffect, useCallback } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { 
  Bell, 
  BellRing, 
  Calendar, 
  Droplets, 
  Leaf, 
  AlertTriangle,
  CheckCircle,
  Clock,
  Settings,
  X
} from "lucide-react"
import type { CultivationSummary, CultivationEvent } from "@/lib/mock-data"

interface NotificationRule {
  id: string
  name: string
  type: "irrigation" | "fertilization" | "harvest" | "phase_change" | "problem_alert"
  enabled: boolean
  frequency: number // dias
  conditions: Record<string, any>
  lastTriggered?: string
}

interface SmartNotification {
  id: string
  title: string
  message: string
  type: "info" | "warning" | "success" | "error"
  cultivationId: string
  cultivationName: string
  timestamp: string
  read: boolean
  actionable: boolean
  action?: {
    label: string
    handler: () => void
  }
}

interface SmartNotificationsProps {
  cultivations: CultivationSummary[]
  events: CultivationEvent[]
}

export function SmartNotifications({ cultivations, events }: SmartNotificationsProps) {
  const [notifications, setNotifications] = useState<SmartNotification[]>([])
  const [rules, setRules] = useState<NotificationRule[]>([
    {
      id: "irrigation_reminder",
      name: "Lembrete de Irrigação",
      type: "irrigation",
      enabled: true,
      frequency: 3,
      conditions: { minDaysSinceLastIrrigation: 3 }
    },
    {
      id: "fertilization_reminder",
      name: "Lembrete de Fertilização",
      type: "fertilization",
      enabled: true,
      frequency: 7,
      conditions: { minDaysSinceLastFertilization: 7 }
    },
    {
      id: "harvest_alert",
      name: "Alerta de Colheita",
      type: "harvest",
      enabled: true,
      frequency: 1,
      conditions: { daysInFlowering: 70 }
    },
    {
      id: "phase_change_reminder",
      name: "Mudança de Fase",
      type: "phase_change",
      enabled: true,
      frequency: 1,
      conditions: { daysInVegetative: 60 }
    }
  ])
  const [showSettings, setShowSettings] = useState(false)

  // Gerar notificações inteligentes
  const generateNotifications = useCallback(() => {
    const newNotifications: SmartNotification[] = []
    const today = new Date()

    cultivations.filter(c => c.status === "active").forEach(cultivation => {
      const cultivationEvents = events.filter(e => e.date >= cultivation.startDate)
      const daysSinceStart = Math.floor((today.getTime() - new Date(cultivation.startDate).getTime()) / (1000 * 60 * 60 * 24))

      rules.forEach(rule => {
        if (!rule.enabled) return

        const lastTriggered = rule.lastTriggered ? new Date(rule.lastTriggered) : null
        const daysSinceLastTrigger = lastTriggered 
          ? Math.floor((today.getTime() - lastTriggered.getTime()) / (1000 * 60 * 60 * 24))
          : Infinity

        if (daysSinceLastTrigger < rule.frequency) return

        switch (rule.type) {
          case "irrigation":
            const lastIrrigation = cultivationEvents
              .filter(e => e.type === "irrigation")
              .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())[0]
            
            const daysSinceIrrigation = lastIrrigation
              ? Math.floor((today.getTime() - new Date(lastIrrigation.date).getTime()) / (1000 * 60 * 60 * 24))
              : daysSinceStart

            if (daysSinceIrrigation >= rule.conditions.minDaysSinceLastIrrigation) {
              newNotifications.push({
                id: `irrigation_${cultivation.id}_${Date.now()}`,
                title: "Hora de Irrigar! 💧",
                message: `${cultivation.name} não recebe água há ${daysSinceIrrigation} dias.`,
                type: "warning",
                cultivationId: cultivation.id,
                cultivationName: cultivation.name,
                timestamp: today.toISOString(),
                read: false,
                actionable: true,
                action: {
                  label: "Registrar Irrigação",
                  handler: () => console.log("Registrar irrigação")
                }
              })
            }
            break

          case "fertilization":
            const lastFertilization = cultivationEvents
              .filter(e => e.type === "fertilization")
              .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())[0]
            
            const daysSinceFertilization = lastFertilization
              ? Math.floor((today.getTime() - new Date(lastFertilization.date).getTime()) / (1000 * 60 * 60 * 24))
              : daysSinceStart

            if (daysSinceFertilization >= rule.conditions.minDaysSinceLastFertilization) {
              newNotifications.push({
                id: `fertilization_${cultivation.id}_${Date.now()}`,
                title: "Nutrição Necessária! 🌱",
                message: `${cultivation.name} precisa de fertilização. Última aplicação há ${daysSinceFertilization} dias.`,
                type: "info",
                cultivationId: cultivation.id,
                cultivationName: cultivation.name,
                timestamp: today.toISOString(),
                read: false,
                actionable: true,
                action: {
                  label: "Registrar Fertilização",
                  handler: () => console.log("Registrar fertilização")
                }
              })
            }
            break

          case "harvest":
            const floweringStart = cultivationEvents.find(e => e.type === "start_flor")
            if (floweringStart) {
              const daysInFlowering = Math.floor((today.getTime() - new Date(floweringStart.date).getTime()) / (1000 * 60 * 60 * 24))
              
              if (daysInFlowering >= rule.conditions.daysInFlowering) {
                newNotifications.push({
                  id: `harvest_${cultivation.id}_${Date.now()}`,
                  title: "Hora da Colheita! 🌾",
                  message: `${cultivation.name} está há ${daysInFlowering} dias em floração. Considere a colheita.`,
                  type: "success",
                  cultivationId: cultivation.id,
                  cultivationName: cultivation.name,
                  timestamp: today.toISOString(),
                  read: false,
                  actionable: true,
                  action: {
                    label: "Registrar Colheita",
                    handler: () => console.log("Registrar colheita")
                  }
                })
              }
            }
            break

          case "phase_change":
            const hasFloweringStart = cultivationEvents.some(e => e.type === "start_flor")
            if (!hasFloweringStart && daysSinceStart >= rule.conditions.daysInVegetative) {
              newNotifications.push({
                id: `phase_change_${cultivation.id}_${Date.now()}`,
                title: "Mudança de Fase Sugerida 🌸",
                message: `${cultivation.name} está há ${daysSinceStart} dias em vegetativo. Considere iniciar a floração.`,
                type: "info",
                cultivationId: cultivation.id,
                cultivationName: cultivation.name,
                timestamp: today.toISOString(),
                read: false,
                actionable: true,
                action: {
                  label: "Iniciar Floração",
                  handler: () => console.log("Iniciar floração")
                }
              })
            }
            break
        }
      })

      // Alertas baseados em problemas
      if (cultivation.hasSevereProblems) {
        newNotifications.push({
          id: `problem_${cultivation.id}_${Date.now()}`,
          title: "Atenção Necessária! ⚠️",
          message: `${cultivation.name} tem problemas graves que precisam de atenção imediata.`,
          type: "error",
          cultivationId: cultivation.id,
          cultivationName: cultivation.name,
          timestamp: today.toISOString(),
          read: false,
          actionable: true,
          action: {
            label: "Ver Detalhes",
            handler: () => console.log("Ver detalhes do problema")
          }
        })
      }
    })

    setNotifications(prev => {
      const existing = prev.filter(n => !newNotifications.some(nn => nn.id === n.id))
      return [...existing, ...newNotifications].slice(0, 50) // Limitar a 50 notificações
    })
  }, [cultivations, events, rules])

  // Executar verificação de notificações
  useEffect(() => {
    generateNotifications()
    const interval = setInterval(generateNotifications, 60000) // Verificar a cada minuto
    return () => clearInterval(interval)
  }, [generateNotifications])

  // Solicitar permissão para notificações do navegador
  useEffect(() => {
    if ("Notification" in window && Notification.permission === "default") {
      Notification.requestPermission()
    }
  }, [])

  // Enviar notificação do navegador
  const sendBrowserNotification = (notification: SmartNotification) => {
    if ("Notification" in window && Notification.permission === "granted") {
      new Notification(notification.title, {
        body: notification.message,
        icon: "/placeholder-logo.png",
        tag: notification.id
      })
    }
  }

  const markAsRead = (notificationId: string) => {
    setNotifications(prev => prev.map(n => 
      n.id === notificationId ? { ...n, read: true } : n
    ))
  }

  const dismissNotification = (notificationId: string) => {
    setNotifications(prev => prev.filter(n => n.id !== notificationId))
  }

  const toggleRule = (ruleId: string) => {
    setRules(prev => prev.map(r => 
      r.id === ruleId ? { ...r, enabled: !r.enabled } : r
    ))
  }

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case "success": return <CheckCircle className="h-4 w-4 text-green-500" />
      case "warning": return <AlertTriangle className="h-4 w-4 text-yellow-500" />
      case "error": return <AlertTriangle className="h-4 w-4 text-red-500" />
      default: return <Bell className="h-4 w-4 text-blue-500" />
    }
  }

  const unreadCount = notifications.filter(n => !n.read).length

  return (
    <div className="space-y-4">
      {/* Header */}
      <Card className="shadow-sm">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <BellRing className="h-5 w-5" />
              Notificações Inteligentes
              {unreadCount > 0 && (
                <Badge variant="destructive" className="ml-2">
                  {unreadCount}
                </Badge>
              )}
            </CardTitle>
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => setShowSettings(!showSettings)}
            >
              <Settings className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>
      </Card>

      {/* Configurações */}
      {showSettings && (
        <Card className="shadow-sm border-2 border-blue-200">
          <CardHeader>
            <CardTitle className="text-lg">Configurações de Notificação</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {rules.map(rule => (
              <div key={rule.id} className="flex items-center justify-between p-3 border rounded-lg">
                <div>
                  <Label className="font-medium">{rule.name}</Label>
                  <p className="text-sm text-muted-foreground">
                    Verificar a cada {rule.frequency} dia{rule.frequency > 1 ? 's' : ''}
                  </p>
                </div>
                <Switch
                  checked={rule.enabled}
                  onCheckedChange={() => toggleRule(rule.id)}
                />
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Lista de Notificações */}
      <div className="space-y-3">
        {notifications.length === 0 ? (
          <Card className="shadow-sm">
            <CardContent className="pt-6">
              <div className="text-center py-8 text-muted-foreground">
                <Bell className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>Nenhuma notificação no momento.</p>
                <p className="text-sm">Suas plantas estão sendo monitoradas automaticamente.</p>
              </div>
            </CardContent>
          </Card>
        ) : (
          notifications.map(notification => (
            <Card 
              key={notification.id} 
              className={`shadow-sm transition-all ${
                !notification.read ? 'border-l-4 border-l-blue-500 bg-blue-50/30' : ''
              }`}
            >
              <CardContent className="pt-4">
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-3 flex-1">
                    {getNotificationIcon(notification.type)}
                    <div className="flex-1">
                      <h4 className="font-medium text-sm mb-1">
                        {notification.title}
                      </h4>
                      <p className="text-sm text-muted-foreground mb-2">
                        {notification.message}
                      </p>
                      <div className="flex items-center gap-4 text-xs text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          {new Date(notification.timestamp).toLocaleString("pt-BR")}
                        </span>
                        <Badge variant="outline" className="text-xs">
                          {notification.cultivationName}
                        </Badge>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    {notification.actionable && notification.action && (
                      <Button 
                        size="sm" 
                        variant="outline"
                        onClick={() => {
                          notification.action?.handler()
                          markAsRead(notification.id)
                        }}
                      >
                        {notification.action.label}
                      </Button>
                    )}
                    {!notification.read && (
                      <Button 
                        size="sm" 
                        variant="ghost"
                        onClick={() => markAsRead(notification.id)}
                      >
                        Marcar como Lida
                      </Button>
                    )}
                    <Button 
                      size="sm" 
                      variant="ghost"
                      onClick={() => dismissNotification(notification.id)}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  )
}