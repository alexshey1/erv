require('dotenv').config();

async function testQwenVision() {
  console.log('🧪 Testando modelo Qwen 2.5 VL 72B...');
  
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
        model: 'qwen/qwen2.5-vl-72b-instruct:free',
        messages: [
          {
            role: 'user',
            content: [
              {
                type: 'text',
                text: 'Analyze this cannabis trichome image and provide a JSON response with: {"analysis": "your detailed analysis", "canSeeImage": true/false}'
              },
              {
                type: 'image_url',
                image_url: {
                  url: 'https://i.ibb.co/FbHPZxm2/trichome-test-cultivation-123-1754067554998.png'
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

testQwenVision();
