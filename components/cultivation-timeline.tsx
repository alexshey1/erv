"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Calendar,
  Leaf,
  Flower,
  Droplet,
  CropIcon as Harvest,
  AlertTriangle,
  CheckCircle,
  FlaskConical,
  Bug,
  Sun,
  Droplets,
  Scissors,
  SprayCan,
  Info,
} from "lucide-react"
import type { CultivationEvent, Incident } from "@/lib/mock-data"
import clsx from "clsx"
import React, { useMemo, useState, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import { ImageUpload } from "@/components/forms/image-upload"
import { ContentLoading, SmoothLoadingSpinner, FadeIn } from "@/components/ui/smooth-transitions"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Label } from "@/components/ui/label"

type EventType =
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
  | "environmental_stress"
  | "nutrient_deficiency"
  | "pest"
  | "disease"
  | "other"

const eventIcons: Record<EventType, React.ComponentType<{ className?: string }>> = {
  start_veg: Leaf,
  start_flor: Flower,
  start_cure: Droplet,
  harvest: Harvest,
  incident: AlertTriangle,
  action: CheckCircle,
  irrigation: Droplets,
  fertilization: FlaskConical,
  pruning: Scissors,
  pest_control: SprayCan,
  environmental_stress: Sun,
  nutrient_deficiency: FlaskConical,
  pest: Bug,
  disease: AlertTriangle,
  other: Info,
}

const eventNames: Record<EventType, string> = {
  start_veg: "Início Vegetativo",
  start_flor: "Início Floração",
  start_cure: "Início Cura",
  harvest: "Colheita",
  incident: "Incidente",
  action: "Ação",
  irrigation: "Irrigação",
  fertilization: "Fertilização",
  pruning: "Poda",
  pest_control: "Controle de Praga",
  environmental_stress: "Estresse Ambiental",
  nutrient_deficiency: "Deficiência Nutriente",
  pest: "Praga",
  disease: "Doença",
  other: "Outro",
}

const eventColors: Record<EventType, string> = {
  start_veg: "text-green-500",
  start_flor: "text-orange-500",
  start_cure: "text-purple-500",
  harvest: "text-yellow-500",
  incident: "text-red-500",
  action: "text-blue-500",
  irrigation: "text-blue-400",
  fertilization: "text-purple-500",
  pruning: "text-pink-500",
  pest_control: "text-red-400",
  environmental_stress: "text-yellow-600",
  nutrient_deficiency: "text-orange-600",
  pest: "text-red-500",
  disease: "text-red-700",
  other: "text-gray-500",
}

interface CultivationTimelineProps {
  events: CultivationEvent[]
  incidents: Incident[]
  cultivationId: string // Adicionar cultivationId
  cultivationStartDate: string // Nova prop: data de início do cultivo
}

interface TimelineEventItemProps {
  event: CultivationEvent
  incident?: Incident | null
}

// Função utilitária para checar se algum valor está fora do ideal
function getEventAlert(details: any, phase: 'vegetative' | 'flowering' = 'vegetative') {
  if (!details) return null;
  // Ranges ideais por fase
  const idealRanges = {
    vegetative: {
      ph: { min: 5.8, max: 6.2 },
      ec: { min: 1.0, max: 1.6 },
      temperatura: { min: 22, max: 30 },
      umidade: { min: 60, max: 70 },
    },
    flowering: {
      ph: { min: 6.0, max: 6.5 },
      ec: { min: 1.6, max: 2.2 },
      temperatura: { min: 20, max: 26 },
      umidade: { min: 40, max: 50 },
    },
  };
  // Detecta fase (padrão vegetativa)
  const ranges = phase === 'flowering' ? idealRanges.flowering : idealRanges.vegetative;
  const alerts: string[] = [];
  if (details.ph !== undefined && details.ph !== "" && !isNaN(Number(details.ph))) {
    const v = Number(details.ph);
    if (v < ranges.ph.min || v > ranges.ph.max) alerts.push(`pH fora do ideal (${v}) [${ranges.ph.min} - ${ranges.ph.max}]`);
  }
  if (details.ec !== undefined && details.ec !== "" && !isNaN(Number(details.ec))) {
    const v = Number(details.ec);
    if (v < ranges.ec.min || v > ranges.ec.max) alerts.push(`EC fora do ideal (${v}) [${ranges.ec.min} - ${ranges.ec.max}]`);
  }
  if (details.temperatura !== undefined && details.temperatura !== "" && !isNaN(Number(details.temperatura))) {
    const v = Number(details.temperatura);
    if (v < ranges.temperatura.min || v > ranges.temperatura.max) alerts.push(`Temperatura fora do ideal (${v}°C) [${ranges.temperatura.min} - ${ranges.temperatura.max}]`);
  }
  if (details.umidade !== undefined && details.umidade !== "" && !isNaN(Number(details.umidade))) {
    const v = Number(details.umidade);
    if (v < ranges.umidade.min || v > ranges.umidade.max) alerts.push(`Umidade fora do ideal (${v}%) [${ranges.umidade.min} - ${ranges.umidade.max}]`);
  }
  return alerts.length > 0 ? alerts : null;
}

