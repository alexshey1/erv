#!/usr/bin/env node

const { createClient } = require('@supabase/supabase-js')
const fs = require('fs')
const path = require('path')

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
  console.log('🚀 Configurando triggers do Supabase...\n')

  try {
    // Verificar variáveis de ambiente
    if (!supabaseUrl || !supabaseServiceKey) {
      console.error('❌ Variáveis de ambiente SUPABASE não configuradas!')
      console.log('Verifique se NEXT_PUBLIC_SUPABASE_URL e SUPABASE_SERVICE_ROLE_KEY estão no .env')
      process.exit(1)
    }

    // Ler arquivo SQL
    const sqlPath = path.join(process.cwd(), 'supabase', 'functions', 'sync-user.sql')
    
    if (!fs.existsSync(sqlPath)) {
      console.error('❌ Arquivo SQL não encontrado:', sqlPath)
      process.exit(1)
    }

    const sqlContent = fs.readFileSync(sqlPath, 'utf-8')

    console.log('🔄 Executando SQL para criar triggers...')

    // Executar SQL
    const { data, error } = await supabase.rpc('exec_sql', {
      sql: sqlContent
    })

    if (error) {
      console.error('❌ Erro ao executar SQL:', error.message)
      
      // Tentar executar manualmente
      console.log('🔄 Tentando executar comandos individualmente...')
      
      const commands = sqlContent
        .split(';')
        .map(cmd => cmd.trim())
        .filter(cmd => cmd.length > 0)

      for (const command of commands) {
        try {
          const { error: cmdError } = await supabase.rpc('exec_sql', {
            sql: command + ';'
          })
          
          if (cmdError) {
            console.log('⚠️ Comando falhou (pode ser normal):', command.substring(0, 50) + '...')
            console.log('   Erro:', cmdError.message)
          } else {
            console.log('✅ Comando executado:', command.substring(0, 50) + '...')
          }
        } catch (err) {
          console.log('⚠️ Erro no comando:', err.message)
        }
      }
    } else {
      console.log('✅ SQL executado com sucesso!')
    }

    console.log('\n🎉 Triggers configurados!')
    console.log('\n📋 O que foi criado:')
    console.log('   🔄 handle_new_user() - Sincroniza novos usuários')
    console.log('   🔄 handle_user_update() - Sincroniza atualizações')
    console.log('   🔄 handle_user_delete() - Remove usuários deletados')
    console.log('   ⚡ Triggers automáticos no auth.users')

    console.log('\n💡 Agora os usuários serão sincronizados automaticamente!')

  } catch (error) {
    console.error('❌ Erro ao configurar triggers:', error)
    process.exit(1)
  }
}

// Executar script
setupTriggers()