import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createRateLimitedHandler } from '@/lib/rate-limiter'
import { NotificationService } from '@/lib/notifications/notification-service'
import { CreateNotificationRequest, NotificationType, NotificationPriority } from '@/lib/types/notifications'

async function getNotificationsHandler(request: NextRequest, rateLimitHeaders: Record<string, string>, context: { params: Promise<{ id: string }> }) {
  try {
    const supabase = await createClient()
    
    // Verificar autenticação
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
    }

    // Parâmetros de query
    const { searchParams } = new URL(request.url)
    const limit = parseInt(searchParams.get('limit') || '50')
    const offset = parseInt(searchParams.get('offset') || '0')
    const unreadOnly = searchParams.get('unreadOnly') === 'true'

    // Buscar notificações
    const notifications = await NotificationService.getUserNotifications(user.id, {
      limit,
      offset,
      unreadOnly
    })

    // Buscar contagem de não lidas
    const unreadCount = await NotificationService.getUnreadCount(user.id)

    return NextResponse.json({
      success: true,
      notifications,
      unreadCount,
      pagination: {
        limit,
        offset,
        hasMore: notifications.length === limit
      }
    })

  } catch (error) {
    console.error('Erro ao buscar notificações:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}

async function createNotificationHandler(request: NextRequest, rateLimitHeaders: Record<string, string>, context: { params: Promise<{ id: string }> }) {
  try {
    const supabase = await createClient()
    
    // Verificar autenticação
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
    }

    const body = await request.json()
    
    // Validar dados de entrada
    const { type, title, message, priority, channels, metadata, actionUrl } = body

    if (!type || !title || !message) {
      return NextResponse.json(
        { error: 'Tipo, título e mensagem são obrigatórios' },
        { status: 400 }
      )
    }

    // Verificar se tipo é válido
    if (!Object.values(NotificationType).includes(type)) {
      return NextResponse.json(
        { error: 'Tipo de notificação inválido' },
        { status: 400 }
      )
    }

    // Criar notificação
    const notificationRequest: CreateNotificationRequest = {
      type,
      title,
      message,
      priority: priority || NotificationPriority.MEDIUM,
      channels,
      metadata,
      actionUrl,
      userId: user.id
    }

    const notification = await NotificationService.createNotification(notificationRequest)

    return NextResponse.json({
      success: true,
      notification
    })

  } catch (error) {
    console.error('Erro ao criar notificação:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}

// Rate limiting: 100 requests por minuto para notificações
export const GET = createRateLimitedHandler('notifications', getNotificationsHandler)
export const POST = createRateLimitedHandler('notifications', createNotificationHandler)