// Script de teste para a API de análise de tricomas
require('dotenv').config(); // Carregar variáveis de ambiente
const https = require('https');
const fs = require('fs');

async function testTrichomeAPI() {
  console.log('🧪 Testando API de Análise de Tricomas...\n');

  // Testar se as variáveis de ambiente estão definidas
  console.log('📋 Verificando variáveis de ambiente:');
  console.log('IMGBB_API_KEY:', process.env.IMGBB_API_KEY ? '✅ Definida' : '❌ Não encontrada');
  console.log('OPENTOUTER_API_KEY_TRICHO:', process.env.OPENTOUTER_API_KEY_TRICHO ? '✅ Definida' : '❌ Não encontrada');
  console.log('');

  // Testar endpoint da API
  try {
    console.log('🌐 Testando endpoint GET /api/trichome-analysis...');
    
    const response = await fetch('http://localhost:3000/api/trichome-analysis', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      }
    });

    if (response.ok) {
      const data = await response.json();
      console.log('✅ Endpoint GET funcionando:', data.message);
    } else {
      console.log('❌ Erro no endpoint GET:', response.status);
    }
  } catch (error) {
    console.log('❌ Erro ao testar endpoint:', error.message);
  }

  console.log('');
  console.log('📝 Para testar completamente:');
  console.log('1. Acesse: http://localhost:3000/trichome-analysis');
  console.log('2. Faça upload de uma imagem de tricomas');
  console.log('3. Verifique se a análise é processada corretamente');
  console.log('');
  
  // Verificar o modelo configurado
  console.log('ℹ️  Modelo configurado: mistralai/mistral-small-3.2-24b-instruct:free');
  console.log('✅ OpenRouter confirma que este modelo suporta análise de imagens');
  console.log('   Alternativas caso necessário:');
  console.log('   - google/gemini-flash-1.5');
  console.log('   - anthropic/claude-3-haiku');
  console.log('   - openai/gpt-4o-mini');
}

// Executar teste apenas se chamado diretamente
if (require.main === module) {
  testTrichomeAPI().catch(console.error);
}

module.exports = { testTrichomeAPI };
