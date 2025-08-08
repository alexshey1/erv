import React, { useState, useRef } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

import {
  Upload,
  Zap,
  Eye,
  Brain,
  CheckCircle,
  AlertTriangle,
  Lightbulb,
  Camera,
  Sparkles,
  Activity,
  TrendingUp,
  Shield,
  Leaf,
  FileImage,
  Loader2
} from "lucide-react";

interface AnalysisResult {
  analysis: any;
  recommendations: any[];
  predictions?: any[];
  anomalies?: any[];
}

export default function PlantVisualAnalysisOpenRouter() {
  const [image, setImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [imageBase64, setImageBase64] = useState<string | null>(null);
  const [context, setContext] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [uploadingImg, setUploadingImg] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Função para converter arquivo em base64
  const fileToBase64 = (file: File) => {
    return new Promise<string>((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  };

  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!/^(image\/jpeg|image\/png|image\/webp)$/.test(file.type)) {
      setError("Apenas imagens JPG, PNG ou WEBP são permitidas.");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setError("O tamanho máximo da imagem é 5MB.");
      return;
    }
    setError(null);
    setImage(file);
    setImagePreview(URL.createObjectURL(file));
    // Converte para base64 para upload posterior
    const base64 = await fileToBase64(file);
    setImageBase64(base64);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!image || !imageBase64) {
      setError("Selecione uma imagem para análise.");
      return;
    }
    setLoading(true);
    setError(null);
    setResult(null);
    let imageUrl = "";

    try {
      setUploadingImg(true);
      // 1. Upload para ImgBB
      const uploadRes = await fetch("/api/upload-imgbb", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ imageBase64 }),
      });
      const uploadData = await uploadRes.json();
      setUploadingImg(false);

      if (!uploadRes.ok || !uploadData.url) {
        setError(uploadData.error || "Erro ao enviar imagem para ImgBB.");
        setLoading(false);
        return;
      }
      imageUrl = uploadData.url;

      // 2. Envia para análise com novo modelo
      const response = await fetch("/api/openrouter-visual-analysis", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ imageUrl, context }),
      });

      if (!response.ok) {
        let errorMessage = "Erro ao analisar imagem. Tente novamente.";
        try {
          const errData = await response.json();
          errorMessage = errData.error || errorMessage;
        } catch (parseError) {
          // Se não conseguir fazer parse do JSON, pode ser HTML de erro
          const textResponse = await response.text();
          console.error("Resposta não-JSON da API:", textResponse);
          errorMessage = `Erro do servidor (${response.status}). Verifique os logs.`;
        }
        throw new Error(errorMessage);
      }

      let data;
      try {
        data = await response.json();
      } catch (parseError) {
        const textResponse = await response.text();
        console.error("Erro ao fazer parse da resposta:", textResponse);
        throw new Error("Resposta inválida do servidor. Verifique se a API está funcionando corretamente.");
      }

      // Validar estrutura da resposta
      if (!data.result) {
        throw new Error("Resposta da API não contém resultado válido.");
      }

      // Garantir que a estrutura está correta
      const validatedResult = {
        analysis: data.result.analysis || "Análise visual completada",
        recommendations: Array.isArray(data.result.recommendations) 
          ? data.result.recommendations 
          : ["Monitore a saúde da planta regularmente"],
        anomalies: Array.isArray(data.result.anomalies) 
          ? data.result.anomalies 
          : []
      };

      setResult(validatedResult);
    } catch (err: any) {
      setError(err.message || "Erro inesperado na análise.");
    } finally {
      setUploadingImg(false);
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-emerald-50/30 to-teal-50/20 relative overflow-hidden">
      {/* Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-emerald-400/20 to-teal-400/20 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-tr from-green-400/20 to-emerald-400/20 rounded-full blur-3xl"></div>
      </div>

      <div className="relative max-w-7xl mx-auto px-4 py-8">
        {/* Modern Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <div className="inline-flex items-center gap-6 mb-6">
            <motion.div
              className="relative"
              whileHover={{ scale: 1.05 }}
              transition={{ type: "spring", stiffness: 300 }}
            >
              <div className="w-20 h-20 bg-gradient-to-br from-emerald-500 via-green-500 to-teal-600 rounded-3xl flex items-center justify-center shadow-2xl relative overflow-hidden">
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                  className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
                />
                <Eye className="w-10 h-10 text-white relative z-10" />
              </div>
              <motion.div
                animate={{ scale: [1, 1.2, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
                className="absolute -top-2 -right-2 w-8 h-8 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full border-3 border-white flex items-center justify-center shadow-lg"
              >
                <Sparkles className="w-4 h-4 text-white" />
              </motion.div>
            </motion.div>

            <div className="text-left">
              <motion.h1
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2, duration: 0.6 }}
                className="text-4xl font-bold bg-gradient-to-r from-slate-800 via-emerald-700 to-teal-700 bg-clip-text text-transparent mb-2"
              >
                Análise Visual IA
              </motion.h1>
              <motion.p
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3, duration: 0.6 }}
                className="text-slate-600 font-medium text-xl mb-1"
              >
                Diagnóstico Avançado por Inteligência Artificial
              </motion.p>
              <motion.p
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.4, duration: 0.6 }}
                className="text-slate-500 text-sm flex items-center gap-2"
              >
                <Brain className="w-4 h-4" />
                Tecnologia de visão computacional para análise de plantas
              </motion.p>
            </div>
          </div>

          {/* AI Features Showcase */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5, duration: 0.6 }}
            className="max-w-4xl mx-auto"
          >
            <div className="bg-white/70 backdrop-blur-sm rounded-3xl p-8 shadow-xl border border-white/50">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {/* Feature 1 */}
                <motion.div
                  whileHover={{ scale: 1.05, y: -5 }}
                  className="text-center group cursor-pointer"
                >
                  <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-br from-emerald-500 to-green-600 rounded-2xl flex items-center justify-center shadow-lg group-hover:shadow-xl transition-all duration-300">
                    <Leaf className="w-8 h-8 text-white" />
                  </div>
                  <h3 className="font-bold text-slate-800 mb-2">Detecção de Doenças</h3>
                  <p className="text-sm text-slate-600">Identifica pragas, fungos e deficiências nutricionais</p>
                </motion.div>

                {/* Feature 2 */}
                <motion.div
                  whileHover={{ scale: 1.05, y: -5 }}
                  className="text-center group cursor-pointer"
                >
                  <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center shadow-lg group-hover:shadow-xl transition-all duration-300">
                    <TrendingUp className="w-8 h-8 text-white" />
                  </div>
                  <h3 className="font-bold text-slate-800 mb-2">Análise de Crescimento</h3>
                  <p className="text-sm text-slate-600">Monitora desenvolvimento e estágios de crescimento</p>
                </motion.div>

                {/* Feature 3 */}
                <motion.div
                  whileHover={{ scale: 1.05, y: -5 }}
                  className="text-center group cursor-pointer"
                >
                  <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-br from-purple-500 to-pink-600 rounded-2xl flex items-center justify-center shadow-lg group-hover:shadow-xl transition-all duration-300">
                    <Lightbulb className="w-8 h-8 text-white" />
                  </div>
                  <h3 className="font-bold text-slate-800 mb-2">Recomendações IA</h3>
                  <p className="text-sm text-slate-600">Sugestões personalizadas para otimização</p>
                </motion.div>

                {/* Feature 4 */}
                <motion.div
                  whileHover={{ scale: 1.05, y: -5 }}
                  className="text-center group cursor-pointer"
                >
                  <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-br from-orange-500 to-red-600 rounded-2xl flex items-center justify-center shadow-lg group-hover:shadow-xl transition-all duration-300">
                    <Shield className="w-8 h-8 text-white" />
                  </div>
                  <h3 className="font-bold text-slate-800 mb-2">Diagnóstico Preciso</h3>
                  <p className="text-sm text-slate-600">Análise detalhada com alta precisão</p>
                </motion.div>
              </div>

              {/* Bottom Info */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.8, duration: 0.6 }}
                className="mt-8 pt-6 border-t border-slate-200/50"
              >
                <div className="flex items-center justify-center gap-8 text-sm text-slate-600">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                    <span>Sistema Online</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Zap className="w-4 h-4 text-blue-500" />
                    <span>Processamento Rápido</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Brain className="w-4 h-4 text-purple-500" />
                    <span>IA Avançada</span>
                  </div>
                </div>
              </motion.div>
            </div>
          </motion.div>
        </motion.div>

        {/* Main Analysis Interface */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6, duration: 0.6 }}
        >
          <Card className="bg-white/95 backdrop-blur-sm shadow-2xl border-0 overflow-hidden">
            <CardHeader className="bg-gradient-to-r from-slate-900 via-slate-800 to-emerald-900 text-white p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center">
                    <Camera className="w-6 h-6" />
                  </div>
                  <div>
                    <CardTitle className="text-xl font-bold">Análise Profissional</CardTitle>
                    <p className="text-slate-300 text-sm">Powered by Advanced AI Vision</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <motion.div
                    animate={{ scale: [1, 1.2, 1] }}
                    transition={{ duration: 2, repeat: Infinity }}
                    className="w-3 h-3 bg-green-400 rounded-full"
                  />
                  <span className="text-slate-300 text-sm font-medium">Sistema Ativo</span>
                </div>
              </div>
            </CardHeader>

            <CardContent className="p-8">
              <form onSubmit={handleSubmit} className="space-y-8">
                {/* Upload Zone */}
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-4 flex items-center gap-2">
                    <FileImage className="w-4 h-4 text-emerald-600" />
                    Enviar Imagem da Planta
                  </label>

                  <div className="relative">
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/jpeg,image/png,image/webp"
                      onChange={handleImageChange}
                      disabled={loading}
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer disabled:cursor-not-allowed z-10"
                    />

                    <motion.div
                      onClick={() => !loading && fileInputRef.current?.click()}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      className={`relative border-2 border-dashed rounded-3xl p-8 text-center transition-all duration-300 cursor-pointer ${imagePreview
                        ? 'border-emerald-300 bg-emerald-50/50'
                        : 'border-slate-300 bg-slate-50/50 hover:border-emerald-400 hover:bg-emerald-50/30'
                        }`}
                    >
                      <AnimatePresence mode="wait">
                        {imagePreview ? (
                          <motion.div
                            key="preview"
                            initial={{ opacity: 0, scale: 0.8 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.8 }}
                            className="space-y-4"
                          >
                            <div className="relative inline-block">
                              <Image
                                src={imagePreview}
                                alt="Plant preview"
                                width={400}
                                height={300}
                                className="rounded-2xl shadow-xl object-cover max-h-80"
                              />
                              <div className="absolute top-3 right-3 bg-emerald-500 text-white p-2 rounded-full shadow-lg">
                                <CheckCircle className="w-5 h-5" />
                              </div>
                            </div>
                            <div className="flex items-center justify-center gap-2">
                              <Leaf className="w-5 h-5 text-emerald-600" />
                              <p className="text-lg font-semibold text-emerald-700">Imagem pronta para análise</p>
                            </div>
                          </motion.div>
                        ) : (
                          <motion.div
                            key="upload"
                            initial={{ opacity: 0, scale: 0.8 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.8 }}
                            className="space-y-6"
                          >
                            <motion.div
                              animate={{ y: [0, -10, 0] }}
                              transition={{ duration: 2, repeat: Infinity }}
                              className="w-20 h-20 mx-auto bg-gradient-to-br from-slate-100 to-slate-200 rounded-3xl flex items-center justify-center shadow-lg"
                            >
                              <Upload className="w-10 h-10 text-slate-400" />
                            </motion.div>
                            <div>
                              <p className="text-xl font-bold text-slate-700 mb-2">Solte a imagem da sua planta aqui</p>
                              <p className="text-sm text-slate-500">ou clique para navegar • JPG, PNG, WEBP • Máx 5MB</p>
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </motion.div>
                  </div>
                </div>

                {/* Context Input */}
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-4 flex items-center gap-2">
                    <Brain className="w-4 h-4 text-emerald-600" />
                    Contexto Adicional (Opcional)
                  </label>
                  <Textarea
                    value={context}
                    onChange={(e) => setContext(e.target.value)}
                    placeholder="Descreva sintomas, condições ambientais, estágio de crescimento ou preocupações específicas sobre sua planta..."
                    rows={4}
                    className="resize-none bg-slate-50/50 border-slate-200 focus:border-emerald-500 focus:ring-emerald-500 rounded-2xl"
                    disabled={loading}
                    maxLength={500}
                  />
                  <div className="flex justify-between items-center mt-2">
                    <p className="text-xs text-slate-500">Forneça detalhes para uma análise mais precisa</p>
                    <span className="text-xs text-slate-400">{context.length}/500</span>
                  </div>
                </div>

                {/* Error Display */}
                <AnimatePresence>
                  {error && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className="p-4 bg-red-50 border border-red-200 rounded-2xl"
                    >
                      <div className="flex items-start gap-3">
                        <AlertTriangle className="w-5 h-5 text-red-500 mt-0.5" />
                        <div>
                          <h4 className="font-semibold text-red-800 mb-1">Falha na Análise</h4>
                          <p className="text-red-700 text-sm">{error}</p>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Action Button */}
                <Button
                  type="submit"
                  disabled={loading || uploadingImg || !image}
                  className="w-full h-14 bg-gradient-to-r from-emerald-600 via-emerald-500 to-green-600 hover:from-emerald-700 hover:via-emerald-600 hover:to-green-700 text-white font-bold rounded-2xl shadow-xl transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed text-lg"
                >
                  <AnimatePresence mode="wait">
                    {(loading || uploadingImg) ? (
                      <motion.div
                        key="loading"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="flex items-center gap-3"
                      >
                        <Loader2 className="w-5 h-5 animate-spin" />
                        <span>{uploadingImg ? "Enviando Imagem..." : "Analisando Planta..."}</span>
                      </motion.div>
                    ) : (
                      <motion.div
                        key="ready"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="flex items-center gap-3"
                      >
                        <Zap className="w-5 h-5" />
                        <span>Iniciar Análise Inteligente</span>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </Button>
              </form>
            </CardContent>
          </Card>
        </motion.div>

        {/* Results Section */}
        <AnimatePresence>
          {result && (
            <motion.div
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 50 }}
              transition={{ duration: 0.6 }}
              className="mt-8 space-y-6"
            >
              {/* Analysis Results Header */}
              <Card className="bg-gradient-to-r from-emerald-600 via-green-600 to-teal-600 text-white shadow-2xl border-0">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center">
                        <CheckCircle className="w-6 h-6" />
                      </div>
                      <div>
                        <h3 className="text-xl font-bold">Análise Concluída</h3>
                        <p className="text-emerald-100 text-sm">Relatório detalhado de saúde e recomendações</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-white/80 text-xs font-medium">Processado em</div>
                      <div className="text-white font-bold text-lg">2.3s</div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Analysis Content */}
              <Card className="bg-white/95 backdrop-blur-sm shadow-xl border-0">
                <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50 border-b">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center">
                      <Eye className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <CardTitle className="text-lg text-slate-800">Análise Visual Detalhada</CardTitle>
                      <p className="text-slate-500 text-sm">Diagnóstico por IA</p>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="p-6">
                  <div className="bg-slate-50 rounded-xl p-6 border border-slate-200">
                    <p className="text-slate-700 leading-relaxed text-base">
                      {typeof result.analysis === 'string' ? result.analysis : JSON.stringify(result.analysis, null, 2)}
                    </p>
                  </div>
                </CardContent>
              </Card>

              {/* Recommendations */}
              {result.recommendations && result.recommendations.length > 0 && (
                <Card className="bg-white/95 backdrop-blur-sm shadow-xl border-0">
                  <CardHeader className="bg-gradient-to-r from-emerald-50 to-green-50 border-b">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-gradient-to-br from-emerald-500 to-green-600 rounded-xl flex items-center justify-center">
                          <Lightbulb className="w-5 h-5 text-white" />
                        </div>
                        <div>
                          <CardTitle className="text-lg text-slate-800">Recomendações Inteligentes</CardTitle>
                          <p className="text-slate-500 text-sm">Ações sugeridas pela IA</p>
                        </div>
                      </div>
                      <Badge variant="secondary" className="bg-emerald-100 text-emerald-700">
                        {result.recommendations.length} ações
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="p-6">
                    <div className="space-y-4">
                      {result.recommendations.map((rec: any, index: number) => (
                        <motion.div
                          key={index}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: index * 0.1 }}
                          className="bg-emerald-50 rounded-xl p-5 border border-emerald-200 hover:shadow-md transition-shadow"
                        >
                          <div className="flex items-start gap-4">
                            <div className="w-8 h-8 bg-gradient-to-br from-emerald-500 to-green-600 rounded-xl flex items-center justify-center text-white font-bold text-sm">
                              {index + 1}
                            </div>
                            <div className="flex-1">
                              <p className="text-slate-700 leading-relaxed">
                                {typeof rec === 'string' ? rec : JSON.stringify(rec)}
                              </p>
                              <div className="flex items-center gap-2 mt-3">
                                <TrendingUp className="w-4 h-4 text-emerald-600" />
                                <span className="text-emerald-600 text-xs font-medium">PRIORIDADE ALTA</span>
                              </div>
                            </div>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Anomalies */}
              {result.anomalies && result.anomalies.length > 0 && (
                <Card className="bg-white/95 backdrop-blur-sm shadow-xl border-0">
                  <CardHeader className="bg-gradient-to-r from-red-50 to-orange-50 border-b">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-gradient-to-br from-red-500 to-orange-600 rounded-xl flex items-center justify-center">
                          <AlertTriangle className="w-5 h-5 text-white" />
                        </div>
                        <div>
                          <CardTitle className="text-lg text-slate-800">Problemas Detectados</CardTitle>
                          <p className="text-slate-500 text-sm">Requer atenção imediata</p>
                        </div>
                      </div>
                      <Badge variant="destructive" className="bg-red-100 text-red-700">
                        {result.anomalies.length} alertas
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="p-6">
                    <div className="space-y-4">
                      {result.anomalies.map((anomaly: any, index: number) => (
                        <motion.div
                          key={index}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: index * 0.1 }}
                          className="bg-red-50 rounded-xl p-5 border border-red-200 hover:shadow-md transition-shadow"
                        >
                          <div className="flex items-start gap-4">
                            <div className="w-8 h-8 bg-gradient-to-br from-red-500 to-orange-600 rounded-xl flex items-center justify-center">
                              <AlertTriangle className="w-4 h-4 text-white" />
                            </div>
                            <div className="flex-1">
                              <h5 className="font-bold text-red-800 mb-2">{anomaly.parameter || 'Problema Detectado'}</h5>
                              <p className="text-slate-600 leading-relaxed">{anomaly.description || JSON.stringify(anomaly)}</p>
                              <div className="flex items-center gap-2 mt-3">
                                <motion.div
                                  animate={{ scale: [1, 1.2, 1] }}
                                  transition={{ duration: 1, repeat: Infinity }}
                                  className="w-2 h-2 bg-red-400 rounded-full"
                                />
                                <span className="text-red-600 text-xs font-medium">AÇÃO NECESSÁRIA</span>
                              </div>
                            </div>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}