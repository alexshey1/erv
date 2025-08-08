const { PrismaClient } = require('@prisma/client')

async function main() {
  const prisma = new PrismaClient()
  
  try {
    // Atualizar registros existentes que têm updatedAt como NULL
    await prisma.$executeRaw`
      UPDATE users 
      SET "updatedAt" = "createdAt" 
      WHERE "updatedAt" IS NULL;
    `
    
    // Adicionar valor padrão para a coluna
    await prisma.$executeRaw`
      ALTER TABLE users 
      ALTER COLUMN "updatedAt" SET DEFAULT CURRENT_TIMESTAMP;
    `
    
    console.log('✅ Campo updatedAt atualizado com sucesso!')
    
  } catch (error) {
    console.error('❌ Erro:', error)
  } finally {
    await prisma.$disconnect()
  }
}

main()