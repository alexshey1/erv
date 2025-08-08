// Configuração centralizada de headers de segurança
export interface CSPConfig {
  development: boolean
  reportOnly: boolean
  reportUri?: string
}

export class SecurityHeaders {
  private static instance: SecurityHeaders
  private config: CSPConfig

  private constructor(config: CSPConfig = { development: false, reportOnly: false }) {
    this.config = config
  }

  static getInstance(config?: CSPConfig): SecurityHeaders {
    if (!SecurityHeaders.instance) {
      SecurityHeaders.instance = new SecurityHeaders(config)
    }
    return SecurityHeaders.instance
  }

  // Gerar CSP baseado no ambiente
  generateCSP(): string {
    const isDev = this.config.development || process.env.NODE_ENV === 'development'
    
    const baseCSP = [
      "default-src 'self'",
      // Scripts mais permissivos em dev, restritivos em prod
      isDev 
        ? "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://vercel.live https://va.vercel-scripts.com"
        : "script-src 'self' 'unsafe-inline' https://vercel.live https://va.vercel-scripts.com",
      // Estilos
      "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com https://cdn.jsdelivr.net",
      // Fontes
      "font-src 'self' https://fonts.gstatic.com data:",
      // Imagens - ErvApp específico
      "img-src 'self' data: blob: https://res.cloudinary.com https://images.unsplash.com https://via.placeholder.com https://picsum.photos https://cdn.weatherapi.com",
      // Mídia
      "media-src 'self' https://res.cloudinary.com blob:",
      // Conexões - APIs do ErvApp
      isDev
        ? "connect-src 'self' http://localhost:5001 https://api.cloudinary.com https://generativelanguage.googleapis.com https://api.openai.com https://*.upstash.io https://*.neon.tech wss://ws.pusher.com https://vercel.live"
        : "connect-src 'self' https://api.cloudinary.com https://generativelanguage.googleapis.com https://api.openai.com https://*.upstash.io https://*.neon.tech wss://ws.pusher.com https://vercel.live",
      // Frames
      "frame-src 'self' https://www.youtube.com https://player.vimeo.com",
      // Workers para PWA
      "worker-src 'self' blob:",
      // Manifests
      "manifest-src 'self'",
      // Objetos bloqueados
      "object-src 'none'",
      // Base URI
      "base-uri 'self'",
      // Formulários
      "form-action 'self'",
      // Frame ancestors
      "frame-ancestors 'none'",
      // Upgrade para HTTPS
      "upgrade-insecure-requests"
    ]

    // Adicionar report-uri se configurado
    if (this.config.reportUri) {
      baseCSP.push(`report-uri ${this.config.reportUri}`)
    }

    return baseCSP.join('; ')
  }

  // Gerar todos os headers de segurança
  generateAllHeaders(): Record<string, string> {
    const headers: Record<string, string> = {}

    // CSP
    const cspHeader = this.config.reportOnly ? 'Content-Security-Policy-Report-Only' : 'Content-Security-Policy'
    headers[cspHeader] = this.generateCSP()

    // HSTS (apenas em produção)
    if (process.env.NODE_ENV === 'production') {
      headers['Strict-Transport-Security'] = 'max-age=63072000; includeSubDomains; preload'
    }

    // Headers básicos de segurança
    headers['X-Frame-Options'] = 'DENY'
    headers['X-Content-Type-Options'] = 'nosniff'
    headers['X-XSS-Protection'] = '1; mode=block'
    headers['Referrer-Policy'] = 'strict-origin-when-cross-origin'

    // Permissions Policy
    headers['Permissions-Policy'] = [
      'geolocation=()',
      'microphone=()',
      'camera=()',
      'payment=()',
      'usb=()',
      'magnetometer=()',
      'gyroscope=()',
      'speaker=()',
      'vibrate=()',
      'fullscreen=(self)',
      'sync-xhr=()'
    ].join(', ')

    // Cross-Origin headers
    headers['Cross-Origin-Embedder-Policy'] = 'credentialless'
    headers['Cross-Origin-Opener-Policy'] = 'same-origin'
    headers['Cross-Origin-Resource-Policy'] = 'same-origin'

    // DNS Prefetch Control
    headers['X-DNS-Prefetch-Control'] = 'off'

    return headers
  }

