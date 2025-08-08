import type { CalculationResults, SetupParams, CycleParams, MarketParams } from "./cultivation-calculator"
import { calculateResults } from "./cultivation-calculator"

// Interfaces para os dados mock
export interface CultivationSummary {
  id: string
  name: string
  startDate: string
  endDate: string | null // Pode ser null para cultivos ativos
  yield_g: number
  profit_brl: number
  status: "active" | "completed" | "archived"
  seedStrain: string
  durationDays: number
  hasSevereProblems: boolean // Adicionado para indicar problemas graves
  photoUrl?: string // URL da foto da planta
  setupParams?: SetupParams // Adicionado para armazenar parâmetros salvos
  cycleParams?: CycleParams // Adicionado para armazenar parâmetros salvos
  marketParams?: MarketParams // Adicionado para armazenar parâmetros salvos
  // Dados de setup e custos do banco
  area_m2?: number
  custo_equip_iluminacao?: number
  custo_tenda_estrutura?: number
  custo_ventilacao_exaustao?: number
  custo_outros_equipamentos?: number
  potencia_watts?: number
  producao_por_planta_g?: number
  dias_vegetativo?: number
  dias_veg?: number
  dias_racao?: number
  horas_luz_flor?: number
  dias_secagem_cura?: number
  preco_kwh?: number
  custo_sementes_clones?: number
  custo_substrato?: number
  custo_nutrientes?: number
  custos_operacionais_misc?: number
  preco_venda_por_grama?: number
}

export interface AgronomicDataPoint {
  date: string // YYYY-MM-DD
  ph: number
  ec: number // Electrical Conductivity
  temperature_c: number
  humidity_percent: number
}

export interface Incident {
  id: string
  date: string // YYYY-MM-DD
  type: "pest" | "disease" | "nutrient_deficiency" | "environmental_stress" | "other"
  description: string
  severity: "low" | "medium" | "high"
  correctiveAction: string
  photoUrl?: string // Placeholder for image
}

export interface CultivationEvent {
  id?: string // ID opcional para identificação única
  date: string // YYYY-MM-DD
  type:
    | "start_veg"
    | "start_flor"
    | "start_cure"
    | "harvest"
    | "incident"
    | "action"
    | "irrigation"
    | "fertilization"
    | "pruning"
    | "pest_control"
  description: string
  incidentId?: string // Link to an incident if type is 'incident'
  details?: Record<string, any> // Para detalhes de ações (ex: volume de água, tipo de nutriente)
}

export interface DetailedCultivationReport {
  id: string
  summary: CultivationSummary
  setupParams: SetupParams
  cycleParams: CycleParams
  marketParams: MarketParams
  results: CalculationResults // Reutiliza os resultados do simulador
  agronomicData: AgronomicDataPoint[]
  incidents: Incident[]
  events: CultivationEvent[]
}

// Tipos auxiliares para salvar eventos, incidentes e agronomicData junto ao cultivo
export interface UserCultivationExtra {
  events?: CultivationEvent[]
  incidents?: Incident[]
  agronomicData?: AgronomicDataPoint[]
}

// Função para gerar um ID simples
const generateId = () => Math.random().toString(36).substr(2, 9)

