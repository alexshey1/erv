'use client'

import { useEffect } from 'react'
import { swRegistration } from '@/lib/notifications/sw-registration'

interface ServiceWorkerProviderProps {
  children: React.ReactNode
}

export function ServiceWorkerProvider({ children }: ServiceWorkerProviderProps) {
  useEffect(() => {
    // Registrar Service Worker quando o componente montar
    const registerSW = async () => {
      try {
        await swRegistration.register()
      } catch (error) {
        console.error('Erro ao registrar Service Worker:', error)
      }
    }

    // Aguardar um pouco para não bloquear a renderização inicial
    const timer = setTimeout(registerSW, 1000)

    return () => clearTimeout(timer)
  }, [])

  return <>{children}</>
}