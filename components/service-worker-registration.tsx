'use client'

import { useEffect } from 'react'

export default function ServiceWorkerRegistration() {
  useEffect(() => {
    if (
      typeof window !== 'undefined' &&
      'serviceWorker' in navigator &&
      window.workbox !== undefined
    ) {
      const wb = window.workbox
      
      // Registrar service worker quando a página carregar
      const promptNewVersionAvailable = () => {
        // Você pode personalizar esta mensagem ou criar um componente de notificação
        if (confirm('Nova versão disponível! Recarregar para atualizar?')) {
          wb.messageSkipWaiting()
          window.location.reload()
        }
      }

      const promptNewVersionActivated = () => {
        // Service worker foi ativado
        console.log('Service Worker ativado')
      }

      // Eventos do Workbox
      wb.addEventListener('waiting', promptNewVersionAvailable)
      wb.addEventListener('controlling', promptNewVersionActivated)

      // Registrar o service worker
      wb.register()
    } else if (
      typeof window !== 'undefined' &&
      'serviceWorker' in navigator
    ) {
      // Fallback para service worker manual se Workbox não estiver disponível
      window.addEventListener('load', () => {
        navigator.serviceWorker
          .register('/sw.js')
          .then((registration) => {
            console.log('Service Worker registrado:', registration.scope)
            
            // Verificar atualizações
            registration.addEventListener('updatefound', () => {
              const newWorker = registration.installing
              if (newWorker) {
                newWorker.addEventListener('statechange', () => {
                  if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                    // Nova versão disponível
                    if (confirm('Nova versão disponível! Recarregar para atualizar?')) {
                      newWorker.postMessage({ type: 'SKIP_WAITING' })
                      window.location.reload()
                    }
                  }
                })
              }
            })
          })
          .catch((error) => {
            console.error('Erro ao registrar Service Worker:', error)
          })
      })

      // Listener para quando o service worker for controlado
      navigator.serviceWorker.addEventListener('controllerchange', () => {
        window.location.reload()
      })
    }
  }, [])

  return null
}

// Adicionar tipos do Workbox se não existirem
declare global {
  interface Window {
    workbox: any
  }
}
