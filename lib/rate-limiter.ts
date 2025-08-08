import { Ratelimit } from '@upstash/ratelimit'
import { Redis } from '@upstash/redis'
import { NextRequest, NextResponse } from 'next/server'
import { createLogger } from './safe-logger'
import { withRateLimitFallback, createRateLimitedHandlerFallback, type RateLimitType } from './rate-limiter-fallback'

const logger = createLogger('RateLimiter')

// Verificar se Redis está desabilitado via variável de ambiente
const isRedisDisabled = process.env.DISABLE_REDIS === 'true'

// Configuração do Redis
let redis: Redis | null = null
let redisAvailable = false

// Tentar inicializar Redis apenas se não estiver desabilitado
if (!isRedisDisabled) {
try {
  redis = Redis.fromEnv()
  redisAvailable = true
  logger.info('Redis inicializado com sucesso')
} catch (error) {
  logger.warn('Redis não disponível, usando fallback in-memory:', error instanceof Error ? error.message : 'Erro desconhecido')
  redisAvailable = false
}
} else {
  logger.info('Redis desabilitado via DISABLE_REDIS=true, usando apenas fallback in-memory')
  redisAvailable = false
}

// Função para testar se o Redis está funcionando corretamente
async function testRedisConnection(): Promise<boolean> {
  if (!redis) return false
  
  try {
    // Teste simples de ping
    await redis.ping()
    return true
  } catch (error) {
    logger.warn('Redis connection test failed, falling back to in-memory:', error instanceof Error ? error.message : 'Erro desconhecido')
    return false
  }
}

// Diferentes tipos de rate limiting (apenas se Redis estiver disponível e funcionando)
let rateLimiters: any = null

async function initializeRateLimiters() {
  if (!redisAvailable || !redis) {
    logger.info('Redis não disponível, usando apenas fallback in-memory')
    return
  }

  // Testar conexão antes de criar rate limiters
  const isRedisWorking = await testRedisConnection()
  
  if (!isRedisWorking) {
    logger.info('Redis não está funcionando, usando apenas fallback in-memory')
    return
  }

  try {
    rateLimiters = {
  // Upload de imagens - 5 por minuto por usuário
  upload: new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(5, '1 m'),
    analytics: true,
  }),

  // APIs de terceiros (weather, translate) - 20 por minuto por usuário
  external: new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(20, '1 m'),
    analytics: true,
  }),

  // Email - 3 por minuto por usuário (para evitar spam)
  email: new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(3, '1 m'),
    analytics: true,
  }),

  // AI/Gemini - 10 por minuto por usuário (caso não tenha)
  ai: new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(10, '1 m'),
    analytics: true,
  }),

  // Rate limiting geral por IP (para usuários não autenticados)
  general: new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(30, '1 m'),
    analytics: true,
  }),

  // Notificações - 100 por minuto por usuário (mais permissivo)
  notifications: new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(100, '1 m'),
    analytics: true,
  }),
    }
    
    logger.info('Rate limiters inicializados com sucesso')
  } catch (error) {
    logger.warn('Erro ao inicializar rate limiters, usando fallback:', error instanceof Error ? error.message : 'Erro desconhecido')
    rateLimiters = null
  }
}

// Inicializar rate limiters
initializeRateLimiters()

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

