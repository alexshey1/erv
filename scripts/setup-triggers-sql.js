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
  console.log('🚀 Configurando triggers via SQL direto...\n')

  const sqlCommands = [
    // 1. Função para novos usuários
    `
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
    `,
    
    // 2. Trigger para novos usuários
    `
    DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
    CREATE TRIGGER on_auth_user_created
      AFTER INSERT ON auth.users
      FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
    `,
    
    // 3. Função para atualizações
    `
    CREATE OR REPLACE FUNCTION public.handle_user_update()
    RETURNS TRIGGER AS $$
    BEGIN
      UPDATE public.users SET
        email = NEW.email,
        name = COALESCE(NEW.raw_user_meta_data->>'name', users.name),
        avatar = COALESCE(NEW.raw_user_meta_data->>'avatar_url', users.avatar),
        updated_at = NOW()
      WHERE id = NEW.id;
      
      RETURN NEW;
    END;
    $$ LANGUAGE plpgsql SECURITY DEFINER;
    `,
    
    // 4. Trigger para atualizações
    `
    DROP TRIGGER IF EXISTS on_auth_user_updated ON auth.users;
    CREATE TRIGGER on_auth_user_updated
      AFTER UPDATE ON auth.users
      FOR EACH ROW EXECUTE FUNCTION public.handle_user_update();
    `
  ]

  for (let i = 0; i < sqlCommands.length; i++) {
    const sql = sqlCommands[i].trim()
    console.log(`🔄 Executando comando ${i + 1}/${sqlCommands.length}...`)
    
    try {
      const { error } = await supabase.rpc('query', { query: sql })
      
      if (error) {
        console.log(`⚠️ Erro no comando ${i + 1}:`, error.message)
      } else {
        console.log(`✅ Comando ${i + 1} executado com sucesso`)
      }
    } catch (err) {
      console.log(`⚠️ Erro no comando ${i + 1}:`, err.message)
    }
  }

  console.log('\n🎉 Configuração concluída!')
  console.log('💡 Execute: npm run test:triggers para testar')
}

setupTriggers()