  // Validar CSP
  validateCSP(): { valid: boolean; errors: string[] } {
    const errors: string[] = []
    const csp = this.generateCSP()

    // Verificações básicas
    if (!csp.includes("default-src 'self'")) {
      errors.push('default-src deve incluir self')
    }

    if (!csp.includes("object-src 'none'")) {
      errors.push('object-src deve ser none para segurança')
    }

    if (!csp.includes('upgrade-insecure-requests')) {
      errors.push('upgrade-insecure-requests deve estar presente')
    }

    if (csp.includes("'unsafe-eval'") && process.env.NODE_ENV === 'production') {
      errors.push('unsafe-eval não deve ser usado em produção')
    }

    return {
      valid: errors.length === 0,
      errors
    }
  }

  // Gerar relatório de CSP
  generateReport(): {
    csp: string
    validation: { valid: boolean; errors: string[] }
    recommendations: string[]
  } {
    const csp = this.generateCSP()
    const validation = this.validateCSP()
    const recommendations: string[] = []

    // Recomendações baseadas no ambiente
    if (process.env.NODE_ENV === 'development') {
      recommendations.push('Considere usar CSP mais restritivo em produção')
      recommendations.push('Remova unsafe-eval em produção')
    }

    if (!this.config.reportUri) {
      recommendations.push('Configure report-uri para monitorar violações de CSP')
    }

    if (csp.includes("'unsafe-inline'")) {
      recommendations.push('Considere usar nonces ou hashes em vez de unsafe-inline')
    }

    return {
      csp,
      validation,
      recommendations
    }
  }
}

// Utilitários para CSP
export class CSPUtils {
  // Gerar nonce para scripts inline
  static generateNonce(): string {
    return Buffer.from(crypto.getRandomValues(new Uint8Array(16))).toString('base64')
  }

  // Gerar hash para script inline
  static async generateScriptHash(script: string): Promise<string> {
    const encoder = new TextEncoder();
    const data = encoder.encode(script);
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    return 'sha256-' + Buffer.from(hashBuffer).toString('base64');
  }

  // Verificar se URL é permitida pelo CSP
  static isUrlAllowed(url: string, directive: string, csp: string): boolean {
    const directiveRegex = new RegExp(`${directive}\\s+([^;]+)`)
    const match = csp.match(directiveRegex)
    
    if (!match) return false
    
    const sources = match[1].split(' ')
    
    // Verificar se URL está nas fontes permitidas
    return sources.some(source => {
      if (source === "'self'" && url.startsWith(window.location.origin)) return true
      if (source === "'unsafe-inline'") return true
      if (source.startsWith('https://') && url.startsWith(source)) return true
      return false
    })
  }

  // Analisar violações de CSP
  static analyzeViolation(violation: any): {
    severity: 'low' | 'medium' | 'high'
    recommendation: string
    autoFix?: string
  } {
    const { violatedDirective, blockedURI, sourceFile } = violation

    // Análise baseada no tipo de violação
    if (violatedDirective.includes('script-src')) {
      return {
        severity: 'high',
        recommendation: 'Script bloqueado. Verifique se é necessário e adicione à whitelist.',
        autoFix: blockedURI ? `Adicionar '${blockedURI}' ao script-src` : undefined
      }
    }

    if (violatedDirective.includes('style-src')) {
      return {
        severity: 'medium',
        recommendation: 'Estilo bloqueado. Considere usar classes CSS em vez de estilos inline.',
        autoFix: blockedURI ? `Adicionar '${blockedURI}' ao style-src` : undefined
      }
    }

    if (violatedDirective.includes('img-src')) {
      return {
        severity: 'low',
        recommendation: 'Imagem bloqueada. Verifique se a fonte é confiável.',
        autoFix: blockedURI ? `Adicionar '${blockedURI}' ao img-src` : undefined
      }
    }

    return {
      severity: 'medium',
      recommendation: 'Violação de CSP detectada. Analise se é necessário ajustar a política.'
    }
  }
}

// Instância padrão para ErvApp
export const ervAppSecurity = SecurityHeaders.getInstance({
  development: process.env.NODE_ENV === 'development',
  reportOnly: false,
  reportUri: process.env.CSP_REPORT_URI || '/api/csp-report'
})