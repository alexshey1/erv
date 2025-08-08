// Script para testar conexão com Redis Upstash
require('dotenv').config()
const { Redis } = require('@upstash/redis')

async function testRedisConnection() {
  console.log('🔍 Testando conexão com Redis Upstash...')
  
  try {
    // Verificar variáveis de ambiente
    const url = process.env.UPSTASH_REDIS_REST_URL
    const token = process.env.UPSTASH_REDIS_REST_TOKEN
    
    console.log('📋 Configurações:')
    console.log('- URL:', url ? `${url.substring(0, 30)}...` : 'NÃO DEFINIDA')
    console.log('- Token:', token ? `${token.substring(0, 20)}...` : 'NÃO DEFINIDO')
    
    if (!url || !token) {
      throw new Error('Variáveis de ambiente UPSTASH_REDIS_REST_URL ou UPSTASH_REDIS_REST_TOKEN não estão definidas')
    }
    
    // Criar cliente Redis
    const redis = new Redis({
      url: url,
      token: token,
    })
    
    console.log('\n🔗 Testando conexão básica...')
    
    // Teste 1: PING
    console.log('1. Testando PING...')
    const pingResult = await redis.ping()
    console.log('   ✅ PING resultado:', pingResult)
    
    // Teste 2: SET/GET
    console.log('2. Testando SET/GET...')
    const testKey = `test:${Date.now()}`
    const testValue = 'Hello Redis!'
    
    await redis.set(testKey, testValue)
    console.log('   ✅ SET executado')
    
    const getValue = await redis.get(testKey)
    console.log('   ✅ GET resultado:', getValue)
    
    // Teste 3: DELETE
    console.log('3. Testando DELETE...')
    await redis.del(testKey)
    console.log('   ✅ DELETE executado')
    
    // Teste 4: Verificar permissões para comandos avançados
    console.log('4. Testando comandos avançados...')
    
    try {
      // Testar EVAL (comando que estava falhando)
      const evalResult = await redis.eval('return "test"', [], [])
      console.log('   ✅ EVAL funcionando:', evalResult)
    } catch (evalError) {
      console.log('   ❌ EVAL falhou:', evalError.message)
      
      // Verificar se é erro de permissão
      if (evalError.message.includes('NOPERM')) {
        console.log('   🚨 PROBLEMA IDENTIFICADO: Usuário não tem permissão para comandos EVAL/EVALSHA')
        console.log('   💡 SOLUÇÃO: Verificar plano do Upstash ou configurações de ACL')
      }
    }
    
    // Teste 5: Informações do servidor
    console.log('5. Obtendo informações do servidor...')
    try {
      const info = await redis.info()
      console.log('   ✅ INFO obtido (primeiras linhas):')
      console.log('  ', info.split('\n').slice(0, 5).join('\n   '))
    } catch (infoError) {
      console.log('   ❌ INFO falhou:', infoError.message)
    }
    
    console.log('\n🎉 Teste de conexão concluído!')
    
  } catch (error) {
    console.error('\n❌ Erro no teste de conexão:', error.message)
    console.error('Stack:', error.stack)
    
    // Sugestões de solução
    console.log('\n💡 Possíveis soluções:')
    console.log('1. Verificar se as credenciais estão corretas')
    console.log('2. Verificar se o plano do Upstash suporta todos os comandos')
    console.log('3. Verificar configurações de ACL no dashboard do Upstash')
    console.log('4. Considerar usar um plano pago se estiver no free tier')
  }
}

// Executar teste
testRedisConnection()