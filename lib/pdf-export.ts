import jsPDF from 'jspdf'
import 'jspdf-autotable'
import type { CultivationSummary, CultivationEvent } from './mock-data'

// Extend jsPDF type to include autoTable
declare module 'jspdf' {
  interface jsPDF {
    autoTable: (options: any) => jsPDF
  }
}

interface ChartData {
  labels: string[]
  values: number[]
  colors?: string[]
}

interface PDFExportOptions {
  cultivation: CultivationSummary
  events: CultivationEvent[]
  includeTimeline?: boolean
  includeFinancials?: boolean
  includeAnalytics?: boolean
}

export class PDFExporter {
  private doc: jsPDF
  private pageHeight: number
  private pageWidth: number
  private margin: number
  private currentY: number

  constructor() {
    this.doc = new jsPDF()
    this.pageHeight = this.doc.internal.pageSize.height
    this.pageWidth = this.doc.internal.pageSize.width
    this.margin = 20
    this.currentY = this.margin
  }

  private formatCurrency(value: number): string {
    return new Intl.NumberFormat("pt-BR", { 
      style: "currency", 
      currency: "BRL" 
    }).format(value)
  }

  private formatDate(dateString: string): string {
    return new Date(dateString).toLocaleDateString("pt-BR")
  }

  private addTitle(title: string, fontSize: number = 16): void {
    this.doc.setFontSize(fontSize)
    this.doc.setFont("helvetica", "bold")
    this.doc.text(title, this.margin, this.currentY)
    this.currentY += fontSize * 0.6
  }

  private addSubtitle(subtitle: string, fontSize: number = 12): void {
    this.doc.setFontSize(fontSize)
    this.doc.setFont("helvetica", "normal")
    this.doc.text(subtitle, this.margin, this.currentY)
    this.currentY += fontSize * 0.6
  }

  private addText(text: string, fontSize: number = 10): void {
    this.doc.setFontSize(fontSize)
    this.doc.setFont("helvetica", "normal")
    this.doc.text(text, this.margin, this.currentY)
    this.currentY += fontSize * 0.6
  }

  private addSpace(space: number = 10): void {
    this.currentY += space
  }

  private checkPageBreak(requiredSpace: number = 30): void {
    if (this.currentY + requiredSpace > this.pageHeight - this.margin) {
      this.doc.addPage()
      this.currentY = this.margin
    }
  }

  private addHeader(): void {
    // Logo placeholder
    this.doc.setFillColor(16, 185, 129) // green-500
    this.doc.rect(this.margin, this.margin, 15, 15, 'F')
    
    // Title
    this.doc.setFontSize(20)
    this.doc.setFont("helvetica", "bold")
    this.doc.text("Relatório de Cultivo", this.margin + 20, this.margin + 10)
    
    // Date
    this.doc.setFontSize(10)
    this.doc.setFont("helvetica", "normal")
    this.doc.text(`Gerado em: ${new Date().toLocaleString("pt-BR")}`, 
                  this.pageWidth - this.margin - 50, this.margin + 5)
    
    this.currentY = this.margin + 25
    this.addSpace(10)
  }

  private addCultivationInfo(cultivation: CultivationSummary): void {
    this.addTitle("Informações do Cultivo", 14)
    this.addSpace(5)

    const info = [
      ["Nome", cultivation.name],
      ["Variedade", cultivation.seedStrain],
      ["Data de Início", this.formatDate(cultivation.startDate)],
      ["Data de Fim", cultivation.endDate ? this.formatDate(cultivation.endDate) : "Em andamento"],
      ["Status", cultivation.status === "active" ? "Ativo" : 
                cultivation.status === "completed" ? "Concluído" : "Arquivado"],
      ["Duração", `${cultivation.durationDays} dias`],
      ["Problemas Graves", cultivation.hasSevereProblems ? "Sim" : "Não"]
    ]

    this.doc.autoTable({
      startY: this.currentY,
      head: [["Campo", "Valor"]],
      body: info,
      theme: 'grid',
      styles: { fontSize: 10 },
      headStyles: { fillColor: [16, 185, 129] },
      margin: { left: this.margin, right: this.margin }
    })

    this.currentY = (this.doc as any).lastAutoTable.finalY + 15
  }

