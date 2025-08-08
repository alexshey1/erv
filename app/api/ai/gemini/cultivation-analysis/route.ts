import { NextRequest, NextResponse } from 'next/server'
import { GeminiService } from '@/lib/gemini-service'

export async function POST(request: NextRequest) {
  try {
    console.log('🌱 Iniciando análise de cultivo via API route...')
    
    const apiKey = process.env.Chave_API_GEMINI
    if (!apiKey) {
      return NextResponse.json({ 
        error: 'Chave da API Gemini não configurada' 
      }, { status: 500 })
    }

    const body = await request.json()
    console.log('📦 Dados recebidos:', JSON.stringify(body, null, 2))

    const geminiService = new GeminiService(apiKey)
    const analysis = await geminiService.analyzeCultivationData(body)
    
    console.log('✅ Análise concluída com sucesso')
    return NextResponse.json(analysis)
    
  } catch (error) {
    console.error('❌ Erro na análise de cultivo:', error)
    return NextResponse.json({ 
      error: error instanceof Error ? error.message : 'Erro desconhecido',
      analysis: "Erro na análise dos dados",
      recommendations: ["Verifique a conexão com a IA"],
      anomalies: [],
      timestamp: new Date().toISOString()
    }, { status: 500 })
  }
}