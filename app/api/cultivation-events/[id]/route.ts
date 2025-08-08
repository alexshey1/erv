import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function DELETE(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id: eventId } = await context.params;

    if (!eventId) {
      return NextResponse.json(
        { error: 'ID do evento é obrigatório' },
        { status: 400 }
      );
    }

    // Verificar se o evento existe
    const existingEvent = await prisma.cultivationEvent.findUnique({
      where: { id: eventId }
    });

    if (!existingEvent) {
      return NextResponse.json(
        { error: 'Evento não encontrado' },
        { status: 404 }
      );
    }

    // Deletar o evento
    await prisma.cultivationEvent.delete({
      where: { id: eventId }
    });

    console.log('Evento deletado com sucesso:', eventId);

    return NextResponse.json({
      success: true,
      message: 'Evento deletado com sucesso'
    });

  } catch (error) {
    console.error('Erro ao deletar evento:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor', details: error instanceof Error ? error.message : 'Erro desconhecido' },
      { status: 500 }
    );
  }
} 