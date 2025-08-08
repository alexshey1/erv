import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { createClient } from '@/lib/supabase/server';
import { createRateLimitedHandler } from '@/lib/rate-limiter';

async function getCultivationsHandler(request: NextRequest, rateLimitHeaders: Record<string, string>, context: { params: Promise<{ id: string }> }) {
  try {
    const supabase = await createClient();

    // Verificar usuário autenticado no Supabase
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { error: 'Usuário não autenticado' },
        { status: 401 }
      );
    }

    const userId = user.id;

    const cultivations = await prisma.cultivation.findMany({
      where: {
        userId: userId
      },
      take: 10, // Limitar a 10 resultados
      orderBy: {
        createdAt: 'desc',
      },
      select: {
        id: true,
        name: true,
        seedStrain: true,
        startDate: true,
        endDate: true,
        status: true,
        yield_g: true,
        profit_brl: true,
        durationDays: true,
        hasSevereProblems: true,
        photoUrl: true,
        floracaoDate: true,
        colheitaDate: true,
        secagemDate: true,
        curaDate: true,
        area_m2: true,
        custo_equip_iluminacao: true,
        custo_tenda_estrutura: true,
        custo_ventilacao_exaustao: true,
        custo_outros_equipamentos: true,
        potencia_watts: true,
        producao_por_planta_g: true,
        dias_vegetativo: true,
        dias_veg: true,
        dias_racao: true,
        horas_luz_flor: true,
        dias_secagem_cura: true,
        preco_kwh: true,
        custo_sementes_clones: true,
        custo_substrato: true,
        custo_nutrientes: true,
        custos_operacionais_misc: true,
        preco_venda_por_grama: true,
        // @ts-ignore - Campos novos ainda não reconhecidos pelo TypeScript
        plant_type: true,
        // @ts-ignore - Campos novos ainda não reconhecidos pelo TypeScript  
        cycle_preset_id: true,
        // @ts-ignore - Campos novos ainda não reconhecidos pelo TypeScript
        custom_cycle_params: true,
        createdAt: true,
        updatedAt: true,
        userId: true,
      }
    });

    return NextResponse.json({
      success: true,
      cultivations,
    });

  } catch (error) {
    console.error('Erro ao buscar cultivos:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}

async function createCultivationHandler(request: NextRequest, rateLimitHeaders: Record<string, string>, context: { params: Promise<{ id: string }> }) {
  try {
    console.log('🔍 Iniciando criação de cultivo...');
    
    const supabase = await createClient();

    // Verificar usuário autenticado no Supabase
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      console.log('❌ Usuário não autenticado:', authError?.message);
      return NextResponse.json(
        { error: 'Usuário não autenticado' },
        { status: 401 }
      );
    }

    const userId = user.id;

    const body = await request.json();
    console.log('📝 Dados recebidos:', body);
    
    const { 
      name, 
      seedStrain, 
      startDate, 
      status, 
      yield_g, 
      profit_brl, 
      durationDays,
      // Novos campos para ciclo adaptativo
      plant_type,
      cycle_preset_id,
      custom_cycle_params
    } = body;

    if (!name || !seedStrain || !startDate) {
      console.log('❌ Validação falhou:', { name, seedStrain, startDate });
      return NextResponse.json(
        { error: 'Nome, variedade e data de início são obrigatórios' },
        { status: 400 }
      );
    }

    console.log('🔍 Verificando usuário...');
    // Verificar se o usuário existe no banco local
    const localUser = await prisma.user.findUnique({
      where: { id: userId }
    });
    
    if (!localUser) {
      console.log('❌ Usuário não encontrado no banco local');
      return NextResponse.json(
        { error: 'Usuário não encontrado no banco local' },
        { status: 404 }
      );
    }

    console.log('✅ Usuário encontrado:', localUser.id);
    console.log('🔍 Criando cultivo no banco...');

    // @ts-ignore - Campos do ciclo adaptativo foram adicionados ao schema mas types podem estar em cache
    const cultivation = await prisma.cultivation.create({
      data: {
        name,
        seedStrain,
        startDate: new Date(startDate),
        endDate: status === "completed" ? new Date() : null,
        status,
        yield_g: Number(yield_g) || 0,
        profit_brl: Number(profit_brl) || 0,
        durationDays: Number(durationDays) || 0,
        userId: localUser.id,
        // Campos adaptativos (armazenar como JSON ou campos separados)
        // @ts-ignore - Campos novos ainda não reconhecidos pelo TypeScript
        plant_type: plant_type || null,
        // @ts-ignore - Campos novos ainda não reconhecidos pelo TypeScript
        cycle_preset_id: cycle_preset_id || null,
        // @ts-ignore - Campos novos ainda não reconhecidos pelo TypeScript
        custom_cycle_params: custom_cycle_params ? JSON.stringify(custom_cycle_params) : null,
      },
    });

    console.log('✅ Cultivo criado com sucesso:', cultivation.id);

    return NextResponse.json({
      success: true,
      cultivation,
    });

  } catch (error) {
    console.error('❌ Erro ao criar cultivo:', error);
    
    // Log detalhado do erro
    if (error instanceof Error) {
      console.error('📝 Detalhes do erro:', {
        message: error.message,
        stack: error.stack,
        name: error.name
      });
    }
    
    return NextResponse.json(
      { 
        error: 'Erro interno do servidor', 
        details: error instanceof Error ? error.message : 'Erro desconhecido',
        timestamp: new Date().toISOString()
      },
      { status: 500 }
    );
  }
}

// Aplicar rate limiting: 30 requests por minuto por usuário (operações normais)
export const GET = createRateLimitedHandler('general', getCultivationsHandler);
export const POST = createRateLimitedHandler('general', createCultivationHandler);