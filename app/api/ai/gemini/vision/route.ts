import { NextRequest, NextResponse } from 'next/server'
import { GeminiService } from '@/lib/gemini-service'
import { z } from 'zod'

// Schema de validação para análise de imagem
const visionRequestSchema = z.object({
  imageData: z.string(), // Base64 da imagem
  sensorData: z.array(z.object({
    sensorType: z.string(),
    value: z.number(),
    unit: z.string()
  })),
  cultivationPhase: z.string(),
  cultivationInfo: z.object({
    strain: z.string(),
    daysSinceStart: z.number()
  }).optional()
})

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    // Validar dados de entrada
    const validatedData = visionRequestSchema.parse(body)
    
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
    
    // Executar análise de imagem
    const analysis = await geminiService.analyzePlantHealth(
      validatedData.imageData,
      validatedData.sensorData.map(sensor => ({
        sensorType: sensor.sensorType,
        value: sensor.value,
        unit: sensor.unit
      })),
      validatedData.cultivationPhase
    )
    
    return NextResponse.json({
      success: true,
      data: analysis,
      timestamp: new Date().toISOString()
    })

  } catch (error) {
    console.error('Erro na análise visual Gemini:', error)
    
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