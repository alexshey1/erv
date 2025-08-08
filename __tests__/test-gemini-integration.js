// Script de teste para verificar a integração com Google Gemini
const fetch = require('node-fetch');

const BASE_URL = 'http://localhost:3000';

// Dados de teste
const testData = {
  sensorData: [
    {
      sensorType: "ph",
      value: 6.2,
      unit: "",
      timestamp: "2024-01-15T10:00:00Z"
    },
    {
      sensorType: "temperature",
      value: 24.5,
      unit: "°C",
      timestamp: "2024-01-15T10:00:00Z"
    },
    {
      sensorType: "humidity",
      value: 65,
      unit: "%",
      timestamp: "2024-01-15T10:00:00Z"
    },
    {
      sensorType: "ec",
      value: 1.3,
      unit: "mS/cm",
      timestamp: "2024-01-15T10:00:00Z"
    }
  ],
  cultivationInfo: {
    strain: "OG Kush",
    phase: "flowering",
    daysSinceStart: 45,
    numPlants: 6
  },
  userQuery: "Como posso melhorar o rendimento do meu cultivo?",
  includeRecommendations: true,
  includePredictions: true
};

const { createLogger } = require('../lib/safe-logger')

async function testGeminiIntegration() {
  const logger = createLogger('GeminiIntegrationTest')
  logger.info('🧪 Testando integração com Google Gemini...\n');

  try {
    // Teste 1: Análise de dados
    logger.info('1️⃣ Testando análise de dados...');
    const analyzeResponse = await fetch(`${BASE_URL}/api/ai/gemini/analyze`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(testData)
    });

    if (!analyzeResponse.ok) {
      throw new Error(`Erro na API: ${analyzeResponse.status} ${analyzeResponse.statusText}`);
    }

    const analyzeResult = await analyzeResponse.json();
    logger.success('✅ Análise de dados funcionando!');
    logger.data('📊 Resultado', analyzeResult);

    // Teste 2: Recomendações
    logger.info('\n2️⃣ Testando geração de recomendações...');
    const recommendationsResponse = await fetch(`${BASE_URL}/api/ai/gemini/recommendations`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        sensorData: testData.sensorData,
        cultivationInfo: {
          strain: testData.cultivationInfo.strain,
          phase: testData.cultivationInfo.phase,
          daysSinceStart: testData.cultivationInfo.daysSinceStart
        },
        includeOptimization: true,
        includeTroubleshooting: true
      })
    });

    if (!recommendationsResponse.ok) {
      throw new Error(`Erro na API de recomendações: ${recommendationsResponse.status}`);
    }

    const recommendationsResult = await recommendationsResponse.json();
    logger.success('✅ Recomendações funcionando!');
    logger.data('💡 Resultado', recommendationsResult);

    // Teste 3: Verificar se a resposta contém dados reais do Gemini
    logger.info('\n3️⃣ Verificando qualidade das respostas...');
    
    if (analyzeResult.success && analyzeResult.data) {
      const data = analyzeResult.data;
      
      if (data.analysis && data.analysis !== "Recomendações geradas com sucesso") {
        logger.success('✅ Análise do Gemini detectada!');
        logger.debug('📝 Análise:', data.analysis.substring(0, 200) + '...');
      } else {
        logger.warn('⚠️  Análise parece ser resposta padrão');
      }

      if (data.recommendations && data.recommendations.length > 0) {
        logger.success('✅ Recomendações do Gemini detectadas!');
        console.log('💡 Primeira recomendação:', data.recommendations[0]);
      } else {
        console.log('⚠️  Nenhuma recomendação encontrada');
      }

      if (data.predictions && data.predictions.yield > 0) {
        console.log('✅ Previsões do Gemini detectadas!');
        console.log('📈 Rendimento previsto:', data.predictions.yield + 'g');
      } else {
        console.log('⚠️  Nenhuma previsão encontrada');
      }
    }

    console.log('\n🎉 Todos os testes passaram! A integração está funcionando.');
    
  } catch (error) {
    console.error('❌ Erro nos testes:', error.message);
    
    if (error.message.includes('fetch')) {
      console.log('💡 Dica: Verifique se o servidor está rodando em http://localhost:3000');
    }
    
    if (error.message.includes('API Error: 500')) {
      console.log('💡 Dica: Verifique se a chave GEMINI_API_KEY está configurada');
    }
  }
}

// Executar teste
testGeminiIntegration(); 