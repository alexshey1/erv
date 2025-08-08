// Teste específico para análise de anomalias
const API_KEY = 'AIzaSyDarLESrIbF76k4CcsRjPUlEFhukwIiAkA'
const BASE_URL = 'https://generativelanguage.googleapis.com/v1beta/models'

async function testAnomalyAnalysis() {
  console.log('🧪 Testando análise de anomalias...\n')
  
  const testData = {
    contents: [{
      parts: [{
        text: `Analise os dados de cultivo de cannabis fornecidos e identifique anomalias, padrões e forneça recomendações específicas.

INFORMAÇÕES DO CULTIVO:
- Strain: OG Kush
- Fase: flowering
- Dias desde o início: 45
- Número de plantas: 6

DADOS DOS SENSORES:
- temperature: 26.5 °C (2024-01-15T10:00:00Z)
- humidity: 65 % (2024-01-15T10:00:00Z)
- ph: 6.2  (2024-01-15T10:00:00Z)
- ec: 1.4 mS/cm (2024-01-15T10:00:00Z)

PARÂMETROS IDEAIS POR FASE:

FASE VEGETATIVA:
- Temperatura: 24-30°C (ideal para crescimento vigoroso)
- Umidade: 60-70%
- pH: 6.0-6.5
- EC: 1.0-1.4 mS/cm

FASE DE FLORAÇÃO:
- Temperatura: 24-30°C (mantém potência do THC)
- Umidade: 40-50% (evitar mofo)
- pH: 6.0-6.5
- EC: 1.4-1.8 mS/cm

LIMITES CRÍTICOS:
- Temperatura máxima: 31°C (acima diminui potência do THC)
- Temperatura mínima: 15.5°C (abaixo diminui potência do THC)

ANÁLISE REQUERIDA:
1. Compare cada valor com os parâmetros ideais para a fase atual
2. Identifique valores fora do ideal com base nos parâmetros confiáveis:
   - Temperatura: 24-30°C (ambas as fases) / Limite crítico: 15.5-31°C
   - Umidade: 60-70% (vegetativa) / 40-50% (floração)
   - pH: 6.0-6.5 (ambas as fases)
   - EC: 1.0-1.4 mS/cm (vegetativa) / 1.4-1.8 mS/cm (floração)

3. CLASSIFIQUE A PRIORIDADE BASEADA NO DESVIO PERCENTUAL:
   - Baixa: Desvio até 10% do ideal
   - Média: Desvio de 10-25% do ideal
   - Alta: Desvio de 25-40% do ideal
   - Crítica: Desvio acima de 40% do ideal

4. Forneça recomendações específicas para corrigir problemas
5. Considere que umidade acima de 70% na floração pode causar mofo
6. Considere que temperatura acima de 31°C diminui a potência do THC
7. Considere que temperatura abaixo de 15.5°C diminui a potência do THC
8. Foque apenas em anomalias baseadas em parâmetros confiáveis e mensuráveis

IMPORTANTE: Responda APENAS com um objeto JSON válido, sem texto adicional, sem explicações, sem markdown. O JSON deve ter exatamente esta estrutura:

{
  "analysis": "Análise detalhada dos dados e padrões detectados",
  "recommendations": [
    "Recomendação específica 1",
    "Recomendação específica 2",
    "Recomendação específica 3"
  ],
  "anomalies": [
    {
      "parameter": "humidity",
      "severity": "critical",
      "description": "Umidade 75% está 50% acima do ideal (40-50%) para floração",
      "recommendation": "Reduzir umidade para 45% imediatamente para evitar mofo"
    },
    {
      "parameter": "temperature",
      "severity": "low",
      "description": "Temperatura 26°C está dentro do ideal (24-30°C) para floração",
      "recommendation": "Temperatura adequada, manter monitoramento"
    }
  ]
}

Responda APENAS o JSON, nada mais.`
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

    console.log('📊 Status:', response.status)
    
    if (response.ok) {
      const data = await response.json()
      console.log('✅ Análise funcionando!')
      console.log('📝 Resposta:', JSON.stringify(data, null, 2))
      
      if (data.candidates && data.candidates[0] && data.candidates[0].content) {
        const text = data.candidates[0].content.parts[0].text
        console.log('\n📄 Texto da resposta:')
        console.log(text)
        
        // Tentar fazer parse do JSON
        try {
          const cleanedText = text.trim().replace(/```json/g, '').replace(/```/g, '').trim()
          const parsed = JSON.parse(cleanedText)
          console.log('\n✅ JSON parseado com sucesso:')
          console.log(JSON.stringify(parsed, null, 2))
        } catch (parseError) {
          console.log('\n❌ Erro ao fazer parse do JSON:', parseError.message)
        }
      }
    } else {
      console.log('❌ Erro na API:', response.status, response.statusText)
      const errorText = await response.text()
      console.log('📝 Detalhes do erro:', errorText)
    }
  } catch (error) {
    console.error('❌ Erro de rede:', error.message)
  }
}

testAnomalyAnalysis() 