import { z } from 'zod'

// Schema para autenticação
export const loginSchema = z.object({
    email: z.string().email('Email inválido').min(1, 'Email é obrigatório'),
    password: z.string().min(6, 'Senha deve ter pelo menos 6 caracteres'),
})

export const registerSchema = z.object({
    name: z.string().min(2, 'Nome deve ter pelo menos 2 caracteres').max(50, 'Nome muito longo'),
    email: z.string().email('Email inválido').min(1, 'Email é obrigatório'),
    password: z.string()
        .min(8, 'Senha deve ter pelo menos 8 caracteres')
        .regex(/[A-Z]/, 'Senha deve conter pelo menos uma letra maiúscula')
        .regex(/[a-z]/, 'Senha deve conter pelo menos uma letra minúscula')
        .regex(/\d/, 'Senha deve conter pelo menos um número')
        .regex(/[!@#$%^&*(),.?":{}|<>]/, 'Senha deve conter pelo menos um caractere especial'),
})

// Schema para cultivo
export const cultivationSchema = z.object({
    name: z.string().min(1, 'Nome é obrigatório').max(100, 'Nome muito longo'),
    seedStrain: z.string().min(1, 'Strain é obrigatória').max(50, 'Strain muito longa'),
    startDate: z.string().datetime('Data inválida'),
    area_m2: z.number().min(0.1, 'Área deve ser maior que 0.1m²').max(1000, 'Área muito grande'),
    potencia_watts: z.number().min(1, 'Potência deve ser maior que 0').max(10000, 'Potência muito alta'),
    num_plantas: z.number().int().min(1, 'Deve ter pelo menos 1 planta').max(1000, 'Muitas plantas'),
})

// Schema para eventos de cultivo
export const cultivationEventSchema = z.object({
    type: z.enum(['watering', 'feeding', 'pruning', 'harvest', 'problem', 'note']),
    title: z.string().min(1, 'Título é obrigatório').max(100, 'Título muito longo'),
    description: z.string().max(1000, 'Descrição muito longa').optional(),
    date: z.string().datetime('Data inválida'),
    cultivationId: z.string().cuid('ID de cultivo inválido'),
})

// Schema para parâmetros de setup
export const setupParamsSchema = z.object({
    area_m2: z.number().min(0.1).max(1000),
    custo_equip_iluminacao: z.number().min(0).max(100000),
    custo_tenda_estrutura: z.number().min(0).max(100000),
    custo_ventilacao_exaustao: z.number().min(0).max(100000),
    custo_outros_equipamentos: z.number().min(0).max(100000),
})

// Schema para parâmetros de ciclo
export const cycleParamsSchema = z.object({
    potencia_watts: z.number().int().min(1).max(10000),
    num_plantas: z.number().int().min(1).max(1000),
    producao_por_planta_g: z.number().min(1).max(10000),
    dias_vegetativo: z.number().int().min(1).max(365),
    horas_luz_veg: z.number().int().min(1).max(24),
    dias_floracao: z.number().int().min(1).max(365),
    horas_luz_flor: z.number().int().min(1).max(24),
    dias_secagem_cura: z.number().int().min(1).max(365),
})

// Schema para parâmetros de mercado
export const marketParamsSchema = z.object({
    preco_kwh: z.number().min(0).max(10),
    custo_sementes_clones: z.number().min(0).max(10000),
    custo_substrato: z.number().min(0).max(10000),
    custo_nutrientes: z.number().min(0).max(10000),
    custos_operacionais_misc: z.number().min(0).max(10000),
    preco_venda_por_grama: z.number().min(0).max(1000),
    preco_mercado_ilegal: z.number().min(0).max(1000),
})

// Tipos TypeScript derivados dos schemas
export type LoginInput = z.infer<typeof loginSchema>
export type RegisterInput = z.infer<typeof registerSchema>
export type CultivationInput = z.infer<typeof cultivationSchema>
export type CultivationEventInput = z.infer<typeof cultivationEventSchema>
export type SetupParamsInput = z.infer<typeof setupParamsSchema>
export type CycleParamsInput = z.infer<typeof cycleParamsSchema>
export type MarketParamsInput = z.infer<typeof marketParamsSchema>