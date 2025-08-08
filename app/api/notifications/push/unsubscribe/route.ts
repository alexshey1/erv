import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createRateLimitedHandler } from '@/lib/rate-limiter'
import { prisma } from '@/lib/prisma'
import { createLogger } from '@/lib/safe-logger'

const logger = createLogger('PushUnsubscribe')

async function unsubscribeHandler(request: NextRequest, rateLimitHeaders: Record<string, string>, context: { params: Promise<{ id: string }> }) {
  try {
    const supabase = await createClient()
    
    // Verificar autenticação
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
    }

    const body = await request.json()
    const { endpoint } = body

    if (!endpoint) {
      return NextResponse.json(
        { error: 'Endpoint é obrigatório' },
        { status: 400 }
      )
    }

    logger.info('Removendo push subscription', { 
      userId: user.id, 
      endpoint: endpoint.substring(0, 50) + '...' 
    })

    // Remover subscription (apenas do usuário atual)
    const result = await prisma.pushSubscription.deleteMany({
      where: {
        endpoint,
        userId: user.id // Garantir que só remove suas próprias subscriptions
      }
    })

    if (result.count === 0) {
      return NextResponse.json(
        { error: 'Subscription não encontrada' },
        { status: 404 }
      )
    }

    logger.info('Push subscription removida', { 
      userId: user.id,
      count: result.count
    })

    return NextResponse.json({
      success: true,
      message: 'Subscription removida com sucesso'
    })

  } catch (error) {
    logger.error('Erro ao remover push subscription:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}

// Rate limiting: 10 unsubscriptions por minuto por usuário
export const POST = createRateLimitedHandler('general', unsubscribeHandler)