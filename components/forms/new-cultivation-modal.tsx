import type { FormEvent } from "react"
import { useState, useEffect } from "react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { ImageUpload } from "./image-upload"
import { 
  CYCLE_PRESETS, 
  GENETICS_DATABASE,
  type PlantType, 
  type CyclePreset, 
  type AdaptiveCycleParams,
  getCycleConfigFromGenetics,
  getDefaultCycleConfig,
  validateCycleConfig,
  calculateAdaptiveDuration
} from "@/types/plant-genetics"
import { CycleTypeConfigurator } from "@/components/cultivation/cycle-type-configurator"
import { Leaf, Clock, Zap, AlertTriangle, Info } from "lucide-react"

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
    // Novos campos para ciclo adaptativo
    plant_type?: PlantType
    cycle_preset_id?: string
    custom_cycle_params?: AdaptiveCycleParams
  }
  onChange: (field: string, value: string | PlantType | AdaptiveCycleParams) => void
  onImagesUploaded?: (images: Array<{
    publicId: string;
    secureUrl: string;
    filename: string;
    fileSize: number;
    mimeType: string;
    width: number;
    height: number;
    format: string;
  }>) => void
  errors?: { name?: string; seedStrain?: string; startDate?: string }
  isSubmitting?: boolean
}