// Dados Mock de Cultivos Passados
export const mockCultivations: CultivationSummary[] = [
  {
    id: "1",
    name: "Cultivo #1 - OG Kush",
    startDate: "2023-01-10",
    endDate: "2023-05-20",
    yield_g: 480,
    profit_brl: 15000,
    status: "completed",
    seedStrain: "OG Kush",
    durationDays: 130,
    hasSevereProblems: false,
    // Dados de setup
    area_m2: 2.25,
    custo_equip_iluminacao: 200,
    custo_tenda_estrutura: 150,
    custo_ventilacao_exaustao: 800,
    custo_outros_equipamentos: 500,
    potencia_watts: 480,
    producao_por_planta_g: 80,
    dias_vegetativo: 60,
    dias_veg: 18,
    dias_racao: 70,
    horas_luz_flor: 12,
    dias_secagem_cura: 20,
    preco_kwh: 0.95,
    custo_sementes_clones: 50,
    custo_substrato: 120,
    custo_nutrientes: 350,
    custos_operacionais_misc: 10,
    preco_venda_por_grama: 45,
  },
  {
    id: "2",
    name: "Cultivo #2 - White Widow",
    startDate: "2023-06-01",
    endDate: "2023-10-15",
    yield_g: 520,
    profit_brl: 18500,
    status: "completed",
    seedStrain: "White Widow",
    durationDays: 136,
    hasSevereProblems: true, // Exemplo de cultivo com problemas graves
    // Dados de setup
    area_m2: 3.0,
    custo_equip_iluminacao: 300,
    custo_tenda_estrutura: 200,
    custo_ventilacao_exaustao: 1000,
    custo_outros_equipamentos: 600,
    potencia_watts: 600,
    producao_por_planta_g: 85,
    dias_vegetativo: 65,
    dias_veg: 20,
    dias_racao: 75,
    horas_luz_flor: 12,
    dias_secagem_cura: 22,
    preco_kwh: 0.95,
    custo_sementes_clones: 60,
    custo_substrato: 150,
    custo_nutrientes: 400,
    custos_operacionais_misc: 15,
    preco_venda_por_grama: 45,
  },
  {
    id: "3",
    name: "Cultivo #3 - Amnesia Haze",
    startDate: "2024-01-05",
    endDate: "2024-05-15",
    yield_g: 450,
    profit_brl: 12000,
    status: "completed",
    seedStrain: "Amnesia Haze",
    durationDays: 130,
    hasSevereProblems: false,
    // Dados de setup
    area_m2: 1.8,
    custo_equip_iluminacao: 150,
    custo_tenda_estrutura: 120,
    custo_ventilacao_exaustao: 600,
    custo_outros_equipamentos: 400,
    potencia_watts: 400,
    producao_por_planta_g: 75,
    dias_vegetativo: 55,
    dias_veg: 16,
    dias_racao: 65,
    horas_luz_flor: 12,
    dias_secagem_cura: 18,
    preco_kwh: 0.95,
    custo_sementes_clones: 45,
    custo_substrato: 100,
    custo_nutrientes: 300,
    custos_operacionais_misc: 8,
    preco_venda_por_grama: 45,
  },
  {
    id: "4",
    name: "Cultivo #4 - Gorilla Glue (Ativo)",
    startDate: "2024-06-01",
    endDate: null, // Data futura para indicar ativo
    yield_g: 0, // Ainda não colhido
    profit_brl: 0,
    status: "active",
    seedStrain: "Gorilla Glue",
    durationDays: 132, // Duração projetada
    hasSevereProblems: false,
    // Dados de setup
    area_m2: 2.5,
    custo_equip_iluminacao: 250,
    custo_tenda_estrutura: 180,
    custo_ventilacao_exaustao: 900,
    custo_outros_equipamentos: 550,
    potencia_watts: 500,
    producao_por_planta_g: 82,
    dias_vegetativo: 62,
    dias_veg: 19,
    dias_racao: 72,
    horas_luz_flor: 12,
    dias_secagem_cura: 21,
    preco_kwh: 0.95,
    custo_sementes_clones: 55,
    custo_substrato: 130,
    custo_nutrientes: 380,
    custos_operacionais_misc: 12,
    preco_venda_por_grama: 45,
  },
]

// Definir os incidentes separadamente primeiro
const incident1Id = generateId()
const incident2Id = generateId()
const incident3Id = generateId()

