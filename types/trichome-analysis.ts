// Tipos para análise de tricomas e maturação

export interface TrichomeAnalysis {
  clearTrichomes: number // %
  cloudyTrichomes: number // %
  amberTrichomes: number // %
  harvestRecommendation: {
    status: string
    urgency: 'low' | 'medium' | 'high' | 'critical'
    timeWindow: string
    confidence: number
  }
  effectProfile: 'energetic' | 'balanced' | 'couch-lock'
  confidence: number // % de confiança da análise
  analysisTimestamp: Date
  imageUrl: string
  cultivationId: string
  analysisNotes: string[]
}

export interface TrichomeDetection {
  totalTrichomesDetected: number
  clearCount: number
  cloudyCount: number
  amberCount: number
  imageQuality: 'excellent' | 'good' | 'fair' | 'poor'
  analysisRegions: Array<{
    x: number
    y: number
    width: number
    height: number
    trichomeType: 'clear' | 'cloudy' | 'amber'
    confidence: number
  }>
  overallConfidence: number
}

export interface HarvestRecommendation {
  readiness: 'too-early' | 'early' | 'optimal' | 'late' | 'overripe'
  daysToOptimal?: number
  thcPotentialLoss?: number // % se esperar mais
  recommendedAction: string
  effectDescription: string
  harvestUrgency: 'low' | 'medium' | 'high' | 'critical'
}

export interface ImgBBResponse {
  data: {
    id: string
    title: string
    url_viewer: string
    url: string
    display_url: string
    width: number
    height: number
    size: number
    time: number
    expiration: number
    image: {
      filename: string
      name: string
      mime: string
      extension: string
      url: string
    }
    thumb: {
      filename: string
      name: string
      mime: string
      extension: string
      url: string
    }
    medium: {
      filename: string
      name: string
      mime: string
      extension: string
      url: string
    }
    delete_url: string
  }
  success: boolean
  status: number
}

// Configurações para diferentes perfis de efeito
export const EFFECT_PROFILES = {
  energetic: {
    targetAmber: { min: 0, max: 10 },
    targetCloudy: { min: 70, max: 90 },
    targetClear: { max: 30 },
    description: 'Efeito cerebral energético, ideal para atividades diurnas',
    icon: '⚡',
    color: '#10B981'
  },
  balanced: {
    targetAmber: { min: 10, max: 30 },
    targetCloudy: { min: 60, max: 80 },
    targetClear: { max: 20 },
    description: 'Efeito equilibrado entre corpo e mente',
    icon: '⚖️',
    color: '#F59E0B'
  },
  'couch-lock': {
    targetAmber: { min: 30, max: 50 },
    targetCloudy: { min: 50, max: 70 },
    targetClear: { max: 10 },
    description: 'Efeito corporal relaxante, ideal para noite',
    icon: '😴',
    color: '#8B5CF6'
  }
} as const

