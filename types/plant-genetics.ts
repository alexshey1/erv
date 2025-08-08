// Tipos para genéticas e ciclos adaptativos de cultivo

export type PlantType = 'photoperiod' | 'autoflowering' | 'fast_version'

export interface PlantGenetics {
  name: string
  type: PlantType
  indica_sativa_ratio: {
    indica: number
    sativa: number
    ruderalis?: number
  }
  flowering_time_range: {
    min_days: number
    max_days: number
  }
  vegetative_time_range?: {
    min_days: number
    max_days: number
  }
  total_cycle_range: {
    min_days: number
    max_days: number
  }
  expected_yield_range: {
    min_grams: number
    max_grams: number
  }
  light_requirements: {
    vegetative_hours: number
    flowering_hours: number
    auto_light_hours?: number // Para automáticas que podem usar 18-24h durante todo o ciclo
  }
  difficulty_level: 'beginner' | 'intermediate' | 'advanced'
  resistance_traits: {
    mold: number // 1-10
    pests: number // 1-10
    stress: number // 1-10
  }
  optimal_conditions: {
    temperature_range: { min: number; max: number }
    humidity_vegetative: { min: number; max: number }
    humidity_flowering: { min: number; max: number }
    ph_range: { min: number; max: number }
    ec_range: { min: number; max: number }
  }
}

export interface AdaptiveCycleParams {
  // Parâmetros básicos
  plant_type: PlantType
  genetics_name?: string
  
  // Ciclo adaptativo
  dias_vegetativo: number
  dias_floracao: number
  dias_secagem_cura: number
  
  // Configurações de luz adaptativas
  horas_luz_veg: number
  horas_luz_flor: number
  luz_constante_auto?: boolean // Para automáticas com luz constante
  
  // Parâmetros de crescimento
  potencia_watts: number
  num_plantas: number
  producao_por_planta_g: number
  
  // Flags de personalização
  ciclo_personalizado: boolean
  usar_presets_genetica: boolean
}

export interface CyclePreset {
  id: string
  name: string
  plant_type: PlantType
  description: string
  cycle_params: AdaptiveCycleParams
  typical_yield_range: { min: number; max: number }
  difficulty: 'easy' | 'medium' | 'hard'
  estimated_duration: number
}

