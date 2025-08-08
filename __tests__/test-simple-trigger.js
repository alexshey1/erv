const { createClient } = require('@supabase/supabase-js');
const { PrismaClient } = require('@prisma/client');

require('dotenv').config();

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

const prisma = new PrismaClient();

async function testSimpleTrigger() {
  console.log('🧪 Testando trigger simples...\n');

  try {
    // 1. Criar usuário via Supabase Auth
    console.log('1️⃣ Criando usuário via Supabase Auth...');
    const testEmail = `simple-test-${Date.now()}@gmail.com`;
    
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email: testEmail,
      password: 'SimpleTest123!',
      options: {
        data: {
          name: 'Simple Test User'
        }
      }
    });

    if (authError) {
      console.error('❌ Erro ao criar usuário:', authError.message);
      return;
    }

    console.log('✅ Usuário criado no Supabase Auth:', authData.user.id);

    // 2. Aguardar trigger executar
    console.log('\n2️⃣ Aguardando trigger executar...');
    await new Promise(resolve => setTimeout(resolve, 2000));

    // 3. Verificar se foi sincronizado
    console.log('\n3️⃣ Verificando sincronização...');
    const syncedUser = await prisma.user.findUnique({
      where: { id: authData.user.id }
    });

    if (syncedUser) {
      console.log('🎉 SUCESSO! Trigger funcionou:');
      console.log('   ID:', syncedUser.id);
      console.log('   Email:', syncedUser.email);
      console.log('   Nome:', syncedUser.name);
      console.log('   Role:', syncedUser.role);
      console.log('   Criado em:', syncedUser.createdAt);
    } else {
      console.log('❌ Trigger não funcionou - usuário não foi sincronizado');
    }

    // 4. Limpar teste
    console.log('\n4️⃣ Limpando teste...');
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
      console.log('🧹 Teste limpo');
    } catch (cleanupError) {
      console.log('⚠️  Erro na limpeza:', cleanupError.message);
    }

    // 5. Resultado final
    console.log('\n🎯 RESULTADO:');
    if (syncedUser) {
      console.log('✅ Trigger de sincronização está funcionando!');
      console.log('✅ Usuários serão sincronizados automaticamente');
      console.log('✅ Pode usar o sistema normalmente');
    } else {
      console.log('❌ Trigger não está funcionando');
      console.log('⚠️  Verifique se executou o SQL corretamente');
      console.log('⚠️  Sistema usará sincronização manual como fallback');
    }

  } catch (error) {
    console.error('❌ Erro durante teste:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

testSimpleTrigger();