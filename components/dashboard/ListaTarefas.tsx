import { useState, useEffect } from 'react'
import { Plus, Trash2, CheckCircle2, Circle, Clock, Calendar, AlertTriangle, CheckSquare, Square, MoreHorizontal, Edit3, Bell, CalendarDays } from 'lucide-react'
import { Badge } from '@/components/ui/badge'

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

interface ListaTarefasProps {
  tarefas?: Tarefa[];
  onToggleTarefa?: (index: number) => void;
  onAddTarefa?: (nome: string, prazo: string, prioridade?: string, dataLimite?: Date) => void;
  onDeleteTarefa?: (index: number) => void;
  onEditTarefa?: (index: number, tarefa: Tarefa) => void;
}

export default function ListaTarefas({ 
  tarefas = [], 
  onToggleTarefa = () => {}, 
  onAddTarefa = () => {}, 
  onDeleteTarefa = () => {},
  onEditTarefa = () => {}
}: ListaTarefasProps) {
  const [novaTarefa, setNovaTarefa] = useState('')
  const [novoPrazo, setNovoPrazo] = useState('')
  const [novaPrioridade, setNovaPrioridade] = useState<'baixa' | 'media' | 'alta'>('media')
  const [novaDataLimite, setNovaDataLimite] = useState<string>('')
  const [showForm, setShowForm] = useState(false)
  const [editingIndex, setEditingIndex] = useState<number | null>(null)
  const [currentTime, setCurrentTime] = useState(new Date())

  // Atualizar tempo atual a cada minuto
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTime(new Date())
    }, 60000) // 1 minuto

    return () => clearInterval(interval)
  }, [])

  // Função para calcular tempo restante
  const getTempoRestante = (dataLimite: Date): string => {
    const agora = currentTime
    const diff = dataLimite.getTime() - agora.getTime()
    
    if (diff <= 0) {
      return 'Vencida'
    }

    const dias = Math.floor(diff / (1000 * 60 * 60 * 24))
    const horas = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))
    const minutos = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))

    if (dias > 0) {
      return `${dias} dia${dias > 1 ? 's' : ''}`
    } else if (horas > 0) {
      return `${horas}h ${minutos}min`
    } else if (minutos > 0) {
      return `${minutos}min`
    } else {
      return 'Menos de 1min'
    }
  }

  // Função para calcular urgência baseada na data limite
  const getUrgencia = (tarefa: Tarefa): string => {
    if (!tarefa.dataLimite) {
      // Fallback para o sistema antigo baseado em texto
      if (tarefa.prazo.includes('hoje') || tarefa.prazo.includes('agora')) return 'urgente'
      if (tarefa.prazo.includes('amanhã') || tarefa.prazo.includes('em 1 dia')) return 'proximo'
      if (tarefa.prazo.includes('em 2') || tarefa.prazo.includes('em 3')) return 'medio'
      return 'baixo'
    }

    const agora = currentTime
    const diff = tarefa.dataLimite.getTime() - agora.getTime()
    const horas = diff / (1000 * 60 * 60)

    if (diff <= 0) return 'vencida'
    if (horas <= 2) return 'urgente'
    if (horas <= 24) return 'proximo'
    if (horas <= 72) return 'medio'
    return 'baixo'
  }

  // Função para obter ícone de urgência
  const getUrgenciaIcon = (urgencia: string) => {
    switch (urgencia) {
      case 'vencida': return <AlertTriangle className="w-3 h-3 text-red-600" />
      case 'urgente': return <AlertTriangle className="w-3 h-3 text-red-500" />
      case 'proximo': return <Clock className="w-3 h-3 text-orange-500" />
      case 'medio': return <Calendar className="w-3 h-3 text-blue-500" />
      default: return <Calendar className="w-3 h-3 text-gray-400" />
    }
  }

  // Função para obter cor de prioridade
  const getPrioridadeColor = (prioridade: string) => {
    switch (prioridade) {
      case 'alta': return 'bg-red-100 text-red-700 border-red-200'
      case 'media': return 'bg-yellow-100 text-yellow-700 border-yellow-200'
      case 'baixa': return 'bg-green-100 text-green-700 border-green-200'
      default: return 'bg-gray-100 text-gray-700 border-gray-200'
    }
  }

  // Função para obter cor de urgência
  const getUrgenciaColor = (urgencia: string) => {
    switch (urgencia) {
      case 'vencida': return 'border-l-red-600 bg-red-50'
      case 'urgente': return 'border-l-red-500 bg-red-50'
      case 'proximo': return 'border-l-orange-500 bg-orange-50'
      case 'medio': return 'border-l-blue-500 bg-blue-50'
      default: return 'border-l-gray-300 bg-gray-50'
    }
  }

  // Função para formatar data
  const formatarData = (data: Date): string => {
    const hoje = new Date()
    const amanha = new Date(hoje)
    amanha.setDate(amanha.getDate() + 1)

    if (data.toDateString() === hoje.toDateString()) {
      return 'Hoje'
    } else if (data.toDateString() === amanha.toDateString()) {
      return 'Amanhã'
    } else {
      return data.toLocaleDateString('pt-BR', { 
        day: '2-digit', 
        month: '2-digit',
        hour: '2-digit',
        minute: '2-digit'
      })
    }
  }

  // Função para processar prazo de texto para data
  const processarPrazo = (prazo: string): Date | null => {
    const agora = new Date()
    
    if (prazo.includes('hoje') || prazo.includes('agora')) {
      return new Date(agora.getTime() + 2 * 60 * 60 * 1000) // 2 horas
    }
    if (prazo.includes('amanhã') || prazo.includes('em 1 dia')) {
      const amanha = new Date(agora)
      amanha.setDate(amanha.getDate() + 1)
      amanha.setHours(9, 0, 0, 0) // 9h da manhã
      return amanha
    }
    if (prazo.includes('em 2 dias')) {
      const data = new Date(agora)
      data.setDate(data.getDate() + 2)
      data.setHours(9, 0, 0, 0)
      return data
    }
    if (prazo.includes('em 3 dias')) {
      const data = new Date(agora)
      data.setDate(data.getDate() + 3)
      data.setHours(9, 0, 0, 0)
      return data
    }
    if (prazo.includes('em 4 horas')) {
      return new Date(agora.getTime() + 4 * 60 * 60 * 1000)
    }
    if (prazo.includes('em 6 horas')) {
      return new Date(agora.getTime() + 6 * 60 * 60 * 1000)
    }
    if (prazo.includes('em 8 horas')) {
      return new Date(agora.getTime() + 8 * 60 * 60 * 1000)
    }
    
    return null
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (novaTarefa.trim()) {
      const dataLimite = novaDataLimite ? new Date(novaDataLimite) : processarPrazo(novoPrazo)
      onAddTarefa(novaTarefa.trim(), novoPrazo || 'Sem prazo', novaPrioridade, dataLimite || undefined)
      setNovaTarefa('')
      setNovoPrazo('')
      setNovaDataLimite('')
      setNovaPrioridade('media')
      setShowForm(false)
    }
  }

  const tarefasOrdenadas = [...tarefas].sort((a, b) => {
    // Primeiro: não concluídas
    if (a.concluida !== b.concluida) return a.concluida ? 1 : -1
    // Segundo: por urgência
    const urgenciaA = getUrgencia(a)
    const urgenciaB = getUrgencia(b)
    const urgenciaOrder = { vencida: 0, urgente: 1, proximo: 2, medio: 3, baixo: 4 }
    return urgenciaOrder[urgenciaA as keyof typeof urgenciaOrder] - urgenciaOrder[urgenciaB as keyof typeof urgenciaOrder]
  })

  const tarefasPendentes = tarefasOrdenadas.filter(t => !t.concluida)
  const tarefasConcluidas = tarefasOrdenadas.filter(t => t.concluida)

  return (
    <div className="bg-gradient-to-br from-white to-gray-50 border border-gray-200 rounded-2xl shadow-sm p-5 w-full h-full flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl shadow-sm">
            <CheckSquare className="w-5 h-5 text-white" />
          </div>
          <div>
            <h3 className="font-bold text-lg text-gray-900">Próximas Tarefas</h3>
            <p className="text-xs text-gray-500">{tarefasPendentes.length} pendentes</p>
          </div>
        </div>
        <Badge variant="outline" className="text-xs">
          {tarefasPendentes.length}/{tarefas.length}
        </Badge>
      </div>

      {/* Lista de Tarefas */}
      <div className="flex-1 space-y-2 mb-3 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100 hover:scrollbar-thumb-gray-400">
        {/* Tarefas Pendentes */}
        {tarefasPendentes.map((tarefa, i) => {
          const originalIndex = tarefas.findIndex(t => t === tarefa)
          const urgencia = getUrgencia(tarefa)
          const tempoRestante = tarefa.dataLimite ? getTempoRestante(tarefa.dataLimite) : null
          const dataFormatada = tarefa.dataLimite ? formatarData(tarefa.dataLimite) : null
          
          return (
            <div
              key={i}
              className={`group relative border-l-3 rounded-lg p-2.5 transition-all duration-200 hover:shadow-md hover:scale-[1.01] ${getUrgenciaColor(urgencia)}`}
            >
              <div className="flex items-center gap-2.5">
                <button
                  onClick={() => onToggleTarefa(originalIndex)}
                  className="flex-shrink-0 p-1 hover:bg-white rounded-lg transition-colors"
                  aria-label={tarefa.concluida ? 'Desmarcar tarefa como concluída' : 'Marcar tarefa como concluída'}
                  role="checkbox"
                  aria-checked={tarefa.concluida}
                >
                  {tarefa.concluida ? (
                    <CheckCircle2 className="w-4 h-4 text-green-600" />
                  ) : (
                    <Circle className="w-4 h-4 text-gray-400 hover:text-green-500" />
                  )}
                </button>
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex-1">
                      <h4 className={`text-sm font-medium ${tarefa.concluida ? 'line-through text-gray-500' : 'text-gray-900'}`}>
                        {tarefa.nome}
                      </h4>
                      <div className="flex items-center gap-2 mt-1 flex-wrap">
                        <span className="text-xs text-gray-600">
                          {dataFormatada || tarefa.prazo}
                        </span>
                        {tempoRestante && (
                          <span className={`text-xs px-1.5 py-0.5 rounded-full ${getPrioridadeColor(tarefa.prioridade || 'media')}`}>
                            {tempoRestante}
                          </span>
                        )}
                        {tarefa.prioridade && (
                          <span className={`text-xs px-1.5 py-0.5 rounded-full ${getPrioridadeColor(tarefa.prioridade)}`}>
                            {tarefa.prioridade}
                          </span>
                        )}
                      </div>
                    </div>
                    
                    <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => setEditingIndex(originalIndex)}
                          className="p-1 hover:bg-gray-100 rounded-lg transition-colors"
                          title="Editar tarefa"
                          aria-label="Editar tarefa"
                        >
                          <Edit3 className="w-3.5 h-3.5 text-gray-400" />
                        </button>
                        <button
                          onClick={() => onDeleteTarefa(originalIndex)}
                          className="p-1 hover:bg-red-100 rounded-lg transition-colors"
                          title="Excluir tarefa"
                          aria-label="Excluir tarefa"
                        >
                          <Trash2 className="w-3.5 h-3.5 text-red-400" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )
        })}

        {/* Tarefas Concluídas (colapsáveis) */}
        {tarefasConcluidas.length > 0 && (
          <div className="border-t border-gray-200 pt-2">
            <details className="group">
              <summary className="flex items-center gap-2 text-xs text-gray-500 cursor-pointer hover:text-gray-700 transition-colors">
                <CheckCircle2 className="w-3 h-3" />
                {tarefasConcluidas.length} tarefa(s) concluída(s)
              </summary>
              <div className="mt-2 space-y-1.5">
                {tarefasConcluidas.map((tarefa, i) => {
                  const originalIndex = tarefas.findIndex(t => t === tarefa)
                  return (
                    <div key={i} className="flex items-center gap-2.5 p-2 bg-gray-50 rounded-lg">
                      <CheckCircle2 className="w-4 h-4 text-green-600" />
                      <div className="flex-1">
                        <div className="text-sm text-gray-500 line-through">{tarefa.nome}</div>
                        <div className="text-xs text-gray-400">
                          {tarefa.dataLimite ? formatarData(tarefa.dataLimite) : tarefa.prazo}
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            </details>
          </div>
        )}

        {/* Estado vazio */}
        {tarefas.length === 0 && (
          <div className="text-center py-6 text-gray-500">
            <CheckSquare className="w-10 h-10 mx-auto mb-2 text-gray-300" />
            <p className="text-sm">Nenhuma tarefa ainda</p>
            <p className="text-xs">Adicione sua primeira tarefa abaixo</p>
          </div>
        )}
      </div>

      {/* Formulário de Nova Tarefa */}
      <div className="border-t border-gray-200 pt-3">
        {!showForm ? (
          <button
            onClick={() => setShowForm(true)}
            className="w-full flex items-center justify-center gap-2 p-2.5 text-sm font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-xl transition-all duration-200 border-2 border-dashed border-gray-300 hover:border-gray-400"
            aria-label="Abrir formulário de nova tarefa"
          >
            <Plus className="w-4 h-4" />
            Adicionar nova tarefa
          </button>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-2.5">
            <div className="flex gap-2">
              <input
                value={novaTarefa}
                onChange={(e) => setNovaTarefa(e.target.value)}
                placeholder="Nova tarefa"
                className="flex-1 px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                autoFocus
                aria-label="Nome da tarefa"
              />
              <button
                type="button"
                onClick={() => setShowForm(false)}
                className="px-3 py-2 text-sm text-gray-500 hover:text-gray-700 transition-colors"
                aria-label="Cancelar nova tarefa"
              >
                Cancelar
              </button>
            </div>
            <div className="flex gap-2">
              <input
                type="text"
                value={novoPrazo}
                onChange={(e) => setNovoPrazo(e.target.value)}
                className="flex-1 px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Prazo"
                aria-label="Prazo"
              />
              <input
                type="datetime-local"
                value={novaDataLimite}
                onChange={(e) => setNovaDataLimite(e.target.value)}
                className="flex-1 px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Data e hora limite"
                aria-label="Data e hora limite"
              />
              <select
                value={novaPrioridade}
                onChange={(e) => setNovaPrioridade(e.target.value as 'baixa' | 'media' | 'alta')}
                className="px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                aria-label="Prioridade"
              >
                <option value="baixa">Baixa</option>
                <option value="media">Média</option>
                <option value="alta">Alta</option>
              </select>
            </div>
            <div className="text-xs text-gray-500 bg-gray-50 p-2 rounded-lg">
              <div className="flex items-center gap-1 mb-1">
                <CalendarDays className="w-3 h-3" />
                <span className="font-medium">Dicas de prazo:</span>
              </div>
              <ul className="space-y-0.5 text-gray-600">
                <li>• Use o seletor de data/hora para precisão</li>
                <li>• Ou digite: "hoje", "amanhã", "em 2 dias", "em 4 horas"</li>
                <li>• O sistema calculará automaticamente o tempo restante</li>
              </ul>
            </div>
            <button
              type="submit"
              disabled={!novaTarefa.trim()}
              className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-500 to-blue-600 text-white text-sm font-medium rounded-lg hover:from-blue-600 hover:to-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-sm"
              aria-label="Adicionar tarefa"
            >
              <Plus className="w-4 h-4" />
              Adicionar Tarefa
            </button>
          </form>
        )}
      </div>
    </div>
  )
}