const mockIncidents: Incident[] = [
  {
    id: incident1Id,
    date: "2023-02-10",
    type: "pest",
    description: "Pulgões detectados em 2 plantas. Infestação leve.",
    severity: "low",
    correctiveAction: "Aplicação de óleo de neem.",
    photoUrl: "/placeholder.svg?height=100&width=100",
  },
  {
    id: incident2Id,
    date: "2023-03-05",
    type: "nutrient_deficiency",
    description: "Folhas amareladas, deficiência de nitrogênio.",
    severity: "medium",
    correctiveAction: "Aumento da dose de nutrientes vegetativos.",
    photoUrl: "/placeholder.svg?height=100&width=100",
  },
  {
    id: incident3Id,
    date: "2023-04-01",
    type: "environmental_stress",
    description: "Temperatura elevada por 2 dias, causando estresse hídrico.",
    severity: "high", // Exemplo de incidente grave
    correctiveAction: "Ajuste da ventilação e aumento da frequência de irrigação.",
    photoUrl: "/placeholder.svg?height=100&width=100",
  },
]

// Agora, defina o relatório detalhado, referenciando os IDs dos incidentes já definidos
const mockDetailedReportId = generateId()
export const mockDetailedReport: DetailedCultivationReport = {
  id: mockDetailedReportId,
  summary: {
    id: mockDetailedReportId,
    name: "Cultivo #1 - OG Kush",
    startDate: "2023-01-10",
    endDate: "2023-05-20",
    yield_g: 480,
    profit_brl: 15000,
    status: "completed",
    seedStrain: "OG Kush",
    durationDays: 130,
    hasSevereProblems: false,
  },
  setupParams: {
    area_m2: 2.25,
    custo_equip_iluminacao: 2000,
    custo_tenda_estrutura: 1500,
    custo_ventilacao_exaustao: 800,
    custo_outros_equipamentos: 500,
  },
  cycleParams: {
    potencia_watts: 480,
    num_plantas: 6,
    producao_por_planta_g: 80,
    dias_vegetativo: 60,
    horas_luz_veg: 18,
    dias_floracao: 70,
    horas_luz_flor: 12,
    dias_secagem_cura: 20,
  },
  marketParams: {
    preco_kwh: 0.95,
    custo_sementes_clones: 500,
    custo_substrato: 120,
    custo_nutrientes: 350,
    custos_operacionais_misc: 100,
    preco_venda_por_grama: 45,
  },
  results: {
    custo_total_investimento: 4800,
    custo_operacional_total_ciclo: 1800,
    receita_bruta_ciclo: 21600,
    lucro_liquido_ciclo: 19800,
    custo_por_grama: 3.75,
    gramas_por_watt: 1.0,
    gramas_por_m2: 213.33,
    periodo_payback_ciclos: 0.24,
    roi_investimento_1_ano: 700, // Exemplo
    duracao_total_ciclo: 150,
    detalhe_custos_operacionais: {
      "Energia Elétrica": 600,
      "Sementes/Clones": 500,
      Substrato: 120,
      Nutrientes: 350,
      "Outros Custos": 100,
    },
  },
  agronomicData: [
    { date: "2023-01-10", ph: 5.8, ec: 1.2, temperature_c: 24, humidity_percent: 65 },
    { date: "2023-01-20", ph: 5.9, ec: 1.3, temperature_c: 25, humidity_percent: 60 },
    { date: "2023-02-01", ph: 6.0, ec: 1.4, temperature_c: 23, humidity_percent: 58 },
    { date: "2023-02-15", ph: 6.1, ec: 1.5, temperature_c: 24, humidity_percent: 55 },
    { date: "2023-03-01", ph: 6.2, ec: 1.6, temperature_c: 26, humidity_percent: 50 },
    { date: "2023-03-15", ph: 6.3, ec: 1.7, temperature_c: 25, humidity_percent: 48 },
    { date: "2023-04-01", ph: 6.4, ec: 1.8, temperature_c: 24, humidity_percent: 45 },
    { date: "2023-04-15", ph: 6.5, ec: 1.9, temperature_c: 23, humidity_percent: 42 },
    { date: "2023-05-01", ph: 6.6, ec: 2.0, temperature_c: 22, humidity_percent: 40 },
    { date: "2023-05-10", ph: 6.7, ec: 2.1, temperature_c: 21, humidity_percent: 38 },
  ],
  incidents: mockIncidents, // Use a variável de incidentes definida acima
  events: [
    { date: "2023-01-10", type: "start_veg", description: "Início da fase vegetativa" },
    {
      date: "2023-01-15",
      type: "irrigation",
      description: "Primeira irrigação pós-transplante",
      details: { volume: "1L", ph: 6.0, ec: 1.0 },
    },
    {
      date: "2023-01-25",
      type: "fertilization",
      description: "Aplicação de fertilizante vegetativo",
      details: { product: "Grow A+B", dosage: "2ml/L" },
    },
    {
      date: "2023-02-10",
      type: "incident",
      description: "Pulgões detectados",
      incidentId: incident1Id, // Referência correta
    },
    { date: "2023-02-20", type: "pruning", description: "Poda de topping nas plantas principais" },
    {
      date: "2023-03-05",
      type: "incident",
      description: "Deficiência de nitrogênio",
      incidentId: incident2Id, // Referência correta
    },
    { date: "2023-03-10", type: "start_flor", description: "Início da fase de floração" },
    { date: "2023-03-20", type: "pest_control", description: "Aplicação preventiva de óleo de neem" },
    {
      date: "2023-04-01",
      type: "incident",
      description: "Estresse por calor",
      incidentId: incident3Id, // Referência correta
    },
    { date: "2023-05-01", type: "start_cure", description: "Início da secagem/cura" },
    { date: "2023-05-20", type: "harvest", description: "Colheita concluída" },
  ],
}

