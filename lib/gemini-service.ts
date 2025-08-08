// Serviço para integração com Google Gemini AI

export interface GeminiRequest {
  contents: Array<{
    parts: Array<{
      text?: string
      inline_data?: {
        mime_type: string
        data: string
      }
    }>
  }>
}

export interface GeminiResponse {
  candidates: Array<{
    content: {
      parts: Array<{
        text: string
      }>
    }
  }>
}

export interface CultivationAnalysisRequest {
  sensorData: Array<{
    sensorType: string
    value: number
    unit: string
    timestamp: string
  }>
  cultivationInfo: {
    strain: string
    phase: string
    daysSinceStart: number
    numPlants: number
  }
  userQuery?: string
  includeRecommendations?: boolean
  includePredictions?: boolean
}

export interface CultivationAnalysisResponse {
  analysis: string
  recommendations: string[]
  anomalies: Array<{
    parameter: string
    severity: 'low' | 'medium' | 'high' | 'critical'
    description: string
    recommendation: string
  }>
  timestamp: string
}

export class GeminiService {
  private apiKey: string
  private baseUrl = "https://generativelanguage.googleapis.com/v1beta/models"

  constructor(apiKey: string) {
    if (!apiKey || apiKey.trim() === '') {
      throw new Error('Chave da API Gemini é obrigatória')
    }
    this.apiKey = apiKey.trim()
  }

  async analyzeCultivationData(request: CultivationAnalysisRequest): Promise<CultivationAnalysisResponse> {
    try {
      console.log('🤖 Iniciando análise com Gemini AI...')
      console.log('🔑 Usando API Key:', this.apiKey.substring(0, 10) + '...')
      
      const prompt = this.buildAnalysisPrompt(request)
      
      const geminiRequest: GeminiRequest = {
        contents: [{
          parts: [{
            text: prompt
          }]
        }]
      }

      console.log('📤 Enviando requisição para:', `${this.baseUrl}/gemini-1.5-flash:generateContent`)
      console.log('📦 Payload:', JSON.stringify(geminiRequest, null, 2))

      let response: Response
      try {
        response = await fetch(`${this.baseUrl}/gemini-1.5-flash:generateContent?key=${this.apiKey}`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json'
          },
          body: JSON.stringify(geminiRequest)
        })
        console.log('✅ Fetch executado com sucesso')
      } catch (fetchError: any) {
        console.error('❌ Erro no fetch:', fetchError)
        console.error('❌ Tipo do erro fetch:', fetchError.constructor?.name)
        console.error('❌ Mensagem do erro fetch:', fetchError.message)
        throw fetchError
      }

      console.log('📥 Status da resposta:', response.status)
      console.log('📥 Headers da resposta:', Object.fromEntries(response.headers.entries()))

      if (!response.ok) {
        const errorText = await response.text()
        console.error('❌ Erro na resposta da API:', errorText)
        throw new Error(`Erro na API Gemini: ${response.status} - ${errorText}`)
      }

      const data: GeminiResponse = await response.json()
      console.log('✅ Resposta recebida com sucesso')
      
