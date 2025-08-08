// Teste simples da API Gemini
const testGeminiAPI = async () => {
  const apiKey = 'AIzaSyDarLESrIbF76k4CcsRjPUlEFhukwIiAkA'
  const baseUrl = "https://generativelanguage.googleapis.com/v1beta/models"
  
  const geminiRequest = {
    contents: [{
      parts: [{
        text: "Olá, você está funcionando?"
      }]
    }]
  }

  try {
    console.log('🔑 Testando API Key:', apiKey.substring(0, 10) + '...')
    console.log('🌐 URL:', `${baseUrl}/gemini-1.5-flash:generateContent?key=${apiKey}`)
    
    const response = await fetch(`${baseUrl}/gemini-1.5-flash:generateContent?key=${apiKey}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify(geminiRequest)
    })

    console.log('📥 Status:', response.status)
    console.log('📥 Status Text:', response.statusText)
    console.log('📥 Headers:', Object.fromEntries(response.headers.entries()))

    if (!response.ok) {
      const errorText = await response.text()
      console.error('❌ Erro na resposta:', errorText)
      return
    }

    const data = await response.json()
    console.log('✅ Resposta:', JSON.stringify(data, null, 2))
    
  } catch (error) {
    console.error('❌ Erro no teste:', error)
    console.error('❌ Tipo do erro:', error.constructor.name)
    console.error('❌ Mensagem:', error.message)
  }
}

testGeminiAPI()