// Dados agronômicos mock para todos os cultivos
export const mockAgronomicData: Record<string, AgronomicDataPoint[]> = {
  // Cultivo #1 - OG Kush (bem-sucedido)
  [mockCultivations[0].id]: [
    { date: "2023-01-10", ph: 5.8, ec: 1.2, temperature_c: 24, humidity_percent: 65 },
    { date: "2023-01-20", ph: 5.9, ec: 1.3, temperature_c: 25, humidity_percent: 60 },
    { date: "2023-02-01", ph: 6.0, ec: 1.4, temperature_c: 23, humidity_percent: 58 },
    { date: "2023-02-15", ph: 6.1, ec: 1.5, temperature_c: 24, humidity_percent: 55 },
    { date: "2023-03-01", ph: 6.2, ec: 1.6, temperature_c: 26, humidity_percent: 50 },
    { date: "2023-03-15", ph: 6.3, ec: 1.7, temperature_c: 25, humidity_percent: 48 },
    { date: "2023-04-01", ph: 6.4, ec: 1.8, temperature_c: 24, humidity_percent: 45 },
    { date: "2023-04-15", ph: 6.5, ec: 1.9, temperature_c: 23, humidity_percent: 42 },
    { date: "2023-05-01", ph: 6.6, ec: 2.0, temperature_c: 22, humidity_percent: 40 },
    { date: "2023-05-10", ph: 6.7, ec: 2.1, temperature_c: 21, humidity_percent: 38 },
  ],
  
  // Cultivo #2 - White Widow (com problemas)
  [mockCultivations[1].id]: [
    { date: "2023-06-01", ph: 5.8, ec: 1.2, temperature_c: 24, humidity_percent: 65 },
    { date: "2023-06-10", ph: 5.9, ec: 1.3, temperature_c: 25, humidity_percent: 60 },
    { date: "2023-06-20", ph: 6.0, ec: 1.4, temperature_c: 23, humidity_percent: 58 },
    { date: "2023-07-01", ph: 6.1, ec: 1.5, temperature_c: 24, humidity_percent: 55 },
    { date: "2023-07-15", ph: 6.2, ec: 1.6, temperature_c: 26, humidity_percent: 50 },
    { date: "2023-08-01", ph: 6.3, ec: 1.7, temperature_c: 25, humidity_percent: 48 },
    { date: "2023-08-15", ph: 6.4, ec: 1.8, temperature_c: 24, humidity_percent: 45 },
    { date: "2023-09-01", ph: 6.5, ec: 1.9, temperature_c: 23, humidity_percent: 42 },
    { date: "2023-09-15", ph: 6.6, ec: 2.0, temperature_c: 22, humidity_percent: 40 },
    { date: "2023-10-01", ph: 6.7, ec: 2.1, temperature_c: 21, humidity_percent: 38 },
  ],
  
  // Cultivo #3 - Amnesia Haze (bem-sucedido)
  [mockCultivations[2].id]: [
    { date: "2024-01-05", ph: 5.8, ec: 1.2, temperature_c: 24, humidity_percent: 65 },
    { date: "2024-01-15", ph: 5.9, ec: 1.3, temperature_c: 25, humidity_percent: 60 },
    { date: "2024-01-25", ph: 6.0, ec: 1.4, temperature_c: 23, humidity_percent: 58 },
    { date: "2024-02-05", ph: 6.1, ec: 1.5, temperature_c: 24, humidity_percent: 55 },
    { date: "2024-02-15", ph: 6.2, ec: 1.6, temperature_c: 26, humidity_percent: 50 },
    { date: "2024-03-01", ph: 6.3, ec: 1.7, temperature_c: 25, humidity_percent: 48 },
    { date: "2024-03-15", ph: 6.4, ec: 1.8, temperature_c: 24, humidity_percent: 45 },
    { date: "2024-04-01", ph: 6.5, ec: 1.9, temperature_c: 23, humidity_percent: 42 },
    { date: "2024-04-15", ph: 6.6, ec: 2.0, temperature_c: 22, humidity_percent: 40 },
    { date: "2024-05-01", ph: 6.7, ec: 2.1, temperature_c: 21, humidity_percent: 38 },
  ],
  
  // Cultivo #4 - Gorilla Glue (ativo com anomalias)
  [mockCultivations[3].id]: [
    { date: "2024-06-01", ph: 5.8, ec: 1.2, temperature_c: 24, humidity_percent: 65 },
    { date: "2024-06-10", ph: 5.9, ec: 1.3, temperature_c: 25, humidity_percent: 60 },
    { date: "2024-06-20", ph: 6.0, ec: 1.4, temperature_c: 23, humidity_percent: 58 },
    { date: "2024-07-01", ph: 7.2, ec: 1.5, temperature_c: 24, humidity_percent: 55 }, // pH alto - anomalia
    { date: "2024-07-15", ph: 7.5, ec: 1.6, temperature_c: 26, humidity_percent: 50 }, // pH muito alto - anomalia crítica
    { date: "2024-08-01", ph: 7.8, ec: 1.7, temperature_c: 25, humidity_percent: 48 }, // pH crítico
    { date: "2024-08-15", ph: 7.2, ec: 1.8, temperature_c: 24, humidity_percent: 45 },
    { date: "2024-09-01", ph: 6.8, ec: 1.9, temperature_c: 23, humidity_percent: 42 },
    { date: "2024-09-15", ph: 6.5, ec: 2.0, temperature_c: 22, humidity_percent: 40 },
    { date: "2024-10-01", ph: 6.2, ec: 2.1, temperature_c: 21, humidity_percent: 38 },
  ],
}

