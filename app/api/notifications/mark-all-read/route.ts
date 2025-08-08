import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createRateLimitedHandler } from '@/lib/rate-limiter'
import { NotificationService } from '@/lib/notifications/notification-service'

async function markAllAsReadHandler(request: NextRequest, rateLimitHeaders: Record<string, string>, context: { params: Promise<{ id: string }> }) {
  try {
    const supabase = await createClient()
    
    // Verificar autenticação
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
    }

    // Marcar todas como lidas
    await NotificationService.markAllAsRead(user.id)

    return NextResponse.json({
      success: true,
      message: 'Todas as notificações foram marcadas como lidas'
    })

  } catch (error) {
    console.error('Erro ao marcar todas as notificações como lidas:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}

// Rate limiting: 10 requests por minuto (operação menos frequente)
export const POST = createRateLimitedHandler('general', markAllAsReadHandler)