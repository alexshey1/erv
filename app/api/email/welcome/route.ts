import { NextRequest, NextResponse } from 'next/server'
import { EmailService } from '@/lib/email-service'
import { createClient } from '@/lib/supabase/server'
import { createRateLimitedHandler } from '@/lib/rate-limiter'

async function emailHandler(request: NextRequest, rateLimitHeaders: Record<string, string>, context: { params: Promise<{ id: string }> }) {
  try {
    const supabase = await createClient()
    
    // Verificar se o usuário está autenticado
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
    }

    const { name, email } = await request.json()

    if (!name || !email) {
      return NextResponse.json({ error: 'Nome e email são obrigatórios' }, { status: 400 })
    }

    const result = await EmailService.sendWelcomeEmail({
      name,
      email,
      siteUrl: process.env.NEXT_PUBLIC_SITE_URL!
    })

    if (!result.success) {
      return NextResponse.json({ error: result.error }, { status: 500 })
    }

    return NextResponse.json({ success: true, message: 'Email de boas-vindas enviado' })

  } catch (error) {
    console.error('Erro na API de email de boas-vindas:', error)
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 })
  }
}

// Aplicar rate limiting: 3 emails por minuto por usuário (anti-spam)
export const POST = createRateLimitedHandler('email', emailHandler);