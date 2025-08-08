const { PrismaClient } = require('@prisma/client');

require('dotenv').config();

const prisma = new PrismaClient();

async function debugTriggerIssue() {
  console.log('🔍 Debugando problema do trigger...\n');

  try {
    // 1. Verificar se há usuários desincronizados
    console.log('1️⃣ Verificando usuários desincronizados...');
    const authUsers = await prisma.$queryRaw`
      SELECT id, email, created_at, email_confirmed_at
      FROM auth.users 
      ORDER BY created_at DESC;
    `;

    const publicUsers = await prisma.user.findMany({
      orderBy: { createdAt: 'desc' }
    });

    console.log('\n📋 Usuários em auth.users:');
    authUsers.forEach(user => {
      const confirmed = user.email_confirmed_at ? '✅' : '❌';
      console.log(`   ${confirmed} ${user.email} (${user.id.substring(0, 8)}...)`);
    });

    console.log('\n📋 Usuários em public.users:');
    publicUsers.forEach(user => {
      console.log(`   ✅ ${user.email} (${user.id.substring(0, 8)}...)`);
    });

    // 2. Identificar usuários que estão só no auth
    const authIds = authUsers.map(u => u.id);
    const publicIds = publicUsers.map(u => u.id);
    const onlyInAuth = authIds.filter(id => !publicIds.includes(id));

    if (onlyInAuth.length > 0) {
      console.log(`\n⚠️  ${onlyInAuth.length} usuários existem APENAS no auth.users:`);
      onlyInAuth.forEach(id => {
        const user = authUsers.find(u => u.id === id);
        console.log(`   - ${user.email} (${id.substring(0, 8)}...)`);
      });

      // 3. Sincronizar manualmente os usuários faltantes
      console.log('\n🔧 Sincronizando usuários faltantes manualmente...');
      for (const id of onlyInAuth) {
        const authUser = authUsers.find(u => u.id === id);
        try {
          await prisma.user.create({
            data: {
              id: authUser.id,
              email: authUser.email,
              name: authUser.email.split('@')[0],
              role: 'free'
            }
          });
          console.log(`   ✅ Sincronizado: ${authUser.email}`);
        } catch (error) {
          console.log(`   ❌ Erro ao sincronizar ${authUser.email}:`, error.message);
        }
      }
    } else {
      console.log('\n✅ Todos os usuários estão sincronizados!');
    }

    // 4. Testar se trigger está funcionando
    console.log('\n4️⃣ Testando trigger com inserção manual...');
    try {
      // Simular inserção no auth.users (só para teste)
      const testId = 'test-trigger-' + Date.now();
      console.log('⚠️  Nota: Não podemos inserir diretamente em auth.users via Prisma');
      console.log('   O trigger só pode ser testado via Supabase Auth signup');
    } catch (error) {
      console.log('❌ Erro no teste:', error.message);
    }

    // 5. Verificar logs do trigger
    console.log('\n5️⃣ Verificando função do trigger...');
    const functionExists = await prisma.$queryRaw`
      SELECT proname, prosrc 
      FROM pg_proc 
      WHERE proname = 'handle_new_user';
    `;

    if (functionExists.length > 0) {
      console.log('✅ Função handle_new_user existe');
    } else {
      console.log('❌ Função handle_new_user NÃO existe - precisa recriar!');
    }

  } catch (error) {
    console.error('❌ Erro durante debug:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

debugTriggerIssue();