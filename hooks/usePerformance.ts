"use client"
import { useEffect, useState } from 'react'

interface PerformanceMetrics {
  fcp: number | null // First Contentful Paint
  lcp: number | null // Largest Contentful Paint
  fid: number | null // First Input Delay
  cls: number | null // Cumulative Layout Shift
  ttfb: number | null // Time to First Byte
}

export function usePerformance() {
  const [metrics, setMetrics] = useState<PerformanceMetrics>({
    fcp: null,
    lcp: null,
    fid: null,
    cls: null,
    ttfb: null,
  })

  useEffect(() => {
    // Função para capturar métricas Web Vitals
    const captureMetrics = async () => {
      if (typeof window === 'undefined') return

      try {
        // Importar web-vitals dinamicamente
        const { getCLS, getFID, getFCP, getLCP, getTTFB } = await import('web-vitals')

        getCLS((metric: any) => {
          setMetrics(prev => ({ ...prev, cls: metric.value }))
        })

        getFID((metric: any) => {
          setMetrics(prev => ({ ...prev, fid: metric.value }))
        })

        getFCP((metric: any) => {
          setMetrics(prev => ({ ...prev, fcp: metric.value }))
        })

        getLCP((metric: any) => {
          setMetrics(prev => ({ ...prev, lcp: metric.value }))
        })

        getTTFB((metric: any) => {
          setMetrics(prev => ({ ...prev, ttfb: metric.value }))
        })
      } catch (error) {
        console.warn('Web Vitals não disponível:', error)
      }
    }

    captureMetrics()
  }, [])

  // Função para reportar métricas (opcional)
  const reportMetrics = () => {
    if (process.env.NODE_ENV === 'production') {
      // Aqui você pode enviar as métricas para um serviço de analytics
      console.log('Performance Metrics:', metrics)
    }
  }

  // Função para verificar se a performance está boa
  const getPerformanceScore = () => {
    const { fcp, lcp, fid, cls } = metrics
    
    let score = 0
    let total = 0

    if (fcp !== null) {
      score += fcp < 1800 ? 100 : fcp < 3000 ? 50 : 0
      total += 100
    }

    if (lcp !== null) {
      score += lcp < 2500 ? 100 : lcp < 4000 ? 50 : 0
      total += 100
    }

    if (fid !== null) {
      score += fid < 100 ? 100 : fid < 300 ? 50 : 0
      total += 100
    }

    if (cls !== null) {
      score += cls < 0.1 ? 100 : cls < 0.25 ? 50 : 0
      total += 100
    }

    return total > 0 ? Math.round((score / total) * 100) : 0
  }

  return {
    metrics,
    reportMetrics,
    performanceScore: getPerformanceScore(),
    isGoodPerformance: getPerformanceScore() >= 75,
  }
}