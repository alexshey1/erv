const { createClient } = require('@supabase/supabase-js');

require('dotenv').config();

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

console.log('🔍 Testando configuração do Supabase...\n');

console.log('📋 Variáveis de ambiente:');
console.log('   SUPABASE_URL:', supabaseUrl ? '✅ Definida' : '❌ Não definida');
console.log('   ANON_KEY:', supabaseAnonKey ? '✅ Definida' : '❌ Não definida');
console.log('   SERVICE_KEY:', supabaseServiceKey ? '✅ Definida' : '❌ Não definida');

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('\n❌ Configuração incompleta do Supabase!');
  process.exit(1);
}

async function testSupabaseAuth() {
  try {
    console.log('\n🧪 Testando cliente Supabase com chave anônima...');
    
    const supabaseAnon = createClient(supabaseUrl, supabaseAnonKey);
    
    // Testar se conseguimos acessar o Supabase
    const { data, error } = await supabaseAnon.auth.getSession();
    
    if (error) {
      console.error('❌ Erro ao acessar sessão:', error.message);
    } else {
      console.log('✅ Cliente Supabase funcionando');
    }

    // Testar com service role se disponível
    if (supabaseServiceKey) {
      console.log('\n🧪 Testando cliente Supabase com service role...');
      
      const supabaseService = createClient(supabaseUrl, supabaseServiceKey, {
        auth: {
          autoRefreshToken: false,
          persistSession: false
        }
      });

      // Testar listagem de usuários (só funciona com service role)
      const { data: users, error: usersError } = await supabaseService.auth.admin.listUsers();
      
      if (usersError) {
        console.error('❌ Erro ao listar usuários:', usersError.message);
      } else {
        console.log('✅ Service role funcionando');
        console.log(`   Usuários encontrados: ${users.users.length}`);
      }
    }

    console.log('\n🎉 Teste de configuração concluído!');

  } catch (error) {
    console.error('❌ Erro durante o teste:', error.message);
  }
}

testSupabaseAuth();