import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function setupDatabase() {
  try {
    console.log('🔄 Configurando banco de dados...')
    console.log('ℹ️  Agora usando Supabase Auth - usuários são criados via registro')

    // Verificar se há usuários existentes
    const userCount = await prisma.user.count()
    console.log(`📊 Usuários existentes no banco: ${userCount}`)

    if (userCount === 0) {
      console.log('\n📝 Para criar usuários:')
      console.log('1. Admin: npm run admin:create')
      console.log('2. Usuários normais: Registre via /auth/register')
      console.log('3. Configure triggers: npm run supabase:triggers')
    }

    console.log('\n🎉 Banco de dados verificado!')
    console.log('\n📋 Próximos passos:')
    console.log('1. Execute: npm run admin:create (criar admin)')
    console.log('2. Execute: npm run supabase:triggers (sincronização)')
    console.log('3. Configure templates no Supabase Dashboard')
    console.log('4. Teste registro em: /auth/register')

  } catch (error) {
    console.error('❌ Erro ao configurar banco de dados:', error)
  } finally {
    await prisma.$disconnect()
  }
}

// Executar se chamado diretamente
if (require.main === module) {
  setupDatabase()
}

export { setupDatabase } 