  private addFinancialSummary(cultivation: CultivationSummary): void {
    this.checkPageBreak(80)
    this.addTitle("Resumo Financeiro", 14)
    this.addSpace(5)

    // Calcular métricas financeiras
    const estimatedRevenue = cultivation.profit_brl + 1000 // Assumindo custos de R$ 1000
    const estimatedCosts = 1000
    const roi = cultivation.profit_brl > 0 ? (cultivation.profit_brl / estimatedCosts) * 100 : 0
    const efficiency = cultivation.durationDays > 0 ? cultivation.yield_g / cultivation.durationDays : 0

    const financialData = [
      ["Receita Estimada", this.formatCurrency(estimatedRevenue)],
      ["Custos Operacionais", this.formatCurrency(estimatedCosts)],
      ["Lucro Líquido", this.formatCurrency(cultivation.profit_brl)],
      ["ROI", `${roi.toFixed(1)}%`],
      ["Rendimento Total", `${cultivation.yield_g}g`],
      ["Eficiência", `${efficiency.toFixed(2)} g/dia`]
    ]

    this.doc.autoTable({
      startY: this.currentY,
      head: [["Métrica", "Valor"]],
      body: financialData,
      theme: 'grid',
      styles: { fontSize: 10 },
      headStyles: { fillColor: [34, 197, 94] },
      margin: { left: this.margin, right: this.margin }
    })

    this.currentY = (this.doc as any).lastAutoTable.finalY + 15
  }

  private addTimeline(events: CultivationEvent[]): void {
    if (events.length === 0) return

    this.checkPageBreak(100)
    this.addTitle("Timeline de Eventos", 14)
    this.addSpace(5)

    const sortedEvents = [...events].sort((a, b) => 
      new Date(a.date).getTime() - new Date(b.date).getTime()
    )

    const timelineData = sortedEvents.map(event => [
      this.formatDate(event.date),
      event.type,
      event.description,
      event.details ? Object.entries(event.details)
        .map(([key, value]) => `${key}: ${value}`)
        .join(", ") : ""
    ])

    this.doc.autoTable({
      startY: this.currentY,
      head: [["Data", "Tipo", "Descrição", "Detalhes"]],
      body: timelineData,
      theme: 'grid',
      styles: { fontSize: 9 },
      headStyles: { fillColor: [59, 130, 246] },
      margin: { left: this.margin, right: this.margin },
      columnStyles: {
        0: { cellWidth: 25 },
        1: { cellWidth: 30 },
        2: { cellWidth: 50 },
        3: { cellWidth: 60 }
      }
    })

    this.currentY = (this.doc as any).lastAutoTable.finalY + 15
  }

  private addAnalytics(cultivation: CultivationSummary, events: CultivationEvent[]): void {
    this.checkPageBreak(100)
    this.addTitle("Análise de Performance", 14)
    this.addSpace(5)

    // Calcular estatísticas
    const irrigationEvents = events.filter(e => e.type === "irrigation").length
    const fertilizationEvents = events.filter(e => e.type === "fertilization").length
    const avgDaysBetweenIrrigation = cultivation.durationDays > 0 && irrigationEvents > 0 
      ? cultivation.durationDays / irrigationEvents : 0
    const avgDaysBetweenFertilization = cultivation.durationDays > 0 && fertilizationEvents > 0 
      ? cultivation.durationDays / fertilizationEvents : 0

    const analyticsData = [
      ["Total de Eventos", events.length.toString()],
      ["Irrigações", irrigationEvents.toString()],
      ["Fertilizações", fertilizationEvents.toString()],
      ["Média entre Irrigações", `${avgDaysBetweenIrrigation.toFixed(1)} dias`],
      ["Média entre Fertilizações", `${avgDaysBetweenFertilization.toFixed(1)} dias`],
      ["Rendimento por m²", "N/A"], // Seria calculado se tivéssemos área
      ["Custo por Grama", cultivation.yield_g > 0 ? this.formatCurrency(1000 / cultivation.yield_g) : "N/A"]
    ]

    this.doc.autoTable({
      startY: this.currentY,
      head: [["Métrica", "Valor"]],
      body: analyticsData,
      theme: 'grid',
      styles: { fontSize: 10 },
      headStyles: { fillColor: [168, 85, 247] },
      margin: { left: this.margin, right: this.margin }
    })

    this.currentY = (this.doc as any).lastAutoTable.finalY + 15
  }

  private addRecommendations(cultivation: CultivationSummary, events: CultivationEvent[]): void {
    this.checkPageBreak(80)
    this.addTitle("Recomendações", 14)
    this.addSpace(5)

    const recommendations: string[] = []

    // Análise baseada em performance
    if (cultivation.profit_brl < 500) {
      recommendations.push("• Considere otimizar os custos operacionais para melhorar a lucratividade")
    }

    if (cultivation.yield_g < 50) {
      recommendations.push("• Rendimento abaixo do esperado - revise técnicas de cultivo e nutrição")
    }

    if (cultivation.durationDays > 120) {
      recommendations.push("• Ciclo longo - considere variedades de crescimento mais rápido")
    }

    // Análise baseada em eventos
    const irrigationEvents = events.filter(e => e.type === "irrigation")
    if (irrigationEvents.length < cultivation.durationDays / 7) {
      recommendations.push("• Frequência de irrigação pode estar baixa - monitore mais de perto")
    }

    const fertilizationEvents = events.filter(e => e.type === "fertilization")
    if (fertilizationEvents.length < cultivation.durationDays / 14) {
      recommendations.push("• Considere aumentar a frequência de fertilização")
    }

    if (cultivation.hasSevereProblems) {
      recommendations.push("• Implemente medidas preventivas para evitar problemas futuros")
    }

    if (recommendations.length === 0) {
      recommendations.push("• Excelente trabalho! Continue seguindo as práticas atuais")
      recommendations.push("• Documente as técnicas que funcionaram bem para replicar")
    }

    recommendations.forEach(rec => {
      this.addText(rec, 10)
      this.addSpace(3)
    })
  }

