"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Slider } from "@/components/ui/slider"
import { Badge } from "@/components/ui/badge"
import { 
  Lightbulb, 
  Calculator, 
  Zap, 
  Ruler, 
  Target, 
  AlertTriangle,
  CheckCircle,
  Info
} from "lucide-react"

// Dados das fases de cultivo
const fasesData = {
  "Mudas / Clones": {
    ppfd_min: 200,
    ppfd_max: 400,
    fotoperiodo_sugerido: 18
  },
  "Vegetativo": {
    ppfd_min: 400,
    ppfd_max: 600,
    fotoperiodo_sugerido: 18
  },
  "Floração": {
    ppfd_min: 600,
    ppfd_max: 1000,
    fotoperiodo_sugerido: 12
  }
}

// Dados de eficiência por tipo de iluminação
const eficienciaData = {
  "LED de Alta Eficiência (Quantum Board/Bar)": 2.7,
  "LED Padrão / COB / Painel Comum": 1.9,
  "Lâmpada HPS (Sódio de Alta Pressão)": 1.7
}

// Tabela de altura recomendada por potência e fase
const alturaPorPotenciaData = {
  100: { "Mudas / Clones": [40, 60], "Vegetativo": [20, 40], "Floração": [20, 30] },
  200: { "Mudas / Clones": [50, 70], "Vegetativo": [30, 50], "Floração": [25, 40] },
  400: { "Mudas / Clones": [70, 90], "Vegetativo": [50, 70], "Floração": [35, 55] },
  600: { "Mudas / Clones": [95, 105], "Vegetativo": [75, 95], "Floração": [45, 75] },
  800: { "Mudas / Clones": [105, 120], "Vegetativo": [80, 105], "Floração": [50, 85] },
  1000: { "Mudas / Clones": [115, 130], "Vegetativo": [90, 115], "Floração": [55, 90] }
}

interface CalculadoraPPFDProps {
  className?: string
}

