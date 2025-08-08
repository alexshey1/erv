'use client'

import { Alert, AlertDescription } from '@/components/ui/alert'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { 
  AlertTriangle, 
  Clock, 
  RefreshCw, 
  Wifi, 
  WifiOff,
  CheckCircle
} from 'lucide-react'

interface NotificationStatusProps {
  loading: boolean
  error: string | null
  onRetry: () => void
  className?: string
}

export function NotificationStatus({ loading, error, onRetry, className = '' }: NotificationStatusProps) {
  // Não mostrar nada se não há erro e não está carregando
  if (!loading && !error) {
    return null
  }

  // Status de carregamento
  if (loading && !error) {
    return (
      <div className={`flex items-center gap-2 text-sm text-muted-foreground ${className}`}>
        <RefreshCw className="w-4 h-4 animate-spin" />
        <span>Carregando notificações...</span>
      </div>
    )
  }

  // Status de erro
  if (error) {
    const isRateLimit = error.includes('Rate limit') || error.includes('Muitas requisições')
    const isRetrying = error.includes('Tentando novamente')
    const isNetworkError = error.includes('Failed to fetch') || error.includes('conexão')

    return (
      <Alert className={`${className} ${isRateLimit ? 'border-yellow-200 bg-yellow-50' : 'border-red-200 bg-red-50'}`}>
        <div className="flex items-center gap-2">
          {isRateLimit ? (
            <Clock className="w-4 h-4 text-yellow-600" />
          ) : isNetworkError ? (
            <WifiOff className="w-4 h-4 text-red-600" />
          ) : (
            <AlertTriangle className="w-4 h-4 text-red-600" />
          )}
          
          <div className="flex-1">
            <AlertDescription className="text-sm">
              {isRateLimit && (
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="text-yellow-700 border-yellow-300">
                    Rate Limit
                  </Badge>
                  <span className="text-yellow-800">{error}</span>
                </div>
              )}
              
              {isNetworkError && (
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="text-red-700 border-red-300">
                    Conexão
                  </Badge>
                  <span className="text-red-800">Problema de conexão. Verifique sua internet.</span>
                </div>
              )}
              
              {!isRateLimit && !isNetworkError && (
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="text-red-700 border-red-300">
                    Erro
                  </Badge>
                  <span className="text-red-800">{error}</span>
                </div>
              )}
            </AlertDescription>
          </div>

          {!isRetrying && (
            <Button
              onClick={onRetry}
              variant="outline"
              size="sm"
              className="ml-2"
            >
              <RefreshCw className="w-3 h-3 mr-1" />
              Tentar Novamente
            </Button>
          )}
        </div>
      </Alert>
    )
  }

  return null
}

// Componente para mostrar status de conexão
export function ConnectionStatus({ isOnline = true }: { isOnline?: boolean }) {
  return (
    <div className="flex items-center gap-2 text-xs text-muted-foreground">
      {isOnline ? (
        <>
          <Wifi className="w-3 h-3 text-green-500" />
          <span>Online</span>
        </>
      ) : (
        <>
          <WifiOff className="w-3 h-3 text-red-500" />
          <span>Offline</span>
        </>
      )}
    </div>
  )
}

// Componente para mostrar estatísticas de rate limit
export function RateLimitInfo({ 
  remaining, 
  total, 
  resetTime 
}: { 
  remaining?: number
  total?: number
  resetTime?: number 
}) {
  if (remaining === undefined || total === undefined) {
    return null
  }

  const percentage = (remaining / total) * 100
  const isLow = percentage < 20

  return (
    <div className="flex items-center gap-2 text-xs text-muted-foreground">
      <div className={`w-2 h-2 rounded-full ${isLow ? 'bg-red-400' : 'bg-green-400'}`} />
      <span>
        {remaining}/{total} requisições restantes
      </span>
      {resetTime && (
        <span className="text-muted-foreground/70">
          (reset em {Math.ceil((resetTime - Date.now()) / 1000)}s)
        </span>
      )}
    </div>
  )
}