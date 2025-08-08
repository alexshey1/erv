"use client"

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { AlertTriangle, CheckCircle, Info, Clock, Leaf, Zap, Settings } from "lucide-react"
import { 
  PlantType, 
  AdaptiveCycleParams, 
  CyclePreset, 
  CYCLE_PRESETS, 
  GENETICS_DATABASE,
  getCycleConfigFromGenetics,
  getDefaultCycleConfig,
  validateCycleConfig,
  calculateAdaptiveDuration
} from '@/types/plant-genetics'

interface CycleTypeConfiguratorProps {
  initialConfig?: Partial<AdaptiveCycleParams>
  onConfigChange: (config: AdaptiveCycleParams) => void
  onValidationChange?: (isValid: boolean, warnings: string[]) => void
}

export function CycleTypeConfigurator({ 
  initialConfig, 
  onConfigChange, 
  onValidationChange 
}: CycleTypeConfiguratorProps) {
  const [selectedPreset, setSelectedPreset] = useState<string>('manual')
  const [useCustomConfig, setUseCustomConfig] = useState(false)
  const [config, setConfig] = useState<AdaptiveCycleParams>(() => {
    if (initialConfig) {
      return { ...getDefaultCycleConfig('photoperiod'), ...initialConfig }
    }
    return getDefaultCycleConfig('photoperiod')
  })
  
  const [validation, setValidation] = useState<{ valid: boolean; warnings: string[] }>({ valid: true, warnings: [] })

  // Validar configuração sempre que mudar
  useEffect(() => {
    const newValidation = validateCycleConfig(config)
    setValidation(newValidation)
    onValidationChange?.(newValidation.valid, newValidation.warnings)
    onConfigChange(config)
  }, [config, onValidationChange, onConfigChange])

  const handlePresetChange = (presetId: string) => {
    setSelectedPreset(presetId)
    if (presetId === "manual" || presetId === "custom") {
      // Modo manual ou personalizado - usar configuração personalizada
      setUseCustomConfig(true)
      return
    }
    
    if (presetId) {
      const preset = CYCLE_PRESETS.find(p => p.id === presetId)
      if (preset) {
        setConfig(preset.cycle_params)
        setUseCustomConfig(false)
      }
    }
  }

  const handlePlantTypeChange = (plantType: PlantType) => {
    const newConfig = getDefaultCycleConfig(plantType)
    setConfig({ ...config, ...newConfig })
    setSelectedPreset('manual')
    setUseCustomConfig(true)
  }

  const handleGeneticsChange = (geneticsName: string) => {
    if (geneticsName === "custom") {
      // Genética personalizada - manter configuração atual
      setConfig(prev => ({ ...prev, genetics_name: undefined }))
      return
    }
    
    if (geneticsName && GENETICS_DATABASE[geneticsName.toLowerCase().replace(/\s+/g, '_')]) {
      const geneticsConfig = getCycleConfigFromGenetics(geneticsName, config.plant_type)
      setConfig({ ...config, ...geneticsConfig })
    }
  }

  const updateConfig = (field: keyof AdaptiveCycleParams, value: any) => {
    setConfig(prev => ({ ...prev, [field]: value }))
    setSelectedPreset('manual')
    setUseCustomConfig(true)
  }

  const totalDuration = calculateAdaptiveDuration(config)
  const cyclesPerYear = Math.floor(365 / totalDuration)

  return (
    <div className="space-y-6">
      {/* Seleção de Preset */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5 text-blue-500" />
            Tipo de Cultivo e Preset
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>Preset de Cultivo</Label>
            <Select value={selectedPreset} onValueChange={handlePresetChange}>
              <SelectTrigger>
                <SelectValue placeholder="Escolha um preset ou configure manualmente" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="manual">Configuração Manual</SelectItem>
                {CYCLE_PRESETS.map(preset => (
                  <SelectItem key={preset.id} value={preset.id}>
                    <div className="flex items-center gap-2">
                      <span>{preset.name}</span>
                      <Badge variant={preset.difficulty === 'easy' ? 'default' : preset.difficulty === 'medium' ? 'secondary' : 'destructive'}>
                        {preset.difficulty === 'easy' ? 'Fácil' : preset.difficulty === 'medium' ? 'Médio' : 'Difícil'}
                      </Badge>
                      <span className="text-xs text-muted-foreground">~{preset.estimated_duration}d</span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {selectedPreset && (
            <div className="p-4 bg-muted rounded-lg">
              {(() => {
                const preset = CYCLE_PRESETS.find(p => p.id === selectedPreset)
                return preset ? (
                  <div className="space-y-2">
                    <h4 className="font-medium">{preset.name}</h4>
                    <p className="text-sm text-muted-foreground">{preset.description}</p>
                    <div className="flex items-center gap-4 text-xs">
                      <span>Duração: {preset.estimated_duration} dias</span>
                      <span>Tipo: {preset.plant_type === 'autoflowering' ? 'Automática' : preset.plant_type === 'fast_version' ? 'Fast Version' : 'Fotoperíodo'}</span>
                      <span>Rendimento: {preset.typical_yield_range.min}-{preset.typical_yield_range.max}g/planta</span>
                    </div>
                  </div>
                ) : null
              })()}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Configuração Manual */}
      <Card>
        <CardHeader>
          <CardTitle>Configuração Detalhada</CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="basic" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="basic">Básico</TabsTrigger>
              <TabsTrigger value="timing">Cronograma</TabsTrigger>
              <TabsTrigger value="advanced">Avançado</TabsTrigger>
            </TabsList>

            <TabsContent value="basic" className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Tipo de Planta</Label>
                  <Select value={config.plant_type} onValueChange={(value: PlantType) => handlePlantTypeChange(value)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="photoperiod">Fotoperíodo</SelectItem>
                      <SelectItem value="autoflowering">Automática</SelectItem>
                      <SelectItem value="fast_version">Fast Version</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Genética (Opcional)</Label>
                  <Select value={config.genetics_name || 'custom'} onValueChange={handleGeneticsChange}>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione uma genética" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="custom">Genética personalizada</SelectItem>
                      {Object.values(GENETICS_DATABASE)
                        .filter(g => g.type === config.plant_type)
                        .map(genetics => (
                          <SelectItem key={genetics.name} value={genetics.name}>
                            {genetics.name}
                          </SelectItem>
                        ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Número de Plantas</Label>
                  <Input
                    type="number"
                    min="1"
                    max="50"
                    value={config.num_plantas}
                    onChange={(e) => updateConfig('num_plantas', parseInt(e.target.value) || 1)}
                  />
                </div>

                <div className="space-y-2">
                  <Label>Produção por Planta (g)</Label>
                  <Input
                    type="number"
                    min="10"
                    max="500"
                    value={config.producao_por_planta_g}
                    onChange={(e) => updateConfig('producao_por_planta_g', parseFloat(e.target.value) || 0)}
                  />
                </div>

                <div className="space-y-2">
                  <Label>Potência (Watts)</Label>
                  <Input
                    type="number"
                    min="50"
                    max="2000"
                    value={config.potencia_watts}
                    onChange={(e) => updateConfig('potencia_watts', parseInt(e.target.value) || 0)}
                  />
                </div>
              </div>
            </TabsContent>

            <TabsContent value="timing" className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label className="flex items-center gap-2">
                    <Leaf className="h-4 w-4 text-green-500" />
                    Dias Vegetativo
                  </Label>
                  <Input
                    type="number"
                    min="14"
                    max="180"
                    value={config.dias_vegetativo}
                    onChange={(e) => updateConfig('dias_vegetativo', parseInt(e.target.value) || 0)}
                  />
                </div>

                <div className="space-y-2">
                  <Label className="flex items-center gap-2">
                    <Leaf className="h-4 w-4 text-purple-500" />
                    Dias Floração
                  </Label>
                  <Input
                    type="number"
                    min="35"
                    max="120"
                    value={config.dias_floracao}
                    onChange={(e) => updateConfig('dias_floracao', parseInt(e.target.value) || 0)}
                  />
                </div>

                <div className="space-y-2">
                  <Label className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-orange-500" />
                    Dias Secagem/Cura
                  </Label>
                  <Input
                    type="number"
                    min="7"
                    max="60"
                    value={config.dias_secagem_cura}
                    onChange={(e) => updateConfig('dias_secagem_cura', parseInt(e.target.value) || 0)}
                  />
                </div>
              </div>

              {/* Fotoperíodo */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="flex items-center gap-2">
                    <Zap className="h-4 w-4 text-yellow-500" />
                    Horas Luz Vegetativo
                  </Label>
                  <Input
                    type="number"
                    min="12"
                    max="24"
                    value={config.horas_luz_veg}
                    onChange={(e) => updateConfig('horas_luz_veg', parseInt(e.target.value) || 0)}
                  />
                </div>

                <div className="space-y-2">
                  <Label className="flex items-center gap-2">
                    <Zap className="h-4 w-4 text-purple-500" />
                    Horas Luz Floração
                  </Label>
                  <Input
                    type="number"
                    min="8"
                    max="20"
                    value={config.horas_luz_flor}
                    onChange={(e) => updateConfig('horas_luz_flor', parseInt(e.target.value) || 0)}
                  />
                </div>
              </div>

              {config.plant_type === 'autoflowering' && (
                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <Switch
                      id="luz_constante"
                      checked={config.luz_constante_auto || false}
                      onCheckedChange={(checked) => updateConfig('luz_constante_auto', checked)}
                    />
                    <Label htmlFor="luz_constante">Usar luz constante durante todo o ciclo</Label>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Automáticas podem usar o mesmo fotoperíodo (18-24h) durante todo o ciclo
                  </p>
                </div>
              )}
            </TabsContent>

            <TabsContent value="advanced" className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <Switch
                      id="ciclo_personalizado"
                      checked={config.ciclo_personalizado}
                      onCheckedChange={(checked) => updateConfig('ciclo_personalizado', checked)}
                    />
                    <Label htmlFor="ciclo_personalizado">Configuração Personalizada</Label>
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <Switch
                      id="usar_presets_genetica"
                      checked={config.usar_presets_genetica}
                      onCheckedChange={(checked) => updateConfig('usar_presets_genetica', checked)}
                    />
                    <Label htmlFor="usar_presets_genetica">Usar Presets de Genética</Label>
                  </div>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {/* Resumo e Validação */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Info className="h-5 w-5 text-blue-500" />
            Resumo do Ciclo
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
            <div className="p-3 bg-muted rounded-lg">
              <div className="text-lg font-bold">{totalDuration}</div>
              <div className="text-xs text-muted-foreground">dias total</div>
            </div>
            <div className="p-3 bg-muted rounded-lg">
              <div className="text-lg font-bold">{cyclesPerYear}</div>
              <div className="text-xs text-muted-foreground">ciclos/ano</div>
            </div>
            <div className="p-3 bg-muted rounded-lg">
              <div className="text-lg font-bold">{config.num_plantas * config.producao_por_planta_g}g</div>
              <div className="text-xs text-muted-foreground">rendimento total</div>
            </div>
            <div className="p-3 bg-muted rounded-lg">
              <div className="text-lg font-bold">{Math.round((config.num_plantas * config.producao_por_planta_g) / totalDuration * 365)}g</div>
              <div className="text-xs text-muted-foreground">produção anual</div>
            </div>
          </div>

          {/* Validação */}
          {validation.warnings.length > 0 && (
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <AlertTriangle className="h-4 w-4 text-yellow-500" />
                <span className="text-sm font-medium">Avisos de Configuração</span>
              </div>
              {validation.warnings.map((warning, index) => (
                <div key={index} className="text-xs text-yellow-600 bg-yellow-50 p-2 rounded">
                  {warning}
                </div>
              ))}
            </div>
          )}

          {validation.valid && validation.warnings.length === 0 && (
            <div className="flex items-center gap-2 text-green-600">
              <CheckCircle className="h-4 w-4" />
              <span className="text-sm">Configuração válida</span>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
