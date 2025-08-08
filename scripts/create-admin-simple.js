#!/usr/bin/env node

const { createClient } = require('@supabase/supabase-js')
const { PrismaClient } = require('@prisma/client')

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

async function createAdmin() {
  console.log('🚀 Criando usuário administrador...\n')

  // Dados fixos para evitar problemas de input
  const adminData = {
    name: 'Administrador',
    email: 'admin@ervapp.com',
    password: 'admin123456'
  }

  try {
    console.log('📋 Dados do admin:')
    console.log(`   Nome: ${adminData.name}`)
    console.log(`   Email: ${adminData.email}`)
    console.log(`   Senha: ${adminData.password}`)
    console.log('')

    // Verificar se usuário já existe
    console.log('🔍 Verificando se admin já existe...')
    
    const existingUser = await prisma.user.findUnique({
      where: { email: adminData.email }
    })

    if (existingUser) {
      console.log('⚠️ Admin já existe!')
      console.log('📋 Dados existentes:')
      console.log(`   ID: ${existingUser.id}`)
      console.log(`   Email: ${existingUser.email}`)
      console.log(`   Nome: ${existingUser.name}`)
      console.log(`   Role: ${existingUser.role}`)
      
      // Verificar se tem assinatura
      const subscription = await prisma.subscription.findUnique({
        where: { userId: existingUser.id }
      })
      
      if (subscription) {
        console.log(`   Plano: ${subscription.plan}`)
        console.log(`   Status: ${subscription.status}`)
      } else {
        console.log('   Plano: Nenhum (criando Enterprise...)')
        
        // Criar assinatura Enterprise
        await prisma.subscription.create({
          data: {
            userId: existingUser.id,
            plan: 'enterprise',
            status: 'active',
            startDate: new Date(),
            endDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
            autoRenew: false,
            price: 0,
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
        
        console.log('✅ Assinatura Enterprise criada!')
      }
      
      console.log('\n🌐 Acesse: http://localhost:3000/auth/login')
      return
    }

    console.log('🔄 Criando usuário no Supabase Auth...')

    // Criar usuário no Supabase Auth
    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
      email: adminData.email,
      password: adminData.password,
      email_confirm: true,
      user_metadata: {
        name: adminData.name,
        role: 'admin'
      }
    })

    if (authError) {
      console.error('❌ Erro ao criar usuário no Supabase:', authError.message)
      
      if (authError.message.includes('already registered')) {
        console.log('💡 Usuário já existe no Supabase Auth, mas não no banco local.')
        console.log('🔄 Tentando sincronizar...')
        
        // Buscar usuário existente no Supabase
        const { data: existingAuthUser } = await supabase.auth.admin.getUserById(adminData.email)
        
        if (existingAuthUser) {
          // Criar no banco local
          const user = await prisma.user.create({
            data: {
              id: existingAuthUser.user.id,
              email: existingAuthUser.user.email,
              name: adminData.name,
              role: 'admin',
              avatar: null,
            }
          })
          
          console.log('✅ Usuário sincronizado no banco local')
        }
      } else {
        process.exit(1)
      }
    } else {
      console.log('✅ Usuário criado no Supabase Auth')
      console.log(`🆔 ID: ${authData.user.id}`)

      // Aguardar trigger executar
      console.log('⏳ Aguardando trigger sincronizar...')
      await new Promise(resolve => setTimeout(resolve, 3000))

      // Verificar se foi sincronizado
      let user = await prisma.user.findUnique({
        where: { id: authData.user.id }
      })

      if (!user) {
        console.log('⚠️ Trigger não executou, criando manualmente...')
        
        user = await prisma.user.create({
          data: {
            id: authData.user.id,
            email: authData.user.email,
            name: adminData.name,
            role: 'admin',
            avatar: null,
          }
        })
        
        console.log('✅ Usuário criado no banco local')
      } else {
        console.log('✅ Usuário sincronizado automaticamente pelo trigger')
        
        // Atualizar role para admin se necessário
        if (user.role !== 'admin') {
          await prisma.user.update({
            where: { id: user.id },
            data: { role: 'admin' }
          })
          console.log('✅ Role atualizada para admin')
        }
      }
    }

    // Buscar usuário final
    const finalUser = await prisma.user.findUnique({
      where: { email: adminData.email }
    })

    if (!finalUser) {
      console.error('❌ Erro: Usuário não foi criado')
      process.exit(1)
    }

    // Criar assinatura Enterprise
    console.log('🔄 Criando assinatura Enterprise...')

    const oneYearFromNow = new Date()
    oneYearFromNow.setFullYear(oneYearFromNow.getFullYear() + 1)

    await prisma.subscription.upsert({
      where: { userId: finalUser.id },
      update: {
        plan: 'enterprise',
        status: 'active',
        endDate: oneYearFromNow,
        price: 0,
      },
      create: {
        userId: finalUser.id,
        plan: 'enterprise',
        status: 'active',
        startDate: new Date(),
        endDate: oneYearFromNow,
        autoRenew: false,
        price: 0,
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
    console.log(`   👤 Nome: ${adminData.name}`)
    console.log(`   📧 Email: ${adminData.email}`)
    console.log(`   🔑 Role: admin`)
    console.log(`   📦 Plano: Enterprise (gratuito)`)
    console.log(`   🆔 ID: ${finalUser.id}`)

    console.log('\n🔐 Credenciais de acesso:')
    console.log(`   Email: ${adminData.email}`)
    console.log(`   Senha: ${adminData.password}`)

    console.log('\n🌐 Acesse: http://localhost:3000/auth/login')
    console.log('\n💡 Dica: Salve essas credenciais em local seguro!')

  } catch (error) {
    console.error('❌ Erro ao criar administrador:', error)
    
    if (error.code === 'P2002') {
      console.error('Este email já está em uso no banco de dados.')
    }
    
    process.exit(1)
  } finally {
    await prisma.$disconnect()
  }
}

// Executar script
createAdmin()