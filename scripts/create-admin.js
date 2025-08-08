#!/usr/bin/env node

const { createClient } = require('@supabase/supabase-js')
const { PrismaClient } = require('@prisma/client')
const readline = require('readline')

require('dotenv').config()

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
})

const prisma = new PrismaClient()

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
})

function question(prompt) {
  return new Promise((resolve) => {
    rl.question(prompt, resolve)
  })
}

async function createAdmin() {
  console.log('🚀 Criando usuário administrador...\n')

  try {
    // Verificar variáveis de ambiente
    if (!supabaseUrl || !supabaseServiceKey) {
      console.error('❌ Variáveis de ambiente SUPABASE não configuradas!')
      console.log('Verifique se NEXT_PUBLIC_SUPABASE_URL e SUPABASE_SERVICE_ROLE_KEY estão no .env')
      process.exit(1)
    }

    // Coletar dados do admin
    const name = await question('Nome do administrador: ')
    const email = await question('Email do administrador: ')
    const password = await question('Senha do administrador (min 6 caracteres): ')

    if (!name || !email || !password) {
      console.error('❌ Todos os campos são obrigatórios!')
      process.exit(1)
    }

    if (password.length < 6) {
      console.error('❌ A senha deve ter pelo menos 6 caracteres!')
      process.exit(1)
    }

    // Verificar se usuário já existe
    console.log('\n🔍 Verificando se usuário já existe...')
    
    const existingUser = await prisma.user.findUnique({
      where: { email }
    })

    if (existingUser) {
      console.error('❌ Usuário com este email já existe!')
      process.exit(1)
    }

    console.log('🔄 Criando usuário no Supabase Auth...')

    // Criar usuário no Supabase Auth
    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
      email,
      password,
      email_confirm: true, // Confirmar email automaticamente
      user_metadata: {
        name: name,
        role: 'admin'
      }
    })

    if (authError) {
      console.error('❌ Erro ao criar usuário no Supabase:', authError.message)
      process.exit(1)
    }

    if (!authData.user) {
      console.error('❌ Falha ao criar usuário no Supabase')
      process.exit(1)
    }

    console.log('✅ Usuário criado no Supabase Auth')

    // Criar usuário no banco local
    console.log('🔄 Criando usuário no banco local...')

    const user = await prisma.user.create({
      data: {
        id: authData.user.id,
        email: authData.user.email,
        name: name,
        role: 'admin',
        avatar: null,
      }
    })

    console.log('✅ Usuário criado no banco local')

    // Criar assinatura Enterprise gratuita para o admin
    console.log('🔄 Criando assinatura Enterprise...')

    const oneYearFromNow = new Date()
    oneYearFromNow.setFullYear(oneYearFromNow.getFullYear() + 1)

    await prisma.subscription.create({
      data: {
        userId: user.id,
        plan: 'enterprise',
        status: 'active',
        startDate: new Date(),
        endDate: oneYearFromNow,
        autoRenew: false,
        price: 0, // Gratuito para admin
        currency: 'BRL',
        features: [
          'canAccessDashboard',
          'canAccessHistory',
          'canAccessAnalytics',
          'canAccessReports',
          'canAccessAnomalies',
          'canCreateCultivations',
          'canExportData',
          'canShareCultivations',
          'canUseAdvancedFeatures',
          'canAccessAPI',
          'canUseRealTimeData',
          'canUsePredictiveAnalytics',
          'canUseCustomReports',
          'canUseTeamFeatures',
          'canUsePrioritySupport',
          'canAccessComparison'
        ]
      }
    })

    console.log('✅ Assinatura Enterprise criada')

    console.log('\n🎉 Usuário administrador criado com sucesso!')
    console.log('\n📋 Detalhes:')
    console.log(`   👤 Nome: ${name}`)
    console.log(`   📧 Email: ${email}`)
    console.log(`   🔑 Role: admin`)
    console.log(`   📦 Plano: Enterprise (gratuito)`)
    console.log(`   🆔 ID: ${user.id}`)

    console.log('\n🔐 Credenciais de acesso:')
    console.log(`   Email: ${email}`)
    console.log(`   Senha: ${password}`)

    console.log('\n🌐 Acesse: http://localhost:3000/auth/login')
    console.log('\n💡 Dica: Salve essas credenciais em local seguro!')

  } catch (error) {
    console.error('❌ Erro ao criar administrador:', error)
    
    if (error.code === 'P2002') {
      console.error('Este email já está em uso no banco de dados.')
    }
    
    process.exit(1)
  } finally {
    rl.close()
    await prisma.$disconnect()
  }
}

// Executar script
createAdmin()