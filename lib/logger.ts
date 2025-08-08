export enum LogLevel {
  DEBUG = 0,
  INFO = 1,
  WARN = 2,
  ERROR = 3,
  FATAL = 4,
}

export interface LogEntry {
  level: LogLevel
  message: string
  timestamp: Date
  context?: Record<string, unknown>
  error?: Error
  userId?: string
  sessionId?: string
  url?: string
  userAgent?: string
}

class Logger {
  private static instance: Logger
  private logLevel: LogLevel
  private logs: LogEntry[] = []
  private maxLogs = 1000

  private constructor() {
    this.logLevel = process.env.NODE_ENV === 'production' ? LogLevel.INFO : LogLevel.DEBUG
  }

  static getInstance(): Logger {
    if (!Logger.instance) {
      Logger.instance = new Logger()
    }
    return Logger.instance
  }

  setLogLevel(level: LogLevel): void {
    this.logLevel = level
  }

  private shouldLog(level: LogLevel): boolean {
    return level >= this.logLevel
  }

  private formatMessage(entry: LogEntry): string {
    const timestamp = entry.timestamp.toISOString()
    const levelName = LogLevel[entry.level]
    const contextStr = entry.context ? ` | ${JSON.stringify(entry.context)}` : ''
    const errorStr = entry.error ? ` | Error: ${entry.error.message}` : ''
    
    return `[${timestamp}] ${levelName}: ${entry.message}${contextStr}${errorStr}`
  }

  private addLog(entry: LogEntry): void {
    this.logs.push(entry)
    
    // Manter apenas os logs mais recentes
    if (this.logs.length > this.maxLogs) {
      this.logs = this.logs.slice(-this.maxLogs)
    }

    // Em produção, enviar para serviço de logging
    if (process.env.NODE_ENV === 'production') {
      this.sendToLoggingService(entry)
    }
  }

  private sendToLoggingService(entry: LogEntry): void {
    // Simulação de envio para serviço de logging
    // Em produção, implementar integração com serviços como Sentry, LogRocket, etc.
    console.log('Sending to logging service:', entry)
  }

  debug(message: string, context?: Record<string, unknown>): void {
    if (!this.shouldLog(LogLevel.DEBUG)) return
    
    const entry: LogEntry = {
      level: LogLevel.DEBUG,
      message,
      timestamp: new Date(),
      context,
      url: typeof window !== 'undefined' ? window.location.href : undefined,
      userAgent: typeof window !== 'undefined' ? window.navigator.userAgent : undefined,
    }
    
    this.addLog(entry)
    console.debug(this.formatMessage(entry))
  }

  info(message: string, context?: Record<string, unknown>): void {
    if (!this.shouldLog(LogLevel.INFO)) return
    
    const entry: LogEntry = {
      level: LogLevel.INFO,
      message,
      timestamp: new Date(),
      context,
      url: typeof window !== 'undefined' ? window.location.href : undefined,
      userAgent: typeof window !== 'undefined' ? window.navigator.userAgent : undefined,
    }
    
    this.addLog(entry)
    console.info(this.formatMessage(entry))
  }

  warn(message: string, context?: Record<string, unknown>, error?: Error): void {
    if (!this.shouldLog(LogLevel.WARN)) return
    
    const entry: LogEntry = {
      level: LogLevel.WARN,
      message,
      timestamp: new Date(),
      context,
      error,
      url: typeof window !== 'undefined' ? window.location.href : undefined,
      userAgent: typeof window !== 'undefined' ? window.navigator.userAgent : undefined,
    }
    
    this.addLog(entry)
    console.warn(this.formatMessage(entry))
  }

  error(message: string, error?: Error, context?: Record<string, unknown>): void {
    if (!this.shouldLog(LogLevel.ERROR)) return
    
    const entry: LogEntry = {
      level: LogLevel.ERROR,
      message,
      timestamp: new Date(),
      context,
      error,
      url: typeof window !== 'undefined' ? window.location.href : undefined,
      userAgent: typeof window !== 'undefined' ? window.navigator.userAgent : undefined,
    }
    
    this.addLog(entry)
    console.error(this.formatMessage(entry))
  }

  fatal(message: string, error?: Error, context?: Record<string, unknown>): void {
    if (!this.shouldLog(LogLevel.FATAL)) return
    
    const entry: LogEntry = {
      level: LogLevel.FATAL,
      message,
      timestamp: new Date(),
      context,
      error,
      url: typeof window !== 'undefined' ? window.location.href : undefined,
      userAgent: typeof window !== 'undefined' ? window.navigator.userAgent : undefined,
    }
    
    this.addLog(entry)
    console.error(`FATAL: ${this.formatMessage(entry)}`)
  }

  // Logs específicos para o domínio da aplicação
  logCultivationAction(action: string, cultivationId: string, context?: Record<string, unknown>): void {
    this.info(`Cultivation action: ${action}`, {
      cultivationId,
      action,
      ...context,
    })
  }

  logFinancialAction(action: string, amount: number, context?: Record<string, unknown>): void {
    this.info(`Financial action: ${action}`, {
      amount,
      action,
      ...context,
    })
  }

  logUserAction(action: string, userId?: string, context?: Record<string, unknown>): void {
    this.info(`User action: ${action}`, {
      userId,
      action,
      ...context,
    })
  }

  logPerformance(operation: string, duration: number, context?: Record<string, unknown>): void {
    this.debug(`Performance: ${operation} took ${duration}ms`, {
      operation,
      duration,
      ...context,
    })
  }

  // Métodos para análise e debug
  getLogs(level?: LogLevel): LogEntry[] {
    if (level !== undefined) {
      return this.logs.filter(log => log.level === level)
    }
    return [...this.logs]
  }

  clearLogs(): void {
    this.logs = []
  }

  exportLogs(): string {
    return this.logs.map(entry => this.formatMessage(entry)).join('\n')
  }
}

// Instância singleton
export const logger = Logger.getInstance()

// Hooks para React
export function useLogger() {
  return logger
}

// Decorator para logging de performance
export function logPerformance<T extends (...args: any[]) => any>(
  target: any,
  propertyKey: string,
  descriptor: TypedPropertyDescriptor<T>
): TypedPropertyDescriptor<T> {
  const method = descriptor.value!

  descriptor.value = function (...args: any[]) {
    const start = performance.now()
    const result = (method as any).apply(null, args)
    const end = performance.now()
    
    logger.logPerformance(`${target.constructor.name}.${propertyKey}`, end - start)
    
    return result
  } as T

  return descriptor
} 