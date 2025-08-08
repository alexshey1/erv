import { useState, useMemo } from 'react'
import { Clock, Droplet, Leaf, Scissors, Search, Filter, Calendar, Eye, Plus, BookOpen, TrendingUp, AlertTriangle, CheckCircle2, X } from 'lucide-react'
import Link from 'next/link'
import { Badge } from '@/components/ui/badge'
import { getEventIcon } from '@/lib/event-icons'

interface Acao {
  id: any;
  cultivoId: string;
  hora: string;
  descricao: any;
  tipo?: string;
  type?: string;
  date?: string;
  details?: any;
}

interface Cultivation {
  id: string;
  name: string;
  status?: string;
  [key: string]: any;
}

interface DiarioBordoRapidoProps {
  acoes?: Acao[];
  cultivations?: Cultivation[];
  phHover?: boolean;
}

// Dicionário de tradução dos tipos de evento
const traducaoEvento = {
  Fertilization: "Fertilização",
  Start_veg: "Início do vegetativo",
  StartVeg: "Início do vegetativo",
  Start_flower: "Início da floração",
  StartFlower: "Início da floração",
  Harvest: "Colheita",
  Watering: "Rega",
  Observation: "Observação",
  Pruning: "Poda",
  Transplant: "Transplante",
  pH_measurement: "Medição de pH",
  EC_measurement: "Medição de EC",
  Temperature_check: "Verificação de Temperatura",
  Humidity_check: "Verificação de Umidade",
  Pest_control: "Controle de Pragas",
  Disease_treatment: "Tratamento de Doença",
  Nutrient_adjustment: "Ajuste de Nutrientes",
  Light_adjustment: "Ajuste de Iluminação",
  Ventilation_check: "Verificação de Ventilação",
  Maintenance: "Manutenção",
  Other: "Outro"
}

// Categorias de eventos
const categoriasEventos = {
  nutrição: ['Fertilization', 'Nutrient_adjustment', 'pH_measurement', 'EC_measurement'],
  irrigação: ['Watering', 'Irrigation'],
  crescimento: ['Start_veg', 'StartVeg', 'Start_flower', 'StartFlower', 'Transplant'],
  manutenção: ['Pruning', 'Maintenance', 'Light_adjustment', 'Ventilation_check'],
  monitoramento: ['Observation', 'Temperature_check', 'Humidity_check'],
  colheita: ['Harvest'],
  saúde: ['Pest_control', 'Disease_treatment']
}

function traduzirEvento(texto: string): string {
  if (!texto) return ""
  const key = texto.trim().replace(/\s+/g, "_").toLowerCase()
  const map: Record<string, string> = {
    fertilization: "Fertilização",
    fertilizacao: "Fertilização",
    germination: "Germinação",
    germinacao: "Germinação",
    seedling: "Plântula",
    vegetative: "Vegetativo",
    flowering: "Floração",
    drying: "Secagem",
    curing: "Cura",
    harvest: "Colheita",
    colheita: "Colheita",
    pruning: "Poda",
    poda: "Poda",
    irrigation: "Irrigação",
    irrigacao: "Irrigação",
    irrigação: "Irrigação",
    water: "Rega",
    nutrients: "Nutrientes",
    pest_control: "Controle de Pragas",
    pest: "Praga",
    action: "Ação",
    start_veg: "Início do vegetativo",
    other: "Outro",
    ph_measurement: "Medição de pH",
    ec_measurement: "Medição de EC",
    temperature_check: "Verificação de Temperatura",
    humidity_check: "Verificação de Umidade",
    disease_treatment: "Tratamento de Doença",
    nutrient_adjustment: "Ajuste de Nutrientes",
    light_adjustment: "Ajuste de Iluminação",
    ventilation_check: "Verificação de Ventilação",
    maintenance: "Manutenção"
  }
  return map[key] || texto
}

// Função para obter categoria do evento
function getCategoriaEvento(tipo: string): string {
  const tipoLower = tipo.toLowerCase()
  for (const [categoria, eventos] of Object.entries(categoriasEventos)) {
    if (eventos.some(evento => evento.toLowerCase() === tipoLower)) {
      return categoria
    }
  }
  return 'outro'
}

// Função para obter cor da categoria
function getCorCategoria(categoria: string): string {
  const cores = {
    nutrição: 'bg-blue-100 text-blue-700 border-blue-200',
    irrigação: 'bg-cyan-100 text-cyan-700 border-cyan-200',
    crescimento: 'bg-green-100 text-green-700 border-green-200',
    manutenção: 'bg-orange-100 text-orange-700 border-orange-200',
    monitoramento: 'bg-purple-100 text-purple-700 border-purple-200',
    colheita: 'bg-yellow-100 text-yellow-700 border-yellow-200',
    saúde: 'bg-red-100 text-red-700 border-red-200',
    outro: 'bg-gray-100 text-gray-700 border-gray-200'
  }
  return cores[categoria as keyof typeof cores] || cores.outro
}

