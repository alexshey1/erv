#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

console.log('🚀 Configurando Supabase...\n');

// Verificar se .env existe
const envPath = path.join(process.cwd(), '.env');
if (!fs.existsSync(envPath)) {
  console.log('❌ Arquivo .env não encontrado!');
  console.log('📝 Copie .env.example para .env e preencha as variáveis do Supabase\n');
  
  // Copiar .env.example para .env
  const envExamplePath = path.join(process.cwd(), '.env.example');
  if (fs.existsSync(envExamplePath)) {
    fs.copyFileSync(envExamplePath, envPath);
    console.log('✅ Arquivo .env criado a partir do .env.example');
    console.log('📝 Agora edite o .env com suas credenciais do Supabase\n');
  }
  process.exit(1);
}

// Verificar se DATABASE_URL e DIRECT_URL estão configuradas
require('dotenv').config();
if (!process.env.DATABASE_URL || process.env.DATABASE_URL.includes('your-project')) {
  console.log('❌ DATABASE_URL não configurada no .env');
  console.log('📝 Configure a DATABASE_URL e DIRECT_URL do Supabase no arquivo .env\n');
  process.exit(1);
}

if (!process.env.DIRECT_URL || process.env.DIRECT_URL.includes('your-project')) {
  console.log('❌ DIRECT_URL não configurada no .env');
  console.log('📝 Configure a DIRECT_URL do Supabase no arquivo .env\n');
  console.log('💡 DIRECT_URL deve usar a porta 5432 (conexão direta)');
  console.log('💡 DATABASE_URL deve usar a porta 6543 (pooled connection)\n');
  process.exit(1);
}

try {
  console.log('1️⃣ Gerando cliente Prisma...');
  execSync('npx prisma generate', { stdio: 'inherit' });
  
  console.log('\n2️⃣ Fazendo push do schema para Supabase...');
  execSync('npx prisma db push', { stdio: 'inherit' });
  
  console.log('\n✅ Migração concluída com sucesso!');
  console.log('\n📋 Próximos passos:');
  console.log('1. Configure os templates de email no Supabase Dashboard');
  console.log('2. Adicione as URLs de redirect em Authentication > Settings');
  console.log('3. Teste o fluxo de reset de senha');
  console.log('\n🔗 Acesse: https://supabase.com/dashboard/project/SEU_PROJECT_ID/auth/settings');
  
} catch (error) {
  console.error('\n❌ Erro durante a migração:', error.message);
  console.log('\n🔧 Possíveis soluções:');
  console.log('- Verificar se DATABASE_URL e DIRECT_URL estão corretas');
  console.log('- DATABASE_URL deve usar porta 6543 (pooled)');
  console.log('- DIRECT_URL deve usar porta 5432 (direct)');
  console.log('- Verificar se o projeto Supabase está ativo');
  console.log('- Tentar: npx prisma db push --force-reset');
}