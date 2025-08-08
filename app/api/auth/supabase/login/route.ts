import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json()
    const supabase = await createClient()

    // Fazer login no Supabase
    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (authError) {
      return NextResponse.json({ error: authError.message }, { status: 400 })
    }

    if (!authData.user) {
      return NextResponse.json({ error: 'Falha na autenticação' }, { status: 400 })
    }

    // Buscar ou criar usuário no banco local
    let user = await prisma.user.findUnique({
      where: { id: authData.user.id },
      include: { subscription: true }
    })

    if (!user) {
      // Criar usuário se não existir
      user = await prisma.user.create({
        data: {
          id: authData.user.id,
          email: authData.user.email!,
          name: authData.user.user_metadata?.name || authData.user.email?.split('@')[0],
          avatar: authData.user.user_metadata?.avatar_url,
        },
        include: { subscription: true }
      })
    }

    return NextResponse.json({
      success: true,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        avatar: user.avatar,
        subscription: user.subscription,
      }
    })

  } catch (error) {
    console.error('Erro no login:', error)
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 })
  }
}