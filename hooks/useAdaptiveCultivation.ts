import { useState, useEffect, useMemo } from 'react'
import { 
  PlantType, 
  AdaptiveCycleParams, 
  getCycleConfigFromGenetics,
  getDefaultCycleConfig,
  validateCycleConfig,
  calculateAdaptiveDuration
} from '@/types/plant-genetics'
import { 
  calculateCultivationPhase, 
  predictHarvestDate, 
  calculateCycleEfficiency,
  PhaseInfo,
  CultivationTimeline 
} from '@/lib/cultivation-phases'
import { calculateAdaptiveResults } from '@/lib/cultivation-calculator'

interface UseAdaptiveCultivationProps {
  cultivationId?: string
  startDate: string
  plantType?: PlantType
  geneticsName?: string
  customConfig?: Partial<AdaptiveCycleParams>
  setupParams?: any
  marketParams?: any
}

export function useAdaptiveCultivation({
  cultivationId,
  startDate,
  plantType = 'photoperiod',
  geneticsName,
  customConfig,
  setupParams,
  marketParams
}: UseAdaptiveCultivationProps) {
  const [config, setConfig] = useState<AdaptiveCycleParams>(() => {
    if (geneticsName) {
      return getCycleConfigFromGenetics(geneticsName, plantType, customConfig)
    }
    return getDefaultCycleConfig(plantType, customConfig)
  })

  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Calcular informações da fase atual
  const phaseInfo = useMemo<PhaseInfo>(() => {
    const customTimeline: Partial<CultivationTimeline> = {
      plantType: config.plant_type,
      vegetativeDays: config.dias_vegetativo,
      floweringDays: config.dias_floracao,
      dryingCuringDays: config.dias_secagem_cura,
      isAutoflowering: config.plant_type === 'autoflowering'
    }

    return calculateCultivationPhase(startDate, config.plant_type, customTimeline)
  }, [startDate, config])

  // Validar configuração
  const validation = useMemo(() => {
    return validateCycleConfig(config)
  }, [config])

  // Previsões de colheita
  const harvestPrediction = useMemo(() => {
    const customTimeline: Partial<CultivationTimeline> = {
      plantType: config.plant_type,
      vegetativeDays: config.dias_vegetativo,
      floweringDays: config.dias_floracao,
      dryingCuringDays: config.dias_secagem_cura,
      isAutoflowering: config.plant_type === 'autoflowering'
    }

    return predictHarvestDate(startDate, config.plant_type, customTimeline)
  }, [startDate, config])

  // Cálculos financeiros adaptativos
  const financialResults = useMemo(() => {
    if (!setupParams || !marketParams) return null

    try {
      return calculateAdaptiveResults(setupParams, config, marketParams)
    } catch (err) {
      console.error('Erro ao calcular resultados financeiros:', err)
      return null
    }
  }, [config, setupParams, marketParams])

  // Métricas de eficiência
  const efficiencyMetrics = useMemo(() => {
    const expectedYield = config.num_plantas * config.producao_por_planta_g
    return calculateCycleEfficiency(phaseInfo, config.plant_type, expectedYield)
  }, [phaseInfo, config])

  // Recomendações inteligentes baseadas no tipo de planta e fase
  const recommendations = useMemo(() => {
    const recs: string[] = []

    // Recomendações por tipo de planta
    if (config.plant_type === 'autoflowering') {
      if (phaseInfo.phase === 'vegetative' && phaseInfo.daysInCurrentPhase > 30) {
        recs.push('Automáticas normalmente iniciam floração automaticamente aos 25-30 dias')
      }
      if (config.horas_luz_veg !== config.horas_luz_flor) {
        recs.push('Automáticas podem usar fotoperíodo constante (18-24h) durante todo o ciclo')
      }
    } else if (config.plant_type === 'photoperiod') {
      if (phaseInfo.phase === 'vegetative' && phaseInfo.daysInCurrentPhase > 80) {
        recs.push('Considere induzir floração mudando para 12h luz/12h escuro')
      }
      if (config.horas_luz_flor !== 12) {
        recs.push('Fotoperiódicas necessitam 12h escuro para floração')
      }
    }

    // Recomendações por fase
    if (phaseInfo.phase === 'flowering' && phaseInfo.daysInCurrentPhase > config.dias_floracao + 14) {
      recs.push('Floração estendida - verifique tricomas para determinar o momento da colheita')
    }

    if (phaseInfo.phase === 'vegetative' && config.producao_por_planta_g > 150 && config.dias_vegetativo < 45) {
      recs.push('Para alta produção, considere vegetativo mais longo (60+ dias)')
    }

    // Adicionar recomendações de eficiência
    recs.push(...efficiencyMetrics.recommendations)

    // Adicionar avisos de validação
    recs.push(...validation.warnings)

    return [...new Set(recs)] // Remove duplicatas
  }, [config, phaseInfo, efficiencyMetrics, validation])

  // Função para atualizar configuração
  const updateConfig = (newConfig: Partial<AdaptiveCycleParams>) => {
    setConfig(prev => ({ ...prev, ...newConfig }))
  }

  // Função para aplicar preset de genética
  const applyGeneticsPreset = (geneticsName: string) => {
    setIsLoading(true)
    try {
      const geneticsConfig = getCycleConfigFromGenetics(geneticsName, config.plant_type)
      setConfig(geneticsConfig)
      setError(null)
    } catch (err) {
      setError('Erro ao aplicar preset de genética')
    } finally {
      setIsLoading(false)
    }
  }

  // Função para resetar para configuração padrão
  const resetToDefaults = (plantType: PlantType) => {
    setConfig(getDefaultCycleConfig(plantType))
  }

  // Cálculos auxiliares
  const totalDuration = calculateAdaptiveDuration(config)
  const cyclesPerYear = Math.floor(365 / totalDuration)
  const totalYearlyYield = (config.num_plantas * config.producao_por_planta_g) * cyclesPerYear

  // Comparação com métodos tradicionais
  const traditionalComparison = useMemo(() => {
    const traditionalCycle = getDefaultCycleConfig('photoperiod') // Ciclo padrão de 150 dias
    const traditionalDuration = calculateAdaptiveDuration(traditionalCycle)
    const traditionalCyclesPerYear = Math.floor(365 / traditionalDuration)
    
    const currentCyclesPerYear = Math.floor(365 / totalDuration)
    const timeAdvantage = ((currentCyclesPerYear - traditionalCyclesPerYear) / traditionalCyclesPerYear) * 100

    return {
      traditionalDuration,
      currentDuration: totalDuration,
      timeAdvantage: Math.round(timeAdvantage),
      moreCycles: currentCyclesPerYear - traditionalCyclesPerYear,
      recommendation: timeAdvantage > 20 ? 'Ciclo muito eficiente!' : 
                     timeAdvantage > 0 ? 'Bom aproveitamento do tempo' :
                     'Considere otimizar o tempo de ciclo'
    }
  }, [totalDuration])

  return {
    // Configuração atual
    config,
    updateConfig,
    validation,
    
    // Informações de fase
    phaseInfo,
    harvestPrediction,
    
    // Métricas e análises
    efficiencyMetrics,
    financialResults,
    recommendations,
    
    // Cálculos auxiliares
    totalDuration,
    cyclesPerYear,
    totalYearlyYield,
    traditionalComparison,
    
    // Ações
    applyGeneticsPreset,
    resetToDefaults,
    
    // Estado
    isLoading,
    error,
    
    // Flags úteis
    isAutoflowering: config.plant_type === 'autoflowering',
    isPhotoperiod: config.plant_type === 'photoperiod',
    isFastVersion: config.plant_type === 'fast_version',
    isActiveGrowth: ['germination', 'seedling', 'vegetative', 'flowering'].includes(phaseInfo.phase),
    isPostHarvest: ['drying', 'curing', 'completed'].includes(phaseInfo.phase),
    
    // Alertas críticos
    criticalAlerts: recommendations.filter(rec => 
      rec.includes('crítico') || 
      rec.includes('urgente') || 
      rec.includes('imediatamente')
    )
  }
}
