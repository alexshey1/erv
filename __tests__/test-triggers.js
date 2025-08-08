#!/usr/bin/env node

const { createClient } = require('@supabase/supabase-js')
const { PrismaClient } = require('@prisma/client')
const { createLogger } = require('../lib/safe-logger')

require('dotenv').config()

const logger = createLogger('TriggerTest')
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
})

const prisma = new PrismaClient()

async function testTriggers() {
  logger.info('🧪 Testando triggers do Supabase...\n')

  try {
    const testEmail = `test-${Date.now()}@example.com`
    const testName = 'Usuário Teste'

    logger.info('🔄 Criando usuário de teste no Supabase Auth...')
    logger.debug(`📧 Email: ${testEmail}`)

    // Criar usuário no Supabase Auth
    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
      email: testEmail,
      password: 'test123456',
      email_confirm: true,
      user_metadata: {
        name: testName
      }
    })

    if (authError) {
      logger.error('❌ Erro ao criar usuário no Supabase:', authError.message)
      return { success: false, error: authError.message }
    }

    logger.success('✅ Usuário criado no Supabase Auth')
    logger.debug(`🆔 ID: ${authData.user.id}`)

    // Aguardar um pouco para o trigger executar
    logger.info('⏳ Aguardando trigger executar...')
    await new Promise(resolve => setTimeout(resolve, 2000))

    // Verificar se usuário foi criado na tabela local
    logger.info('🔍 Verificando se usuário foi sincronizado...')
    
    const localUser = await prisma.user.findUnique({
      where: { id: authData.user.id }
    })

    if (localUser) {
      logger.success('🎉 SUCESSO! Usuário foi sincronizado automaticamente!')
      logger.data('📋 Dados sincronizados', {
        id: localUser.id,
        email: localUser.email,
        name: localUser.name,
        role: localUser.role,
        createdAt: localUser.createdAt
      })
      
      // Limpar usuário de teste
      logger.info('\n🧹 Limpando usuário de teste...')
      await supabase.auth.admin.deleteUser(authData.user.id)
      logger.success('✅ Usuário de teste removido')
      
      return { success: true, user: localUser }
    } else {
      logger.error('❌ FALHA! Usuário não foi sincronizado.')
      logger.info('💡 Verifique se os triggers foram executados corretamente no Supabase Dashboard.')
      
      // Limpar usuário de teste mesmo em caso de falha
      await supabase.auth.admin.deleteUser(authData.user.id)
      
      return { success: false, error: 'User not synchronized' }
    }

  } catch (error) {
    logger.error('❌ Erro no teste:', error)
    return { success: false, error: error.message }
  } finally {
    await prisma.$disconnect()
    logger.elapsed('Teste de triggers finalizado')
  }
}

// Executar teste
testTriggers()