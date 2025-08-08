const { PrismaClient } = require('@prisma/client');

require('dotenv').config();

const prisma = new PrismaClient();

async function checkSyncStatus() {
  console.log('🔍 Verificando status de sincronização...\n');

  try {
    // 1. Contar usuários em auth.users
    const authUsers = await prisma.$queryRaw`SELECT COUNT(*) as count FROM auth.users;`;
    const authCount = parseInt(authUsers[0].count);

    // 2. Contar usuários em public.users
    const publicUsers = await prisma.user.count();

    // 3. Listar alguns usuários de cada tabela para comparação
    const authUsersList = await prisma.$queryRaw`
      SELECT id, email, created_at 
      FROM auth.users 
      ORDER BY created_at DESC 
      LIMIT 5;
    `;

    const publicUsersList = await prisma.user.findMany({
      select: { id: true, email: true, createdAt: true },
      orderBy: { createdAt: 'desc' },
      take: 5
    });

    // 4. Mostrar resultados
    console.log('📊 RESUMO DA SINCRONIZAÇÃO:');
    console.log(`   👤 Usuários em auth.users: ${authCount}`);
    console.log(`   👤 Usuários em public.users: ${publicUsers}`);
    console.log(`   🔄 Diferença: ${Math.abs(authCount - publicUsers)}`);

    if (authCount === publicUsers) {
      console.log('   ✅ PERFEITAMENTE SINCRONIZADO!');
    } else {
      console.log('   ⚠️  DESINCRONIZADO');
    }

    // 5. Mostrar últimos usuários de cada tabela
    console.log('\n📋 ÚLTIMOS USUÁRIOS (auth.users):');
    authUsersList.forEach(user => {
      console.log(`   - ${user.email} (${user.id.substring(0, 8)}...)`);
    });

    console.log('\n📋 ÚLTIMOS USUÁRIOS (public.users):');
    publicUsersList.forEach(user => {
      console.log(`   - ${user.email} (${user.id.substring(0, 8)}...)`);
    });

    // 7. Verificar se trigger está ativo
    console.log('\n🔧 STATUS DO TRIGGER:');
    const triggers = await prisma.$queryRaw`
      SELECT 
        trigger_name,
        event_object_schema,
        event_object_table,
        action_timing,
        event_manipulation
      FROM information_schema.triggers 
      WHERE trigger_name = 'on_auth_user_created';
    `;

    if (triggers.length > 0) {
      const trigger = triggers[0];
      console.log(`   ✅ Trigger ativo: ${trigger.trigger_name}`);
      console.log(`   📍 Localização: ${trigger.event_object_schema}.${trigger.event_object_table}`);
      console.log(`   ⚡ Evento: ${trigger.action_timing} ${trigger.event_manipulation}`);
      
      if (trigger.event_object_schema === 'auth' && trigger.event_object_table === 'users') {
        console.log('   ✅ Trigger está na tabela correta!');
      } else {
        console.log('   ❌ Trigger está na tabela errada!');
      }
    } else {
      console.log('   ❌ Trigger não encontrado');
    }

    // 8. Recomendações
    console.log('\n💡 RECOMENDAÇÕES:');
    if (authCount === publicUsers && triggers.length > 0) {
      console.log('   🎉 Tudo perfeito! Sistema funcionando corretamente');
      console.log('   ✅ Novos usuários serão sincronizados automaticamente');
    } else if (authCount > publicUsers) {
      console.log('   🔧 Há usuários no auth que não estão no public');
      console.log('   🔧 Trigger pode não estar funcionando ou usuários são antigos');
    } else if (triggers.length === 0) {
      console.log('   🔧 Execute o script de criação do trigger novamente');
    }

  } catch (error) {
    console.error('❌ Erro durante verificação:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

checkSyncStatus();