'use client'

import { useEffect } from 'react'

export function PerformanceMonitor() {
  useEffect(() => {
    // Importação dinâmica para evitar problemas de SSR
    const loadWebVitals = async () => {
      try {
        const { getCLS, getFID, getFCP, getLCP, getTTFB } = await import('web-vitals')
        
        // Função para enviar métricas
        function sendToAnalytics(metric: any) {
          if (process.env.NODE_ENV === 'development') {
            console.log('📊 Web Vital:', {
              name: metric.name,
              value: Math.round(metric.value),
              rating: metric.rating,
              id: metric.id
            })
          }

          // Em produção, enviar para API personalizada
          if (process.env.NODE_ENV === 'production') {
            fetch('/api/analytics/web-vitals', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify(metric)
            }).catch(() => {
              // Falha silenciosa
            })
          }
        }

        // Coletar métricas
        getCLS(sendToAnalytics)
        getFID(sendToAnalytics)
        getFCP(sendToAnalytics)
        getLCP(sendToAnalytics)
        getTTFB(sendToAnalytics)

      } catch (error) {
        console.warn('Web Vitals não pôde ser carregado:', error)
      }
    }

    loadWebVitals()
  }, [])

  return null
}

// Hook personalizado para métricas de performance
export function usePerformanceMetrics() {
  useEffect(() => {
    // Métricas customizadas específicas da aplicação
    const measureCustomMetrics = () => {
      // Tempo de carregamento do dashboard
      const dashboardLoadTime = performance.now()
      
      // Métricas de navegação
      const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming
      
      if (navigation) {
        const metrics = {
          domContentLoaded: navigation.domContentLoadedEventEnd - navigation.domContentLoadedEventStart,
          loadComplete: navigation.loadEventEnd - navigation.loadEventStart,
          dnsLookup: navigation.domainLookupEnd - navigation.domainLookupStart,
          tcpConnect: navigation.connectEnd - navigation.connectStart,
          serverResponse: navigation.responseEnd - navigation.requestStart,
        }

        if (process.env.NODE_ENV === 'development') {
          console.log('🚀 Navigation Metrics:', metrics)
        }
      }
    }

    // Executar após o carregamento completo
    if (document.readyState === 'complete') {
      measureCustomMetrics()
    } else {
      window.addEventListener('load', measureCustomMetrics)
      return () => window.removeEventListener('load', measureCustomMetrics)
    }
  }, [])
}

// Componente para monitorar erros de JavaScript
export function ErrorBoundaryMonitor() {
  useEffect(() => {
    const handleError = (event: ErrorEvent) => {
      if (process.env.NODE_ENV === 'development') {
        console.error('🚨 JavaScript Error:', {
          message: event.message,
          filename: event.filename,
          lineno: event.lineno,
          colno: event.colno,
          error: event.error
        })
      }

      // Em produção, enviar para serviço de monitoramento
      if (process.env.NODE_ENV === 'production') {
        fetch('/api/analytics/errors', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            message: event.message,
            filename: event.filename,
            lineno: event.lineno,
            colno: event.colno,
            userAgent: navigator.userAgent,
            timestamp: new Date().toISOString()
          })
        }).catch(() => {
          // Falha silenciosa
        })
      }
    }

    const handleUnhandledRejection = (event: PromiseRejectionEvent) => {
      if (process.env.NODE_ENV === 'development') {
        console.error('🚨 Unhandled Promise Rejection:', event.reason)
      }

      if (process.env.NODE_ENV === 'production') {
        fetch('/api/analytics/errors', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            type: 'unhandledRejection',
            reason: String(event.reason),
            timestamp: new Date().toISOString()
          })
        }).catch(() => {
          // Falha silenciosa
        })
      }
    }

    window.addEventListener('error', handleError)
    window.addEventListener('unhandledrejection', handleUnhandledRejection)

    return () => {
      window.removeEventListener('error', handleError)
      window.removeEventListener('unhandledrejection', handleUnhandledRejection)
    }
  }, [])

  return null
}