// Funções utilitárias
export function calculateOptimalHarvest(
  analysis: TrichomeAnalysis,
  preferredEffect: keyof typeof EFFECT_PROFILES = 'balanced'
): HarvestRecommendation {
  const profile = EFFECT_PROFILES[preferredEffect]
  const { amberTrichomes, cloudyTrichomes, clearTrichomes } = analysis
  
  const isAmberInRange = amberTrichomes >= profile.targetAmber.min && 
                        amberTrichomes <= profile.targetAmber.max
  const isCloudyInRange = cloudyTrichomes >= profile.targetCloudy.min && 
                         cloudyTrichomes <= profile.targetCloudy.max
  const isClearAcceptable = clearTrichomes <= profile.targetClear.max
  
  if (isAmberInRange && isCloudyInRange && isClearAcceptable) {
    return {
      readiness: 'optimal',
      recommendedAction: `Ótimo momento para colher! Tricomas ideais para efeito ${preferredEffect}.`,
      effectDescription: profile.description,
      harvestUrgency: analysis.harvestRecommendation.urgency
    }
  }
  
  if (clearTrichomes > 40) {
    return {
      readiness: 'too-early',
      recommendedAction: 'Aguarde. Muitos tricomas ainda transparentes para colheita.',
      effectDescription: 'Efeito seria muito leve, baixa potência se colhido agora',
      harvestUrgency: 'low'
    }
  }
  
  if (amberTrichomes < profile.targetAmber.min) {
    return {
      readiness: 'early',
      recommendedAction: `Ainda pode aguardar para efeito mais ${preferredEffect === 'energetic' ? 'energético' : preferredEffect === 'balanced' ? 'equilibrado' : 'relaxante'}.`,
      effectDescription: 'Tricomas ainda amadurecendo',
      harvestUrgency: 'low'
    }
  }
  
  if (amberTrichomes > profile.targetAmber.max + 20) {
    const potencyLoss = Math.min((amberTrichomes - profile.targetAmber.max) * 1.5, 30)
    return {
      readiness: 'overripe',
      thcPotentialLoss: potencyLoss,
      recommendedAction: 'COLHA IMEDIATAMENTE! Perda significativa de THC',
      effectDescription: 'Muito sedativo, THC degradando para CBN',
      harvestUrgency: 'critical'
    }
  }
  
  if (amberTrichomes > profile.targetAmber.max) {
    const potencyLoss = Math.min((amberTrichomes - profile.targetAmber.max) * 1.2, 15)
    return {
      readiness: 'late',
      thcPotentialLoss: potencyLoss,
      recommendedAction: 'Colha nos próximos 1-2 dias',
      effectDescription: 'Mais sedativo que o ideal, alguma perda de THC',
      harvestUrgency: 'high'
    }
  }
  
  return {
    readiness: 'optimal',
    recommendedAction: 'Monitore diariamente e colha quando se sentir pronto',
    effectDescription: profile.description,
    harvestUrgency: 'medium'
  }
}

export function getTrichomeMaturityStage(analysis: TrichomeAnalysis): {
  stage: string
  color: string
  progress: number
} {
  const { clearTrichomes, cloudyTrichomes, amberTrichomes } = analysis
  
  if (clearTrichomes > 50) {
    return {
      stage: 'Imaturo - Muito cedo',
      color: '#EF4444',
      progress: 20
    }
  }
  
  if (clearTrichomes > 30) {
    return {
      stage: 'Desenvolvendo - Ainda cedo',
      color: '#F97316',
      progress: 40
    }
  }
  
  if (cloudyTrichomes > 70 && amberTrichomes < 10) {
    return {
      stage: 'Pico THC - Energético',
      color: '#10B981',
      progress: 75
    }
  }
  
  if (amberTrichomes > 10 && amberTrichomes < 30) {
    return {
      stage: 'Balanceado - Efeitos mistos',
      color: '#F59E0B',
      progress: 85
    }
  }
  
  if (amberTrichomes > 30 && amberTrichomes < 50) {
    return {
      stage: 'Maduro - Sedativo',
      color: '#8B5CF6',
      progress: 95
    }
  }
  
  if (amberTrichomes > 50) {
    return {
      stage: 'Muito maduro - Degradação',
      color: '#DC2626',
      progress: 100
    }
  }
  
  return {
    stage: 'Monitoramento necessário',
    color: '#6B7280',
    progress: 60
  }
}

// Função para salvar/carregar análises do localStorage
export function saveTrichomeAnalysis(analysis: TrichomeAnalysis): void {
  const key = `trichome_analyses_${analysis.cultivationId}`
  const existing = localStorage.getItem(key)
  const analyses = existing ? JSON.parse(existing) : []
  
  analyses.push(analysis)
  
  // Manter apenas as últimas 20 análises
  if (analyses.length > 20) {
    analyses.splice(0, analyses.length - 20)
  }
  
  localStorage.setItem(key, JSON.stringify(analyses))
}

export function loadTrichomeAnalyses(cultivationId: string): TrichomeAnalysis[] {
  const key = `trichome_analyses_${cultivationId}`
  const stored = localStorage.getItem(key)
  
  if (!stored) return []
  
  try {
    const analyses = JSON.parse(stored) as TrichomeAnalysis[]
    return analyses.map(analysis => ({
      ...analysis,
      analysisTimestamp: new Date(analysis.analysisTimestamp)
    }))
  } catch (error) {
    console.error('Erro ao carregar análises:', error)
    return []
  }
}

export function clearTrichomeAnalyses(cultivationId: string): void {
  const key = `trichome_analyses_${cultivationId}`
  localStorage.removeItem(key)
}
