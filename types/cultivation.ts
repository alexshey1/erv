// Tipos para parâmetros de cultivo

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
}

export interface MarketParams {
  preco_kwh: number
  custo_sementes_clones: number
  custo_substrato: number
  custo_nutrientes: number
  custos_operacionais_misc: number
  preco_venda_por_grama: number
  preco_mercado_ilegal: number
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