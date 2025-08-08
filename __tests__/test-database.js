// Teste da conexão com o banco de dados
const { PrismaClient } = require('@prisma/client')

async function testDatabase() {
  const prisma = new PrismaClient()
  
  try {
    console.log('🔍 Testando conexão com o banco...')
    
    // Teste 1: Verificar se consegue conectar
    await prisma.$connect()
    console.log('✅ Conexão estabelecida com sucesso')
    
    // Teste 2: Verificar se há usuários
    const users = await prisma.user.findMany()
    console.log(`📊 Usuários encontrados: ${users.length}`)
    
    if (users.length > 0) {
      console.log('👤 Primeiro usuário:', {
        id: users[0].id,
        email: users[0].email,
        name: users[0].name
      })
    }
    
    // Teste 3: Verificar se consegue criar um cultivo de teste
    if (users.length > 0) {
      console.log('🔍 Tentando criar cultivo de teste...')
      
      const testCultivation = await prisma.cultivation.create({
        data: {
          name: "Teste de Conexão",
          seedStrain: "Teste",
          startDate: new Date(),
          status: "active",
          userId: users[0].id,
        },
      })
      
      console.log('✅ Cultivo de teste criado:', testCultivation.id)
      
      // Limpar o cultivo de teste
      await prisma.cultivation.delete({
        where: { id: testCultivation.id }
      })
      console.log('🧹 Cultivo de teste removido')
    }
    
  } catch (error) {
    console.error('❌ Erro no teste do banco:', error)
  } finally {
    await prisma.$disconnect()
    console.log('🔌 Conexão fechada')
  }
}

testDatabase() 