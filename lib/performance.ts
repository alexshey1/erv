import { logger } from './logger'

export interface PerformanceMetric {
  name: string
  value: number
  unit: string
  timestamp: Date
  category: 'navigation' | 'resource' | 'paint' | 'layout' | 'memory' | 'custom'
  metadata?: Record<string, any>
}

export interface CoreWebVitals {
  LCP: number // Largest Contentful Paint
  FID: number // First Input Delay
  CLS: number // Cumulative Layout Shift
  FCP: number // First Contentful Paint
  TTFB: number // Time to First Byte
}

export interface PerformanceReport {
  id: string
  url: string
  timestamp: Date
  coreWebVitals: CoreWebVitals
  metrics: PerformanceMetric[]
  userAgent: string
  connection?: string
  deviceMemory?: number
  hardwareConcurrency?: number
}

class PerformanceMonitor {
  private static instance: PerformanceMonitor
  private reports: Map<string, PerformanceReport> = new Map()
  private observers: Map<string, PerformanceObserver> = new Map()
  private isInitialized = false

  private constructor() {}

  static getInstance(): PerformanceMonitor {
    if (!PerformanceMonitor.instance) {
      PerformanceMonitor.instance = new PerformanceMonitor()
    }
    return PerformanceMonitor.instance
  }

  // Inicializar monitoramento
  initialize(): void {
    if (this.isInitialized || typeof window === 'undefined') {
      return
    }

    try {
      this.setupCoreWebVitals()
      this.setupResourceTiming()
      this.setupLayoutShift()
      this.setupMemoryMonitoring()
      this.setupCustomMetrics()

      this.isInitialized = true
      logger.info('Performance monitoring initialized')
    } catch (error) {
      logger.error('Error initializing performance monitoring', error as Error)
    }
  }

  // Configurar Core Web Vitals
  private setupCoreWebVitals(): void {
    // Largest Contentful Paint
    if ('PerformanceObserver' in window) {
      const lcpObserver = new PerformanceObserver((list) => {
        const entries = list.getEntries()
        const lastEntry = entries[entries.length - 1] as PerformanceEntry
        this.recordMetric('LCP', lastEntry.startTime, 'ms', 'navigation')
      })
      lcpObserver.observe({ entryTypes: ['largest-contentful-paint'] })

      // First Input Delay
      const fidObserver = new PerformanceObserver((list) => {
        const entries = list.getEntries()
        entries.forEach((entry) => {
          this.recordMetric('FID', (entry as any).processingStart - entry.startTime, 'ms', 'navigation')
        })
      })
      fidObserver.observe({ entryTypes: ['first-input'] })

      // Cumulative Layout Shift
      const clsObserver = new PerformanceObserver((list) => {
        let clsValue = 0
        const entries = list.getEntries() as any[]
        entries.forEach((entry) => {
          if (!entry.hadRecentInput) {
            clsValue += entry.value
          }
        })
        this.recordMetric('CLS', clsValue, '', 'layout')
      })
      clsObserver.observe({ entryTypes: ['layout-shift'] })

      this.observers.set('lcp', lcpObserver)
      this.observers.set('fid', fidObserver)
      this.observers.set('cls', clsObserver)
    }
  }

  // Configurar monitoramento de recursos
  private setupResourceTiming(): void {
    if ('PerformanceObserver' in window) {
      const resourceObserver = new PerformanceObserver((list) => {
        const entries = list.getEntries() as PerformanceResourceTiming[]
        entries.forEach((entry) => {
          this.recordMetric(
            'Resource Load',
            entry.responseEnd - entry.requestStart,
            'ms',
            'resource',
            {
              name: entry.name,
              type: entry.initiatorType,
              size: entry.transferSize,
            }
          )
        })
      })
      resourceObserver.observe({ entryTypes: ['resource'] })
      this.observers.set('resource', resourceObserver)
    }
  }

