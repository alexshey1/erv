const { createClient } = require('@supabase/supabase-js');

require('dotenv').config();

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function debugSupabaseSignup() {
  console.log('🔍 Debug do Supabase Auth SignUp...\n');

  const testUser = {
    email: `debug-${Date.now()}@example.com`,
    password: 'DebugPassword123!'
  };

  console.log('📝 Testando com:', testUser.email);

  try {
    console.log('🔄 Tentando signup...');
    
    const { data, error } = await supabase.auth.signUp({
      email: testUser.email,
      password: testUser.password,
      options: {
        data: {
          name: 'Debug User'
        }
      }
    });

    if (error) {
      console.error('❌ Erro detalhado:', {
        message: error.message,
        status: error.status,
        name: error.name,
        details: error
      });
    } else {
      console.log('✅ Signup bem-sucedido!');
      console.log('📋 Dados retornados:', {
        user: data.user ? {
          id: data.user.id,
          email: data.user.email,
          confirmed_at: data.user.email_confirmed_at,
          created_at: data.user.created_at
        } : null,
        session: data.session ? 'Sessão criada' : 'Nenhuma sessão'
      });

      // Tentar fazer logout para limpar
      if (data.session) {
        await supabase.auth.signOut();
        console.log('🧹 Logout realizado');
      }
    }

  } catch (error) {
    console.error('❌ Erro na requisição:', error);
  }
}

debugSupabaseSignup();