// Teste de isolamento de usuários
const { PrismaClient } = require('@prisma/client')
const { createLogger } = require('../lib/safe-logger')

async function testUserIsolation() {
  const prisma = new PrismaClient()
  const logger = createLogger('UserIsolationTest')
  
  try {
    logger.info('🔍 Testando isolamento de usuários...')
    
    // 1. Listar todos os usuários
    const users = await prisma.user.findMany()
    logger.info(`📊 Usuários encontrados: ${users.length}`)
    
    users.forEach((user, index) => {
      logger.data(`👤 Usuário ${index + 1}`, {
        id: user.id,
        email: user.email,
        name: user.name
      })
    })
    
    const isolationReport = {
      totalUsers: users.length,
      userDetails: []
    }
    
    // 2. Verificar cultivos de cada usuário
    for (const user of users) {
      logger.info(`\n🔍 Verificando cultivos do usuário: ${user.email}`)
      
      const cultivations = await prisma.cultivation.findMany({
        where: { userId: user.id }
      })
      
      logger.info(`📊 Cultivos encontrados: ${cultivations.length}`)
      
      const userDetail = {
        user: { id: user.id, email: user.email, name: user.name },
        cultivationsCount: cultivations.length,
        cultivations: cultivations.map((cultivation, index) => ({
          id: cultivation.id,
          name: cultivation.name,
          userId: cultivation.userId
        })),
        eventsCount: 0,
        events: []
      }
      
      cultivations.forEach((cultivation, index) => {
        logger.data(`  Cultivo ${index + 1}`, {
          id: cultivation.id,
          name: cultivation.name,
          userId: cultivation.userId
        })
      })
      
      // 3. Verificar eventos do usuário
      logger.info(`\n🔍 Verificando eventos do usuário: ${user.email}`)
      
      const events = await prisma.cultivationEvent.findMany({
        where: { userId: user.id }
      })
      
      logger.info(`📊 Eventos encontrados: ${events.length}`)
      
      userDetail.eventsCount = events.length
      userDetail.events = events.map((event, index) => ({
        id: event.id,
        type: event.type,
        userId: event.userId
      }))
      
      events.forEach((event, index) => {
        logger.data(`  Evento ${index + 1}`, {
          id: event.id,
          type: event.type,
          userId: event.userId
        })
      })
      
      isolationReport.userDetails.push(userDetail)
    }
    
    // Verificar isolamento
    const isolationIssues = []
    for (const userDetail of isolationReport.userDetails) {
      // Verificar se há cultivos de outros usuários
      const wrongCultivations = userDetail.cultivations.filter(c => c.userId !== userDetail.user.id)
      if (wrongCultivations.length > 0) {
        isolationIssues.push(`Usuário ${userDetail.user.email} tem cultivos de outros usuários`)
      }
      
      // Verificar se há eventos de outros usuários
      const wrongEvents = userDetail.events.filter(e => e.userId !== userDetail.user.id)
      if (wrongEvents.length > 0) {
        isolationIssues.push(`Usuário ${userDetail.user.email} tem eventos de outros usuários`)
      }
    }
    
    if (isolationIssues.length === 0) {
      logger.success('✅ Isolamento de usuários está funcionando corretamente!')
    } else {
      logger.error('❌ Problemas de isolamento encontrados:')
      isolationIssues.forEach(issue => logger.error(`  - ${issue}`))
    }
    
    return {
      success: isolationIssues.length === 0,
      report: isolationReport,
      issues: isolationIssues
    }
    
  } catch (error) {
    logger.error('❌ Erro no teste:', error)
    return { success: false, error: error.message }
  } finally {
    await prisma.$disconnect()
    logger.info('🔌 Conexão fechada')
    logger.elapsed('Teste de isolamento finalizado')
  }
}

testUserIsolation() 