"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Progress } from "@/components/ui/progress"
import { motion, AnimatePresence } from "framer-motion"
import {
  Mail,
  Calendar,
  Eye,
  Share2,
  BarChart3,
  FileText,
  TrendingUp,
  AlertTriangle,
  CheckCircle,
  Download,
  Leaf,
  DollarSign,
  Zap,
  Clock,
  Target,
  Activity,
  Filter,
  Search,
  RefreshCw
} from "lucide-react"
import { InteractiveReportGeneratorLegacy as InteractiveReportGenerator } from "@/components/reports/interactive-report-generator"
import { toast } from "sonner"
import { Select } from "@/components/ui/select"
import jsPDF from "jspdf"
import autoTable from "jspdf-autotable"
import Chart from "chart.js/auto"
import ChartDataLabels from "chartjs-plugin-datalabels"
Chart.register(ChartDataLabels)
import { useRef } from "react"

interface CultivationData {
  id: string
  name: string
  startDate: string
  endDate: string | null
  yield_g: number
  profit_brl: number
  status: "active" | "completed" | "archived"
  seedStrain: string
  durationDays: number
  hasSevereProblems: boolean
}

interface ReportsContentProps {
  user?: any;
  results?: any // Opcional agora, pois usaremos dados reais
  setupParams?: any
  cycleParams?: any
  marketParams?: any
}