// Função para formatar data/hora
function formatarDataHora(dateString: string): string {
  const data = new Date(dateString)
  const agora = new Date()
  const diffMs = agora.getTime() - data.getTime()
  const diffMin = Math.floor(diffMs / (1000 * 60))
  const diffHoras = Math.floor(diffMs / (1000 * 60 * 60))
  const diffDias = Math.floor(diffMs / (1000 * 60 * 60 * 24))

  if (diffMin < 1) return 'Agora mesmo'
  if (diffMin < 60) return `${diffMin}min atrás`
  if (diffHoras < 24) return `${diffHoras}h atrás`
  if (diffDias < 7) return `${diffDias} dia${diffDias > 1 ? 's' : ''} atrás`
  
  return data.toLocaleDateString('pt-BR', { 
    day: '2-digit', 
    month: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  })
}

// Função para obter status do evento
function getStatusEvento(acao: Acao): { status: string; icon: any; color: string } {
  const tipo = (acao.tipo || acao.type || '').toLowerCase()
  
  // Eventos críticos
  if (tipo.includes('pest') || tipo.includes('disease')) {
    return { 
      status: 'Crítico', 
      icon: <AlertTriangle className="w-3 h-3" />, 
      color: 'text-red-600' 
    }
  }
  
  // Eventos importantes
  if (tipo.includes('fertilization') || tipo.includes('harvest') || tipo.includes('start')) {
    return { 
      status: 'Importante', 
      icon: <TrendingUp className="w-3 h-3" />, 
      color: 'text-green-600' 
    }
  }
  
  // Eventos normais
  return { 
    status: 'Normal', 
    icon: <CheckCircle2 className="w-3 h-3" />, 
    color: 'text-blue-600' 
  }
}

