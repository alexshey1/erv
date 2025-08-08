'use client'

import { useState, useEffect } from 'react'
import { Bell, Check, CheckCheck, X, Trash2, ExternalLink } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Badge } from '@/components/ui/badge'
import { formatDistanceToNow } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { NotificationType, NotificationPriority } from '@/lib/types/notifications'
import { useNotifications } from '@/hooks/use-notifications'

interface NotificationCenterProps {
  isOpen: boolean
  onClose: () => void
}

export function NotificationCenter({ isOpen, onClose }: NotificationCenterProps) {
  const {
    notifications,
    unreadCount,
    loading,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    loadNotifications
  } = useNotifications()

  const [hasMore, setHasMore] = useState(true)

  // Carregar mais notificações
  const loadMore = async () => {
    const result = await loadNotifications({
      limit: 20,
      offset: notifications.length
    })
    
    if (result?.pagination) {
      setHasMore(result.pagination.hasMore)
    }
  }

  // Refresh quando abrir
  useEffect(() => {
    if (isOpen) {
      loadNotifications({ limit: 20 })
    }
  }, [isOpen, loadNotifications])

  // Ícone por tipo de notificação
  const getNotificationIcon = (type: NotificationType) => {
    switch (type) {
      case NotificationType.REMINDER:
        return '⏰'
      case NotificationType.ALERT:
        return '🚨'
      case NotificationType.ACHIEVEMENT:
        return '🏆'
      case NotificationType.SYSTEM:
        return '⚙️'
      case NotificationType.MARKETING:
        return '📢'
      default:
        return '📝'
    }
  }

  // Cor por prioridade
  const getPriorityColor = (priority: NotificationPriority) => {
    switch (priority) {
      case NotificationPriority.CRITICAL:
        return 'bg-red-500'
      case NotificationPriority.HIGH:
        return 'bg-orange-500'
      case NotificationPriority.MEDIUM:
        return 'bg-blue-500'
      case NotificationPriority.LOW:
        return 'bg-gray-500'
      default:
        return 'bg-blue-500'
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 bg-black/50" onClick={onClose}>
      <div 
        className="fixed right-4 top-16 w-96 max-h-[80vh] bg-white dark:bg-gray-900 rounded-lg shadow-xl border"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b">
          <div className="flex items-center gap-2">
            <Bell className="h-5 w-5" />
            <h2 className="font-semibold">Notificações</h2>
            {unreadCount > 0 && (
              <Badge variant="destructive" className="text-xs">
                {unreadCount}
              </Badge>
            )}
          </div>
          <div className="flex items-center gap-2">
            {unreadCount > 0 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={markAllAsRead}
                className="text-xs"
              >
                <CheckCheck className="h-4 w-4 mr-1" />
                Marcar todas
              </Button>
            )}
            <Button variant="ghost" size="sm" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Lista de notificações */}
        <ScrollArea className="max-h-[60vh]">
          {loading && notifications.length === 0 ? (
            <div className="p-8 text-center text-gray-500">
              Carregando notificações...
            </div>
          ) : notifications.length === 0 ? (
            <div className="p-8 text-center text-gray-500">
              <Bell className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>Nenhuma notificação ainda</p>
              <p className="text-sm">Você será notificado sobre seus cultivos aqui</p>
            </div>
          ) : (
            <div className="divide-y">
              {notifications.map((notification) => (
                <div
                  key={notification.id}
                  className={`p-4 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors ${
                    !notification.isRead ? 'bg-blue-50 dark:bg-blue-950/20' : ''
                  }`}
                >
                  <div className="flex items-start gap-3">
                    {/* Ícone e indicador de prioridade */}
                    <div className="relative">
                      <div className="text-2xl">
                        {getNotificationIcon(notification.type)}
                      </div>
                      <div 
                        className={`absolute -top-1 -right-1 w-3 h-3 rounded-full ${getPriorityColor(notification.priority)}`}
                      />
                    </div>

                    {/* Conteúdo */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <h3 className={`font-medium text-sm ${
                          !notification.isRead ? 'text-gray-900 dark:text-white' : 'text-gray-700 dark:text-gray-300'
                        }`}>
                          {notification.title}
                        </h3>
                        {!notification.isRead && (
                          <div className="w-2 h-2 bg-blue-500 rounded-full flex-shrink-0 mt-1" />
                        )}
                      </div>
                      
                      <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                        {notification.message}
                      </p>

                      <div className="flex items-center justify-between mt-2">
                        <span className="text-xs text-gray-500">
                          {formatDistanceToNow(new Date(notification.createdAt), {
                            addSuffix: true,
                            locale: ptBR
                          })}
                        </span>

                        <div className="flex items-center gap-1">
                          {notification.actionUrl && (
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-6 px-2 text-xs"
                              onClick={() => {
                                if (!notification.isRead) {
                                  markAsRead(notification.id)
                                }
                                window.open(notification.actionUrl, '_blank')
                              }}
                            >
                              <ExternalLink className="h-3 w-3" />
                            </Button>
                          )}
                          
                          {!notification.isRead && (
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-6 px-2 text-xs"
                              onClick={() => markAsRead(notification.id)}
                            >
                              <Check className="h-3 w-3" />
                            </Button>
                          )}
                          
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-6 px-2 text-xs text-red-500 hover:text-red-700"
                            onClick={() => deleteNotification(notification.id)}
                          >
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </ScrollArea>

        {/* Footer com "Carregar mais" */}
        {hasMore && notifications.length > 0 && (
          <div className="p-4 border-t">
            <Button
              variant="outline"
              className="w-full"
              onClick={loadMore}
              disabled={loading}
            >
              {loading ? 'Carregando...' : 'Carregar mais'}
            </Button>
          </div>
        )}
      </div>
    </div>
  )
}