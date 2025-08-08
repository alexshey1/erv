import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createRateLimitedHandler } from '@/lib/rate-limiter'
import { NotificationService } from '@/lib/notifications/notification-service'

async function markAsReadHandler(
  request: NextRequest, 
  rateLimitHeaders: Record<string, string>,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = await createClient()
    
    // Verificar autenticação
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
    }

    const { id } = await params
    const notificationId = id

    if (!notificationId) {
      return NextResponse.json(
        { error: 'ID da notificação é obrigatório' },
        { status: 400 }
      )
    }

    // Marcar como lida
    await NotificationService.markAsRead(notificationId, user.id)

    return NextResponse.json({
      success: true,
      message: 'Notificação marcada como lida'
    })

  } catch (error) {
    console.error('Erro ao marcar notificação como lida:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}

async function deleteNotificationHandler(
  request: NextRequest,
  rateLimitHeaders: Record<string, string>,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = await createClient()
    
    // Verificar autenticação
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
    }

    const { id } = await params
    const notificationId = id

    if (!notificationId) {
      return NextResponse.json(
        { error: 'ID da notificação é obrigatório' },
        { status: 400 }
      )
    }

    // Remover notificação
    await NotificationService.deleteNotification(notificationId, user.id)

    return NextResponse.json({
      success: true,
      message: 'Notificação removida'
    })

  } catch (error) {
    console.error('Erro ao remover notificação:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}

// Rate limiting: 50 requests por minuto
export const PATCH = createRateLimitedHandler('general', markAsReadHandler)
export const DELETE = createRateLimitedHandler('general', deleteNotificationHandler)