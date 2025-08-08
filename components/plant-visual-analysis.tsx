"use client"

import { useState, useCallback } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { 
  Camera, 
  Upload, 
  Eye, 
  Loader2,
  CheckCircle,
  AlertTriangle,
  Info,
  Zap,
  FileImage,
  X
} from "lucide-react"
import { toast } from "sonner"
import { GeminiService } from "@/lib/gemini-service"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

interface PlantVisualAnalysisProps {
  cultivations: any[]
  sensorData?: Record<string, any[]>
}

interface AnalysisResult {
  analysis: string
  recommendations: string[]
  anomalies: Array<{
    parameter: string
    severity: 'low' | 'medium' | 'high' | 'critical'
    description: string
    recommendation: string
  }>
  timestamp: string
}

const severityColors = {
  low: "bg-blue-100 text-blue-800 border-blue-200",
  medium: "bg-yellow-100 text-yellow-800 border-yellow-200", 
  high: "bg-orange-100 text-orange-800 border-orange-200",
  critical: "bg-red-100 text-red-800 border-red-200",
}

const severityIcons = {
  low: Info,
  medium: AlertTriangle,
  high: AlertTriangle,
  critical: Zap,
}

export function PlantVisualAnalysis({ cultivations, sensorData = {} }: PlantVisualAnalysisProps) {
  const [selectedImage, setSelectedImage] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const [selectedCultivation, setSelectedCultivation] = useState<string>("")
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null)

  // Converter imagem para base64
  const convertToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.readAsDataURL(file)
      reader.onload = () => {
        const result = reader.result as string
        // Remover o prefixo data:image/...;base64,
        const base64 = result.split(',')[1]
        resolve(base64)
      }
      reader.onerror = error => reject(error)
    })
  }

  // Lidar com seleção de imagem
  const handleImageSelect = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      // Validar tipo de arquivo
      if (!file.type.startsWith('image/')) {
        toast.error('Por favor, selecione apenas arquivos de imagem')
        return
      }

      // Validar tamanho (máximo 5MB)
      if (file.size > 5 * 1024 * 1024) {
        toast.error('Imagem muito grande. Máximo 5MB permitido')
        return
      }

      setSelectedImage(file)
      
      // Criar preview
      const reader = new FileReader()
      reader.onload = (e) => {
        setImagePreview(e.target?.result as string)
      }
      reader.readAsDataURL(file)
    }
  }, [])

  // Remover imagem selecionada
  const removeImage = () => {
    setSelectedImage(null)
    setImagePreview(null)
    setAnalysisResult(null)
  }

  // Executar análise visual
  const runVisualAnalysis = async () => {
    if (!selectedImage || !selectedCultivation) {
      toast.error('Selecione uma imagem e um cultivo para análise')
      return
    }

    setIsAnalyzing(true)
    setAnalysisResult(null)

    try {
      // Converter imagem para base64
      const imageBase64 = await convertToBase64(selectedImage)
      
      // Buscar cultivo selecionado
      const cultivation = cultivations.find(c => c.id === selectedCultivation)
      if (!cultivation) {
        throw new Error('Cultivo não encontrado')
      }

      // Preparar dados dos sensores do cultivo selecionado
      const cultivationSensorData = sensorData[selectedCultivation] || []
      const latestSensorData = cultivationSensorData.slice(-5) // Últimos 5 registros
      
      // Converter para formato esperado pelo Gemini
      const sensorDataFormatted = latestSensorData.flatMap((data: any) => {
        const sensors: Array<{ sensorType: string; value: number; unit: string }> = []
        if (data.ph !== undefined) sensors.push({ sensorType: "pH", value: data.ph, unit: "" })
        if (data.ec !== undefined) sensors.push({ sensorType: "EC", value: data.ec, unit: "mS/cm" })
        if (data.temperature_c !== undefined) sensors.push({ sensorType: "Temperatura", value: data.temperature_c, unit: "°C" })
        if (data.humidity_percent !== undefined) sensors.push({ sensorType: "Umidade", value: data.humidity_percent, unit: "%" })
        return sensors
      })

      // Determinar fase do cultivo
      const cultivationPhase = cultivation.status === 'active' ? 'vegetativo' : cultivation.status

      // Inicializar Gemini Service
      const apiKey = process.env.NEXT_PUBLIC_GEMINI_API_KEY
      if (!apiKey) {
        throw new Error('Chave da API Gemini não configurada')
      }

      const geminiService = new GeminiService(apiKey)
      
      // Executar análise visual
      const result = await geminiService.analyzePlantHealth(
        imageBase64,
        sensorDataFormatted.length > 0 ? sensorDataFormatted : [
          { sensorType: "pH", value: 6.0, unit: "" },
          { sensorType: "EC", value: 1.2, unit: "mS/cm" },
          { sensorType: "Temperatura", value: 24, unit: "°C" },
          { sensorType: "Umidade", value: 60, unit: "%" }
        ],
        cultivationPhase
      )

      setAnalysisResult(result)
      toast.success('Análise visual concluída com sucesso!')

    } catch (error) {
      console.error('Erro na análise visual:', error)
      toast.error(`Erro na análise: ${error instanceof Error ? error.message : 'Erro desconhecido'}`)
    } finally {
      setIsAnalyzing(false)
    }
  }

  return (
    <Card className="shadow-sm">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg font-semibold">
          <Camera className="h-5 w-5" />
          Análise Visual de Plantas
          <Badge variant="secondary" className="ml-2">
            IA + Visão
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Seleção de Cultivo */}
        <div className="space-y-2">
          <label className="text-sm font-medium">Cultivo para Análise</label>
          <Select value={selectedCultivation} onValueChange={setSelectedCultivation}>
            <SelectTrigger>
              <SelectValue placeholder="Selecione um cultivo ativo" />
            </SelectTrigger>
            <SelectContent>
              {cultivations
                .filter(c => c.status === 'active')
                .map(cultivation => (
                  <SelectItem key={cultivation.id} value={cultivation.id}>
                    {cultivation.name} - {cultivation.seedStrain}
                  </SelectItem>
                ))}
            </SelectContent>
          </Select>
        </div>

        {/* Upload de Imagem */}
        <div className="space-y-4">
          <div className="text-sm font-medium">Foto da Planta</div>
          
          {!imagePreview ? (
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-gray-400 transition-colors">
              <FileImage className="h-12 w-12 mx-auto mb-4 text-gray-400" />
              <div className="space-y-2">
                <p className="text-sm text-gray-600">
                  Clique para selecionar uma foto da planta
                </p>
                <p className="text-xs text-gray-500">
                  Formatos: JPG, PNG, WEBP (máx. 5MB)
                </p>
              </div>
              <input
                type="file"
                accept="image/*"
                onChange={handleImageSelect}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              />
            </div>
          ) : (
            <div className="relative">
              <img
                src={imagePreview}
                alt="Preview da planta"
                className="w-full max-w-md mx-auto rounded-lg shadow-md"
              />
              <Button
                size="icon"
                variant="destructive"
                className="absolute top-2 right-2"
                onClick={removeImage}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          )}
        </div>

        {/* Botão de Análise */}
        <Button
          onClick={runVisualAnalysis}
          disabled={!selectedImage || !selectedCultivation || isAnalyzing}
          className="w-full"
          size="lg"
        >
          {isAnalyzing ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Analisando com IA...
            </>
          ) : (
            <>
              <Eye className="h-4 w-4 mr-2" />
              Analisar Planta com IA
            </>
          )}
        </Button>

        {/* Resultados da Análise */}
        {analysisResult && (
          <div className="space-y-4 pt-4 border-t">
            <h3 className="font-semibold flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-green-600" />
              Resultado da Análise Visual
            </h3>

            {/* Análise Geral */}
            <Alert className="border-green-200 bg-green-50">
              <Eye className="h-4 w-4" />
              <AlertDescription className="text-sm">
                <strong>Análise:</strong> {analysisResult.analysis}
              </AlertDescription>
            </Alert>

            {/* Recomendações */}
            {analysisResult.recommendations.length > 0 && (
              <div className="space-y-2">
                <h4 className="font-medium text-sm">Recomendações:</h4>
                <ul className="space-y-1">
                  {analysisResult.recommendations.map((rec, index) => (
                    <li key={index} className="text-sm flex items-start gap-2">
                      <CheckCircle className="h-3 w-3 mt-0.5 text-green-600 flex-shrink-0" />
                      {rec}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Anomalias Detectadas */}
            {analysisResult.anomalies.length > 0 && (
              <div className="space-y-3">
                <h4 className="font-medium text-sm">Problemas Detectados:</h4>
                {analysisResult.anomalies.map((anomaly, index) => {
                  const SeverityIcon = severityIcons[anomaly.severity]
                  return (
                    <Alert key={index} className={`border-l-4 ${severityColors[anomaly.severity]} p-3`}>
                      <SeverityIcon className="h-4 w-4" />
                      <AlertDescription className="space-y-1">
                        <div className="font-medium text-sm">{anomaly.parameter}</div>
                        <div className="text-xs">{anomaly.description}</div>
                        <div className="text-xs mt-2 p-2 bg-blue-50 rounded border-l-2 border-blue-200">
                          <span className="font-medium text-blue-800">Solução:</span>
                          <div className="text-blue-700 mt-1">{anomaly.recommendation}</div>
                        </div>
                      </AlertDescription>
                    </Alert>
                  )
                })}
              </div>
            )}

            <div className="text-xs text-gray-500 text-center pt-2 border-t">
              Análise realizada em {new Date(analysisResult.timestamp).toLocaleString('pt-BR')}
            </div>
          </div>
        )}

        {/* Informações */}
        <Alert className="border-blue-200 bg-blue-50">
          <Info className="h-4 w-4" />
          <AlertDescription className="text-xs">
            <strong>Dica:</strong> Para melhores resultados, tire fotos com boa iluminação, 
            mostrando folhas e estrutura geral da planta. A IA analisará sinais visuais 
            de saúde, deficiências nutricionais, pragas e correlacionará com dados dos sensores.
          </AlertDescription>
        </Alert>
      </CardContent>
    </Card>
  )
}
