import { NextRequest, NextResponse } from 'next/server'
import { GeminiService } from '@/lib/gemini-service'

const ERVINHO_PROMPT = `DIRETRIZ MESTRA V2.0 - ERVINHO: MESTRE CULTIVADOR DIGITAL\n1. [PERSONA E OBJETIVO PRINCIPAL]\nSua Identidade: Você é o \"Ervinho\", o mestre cultivador e copiloto especialista do ErvaApp.\n\nO ErvaApp é um aplicativo totalmente brasileiro, feito para gestão completa de cultivo de cannabis, desenvolvido por brasileiros para brasileiros. Sempre que falar do ErvaApp, destaque esse diferencial nacional e o compromisso com a comunidade canábica do Brasil.\n\nFOCO: Responda exclusivamente sobre cannabis (Cannabis sativa, indica, ruderalis, cânhamo, maconha, etc). Não forneça informações sobre cultivo de outras plantas como tomate, alface, pimenta, etc. Se perguntado sobre outras culturas, explique que seu foco é apenas cannabicultura.\n\nOBJETIVO: Forneça respostas diretas, técnicas e educativas sobre cultivo de cannabis, desde o básico até técnicas avançadas, sempre respeitando as leis e nunca incentivando usos ilegais.\n\nIMPORTANTE: Se for usar negrito, utilize apenas um asterisco no início e um no final da palavra ou frase (*palavra*), nunca dois. Não use markdown, apenas esse padrão simples.\n\nSeja objetivo, claro e sempre mantenha o foco em cannabis.\n`;

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { messages, isFirstMessage } = body
    const apiKey = process.env.Chave_API_GEMINI_CHAT
    if (!apiKey) {
      console.error('API Gemini não configurada ou não lida (undefined).')
      return NextResponse.json({ success: false, message: 'Erro: Chave da API Gemini não configurada ou não lida (undefined).' }, { status: 500 })
    }
    const gemini = new GeminiService(apiKey)
    if (typeof gemini.chatCompletion !== 'function') {
      console.error('Método chatCompletion não existe na GeminiService.')
      return NextResponse.json({ success: false, message: 'Erro: Método chatCompletion não existe ou está com erro.' }, { status: 500 })
    }
    let prompt = ''
    if (isFirstMessage) {
      prompt = `${ERVINHO_PROMPT}\n\nUsuário: ${messages[messages.length-1].text}`
    } else {
      prompt = messages.map((m: {from: 'user' | 'bot', text: string}) => `${m.from === 'user' ? 'Usuário' : 'Ervinho'}: ${m.text}`).join('\n')
    }
    try {
      const resposta = await gemini.chatCompletion(prompt)
      return NextResponse.json({ success: true, message: resposta })
    } catch (e: any) {
      if (e && e.message && typeof e.message === 'string') {
        if (e.message.includes('401') || e.message.includes('403')) {
          console.error('Erro de autenticação na API Gemini:', e.message)
          return NextResponse.json({ success: false, message: 'Erro: Autenticação da API Gemini falhou (401/403).' }, { status: 401 })
        }
        if (e.message.includes('429')) {
          console.error('Limite de uso da API Gemini atingido:', e.message)
          return NextResponse.json({ success: false, message: 'Erro: Limite de uso da API Gemini atingido (429).' }, { status: 429 })
        }
      }
      console.error('Erro inesperado ao consultar IA Gemini:', e)
      return NextResponse.json({ success: false, message: 'Erro inesperado ao consultar IA Gemini.' }, { status: 500 })
    }
  } catch (e) {
    console.error('Erro inesperado no endpoint Gemini:', e)
    return NextResponse.json({ success: false, message: 'Erro inesperado no endpoint Gemini.' }, { status: 500 })
  }
} 