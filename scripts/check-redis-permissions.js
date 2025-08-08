// Script para verificar permissões do Redis Upstash
require('dotenv').config()
const { Redis } = require('@upstash/redis')

async function checkRedisPermissions() {
  console.log('🔍 Verificando permissões do Redis Upstash...')
  
  try {
    const redis = new Redis({
      url: process.env.UPSTASH_REDIS_REST_URL,
      token: process.env.UPSTASH_REDIS_REST_TOKEN,
    })
    
    console.log('📋 Testando comandos básicos...')
    
    const commands = [
      { name: 'PING', test: () => redis.ping() },
      { name: 'INFO', test: () => redis.info() },
      { name: 'SET', test: () => redis.set('test', 'value') },
      { name: 'GET', test: () => redis.get('test') },
      { name: 'DEL', test: () => redis.del('test') },
      { name: 'INCR', test: () => redis.incr('counter') },
      { name: 'EXPIRE', test: () => redis.expire('counter', 60) },
      { name: 'TTL', test: () => redis.ttl('counter') },
      { name: 'EVAL', test: () => redis.eval('return "test"', [], []) },
      { name: 'EVALSHA', test: () => redis.evalsha('test', [], []) },
    ]
    
    const results = []
    
    for (const command of commands) {
      try {
        await command.test()
        results.push({ command: command.name, status: '✅ PERMITIDO' })
        console.log(`${command.name}: ✅ PERMITIDO`)
      } catch (error) {
        const status = error.message.includes('NOPERM') ? '❌ SEM PERMISSÃO' : '⚠️ ERRO'
        results.push({ command: command.name, status, error: error.message })
        console.log(`${command.name}: ${status} - ${error.message}`)
      }
    }
    
    console.log('\n📊 Resumo das permissões:')
    console.table(results)
    
    // Verificar se é possível usar rate limiting
    const canUseRateLimit = results.some(r => 
      (r.command === 'SET' || r.command === 'INCR' || r.command === 'EVAL') && 
      r.status === '✅ PERMITIDO'
    )
    
    console.log('\n🎯 Análise para Rate Limiting:')
    if (canUseRateLimit) {
      console.log('✅ Rate limiting pode funcionar com comandos básicos')
    } else {
      console.log('❌ Rate limiting NÃO funcionará - comandos essenciais bloqueados')
      console.log('\n💡 Soluções recomendadas:')
      console.log('1. 🔑 Verificar se as credenciais estão corretas no dashboard Upstash')
      console.log('2. 📊 Verificar se o plano atual suporta todos os comandos')
      console.log('3. ⚙️ Verificar configurações de ACL no database')
      console.log('4. 💳 Considerar upgrade para plano pago')
      console.log('5. 🔄 Implementar rate limiting alternativo (in-memory ou database)')
    }
    
  } catch (error) {
    console.error('❌ Erro ao verificar permissões:', error.message)
  }
}

checkRedisPermissions()