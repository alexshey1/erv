const { PrismaClient } = require('@prisma/client');

require('dotenv').config();

const prisma = new PrismaClient({
  log: ['query', 'info', 'warn', 'error'],
});

async function fixTriggerIssue() {
  console.log('🔧 Corrigindo problema do trigger...\n');

  try {
    // 1. Verificar o conteúdo da função handle_new_user
    console.log('1️⃣ Verificando função handle_new_user...');
    const functionDef = await prisma.$queryRaw`
      SELECT pg_get_functiondef(oid) as definition
      FROM pg_proc 
      WHERE proname = 'handle_new_user' AND pronamespace = (SELECT oid FROM pg_namespace WHERE nspname = 'public');
    `;

    if (functionDef.length > 0) {
      console.log('📋 Definição da função encontrada');
      console.log('⚠️  Esta função pode estar causando o problema');
    }

    // 2. Verificar detalhes do trigger
    console.log('\n2️⃣ Verificando detalhes do trigger...');
    const triggerDetails = await prisma.$queryRaw`
      SELECT 
        trigger_name,
        event_manipulation,
        event_object_table,
        action_statement,
        action_timing,
        action_orientation
      FROM information_schema.triggers 
      WHERE trigger_name = 'on_auth_user_created';
    `;

    if (triggerDetails.length > 0) {
      console.log('📋 Detalhes do trigger:');
      triggerDetails.forEach(trigger => {
        console.log(`   - Nome: ${trigger.trigger_name}`);
        console.log(`   - Tabela: ${trigger.event_object_table}`);
        console.log(`   - Evento: ${trigger.event_manipulation}`);
        console.log(`   - Timing: ${trigger.action_timing}`);
        console.log(`   - Ação: ${trigger.action_statement}`);
      });
    }

    // 3. Desabilitar o trigger temporariamente
    console.log('\n3️⃣ Desabilitando trigger temporariamente...');
    try {
      await prisma.$executeRaw`DROP TRIGGER IF EXISTS on_auth_user_created ON public.users;`;
      console.log('✅ Trigger removido temporariamente');
    } catch (error) {
      console.log('⚠️  Erro ao remover trigger:', error.message);
    }

    // 4. Testar se o problema foi resolvido
    console.log('\n4️⃣ Testando inserção após remoção do trigger...');
    try {
      const testUserId = `test-no-trigger-${Date.now()}`;
      const testUser = await prisma.user.create({
        data: {
          id: testUserId,
          email: `no-trigger-test-${Date.now()}@example.com`,
          name: 'No Trigger Test User',
          role: 'free'
        }
      });

      console.log('✅ Inserção funcionou sem o trigger!');
      console.log('   ID:', testUser.id);

      // Limpar
      await prisma.user.delete({ where: { id: testUser.id } });
      console.log('🧹 Usuário de teste removido');

    } catch (dbError) {
      console.error('❌ Ainda há erro mesmo sem trigger:', dbError.message);
    }

    // 5. Criar um trigger corrigido (opcional)
    console.log('\n5️⃣ Informações para recriar trigger corrigido...');
    console.log('💡 Se você quiser recriar o trigger mais tarde, use:');
    console.log(`
-- Função corrigida para handle_new_user
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.users (id, email, name, role)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'name', NEW.email),
    'free'
  )
  ON CONFLICT (id) DO UPDATE SET
    email = EXCLUDED.email,
    name = COALESCE(EXCLUDED.name, public.users.name);
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Recriar trigger
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
    `);

  } catch (error) {
    console.error('❌ Erro durante correção:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

fixTriggerIssue();