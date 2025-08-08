import { createLogger } from '@/lib/safe-logger'
import { NotificationPayload, PushNotificationError, PushErrorType } from '@/lib/types/notifications'

const logger = createLogger('PushService')

// Chaves VAPID (você deve gerar suas próprias chaves)
const VAPID_PUBLIC_KEY = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY || 'BEl62iUYgUivxIkv69yViEuiBIa40HI2BNNfvdDUPGrhidG7_VCyUHPFjushXzqOUzjQ7Ck1Zt8Qs0Qs0Qs0Qs0Qs'
const VAPID_PRIVATE_KEY = process.env.VAPID_PRIVATE_KEY || 'your-private-key-here'

// AVISO: Este arquivo está deprecated. Use push-service.client.ts para código client e push-service.server.ts para server.
export class PushNotificationService {
  /**
   * Verifica se push notifications são suportadas
   */
  static isSupported(): boolean {
    if (typeof window === 'undefined') return false
    
    return (
      'serviceWorker' in navigator &&
      'PushManager' in window &&
      'Notification' in window
    )
  }

  /**
   * Solicita permissão para notificações
   */
  static async requestPermission(): Promise<boolean> {
    try {
      if (!this.isSupported()) {
        logger.warn('Push notifications não são suportadas neste navegador')
        return false
      }

      const permission = await Notification.requestPermission()
      logger.info('Permissão de notificação:', permission)
      
      return permission === 'granted'
    } catch (error) {
      logger.error('Erro ao solicitar permissão:', error)
      return false
    }
  }

  /**
   * Registra o service worker
   */
  static async registerServiceWorker(): Promise<ServiceWorkerRegistration | null> {
    try {
      if (!this.isSupported()) {
        return null
      }

      const registration = await navigator.serviceWorker.register('/sw.js', {
        scope: '/'
      })

      logger.info('Service Worker registrado:', registration.scope)

      // Aguardar ativação
      if (registration.installing) {
        await new Promise((resolve) => {
          registration.installing!.addEventListener('statechange', () => {
            if (registration.installing!.state === 'activated') {
              resolve(void 0)
            }
          })
        })
      }

      return registration
    } catch (error) {
      logger.error('Erro ao registrar Service Worker:', error)
      return null
    }
  }

  /**
   * Cria subscription para push notifications
   */
  static async subscribe(userId: string): Promise<PushSubscription | null> {
    try {
      // Verificar permissão
      const hasPermission = await this.requestPermission()
      if (!hasPermission) {
        throw new PushNotificationError(
          PushErrorType.PERMISSION_DENIED,
          'Permissão negada para notificações'
        )
      }

      // Registrar service worker
      const registration = await this.registerServiceWorker()
      if (!registration) {
        throw new PushNotificationError(
          PushErrorType.NETWORK_ERROR,
          'Falha ao registrar Service Worker'
        )
      }

      // Criar subscription
      const subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: this.urlBase64ToUint8Array(VAPID_PUBLIC_KEY) as BufferSource
      })

      logger.info('Push subscription criada:', subscription.endpoint)

      // Salvar subscription no servidor
      await this.saveSubscription(userId, subscription)

      return subscription
    } catch (error) {
      if (error instanceof PushNotificationError) {
        throw error
      }
      
      logger.error('Erro ao criar subscription:', error)
      throw new PushNotificationError(
        PushErrorType.NETWORK_ERROR,
        'Falha ao criar subscription'
      )
    }
  }

  /**
   * Remove subscription
   */
  static async unsubscribe(userId: string): Promise<boolean> {
    try {
      const registration = await navigator.serviceWorker.getRegistration()
      if (!registration) {
        return true
      }

      const subscription = await registration.pushManager.getSubscription()
      if (!subscription) {
        return true
      }

      // Remover subscription do navegador
      const unsubscribed = await subscription.unsubscribe()
      
      if (unsubscribed) {
        // Remover do servidor
        await this.removeSubscription(userId, subscription.endpoint)
        logger.info('Push subscription removida')
      }

      return unsubscribed
    } catch (error) {
      logger.error('Erro ao remover subscription:', error)
      return false
    }
  }

  /**
   * Verifica se já existe subscription ativa
   */
  static async getExistingSubscription(): Promise<PushSubscription | null> {
    try {
      const registration = await navigator.serviceWorker.getRegistration()
      if (!registration) {
        return null
      }

      return await registration.pushManager.getSubscription()
    } catch (error) {
      logger.error('Erro ao verificar subscription existente:', error)
      return null
    }
  }

  /**
   * Removido método sendPush. Veja push-service.server.ts para envio de notificações no servidor.
   */

  /**
   * Salva subscription no servidor
   */
  private static async saveSubscription(
    userId: string,
    subscription: PushSubscription
  ): Promise<void> {
    try {
      const response = await fetch('/api/notifications/push/subscribe', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          userId,
          endpoint: subscription.endpoint,
          keys: {
            p256dh: this.arrayBufferToBase64(subscription.getKey('p256dh')!),
            auth: this.arrayBufferToBase64(subscription.getKey('auth')!)
          },
          userAgent: navigator.userAgent
        })
      })

      if (!response.ok) {
        throw new Error('Falha ao salvar subscription no servidor')
      }

      logger.info('Subscription salva no servidor')
    } catch (error) {
      logger.error('Erro ao salvar subscription:', error)
      throw error
    }
  }

  /**
   * Remove subscription do servidor
   */
  private static async removeSubscription(
    userId: string,
    endpoint: string
  ): Promise<void> {
    try {
      const response = await fetch('/api/notifications/push/unsubscribe', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          userId,
          endpoint
        })
      })

      if (!response.ok) {
        throw new Error('Falha ao remover subscription do servidor')
      }

      logger.info('Subscription removida do servidor')
    } catch (error) {
      logger.error('Erro ao remover subscription:', error)
      throw error
    }
  }

  /**
   * Converte VAPID key para Uint8Array
   */
  private static urlBase64ToUint8Array(base64String: string): Uint8Array {
    const padding = '='.repeat((4 - base64String.length % 4) % 4)
    const base64 = (base64String + padding)
      .replace(/-/g, '+')
      .replace(/_/g, '/')

    const rawData = window.atob(base64)
    const outputArray = new Uint8Array(rawData.length)

    for (let i = 0; i < rawData.length; ++i) {
      outputArray[i] = rawData.charCodeAt(i)
    }
    return outputArray
  }

  /**
   * Converte ArrayBuffer para Base64
   */
  private static arrayBufferToBase64(buffer: ArrayBuffer): string {
    const bytes = new Uint8Array(buffer)
    let binary = ''
    for (let i = 0; i < bytes.byteLength; i++) {
      binary += String.fromCharCode(bytes[i])
    }
    return window.btoa(binary)
  }

  /**
   * Testa push notification
   */
  static async testNotification(title: string, body: string): Promise<void> {
    try {
      if (!this.isSupported()) {
        throw new Error('Push notifications não suportadas')
      }

      const hasPermission = await this.requestPermission()
      if (!hasPermission) {
        throw new Error('Permissão negada')
      }

      // Criar notificação local para teste
      new Notification(title, {
        body,
        icon: '/icon-192.png',
        badge: '/badge-72.png'
      })

      logger.info('Notificação de teste enviada')
    } catch (error) {
      logger.error('Erro ao testar notificação:', error)
      throw error
    }
  }
}