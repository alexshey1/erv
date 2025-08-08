const { PrismaClient } = require('@prisma/client')

async function main() {
  const prisma = new PrismaClient()
  
  try {
    // Verificar todos os schemas
    const schemas = await prisma.$queryRaw`
      SELECT schema_name 
      FROM information_schema.schemata 
      WHERE schema_name NOT IN ('information_schema', 'pg_catalog', 'pg_toast');
    `
    
    console.log('📋 Schemas disponíveis:')
    console.table(schemas)
    
    // Verificar tabelas no schema public
    const publicTables = await prisma.$queryRaw`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' AND table_name = 'users';
    `
    
    console.log('📋 Tabela users no schema public:')
    console.table(publicTables)
    
    // Verificar tabelas no schema auth
    const authTables = await prisma.$queryRaw`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'auth' AND table_name = 'users';
    `
    
    console.log('📋 Tabela users no schema auth:')
    console.table(authTables)
    
  } catch (error) {
    console.error('❌ Erro:', error)
  } finally {
    await prisma.$disconnect()
  }
}

main()