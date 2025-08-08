import { PlantType } from '@/types/plant-genetics'

export type CultivationPhase = 'germination' | 'seedling' | 'vegetative' | 'flowering' | 'drying' | 'curing' | 'completed'

export interface PhaseInfo {
  phase: CultivationPhase
  daysSinceStart: number
  daysInCurrentPhase: number
  totalCycleDays: number
  progressPercent: number
  expectedRemainingDays: number
  nextPhase?: CultivationPhase
  phaseDescription: string
}

export interface CultivationTimeline {
  plantType: PlantType
  vegetativeDays: number
  floweringDays: number
  dryingCuringDays: number
  totalDays: number
  isAutoflowering: boolean
}

// Função para calcular a fase atual baseada no tipo de planta e configurações específicas
export function calculateCultivationPhase(
  startDate: string,
  plantType: PlantType = 'photoperiod',
  customTimeline?: Partial<CultivationTimeline>,
  currentDate: Date = new Date()
): PhaseInfo {
  const start = new Date(startDate)
  const daysSinceStart = Math.floor((currentDate.getTime() - start.getTime()) / (1000 * 60 * 60 * 24))
  
  // Configurar cronograma baseado no tipo de planta
  const timeline: CultivationTimeline = {
    plantType,
    vegetativeDays: getDefaultVegetativeDays(plantType),
    floweringDays: getDefaultFloweringDays(plantType),
    dryingCuringDays: getDefaultDryingCuringDays(plantType),
    totalDays: 0,
    isAutoflowering: plantType === 'autoflowering',
    ...customTimeline
  }
  
  timeline.totalDays = timeline.vegetativeDays + timeline.floweringDays + timeline.dryingCuringDays
  
  // Determinar fase atual
  let phase: CultivationPhase
  let daysInCurrentPhase: number
  let nextPhase: CultivationPhase | undefined
  let phaseDescription: string
  
  if (daysSinceStart <= 7) {
    phase = 'germination'
    daysInCurrentPhase = daysSinceStart
    nextPhase = 'seedling'
    phaseDescription = 'Germinação das sementes'
  } else if (daysSinceStart <= 14) {
    phase = 'seedling'
    daysInCurrentPhase = daysSinceStart - 7
    nextPhase = 'vegetative'
    phaseDescription = 'Desenvolvimento inicial das mudas'
  } else if (daysSinceStart <= 14 + timeline.vegetativeDays) {
    phase = 'vegetative'
    daysInCurrentPhase = daysSinceStart - 14
    nextPhase = 'flowering'
    phaseDescription = timeline.isAutoflowering 
      ? 'Crescimento vegetativo (automática)' 
      : 'Crescimento vegetativo'
  } else if (daysSinceStart <= 14 + timeline.vegetativeDays + timeline.floweringDays) {
    phase = 'flowering'
    daysInCurrentPhase = daysSinceStart - (14 + timeline.vegetativeDays)
    nextPhase = 'drying'
    phaseDescription = timeline.isAutoflowering 
      ? 'Floração automática' 
      : 'Floração (12h luz/12h escuro)'
  } else if (daysSinceStart <= timeline.totalDays + 14) {
    const dryingStart = 14 + timeline.vegetativeDays + timeline.floweringDays
    const dryingDays = Math.min(timeline.dryingCuringDays * 0.6, 15) // ~60% para secagem
    
    if (daysSinceStart <= dryingStart + dryingDays) {
      phase = 'drying'
      daysInCurrentPhase = daysSinceStart - dryingStart
      nextPhase = 'curing'
      phaseDescription = 'Secagem pós-colheita'
    } else {
      phase = 'curing'
      daysInCurrentPhase = daysSinceStart - (dryingStart + dryingDays)
      nextPhase = 'completed'
      phaseDescription = 'Cura para melhor qualidade'
    }
  } else {
    phase = 'completed'
    daysInCurrentPhase = daysSinceStart - (timeline.totalDays + 14)
    phaseDescription = 'Ciclo completado'
  }
  
  const progressPercent = Math.min(100, (daysSinceStart / (timeline.totalDays + 14)) * 100)
  const expectedRemainingDays = Math.max(0, (timeline.totalDays + 14) - daysSinceStart)
  
  return {
    phase,
    daysSinceStart,
    daysInCurrentPhase,
    totalCycleDays: timeline.totalDays + 14,
    progressPercent,
    expectedRemainingDays,
    nextPhase,
    phaseDescription
  }
}

// Funções auxiliares para configurações padrão por tipo de planta
function getDefaultVegetativeDays(plantType: PlantType): number {
  switch (plantType) {
    case 'autoflowering':
      return 25
    case 'fast_version':
      return 45
    case 'photoperiod':
    default:
      return 60
  }
}

function getDefaultFloweringDays(plantType: PlantType): number {
  switch (plantType) {
    case 'autoflowering':
      return 45
    case 'fast_version':
      return 50
    case 'photoperiod':
    default:
      return 70
  }
}

function getDefaultDryingCuringDays(plantType: PlantType): number {
  switch (plantType) {
    case 'autoflowering':
      return 15
    case 'fast_version':
      return 15
    case 'photoperiod':
    default:
      return 20
  }
}