// Presets de ciclos comuns
export const CYCLE_PRESETS: CyclePreset[] = [
  {
    id: 'auto_beginner',
    name: 'Automática - Iniciante',
    plant_type: 'autoflowering',
    description: 'Ciclo rápido de 70-85 dias, ideal para iniciantes',
    cycle_params: {
      plant_type: 'autoflowering',
      dias_vegetativo: 25,
      dias_floracao: 45,
      dias_secagem_cura: 15,
      horas_luz_veg: 20,
      horas_luz_flor: 20,
      luz_constante_auto: true,
      potencia_watts: 300,
      num_plantas: 4,
      producao_por_planta_g: 30,
      ciclo_personalizado: false,
      usar_presets_genetica: true
    },
    typical_yield_range: { min: 20, max: 50 },
    difficulty: 'easy',
    estimated_duration: 85
  },
  {
    id: 'photo_standard',
    name: 'Fotoperíodo - Padrão',
    plant_type: 'photoperiod',
    description: 'Ciclo clássico de 120-150 dias com máximo controle',
    cycle_params: {
      plant_type: 'photoperiod',
      dias_vegetativo: 55,
      dias_floracao: 70,
      dias_secagem_cura: 20,
      horas_luz_veg: 18,
      horas_luz_flor: 12,
      potencia_watts: 480,
      num_plantas: 6,
      producao_por_planta_g: 80,
      ciclo_personalizado: false,
      usar_presets_genetica: true
    },
    typical_yield_range: { min: 60, max: 120 },
    difficulty: 'medium',
    estimated_duration: 145
  },
  {
    id: 'fast_version',
    name: 'Fast Version',
    plant_type: 'fast_version',
    description: 'Fotoperíodo com floração acelerada',
    cycle_params: {
      plant_type: 'fast_version',
      dias_vegetativo: 40,
      dias_floracao: 50,
      dias_secagem_cura: 15,
      horas_luz_veg: 18,
      horas_luz_flor: 12,
      potencia_watts: 400,
      num_plantas: 6,
      producao_por_planta_g: 60,
      ciclo_personalizado: false,
      usar_presets_genetica: true
    },
    typical_yield_range: { min: 45, max: 85 },
    difficulty: 'medium',
    estimated_duration: 105
  },
  {
    id: 'sea_of_green',
    name: 'Sea of Green (SOG)',
    plant_type: 'photoperiod',
    description: 'Muitas plantas pequenas, ciclo vegetativo curto',
    cycle_params: {
      plant_type: 'photoperiod',
      dias_vegetativo: 21,
      dias_floracao: 70,
      dias_secagem_cura: 20,
      horas_luz_veg: 18,
      horas_luz_flor: 12,
      potencia_watts: 600,
      num_plantas: 16,
      producao_por_planta_g: 25,
      ciclo_personalizado: false,
      usar_presets_genetica: false
    },
    typical_yield_range: { min: 20, max: 35 },
    difficulty: 'hard',
    estimated_duration: 111
  },
  {
    id: 'scrog_extended',
    name: 'SCROG Estendido',
    plant_type: 'photoperiod',
    description: 'Vegetativo longo para plantas grandes',
    cycle_params: {
      plant_type: 'photoperiod',
      dias_vegetativo: 90,
      dias_floracao: 70,
      dias_secagem_cura: 20,
      horas_luz_veg: 18,
      horas_luz_flor: 12,
      potencia_watts: 600,
      num_plantas: 2,
      producao_por_planta_g: 200,
      ciclo_personalizado: false,
      usar_presets_genetica: false
    },
    typical_yield_range: { min: 150, max: 300 },
    difficulty: 'hard',
    estimated_duration: 180
  }
]

