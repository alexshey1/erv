import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  const next = searchParams.get('next') ?? '/dashboard'

  if (code) {
    const supabase = await createClient()
    
    const { data, error } = await supabase.auth.exchangeCodeForSession(code)
    
    if (!error && data.user) {
      // Criar ou atualizar usuário no banco local
      try {
        await prisma.user.upsert({
          where: { id: data.user.id },
          update: {
            email: data.user.email!,
            name: data.user.user_metadata?.name || data.user.email?.split('@')[0],
            avatar: data.user.user_metadata?.avatar_url,
          },
          create: {
            id: data.user.id,
            email: data.user.email!,
            name: data.user.user_metadata?.name || data.user.email?.split('@')[0],
            avatar: data.user.user_metadata?.avatar_url,
            role: 'free',
          }
        })
      } catch (dbError) {
        console.error('Erro ao criar usuário no banco:', dbError)
      }
      
      return NextResponse.redirect(`${origin}${next}`)
    }
  }

  // Redirecionar para login em caso de erro
  return NextResponse.redirect(`${origin}/auth/login?error=callback_error`)
}