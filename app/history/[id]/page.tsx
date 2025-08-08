"use client"



import { useState, useEffect } from "react"
import { useParams, useRouter, useSearchParams } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { CultivationTimeline } from "@/components/cultivation-timeline"
import { mockCultivations, mockDetailedReport, type CultivationSummary, type CultivationEvent } from "@/lib/mock-data"
import { 
  ArrowLeft, 
  Calendar, 
  Leaf, 
  DollarSign, 
  Clock, 
  TrendingUp,
  Download,
  Share2,
  Settings,
  Bell,
  BarChart3,
  Brain,
  FileText
} from "lucide-react"
import { PerformanceDashboard } from "@/components/cultivation/performance-dashboard"
import { SetupInfoCard } from "@/components/cultivation/setup-info-card"
import { OperationalCostsCard } from "@/components/cultivation/operational-costs-card"
import { EfficiencyMetricsCard } from "@/components/cultivation/efficiency-metrics-card"
import { SetupConfiguration } from "@/components/cultivation/setup-configuration"
// import { DebugSmartInsights } from "@/components/debug-smart-insights"
import { SmoothPageTransition, StaggerContainer, StaggerItem, SmoothLoadingSpinner, FadeIn } from "@/components/ui/smooth-transitions"
import { Calendar as UiCalendar } from "@/components/ui/calendar"
import jsPDF from "jspdf"
import { useRef } from "react"
import GlobalLoading from '../../loading'
import { EditCultivationModal } from '@/components/forms/edit-cultivation-modal'

// Função para parsear data local yyyy-mm-dd (corrigida para hora 12:00)
function parseDateLocal(dateStr: string) {
  if (!dateStr) return new Date()
  const [year, month, day] = dateStr.split('T')[0].split('-').map(Number)
  // Hora 12:00 para evitar problemas de fuso/horário de verão
  return new Date(year, month - 1, day, 12, 0, 0)
}