  // Configurar monitoramento de layout shift
  private setupLayoutShift(): void {
    if ('PerformanceObserver' in window) {
      const layoutObserver = new PerformanceObserver((list) => {
        const entries = list.getEntries() as any[]
        entries.forEach((entry) => {
          this.recordMetric(
            'Layout Shift',
            entry.value,
            '',
            'layout',
            {
              sources: entry.sources,
              hadRecentInput: entry.hadRecentInput,
            }
          )
        })
      })
      layoutObserver.observe({ entryTypes: ['layout-shift'] })
      this.observers.set('layout', layoutObserver)
    }
  }

  // Configurar monitoramento de memória
  private setupMemoryMonitoring(): void {
    if ('memory' in performance) {
      const memory = (performance as any).memory
      setInterval(() => {
        this.recordMetric('Memory Used', memory.usedJSHeapSize / 1024 / 1024, 'MB', 'memory')
        this.recordMetric('Memory Total', memory.totalJSHeapSize / 1024 / 1024, 'MB', 'memory')
        this.recordMetric('Memory Limit', memory.jsHeapSizeLimit / 1024 / 1024, 'MB', 'memory')
      }, 5000) // Verificar a cada 5 segundos
    }
  }

  // Configurar métricas customizadas
  private setupCustomMetrics(): void {
    // Monitorar tempo de carregamento da página
    window.addEventListener('load', () => {
      const loadTime = performance.now()
      this.recordMetric('Page Load Time', loadTime, 'ms', 'navigation')
    })

    // Monitorar interações do usuário
    let lastInteraction = Date.now()
    const events = ['click', 'keydown', 'scroll', 'mousemove']
    events.forEach((event) => {
      window.addEventListener(event, () => {
        const now = Date.now()
        const timeSinceLastInteraction = now - lastInteraction
        this.recordMetric('Time Since Last Interaction', timeSinceLastInteraction, 'ms', 'custom')
        lastInteraction = now
      })
    })
  }

  // Registrar métrica
  recordMetric(
    name: string,
    value: number,
    unit: string,
    category: PerformanceMetric['category'],
    metadata?: Record<string, any>
  ): void {
    const metric: PerformanceMetric = {
      name,
      value,
      unit,
      timestamp: new Date(),
      category,
      metadata,
    }

    logger.debug('Performance metric recorded', {
      name,
      value,
      unit,
      category,
    })

    // Em produção, enviar para serviço de analytics
    if (process.env.NODE_ENV === 'production') {
      this.sendToAnalytics(metric)
    }
  }

  // Medir tempo de execução de função
  measureFunction<T extends (...args: any[]) => any>(
    name: string,
    fn: T,
    ...args: Parameters<T>
  ): ReturnType<T> {
    const start = performance.now()
    const result = fn(...args)
    const end = performance.now()
    
    this.recordMetric(
      `Function: ${name}`,
      end - start,
      'ms',
      'custom',
      { functionName: name }
    )
    
    return result
  }

  // Medir tempo de execução assíncrono
  async measureAsyncFunction<T>(
    name: string,
    fn: () => Promise<T>
  ): Promise<T> {
    const start = performance.now()
    const result = await fn()
    const end = performance.now()
    
    this.recordMetric(
      `Async Function: ${name}`,
      end - start,
      'ms',
      'custom',
      { functionName: name }
    )
    
    return result
  }

  // Obter Core Web Vitals
  getCoreWebVitals(): CoreWebVitals {
    const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming
    const paint = performance.getEntriesByType('paint')
    
    const fcp = paint.find(entry => entry.name === 'first-contentful-paint')?.startTime || 0
    const lcp = this.getLargestContentfulPaint()
    const fid = this.getFirstInputDelay()
    const cls = this.getCumulativeLayoutShift()
    const ttfb = navigation.responseStart - navigation.requestStart

    return {
      LCP: lcp,
      FID: fid,
      CLS: cls,
      FCP: fcp,
      TTFB: ttfb,
    }
  }

