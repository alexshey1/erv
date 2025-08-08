const { createClient } = require('@supabase/supabase-js');
const { PrismaClient } = require('@prisma/client');

require('dotenv').config();

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

const prisma = new PrismaClient();

async function testSyncTrigger() {
  console.log('🧪 Testando trigger de sincronização...\n');

  try {
    // 1. Verificar se o trigger existe
    console.log('1️⃣ Verificando se trigger foi criado...');
    const triggers = await prisma.$queryRaw`
      SELECT trigger_name, event_object_table, action_statement
      FROM information_schema.triggers 
      WHERE trigger_name = 'on_auth_user_created';
    `;
    
    if (triggers.length > 0) {
      console.log('✅ Trigger encontrado:', triggers[0].trigger_name);
    } else {
      console.log('❌ Trigger não encontrado - execute o SQL primeiro');
      return;
    }

    // 2. Contar usuários antes do teste
    console.log('\n2️⃣ Contando usuários antes do teste...');
    const authUsersBefore = await prisma.$queryRaw`SELECT COUNT(*) as count FROM auth.users;`;
    const publicUsersBefore = await prisma.$queryRaw`SELECT COUNT(*) as count FROM public.users;`;
    
    console.log(`   Auth users: ${authUsersBefore[0].count}`);
    console.log(`   Public users: ${publicUsersBefore[0].count}`);

    // 3. Criar usuário via Supabase Auth
    console.log('\n3️⃣ Criando usuário via Supabase Auth...');
    const testEmail = `sync-test-${Date.now()}@gmail.com`;
    
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email: testEmail,
      password: 'SyncTest123!',
      options: {
        data: {
          name: 'Sync Test User'
        }
      }
    });

    if (authError) {
      console.error('❌ Erro ao criar usuário:', authError.message);
      return;
    }

    console.log('✅ Usuário criado no Supabase Auth:', authData.user.id);

    // 4. Aguardar um pouco para o trigger executar
    console.log('\n4️⃣ Aguardando trigger executar...');
    await new Promise(resolve => setTimeout(resolve, 2000));

    // 5. Verificar se usuário foi sincronizado
    console.log('\n5️⃣ Verificando sincronização...');
    const syncedUser = await prisma.user.findUnique({
      where: { id: authData.user.id }
    });

    if (syncedUser) {
      console.log('🎉 SUCESSO! Usuário sincronizado automaticamente:');
      console.log('   ID:', syncedUser.id);
      console.log('   Email:', syncedUser.email);
      console.log('   Nome:', syncedUser.name);
      console.log('   Role:', syncedUser.role);
    } else {
      console.log('❌ Usuário NÃO foi sincronizado - trigger pode ter falhado');
      
      // Tentar sincronização manual
      console.log('\n🔧 Tentando sincronização manual...');
      await prisma.$executeRaw`SELECT public.sync_existing_users();`;
      
      const manualSyncUser = await prisma.user.findUnique({
        where: { id: authData.user.id }
      });
      
      if (manualSyncUser) {
        console.log('✅ Sincronização manual funcionou!');
      } else {
        console.log('❌ Sincronização manual também falhou');
      }
    }

    // 6. Contar usuários após o teste
    console.log('\n6️⃣ Contando usuários após o teste...');
    const authUsersAfter = await prisma.$queryRaw`SELECT COUNT(*) as count FROM auth.users;`;
    const publicUsersAfter = await prisma.$queryRaw`SELECT COUNT(*) as count FROM public.users;`;
    
    console.log(`   Auth users: ${authUsersAfter[0].count} (+${authUsersAfter[0].count - authUsersBefore[0].count})`);
    console.log(`   Public users: ${publicUsersAfter[0].count} (+${publicUsersAfter[0].count - publicUsersBefore[0].count})`);

    // 7. Limpar usuário de teste (opcional)
    console.log('\n7️⃣ Limpando usuário de teste...');
    try {
      const supabaseService = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL,
        process.env.SUPABASE_SERVICE_ROLE_KEY,
        { auth: { autoRefreshToken: false, persistSession: false } }
      );
      
      await supabaseService.auth.admin.deleteUser(authData.user.id);
      await prisma.user.delete({ where: { id: authData.user.id } });
      console.log('🧹 Usuário de teste removido');
    } catch (cleanupError) {
      console.log('⚠️  Erro na limpeza (normal):', cleanupError.message);
    }

    console.log('\n🎯 RESULTADO:');
    if (syncedUser) {
      console.log('✅ Trigger de sincronização está funcionando perfeitamente!');
      console.log('✅ Usuários serão sincronizados automaticamente');
    } else {
      console.log('⚠️  Trigger não funcionou, mas sincronização manual está disponível');
    }

  } catch (error) {
    console.error('❌ Erro durante teste:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

testSyncTrigger();