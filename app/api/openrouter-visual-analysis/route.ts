import { NextRequest, NextResponse } from "next/server";
import OpenAI from 'openai';

export async function POST(req: NextRequest) {
  try {
    console.log("=== Iniciando análise visual ===");
    
    let body;
    try {
      body = await req.json();
      console.log("Body recebido:", body);
    } catch (parseError) {
      console.error("Erro ao fazer parse do body:", parseError);
      return NextResponse.json({ error: "Dados inválidos enviados." }, { status: 400 });
    }
    
    const { imageUrl, context } = body;
    console.log("Recebido para análise:", imageUrl);
    
    if (!imageUrl) {
      console.error("URL da imagem não enviada");
      return NextResponse.json({ error: "URL da imagem não enviada." }, { status: 400 });
    }

    const apiKey = process.env.OPENROUTER_API_KEY;
    if (!apiKey) {
      console.error("OPENROUTER_API_KEY não configurada no ambiente do servidor!");
      return NextResponse.json({ error: "Configuração da API não encontrada." }, { status: 500 });
    }

    console.log("API Key configurada, iniciando chamada para OpenRouter...");

    // Inicializar cliente OpenAI com OpenRouter
    const openai = new OpenAI({
      baseURL: "https://openrouter.ai/api/v1",
      apiKey: apiKey,
      defaultHeaders: {
        "HTTP-Referer": "https://erv.app",
        "X-Title": "ERV Plant Visual Analysis",
      },
    });

    // Construir o prompt com contexto adicional
    const prompt = context 
      ? `Você é uma especialista em cannabis, manejo, nutrição, pragas e doenças como fungos entre outros. Analise visualmente esta planta de cannabis.

IMPORTANTE: Responda APENAS em formato JSON válido com esta estrutura exata:
{
  "analysis": "descrição detalhada da análise visual da planta",
  "recommendations": ["recomendação 1", "recomendação 2", "recomendação 3"],
  "anomalies": [{"parameter": "nome do problema", "description": "descrição do problema"}]
}

Contexto adicional fornecido:
${context}

Identifique sinais de saúde, deficiências nutricionais, pragas, doenças e forneça recomendações detalhadas. Responda APENAS o JSON, sem texto adicional.`
      : `Você é uma especialista em cannabis, manejo, nutrição, pragas e doenças comofungos entre outros. Analise visualmente esta planta de cannabis.

IMPORTANTE: Responda APENAS em formato JSON válido com esta estrutura exata:
{
  "analysis": "descrição detalhada da análise visual da planta",
  "recommendations": ["recomendação 1", "recomendação 2", "recomendação 3"],
  "anomalies": [{"parameter": "nome do problema", "description": "descrição do problema"}]
}

Identifique sinais de saúde, deficiências nutricionais, pragas, doenças e forneça recomendações detalhadas. Responda APENAS o JSON, sem texto adicional.`;

    // Fazer chamada usando cliente OpenAI
    console.log("Fazendo chamada para o modelo:");
    const completion = await openai.chat.completions.create({
      model: "google/gemini-2.5-flash-lite", 
      messages: [
        {
          role: "user",
          content: [
            {
              type: "text",
              text: prompt
            },
            {
              type: "image_url",
              image_url: {
                url: imageUrl
              }
            }
          ]
        }
      ],
      max_tokens: 2500,
      temperature: 0.3 // Menor temperatura para respostas mais consistentes
    });
    
    console.log("Resposta recebida do modelo");
    const content = completion.choices[0]?.message?.content;
    if (!content || typeof content !== "string") {
      console.error("Conteúdo da resposta do modelo ausente ou em formato inesperado:", content);
      return NextResponse.json({ error: "Resposta do modelo vazia ou inválida." }, { status: 500 });
    }

    console.log("Conteúdo bruto recebido:", content);

    let result = null;
    try {
      // Primeiro, tenta extrair JSON da resposta
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        result = JSON.parse(jsonMatch[0]);
        console.log("JSON extraído com sucesso:", result);
      } else {
        // Se não encontrar JSON, cria uma estrutura padrão com o texto
        console.log("Nenhum JSON encontrado, criando estrutura padrão");
        result = {
          analysis: content.trim(),
          recommendations: [
            "Baseado na análise da imagem, revise as condições de cultivo",
            "Monitore a planta regularmente para mudanças",
            "Consulte um especialista se os sintomas persistirem"
          ],
          anomalies: []
        };
      }
      
      // Valida se a estrutura tem os campos necessários
      if (!result.analysis) {
        result.analysis = content.trim();
      }
      if (!result.recommendations || !Array.isArray(result.recommendations)) {
        result.recommendations = ["Revise as condições gerais de cultivo"];
      }
      if (!result.anomalies) {
        result.anomalies = [];
      }
      
    } catch (e) {
      console.error("Erro ao interpretar resposta do modelo:", e, content);
      // Cria uma resposta de fallback
      result = {
        analysis: content.trim() || "Análise visual completada. Revise a imagem fornecida.",
        recommendations: [
          "Monitore a saúde geral da planta",
          "Verifique condições de iluminação e irrigação",
          "Observe sinais de pragas ou doenças"
        ],
        anomalies: []
      };
    }

    return NextResponse.json({ result });
  } catch (error: any) {
    console.error("=== Erro na análise visual ===");
    console.error("Tipo do erro:", typeof error);
    console.error("Erro completo:", error);
    console.error("Stack trace:", error.stack);
    
    // Garantir que sempre retornamos JSON
    const errorMessage = error?.message || error?.toString() || "Erro interno do servidor.";
    return NextResponse.json({ 
      error: errorMessage,
      details: process.env.NODE_ENV === 'development' ? error.stack : undefined
    }, { status: 500 });
  }
}

