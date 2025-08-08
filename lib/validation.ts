import { z } from 'zod'

// Schemas de validação
export const CultivationSchema = z.object({
  id: z.string().uuid(),
  name: z.string().min(1, 'Nome é obrigatório').max(100, 'Nome muito longo'),
  type: z.enum(['indoor', 'outdoor', 'greenhouse']),
  startDate: z.date(),
  endDate: z.date().optional(),
  status: z.enum(['active', 'completed', 'cancelled']),
  area: z.number().positive('Área deve ser positiva'),
  expectedYield: z.number().positive('Produção esperada deve ser positiva'),
  costPerUnit: z.number().positive('Custo por unidade deve ser positivo'),
  notes: z.string().max(500, 'Notas muito longas').optional(),
  createdAt: z.date(),
  updatedAt: z.date(),
})

export const CycleSchema = z.object({
  id: z.string().uuid(),
  cultivationId: z.string().uuid(),
  phase: z.enum(['germination', 'vegetative', 'flowering', 'harvest']),
  startDate: z.date(),
  endDate: z.date().optional(),
  notes: z.string().max(500).optional(),
  costs: z.number().nonnegative(),
  observations: z.string().max(1000).optional(),
})

export const MarketDataSchema = z.object({
  id: z.string().uuid(),
  product: z.string().min(1, 'Produto é obrigatório'),
  price: z.number().positive('Preço deve ser positivo'),
  quantity: z.number().positive('Quantidade deve ser positiva'),
  date: z.date(),
  source: z.string().min(1, 'Fonte é obrigatória'),
})

export const ReportSchema = z.object({
  id: z.string().uuid(),
  title: z.string().min(1, 'Título é obrigatório').max(200),
  type: z.enum(['financial', 'technical', 'comparison', 'custom']),
  content: z.record(z.any()),
  createdAt: z.date(),
  updatedAt: z.date(),
})

// Tipos inferidos dos schemas
export type Cultivation = z.infer<typeof CultivationSchema>
export type Cycle = z.infer<typeof CycleSchema>
export type MarketData = z.infer<typeof MarketDataSchema>
export type Report = z.infer<typeof ReportSchema>

// Funções de validação
export function validateCultivation(data: unknown): Cultivation {
  return CultivationSchema.parse(data)
}

export function validateCycle(data: unknown): Cycle {
  return CycleSchema.parse(data)
}

export function validateMarketData(data: unknown): MarketData {
  return MarketDataSchema.parse(data)
}

export function validateReport(data: unknown): Report {
  return ReportSchema.parse(data)
}

// Funções de validação seguras (não lançam erro)
export function safeValidateCultivation(data: unknown): { success: true; data: Cultivation } | { success: false; error: string } {
  try {
    const result = CultivationSchema.parse(data)
    return { success: true, data: result }
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { success: false, error: error.errors.map(e => e.message).join(', ') }
    }
    return { success: false, error: 'Erro de validação desconhecido' }
  }
}

export function safeValidateCycle(data: unknown): { success: true; data: Cycle } | { success: false; error: string } {
  try {
    const result = CycleSchema.parse(data)
    return { success: true, data: result }
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { success: false, error: error.errors.map(e => e.message).join(', ') }
    }
    return { success: false, error: 'Erro de validação desconhecido' }
  }
}

// Validação de entrada de formulário
export const FormValidation = {
  cultivation: {
    name: z.string().min(1, 'Nome é obrigatório').max(100, 'Nome muito longo'),
    type: z.enum(['indoor', 'outdoor', 'greenhouse'], {
      errorMap: () => ({ message: 'Tipo inválido' })
    }),
    area: z.coerce.number().positive('Área deve ser positiva'),
    expectedYield: z.coerce.number().positive('Produção esperada deve ser positiva'),
    costPerUnit: z.coerce.number().positive('Custo por unidade deve ser positivo'),
  },
  cycle: {
    phase: z.enum(['germination', 'vegetative', 'flowering', 'harvest']),
    startDate: z.date(),
    costs: z.coerce.number().nonnegative('Custos não podem ser negativos'),
  },
  market: {
    product: z.string().min(1, 'Produto é obrigatório'),
    price: z.coerce.number().positive('Preço deve ser positivo'),
    quantity: z.coerce.number().positive('Quantidade deve ser positiva'),
    source: z.string().min(1, 'Fonte é obrigatória'),
  }
} 