const TimelineEventItem = ({ event, incident }: TimelineEventItemProps) => {
  const Icon = eventIcons[event.type as EventType] || Calendar
  const colorClass = eventColors[event.type as EventType] || "text-gray-500"

  return (
    <div className="mb-6 flex items-start" role="listitem">
      <div className="absolute left-0 flex h-full items-center justify-center" aria-hidden="true">
        <div className="h-full w-px bg-border absolute left-1/2 -translate-x-1/2" />
        <div
          className={clsx(
            "relative z-10 flex h-8 w-8 items-center justify-center rounded-full bg-background",
            colorClass
          )}
        >
          <Icon className="h-5 w-5" aria-label={event.type} />
        </div>
      </div>
      <div className="ml-8 flex-1">
        <div className="text-sm font-medium text-gray-900">{event.description}</div>
        <time
          className="text-xs text-gray-500"
          dateTime={new Date(event.date).toISOString()}
        >
          {new Date(event.date).toLocaleDateString("pt-BR")}
        </time>
        {event.details && Object.keys(event.details).length > 0 && (
          <div className="mt-1 text-xs text-gray-600">
            {Object.entries(event.details).map(([key, value]) => (
              <span key={key} className="mr-2">
                <span className="font-medium capitalize">{key.replace(/([A-Z])/g, " $1").trim()}:</span>{" "}
                {value}
              </span>
            ))}
          </div>
        )}
        {incident && (
          <div
            className="mt-2 p-2 bg-red-50 dark:bg-red-950 border border-red-200 dark:border-red-800 rounded-md text-xs text-red-800 dark:text-red-200"
            role="alert"
          >
            <p className="font-semibold">Problema: {incident.description}</p>
            <p>Severidade: {incident.severity}</p>
            <p>Ação Corretiva: {incident.correctiveAction}</p>
          </div>
        )}
      </div>
    </div>
  )
}

