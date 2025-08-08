"use client";

import React, { useState, useRef, useCallback, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Plus,
  Camera,
  X as CloseIcon,
  ChevronLeft,
  ChevronRight,
  Maximize2,
  Minus,
  Plus as PlusIcon,
} from "lucide-react";
import Image from "next/image";

// Tipos
export interface TimelinePhoto {
  id: string;
  url: string;
  name: string;
  uploadedAt: string;
}

export interface TimelineEvent {
  id: string;
  date: string;
  day: number;
  week: number;
  type:
    | "germination"
    | "seedling"
    | "vegetative"
    | "flowering"
    | "drying"
    | "curing"
    | "harvest"
    | "nutrients"
    | "water"
    | "pruning"
    | "pest_control"
    | "other";
  title: string;
  description?: string;
  photos: TimelinePhoto[];
}

const eventTypeIcons: Record<string, string> = {
  germination: "🌱",
  seedling: "🌿",
  vegetative: "🌳",
  flowering: "🌸",
  drying: "🍂",
  curing: "🏺",
  harvest: "✂️",
  nutrients: "🧪",
  water: "💧",
  pruning: "✂️",
  pest_control: "🛡️",
  other: "📝",
};

const eventTypeColors: Record<string, string> = {
  germination: "bg-yellow-100 text-yellow-800 border-yellow-200",
  seedling: "bg-blue-100 text-blue-800 border-blue-200",
  vegetative: "bg-green-100 text-green-800 border-green-200",
  flowering: "bg-purple-100 text-purple-800 border-purple-200",
  drying: "bg-orange-100 text-orange-800 border-orange-200",
  curing: "bg-red-100 text-red-800 border-red-200",
  harvest: "bg-emerald-100 text-emerald-800 border-emerald-200",
  nutrients: "bg-cyan-100 text-cyan-800 border-cyan-200",
  water: "bg-sky-100 text-sky-800 border-sky-200",
  pruning: "bg-lime-100 text-lime-800 border-lime-200",
  pest_control: "bg-amber-100 text-amber-800 border-amber-200",
  other: "bg-gray-100 text-gray-800 border-gray-200",
};

interface CultivationTimelineProps {
  events: TimelineEvent[];
  onEventAdd: (event: Omit<TimelineEvent, "id">) => void;
  onEventEdit: (id: string, event: Partial<TimelineEvent>) => void;
  onEventDelete: (id: string) => void;
}

