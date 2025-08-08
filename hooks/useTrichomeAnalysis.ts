import { useState, useCallback } from 'react'
import { 
  TrichomeAnalysis, 
  HarvestRecommendation, 
  calculateOptimalHarvest,
  saveTrichomeAnalysis,
  loadTrichomeAnalyses 
} from '@/types/trichome-analysis'

interface UseTrichomeAnalysisProps {
  cultivationId: string
}

interface AnalysisState {
  isAnalyzing: boolean
  isUploading: boolean
  progress: number
  error: string | null
  errorCode?: string
  lastAnalysis: TrichomeAnalysis | null
  lastImageFile?: File  // Armazenar referência ao último arquivo de imagem para retry
  recommendation: HarvestRecommendation | null
}

export function useTrichomeAnalysis({ cultivationId }: UseTrichomeAnalysisProps) {
  const [state, setState] = useState<AnalysisState>({
    isAnalyzing: false,
    isUploading: false,
    progress: 0,
    error: null,
    errorCode: undefined,
    lastAnalysis: null,
    lastImageFile: undefined,
    recommendation: null
  })

  // Analisar imagem
  const analyzeImage = useCallback(async (
    file: File,
    preferredEffect: 'energetic' | 'balanced' | 'couch-lock' = 'balanced'
  ): Promise<TrichomeAnalysis | null> => {
    try {
      // Armazenar o arquivo para possível retry
      setState(prev => ({
        ...prev,
        lastImageFile: file,
        isAnalyzing: true,
        isUploading: true,
        progress: 10,
        error: null
      }))

      // Preparar FormData
      const formData = new FormData()
      formData.append('image', file)
      formData.append('cultivationId', cultivationId)

      setState(prev => ({ ...prev, progress: 25, isUploading: true }))

      // Fazer upload e análise
      const response = await fetch('/api/trichome-analysis', {
        method: 'POST',
        body: formData
      })

      setState(prev => ({ ...prev, progress: 60, isUploading: false }))

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Erro na análise')
      }

      setState(prev => ({ ...prev, progress: 80 }))

      const result = await response.json()
      
      if (!result.success) {
        // Se houver um erro da API mas também tivermos um fallback disponível
        if (result.fallbackAvailable && result.analysis) {
          console.warn('Usando análise fallback devido a erro:', result.error);
          // Continua com a análise de fallback
        } else {
          throw new Error(result.error || 'Análise falhou');
        }
      }

      const analysis: TrichomeAnalysis = result.analysis
      
      // Converter strings de data para objetos Date se necessário
      if (typeof analysis.analysisTimestamp === 'string') {
        analysis.analysisTimestamp = new Date(analysis.analysisTimestamp)
      }
      
      // Calcular recomendação com efeito preferido
      const recommendation = calculateOptimalHarvest(analysis, preferredEffect)

      // Salvar no localStorage
      saveTrichomeAnalysis(analysis)

      setState(prev => ({
        ...prev,
        isAnalyzing: false,
        progress: 100,
        lastAnalysis: analysis,
        recommendation,
        error: null
      }))

      // Reset progress após 2 segundos
      setTimeout(() => {
        setState(prev => ({ ...prev, progress: 0 }))
      }, 2000)

      return analysis

    } catch (error: unknown) {
      console.error('Erro na análise:', error)
      
      // Determinar mensagem de erro amigável para o usuário
      let errorMessage = 'Erro desconhecido na análise';
      let errorCode = 'unknown';
      
      if (error instanceof Error) {
        // Extrair mensagem de erro mais detalhada
        errorMessage = error.message;
        
        // Classificar tipos de erro para facilitar o tratamento
        if (errorMessage.includes('JSON')) {
          errorMessage = 'O modelo de IA retornou uma resposta inválida. Tente novamente.';
          errorCode = 'json_parse';
        } else if (errorMessage.includes('timeout') || errorMessage.includes('time out')) {
          errorMessage = 'A análise demorou muito tempo. Tente novamente.';
          errorCode = 'timeout';
        } else if (errorMessage.includes('rede') || errorMessage.includes('network')) {
          errorMessage = 'Erro de conexão. Verifique sua internet e tente novamente.';
          errorCode = 'network';
        }
      }
      
      setState(prev => ({
        ...prev,
        isAnalyzing: false,
        isUploading: false,
        progress: 0,
        error: errorMessage,
        errorCode: errorCode
      }))

      return null
    }
  }, [cultivationId])

  // Carregar histórico de análises
  const loadHistory = useCallback((): TrichomeAnalysis[] => {
    return loadTrichomeAnalyses(cultivationId)
  }, [cultivationId])

  // Recalcular recomendação com efeito diferente
  const recalculateRecommendation = useCallback((
    analysis: TrichomeAnalysis,
    preferredEffect: 'energetic' | 'balanced' | 'couch-lock'
  ): HarvestRecommendation => {
    console.log('🔄 Recalculando recomendação com efeito:', preferredEffect)
    const recommendation = calculateOptimalHarvest(analysis, preferredEffect)
    console.log('📊 Nova recomendação:', recommendation)
    
    setState(prev => ({
      ...prev,
      recommendation
    }))

    return recommendation
  }, [])

  // Limpar erro
  const clearError = useCallback(() => {
    setState(prev => ({ 
      ...prev, 
      error: null,
      errorCode: undefined
    }))
  }, [])

  // Tentar novamente a análise com a última imagem
  const retryAnalysis = useCallback(async (
    preferredEffect: 'energetic' | 'balanced' | 'couch-lock' = 'balanced'
  ): Promise<TrichomeAnalysis | null> => {
    // Verificar se temos o último arquivo
    const lastImageFile = state.lastImageFile;
    if (!lastImageFile) {
      setState(prev => ({
        ...prev,
        error: 'Não foi possível tentar novamente. Por favor, selecione uma nova imagem.'
      }));
      return null;
    }
    
    // Limpar erro e tentar novamente
    clearError();
    return await analyzeImage(lastImageFile, preferredEffect);
  }, [state.lastImageFile, analyzeImage, clearError])
  
  // Reset state
  const reset = useCallback(() => {
    setState({
      isAnalyzing: false,
      isUploading: false,
      progress: 0,
      error: null,
      errorCode: undefined,
      lastAnalysis: null,
      lastImageFile: undefined,
      recommendation: null
    })
  }, [])

  return {
    // Estado
    isAnalyzing: state.isAnalyzing,
    isUploading: state.isUploading,
    progress: state.progress,
    error: state.error,
    errorCode: state.errorCode,
    lastAnalysis: state.lastAnalysis,
    recommendation: state.recommendation,
    
    // Ações
    analyzeImage,
    loadHistory,
    recalculateRecommendation,
    clearError,
    retryAnalysis,
    reset
  }
}
