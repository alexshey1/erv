'use client'

import { useState } from 'react'
import { Bell, TestTube, Zap, Trophy, AlertTriangle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { toast } from 'sonner'
import { NotificationType, NotificationPriority, NotificationChannel } from '@/lib/types/notifications'

export function NotificationDemo() {
  const [loading, setLoading] = useState(false)
  const [type, setType] = useState<NotificationType>(NotificationType.REMINDER)
  const [priority, setPriority] = useState<NotificationPriority>(NotificationPriority.MEDIUM)
  const [title, setTitle] = useState('')
  const [message, setMessage] = useState('')

  // Templates de exemplo
  const templates = {
    [NotificationType.REMINDER]: {
      title: '⏰ Hora de regar suas plantas!',
      message: 'Seu cultivo White Widow não recebe água há 3 dias. Que tal dar uma atenção especial para ela?'
    },
    [NotificationType.ALERT]: {
      title: '🚨 Problema detectado no cultivo',
      message: 'A IA detectou possíveis sinais de deficiência nutricional nas folhas. Verifique os nutrientes.'
    },
    [NotificationType.ACHIEVEMENT]: {
      title: '🏆 Parabéns! Nova conquista desbloqueada',
      message: 'Você completou seu primeiro cultivo com sucesso! Yield: 85g - Economia: R$ 1.200'
    },
    [NotificationType.SYSTEM]: {
      title: '⚙️ Sistema atualizado',
      message: 'Nova versão disponível com melhorias na análise de imagens e novos recursos de monitoramento.'
    }
  }

  // Aplicar template
  const applyTemplate = (selectedType: NotificationType) => {
    const template = templates[selectedType]
    setTitle(template.title)
    setMessage(template.message)
  }

  // Criar notificação de teste
  const createTestNotification = async () => {
    try {
      setLoading(true)

      if (!title.trim() || !message.trim()) {
        toast.error('Título e mensagem são obrigatórios')
        return
      }

      const response = await fetch('/api/notifications', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          type,
          title: title.trim(),
          message: message.trim(),
          priority,
          channels: [NotificationChannel.IN_APP, NotificationChannel.PUSH],
          metadata: {
            demo: true,
            timestamp: new Date().toISOString()
          }
        })
      })

      const data = await response.json()

      if (data.success) {
        toast.success('Notificação criada com sucesso!')
        
        // Limpar campos
        setTitle('')
        setMessage('')
      } else {
        throw new Error(data.error)
      }
    } catch (error) {
      console.error('Erro ao criar notificação:', error)
      toast.error('Erro ao criar notificação de teste')
    } finally {
      setLoading(false)
    }
  }

  // Criar múltiplas notificações de exemplo
  const createExampleNotifications = async () => {
    try {
      setLoading(true)
      
      const examples = [
        {
          type: NotificationType.REMINDER,
          title: '💧 Hora da rega!',
          message: 'Seu cultivo Blue Dream precisa de água. Última rega: há 4 dias.',
          priority: NotificationPriority.MEDIUM
        },
        {
          type: NotificationType.ALERT,
          title: '🌡️ Temperatura alta detectada',
          message: 'A temperatura está em 32°C. Considere melhorar a ventilação.',
          priority: NotificationPriority.HIGH
        },
        {
          type: NotificationType.ACHIEVEMENT,
          title: '🎯 Meta de economia atingida!',
          message: 'Você já economizou R$ 500 este mês com seus cultivos caseiros!',
          priority: NotificationPriority.LOW
        },
        {
          type: NotificationType.REMINDER,
          title: '🌱 Mudança de fase detectada',
          message: 'Seu cultivo entrou na fase de floração. Ajuste os nutrientes e iluminação.',
          priority: NotificationPriority.MEDIUM
        }
      ]

      for (const example of examples) {
        await fetch('/api/notifications', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            ...example,
            channels: [NotificationChannel.IN_APP],
            metadata: { demo: true, batch: true }
          })
        })
        
        // Pequeno delay entre notificações
        await new Promise(resolve => setTimeout(resolve, 500))
      }

      toast.success(`${examples.length} notificações de exemplo criadas!`)
    } catch (error) {
      console.error('Erro ao criar notificações de exemplo:', error)
      toast.error('Erro ao criar notificações de exemplo')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <TestTube className="h-5 w-5" />
          Demo do Sistema de Notificações
        </CardTitle>
        <CardDescription>
          Teste o sistema de notificações criando notificações personalizadas
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Tipo de notificação */}
        <div className="space-y-2">
          <Label htmlFor="type">Tipo de Notificação</Label>
          <Select
            value={type}
            onValueChange={(value: NotificationType) => {
              setType(value)
              applyTemplate(value)
            }}
          >
            <SelectTrigger id="type">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={NotificationType.REMINDER}>
                ⏰ Lembrete
              </SelectItem>
              <SelectItem value={NotificationType.ALERT}>
                🚨 Alerta
              </SelectItem>
              <SelectItem value={NotificationType.ACHIEVEMENT}>
                🏆 Conquista
              </SelectItem>
              <SelectItem value={NotificationType.SYSTEM}>
                ⚙️ Sistema
              </SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Prioridade */}
        <div className="space-y-2">
          <Label htmlFor="priority">Prioridade</Label>
          <Select
            value={priority}
            onValueChange={(value: NotificationPriority) => setPriority(value)}
          >
            <SelectTrigger id="priority">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={NotificationPriority.LOW}>
                🟢 Baixa
              </SelectItem>
              <SelectItem value={NotificationPriority.MEDIUM}>
                🟡 Média
              </SelectItem>
              <SelectItem value={NotificationPriority.HIGH}>
                🟠 Alta
              </SelectItem>
              <SelectItem value={NotificationPriority.CRITICAL}>
                🔴 Crítica
              </SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Título */}
        <div className="space-y-2">
          <Label htmlFor="title">Título</Label>
          <Input
            id="title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Digite o título da notificação..."
            maxLength={100}
          />
        </div>

        {/* Mensagem */}
        <div className="space-y-2">
          <Label htmlFor="message">Mensagem</Label>
          <Textarea
            id="message"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Digite a mensagem da notificação..."
            rows={3}
            maxLength={300}
          />
        </div>

        {/* Botões de ação */}
        <div className="flex gap-2">
          <Button
            onClick={createTestNotification}
            disabled={loading || !title.trim() || !message.trim()}
            className="flex-1"
          >
            {loading ? 'Criando...' : 'Criar Notificação'}
          </Button>
          
          <Button
            variant="outline"
            onClick={createExampleNotifications}
            disabled={loading}
          >
            <Zap className="h-4 w-4 mr-2" />
            Exemplos
          </Button>
        </div>

        {/* Informações */}
        <div className="text-sm text-muted-foreground space-y-1">
          <p>💡 <strong>Dica:</strong> As notificações aparecerão no badge do sino no header.</p>
          <p>🔔 Para testar push notifications, ative-as nas configurações primeiro.</p>
        </div>
      </CardContent>
    </Card>
  )
}