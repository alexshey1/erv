require('dotenv').config();

async function testLlamaVision() {
  console.log('🧪 Testando modelo Llama 3.2 11B Vision...');
  
  try {
    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.OPENTOUTER_API_KEY_TRICHO}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': 'https://ervapp.com',
        'X-Title': 'ErvaApp - Test'
      },
      body: JSON.stringify({
        model: 'meta-llama/llama-3.2-11b-vision-instruct:free',
        messages: [
          {
            role: 'user',
            content: [
              {
                type: 'text',
                text: 'Analyze this cannabis trichome image and provide a JSON response with trichome counts and maturity analysis.'
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
        max_tokens: 500,
        temperature: 0.3
      })
    });
    
    console.log('📡 Status:', response.status);
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ Erro:', errorText);
      return;
    }
    
    const result = await response.json();
    console.log('✅ Resposta:', JSON.stringify(result, null, 2));
    
    if (result.choices && result.choices[0]) {
      console.log('📝 Conteúdo:', result.choices[0].message.content);
    }
    
  } catch (error) {
    console.error('❌ Erro:', error.message);
  }
}

testLlamaVision();