export default function CultivationDetailPage() {
  const params = useParams()
  const searchParams = useSearchParams()
  const router = useRouter()
  const cultivationId = params?.id as string

  const [cultivation, setCultivation] = useState<CultivationSummary | null>(null)
  const [allCultivations, setAllCultivations] = useState<CultivationSummary[]>([])
  const [events, setEvents] = useState<CultivationEvent[]>([])
  const [activeTab, setActiveTab] = useState("overview")
  const [showSharing, setShowSharing] = useState(false)
  const [showNotifications, setShowNotifications] = useState(false)
  const [isLoading, setIsLoading] = useState(true)

  // Estado para modal de edição
  const [showEditModal, setShowEditModal] = useState(false)
  const [editData, setEditData] = useState<{
    name: string
    seedStrain: string
    startDate: string
    status: "active" | "completed" | "archived"
    yield_g: string
  }>({
    name: '',
    seedStrain: '',
    startDate: '',
    status: 'active',
    yield_g: '0',
  })

  // Abrir modal com dados atuais
  function openEditModal() {
    if (!cultivation) {
      console.warn('Tentou abrir modal sem cultivation carregado!');
      return;
    }
    setEditData({
      name: cultivation.name,
      seedStrain: cultivation.seedStrain,
      startDate: cultivation.startDate?.slice(0, 10) || '',
      status: cultivation.status,
      yield_g: String(cultivation.yield_g ?? '0'),
    });
    setShowEditModal(true);
  }

  // Handler de submit do modal
  async function handleEditCultivationSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!cultivation) {
      console.warn('cultivation está null ou indefinido!');
      return;
    }
    const res = await fetch(`/api/cultivation/${cultivation.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: editData.name,
        seedStrain: editData.seedStrain,
        startDate: editData.startDate,
        status: editData.status,
        yield_g: editData.yield_g,
      }),
    });
    const data = await res.json();
    if (data.success) {
      window.location.reload();
    }
    setShowEditModal(false);
  }

  // Handler de mudança dos campos do modal
  function handleEditChange(field: string, value: string) {
    setEditData(prev => ({ 
      ...prev, 
      [field]: field === 'status' ? (value as "active" | "completed" | "archived") : value 
    }));
  }

  // Handler para salvar configurações do setup
  async function handleSaveSetupConfiguration(configData: any) {
    if (!cultivation) return;
    
    try {
      const response = await fetch(`/api/cultivation/${cultivation.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(configData),
      });

      if (response.ok) {
        // Atualizar o estado local
        setCultivation(prev => prev ? { ...prev, ...configData } : null);
        console.log('Configuração salva com sucesso!');
      } else {
        console.error('Erro ao salvar configuração');
      }
    } catch (error) {
      console.error('Erro ao salvar configuração:', error);
    }
  }

  useEffect(() => {
    // Carregar dados do banco de dados primeiro
    const loadData = async () => {
      setIsLoading(true)
      
      // Primeiro, tentar carregar do banco
      try {
        console.log('Carregando dados do banco para cultivationId:', cultivationId)
        
        // Buscar cultivo no banco
        const cultivationResponse = await fetch(`/api/cultivation/${cultivationId}`);
        if (cultivationResponse.ok) {
          const cultivationData = await cultivationResponse.json();
          if (cultivationData.success && cultivationData.cultivation) {
            // Converter dados do banco para o formato esperado
            const dbCultivation = {
              id: cultivationData.cultivation.id,
              name: cultivationData.cultivation.name,
              seedStrain: cultivationData.cultivation.seedStrain,
              startDate: cultivationData.cultivation.startDate,
              endDate: cultivationData.cultivation.endDate,
              status: cultivationData.cultivation.status,
              yield_g: cultivationData.cultivation.yield_g,
              profit_brl: cultivationData.cultivation.profit_brl,
              durationDays: cultivationData.cultivation.durationDays,
              hasSevereProblems: cultivationData.cultivation.hasSevereProblems,
              // Dados de setup do banco
              area_m2: cultivationData.cultivation.area_m2,
              custo_equip_iluminacao: cultivationData.cultivation.custo_equip_iluminacao,
              custo_tenda_estrutura: cultivationData.cultivation.custo_tenda_estrutura,
              custo_ventilacao_exaustao: cultivationData.cultivation.custo_ventilacao_exaustao,
              custo_outros_equipamentos: cultivationData.cultivation.custo_outros_equipamentos,
              potencia_watts: cultivationData.cultivation.potencia_watts,
              producao_por_planta_g: cultivationData.cultivation.producao_por_planta_g,
              dias_vegetativo: cultivationData.cultivation.dias_vegetativo,
              dias_veg: cultivationData.cultivation.dias_veg,
              dias_racao: cultivationData.cultivation.dias_racao,
              horas_luz_flor: cultivationData.cultivation.horas_luz_flor,
              dias_secagem_cura: cultivationData.cultivation.dias_secagem_cura,
              preco_kwh: cultivationData.cultivation.preco_kwh,
              custo_sementes_clones: cultivationData.cultivation.custo_sementes_clones,
              custo_substrato: cultivationData.cultivation.custo_substrato,
              custo_nutrientes: cultivationData.cultivation.custo_nutrientes,
              custos_operacionais_misc: cultivationData.cultivation.custos_operacionais_misc,
              preco_venda_por_grama: cultivationData.cultivation.preco_venda_por_grama,
            };
            
            setCultivation(dbCultivation);
            
            // Carregar eventos do banco
            const eventsResponse = await fetch(`/api/cultivation-events?cultivationId=${cultivationId}`);
            if (eventsResponse.ok) {
              const eventsData = await eventsResponse.json();
              if (eventsData.success && eventsData.events.length > 0) {
                // Converter eventos do banco para o formato esperado
                const dbEvents = eventsData.events.map((event: any) => ({
                  id: event.id,
                  date: new Date(event.date).toISOString(),
                  type: event.type,
                  description: event.description || event.title,
                  details: event.details || {}
                }));
                setEvents(dbEvents);
                setIsLoading(false)
                return; // Sair aqui se conseguiu carregar do banco
              }
            }
          }
        }
      } catch (error) {
        console.error('Erro ao carregar dados do banco:', error);
      }

      // Se não conseguiu carregar do banco, usar localStorage como fallback
      let cultivations = []
      if (typeof window !== "undefined") {
        const saved = localStorage.getItem("cultivations")
        if (saved) {
          cultivations = JSON.parse(saved)
        }
      }
      
      setAllCultivations(cultivations)
      const found = cultivations.find((c: any) => c.id === cultivationId)
      setCultivation(found || null)

      // Carregar eventos do localStorage
      const savedEvents = localStorage.getItem(`cultivation_events_${cultivationId}`)
      if (savedEvents) {
        setEvents(JSON.parse(savedEvents))
      } else if (found) {
        // Criar eventos automáticos baseados na data de início
        const autoEvents = createInitialEvents(found)
        setEvents(autoEvents)
        localStorage.setItem(`cultivation_events_${cultivationId}`, JSON.stringify(autoEvents))
      } else {
        // Usar eventos mock se não houver dados salvos
        setEvents(mockDetailedReport.events || [])
      }
      
      setIsLoading(false)
    }

    loadData()
  }, [cultivationId])

  // Função para criar eventos iniciais automáticos
  const createInitialEvents = (cultivation: CultivationSummary) => {
    const startDate = new Date(cultivation.startDate)
    const events: CultivationEvent[] = [
      {
        id: `event_${cultivation.id}_germination`,
        date: cultivation.startDate,
        type: "start_veg",
        description: "Germinação e início da fase vegetativa",
        details: { 
          ph: 6.0, 
          ec: 1.0, 
          temperatura: 24, 
          umidade: 65,
          observacoes: "Sementes plantadas e germinação iniciada"
        }
      }
    ]
    return events
  }

  const handleEventsChange = (newEvents: CultivationEvent[]) => {
    setEvents(newEvents)
    localStorage.setItem(`cultivation_events_${cultivationId}`, JSON.stringify(newEvents))
  }

  const handleExportPDF = () => {
    if (cultivation) {
      // exportCultivationReport(cultivation, events, {
      //   includeTimeline: true,
      //   includeFinancials: true,
      //   includeAnalytics: true
      // })
    }
  }

  const handleShare = () => {
    setShowSharing(true)
  }

  const handleNotifications = () => {
    setShowNotifications(true)
  }

  const formatCurrency = (value: number) =>
    new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(value)

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200"
      case "completed":
        return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
      case "archived":
        return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const getStatusLabel = (status: string) => {
    switch (status) {
      case "active": return "Ativo"
      case "completed": return "Concluído"
      case "archived": return "Arquivado"
      default: return status
    }
  }

  // Scroll automático para evento
  useEffect(() => {
    const eventoId = searchParams?.get('evento')
    if (eventoId) {
      setTimeout(() => {
        const el = document.getElementById(`evento-${eventoId}`)
        if (el) {
          el.scrollIntoView({ behavior: 'smooth', block: 'center' })
          el.classList.add('ring-4', 'ring-green-400', 'ring-offset-2')
          setTimeout(() => el.classList.remove('ring-4', 'ring-green-400', 'ring-offset-2'), 2000)
        }
      }, 800)
    }
  }, [searchParams, events])

  if (isLoading) {
    return <GlobalLoading />;
  }

  if (!cultivation) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center py-8">
            <h1 className="text-2xl font-bold text-gray-900 mb-4">Cultivo não encontrado</h1>
            <p className="text-gray-600 mb-6">O cultivo que você está procurando não foi encontrado.</p>
            <Button onClick={() => router.push('/history')}>
              Voltar para Histórico
            </Button>
          </div>
        </div>
      </div>
    )
  }

  // No cálculo da duração (cards principais e relatório)
  const startDateObj = parseDateLocal(cultivation.startDate)
  const endDateObj = new Date()
  const durationDays = Math.ceil((endDateObj.getTime() - startDateObj.getTime()) / (1000 * 60 * 60 * 24))

  return (
    <SmoothPageTransition>
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Header com transição suave */}
          <StaggerContainer>
            <StaggerItem>
              <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-4">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => router.push("/history")}
                    className="hover:bg-gray-100"
                  >
                    <ArrowLeft className="h-5 w-5" />
                  </Button>
                  <div>
                    <h1 className="text-3xl font-bold text-gray-900">{cultivation.name}</h1>
                    <p className="text-gray-600">{cultivation.seedStrain}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant={cultivation.status === "active" ? "default" : "secondary"}>
                    {cultivation.status === "active" ? "Ativo" : "Concluído"}
                  </Badge>
                  <Button variant="outline" size="sm">
                    <Share2 className="h-4 w-4 mr-2" />
                    Compartilhar
                  </Button>
                </div>
              </div>
            </StaggerItem>

            {/* Cards de métricas com transição em cascata */}
            <StaggerItem delay={1}>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                <Card className="shadow-sm hover:shadow-md transition-shadow duration-300">
                  <CardContent className="p-6">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-green-100 rounded-lg">
                        <Leaf className="h-5 w-5 text-green-600" />
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Rendimento</p>
                        <p className="text-2xl font-bold">{cultivation.yield_g}g</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="shadow-sm hover:shadow-md transition-shadow duration-300">
                  <CardContent className="p-6">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-orange-100 rounded-lg">
                        <Clock className="h-5 w-5 text-orange-600" />
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Duração</p>
                        <p className="text-2xl font-bold">{durationDays} dias</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="shadow-sm hover:shadow-md transition-shadow duration-300">
                  <CardContent className="p-6">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-purple-100 rounded-lg">
                        <TrendingUp className="h-5 w-5 text-purple-600" />
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Eficiência</p>
                        <p className="text-2xl font-bold">
                          {durationDays > 0 
                            ? (cultivation.yield_g / durationDays).toFixed(2)
                            : "0"
                          } g/dia
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
                {/* Card interessante no lugar do lucro */}
                <Card className="shadow-sm hover:shadow-md transition-shadow duration-300">
                  <CardContent className="p-6">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-blue-100 rounded-lg">
                        <BarChart3 className="h-5 w-5 text-blue-600" />
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Eventos</p>
                        <p className="text-2xl font-bold">{events.length}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </StaggerItem>

            {/* Tabs com transição suave */}
            <StaggerItem delay={2}>
              <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
                <TabsList className="grid w-full grid-cols-5">
                  <TabsTrigger value="overview">Visão Geral</TabsTrigger>
                  <TabsTrigger value="timeline">Timeline</TabsTrigger>
                  <TabsTrigger value="performance">Performance</TabsTrigger>
                  <TabsTrigger value="configuration">Configuração</TabsTrigger>
                  <TabsTrigger value="reports">Relatórios</TabsTrigger>
                </TabsList>

                {/* Visão Geral */}
                <TabsContent value="overview" className="space-y-6">
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Informações Básicas */}
                    <Card className="shadow-sm">
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <Calendar className="h-5 w-5" />
                          Informações do Cultivo
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-6">
                        {/* Informações Básicas */}
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <p className="text-sm font-medium text-muted-foreground">Nome</p>
                            <p className="font-medium">{cultivation.name}</p>
                          </div>
                          <div>
                            <p className="text-sm font-medium text-muted-foreground">Variedade</p>
                            <p className="font-medium">{cultivation.seedStrain}</p>
                          </div>
                          <div>
                            <p className="text-sm font-medium text-muted-foreground">Data de Início</p>
                            <p className="font-medium">
                              {new Date(cultivation.startDate).toLocaleDateString("pt-BR")}
                            </p>
                          </div>
                          <div>
                            <p className="text-sm font-medium text-muted-foreground">Data de Fim</p>
                            <p className="font-medium">
                              {cultivation.endDate 
                                ? new Date(cultivation.endDate).toLocaleDateString("pt-BR")
                                : "Em andamento"
                              }
                            </p>
                          </div>
                          <div>
                            <p className="text-sm font-medium text-muted-foreground">Status</p>
                            <Badge className={getStatusColor(cultivation.status)}>
                              {getStatusLabel(cultivation.status)}
                            </Badge>
                          </div>
                          <div>
                            <p className="text-sm font-medium text-muted-foreground">Problemas Graves</p>
                            <Badge variant={cultivation.hasSevereProblems ? "destructive" : "secondary"}>
                              {cultivation.hasSevereProblems ? "Sim" : "Não"}
                            </Badge>
                          </div>
                        </div>

                        {/* Progresso do Ciclo */}
                        <div className="space-y-3">
                          <div className="flex items-center justify-between">
                            <p className="text-sm font-medium text-muted-foreground">Progresso do Ciclo</p>
                            <Badge variant="outline" className="text-xs">
                              {(() => {
                                const startDate = new Date(cultivation.startDate)
                                const totalDays = 150 // Ciclo completo estimado (60 veg + 70 flor + 20 cura)
                                const elapsedDays = Math.ceil((new Date().getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24))
                                const progress = Math.min(Math.max((elapsedDays / totalDays) * 100, 0), 100)
                                return `${Math.round(progress)}%`
                              })()}
                            </Badge>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div 
                              className="bg-blue-600 h-2 rounded-full transition-all duration-300" 
                              style={{ 
                                width: `${(() => {
                                  const startDate = new Date(cultivation.startDate)
                                  const totalDays = 150 // Ciclo completo estimado
                                  const elapsedDays = Math.ceil((new Date().getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24))
                                  const progress = Math.min(Math.max((elapsedDays / totalDays) * 100, 0), 100)
                                  return progress
                                })()}%` 
                              }}
                            />
                          </div>
                        </div>

                        {/* Fase Atual e Dias Restantes */}
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <p className="text-sm font-medium text-muted-foreground">Fase Atual</p>
                            <Badge variant="secondary" className="mt-1">
                              {(() => {
                                const startDate = new Date(cultivation.startDate)
                                const elapsedDays = Math.ceil((new Date().getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24))
                                
                                if (elapsedDays <= 60) return "Vegetativo"
                                if (elapsedDays <= 130) return "Floração"
                                if (elapsedDays <= 150) return "Cura"
                                return "Finalizado"
                              })()}
                            </Badge>
                          </div>
                          <div>
                            <p className="text-sm font-medium text-muted-foreground">Dias Restantes</p>
                            <p className="font-medium text-lg">
                              {(() => {
                                const startDate = new Date(cultivation.startDate)
                                const totalDays = 150 // Ciclo completo estimado (60 veg + 70 flor + 20 cura)
                                const elapsedDays = Math.ceil((new Date().getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24))
                                const remaining = Math.max(totalDays - elapsedDays, 0)
                                return remaining > 0 ? `${remaining} dias` : "Finalizado"
                              })()}
                            </p>
                          </div>
                        </div>

                        {/* Próximas Ações */}
                        <div className="space-y-3">
                          <p className="text-sm font-medium text-muted-foreground">Próximas Ações</p>
                          <div className="space-y-2">
                            {(() => {
                              const startDate = new Date(cultivation.startDate)
                              const elapsedDays = Math.ceil((new Date().getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24))
                              const actions: string[] = []
                              
                              if (elapsedDays <= 60) {
                                actions.push("Fertilização semanal", "Controle de pH", "Ajuste de umidade")
                              } else if (elapsedDays <= 130) {
                                actions.push("Fertilização floração", "Controle de pragas", "Ajuste de temperatura")
                              } else if (elapsedDays <= 150) {
                                actions.push("Reduzir umidade", "Preparar secagem", "Colheita em breve")
                              }
                              
                              return actions.map((action, index) => (
                                <div key={index} className="flex items-center gap-2 text-sm">
                                  <div className="w-2 h-2 bg-blue-500 rounded-full" />
                                  <span>{action}</span>
                                </div>
                              ))
                            })()}
                          </div>
                        </div>
                      </CardContent>
                    </Card>

                    {/* Calendário do Cultivo */}
                    <Card className="shadow-sm">
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <Calendar className="h-5 w-5" />
                          Calendário do Cultivo
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <CultivationCalendarV2 
                          startDate={cultivation.startDate}
                        />
                      </CardContent>
                    </Card>
                  </div>

                  {/* Novos Cards de Setup, Custos e Eficiência */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <SetupInfoCard cultivation={cultivation} />
                    <OperationalCostsCard cultivation={cultivation} />
                    <EfficiencyMetricsCard cultivation={cultivation} />
                  </div>
                </TabsContent>

                {/* Timeline */}
                <TabsContent value="timeline" className="space-y-6">
                  <div className="w-full">
                    <div className="relative overflow-y-auto max-h-[600px] bg-white rounded-xl shadow p-4 md:p-8">
                      <CultivationTimeline
                        events={events}
                        incidents={[]}
                        cultivationId={params?.id as string}
                        cultivationStartDate={cultivation?.startDate || new Date().toISOString()}
                      />
                    </div>
                  </div>
                </TabsContent>

                {/* Performance - KPIs e gráfico */}
                <TabsContent value="performance" className="space-y-6">
                  {cultivation ? (
                    <PerformanceDashboard
                      cultivation={cultivation}
                      allCultivations={allCultivations}
                      events={events}
                    />
                  ) : (
                    <div className="text-center py-8 text-muted-foreground">
                      <p>Carregando dados do cultivo...</p>
                    </div>
                  )}
                </TabsContent>

                {/* Configuração do Setup */}
                <TabsContent value="configuration" className="space-y-6">
                  {cultivation ? (
                    <SetupConfiguration
                      cultivation={cultivation}
                      onSave={handleSaveSetupConfiguration}
                    />
                  ) : (
                    <div className="text-center py-8 text-muted-foreground">
                      <p>Carregando dados do cultivo...</p>
                    </div>
                  )}
                </TabsContent>

                {/* Relatórios */}
                <TabsContent value="reports" className="space-y-6">
                  <Card className="shadow-sm">
                    <CardHeader>
                      <CardTitle>Bloco de Notas do Cultivo</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <BlocoNotasCultivo cultivationId={cultivation.id} />
                    </CardContent>
                  </Card>

                  <Card className="shadow-sm">
                    <CardHeader>
                      <CardTitle>Ações de Relatório</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="flex gap-4">
                        <Button className="flex items-center gap-2" onClick={() => exportCultivationPDF(cultivation)}>
                          <Download className="h-4 w-4" />
                          Exportar PDF Completo
                        </Button>
                        <Button variant="outline" className="flex items-center gap-2">
                          <Share2 className="h-4 w-4" />
                          Compartilhar Relatório
                        </Button>
                        <Button variant="outline" className="flex items-center gap-2">
                          <Bell className="h-4 w-4" />
                          Configurar Alertas
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>
              </Tabs>
            </StaggerItem>
          </StaggerContainer>
        </div>
      </div>

      {/* Botão para abrir modal de edição */}
      <div className="flex justify-end mb-4">
        <Button variant="outline" size="sm" onClick={openEditModal}>
          Editar Cultivo
        </Button>
      </div>

      {/* Modal de edição de cultivo */}
      <EditCultivationModal
        isOpen={showEditModal}
        editData={editData}
        onClose={() => setShowEditModal(false)}
        onSubmit={handleEditCultivationSubmit}
        onChange={handleEditChange}
      />

      {/* Modais */}
      {/**
      {showSharing && cultivation && (
        <CultivationSharing
          cultivation={cultivation}
          events={events}
          onClose={() => setShowSharing(false)}
        />
      )}

      {showNotifications && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
          <div className="bg-white dark:bg-zinc-900 rounded-lg shadow-xl p-6 w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold">Notificações Inteligentes</h2>
              <Button variant="ghost" size="icon" onClick={() => setShowNotifications(false)}>
                <ArrowLeft className="h-5 w-5" />
              </Button>
            </div>
            <SmartNotifications
              cultivations={allCultivations}
              events={events}
            />
          </div>
        </div>
      )}
      **/}
    </SmoothPageTransition>
  )
}

