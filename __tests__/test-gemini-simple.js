// Teste simples da API do Gemini
const API_KEY = 'AIzaSyDarLESrIbF76k4CcsRjPUlEFhukwIiAkA'
const BASE_URL = 'https://generativelanguage.googleapis.com/v1beta/models'

const { createLogger } = require('../lib/safe-logger')

async function testGeminiAPI() {
  const logger = createLogger('GeminiAPITest')
  logger.info('🧪 Testando API do Gemini...\n')
  
  const testData = {
    contents: [{
      parts: [{
        text: "Responda apenas com 'OK' se você está funcionando."
      }]
    }]
  }

  try {
    const response = await fetch(`${BASE_URL}/gemini-1.5-flash:generateContent?key=${API_KEY}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(testData)
    })

    logger.info('📊 Status:', response.status)
    
    if (response.ok) {
      const data = await response.json()
      logger.success('✅ API funcionando!')
      logger.data('📝 Resposta', data)
      return { success: true, data }
    } else {
      logger.error('❌ Erro na API:', response.status, response.statusText)
      const errorText = await response.text()
      logger.debug('📝 Detalhes do erro:', errorText)
      return { success: false, error: `${response.status}: ${response.statusText}` }
    }
  } catch (error) {
    logger.error('❌ Erro de rede:', error.message)
    return { success: false, error: error.message }
  }
}

testGeminiAPI() 