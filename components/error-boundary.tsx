'use client'

import { Component, ReactNode } from 'react'
import { Button } from '@/components/ui/button'
import { AlertTriangle, RefreshCw } from 'lucide-react'

// Declaração do tipo gtag
declare global {
  interface Window {
    gtag?: (command: string, action: string, params: any) => void
  }
}

interface Props {
  children: ReactNode
  fallback?: ReactNode
}

interface State {
  hasError: boolean
  error?: Error
  errorInfo?: any
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = { hasError: false }
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, errorInfo: any) {
    console.error('ErrorBoundary caught an error:', error, errorInfo)
    this.setState({ error, errorInfo })
    
    // Log para análise
    if (typeof window !== 'undefined') {
      // Enviar erro para serviço de monitoramento se disponível
      if (window.gtag) {
        window.gtag('event', 'exception', {
          description: error.message,
          fatal: true
        })
      }
    }
  }

  handleRetry = () => {
    this.setState({ hasError: false, error: undefined, errorInfo: undefined })
    // Recarregar a página se for um erro de chunk
    if (this.state.error?.message?.includes('ChunkLoadError')) {
      window.location.reload()
    }
  }

  render() {
    if (this.state.hasError) {
      // Se for um erro de carregamento de chunk, mostrar interface específica
      if (this.state.error?.message?.includes('ChunkLoadError')) {
  return (
          <div className="min-h-screen flex items-center justify-center bg-gray-50">
            <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-6 text-center">
              <div className="mb-4">
                <AlertTriangle className="h-12 w-12 text-yellow-500 mx-auto mb-4" />
                <h2 className="text-xl font-semibold text-gray-900 mb-2">
                  Erro de Carregamento
                </h2>
                <p className="text-gray-600 mb-4">
                  Houve um problema ao carregar parte da aplicação. Isso pode ser temporário.
                </p>
              </div>
              
              <div className="space-y-3">
                <Button 
                  onClick={this.handleRetry}
                  className="w-full"
                >
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Tentar Novamente
                </Button>
                
                <Button 
                  variant="outline"
                  onClick={() => window.location.reload()}
                  className="w-full"
                >
                  Recarregar Página
                </Button>
              </div>
              
              <div className="mt-4 text-xs text-gray-500">
                <p>Se o problema persistir, tente:</p>
                <ul className="mt-2 space-y-1">
                  <li>• Limpar o cache do navegador</li>
                  <li>• Verificar sua conexão com a internet</li>
                  <li>• Tentar em uma aba anônima</li>
                </ul>
              </div>
            </div>
          </div>
        )
      }

      // Para outros tipos de erro
      return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
          <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-6 text-center">
            <div className="mb-4">
              <AlertTriangle className="h-12 w-12 text-red-500 mx-auto mb-4" />
              <h2 className="text-xl font-semibold text-gray-900 mb-2">
            Algo deu errado
              </h2>
              <p className="text-gray-600 mb-4">
            Ocorreu um erro inesperado. Nossa equipe foi notificada.
          </p>
            </div>
            
            <Button 
              onClick={this.handleRetry}
              className="w-full"
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              Tentar Novamente
            </Button>
            
            {process.env.NODE_ENV === 'development' && this.state.error && (
              <details className="mt-4 text-left">
                <summary className="cursor-pointer text-sm text-gray-500">
                  Detalhes do erro (desenvolvimento)
                </summary>
                <pre className="mt-2 text-xs bg-gray-100 p-2 rounded overflow-auto">
                  {this.state.error.toString()}
                </pre>
              </details>
            )}
          </div>
    </div>
  )
}

    return this.props.children
  }
} 