export function CalculadoraPPFD({ className }: CalculadoraPPFDProps) {
  const [largura, setLargura] = useState(1.0)
  const [profundidade, setProfundidade] = useState(1.0)
  const [fase, setFase] = useState("Vegetativo")
  const [tipoLuz, setTipoLuz] = useState("LED de Alta Eficiência (Quantum Board/Bar)")
  const [fotoperiodo, setFotoperiodo] = useState(18)
  const [resultado, setResultado] = useState<any>(null)

  const calcularIluminacao = () => {
    // Validação
    if (largura <= 0 || profundidade <= 0) {
      alert("❌ Erro: A largura e a profundidade devem ser maiores que zero.")
      return
    }

    // Cálculos principais
    const areaM2 = largura * profundidade
    const dadosFase = fasesData[fase as keyof typeof fasesData]
    const ppfdMin = dadosFase.ppfd_min
    const ppfdMax = dadosFase.ppfd_max
    const ppfdMedioAlvo = (ppfdMin + ppfdMax) / 2
    const eficiencia = eficienciaData[tipoLuz as keyof typeof eficienciaData]

    // 1. PPF Total Necessário
    const ppfTotalNecessario = ppfdMedioAlvo * areaM2

    // 2. Potência Elétrica Estimada
    const potenciaWatts = ppfTotalNecessario / eficiencia

    // 3. DLI (Integral de Luz Diária)
    const dli = (ppfdMedioAlvo * fotoperiodo * 3600) / 1_000_000

    // 4. Determinar Altura Recomendada
    const potenciasDisponiveis = Object.keys(alturaPorPotenciaData).map(Number).sort((a, b) => a - b)
    let potenciaAdequada = 0
    for (const p of potenciasDisponiveis) {
      if (p >= potenciaWatts) {
        potenciaAdequada = p
        break
      }
    }

    let alturaStr = "Não encontrado na tabela (potência muito alta ou baixa)."
    if (potenciaAdequada > 0) {
      const alturas = alturaPorPotenciaData[potenciaAdequada as keyof typeof alturaPorPotenciaData][fase as keyof typeof fasesData]
      alturaStr = `${alturas[0]} a ${alturas[1]} cm do topo das plantas`
    } else if (potenciaWatts > Math.max(...potenciasDisponiveis)) {
      alturaStr = `Acima de ${Math.max(...potenciasDisponiveis)}W. Considere usar múltiplas luminárias.`
    }

    setResultado({
      areaM2,
      largura,
      profundidade,
      fase,
      ppfdMin,
      ppfdMax,
      ppfdMedioAlvo,
      dli,
      ppfTotalNecessario,
      eficiencia,
      potenciaWatts,
      potenciaAdequada,
      alturaStr,
      tipoLuz
    })
  }

  const handleFaseChange = (novaFase: string) => {
    setFase(novaFase)
    const fotoperiodoSugerido = fasesData[novaFase as keyof typeof fasesData].fotoperiodo_sugerido
    setFotoperiodo(fotoperiodoSugerido)
  }

  return (
    <div className={`space-y-6 ${className}`}>
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Calculadora PPFD</h1>
        <p className="text-gray-600">Calcule a iluminação ideal para seu cultivo indoor</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Formulário */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calculator className="h-5 w-5" />
              Parâmetros do Cultivo
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="largura">Largura da Tenda (m)</Label>
                <Input
                  id="largura"
                  type="number"
                  step="0.1"
                  min="0.1"
                  value={largura}
                  onChange={(e) => setLargura(parseFloat(e.target.value) || 0)}
                  className="mt-1"
                />
              </div>
              <div>
                <Label htmlFor="profundidade">Profundidade da Tenda (m)</Label>
                <Input
                  id="profundidade"
                  type="number"
                  step="0.1"
                  min="0.1"
                  value={profundidade}
                  onChange={(e) => setProfundidade(parseFloat(e.target.value) || 0)}
                  className="mt-1"
                />
              </div>
            </div>

            <div>
              <Label htmlFor="fase">Fase de Cultivo</Label>
              <Select value={fase} onValueChange={handleFaseChange}>
                <SelectTrigger className="mt-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Object.keys(fasesData).map((faseKey) => (
                    <SelectItem key={faseKey} value={faseKey}>
                      {faseKey}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="tipoLuz">Tipo de Iluminação</Label>
              <Select value={tipoLuz} onValueChange={setTipoLuz}>
                <SelectTrigger className="mt-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Object.keys(eficienciaData).map((tipo) => (
                    <SelectItem key={tipo} value={tipo}>
                      {tipo}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>Horas de Luz por Dia: {fotoperiodo}h</Label>
              <Slider
                value={[fotoperiodo]}
                onValueChange={(value) => setFotoperiodo(value[0])}
                min={1}
                max={24}
                step={1}
                className="mt-2"
              />
            </div>

            <Button 
              onClick={calcularIluminacao}
              className="w-full"
              size="lg"
            >
              <Zap className="h-4 w-4 mr-2" />
              Calcular Iluminação Ideal
            </Button>
          </CardContent>
        </Card>

        {/* Resultados */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="h-5 w-5" />
              Resultado da Análise
            </CardTitle>
          </CardHeader>
          <CardContent>
            {resultado ? (
              <div className="space-y-4">
                <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                  <div className="flex items-center gap-2 mb-2">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    <span className="font-semibold text-green-800">Informações do Cultivo</span>
                  </div>
                  <p className="text-sm text-green-700">
                    Área: <strong>{resultado.areaM2.toFixed(2)} m²</strong> ({resultado.largura}m x {resultado.profundidade}m)
                  </p>
                  <p className="text-sm text-green-700">
                    Fase: <strong>{resultado.fase}</strong>
                  </p>
                </div>

                <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                  <div className="flex items-center gap-2 mb-2">
                    <Target className="h-4 w-4 text-blue-600" />
                    <span className="font-semibold text-blue-800">Parâmetros Alvo</span>
                  </div>
                  <p className="text-sm text-blue-700">
                    PPFD: <strong>{resultado.ppfdMin}-{resultado.ppfdMax} µmol/m²/s</strong>
                  </p>
                  <p className="text-sm text-blue-700">
                    DLI: <strong>{resultado.dli.toFixed(2)} mol/m²/dia</strong>
                  </p>
                  <p className="text-sm text-blue-700">
                    PPF Total: <strong>{resultado.ppfTotalNecessario.toFixed(0)} µmol/s</strong>
                  </p>
                </div>

                <div className="bg-orange-50 p-4 rounded-lg border border-orange-200">
                  <div className="flex items-center gap-2 mb-2">
                    <Zap className="h-4 w-4 text-orange-600" />
                    <span className="font-semibold text-orange-800">Recomendação de Equipamento</span>
                  </div>
                  <p className="text-sm text-orange-700">
                    Eficiência: <strong>{resultado.eficiencia.toFixed(2)} µmol/J</strong>
                  </p>
                  <p className="text-sm text-orange-700">
                    Potência: <strong>{resultado.potenciaWatts.toFixed(0)} Watts</strong>
                  </p>
                </div>

                <div className="bg-purple-50 p-4 rounded-lg border border-purple-200">
                  <div className="flex items-center gap-2 mb-2">
                    <Ruler className="h-4 w-4 text-purple-600" />
                    <span className="font-semibold text-purple-800">Altura Recomendada</span>
                  </div>
                  <p className="text-sm text-purple-700">
                    {resultado.alturaStr}
                  </p>
                </div>

                <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200">
                  <div className="flex items-center gap-2 mb-2">
                    <AlertTriangle className="h-4 w-4 text-yellow-600" />
                    <span className="font-semibold text-yellow-800">Aviso Importante</span>
                  </div>
                  <p className="text-xs text-yellow-700">
                    Este é um cálculo de referência. A qualidade da luminária, a refletividade da tenda e a genética da planta influenciam no resultado real. Sempre observe suas plantas!
                  </p>
                </div>
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                <Lightbulb className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                <p>Preencha os parâmetros e clique em "Calcular" para ver os resultados</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Informações Adicionais */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Info className="h-5 w-5" />
            Sobre PPFD e DLI
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <h4 className="font-semibold mb-2">PPFD (Photosynthetic Photon Flux Density)</h4>
              <p className="text-sm text-gray-600">
                Mede a quantidade de fótons fotossinteticamente ativos que atingem uma área específica por segundo. 
                Unidade: µmol/m²/s
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-2">DLI (Daily Light Integral)</h4>
              <p className="text-sm text-gray-600">
                Mede a quantidade total de luz recebida por dia. 
                Unidade: mol/m²/dia
              </p>
            </div>
          </div>
          
          <div className="bg-gray-50 p-4 rounded-lg">
            <h4 className="font-semibold mb-2">Faixas Recomendadas por Fase:</h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
              {Object.entries(fasesData).map(([fase, dados]) => (
                <div key={fase} className="text-center">
                  <Badge variant="outline" className="mb-1">{fase}</Badge>
                  <p className="text-gray-600">
                    PPFD: {dados.ppfd_min}-{dados.ppfd_max} µmol/m²/s
                  </p>
                  <p className="text-gray-600">
                    Fotoperíodo: {dados.fotoperiodo_sugerido}h
                  </p>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
} 