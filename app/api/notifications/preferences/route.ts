import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createRateLimitedHandler } from '@/lib/rate-limiter'
import { prisma } from '@/lib/prisma'
import { createLogger } from '@/lib/safe-logger'

const logger = createLogger('NotificationPreferences')

async function getPreferencesHandler(request: NextRequest, rateLimitHeaders: Record<string, string>, context: { params: Promise<{ id: string }> }) {
  try {
    const supabase = await createClient()
    
    // Verificar autenticação
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
    }

    // Buscar preferências do usuário
    let preferences = await prisma.notificationPreferences.findUnique({
      where: { userId: user.id }
    })

    // Se não existir, criar com valores padrão
    if (!preferences) {
      preferences = await prisma.notificationPreferences.create({
        data: {
          userId: user.id,
          reminders: true,
          alerts: true,
          achievements: true,
          marketing: false,
          pushEnabled: true,
          emailEnabled: true,
          quietHoursStart: 22,
          quietHoursEnd: 8,
          timezone: 'America/Sao_Paulo'
        }
      })

      logger.info('Preferências padrão criadas', { userId: user.id })
    }

    return NextResponse.json({
      success: true,
      preferences
    })

  } catch (error) {
    logger.error('Erro ao buscar preferências:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}

async function updatePreferencesHandler(request: NextRequest, rateLimitHeaders: Record<string, string>, context: { params: Promise<{ id: string }> }) {
  try {
    const supabase = await createClient()
    
    // Verificar autenticação
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
    }

    const body = await request.json()
    
    // Validar dados de entrada
    const allowedFields = [
      'reminders',
      'alerts', 
      'achievements',
      'marketing',
      'pushEnabled',
      'emailEnabled',
      'quietHoursStart',
      'quietHoursEnd',
      'timezone'
    ]

    const updateData: any = {}
    
    for (const [key, value] of Object.entries(body)) {
      if (allowedFields.includes(key)) {
        // Validações específicas
        if (key === 'quietHoursStart' || key === 'quietHoursEnd') {
          const hour = parseInt(value as string)
          if (isNaN(hour) || hour < 0 || hour > 23) {
            return NextResponse.json(
              { error: `${key} deve ser um número entre 0 e 23` },
              { status: 400 }
            )
          }
          updateData[key] = hour
        } else if (typeof value === 'boolean') {
          updateData[key] = value
        } else if (key === 'timezone' && typeof value === 'string') {
          updateData[key] = value
        }
      }
    }

    if (Object.keys(updateData).length === 0) {
      return NextResponse.json(
        { error: 'Nenhum campo válido para atualizar' },
        { status: 400 }
      )
    }

    logger.info('Atualizando preferências', { 
      userId: user.id, 
      fields: Object.keys(updateData) 
    })

    // Atualizar ou criar preferências
    const preferences = await prisma.notificationPreferences.upsert({
      where: { userId: user.id },
      update: {
        ...updateData,
        updatedAt: new Date()
      },
      create: {
        userId: user.id,
        reminders: true,
        alerts: true,
        achievements: true,
        marketing: false,
        pushEnabled: true,
        emailEnabled: true,
        quietHoursStart: 22,
        quietHoursEnd: 8,
        timezone: 'America/Sao_Paulo',
        ...updateData
      }
    })

    logger.info('Preferências atualizadas', { 
      userId: user.id,
      preferencesId: preferences.id
    })

    return NextResponse.json({
      success: true,
      preferences,
      message: 'Preferências atualizadas com sucesso'
    })

  } catch (error) {
    logger.error('Erro ao atualizar preferências:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}

// Rate limiting: 50 requests por minuto
export const GET = createRateLimitedHandler('general', getPreferencesHandler)
export const POST = createRateLimitedHandler('general', updatePreferencesHandler)