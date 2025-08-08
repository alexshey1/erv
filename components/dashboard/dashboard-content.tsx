"use client"

import Image from "next/image"
import { TrendingUp, DollarSign, Clock, Zap, Lightbulb, ListCheck, Wrench, Sprout, Layers, CalendarCheck2, AlertTriangle, Thermometer, Droplet, Gauge, Wifi, Plus, Sparkles, BookOpen } from "lucide-react"
import { useState, useEffect } from "react"
import { Sparkline } from "@/components/charts/sparkline"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { KPICards } from "@/components/dashboard/kpi-cards"
import { DonutChart } from "@/components/charts/donut-chart"
import { TimelineChart } from "@/components/charts/timeline-chart"
import { PageContainer } from "@/components/layout/page-container"
import { AnomalyAlerts } from "@/components/anomaly-alerts"
import { AnomalyLearningStatus } from "@/components/anomaly-learning-status"
import type { CultivationSummary, AgronomicDataPoint } from "@/lib/mock-data"
import { AnomalyDetector } from "@/lib/anomaly-detector"
import { StaggerContainer, StaggerItem, FadeIn } from "@/components/ui/smooth-transitions"
import { PermissionGuard } from '@/components/auth/permission-guard'
import CardPlanta from './CardPlanta'
import ListaTarefas from './ListaTarefas'
import DiarioBordoRapido from './DiarioBordoRapido'
import { WeatherWidget } from "@/components/widgets/WeatherWidget"

interface DashboardContentProps {
  results?: any
  cycleParams: any
  user: any // Adicionado para controle de permissão
}

