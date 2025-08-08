import { loginSchema, registerSchema, cultivationSchema } from '@/lib/validations'

describe('Validation Schemas', () => {
  describe('loginSchema', () => {
    it('should validate correct login data', () => {
      const validData = {
        email: 'test@example.com',
        password: 'password123'
      }
      
      expect(() => loginSchema.parse(validData)).not.toThrow()
    })
    
    it('should reject invalid email', () => {
      const invalidData = {
        email: 'invalid-email',
        password: 'password123'
      }
      
      expect(() => loginSchema.parse(invalidData)).toThrow('Email inválido')
    })
    
    it('should reject short password', () => {
      const invalidData = {
        email: 'test@example.com',
        password: '123'
      }
      
      expect(() => loginSchema.parse(invalidData)).toThrow('Senha deve ter pelo menos 6 caracteres')
    })
  })
  
  describe('registerSchema', () => {
    it('should validate strong password', () => {
      const validData = {
        name: 'Test User',
        email: 'test@example.com',
        password: 'StrongPass123!'
      }
      
      expect(() => registerSchema.parse(validData)).not.toThrow()
    })
    
    it('should reject weak password', () => {
      const invalidData = {
        name: 'Test User',
        email: 'test@example.com',
        password: 'weak'
      }
      
      expect(() => registerSchema.parse(invalidData)).toThrow()
    })
  })
  
  describe('cultivationSchema', () => {
    it('should validate cultivation data', () => {
      const validData = {
        name: 'Test Cultivation',
        seedStrain: 'Test Strain',
        startDate: new Date().toISOString(),
        area_m2: 2.5,
        potencia_watts: 600,
        num_plantas: 4
      }
      
      expect(() => cultivationSchema.parse(validData)).not.toThrow()
    })
    
    it('should reject negative values', () => {
      const invalidData = {
        name: 'Test Cultivation',
        seedStrain: 'Test Strain',
        startDate: new Date().toISOString(),
        area_m2: -1, // Valor inválido
        potencia_watts: 600,
        num_plantas: 4
      }
      
      expect(() => cultivationSchema.parse(invalidData)).toThrow()
    })
  })
})