const { PrismaClient } = require('@prisma/client');

require('dotenv').config();

const prisma = new PrismaClient();

async function checkAuthTriggers() {
  console.log('🔍 Verificando triggers no schema auth...\n');

  try {
    // Verificar triggers no schema auth
    const authTriggers = await prisma.$queryRaw`
      SELECT 
        trigger_name,
        event_manipulation,
        event_object_table,
        action_statement,
        action_timing
      FROM information_schema.triggers 
      WHERE event_object_schema = 'auth'
      ORDER BY event_object_table, trigger_name;
    `;
    
    if (authTriggers.length > 0) {
      console.log(`⚠️  Encontrados ${authTriggers.length} triggers no schema auth:`);
      authTriggers.forEach(trigger => {
        console.log(`   - ${trigger.trigger_name} em auth.${trigger.event_object_table} (${trigger.event_manipulation})`);
        console.log(`     Ação: ${trigger.action_statement}`);
      });
      
      // Tentar remover triggers problemáticos
      console.log('\n🔧 Tentando remover triggers problemáticos...');
      for (const trigger of authTriggers) {
        if (trigger.trigger_name.includes('user') || trigger.action_statement.includes('handle_new_user')) {
          try {
            await prisma.$executeRaw`DROP TRIGGER IF EXISTS ${trigger.trigger_name} ON auth.${trigger.event_object_table};`;
            console.log(`✅ Trigger ${trigger.trigger_name} removido`);
          } catch (error) {
            console.log(`❌ Erro ao remover ${trigger.trigger_name}:`, error.message);
          }
        }
      }
    } else {
      console.log('✅ Nenhum trigger encontrado no schema auth');
    }

    // Verificar se ainda há a função handle_new_user
    console.log('\n🔍 Verificando função handle_new_user...');
    try {
      await prisma.$executeRaw`DROP FUNCTION IF EXISTS public.handle_new_user();`;
      console.log('✅ Função handle_new_user removida');
    } catch (error) {
      console.log('⚠️  Erro ao remover função:', error.message);
    }

    // Testar signup novamente
    console.log('\n🧪 Testando signup após limpeza...');
    const { createClient } = require('@supabase/supabase-js');
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    );

    const testEmail = `clean-test-${Date.now()}@example.com`;
    const { data, error } = await supabase.auth.signUp({
      email: testEmail,
      password: 'CleanTest123!',
      options: {
        data: {
          name: 'Clean Test User'
        }
      }
    });

    if (error) {
      console.error('❌ Ainda há erro:', error.message);
      
      // Se ainda há erro, pode ser configuração do Supabase
      console.log('\n💡 Últimas opções:');
      console.log('   1. Verificar se Email Provider está habilitado');
      console.log('   2. Verificar se "Disable new user signups" está desabilitado');
      console.log('   3. Considerar recriar o projeto Supabase');
    } else {
      console.log('🎉 SUCESSO! Signup funcionou!');
      console.log('📋 Dados:', {
        user_id: data.user?.id,
        email: data.user?.email,
        confirmed: data.user?.email_confirmed_at ? 'Sim' : 'Não'
      });
    }

  } catch (error) {
    console.error('❌ Erro durante verificação:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

checkAuthTriggers();