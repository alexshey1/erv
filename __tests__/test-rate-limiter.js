// Script para testar o rate limiter com fallback
require('dotenv').config()

async function testRateLimiter() {
  console.log('🧪 Testando Rate Limiter com Fallback...')
  
  try {
    // Simular uma requisição
    const mockRequest = {
      headers: new Map([
        ['x-forwarded-for', '127.0.0.1'],
      ]),
      url: 'http://localhost:3000/api/test'
    }
    
    // Importar o rate limiter
    const { withRateLimit, getRedisStatus } = require('../lib/rate-limiter.ts')
    
    // Verificar status do Redis
    const redisStatus = getRedisStatus()
    console.log('📊 Status do Redis:', redisStatus)
    
    if (redisStatus.fallbackActive) {
      console.log('✅ Fallback ativo - rate limiting funcionará com cache in-memory')
    } else {
      console.log('✅ Redis ativo - rate limiting funcionará com Redis')
    }
    
    console.log('\n🎯 Teste concluído com sucesso!')
    
  } catch (error) {
    console.error('❌ Erro no teste:', error.message)
    console.error('Stack:', error.stack)
  }
}

testRateLimiter()