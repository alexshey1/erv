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

async function syncExistingUsers() {
  console.log('🔄 Sincronizando usuários existentes do Supabase Auth...\n')

  try {
    // Buscar todos os usuários do Supabase Auth
    console.log('📋 Buscando usuários no Supabase Auth...')
    const { data: authUsers, error } = await supabase.auth.admin.listUsers()

    if (error) {
      console.error('❌ Erro ao buscar usuários:', error.message)
      return
    }

    console.log(`✅ Encontrados ${authUsers.users.length} usuários no Supabase Auth`)

    for (const authUser of authUsers.users) {
      console.log(`\n🔄 Processando usuário: ${authUser.email}`)

      // Verificar se já existe no banco local
      const existingUser = await prisma.user.findUnique({
        where: { id: authUser.id }
      })

      if (existingUser) {
        console.log(`   ✅ Usuário já existe no banco local`)
        continue
      }

      // Criar no banco local
      const user = await prisma.user.create({
        data: {
          id: authUser.id,
          email: authUser.email,
          name: authUser.user_metadata?.name || authUser.email.split('@')[0],
          role: 'free',
          avatar: authUser.user_metadata?.avatar_url || null,
        }
      })

      console.log(`   ✅ Usuário criado no banco local: ${user.id}`)
    }

    console.log('\n🎉 Sincronização concluída!')
    console.log('💡 Agora os usuários devem conseguir acessar o dashboard')

  } catch (error) {
    console.error('❌ Erro na sincronização:', error)
  } finally {
    await prisma.$disconnect()
  }
}

syncExistingUsers()