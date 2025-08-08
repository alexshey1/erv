'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { toast } from 'sonner'
import { Notification, CreateNotificationRequest } from '@/lib/types/notifications'

interface UseNotificationsOptions {
  autoRefresh?: boolean
  refreshInterval?: number
}

export function useNotifications(options: UseNotificationsOptions = {}) {
  const { autoRefresh = false, refreshInterval = 30000 } = options

  const [notifications, setNotifications] = useState<Notification[]>([])
  const [unreadCount, setUnreadCount] = useState(0)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const retryTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  const lastRequestTimeRef = useRef<number>(0)

  // Carregar notificações com debounce, cache e retry automático
  const loadNotifications = useCallback(async (options: {
    limit?: number
    offset?: number
    unreadOnly?: boolean
    retryCount?: number
  } = {}) => {
    const { retryCount = 0 } = options
    
    // Debounce: evitar requisições muito frequentes
    const now = Date.now()
    if (now - lastRequestTimeRef.current < 1000) {
      return // Ignorar se última requisição foi há menos de 1 segundo
    }
    lastRequestTimeRef.current = now

    try {
      setLoading(true)
      setError(null)

      const params = new URLSearchParams()
      if (options.limit) params.set('limit', options.limit.toString())
      if (options.offset) params.set('offset', options.offset.toString())
      if (options.unreadOnly) params.set('unreadOnly', 'true')

      const response = await fetch(`/api/notifications?${params}`)
      const data = await response.json()

      if (!response.ok) {
        // Tratar rate limit com retry automático
        if (response.status === 429) {
          const retryAfter = parseInt(response.headers.get('retry-after') || '60')
          const waitTime = Math.min(retryAfter * 1000, 60000) // Máximo 1 minuto
          
          setError(`Rate limit atingido. Tentando novamente em ${Math.ceil(waitTime / 1000)}s...`)
          
          // Retry automático apenas se não exceder 3 tentativas
          if (retryCount < 3) {
            retryTimeoutRef.current = setTimeout(() => {
              loadNotifications({ ...options, retryCount: retryCount + 1 })
            }, waitTime)
          } else {
            setError('Muitas tentativas. Recarregue a página para tentar novamente.')
          }
          return
        }
        throw new Error(data.error || 'Erro ao carregar notificações')
      }

      if (data.success) {
        if (options.offset && options.offset > 0) {
          // Adicionar mais notificações (paginação)
          setNotifications(prev => [...prev, ...data.notifications])
        } else {
          // Substituir notificações (refresh)
          setNotifications(data.notifications)
        }
        setUnreadCount(data.unreadCount)
        return data
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro desconhecido'
      setError(errorMessage)
      console.error('Erro ao carregar notificações:', err)
    } finally {
      setLoading(false)
    }
  }, [])

  // Marcar como lida
  const markAsRead = useCallback(async (notificationId: string) => {
    try {
      const response = await fetch(`/api/notifications/${notificationId}`, {
        method: 'PATCH'
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || 'Erro ao marcar como lida')
      }

      // Atualizar estado local
      setNotifications(prev =>
        prev.map(n =>
          n.id === notificationId
            ? { ...n, isRead: true, readAt: new Date() }
            : n
        )
      )
      setUnreadCount(prev => Math.max(0, prev - 1))

      return true
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro desconhecido'
      setError(errorMessage)
      console.error('Erro ao marcar como lida:', err)
      return false
    }
  }, [])

  // Marcar todas como lidas
  const markAllAsRead = useCallback(async () => {
    try {
      const response = await fetch('/api/notifications/mark-all-read', {
        method: 'POST'
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || 'Erro ao marcar todas como lidas')
      }

      // Atualizar estado local
      setNotifications(prev =>
        prev.map(n => ({ ...n, isRead: true, readAt: new Date() }))
      )
      setUnreadCount(0)

      toast.success('Todas as notificações foram marcadas como lidas')
      return true
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro desconhecido'
      setError(errorMessage)
      toast.error(errorMessage)
      console.error('Erro ao marcar todas como lidas:', err)
      return false
    }
  }, [])

  // Remover notificação
  const deleteNotification = useCallback(async (notificationId: string) => {
    try {
      const response = await fetch(`/api/notifications/${notificationId}`, {
        method: 'DELETE'
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || 'Erro ao remover notificação')
      }

      // Atualizar estado local
      const notification = notifications.find(n => n.id === notificationId)
      setNotifications(prev => prev.filter(n => n.id !== notificationId))
      
      if (notification && !notification.isRead) {
        setUnreadCount(prev => Math.max(0, prev - 1))
      }

      toast.success('Notificação removida')
      return true
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro desconhecido'
      setError(errorMessage)
      toast.error(errorMessage)
      console.error('Erro ao remover notificação:', err)
      return false
    }
  }, [notifications])

  // Criar notificação (para testes/admin)
  const createNotification = useCallback(async (request: CreateNotificationRequest) => {
    try {
      const response = await fetch('/api/notifications', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(request)
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || 'Erro ao criar notificação')
      }

      const data = await response.json()
      
      if (data.success) {
        // Adicionar nova notificação ao início da lista
        setNotifications(prev => [data.notification, ...prev])
        if (!data.notification.isRead) {
          setUnreadCount(prev => prev + 1)
        }
        return data.notification
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro desconhecido'
      setError(errorMessage)
      console.error('Erro ao criar notificação:', err)
      throw err
    }
  }, [])

  // Refresh automático com controle de rate limit
  useEffect(() => {
    if (autoRefresh) {
      const interval = setInterval(() => {
        // Só fazer refresh se não estiver carregando e não houver erro de rate limit
        if (!loading && !error?.includes('Muitas requisições')) {
          loadNotifications({ limit: 20 })
        }
      }, Math.max(refreshInterval, 10000)) // Mínimo de 10 segundos

      return () => clearInterval(interval)
    }
  }, [autoRefresh, refreshInterval, loadNotifications, loading, error])

  // Carregar notificações iniciais com delay
  useEffect(() => {
    const timer = setTimeout(() => {
      loadNotifications({ limit: 20 })
    }, 100) // Pequeno delay para evitar múltiplas chamadas simultâneas

    return () => clearTimeout(timer)
  }, []) // Removido loadNotifications da dependência para evitar loops

  // Cleanup do timeout de retry
  useEffect(() => {
    return () => {
      if (retryTimeoutRef.current) {
        clearTimeout(retryTimeoutRef.current)
      }
    }
  }, [])

  return {
    notifications,
    unreadCount,
    loading,
    error,
    loadNotifications,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    createNotification,
    refresh: () => loadNotifications({ limit: 20 })
  }
}