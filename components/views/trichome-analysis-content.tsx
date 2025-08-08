"use client"

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { 
  Microscope, 
  Upload, 
  Camera, 
  Target, 
  Clock, 
  Calendar,
  TrendingUp,
  Zap,
  Scale,
  Moon,
  CheckCircle,
  AlertTriangle,
  Info,
  Eye,
  Sparkles,
  Brain,
  Clock4,
  Gauge,
  Loader2
} from "lucide-react"
import { TrichomeAnalyzer } from "@/components/cultivation/trichome-analyzer"

export default function TrichomeAnalysisContent() {
  const [activeTab, setActiveTab] = useState("analyze")
  const [isAnalyzing, setIsAnalyzing] = useState(false)

  const handleAnalysisStart = () => {
    setIsAnalyzing(true)
  }

  const handleAnalysisComplete = (analysis: any) => {
    setIsAnalyzing(false)
    console.log('Análise concluída:', analysis)
  }

  return (
    <div className="max-w-7xl mx-auto space-y-6 relative">
      {/* Global Loading Overlay */}
      {isAnalyzing && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center">
          <div className="bg-white rounded-2xl p-8 max-w-md mx-4 text-center space-y-6">
            <div className="relative">
              <div className="w-20 h-20 bg-emerald-100 rounded-full flex items-center justify-center mx-auto relative">
                <Microscope className="h-10 w-10 text-emerald-600 animate-pulse" />
                <div className="absolute inset-0 border-4 border-emerald-200 rounded-full animate-ping"></div>
                <div className="absolute inset-2 border-2 border-emerald-300 rounded-full animate-pulse"></div>
              </div>
            </div>
            
            <div>
              <h3 className="text-xl font-bold text-gray-800 mb-2">
                🤖 IA Analisando Tricomas
              </h3>
              <p className="text-gray-600">
                Aguarde enquanto nosso modelo avançado processa sua imagem...
              </p>
            </div>

            <div className="flex items-center justify-center gap-2">
              <div className="flex space-x-1">
                <div className="w-2 h-2 bg-emerald-500 rounded-full animate-bounce"></div>
                <div className="w-2 h-2 bg-emerald-500 rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></div>
                <div className="w-2 h-2 bg-emerald-500 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
              </div>
            </div>

            <div className="bg-emerald-50 rounded-lg p-4">
              <p className="text-sm text-emerald-700">
                <strong>Modelo:</strong> IA VISION<br/>
                <strong>Precisão:</strong> 85-95%<br/>
                <strong>Tempo médio:</strong> 10-15 segundos
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Main Content */}
      {/* Header Hero Section */}
      <div className="bg-gradient-to-r from-emerald-600 via-green-600 to-teal-600 rounded-2xl p-8 text-white relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-black/20 to-transparent" />
        <div className="relative z-10">
          <div className="flex items-center gap-4 mb-4">
            <div className="p-3 bg-white/20 rounded-xl backdrop-blur-sm">
              <Microscope className="h-8 w-8" />
            </div>
            <div>
              <h1 className="text-3xl font-bold mb-2">Análise de Tricomas por IA</h1>
              <p className="text-emerald-100 text-lg">
                Determine o momento ideal de colheita com precisão
              </p>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
              <div className="flex items-center gap-3 mb-2">
                <Brain className="h-5 w-5 text-emerald-200" />
                <span className="font-semibold">IA Avançada</span>
              </div>
              <p className="text-sm text-emerald-100">
                Análise automática com modelos IA VISION
              </p>
            </div>
            
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
              <div className="flex items-center gap-3 mb-2">
                <Target className="h-5 w-5 text-emerald-200" />
                <span className="font-semibold">Precisão</span>
              </div>
              <p className="text-sm text-emerald-100">
                Detecção de tricomas clear, cloudy e amber
              </p>
            </div>
            
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
              <div className="flex items-center gap-3 mb-2">
                <Clock4 className="h-5 w-5 text-emerald-200" />
                <span className="font-semibold">Timing Perfeito</span>
              </div>
              <p className="text-sm text-emerald-100">
                Recomendação personalizada por efeito desejado
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Features Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="border-emerald-200 bg-gradient-to-br from-emerald-50 to-green-50">
          <CardContent className="p-6">
            <div className="flex items-center gap-3 mb-3">
              <div className="p-2 bg-emerald-500 text-white rounded-lg">
                <Eye className="h-4 w-4" />
              </div>
              <span className="font-semibold text-gray-800">Detecção Visual</span>
            </div>
            <p className="text-sm text-gray-600">
              Identifica automaticamente tricomas em suas fotos macro
            </p>
          </CardContent>
        </Card>

        <Card className="border-blue-200 bg-gradient-to-br from-blue-50 to-indigo-50">
          <CardContent className="p-6">
            <div className="flex items-center gap-3 mb-3">
              <div className="p-2 bg-blue-500 text-white rounded-lg">
                <Gauge className="h-4 w-4" />
              </div>
              <span className="font-semibold text-gray-800">Análise Precisa</span>
            </div>
            <p className="text-sm text-gray-600">
              Calcula percentuais de maturação com precisão
            </p>
          </CardContent>
        </Card>

        <Card className="border-purple-200 bg-gradient-to-br from-purple-50 to-violet-50">
          <CardContent className="p-6">
            <div className="flex items-center gap-3 mb-3">
              <div className="p-2 bg-purple-500 text-white rounded-lg">
                <Sparkles className="h-4 w-4" />
              </div>
              <span className="font-semibold text-gray-800">Efeitos Personalizados</span>
            </div>
            <p className="text-sm text-gray-600">
              Recomendações baseadas no efeito desejado
            </p>
          </CardContent>
        </Card>

        <Card className="border-orange-200 bg-gradient-to-br from-orange-50 to-red-50">
          <CardContent className="p-6">
            <div className="flex items-center gap-3 mb-3">
              <div className="p-2 bg-orange-500 text-white rounded-lg">
                <Calendar className="h-4 w-4" />
              </div>
              <span className="font-semibold text-gray-800">Janela de Colheita</span>
            </div>
            <p className="text-sm text-gray-600">
              Período ideal e máximo para colheita
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <div className="flex items-center justify-center">
          <TabsList className="grid grid-cols-3 w-full max-w-md">
            <TabsTrigger value="analyze" className="flex items-center gap-2">
              <Upload className="h-4 w-4" />
              Analisar
            </TabsTrigger>
            <TabsTrigger value="guide" className="flex items-center gap-2">
              <Info className="h-4 w-4" />
              Guia
            </TabsTrigger>
            <TabsTrigger value="science" className="flex items-center gap-2">
              <Microscope className="h-4 w-4" />
              Ciência
            </TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="analyze" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Camera className="h-5 w-5 text-emerald-600" />
                Análise de Tricomas
              </CardTitle>
            </CardHeader>
            <CardContent>
              <TrichomeAnalyzer 
                cultivationId="trichome-analysis-main"
                onAnalysisStart={handleAnalysisStart}
                onAnalysisComplete={handleAnalysisComplete}
              />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="guide" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Camera className="h-5 w-5 text-blue-600" />
                  Como Fotografar
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="flex items-start gap-3">
                    <div className="w-6 h-6 bg-blue-500 text-white rounded-full flex items-center justify-center text-sm font-bold">1</div>
                    <div>
                      <h4 className="font-semibold">Use macro ou lupa</h4>
                      <p className="text-sm text-gray-600">Tricomas devem estar visíveis e nítidos</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-3">
                    <div className="w-6 h-6 bg-blue-500 text-white rounded-full flex items-center justify-center text-sm font-bold">2</div>
                    <div>
                      <h4 className="font-semibold">Boa iluminação</h4>
                      <p className="text-sm text-gray-600">Luz natural ou LED branco</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-3">
                    <div className="w-6 h-6 bg-blue-500 text-white rounded-full flex items-center justify-center text-sm font-bold">3</div>
                    <div>
                      <h4 className="font-semibold">Foque nos tricomas</h4>
                      <p className="text-sm text-gray-600">Evite folhas, foque apenas nas flores</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Target className="h-5 w-5 text-emerald-600" />
                  Tipos de Tricomas
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                    <div className="w-4 h-4 border-2 border-gray-400 rounded-full"></div>
                    <div>
                      <span className="font-semibold">Clear (Transparente)</span>
                      <p className="text-sm text-gray-600">Imaturo, baixo THC</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-3 p-3 bg-blue-50 rounded-lg">
                    <div className="w-4 h-4 bg-white border-2 border-blue-400 rounded-full"></div>
                    <div>
                      <span className="font-semibold">Cloudy (Leitoso)</span>
                      <p className="text-sm text-gray-600">Pico THC, ideal para maioria</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-3 p-3 bg-amber-50 rounded-lg">
                    <div className="w-4 h-4 bg-amber-400 rounded-full"></div>
                    <div>
                      <span className="font-semibold">Amber (Âmbar)</span>
                      <p className="text-sm text-gray-600">THC → CBN, efeito sedativo</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-purple-600" />
                Perfis de Efeito
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="p-4 border border-green-200 rounded-lg bg-green-50">
                  <div className="flex items-center gap-2 mb-2">
                    <Zap className="h-5 w-5 text-green-600" />
                    <span className="font-semibold text-green-800">Energético</span>
                  </div>
                  <p className="text-sm text-green-700 mb-2">Para atividades diurnas</p>
                  <div className="text-xs text-green-600">
                    <p>• Mais clear e cloudy</p>
                    <p>• Menos amber (&lt;20%)</p>
                  </div>
                </div>
                
                <div className="p-4 border border-blue-200 rounded-lg bg-blue-50">
                  <div className="flex items-center gap-2 mb-2">
                    <Scale className="h-5 w-5 text-blue-600" />
                    <span className="font-semibold text-blue-800">Balanceado</span>
                  </div>
                  <p className="text-sm text-blue-700 mb-2">Uso geral, versátil</p>
                  <div className="text-xs text-blue-600">
                    <p>• Principalmente cloudy</p>
                    <p>• Amber moderado (15-30%)</p>
                  </div>
                </div>
                
                <div className="p-4 border border-purple-200 rounded-lg bg-purple-50">
                  <div className="flex items-center gap-2 mb-2">
                    <Moon className="h-5 w-5 text-purple-600" />
                    <span className="font-semibold text-purple-800">Sedativo</span>
                  </div>
                  <p className="text-sm text-purple-700 mb-2">Relaxamento noturno</p>
                  <div className="text-xs text-purple-600">
                    <p>• Mais amber (30-50%)</p>
                    <p>• Cloudy + amber dominantes</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="science" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Brain className="h-5 w-5 text-indigo-600" />
                  Como Funciona a IA
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div>
                    <h4 className="font-semibold mb-1">Modelo Moonshot Kimi VL</h4>
                    <p className="text-sm text-gray-600">
                      IA especializada em análise visual que identifica e classifica tricomas automaticamente
                    </p>
                  </div>
                  
                  <div>
                    <h4 className="font-semibold mb-1">Detecção por Região</h4>
                    <p className="text-sm text-gray-600">
                      Mapeia diferentes áreas da imagem com níveis de confiança específicos
                    </p>
                  </div>
                  
                  <div>
                    <h4 className="font-semibold mb-1">Análise Quantitativa</h4>
                    <p className="text-sm text-gray-600">
                      Conta tricomas individuais e calcula percentuais de maturação
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5 text-emerald-600" />
                  Algoritmo de Recomendação
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div>
                    <h4 className="font-semibold mb-1">Perfis de Efeito</h4>
                    <p className="text-sm text-gray-600">
                      Cada perfil tem targets específicos de percentuais para tricomas
                    </p>
                  </div>
                  
                  <div>
                    <h4 className="font-semibold mb-1">Janela de Colheita</h4>
                    <p className="text-sm text-gray-600">
                      Calcula dias ideais baseado na taxa de maturação observada
                    </p>
                  </div>
                  
                  <div>
                    <h4 className="font-semibold mb-1">Urgência Dinâmica</h4>
                    <p className="text-sm text-gray-600">
                      Determina prioridade de colheita baseada em degradação de THC
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <Alert>
            <Info className="h-4 w-4" />
            <AlertDescription>
              <strong>Nota Científica:</strong> Esta análise é uma ferramenta auxiliar. 
              Sempre combine com observação visual direta e experiência de cultivo para decisões finais.
            </AlertDescription>
          </Alert>
        </TabsContent>
      </Tabs>
    </div>
  )
}
