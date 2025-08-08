// Teste rápido da API OpenRouter
require('dotenv').config();

async function testOpenRouter() {
  console.log('🧪 Testando OpenRouter API...\n');

  try {
    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.OPENTOUTER_API_KEY_TRICHO}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000',
        'X-Title': 'ErvaBot - Test'
      },
      body: JSON.stringify({
        model: 'mistralai/mistral-small-3.2-24b-instruct:free',
        messages: [
          {
            role: 'user',
            content: 'Hello, can you analyze images?'
          }
        ],
        max_tokens: 50
      })
    });

    console.log('Status:', response.status);
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ Erro:', errorText);
      return;
    }

    const result = await response.json();
    console.log('✅ Resposta:', JSON.stringify(result, null, 2));
    
    // Teste com imagem
    console.log('\n🖼️ Testando com imagem...');
    
    const imageResponse = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.OPENTOUTER_API_KEY_TRICHO}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000',
        'X-Title': 'ErvaBot - Image Test'
      },
      body: JSON.stringify({
        model: 'mistralai/mistral-small-3.2-24b-instruct:free',
        messages: [
          {
            role: 'user',
            content: [
              {
                type: 'text',
                text: 'What is in this image?'
              },
              {
                type: 'image_url',
                image_url: {
                  url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/d/dd/Gfp-wisconsin-madison-the-nature-boardwalk.jpg/2560px-Gfp-wisconsin-madison-the-nature-boardwalk.jpg'
                }
              }
            ]
          }
        ],
        max_tokens: 100
      })
    });

    console.log('Image Status:', imageResponse.status);
    
    if (!imageResponse.ok) {
      const errorText = await imageResponse.text();
      console.error('❌ Erro com imagem:', errorText);
      
      console.log('\n🔄 Testando modelos alternativos...');
      console.log('Modelos que suportam visão:');
      console.log('- google/gemini-flash-1.5');
      console.log('- anthropic/claude-3-haiku');
      console.log('- openai/gpt-4o-mini');
      return;
    }

    const imageResult = await imageResponse.json();
    console.log('✅ Resposta com imagem:', JSON.stringify(imageResult, null, 2));

  } catch (error) {
    console.error('❌ Erro no teste:', error.message);
  }
}

testOpenRouter();
