const { PrismaClient } = require('@prisma/client');
const { createClient } = require('@supabase/supabase-js');

require('dotenv').config();

const prisma = new PrismaClient();
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

async function testUserRegistration() {
  console.log('🧪 Testando registro de usuário...\n');

  const testUser = {
    email: `test-${Date.now()}@example.com`,
    password: 'TestPassword123!',
    name: 'Usuário Teste'
  };

  try {
    console.log('1️⃣ Criando usuário no Supabase Auth...');
    
    // Registrar no Supabase usando signup normal
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email: testUser.email,
      password: testUser.password,
      options: {
        data: {
          name: testUser.name,
        }
      }
    });

    if (authError) {
      console.error('❌ Erro no Supabase Auth:', authError.message);
      return;
    }

    if (!authData.user) {
      console.error('❌ Falha ao criar usuário no Supabase');
      return;
    }

    console.log('✅ Usuário criado no Supabase Auth');
    console.log('   ID:', authData.user.id);
    console.log('   Email:', authData.user.email);

    console.log('\n2️⃣ Criando usuário no banco local...');

    // Criar usuário no banco local
    const user = await prisma.user.create({
      data: {
        id: authData.user.id,
        email: authData.user.email,
        name: testUser.name,
        role: 'free',
      }
    });

    console.log('✅ Usuário criado no banco local');
    console.log('   ID:', user.id);
    console.log('   Email:', user.email);
    console.log('   Nome:', user.name);
    console.log('   Role:', user.role);

    console.log('\n🎉 Teste de registro concluído com sucesso!');

    // Limpar dados de teste
    console.log('\n🧹 Limpando dados de teste...');
    await prisma.user.delete({ where: { id: user.id } });
    await supabase.auth.admin.deleteUser(authData.user.id);
    console.log('✅ Dados de teste removidos');

  } catch (error) {
    console.error('❌ Erro durante o teste:', error);
    
    if (error.code) {
      console.error('   Código do erro:', error.code);
    }
    
    if (error.meta) {
      console.error('   Meta:', error.meta);
    }
  } finally {
    await prisma.$disconnect();
  }
}

testUserRegistration();