// Função para obter configurações específicas baseadas em genética
export function getGeneticsBasedTimeline(geneticsName: string, plantType: PlantType): Partial<CultivationTimeline> {
  // Banco de dados simplificado - pode ser expandido
  const geneticsConfig: Record<string, Partial<CultivationTimeline>> = {
    'northern_lights_auto': {
      plantType: 'autoflowering',
      vegetativeDays: 25,
      floweringDays: 40,
      dryingCuringDays: 15,
      isAutoflowering: true
    },
    'white_widow_auto': {
      plantType: 'autoflowering',
      vegetativeDays: 30,
      floweringDays: 45,
      dryingCuringDays: 15,
      isAutoflowering: true
    },
    'og_kush': {
      plantType: 'photoperiod',
      vegetativeDays: 60,
      floweringDays: 65,
      dryingCuringDays: 20,
      isAutoflowering: false
    },
    'amnesia_haze': {
      plantType: 'photoperiod',
      vegetativeDays: 70,
      floweringDays: 77,
      dryingCuringDays: 20,
      isAutoflowering: false
    },
    'gorilla_glue_4': {
      plantType: 'photoperiod',
      vegetativeDays: 55,
      floweringDays: 60,
      dryingCuringDays: 20,
      isAutoflowering: false
    }
  }
  
  const key = geneticsName.toLowerCase().replace(/\s+/g, '_').replace('#', '')
  return geneticsConfig[key] || {}
}

// Função para determinar se é hora de mudar de fase manualmente (para fotoperiódicas)
export function shouldTransitionToFlowering(
  phaseInfo: PhaseInfo,
  plantType: PlantType,
  manualTransition: boolean = false
): boolean {
  if (plantType === 'autoflowering') {
    return false // Automáticas transitam sozinhas
  }
  
  if (phaseInfo.phase === 'vegetative') {
    if (manualTransition) {
      return true // Grower decidiu fazer a transição
    }
    
    // Sugerir transição baseada no tempo
    if (phaseInfo.daysInCurrentPhase >= 45) {
      return true // Tempo mínimo recomendado
    }
  }
  
  return false
}

// Função para calcular eficiência do ciclo
export function calculateCycleEfficiency(
  phaseInfo: PhaseInfo,
  plantType: PlantType,
  expectedYield: number,
  actualYield?: number
): {
  timeEfficiency: number
  yieldEfficiency?: number
  overallScore: number
  recommendations: string[]
} {
  const recommendations: string[] = []
  
  // Eficiência temporal
  const expectedDuration = getDefaultVegetativeDays(plantType) + getDefaultFloweringDays(plantType) + getDefaultDryingCuringDays(plantType) + 14
  const timeEfficiency = Math.min(100, (expectedDuration / phaseInfo.totalCycleDays) * 100)
  
  if (timeEfficiency < 90) {
    recommendations.push('Ciclo mais longo que o esperado - revisar condições de crescimento')
  }
  
  // Eficiência de rendimento (se fornecida)
  let yieldEfficiency: number | undefined
  if (actualYield !== undefined) {
    yieldEfficiency = Math.min(100, (actualYield / expectedYield) * 100)
    
    if (yieldEfficiency < 70) {
      recommendations.push('Rendimento abaixo do esperado - verificar nutrição e iluminação')
    } else if (yieldEfficiency > 120) {
      recommendations.push('Excelente rendimento! Considere replicar essas condições')
    }
  }
  
  const overallScore = yieldEfficiency !== undefined 
    ? (timeEfficiency + yieldEfficiency) / 2 
    : timeEfficiency
  
  // Recomendações específicas por tipo
  if (plantType === 'autoflowering') {
    if (phaseInfo.totalCycleDays > 100) {
      recommendations.push('Automáticas normalmente completam em 70-95 dias')
    }
  } else if (plantType === 'photoperiod') {
    if (phaseInfo.phase === 'vegetative' && phaseInfo.daysInCurrentPhase > 90) {
      recommendations.push('Considere induzir floração se as plantas atingiram o tamanho desejado')
    }
  }
  
  return {
    timeEfficiency,
    yieldEfficiency,
    overallScore,
    recommendations
  }
}

// Função para prever data de colheita
export function predictHarvestDate(
  startDate: string,
  plantType: PlantType,
  customTimeline?: Partial<CultivationTimeline>
): {
  estimatedHarvestDate: Date
  estimatedDryDate: Date
  estimatedCureDate: Date
  totalDays: number
  confidence: 'high' | 'medium' | 'low'
} {
  const timeline: CultivationTimeline = {
    plantType,
    vegetativeDays: getDefaultVegetativeDays(plantType),
    floweringDays: getDefaultFloweringDays(plantType),
    dryingCuringDays: getDefaultDryingCuringDays(plantType),
    totalDays: 0,
    isAutoflowering: plantType === 'autoflowering',
    ...customTimeline
  }
  
  timeline.totalDays = timeline.vegetativeDays + timeline.floweringDays + timeline.dryingCuringDays
  
  const start = new Date(startDate)
  const germinationSeedlingDays = 14
  
  const harvestDays = germinationSeedlingDays + timeline.vegetativeDays + timeline.floweringDays
  const dryDays = Math.floor(timeline.dryingCuringDays * 0.6)
  const totalDays = timeline.totalDays + germinationSeedlingDays
  
  const estimatedHarvestDate = new Date(start.getTime() + harvestDays * 24 * 60 * 60 * 1000)
  const estimatedDryDate = new Date(estimatedHarvestDate.getTime() + dryDays * 24 * 60 * 60 * 1000)
  const estimatedCureDate = new Date(start.getTime() + totalDays * 24 * 60 * 60 * 1000)
  
  // Confiança baseada no tipo de planta
  let confidence: 'high' | 'medium' | 'low'
  if (plantType === 'autoflowering') {
    confidence = 'high' // Automáticas são mais previsíveis
  } else if (plantType === 'fast_version') {
    confidence = 'medium'
  } else {
    confidence = customTimeline ? 'medium' : 'low' // Fotoperiódicas dependem do grower
  }
  
  return {
    estimatedHarvestDate,
    estimatedDryDate,
    estimatedCureDate,
    totalDays,
    confidence
  }
}
