const { createClient } = require('@supabase/supabase-js');

require('dotenv').config();

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function testAfterConfig() {
  console.log('🧪 Testando após configurações do dashboard...\n');

  const testUser = {
    email: `config-test-${Date.now()}@example.com`,
    password: 'ConfigTest123!'
  };

  console.log('📝 Testando com:', testUser.email);

  try {
    console.log('🔄 Tentando signup com configurações atualizadas...');
    
    const { data, error } = await supabase.auth.signUp({
      email: testUser.email,
      password: testUser.password,
      options: {
        data: {
          name: 'Config Test User'
        }
      }
    });

    if (error) {
      console.error('❌ Ainda há erro:', {
        message: error.message,
        status: error.status,
        code: error.code
      });
      
      // Sugestões baseadas no tipo de erro
      if (error.message.includes('Database error')) {
        console.log('\n💡 Próximos passos:');
        console.log('   1. Verifique se RLS está desabilitado nas tabelas customizadas');
        console.log('   2. Verifique se não há triggers conflitantes');
        console.log('   3. Tente recriar o projeto Supabase se necessário');
      }
      
    } else {
      console.log('✅ Signup funcionou!');
      console.log('📋 Dados:', {
        user_id: data.user?.id,
        email: data.user?.email,
        confirmed: data.user?.email_confirmed_at ? 'Sim' : 'Não',
        session: data.session ? 'Criada' : 'Não criada'
      });

      // Limpar teste
      if (data.session) {
        await supabase.auth.signOut();
        console.log('🧹 Logout realizado');
      }
    }

  } catch (error) {
    console.error('❌ Erro na requisição:', error.message);
  }
}

testAfterConfig();