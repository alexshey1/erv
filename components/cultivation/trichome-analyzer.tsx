"use client"

import { useState, useRef } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { 
  Camera, 
  Upload, 
  Eye, 
  Clock, 
  Target, 
  AlertTriangle,
  CheckCircle,
  Zap,
  Scale,
  Moon,
  Microscope,
  TrendingUp,
  Calendar,
  Info,
  RefreshCw
} from "lucide-react"
import { useTrichomeAnalysis } from "@/hooks/useTrichomeAnalysis"
import { 
  TrichomeAnalysis, 
  HarvestRecommendation,
  EFFECT_PROFILES,
  getTrichomeMaturityStage 
} from "@/types/trichome-analysis"

interface TrichomeAnalyzerProps {
  cultivationId: string
  onAnalysisComplete?: (analysis: TrichomeAnalysis) => void
  onAnalysisStart?: () => void
}

export function TrichomeAnalyzer({ cultivationId, onAnalysisComplete, onAnalysisStart }: TrichomeAnalyzerProps) {
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [selectedEffect, setSelectedEffect] = useState<'energetic' | 'balanced' | 'couch-lock'>('balanced')
  const [dragActive, setDragActive] = useState(false)

  const {
    isAnalyzing,
    isUploading,
    progress,
    error,
    errorCode,
    lastAnalysis,
    recommendation,
    analyzeImage,
    loadHistory,
    recalculateRecommendation,
    clearError,
    retryAnalysis,
    reset
  } = useTrichomeAnalysis({ cultivationId })

  const handleFileSelect = async (file: File) => {
    if (file && file.type.startsWith('image/')) {
      // Reset state antes de começar nova análise
      reset()
      
      onAnalysisStart?.() // Notificar início da análise
      const analysis = await analyzeImage(file, selectedEffect)
      if (analysis && onAnalysisComplete) {
        onAnalysisComplete(analysis)
      }
    }
  }

  const handleNewAnalysis = () => {
    reset()
    clearError()
    // Reset do input file para permitir selecionar o mesmo arquivo novamente
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      handleFileSelect(file)
    }
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    setDragActive(true)
  }

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault()
    setDragActive(false)
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setDragActive(false)
    
    const file = e.dataTransfer.files?.[0]
    if (file) {
      handleFileSelect(file)
    }
  }

  const handleEffectChange = (effect: 'energetic' | 'balanced' | 'couch-lock') => {
    setSelectedEffect(effect)
    if (lastAnalysis) {
      recalculateRecommendation(lastAnalysis, effect)
    }
  }

  // Helper para formatar datas (que podem vir como string da API)
  const formatDate = (dateValue: Date | string): string => {
    const date = typeof dateValue === 'string' ? new Date(dateValue) : dateValue
    return date.toLocaleDateString('pt-BR')
  }

  const getUrgencyColor = (urgency: string) => {
    switch (urgency) {
      case 'low': return 'bg-green-100 text-green-800 border-green-200'
      case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200'
      case 'high': return 'bg-orange-100 text-orange-800 border-orange-200'
      case 'critical': return 'bg-red-100 text-red-800 border-red-200'
      default: return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  const getReadinessIcon = (readiness: string) => {
    switch (readiness) {
      case 'too-early': return <Clock className="h-4 w-4" />
      case 'early': return <Eye className="h-4 w-4" />
      case 'optimal': return <CheckCircle className="h-4 w-4" />
      case 'late': return <AlertTriangle className="h-4 w-4" />
      case 'overripe': return <AlertTriangle className="h-4 w-4 text-red-500" />
      default: return <Target className="h-4 w-4" />
    }
  }

  const maturityStage = lastAnalysis ? getTrichomeMaturityStage(lastAnalysis) : null

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Microscope className="h-5 w-5" />
            Análise de Tricomas
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground mb-4">
            Tire uma foto macro dos tricomas para determinar o momento ideal de colheita
          </p>

          {/* Upload Area */}
          <div
            className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors cursor-pointer ${
              dragActive
                ? 'border-primary bg-primary/5'
                : 'border-muted-foreground/25 hover:border-primary/50 hover:bg-primary/5'
            } ${isAnalyzing ? 'opacity-50 pointer-events-none' : ''}`}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onClick={() => !isAnalyzing && fileInputRef.current?.click()}
          >
            {isAnalyzing ? (
              <div className="space-y-6">
                {/* Loading Header */}
                <div className="flex flex-col items-center gap-4">
                  <div className="relative">
                    <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center relative">
                      <Microscope className="h-8 w-8 text-emerald-600 animate-pulse" />
                      <div className="absolute inset-0 border-4 border-emerald-200 rounded-full animate-ping"></div>
                      <div className="absolute inset-2 border-2 border-emerald-300 rounded-full animate-pulse"></div>
                    </div>
                  </div>
                  
                  <div className="text-center">
                    <h3 className="text-lg font-semibold text-gray-800 mb-1">
                      {isUploading ? '📤 Fazendo Upload...' : '🤖 Analisando com IA...'}
                    </h3>
                    <p className="text-sm text-gray-600">
                      {isUploading 
                        ? 'Enviando imagem para o servidor' 
                        : 'Modelo Moonshot Kimi VL processando tricomas'
                      }
                    </p>
                  </div>
                </div>

                {/* Progress Bar Enhanced */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">Progresso:</span>
                    <span className="font-semibold text-emerald-600">{progress}%</span>
                  </div>
                  <Progress 
                    value={progress} 
                    className="h-3 bg-gray-100"
                  />
                  
                  {/* Progress Steps */}
                  <div className="grid grid-cols-4 gap-2 text-xs text-center">
                    <div className={`p-2 rounded-lg transition-all ${progress >= 25 ? 'bg-emerald-100 text-emerald-700' : 'bg-gray-50 text-gray-400'}`}>
                      <div className="font-semibold">Upload</div>
                      <div>Enviando</div>
                    </div>
                    <div className={`p-2 rounded-lg transition-all ${progress >= 50 ? 'bg-blue-100 text-blue-700' : 'bg-gray-50 text-gray-400'}`}>
                      <div className="font-semibold">Detecção</div>
                      <div>Tricomas</div>
                    </div>
                    <div className={`p-2 rounded-lg transition-all ${progress >= 80 ? 'bg-purple-100 text-purple-700' : 'bg-gray-50 text-gray-400'}`}>
                      <div className="font-semibold">Análise</div>
                      <div>IA</div>
                    </div>
                    <div className={`p-2 rounded-lg transition-all ${progress >= 100 ? 'bg-green-100 text-green-700' : 'bg-gray-50 text-gray-400'}`}>
                      <div className="font-semibold">Resultado</div>
                      <div>Pronto</div>
                    </div>
                  </div>
                </div>

                {/* Loading Animation */}
                <div className="flex items-center justify-center gap-2">
                  <div className="flex space-x-1">
                    <div className="w-2 h-2 bg-emerald-500 rounded-full animate-bounce"></div>
                    <div className="w-2 h-2 bg-emerald-500 rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></div>
                    <div className="w-2 h-2 bg-emerald-500 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
                  </div>
                </div>

                {/* Technical Info */}
                <div className="bg-gray-50 rounded-lg p-4 text-center">
                  <p className="text-xs text-gray-500 mb-2">
                    <strong>Processamento:</strong> {isUploading ? 'Servidor' : 'Inteligência Artificial'}
                  </p>
                  <div className="flex items-center justify-center gap-4 text-xs text-gray-400">
                    <span>🔒 Seguro</span>
                    <span>⚡ Rápido</span>
                    <span>🎯 Preciso</span>
                  </div>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="flex items-center justify-center gap-4">
                  <Camera className="h-8 w-8 text-muted-foreground" />
                  <Upload className="h-8 w-8 text-muted-foreground" />
                </div>
                <div>
                  <p className="text-lg font-medium">Envie uma foto dos tricomas</p>
                  <p className="text-sm text-muted-foreground">
                    Clique aqui, arraste e solte ou use o botão abaixo
                  </p>
                </div>
                <Button
                  onClick={(e) => {
                    e.stopPropagation(); // Evita duplo clique
                    fileInputRef.current?.click();
                  }}
                  variant="outline"
                  className="mx-auto"
                >
                  <Upload className="h-4 w-4 mr-2" />
                  Selecionar Imagem
                </Button>
              </div>
            )}
          </div>

          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleFileInputChange}
            className="hidden"
          />

          {error && (
            <Alert className="mt-4 border-amber-300 bg-amber-50">
              <AlertTriangle className="h-4 w-4 text-amber-600" />
              <div className="flex flex-col space-y-2">
                <AlertDescription>
                  <span className="font-medium">{error}</span>
                </AlertDescription>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      retryAnalysis(selectedEffect);
                      onAnalysisStart?.();
                    }}
                    className="border-amber-300 hover:bg-amber-100"
                  >
                    <RefreshCw className="h-3 w-3 mr-1" /> Tentar novamente
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={clearError}
                    className="text-gray-500"
                  >
                    Fechar
                  </Button>
                </div>
              </div>
            </Alert>
          )}
        </CardContent>
      </Card>

      {/* Seleção de Efeito Desejado */}
      {(lastAnalysis || isAnalyzing) && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="h-5 w-5" />
              Efeito Desejado
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {Object.entries(EFFECT_PROFILES).map(([key, profile]) => (
                <button
                  key={key}
                  onClick={() => handleEffectChange(key as any)}
                  className={`p-4 rounded-lg border-2 text-left transition-colors ${
                    selectedEffect === key
                      ? 'border-primary bg-primary/5'
                      : 'border-muted hover:border-muted-foreground/50'
                  }`}
                  disabled={isAnalyzing}
                >
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-lg">{profile.icon}</span>
                    <span className="font-medium capitalize">{key}</span>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {profile.description}
                  </p>
                </button>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Resultados da Análise */}
      {lastAnalysis && (
        <div className="space-y-4">
          {/* Header com botão Nova Análise */}
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold">Resultados da Análise</h3>
            <Button
              onClick={handleNewAnalysis}
              variant="outline"
              size="sm"
              className="flex items-center gap-2"
            >
              <Camera className="h-4 w-4" />
              Nova Análise
            </Button>
          </div>

          <Tabs defaultValue="analysis" className="space-y-4">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="analysis">Análise</TabsTrigger>
            <TabsTrigger value="recommendation">Recomendação</TabsTrigger>
            <TabsTrigger value="timeline">Histórico</TabsTrigger>
          </TabsList>

          <TabsContent value="analysis" className="space-y-4">
            {/* Percentuais de Tricomas */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5" />
                  Composição dos Tricomas
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-3 gap-4">
                  <div className="text-center p-4 rounded-lg bg-blue-50 border border-blue-200">
                    <div className="text-2xl font-bold text-blue-600">
                      {lastAnalysis.clearTrichomes}%
                    </div>
                    <div className="text-sm text-blue-600 font-medium">Transparentes</div>
                    <div className="text-xs text-muted-foreground mt-1">
                      Imaturos
                    </div>
                  </div>
                  
                  <div className="text-center p-4 rounded-lg bg-gray-50 border border-gray-200">
                    <div className="text-2xl font-bold text-gray-600">
                      {lastAnalysis.cloudyTrichomes}%
                    </div>
                    <div className="text-sm text-gray-600 font-medium">Leitosos</div>
                    <div className="text-xs text-muted-foreground mt-1">
                      Pico THC
                    </div>
                  </div>
                  
                  <div className="text-center p-4 rounded-lg bg-amber-50 border border-amber-200">
                    <div className="text-2xl font-bold text-amber-600">
                      {lastAnalysis.amberTrichomes}%
                    </div>
                    <div className="text-sm text-amber-600 font-medium">Âmbar</div>
                    <div className="text-xs text-muted-foreground mt-1">
                      Sedativo
                    </div>
                  </div>
                </div>

                {/* Estágio de Maturação */}
                {maturityStage && (
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">Estágio de Maturação</span>
                      <Badge variant="outline" style={{ color: maturityStage.color }}>
                        {maturityStage.stage}
                      </Badge>
                    </div>
                    <Progress 
                      value={maturityStage.progress} 
                      className="h-2"
                    />
                  </div>
                )}

                {/* Efeito Predito */}
                <div className="flex items-center justify-between p-3 rounded-lg border">
                  <span className="text-sm font-medium">Efeito Predito</span>
                  <div className="flex items-center gap-2">
                    <span className="text-lg">
                      {EFFECT_PROFILES[lastAnalysis.effectProfile].icon}
                    </span>
                    <span className="capitalize font-medium">
                      {lastAnalysis.effectProfile}
                    </span>
                  </div>
                </div>

                {/* Confiança */}
                <div className="flex items-center justify-between p-3 rounded-lg border">
                  <span className="text-sm font-medium">Confiança da Análise</span>
                  <Badge variant={lastAnalysis.confidence > 80 ? "default" : "secondary"}>
                    {lastAnalysis.confidence}%
                  </Badge>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="recommendation" className="space-y-4">
            {recommendation && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    {getReadinessIcon(recommendation.readiness)}
                    Recomendação de Colheita
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Status de Prontidão */}
                  <div className={`p-4 rounded-lg border ${getUrgencyColor(recommendation.harvestUrgency)}`}>
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-medium">Status</span>
                      <Badge className={getUrgencyColor(recommendation.harvestUrgency)}>
                        {recommendation.readiness.replace('-', ' ')}
                      </Badge>
                    </div>
                    <p className="text-sm">{recommendation.recommendedAction}</p>
                  </div>

                  {/* Recomendação de Colheita */}
                  <div className="p-4 rounded-lg border border-amber-200 bg-amber-50">
                    <div className="flex items-center gap-2 mb-2">
                      <Target className="h-4 w-4 text-amber-600" />
                      <span className="text-sm font-medium text-amber-800">Recomendação</span>
                    </div>
                    <p className="text-sm text-amber-700 mb-2">{lastAnalysis.harvestRecommendation.status}</p>
                    <div className="flex items-center gap-4 text-xs text-amber-600">
                      <span>Janela: {lastAnalysis.harvestRecommendation.timeWindow}</span>
                      <span>Confiança: {lastAnalysis.harvestRecommendation.confidence}%</span>
                    </div>
                  </div>

                  {/* Descrição do Efeito */}
                  <div className="p-3 rounded-lg border">
                    <div className="flex items-center gap-2 mb-1">
                      <Info className="h-4 w-4" />
                      <span className="text-sm font-medium">Efeito Esperado</span>
                    </div>
                    <p className="text-sm">{recommendation.effectDescription}</p>
                  </div>

                  {/* Notas da Análise */}
                  {lastAnalysis.analysisNotes && lastAnalysis.analysisNotes.length > 0 && (
                    <div className="p-3 rounded-lg border border-blue-200 bg-blue-50">
                      <div className="flex items-center gap-2 mb-2">
                        <Info className="h-4 w-4 text-blue-600" />
                        <span className="text-sm font-medium text-blue-800">Observações Importantes</span>
                      </div>
                      <ul className="text-xs text-blue-700 space-y-1">
                        {lastAnalysis.analysisNotes.map((note, index) => (
                          <li key={index} className="flex items-start gap-1">
                            <span className="text-blue-400 mt-1">•</span>
                            <span>{note}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Avisos */}
                  {recommendation.daysToOptimal && (
                    <Alert>
                      <Clock className="h-4 w-4" />
                      <AlertDescription>
                        Aguarde mais {recommendation.daysToOptimal} dias para o efeito {selectedEffect} ideal.
                      </AlertDescription>
                    </Alert>
                  )}

                  {recommendation.thcPotentialLoss && (
                    <Alert>
                      <AlertTriangle className="h-4 w-4" />
                      <AlertDescription>
                        Possível perda de {recommendation.thcPotentialLoss}% de THC se aguardar mais.
                      </AlertDescription>
                    </Alert>
                  )}
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="timeline" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Histórico de Análises</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  As análises são salvas localmente no seu dispositivo. 
                  Histórico completo será implementado em breve.
                </p>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
        </div>
      )}
    </div>
  )
}
