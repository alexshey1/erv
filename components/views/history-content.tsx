"use client"

import { useState, useEffect, useRef, useCallback } from "react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { CultivationCard } from "@/components/cultivation-card"
import { AggregateStats } from "@/components/dashboard/aggregate-stats"
import { CultivationComparison } from "@/components/views/cultivation-comparison"
import { HistoryCharts } from "@/components/charts/history-charts"
import { CultivationSummary } from "@/lib/mock-data"
import { calculateResults } from "@/lib/cultivation-calculator"
import { Search, GitCompare, Plus, BarChart3, TrendingUp, Filter, Trash2, Pencil } from "lucide-react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { v4 as uuidv4 } from "uuid"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Calendar as CalendarIcon } from "lucide-react"
import { format } from "date-fns"
import type { FormEvent } from "react"
import { NewCultivationModal } from "@/components/forms/new-cultivation-modal"
import { EditCultivationModal } from "@/components/forms/edit-cultivation-modal"
import { checkCultivationLimit } from "@/lib/permissions-supabase"
import { UpgradeModal } from "@/components/auth/upgrade-modal"
import { ContentLoading, SmoothLoadingSpinner, FadeIn } from "@/components/ui/smooth-transitions"
import { CultivationEmptyState } from "@/components/onboarding/cultivation-empty-state"
import type { PlantType, AdaptiveCycleParams } from "@/types/plant-genetics"
// Novo componente para o modal de novo cultivo
// (declarado fora do componente HistoryContent para evitar conflitos de escopo)
interface NewCultivationModalProps {
  open: boolean
  onClose: () => void
  onSubmit: (e: FormEvent<HTMLFormElement>) => void
  values: {
    name: string
    seedStrain: string
    startDate: string
    status: "active" | "completed" | "archived"
    yield_g: string
  }
  onChange: (field: string, value: string) => void
}