export default function DiarioBordoRapido({ 
  acoes = [], 
  cultivations = [], 
  phHover = false 
}: DiarioBordoRapidoProps) {
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategoria, setSelectedCategoria] = useState<string>('todas')
  const [selectedCultivo, setSelectedCultivo] = useState<string>('todos')
  const [showFilters, setShowFilters] = useState(false)

  // Filtrar ações
  const acoesFiltradas = useMemo(() => {
    let filtradas = acoes

    // Filtro por busca
    if (searchTerm) {
      filtradas = filtradas.filter(acao => {
        const descricao = traduzirEvento(acao.tipo || acao.type || acao.descricao || '')
        const cultivo = cultivations.find(c => c.id === acao.cultivoId)
        const nomeCultivo = cultivo?.name || ''
        
        return descricao.toLowerCase().includes(searchTerm.toLowerCase()) ||
               nomeCultivo.toLowerCase().includes(searchTerm.toLowerCase())
      })
    }

    // Filtro por categoria
    if (selectedCategoria !== 'todas') {
      filtradas = filtradas.filter(acao => {
        const tipo = acao.tipo || acao.type || ''
        return getCategoriaEvento(tipo) === selectedCategoria
      })
    }

    // Filtro por cultivo
    if (selectedCultivo !== 'todos') {
      filtradas = filtradas.filter(acao => acao.cultivoId === selectedCultivo)
    }

    return filtradas.slice(0, 8) // Mostrar mais itens
  }, [acoes, searchTerm, selectedCategoria, selectedCultivo, cultivations])

  // Obter categorias únicas
  const categoriasUnicas = useMemo(() => {
    const categorias = acoes.map(acao => {
      const tipo = acao.tipo || acao.type || ''
      return getCategoriaEvento(tipo)
    })
    return ['todas', ...Array.from(new Set(categorias))]
  }, [acoes])

  // Obter cultivos únicos
  const cultivosUnicos = useMemo(() => {
    const cultivosIds = acoes.map(acao => acao.cultivoId).filter(Boolean)
    return ['todos', ...Array.from(new Set(cultivosIds))]
  }, [acoes])

  const totalAcoes = acoes.length
  const acoesFiltradasCount = acoesFiltradas.length

  return (
    <div className="bg-gradient-to-br from-white to-gray-50 border border-gray-200 rounded-2xl shadow-sm p-5 w-full h-full flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl shadow-sm">
            <BookOpen className="w-5 h-5 text-white" />
          </div>
          <div>
            <h3 className="font-bold text-lg text-gray-900">Diário de Bordo Rápido</h3>
            <p className="text-xs text-gray-500">{acoesFiltradasCount} de {totalAcoes} eventos</p>
          </div>
        </div>
        <button
          onClick={() => setShowFilters(!showFilters)}
          className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          title="Filtros"
        >
          <Filter className="w-4 h-4 text-gray-600" />
        </button>
      </div>

      {/* Filtros */}
      {showFilters && (
        <div className="mb-4 p-3 bg-gray-50 rounded-xl border border-gray-200">
          <div className="space-y-3">
            {/* Busca */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Buscar eventos..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white text-gray-900 placeholder:text-gray-400 dark:bg-white dark:text-gray-900"
              />
              {searchTerm && (
                <button
                  onClick={() => setSearchTerm('')}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>

            {/* Filtros de categoria e cultivo */}
            <div className="flex gap-2">
              <select
                value={selectedCategoria}
                onChange={(e) => setSelectedCategoria(e.target.value)}
                className="flex-1 px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white text-gray-900 dark:bg-white dark:text-gray-900"
              >
                {categoriasUnicas.map(categoria => (
                  <option key={categoria} value={categoria}>
                    {categoria === 'todas' ? 'Todas categorias' : categoria.charAt(0).toUpperCase() + categoria.slice(1)}
                  </option>
                ))}
              </select>
              
              <select
                value={selectedCultivo}
                onChange={(e) => setSelectedCultivo(e.target.value)}
                className="flex-1 px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white text-gray-900 dark:bg-white dark:text-gray-900"
              >
                {cultivosUnicos.map(cultivoId => {
                  if (cultivoId === 'todos') return <option key={cultivoId} value={cultivoId}>Todos cultivos</option>
                  const cultivo = cultivations.find(c => c.id === cultivoId)
                  return <option key={cultivoId} value={cultivoId}>{cultivo?.name || `Cultivo ${cultivoId}`}</option>
                })}
              </select>
            </div>
          </div>
        </div>
      )}

      {/* Lista de Eventos */}
      <div className="flex-1 space-y-2 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100 hover:scrollbar-thumb-gray-400 max-h-[280px]">
        {acoesFiltradas.length > 0 ? (
          acoesFiltradas.map((acao, i) => {
            const tipo = acao.tipo || acao.type || acao.descricao || ''
            const icon = getEventIcon(tipo)
            const plantId = acao.cultivoId
            const eventId = acao.id
            const linkHref = plantId && eventId ? `/history/${plantId}?evento=${eventId}` : plantId ? `/history/${plantId}` : undefined
            const descricaoJSX = traduzirEvento(tipo)
            const isPhRelated = /regou|fertiliz|ph|ec/i.test(acao.descricao || '')
            const highlight = phHover && isPhRelated
            
            // Buscar nome do cultivo
            const cultivo = cultivations.find(c => c.id === acao.cultivoId)
            const nomeCultivo = cultivo ? cultivo.name : null
            
            // Informações adicionais
            const categoria = getCategoriaEvento(tipo)
            const statusInfo = getStatusEvento(acao)
            const dataHora = acao.date ? formatarDataHora(acao.date) : acao.hora || 'Data não informada'
            
            // Detalhes do evento
            const detalhes = acao.details || {}
            const temDetalhes = Object.keys(detalhes).length > 0

                          const content = (
                <div className={`group relative border-l-3 rounded-lg p-3 transition-all duration-200 hover:shadow-md hover:scale-[1.01] ${
                  highlight ? 'bg-green-50 border-l-green-500' : 'bg-white border-l-gray-200 hover:border-l-gray-300'
                }`}>
                  <div className="flex items-center gap-3">
                    <div className="flex-shrink-0 p-1.5 bg-gray-50 rounded-lg group-hover:bg-gray-100 transition-colors">
                      {icon}
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex-1">
                          <h4 className="text-sm font-medium text-gray-900 group-hover:text-gray-700 transition-colors">
                            {descricaoJSX}
                          </h4>
                          
                          <div className="flex items-center gap-2 mt-1">
                            {nomeCultivo && (
                              <span className="text-xs text-green-600 font-medium">
                                {nomeCultivo}
                              </span>
                            )}
                            
                            <span className={`text-xs px-2 py-0.5 rounded-full ${getCorCategoria(categoria)}`}>
                              {categoria.charAt(0).toUpperCase() + categoria.slice(1)}
                            </span>
                            
                            <span className={`text-xs ${statusInfo.color}`}>
                              {statusInfo.status}
                            </span>
                          </div>
                          
                          <div className="flex items-center gap-2 mt-1">
                            <span className="text-xs text-gray-500">
                              {dataHora}
                            </span>
                            
                            {temDetalhes && (
                              <span className="text-xs text-blue-600">
                                Ver detalhes
                              </span>
                            )}
                          </div>
                        </div>
                        
                        <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                          <button
                            className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors"
                            title="Ver detalhes"
                          >
                            <Eye className="w-3.5 h-3.5 text-gray-400" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )

            return linkHref ? (
              <Link key={i} href={linkHref} scroll={true} className="block">
                {content}
              </Link>
            ) : (
              <div key={i} className="cursor-pointer">
                {content}
              </div>
            )
          })
        ) : (
          <div className="text-center py-8 text-gray-500">
            <BookOpen className="w-12 h-12 mx-auto mb-3 text-gray-300" />
            <p className="text-sm">Nenhum evento encontrado</p>
            <p className="text-xs">Tente ajustar os filtros</p>
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="border-t border-gray-200 pt-4 mt-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs text-gray-500">
            <Calendar className="w-3 h-3" />
            <span>Últimos eventos</span>
          </div>
          
          <Link 
            href="/history" 
            className="flex items-center gap-1 text-xs text-purple-600 hover:text-purple-700 transition-colors"
          >
            <span>Ver histórico completo</span>
            <Plus className="w-3 h-3" />
          </Link>
        </div>
      </div>
    </div>
  )
}