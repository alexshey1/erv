require('dotenv').config();

async function testGeminiOpenRouter() {
  console.log('🧪 Testando modelo Gemini 2.0 Flash no OpenRouter...');
  
  // Verificar se a API key existe
  if (!process.env.OPENTOUTER_API_KEY_TRICHO) {
    console.error('❌ OPENTOUTER_API_KEY_TRICHO não encontrada no .env');
    return;
  }
  
  console.log('✅ API Key encontrada');
  
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
        model: 'moonshotai/kimi-vl-a3b-thinking:free',
        messages: [
          {
            role: 'user',
            content: [
              {
                type: 'text',
                text: 'Analise esta imagem e me diga o que você vê. Responda em JSON com: {"description": "sua análise", "canSeeImage": true/false}'
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
    
    console.log('📡 Status da resposta:', response.status);
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ Erro na API:', errorText);
      return;
    }
    
    const result = await response.json();
    console.log('✅ Resposta completa:', JSON.stringify(result, null, 2));
    
    if (result.choices && result.choices[0] && result.choices[0].message) {
      console.log('📝 Conteúdo da resposta:', result.choices[0].message.content);
      
      // Tentar parse do JSON
      try {
        const parsed = JSON.parse(result.choices[0].message.content);
        console.log('🎯 JSON parseado:', parsed);
        
        if (parsed.canSeeImage) {
          console.log('🎉 SUCESSO: O modelo consegue ver e analisar imagens!');
        } else {
          console.log('⚠️ O modelo não conseguiu ver a imagem');
        }
      } catch (parseError) {
        console.log('⚠️ Resposta não é JSON válido, mas modelo respondeu:', result.choices[0].message.content);
      }
    }
    
  } catch (error) {
    console.error('❌ Erro no teste:', error.message);
  }
}

testGeminiOpenRouter();