// Banco de dados básico de genéticas
export const GENETICS_DATABASE: Record<string, PlantGenetics> = {
  'og_kush': {
    name: 'OG Kush',
    type: 'photoperiod',
    indica_sativa_ratio: { indica: 75, sativa: 25 },
    flowering_time_range: { min_days: 56, max_days: 70 },
    vegetative_time_range: { min_days: 30, max_days: 90 },
    total_cycle_range: { min_days: 120, max_days: 180 },
    expected_yield_range: { min_grams: 60, max_grams: 120 },
    light_requirements: {
      vegetative_hours: 18,
      flowering_hours: 12
    },
    difficulty_level: 'intermediate',
    resistance_traits: { mold: 6, pests: 7, stress: 6 },
    optimal_conditions: {
      temperature_range: { min: 20, max: 26 },
      humidity_vegetative: { min: 60, max: 70 },
      humidity_flowering: { min: 40, max: 50 },
      ph_range: { min: 6.0, max: 6.5 },
      ec_range: { min: 1.0, max: 1.6 }
    }
  },
  'northern_lights_auto': {
    name: 'Northern Lights Auto',
    type: 'autoflowering',
    indica_sativa_ratio: { indica: 90, sativa: 10, ruderalis: 20 },
    flowering_time_range: { min_days: 35, max_days: 45 },
    vegetative_time_range: { min_days: 20, max_days: 30 },
    total_cycle_range: { min_days: 70, max_days: 85 },
    expected_yield_range: { min_grams: 25, max_grams: 60 },
    light_requirements: {
      vegetative_hours: 20,
      flowering_hours: 20,
      auto_light_hours: 20
    },
    difficulty_level: 'beginner',
    resistance_traits: { mold: 8, pests: 8, stress: 9 },
    optimal_conditions: {
      temperature_range: { min: 18, max: 24 },
      humidity_vegetative: { min: 60, max: 70 },
      humidity_flowering: { min: 45, max: 55 },
      ph_range: { min: 6.0, max: 6.5 },
      ec_range: { min: 0.8, max: 1.4 }
    }
  },
  'amnesia_haze': {
    name: 'Amnesia Haze',
    type: 'photoperiod',
    indica_sativa_ratio: { indica: 20, sativa: 80 },
    flowering_time_range: { min_days: 70, max_days: 84 },
    vegetative_time_range: { min_days: 45, max_days: 120 },
    total_cycle_range: { min_days: 140, max_days: 220 },
    expected_yield_range: { min_grams: 80, max_grams: 180 },
    light_requirements: {
      vegetative_hours: 18,
      flowering_hours: 12
    },
    difficulty_level: 'advanced',
    resistance_traits: { mold: 4, pests: 5, stress: 4 },
    optimal_conditions: {
      temperature_range: { min: 22, max: 28 },
      humidity_vegetative: { min: 60, max: 75 },
      humidity_flowering: { min: 35, max: 45 },
      ph_range: { min: 6.0, max: 6.8 },
      ec_range: { min: 1.2, max: 1.8 }
    }
  },
  'gorilla_glue_4': {
    name: 'Gorilla Glue #4',
    type: 'photoperiod',
    indica_sativa_ratio: { indica: 63, sativa: 37 },
    flowering_time_range: { min_days: 56, max_days: 63 },
    vegetative_time_range: { min_days: 30, max_days: 80 },
    total_cycle_range: { min_days: 110, max_days: 160 },
    expected_yield_range: { min_grams: 70, max_grams: 150 },
    light_requirements: {
      vegetative_hours: 18,
      flowering_hours: 12
    },
    difficulty_level: 'intermediate',
    resistance_traits: { mold: 7, pests: 8, stress: 7 },
    optimal_conditions: {
      temperature_range: { min: 21, max: 27 },
      humidity_vegetative: { min: 55, max: 65 },
      humidity_flowering: { min: 40, max: 50 },
      ph_range: { min: 6.0, max: 6.5 },
      ec_range: { min: 1.0, max: 1.6 }
    }
  },
  'white_widow_auto': {
    name: 'White Widow Auto',
    type: 'autoflowering',
    indica_sativa_ratio: { indica: 60, sativa: 40, ruderalis: 25 },
    flowering_time_range: { min_days: 42, max_days: 52 },
    vegetative_time_range: { min_days: 25, max_days: 35 },
    total_cycle_range: { min_days: 80, max_days: 95 },
    expected_yield_range: { min_grams: 30, max_grams: 80 },
    light_requirements: {
      vegetative_hours: 20,
      flowering_hours: 20,
      auto_light_hours: 18
    },
    difficulty_level: 'beginner',
    resistance_traits: { mold: 7, pests: 7, stress: 8 },
    optimal_conditions: {
      temperature_range: { min: 20, max: 25 },
      humidity_vegetative: { min: 60, max: 70 },
      humidity_flowering: { min: 45, max: 55 },
      ph_range: { min: 6.0, max: 6.5 },
      ec_range: { min: 0.9, max: 1.5 }
    }
  }
}

// Função para obter configurações de ciclo baseadas na genética
export function getCycleConfigFromGenetics(
  geneticsName: string,
  plantType: PlantType,
  customizations?: Partial<AdaptiveCycleParams>
): AdaptiveCycleParams {
  const genetics = GENETICS_DATABASE[geneticsName.toLowerCase().replace(/\s+/g, '_')]
  
  if (!genetics) {
    // Fallback para configurações padrão baseadas no tipo
    return getDefaultCycleConfig(plantType, customizations)
  }
  
  const baseConfig: AdaptiveCycleParams = {
    plant_type: genetics.type,
    genetics_name: genetics.name,
    dias_vegetativo: genetics.vegetative_time_range 
      ? Math.round((genetics.vegetative_time_range.min_days + genetics.vegetative_time_range.max_days) / 2)
      : (genetics.type === 'autoflowering' ? 25 : 60),
    dias_floracao: Math.round((genetics.flowering_time_range.min_days + genetics.flowering_time_range.max_days) / 2),
    dias_secagem_cura: 20,
    horas_luz_veg: genetics.light_requirements.vegetative_hours,
    horas_luz_flor: genetics.light_requirements.flowering_hours,
    luz_constante_auto: genetics.type === 'autoflowering',
    potencia_watts: genetics.type === 'autoflowering' ? 300 : 480,
    num_plantas: genetics.type === 'autoflowering' ? 4 : 6,
    producao_por_planta_g: Math.round((genetics.expected_yield_range.min_grams + genetics.expected_yield_range.max_grams) / 2),
    ciclo_personalizado: false,
    usar_presets_genetica: true
  }
  
  return { ...baseConfig, ...customizations }
}

