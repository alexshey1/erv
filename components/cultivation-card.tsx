"use client"

import Link from "next/link"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { DollarSign, Calendar, Leaf, TrendingUp, Clock, AlertTriangle, CheckCircle2, PauseCircle, PlayCircle, Check, Paperclip } from "lucide-react"
import type { CultivationSummary } from "@/lib/mock-data"
import { Sparkline } from "./charts/sparkline"
import { Checkbox } from "@/components/ui/checkbox"
import { useState } from "react"
import { Dialog, DialogTrigger, DialogContent, DialogTitle } from "@/components/ui/dialog"
import { ImageUpload } from "@/components/forms/image-upload"

interface CultivationCardProps {
  cultivation: CultivationSummary
  onSelect?: (id: string, selected: boolean) => void
  isSelected?: boolean
  maxProfit?: number // Novo: maior lucro da lista para normalizar a barra
  avgProfit?: number // Novo: média de lucro para indicador visual
}

// Função para parsear data local yyyy-mm-dd (corrigida para hora 12:00)
function parseDateLocal(dateStr: string) {
  if (!dateStr) return new Date()
  const [year, month, day] = dateStr.split('T')[0].split('-').map(Number)
  return new Date(year, month - 1, day, 12, 0, 0)
}

export function CultivationCard({ cultivation, onSelect, isSelected, maxProfit, avgProfit }: CultivationCardProps) {
  const formatCurrency = (value: number) =>
    new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(value)

  const statusColor =
    cultivation.status === "active"
      ? "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200"
      : cultivation.status === "completed"
        ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
        : "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200"

  // Novo: lógica do indicador de desempenho
  let perfColor = "text-gray-400"
  let perfTooltip = "Desempenho na média"
  if (typeof avgProfit === "number" && avgProfit > 0) {
    const diff = cultivation.profit_brl - avgProfit
    const perc = diff / avgProfit
    if (perc >= 0.1) {
      perfColor = "text-green-600"
      perfTooltip = "Lucro acima da média"
    } else if (perc <= -0.1) {
      perfColor = "text-red-600"
      perfTooltip = "Lucro abaixo da média"
    } else {
      perfColor = "text-yellow-500"
      perfTooltip = "Lucro na média"
    }
  }

  // Duração sincronizada
  const startDateObj = parseDateLocal(cultivation.startDate)
  const endDateObj = cultivation.endDate ? parseDateLocal(cultivation.endDate) : new Date()
  const durationDays = Math.max(0, Math.ceil((endDateObj.getTime() - startDateObj.getTime()) / (1000 * 60 * 60 * 24)))

  // Top performer por rendimento
  const isTopYield = typeof maxProfit === "number" && cultivation.yield_g === maxProfit

  const handleCardClick = (e: React.MouseEvent) => {
    // Se clicou no checkbox, não navega
    if ((e.target as HTMLElement).closest('[data-checkbox]')) {
      e.preventDefault()
      e.stopPropagation()
      return
    }
    
    // Se tem onSelect (modo de seleção ativo), permite seleção
    if (onSelect) {
      e.preventDefault()
      onSelect(cultivation.id, !isSelected)
      return
    }
    
    // Caso contrário, navega normalmente
  }

  const [modalAberto, setModalAberto] = useState(false)
  const [imgUrl, setImgUrl] = useState(cultivation.photoUrl || "")

  async function handleImageUploaded(images: any[]) {
    if (!images[0]?.secureUrl) return;
    setModalAberto(false)
    setImgUrl(images[0].secureUrl)
    // Atualiza no backend
    try {
      console.log('[DEBUG] PATCH photoUrl', {
        id: cultivation.id,
        photoUrl: images[0].secureUrl
      })
      const response = await fetch(`/api/cultivation/${cultivation.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ photoUrl: images[0].secureUrl }),
      })
      const data = await response.json()
      console.log('[DEBUG] Resposta PATCH photoUrl', data)
    } catch (err) {
      console.error('[DEBUG] Erro PATCH photoUrl', err)
    }
  }

  return (
    <div className="block h-full relative">
      <Card 
        className={`h-full flex flex-col justify-between hover:shadow-lg transition-all duration-200 cursor-pointer ${
          isSelected ? 'ring-2 ring-blue-500 bg-blue-50 scale-[1.02]' : ''
        }`}
        onClick={handleCardClick}
      >
        {/* Imagem de perfil da planta */}
        <div className="relative flex justify-center mt-4 mb-2">
          <div className="w-20 h-20 bg-gray-100 rounded-lg border-2 border-green-400 flex items-center justify-center overflow-hidden">
            {imgUrl ? (
              <img src={imgUrl} alt={cultivation.name} className="w-full h-full object-cover rounded-lg" loading="lazy" />
            ) : (
              <span className="text-gray-400">Sem foto</span>
            )}
            {/* Botão de upload no canto superior esquerdo */}
            <Dialog open={modalAberto} onOpenChange={setModalAberto}>
              <DialogTrigger asChild>
                <button
                  aria-label="Adicionar foto da planta"
                  className="absolute -top-3 left-2 z-10 bg-white rounded-full p-2 shadow-md border border-green-200 hover:bg-green-50 hover:border-green-500 transition"
                  onClick={e => { e.stopPropagation(); setModalAberto(true) }}
                >
                  <Paperclip className="w-5 h-5 text-green-600" />
                </button>
              </DialogTrigger>
              <DialogContent>
                <DialogTitle>Adicionar foto da planta</DialogTitle>
                <ImageUpload
                  maxImages={1}
                  onImagesUploaded={handleImageUploaded}
                />
              </DialogContent>
            </Dialog>
          </div>
        </div>
        {/* Cabeçalho e conteúdo do card */}
        <CardHeader className="pb-3">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
            <div className="flex items-center gap-2">
              {onSelect && (
                <div className="flex items-center gap-2">
                  <Checkbox
                    data-checkbox
                    checked={isSelected}
                    onCheckedChange={(checked) => onSelect(cultivation.id, checked as boolean)}
                    className="mr-2"
                  />
                  {isSelected && (
                    <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse" />
                  )}
                </div>
              )}
              <CardTitle className="text-lg break-words max-w-full flex items-center gap-2">
                {cultivation.name}
                {isTopYield && <span className="ml-1 text-yellow-500" title="Top Rendimento">🏆</span>}
              </CardTitle>
            </div>
            <div className="flex items-center gap-2">
              {/* Status com ícone e tooltip */}
              <span className="flex items-center">
                <Badge
                  className={statusColor + " flex items-center gap-1 cursor-help"}
                  title={
                    cultivation.status === "completed" && cultivation.endDate
                      ? `Concluído em ${new Date(cultivation.endDate).toLocaleDateString("pt-BR")}`
                      : cultivation.status === "active"
                      ? "Cultivo em andamento"
                      : cultivation.status === "archived"
                      ? "Cultivo arquivado"
                      : ""
                  }
                >
                  {cultivation.status === "active" && <PlayCircle className="h-4 w-4 text-blue-500" />}
                  {cultivation.status === "completed" && <CheckCircle2 className="h-4 w-4 text-green-500" />}
                  {cultivation.status === "archived" && <PauseCircle className="h-4 w-4 text-gray-500" />}
                  {cultivation.status === "active" && "Ativo"}
                  {cultivation.status === "completed" && "Concluído"}
                  {cultivation.status === "archived" && "Arquivado"}
                </Badge>
              </span>
              {/* Indicador de problemas graves */}
              {cultivation.hasSevereProblems && (
                <Badge variant="destructive" className="ml-1">Problemas</Badge>
              )}
            </div>
          </div>
          <CardDescription className="flex items-center gap-1 text-sm">
            <Leaf className="h-3 w-3" />
            {cultivation.seedStrain}
          </CardDescription>
        </CardHeader>
        <CardContent className="grid gap-2 text-sm">
          <div className="flex items-center justify-between">
            <span className="text-muted-foreground flex items-center gap-1">
              <Calendar className="h-3 w-3" />
              Início:
            </span>
            <span>{new Date(cultivation.startDate).toLocaleDateString("pt-BR")}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-muted-foreground flex items-center gap-1">
              <Calendar className="h-3 w-3" />
              Fim:
            </span>
            <span>
              {cultivation.endDate ? new Date(cultivation.endDate).toLocaleDateString("pt-BR") : "Em andamento"}
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-muted-foreground flex items-center gap-1">
              <Clock className="h-3 w-3" />
              Duração:
            </span>
            <span>{durationDays} dias</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-muted-foreground flex items-center gap-1">
              <TrendingUp className="h-3 w-3" />
              Rendimento:
            </span>
            <span className="font-bold text-green-700">{cultivation.yield_g > 0 ? `${cultivation.yield_g}g` : "N/A"}</span>
          </div>
        </CardContent>
        {/* Remover CardFooter de lucro/preço */}
      </Card>
      {/* Link para navegação quando não está em modo de seleção */}
      {!onSelect && (
        <Link href={`/history/${cultivation.id}`} className="absolute inset-0" />
      )}
    </div>
  )
}
