const fetch = require('node-fetch');

async function testOpenRouterAPI() {
  console.log('🧪 Testando API OpenRouter...');
  
  try {
    const response = await fetch('http://localhost:3000/api/openrouter-visual-analysis', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        imageUrl: 'https://example.com/test.jpg',
        context: 'Teste de conexão'
      })
    });

    console.log('Status:', response.status);
    console.log('Headers:', response.headers.raw());
    
    const contentType = response.headers.get('content-type');
    console.log('Content-Type:', contentType);
    
    if (contentType && contentType.includes('application/json')) {
      const data = await response.json();
      console.log('Resposta JSON:', data);
    } else {
      const text = await response.text();
      console.log('Resposta HTML/Text:', text.substring(0, 500) + '...');
    }
    
  } catch (error) {
    console.error('❌ Erro no teste:', error);
  }
}

testOpenRouterAPI();