      return this.parseAnalysisResponse(data, request)
    } catch (error) {
      console.error('❌ Erro na análise Gemini:', error)
      
      // Verificar se é erro de rede
      if (error instanceof TypeError && error.message.includes('fetch')) {
        return {
          analysis: "Erro de conexão com a API Gemini. Verifique sua conexão com a internet.",
          recommendations: ["Verifique a conexão com a internet", "Tente novamente em alguns minutos"],
          anomalies: [],
          timestamp: new Date().toISOString()
        }
      }
      
      // Verificar se é erro de API key
      if (error instanceof Error && error.message.includes('401')) {
        return {
          analysis: "Erro de autenticação com a API Gemini. Verifique a chave da API.",
          recommendations: ["Verifique se a chave da API Gemini está correta", "Confirme se a API está habilitada"],
          anomalies: [],
          timestamp: new Date().toISOString()
        }
      }
      
      return {
        analysis: `Erro na análise dos dados: ${error instanceof Error ? error.message : 'Erro desconhecido'}`,
        recommendations: ["Verifique a configuração da API Gemini", "Tente novamente mais tarde"],
        anomalies: [],
        timestamp: new Date().toISOString()
      }
    }
  }

  async analyzePlantHealth(
    imageData: string, 
    sensorData: Array<{sensorType: string, value: number, unit: string}>,
    cultivationPhase: string
  ): Promise<CultivationAnalysisResponse> {
    try {
      console.log('🌿 Analisando saúde da planta com imagem...')
      
      const prompt = this.buildImageAnalysisPrompt(sensorData, cultivationPhase)
      
      const geminiRequest: GeminiRequest = {
        contents: [{
          parts: [
            {
              text: prompt
            },
            {
              inline_data: {
                mime_type: "image/jpeg",
                data: imageData
              }
            }
          ]
        }]
      }

      const response = await fetch(`${this.baseUrl}/gemini-pro-vision:generateContent?key=${this.apiKey}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(geminiRequest)
      })

      if (!response.ok) {
        throw new Error(`Erro na API Gemini Vision: ${response.status}`)
      }

      const data: GeminiResponse = await response.json()
      
      return this.parseImageAnalysisResponse(data, sensorData)
    } catch (error) {
      console.error('❌ Erro na análise visual:', error)
      return {
        analysis: "Erro na análise visual da planta",
        recommendations: ["Verifique a qualidade da imagem"],
        anomalies: [],
        timestamp: new Date().toISOString()
      }
    }
  }

  async generateRecommendations(
    sensorData: Array<{sensorType: string, value: number, unit: string}>,
    cultivationInfo: {strain: string, phase: string, daysSinceStart: number}
  ): Promise<string[]> {
    try {
      console.log('💡 Gerando recomendações específicas...')
      
      const prompt = this.buildRecommendationsPrompt(sensorData, cultivationInfo)
      
      const geminiRequest: GeminiRequest = {
        contents: [{
          parts: [{
            text: prompt
          }]
        }]
      }

      const response = await fetch(`${this.baseUrl}/gemini-1.5-flash:generateContent?key=${this.apiKey}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(geminiRequest)
      })

      if (!response.ok) {
        throw new Error(`Erro na API Gemini: ${response.status}`)
      }

      const data: GeminiResponse = await response.json()
      
      return this.parseRecommendationsResponse(data)
    } catch (error) {
      console.error('❌ Erro ao gerar recomendações:', error)
      return ["Verifique os dados dos sensores para gerar recomendações"]
    }
  }

  async chatCompletion(prompt: string): Promise<string> {
    try {
      console.log('💬 Iniciando chat completion com Gemini...')
      
      const geminiRequest = {
        contents: [{ parts: [{ text: prompt }] }]
      }
      
      const response = await fetch(`${this.baseUrl}/gemini-1.5-flash:generateContent?key=${this.apiKey}`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify(geminiRequest)
      })
      
      if (!response.ok) {
        const errorText = await response.text()
        console.error('❌ Erro na API Gemini (chat):', errorText)
        throw new Error(`Erro na API Gemini: ${response.status} - ${errorText}`)
      }
      
      const data = await response.json()
      return data.candidates?.[0]?.content?.parts?.[0]?.text || 'Sem resposta da IA.'
    } catch (error) {
      console.error('❌ Erro no chat completion:', error)
      throw error
    }
  }

  private buildAnalysisPrompt(request: CultivationAnalysisRequest): string {
    const sensorDataText = request.sensorData.map(data => 
      `- ${data.sensorType}: ${data.value} ${data.unit} (${data.timestamp})`
    ).join('\n')

    return `Você é um especialista em agronomia e cultivo de cannabis com mais de 15 anos de experiência. Sua tarefa é gerar um RELATÓRIO TÉCNICO PROFISSIONAL detalhado baseado nos dados fornecidos.

=== RELATÓRIO TÉCNICO DE ANÁLISE DE CULTIVO ===

INFORMAÇÕES TÉCNICAS DO CULTIVO:
- Strain: ${request.cultivationInfo.strain}
- Fase Atual: ${request.cultivationInfo.phase}
- Dias desde o Início: ${request.cultivationInfo.daysSinceStart}
- População: ${request.cultivationInfo.numPlants} plantas
- Data da Análise: ${new Date().toISOString()}

DADOS AMBIENTAIS COLETADOS:
${sensorDataText}

=== PARÂMETROS TÉCNICOS DE REFERÊNCIA ===

FASE VEGETATIVA (Dias 1-60):
- Temperatura Ideal: 24-30°C (ótimo para fotossíntese e crescimento celular)
- Umidade Relativa: 60-70% (promove desenvolvimento radicular)
- pH do Substrato: 5.8-6.2 (ótima disponibilidade de nutrientes)
- Condutividade Elétrica (EC): 1.0-1.6 mS/cm (nutrição balanceada)

FASE DE FLORAÇÃO (Dias 61-120):
- Temperatura Ideal: 24-30°C (preserva terpenos e canabinoides)
- Umidade Relativa: 40-50% (previne Botrytis cinerea e mofo)
- pH do Substrato: 5.8-6.2 (absorção otimizada de P e K)
- Condutividade Elétrica (EC): 1.6-2.2 mS/cm (nutrição de floração)

LIMITES CRÍTICOS DE SEGURANÇA:
- Temperatura Máxima: 31°C (acima diminui 15-20% da potência do THC)
- Temperatura Mínima: 15.5°C (abaixo reduz metabolismo e produção)
- Umidade Máxima Floração: 70% (risco crítico de mofo)
- pH Crítico: <5.5 ou >7.0 (bloqueio nutricional)

=== METODOLOGIA DE ANÁLISE ===

1. ANÁLISE COMPARATIVA:
   - Comparação com parâmetros ideais para a fase atual
   - Cálculo de desvios percentuais
   - Identificação de tendências temporais

2. CLASSIFICAÇÃO DE SEVERIDADE:
   - BAIXA: Desvio ≤10% do ideal (monitoramento)
   - MÉDIA: Desvio 10-25% do ideal (ajustes menores)
   - ALTA: Desvio 25-40% do ideal (correções urgentes)
   - CRÍTICA: Desvio >40% do ideal (ação imediata)

3. ANÁLISE DE CORRELAÇÕES:
   - Interação entre parâmetros
   - Efeitos cascata de desvios
   - Impacto no rendimento final

=== REQUISITOS DO RELATÓRIO ===

Gere um relatório técnico profissional que inclua:

1. RESUMO EXECUTIVO: Visão geral da saúde do cultivo
2. ANÁLISE DETALHADA: Interpretação técnica dos dados
3. IDENTIFICAÇÃO DE DESVIOS: Problemas detectados com classificação
4. RECOMENDAÇÕES TÉCNICAS: Ações específicas e mensuráveis
5. PROGNÓSTICO: Impacto esperado das correções

=== FORMATO DE RESPOSTA ===

Responda APENAS com um objeto JSON válido, sem texto adicional. O JSON deve ter exatamente esta estrutura:

{
  "analysis": "RELATÓRIO TÉCNICO DETALHADO: [Incluir análise técnica completa com terminologia agronômica, interpretação de dados, identificação de padrões, correlações entre parâmetros, impacto na fisiologia da planta, e prognóstico baseado em evidências científicas]",
  "recommendations": [
    "RECOMENDAÇÃO TÉCNICA 1: [Ação específica com valores-alvo e justificativa técnica]",
    "RECOMENDAÇÃO TÉCNICA 2: [Ação específica com valores-alvo e justificativa técnica]",
    "RECOMENDAÇÃO TÉCNICA 3: [Ação específica com valores-alvo e justificativa técnica]"
  ],
  "anomalies": [
    {
      "parameter": "humidity",
      "severity": "critical",
      "description": "ALERTA: Umidade 75% está 50% acima do ideal (40-50%) para floração. Risco elevado de Botrytis cinerea e redução de 20-30% no rendimento final.",
      "recommendation": "AJUSTE: Reduzir umidade para 45% (±2%) através de aumento da ventilação e/ou desumidificador. Monitorar a cada 2 horas."
    },
    {
      "parameter": "temperature",
      "severity": "low",
      "description": "ALERTA: Temperatura 26°C está dentro do ideal (24-30°C) para floração. Condições ótimas para desenvolvimento de terpenos.",
      "recommendation": "AJUSTE: Manter temperatura atual. Monitoramento contínuo recomendado."
    }
  ]
}

IMPORTANTE: Use terminologia técnica agronômica, seja específico com valores e justificativas científicas. O relatório deve ser de nível profissional para agrônomos e técnicos especializados.

Responda APENAS o JSON, nada mais.`
  }

  private buildImageAnalysisPrompt(
    sensorData: Array<{sensorType: string, value: number, unit: string}>,
    cultivationPhase: string
  ): string {
    return `
    Analise esta imagem de planta de cannabis junto com os dados dos sensores.

    FASE DO CULTIVO: ${cultivationPhase}

    DADOS DOS SENSORES:
    ${sensorData.map(data => 
      `- ${data.sensorType}: ${data.value} ${data.unit}`
    ).join('\n')}

    Identifique e analise:
    1. Sinais visuais de saúde da planta
    2. Possíveis problemas (deficiências, excessos, pragas)
    3. Correlação entre dados dos sensores e aparência visual
    4. Recomendações específicas para otimização

    Forneça a análise em formato JSON com:
    - "analysis": Análise visual detalhada
    - "recommendations": Array de recomendações
    - "predictions": Previsões baseadas na saúde visual
    - "anomalies": Desvios detectados visualmente

    Responda APENAS em JSON válido, sem texto adicional.
    `
  }

  private buildRecommendationsPrompt(
    sensorData: Array<{sensorType: string, value: number, unit: string}>,
    cultivationInfo: {strain: string, phase: string, daysSinceStart: number}
  ): string {
    return `Você é um especialista em agronomia e cultivo de cannabis com mais de 15 anos de experiência. Sua tarefa é gerar RECOMENDAÇÕES TÉCNICAS PROFISSIONAIS baseadas nos dados fornecidos.

=== RELATÓRIO DE RECOMENDAÇÕES TÉCNICAS ===

INFORMAÇÕES TÉCNICAS DO CULTIVO:
- Strain: ${cultivationInfo.strain}
- Fase Atual: ${cultivationInfo.phase}
- Dias desde o Início: ${cultivationInfo.daysSinceStart}
- Data da Análise: ${new Date().toISOString()}

=== PARÂMETROS TÉCNICOS DE REFERÊNCIA ===

FASE VEGETATIVA (Dias 1-60):
- Temperatura Ideal: 24-30°C (ótimo para fotossíntese e crescimento celular)
- Umidade Relativa: 60-70% (promove desenvolvimento radicular)
- pH do Substrato: 5.8-6.2 (ótima disponibilidade de nutrientes)
- Condutividade Elétrica (EC): 1.0-1.4 mS/cm (nutrição balanceada)

FASE DE FLORAÇÃO (Dias 61-120):
- Temperatura Ideal: 24-30°C (preserva terpenos e canabinoides)
- Umidade Relativa: 40-50% (previne Botrytis cinerea e mofo)
- pH do Substrato: 5.8-6.2 (absorção otimizada de P e K)
- Condutividade Elétrica (EC): 1.6-2.2 mS/cm (nutrição de floração)

LIMITES CRÍTICOS DE SEGURANÇA:
- Temperatura Máxima: 31°C (acima diminui 15-20% da potência do THC)
- Temperatura Mínima: 15.5°C (abaixo reduz metabolismo e produção)
- Umidade Máxima Floração: 70% (risco crítico de mofo)
- pH Crítico: <5.5 ou >7.0 (bloqueio nutricional)

DADOS AMBIENTAIS ATUAIS:
${sensorData.map(data => 
  `- ${data.sensorType}: ${data.value} ${data.unit}`
).join('\n')}

=== METODOLOGIA DE ANÁLISE ===

1. ANÁLISE COMPARATIVA:
   - Comparação com parâmetros ideais para a fase atual
   - Cálculo de desvios percentuais
   - Identificação de tendências temporais

2. CLASSIFICAÇÃO DE PRIORIDADE:
   - BAIXA: Desvio ≤10% do ideal (monitoramento)
   - MÉDIA: Desvio 10-25% do ideal (ajustes menores)
   - ALTA: Desvio 25-40% do ideal (correções urgentes)
   - CRÍTICA: Desvio >40% do ideal (ação imediata)

3. ANÁLISE DE CORRELAÇÕES:
   - Interação entre parâmetros
   - Efeitos cascata de desvios
   - Impacto no rendimento final

=== REQUISITOS DAS RECOMENDAÇÕES ===

Gere recomendações técnicas profissionais que incluam:

1. AÇÕES ESPECÍFICAS: Comandos claros e mensuráveis
2. VALORES-ALVO: Parâmetros específicos a serem atingidos
3. JUSTIFICATIVA TÉCNICA: Base científica para cada recomendação
4. PRIORIZAÇÃO: Ordem de importância baseada na severidade
5. MONITORAMENTO: Como verificar a eficácia das ações

=== FORMATO DE RESPOSTA ===

Responda APENAS com um array JSON válido, sem texto adicional. O array deve conter 5-8 recomendações técnicas específicas e acionáveis.

Exemplo de resposta:
[
  "URGENTE - UMIDADE: Reduzir umidade para 45% (±2%) imediatamente. Valor atual 75% está 50% acima do ideal para floração. Risco crítico de Botrytis cinerea. Ação: Aumentar ventilação e/ou instalar desumidificador. Monitorar a cada 2 horas.",
  "TEMPERATURA - ADEQUADA: Manter temperatura atual de 26°C. Dentro do ideal (24-30°C) para floração. Condições ótimas para desenvolvimento de terpenos. Ação: Monitoramento contínuo.",
  "pH - MONITORAMENTO: Verificar pH diariamente e manter entre 5.8-6.2. Valor atual 6.2 está adequado. Ação: Medir pH da solução nutritiva antes de cada rega.",
  "EC - AJUSTE: Ajustar condutividade elétrica para 1.6-2.2 mS/cm na floração. Valor atual 1.4 está abaixo do ideal. Ação: Aumentar concentração de nutrientes gradualmente.",
  "VENTILAÇÃO - VERIFICAÇÃO: Verificar sistema de ventilação para controlar umidade. Ação: Limpar filtros e verificar funcionamento dos ventiladores."
]

IMPORTANTE: Use terminologia técnica agronômica, seja específico com valores e justificativas científicas. As recomendações devem ser de nível profissional para agrônomos e técnicos especializados.

Responda APENAS o array JSON, nada mais.`
  }

  private parseAnalysisResponse(data: GeminiResponse, request: CultivationAnalysisRequest): CultivationAnalysisResponse {
    try {
      console.log('🔍 Resposta bruta do Gemini:', JSON.stringify(data, null, 2));
      
      if (!data.candidates || data.candidates.length === 0) {
        console.error('❌ Nenhum candidato encontrado na resposta do Gemini');
        throw new Error('Resposta inválida do Gemini');
      }

      const responseText = data.candidates[0].content.parts[0].text;
      console.log('📝 Texto da resposta:', responseText);
      
      // Limpar e tentar fazer parse do JSON
      let parsed;
      let cleanedText = responseText.trim();
      
      // Remover possíveis caracteres extras no início
      if (cleanedText.startsWith('```json')) {
        cleanedText = cleanedText.replace('```json', '').replace('```', '').trim();
      }
      if (cleanedText.startsWith('```')) {
        cleanedText = cleanedText.replace(/```/g, '').trim();
      }
      
      console.log('🧹 Texto limpo:', cleanedText);
      
      try {
        parsed = JSON.parse(cleanedText);
        console.log('✅ Parse JSON bem-sucedido:', JSON.stringify(parsed, null, 2));
      } catch (parseError) {
        console.error('❌ Erro ao fazer parse do JSON:', parseError);
        console.log('📝 Tentando extrair JSON do texto...');
        
        // Tentar extrair JSON do texto se houver
        const jsonMatch = cleanedText.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          try {
            parsed = JSON.parse(jsonMatch[0]);
            console.log('✅ JSON extraído com sucesso:', JSON.stringify(parsed, null, 2));
          } catch (extractError) {
            console.error('❌ Erro ao extrair JSON:', extractError);
            console.log('📝 Tentando criar resposta padrão...');
            
            // Criar resposta padrão baseada no texto
            parsed = this.createDefaultResponse(cleanedText);
          }
        } else {
          console.log('📝 Nenhum JSON encontrado, criando resposta padrão...');
          parsed = this.createDefaultResponse(cleanedText);
        }
      }
      
      return {
        analysis: parsed.analysis || "Análise não disponível",
        recommendations: parsed.recommendations || [],
        anomalies: parsed.anomalies || [],
        timestamp: new Date().toISOString()
      }
    } catch (error) {
      console.error("❌ Erro ao fazer parse da resposta Gemini:", error);
      console.log("📝 Resposta que causou erro:", JSON.stringify(data, null, 2));
      
      return {
        analysis: "Erro na análise dos dados",
        recommendations: ["Verifique os dados dos sensores"],
        anomalies: [],
        timestamp: new Date().toISOString()
      }
    }
  }

  private parseImageAnalysisResponse(data: GeminiResponse, sensorData: Array<{sensorType: string, value: number, unit: string}>): CultivationAnalysisResponse {
    try {
      const responseText = data.candidates[0].content.parts[0].text
      const parsed = JSON.parse(responseText)
      
      return {
        analysis: parsed.analysis || "Análise visual não disponível",
        recommendations: parsed.recommendations || [],
        anomalies: parsed.anomalies || [],
        timestamp: new Date().toISOString()
      }
    } catch (error) {
      console.error("❌ Erro ao fazer parse da análise visual:", error)
      return {
        analysis: "Erro na análise visual",
        recommendations: ["Verifique a qualidade da imagem"],
        anomalies: [],
        timestamp: new Date().toISOString()
      }
    }
  }

  private parseRecommendationsResponse(data: GeminiResponse): string[] {
    try {
      console.log('🔍 Resposta bruta do Gemini (recomendações):', JSON.stringify(data, null, 2));
      
      if (!data.candidates || data.candidates.length === 0) {
        throw new Error('Resposta inválida do Gemini');
      }

      const responseText = data.candidates[0].content.parts[0].text;
      console.log('📝 Texto da resposta (recomendações):', responseText);
      
      // Tentar fazer parse do JSON
      let parsed;
      let cleanedText = responseText.trim();
      
      // Remover possíveis caracteres extras
      if (cleanedText.startsWith('```json')) {
        cleanedText = cleanedText.replace('```json', '').replace('```', '').trim();
      }
      if (cleanedText.startsWith('```')) {
        cleanedText = cleanedText.replace(/```/g, '').trim();
      }
      
      try {
        parsed = JSON.parse(cleanedText);
        console.log('✅ Parse JSON bem-sucedido (recomendações):', JSON.stringify(parsed, null, 2));
      } catch (parseError) {
        console.error('❌ Erro ao fazer parse do JSON (recomendações):', parseError);
        console.log('📝 Tentando extrair JSON do texto...');
        
        // Tentar extrair JSON do texto se houver
        const jsonMatch = responseText.match(/\[[\s\S]*\]/);
        if (jsonMatch) {
          try {
            parsed = JSON.parse(jsonMatch[0]);
            console.log('✅ JSON extraído com sucesso (recomendações):', JSON.stringify(parsed, null, 2));
          } catch (extractError) {
            console.error('❌ Erro ao extrair JSON (recomendações):', extractError);
            throw new Error('Não foi possível extrair JSON válido da resposta');
          }
        } else {
          throw new Error('Nenhum JSON encontrado na resposta');
        }
      }
      
      return Array.isArray(parsed) ? parsed : [];
    } catch (error) {
      console.error("❌ Erro ao fazer parse das recomendações:", error);
      console.log("📝 Resposta que causou erro:", JSON.stringify(data, null, 2));
      return ["Verifique os dados dos sensores para gerar recomendações"];
    }
  }

  // Criar resposta padrão quando o JSON não pode ser parseado
  private createDefaultResponse(text: string): any {
    console.log('📝 Criando resposta padrão baseada no texto:', text);
    
    // Tentar extrair informações do texto
    const analysis = text.includes('análise') || text.includes('analysis') 
      ? text.substring(0, 200) + '...' 
      : 'Análise baseada nos dados fornecidos';
    
    const recommendations: string[] = [];
    const anomalies: Array<{
      parameter: string;
      severity: 'low' | 'medium' | 'high' | 'critical';
      description: string;
      recommendation: string;
    }> = [];
    
    // Extrair recomendações do texto
    const recMatches = text.match(/recomenda[çc][ãa]o[:\s]+([^.\n]+)/gi);
    if (recMatches) {
      recommendations.push(...recMatches.map(match => match.replace(/recomenda[çc][ãa]o[:\s]+/i, '').trim()));
    }
    
    // Extrair desvios do texto
    const deviationMatches = text.match(/desvio[:\s]+([^.\n]+)/gi);
    if (deviationMatches) {
      deviationMatches.forEach(match => {
        const description = match.replace(/desvio[:\s]+/i, '').trim();
        anomalies.push({
          parameter: 'unknown',
          severity: 'medium',
          description,
          recommendation: 'Verificar parâmetros'
        });
      });
    }
    
    return {
      analysis,
      recommendations: recommendations.length > 0 ? recommendations : ['Monitorar parâmetros'],
      anomalies
    };
  }
} 