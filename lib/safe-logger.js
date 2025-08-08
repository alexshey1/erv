/**
 * Sistema de logging seguro para scripts e utilitários
 * Evita vazamento de informações sensíveis em produção
 */

const isDevelopment = process.env.NODE_ENV === 'development' || process.env.NODE_ENV !== 'production';
const isTest = process.env.NODE_ENV === 'test';

class SafeLogger {
  constructor(context = 'Script') {
    this.context = context;
    this.startTime = Date.now();
  }

  // Log de informações gerais - apenas em desenvolvimento
  info(message, ...args) {
    if (isDevelopment) {
      console.log(`[${this.context}] ${message}`, ...args);
    }
  }

  // Log de sucesso - apenas em desenvolvimento
  success(message, ...args) {
    if (isDevelopment) {
      console.log(`[${this.context}] ✅ ${message}`, ...args);
    }
  }

  // Log de aviso - sempre exibido mas sem dados sensíveis em produção
  warn(message, ...args) {
    if (isDevelopment) {
      console.warn(`[${this.context}] ⚠️  ${message}`, ...args);
    } else {
      console.warn(`[${this.context}] Warning occurred`);
    }
  }

  // Log de erro - sempre exibido mas sem dados sensíveis em produção
  error(message, ...args) {
    if (isDevelopment) {
      console.error(`[${this.context}] ❌ ${message}`, ...args);
    } else {
      console.error(`[${this.context}] Error occurred`);
    }
  }

  // Log de debug - apenas em desenvolvimento
  debug(message, ...args) {
    if (isDevelopment && !isTest) {
      console.debug(`[${this.context}] 🐛 ${message}`, ...args);
    }
  }

  // Log de dados estruturados - sanitizado em produção
  data(label, data) {
    if (isDevelopment) {
      console.log(`[${this.context}] 📊 ${label}:`, data);
    } else {
      // Em produção, apenas confirma que dados foram processados
      console.log(`[${this.context}] Data processed: ${label}`);
    }
  }

  // Log de progresso - apenas em desenvolvimento
  progress(message, current, total) {
    if (isDevelopment) {
      const percentage = total > 0 ? Math.round((current / total) * 100) : 0;
      console.log(`[${this.context}] 🔄 ${message} (${current}/${total} - ${percentage}%)`);
    }
  }

  // Log de tempo decorrido
  elapsed(message = 'Operação concluída') {
    const elapsed = Date.now() - this.startTime;
    if (isDevelopment) {
      console.log(`[${this.context}] ⏱️  ${message} em ${elapsed}ms`);
    }
  }

  // Método para criar sub-logger com contexto específico
  child(subContext) {
    return new SafeLogger(`${this.context}:${subContext}`);
  }

  // Método para logging condicional baseado em nível
  level(level, message, ...args) {
    const levels = {
      error: 0,
      warn: 1,
      info: 2,
      debug: 3
    };

    const currentLevel = isDevelopment ? 3 : 1;
    
    if (levels[level] <= currentLevel) {
      switch (level) {
        case 'error':
          this.error(message, ...args);
          break;
        case 'warn':
          this.warn(message, ...args);
          break;
        case 'info':
          this.info(message, ...args);
          break;
        case 'debug':
          this.debug(message, ...args);
          break;
      }
    }
  }
}

// Factory function para criar loggers
function createLogger(context) {
  return new SafeLogger(context);
}

// Logger padrão
const logger = new SafeLogger('App');

module.exports = {
  SafeLogger,
  createLogger,
  logger,
  isDevelopment,
  isTest
};