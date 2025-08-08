const { createClient } = require('@supabase/supabase-js');
const { PrismaClient } = require('@prisma/client');

require('dotenv').config();

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

const prisma = new PrismaClient();

async function testTriggerReal() {
  console.log('🧪 Testando trigger com usuário real...\n');

  try {
    // 1. Contar usuários antes
    const beforeAuth = await prisma.$queryRaw`SELECT COUNT(*) as count FROM auth.users;`;
    const beforePublic = await prisma.user.count();
    
    console.log('📊 ANTES DO TESTE:');
    console.log(`   Auth users: ${beforeAuth[0].count}`);
    console.log(`   Public users: ${beforePublic}`);

    // 2. Criar usuário via Supabase Auth
    console.log('\n🔄 Criando usuário via Supabase Auth...');
    const testEmail = `trigger-test-${Date.now()}@gmail.com`;
    
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email: testEmail,
      password: 'TriggerTest123!',
      options: {
        data: {
          name: 'Trigger Test User'
        }
      }
    });

    if (authError) {
      console.error('❌ Erro ao criar usuário:', authError.message);
      return;
    }

    console.log('✅ Usuário criado no Supabase Auth:', authData.user.id);

    // 3. Aguardar trigger executar
    console.log('\n⏳ Aguardando 3 segundos para trigger executar...');
    await new Promise(resolve => setTimeout(resolve, 3000));

    // 4. Verificar se foi sincronizado
    console.log('\n🔍 Verificando sincronização...');
    const syncedUser = await prisma.user.findUnique({
      where: { id: authData.user.id }
    });

    // 5. Contar usuários depois
    const afterAuth = await prisma.$queryRaw`SELECT COUNT(*) as count FROM auth.users;`;
    const afterPublic = await prisma.user.count();
    
    console.log('\n📊 DEPOIS DO TESTE:');
    console.log(`   Auth users: ${afterAuth[0].count} (+${afterAuth[0].count - beforeAuth[0].count})`);
    console.log(`   Public users: ${afterPublic} (+${afterPublic - beforePublic})`);

    // 6. Resultado
    if (syncedUser) {
      console.log('\n🎉 SUCESSO! Trigger funcionou:');
      console.log('   ID:', syncedUser.id);
      console.log('   Email:', syncedUser.email);
      console.log('   Nome:', syncedUser.name);
      console.log('   Role:', syncedUser.role);
    } else {
      console.log('\n❌ FALHA! Trigger não funcionou');
      console.log('   Usuário criado no auth mas não sincronizado no public');
      
      // Sincronizar manualmente
      console.log('\n🔧 Fazendo sincronização manual...');
      try {
        const manualUser = await prisma.user.create({
          data: {
            id: authData.user.id,
            email: authData.user.email,
            name: authData.user.user_metadata?.name || authData.user.email.split('@')[0],
            role: 'free'
          }
        });
        console.log('✅ Sincronização manual funcionou:', manualUser.email);
      } catch (manualError) {
        console.log('❌ Erro na sincronização manual:', manualError.message);
      }
    }

    // 7. Limpar teste
    console.log('\n🧹 Limpando teste...');
    try {
      if (syncedUser) {
        await prisma.user.delete({ where: { id: authData.user.id } });
      }
      
      const supabaseService = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL,
        process.env.SUPABASE_SERVICE_ROLE_KEY,
        { auth: { autoRefreshToken: false, persistSession: false } }
      );
      
      await supabaseService.auth.admin.deleteUser(authData.user.id);
      console.log('✅ Teste limpo');
    } catch (cleanupError) {
      console.log('⚠️  Erro na limpeza:', cleanupError.message);
    }

    // 8. Diagnóstico final
    console.log('\n🎯 DIAGNÓSTICO:');
    if (syncedUser) {
      console.log('✅ Trigger está funcionando perfeitamente!');
    } else {
      console.log('❌ Trigger não está funcionando');
      console.log('💡 Possíveis causas:');
      console.log('   1. Trigger não está na tabela correta');
      console.log('   2. Função tem erro de sintaxe');
      console.log('   3. Permissões insuficientes');
      console.log('   4. RLS bloqueando a operação');
    }

  } catch (error) {
    console.error('❌ Erro durante teste:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

testTriggerReal();