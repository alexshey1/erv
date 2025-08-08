import { logger } from './logger'
import { securityManager, auditLogger } from './security'
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'sua_chave_secreta';

export function getUserFromCookie(cookies: any) {
  const token = cookies.get('auth_token')?.value;
  if (!token) return null;
  try {
    return jwt.verify(token, JWT_SECRET) as { userId: string, email: string };
  } catch {
    return null;
  }
}

export interface User {
  id: string
  email: string
  name: string
  role: 'admin' | 'user' | 'viewer'
  mfaEnabled: boolean
  mfaSecret?: string
  lastLogin?: Date
  createdAt: Date
  updatedAt: Date
}

export interface AuthSession {
  id: string
  userId: string
  token: string
  expiresAt: Date
  mfaVerified: boolean
  ip?: string
  userAgent?: string
}

export interface MFASecret {
  secret: string
  qrCode: string
  backupCodes: string[]
}

class AuthManager {
  private static instance: AuthManager
  private sessions: Map<string, AuthSession> = new Map()
  private users: Map<string, User> = new Map()

  private constructor() {
    this.initializeMockUsers()
  }

  static getInstance(): AuthManager {
    if (!AuthManager.instance) {
      AuthManager.instance = new AuthManager()
    }
    return AuthManager.instance
  }