// Função para buscar um relatório detalhado por ID (simulado)
export function getDetailedReport(id: string): DetailedCultivationReport | undefined {
  // Buscar primeiro nos mocks
  const foundSummary = mockCultivations.find((c) => c.id === id)
  if (foundSummary) {
    if (foundSummary.status === "active") {
      return {
        id: foundSummary.id,
        summary: foundSummary,
        setupParams: {
          area_m2: 2.25,
          custo_equip_iluminacao: 2000,
          custo_tenda_estrutura: 1500,
          custo_ventilacao_exaustao: 800,
          custo_outros_equipamentos: 500,
        },
        cycleParams: {
          potencia_watts: 480,
          num_plantas: 6,
          producao_por_planta_g: 80,
          dias_vegetativo: 60,
          horas_luz_veg: 18,
          dias_floracao: 70,
          horas_luz_flor: 12,
          dias_secagem_cura: 20,
        },
        marketParams: {
          preco_kwh: 0.95,
          custo_sementes_clones: 500,
          custo_substrato: 120,
          custo_nutrientes: 350,
          custos_operacionais_misc: 100,
          preco_venda_por_grama: 45,
        },
        results: {
          custo_total_investimento: 4800,
          custo_operacional_total_ciclo: 1800,
          receita_bruta_ciclo: 0,
          lucro_liquido_ciclo: -1800,
          custo_por_grama: 0,
          gramas_por_watt: 0,
          gramas_por_m2: 0,
          periodo_payback_ciclos: Number.POSITIVE_INFINITY,
          roi_investimento_1_ano: -100,
          duracao_total_ciclo: 150,
          detalhe_custos_operacionais: {
            "Energia Elétrica": 600,
            "Sementes/Clones": 500,
            Substrato: 120,
            Nutrientes: 350,
            "Outros Custos": 100,
          },
        },
        agronomicData: [
          { date: "2024-06-01", ph: 5.8, ec: 1.2, temperature_c: 24, humidity_percent: 65 },
          { date: "2024-06-10", ph: 5.9, ec: 1.3, temperature_c: 25, humidity_percent: 60 },
          { date: "2024-06-20", ph: 6.0, ec: 1.4, temperature_c: 23, humidity_percent: 58 },
        ],
        incidents: [],
        events: [{ date: "2024-06-01", type: "start_veg", description: "Início da fase vegetativa" }],
      }
    }
    // Para os cultivos concluídos, retorna o mockDetailedReport ou um similar
    return mockDetailedReport
  }

  // Buscar no localStorage (cultivos criados pelo usuário)
  if (typeof window !== 'undefined') {
    const saved = localStorage.getItem("cultivations")
    if (saved) {
      const cultivations = JSON.parse(saved) as CultivationSummary[]
      const userCultivation = cultivations.find((c) => c.id === id)
      if (userCultivation) {
        // Usar parâmetros salvos ou defaults
        const setupParams = userCultivation.setupParams || {
          area_m2: 2.25,
          custo_equip_iluminacao: 2000,
          custo_tenda_estrutura: 1500,
          custo_ventilacao_exaustao: 800,
          custo_outros_equipamentos: 500,
        }
        const cycleParams = userCultivation.cycleParams || {
          potencia_watts: 480,
          num_plantas: 6,
          producao_por_planta_g: 80,
          dias_vegetativo: 60,
          horas_luz_veg: 18,
          dias_floracao: 70,
          horas_luz_flor: 12,
          dias_secagem_cura: 20,
        }
        const marketParams = userCultivation.marketParams || {
          preco_kwh: 0.95,
          custo_sementes_clones: 500,
          custo_substrato: 120,
          custo_nutrientes: 350,
          custos_operacionais_misc: 100,
          preco_venda_por_grama: 45,
        }
        // Carregar extras (eventos, incidentes, agronomicData) se existirem
        const events = (userCultivation as any).events || []
        const incidents = (userCultivation as any).incidents || []
        const agronomicData = (userCultivation as any).agronomicData || []
        return {
          id: userCultivation.id,
          summary: userCultivation,
          setupParams,
          cycleParams,
          marketParams,
          results: calculateResults(setupParams, cycleParams, marketParams),
          agronomicData,
          incidents,
          events,
        }
      }
    }
  }
  return undefined
}
