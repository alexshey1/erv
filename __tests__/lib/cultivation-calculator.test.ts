import { calculateResults } from '@/lib/cultivation-calculator'

describe('Cultivation Calculator', () => {
  const defaultSetupParams = {
    area_m2: 2.25,
    custo_equip_iluminacao: 2000,
    custo_tenda_estrutura: 1500,
    custo_ventilacao_exaustao: 800,
    custo_outros_equipamentos: 500,
  }

  const defaultCycleParams = {
    potencia_watts: 480,
    num_plantas: 6,
    producao_por_planta_g: 80,
    dias_vegetativo: 60,
    horas_luz_veg: 18,
    dias_floracao: 70,
    horas_luz_flor: 12,
    dias_secagem_cura: 20,
  }

  const defaultMarketParams = {
    preco_kwh: 0.95,
    custo_sementes_clones: 500,
    custo_substrato: 120,
    custo_nutrientes: 350,
    custos_operacionais_misc: 100,
    preco_venda_por_grama: 45,
    preco_mercado_ilegal: 35,
  }

  it('should calculate total investment cost correctly', () => {
    const results = calculateResults(defaultSetupParams, defaultCycleParams, defaultMarketParams)
    
    const expectedInvestment = 2000 + 1500 + 800 + 500
    expect(results.custo_total_investimento).toBe(expectedInvestment)
  })

  it('should calculate total cycle duration correctly', () => {
    const results = calculateResults(defaultSetupParams, defaultCycleParams, defaultMarketParams)
    
    const expectedDuration = 60 + 70 + 20 // veg + flower + drying
    expect(results.duracao_total_ciclo).toBe(expectedDuration)
  })

  it('should calculate total production correctly', () => {
    const results = calculateResults(defaultSetupParams, defaultCycleParams, defaultMarketParams)
    
    const expectedProduction = 6 * 80 // num_plantas * producao_por_planta_g
    // A função não retorna producao_total_g diretamente, mas podemos calcular através da receita
    const calculatedProduction = results.receita_bruta_ciclo / defaultMarketParams.preco_venda_por_grama
    expect(calculatedProduction).toBe(expectedProduction)
  })

  it('should calculate electricity cost correctly', () => {
    const results = calculateResults(defaultSetupParams, defaultCycleParams, defaultMarketParams)
    
    // Vegetativo: 480W * 18h * 60 dias * 0.95 / 1000
    const vegCost = (480 * 18 * 60 * 0.95) / 1000
    // Floração: 480W * 12h * 70 dias * 0.95 / 1000
    const flowerCost = (480 * 12 * 70 * 0.95) / 1000
    const expectedElectricityCost = vegCost + flowerCost
    
    expect(results.detalhe_custos_operacionais['Energia Elétrica']).toBeCloseTo(expectedElectricityCost, 2)
  })

  it('should calculate operational costs correctly', () => {
    const results = calculateResults(defaultSetupParams, defaultCycleParams, defaultMarketParams)
    
    const expectedOperationalCosts = 
      results.detalhe_custos_operacionais['Energia Elétrica'] +
      500 + // sementes
      120 + // substrato
      350 + // nutrientes
      100   // misc
    
    expect(results.custo_operacional_total_ciclo).toBeCloseTo(expectedOperationalCosts, 2)
  })

  it('should calculate gross revenue correctly', () => {
    const results = calculateResults(defaultSetupParams, defaultCycleParams, defaultMarketParams)
    
    const expectedRevenue = (6 * 80) * 45 // production * price per gram
    expect(results.receita_bruta_ciclo).toBe(expectedRevenue)
  })

  it('should calculate net profit correctly', () => {
    const results = calculateResults(defaultSetupParams, defaultCycleParams, defaultMarketParams)
    
    const expectedProfit = results.receita_bruta_ciclo - results.custo_operacional_total_ciclo
    expect(results.lucro_liquido_ciclo).toBeCloseTo(expectedProfit, 2)
  })

  it('should calculate cost per gram correctly', () => {
    const results = calculateResults(defaultSetupParams, defaultCycleParams, defaultMarketParams)
    
    const expectedCostPerGram = results.custo_operacional_total_ciclo / (6 * 80)
    expect(results.custo_por_grama).toBeCloseTo(expectedCostPerGram, 2)
  })

  it('should calculate grams per watt correctly', () => {
    const results = calculateResults(defaultSetupParams, defaultCycleParams, defaultMarketParams)
    
    const expectedGramsPerWatt = (6 * 80) / 480
    expect(results.gramas_por_watt).toBeCloseTo(expectedGramsPerWatt, 2)
  })

  it('should calculate grams per m2 correctly', () => {
    const results = calculateResults(defaultSetupParams, defaultCycleParams, defaultMarketParams)
    
    const expectedGramsPerM2 = (6 * 80) / 2.25
    expect(results.gramas_por_m2).toBeCloseTo(expectedGramsPerM2, 2)
  })

  it('should calculate payback period correctly', () => {
    const results = calculateResults(defaultSetupParams, defaultCycleParams, defaultMarketParams)
    
    const expectedPayback = results.custo_total_investimento / results.lucro_liquido_ciclo
    expect(results.periodo_payback_ciclos).toBeCloseTo(expectedPayback, 2)
  })

  it('should handle zero investment costs', () => {
    const zeroSetupParams = {
      ...defaultSetupParams,
      custo_equip_iluminacao: 0,
      custo_tenda_estrutura: 0,
      custo_ventilacao_exaustao: 0,
      custo_outros_equipamentos: 0,
    }
    
    const results = calculateResults(zeroSetupParams, defaultCycleParams, defaultMarketParams)
    
    expect(results.custo_total_investimento).toBe(0)
    expect(results.periodo_payback_ciclos).toBe(0)
  })

  it('should handle zero production', () => {
    const zeroCycleParams = {
      ...defaultCycleParams,
      num_plantas: 0,
      producao_por_planta_g: 0,
    }
    
    const results = calculateResults(defaultSetupParams, zeroCycleParams, defaultMarketParams)
    
    expect(results.receita_bruta_ciclo).toBe(0)
    expect(results.custo_por_grama).toBe(0) // A função retorna 0 quando producao_total_g é 0
  })

  it('should handle different electricity prices', () => {
    const expensiveMarketParams = {
      ...defaultMarketParams,
      preco_kwh: 2.0, // Doubled price
    }
    
    const normalResults = calculateResults(defaultSetupParams, defaultCycleParams, defaultMarketParams)
    const expensiveResults = calculateResults(defaultSetupParams, defaultCycleParams, expensiveMarketParams)
    
    expect(expensiveResults.detalhe_custos_operacionais['Energia Elétrica'])
      .toBeGreaterThan(normalResults.detalhe_custos_operacionais['Energia Elétrica'])
  })

  it('should maintain cost breakdown structure', () => {
    const results = calculateResults(defaultSetupParams, defaultCycleParams, defaultMarketParams)
    
    expect(results.detalhe_custos_operacionais).toHaveProperty('Energia Elétrica')
    expect(results.detalhe_custos_operacionais).toHaveProperty('Nutrientes')
    expect(results.detalhe_custos_operacionais).toHaveProperty('Outros Custos')
    expect(results.detalhe_custos_operacionais).toHaveProperty('Sementes/Clones')
    expect(results.detalhe_custos_operacionais).toHaveProperty('Substrato')
  })
})