  private initializeMockUsers() {
    const mockUsers: User[] = [
      {
        id: '1',
        email: 'admin@cultivation.com',
        name: 'Administrador',
        role: 'admin',
        mfaEnabled: false,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: '2',
        email: 'user@cultivation.com',
        name: 'Usuário Padrão',
        role: 'user',
        mfaEnabled: false,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ]

    mockUsers.forEach(user => this.users.set(user.id, user))
  }

  // Registro de usuário
  async registerUser(email: string, password: string, name: string): Promise<User> {
    try {
      // Validação
      if (!email || !password || !name) {
        throw new Error('Todos os campos são obrigatórios')
      }

      // Verificar se email já existe
      const existingUser = Array.from(this.users.values()).find(u => u.email === email)
      if (existingUser) {
        throw new Error('Email já cadastrado')
      }

      // Hash da senha
      const hashedPassword = await securityManager.hashPassword(password)
      
      // Criar usuário
      const user: User = {
        id: Date.now().toString(),
        email,
        name,
        role: 'user',
        mfaEnabled: false,
        createdAt: new Date(),
        updatedAt: new Date(),
      }

      this.users.set(user.id, user)
      
      // Log de auditoria
      auditLogger.logAction('register', 'user', { email, name }, user.id)
      logger.logUserAction('register', user.id, { email, name })

      return user
    } catch (error) {
      logger.error('Erro no registro de usuário', error as Error)
      throw error
    }
  }

  // Login
  async login(email: string, password: string): Promise<{ user: User; session: AuthSession }> {
    try {
      // Buscar usuário
      const user = Array.from(this.users.values()).find(u => u.email === email)
      if (!user) {
        throw new Error('Credenciais inválidas')
      }

      // Verificar senha (simulado)
      const isValidPassword = password === 'password123' // Em produção, usar hash
      if (!isValidPassword) {
        throw new Error('Credenciais inválidas')
      }

      // Criar sessão
      const session: AuthSession = {
        id: Date.now().toString(),
        userId: user.id,
        token: this.generateToken(),
        expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 horas
        mfaVerified: !user.mfaEnabled,
        ip: typeof window !== 'undefined' ? 'client' : 'server',
        userAgent: typeof window !== 'undefined' ? window.navigator.userAgent : undefined,
      }

      this.sessions.set(session.id, session)

      // Atualizar último login
      user.lastLogin = new Date()
      user.updatedAt = new Date()
      this.users.set(user.id, user)

      // Log de auditoria
      auditLogger.logAction('login', 'user', { email }, user.id)
      logger.logUserAction('login', user.id, { email })

      return { user, session }
    } catch (error) {
      logger.error('Erro no login', error as Error)
      throw error
    }
  }

  // Verificar sessão
  async verifySession(token: string): Promise<User | null> {
    try {
      const session = Array.from(this.sessions.values()).find(s => s.token === token)
      
      if (!session) {
        return null
      }

      if (session.expiresAt < new Date()) {
        this.sessions.delete(session.id)
        return null
      }

      const user = this.users.get(session.userId)
      return user || null
    } catch (error) {
      logger.error('Erro na verificação de sessão', error as Error)
      return null
    }
  }

  // Logout
  async logout(token: string): Promise<void> {
    try {
      const session = Array.from(this.sessions.values()).find(s => s.token === token)
      if (session) {
        this.sessions.delete(session.id)
        
        const user = this.users.get(session.userId)
        if (user) {
          auditLogger.logAction('logout', 'user', {}, user.id)
          logger.logUserAction('logout', user.id, {})
        }
      }
    } catch (error) {
      logger.error('Erro no logout', error as Error)
    }
  }

  // Configurar MFA
  async setupMFA(userId: string): Promise<MFASecret> {
    try {
      const user = this.users.get(userId)
      if (!user) {
        throw new Error('Usuário não encontrado')
      }

      // Gerar secret (em produção, usar biblioteca TOTP)
      const secret = this.generateSecret()
      const qrCode = this.generateQRCode(secret, user.email)
      const backupCodes = this.generateBackupCodes()

      // Atualizar usuário
      user.mfaSecret = secret
      user.mfaEnabled = true
      user.updatedAt = new Date()
      this.users.set(user.id, user)

      // Log de auditoria
      auditLogger.logAction('setup_mfa', 'user', {}, userId)
      logger.logUserAction('setup_mfa', userId, {})

      return {
        secret,
        qrCode,
        backupCodes,
      }
    } catch (error) {
      logger.error('Erro na configuração do MFA', error as Error)
      throw error
    }
  }

  // Verificar código MFA
  async verifyMFACode(userId: string, code: string): Promise<boolean> {
    try {
      const user = this.users.get(userId)
      if (!user || !user.mfaEnabled) {
        return false
      }

      // Verificar código (simulado)
      const isValid = code === '123456' // Em produção, usar TOTP
      
      if (isValid) {
        // Marcar sessão como verificada
        const session = Array.from(this.sessions.values()).find(s => s.userId === userId)
        if (session) {
          session.mfaVerified = true
          this.sessions.set(session.id, session)
        }

        auditLogger.logAction('verify_mfa', 'user', { success: true }, userId)
        logger.logUserAction('verify_mfa', userId, { success: true })
      }

      return isValid
    } catch (error) {
      logger.error('Erro na verificação do MFA', error as Error)
      return false
    }
  }

  // Desabilitar MFA
  async disableMFA(userId: string): Promise<void> {
    try {
      const user = this.users.get(userId)
      if (!user) {
        throw new Error('Usuário não encontrado')
      }

      user.mfaEnabled = false
      user.mfaSecret = undefined
      user.updatedAt = new Date()
      this.users.set(user.id, user)

      auditLogger.logAction('disable_mfa', 'user', {}, userId)
      logger.logUserAction('disable_mfa', userId, {})
    } catch (error) {
      logger.error('Erro ao desabilitar MFA', error as Error)
      throw error
    }
  }

  // Utilitários
  private generateToken(): string {
    return Math.random().toString(36).substring(2) + Date.now().toString(36)
  }

  private generateSecret(): string {
    return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15)
  }

  private generateQRCode(secret: string, email: string): string {
    // Em produção, gerar QR code real
    return `otpauth://totp/Cultivation:${email}?secret=${secret}&issuer=Cultivation`
  }

  private generateBackupCodes(): string[] {
    return Array.from({ length: 8 }, () => 
      Math.random().toString(36).substring(2, 8).toUpperCase()
    )
  }

  // Getters
  getUserById(id: string): User | undefined {
    return this.users.get(id)
  }

  getAllUsers(): User[] {
    return Array.from(this.users.values())
  }

  getActiveSessions(): AuthSession[] {
    return Array.from(this.sessions.values()).filter(s => s.expiresAt > new Date())
  }
}

export const authManager = AuthManager.getInstance() 