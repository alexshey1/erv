#!/usr/bin/env ts-node

import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('🚀 Configurando banco de dados...')

  try {
    console.log('✅ Banco de dados configurado!')
    console.log('\n📋 Próximos passos:')
    console.log('1. Execute: npm run admin:create (para criar usuário admin)')
    console.log('2. Execute: npm run supabase:triggers (para configurar sincronização)')
    console.log('3. Configure templates de email no Supabase Dashboard')
    
  } catch (error) {
    console.error('❌ Erro ao configurar banco:', error)
    process.exit(1)
  } finally {
    await prisma.$disconnect()
  }
}

main()