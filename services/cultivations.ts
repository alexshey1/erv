import { z } from 'zod'

const CultivationSchema = z.object({
  id: z.string().optional(),
  name: z.string().min(1),
  seedStrain: z.string().min(1),
  startDate: z.string().min(1),
  status: z.enum(['active','completed','archived']),
  yield_g: z.number().nonnegative().default(0),
  profit_brl: z.number().default(0),
  durationDays: z.number().int().nonnegative().default(0),
  plant_type: z.any().optional(),
  cycle_preset_id: z.string().optional(),
  custom_cycle_params: z.any().optional(),
})

export type CultivationInput = z.infer<typeof CultivationSchema>

function toUserError(message: string) {
  const err = new Error(message)
  ;(err as any).isUserError = true
  return err
}

export async function listCultivations(): Promise<CultivationInput[]> {
  const res = await fetch('/api/cultivation', { credentials: 'include' })
  if (!res.ok) throw toUserError('Não foi possível carregar seus cultivos.')
  const data = await res.json()
  if (!data.success) throw toUserError(data.error || 'Falha ao carregar cultivos.')
  return data.cultivations
}

export async function createCultivation(input: CultivationInput) {
  const parsed = CultivationSchema.safeParse(input)
  if (!parsed.success) throw toUserError('Dados inválidos do cultivo.')
  const res = await fetch('/api/cultivation', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(parsed.data),
  })
  if (!res.ok) throw toUserError('Não foi possível salvar o cultivo.')
  const data = await res.json()
  if (!data.success) throw toUserError(data.error || 'Falha ao salvar cultivo.')
  return data.cultivation
}

export async function updateCultivation(id: string, patch: Partial<CultivationInput>) {
  const res = await fetch(`/api/cultivation/${id}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(patch),
  })
  if (!res.ok) throw toUserError('Não foi possível atualizar o cultivo.')
  const data = await res.json()
  if (!data.success) throw toUserError(data.error || 'Falha ao atualizar cultivo.')
  return data.cultivation
}

export async function deleteCultivation(id: string) {
  const res = await fetch(`/api/cultivation/${id}`, { method: 'DELETE' })
  if (!res.ok) throw toUserError('Não foi possível excluir o cultivo.')
  return true
} 