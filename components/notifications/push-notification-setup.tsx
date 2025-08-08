'use client'

import { useState, useEffect } from 'react'
import { Bell, BellOff, AlertCircle, CheckCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Switch } from '@/components/ui/switch'
import { toast } from 'sonner'
import { PushNotificationService } from '@/lib/notifications/push-service.client'
import { PushNotificationError, PushErrorType } from '@/lib/types/notifications'

interface PushNotificationSetupProps {
  userId: string
}

export function PushNotificationSetup({ userId }: PushNotificationSetupProps) {
  const [isSupported, setIsSupported] = useState(false)
  const [permission, setPermission] = useState<NotificationPermission>('default')
  const [isSubscribed, setIsSubscribed] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Verificar suporte e status inicial
  useEffect(() => {
    const checkSupport = async () => {
      const supported = PushNotificationService.isSupported()
      setIsSupported(supported)

      if (supported) {
        setPermission(Notification.permission)
        
        // Verificar se já tem subscription
        const existingSubscription = await PushNotificationService.getExistingSubscription()
        setIsSubscribed(!!existingSubscription)
      }
    }

    checkSupport()
  }, [])

  // Solicitar permissão e criar subscription
  const handleSubscribe = async () => {
    try {
      setLoading(true)
      setError(null)

      const subscription = await PushNotificationService.subscribe(userId)
      
      if (subscription) {
        setIsSubscribed(true)
        setPermission('granted')
        toast.success('Notificações push ativadas com sucesso!')
      }
    } catch (error) {
      console.error('Erro ao ativar push notifications:', error)
      
      if (error instanceof PushNotificationError) {
        switch (error.type) {
          case PushErrorType.PERMISSION_DENIED:
            setError('Permissão negada. Ative as notificações nas configurações do navegador.')
            break
          case PushErrorType.NETWORK_ERROR:
            setError('Erro de conexão. Verifique sua internet e tente novamente.')
            break
          default:
            setError('Erro ao ativar notificações push. Tente novamente.')
        }
      } else {
        setError('Erro inesperado. Tente novamente.')
      }
      
      toast.error('Erro ao ativar notificações push')
    } finally {
      setLoading(false)
    }
  }

  // Remover subscription
  const handleUnsubscribe = async () => {
    try {
      setLoading(true)
      setError(null)

      const success = await PushNotificationService.unsubscribe(userId)
      
      if (success) {
        setIsSubscribed(false)
        toast.success('Notificações push desativadas')
      }
    } catch (error) {
      console.error('Erro ao desativar push notifications:', error)
      setError('Erro ao desativar notificações push')
      toast.error('Erro ao desativar notificações push')
    } finally {
      setLoading(false)
    }
  }

  // Testar notificação
  const handleTest = async () => {
    try {
      await PushNotificationService.testNotification(
        '🌱 Teste - ErvApp',
        'Esta é uma notificação de teste do seu cultivo!'
      )
      toast.success('Notificação de teste enviada!')
    } catch (error) {
      console.error('Erro ao testar notificação:', error)
      toast.error('Erro ao enviar notificação de teste')
    }
  }

  // Se não suporta push notifications
  if (!isSupported) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BellOff className="h-5 w-5" />
            Notificações Push
          </CardTitle>
          <CardDescription>
            Receba lembretes importantes sobre seus cultivos
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              Seu navegador não suporta notificações push. 
              Considere usar um navegador mais recente como Chrome, Firefox ou Safari.
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Bell className="h-5 w-5" />
          Notificações Push
        </CardTitle>
        <CardDescription>
          Receba lembretes importantes sobre seus cultivos mesmo quando não estiver na aplicação
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Status atual */}
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <p className="text-sm font-medium">
              Status das Notificações
            </p>
            <p className="text-sm text-muted-foreground">
              {isSubscribed ? 'Ativadas' : 'Desativadas'}
            </p>
          </div>
          <div className="flex items-center gap-2">
            {isSubscribed ? (
              <CheckCircle className="h-5 w-5 text-green-500" />
            ) : (
              <BellOff className="h-5 w-5 text-gray-400" />
            )}
            <Switch
              checked={isSubscribed}
              onCheckedChange={isSubscribed ? handleUnsubscribe : handleSubscribe}
              disabled={loading}
            />
          </div>
        </div>

        {/* Erro */}
        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {/* Informações sobre permissão */}
        {permission === 'denied' && (
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              As notificações foram bloqueadas. Para ativar:
              <br />
              1. Clique no ícone de cadeado na barra de endereços
              <br />
              2. Altere as notificações para "Permitir"
              <br />
              3. Recarregue a página
            </AlertDescription>
          </Alert>
        )}

        {/* Botões de ação */}
        <div className="flex gap-2">
          {!isSubscribed ? (
            <Button 
              onClick={handleSubscribe} 
              disabled={loading || permission === 'denied'}
              className="flex-1"
            >
              {loading ? 'Ativando...' : 'Ativar Notificações'}
            </Button>
          ) : (
            <>
              <Button 
                variant="outline" 
                onClick={handleTest}
                disabled={loading}
                className="flex-1"
              >
                Testar Notificação
              </Button>
              <Button 
                variant="destructive" 
                onClick={handleUnsubscribe}
                disabled={loading}
              >
                {loading ? 'Desativando...' : 'Desativar'}
              </Button>
            </>
          )}
        </div>

        {/* Informações adicionais */}
        {isSubscribed && (
          <div className="text-sm text-muted-foreground space-y-1">
            <p>✅ Você receberá notificações sobre:</p>
            <ul className="list-disc list-inside ml-4 space-y-1">
              <li>Lembretes de rega e nutrição</li>
              <li>Mudanças de fase do cultivo</li>
              <li>Alertas de problemas detectados</li>
              <li>Conquistas e marcos importantes</li>
            </ul>
          </div>
        )}
      </CardContent>
    </Card>
  )
}