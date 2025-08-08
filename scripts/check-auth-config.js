const { createClient } = require('@supabase/supabase-js');

require('dotenv').config();

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

async function checkAuthConfig() {
  console.log('🔍 Verificando configurações de autenticação...\n');

  try {
    // Tentar listar usuários (testa se service key funciona)
    console.log('1️⃣ Testando service key...');
    const { data: users, error: listError } = await supabase.auth.admin.listUsers();
    
    if (listError) {
      console.error('❌ Erro com service key:', listError.message);
      return;
    }
    
    console.log(`✅ Service key OK - ${users.users.length} usuários encontrados`);

    // Tentar criar usuário com admin API
    console.log('\n2️⃣ Testando criação via Admin API...');
    const testEmail = `admin-test-${Date.now()}@example.com`;
    
    const { data: newUser, error: createError } = await supabase.auth.admin.createUser({
      email: testEmail,
      password: 'AdminTest123!',
      email_confirm: true,
      user_metadata: {
        name: 'Admin Test User'
      }
    });

    if (createError) {
      console.error('❌ Erro na criação via Admin:', createError.message);
    } else {
      console.log('✅ Criação via Admin funcionou!');
      console.log('   ID:', newUser.user.id);
      
      // Limpar
      await supabase.auth.admin.deleteUser(newUser.user.id);
      console.log('🧹 Usuário de teste removido');
    }

    // Testar signup normal
    console.log('\n3️⃣ Testando signup normal...');
    const supabaseAnon = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);
    
    const testEmail2 = `normal-test-${Date.now()}@example.com`;
    const { data: signupData, error: signupError } = await supabaseAnon.auth.signUp({
      email: testEmail2,
      password: 'NormalTest123!',
      options: {
        data: {
          name: 'Normal Test User'
        }
      }
    });

    if (signupError) {
      console.error('❌ Erro no signup normal:', signupError.message);
      
      if (signupError.message.includes('email_provider_disabled')) {
        console.log('\n💡 SOLUÇÃO: Habilite o Email Provider em Authentication > Providers');
      }
      if (signupError.message.includes('signups_disabled')) {
        console.log('\n💡 SOLUÇÃO: Desabilite "Disable new user signups" em Authentication > Settings');
      }
    } else {
      console.log('✅ Signup normal funcionou!');
      console.log('   ID:', signupData.user?.id);
      
      // Limpar se possível
      if (signupData.user?.id) {
        await supabase.auth.admin.deleteUser(signupData.user.id);
        console.log('🧹 Usuário de teste removido');
      }
    }

  } catch (error) {
    console.error('❌ Erro geral:', error.message);
  }
}

checkAuthConfig();