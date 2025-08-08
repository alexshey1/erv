// Teste das variáveis de ambiente
const fs = require('fs')
const path = require('path')

console.log('🔍 Testando arquivo .env...\n')

try {
  const envPath = path.join(__dirname, '..', '.env')
  if (fs.existsSync(envPath)) {
    console.log('✅ Arquivo .env encontrado')
    const envContent = fs.readFileSync(envPath, 'utf8')
    console.log('📝 Conteúdo do .env:')
    console.log(envContent)
  } else {
    console.log('❌ Arquivo .env não encontrado')
  }
} catch (error) {
  console.log('❌ Erro ao ler .env:', error.message)
} 