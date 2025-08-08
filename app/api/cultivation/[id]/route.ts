import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;

    if (!id) {
      return NextResponse.json(
        { error: 'ID do cultivo é obrigatório' },
        { status: 400 }
      );
    }

    const cultivation = await prisma.cultivation.findUnique({
      where: {
        id: id,
      },
    });

    if (!cultivation) {
      return NextResponse.json(
        { error: 'Cultivo não encontrado' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      cultivation,
    });

  } catch (error) {
    console.error('Erro ao buscar cultivo:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;

    if (!id) {
      return NextResponse.json(
        { error: 'ID do cultivo é obrigatório' },
        { status: 400 }
      );
    }

    // Primeiro, deletar todos os eventos relacionados ao cultivo
    await prisma.cultivationEvent.deleteMany({
      where: {
        cultivationId: id,
      },
    });

    // Depois, deletar o cultivo
    const deletedCultivation = await prisma.cultivation.delete({
      where: {
        id: id,
      },
    });

    return NextResponse.json({
      success: true,
      message: 'Cultivo excluído com sucesso',
      cultivation: deletedCultivation,
    });

  } catch (error) {
    console.error('Erro ao excluir cultivo:', error);
    
    if (error instanceof Error && error.message.includes('Record to delete does not exist')) {
      return NextResponse.json(
        { error: 'Cultivo não encontrado' },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
} 

export async function PATCH(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
    if (!id) {
      return NextResponse.json(
        { error: 'ID do cultivo é obrigatório' },
        { status: 400 }
      );
    }
    const body = await request.json();
    // Permitir atualização parcial
    const updateData: any = {};
    if (body.name !== undefined) updateData.name = body.name;
    if (body.seedStrain !== undefined) updateData.seedStrain = body.seedStrain;
    if (body.status !== undefined) updateData.status = body.status;
    if (body.yield_g !== undefined) updateData.yield_g = Number(body.yield_g);
    if (body.profit_brl !== undefined) updateData.profit_brl = Number(body.profit_brl);
    if (body.durationDays !== undefined) updateData.durationDays = Number(body.durationDays);
    if (body.floracaoDate !== undefined) updateData.floracaoDate = body.floracaoDate ? new Date(body.floracaoDate) : null;
    if (body.colheitaDate !== undefined) updateData.colheitaDate = body.colheitaDate ? new Date(body.colheitaDate) : null;
    if (body.secagemDate !== undefined) updateData.secagemDate = body.secagemDate ? new Date(body.secagemDate) : null;
    if (body.curaDate !== undefined) updateData.curaDate = body.curaDate ? new Date(body.curaDate) : null;
    if (body.photoUrl !== undefined) updateData.photoUrl = body.photoUrl;
    
    // Campos de configuração do setup
    if (body.area_m2 !== undefined) updateData.area_m2 = Number(body.area_m2);
    if (body.custo_equip_iluminacao !== undefined) updateData.custo_equip_iluminacao = Number(body.custo_equip_iluminacao);
    if (body.custo_tenda_estrutura !== undefined) updateData.custo_tenda_estrutura = Number(body.custo_tenda_estrutura);
    if (body.custo_ventilacao_exaustao !== undefined) updateData.custo_ventilacao_exaustao = Number(body.custo_ventilacao_exaustao);
    if (body.custo_outros_equipamentos !== undefined) updateData.custo_outros_equipamentos = Number(body.custo_outros_equipamentos);
    if (body.potencia_watts !== undefined) updateData.potencia_watts = Number(body.potencia_watts);
    if (body.producao_por_planta_g !== undefined) updateData.producao_por_planta_g = Number(body.producao_por_planta_g);
    if (body.dias_vegetativo !== undefined) updateData.dias_vegetativo = Number(body.dias_vegetativo);
    if (body.dias_veg !== undefined) updateData.dias_veg = Number(body.dias_veg);
    if (body.dias_racao !== undefined) updateData.dias_racao = Number(body.dias_racao);
    if (body.horas_luz_veg !== undefined) updateData.horas_luz_veg = Number(body.horas_luz_veg);
    if (body.horas_luz_flor !== undefined) updateData.horas_luz_flor = Number(body.horas_luz_flor);
    if (body.dias_secagem_cura !== undefined) updateData.dias_secagem_cura = Number(body.dias_secagem_cura);
    if (body.preco_kwh !== undefined) updateData.preco_kwh = Number(body.preco_kwh);
    if (body.custo_sementes_clones !== undefined) updateData.custo_sementes_clones = Number(body.custo_sementes_clones);
    if (body.custo_substrato !== undefined) updateData.custo_substrato = Number(body.custo_substrato);
    if (body.custo_nutrientes !== undefined) updateData.custo_nutrientes = Number(body.custo_nutrientes);
    if (body.custos_operacionais_misc !== undefined) updateData.custos_operacionais_misc = Number(body.custos_operacionais_misc);
    if (body.preco_venda_por_grama !== undefined) updateData.preco_venda_por_grama = Number(body.preco_venda_por_grama);
    if (body.num_plantas !== undefined) updateData.num_plantas = Number(body.num_plantas);

    const updated = await prisma.cultivation.update({
      where: { id },
      data: updateData,
    });
    return NextResponse.json({ success: true, cultivation: updated });
  } catch (error) {
    console.error('Erro ao atualizar cultivo:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
} 