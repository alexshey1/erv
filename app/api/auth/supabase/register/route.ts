import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { supabase } from '@/lib/supabase'

export async function POST(request: NextRequest) {
  try {
    const { email, password, name } = await request.json()
    
    console.log('📝 Tentativa de registro:', { email, name })
    
    const supabase = await createClient()

    // Registrar no Supabase
    console.log('🔄 Registrando no Supabase Auth...')
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          name: name,
        }
      }
    })

    if (authError) {
      console.error('❌ Erro no Supabase Auth:', authError)
      return NextResponse.json({ 
        error: `Erro de autenticação: ${authError.message}`,
        details: authError 
      }, { status: 400 })
    }

    if (!authData.user) {
      console.error('❌ Nenhum usuário retornado do Supabase')
      return NextResponse.json({ error: 'Falha no registro - nenhum usuário criado' }, { status: 400 })
    }

    console.log('✅ Usuário criado no Supabase:', authData.user.id)

    // Usuário será sincronizado automaticamente pelo trigger
    console.log('✅ Usuário criado - trigger fará a sincronização automaticamente')
    
    // Aguardar um pouco para garantir que o trigger executou
    await new Promise(resolve => setTimeout(resolve, 500))

    // Buscar o usuário sincronizado pelo trigger
    const user = await prisma.user.findUnique({
      where: { id: authData.user.id }
    })

    if (!user) {
      console.error('❌ Trigger falhou na sincronização')
      return NextResponse.json({ 
        error: 'Erro na sincronização do usuário',
        details: 'Trigger não executou corretamente' 
      }, { status: 500 })
    }

    console.log('✅ Usuário sincronizado pelo trigger:', user.id)

    // Enviar email de boas-vindas (opcional - apenas se email foi confirmado)
    if (authData.user.email_confirmed_at) {
      try {
        await fetch(`${process.env.NEXT_PUBLIC_SITE_URL}/api/email/welcome`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ name, email: user.email })
        })
        console.log('📧 Email de boas-vindas enviado')
      } catch (emailError) {
        console.log('⚠️ Erro ao enviar email de boas-vindas:', emailError)
        // Não falhar o registro por causa do email
      }
    }

    return NextResponse.json({
      success: true,
      message: 'Usuário criado com sucesso! Verifique seu email.',
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
      }
    })

  } catch (error) {
    console.error('❌ Erro geral no registro:', error)
    return NextResponse.json({ 
      error: 'Erro interno do servidor',
      details: error instanceof Error ? error.message : 'Erro desconhecido'
    }, { status: 500 })
  }
}