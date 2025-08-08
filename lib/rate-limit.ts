import { NextRequest } from 'next/server'

// Simple in-memory rate limiter for development
// In production, use Redis or a proper rate limiting service
class RateLimiter {
  private requests: Map<string, { count: number; resetTime: number }> = new Map()
  private readonly windowMs: number
  private readonly maxRequests: number

  constructor(windowMs: number = 15 * 60 * 1000, maxRequests: number = 100) {
    this.windowMs = windowMs
    this.maxRequests = maxRequests
  }

  isAllowed(identifier: string): boolean {
    const now = Date.now()
    const record = this.requests.get(identifier)

    if (!record || now > record.resetTime) {
      // Reset window
      this.requests.set(identifier, {
        count: 1,
        resetTime: now + this.windowMs
      })
      return true
    }

    if (record.count >= this.maxRequests) {
      return false
    }

    record.count++
    return true
  }

  getRemainingRequests(identifier: string): number {
    const record = this.requests.get(identifier)
    if (!record || Date.now() > record.resetTime) {
      return this.maxRequests
    }
    return Math.max(0, this.maxRequests - record.count)
  }

  getResetTime(identifier: string): number {
    const record = this.requests.get(identifier)
    if (!record || Date.now() > record.resetTime) {
      return Date.now() + this.windowMs
    }
    return record.resetTime
  }

  // Cleanup old entries periodically
  cleanup(): void {
    const now = Date.now()
    for (const [key, record] of this.requests.entries()) {
      if (now > record.resetTime) {
        this.requests.delete(key)
      }
    }
  }
}

// Different rate limiters for different endpoints
export const authLimiter = new RateLimiter(15 * 60 * 1000, 5) // 5 requests per 15 minutes for auth
export const apiLimiter = new RateLimiter(15 * 60 * 1000, 100) // 100 requests per 15 minutes for general API
export const strictLimiter = new RateLimiter(60 * 1000, 3) // 3 requests per minute for sensitive operations

// Helper function to get client identifier
export function getClientIdentifier(request: NextRequest): string {
  // Try to get real IP from headers (for production with reverse proxy)
  const forwarded = request.headers.get('x-forwarded-for')
  const realIp = request.headers.get('x-real-ip')
  
  if (forwarded) {
    return forwarded.split(',')[0].trim()
  }
  
  if (realIp) {
    return realIp
  }
  
  // Fallback to unknown IP
  return 'unknown'
}

// Middleware function to check rate limit
export function checkRateLimit(
  request: NextRequest, 
  limiter: RateLimiter = apiLimiter
): { allowed: boolean; remaining: number; resetTime: number } {
  const identifier = getClientIdentifier(request)
  const allowed = limiter.isAllowed(identifier)
  const remaining = limiter.getRemainingRequests(identifier)
  const resetTime = limiter.getResetTime(identifier)

  return { allowed, remaining, resetTime }
}

// Cleanup function to be called periodically
setInterval(() => {
  authLimiter.cleanup()
  apiLimiter.cleanup()
  strictLimiter.cleanup()
}, 5 * 60 * 1000) // Cleanup every 5 minutes