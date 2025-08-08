'use client'

import { useState, useCallback } from 'react'
import { securityManager, auditLogger, InputValidator } from '@/lib/security'
import { logger } from '@/lib/logger'

export function useSecurity() {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Validação de entrada
  const validateInput = useCallback((input: string, type: 'email' | 'password' | 'url' | 'number'): { isValid: boolean; errors: string[] } => {
    setError(null)
    
    try {
      switch (type) {
        case 'email':
          return {
            isValid: InputValidator.validateEmail(input),
            errors: InputValidator.validateEmail(input) ? [] : ['Email inválido']
          }
        
        case 'password':
          return InputValidator.validatePassword(input)
        
        case 'url':
          return {
            isValid: InputValidator.validateUrl(input),
            errors: InputValidator.validateUrl(input) ? [] : ['URL inválida']
          }
        
        case 'number':
          return {
            isValid: InputValidator.validateNumber(input),
            errors: InputValidator.validateNumber(input) ? [] : ['Número inválido']
          }
        
        default:
          return { isValid: false, errors: ['Tipo de validação não suportado'] }
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro de validação'
      setError(errorMessage)
      logger.error('Erro na validação de entrada', err as Error)
      return { isValid: false, errors: [errorMessage] }
    }
  }, [])

  // Sanitização de dados
  const sanitizeData = useCallback((data: string | Record<string, any>): string | Record<string, any> => {
    try {
      if (typeof data === 'string') {
        return InputValidator.sanitizeString(data)
      }
      return InputValidator.sanitizeObject(data)
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro na sanitização'
      setError(errorMessage)
      logger.error('Erro na sanitização de dados', err as Error)
      return data
    }
  }, [])

  // Criptografia de dados
  const encryptData = useCallback(async (data: string): Promise<string | null> => {
    setIsLoading(true)
    setError(null)
    
    try {
      const key = await securityManager.generateSecureKey()
      const encrypted = await securityManager.encryptData(data, key)
      
      logger.info('Dados criptografados com sucesso')
      return encrypted
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro na criptografia'
      setError(errorMessage)
      logger.error('Erro na criptografia de dados', err as Error)
      return null
    } finally {
      setIsLoading(false)
    }
  }, [])

  // Hash de senha
  const hashPassword = useCallback(async (password: string): Promise<string | null> => {
    setIsLoading(true)
    setError(null)
    
    try {
      const hashed = await securityManager.hashPassword(password)
      
      logger.info('Senha hasheada com sucesso')
      return hashed
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro no hash da senha'
      setError(errorMessage)
      logger.error('Erro no hash da senha', err as Error)
      return null
    } finally {
      setIsLoading(false)
    }
  }, [])

  // Verificação de senha
  const verifyPassword = useCallback(async (password: string, hashedPassword: string): Promise<boolean> => {
    setIsLoading(true)
    setError(null)
    
    try {
      const isValid = await securityManager.verifyPassword(password, hashedPassword)
      
      logger.info(`Verificação de senha: ${isValid ? 'válida' : 'inválida'}`)
      return isValid
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro na verificação de senha'
      setError(errorMessage)
      logger.error('Erro na verificação de senha', err as Error)
      return false
    } finally {
      setIsLoading(false)
    }
  }, [])

  // Auditoria de ações
  const logAction = useCallback((
    action: string,
    resource: string,
    details: Record<string, unknown>,
    userId?: string
  ) => {
    try {
      auditLogger.logAction(action, resource, details, userId)
      logger.info(`Ação auditada: ${action} em ${resource}`)
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro na auditoria'
      setError(errorMessage)
      logger.error('Erro na auditoria de ação', err as Error)
    }
  }, [])

  // Logs específicos do domínio
  const logCultivationAction = useCallback((
    action: string,
    cultivationId: string,
    details: Record<string, unknown>,
    userId?: string
  ) => {
    try {
      auditLogger.logCultivationAction(action, cultivationId, details, userId)
      logger.logCultivationAction(action, cultivationId, details)
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro no log de cultivo'
      setError(errorMessage)
      logger.error('Erro no log de ação de cultivo', err as Error)
    }
  }, [])

  const logFinancialAction = useCallback((
    action: string,
    amount: number,
    details: Record<string, unknown>,
    userId?: string
  ) => {
    try {
      auditLogger.logFinancialAction(action, amount, details, userId)
      logger.logFinancialAction(action, amount, details)
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro no log financeiro'
      setError(errorMessage)
      logger.error('Erro no log de ação financeira', err as Error)
    }
  }, [])

  // Limpeza de erro
  const clearError = useCallback(() => {
    setError(null)
  }, [])

  return {
    // Estados
    isLoading,
    error,
    
    // Funções de validação
    validateInput,
    sanitizeData,
    
    // Funções de criptografia
    encryptData,
    hashPassword,
    verifyPassword,
    
    // Funções de auditoria
    logAction,
    logCultivationAction,
    logFinancialAction,
    
    // Utilitários
    clearError,
  }
} 