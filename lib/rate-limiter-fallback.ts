import { NextRequest, NextResponse } from 'next/server'
import { createLogger } from './safe-logger'

const logger = createLogger('RateLimiterFallback')

// Cache em memória para rate limiting (fallback)
interface RateLimitEntry {
  count: number
  resetTime: number
  firstRequest: number
}

class InMemoryRateLimit {
  private cache = new Map<string, RateLimitEntry>()
  private cleanupInterval: NodeJS.Timeout

  constructor() {
    // Limpeza automática a cada 5 minutos
    this.cleanupInterval = setInterval(() => {
      this.cleanup()
    }, 5 * 60 * 1000)
  }

  private cleanup() {
    const now = Date.now()
    let cleaned = 0
    
    for (const [key, entry] of this.cache.entries()) {
      if (now > entry.resetTime) {
        this.cache.delete(key)
        cleaned++
      }
    }
    
    if (cleaned > 0) {
      logger.debug(`Limpeza do cache: ${cleaned} entradas removidas`)
    }
  }

  async limit(identifier: string, maxRequests: number, windowMs: number) {
    const now = Date.now()
    const resetTime = now + windowMs
    
    const existing = this.cache.get(identifier)
    
    if (!existing) {
      // Primeira requisição
      this.cache.set(identifier, {
        count: 1,
        resetTime,
        firstRequest: now
      })
      
      return {
        success: true,
        limit: maxRequests,
        remaining: maxRequests - 1,
        reset: resetTime
      }
    }
    
    // Verificar se a janela expirou
    if (now > existing.resetTime) {
      // Reset da janela
      this.cache.set(identifier, {
        count: 1,
        resetTime,
        firstRequest: now
      })
      
      return {
        success: true,
        limit: maxRequests,
        remaining: maxRequests - 1,
        reset: resetTime
      }
    }
    
    // Incrementar contador
    existing.count++
    
    if (existing.count > maxRequests) {
      return {
        success: false,
        limit: maxRequests,
        remaining: 0,
        reset: existing.resetTime
      }
    }
    
    return {
      success: true,
      limit: maxRequests,
      remaining: maxRequests - existing.count,
      reset: existing.resetTime
    }
  }

  getStats() {
    return {
      totalEntries: this.cache.size,
      memoryUsage: process.memoryUsage()
    }
  }

  clear() {
    this.cache.clear()
  }

  destroy() {
    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval)
    }
    this.clear()
  }
}

// Instância singleton
const inMemoryLimiter = new InMemoryRateLimit()

// Configurações de rate limiting por tipo
const RATE_LIMITS = {
  upload: { maxRequests: 5, windowMs: 60 * 1000 }, // 5 por minuto
  external: { maxRequests: 20, windowMs: 60 * 1000 }, // 20 por minuto
  email: { maxRequests: 3, windowMs: 60 * 1000 }, // 3 por minuto
  ai: { maxRequests: 10, windowMs: 60 * 1000 }, // 10 por minuto
  general: { maxRequests: 30, windowMs: 60 * 1000 }, // 30 por minuto
  notifications: { maxRequests: 100, windowMs: 60 * 1000 }, // 100 por minuto
} as const

export type RateLimitType = keyof typeof RATE_LIMITS

// Função para obter identificador único (usuário ou IP)
function getIdentifier(request: NextRequest, userId?: string): string {
  if (userId) {
    return `user:${userId}`
  }
  
  // Fallback para IP
  const forwarded = request.headers.get('x-forwarded-for')
  const ip = forwarded ? forwarded.split(',')[0] : request.headers.get('x-real-ip') || 'unknown'
  return `ip:${ip}`
}