  private addFooter(): void {
    const pageCount = this.doc.getNumberOfPages()
    
    for (let i = 1; i <= pageCount; i++) {
      this.doc.setPage(i)
      this.doc.setFontSize(8)
      this.doc.setFont("helvetica", "normal")
      this.doc.text(
        `Página ${i} de ${pageCount}`,
        this.pageWidth - this.margin - 20,
        this.pageHeight - 10
      )
      this.doc.text(
        "Gerado por ErvApp",
        this.margin,
        this.pageHeight - 10
      )
    }
  }

  public generateReport(options: PDFExportOptions): jsPDF {
    const { cultivation, events, includeTimeline = true, includeFinancials = true, includeAnalytics = true } = options

    // Header
    this.addHeader()

    // Cultivation Info
    this.addCultivationInfo(cultivation)

    // Financial Summary
    if (includeFinancials) {
      this.addFinancialSummary(cultivation)
    }

    // Timeline
    if (includeTimeline && events.length > 0) {
      this.addTimeline(events)
    }

    // Analytics
    if (includeAnalytics) {
      this.addAnalytics(cultivation, events)
    }

    // Recommendations
    this.addRecommendations(cultivation, events)

    // Footer
    this.addFooter()

    return this.doc
  }

  public downloadPDF(filename: string): void {
    this.doc.save(filename)
  }

  public getPDFBlob(): Blob {
    return this.doc.output('blob')
  }
}

// Função utilitária para exportar relatório
export function exportCultivationReport(
  cultivation: CultivationSummary,
  events: CultivationEvent[],
  options: Partial<PDFExportOptions> = {}
): void {
  const exporter = new PDFExporter()
  const doc = exporter.generateReport({
    cultivation,
    events,
    ...options
  })
  
  const filename = `relatorio_${cultivation.name.replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.pdf`
  exporter.downloadPDF(filename)
}

// Função para gerar relatório consolidado de múltiplos cultivos
export function exportConsolidatedReport(cultivations: CultivationSummary[]): void {
  const doc = new jsPDF()
  let currentY = 20

  // Header
  doc.setFontSize(20)
  doc.setFont("helvetica", "bold")
  doc.text("Relatório Consolidado de Cultivos", 20, currentY)
  currentY += 20

  // Summary stats
  const totalCultivations = cultivations.length
  const totalProfit = cultivations.reduce((sum, c) => sum + c.profit_brl, 0)
  const totalYield = cultivations.reduce((sum, c) => sum + c.yield_g, 0)
  const avgDuration = cultivations.reduce((sum, c) => sum + c.durationDays, 0) / totalCultivations

  const summaryData = [
    ["Total de Cultivos", totalCultivations.toString()],
    ["Lucro Total", new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(totalProfit)],
    ["Rendimento Total", `${totalYield}g`],
    ["Duração Média", `${avgDuration.toFixed(0)} dias`],
    ["Lucro Médio", new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(totalProfit / totalCultivations)]
  ]

  doc.autoTable({
    startY: currentY,
    head: [["Métrica", "Valor"]],
    body: summaryData,
    theme: 'grid',
    styles: { fontSize: 10 },
    headStyles: { fillColor: [16, 185, 129] }
  })

  currentY = (doc as any).lastAutoTable.finalY + 20

  // Individual cultivation summary
  const cultivationData = cultivations.map(c => [
    c.name,
    c.seedStrain,
    new Date(c.startDate).toLocaleDateString("pt-BR"),
    c.status === "active" ? "Ativo" : c.status === "completed" ? "Concluído" : "Arquivado",
    `${c.yield_g}g`,
    new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(c.profit_brl)
  ])

  doc.autoTable({
    startY: currentY,
    head: [["Nome", "Variedade", "Início", "Status", "Rendimento", "Lucro"]],
    body: cultivationData,
    theme: 'grid',
    styles: { fontSize: 9 },
    headStyles: { fillColor: [59, 130, 246] }
  })

  const filename = `relatorio_consolidado_${new Date().toISOString().split('T')[0]}.pdf`
  doc.save(filename)
}