export function HistoryContent() {
  const [searchTerm, setSearchTerm] = useState("")
  const [sortBy, setSortBy] = useState("startDate")
  const [filterStatus, setFilterStatus] = useState("all")
  const [selectedCultivations, setSelectedCultivations] = useState<string[]>([])
  const [isNewModalOpen, setIsNewModalOpen] = useState(false)
  const [isComparisonOpen, setIsComparisonOpen] = useState(false)
  const [showCharts, setShowCharts] = useState(true)
  const [isSelectionMode, setIsSelectionMode] = useState(false)
  const [filteredCultivations, setFilteredCultivations] = useState<CultivationSummary[]>([])
  const [cultivations, setCultivations] = useState<CultivationSummary[]>([])
  const [isClient, setIsClient] = useState(false)
  const [user, setUser] = useState<any>(null)
  const [showUpgradeModal, setShowUpgradeModal] = useState(false)

  // Carregar dados do banco de dados com loading state
  const [isLoading, setIsLoading] = useState(true)
  
  useEffect(() => {
    const loadCultivations = async () => {
      setIsLoading(true)
      
      // Limpar dados mock do localStorage
      if (typeof window !== "undefined") {
        localStorage.removeItem("cultivations")
      }
      
      try {
        // Sempre tentar carregar do banco de dados primeiro
        const response = await fetch('/api/cultivation');
        if (response.ok) {
          const data = await response.json();
          if (data.success) {
            // Converter para o formato esperado pelo componente
            const dbCultivations: CultivationSummary[] = data.cultivations.map((cultivation: any) => ({
              id: cultivation.id,
              name: cultivation.name,
              seedStrain: cultivation.seedStrain,
              startDate: new Date(cultivation.startDate).toISOString().split('T')[0],
              endDate: cultivation.endDate ? new Date(cultivation.endDate).toISOString().split('T')[0] : null,
              yield_g: cultivation.yield_g,
              profit_brl: cultivation.profit_brl,
              status: cultivation.status,
              durationDays: cultivation.durationDays,
              hasSevereProblems: false,
              photoUrl: cultivation.photoUrl || "",
            }));
            
            // Usar apenas dados do banco
            setCultivations(dbCultivations);
            
            // Atualizar localStorage apenas com dados do banco
            if (typeof window !== "undefined") {
              localStorage.setItem("cultivations", JSON.stringify(dbCultivations));
            }
            return;
          }
        }
      } catch (error) {
        console.error('Erro ao carregar cultivos do banco:', error);
      }

      // Se não conseguir carregar do banco, usar array vazio
      setCultivations([])
    }

    setIsClient(true)
    loadCultivations().finally(() => setIsLoading(false))
  }, [])

  // Carregar usuário
  useEffect(() => {
    const loadUser = async () => {
      try {
        const response = await fetch('/api/auth/supabase/me');
        if (response.ok) {
          const data = await response.json();
          setUser(data.user || null);
        }
      } catch (error) {
        console.error('Erro ao carregar usuário:', error);
        setUser(null);
      }
    };

    loadUser();
  }, []);

  // Form state for new cultivation
  const [newCultivation, setNewCultivation] = useState({
    name: "",
    seedStrain: "",
    startDate: "",
    status: "active" as "active" | "completed" | "archived",
    yield_g: "",
    // Novos campos para ciclo adaptativo
    plant_type: undefined as PlantType | undefined,
    cycle_preset_id: "manual",
    custom_cycle_params: undefined as AdaptiveCycleParams | undefined,
  })

  // Estado de erro para cada campo do formulário de novo cultivo
  const [newCultivationErrors, setNewCultivationErrors] = useState<{ name?: string; seedStrain?: string; startDate?: string }>({})
  
  // Estado de loading para prevenir múltiplos cliques
  const [isSubmittingNewCultivation, setIsSubmittingNewCultivation] = useState(false)

  // Resetar o estado do formulário só quando abrir o modal (transição de fechado para aberto)
  const prevIsNewModalOpen = useRef(isNewModalOpen)
  useEffect(() => {
    if (!prevIsNewModalOpen.current && isNewModalOpen) {
      setNewCultivation({ 
        name: "", 
        seedStrain: "", 
        startDate: "", 
        status: "active", 
        yield_g: "",
        plant_type: undefined,
        cycle_preset_id: "manual",
        custom_cycle_params: undefined,
      })
    }
    prevIsNewModalOpen.current = isNewModalOpen
  }, [isNewModalOpen])

  const handleNewChange = (field: string, value: string | PlantType | AdaptiveCycleParams) => {
    setNewCultivation((prev) => ({ ...prev, [field]: value }))
  }

  const handleNewSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    // Prevenir múltiplos cliques
    if (isSubmittingNewCultivation) {
      console.log('⏳ Já está processando um cultivo, ignorando clique duplo')
      return
    }
    
    const errors: { name?: string; seedStrain?: string; startDate?: string } = {}
    if (!newCultivation.name) errors.name = "Obrigatório"
    if (!newCultivation.seedStrain) errors.seedStrain = "Obrigatório"
    if (!newCultivation.startDate) errors.startDate = "Obrigatório"
    setNewCultivationErrors(errors)
    if (Object.keys(errors).length > 0) return
    
    setIsSubmittingNewCultivation(true)

    // Verificar limite de cultivos para plano Free
    if (user && !checkCultivationLimit(user, cultivations.length)) {
      setShowUpgradeModal(true)
      return
    }

    try {
      // Calcular lucro automaticamente se o cultivo estiver concluído e tiver rendimento
      let calculatedProfit = 0
      if (newCultivation.status === "completed" && Number(newCultivation.yield_g) > 0) {
        // Usar parâmetros adaptativos se disponíveis, senão usar valores padrão
        const setupParams = {
          area_m2: 2.25,
          custo_equip_iluminacao: 2000,
          custo_tenda_estrutura: 1500,
          custo_ventilacao_exaustao: 800,
          custo_outros_equipamentos: 500,
        }
        
        // Usar configuração adaptativa ou valores padrão
        const cycleParams = newCultivation.custom_cycle_params ? {
          potencia_watts: newCultivation.custom_cycle_params.potencia_watts,
          num_plantas: newCultivation.custom_cycle_params.num_plantas,
          producao_por_planta_g: newCultivation.custom_cycle_params.producao_por_planta_g,
          dias_vegetativo: newCultivation.custom_cycle_params.dias_vegetativo,
          horas_luz_veg: newCultivation.custom_cycle_params.horas_luz_veg,
          dias_floracao: newCultivation.custom_cycle_params.dias_floracao,
          horas_luz_flor: newCultivation.custom_cycle_params.horas_luz_flor,
          dias_secagem_cura: newCultivation.custom_cycle_params.dias_secagem_cura,
          // Novos campos adaptativos
          plant_type: newCultivation.custom_cycle_params.plant_type,
          genetics_name: newCultivation.custom_cycle_params.genetics_name,
          luz_constante_auto: newCultivation.custom_cycle_params.luz_constante_auto,
        } : {
          potencia_watts: 480,
          num_plantas: 6,
          producao_por_planta_g: Number(newCultivation.yield_g) / 6, // Distribuir rendimento entre plantas
          dias_vegetativo: 60,
          horas_luz_veg: 18,
          dias_floracao: 70,
          horas_luz_flor: 12,
          dias_secagem_cura: 20,
        }
        
        const marketParams = {
          preco_kwh: 0.95,
          custo_sementes_clones: 50,
          custo_substrato: 120,
          custo_nutrientes: 350,
          custos_operacionais_misc: 100,
          preco_venda_por_grama: 45,
        }
        
        const results = calculateResults(setupParams, cycleParams, marketParams)
        calculatedProfit = results.lucro_liquido_ciclo
      }

      // Calcular duração baseada no ciclo adaptativo ou data de início/fim
      let durationDays = 0
      if (newCultivation.custom_cycle_params) {
        // Usar duração calculada do ciclo adaptativo
        durationDays = newCultivation.custom_cycle_params.dias_vegetativo + 
                      newCultivation.custom_cycle_params.dias_floracao + 
                      newCultivation.custom_cycle_params.dias_secagem_cura
      } else if (newCultivation.status === "completed" && newCultivation.startDate) {
        // Calcular baseado nas datas
        const startDate = new Date(newCultivation.startDate)
        const endDate = new Date()
        durationDays = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24))
      }

      const cultivationData = {
        name: newCultivation.name,
        seedStrain: newCultivation.seedStrain,
        startDate: newCultivation.startDate,
        status: newCultivation.status,
        yield_g: Number(newCultivation.yield_g) || 0,
        profit_brl: calculatedProfit,
        durationDays: durationDays,
        // Adicionar dados do ciclo adaptativo se disponíveis
        plant_type: newCultivation.plant_type,
        cycle_preset_id: newCultivation.cycle_preset_id,
        custom_cycle_params: newCultivation.custom_cycle_params,
      }

      console.log('🔍 Enviando dados para API:', cultivationData);

      // Salvar no banco de dados
      const response = await fetch('/api/cultivation', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(cultivationData),
      });

      console.log('📝 Resposta da API:', response.status, response.statusText);

      if (!response.ok) {
        let errorMessage = `Erro ${response.status}: ${response.statusText}`;
        
        try {
          const errorData = await response.json();
          errorMessage = errorData.error || errorMessage;
          console.error('❌ Detalhes do erro:', errorData);
        } catch (parseError) {
          console.error('❌ Erro ao fazer parse da resposta:', parseError);
          // Tentar ler como texto se não for JSON
          const textResponse = await response.text();
          console.error('📝 Resposta como texto:', textResponse);
        }
        
        throw new Error(`Erro ao salvar cultivo: ${errorMessage}`);
      }

      const result = await response.json();
      console.log('Cultivo salvo no banco:', result.cultivation);

      // Criar evento inicial automático no banco de dados
      try {
        const initialEvent = {
          id: `event_${result.cultivation.id}_germination`,
          date: newCultivation.startDate,
          type: "start_veg" as const,
          description: "Germinação e início da fase vegetativa",
          details: { 
            ph: 6.0, 
            ec: 1.0, 
            temperatura: 24, 
            umidade: 65,
            observacoes: "Sementes plantadas e germinação iniciada"
          }
        }

        const eventResponse = await fetch('/api/cultivation-events', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            cultivationId: result.cultivation.id,
            event: initialEvent
          }),
        });

        if (eventResponse.ok) {
          console.log('Evento inicial criado com sucesso');
        } else {
          console.error('Erro ao criar evento inicial:', eventResponse.statusText);
        }
      } catch (error) {
        console.error('Erro ao criar evento inicial:', error);
      }

      // Criar objeto para o estado local
      const newItem: CultivationSummary = {
        id: result.cultivation.id,
        name: result.cultivation.name,
        seedStrain: result.cultivation.seedStrain,
        startDate: new Date(result.cultivation.startDate).toISOString().split('T')[0],
        endDate: result.cultivation.endDate ? new Date(result.cultivation.endDate).toISOString().split('T')[0] : null,
        yield_g: result.cultivation.yield_g,
        profit_brl: result.cultivation.profit_brl,
        status: result.cultivation.status,
        durationDays: result.cultivation.durationDays,
        hasSevereProblems: false,
      }

      const updated = [newItem, ...cultivations]
      setCultivations(updated)
      if (typeof window !== "undefined") {
        localStorage.setItem("cultivations", JSON.stringify(updated))
      }
      
      setIsNewModalOpen(false)
      setNewCultivationErrors({})

    } catch (error) {
      console.error('Erro ao criar cultivo:', error);
      alert(`Erro ao criar cultivo: ${error instanceof Error ? error.message : 'Erro desconhecido'}`);
    } finally {
      // Sempre resetar o estado de loading
      setIsSubmittingNewCultivation(false)
    }
  }

  // Usar filtros avançados se disponíveis, senão usar filtros básicos
  const baseFilteredCultivations = filteredCultivations.length > 0 ? filteredCultivations : cultivations

  const [advancedFilters, setAdvancedFilters] = useState({
    status: "all",
    startDateFrom: "",
    startDateTo: "",
    strain: "",
    minYield: "",
    maxYield: ""
  })
  const [isPopoverOpen, setIsPopoverOpen] = useState(false)

  const uniqueStrains = Array.from(new Set(cultivations.map(c => c.seedStrain))).filter(Boolean)

  const handleAdvancedFilterChange = (field: string, value: string) => {
    setAdvancedFilters(prev => ({ ...prev, [field]: value }))
  }
  const handleClearAdvancedFilters = () => {
    setAdvancedFilters({ status: "all", startDateFrom: "", startDateTo: "", strain: "", minYield: "", maxYield: "" })
  }

  const filteredAndSortedCultivations = cultivations
    .filter((cultivation: CultivationSummary) => {
      const matchesSearch =
        cultivation.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        cultivation.seedStrain.toLowerCase().includes(searchTerm.toLowerCase())
      const matchesStatus = filterStatus === "all" || cultivation.status === filterStatus
      const matchesStrain = !advancedFilters.strain || cultivation.seedStrain === advancedFilters.strain
      const matchesYield = (!advancedFilters.minYield || cultivation.yield_g >= Number(advancedFilters.minYield)) &&
        (!advancedFilters.maxYield || cultivation.yield_g <= Number(advancedFilters.maxYield))
      const matchesStartDateFrom = !advancedFilters.startDateFrom || new Date(cultivation.startDate) >= new Date(advancedFilters.startDateFrom)
      const matchesStartDateTo = !advancedFilters.startDateTo || new Date(cultivation.startDate) <= new Date(advancedFilters.startDateTo)
      return matchesSearch && matchesStatus && matchesStrain && matchesYield && matchesStartDateFrom && matchesStartDateTo
    })
    .sort((a: CultivationSummary, b: CultivationSummary) => {
      if (sortBy === "startDate") {
        return new Date(b.startDate).getTime() - new Date(a.startDate).getTime()
      }
      if (sortBy === "yield_g") {
        return b.yield_g - a.yield_g
      }
      return 0
    })

  const handleSelectCultivation = (id: string, selected: boolean) => {
    console.log('Selecionando cultivo:', id, selected)
    setSelectedCultivations((prev) => {
      if (selected) {
        return [...prev, id]
      } else {
        return prev.filter((cultId) => cultId !== id)
      }
    })
  }

  // Estado e lógica para edição de cultivo existente
  const [editCultivationId, setEditCultivationId] = useState<string | null>(null)
  const [editData, setEditData] = useState({
    name: "",
    seedStrain: "",
    startDate: "",
    status: "active" as "active" | "completed" | "archived",
    yield_g: "",
  })

  const openEditModal = (cultivation: CultivationSummary) => {
    setEditCultivationId(cultivation.id)
    setEditData({
      name: cultivation.name,
      seedStrain: cultivation.seedStrain,
      startDate: cultivation.startDate,
      status: cultivation.status,
      yield_g: cultivation.yield_g?.toString() || "",
    })
  }

  const handleEditChange = useCallback((field: string, value: string) => {
    setEditData((prev) => ({ ...prev, [field]: value }))
  }, [])

  const handleEditSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault()
    if (!editCultivationId) return

    console.log('HISTORY CONTENT - SUBMIT disparado', editData, editCultivationId);

    try {
      // Calcular lucro automaticamente se o cultivo estiver concluído e tiver rendimento
      let calculatedProfit = 0
      if (editData.status === "completed" && Number(editData.yield_g) > 0) {
        // Parâmetros padrão para cálculo
        const setupParams = {
          area_m2: 2.25,
          custo_equip_iluminacao: 2000,
          custo_tenda_estrutura: 1500,
          custo_ventilacao_exaustao: 800,
          custo_outros_equipamentos: 500,
        }
        
        const cycleParams = {
          potencia_watts: 480,
          num_plantas: 6,
          producao_por_planta_g: Number(editData.yield_g) / 6,
          dias_vegetativo: 60,
          horas_luz_veg: 18,
          dias_floracao: 70,
          horas_luz_flor: 12,
          dias_secagem_cura: 20,
        }
        
        const marketParams = {
          preco_kwh: 0.95,
          custo_sementes_clones: 50,
          custo_substrato: 120,
          custo_nutrientes: 350,
          custos_operacionais_misc: 100,
          preco_venda_por_grama: 45,
        }
        
        const results = calculateResults(setupParams, cycleParams, marketParams)
        calculatedProfit = results.lucro_liquido_ciclo
      }

      // Calcular duração se o cultivo estiver concluído
      let durationDays = 0
      if (editData.status === "completed" && editData.startDate) {
        const startDate = new Date(editData.startDate)
        const endDate = new Date()
        durationDays = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24))
      }

      // Fazer PATCH para o banco de dados
      console.log('Enviando PATCH para', `/api/cultivation/${editCultivationId}`);
      const res = await fetch(`/api/cultivation/${editCultivationId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: editData.name,
          seedStrain: editData.seedStrain,
          startDate: editData.startDate,
          status: editData.status,
          yield_g: editData.yield_g,
          profit_brl: calculatedProfit,
          durationDays: durationDays,
        }),
      });
      
      const data = await res.json();
      console.log('PATCH resposta:', data);

      if (data.success) {
        // Atualizar estado local
        const updated = cultivations.map((c) =>
          c.id === editCultivationId
            ? {
                ...c,
                name: editData.name,
                seedStrain: editData.seedStrain,
                startDate: editData.startDate,
                status: editData.status,
                yield_g: Number(editData.yield_g) || 0,
                durationDays: durationDays,
                profit_brl: calculatedProfit,
              }
            : c
        )
        setCultivations(updated)
        if (typeof window !== "undefined") {
          localStorage.setItem("cultivations", JSON.stringify(updated))
        }
        setEditCultivationId(null)
        
        // Recarregar dados para sincronizar com o dashboard
        window.location.reload();
      } else {
        console.error('Erro ao atualizar cultivo:', data.error);
        alert('Erro ao atualizar cultivo. Tente novamente.');
      }
    } catch (error) {
      console.error('Erro ao fazer PATCH:', error);
      alert('Erro ao atualizar cultivo. Tente novamente.');
    }
  }, [editCultivationId, editData, cultivations])

  // Estado para exclusão
  const [deleteCultivationId, setDeleteCultivationId] = useState<string | null>(null)
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const openDeleteModal = (id: string) => {
    setDeleteCultivationId(id)
    setIsDeleteModalOpen(true)
  }
  const closeDeleteModal = () => {
    setDeleteCultivationId(null)
    setIsDeleteModalOpen(false)
  }
  const handleDeleteCultivation = async () => {
    if (!deleteCultivationId) return

    setIsDeleting(true)
    try {
      // Excluir do banco de dados
      const response = await fetch(`/api/cultivation/${deleteCultivationId}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        let errorMessage = `Erro ${response.status}: ${response.statusText}`;
        try {
          const errorData = await response.json();
          errorMessage = errorData.error || errorMessage;
        } catch (parseError) {
          console.error('Erro ao parsear resposta de erro:', parseError);
        }
        throw new Error(`Erro ao excluir cultivo: ${errorMessage}`);
      }

      console.log('Cultivo excluído do banco com sucesso');

      // Atualizar estado local
      const updated = cultivations.filter(c => c.id !== deleteCultivationId)
      setCultivations(updated)
      if (typeof window !== "undefined") {
        localStorage.setItem("cultivations", JSON.stringify(updated))
      }
      closeDeleteModal()

    } catch (error) {
      console.error('Erro ao excluir cultivo:', error);
      alert(`Erro ao excluir cultivo: ${error instanceof Error ? error.message : 'Erro desconhecido'}`);
    } finally {
      setIsDeleting(false)
    }
  }

  // Modal de confirmação de exclusão
  const DeleteCultivationModal = () => {
    if (!isDeleteModalOpen) return null
    
    return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="bg-white dark:bg-zinc-900 rounded-lg shadow-lg p-8 w-full max-w-md">
        <h2 className="text-xl font-bold mb-4 text-red-600 flex items-center gap-2">
          <Trash2 className="h-5 w-5" />
          Excluir Cultivo
        </h2>
        <p className="mb-6 text-gray-700 dark:text-gray-200">
          {isDeleting 
            ? "Excluindo cultivo do banco de dados..." 
            : "Tem certeza que deseja excluir este cultivo? Esta ação não pode ser desfeita."
          }
        </p>
        <div className="flex justify-end gap-2 mt-6">
          <Button 
            type="button" 
            variant="outline" 
            onClick={closeDeleteModal}
            disabled={isDeleting}
          >
            Cancelar
          </Button>
          <Button 
            type="button" 
            variant="destructive" 
            onClick={handleDeleteCultivation} 
            disabled={isDeleting}
          >
            {isDeleting ? "Excluindo..." : "Excluir"}
          </Button>
        </div>
      </div>
    </div>
    )
  }

  // Função para lidar com o recurso premium
  const handlePremiumFeature = (feature: string) => {
    alert(`Este recurso está disponível apenas nos planos Basic, Premium e Enterprise. Atualize seu plano para desbloquear.`);
    setShowUpgradeModal(true);
  };

  // Verificar permissão para acessar comparação e gráficos
  const canAccessComparison = user && user.permissions && user.permissions.canAccessComparison === true;
  const canAccessCharts = user && user.permissions && user.permissions.canAccessAnalytics === true;

  // Mostrar loading skeleton se ainda estiver carregando
  if (isLoading) {
    return (
      <div className="p-8">
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div className="flex flex-col gap-2">
              <h1 className="text-2xl font-bold text-gray-900">Histórico de Cultivos</h1>
              <p className="text-gray-600">Gerencie e acompanhe todos os seus cultivos</p>
            </div>
            <div className="flex gap-2">
              <Button
                onClick={() => setIsNewModalOpen(true)}
                className="bg-green-600 hover:bg-green-700 text-white"
              >
                <Plus className="h-4 w-4 mr-2" />
                Novo Cultivo
              </Button>
            </div>
          </div>
          
          {/* Skeleton para filtros */}
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <div className="animate-pulse">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                <div className="h-10 bg-gray-200 rounded"></div>
                <div className="h-10 bg-gray-200 rounded"></div>
                <div className="h-10 bg-gray-200 rounded"></div>
              </div>
              <div className="flex gap-2">
                <div className="h-10 bg-gray-200 rounded w-32"></div>
                <div className="h-10 bg-gray-200 rounded w-24"></div>
              </div>
            </div>
          </div>
          
          {/* Skeleton para cards de cultivo */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="bg-white rounded-lg shadow-sm border overflow-hidden">
                <div className="animate-pulse">
                  <div className="h-48 bg-gray-200"></div>
                  <div className="p-6">
                    <div className="h-6 bg-gray-200 rounded w-3/4 mb-2"></div>
                    <div className="h-4 bg-gray-200 rounded w-1/2 mb-4"></div>
                    <div className="space-y-2">
                      <div className="h-4 bg-gray-200 rounded w-full"></div>
                      <div className="h-4 bg-gray-200 rounded w-2/3"></div>
                    </div>
                    <div className="mt-4 flex justify-between items-center">
                      <div className="h-6 bg-gray-200 rounded w-20"></div>
                      <div className="h-8 bg-gray-200 rounded w-16"></div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
        
        {/* Modais ainda funcionam durante loading */}
        <NewCultivationModal
          open={isNewModalOpen}
          onClose={() => setIsNewModalOpen(false)}
          onSubmit={handleNewSubmit}
          values={newCultivation}
          onChange={handleNewChange}
          errors={newCultivationErrors}
          isSubmitting={isSubmittingNewCultivation}
        />
      </div>
    )
  }

  return (
    <div className="p-8">
      <NewCultivationModal
        open={isNewModalOpen}
        onClose={() => setIsNewModalOpen(false)}
        onSubmit={handleNewSubmit}
        values={newCultivation}
        onChange={handleNewChange}
        errors={newCultivationErrors}
        isSubmitting={isSubmittingNewCultivation}
      />
      <EditCultivationModal
        isOpen={!!editCultivationId}
        editData={editData}
        onClose={() => setEditCultivationId(null)}
        onSubmit={handleEditSubmit}
        onChange={handleEditChange}
      />
      <DeleteCultivationModal />
      {isComparisonOpen && (
        <CultivationComparison
          cultivations={cultivations}
          selectedIds={selectedCultivations}
          onClose={() => setIsComparisonOpen(false)}
        />
      )}
      
      <div className="mb-8 flex flex-col items-start gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Diário de Cultivo</h1>
          <p className="text-gray-600 mt-2">Explore seus ciclos de cultivo passados e ativos</p>
        </div>
        <div className="w-full sm:w-auto flex flex-col sm:flex-row gap-2">
          <Button 
            variant={showCharts ? "default" : "outline"} 
            className="flex items-center gap-2 w-full sm:w-auto"
            onClick={() => {
              if (canAccessCharts) {
                setShowCharts(!showCharts);
              } else {
                handlePremiumFeature('charts');
              }
            }}
            disabled={!canAccessCharts}
            title={!canAccessCharts ? "Disponível apenas nos planos Basic, Premium e Enterprise" : ""}
          >
            <BarChart3 className="h-4 w-4" />
            {showCharts ? "Ocultar" : "Mostrar"} Gráficos
            {!canAccessCharts && (
              <span className="ml-1 text-xs bg-amber-100 text-amber-800 px-2 py-0.5 rounded-full">
                Basic+
              </span>
            )}
          </Button>
          <Popover open={isPopoverOpen} onOpenChange={setIsPopoverOpen}>
            <PopoverTrigger asChild>
              <Button variant="outline" className="flex items-center gap-2 w-full sm:w-auto">
                <Filter className="h-4 w-4" />
                Filtros Avançados
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-80">
              <div className="space-y-3">
                <div>
                  <label className="block text-xs font-medium mb-1">Status</label>
                  <select className="w-full border rounded p-2" value={advancedFilters.status} onChange={e => handleAdvancedFilterChange("status", e.target.value)}>
                    <option value="all">Todos</option>
                    <option value="active">Ativos</option>
                    <option value="completed">Concluídos</option>
                    <option value="archived">Arquivados</option>
                  </select>
                </div>
                <div className="flex gap-2">
                  <div className="flex-1">
                    <label className="block text-xs font-medium mb-1">Início de (data)</label>
                    <input type="date" className="w-full border rounded p-2" value={advancedFilters.startDateFrom} onChange={e => handleAdvancedFilterChange("startDateFrom", e.target.value)} />
                  </div>
                  <div className="flex-1">
                    <label className="block text-xs font-medium mb-1">até</label>
                    <input type="date" className="w-full border rounded p-2" value={advancedFilters.startDateTo} onChange={e => handleAdvancedFilterChange("startDateTo", e.target.value)} />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-medium mb-1">Variedade/Strain</label>
                  <select className="w-full border rounded p-2" value={advancedFilters.strain} onChange={e => handleAdvancedFilterChange("strain", e.target.value)}>
                    <option value="">Todas</option>
                    {uniqueStrains.map(strain => (
                      <option key={strain} value={strain}>{strain}</option>
                    ))}
                  </select>
                </div>
                <div className="flex gap-2">
                  <div className="flex-1">
                    <label className="block text-xs font-medium mb-1">Rendimento mín. (g)</label>
                    <input type="number" className="w-full border rounded p-2" value={advancedFilters.minYield} onChange={e => handleAdvancedFilterChange("minYield", e.target.value)} />
                  </div>
                  <div className="flex-1">
                    <label className="block text-xs font-medium mb-1">máx. (g)</label>
                    <input type="number" className="w-full border rounded p-2" value={advancedFilters.maxYield} onChange={e => handleAdvancedFilterChange("maxYield", e.target.value)} />
                  </div>
                </div>
                <div className="flex justify-between gap-2 mt-2">
                  <Button variant="outline" size="sm" onClick={handleClearAdvancedFilters}>Limpar</Button>
                  <Button variant="default" size="sm" onClick={() => setIsPopoverOpen(false)}>Aplicar</Button>
                </div>
              </div>
            </PopoverContent>
          </Popover>
          <Button 
            onClick={() => {
              if (user && !checkCultivationLimit(user, cultivations.length)) {
                setShowUpgradeModal(true)
              } else {
                setIsNewModalOpen(true)
              }
            }} 
            className="flex items-center gap-2 w-full sm:w-auto"
          >
            <Plus className="h-4 w-4" />
            Novo Cultivo
            {user && !checkCultivationLimit(user, cultivations.length) && (
              <span className="ml-1 text-xs bg-red-100 text-red-800 px-2 py-1 rounded">
                Limite atingido
              </span>
            )}
          </Button>
        </div>
      </div>

      {/* Indicador de Modo de Seleção */}
      {isSelectionMode && (
        <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse" />
              <span className="text-sm font-medium text-blue-800">
                Modo de Seleção Ativo
                {selectedCultivations.length > 0 && (
                  <span className="ml-2 text-blue-600">
                    • {selectedCultivations.length} cultivo{selectedCultivations.length > 1 ? 's' : ''} selecionado{selectedCultivations.length > 1 ? 's' : ''}
                  </span>
                )}
              </span>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                setIsSelectionMode(false)
                setSelectedCultivations([])
              }}
              className="text-blue-600 hover:text-blue-800"
            >
              Sair do Modo
            </Button>
          </div>
        </div>
      )}

      {/* Loading State */}
      {isLoading && (
        <div className="mb-8 flex items-center justify-center">
          <div className="flex flex-col items-center justify-center">
            <SmoothLoadingSpinner size="lg" />
            <FadeIn delay={0.2}>
              <p className="text-gray-600 mt-4 text-lg text-center">Carregando diário...</p>
            </FadeIn>
          </div>
        </div>
      )}

      {/* Estatísticas Agregadas */}
      {!isLoading && isClient && <AggregateStats cultivations={cultivations} />}
      
      {/* Gráficos de Tendência */}
      {!isLoading && isClient && showCharts && canAccessCharts && (
        <HistoryCharts cultivations={cultivations} user={user} />
      )}
      
      {/* Filtros Avançados */}
      <div className="mb-6">
        {/* Remover JSX do filtro antigo */}
      </div>

      <div className="flex flex-col sm:flex-row gap-4 mb-8">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar por nome ou semente..."
            className="pl-9"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <Select value={filterStatus} onValueChange={setFilterStatus}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Filtrar por Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos</SelectItem>
            <SelectItem value="active">Ativos</SelectItem>
            <SelectItem value="completed">Concluídos</SelectItem>
          </SelectContent>
        </Select>
        <Select value={sortBy} onValueChange={setSortBy}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Ordenar por" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="startDate">Data (Mais Recente)</SelectItem>
            <SelectItem value="yield_g">Rendimento (Maior)</SelectItem>
          </SelectContent>
        </Select>
        <div className="flex flex-col gap-1">
          {!isSelectionMode ? (
            <Button
              variant="outline"
              className={`flex items-center gap-2 bg-transparent ${!canAccessComparison ? "opacity-60 cursor-not-allowed" : ""}`}
              onClick={() => {
                if (canAccessComparison) {
                  setIsSelectionMode(true);
                } else {
                  handlePremiumFeature('comparison');
                }
              }}
              disabled={!canAccessComparison}
              title={!canAccessComparison ? "Disponível apenas nos planos Basic, Premium e Enterprise" : ""}
            >
              <GitCompare className="h-4 w-4" />
              Ativar Comparação
              {!canAccessComparison && (
                <span className="ml-1 text-xs bg-amber-100 text-amber-800 px-2 py-0.5 rounded-full">
                  Basic+
                </span>
              )}
            </Button>
          ) : (
            <div className="flex gap-2">
              <Button
                variant="default"
                className="flex items-center gap-2"
                disabled={selectedCultivations.length < 2}
                onClick={() => setIsComparisonOpen(true)}
              >
                <GitCompare className="h-4 w-4" />
                Comparar ({selectedCultivations.length})
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setIsSelectionMode(false);
                  setSelectedCultivations([]);
                }}
              >
                Cancelar
              </Button>
            </div>
          )}
          {isSelectionMode && selectedCultivations.length === 0 && (
            <span className="text-xs text-muted-foreground">
              Clique nos cards para selecionar cultivos
            </span>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {filteredAndSortedCultivations.map((cultivation: CultivationSummary) => (
          <div key={cultivation.id} className="relative group">
            <CultivationCard
              cultivation={cultivation}
              onSelect={isSelectionMode ? handleSelectCultivation : undefined}
              isSelected={selectedCultivations.includes(cultivation.id)}
            />
            <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 group-focus-within:opacity-100 transition-opacity z-10">
              <Button
                size="icon"
                variant="ghost"
                onClick={e => {
                  e.preventDefault(); e.stopPropagation(); openEditModal(cultivation)
                }}
                title="Editar Cultivo"
              >
                <Pencil className="h-4 w-4" />
              </Button>
              <Button
                size="icon"
                variant="ghost"
                onClick={e => {
                  e.preventDefault(); e.stopPropagation(); openDeleteModal(cultivation.id)
                }}
                title="Excluir Cultivo"
                className="text-red-600 hover:bg-red-50 focus-visible:ring-red-500"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </div>
        ))}
      </div>

      {filteredAndSortedCultivations.length === 0 && (
        <>
          {cultivations.length === 0 ? (
            // Empty state para usuários novos
            <CultivationEmptyState 
              user={user} 
              onCreateCultivation={() => {
                if (user && !checkCultivationLimit(user, cultivations.length)) {
                  setShowUpgradeModal(true)
                } else {
                  setIsNewModalOpen(true)
                }
              }}
            />
          ) : (
            // Mensagem quando há cultivos mas nenhum corresponde aos filtros
            <div className="text-center py-12 text-muted-foreground">
              <p>Nenhum cultivo encontrado com os critérios de busca.</p>
            </div>
          )}
        </>
      )}

      {/* Modal de Upgrade */}
      <UpgradeModal 
        isOpen={showUpgradeModal} 
        onClose={() => setShowUpgradeModal(false)}
        requiredPermission="canCreateCultivations"
      />
    </div>
  )
}