// Middleware de rate limiting com fallback
export async function withRateLimitFallback(
  request: NextRequest,
  limiterType: RateLimitType,
  userId?: string
): Promise<NextResponse | { success: true; headers: Record<string, string> }> {
  try {
    const identifier = getIdentifier(request, userId)
    const config = RATE_LIMITS[limiterType]
    
    logger.debug(`Checking rate limit (fallback) for ${limiterType}:${identifier}`)
    
    const result = await inMemoryLimiter.limit(
      `${limiterType}:${identifier}`,
      config.maxRequests,
      config.windowMs
    )
    
    if (!result.success) {
      logger.warn(`Rate limit exceeded (fallback) for ${limiterType}:${identifier}`, {
        limit: result.limit,
        reset: result.reset,
        remaining: result.remaining
      })
      
      return NextResponse.json(
        {
          error: 'Rate limit exceeded',
          message: 'Muitas tentativas. Tente novamente em alguns minutos.',
          limit: result.limit,
          reset: result.reset,
          remaining: 0
        },
        {
          status: 429,
          headers: {
            'X-RateLimit-Limit': result.limit.toString(),
            'X-RateLimit-Remaining': '0',
            'X-RateLimit-Reset': result.reset.toString(),
            'Retry-After': Math.round((result.reset - Date.now()) / 1000).toString(),
          },
        }
      )
    }
    
    logger.debug(`Rate limit check passed (fallback) for ${limiterType}:${identifier}`, {
      limit: result.limit,
      remaining: result.remaining
    })
    
    return {
      success: true,
      headers: {
        'X-RateLimit-Limit': result.limit.toString(),
        'X-RateLimit-Remaining': result.remaining.toString(),
        'X-RateLimit-Reset': result.reset.toString(),
      }
    }
    
  } catch (error) {
    logger.error('Rate limiting fallback error:', error)
    // Em caso de erro, permitir a requisição
    return { 
      success: true, 
      headers: {
        'X-RateLimit-Limit': '100',
        'X-RateLimit-Remaining': '99',
        'X-RateLimit-Reset': (Date.now() + 60000).toString(),
      }
    }
  }
}

// Helper para criar handler com rate limiting
export function createRateLimitedHandlerFallback(
  limiterType: RateLimitType,
  handler: (request: NextRequest, rateLimitHeaders: Record<string, string>, context?: any) => Promise<NextResponse>
) {
  return async (request: NextRequest, context?: any) => {
    // Tentar obter userId do header ou cookie (se disponível)
    const authHeader = request.headers.get('authorization')
    const userId = authHeader ? extractUserIdFromAuth(authHeader) : undefined
    
    const rateLimitResult = await withRateLimitFallback(request, limiterType, userId)
    
    // Se rateLimitResult é um NextResponse (erro de rate limit), retornar diretamente
    if ('status' in rateLimitResult) {
      return rateLimitResult
    }
    
    // Se chegou aqui, rateLimitResult tem a propriedade success
    if (!rateLimitResult.success) {
      return NextResponse.json(
        { error: 'Rate limit check failed' },
        { status: 500 }
      )
    }
    
    try {
      const response = await handler(request, rateLimitResult.headers || {})
      
      // Adicionar headers de rate limiting na resposta
      if (rateLimitResult.headers) {
        Object.entries(rateLimitResult.headers).forEach(([key, value]) => {
          if (value) {
            response.headers.set(key, value)
          }
        })
      }
      
      return response
    } catch (error) {
      logger.error('Handler error:', error)
      return NextResponse.json(
        { error: 'Internal server error' },
        { status: 500 }
      )
    }
  }
}

// Helper para extrair userId do token de autorização
function extractUserIdFromAuth(authHeader: string): string | undefined {
  try {
    // Implementar extração do userId do JWT ou session token
    // Por enquanto, retorna undefined para usar IP como fallback
    return undefined
  } catch {
    return undefined
  }
}

// Função para obter estatísticas
export function getRateLimitStats() {
  return inMemoryLimiter.getStats()
}

// Função para limpar cache (útil para testes)
export function clearRateLimitCache() {
  inMemoryLimiter.clear()
}

// Cleanup na saída do processo
process.on('SIGTERM', () => {
  inMemoryLimiter.destroy()
})

process.on('SIGINT', () => {
  inMemoryLimiter.destroy()
})