// Middleware de rate limiting com fallback automático
export async function withRateLimit(
  request: NextRequest,
  limiterType: RateLimitType,
  userId?: string
): Promise<NextResponse | { success: true; headers: Record<string, string> }> {
  // Se Redis não estiver disponível ou rateLimiters for null, usar fallback
  if (!redisAvailable || !rateLimiters) {
    logger.debug(`Using fallback rate limiter for ${limiterType}`)
    return withRateLimitFallback(request, limiterType, userId)
  }

  try {
    const identifier = getIdentifier(request, userId)
    const limiter = rateLimiters[limiterType]
    
    if (!limiter) {
      logger.warn(`Rate limiter ${limiterType} não encontrado, usando fallback`)
      return withRateLimitFallback(request, limiterType, userId)
    }
    
    logger.debug(`Checking rate limit (Redis) for ${limiterType}:${identifier}`)
    
    const { success, limit, reset, remaining } = await limiter.limit(identifier)
    
    if (!success) {
      logger.warn(`Rate limit exceeded for ${limiterType}:${identifier}`, {
        limit,
        reset,
        remaining
      })
      
      return NextResponse.json(
        {
          error: 'Rate limit exceeded',
          message: 'Muitas tentativas. Tente novamente em alguns minutos.',
          limit,
          reset,
          remaining: 0
        },
        {
          status: 429,
          headers: {
            'X-RateLimit-Limit': limit.toString(),
            'X-RateLimit-Remaining': '0',
            'X-RateLimit-Reset': reset.toString(),
            'Retry-After': Math.round((reset - Date.now()) / 1000).toString(),
          },
        }
      )
    }
    
    logger.debug(`Rate limit check passed for ${limiterType}:${identifier}`, {
      limit,
      remaining
    })
    
    return {
      success: true,
      headers: {
        'X-RateLimit-Limit': limit.toString(),
        'X-RateLimit-Remaining': remaining.toString(),
        'X-RateLimit-Reset': reset.toString(),
      }
    }
    
  } catch (error) {
    logger.error('Redis rate limiting error, falling back to in-memory:', error)
    
    // Fallback para rate limiting in-memory
    return withRateLimitFallback(request, limiterType, userId)
  }
}

// Sobrecarga para rotas dinâmicas do Next.js
export function createRateLimitedHandler(
  limiterType: RateLimitType,
  handler: (request: NextRequest, rateLimitHeaders: Record<string, string>, context: { params: Promise<{ id: string }> }) => Promise<NextResponse>
): (request: NextRequest, context: { params: Promise<{ id: string }> }) => Promise<NextResponse>;
// Sobrecarga genérica
export function createRateLimitedHandler<T>(
  limiterType: RateLimitType,
  handler: (request: NextRequest, rateLimitHeaders: Record<string, string>, context: T) => Promise<NextResponse>
): (request: NextRequest, context: T) => Promise<NextResponse>;
// Implementação
export function createRateLimitedHandler<T>(
  limiterType: RateLimitType,
  handler: (request: NextRequest, rateLimitHeaders: Record<string, string>, context: T) => Promise<NextResponse>
) {
  // Se Redis não estiver disponível, usar fallback
  if (!redisAvailable || !rateLimiters) {
    logger.debug(`Using fallback rate limited handler for ${limiterType}`)
    // @ts-ignore
    return createRateLimitedHandlerFallback(limiterType, handler)
  }

  return async (request: NextRequest, context: T) => {
    // Tentar obter userId do header ou cookie (se disponível)
    const userId = extractUserIdFromAuth(request)
    
    const rateLimitResult = await withRateLimit(request, limiterType, userId)
    
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
      const response = await handler(request, rateLimitResult.headers || {}, context)
      
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
function extractUserIdFromAuth(request: NextRequest): string | undefined {
  try {
    const authHeader = request.headers.get('authorization')
    if (!authHeader) return undefined
    
    // Implementar extração do userId do JWT ou session token
    // Por enquanto, retorna undefined para usar IP como fallback
    return undefined
  } catch {
    return undefined
  }
}

// Função para obter estatísticas de rate limiting
export async function getRateLimitStats(identifier: string, limiterType: RateLimitType) {
  try {
    if (!rateLimiters) {
      return {
        identifier,
        limiterType,
        source: 'fallback',
        available: false
      }
    }

    const limiter = rateLimiters[limiterType]
    // Note: Upstash Ratelimit não expõe stats diretamente
    // Esta função pode ser expandida conforme necessário
    return {
      identifier,
      limiterType,
      source: 'redis',
      available: true
    }
  } catch (error) {
    logger.error('Error getting rate limit stats:', error)
    return null
  }
}

// Função para resetar rate limit (para admin/debug)
export async function resetRateLimit(identifier: string, limiterType: RateLimitType) {
  try {
    // Implementar reset se necessário
    logger.info(`Rate limit reset requested for ${limiterType}:${identifier}`)
    return { success: true }
  } catch (error) {
    logger.error('Error resetting rate limit:', error)
    return { success: false, error: error instanceof Error ? error.message : 'Unknown error' }
  }
}

// Função para verificar status do Redis
export function getRedisStatus() {
  return {
    available: redisAvailable,
    fallbackActive: !redisAvailable || !rateLimiters,
    disabled: isRedisDisabled
  }
}