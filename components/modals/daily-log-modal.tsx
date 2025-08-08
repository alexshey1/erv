"use client"

import type React from "react"

import { useState, useEffect } from "react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { CalendarIcon, Save } from "lucide-react"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { format } from "date-fns"
import { Calendar } from "@/components/ui/calendar"
import { ImageUpload } from "@/components/forms/image-upload"
// Remover: import { useToast } from "@/hooks/use-toast"

interface DailyLogModalProps {
  isOpen: boolean
  onClose: () => void
  cultivationId: string
}

type EntryType = "parameter" | "action" | "problem"

export function DailyLogModal({ isOpen, onClose, cultivationId }: DailyLogModalProps) {
  const [entryType, setEntryType] = useState<EntryType>("parameter")
  const [date, setDate] = useState<Date | undefined>(new Date())
  const [description, setDescription] = useState("")
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
  const [isSubmitting, setIsSubmitting] = useState(false)
  // Remover: const { toast } = useToast()

  // State for Parameter entry
  const [ph, setPh] = useState<number | string>("")
  const [ec, setEc] = useState<number | string>("")
  const [temperatureMin, setTemperatureMin] = useState<number | string>("")
  const [temperatureMax, setTemperatureMax] = useState<number | string>("")
  const [humidityMin, setHumidityMin] = useState<number | string>("")
  const [humidityMax, setHumidityMax] = useState<number | string>("")

  // State for Action entry
  const [actionType, setActionType] = useState("")
  const [actionDetails, setActionDetails] = useState<Record<string, string>>({})

  // State for Problem entry
  const [problemType, setProblemType] = useState("")
  const [severity, setSeverity] = useState("") // Changed to string for select
  const [correctiveAction, setCorrectiveAction] = useState("")

  const [recentParams, setRecentParams] = useState<any[]>([])
  const [editingParamIdx, setEditingParamIdx] = useState<number | null>(null)
  const [editParamData, setEditParamData] = useState<any>({})

  // Função para remover parâmetro
  const handleRemoveParam = (date: string) => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("cultivations")
      if (saved) {
        let cultivations = [];
        try {
          cultivations = JSON.parse(saved);
        } catch (e) {
          cultivations = [];
        }
        const idx = cultivations.findIndex((c: any) => c.id === cultivationId)
        if (idx !== -1 && (cultivations[idx] as any)?.agronomicData) {
          (cultivations[idx] as any).agronomicData = (cultivations[idx] as any).agronomicData.filter((param: any) => param.date !== date)
          localStorage.setItem("cultivations", JSON.stringify(cultivations))
        }
      }
    }
    setRecentParams(prev => prev.filter((param) => param.date !== date))
  }

  useEffect(() => {
    if (isOpen && typeof window !== "undefined") {
      const saved = localStorage.getItem("cultivations")
      if (saved) {
        let cultivations = [];
        try {
          cultivations = JSON.parse(saved);
        } catch (e) {
          cultivations = [];
        }
        const found = cultivations.find((c: any) => c.id === cultivationId)
        if (found && (found as any)?.agronomicData) {
          setRecentParams([...(found as any).agronomicData].slice(-5).reverse())
        } else {
          setRecentParams([])
        }
      }
    }
  }, [isOpen, cultivationId])

  const resetForm = () => {
    setEntryType("parameter")
    setDate(new Date())
    setDescription("")
    setUploadedImages([])
    setPh("")
    setEc("")
    setTemperatureMin("")
    setTemperatureMax("")
    setHumidityMin("")
    setHumidityMax("")
    setActionType("")
    setActionDetails({})
    setProblemType("")
    setSeverity("")
    setCorrectiveAction("")
  }

  const handleSubmit = async () => {
    setIsSubmitting(true)
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1500))

    // --- NOVO: Salvar no localStorage ---
    const saved = localStorage.getItem("cultivations")
    let cultivations = [];
    if (saved) {
      try {
        cultivations = JSON.parse(saved);
      } catch (e) {
        cultivations = [];
      }
    }
    const idx = cultivations.findIndex((c: any) => c.id === cultivationId)
    if (idx !== -1) {
      const logEntry = {
        date: date ? format(date, "yyyy-MM-dd") : "",
        entryType,
        description,
        photos: uploadedImages.map(img => img.secureUrl).join(','), // URLs das imagens
        details: {},
      }
      if (entryType === "parameter") {
        logEntry.details = {
          ph: Number(ph),
          ec: Number(ec),
          temperature_min: Number(temperatureMin),
          temperature_max: Number(temperatureMax),
          humidity_min: Number(humidityMin),
          humidity_max: Number(humidityMax),
        }
        const details: any = logEntry.details
        ;(cultivations[idx] as any).agronomicData = (cultivations[idx] as any).agronomicData || []
        ;(cultivations[idx] as any).agronomicData.push({
          date: logEntry.date,
          ph: details.ph,
          ec: details.ec,
          temperature_c: details.temperature_max,
          humidity_percent: details.humidity_max,
        })
      } else if (entryType === "action") {
        logEntry.details = { actionType, ...actionDetails }
        ;(cultivations[idx] as any).events = (cultivations[idx] as any).events || []
        ;(cultivations[idx] as any).events.push({
          date: logEntry.date,
          type: "action",
          description: logEntry.description,
          details: logEntry.details,
        })
      } else if (entryType === "problem") {
        const details: any = { problemType, severity, correctiveAction }
        logEntry.details = details
        ;(cultivations[idx] as any).incidents = (cultivations[idx] as any).incidents || []
        ;(cultivations[idx] as any).incidents.push({
          id: Math.random().toString(36).slice(2),
          date: logEntry.date,
          type: details.problemType || "other",
          description: logEntry.description,
          severity: details.severity || "low",
          correctiveAction: details.correctiveAction || "",
        })
        ;(cultivations[idx] as any).events = (cultivations[idx] as any).events || []
        ;(cultivations[idx] as any).events.push({
          id: Date.now(),
          type: 'incident_resolution',
          date: new Date().toISOString().split('T')[0],
          description: `Incidente resolvido: ${description}`,
          incidentId: (cultivations[idx] as any).incidents[(cultivations[idx] as any).incidents.length - 1].id,
        })
      }
      localStorage.setItem("cultivations", JSON.stringify(cultivations))
    }
    // --- FIM NOVO ---

    // Substituir toast por alert
    alert(`Sua entrada do tipo "${entryType}" foi salva com sucesso.`)

    setIsSubmitting(false)
    resetForm()
    onClose()
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Registrar no Diário de Cultivo</DialogTitle>
          <DialogDescription>Adicione uma nova entrada para o cultivo atual.</DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="date" className="text-right">
              Data
            </Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant={"outline"}
                  className={`col-span-3 justify-start text-left font-normal ${!date && "text-muted-foreground"}`}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {date ? format(date, "PPP") : <span>Selecione uma data</span>}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                <Calendar mode="single" selected={date} onSelect={setDate} initialFocus />
              </PopoverContent>
            </Popover>
          </div>

          <div className="grid grid-cols-4 items-center gap-4">
            <Label className="text-right">Tipo de Entrada</Label>
            <RadioGroup
              value={entryType}
              onValueChange={(value: EntryType) => setEntryType(value)}
              className="col-span-3 flex space-x-4"
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="parameter" id="parameter" />
                <Label htmlFor="parameter">Parâmetro</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="action" id="action" />
                <Label htmlFor="action">Ação</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="problem" id="problem" />
                <Label htmlFor="problem">Problema</Label>
              </div>
            </RadioGroup>
          </div>

          {entryType === "parameter" && (
            <>
              {recentParams.length > 0 && (
                <div className="mb-2">
                  <div className="text-xs text-muted-foreground mb-1">Histórico recente de parâmetros:</div>
                  <div className="overflow-x-auto">
                    <table className="text-xs border w-full">
                      <thead>
                        <tr className="bg-muted">
                          <th className="px-2 py-1">Data</th>
                          <th className="px-2 py-1">pH</th>
                          <th className="px-2 py-1">EC</th>
                          <th className="px-2 py-1">Temp (°C)</th>
                          <th className="px-2 py-1">Umidade (%)</th>
                          <th className="px-2 py-1"></th>
                        </tr>
                      </thead>
                      <tbody>
                        {recentParams.map((p, i) => (
                          <tr key={i} className="border-t">
                            <td className="px-2 py-1">{p.date}</td>
                            {editingParamIdx === i ? (
                              <>
                                <td className="px-2 py-1"><input type="number" value={editParamData.ph} onChange={e => setEditParamData((prev: any) => ({ ...prev, ph: e.target.value }))} className="w-12 border rounded" /></td>
                                <td className="px-2 py-1"><input type="number" value={editParamData.ec} onChange={e => setEditParamData((prev: any) => ({ ...prev, ec: e.target.value }))} className="w-12 border rounded" /></td>
                                <td className="px-2 py-1"><input type="number" value={editParamData.temperature_c} onChange={e => setEditParamData((prev: any) => ({ ...prev, temperature_c: e.target.value }))} className="w-12 border rounded" /></td>
                                <td className="px-2 py-1"><input type="number" value={editParamData.humidity_percent} onChange={e => setEditParamData((prev: any) => ({ ...prev, humidity_percent: e.target.value }))} className="w-12 border rounded" /></td>
                                <td className="px-2 py-1">
                                  <button className="text-xs text-green-600 mr-2" onClick={() => {
                                    // Atualizar localStorage
                                    if (typeof window !== "undefined") {
                                      const saved = localStorage.getItem("cultivations")
                                      if (saved) {
                                        const cultivations = JSON.parse(saved)
                                        const idx = cultivations.findIndex((c: any) => c.id === cultivationId)
                                        if (idx !== -1 && cultivations[idx].agronomicData) {
                                          // Encontrar o parâmetro pelo date
                                          const paramIdx = cultivations[idx].agronomicData.findIndex((param: any) => param.date === p.date)
                                          if (paramIdx !== -1) {
                                            cultivations[idx].agronomicData[paramIdx] = { ...cultivations[idx].agronomicData[paramIdx], ...editParamData }
                                            localStorage.setItem("cultivations", JSON.stringify(cultivations))
                                          }
                                        }
                                      }
                                    }
                                    // Atualizar estado local
                                    setRecentParams(prev => prev.map((param, j) => j === i ? { ...param, ...editParamData } : param))
                                    setEditingParamIdx(null)
                                  }}>Salvar</button>
                                  <button className="text-xs text-gray-600 mr-2" onClick={() => setEditingParamIdx(null)}>Cancelar</button>
                                  <button className="text-xs text-red-600 underline" onClick={() => handleRemoveParam(p.date)}>Remover</button>
                                </td>
                              </>
                            ) : (
                              <>
                                <td className="px-2 py-1">{p.ph}</td>
                                <td className="px-2 py-1">{p.ec}</td>
                                <td className="px-2 py-1">{p.temperature_c}</td>
                                <td className="px-2 py-1">{p.humidity_percent}</td>
                                <td className="px-2 py-1">
                                  <button className="text-xs text-blue-600 underline mr-2" onClick={() => { setEditingParamIdx(i); setEditParamData({ ph: p.ph, ec: p.ec, temperature_c: p.temperature_c, humidity_percent: p.humidity_percent }); }}>Editar</button>
                                  <button className="text-xs text-red-600 underline" onClick={() => handleRemoveParam(p.date)}>Remover</button>
                                </td>
                              </>
                            )}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="ph" className="text-right">
                  pH
                </Label>
                <Input
                  id="ph"
                  type="number"
                  step="0.1"
                  value={ph}
                  onChange={(e) => setPh(e.target.value)}
                  className="col-span-3"
                  placeholder="Ex: 6.2"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="ec" className="text-right">
                  EC
                </Label>
                <Input
                  id="ec"
                  type="number"
                  step="0.1"
                  value={ec}
                  onChange={(e) => setEc(e.target.value)}
                  className="col-span-3"
                  placeholder="Ex: 1.5"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="temperatureMin" className="text-right">
                  Temp. Mín (°C)
                </Label>
                <Input
                  id="temperatureMin"
                  type="number"
                  step="0.1"
                  value={temperatureMin}
                  onChange={(e) => setTemperatureMin(e.target.value)}
                  className="col-span-3"
                  placeholder="Ex: 22.0"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="temperatureMax" className="text-right">
                  Temp. Máx (°C)
                </Label>
                <Input
                  id="temperatureMax"
                  type="number"
                  step="0.1"
                  value={temperatureMax}
                  onChange={(e) => setTemperatureMax(e.target.value)}
                  className="col-span-3"
                  placeholder="Ex: 26.5"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="humidityMin" className="text-right">
                  Umidade Mín (%)
                </Label>
                <Input
                  id="humidityMin"
                  type="number"
                  step="0.1"
                  value={humidityMin}
                  onChange={(e) => setHumidityMin(e.target.value)}
                  className="col-span-3"
                  placeholder="Ex: 55.0"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="humidityMax" className="text-right">
                  Umidade Máx (%)
                </Label>
                <Input
                  id="humidityMax"
                  type="number"
                  step="0.1"
                  value={humidityMax}
                  onChange={(e) => setHumidityMax(e.target.value)}
                  className="col-span-3"
                  placeholder="Ex: 65.0"
                />
              </div>
            </>
          )}

          {entryType === "action" && (
            <>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="actionType" className="text-right">
                  Tipo de Ação
                </Label>
                <Select value={actionType} onValueChange={setActionType}>
                  <SelectTrigger className="col-span-3">
                    <SelectValue placeholder="Selecione o tipo de ação" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="irrigation">Irrigação</SelectItem>
                    <SelectItem value="fertilization">Fertilização</SelectItem>
                    <SelectItem value="pruning">Poda/Treinamento</SelectItem>
                    <SelectItem value="pest_control">Aplicação de Defensivos</SelectItem>
                    <SelectItem value="transplant">Transplante</SelectItem>
                    <SelectItem value="other">Outro</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              {actionType === "irrigation" && (
                <>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="volume" className="text-right">
                      Volume (L)
                    </Label>
                    <Input
                      id="volume"
                      type="number"
                      step="0.1"
                      value={actionDetails.volume || ""}
                      onChange={(e) => setActionDetails({ ...actionDetails, volume: e.target.value })}
                      className="col-span-3"
                      placeholder="Ex: 1.5"
                    />
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="irrigationPh" className="text-right">
                      pH da Água
                    </Label>
                    <Input
                      id="irrigationPh"
                      type="number"
                      step="0.1"
                      value={actionDetails.ph || ""}
                      onChange={(e) => setActionDetails({ ...actionDetails, ph: e.target.value })}
                      className="col-span-3"
                      placeholder="Ex: 6.0"
                    />
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="irrigationEc" className="text-right">
                      EC da Água
                    </Label>
                    <Input
                      id="irrigationEc"
                      type="number"
                      step="0.1"
                      value={actionDetails.ec || ""}
                      onChange={(e) => setActionDetails({ ...actionDetails, ec: e.target.value })}
                      className="col-span-3"
                      placeholder="Ex: 1.2"
                    />
                  </div>
                </>
              )}
              {actionType === "fertilization" && (
                <>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="nutrientProduct" className="text-right">
                      Produto
                    </Label>
                    <Input
                      id="nutrientProduct"
                      value={actionDetails.product || ""}
                      onChange={(e) => setActionDetails({ ...actionDetails, product: e.target.value })}
                      className="col-span-3"
                      placeholder="Ex: BioBizz Grow"
                    />
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="nutrientDosage" className="text-right">
                      Dosagem
                    </Label>
                    <Input
                      id="nutrientDosage"
                      value={actionDetails.dosage || ""}
                      onChange={(e) => setActionDetails({ ...actionDetails, dosage: e.target.value })}
                      className="col-span-3"
                      placeholder="Ex: 2ml/L"
                    />
                  </div>
                </>
              )}
              {actionType === "pruning" && (
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="pruningType" className="text-right">
                    Tipo de Poda
                  </Label>
                  <Select
                    value={actionDetails.pruningType || ""}
                    onValueChange={(value) => setActionDetails({ ...actionDetails, pruningType: value })}
                  >
                    <SelectTrigger className="col-span-3">
                      <SelectValue placeholder="Selecione o tipo de poda" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="topping">Topping</SelectItem>
                      <SelectItem value="fim">FIM</SelectItem>
                      <SelectItem value="lst">LST (Low Stress Training)</SelectItem>
                      <SelectItem value="defoliation">Desfolha</SelectItem>
                      <SelectItem value="scrog">ScrOG</SelectItem>
                      <SelectItem value="other">Outro</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              )}
              {actionType === "pest_control" && (
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="pestProduct" className="text-right">
                    Produto Usado
                  </Label>
                  <Input
                    id="pestProduct"
                    value={actionDetails.product || ""}
                    onChange={(e) => setActionDetails({ ...actionDetails, product: e.target.value })}
                    className="col-span-3"
                    placeholder="Ex: Óleo de Neem"
                  />
                </div>
              )}
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="description" className="text-right">
                  Descrição
                </Label>
                <Textarea
                  id="description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="col-span-3"
                  placeholder="Detalhes da ação realizada..."
                />
              </div>
            </>
          )}

          {entryType === "problem" && (
            <>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="problemType" className="text-right">
                  Tipo de Problema
                </Label>
                <Select value={problemType} onValueChange={setProblemType}>
                  <SelectTrigger className="col-span-3">
                    <SelectValue placeholder="Selecione o tipo de problema" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pest">Praga</SelectItem>
                    <SelectItem value="disease">Doença</SelectItem>
                    <SelectItem value="nutrient_deficiency">Deficiência Nutricional</SelectItem>
                    <SelectItem value="environmental_stress">Estresse Ambiental</SelectItem>
                    <SelectItem value="other">Outro</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="severity" className="text-right">
                  Severidade
                </Label>
                <Select value={severity} onValueChange={setSeverity}>
                  <SelectTrigger className="col-span-3">
                    <SelectValue placeholder="Selecione a severidade" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">1 - Baixa</SelectItem>
                    <SelectItem value="medium">2 - Média</SelectItem>
                    <SelectItem value="high">3 - Alta</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="description" className="text-right">
                  Descrição
                </Label>
                <Textarea
                  id="description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="col-span-3"
                  placeholder="Descreva o problema encontrado..."
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label className="text-right">
                  Fotos
                </Label>
                <div className="col-span-3">
                  <ImageUpload 
                    onImagesUploaded={setUploadedImages}
                    maxImages={3}
                    className="mt-2"
                  />
                </div>
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="correctiveAction" className="text-right">
                  Ação Corretiva
                </Label>
                <Textarea
                  id="correctiveAction"
                  value={correctiveAction}
                  onChange={(e) => setCorrectiveAction(e.target.value)}
                  className="col-span-3"
                  placeholder="Descreva a ação tomada para corrigir o problema..."
                />
              </div>
            </>
          )}
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancelar
          </Button>
          <Button onClick={handleSubmit} disabled={isSubmitting}>
            <Save className="h-4 w-4 mr-2" />
            {isSubmitting ? "Salvando..." : "Salvar Entrada"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