  // Gerar relatório completo
  generateReport(): PerformanceReport {
    const coreWebVitals = this.getCoreWebVitals()
    const metrics = this.getAllMetrics()
    
    const report: PerformanceReport = {
      id: Date.now().toString(),
      url: window.location.href,
      timestamp: new Date(),
      coreWebVitals,
      metrics,
      userAgent: navigator.userAgent,
      connection: (navigator as any).connection?.effectiveType,
      deviceMemory: (navigator as any).deviceMemory,
      hardwareConcurrency: navigator.hardwareConcurrency,
    }

    this.reports.set(report.id, report)
    
    logger.info('Performance report generated', {
      id: report.id,
      url: report.url,
      lcp: coreWebVitals.LCP,
      fid: coreWebVitals.FID,
      cls: coreWebVitals.CLS,
    })

    return report
  }

  // Obter todas as métricas
  getAllMetrics(): PerformanceMetric[] {
    // Em uma implementação real, isso viria de um storage persistente
    return []
  }

  // Utilitários para obter métricas específicas
  private getLargestContentfulPaint(): number {
    const entries = performance.getEntriesByType('largest-contentful-paint')
    const lastEntry = entries[entries.length - 1] as PerformanceEntry
    return lastEntry?.startTime || 0
  }

  private getFirstInputDelay(): number {
    const entries = performance.getEntriesByType('first-input')
    const firstEntry = entries[0] as any
    return firstEntry ? firstEntry.processingStart - firstEntry.startTime : 0
  }

  private getCumulativeLayoutShift(): number {
    const entries = performance.getEntriesByType('layout-shift') as any[]
    return entries.reduce((cls, entry) => {
      if (!entry.hadRecentInput) {
        cls += entry.value
      }
      return cls
    }, 0)
  }

  // Enviar para serviço de analytics
  private sendToAnalytics(metric: PerformanceMetric): void {
    // Em produção, implementar envio para Google Analytics, Sentry, etc.
    console.log('Sending metric to analytics:', metric)
  }

  // Verificar se métricas estão boas
  isPerformanceGood(): boolean {
    const vitals = this.getCoreWebVitals()
    
    // Thresholds baseados em Core Web Vitals
    const isGood = 
      vitals.LCP < 2500 && // LCP < 2.5s
      vitals.FID < 100 && // FID < 100ms
      vitals.CLS < 0.1 // CLS < 0.1
    
    return isGood
  }

  // Obter recomendações de performance
  getPerformanceRecommendations(): string[] {
    const vitals = this.getCoreWebVitals()
    const recommendations: string[] = []

    if (vitals.LCP > 2500) {
      recommendations.push('Otimizar Largest Contentful Paint - carregar recursos críticos primeiro')
    }

    if (vitals.FID > 100) {
      recommendations.push('Reduzir First Input Delay - otimizar JavaScript')
    }

    if (vitals.CLS > 0.1) {
      recommendations.push('Melhorar Cumulative Layout Shift - definir dimensões de elementos')
    }

    if (vitals.TTFB > 600) {
      recommendations.push('Otimizar Time to First Byte - melhorar servidor/CDN')
    }

    return recommendations
  }

  // Limpar observers
  cleanup(): void {
    this.observers.forEach((observer) => {
      observer.disconnect()
    })
    this.observers.clear()
    this.isInitialized = false
  }
}

export const performanceMonitor = PerformanceMonitor.getInstance()

// Hook para React
export function usePerformance() {
  return {
    measureFunction: performanceMonitor.measureFunction.bind(performanceMonitor),
    measureAsyncFunction: performanceMonitor.measureAsyncFunction.bind(performanceMonitor),
    generateReport: performanceMonitor.generateReport.bind(performanceMonitor),
    isPerformanceGood: performanceMonitor.isPerformanceGood.bind(performanceMonitor),
    getRecommendations: performanceMonitor.getPerformanceRecommendations.bind(performanceMonitor),
  }
} 