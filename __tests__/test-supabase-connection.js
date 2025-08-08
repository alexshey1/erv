const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

// Sistema de logging seguro - só exibe em desenvolvimento
const isDevelopment = process.env.NODE_ENV === 'development' || process.env.NODE_ENV !== 'production';

const safeLog = {
  info: (message, ...args) => {
    if (isDevelopment) {
      console.log(message, ...args);
    }
  },
  error: (message, ...args) => {
    // Erros sempre são logados, mas sem informações sensíveis em produção
    if (isDevelopment) {
      console.error(message, ...args);
    } else {
      console.error('Database connection error occurred');
    }
  },
  success: (message, ...args) => {
    if (isDevelopment) {
      console.log(message, ...args);
    }
  }
};

async function testConnection() {
  try {
    safeLog.info('🔍 Testando conexão com Supabase...');
    
    // Testar conexão básica
    await prisma.$connect();
    safeLog.success('✅ Conexão estabelecida com sucesso!');
    
    // Testar se as tabelas existem
    const userCount = await prisma.user.count();
    safeLog.info(`📊 Tabela users: ${userCount} registros`);
    
    const cultivationCount = await prisma.cultivation.count();
    safeLog.info(`📊 Tabela cultivations: ${cultivationCount} registros`);
    
    safeLog.success('🎉 Tudo funcionando perfeitamente!');
    
    // Retornar resultado para uso programático
    return {
      success: true,
      userCount,
      cultivationCount
    };
    
  } catch (error) {
    safeLog.error('❌ Erro na conexão:', error.message);
    
    if (error.code === 'P1001') {
      safeLog.info('💡 Dica: Verifique se o projeto Supabase está ativo');
      safeLog.info('💡 Dica: Verifique se a DATABASE_URL está correta');
    }
    
    if (error.code === 'P2021') {
      safeLog.info('💡 A tabela não existe. Execute o SQL no dashboard do Supabase primeiro.');
    }
    
    // Retornar erro estruturado
    return {
      success: false,
      error: isDevelopment ? error.message : 'Connection failed',
      code: error.code
    };
    
  } finally {
    await prisma.$disconnect();
  }
}

testConnection();