export function ReportsContent({ user, results, setupParams, cycleParams, marketParams }: ReportsContentProps) {
  const [cultivations, setCultivations] = useState<CultivationData[]>([]);
  const [selectedCultivationId, setSelectedCultivationId] = useState<string>("");
  const [detailedReport, setDetailedReport] = useState<any>(null);
  const [showPreview, setShowPreview] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const chartRef = useRef<HTMLCanvasElement>(null);

  // Função para calcular duração em dias
  const calculateDurationDays = (startDate: string, endDate: string | null): number => {
    const start = new Date(startDate);
    const end = endDate ? new Date(endDate) : new Date();
    const diffTime = Math.abs(end.getTime() - start.getTime());
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  };

  useEffect(() => {
    const fetchCultivations = async () => {
      setIsLoading(true);
      try {
        const response = await fetch('/api/cultivation');
        if (response.ok) {
          const data = await response.json();
          if (data.success) {
            // Calcular duração corretamente para cada cultivo
            const cultivationsWithDuration = data.cultivations.map((cultivation: CultivationData) => ({
              ...cultivation,
              durationDays: calculateDurationDays(cultivation.startDate, cultivation.endDate)
            }));
            setCultivations(cultivationsWithDuration);
            if (cultivationsWithDuration.length > 0) {
              setSelectedCultivationId(cultivationsWithDuration[0].id);
            }
          }
        }
      } catch (e) {
        // erro silencioso
      } finally {
        setIsLoading(false);
      }
    };
    fetchCultivations();
  }, []);

  useEffect(() => {
    const fetchReport = async () => {
      if (!selectedCultivationId) return;
      setDetailedReport(null);
      setIsLoading(true);
      try {
        // Buscar dados do cultivo
        const cultivationRes = await fetch(`/api/cultivation/${selectedCultivationId}`);
        const eventsRes = await fetch(`/api/cultivation-events?cultivationId=${selectedCultivationId}`);
        if (cultivationRes.ok && eventsRes.ok) {
          const cultivationData = await cultivationRes.json();
          const eventsData = await eventsRes.json();
          if (cultivationData.success && eventsData.success) {
            const cultivation = cultivationData.cultivation;
            setDetailedReport({
              summary: {
                ...cultivation,
                durationDays: calculateDurationDays(cultivation.startDate, cultivation.endDate)
              },
              events: eventsData.events || [],
              incidents: (eventsData.events || []).filter((ev: any) => ev.type === 'incident' || ev.type === 'anomaly'),
              results: cultivation.results || {},
            });
          }
        }
      } catch (e) {
        // erro silencioso
      } finally {
        setIsLoading(false);
      }
    };
    if (showPreview && selectedCultivationId) fetchReport();
  }, [showPreview, selectedCultivationId]);

  const formatCurrency = (value: number) =>
    new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(value)

  // Função para gerar gráfico e retornar base64
  const generateChartImage = (type: 'bar' | 'line', labels: string[], data: number[], label: string) => {
    // Cria canvas offscreen
    const canvas = document.createElement('canvas');
    canvas.width = 600;
    canvas.height = 300;
    const ctx = canvas.getContext('2d');
    if (!ctx) return null;
    // Destroi instância anterior se houver
    if ((window as any)._chartInstance) {
      (window as any)._chartInstance.destroy();
    }
    (window as any)._chartInstance = new Chart(ctx, {
      type,
      data: {
        labels,
        datasets: [{
          label,
          data,
          backgroundColor: type === 'bar' ? 'rgba(16,185,129,0.7)' : 'rgba(59,130,246,0.5)',
          borderColor: type === 'bar' ? 'rgba(16,185,129,1)' : 'rgba(59,130,246,1)',
          borderWidth: 2,
          fill: type === 'line',
          tension: 0.3,
        }]
      },
      options: {
        plugins: { legend: { display: true } },
        scales: { y: { beginAtZero: true } },
        animation: false,
        responsive: false,
      }
    });
    const img = canvas.toDataURL('image/png');
    (window as any)._chartInstance.destroy();
    return img;
  };

  // === CONFIGURAÇÕES E CONSTANTES ===
  const PDF_CONFIG = {
    margins: { top: 20, right: 20, bottom: 30, left: 20 },
    colors: {
      primary: [16, 185, 129] as [number, number, number],
      secondary: [59, 130, 246] as [number, number, number],
      accent: [168, 85, 247] as [number, number, number],
      danger: [239, 68, 68] as [number, number, number],
      success: [34, 197, 94] as [number, number, number],
      warning: [245, 158, 11] as [number, number, number],
      text: {
        primary: [0, 0, 0] as [number, number, number],
        secondary: [60, 60, 60] as [number, number, number],
        muted: [120, 120, 120] as [number, number, number],
        white: [255, 255, 255] as [number, number, number]
      },
      backgrounds: {
        green: [240, 253, 244] as [number, number, number],
        blue: [239, 246, 255] as [number, number, number],
        purple: [252, 231, 243] as [number, number, number],
        red: [254, 242, 242] as [number, number, number],
        gray: [248, 250, 252] as [number, number, number]
      }
    },
    fonts: {
      title: { size: 28, style: 'bold' },
      subtitle: { size: 16, style: 'bold' },
      heading: { size: 14, style: 'bold' },
      body: { size: 11, style: 'normal' },
      small: { size: 9, style: 'normal' },
      tiny: { size: 8, style: 'normal' }
    }
  };

  // === FUNÇÕES AUXILIARES ===
  const formatDate = (date: string | Date) => new Date(date).toLocaleDateString('pt-BR');
  const formatCurrencyPDF = (value: number) => `R$ ${value.toFixed(2)}`;
  const truncateText = (text: string, maxLength: number) =>
    text.length > maxLength ? text.substring(0, maxLength) + '...' : text;

  const checkPageBreak = (doc: jsPDF, currentY: number, requiredSpace: number) => {
    const pageHeight = doc.internal.pageSize.height;
    if (currentY + requiredSpace > pageHeight - PDF_CONFIG.margins.bottom - 40) {
      doc.addPage();
      return PDF_CONFIG.margins.top;
    }
    return currentY;
  };

  const setTextStyle = (doc: jsPDF, style: 'title' | 'subtitle' | 'heading' | 'body' | 'small' | 'tiny', color?: [number, number, number]) => {
    const font = PDF_CONFIG.fonts[style];
    doc.setFontSize(font.size);
    doc.setFont("helvetica", font.style as any);
    if (color) doc.setTextColor(...color);
  };

  const drawCard = (doc: jsPDF, x: number, y: number, width: number, height: number,
    bgColor: [number, number, number], borderColor: [number, number, number], title: string, value: string,
    titleColor: [number, number, number]) => {
    // Fundo do card
    doc.setFillColor(...bgColor);
    doc.rect(x, y, width, height, 'F');

    // Borda do card
    doc.setDrawColor(...borderColor);
    doc.setLineWidth(1);
    doc.rect(x, y, width, height);

    // Título sem emoji
    setTextStyle(doc, 'heading', titleColor);
    doc.text(title, x + 5, y + 12);

    // Valor
    setTextStyle(doc, 'subtitle', PDF_CONFIG.colors.text.primary);
    doc.text(value, x + 5, y + height - 8);
  };

  const addHeader = (doc: jsPDF) => {
    const pageWidth = doc.internal.pageSize.width;

    // Fundo do header
    doc.setFillColor(...PDF_CONFIG.colors.primary);
    doc.rect(0, 0, pageWidth, 55, 'F');

    // Logo e título principal
    setTextStyle(doc, 'title', PDF_CONFIG.colors.text.white);
    doc.text("ErvaApp", PDF_CONFIG.margins.left, 28);

    setTextStyle(doc, 'heading', PDF_CONFIG.colors.text.white);
    doc.text("Relatorio Tecnico de Cultivo", PDF_CONFIG.margins.left, 40);

    // Data e hora de geração
    setTextStyle(doc, 'small', PDF_CONFIG.colors.text.white);
    const now = new Date();
    const timestamp = `Gerado em: ${formatDate(now)} as ${now.toLocaleTimeString('pt-BR')}`;
    doc.text(timestamp, pageWidth - 85, 40);

    return 75; // Retorna posição Y após o header
  };

  const addCultivationInfo = (doc: jsPDF, yPos: number) => {
    // Nome do cultivo
    setTextStyle(doc, 'title', PDF_CONFIG.colors.text.primary);
    doc.text(detailedReport.summary.name, PDF_CONFIG.margins.left, yPos);

    // Genética
    setTextStyle(doc, 'heading', PDF_CONFIG.colors.text.secondary);
    doc.text(`Genetica: ${detailedReport.summary.seedStrain}`, PDF_CONFIG.margins.left, yPos + 18);

    return yPos + 35;
  };

  const addMetricsCards = (doc: jsPDF, yPos: number) => {
    const pageWidth = doc.internal.pageSize.width;
    const cardWidth = (pageWidth - PDF_CONFIG.margins.left - PDF_CONFIG.margins.right - 15) / 2;
    const cardHeight = 35;

    // Card 1 - Rendimento
    drawCard(doc, PDF_CONFIG.margins.left, yPos, cardWidth, cardHeight,
      PDF_CONFIG.colors.backgrounds.green, PDF_CONFIG.colors.primary,
      'RENDIMENTO', `${detailedReport.summary.yield_g || 0}g`, PDF_CONFIG.colors.primary);

    // Card 2 - Duração  
    drawCard(doc, PDF_CONFIG.margins.left + cardWidth + 15, yPos, cardWidth, cardHeight,
      PDF_CONFIG.colors.backgrounds.blue, PDF_CONFIG.colors.secondary,
      'DURACAO', `${detailedReport.summary.durationDays} dias`, PDF_CONFIG.colors.secondary);

    yPos += cardHeight + 15;

    // Card 3 - Eficiência
    drawCard(doc, PDF_CONFIG.margins.left, yPos, cardWidth, cardHeight,
      PDF_CONFIG.colors.backgrounds.purple, PDF_CONFIG.colors.accent,
      'EFICIENCIA', `${detailedReport.results?.gramas_por_watt?.toFixed(2) || '0'} g/W`, PDF_CONFIG.colors.accent);

    // Card 4 - ROI
    drawCard(doc, PDF_CONFIG.margins.left + cardWidth + 15, yPos, cardWidth, cardHeight,
      PDF_CONFIG.colors.backgrounds.red, PDF_CONFIG.colors.danger,
      'ROI', `${detailedReport.results?.roi_investimento_1_ano?.toFixed(1) || '0'}%`, PDF_CONFIG.colors.danger);

    return yPos + cardHeight + 30;
  };

  const addDetailsSection = (doc: jsPDF, yPos: number) => {
    // Verificar se precisa de quebra de página (título + 6 linhas de detalhes + margem)
    yPos = checkPageBreak(doc, yPos, 80);

    // Título da seção
    setTextStyle(doc, 'subtitle', PDF_CONFIG.colors.text.primary);
    doc.text("DETALHES DO CULTIVO", PDF_CONFIG.margins.left, yPos);

    yPos += 20;

    // Lista de detalhes
    setTextStyle(doc, 'body', PDF_CONFIG.colors.text.secondary);
    const details = [
      `Inicio: ${formatDate(detailedReport.summary.startDate)}`,
      `Fim: ${detailedReport.summary.endDate ? formatDate(detailedReport.summary.endDate) : 'Em andamento'}`,
      `Status: ${detailedReport.summary.status === 'active' ? 'Ativo' :
        detailedReport.summary.status === 'completed' ? 'Concluido' : 'Arquivado'}`,
      `Custo por grama: ${formatCurrencyPDF(detailedReport.results?.custo_por_grama || 0)}`,
      `Payback: ${detailedReport.results?.periodo_payback_ciclos?.toFixed(1) || '0'} ciclos`,
      `Lucro total: ${formatCurrencyPDF(detailedReport.summary.profit_brl || 0)}`
    ];

    details.forEach((detail, index) => {
      doc.text(`- ${detail}`, PDF_CONFIG.margins.left + 5, yPos + (index * 10));
    });

    return yPos + (details.length * 10) + 30;
  };

  const addEventsTable = (doc: jsPDF, yPos: number) => {
    if (!detailedReport.events || detailedReport.events.length === 0) return yPos;

    yPos = checkPageBreak(doc, yPos, 60);

    // Título da seção
    setTextStyle(doc, 'subtitle', PDF_CONFIG.colors.text.primary);
    doc.text("EVENTOS DO CULTIVO", PDF_CONFIG.margins.left, yPos);

    yPos += 15;

    // Tabela de eventos
    autoTable(doc, {
      startY: yPos,
      head: [['Data', 'Tipo', 'Descrição']],
      body: detailedReport.events.slice(0, 20).map((event: any) => [
        formatDate(event.date),
        event.type || 'Evento',
        truncateText(event.description || event.title || '', 55)
      ]),
      theme: 'striped',
      headStyles: {
        fillColor: PDF_CONFIG.colors.primary,
        textColor: PDF_CONFIG.colors.text.white,
        fontStyle: 'bold',
        fontSize: 11
      },
      bodyStyles: {
        fontSize: 10,
        textColor: PDF_CONFIG.colors.text.secondary
      },
      alternateRowStyles: {
        fillColor: PDF_CONFIG.colors.backgrounds.gray
      },
      margin: {
        left: PDF_CONFIG.margins.left,
        right: PDF_CONFIG.margins.right
      },
      columnStyles: {
        0: { cellWidth: 30 },
        1: { cellWidth: 35 },
        2: { cellWidth: 'auto' }
      }
    });

    return (doc as any).autoTable?.previous?.finalY + 25 || yPos + 100;
  };

  const addIncidentsTable = (doc: jsPDF, yPos: number) => {
    if (!detailedReport.incidents || detailedReport.incidents.length === 0) return yPos;

    yPos = checkPageBreak(doc, yPos, 80);

    // Título da seção
    setTextStyle(doc, 'subtitle', PDF_CONFIG.colors.danger);
    doc.text("INCIDENTES E ANOMALIAS", PDF_CONFIG.margins.left, yPos);

    yPos += 15;

    // Tabela de incidentes
    autoTable(doc, {
      startY: yPos,
      head: [['Data', 'Tipo', 'Descrição', 'Severidade']],
      body: detailedReport.incidents.map((incident: any) => [
        formatDate(incident.date),
        incident.type || 'Incidente',
        truncateText(incident.description || '', 45),
        incident.severity || 'Média'
      ]),
      theme: 'grid',
      headStyles: {
        fillColor: PDF_CONFIG.colors.danger,
        textColor: PDF_CONFIG.colors.text.white,
        fontStyle: 'bold',
        fontSize: 11
      },
      bodyStyles: {
        fontSize: 10,
        textColor: PDF_CONFIG.colors.text.secondary
      },
      margin: {
        left: PDF_CONFIG.margins.left,
        right: PDF_CONFIG.margins.right
      },
      columnStyles: {
        0: { cellWidth: 25 },
        1: { cellWidth: 30 },
        2: { cellWidth: 'auto' },
        3: { cellWidth: 25 }
      }
    });

    return (doc as any).autoTable?.previous?.finalY + 25 || yPos + 100;
  };

  const addFooter = (doc: jsPDF) => {
    const totalPages = doc.getNumberOfPages();
    const pageWidth = doc.internal.pageSize.width;
    const pageHeight = doc.internal.pageSize.height;

    for (let i = 1; i <= totalPages; i++) {
      doc.setPage(i);

      // Linha separadora
      doc.setDrawColor(200, 200, 200);
      doc.setLineWidth(0.5);
      doc.line(PDF_CONFIG.margins.left, pageHeight - 30, pageWidth - PDF_CONFIG.margins.right, pageHeight - 30);

      // Texto do footer
      setTextStyle(doc, 'tiny', PDF_CONFIG.colors.text.muted);
      doc.text('ErvaApp - Gestao Inteligente de Cultivo Cannabis', PDF_CONFIG.margins.left, pageHeight - 18);
      doc.text(`Pagina ${i} de ${totalPages}`, pageWidth - 45, pageHeight - 18);
      doc.text('www.ervaapp.com', pageWidth - 45, pageHeight - 10);
    }
  };

  // === FUNÇÃO PRINCIPAL REESTRUTURADA ===
  const handleExportPDF = async () => {
    if (!detailedReport) {
      toast.error("Nenhum relatório selecionado");
      return;
    }

    const loadingToast = toast.loading("Gerando relatório PDF...");

    try {
      const doc = new jsPDF();
      let yPos = 0;

      // Adicionar seções do PDF
      yPos = addHeader(doc);
      yPos = addCultivationInfo(doc, yPos);
      yPos = addMetricsCards(doc, yPos);
      yPos = addDetailsSection(doc, yPos);
      yPos = addEventsTable(doc, yPos);
      yPos = addIncidentsTable(doc, yPos);

      // Adicionar footer em todas as páginas
      addFooter(doc);

      // Gerar nome do arquivo
      const sanitizedName = detailedReport.summary.name.replace(/[^a-zA-Z0-9]/g, '_');
      const timestamp = new Date().toISOString().split('T')[0];
      const fileName = `ErvaApp_Relatorio_${sanitizedName}_${timestamp}.pdf`;

      // Salvar o PDF
      doc.save(fileName);

      toast.dismiss(loadingToast);
      toast.success("Relatório PDF gerado com sucesso!", {
        description: `Arquivo: ${fileName}`
      });

    } catch (error) {
      console.error('Erro ao gerar PDF:', error);
      toast.dismiss(loadingToast);
      toast.error("Erro ao gerar relatório PDF", {
        description: "Tente novamente ou contate o suporte"
      });
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-emerald-50/30 to-teal-50/20">
      <div className="max-w-7xl mx-auto px-2 sm:px-4 py-4 sm:py-8">
        {/* Header moderno */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <div className="inline-flex items-center gap-4 mb-6">
            <div className="w-16 h-16 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-3xl flex items-center justify-center shadow-2xl">
              <FileText className="w-8 h-8 text-white" />
            </div>
            <div className="text-left">
              <h1 className="text-4xl font-bold bg-gradient-to-r from-slate-800 via-emerald-700 to-teal-700 bg-clip-text text-transparent">
                Relatórios Inteligentes
              </h1>
              <p className="text-slate-600 text-lg mt-1">
                Análises detalhadas e insights avançados dos seus cultivos
              </p>
            </div>
          </div>
        </motion.div>
        {/* Grid de cultivos modernizado */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-6 mb-8"
        >
          <AnimatePresence>
            {cultivations.map((cultivation, index) => (
              <motion.div
                key={cultivation.id}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ delay: index * 0.1 }}
                whileHover={{ scale: 1.02 }}
                className="cursor-pointer"
                onClick={() => {
                  setSelectedCultivationId(cultivation.id);
                  setShowPreview(true);
                }}
              >
                <Card className={`h-full transition-all duration-300 ${selectedCultivationId === cultivation.id
                  ? 'ring-2 ring-emerald-500 shadow-xl bg-emerald-50/50'
                  : 'hover:shadow-lg bg-white/80 backdrop-blur-sm'
                  }`}>
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-lg font-bold text-slate-800">
                        {cultivation.name}
                      </CardTitle>
                      <Badge className={`${cultivation.status === "active" ? "bg-blue-100 text-blue-800 border-blue-200" :
                        cultivation.status === "completed" ? "bg-green-100 text-green-800 border-green-200" :
                          "bg-gray-100 text-gray-800 border-gray-200"
                        }`}>
                        {cultivation.status === "active" ? "Ativo" :
                          cultivation.status === "completed" ? "Concluído" : "Arquivado"}
                      </Badge>
                    </div>
                    <p className="text-slate-600 text-sm">{cultivation.seedStrain}</p>
                  </CardHeader>

                  <CardContent className="pt-0">
                    <div className="grid grid-cols-2 gap-4 mb-4">
                      <div className="text-center">
                        <div className="flex items-center justify-center gap-1 mb-1">
                          <Leaf className="w-4 h-4 text-emerald-600" />
                          <span className="text-xs text-slate-500">Rendimento</span>
                        </div>
                        <p className="font-bold text-emerald-600">{cultivation.yield_g}g</p>
                      </div>

                      <div className="text-center">
                        <div className="flex items-center justify-center gap-1 mb-1">
                          <Clock className="w-4 h-4 text-blue-600" />
                          <span className="text-xs text-slate-500">Duração</span>
                        </div>
                        <p className="font-bold text-blue-600">{cultivation.durationDays}d</p>
                      </div>
                    </div>

                    <div className="flex items-center justify-between text-xs text-slate-500">
                      <span>Início: {new Date(cultivation.startDate).toLocaleDateString('pt-BR')}</span>
                      {cultivation.hasSevereProblems && (
                        <AlertTriangle className="w-4 h-4 text-orange-500" />
                      )}
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </AnimatePresence>
        </motion.div>
        {/* Relatório detalhado modernizado */}
        <AnimatePresence>
          {showPreview && detailedReport && (
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 30 }}
              transition={{ duration: 0.5 }}
            >
              <Card className="bg-white/95 backdrop-blur-sm shadow-2xl border-0">
                <CardHeader className="bg-gradient-to-r from-emerald-600 via-green-600 to-teal-600 text-white p-4 sm:p-8">
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                    <div>
                      <CardTitle className="text-lg sm:text-2xl font-bold mb-2">
                        Relatório Técnico - {detailedReport.summary.name}
                      </CardTitle>
                      <p className="text-emerald-100 text-sm sm:text-base">
                        {detailedReport.summary.seedStrain} • Análise Completa
                      </p>
                    </div>

                    <div className="flex items-center gap-2 sm:gap-3 w-full sm:w-auto">
                      <Button
                        onClick={handleExportPDF}
                        className="bg-white/20 hover:bg-white/30 text-white border-white/30 flex-1 sm:flex-none text-xs sm:text-sm"
                        size="sm"
                      >
                        <Download className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
                        PDF
                      </Button>

                      <Button
                        variant="outline"
                        className="bg-white/20 hover:bg-white/30 text-white border-white/30 flex-1 sm:flex-none text-xs sm:text-sm"
                        size="sm"
                      >
                        <Share2 className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
                        <span className="hidden sm:inline">Compartilhar</span>
                        <span className="sm:hidden">Share</span>
                      </Button>
                    </div>
                  </div>
                </CardHeader>

                <CardContent className="p-4 sm:p-8">
                  {/* Cards de métricas principais */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-6 mb-8">
                    <Card className="bg-gradient-to-br from-emerald-50 to-green-50 border-emerald-200">
                      <CardContent className="p-3 md:p-6">
                        <div className="flex flex-col md:flex-row items-center gap-2 md:gap-3">
                          <div className="w-8 h-8 md:w-12 md:h-12 bg-emerald-500 rounded-xl flex items-center justify-center">
                            <Leaf className="w-4 h-4 md:w-6 md:h-6 text-white" />
                          </div>
                          <div className="text-center md:text-left">
                            <p className="text-xs md:text-sm text-emerald-600 font-medium">Rendimento</p>
                            <p className="text-lg md:text-2xl font-bold text-emerald-700">{detailedReport.summary.yield_g}g</p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>

                    <Card className="bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-200">
                      <CardContent className="p-3 md:p-6">
                        <div className="flex flex-col md:flex-row items-center gap-2 md:gap-3">
                          <div className="w-8 h-8 md:w-12 md:h-12 bg-blue-500 rounded-xl flex items-center justify-center">
                            <Zap className="w-4 h-4 md:w-6 md:h-6 text-white" />
                          </div>
                          <div className="text-center md:text-left">
                            <p className="text-xs md:text-sm text-blue-600 font-medium">Eficiência</p>
                            <p className="text-lg md:text-2xl font-bold text-blue-700">{detailedReport.results?.gramas_por_watt?.toFixed(2) || '0'}</p>
                            <p className="text-xs text-blue-500">g/W</p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>

                    <Card className="bg-gradient-to-br from-purple-50 to-pink-50 border-purple-200">
                      <CardContent className="p-3 md:p-6">
                        <div className="flex flex-col md:flex-row items-center gap-2 md:gap-3">
                          <div className="w-8 h-8 md:w-12 md:h-12 bg-purple-500 rounded-xl flex items-center justify-center">
                            <TrendingUp className="w-4 h-4 md:w-6 md:h-6 text-white" />
                          </div>
                          <div className="text-center md:text-left">
                            <p className="text-xs md:text-sm text-purple-600 font-medium">ROI</p>
                            <p className="text-lg md:text-2xl font-bold text-purple-700">{detailedReport.results?.roi_investimento_1_ano?.toFixed(1) || '0'}%</p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>

                    <Card className="bg-gradient-to-br from-orange-50 to-red-50 border-orange-200">
                      <CardContent className="p-3 md:p-6">
                        <div className="flex flex-col md:flex-row items-center gap-2 md:gap-3">
                          <div className="w-8 h-8 md:w-12 md:h-12 bg-orange-500 rounded-xl flex items-center justify-center">
                            <DollarSign className="w-4 h-4 md:w-6 md:h-6 text-white" />
                          </div>
                          <div className="text-center md:text-left">
                            <p className="text-xs md:text-sm text-orange-600 font-medium">Custo/g</p>
                            <p className="text-lg md:text-2xl font-bold text-orange-700">R$ {detailedReport.results?.custo_por_grama?.toFixed(2) || '0'}</p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </div>

                  {/* Informações detalhadas */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-8 mb-8">
                    <Card className="bg-slate-50 border-slate-200">
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <Calendar className="w-5 h-5 text-slate-600" />
                          Resumo do Cultivo
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-3">
                        <div className="flex justify-between">
                          <span className="text-slate-600">Genética:</span>
                          <span className="font-semibold">{detailedReport.summary.seedStrain}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-600">Início:</span>
                          <span className="font-semibold">{new Date(detailedReport.summary.startDate).toLocaleDateString('pt-BR')}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-600">Fim:</span>
                          <span className="font-semibold">{detailedReport.summary.endDate ? new Date(detailedReport.summary.endDate).toLocaleDateString('pt-BR') : 'Em andamento'}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-600">Duração:</span>
                          <span className="font-semibold">{detailedReport.summary.durationDays} dias</span>
                        </div>
                      </CardContent>
                    </Card>

                    <Card className="bg-slate-50 border-slate-200">
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <BarChart3 className="w-5 h-5 text-slate-600" />
                          Métricas Avançadas
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-3">
                        <div className="flex justify-between">
                          <span className="text-slate-600">Eficiência:</span>
                          <span className="font-semibold text-blue-600">{detailedReport.results?.gramas_por_watt?.toFixed(2) || '-'} g/W</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-600">Custo por grama:</span>
                          <span className="font-semibold text-orange-600">R$ {detailedReport.results?.custo_por_grama?.toFixed(2) || '-'}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-600">ROI 1 ano:</span>
                          <span className="font-semibold text-purple-600">{detailedReport.results?.roi_investimento_1_ano?.toFixed(1) || '-'}%</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-600">Payback:</span>
                          <span className="font-semibold text-green-600">{detailedReport.results?.periodo_payback_ciclos?.toFixed(1) || '-'} ciclos</span>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                  <div className="mt-10 border-t pt-8">
                    <h4 className="font-semibold mb-2 text-lg">Eventos do Cultivo</h4>
                    <ul className="text-base text-gray-700 space-y-1">
                      {detailedReport.events.length === 0 && <li>Nenhum evento registrado.</li>}
                      {detailedReport.events.map((ev: any, i: number) => (
                        <li key={i}>• {ev.date}: {ev.description}</li>
                      ))}
                    </ul>
                  </div>
                  <div className="mt-10 border-t pt-8">
                    <h4 className="font-semibold mb-2 text-lg">Incidentes/Anomalias</h4>
                    <ul className="text-base text-gray-700 space-y-1">
                      {detailedReport.incidents.length === 0 && <li>Nenhum incidente registrado.</li>}
                      {detailedReport.incidents.map((inc: any, i: number) => (
                        <li key={i}>• {inc.date}: {inc.description}</li>
                      ))}
                    </ul>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Estado vazio */}
        {!isLoading && cultivations.length === 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-12"
          >
            <div className="w-24 h-24 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <FileText className="w-12 h-12 text-slate-400" />
            </div>
            <h3 className="text-xl font-semibold text-slate-700 mb-2">Nenhum cultivo encontrado</h3>
            <p className="text-slate-500">Crie seu primeiro cultivo para gerar relatórios detalhados.</p>
          </motion.div>
        )}
      </div>
    </div>
  )
}
