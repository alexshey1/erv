import * as Sentry from '@sentry/nextjs'

// Configuração do Sentry
export function initSentry() {
  Sentry.init({
    dsn: process.env.SENTRY_DSN,
    
    // Performance Monitoring
    tracesSampleRate: 1.0,
    
    // Session Replay
    replaysSessionSampleRate: 0.1,
    replaysOnErrorSampleRate: 1.0,
    
    // Configurações específicas para Next.js
    integrations: [
      // Remover BrowserTracing por enquanto devido a problemas de compatibilidade
    ],
    
    // Filtrar erros conhecidos/irrelevantes
    beforeSend(event) {
      // Filtrar erros de extensões do browser
      if (event.exception) {
        const error = event.exception.values?.[0]
        if (error?.value?.includes('Non-Error promise rejection')) {
          return null
        }
      }
      return event
    },
    
    // Tags para organizar erros
    initialScope: {
      tags: {
        component: 'ervapp',
        environment: process.env.NODE_ENV,
      },
    },
  })
}

// Funções helper para capturar erros específicos
export function captureAuthError(error: Error, context: Record<string, any>) {
  Sentry.withScope((scope) => {
    scope.setTag('category', 'auth')
    scope.setContext('auth_context', context)
    Sentry.captureException(error)
  })
}

export function captureCultivationError(error: Error, cultivationId: string, context: Record<string, any>) {
  Sentry.withScope((scope) => {
    scope.setTag('category', 'cultivation')
    scope.setTag('cultivation_id', cultivationId)
    scope.setContext('cultivation_context', context)
    Sentry.captureException(error)
  })
}

export function captureAPIError(error: Error, endpoint: string, context: Record<string, any>) {
  Sentry.withScope((scope) => {
    scope.setTag('category', 'api')
    scope.setTag('endpoint', endpoint)
    scope.setContext('api_context', context)
    Sentry.captureException(error)
  })
}

// Middleware para APIs
export function withSentryAPI<T extends (...args: any[]) => any>(
  handler: T,
  endpoint: string
): T {
  return (async (...args: any[]) => {
    try {
      return await handler(...args)
    } catch (error) {
      captureAPIError(error as Error, endpoint, {
        args: args.map(arg => typeof arg === 'object' ? JSON.stringify(arg) : arg)
      })
      throw error
    }
  }) as T
}