export function NewCultivationModal({ open, onClose, onSubmit, values, onChange, onImagesUploaded, errors, isSubmitting = false }: NewCultivationModalProps) {
  const [selectedPreset, setSelectedPreset] = useState<CyclePreset | null>(null)
  const [customCycleParams, setCustomCycleParams] = useState<AdaptiveCycleParams | null>(null)
  const [showAdvanced, setShowAdvanced] = useState(false)
  const [cycleValidation, setCycleValidation] = useState<{ valid: boolean; warnings: string[] }>({ valid: true, warnings: [] })
  const [lastProcessedGenetics, setLastProcessedGenetics] = useState<string>("")

  // Efeito para carregar configuração baseada na genética
  useEffect(() => {
    if (values.seedStrain && values.plant_type) {
      const geneticsKey = `${values.seedStrain}-${values.plant_type}`
      
      // Só processar se for uma nova combinação
      if (geneticsKey !== lastProcessedGenetics) {
        const configFromGenetics = getCycleConfigFromGenetics(values.seedStrain, values.plant_type)
        setCustomCycleParams(configFromGenetics)
        onChange("custom_cycle_params", configFromGenetics)
        
        // Validar configuração
        const validation = validateCycleConfig(configFromGenetics)
        setCycleValidation(validation)
        
        setLastProcessedGenetics(geneticsKey)
      }
    }
  }, [values.seedStrain, values.plant_type, lastProcessedGenetics])

  // Atualizar quando preset é selecionado
  const handlePresetChange = (presetId: string) => {
    if (presetId === "manual") {
      // Modo manual - limpar preset e usar configuração padrão ou existente
      setSelectedPreset(null)
      onChange("cycle_preset_id", "")
      
      // Se já tem tipo de planta, manter configuração atual ou gerar padrão
      if (values.plant_type && !customCycleParams) {
        const defaultConfig = getDefaultCycleConfig(values.plant_type)
        setCustomCycleParams(defaultConfig)
        onChange("custom_cycle_params", defaultConfig)
      }
      return
    }
    
    const preset = CYCLE_PRESETS.find(p => p.id === presetId)
    if (preset && selectedPreset?.id !== presetId) {
      setSelectedPreset(preset)
      setCustomCycleParams(preset.cycle_params)
      onChange("cycle_preset_id", presetId)
      onChange("custom_cycle_params", preset.cycle_params)
      onChange("plant_type", preset.plant_type)
      
      // Validar configuração
      const validation = validateCycleConfig(preset.cycle_params)
      setCycleValidation(validation)
    }
  }

  // Atualizar tipo de planta
  const handlePlantTypeChange = (plantType: PlantType) => {
    if (values.plant_type === plantType) return // Evitar loop se o tipo já é o mesmo
    
    onChange("plant_type", plantType)
    
    // Limpar preset selecionado se mudou o tipo
    if (selectedPreset && selectedPreset.plant_type !== plantType) {
      setSelectedPreset(null)
      onChange("cycle_preset_id", "")
    }
    
    // Gerar configuração padrão para o tipo
    const defaultConfig = getDefaultCycleConfig(plantType)
    setCustomCycleParams(defaultConfig)
    onChange("custom_cycle_params", defaultConfig)
    
    // Validar configuração
    const validation = validateCycleConfig(defaultConfig)
    setCycleValidation(validation)
  }

  // Atualizar parâmetros customizados
  const handleCycleParamsChange = (params: AdaptiveCycleParams) => {
    setCustomCycleParams(params)
    onChange("custom_cycle_params", params)
    
    // Validar configuração
    const validation = validateCycleConfig(params)
    setCycleValidation(validation)
  }

  // Filtrar presets pelo tipo de planta selecionado
  const availablePresets = values.plant_type 
    ? CYCLE_PRESETS.filter(preset => preset.plant_type === values.plant_type)
    : CYCLE_PRESETS

  // Calcular duração estimada
  const estimatedDuration = customCycleParams ? calculateAdaptiveDuration(customCycleParams) : null

  if (!open) return null
  
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-2 sm:p-4">
      <div className="bg-white dark:bg-zinc-900 rounded-lg shadow-lg p-4 sm:p-6 lg:p-8 w-full max-w-4xl max-h-[95vh] sm:max-h-[90vh] overflow-y-auto">
        <h2 className="text-lg sm:text-xl font-bold mb-4 sm:mb-6">Novo Cultivo Adaptativo</h2>
        
        <form className="space-y-4 sm:space-y-6" onSubmit={onSubmit}>
          {/* Informações Básicas */}
          <Card>
            <CardHeader className="pb-3 sm:pb-6">
              <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
                <Leaf className="h-4 w-4 sm:h-5 sm:w-5 text-green-600" />
                Informações Básicas
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 sm:space-y-4">
              <div className="grid grid-cols-1 gap-3 sm:gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">
                    Nome do Cultivo
                    {errors?.name && <span className="text-red-600 text-xs ml-2">{errors.name}</span>}
                  </label>
                  <Input 
                    placeholder="Ex: Cultivo Primavera 2024" 
                    value={values.name} 
                    onChange={e => onChange("name", e.target.value)}
                    className="text-sm sm:text-base"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-1">
                    Variedade/Strain
                    {errors?.seedStrain && <span className="text-red-600 text-xs ml-2">{errors.seedStrain}</span>}
                  </label>
                  <Input 
                    placeholder="Ex: OG Kush, Northern Lights Auto" 
                    value={values.seedStrain} 
                    onChange={e => onChange("seedStrain", e.target.value)}
                    className="text-sm sm:text-base"
                  />
                  {values.seedStrain && GENETICS_DATABASE[values.seedStrain.toLowerCase().replace(/\s+/g, '_')] && (
                    <Badge variant="outline" className="mt-1 text-xs">
                      <Info className="h-3 w-3 mr-1" />
                      Genética reconhecida
                    </Badge>
                  )}
                </div>
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">
                    Data de Início
                    {errors?.startDate && <span className="text-red-600 text-xs ml-2">{errors.startDate}</span>}
                  </label>
                  <Input 
                    type="date" 
                    value={values.startDate} 
                    onChange={e => onChange("startDate", e.target.value)}
                    className="text-sm sm:text-base"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-1">Status</label>
                  <Select value={values.status} onValueChange={v => onChange("status", v)}>
                    <SelectTrigger className="text-sm sm:text-base">
                      <SelectValue placeholder="Status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="active">Ativo</SelectItem>
                      <SelectItem value="completed">Concluído</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Configuração do Ciclo */}
          <Card>
            <CardHeader className="pb-3 sm:pb-6">
              <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
                <Clock className="h-4 w-4 sm:h-5 sm:w-5 text-blue-600" />
                Configuração do Ciclo
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 sm:space-y-4">
              {/* Tipo de Planta */}
              <div>
                <label className="block text-sm font-medium mb-2">Tipo de Planta</label>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 sm:gap-3">
                  {(['photoperiod', 'autoflowering', 'fast_version'] as PlantType[]).map((type) => (
                    <button
                      key={type}
                      type="button"
                      onClick={() => handlePlantTypeChange(type)}
                      className={`p-2 sm:p-3 rounded-lg border-2 text-center transition-all ${
                        values.plant_type === type
                          ? 'border-blue-500 bg-blue-50 text-blue-700'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <div className="font-medium text-xs sm:text-sm">
                        {type === 'photoperiod' && 'Fotoperíodo'}
                        {type === 'autoflowering' && 'Automática'}
                        {type === 'fast_version' && 'Fast Version'}
                      </div>
                      <div className="text-xs text-gray-500 mt-1">
                        {type === 'photoperiod' && '120-160 dias'}
                        {type === 'autoflowering' && '70-95 dias'}
                        {type === 'fast_version' && '90-120 dias'}
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Presets de Ciclo */}
              {values.plant_type && (
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Preset de Ciclo (Opcional)
                  </label>
                  <Select 
                    value={values.cycle_preset_id || "manual"} 
                    onValueChange={handlePresetChange}
                  >
                    <SelectTrigger className="text-sm sm:text-base">
                      <SelectValue placeholder="Escolha um preset ou configure manualmente" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="manual">Configuração Manual</SelectItem>
                      {availablePresets.map((preset) => (
                        <SelectItem key={preset.id} value={preset.id}>
                          <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2">
                            <span className="text-sm">{preset.name}</span>
                            <Badge variant={preset.difficulty === 'easy' ? 'default' : preset.difficulty === 'medium' ? 'secondary' : 'destructive'} className="text-xs w-fit">
                              {preset.difficulty === 'easy' && 'Fácil'}
                              {preset.difficulty === 'medium' && 'Médio'}
                              {preset.difficulty === 'hard' && 'Difícil'}
                            </Badge>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  
                  {selectedPreset && (
                    <div className="mt-2 p-3 bg-gray-50 rounded-lg">
                      <p className="text-sm text-gray-600">{selectedPreset.description}</p>
                      <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 mt-2 text-xs text-gray-500">
                        <span>⏱️ ~{selectedPreset.estimated_duration} dias</span>
                        <span>🌱 {selectedPreset.typical_yield_range.min}-{selectedPreset.typical_yield_range.max}g/planta</span>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Configuração Personalizada */}
              {values.plant_type && customCycleParams && (
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <label className="text-sm font-medium">Configuração do Ciclo</label>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => setShowAdvanced(!showAdvanced)}
                    >
                      {showAdvanced ? 'Salvar' : 'Editar'}
                    </Button>
                  </div>
                  
                  {/* Resumo do Ciclo - Com edição inline */}
                  <div className="mt-3 sm:mt-4 p-3 sm:p-4 bg-green-50 rounded-lg">
                    <div className="flex items-center gap-2 mb-2 sm:mb-3">
                      <Zap className="h-4 w-4 text-green-600" />
                      <span className="font-medium text-green-800 text-sm sm:text-base">Configuração do Ciclo</span>
                    </div>
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
                      <div>
                        <label className="text-xs text-gray-600 block mb-1">Vegetativo (dias):</label>
                        {showAdvanced ? (
                          <Input
                            type="number"
                            value={customCycleParams.dias_vegetativo}
                            onChange={(e) => {
                              const newParams = { ...customCycleParams, dias_vegetativo: parseInt(e.target.value) || 0 }
                              handleCycleParamsChange(newParams)
                            }}
                            className="h-8 text-sm"
                            min="1"
                            max="120"
                          />
                        ) : (
                          <div className="font-medium text-base sm:text-lg">{customCycleParams.dias_vegetativo} dias</div>
                        )}
                      </div>
                      <div>
                        <label className="text-xs text-gray-600 block mb-1">Floração (dias):</label>
                        {showAdvanced ? (
                          <Input
                            type="number"
                            value={customCycleParams.dias_floracao}
                            onChange={(e) => {
                              const newParams = { ...customCycleParams, dias_floracao: parseInt(e.target.value) || 0 }
                              handleCycleParamsChange(newParams)
                            }}
                            className="h-8 text-sm"
                            min="1"
                            max="120"
                          />
                        ) : (
                          <div className="font-medium text-base sm:text-lg">{customCycleParams.dias_floracao} dias</div>
                        )}
                      </div>
                      <div>
                        <label className="text-xs text-gray-600 block mb-1">Secagem (dias):</label>
                        {showAdvanced ? (
                          <Input
                            type="number"
                            value={customCycleParams.dias_secagem_cura}
                            onChange={(e) => {
                              const newParams = { ...customCycleParams, dias_secagem_cura: parseInt(e.target.value) || 0 }
                              handleCycleParamsChange(newParams)
                            }}
                            className="h-8 text-sm"
                            min="1"
                            max="60"
                          />
                        ) : (
                          <div className="font-medium text-base sm:text-lg">{customCycleParams.dias_secagem_cura} dias</div>
                        )}
                      </div>
                      <div className="col-span-2 lg:col-span-1">
                        <label className="text-xs text-gray-600 block mb-1">Total:</label>
                        <div className="font-bold text-base sm:text-lg text-green-700">{estimatedDuration} dias</div>
                      </div>
                    </div>
                  </div>
                  
                  {/* Avisos de Validação */}
                  {!cycleValidation.valid && cycleValidation.warnings.length > 0 && (
                    <div className="mt-3 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                      <div className="flex items-center gap-2 mb-2">
                        <AlertTriangle className="h-4 w-4 text-yellow-600" />
                        <span className="font-medium text-yellow-800">Avisos</span>
                      </div>
                      <ul className="text-sm text-yellow-700 space-y-1">
                        {cycleValidation.warnings.map((warning, index) => (
                          <li key={index}>• {warning}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Upload de Imagens */}
          {onImagesUploaded && (
            <Card>
              <CardHeader className="pb-3 sm:pb-6">
                <CardTitle className="text-base sm:text-lg">Fotos do Cultivo (Opcional)</CardTitle>
              </CardHeader>
              <CardContent>
                <ImageUpload 
                  onImagesUploaded={onImagesUploaded}
                  maxImages={5}
                />
              </CardContent>
            </Card>
          )}
          
          <Separator />
          
          {/* Botões de Ação */}
          <div className="flex flex-col sm:flex-row justify-end gap-2 sm:gap-3 pt-2">
            <Button 
              type="button" 
              variant="outline" 
              onClick={onClose}
              disabled={isSubmitting}
              className="w-full sm:w-auto text-sm sm:text-base"
            >
              Cancelar
            </Button>
            <Button 
              type="submit" 
              disabled={!values.name || !values.seedStrain || !values.startDate || !values.plant_type || isSubmitting}
              className="w-full sm:w-auto text-sm sm:text-base"
            >
              {isSubmitting ? "Criando..." : "Criar Cultivo"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
} 