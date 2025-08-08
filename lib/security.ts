import { logger } from './logger'

// Criptografia de dados sensíveis
export class SecurityManager {
  private static instance: SecurityManager
  private readonly encoder = new TextEncoder()
  private readonly decoder = new TextDecoder()

  private constructor() {}

  static getInstance(): SecurityManager {
    if (!SecurityManager.instance) {
      SecurityManager.instance = new SecurityManager()
    }
    return SecurityManager.instance
  }

  // Geração de chaves seguras
  async generateSecureKey(): Promise<CryptoKey> {
    return await crypto.subtle.generateKey(
      {
        name: 'AES-GCM',
        length: 256,
      },
      true,
      ['encrypt', 'decrypt']
    )
  }

  // Criptografia de dados
  async encryptData(data: string, key: CryptoKey): Promise<string> {
    try {
      const iv = crypto.getRandomValues(new Uint8Array(12))
      const encodedData = this.encoder.encode(data)
      
      const encryptedBuffer = await crypto.subtle.encrypt(
        {
          name: 'AES-GCM',
          iv,
        },
        key,
        encodedData
      )

      const encryptedArray = new Uint8Array(encryptedBuffer)
      const combined = new Uint8Array(iv.length + encryptedArray.length)
      combined.set(iv)
      combined.set(encryptedArray, iv.length)

      return btoa(String.fromCharCode(...combined))
    } catch (error) {
      logger.error('Erro na criptografia de dados', error as Error)
      throw new Error('Falha na criptografia')
    }
  }

  // Descriptografia de dados
  async decryptData(encryptedData: string, key: CryptoKey): Promise<string> {
    try {
      const combined = new Uint8Array(
        atob(encryptedData).split('').map(char => char.charCodeAt(0))
      )
      
      const iv = combined.slice(0, 12)
      const encryptedArray = combined.slice(12)

      const decryptedBuffer = await crypto.subtle.decrypt(
        {
          name: 'AES-GCM',
          iv,
        },
        key,
        encryptedArray
      )

      return this.decoder.decode(decryptedBuffer)
    } catch (error) {
      logger.error('Erro na descriptografia de dados', error as Error)
      throw new Error('Falha na descriptografia')
    }
  }

  // Hash seguro para senhas
  async hashPassword(password: string): Promise<string> {
    const salt = crypto.getRandomValues(new Uint8Array(16))
    const encoder = new TextEncoder()
    const data = encoder.encode(password + salt)
    
    const hashBuffer = await crypto.subtle.digest('SHA-256', data)
    const hashArray = Array.from(new Uint8Array(hashBuffer))
    const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('')
    
    return hashHex + '.' + Array.from(salt).map(b => b.toString(16).padStart(2, '0')).join('')
  }

  // Verificação de senha
  async verifyPassword(password: string, hashedPassword: string): Promise<boolean> {
    try {
      const [hashHex, saltHex] = hashedPassword.split('.')
      const salt = new Uint8Array(saltHex.match(/.{1,2}/g)!.map(byte => parseInt(byte, 16)))
      
      const encoder = new TextEncoder()
      const data = encoder.encode(password + salt)
      
      const hashBuffer = await crypto.subtle.digest('SHA-256', data)
      const hashArray = Array.from(new Uint8Array(hashBuffer))
      const computedHash = hashArray.map(b => b.toString(16).padStart(2, '0')).join('')
      
      return computedHash === hashHex
    } catch (error) {
      logger.error('Erro na verificação de senha', error as Error)
      return false
    }
  }
}

// Validação e sanitização de entrada
export class InputValidator {
  // Sanitização de strings
  static sanitizeString(input: string): string {
    return input
      .trim()
      .replace(/[<>]/g, '') // Remove tags HTML básicas
      .replace(/javascript:/gi, '') // Remove JavaScript
      .replace(/on\w+=/gi, '') // Remove event handlers
  }

