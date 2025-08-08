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

async function createAdminManual() {
  console.log('🚀 Criando admin manualmente (sem triggers)...\n')

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

    // 1. Verificar se já existe no banco local
    let localUser = await prisma.user.findUnique({
      where: { email: adminData.email }
    })

    if (localUser) {
      console.log('✅ Admin já existe no banco local')
      console.log(`   ID: ${localUser.id}`)
    } else {
      console.log('🔄 Criando usuário no Supabase Auth...')

      // 2. Criar no Supabase Auth
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
        console.error('❌ Erro no Supabase Auth:', authError.message)
        
        // Tentar buscar usuário existente
        console.log('🔍 Tentando buscar usuário existente...')
        const { data: users } = await supabase.auth.admin.listUsers()
        const existingUser = users.users.find(u => u.email === adminData.email)
        
        if (existingUser) {
          console.log('✅ Usuário encontrado no Supabase Auth')
          
          // 3. Criar no banco local
          localUser = await prisma.user.create({
            data: {
              id: existingUser.id,
              email: existingUser.email,
              name: adminData.name,
              role: 'admin',
              avatar: existingUser.user_metadata?.avatar_url || null,
            }
          })
          
          console.log('✅ Usuário criado no banco local')
        } else {
          throw new Error('Não foi possível criar ou encontrar usuário')
        }
      } else {
        console.log('✅ Usuário criado no Supabase Auth')
        
        // 3. Criar no banco local manualmente
        localUser = await prisma.user.create({
          data: {
            id: authData.user.id,
            email: authData.user.email,
            name: adminData.name,
            role: 'admin',
            avatar: authData.user.user_metadata?.avatar_url || null,
          }
        })
        
        console.log('✅ Usuário criado no banco local')
      }
    }

    // 4. Criar/atualizar assinatura Enterprise
    console.log('🔄 Configurando assinatura Enterprise...')

    const oneYearFromNow = new Date()
    oneYearFromNow.setFullYear(oneYearFromNow.getFullYear() + 1)

    const subscription = await prisma.subscription.upsert({
      where: { userId: localUser.id },
      update: {
        plan: 'enterprise',
        status: 'active',
        endDate: oneYearFromNow,
        price: 0,
        updatedAt: new Date()
      },
      create: {
        userId: localUser.id,
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

    console.log('✅ Assinatura Enterprise configurada')

    console.log('\n🎉 Admin criado com sucesso!')
    console.log('\n📋 Detalhes finais:')
    console.log(`   👤 Nome: ${localUser.name}`)
    console.log(`   📧 Email: ${localUser.email}`)
    console.log(`   🔑 Role: ${localUser.role}`)
    console.log(`   📦 Plano: ${subscription.plan}`)
    console.log(`   ✅ Status: ${subscription.status}`)
    console.log(`   🆔 ID: ${localUser.id}`)

    console.log('\n🔐 Credenciais de login:')
    console.log(`   Email: ${adminData.email}`)
    console.log(`   Senha: ${adminData.password}`)

    console.log('\n🌐 Teste em: http://localhost:3000/auth/login')

  } catch (error) {
    console.error('❌ Erro:', error.message)
    console.error('Stack:', error.stack)
  } finally {
    await prisma.$disconnect()
  }
}

createAdminManual()