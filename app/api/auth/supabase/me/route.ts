import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getUserPermissions } from '@/lib/permissions-supabase'

export async function GET() {
  try {
    const supabase = await createClient()

    // Verificar usuário autenticado no Supabase
    const { data: { user: authUser }, error: authError } = await supabase.auth.getUser()

    if (authError) {
      console.warn('Erro de autenticação:', authError.message)
      
      // Se é erro de token, retornar 401 para forçar logout
      if (authError.message.includes('refresh_token_not_found') || 
          authError.message.includes('Invalid Refresh Token')) {
        return NextResponse.json({ user: null, error: 'Token inválido' }, { status: 401 })
      }
      
      return NextResponse.json({ user: null })
    }

    if (!authUser) {
      return NextResponse.json({ user: null })
    }

    // Buscar dados completos no banco local
    const user = await prisma.user.findUnique({
      where: { id: authUser.id },
      include: {
        subscription: true,
        cultivations: {
          select: { id: true } // Apenas para contar
        }
      }
    })

    if (!user) {
      return NextResponse.json({ user: null })
    }

    // Calcular permissões
    const permissions = getUserPermissions(user)

    return NextResponse.json({
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        avatar: user.avatar,
        permissions,
        subscription: user.subscription,
        cultivationCount: user.cultivations.length,
        // Informações úteis
        canCreateMoreCultivations: user.cultivations.length < (permissions.maxCultivations === -1 ? Infinity : permissions.maxCultivations),
        isEmailVerified: authUser.email_confirmed_at !== null,
      }
    })

  } catch (error) {
    console.error('Erro ao buscar usuário:', error)
    return NextResponse.json({ user: null }, { status: 500 })
  }
}