import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { createClient } from '@/lib/supabase/server';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { cultivationId, event } = body;

    if (!cultivationId || !event) {
      return NextResponse.json(
        { error: 'CultivationId e event são obrigatórios' },
        { status: 400 }
      );
    }

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

    // Verificar se o usuário existe no banco local
    const localUser = await prisma.user.findUnique({
      where: { id: userId }
    });
    
    if (!localUser) {
      return NextResponse.json(
        { error: 'Usuário não encontrado no banco local' },
        { status: 404 }
      );
    }

    // Converter todos os detalhes para string JSON
    const allDetails = {
      fotos: event.details?.fotos || [],
      ph: event.details?.ph || null,
      ec: event.details?.ec || null,
      temperatura: event.details?.temperatura || null,
      umidade: event.details?.umidade || null,
      nivelDano: event.details?.nivelDano || null,
      ...event.details // Incluir outros detalhes que possam existir
    };
    
    const photos = JSON.stringify(allDetails);

    const savedEvent = await prisma.cultivationEvent.create({
      data: {
        cultivationId,
        type: event.type,
        title: event.description,
        description: event.description,
        date: new Date(event.date),
        photos: photos,
        userId: user.id,
      },
    });

    return NextResponse.json({
      success: true,
      event: savedEvent,
    });

  } catch (error) {
    console.error('Erro ao salvar evento:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor', details: error instanceof Error ? error.message : 'Erro desconhecido' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const cultivationId = searchParams.get('cultivationId');

    if (!cultivationId) {
      return NextResponse.json(
        { error: 'CultivationId é obrigatório' },
        { status: 400 }
      );
    }

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

    // Verificar se o cultivo pertence ao usuário
    const cultivation = await prisma.cultivation.findFirst({
      where: {
        id: cultivationId,
        userId: userId
      }
    });

    if (!cultivation) {
      return NextResponse.json(
        { error: 'Cultivo não encontrado ou não pertence ao usuário' },
        { status: 404 }
      );
    }

    const events = await prisma.cultivationEvent.findMany({
      where: {
        cultivationId: cultivationId,
      },
      orderBy: {
        date: 'asc',
      },
    });

    // Converter eventos para o formato esperado pelo componente
    const formattedEvents = events.map(event => {
      let details = {};
      
      try {
        // Tentar fazer parse do JSON do campo photos
        if (event.photos) {
          const parsedPhotos = JSON.parse(event.photos);
          details = {
            fotos: parsedPhotos.fotos || [],
            ph: parsedPhotos.ph || null,
            ec: parsedPhotos.ec || null,
            temperatura: parsedPhotos.temperatura || null,
            umidade: parsedPhotos.umidade || null,
            nivelDano: parsedPhotos.nivelDano || null,
            ...parsedPhotos // Incluir outros campos que possam existir
          };
        }
      } catch (error) {
        console.error('Erro ao fazer parse dos detalhes do evento:', error);
        details = {
          fotos: [],
          ph: null,
          ec: null,
          temperatura: null,
          umidade: null,
          nivelDano: null
        };
      }
      
      return {
        id: event.id,
        type: event.type,
        description: event.description || event.title,
        date: event.date.toISOString(),
        details: details
      };
    });

    return NextResponse.json({
      success: true,
      events: formattedEvents,
    });

  } catch (error) {
    console.error('Erro ao buscar eventos:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}