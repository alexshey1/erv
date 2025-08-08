// Script para debugar a integração com Google Gemini
const https = require('https');
const http = require('http');

const BASE_URL = 'http://localhost:3000';

// Função para fazer requisição HTTP
function makeRequest(url, options) {
  return new Promise((resolve, reject) => {
    const urlObj = new URL(url);
    const client = urlObj.protocol === 'https:' ? https : http;
    
    const req = client.request(urlObj, options, (res) => {
      let data = '';
      res.on('data', (chunk) => {
        data += chunk;
      });
      res.on('end', () => {
        try {
          const jsonData = JSON.parse(data);
          resolve({ status: res.statusCode, data: jsonData });
        } catch (error) {
          resolve({ status: res.statusCode, data: data });
        }
      });
    });

    req.on('error', (error) => {
      reject(error);
    });

    if (options.body) {
      req.write(options.body);
    }
    req.end();
  });
}

// Teste direto da API do Google Gemini
async function testDirectGeminiAPI() {
  console.log('🔍 Testando API do Google Gemini diretamente...\n');

  const geminiApiKey = 'AIzaSyDarLESrIbF76k4CcsRjPUlEFhukwIiAkA';
  const geminiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${geminiApiKey}`;

  const testPrompt = {
    contents: [
      {
        parts: [
          {
            text: "Responda apenas com 'OK' se você está funcionando."
          }
        ]
      }
    ]
  };

  try {
    const response = await makeRequest(geminiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(testPrompt)
    });

    console.log('📊 Status:', response.status);
    console.log('📊 Resposta:', JSON.stringify(response.data, null, 2));

    if (response.status === 200) {
      console.log('✅ API do Gemini está funcionando!');
    } else {
      console.log('❌ Erro na API do Gemini');
    }
  } catch (error) {
    console.error('❌ Erro ao testar API do Gemini:', error.message);
  }
}

// Teste da nossa API com logs detalhados
async function testOurAPI() {
  console.log('\n🔍 Testando nossa API com logs detalhados...\n');

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
      }
    ],
    cultivationInfo: {
      strain: "OG Kush",
      phase: "flowering",
      daysSinceStart: 45,
      numPlants: 6
    },
    userQuery: "Teste simples",
    includeRecommendations: true,
    includePredictions: true
  };

  try {
    const response = await makeRequest(`${BASE_URL}/api/ai/gemini/analyze`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(testData)
    });

    console.log('📊 Status:', response.status);
    console.log('📊 Resposta completa:', JSON.stringify(response.data, null, 2));

    if (response.status === 200 && response.data.success) {
      console.log('✅ Nossa API está funcionando!');
      
      if (response.data.data.analysis === "Erro na análise dos dados") {
        console.log('⚠️  Mas está retornando resposta de erro padrão');
        console.log('💡 Isso indica que há um erro na comunicação com o Gemini');
      } else {
        console.log('✅ E está retornando dados reais do Gemini!');
      }
    } else {
      console.log('❌ Erro na nossa API');
    }
  } catch (error) {
    console.error('❌ Erro ao testar nossa API:', error.message);
  }
}

// Executar testes
async function runTests() {
  await testDirectGeminiAPI();
  await testOurAPI();
  
  console.log('\n📋 Resumo:');
  console.log('1. Se o primeiro teste falhar, a chave API pode estar inválida');
  console.log('2. Se o segundo teste retornar "Erro na análise dos dados", há um problema na comunicação');
  console.log('3. Verifique os logs do servidor para mais detalhes');
}

runTests(); 