export function CultivationTimeline({ events, incidents, cultivationId, cultivationStartDate }: CultivationTimelineProps) {
  // Criar um Map para lookup eficiente dos incidentes
  const incidentMap = useMemo(() => {
    const map = new Map<string, Incident>()
    incidents.forEach((inc) => map.set(inc.id, inc))
    return map
  }, [incidents])

  // Estado local para edição dos eventos
  const [localEvents, setLocalEvents] = useState(events)
  const [isLoading, setIsLoading] = useState(true)
  const [isReloading, setIsReloading] = useState(false)

  // Sincronizar eventos quando mudam
  useEffect(() => {
    setLocalEvents(events)
  }, [events])

  // Carregar eventos do banco de dados
  useEffect(() => {
    const loadEvents = async () => {
      setIsLoading(true)
      
      try {
        console.log('Carregando eventos para cultivationId:', cultivationId)
        
        const response = await fetch(`/api/cultivation-events?cultivationId=${cultivationId}`);
        console.log('Resposta da API de carregamento:', response.status)
        
        if (response.ok) {
          const data = await response.json();
          console.log('Eventos carregados:', data.events)
          console.log('Detalhes dos eventos:', data.events.map((e: any) => ({ id: e.id, fotos: e.details?.fotos })))
          setLocalEvents(data.events);
        } else {
          console.error('Erro ao carregar eventos:', response.status, response.statusText)
        }
      } catch (error) {
        console.error('Erro ao carregar eventos:', error);
      } finally {
        setIsLoading(false)
      }
    };

    if (cultivationId) {
      loadEvents();
    } else {
      setIsLoading(false)
    }
  }, [cultivationId]);
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editData, setEditData] = useState<any>({})
  const [showAddModal, setShowAddModal] = useState(false)
  const [newEvent, setNewEvent] = useState<any>({
    date: new Date().toISOString().split('T')[0],
    type: "action",
    description: "",
    details: { ph: "", ec: "", temperatura: "", umidade: "", nivelDano: "" },
  })
  
  const [uploadedImages, setUploadedImages] = useState<Array<{
    publicId: string;
    secureUrl: string;
    filename: string;
    fileSize: number;
    mimeType: string;
    width: number;
    height: number;
    format: string;
  }>>([])

  // Estado para o modal de ampliar foto
  const [selectedImage, setSelectedImage] = useState<string | null>(null)

  const handleEdit = (event: any) => {
    const eventKey = event.id || event.date
    setEditingId(eventKey)
    setEditData({ ...event })
  }
  const handleEditChange = (field: string, value: any) => {
    setEditData((prev: any) => ({ ...prev, [field]: value }))
  }
  const handleEditDetailChange = (key: string, value: any) => {
    setEditData((prev: any) => ({ ...prev, details: { ...prev.details, [key]: value } }))
  }
  const handleSave = () => {
    setLocalEvents((prev) => prev.map(ev => {
      const evKey = ev.id || ev.date
      return evKey === editingId ? { ...editData, id: evKey } : ev
    }))
    setEditingId(null)
    setEditData({})
  }
  const handleCancel = () => {
    setEditingId(null)
    setEditData({})
  }
  const handleRemove = async (id: string) => {
    if (!id) {
      console.error('ID do evento não fornecido');
      return;
    }

    try {
      console.log('Tentando deletar evento:', id);

      const response = await fetch(`/api/cultivation-events/${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(`Erro ao deletar evento: ${errorData.error || response.statusText}`);
      }

      const result = await response.json();
      console.log('Evento deletado com sucesso:', result);

      // Remover do estado local
      setLocalEvents(prev => prev.filter(event => event.id !== id));

    } catch (error) {
      console.error('Erro ao deletar evento:', error);
      alert(`Erro ao deletar evento: ${error instanceof Error ? error.message : 'Erro desconhecido'}`);
    }
  }

  const handleAddEvent = async () => {
    if (!newEvent.description.trim()) {
      alert("Por favor, adicione uma descrição para o evento.")
      return
    }

    if (!cultivationId) {
      alert("ID do cultivo não encontrado.")
      return
    }

    // Garantir que upload terminou
    if (uploadedImages.length === 0 && newEvent.details.fotos && newEvent.details.fotos.length > 0) {
      alert("Aguarde o upload da imagem antes de salvar o evento.")
      return
    }

    try {
      setIsReloading(true)
      const eventToAdd = {
        ...newEvent,
        id: `event_${Date.now()}`,
        details: {
          ...newEvent.details,
          fotos: uploadedImages.map(img => img.secureUrl)
        }
      }
      const response = await fetch('/api/cultivation-events', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          cultivationId,
          event: eventToAdd
        }),
      });
      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(`Erro ao salvar evento: ${JSON.stringify(errorData)}`)
      }
      // Após adicionar, recarregar eventos do backend para garantir sincronização
      const reload = async () => {
        try {
          const res = await fetch(`/api/cultivation-events?cultivationId=${cultivationId}`)
          if (res.ok) {
            const data = await res.json()
            if (data.success && data.events) {
              setLocalEvents(data.events)
            }
          }
        } catch (e) { /* erro silencioso */ }
      }
      await reload()
      setNewEvent({
        date: new Date().toISOString().split('T')[0],
        type: "action",
        description: "",
        details: { ph: "", ec: "", temperatura: "", umidade: "", nivelDano: "" },
      })
      setUploadedImages([])
      setShowAddModal(false)
    } catch (error) {
      console.error('Erro ao salvar evento:', error);
      alert(`Erro ao salvar evento: ${error instanceof Error ? error.message : 'Erro desconhecido'}`);
    } finally {
      setIsReloading(false)
    }
  }



  // Ordenar eventos por data
  const sortedEvents = useMemo(() => {
    return [...localEvents].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
  }, [localEvents])

  return (
    <>
      <div className="flex justify-end mb-4">
        <Button onClick={() => setShowAddModal(true)} variant="outline">Adicionar Evento</Button>
      </div>
      <Dialog open={showAddModal} onOpenChange={setShowAddModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Novo Evento</DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <Label className="text-sm font-medium">Tipo</Label>
            <Select value={newEvent.type} onValueChange={(v) => setNewEvent((prev: any) => ({ ...prev, type: v }))}>
              <SelectTrigger className="bg-white">
                <SelectValue placeholder="Selecione o tipo" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="irrigation" className="flex items-center gap-2"><Droplets className="h-4 w-4" /> Irrigação</SelectItem>
                <SelectItem value="fertilization" className="flex items-center gap-2"><FlaskConical className="h-4 w-4" /> Fertilização</SelectItem>
                <SelectItem value="pruning" className="flex items-center gap-2"><Scissors className="h-4 w-4" /> Poda</SelectItem>
                <SelectItem value="pest" className="flex items-center gap-2"><Bug className="h-4 w-4" /> Praga</SelectItem>
                <SelectItem value="disease" className="flex items-center gap-2"><AlertTriangle className="h-4 w-4" /> Doença</SelectItem>
                <SelectItem value="environmental_stress" className="flex items-center gap-2"><Sun className="h-4 w-4" /> Estresse Ambiental</SelectItem>
                <SelectItem value="action" className="flex items-center gap-2"><Info className="h-4 w-4" /> Outro</SelectItem>
              </SelectContent>
            </Select>
            <Label className="text-sm font-medium">Descrição</Label>
            <Textarea className="bg-white" value={newEvent.description} onChange={e => setNewEvent((prev: any) => ({ ...prev, description: e.target.value }))} />
            <Label className="text-sm font-medium">Nível de Dano</Label>
            <Select value={newEvent.details.nivelDano || ""} onValueChange={(v) => setNewEvent((prev: any) => ({ ...prev, details: { ...prev.details, nivelDano: v } }))}>
              <SelectTrigger className="bg-white">
                <SelectValue placeholder="Selecione" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="leve" className="flex items-center gap-2"><CheckCircle className="h-4 w-4 text-green-600" /> Leve</SelectItem>
                <SelectItem value="moderado" className="flex items-center gap-2"><AlertTriangle className="h-4 w-4 text-amber-600" /> Moderado</SelectItem>
                <SelectItem value="severo" className="flex items-center gap-2"><AlertTriangle className="h-4 w-4 text-red-600" /> Severo</SelectItem>
              </SelectContent>
            </Select>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <Label className="text-sm font-medium">pH</Label>
                <Input className="bg-white" type="number" value={newEvent.details.ph} onChange={e => setNewEvent((prev: any) => ({ ...prev, details: { ...prev.details, ph: e.target.value } }))} />
              </div>
              <div>
                <Label className="text-sm font-medium">EC</Label>
                <Input className="bg-white" type="number" value={newEvent.details.ec} onChange={e => setNewEvent((prev: any) => ({ ...prev, details: { ...prev.details, ec: e.target.value } }))} />
              </div>
              <div>
                <Label className="text-sm font-medium">Temperatura (°C)</Label>
                <Input className="bg-white" type="number" value={newEvent.details.temperatura} onChange={e => setNewEvent((prev: any) => ({ ...prev, details: { ...prev.details, temperatura: e.target.value } }))} />
              </div>
              <div>
                <Label className="text-sm font-medium">Umidade (%)</Label>
                <Input className="bg-white" type="number" value={newEvent.details.umidade} onChange={e => setNewEvent((prev: any) => ({ ...prev, details: { ...prev.details, umidade: e.target.value } }))} />
              </div>
            </div>
            <label className="block text-sm font-medium">Fotos</label>
            <ImageUpload 
              onImagesUploaded={setUploadedImages}
              maxImages={3}
              className="mt-2"
            />
            <label className="block text-sm font-medium">Data</label>
            <Input className="bg-white" type="date" value={newEvent.date} onChange={e => setNewEvent((prev: any) => ({ ...prev, date: e.target.value }))} />
            <div className="flex justify-end gap-2 mt-4">
              <Button variant="outline" onClick={() => setShowAddModal(false)}>Cancelar</Button>
              <Button onClick={handleAddEvent}>Salvar Evento</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
      <Card className="shadow-sm">
        <CardHeader>
          <CardTitle className="text-lg font-semibold">Timeline do Cultivo</CardTitle>
        </CardHeader>
        <CardContent>
          {(isLoading || isReloading) ? (
            <div className="flex items-center justify-center py-8">
              <div className="flex flex-col items-center justify-center">
                <SmoothLoadingSpinner size="lg" />
                <FadeIn delay={0.2}>
                  <p className="text-gray-600 mt-4 text-lg text-center">Carregando eventos...</p>
                </FadeIn>
              </div>
            </div>
          ) : (
            <div className="relative pl-8 overflow-hidden" role="list" aria-label="Eventos do cultivo">
              {sortedEvents.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <p>Nenhum evento registrado para este cultivo.</p>
                </div>
              ) : (
              sortedEvents.map((event) => {
                const incidentDetail = (event as any).incidentId ? incidentMap.get((event as any).incidentId) ?? null : null
                // Substituir getPhaseForEvent por uma versão que busca o último marco de floração:
                const getPhaseForEvent = (event: any, allEvents: any[], cultivationStartDate: string) => {
                  if (event.phase) return event.phase;
                  const sorted = [...allEvents].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
                  const eventDate = new Date(event.date).getTime();
                  const lastFlorEvent = sorted
                    .filter(e => e.type === 'start_flor' && new Date(e.date).getTime() <= eventDate)
                    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())[0];
                  if (lastFlorEvent) return 'flowering';
                  if (cultivationStartDate) {
                    const start = new Date(cultivationStartDate).getTime();
                    const diffDays = Math.floor((eventDate - start) / (1000 * 60 * 60 * 24));
                    if (diffDays > 60) return 'flowering';
                  }
                  return 'vegetative';
                };
                const phase = getPhaseForEvent(event, sortedEvents, cultivationStartDate);
                return (
                  <div key={event.id ?? event.date} className="mb-6 flex items-center group" role="listitem">
                    <div className="flex-shrink-0 flex items-center justify-center h-8 w-8">
                      {React.createElement(eventIcons[event.type as EventType] || Calendar, { className: "h-5 w-5" })}
                    </div>
                    <div className="ml-4 flex-1">
                      {editingId === (event.id || event.date) ? (
                        <div className="bg-gray-50 p-3 rounded border mb-2">
                          <input type="date" className="mb-2 block w-full" value={editData.date} onChange={e => handleEditChange("date", e.target.value)} />
                          <input type="text" className="mb-2 block w-full" value={editData.description} onChange={e => handleEditChange("description", e.target.value)} placeholder="Descrição" />
                          <div className="flex flex-wrap gap-2 mb-2">
                            {editData.details && Object.entries(editData.details).map(([k, v]) => (
                              <div key={k} className="flex items-center gap-1">
                                <input type="text" className="w-20" value={k} disabled />
                                <input type="text" className="w-24" value={String(v)} onChange={e => handleEditDetailChange(k, e.target.value)} />
                              </div>
                            ))}
                          </div>
                          <div className="flex gap-2">
                            <button className="px-3 py-1 rounded bg-green-600 text-white" onClick={handleSave}>Salvar</button>
                            <button className="px-3 py-1 rounded bg-gray-300" onClick={handleCancel}>Cancelar</button>
                          </div>
                        </div>
                      ) : (
                        <>
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-1">
                                <span className="text-sm font-semibold text-gray-900">
                                  {eventNames[event.type as EventType] || "Evento"}
                                  {" "}
                                  <span className="text-xs font-normal text-gray-500">(
                                    {phase === 'flowering' ? 'Floração' : 'Vegetativa'}
                                  )</span>
                                </span>
                                {(() => {
                                  const alerts = getEventAlert(event.details, phase);
                                  if (alerts) {
                                    return (
                                      <span className="flex items-center gap-1 text-orange-600">
                                        <AlertTriangle className="h-4 w-4" />
                                        <span className="text-xs font-semibold">Alerta</span>
                                      </span>
                                    );
                                  }
                                  return null;
                                })()}
                              </div>
                              
                              {(() => {
                                const alerts = getEventAlert(event.details, phase);
                                if (alerts) {
                                  return (
                                    <div className="mb-2 text-xs text-orange-600 font-medium flex flex-wrap gap-1">
                                      {alerts.map((msg, idx) => (
                                        <span key={idx} className="bg-orange-50 rounded px-2 py-0.5 border border-orange-200">{msg}</span>
                                      ))}
                                    </div>
                                  );
                                }
                                return null;
                              })()}
                              
                              <div className="text-sm text-gray-700 mb-1">
                                {event.description}
                              </div>
                              
                              <time className="text-xs text-gray-500 block mb-1" dateTime={new Date(event.date).toISOString()}>
                                {new Date(event.date).toLocaleDateString("pt-BR")}
                              </time>
                              
                              {event.details && Object.keys(event.details).length > 0 && (
                                <div className="text-xs text-gray-600">
                                  {Object.entries(event.details).map(([key, value]) => {
                                    // Não exibir fotos aqui, elas serão exibidas separadamente
                                    if (key === 'fotos') return null;
                                    return (
                                    <span key={key} className="mr-2">
                                      <span className="font-medium capitalize">{key.replace(/([A-Z])/g, " $1").trim()}:</span> {value}
                                    </span>
                                    );
                                  })}
                                </div>
                              )}
                              
                              {/* Exibir fotos se existirem */}
                              {event.details?.fotos && event.details.fotos.length > 0 && (
                                <div className="mt-2">
                                  <div className="text-xs text-gray-500 mb-1">Fotos:</div>
                                  <div className="flex gap-2 flex-wrap">
                                    {event.details.fotos.map((foto: string, idx: number) => (
                                      <div key={idx} className="relative group">
                                        <div 
                                          className="w-16 h-16 cursor-pointer"
                                          onClick={() => {
                                            console.log('Clicou na foto:', foto);
                                            setSelectedImage(foto);
                                          }}
                                        >
                                          <img 
                                            src={foto} 
                                            alt={`Foto ${idx + 1}`}
                                            className="w-full h-full object-cover rounded border hover:opacity-80 transition-opacity"
                                          />
                                        </div>
                                        <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-all rounded flex items-center justify-center pointer-events-none">
                                          <span className="text-white text-xs opacity-0 group-hover:opacity-100">Ampliar</span>
                                        </div>
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              )}
                            </div>
                            
                            <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity ml-4">
                              <button className="text-xs text-blue-600 underline" onClick={() => handleEdit(event)}>Editar</button>
                              <button className="text-xs text-red-600 underline" onClick={() => handleRemove(event.id || event.date)}>Remover</button>
                            </div>
                          </div>
                          {incidentDetail && (
                            <div className="mt-2 p-2 bg-red-50 dark:bg-red-950 border border-red-200 dark:border-red-800 rounded-md text-xs text-red-800 dark:text-red-200" role="alert">
                              <p className="font-semibold">Problema: {incidentDetail.description}</p>
                              <p>Severidade: {incidentDetail.severity}</p>
                              <p>Ação Corretiva: {incidentDetail.correctiveAction}</p>
                            </div>
                          )}
                        </>
                      )}
                    </div>
                  </div>
                )
              })
            )}
          </div>
        )}
        </CardContent>
      </Card>
      {selectedImage && (
        <Dialog open={!!selectedImage} onOpenChange={(open) => !open && setSelectedImage(null)}>
          <DialogContent className="max-w-screen-xl h-[90vh] flex items-center justify-center p-0">
            <DialogHeader className="absolute top-4 left-4 z-10">
              <DialogTitle className="text-white bg-black/50 px-2 py-1 rounded">
                Foto Ampliada
              </DialogTitle>
            </DialogHeader>
            <div className="relative w-full h-full flex items-center justify-center">
              <img src={selectedImage} alt="Foto ampliada" className="max-w-full max-h-full object-contain" />
            </div>
          </DialogContent>
        </Dialog>
      )}
    </>
  )
}