function CultivationCalendarV2({ startDate }: { startDate: string }) {
  const params = useParams();
  const cultivationId = params?.id as string;
  const today = new Date()
  const start = parseDateLocal(startDate)
  const [dates, setDates] = useState({
    inicio: start,
    floracao: undefined as Date | undefined,
    colheita: undefined as Date | undefined,
    secagem: undefined as Date | undefined,
    cura: undefined as Date | undefined,
  })
  // Estado para o mês exibido
  const [currentMonth, setCurrentMonth] = useState(new Date(start.getFullYear(), start.getMonth(), 1))
  const [loading, setLoading] = useState(false)

  // Buscar datas do backend ao montar
  useEffect(() => {
    async function fetchPhaseDates() {
      setLoading(true)
      try {
        const res = await fetch(`/api/cultivation/${cultivationId}`)
        if (res.ok) {
          const data = await res.json()
          if (data.success && data.cultivation) {
            setDates({
              inicio: parseDateLocal(data.cultivation.startDate),
              floracao: data.cultivation.floracaoDate ? parseDateLocal(data.cultivation.floracaoDate) : undefined,
              colheita: data.cultivation.colheitaDate ? parseDateLocal(data.cultivation.colheitaDate) : undefined,
              secagem: data.cultivation.secagemDate ? parseDateLocal(data.cultivation.secagemDate) : undefined,
              cura: data.cultivation.curaDate ? parseDateLocal(data.cultivation.curaDate) : undefined,
            })
          }
        }
      } catch (e) {
        // erro silencioso
      } finally {
        setLoading(false)
      }
    }
    fetchPhaseDates()
  }, [cultivationId, startDate])

  function getMonthMatrix(date: Date) {
    const year = date.getFullYear()
    const month = date.getMonth()
    const firstDay = new Date(year, month, 1)
    const lastDay = new Date(year, month + 1, 0)
    const matrix: (Date | null)[][] = []
    let week: (Date | null)[] = []
    let dayOfWeek = firstDay.getDay()
    for (let i = 0; i < dayOfWeek; i++) week.push(null)
    for (let d = 1; d <= lastDay.getDate(); d++) {
      week.push(new Date(year, month, d))
      if (week.length === 7) {
        matrix.push(week)
        week = []
      }
    }
    if (week.length) {
      while (week.length < 7) week.push(null)
      matrix.push(week)
    }
    return matrix
  }
  const matrix = getMonthMatrix(currentMonth)

  const phaseColors: Record<string, string> = {
    inicio: "bg-green-500 text-white border-green-600",
    floracao: "bg-yellow-300 text-yellow-900 border-yellow-500",
    colheita: "bg-green-200 text-green-900 border-green-400",
    secagem: "bg-blue-200 text-blue-900 border-blue-400",
    cura: "bg-purple-200 text-purple-900 border-purple-400",
  }
  const phaseNames: Record<string, string> = {
    inicio: "Início",
    floracao: "Floração",
    colheita: "Colheita",
    secagem: "Secagem",
    cura: "Cura",
  }

  function getDayPhase(day: Date) {
    for (const key of Object.keys(dates)) {
      const d = dates[key as keyof typeof dates]
      if (d && d.toDateString() === day.toDateString()) return key
    }
    return null
  }

  async function handleDateInputChange(phase: keyof typeof dates, value: string) {
    if (phase === "inicio") return // nunca permitir editar startDate
    if (!value) {
      setDates(d => ({ ...d, [phase]: undefined }))
      // Salvar no backend
      await fetch(`/api/cultivation/${cultivationId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ [`${phase}Date`]: null }),
      })
      return
    }
    const newDate = parseDateLocal(value)
    if (!newDate) return
    if (newDate.toDateString() === start.toDateString()) return
    for (const key of Object.keys(dates)) {
      if (key !== phase) {
        const d = dates[key as keyof typeof dates]
        if (d && d.toDateString() === newDate.toDateString()) return
      }
    }
    setDates(d => ({ ...d, [phase]: newDate }))
    // Salvar no backend (sempre como yyyy-mm-dd)
    await fetch(`/api/cultivation/${cultivationId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ [`${phase}Date`]: value }),
    })
  }

  // Navegação de meses
  function goToPrevMonth() {
    setCurrentMonth(m => new Date(m.getFullYear(), m.getMonth() - 1, 1))
  }
  function goToNextMonth() {
    setCurrentMonth(m => new Date(m.getFullYear(), m.getMonth() + 1, 1))
  }

  return (
    <div className="flex flex-col md:flex-row gap-6 w-full h-full">
      <div className="flex-1 flex flex-col items-center justify-center">
        <div className="flex items-center justify-between w-full max-w-md mb-2">
          <button onClick={goToPrevMonth} className="p-1 rounded hover:bg-gray-100" aria-label="Mês anterior" disabled={loading}>&#8592;</button>
          <span className="font-semibold text-lg">{currentMonth.toLocaleString("default", { month: "long", year: "numeric" })}</span>
          <button onClick={goToNextMonth} className="p-1 rounded hover:bg-gray-100" aria-label="Próximo mês" disabled={loading}>&#8594;</button>
        </div>
        <div className="w-full max-w-md grid grid-cols-7 gap-1 bg-white rounded-lg shadow p-2 border">
          {["D", "S", "T", "Q", "Q", "S", "S"].map((d, i) => (
            <div key={i} className="text-xs font-bold text-gray-500 text-center py-1">{d}</div>
          ))}
          {matrix.flat().map((day, i) => {
            if (!day) return <div key={i} className="h-10" />
            const phase = getDayPhase(day)
            return (
              <div
                key={i}
                className={`h-10 w-10 rounded-full flex items-center justify-center mx-auto border transition-all duration-150
                  ${phase ? phaseColors[phase] : "text-gray-800 border-transparent"}
                  ${day.toDateString() === today.toDateString() ? "ring-2 ring-primary" : ""}
                `}
                title={phase ? phaseNames[phase] : undefined}
              >
                {day.getDate()}
              </div>
            )
          })}
        </div>
        <div className="flex flex-col gap-2 mt-4 w-full max-w-xs">
          <label className="flex items-center gap-2">
            <span className="w-20">Floração:</span>
            <input type="date" className="border rounded p-1 flex-1" value={dates.floracao ? dates.floracao.toISOString().split('T')[0] : ""} onChange={e => handleDateInputChange("floracao", e.target.value)} disabled={loading} />
          </label>
          <label className="flex items-center gap-2">
            <span className="w-20">Colheita:</span>
            <input type="date" className="border rounded p-1 flex-1" value={dates.colheita ? dates.colheita.toISOString().split('T')[0] : ""} onChange={e => handleDateInputChange("colheita", e.target.value)} disabled={loading} />
          </label>
          <label className="flex items-center gap-2">
            <span className="w-20">Secagem:</span>
            <input type="date" className="border rounded p-1 flex-1" value={dates.secagem ? dates.secagem.toISOString().split('T')[0] : ""} onChange={e => handleDateInputChange("secagem", e.target.value)} disabled={loading} />
          </label>
          <label className="flex items-center gap-2">
            <span className="w-20">Cura:</span>
            <input type="date" className="border rounded p-1 flex-1" value={dates.cura ? dates.cura.toISOString().split('T')[0] : ""} onChange={e => handleDateInputChange("cura", e.target.value)} disabled={loading} />
          </label>
        </div>
        <div className="flex flex-wrap gap-2 mt-4 items-center justify-center">
          {Object.keys(phaseNames).map(key => (
            <div key={key} className="flex items-center gap-1 text-xs">
              <span className={`inline-block w-3 h-3 rounded-full mr-1 ${phaseColors[key].split(" ")[0]}`}></span>
              {phaseNames[key]}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

function ChecklistAcoesCultivo({ cultivation }: { cultivation: any }) {
  // Exemplo de checklist dinâmico por fase
  const fases = [
    { nome: "Vegetativo", dias: 60, acoes: ["Rega regular", "Controle de pH", "Monitorar pragas", "Poda leve"] },
    { nome: "Floração", dias: 70, acoes: ["Ajustar iluminação", "Fertilização específica", "Controle de umidade", "Monitorar flores"] },
    { nome: "Secagem", dias: 10, acoes: ["Colher plantas", "Secar em local ventilado", "Evitar luz direta"] },
    { nome: "Cura", dias: 10, acoes: ["Armazenar em pote hermético", "Abrir pote diariamente", "Verificar aroma"] },
  ]
  // Determinar fase atual
  const startDate = new Date(cultivation.startDate)
  const elapsedDays = Math.ceil((new Date().getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24))
  let faseAtual = fases[0]
  let diasNaFase = elapsedDays
  let acumulado = 0
  for (const fase of fases) {
    if (diasNaFase <= fase.dias) {
      faseAtual = fase
      break
    }
    diasNaFase -= fase.dias
    acumulado += fase.dias
  }
  return (
    <div>
      <div className="mb-2 font-semibold">Fase atual: {faseAtual.nome} ({diasNaFase} dias)</div>
      <ul className="list-disc pl-6 space-y-1">
        {faseAtual.acoes.map((acao, i) => (
          <li key={i}>{acao}</li>
        ))}
      </ul>
      <div className="mt-4 text-xs text-gray-500">Checklist muda conforme a fase do cultivo.</div>
    </div>
  )
}

async function exportCultivationPDF(cultivation: any) {
  const doc = new jsPDF()
  doc.setFontSize(18)
  doc.text("Relatório do Cultivo", 14, 20)
  doc.setFontSize(12)
  doc.text(`Nome: ${cultivation.name || "-"}`, 14, 32)
  doc.text(`Variedade: ${cultivation.seedStrain || "-"}`, 14, 40)
  doc.text(`Data de Início: ${new Date(cultivation.startDate).toLocaleDateString("pt-BR")}`, 14, 48)
  doc.text(`Status: ${cultivation.status || "-"}`, 14, 56)
  doc.text(`Rendimento: ${cultivation.yield_g || 0}g`, 14, 64)
  doc.text(`Duração: ${cultivation.durationDays || 0} dias`, 14, 72)
  doc.text("\nFases e Checklist:", 14, 84)
  // Exemplo de checklist
  const fases = [
    { nome: "Vegetativo", dias: 60, acoes: ["Rega regular", "Controle de pH", "Monitorar pragas", "Poda leve"] },
    { nome: "Floração", dias: 70, acoes: ["Ajustar iluminação", "Fertilização específica", "Controle de umidade", "Monitorar flores"] },
    { nome: "Secagem", dias: 10, acoes: ["Colher plantas", "Secar em local ventilado", "Evitar luz direta"] },
    { nome: "Cura", dias: 10, acoes: ["Armazenar em pote hermético", "Abrir pote diariamente", "Verificar aroma"] },
  ]
  let y = 92
  for (const fase of fases) {
    doc.setFontSize(12)
    doc.text(`- ${fase.nome}:`, 16, y)
    y += 6
    doc.setFontSize(10)
    for (const acao of fase.acoes) {
      doc.text(`  • ${acao}`, 20, y)
      y += 5
    }
    y += 2
  }
  doc.save(`relatorio-cultivo-${cultivation.name || "cultivo"}.pdf`)
}

function BlocoNotasCultivo({ cultivationId }: { cultivationId: string }) {
  const [nota, setNota] = useState("")
  const [salvando, setSalvando] = useState(false)
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  // Carregar nota do localStorage ao montar
  useEffect(() => {
    const saved = localStorage.getItem(`cultivo_nota_${cultivationId}`)
    if (saved) setNota(saved)
  }, [cultivationId])
  // Salvar nota
  const salvarNota = () => {
    setSalvando(true)
    localStorage.setItem(`cultivo_nota_${cultivationId}`, nota)
    setTimeout(() => setSalvando(false), 500)
  }
  return (
    <div>
      <textarea
        ref={textareaRef}
        className="w-full min-h-[120px] border rounded p-2 text-sm"
        placeholder="Escreva suas anotações, aprendizados, lembretes..."
        value={nota}
        onChange={e => setNota(e.target.value)}
        disabled={salvando}
      />
      <div className="flex justify-end mt-2">
        <Button size="sm" onClick={salvarNota} disabled={salvando}>
          {salvando ? "Salvando..." : "Salvar Nota"}
        </Button>
      </div>
      <div className="text-xs text-gray-500 mt-2">Suas anotações ficam salvas neste navegador.</div>
    </div>
  )
}