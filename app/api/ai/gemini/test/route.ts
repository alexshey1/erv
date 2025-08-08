import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    console.log('🧪 Testando API Gemini via route...')
    
    const apiKey = process.env.Chave_API_GEMINI
    if (!apiKey) {
      return NextResponse.json({ error: 'API Key não configurada' }, { status: 500 })
    }

    const baseUrl = "https://generativelanguage.googleapis.com/v1beta/models"
    
    const geminiRequest = {
      contents: [{
        parts: [{
          text: "Teste simples da API"
        }]
      }]
    }

    console.log('🔑 Usando API Key:', apiKey.substring(0, 10) + '...')
    console.log('🌐 URL:', `${baseUrl}/gemini-1.5-flash:generateContent`)

    const response = await fetch(`${baseUrl}/gemini-1.5-flash:generateContent?key=${apiKey}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify(geminiRequest)
    })

    console.log('📥 Status:', response.status)

    if (!response.ok) {
      const errorText = await response.text()
      console.error('❌ Erro na API:', errorText)
      return NextResponse.json({ error: errorText }, { status: response.status })
    }

    const data = await response.json()
    console.log('✅ Sucesso na API route')
    
    return NextResponse.json({ success: true, data })
    
  } catch (error) {
    console.error('❌ Erro na route:', error)
    return NextResponse.json({ 
      error: error instanceof Error ? error.message : 'Erro desconhecido' 
    }, { status: 500 })
  }
}