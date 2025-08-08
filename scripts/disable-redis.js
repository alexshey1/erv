const fs = require('fs');
const path = require('path');

console.log('🔧 Desabilitando Redis devido a problemas de permissão...\n');

// Verificar se existe arquivo .env
const envFile = path.join(__dirname, '..', '.env');
if (fs.existsSync(envFile)) {
  console.log('✅ Arquivo .env encontrado');
  
  let envContent = fs.readFileSync(envFile, 'utf8');
  
  // Verificar se já existe a configuração para desabilitar Redis
  if (envContent.includes('DISABLE_REDIS=true')) {
    console.log('✅ Redis já está desabilitado via DISABLE_REDIS=true');
  } else {
    // Adicionar configuração para desabilitar Redis
    envContent += '\n# Desabilitar Redis devido a problemas de permissão\nDISABLE_REDIS=true\n';
    
    fs.writeFileSync(envFile, envContent);
    console.log('✅ Adicionado DISABLE_REDIS=true ao .env');
  }
  
  // Verificar variáveis do Upstash
  const upstashVars = [
    'UPSTASH_REDIS_REST_URL',
    'UPSTASH_REDIS_REST_TOKEN'
  ];
  
  console.log('\n📋 Status das variáveis do Upstash:');
  upstashVars.forEach(varName => {
    if (envContent.includes(varName)) {
      console.log(`✅ ${varName} está definida`);
    } else {
      console.log(`❌ ${varName} NÃO está definida`);
    }
  });
  
} else {
  console.log('❌ Arquivo .env não encontrado');
}

console.log('\n🔧 Soluções para problemas de Redis:');
console.log('1. Verifique as permissões do usuário no Upstash');
console.log('2. Configure as variáveis UPSTASH_REDIS_REST_URL e UPSTASH_REDIS_REST_TOKEN');
console.log('3. Ou use apenas o rate limiting in-memory (já configurado)');

console.log('\n📝 Para reabilitar o Redis posteriormente:');
console.log('1. Remova DISABLE_REDIS=true do arquivo .env');
console.log('2. Configure as permissões corretas no Upstash');
console.log('3. Reinicie a aplicação');

console.log('\n🚀 A aplicação agora usará apenas rate limiting in-memory');
console.log('Isso deve resolver os problemas de performance e carregamento'); 