// Função para configurações padrão por tipo de planta
export function getDefaultCycleConfig(
  plantType: PlantType,
  customizations?: Partial<AdaptiveCycleParams>
): AdaptiveCycleParams {
  const defaultConfigs = {
    photoperiod: {
      plant_type: 'photoperiod' as PlantType,
      dias_vegetativo: 55,
      dias_floracao: 70,
      dias_secagem_cura: 20,
      horas_luz_veg: 18,
      horas_luz_flor: 12,
      potencia_watts: 480,
      num_plantas: 6,
      producao_por_planta_g: 80,
      ciclo_personalizado: false,
      usar_presets_genetica: false
    },
    autoflowering: {
      plant_type: 'autoflowering' as PlantType,
      dias_vegetativo: 25,
      dias_floracao: 45,
      dias_secagem_cura: 15,
      horas_luz_veg: 20,
      horas_luz_flor: 20,
      luz_constante_auto: true,
      potencia_watts: 300,
      num_plantas: 4,
      producao_por_planta_g: 35,
      ciclo_personalizado: false,
      usar_presets_genetica: false
    },
    fast_version: {
      plant_type: 'fast_version' as PlantType,
      dias_vegetativo: 40,
      dias_floracao: 50,
      dias_secagem_cura: 15,
      horas_luz_veg: 18,
      horas_luz_flor: 12,
      potencia_watts: 400,
      num_plantas: 6,
      producao_por_planta_g: 60,
      ciclo_personalizado: false,
      usar_presets_genetica: false
    }
  }
  
  return { ...defaultConfigs[plantType], ...customizations }
}

// Função para calcular duração total adaptativa
export function calculateAdaptiveDuration(cycleParams: AdaptiveCycleParams): number {
  return cycleParams.dias_vegetativo + cycleParams.dias_floracao + cycleParams.dias_secagem_cura
}

// Função para validar se uma configuração faz sentido
export function validateCycleConfig(cycleParams: AdaptiveCycleParams): { valid: boolean; warnings: string[] } {
  const warnings: string[] = []
  
  // Validações por tipo de planta
  if (cycleParams.plant_type === 'autoflowering') {
    if (cycleParams.dias_vegetativo > 35) {
      warnings.push('Automáticas raramente precisam de mais de 35 dias vegetativos')
    }
    if (cycleParams.horas_luz_veg !== cycleParams.horas_luz_flor) {
      warnings.push('Automáticas podem usar o mesmo fotoperíodo durante todo o ciclo')
    }
    if (calculateAdaptiveDuration(cycleParams) > 100) {
      warnings.push('Ciclo muito longo para uma automática (tipicamente 70-95 dias)')
    }
  }
  
  if (cycleParams.plant_type === 'photoperiod') {
    if (cycleParams.horas_luz_flor !== 12) {
      warnings.push('Fotoperíodo de floração padrão é 12h para plantas fotoperiódicas')
    }
    if (cycleParams.dias_vegetativo < 21) {
      warnings.push('Vegetativo muito curto pode limitar o desenvolvimento')
    }
  }
  
  // Validações gerais
  if (cycleParams.producao_por_planta_g > 300) {
    warnings.push('Produção por planta muito alta - verifique se é realista')
  }
  
  if (cycleParams.dias_floracao < 35) {
    warnings.push('Floração muito curta - pode afetar a qualidade')
  }
  
  return {
    valid: warnings.length === 0,
    warnings
  }
}
