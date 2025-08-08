import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(request: NextRequest) {
  try {
    const { eventId, cultivationId, images } = await request.json();

    if (!eventId || !cultivationId || !images || !Array.isArray(images)) {
      return NextResponse.json(
        { error: 'Dados inválidos' },
        { status: 400 }
      );
    }

    // Salvar imagens no banco
    const savedImages = await prisma.cultivationImage.createMany({
      data: images.map((img: any) => ({
        publicId: img.publicId,
        secureUrl: img.secureUrl,
        filename: img.filename,
        fileSize: img.fileSize,
        mimeType: img.mimeType,
        width: img.width,
        height: img.height,
        format: img.format,
        cultivationId: cultivationId,
        eventId: eventId
      }))
    });

    return NextResponse.json({
      success: true,
      message: `${savedImages.count} imagens salvas com sucesso`,
      images: savedImages
    });

  } catch (error) {
    console.error('Erro ao salvar imagens do evento:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const eventId = searchParams.get('eventId');

    if (!eventId) {
      return NextResponse.json(
        { error: 'ID do evento é obrigatório' },
        { status: 400 }
      );
    }

    // Buscar imagens do evento
    const images = await prisma.cultivationImage.findMany({
      where: { eventId },
      orderBy: { createdAt: 'desc' }
    });

    return NextResponse.json({
      success: true,
      images
    });

  } catch (error) {
    console.error('Erro ao buscar imagens do evento:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
} 