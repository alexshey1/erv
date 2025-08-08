import { NextRequest, NextResponse } from 'next/server'
import { createRateLimitedHandler } from '@/lib/rate-limiter'
import { createLogger } from '@/lib/safe-logger'

const logger = createLogger('WebVitals')

async function webVitalsHandler(request: NextRequest, rateLimitHeaders: Record<string, string>, context: { params: Promise<{ id: string }> }) {
  try {
    const metric = await request.json()
    
    // Log das métricas Web Vitals
    logger.info('Web Vital coletada', {
      name: metric.name,
      value: Math.round(metric.value),
      rating: metric.rating,
      id: metric.id,
      userAgent: request.headers.get('user-agent'),
      timestamp: new Date().toISOString()
    })

    // Aqui você pode:
    // 1. Salvar no banco de dados
    // 2. Enviar para serviço de analytics (DataDog, New Relic, etc.)
    // 3. Integrar com Sentry para performance monitoring
    
    // Exemplo de categorização das métricas
    const performanceCategory = categorizeMetric(metric.name, metric.value, metric.rating)
    
    if (performanceCategory === 'poor') {
      logger.warn('Métrica de performance ruim detectada', {
        metric: metric.name,
        value: metric.value,
        rating: metric.rating
      })
    }

    return NextResponse.json({ 
      success: true, 
      message: 'Métrica coletada com sucesso' 
    })

  } catch (error) {
    logger.error('Erro ao processar métrica Web Vital:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}

function categorizeMetric(name: string, value: number, rating: string): 'good' | 'needs-improvement' | 'poor' {
  // Thresholds baseados nas recomendações do Google
  const thresholds = {
    CLS: { good: 0.1, poor: 0.25 },
    FID: { good: 100, poor: 300 },
    FCP: { good: 1800, poor: 3000 },
    LCP: { good: 2500, poor: 4000 },
    TTFB: { good: 800, poor: 1800 }
  }

  const threshold = thresholds[name as keyof typeof thresholds]
  if (!threshold) return rating as any

  if (value <= threshold.good) return 'good'
  if (value <= threshold.poor) return 'needs-improvement'
  return 'poor'
}

// Rate limiting: 100 métricas por minuto por usuário
export const POST = createRateLimitedHandler('general', webVitalsHandler)