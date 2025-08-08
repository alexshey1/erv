'use client'

import { useState } from 'react'
import { Bell, Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { toast } from 'sonner'
import { NotificationType, NotificationPriority } from '@/lib/types/notifications'

export function SimpleNotificationTest() {
  const [loading, setLoading] = useState(false)

  const createTestNotification = async (type: NotificationType, title: string, message: string) => {
    try {
      setLoading(true)

      const response = await fetch('/api/notifications', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          type,
          title,
          message,
          priority: NotificationPriority.MEDIUM,
          metadata: { test: true }
        })
      })

      const data = await response.json()

      if (data.success) {
        toast.success('Notificação criada! Verifique o sino no header.')
      } else {
        throw new Error(data.error)
      }
    } catch (error) {
      console.error('Erro ao criar notificação:', error)
      toast.error('Erro ao criar notificação')
    } finally {
      setLoading(false)
    }
  }

  const testNotifications = [
    {
      type: NotificationType.REMINDER,
      title: '💧 Hora de regar!',
      message: 'Seu cultivo White Widow precisa de água há 3 dias.'
    },
    {
      type: NotificationType.ALERT,
      title: '🚨 Problema detectado',
      message: 'Possível deficiência nutricional nas folhas.'
    },
    {
      type: NotificationType.ACHIEVEMENT,
      title: '🏆 Parabéns!',
      message: 'Você completou seu primeiro cultivo com sucesso!'
    }
  ]

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Bell className="h-5 w-5" />
          Teste Rápido de Notificações
        </CardTitle>
        <CardDescription>
          Crie notificações de teste para ver o sistema funcionando
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        {testNotifications.map((notification, index) => (
          <Button
            key={index}
            variant="outline"
            className="w-full justify-start text-left h-auto p-4"
            onClick={() => createTestNotification(notification.type, notification.title, notification.message)}
            disabled={loading}
          >
            <div className="flex items-start gap-3">
              <Plus className="h-4 w-4 mt-1 flex-shrink-0" />
              <div>
                <div className="font-medium">{notification.title}</div>
                <div className="text-sm text-muted-foreground">{notification.message}</div>
              </div>
            </div>
          </Button>
        ))}
        
        <div className="text-xs text-muted-foreground mt-4 p-3 bg-blue-50 rounded">
          💡 <strong>Como testar:</strong> Clique em qualquer botão acima e depois verifique o sino (🔔) no header. 
          Deve aparecer um badge com o número de notificações não lidas.
        </div>
      </CardContent>
    </Card>
  )
}