import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()
    
    // Verificar autenticação
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Buscar todos os dados em paralelo para melhor performance
    const [cultivationsResult, eventsResult] = await Promise.all([
      // Buscar cultivos
      supabase
        .from('cultivations')
        .select('*')
        .eq('userId', user.id)
        .order('createdAt', { ascending: false }),
      
      // Buscar eventos de todos os cultivos do usuário
      supabase
        .from('cultivation_events')
        .select(`
          *,
          cultivations!inner(userId)
        `)
        .eq('cultivations.userId', user.id)
        .order('date', { ascending: false })
        .limit(50) // Limitar para melhor performance
    ])

    // Verificar erros
    if (cultivationsResult.error) {
      console.error('Erro ao buscar cultivos:', cultivationsResult.error)
      return NextResponse.json({ error: 'Erro ao buscar cultivos' }, { status: 500 })
    }

    if (eventsResult.error) {
      console.error('Erro ao buscar eventos:', eventsResult.error)
      return NextResponse.json({ error: 'Erro ao buscar eventos' }, { status: 500 })
    }

    const cultivations = cultivationsResult.data || []
    const allEvents = eventsResult.data || []

    // Processar eventos para incluir dados ambientais parseados
    const processedEvents = allEvents.map(event => {
      let details = {}
      
      // Fazer parse do campo photos que contém os dados ambientais em JSON
      try {
        if (event.photos) {
          details = JSON.parse(event.photos)
        }
      } catch (error) {
        console.error('Erro ao fazer parse dos detalhes do evento:', error)
      }
      
      return {
        ...event,
        details
      }
    })

    // Organizar eventos por cultivo
    const eventsByCultivation: Record<string, any[]> = {}
    cultivations.forEach(cultivation => {
      eventsByCultivation[cultivation.id] = []
    })

    processedEvents.forEach(event => {
      if (eventsByCultivation[event.cultivationId]) {
        eventsByCultivation[event.cultivationId].push(event)
      }
    })

    // Calcular dados agregados para melhor performance
    const dashboardStats = {
      totalCultivations: cultivations.length,
      activeCultivations: cultivations.filter(c => c.status === 'active').length,
      totalEvents: processedEvents.length,
      recentEvents: processedEvents.slice(0, 10),
      lastUpdate: new Date().toISOString()
    }

    // Extrair últimos parâmetros ambientais
    let lastEnvironmentalData = {
      ph: null,
      ec: null,
      temperature: null,
      humidity: null,
      timestamp: null
    }

    // Buscar os últimos dados ambientais de todos os eventos processados
    for (const event of processedEvents) {
      const details = event.details || {}
      
      if (details.ph !== undefined || details.ec !== undefined || 
          details.temperatura !== undefined || details.umidade !== undefined) {
        lastEnvironmentalData = {
          ph: details.ph ?? lastEnvironmentalData.ph,
          ec: details.ec ?? lastEnvironmentalData.ec,
          temperature: details.temperatura ?? lastEnvironmentalData.temperature,
          humidity: details.umidade ?? lastEnvironmentalData.humidity,
          timestamp: event.date
        }
        break // Pegar apenas o mais recente
      }
    }

    return NextResponse.json({
      success: true,
      data: {
        cultivations,
        eventsByCultivation,
        dashboardStats,
        environmentalData: lastEnvironmentalData
      }
    })

  } catch (error) {
    console.error('Erro na API dashboard-data:', error)
    return NextResponse.json({ 
      error: 'Erro interno do servidor',
      details: error instanceof Error ? error.message : 'Erro desconhecido'
    }, { status: 500 })
  }
}