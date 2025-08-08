import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';

const HOST_ALLOWLIST = new Set(['res.cloudinary.com']);

const ImageMetaSchema = z.object({
  publicId: z.string().min(1).max(200),
  secureUrl: z.string().url().refine((u) => {
    try { const h = new URL(u).hostname; return HOST_ALLOWLIST.has(h); } catch { return false; }
  }, 'Host da imagem não permitido'),
  filename: z.string().min(1).max(120),
  fileSize: z.number().int().nonnegative().max(20 * 1024 * 1024),
  mimeType: z.string().regex(/^image\//),
  width: z.number().int().positive().max(10000),
  height: z.number().int().positive().max(10000),
  format: z.string().min(1).max(20),
});

const PayloadSchema = z.object({
  eventId: z.string().min(1).max(100),
  cultivationId: z.string().min(1).max(100),
  images: z.array(ImageMetaSchema).min(1).max(20),
});

function sanitizeId(id: string) {
  return id.replace(/[^a-zA-Z0-9-_]/g, '').slice(0, 100);
}

export async function POST(request: NextRequest) {
  try {
    const json = await request.json();
    const parsed = PayloadSchema.safeParse(json);
    if (!parsed.success) {
      return NextResponse.json({ error: 'Dados inválidos', details: parsed.error.issues }, { status: 400 });
    }

    const { eventId, cultivationId, images } = parsed.data;
    const safeEventId = sanitizeId(eventId);
    const safeCultivationId = sanitizeId(cultivationId);

    const savedImages = await prisma.cultivationImage.createMany({
      data: images.map((img) => ({
        publicId: img.publicId,
        secureUrl: img.secureUrl,
        filename: img.filename,
        fileSize: img.fileSize,
        mimeType: img.mimeType,
        width: img.width,
        height: img.height,
        format: img.format,
        cultivationId: safeCultivationId,
        eventId: safeEventId,
      })),
    });

    return NextResponse.json({
      success: true,
      message: `${savedImages.count} imagens salvas com sucesso`,
      images: savedImages,
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

    const images = await prisma.cultivationImage.findMany({
      where: { eventId: sanitizeId(eventId) },
      orderBy: { createdAt: 'desc' }
    });

    return NextResponse.json({ success: true, images });
  } catch (error) {
    console.error('Erro ao buscar imagens do evento:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
} 