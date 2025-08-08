import { PlantType, AdaptiveCycleParams } from '@/types/plant-genetics'

export interface SetupParams {
  area_m2: number
  custo_equip_iluminacao: number
  custo_tenda_estrutura: number
  custo_ventilacao_exaustao: number
  custo_outros_equipamentos: number
}

export interface CycleParams {
  potencia_watts: number
  num_plantas: number
  producao_por_planta_g: number
  dias_vegetativo: number
  horas_luz_veg: number
  dias_floracao: number
  horas_luz_flor: number
  dias_secagem_cura: number
  // Novos campos para suporte adaptativo
  plant_type?: PlantType
  genetics_name?: string
  luz_constante_auto?: boolean
}

export interface MarketParams {
  preco_kwh: number
  custo_sementes_clones: number
  custo_substrato: number
  custo_nutrientes: number
  custos_operacionais_misc: number
  preco_venda_por_grama: number
}

export interface CalculationResults {
  custo_total_investimento: number
  custo_operacional_total_ciclo: number
  receita_bruta_ciclo: number
  lucro_liquido_ciclo: number
  custo_por_grama: number
  gramas_por_watt: number
  gramas_por_m2: number
  periodo_payback_ciclos: number
  roi_investimento_1_ano: number
  duracao_total_ciclo: number
  detalhe_custos_operacionais: Record<string, number>
}

export function calculateResults(setup: SetupParams, cycle: CycleParams, market: MarketParams): CalculationResults {
  // Custos de Investimento
  const custo_total_investimento =
    setup.custo_equip_iluminacao +
    setup.custo_tenda_estrutura +
    setup.custo_ventilacao_exaustao +
    setup.custo_outros_equipamentos

  // Custos Operacionais por Ciclo
  // Calcular consumo de energia adaptativo baseado no tipo de planta
  let consumo_kwh_veg: number
  let consumo_kwh_flor: number
  
  if (cycle.plant_type === 'autoflowering' && cycle.luz_constante_auto) {
    // Para automáticas com luz constante, usar o mesmo fotoperíodo durante todo o ciclo
    const horas_luz_auto = cycle.horas_luz_veg || 20
    consumo_kwh_veg = (cycle.potencia_watts / 1000) * horas_luz_auto * cycle.dias_vegetativo
    consumo_kwh_flor = (cycle.potencia_watts / 1000) * horas_luz_auto * cycle.dias_floracao
  } else {
    // Cálculo tradicional para fotoperiódicas
    consumo_kwh_veg = (cycle.potencia_watts / 1000) * cycle.horas_luz_veg * cycle.dias_vegetativo
    consumo_kwh_flor = (cycle.potencia_watts / 1000) * cycle.horas_luz_flor * cycle.dias_floracao
  }
  
  const custo_energia = (consumo_kwh_veg + consumo_kwh_flor) * market.preco_kwh

  const detalhe_custos_operacionais = {
    "Energia Elétrica": custo_energia,
    "Sementes/Clones": market.custo_sementes_clones,
    Substrato: market.custo_substrato,
    Nutrientes: market.custo_nutrientes,
    "Outros Custos": market.custos_operacionais_misc,
  }

  const custo_operacional_total_ciclo = Object.values(detalhe_custos_operacionais).reduce((a, b) => a + b, 0)

  // Produção e Receita por Ciclo
  const producao_total_g = cycle.num_plantas * cycle.producao_por_planta_g
  const receita_bruta_ciclo = producao_total_g * market.preco_venda_por_grama
  const lucro_liquido_ciclo = receita_bruta_ciclo - custo_operacional_total_ciclo

  // Métricas de Eficiência e Negócio
  const custo_por_grama = producao_total_g > 0 ? custo_operacional_total_ciclo / producao_total_g : 0
  const gramas_por_watt = cycle.potencia_watts > 0 ? producao_total_g / cycle.potencia_watts : 0
  const gramas_por_m2 = setup.area_m2 > 0 ? producao_total_g / setup.area_m2 : 0

  // Análise de Payback e ROI
  const duracao_total_ciclo = cycle.dias_vegetativo + cycle.dias_floracao + cycle.dias_secagem_cura
  const periodo_payback_ciclos =
    lucro_liquido_ciclo > 0 ? custo_total_investimento / lucro_liquido_ciclo : Number.POSITIVE_INFINITY
  const ciclos_por_ano = 365 / duracao_total_ciclo
  const lucro_anual = lucro_liquido_ciclo * ciclos_por_ano
  const roi_investimento_1_ano =
    custo_total_investimento > 0 ? ((lucro_anual - custo_total_investimento) / custo_total_investimento) * 100 : 0

  return {
    custo_total_investimento,
    custo_operacional_total_ciclo,
    receita_bruta_ciclo,
    lucro_liquido_ciclo,
    custo_por_grama,
    gramas_por_watt,
    gramas_por_m2,
    periodo_payback_ciclos,
    roi_investimento_1_ano,
    duracao_total_ciclo,
    detalhe_custos_operacionais,
  }
}

// Nova função para calcular resultados com base em parâmetros adaptativos
export function calculateAdaptiveResults(
  setup: SetupParams, 
  adaptiveCycle: AdaptiveCycleParams, 
  market: MarketParams
): CalculationResults & { 
  cycle_efficiency: {
    cycles_per_year: number
    daily_yield: number
    energy_efficiency: number
    space_efficiency: number
  }
  plant_type_metrics: {
    type: PlantType
    genetics?: string
    typical_range_min: number
    typical_range_max: number
    difficulty_bonus: number
  }
} {
  // Converter parâmetros adaptativos para o formato tradicional
  const traditionalCycle: CycleParams = {
    potencia_watts: adaptiveCycle.potencia_watts,
    num_plantas: adaptiveCycle.num_plantas,
    producao_por_planta_g: adaptiveCycle.producao_por_planta_g,
    dias_vegetativo: adaptiveCycle.dias_vegetativo,
    horas_luz_veg: adaptiveCycle.horas_luz_veg,
    dias_floracao: adaptiveCycle.dias_floracao,
    horas_luz_flor: adaptiveCycle.horas_luz_flor,
    dias_secagem_cura: adaptiveCycle.dias_secagem_cura,
    plant_type: adaptiveCycle.plant_type,
    genetics_name: adaptiveCycle.genetics_name,
    luz_constante_auto: adaptiveCycle.luz_constante_auto
  }

  const baseResults = calculateResults(setup, traditionalCycle, market)
  
  // Calcular métricas específicas para ciclos adaptativos
  const cycle_efficiency = {
    cycles_per_year: 365 / baseResults.duracao_total_ciclo,
    daily_yield: (adaptiveCycle.num_plantas * adaptiveCycle.producao_por_planta_g) / baseResults.duracao_total_ciclo,
    energy_efficiency: baseResults.gramas_por_watt,
    space_efficiency: baseResults.gramas_por_m2
  }

  // Métricas específicas por tipo de planta
  const plant_type_metrics = {
    type: adaptiveCycle.plant_type,
    genetics: adaptiveCycle.genetics_name,
    typical_range_min: adaptiveCycle.plant_type === 'autoflowering' ? 20 : 60,
    typical_range_max: adaptiveCycle.plant_type === 'autoflowering' ? 60 : 150,
    difficulty_bonus: adaptiveCycle.plant_type === 'autoflowering' ? 1.1 : 1.0 // Automáticas são mais fáceis
  }

  return {
    ...baseResults,
    cycle_efficiency,
    plant_type_metrics
  }
}