  // Validação de email
  static validateEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return emailRegex.test(email)
  }

  // Validação de senha forte
  static validatePassword(password: string): { isValid: boolean; errors: string[] } {
    const errors: string[] = []
    
    if (password.length < 8) {
      errors.push('Senha deve ter pelo menos 8 caracteres')
    }
    
    if (!/[A-Z]/.test(password)) {
      errors.push('Senha deve conter pelo menos uma letra maiúscula')
    }
    
    if (!/[a-z]/.test(password)) {
      errors.push('Senha deve conter pelo menos uma letra minúscula')
    }
    
    if (!/\d/.test(password)) {
      errors.push('Senha deve conter pelo menos um número')
    }
    
    if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
      errors.push('Senha deve conter pelo menos um caractere especial')
    }
    
    return {
      isValid: errors.length === 0,
      errors,
    }
  }

  // Validação de números
  static validateNumber(value: string, min?: number, max?: number): boolean {
    const num = parseFloat(value)
    if (isNaN(num)) return false
    if (min !== undefined && num < min) return false
    if (max !== undefined && num > max) return false
    return true
  }

  // Validação de URL
  static validateUrl(url: string): boolean {
    try {
      new URL(url)
      return true
    } catch {
      return false
    }
  }

  // Sanitização de objetos
  static sanitizeObject<T extends Record<string, any>>(obj: T): T {
    const sanitized: any = {}
    
    for (const [key, value] of Object.entries(obj)) {
      if (typeof value === 'string') {
        sanitized[key] = this.sanitizeString(value)
      } else if (typeof value === 'object' && value !== null) {
        sanitized[key] = this.sanitizeObject(value)
      } else {
        sanitized[key] = value
      }
    }
    
    return sanitized as T
  }
}

// Auditoria de ações
export class AuditLogger {
  private static instance: AuditLogger
  private auditLog: Array<{
    timestamp: Date
    userId?: string
    action: string
    resource: string
    details: Record<string, unknown>
    ip?: string
    userAgent?: string
  }> = []

  private constructor() {}

  static getInstance(): AuditLogger {
    if (!AuditLogger.instance) {
      AuditLogger.instance = new AuditLogger()
    }
    return AuditLogger.instance
  }

  logAction(
    action: string,
    resource: string,
    details: Record<string, unknown>,
    userId?: string,
    ip?: string,
    userAgent?: string
  ): void {
    const auditEntry = {
      timestamp: new Date(),
      userId,
      action,
      resource,
      details,
      ip,
      userAgent,
    }

    this.auditLog.push(auditEntry)
    
    // Em produção, enviar para serviço de auditoria
    if (process.env.NODE_ENV === 'production') {
      this.sendToAuditService(auditEntry)
    }

    logger.info(`Audit: ${action} on ${resource}`, {
      userId,
      action,
      resource,
      details,
    })
  }

  private sendToAuditService(auditEntry: any): void {
    // Simulação de envio para serviço de auditoria
    console.log('Sending to audit service:', auditEntry)
  }

  // Logs específicos para ações do sistema
  logCultivationAction(action: string, cultivationId: string, details: Record<string, unknown>, userId?: string): void {
    this.logAction(action, `cultivation:${cultivationId}`, details, userId)
  }

  logFinancialAction(action: string, amount: number, details: Record<string, unknown>, userId?: string): void {
    this.logAction(action, 'financial', { amount, ...details }, userId)
  }

  logUserAction(action: string, targetUserId: string, details: Record<string, unknown>, userId?: string): void {
    this.logAction(action, `user:${targetUserId}`, details, userId)
  }

  logSystemAction(action: string, details: Record<string, unknown>): void {
    this.logAction(action, 'system', details)
  }

  // Métodos para análise de auditoria
  getAuditLog(filters?: {
    userId?: string
    action?: string
    resource?: string
    startDate?: Date
    endDate?: Date
  }): Array<any> {
    let filtered = [...this.auditLog]

    if (filters?.userId) {
      filtered = filtered.filter(entry => entry.userId === filters.userId)
    }

    if (filters?.action) {
      filtered = filtered.filter(entry => entry.action === filters.action)
    }

    if (filters?.resource) {
      filtered = filtered.filter(entry => entry.resource === filters.resource)
    }

    if (filters?.startDate) {
      filtered = filtered.filter(entry => entry.timestamp >= filters.startDate!)
    }

    if (filters?.endDate) {
      filtered = filtered.filter(entry => entry.timestamp <= filters.endDate!)
    }

    return filtered
  }

  exportAuditLog(): string {
    return JSON.stringify(this.auditLog, null, 2)
  }
}

// Instâncias singleton
export const securityManager = SecurityManager.getInstance()
export const auditLogger = AuditLogger.getInstance() 