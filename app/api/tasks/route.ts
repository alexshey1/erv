import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { prisma } from '@/lib/prisma'
import { createClient } from '@/lib/supabase/server'

const TaskCreateSchema = z.object({
  name: z.string().min(1).max(200),
  prioridade: z.enum(['baixa', 'media', 'alta']).optional().default('media'),
  dataLimite: z.string().datetime().optional(),
  cultivationId: z.string().optional(),
})

const TaskUpdateSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1).max(200).optional(),
  prioridade: z.enum(['baixa', 'media', 'alta']).optional(),
  dataLimite: z.string().datetime().optional(),
  concluida: z.boolean().optional(),
})

export async function GET(req: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const url = new URL(req.url)
  const cultivationId = url.searchParams.get('cultivationId') || undefined

  const where: any = { type: 'task', userId: user.id }
  if (cultivationId) where.cultivationId = cultivationId

  const events = await prisma.cultivationEvent.findMany({
    where,
    orderBy: { date: 'asc' },
  })

  const tarefas = events.map((ev) => {
    let details: any = {}
    try { details = ev.photos ? JSON.parse(ev.photos) : {} } catch {}
    return {
      id: ev.id,
      nome: ev.title || ev.description || 'Tarefa',
      prazo: details.prazo || '—',
      concluida: Boolean(details.concluida),
      prioridade: (details.prioridade as 'baixa'|'media'|'alta') || 'media',
      dataCriacao: ev.createdAt,
      dataLimite: ev.date,
      categoria: details.categoria,
    }
  })

  return NextResponse.json({ success: true, tarefas })
}

export async function POST(req: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await req.json()
  const parsed = TaskCreateSchema.safeParse(body)
  if (!parsed.success) return NextResponse.json({ error: 'Dados inválidos' }, { status: 400 })
  const { name, prioridade, dataLimite, cultivationId } = parsed.data

  if (cultivationId) {
    const own = await prisma.cultivation.findFirst({ where: { id: cultivationId, userId: user.id } })
    if (!own) return NextResponse.json({ error: 'Cultivo inválido' }, { status: 404 })
  }

  const details = {
    prioridade,
    concluida: false,
    prazo: dataLimite ? new Date(dataLimite).toISOString() : undefined,
  }

  const created = await prisma.cultivationEvent.create({
    data: {
      type: 'task',
      title: name,
      description: name,
      date: dataLimite ? new Date(dataLimite) : new Date(Date.now() + 2*60*60*1000),
      photos: JSON.stringify(details),
      userId: user.id,
      cultivationId: cultivationId || (await prisma.cultivation.findFirst({ where: { userId: user.id }, select: { id: true } }))?.id || undefined as any,
    },
  })

  return NextResponse.json({ success: true, id: created.id })
}

export async function PATCH(req: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await req.json()
  const parsed = TaskUpdateSchema.safeParse(body)
  if (!parsed.success) return NextResponse.json({ error: 'Dados inválidos' }, { status: 400 })
  const { id, name, prioridade, dataLimite, concluida } = parsed.data

  const ev = await prisma.cultivationEvent.findFirst({ where: { id, userId: user.id } })
  if (!ev) return NextResponse.json({ error: 'Tarefa não encontrada' }, { status: 404 })

  let details: any = {}
  try { details = ev.photos ? JSON.parse(ev.photos) : {} } catch {}
  if (prioridade) details.prioridade = prioridade
  if (concluida !== undefined) details.concluida = concluida
  if (dataLimite) details.prazo = dataLimite

  const updated = await prisma.cultivationEvent.update({
    where: { id },
    data: {
      title: name ?? ev.title,
      description: name ?? ev.description,
      date: dataLimite ? new Date(dataLimite) : ev.date,
      photos: JSON.stringify(details),
    },
  })

  return NextResponse.json({ success: true, id: updated.id })
}

export async function DELETE(req: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const url = new URL(req.url)
  const id = url.searchParams.get('id')
  if (!id) return NextResponse.json({ error: 'ID obrigatório' }, { status: 400 })

  const ev = await prisma.cultivationEvent.findFirst({ where: { id, userId: user.id } })
  if (!ev) return NextResponse.json({ error: 'Tarefa não encontrada' }, { status: 404 })

  await prisma.cultivationEvent.delete({ where: { id } })
  return NextResponse.json({ success: true })
} 