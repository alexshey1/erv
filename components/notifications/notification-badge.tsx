'use client'

import { useState } from 'react'
import { Bell } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { NotificationCenter } from './notification-center'
import { useNotifications } from '@/hooks/use-notifications'

export function NotificationBadge() {
  const [isOpen, setIsOpen] = useState(false)
  const { unreadCount, loading, refresh } = useNotifications({ 
    autoRefresh: true, 
    refreshInterval: 30000 
  })

  // Atualizar quando a central é fechada
  const handleClose = () => {
    setIsOpen(false)
    refresh() // Recarregar para pegar mudanças
  }

  return (
    <>
      <div className="relative">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setIsOpen(true)}
          className="relative"
          disabled={loading}
        >
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <Badge 
              variant="destructive" 
              className="absolute -top-1 -right-1 h-5 w-5 p-0 flex items-center justify-center text-xs"
            >
              {unreadCount > 99 ? '99+' : unreadCount}
            </Badge>
          )}
        </Button>
      </div>

      <NotificationCenter 
        isOpen={isOpen} 
        onClose={handleClose}
      />
    </>
  )
}