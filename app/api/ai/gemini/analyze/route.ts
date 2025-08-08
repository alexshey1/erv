import { NextRequest, NextResponse } from 'next/server'
import { GeminiService, CultivationAnalysisRequest } from '@/lib/gemini-service'
import { z } from 'zod'

// Schema de validação para a requisição
const analyzeRequestSchema = z.object({
  sensorData: z.array(z.object({
    sensorType: z.string(),
    value: z.number(),
    unit: z.string(),
    timestamp: z.string()
  })),
  cultivationInfo: z.object({
    strain: z.string(),
    phase: z.string(),
    daysSinceStart: z.number(),
    numPlants: z.number()
  }),
  userQuery: z.string().optional(),
  includeRecommendations: z.boolean().optional(),
  includePredictions: z.boolean().optional()
})

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    // Validar dados de entrada
    const validatedData = analyzeRequestSchema.parse(body)
    
    // Obter chave API do Gemini
    const geminiApiKey = process.env.Chave_API_GEMINI
    
    if (!geminiApiKey) {
      return NextResponse.json(
        { error: 'Chave API do Gemini não configurada' },
        { status: 500 }
      )
    }

    // Criar instância do serviço Gemini
    const geminiService = new GeminiService(geminiApiKey)
    
    // Preparar dados para análise
    const analysisRequest: CultivationAnalysisRequest = {
      sensorData: validatedData.sensorData.map(sensor => ({
        sensorType: sensor.sensorType,
        value: sensor.value,
        unit: sensor.unit,
        timestamp: sensor.timestamp
      })),
      cultivationInfo: {
        strain: validatedData.cultivationInfo.strain,
        phase: validatedData.cultivationInfo.phase,
        daysSinceStart: validatedData.cultivationInfo.daysSinceStart,
        numPlants: validatedData.cultivationInfo.numPlants
      },
      userQuery: validatedData.userQuery,
      includeRecommendations: validatedData.includeRecommendations,
      includePredictions: validatedData.includePredictions
    }

    // Executar análise
    const analysis = await geminiService.analyzeCultivationData(analysisRequest)
    
    return NextResponse.json({
      success: true,
      data: analysis,
      timestamp: new Date().toISOString()
    })

  } catch (error) {
    console.error('Erro na análise Gemini:', error)
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { 
          error: 'Dados de entrada inválidos',
          details: error.errors 
        },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { 
        error: 'Erro interno do servidor',
        message: error instanceof Error ? error.message : 'Erro desconhecido'
      },
      { status: 500 }
    )
  }
} 