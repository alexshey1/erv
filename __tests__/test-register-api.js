const fetch = require('node-fetch');

require('dotenv').config();

const API_URL = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';

async function testRegisterAPI() {
  console.log('🧪 Testando API de registro...\n');

  const testUser = {
    email: `test-${Date.now()}@example.com`,
    password: 'TestPassword123!',
    name: 'Usuário Teste API'
  };

  console.log('📝 Dados do teste:', testUser);

  try {
    console.log(`\n🔄 Fazendo requisição para: ${API_URL}/api/auth/supabase/register`);
    
    const response = await fetch(`${API_URL}/api/auth/supabase/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(testUser),
    });

    console.log('📊 Status da resposta:', response.status);
    console.log('📊 Headers da resposta:', Object.fromEntries(response.headers.entries()));

    const result = await response.json();
    
    if (response.ok) {
      console.log('✅ Registro bem-sucedido!');
      console.log('📋 Resposta:', result);
    } else {
      console.log('❌ Erro no registro:');
      console.log('📋 Resposta:', result);
    }

  } catch (error) {
    console.error('❌ Erro na requisição:', error.message);
  }
}

testRegisterAPI();