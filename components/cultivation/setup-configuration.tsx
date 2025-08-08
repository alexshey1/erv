"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { 
  Settings, 
  Lightbulb, 
  Home, 
  Fan, 
  Zap,
  Clock,
  Leaf,
  Flower,
  Droplet,
  DollarSign,
  Calculator,
  Save
} from "lucide-react"

interface SetupConfigurationProps {
  cultivation: {
    id: string
    area_m2?: number
    custo_equip_iluminacao?: number
    custo_tenda_estrutura?: number
    custo_ventilacao_exaustao?: number
    custo_outros_equipamentos?: number
    potencia_watts?: number
    producao_por_planta_g?: number
    dias_vegetativo?: number
    dias_racao?: number
    dias_secagem_cura?: number
    horas_luz_flor?: number
    horas_luz_veg?: number
    preco_kwh?: number
    custo_sementes_clones?: number
    custo_substrato?: number
    custo_nutrientes?: number
    custos_operacionais_misc?: number
    num_plantas?: number
  }
  onSave?: (data: any) => void
}

export function SetupConfiguration({ cultivation, onSave }: SetupConfigurationProps) {
  const [config, setConfig] = useState({
    // Setup
    area_m2: cultivation.area_m2 || 2.25,
    potencia_watts: cultivation.potencia_watts || 480,
    num_plantas: cultivation.num_plantas || 6,
    
    // Custos de Equipamentos
    custo_equip_iluminacao: cultivation.custo_equip_iluminacao || 200,
    custo_tenda_estrutura: cultivation.custo_tenda_estrutura || 150,
    custo_ventilacao_exaustao: cultivation.custo_ventilacao_exaustao || 800,
    custo_outros_equipamentos: cultivation.custo_outros_equipamentos || 500,
    
    // Parâmetros do Ciclo
    dias_vegetativo: cultivation.dias_vegetativo || 60,
    dias_racao: cultivation.dias_racao || 70,
    dias_secagem_cura: cultivation.dias_secagem_cura || 20,
    horas_luz_flor: cultivation.horas_luz_flor || 12,
    horas_luz_veg: (cultivation as any).horas_luz_veg || 18,
    
    // Custos Operacionais
    preco_kwh: cultivation.preco_kwh || 0.95,
    custo_sementes_clones: cultivation.custo_sementes_clones || 50,
    custo_substrato: cultivation.custo_substrato || 120,
    custo_nutrientes: cultivation.custo_nutrientes || 350,
    custos_operacionais_misc: cultivation.custos_operacionais_misc || 10,
    
    // Produção
    producao_por_planta_g: cultivation.producao_por_planta_g || 80,
  })

  const [calculations, setCalculations] = useState({
    totalSetupCost: 0,
    eficienciaWm2: 0,
    consumoTotal: 0,
    custoEnergia: 0,
    totalOperacional: 0,
    producaoTotal: 0,
    eficienciaGporW: 0,
    eficienciaGporM2: 0,
    eficienciaTemporal: 0,
  })

  // Calcular métricas em tempo real
  useEffect(() => {
    const {
      area_m2,
      potencia_watts,
      custo_equip_iluminacao,
      custo_tenda_estrutura,
      custo_ventilacao_exaustao,
      custo_outros_equipamentos,
      dias_vegetativo,
      dias_racao,
      horas_luz_flor,
      horas_luz_veg,
      preco_kwh,
      custo_sementes_clones,
      custo_substrato,
      custo_nutrientes,
      custos_operacionais_misc,
      producao_por_planta_g,
      num_plantas,
    } = config

    // Cálculos de setup
    const totalSetupCost = custo_equip_iluminacao + custo_tenda_estrutura + custo_ventilacao_exaustao + custo_outros_equipamentos
    const eficienciaWm2 = potencia_watts / area_m2

    // Cálculos de energia
    const consumoKwhVeg = (potencia_watts / 1000) * (horas_luz_veg || 18) * dias_vegetativo
    const consumoKwhFlor = (potencia_watts / 1000) * horas_luz_flor * dias_racao
    const consumoTotal = consumoKwhVeg + consumoKwhFlor // Apenas veg e floração consomem energia
    const custoEnergia = consumoTotal * preco_kwh

    // Cálculos operacionais
    const totalOperacional = custoEnergia + custo_sementes_clones + custo_substrato + custo_nutrientes + custos_operacionais_misc

    // Cálculos de eficiência
    const producaoTotal = producao_por_planta_g * (num_plantas || 0)
    const eficienciaGporW = potencia_watts ? producaoTotal / potencia_watts : 0
    const eficienciaGporM2 = area_m2 ? producaoTotal / area_m2 : 0
    const duracaoTotal = dias_vegetativo + dias_racao + (cultivation.dias_secagem_cura || 20)
    const diasComLuz = dias_vegetativo + dias_racao // Apenas veg e floração usam luz
    const eficienciaTemporal = diasComLuz ? producaoTotal / diasComLuz : 0 // g/dia com luz

    setCalculations({
      totalSetupCost,
      eficienciaWm2,
      consumoTotal,
      custoEnergia,
      totalOperacional,
      producaoTotal,
      eficienciaGporW,
      eficienciaGporM2,
      eficienciaTemporal,
    })
  }, [config])

  const handleInputChange = (field: string, value: string) => {
    const numValue = parseFloat(value) || 0
    setConfig(prev => ({ ...prev, [field]: numValue }))
  }

  const handleSave = () => {
    if (onSave) {
      onSave(config)
    }
  }

  const formatCurrency = (value: number) =>
    new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(value)

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold flex items-center gap-2">
          <Settings className="h-6 w-6 text-green-600" />
          Configuração do Setup
        </h2>
        <Button onClick={handleSave} className="flex items-center gap-2">
          <Save className="h-4 w-4" />
          Salvar Configuração
        </Button>
      </div>

      <Tabs defaultValue="setup" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="setup" className="flex items-center gap-2">
            <Home className="h-4 w-4" />
            Setup
          </TabsTrigger>
          <TabsTrigger value="cycle" className="flex items-center gap-2">
            <Clock className="h-4 w-4" />
            Ciclo
          </TabsTrigger>
          <TabsTrigger value="costs" className="flex items-center gap-2">
            <DollarSign className="h-4 w-4" />
            Custos
          </TabsTrigger>
          <TabsTrigger value="results" className="flex items-center gap-2">
            <Calculator className="h-4 w-4" />
            Resultados
          </TabsTrigger>
        </TabsList>

        {/* Setup */}
        <TabsContent value="setup" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Lightbulb className="h-5 w-5 text-yellow-500" />
                  Configuração Básica
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="area_m2">Área (m²)</Label>
                  <Input
                    id="area_m2"
                    type="number"
                    step="0.01"
                    value={config.area_m2}
                    onChange={(e) => handleInputChange("area_m2", e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="potencia_watts">Potência (Watts)</Label>
                  <Input
                    id="potencia_watts"
                    type="number"
                    value={config.potencia_watts}
                    onChange={(e) => handleInputChange("potencia_watts", e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="num_plantas">Número de Plantas</Label>
                  <Input
                    id="num_plantas"
                    type="number"
                    min={1}
                    value={config.num_plantas}
                    onChange={(e) => handleInputChange("num_plantas", e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="producao_por_planta_g">Produção por Planta (g)</Label>
                  <Input
                    id="producao_por_planta_g"
                    type="number"
                    value={config.producao_por_planta_g}
                    onChange={(e) => handleInputChange("producao_por_planta_g", e.target.value)}
                  />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Fan className="h-5 w-5 text-blue-500" />
                  Custos de Equipamentos
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="custo_equip_iluminacao">Iluminação (R$)</Label>
                  <Input
                    id="custo_equip_iluminacao"
                    type="number"
                    value={config.custo_equip_iluminacao}
                    onChange={(e) => handleInputChange("custo_equip_iluminacao", e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="custo_tenda_estrutura">Tenda/Estrutura (R$)</Label>
                  <Input
                    id="custo_tenda_estrutura"
                    type="number"
                    value={config.custo_tenda_estrutura}
                    onChange={(e) => handleInputChange("custo_tenda_estrutura", e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="custo_ventilacao_exaustao">Ventilação/Exaustão (R$)</Label>
                  <Input
                    id="custo_ventilacao_exaustao"
                    type="number"
                    value={config.custo_ventilacao_exaustao}
                    onChange={(e) => handleInputChange("custo_ventilacao_exaustao", e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="custo_outros_equipamentos">Outros Equipamentos (R$)</Label>
                  <Input
                    id="custo_outros_equipamentos"
                    type="number"
                    value={config.custo_outros_equipamentos}
                    onChange={(e) => handleInputChange("custo_outros_equipamentos", e.target.value)}
                  />
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Ciclo */}
        <TabsContent value="cycle" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="h-5 w-5 text-purple-500" />
                Parâmetros do Ciclo
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="dias_vegetativo" className="flex items-center gap-2">
                      <Leaf className="h-4 w-4 text-green-500" />
                      Dias Vegetativo
                    </Label>
                    <Input
                      id="dias_vegetativo"
                      type="number"
                      value={config.dias_vegetativo}
                      onChange={(e) => handleInputChange("dias_vegetativo", e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="dias_racao" className="flex items-center gap-2">
                      <Flower className="h-4 w-4 text-purple-500" />
                      Dias Floração
                    </Label>
                    <Input
                      id="dias_racao"
                      type="number"
                      value={config.dias_racao}
                      onChange={(e) => handleInputChange("dias_racao", e.target.value)}
                    />
                  </div>
                </div>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="dias_secagem_cura" className="flex items-center gap-2">
                      <Droplet className="h-4 w-4 text-blue-500" />
                      Dias Secagem/Cura
                    </Label>
                    <Input
                      id="dias_secagem_cura"
                      type="number"
                      value={config.dias_secagem_cura}
                      onChange={(e) => handleInputChange("dias_secagem_cura", e.target.value)}
                    />
                  </div>
                  {/* Campo de horas de luz movido para a aba de Custos */}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Custos */}
        <TabsContent value="costs" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Zap className="h-5 w-5 text-yellow-500" />
                  Energia
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="horas_luz_veg">Horas de Luz (Vegetativo)</Label>
                  <Input
                    id="horas_luz_veg"
                    type="number"
                    value={config.horas_luz_veg}
                    onChange={(e) => handleInputChange("horas_luz_veg", e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="horas_luz_flor">Horas de Luz (Floração)</Label>
                  <Input
                    id="horas_luz_flor"
                    type="number"
                    value={config.horas_luz_flor}
                    onChange={(e) => handleInputChange("horas_luz_flor", e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="preco_kwh">Preço kWh (R$)</Label>
                  <Input
                    id="preco_kwh"
                    type="number"
                    step="0.01"
                    value={config.preco_kwh}
                    onChange={(e) => handleInputChange("preco_kwh", e.target.value)}
                  />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <DollarSign className="h-5 w-5 text-green-500" />
                  Custos por Ciclo
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="custo_sementes_clones">Sementes/Clones (R$)</Label>
                  <Input
                    id="custo_sementes_clones"
                    type="number"
                    value={config.custo_sementes_clones}
                    onChange={(e) => handleInputChange("custo_sementes_clones", e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="custo_substrato">Substrato (R$)</Label>
                  <Input
                    id="custo_substrato"
                    type="number"
                    value={config.custo_substrato}
                    onChange={(e) => handleInputChange("custo_substrato", e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="custo_nutrientes">Nutrientes (R$)</Label>
                  <Input
                    id="custo_nutrientes"
                    type="number"
                    value={config.custo_nutrientes}
                    onChange={(e) => handleInputChange("custo_nutrientes", e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="custos_operacionais_misc">Outros Custos (R$)</Label>
                  <Input
                    id="custos_operacionais_misc"
                    type="number"
                    value={config.custos_operacionais_misc}
                    onChange={(e) => handleInputChange("custos_operacionais_misc", e.target.value)}
                  />
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Resultados */}
        <TabsContent value="results" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Settings className="h-5 w-5 text-blue-500" />
                  Setup
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between">
                  <span>Eficiência:</span>
                  <span className="font-medium">{calculations.eficienciaWm2.toFixed(0)} W/m²</span>
                </div>
                <div className="flex justify-between">
                  <span>Total Setup:</span>
                  <span className="font-medium">{formatCurrency(calculations.totalSetupCost)}</span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <DollarSign className="h-5 w-5 text-green-500" />
                  Custos
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between">
                  <span>Energia:</span>
                  <span className="font-medium">{formatCurrency(calculations.custoEnergia)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Total Operacional:</span>
                  <span className="font-medium">{formatCurrency(calculations.totalOperacional)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Consumo:</span>
                  <span className="font-medium">{calculations.consumoTotal.toFixed(0)} kWh</span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Zap className="h-5 w-5 text-purple-500" />
                  Eficiência
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between">
                  <span>g/W:</span>
                  <span className="font-medium">{calculations.eficienciaGporW.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span>g/m²:</span>
                  <span className="font-medium">{calculations.eficienciaGporM2.toFixed(0)}</span>
                </div>
                <div className="flex justify-between">
                  <span>g/dia (com luz):</span>
                  <span className="font-medium">{calculations.eficienciaTemporal.toFixed(1)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Produção:</span>
                  <span className="font-medium">{calculations.producaoTotal}g</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
} 