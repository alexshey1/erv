'use client'

import { createLogger } from '@/lib/safe-logger'

const logger = createLogger('ServiceWorkerRegistration')

export class SwRegistration {
  private static instance: SwRegistration
  private registration: ServiceWorkerRegistration | null = null

  private constructor() {}

  static getInstance(): SwRegistration {
    if (!SwRegistration.instance) {
      SwRegistration.instance = new SwRegistration()
    }
    return SwRegistration.instance
  }

  /**
   * Registra o Service Worker automaticamente
   */
  async register(): Promise<ServiceWorkerRegistration | null> {
    try {
      // Verificar se está no cliente e se suporta Service Workers
      if (typeof window === 'undefined' || !('serviceWorker' in navigator)) {
        logger.warn('Service Workers não são suportados')
        return null
      }

      // Verificar se já está registrado
      const existingRegistration = await navigator.serviceWorker.getRegistration()
      if (existingRegistration) {
        logger.info('Service Worker já registrado:', existingRegistration.scope)
        this.registration = existingRegistration
        return existingRegistration
      }

      // Registrar novo Service Worker
      const registration = await navigator.serviceWorker.register('/sw.js', {
        scope: '/'
      })

      logger.info('Service Worker registrado com sucesso:', registration.scope)
      this.registration = registration

      // Configurar listeners
      this.setupEventListeners(registration)

      return registration

    } catch (error) {
      logger.error('Erro ao registrar Service Worker:', error)
      return null
    }
  }

  /**
   * Configura listeners para eventos do Service Worker
   */
  private setupEventListeners(registration: ServiceWorkerRegistration): void {
    // Listener para atualizações
    registration.addEventListener('updatefound', () => {
      const newWorker = registration.installing
      if (newWorker) {
        logger.info('Nova versão do Service Worker encontrada')
        
        newWorker.addEventListener('statechange', () => {
          if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
            logger.info('Nova versão do Service Worker instalada')
            
            // Notificar usuário sobre atualização disponível
            this.notifyUpdate()
          }
        })
      }
    })

    // Listener para mensagens do Service Worker
    navigator.serviceWorker.addEventListener('message', (event) => {
      logger.info('Mensagem recebida do Service Worker:', event.data)
      
      const { type, payload } = event.data
      
      switch (type) {
        case 'NOTIFICATION_CLICKED':
          this.handleNotificationClick(payload)
          break
        case 'BACKGROUND_SYNC':
          this.handleBackgroundSync(payload)
          break
        default:
          logger.info('Tipo de mensagem desconhecido:', type)
      }
    })

    // Listener para controle do Service Worker
    navigator.serviceWorker.addEventListener('controllerchange', () => {
      logger.info('Service Worker controller mudou')
      // Recarregar página se necessário
      if (this.shouldReloadOnControllerChange()) {
        window.location.reload()
      }
    })
  }

  /**
   * Notifica usuário sobre atualização disponível
   */
  private notifyUpdate(): void {
    // Criar notificação in-app sobre atualização
    if ('Notification' in window && Notification.permission === 'granted') {
      new Notification('ErvApp Atualizado', {
        body: 'Uma nova versão está disponível. Recarregue a página para atualizar.',
        icon: '/icon-192.png',
        badge: '/badge-72.png',
        tag: 'app-update',
        requireInteraction: true
      })
    }

    // Também pode mostrar um toast ou modal
    logger.info('Atualização disponível - considere notificar o usuário')
  }

  /**
   * Manipula cliques em notificações
   */
  private handleNotificationClick(payload: any): void {
    logger.info('Notificação clicada:', payload)
    
    // Implementar lógica de navegação baseada no payload
    if (payload.url) {
      window.location.href = payload.url
    }
  }

  /**
   * Manipula sincronização em background
   */
  private handleBackgroundSync(payload: any): void {
    logger.info('Background sync executado:', payload)
    
    // Implementar lógica de sincronização
    // Por exemplo, recarregar notificações
  }

  /**
   * Determina se deve recarregar quando o controller muda
   */
  private shouldReloadOnControllerChange(): boolean {
    // Recarregar apenas se não for a primeira instalação
    return !!navigator.serviceWorker.controller
  }

  /**
   * Envia mensagem para o Service Worker
   */
  async sendMessage(type: string, payload?: any): Promise<void> {
    try {
      if (!this.registration || !navigator.serviceWorker.controller) {
        logger.warn('Service Worker não está ativo')
        return
      }

      navigator.serviceWorker.controller.postMessage({
        type,
        payload
      })

      logger.info('Mensagem enviada para Service Worker:', { type, payload })

    } catch (error) {
      logger.error('Erro ao enviar mensagem para Service Worker:', error)
    }
  }

  /**
   * Força atualização do Service Worker
   */
  async update(): Promise<void> {
    try {
      if (!this.registration) {
        logger.warn('Service Worker não está registrado')
        return
      }

      await this.registration.update()
      logger.info('Service Worker atualizado')

    } catch (error) {
      logger.error('Erro ao atualizar Service Worker:', error)
    }
  }

  /**
   * Remove registro do Service Worker
   */
  async unregister(): Promise<boolean> {
    try {
      if (!this.registration) {
        logger.warn('Service Worker não está registrado')
        return true
      }

      const success = await this.registration.unregister()
      if (success) {
        logger.info('Service Worker removido com sucesso')
        this.registration = null
      }

      return success

    } catch (error) {
      logger.error('Erro ao remover Service Worker:', error)
      return false
    }
  }

  /**
   * Obtém informações sobre o Service Worker
   */
  getInfo(): {
    isRegistered: boolean
    scope?: string
    state?: string
    updateAvailable: boolean
  } {
    if (!this.registration) {
      return {
        isRegistered: false,
        updateAvailable: false
      }
    }

    return {
      isRegistered: true,
      scope: this.registration.scope,
      state: this.registration.active?.state,
      updateAvailable: !!this.registration.waiting
    }
  }
}

// Instância singleton
export const swRegistration = SwRegistration.getInstance()

// Auto-registrar quando o módulo é carregado (apenas no cliente)
if (typeof window !== 'undefined') {
  // Aguardar carregamento completo da página
  if (document.readyState === 'complete') {
    swRegistration.register()
  } else {
    window.addEventListener('load', () => {
      swRegistration.register()
    })
  }
}