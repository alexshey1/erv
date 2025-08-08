import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createRateLimitedHandler } from '@/lib/rate-limiter'
import { prisma } from '@/lib/prisma'
import { createLogger } from '@/lib/safe-logger'

const logger = createLogger('PushSubscribe')

async function subscribeHandler(request: NextRequest, rateLimitHeaders: Record<string, string>, context: { params: Promise<{ id: string }> }) {
  try {
    const supabase = await createClient()
    
    // Verificar autenticação
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
    }

    const body = await request.json()
    const { endpoint, keys, userAgent } = body

    if (!endpoint || !keys?.p256dh || !keys?.auth) {
      return NextResponse.json(
        { error: 'Dados de subscription inválidos' },
        { status: 400 }
      )
    }

    logger.info('Criando push subscription', { 
      userId: user.id, 
      endpoint: endpoint.substring(0, 50) + '...' 
    })

    // Verificar se já existe subscription para este endpoint
    const existingSubscription = await prisma.pushSubscription.findUnique({
      where: { endpoint }
    })

    if (existingSubscription) {
      // Atualizar subscription existente
      const updatedSubscription = await prisma.pushSubscription.update({
        where: { endpoint },
        data: {
          p256dh: keys.p256dh,
          auth: keys.auth,
          userAgent: userAgent || null,
          isActive: true,
          lastUsed: new Date(),
          userId: user.id // Garantir que pertence ao usuário atual
        }
      })

      logger.info('Push subscription atualizada', { id: updatedSubscription.id })

      return NextResponse.json({
        success: true,
        subscription: updatedSubscription,
        message: 'Subscription atualizada com sucesso'
      })
    } else {
      // Criar nova subscription
      const newSubscription = await prisma.pushSubscription.create({
        data: {
          endpoint,
          p256dh: keys.p256dh,
          auth: keys.auth,
          userAgent: userAgent || null,
          userId: user.id
        }
      })

      logger.info('Push subscription criada', { id: newSubscription.id })

      return NextResponse.json({
        success: true,
        subscription: newSubscription,
        message: 'Subscription criada com sucesso'
      })
    }

  } catch (error) {
    logger.error('Erro ao criar push subscription:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}

// Rate limiting: 10 subscriptions por minuto por usuário
export const POST = createRateLimitedHandler('general', subscribeHandler)