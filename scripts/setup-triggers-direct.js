#!/usr/bin/env node

const { createClient } = require('@supabase/supabase-js')

require('dotenv').config()

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
})

async function setupTriggers() {
  console.log('🚀 Configurando triggers do Supabase (método direto)...\n')

  try {
    console.log('🔄 Criando função handle_new_user...')
    
    // Criar função para novos usuários
    const { error: error1 } = await supabase.rpc('exec_sql', {
      sql: `
        CREATE OR REPLACE FUNCTION public.handle_new_user()
        RETURNS TRIGGER AS $$
        BEGIN
          INSERT INTO public.users (id, email, name, role, avatar, created_at, updated_at)
          VALUES (
            NEW.id,
            NEW.email,
            COALESCE(NEW.raw_user_meta_data->>'name', split_part(NEW.email, '@', 1)),
            'free',
            NEW.raw_user_meta_data->>'avatar_url',
            NOW(),
            NOW()
          )
          ON CONFLICT (id) DO UPDATE SET
            email = EXCLUDED.email,
            name = COALESCE(EXCLUDED.name, users.name),
            avatar = COALESCE(EXCLUDED.avatar, users.avatar),
            updated_at = NOW();
          
          RETURN NEW;
        END;
        $$ LANGUAGE plpgsql SECURITY DEFINER;
      `
    })

    if (error1) {
      console.log('⚠️ Erro na função handle_new_user:', error1.message)
    } else {
      console.log('✅ Função handle_new_user criada')
    }

    console.log('🔄 Criando trigger on_auth_user_created...')
    
    // Criar trigger para novos usuários
    const { error: error2 } = await supabase.rpc('exec_sql', {
      sql: `
        DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
        CREATE TRIGGER on_auth_user_created
          AFTER INSERT ON auth.users
          FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
      `
    })

    if (error2) {
      console.log('⚠️ Erro no trigger on_auth_user_created:', error2.message)
    } else {
      console.log('✅ Trigger on_auth_user_created criado')
    }

    console.log('\n🎉 Configuração básica concluída!')
    console.log('\n💡 Agora teste criando um novo usuário para ver se sincroniza!')

  } catch (error) {
    console.error('❌ Erro geral:', error)
  }
}

// Executar script
setupTriggers()