function KpiCard({ icon, label, value, onClick, positive }: any) {
  return (
    <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={onClick}>
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-600">{label}</p>
            <p className="text-2xl font-bold text-gray-900">{value}</p>
          </div>
          <div className={`p-3 rounded-full ${positive ? 'bg-green-100' : 'bg-blue-100'}`}>
            {icon}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

// Função utilitária para determinar fase do cultivo
function getCultivationPhase(startDate: string): "germinacao" | "vegetativo" | "floracao" | "secagem" | "cura" {
  const elapsedDays = Math.ceil((new Date().getTime() - new Date(startDate).getTime()) / (1000 * 60 * 60 * 24))
  if (elapsedDays <= 10) return "germinacao"
  if (elapsedDays <= 60) return "vegetativo"
  if (elapsedDays <= 130) return "floracao"
  if (elapsedDays <= 140) return "secagem"
  if (elapsedDays <= 150) return "cura"
  return "cura"
}

// Função utilitária para dicas e checklist por fase
function getDicaECuidadosPorFase(fase: string, anomalia?: string) {
  if (anomalia === 'umidade_baixa') {
    return {
      dica: 'Aumente a umidade do ambiente para evitar estresse nas plantas.',
      checklist: ['Verificar reservatório de água', 'Ajustar umidificador']
    }
  }
  switch (fase) {
    case 'germinacao':
      return {
        dica: 'Mantenha o substrato úmido, mas não encharcado.',
        checklist: ['Verificar umidade do solo', 'Manter temperatura estável']
      }
    case 'vegetativo':
      return {
        dica: 'Aumente a exposição à luz e monitore o crescimento das folhas.',
        checklist: ['Ajustar iluminação', 'Verificar crescimento', 'Adicionar nutrientes']
      }
    case 'floracao':
      return {
        dica: 'Reduza o nitrogênio e aumente o fósforo na adubação.',
        checklist: ['Ajustar fertilização', 'Monitorar flores', 'Reduzir umidade']
      }
    case 'secagem':
      return {
        dica: 'Seque as plantas em local ventilado e escuro.',
        checklist: ['Evitar luz direta', 'Manter ventilação', 'Verificar cheiro de mofo']
      }
    case 'cura':
      return {
        dica: 'Armazene em pote hermético e abra diariamente para curar.',
        checklist: ['Abrir pote diariamente', 'Verificar aroma', 'Evitar umidade excessiva']
      }
    default:
      return {
        dica: 'Acompanhe o desenvolvimento do seu cultivo.',
        checklist: ['Monitorar parâmetros', 'Registrar observações']
      }
  }
}

// Função utilitária para checar faixa ideal dos parâmetros
function getParametroStatus(valor: number | null, min: number, max: number, critical?: number): "ideal" | "medium" | "critical" {
  if (valor === null || valor === undefined) return "ideal"
  if (critical !== undefined && (valor < min - critical || valor > max + critical)) return "critical"
  if (valor < min || valor > max) return "medium"
  return "ideal"
}

// Função para gerar dicas dinâmicas conforme parâmetros fora do ideal
function getDicasParametros(statusTemp: string, statusUmidade: string, statusPh: string, statusEc: string) {
  const dicas: string[] = []
  if (statusTemp !== "ideal") dicas.push("Mantenha a temperatura entre 24–30°C.")
  if (statusUmidade !== "ideal") dicas.push("Mantenha a umidade entre 60–70%.")
  if (statusPh !== "ideal") dicas.push("Ajuste o pH da solução para 6.0 usando solução de ajuste.")
  if (statusEc !== "ideal") dicas.push("Ajuste a EC para 1.0–1.8 mS/cm, monitorando a resposta das plantas.")
  return dicas
}

interface Tarefa {
  nome: string;
  prazo: string;
  concluida: boolean;
  prioridade?: 'baixa' | 'media' | 'alta';
  categoria?: string;
  id?: string;
  dataCriacao?: Date;
  dataLimite?: Date;
}

interface Acao {
  id: any;
  cultivoId: string;
  hora: string;
  descricao: any;
  tipo?: string;
  type?: string;
}

export function DashboardContent({ results = {}, cycleParams, user }: DashboardContentProps) {
  const [modal, setModal] = useState<string | null>(null)
  const [cultivations, setCultivations] = useState<CultivationSummary[]>([])
  // Tipagem explícita para eventosPorCultivo
  const [eventosPorCultivo, setEventosPorCultivo] = useState<Record<string, any[]>>({})
  const [loading, setLoading] = useState(true)
  const [initialLoad, setInitialLoad] = useState(true) // Para controlar primeiro carregamento
  const [agronomicData, setAgronomicData] = useState<Record<string, AgronomicDataPoint[]>>({})
  const [anomalyDetector, setAnomalyDetector] = useState<AnomalyDetector | null>(null)
  const [learnedPatterns, setLearnedPatterns] = useState<any[]>([])
  const [phHover, setPhHover] = useState(false)
  // Adicionar estado para armazenar o horário da última atualização
  const [ultimaAtualizacao, setUltimaAtualizacao] = useState<string>("")

  // Inicializar detector de anomalias
  useEffect(() => {
    const detector = new AnomalyDetector()
    setAnomalyDetector(detector)
  }, [])

  // Atualizar padrões aprendidos quando dados mudarem
  useEffect(() => {
    if (anomalyDetector && cultivations.length > 0) {
      // Filtrar cultivos bem-sucedidos
      const successfulCultivations = cultivations.filter(
        c => c.status === "completed" && c.yield_g > 0 && c.profit_brl > 0
      )
      
      if (successfulCultivations.length > 0) {
        // Criar dados agronômicos simulados para cada cultivo bem-sucedido
        const agronomicDataArray = successfulCultivations.map(cultivation => {
          const events = eventosPorCultivo[cultivation.id] || []
          return events
            .filter((ev: any) => ev.details && (
              ev.details.ph !== undefined || 
              ev.details.ec !== undefined || 
              ev.details.temperatura !== undefined || 
              ev.details.umidade !== undefined
            ))
            .map((ev: any) => ({
              ph: ev.details.ph,
              ec: ev.details.ec,
              temperature_c: ev.details.temperatura,
              humidity_percent: ev.details.umidade,
              date: ev.date,
            }))
        })
        
        // Aprender padrões
        anomalyDetector.learnPatterns(successfulCultivations, agronomicDataArray)
        
        // Atualizar padrões aprendidos
        const patterns = anomalyDetector.getPatterns()
        setLearnedPatterns(patterns)
        
        console.log(`🧠 Sistema aprendeu ${patterns.length} padrões de ${successfulCultivations.length} cultivos bem-sucedidos`)
      }
    }
  }, [anomalyDetector, cultivations, eventosPorCultivo])

  useEffect(() => {
    async function fetchData() {
      setLoading(true)
      
      // Timeout de segurança para evitar loading infinito
      const timeoutId = setTimeout(() => {
        console.warn('Dashboard loading timeout - forçando fim do loading')
        setLoading(false)
        setInitialLoad(false)
      }, 10000) // 10 segundos
      
      try {
        // Usar API unificada para melhor performance
        const response = await fetch('/api/dashboard-data', { 
          credentials: 'include',
          cache: 'no-cache' // Evitar cache para dados em tempo real
        })
        
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`)
        }
        
        const result = await response.json()
        
        if (result.success && result.data) {
          const { cultivations, eventsByCultivation, environmentalData } = result.data
          
          // Atualizar estados
          setCultivations(cultivations || [])
          setEventosPorCultivo(eventsByCultivation || {})
          
          // Montar agronomicData para alertas inteligentes
          const agronomicDataObj: Record<string, AgronomicDataPoint[]> = {}
          for (const cultivoId in eventsByCultivation) {
            agronomicDataObj[cultivoId] = (eventsByCultivation[cultivoId] as any[])
              .filter((ev: any) => ev.details && (ev.details.ph !== undefined || ev.details.ec !== undefined || ev.details.temperatura !== undefined || ev.details.umidade !== undefined))
              .map((ev: any) => ({
                ph: ev.details.ph,
                ec: ev.details.ec,
                temperature_c: ev.details.temperatura,
                humidity_percent: ev.details.umidade,
                date: ev.date,
              }))
          }
          setAgronomicData(agronomicDataObj)
          setUltimaAtualizacao(new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit', second: '2-digit' }))
        } else {
          console.error('Erro na resposta da API:', result.error)
        }
      } catch (error) {
        console.error('Erro ao carregar dados do dashboard:', error)
        // Em caso de erro, tentar carregar dados básicos
        try {
          const resCultivos = await fetch('/api/cultivation', { credentials: 'include' })
          const dataCultivos = await resCultivos.json()
          setCultivations(dataCultivos.cultivations || [])
        } catch (fallbackError) {
          console.error('Erro no fallback:', fallbackError)
        }
      } finally {
        // SEMPRE executar, mesmo se houver erro
        clearTimeout(timeoutId)
        setLoading(false)
        setInitialLoad(false)
      }
    }
    
    fetchData()
    
    // Polling mais inteligente - apenas se a aba estiver ativa e com intervalo maior
    const interval = setInterval(() => {
      if (!document.hidden && !loading) {
        fetchData()
      }
    }, 60000) // Aumentado para 60 segundos para reduzir carga
    
    return () => clearInterval(interval)
  }, [])



  // Montar cards de planta reais
  const cicloTotal = 90; // ciclo padrão em dias
  const plantas = cultivations.map(cultivo => {
    // Sempre usar o photoUrl do banco, sem fallback para placeholder
    const imagem = (cultivo as any).photoUrl || ''
    return {
      imagem: imagem,
      cepa: cultivo.seedStrain,
      nome: cultivo.name,
      idade: cultivo.startDate ? Math.floor((Date.now() - new Date(cultivo.startDate).getTime()) / (1000 * 60 * 60 * 24)) : 0,
      fase: cultivo.status,
      progresso: Math.min(100, Math.round(((cultivo.startDate ? Math.floor((Date.now() - new Date(cultivo.startDate).getTime()) / (1000 * 60 * 60 * 24)) : 0) / cicloTotal) * 100)),
      id: cultivo.id
    }
  })

  // Juntar todos os eventos de todos os cultivos em um array só
  const todosEventos = Object.entries(eventosPorCultivo).flatMap(([cultivoId, eventos]) =>
    (eventos as any[]).map(evento => ({
      ...evento,
      cultivoId,
      hora: new Date(evento.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      descricao: evento.description || evento.type,
      date: evento.date
    }))
  );

  // Montar ações do diário de bordo reais (últimos eventos de todos os cultivos)
  let acoesRecentes = todosEventos
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 6);

  // Montar condições do ambiente reais (último evento mais recente com ph, ec, temperatura, umidade)
  let ultimoPh = null, ultimoEc = null, ultimaTemp = null, ultimaUmidade = null;
  for (const evento of todosEventos) {
    const det = evento.details || {};
    if (ultimoPh === null && det.ph !== undefined && det.ph !== null) ultimoPh = det.ph;
    if (ultimoEc === null && det.ec !== undefined && det.ec !== null) ultimoEc = det.ec;
    if (ultimaTemp === null && det.temperatura !== undefined && det.temperatura !== null) ultimaTemp = det.temperatura;
    if (ultimaUmidade === null && det.umidade !== undefined && det.umidade !== null) ultimaUmidade = det.umidade;
    if (ultimoPh !== null && ultimoEc !== null && ultimaTemp !== null && ultimaUmidade !== null) break;
  }

  // Exemplo de dados históricos para sparklines e tendências
  const lucroHistorico = [18000, 18500, 19000, 19224]
  const roiHistorico = [800, 820, 850, 874.6]
  const paybackHistorico = [0.3, 0.25, 0.22, 0.2]
  const eficienciaHistorico = [0.98, 0.99, 1.01, 1.00]

  // Estado funcional para tarefas com prioridades e datas
  const [tarefas, setTarefas] = useState<Tarefa[]>([
    { 
      nome: 'Regar a Planta 01', 
      prazo: 'em 4 horas', 
      concluida: false, 
      prioridade: 'alta',
      dataCriacao: new Date(),
      dataLimite: new Date(Date.now() + 4 * 60 * 60 * 1000) // 4 horas
    },
    { 
      nome: 'Fertilizar Planta 02', 
      prazo: 'Amanhã', 
      concluida: false, 
      prioridade: 'media',
      dataCriacao: new Date(),
      dataLimite: new Date(Date.now() + 24 * 60 * 60 * 1000) // amanhã
    },
    { 
      nome: 'Observar Planta 01', 
      prazo: 'em 2 dias', 
      concluida: false, 
      prioridade: 'baixa',
      dataCriacao: new Date(),
      dataLimite: new Date(Date.now() + 48 * 60 * 60 * 1000) // 2 dias
    },
    { 
      nome: 'Verificar pH da solução', 
      prazo: 'hoje', 
      concluida: false, 
      prioridade: 'alta',
      dataCriacao: new Date(),
      dataLimite: new Date(Date.now() + 2 * 60 * 60 * 1000) // 2 horas
    },
  ])
  
  // Handlers de tarefas atualizados
  const toggleTarefa = (index: number) => {
    setTarefas((tarefas: Tarefa[]) =>
      tarefas.map((t: Tarefa, i: number) =>
        i === index ? { ...t, concluida: !t.concluida } : t
      )
    )
  }
  
  const addTarefa = (nome: string, prazo: string, prioridade?: string, dataLimite?: Date) => {
    setTarefas((tarefas: Tarefa[]) => [...tarefas, { 
      nome, 
      prazo, 
      concluida: false, 
      prioridade: prioridade as 'baixa' | 'media' | 'alta' || 'media',
      dataCriacao: new Date(),
      dataLimite: dataLimite
    }])
  }
  
  const deleteTarefa = (index: number) => {
    setTarefas((tarefas: Tarefa[]) => tarefas.filter((_, i: number) => i !== index))
  }
  
  const editTarefa = (index: number, tarefa: Tarefa) => {
    setTarefas((tarefas: Tarefa[]) =>
      tarefas.map((t: Tarefa, i: number) =>
        i === index ? tarefa : t
      )
    )
  }

  const statusTemp = getParametroStatus(ultimaTemp, 24, 30, 5)
  const statusUmidade = getParametroStatus(ultimaUmidade, 40, 50, 10)
  const statusPh = getParametroStatus(ultimoPh, 6.0, 6.0, 0.5)
  const statusEc = getParametroStatus(ultimoEc, 1.0, 1.8, 0.5)

  let statusGeral: "ideal" | "medium" | "critical" = "ideal"
  if ([statusTemp, statusUmidade, statusPh, statusEc].includes("critical")) statusGeral = "critical"
  else if ([statusTemp, statusUmidade, statusPh, statusEc].includes("medium")) statusGeral = "medium"

  let corBolinha = "bg-green-600"
  let mensagem = "Todos os parâmetros dentro do ideal!"
  if (statusGeral === "medium") {
    corBolinha = "bg-yellow-400"
    mensagem = "Atenção: há parâmetros fora do ideal!"
  } else if (statusGeral === "critical") {
    corBolinha = "bg-red-500"
    mensagem = "Alerta: parâmetros críticos detectados!"
  }

  const dicas = getDicasParametros(statusTemp, statusUmidade, statusPh, statusEc)

  // Mostrar loading skeleton apenas no primeiro carregamento
  if (initialLoad && loading) {
    return (
      <div className="w-full px-6 md:px-8 pt-8">
        {/* Loading mais rápido e elegante */}
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <div className="relative">
              <div className="w-16 h-16 border-4 border-emerald-200 border-t-emerald-600 rounded-full animate-spin mx-auto mb-4"></div>
              <div className="absolute inset-0 w-16 h-16 border-4 border-transparent border-t-green-400 rounded-full animate-spin mx-auto" style={{ animationDirection: 'reverse', animationDuration: '1s' }}></div>
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Carregando Dashboard</h3>
            <p className="text-gray-600 text-sm">Preparando seus dados de cultivo...</p>
            <div className="mt-4 flex items-center justify-center gap-1">
              <div className="w-2 h-2 bg-emerald-500 rounded-full animate-bounce"></div>
              <div className="w-2 h-2 bg-emerald-500 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
              <div className="w-2 h-2 bg-emerald-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="w-full px-6 md:px-8 pt-8 relative">
      {/* Indicador de loading sutil para atualizações */}
      {loading && !initialLoad && (
        <div className="absolute top-4 right-8 z-50">
          <div className="bg-white shadow-lg rounded-full p-2 border border-gray-200">
            <div className="w-4 h-4 border-2 border-emerald-200 border-t-emerald-600 rounded-full animate-spin"></div>
          </div>
        </div>
      )}
      {/* Linha superior: 4 cards de planta */}
      <div className="grid grid-cols-1 md:grid-cols-5 lg:grid-cols-6 gap-2 mb-8">
        {plantas.length === 0 ? (
          <div className="col-span-full">
            <div className="bg-gradient-to-br from-emerald-50/80 via-white to-green-50/80 backdrop-blur-sm rounded-2xl p-8 border border-emerald-200/60 text-center shadow-lg hover:shadow-xl transition-all duration-300">
              <div className="w-20 h-20 bg-gradient-to-br from-emerald-500 to-green-600 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg">
                <Plus className="w-10 h-10 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-3">Criar Primeiro Cultivo</h3>
              <p className="text-gray-600 mb-6 max-w-md mx-auto">
                Comece sua jornada registrando sua primeira planta e ative todas as funcionalidades inteligentes do dashboard
              </p>
              <button
                className="bg-gradient-to-r from-emerald-500 to-green-600 hover:from-emerald-600 hover:to-green-700 text-white font-semibold px-8 py-4 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
                onClick={() => {
                  // Redireciona para o diário de cultivo
                  if (typeof window !== 'undefined') {
                    window.location.href = '/history';
                  }
                }}
              >
                <Plus className="w-5 h-5 inline mr-2" />
                Adicionar Cultivo
              </button>
              <div className="mt-4 text-sm text-gray-500">
                ✨ IA • 📊 Analytics • 🔔 Notificações • 🏆 Conquistas
              </div>
            </div>
          </div>
        ) : (
          plantas.map((planta, i) => (
            <CardPlanta key={planta.id} {...planta} />
          ))
        )}
      </div>
      {/* Segunda linha: Condições do Ambiente, Próximas Tarefas, Diário de Bordo Rápido */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 mb-8">
        {/* Condições do Ambiente */}
        <div className="bg-gradient-to-br from-white to-gray-50 border border-gray-200 rounded-2xl shadow-sm p-5 flex flex-col justify-between w-full min-h-[320px] transition-all duration-200 hover:shadow-xl hover:scale-105 hover:z-10 cursor-pointer">
          {/* Header */}
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-gradient-to-br from-emerald-500 to-green-600 rounded-xl shadow-sm">
                <Layers className="w-5 h-5 text-white" />
              </div>
              <div>
                <h3 className="font-bold text-lg text-gray-900">Condições do Ambiente</h3>
                <p className="text-xs text-gray-500">Monitoramento em tempo real</p>
              </div>
            </div>
            <div className={`w-4 h-4 rounded-full ${corBolinha} animate-pulse shadow-lg`}></div>
          </div>

          {/* Grid de Parâmetros */}
          <div className="grid grid-cols-2 gap-2 mb-3">
            {/* Temperatura */}
            <div className="group relative bg-gradient-to-br from-orange-50 via-orange-100 to-orange-50 rounded-lg p-2 border border-orange-200 hover:border-orange-300 transition-all duration-200 hover:shadow-md hover:scale-105">
              <div className="flex items-center gap-2 mb-1">
                <div className="p-1 bg-orange-100 rounded-lg">
                  <Thermometer className="w-3 h-3 text-orange-600" />
                </div>
                <span className="text-xs font-semibold text-orange-700 uppercase tracking-wide">Temperatura</span>
              </div>
              <div className="text-lg font-bold text-gray-900 group-hover:text-orange-800 transition-colors">
                {ultimaTemp ?? '--'}°C
              </div>
              <div className="text-xs text-orange-600 mt-0.5">
                Ideal: 24-30°C
              </div>
            </div>

            {/* Umidade */}
            <div className="group relative bg-gradient-to-br from-blue-50 via-blue-100 to-blue-50 rounded-lg p-2 border border-blue-200 hover:border-blue-300 transition-all duration-200 hover:shadow-md hover:scale-105">
              <div className="flex items-center gap-2 mb-1">
                <div className="p-1 bg-blue-100 rounded-lg">
                  <Droplet className="w-3 h-3 text-blue-600" />
                </div>
                <span className="text-xs font-semibold text-blue-700 uppercase tracking-wide">Umidade</span>
              </div>
              <div className="text-lg font-bold text-gray-900 group-hover:text-blue-800 transition-colors">
                {ultimaUmidade ?? '--'}%
              </div>
              <div className="text-xs text-blue-600 mt-0.5">
                Ideal: 60-70%
              </div>
            </div>

            {/* pH */}
            <div className="group relative bg-gradient-to-br from-green-50 via-green-100 to-green-50 rounded-lg p-2 border border-green-200 hover:border-green-300 transition-all duration-200 hover:shadow-md hover:scale-105">
              <div className="flex items-center gap-2 mb-1">
                <div className="p-1 bg-green-100 rounded-lg">
                  <Gauge className="w-3 h-3 text-green-600" />
                </div>
                <span className="text-xs font-semibold text-green-700 uppercase tracking-wide">pH</span>
              </div>
              <div className="text-lg font-bold text-gray-900 group-hover:text-green-800 transition-colors">
                {ultimoPh ?? '--'}
              </div>
              <div className="text-xs text-green-600 mt-0.5">
                Ideal: 6.0-6.5
              </div>
            </div>

            {/* EC */}
            <div className="group relative bg-gradient-to-br from-purple-50 via-purple-100 to-purple-50 rounded-lg p-2 border border-purple-200 hover:border-purple-300 transition-all duration-200 hover:shadow-md hover:scale-105">
              <div className="flex items-center gap-2 mb-1">
                <div className="p-1 bg-purple-100 rounded-lg">
                  <Zap className="w-3 h-3 text-purple-600" />
                </div>
                <span className="text-xs font-semibold text-purple-700 uppercase tracking-wide">EC</span>
              </div>
              <div className="text-lg font-bold text-gray-900 group-hover:text-purple-800 transition-colors">
                {ultimoEc ?? '--'}
              </div>
              <div className="text-xs text-purple-600 mt-0.5">
                Ideal: 1.0-1.8 mS/cm
              </div>
            </div>
          </div>

          {/* Botão Conectar Dispositivo */}
          <div className="mb-3">
            <button className="w-full flex items-center justify-center gap-2 p-2.5 bg-gradient-to-r from-emerald-500 to-green-600 text-white text-sm font-medium rounded-lg hover:from-emerald-600 hover:to-green-700 transition-all duration-200 shadow-sm hover:shadow-md">
              <Wifi className="w-4 h-4" />
              Conectar Dispositivo IoT
            </button>
          </div>

          {/* Status */}
          <div className="space-y-2">
            <div className={`flex items-center gap-2 p-2 rounded-lg text-xs font-semibold shadow-sm ${
              statusGeral === "critical" 
                ? "bg-gradient-to-r from-red-50 to-red-100 text-red-800 border border-red-200" 
                : statusGeral === "medium" 
                ? "bg-gradient-to-r from-yellow-50 to-yellow-100 text-yellow-800 border border-yellow-200" 
                : "bg-gradient-to-r from-green-50 to-green-100 text-green-800 border border-green-200"
            }`}>
              <span className={`w-2 h-2 rounded-full ${corBolinha} shadow-sm`}></span>
              <span className="flex-1">{mensagem}</span>
            </div>

            {/* Timestamp */}
            <div className="flex items-center justify-center gap-2 text-xs text-gray-500 pt-1 border-t border-gray-200">
              <Clock className="w-3 h-3" />
              <span>Última atualização: {ultimaAtualizacao || '--'}</span>
            </div>
          </div>
        </div>

        {/* Próximas Tarefas */}
        <div className="w-full min-h-[320px]">
          <ListaTarefas 
            tarefas={tarefas} 
            onToggleTarefa={toggleTarefa} 
            onAddTarefa={addTarefa} 
            onDeleteTarefa={deleteTarefa}
            onEditTarefa={editTarefa}
          />
        </div>

        {/* Diário de Bordo Rápido */}
        <div className="w-full min-h-[320px]">
          <DiarioBordoRapido acoes={acoesRecentes} cultivations={cultivations} phHover={phHover} />
        </div>

        {/* Previsão do Tempo */}
        <div className="w-full min-h-[320px]">
          <WeatherWidget />
        </div>
      </div>

      {/* Terceira linha: Sistema de Alertas Inteligentes e status */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        <div className="lg:col-span-2">
          <PermissionGuard user={user} permission="canAccessAnomalies" showUpgradeModal={true}>
            <AnomalyAlerts 
              cultivations={cultivations}
              agronomicData={agronomicData}
              onAnomalyAction={(anomaly) => {
                console.log("Ação tomada para anomalia:", anomaly)
              }}
            />
          </PermissionGuard>
        </div>
        <div>
          <AnomalyLearningStatus 
            cultivations={cultivations}
            patterns={learnedPatterns}
          />
        </div>
      </div>
    </div>
  )
}
