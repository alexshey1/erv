import { NextRequest, NextResponse } from 'next/server'
import { createRateLimitedHandler } from '@/lib/rate-limiter'
import { createLogger } from '@/lib/safe-logger'

const logger = createLogger('ErrorTracking')

async function errorHandler(request: NextRequest, rateLimitHeaders: Record<string, string>, context: { params: Promise<{ id: string }> }) {
  try {
    const errorData = await request.json()
    
    // Log do erro JavaScript
    logger.error('Erro JavaScript capturado', {
      message: errorData.message,
      filename: errorData.filename,
      lineno: errorData.lineno,
      colno: errorData.colno,
      type: errorData.type || 'javascript',
      userAgent: errorData.userAgent,
      timestamp: errorData.timestamp,
      url: request.url
    })

    // Aqui você pode:
    // 1. Salvar no banco de dados para análise
    // 2. Enviar para Sentry automaticamente
    // 3. Criar alertas para erros críticos
    // 4. Agrupar erros similares

    // Verificar se é um erro crítico
    const isCritical = checkIfCriticalError(errorData)
    
    if (isCritical) {
      logger.error('ERRO CRÍTICO detectado', {
        error: errorData,
        severity: 'critical'
      })
      
      // Aqui você poderia enviar notificação imediata
      // await sendCriticalErrorAlert(errorData)
    }

    return NextResponse.json({ 
      success: true, 
      message: 'Erro registrado com sucesso' 
    })

  } catch (error) {
    logger.error('Erro ao processar erro JavaScript:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}

function checkIfCriticalError(errorData: any): boolean {
  // Definir critérios para erros críticos
  const criticalPatterns = [
    /payment/i,
    /authentication/i,
    /database/i,
    /security/i,
    /unauthorized/i
  ]

  const message = errorData.message || ''
  return criticalPatterns.some(pattern => pattern.test(message))
}

// Rate limiting: 50 erros por minuto por usuário (para evitar spam)
export const POST = createRateLimitedHandler('general', errorHandler)