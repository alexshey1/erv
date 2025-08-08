const fs = require('fs');
const path = require('path');

console.log('🔍 Verificando configurações que podem causar ChunkLoadError...\n');

// Verificar se as variáveis de ambiente estão definidas
const envFile = path.join(__dirname, '..', '.env');
if (fs.existsSync(envFile)) {
  console.log('✅ Arquivo .env encontrado');
  const envContent = fs.readFileSync(envFile, 'utf8');
  
  const requiredVars = [
    'NEXT_PUBLIC_SUPABASE_URL',
    'NEXT_PUBLIC_SUPABASE_ANON_KEY'
  ];
  
  requiredVars.forEach(varName => {
    if (envContent.includes(varName)) {
      console.log(`✅ ${varName} está definida`);
    } else {
      console.log(`❌ ${varName} NÃO está definida`);
    }
  });
} else {
  console.log('❌ Arquivo .env não encontrado');
}

// Verificar configuração do Next.js
const nextConfigPath = path.join(__dirname, '..', 'next.config.mjs');
if (fs.existsSync(nextConfigPath)) {
  console.log('\n✅ next.config.mjs encontrado');
} else {
  console.log('\n❌ next.config.mjs não encontrado');
}

// Verificar se o diretório .next existe
const nextDir = path.join(__dirname, '..', '.next');
if (fs.existsSync(nextDir)) {
  console.log('✅ Diretório .next existe');
  
  // Verificar chunks
  const staticDir = path.join(nextDir, 'static', 'chunks');
  if (fs.existsSync(staticDir)) {
    console.log('✅ Diretório de chunks existe');
    
    try {
      const chunks = fs.readdirSync(staticDir);
      console.log(`📁 Encontrados ${chunks.length} itens no diretório chunks`);
      
      // Verificar chunks específicos
      const appChunks = chunks.filter(chunk => chunk.includes('app'));
      console.log(`📱 Chunks da aplicação: ${appChunks.length}`);
      
      if (appChunks.length > 0) {
        appChunks.forEach(chunk => {
          const chunkPath = path.join(staticDir, chunk);
          const stats = fs.statSync(chunkPath);
          
          if (stats.isDirectory()) {
            try {
              const files = fs.readdirSync(chunkPath);
              console.log(`  - ${chunk} (diretório): ${files.length} arquivos`);
            } catch (error) {
              console.log(`  - ${chunk} (diretório): erro ao ler - ${error.message}`);
            }
          } else {
            console.log(`  - ${chunk} (arquivo): ${stats.size} bytes`);
          }
        });
      }
    } catch (error) {
      console.log('❌ Erro ao ler chunks:', error.message);
    }
  } else {
    console.log('❌ Diretório de chunks não existe');
  }
} else {
  console.log('❌ Diretório .next não existe - execute npm run build primeiro');
}

// Verificar package.json
const packageJsonPath = path.join(__dirname, '..', 'package.json');
if (fs.existsSync(packageJsonPath)) {
  const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
  console.log('\n📦 Informações do package.json:');
  console.log(`  - Next.js: ${packageJson.dependencies?.next || 'não encontrado'}`);
  console.log(`  - React: ${packageJson.dependencies?.react || 'não encontrado'}`);
  console.log(`  - Supabase: ${packageJson.dependencies?.['@supabase/supabase-js'] || 'não encontrado'}`);
}

console.log('\n🔧 Recomendações para resolver ChunkLoadError:');
console.log('1. Limpe o cache: Remove-Item -Recurse -Force .next');
console.log('2. Reconstrua: npm run build');
console.log('3. Inicie o servidor: npm run dev');
console.log('4. Verifique se todas as variáveis de ambiente estão definidas');
console.log('5. Teste em modo de desenvolvimento');
console.log('6. Verifique a conexão com a internet');
console.log('7. Tente em uma aba anônima do navegador');
console.log('8. Limpe o cache do navegador');

console.log('\n🚀 Para testar a aplicação:');
console.log('npm run dev');
console.log('\n🌐 URLs de teste:');
console.log('http://localhost:3000/simple-test');
console.log('http://localhost:3000/test-layout');
console.log('http://localhost:3000/test-auth'); 