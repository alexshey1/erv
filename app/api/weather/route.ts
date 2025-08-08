import { NextRequest, NextResponse } from 'next/server'
import { createRateLimitedHandler } from '@/lib/rate-limiter'

async function weatherHandler(req: NextRequest, rateLimitHeaders: Record<string, string>, context: { params: Promise<{ id: string }> }) {
  const { searchParams } = new URL(req.url)
  const city = searchParams.get('city') || 'São Paulo'
  const apiKey = process.env.WEATHER_API || process.env.NEXT_PUBLIC_WEATHER_API
  if (!apiKey) {
    return NextResponse.json({ error: 'API key not configured' }, { status: 500 })
  }
  try {
    const url = `https://api.weatherapi.com/v1/current.json?key=${apiKey}&q=${encodeURIComponent(city)}&lang=pt`
    const res = await fetch(url)
    if (!res.ok) {
      return NextResponse.json({ error: 'Erro ao buscar clima' }, { status: res.status })
    }
    const data = await res.json()
    return NextResponse.json(data)
  } catch (err) {
    return NextResponse.json({ error: 'Erro interno ao buscar clima' }, { status: 500 })
  }
}

// Aplicar rate limiting: 20 requests por minuto por usuário
export const GET = createRateLimitedHandler('external', weatherHandler);