// Lightbox
function Lightbox({
  photos,
  initialIndex,
  onClose,
  event,
}: {
  photos: TimelinePhoto[];
  initialIndex: number;
  onClose: () => void;
  event: TimelineEvent;
}) {
  const [index, setIndex] = useState(initialIndex);
  const [zoom, setZoom] = useState(1);
  const [loading, setLoading] = useState(true);
  const [touchStart, setTouchStart] = useState<{ x: number; y: number } | null>(null);
  const [touchMove, setTouchMove] = useState<{ x: number; y: number } | null>(null);
  const imgRef = useRef<HTMLImageElement>(null);
  const overlayRef = useRef<HTMLDivElement>(null);

  // Navegação por teclado e overlay
  useEffect(() => {
    function handleKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowLeft") prev();
      if (e.key === "ArrowRight") next();
    }
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  });

  // Swipe mobile
  const handleTouchStart = (e: React.TouchEvent) => {
    if (e.touches.length === 1) setTouchStart({ x: e.touches[0].clientX, y: e.touches[0].clientY });
  };
  const handleTouchMove = (e: React.TouchEvent) => {
    if (touchStart && e.touches.length === 1) setTouchMove({ x: e.touches[0].clientX, y: e.touches[0].clientY });
  };
  const handleTouchEnd = () => {
    if (touchStart && touchMove) {
      const dx = touchMove.x - touchStart.x;
      if (dx > 50) prev();
      if (dx < -50) next();
    }
    setTouchStart(null);
    setTouchMove(null);
  };

  // Pinch zoom mobile
  const lastDist = useRef<number | null>(null);
  const handlePinch = (e: React.TouchEvent) => {
    if (e.touches.length === 2) {
      const dx = e.touches[0].clientX - e.touches[1].clientX;
      const dy = e.touches[0].clientY - e.touches[1].clientY;
      const dist = Math.sqrt(dx * dx + dy * dy);
      if (lastDist.current !== null) {
        const delta = dist - lastDist.current;
        setZoom((z) => Math.max(1, Math.min(4, z + delta / 200)));
      }
      lastDist.current = dist;
    }
  };
  const handlePinchEnd = () => {
    lastDist.current = null;
  };

  // Scroll zoom desktop
  const handleWheel = (e: React.WheelEvent) => {
    if (e.ctrlKey || e.metaKey) return;
    setZoom((z) => Math.max(1, Math.min(4, z - e.deltaY / 200)));
  };

  // Navegação
  const prev = () => setIndex((i) => (i === 0 ? photos.length - 1 : i - 1));
  const next = () => setIndex((i) => (i === photos.length - 1 ? 0 : i + 1));

  // Fechar ao clicar overlay
  const handleOverlayClick = (e: React.MouseEvent) => {
    if (e.target === overlayRef.current) onClose();
  };

  // Lazy loading
  useEffect(() => {
    setLoading(true);
  }, [index]);

  return (
    <div
      ref={overlayRef}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm transition-opacity animate-fade-in"
      onClick={handleOverlayClick}
      tabIndex={-1}
      aria-modal="true"
      role="dialog"
    >
      {/* Botão fechar */}
      <button
        className="absolute top-4 right-4 z-20 bg-black/60 rounded-full p-2 hover:bg-black/80 transition"
        onClick={onClose}
        aria-label="Fechar galeria"
      >
        <CloseIcon className="h-6 w-6 text-white" />
      </button>
      {/* Navegação */}
      {photos.length > 1 && (
        <>
          <button
            className="absolute left-2 top-1/2 -translate-y-1/2 z-20 bg-black/40 hover:bg-black/70 rounded-full p-2"
            onClick={prev}
            aria-label="Foto anterior"
          >
            <ChevronLeft className="h-7 w-7 text-white" />
          </button>
          <button
            className="absolute right-2 top-1/2 -translate-y-1/2 z-20 bg-black/40 hover:bg-black/70 rounded-full p-2"
            onClick={next}
            aria-label="Próxima foto"
          >
            <ChevronRight className="h-7 w-7 text-white" />
          </button>
        </>
      )}
      {/* Zoom controls desktop */}
      <div className="absolute bottom-8 right-8 z-20 hidden md:flex gap-2 bg-black/40 rounded-lg p-2">
        <button
          onClick={() => setZoom((z) => Math.max(1, z - 0.2))}
          className="p-1 hover:bg-black/60 rounded"
          aria-label="Reduzir zoom"
        >
          <Minus className="h-5 w-5 text-white" />
        </button>
        <button
          onClick={() => setZoom((z) => Math.min(4, z + 0.2))}
          className="p-1 hover:bg-black/60 rounded"
          aria-label="Aumentar zoom"
        >
          <PlusIcon className="h-5 w-5 text-white" />
        </button>
      </div>
      {/* Imagem */}
      <div
        className="relative max-w-full max-h-[80vh] flex items-center justify-center"
        onWheel={handleWheel}
        onTouchStart={(e) => {
          handleTouchStart(e);
          handlePinch(e);
        }}
        onTouchMove={(e) => {
          handleTouchMove(e);
          handlePinch(e);
        }}
        onTouchEnd={(e) => {
          handleTouchEnd();
          handlePinchEnd();
        }}
      >
        {loading && (
          <div className="absolute inset-0 flex items-center justify-center z-10">
            <span className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-white/70"></span>
          </div>
        )}
        <img
          ref={imgRef}
          src={photos[index].url}
          alt={photos[index].name}
          className={`max-h-[80vh] max-w-full object-contain transition-transform duration-200 ${loading ? "opacity-0" : "opacity-100"}`}
          style={{ transform: `scale(${zoom})` }}
          onLoad={() => setLoading(false)}
          draggable={false}
        />
        {/* Contador de imagens */}
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-black/60 text-white text-xs rounded px-3 py-1">
          Imagem {index + 1} de {photos.length}
        </div>
        {/* Contexto */}
        <div className="absolute top-4 left-4 bg-black/50 text-white text-xs rounded px-3 py-1 max-w-xs">
          <div className="font-semibold">{event.title}</div>
          <div>{new Date(event.date).toLocaleDateString("pt-BR")}</div>
          {event.description && <div className="mt-1 italic">{event.description}</div>}
        </div>
      </div>
    </div>
  );
}

