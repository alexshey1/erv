import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { prisma } from '@/lib/prisma'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
})

// Chave secreta para criar admin (definir no .env)
const ADMIN_CREATION_SECRET = process.env.ADMIN_CREATION_SECRET || 'your-super-secret-key'

export async function POST(request: NextRequest) {
  try {
    const { name, email, password, secret } = await request.json()

    // Verificar chave secreta
    if (secret !== ADMIN_CREATION_SECRET) {
      return NextResponse.json({ error: 'Chave secreta inválida' }, { status: 401 })
    }

    // Validações
    if (!name || !email || !password) {
      return NextResponse.json({ error: 'Nome, email e senha são obrigatórios' }, { status: 400 })
    }

    if (password.length < 6) {
      return NextResponse.json({ error: 'A senha deve ter pelo menos 6 caracteres' }, { status: 400 })
    }

    // Verificar se usuário já existe
    const existingUser = await prisma.user.findUnique({
      where: { email }
    })

    if (existingUser) {
      return NextResponse.json({ error: 'Usuário com este email já existe' }, { status: 400 })
    }

    // Criar usuário no Supabase Auth
    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
      email,
      password,
      email_confirm: true, // Confirmar email automaticamente
      user_metadata: {
        name: name,
        role: 'admin'
      }
    })

    if (authError) {
      return NextResponse.json({ error: authError.message }, { status: 400 })
    }

    if (!authData.user) {
      return NextResponse.json({ error: 'Falha ao criar usuário no Supabase' }, { status: 400 })
    }

    // Criar usuário no banco local
    const user = await prisma.user.create({
      data: {
        id: authData.user.id,
        email: authData.user.email!,
        name: name,
        role: 'admin',
        avatar: null,
      }
    })

    // Criar assinatura Enterprise gratuita para o admin
    const oneYearFromNow = new Date()
    oneYearFromNow.setFullYear(oneYearFromNow.getFullYear() + 1)

    await prisma.subscription.create({
      data: {
        userId: user.id,
        plan: 'enterprise',
        status: 'active',
        startDate: new Date(),
        endDate: oneYearFromNow,
        autoRenew: false,
        price: 0, // Gratuito para admin
        currency: 'BRL',
        features: [
          'canAccessDashboard',
          'canAccessHistory',
          'canAccessAnalytics',
          'canAccessReports',
          'canAccessAnomalies',
          'canCreateCultivations',
          'canExportData',
          'canShareCultivations',
          'canUseAdvancedFeatures',
          'canAccessAPI',
          'canUseRealTimeData',
          'canUsePredictiveAnalytics',
          'canUseCustomReports',
          'canUseTeamFeatures',
          'canUsePrioritySupport',
          'canAccessComparison'
        ]
      }
    })

    return NextResponse.json({
      success: true,
      message: 'Administrador criado com sucesso',
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
      }
    })

  } catch (error) {
    console.error('Erro ao criar administrador:', error)
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 })
  }
}