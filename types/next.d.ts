// Tipos customizados para resolver problemas do Next.js

declare module 'next' {
  interface NextRequest {
    nextUrl: {
      pathname: string
      searchParams: URLSearchParams
    }
  }
}

// Resolver problemas de tipos de rotas da API
declare global {
  namespace NextJS {
    interface RouteContext {
      params: Record<string, string | string[]>
    }
  }
}

// Tipos para web-vitals
declare module 'web-vitals' {
  export interface Metric {
    name: string
    value: number
    delta: number
    id: string
    entries: PerformanceEntry[]
  }

  export function getCLS(onReport: (metric: Metric) => void): void
  export function getFID(onReport: (metric: Metric) => void): void
  export function getFCP(onReport: (metric: Metric) => void): void
  export function getLCP(onReport: (metric: Metric) => void): void
  export function getTTFB(onReport: (metric: Metric) => void): void
}

export {}