// Timeline principal
export function CultivationTimeline({ events, onEventAdd, onEventEdit, onEventDelete }: CultivationTimelineProps) {
  const [showAddModal, setShowAddModal] = useState(false);
  const [showLightbox, setShowLightbox] = useState(false);
  const [lightboxPhotos, setLightboxPhotos] = useState<TimelinePhoto[]>([]);
  const [lightboxIndex, setLightboxIndex] = useState(0);
  const [lightboxEvent, setLightboxEvent] = useState<TimelineEvent | null>(null);
  const [editingEvent, setEditingEvent] = useState<TimelineEvent | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [newEvent, setNewEvent] = useState<Omit<TimelineEvent, "id">>({
    date: new Date().toISOString().split("T")[0],
    day: 1,
    week: 1,
    type: "other",
    title: "",
    description: "",
    photos: [],
  });

  // Upload de fotos
  const handleFileUpload = useCallback((files: FileList) => {
    const newPhotos: TimelinePhoto[] = [];
    Array.from(files).forEach((file, index) => {
      if (file.type.startsWith("image/")) {
        const reader = new FileReader();
        reader.onload = (e) => {
          const photo: TimelinePhoto = {
            id: `photo_${Date.now()}_${index}`,
            url: e.target?.result as string,
            name: file.name,
            uploadedAt: new Date().toISOString(),
          };
          newPhotos.push(photo);
          if (newPhotos.length === files.length) {
            setNewEvent((prev) => ({ ...prev, photos: [...prev.photos, ...newPhotos] }));
          }
        };
        reader.readAsDataURL(file);
      }
    });
  }, []);

  // Adicionar evento
  const handleAddEvent = () => {
    const eventToAdd = {
      ...newEvent,
      id: `event_${Date.now()}`,
    };
    onEventAdd(eventToAdd);
    setNewEvent({
      date: new Date().toISOString().split("T")[0],
      day: 1,
      week: 1,
      type: "other",
      title: "",
      description: "",
      photos: [],
    });
    setShowAddModal(false);
  };

  // Editar evento
  const handleEditEvent = (event: TimelineEvent) => {
    setEditingEvent(event);
    setNewEvent({
      date: event.date,
      day: event.day,
      week: event.week,
      type: event.type,
      title: event.title,
      description: event.description || "",
      photos: event.photos,
    });
    setShowAddModal(true);
  };
  const handleSaveEdit = () => {
    if (editingEvent) {
      onEventEdit(editingEvent.id, newEvent);
      setEditingEvent(null);
      setShowAddModal(false);
    }
  };

  // Abrir lightbox
  const openLightbox = (photos: TimelinePhoto[], index: number, event: TimelineEvent) => {
    setLightboxPhotos(photos);
    setLightboxIndex(index);
    setLightboxEvent(event);
    setShowLightbox(true);
  };

  // Ordenar eventos por data desc
  const sortedEvents = [...events].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Timeline de Cultivo</h2>
          <p className="text-muted-foreground">Acompanhe o progresso do seu cultivo</p>
        </div>
        <Button onClick={() => setShowAddModal(true)} className="flex items-center gap-2">
          <Plus className="h-4 w-4" />
          Novo Evento
        </Button>
      </div>
      {/* Timeline */}
      <div className="relative">
        <div className="absolute left-8 top-0 bottom-0 w-0.5 bg-green-500" />
        <div className="space-y-6">
          {sortedEvents.map((event) => (
            <div key={event.id} id={`evento-${event.id}`} className="relative">
              <div className="absolute left-6 top-8 w-4 h-4 bg-green-500 rounded-full border-2 border-white shadow-sm" />
              <Card className={`ml-16 border-l-4 ${eventTypeColors[event.type]}`}>
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">{eventTypeIcons[event.type]}</span>
                      <div>
                        <CardTitle className="text-lg">{event.title}</CardTitle>
                        <div className="flex items-center gap-4 text-sm text-muted-foreground">
                          <div className="flex items-center gap-1">
                            <span className="font-medium">{new Date(event.date).toLocaleDateString("pt-BR")}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            Dia {event.day} (semana {event.week})
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button variant="ghost" size="sm" onClick={() => handleEditEvent(event)}>
                        <span className="sr-only">Editar</span>
                        <Maximize2 className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="sm" onClick={() => onEventDelete(event.id)}>
                        <span className="sr-only">Excluir</span>
                        <CloseIcon className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  {event.description && <p className="text-sm text-muted-foreground">{event.description}</p>}
                  {/* Fotos */}
                  {event.photos.length > 0 && (
                    <div>
                      <h4 className="font-medium text-sm mb-2">Fotos</h4>
                      <div className="grid grid-cols-3 gap-2">
                        {event.photos.map((photo, photoIndex) => (
                          <div
                            key={photo.id}
                            className="relative aspect-square rounded-lg overflow-hidden cursor-pointer hover:opacity-80 transition-opacity"
                            onClick={() => openLightbox(event.photos, photoIndex, event)}
                          >
                            <Image
                              src={photo.url}
                              alt={photo.name}
                              fill
                              className="object-cover"
                              loading="lazy"
                            />
                            <div className="absolute inset-0 bg-black/20 opacity-0 hover:opacity-100 transition-opacity flex items-center justify-center">
                              <Maximize2 className="h-6 w-6 text-white" />
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          ))}
        </div>
      </div>
      {/* Modal de adicionar/editar evento */}
      <Dialog open={showAddModal} onOpenChange={setShowAddModal}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="date">Data</Label>
                <Input
                  id="date"
                  type="date"
                  value={newEvent.date}
                  onChange={(e) => setNewEvent((prev) => ({ ...prev, date: e.target.value }))}
                />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <Label htmlFor="day">Dia</Label>
                  <Input
                    id="day"
                    type="number"
                    value={newEvent.day}
                    onChange={(e) => setNewEvent((prev) => ({ ...prev, day: parseInt(e.target.value) }))}
                  />
                </div>
                <div>
                  <Label htmlFor="week">Semana</Label>
                  <Input
                    id="week"
                    type="number"
                    value={newEvent.week}
                    onChange={(e) => setNewEvent((prev) => ({ ...prev, week: parseInt(e.target.value) }))}
                  />
                </div>
              </div>
            </div>
            <div>
              <Label htmlFor="type">Tipo de Evento</Label>
              <select
                id="type"
                value={newEvent.type}
                onChange={(e) => setNewEvent((prev) => ({ ...prev, type: e.target.value as TimelineEvent["type"] }))}
                className="w-full p-2 border rounded-md"
              >
                <option value="germination">Germinação</option>
                <option value="seedling">Seedling</option>
                <option value="vegetative">Vegetativo</option>
                <option value="flowering">Floração</option>
                <option value="drying">Secagem</option>
                <option value="curing">Cura</option>
                <option value="harvest">Colheita</option>
                <option value="nutrients">Nutrientes</option>
                <option value="water">Água</option>
                <option value="pruning">Poda</option>
                <option value="pest_control">Controle de Pragas</option>
                <option value="other">Outro</option>
              </select>
            </div>
            <div>
              <Label htmlFor="title">Título</Label>
              <Input
                id="title"
                value={newEvent.title}
                onChange={(e) => setNewEvent((prev) => ({ ...prev, title: e.target.value }))}
                placeholder="Ex: Início da floração"
              />
            </div>
            <div>
              <Label htmlFor="description">Descrição</Label>
              <Textarea
                id="description"
                value={newEvent.description}
                onChange={(e) => setNewEvent((prev) => ({ ...prev, description: e.target.value }))}
                placeholder="Detalhes do evento..."
                rows={3}
              />
            </div>
            <div>
              <Label>Fotos</Label>
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center">
                <input
                  ref={fileInputRef}
                  type="file"
                  multiple
                  accept="image/*"
                  onChange={(e) => e.target.files && handleFileUpload(e.target.files)}
                  className="hidden"
                />
                <Button
                  variant="outline"
                  onClick={() => fileInputRef.current?.click()}
                  className="flex items-center gap-2"
                >
                  <Camera className="h-4 w-4" />
                  Selecionar Fotos
                </Button>
                <p className="text-sm text-muted-foreground mt-2">
                  Clique para selecionar uma ou mais fotos
                </p>
              </div>
              {/* Preview das fotos */}
              {newEvent.photos.length > 0 && (
                <div className="mt-4">
                  <h4 className="font-medium text-sm mb-2">Fotos Selecionadas</h4>
                  <div className="grid grid-cols-3 gap-2">
                    {newEvent.photos.map((photo, index) => (
                      <div key={photo.id} className="relative aspect-square rounded-lg overflow-hidden">
                        <Image
                          src={photo.url}
                          alt={photo.name}
                          fill
                          className="object-cover"
                        />
                        <Button
                          variant="destructive"
                          size="sm"
                          className="absolute top-1 right-1 h-6 w-6 p-0"
                          onClick={() =>
                            setNewEvent((prev) => ({
                              ...prev,
                              photos: prev.photos.filter((_, i) => i !== index),
                            }))
                          }
                        >
                          <CloseIcon className="h-3 w-3" />
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setShowAddModal(false)}>
                Cancelar
              </Button>
              <Button onClick={editingEvent ? handleSaveEdit : handleAddEvent}>
                {editingEvent ? "Salvar" : "Adicionar"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
      {/* Lightbox */}
      {showLightbox && lightboxEvent && (
        <Lightbox
          photos={lightboxPhotos}
          initialIndex={lightboxIndex}
          onClose={() => setShowLightbox(false)}
          event={lightboxEvent}
        />
      )}
    </div>
  );
} 