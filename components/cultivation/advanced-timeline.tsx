"use client"

import { useState, useCallback } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { 
  Calendar, 
  Camera, 
  Plus, 
  Edit3, 
  Trash2, 
  Save, 
  X,
  AlertTriangle,
  CheckCircle,
  Clock,
  Droplets,
  Leaf,
  Flower
} from "lucide-react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import type { CultivationEvent } from "@/lib/mock-data"

interface AdvancedTimelineProps {
  events: CultivationEvent[]
  onEventsChange: (events: CultivationEvent[]) => void
  cultivationId: string
}

interface EventTemplate {
  id: string
  name: string
  type: string
  description: string
  defaultDetails: Record<string, any>
}

const eventTemplates: EventTemplate[] = [
  {
    id: "irrigation",
    name: "Irrigação",
    type: "irrigation",
    description: "Irrigação das plantas",
    defaultDetails: { volume: "1L", ph: 6.0, ec: 1.2 }
  },
  {
    id: "fertilization",
    name: "Fertilização",
    type: "fertilization", 
    description: "Aplicação de nutrientes",
    defaultDetails: { produto: "", dosagem: "2ml/L", npk: "" }
  },
  {
    id: "pruning",
    name: "Poda",
    type: "pruning",
    description: "Poda das plantas",
    defaultDetails: { tipo: "LST", folhas_removidas: 0 }
  },
  {
    id: "phase_change",
    name: "Mudança de Fase",
    type: "start_flor",
    description: "Início da floração",
    defaultDetails: { horas_luz: 12, temperatura: 22 }
  }
]

