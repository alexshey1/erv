import { NextRequest, NextResponse } from 'next/server';
import { createRateLimitedHandler } from '@/lib/rate-limiter';

async function translateHandler(req: NextRequest, rateLimitHeaders: Record<string, string>, context: { params: Promise<{ id: string }> }) {
  try {
    const { q, source = 'auto', target = 'pt' } = await req.json();
    const response = await fetch('https://pt.libretranslate.com/translate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        q,
        source,
        target,
        format: 'text',
        alternatives: 3,
        api_key: ''
      })
    });
    const data = await response.json();
    return NextResponse.json(data, { status: response.status });
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || 'Erro interno ao traduzir.' }, { status: 500 });
  }
}

// Aplicar rate limiting: 20 requests por minuto por usuário
export const POST = createRateLimitedHandler('external', translateHandler);