export function AdvancedTimeline({ events, onEventsChange, cultivationId }: AdvancedTimelineProps) {
  const [isAddingEvent, setIsAddingEvent] = useState(false)
  const [editingEvent, setEditingEvent] = useState<string | null>(null)
  const [newEvent, setNewEvent] = useState({
    date: new Date().toISOString().split('T')[0],
    type: "action",
    description: "",
    details: {} as Record<string, any>,
    photos: [] as string[]
  })

  const handleAddEvent = useCallback(() => {
    const event: CultivationEvent = {
      id: `event_${Date.now()}`,
      date: newEvent.date,
      type: newEvent.type as any,
      description: newEvent.description,
      details: newEvent.details
    }
    
    onEventsChange([...events, event])
    setNewEvent({
      date: new Date().toISOString().split('T')[0],
      type: "action",
      description: "",
      details: {},
      photos: []
    })
    setIsAddingEvent(false)
  }, [events, newEvent, onEventsChange])

  const handleUseTemplate = useCallback((template: EventTemplate) => {
    setNewEvent({
      date: new Date().toISOString().split('T')[0],
      type: template.type,
      description: template.description,
      details: { ...template.defaultDetails },
      photos: []
    })
  }, [])

  const handleDeleteEvent = useCallback((eventId: string) => {
    onEventsChange(events.filter(e => e.id !== eventId))
  }, [events, onEventsChange])

  const getEventIcon = (type: string) => {
    switch (type) {
      case "irrigation": return <Droplets className="h-4 w-4 text-blue-500" />
      case "fertilization": return <Leaf className="h-4 w-4 text-green-500" />
      case "start_flor": return <Flower className="h-4 w-4 text-purple-500" />
      case "pruning": return <Edit3 className="h-4 w-4 text-orange-500" />
      default: return <CheckCircle className="h-4 w-4 text-gray-500" />
    }
  }

  const sortedEvents = [...events].sort((a, b) => 
    new Date(b.date).getTime() - new Date(a.date).getTime()
  )

  return (
    <Card className="shadow-sm">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-semibold">Timeline Avançada</CardTitle>
          <Button 
            onClick={() => setIsAddingEvent(true)}
            size="sm"
            className="flex items-center gap-2"
          >
            <Plus className="h-4 w-4" />
            Adicionar Evento
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {/* Formulário de Novo Evento */}
        {isAddingEvent && (
          <Card className="mb-6 border-2 border-dashed border-blue-300">
            <CardContent className="pt-6">
              <div className="space-y-4">
                <div className="flex items-center gap-2 mb-4">
                  <h3 className="font-semibold">Novo Evento</h3>
                  <Button 
                    variant="ghost" 
                    size="sm"
                    onClick={() => setIsAddingEvent(false)}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>

                {/* Templates Rápidos */}
                <div>
                  <label className="text-sm font-medium mb-2 block">Templates Rápidos</label>
                  <div className="flex flex-wrap gap-2">
                    {eventTemplates.map(template => (
                      <Button
                        key={template.id}
                        variant="outline"
                        size="sm"
                        onClick={() => handleUseTemplate(template)}
                        className="text-xs"
                      >
                        {template.name}
                      </Button>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium mb-1 block">Data</label>
                    <Input
                      type="date"
                      value={newEvent.date}
                      onChange={(e) => setNewEvent(prev => ({ ...prev, date: e.target.value }))}
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium mb-1 block">Tipo</label>
                    <Select 
                      value={newEvent.type} 
                      onValueChange={(value) => setNewEvent(prev => ({ ...prev, type: value }))}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="irrigation">Irrigação</SelectItem>
                        <SelectItem value="fertilization">Fertilização</SelectItem>
                        <SelectItem value="pruning">Poda</SelectItem>
                        <SelectItem value="start_flor">Mudança de Fase</SelectItem>
                        <SelectItem value="action">Ação Geral</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div>
                  <label className="text-sm font-medium mb-1 block">Descrição</label>
                  <Textarea
                    value={newEvent.description}
                    onChange={(e) => setNewEvent(prev => ({ ...prev, description: e.target.value }))}
                    placeholder="Descreva o que foi feito..."
                    rows={3}
                  />
                </div>

                {/* Detalhes Específicos */}
                <div>
                  <label className="text-sm font-medium mb-2 block">Detalhes</label>
                  <div className="grid grid-cols-2 gap-2">
                    {Object.entries(newEvent.details).map(([key, value]) => (
                      <div key={key} className="flex items-center gap-2">
                        <Input
                          placeholder="Campo"
                          value={key}
                          onChange={(e) => {
                            const newDetails = { ...newEvent.details }
                            delete newDetails[key]
                            newDetails[e.target.value] = value
                            setNewEvent(prev => ({ ...prev, details: newDetails }))
                          }}
                          className="text-xs"
                        />
                        <Input
                          placeholder="Valor"
                          value={String(value)}
                          onChange={(e) => {
                            setNewEvent(prev => ({
                              ...prev,
                              details: { ...prev.details, [key]: e.target.value }
                            }))
                          }}
                          className="text-xs"
                        />
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            const newDetails = { ...newEvent.details }
                            delete newDetails[key]
                            setNewEvent(prev => ({ ...prev, details: newDetails }))
                          }}
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                    ))}
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setNewEvent(prev => ({
                          ...prev,
                          details: { ...prev.details, [`campo_${Date.now()}`]: "" }
                        }))
                      }}
                      className="col-span-2"
                    >
                      <Plus className="h-3 w-3 mr-1" />
                      Adicionar Campo
                    </Button>
                  </div>
                </div>

                <div className="flex justify-end gap-2">
                  <Button variant="outline" onClick={() => setIsAddingEvent(false)}>
                    Cancelar
                  </Button>
                  <Button 
                    onClick={handleAddEvent}
                    disabled={!newEvent.description.trim()}
                  >
                    <Save className="h-4 w-4 mr-2" />
                    Salvar Evento
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Lista de Eventos */}
        <div className="space-y-4">
          {sortedEvents.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Calendar className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>Nenhum evento registrado ainda.</p>
              <p className="text-sm">Clique em "Adicionar Evento" para começar.</p>
            </div>
          ) : (
            sortedEvents.map((event, index) => (
              <div key={event.id || index} className="flex items-start gap-4 p-4 border rounded-lg hover:bg-muted/50 transition-colors group">
                <div className="flex-shrink-0 mt-1">
                  {getEventIcon(event.type)}
                </div>
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-1">
                    <h4 className="font-medium text-sm">{event.description}</h4>
                    <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setEditingEvent(event.id || event.date)}
                      >
                        <Edit3 className="h-3 w-3" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDeleteEvent(event.id || event.date)}
                        className="text-red-500 hover:text-red-700"
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-4 text-xs text-muted-foreground mb-2">
                    <span className="flex items-center gap-1">
                      <Calendar className="h-3 w-3" />
                      {new Date(event.date).toLocaleDateString('pt-BR')}
                    </span>
                    <Badge variant="secondary" className="text-xs">
                      {event.type}
                    </Badge>
                  </div>

                  {/* Detalhes */}
                  {event.details && Object.keys(event.details).length > 0 && (
                    <div className="flex flex-wrap gap-2 mt-2">
                      {Object.entries(event.details).map(([key, value]) => (
                        <span key={key} className="text-xs bg-muted px-2 py-1 rounded">
                          <span className="font-medium">{key}:</span> {String(value)}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  )
}