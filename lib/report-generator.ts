// Importe jsPDF primeiro para garantir que o objeto jsPDF esteja disponível
import jsPDF from "jspdf"
// Em seguida, importe o plugin jspdf-autotable, que irá estender o protótipo de jsPDF
import "jspdf-autotable"

export async function generateExcelReport(results: any, setupParams: any, cycleParams: any, marketParams: any) {
  const csvContent = `
Relatório de Análise Financeira - ErvApp
Gerado em: ${new Date().toLocaleDateString("pt-BR")}

RESUMO EXECUTIVO
Métrica,Valor
Lucro por Ciclo,R$ ${results.lucro_liquido_ciclo.toFixed(2)}
ROI Anual,${results.roi_investimento_1_ano.toFixed(1)}%
Payback,${results.periodo_payback_ciclos.toFixed(1)} ciclos
Eficiência,${results.gramas_por_watt.toFixed(2)} g/W

ANÁLISE FINANCEIRA
Investimento Total,R$ ${results.custo_total_investimento.toFixed(2)}
Custo Operacional por Ciclo,R$ ${results.custo_operacional_total_ciclo.toFixed(2)}
Receita Bruta por Ciclo,R$ ${results.receita_bruta_ciclo.toFixed(2)}
Lucro Líquido por Ciclo,R$ ${results.lucro_liquido_ciclo.toFixed(2)}

CUSTOS OPERACIONAIS
${Object.entries(results.detalhe_custos_operacionais)
  .map(([key, value]: [string, any]) => `${key},R$ ${value.toFixed(2)}`)
  .join("\n")}

PARÂMETROS DE SETUP
Área de Cultivo,${setupParams.area_m2} m²
Custo Iluminação,R$ ${setupParams.custo_equip_iluminacao}
Custo Estrutura,R$ ${setupParams.custo_tenda_estrutura}
Custo Ventilação,R$ ${setupParams.custo_ventilacao_exaustao}
Outros Equipamentos,R$ ${setupParams.custo_outros_equipamentos}

PARÂMETROS DO CICLO
Potência,${cycleParams.potencia_watts}W
Número de Plantas,${cycleParams.num_plantas}
Produção por Planta,${cycleParams.producao_por_planta_g}g
Dias Vegetativo,${cycleParams.dias_vegetativo}
Dias Floração,${cycleParams.dias_floracao}
Dias Secagem/Cura,${cycleParams.dias_secagem_cura}
Duração Total,${results.duracao_total_ciclo} dias

PARÂMETROS DE MERCADO
Preço kWh,R$ ${marketParams.preco_kwh}
Custo Sementes/Clones,R$ ${marketParams.custo_sementes_clones}
Custo Substrato,R$ ${marketParams.custo_substrato}
Custo Nutrientes,R$ ${marketParams.custo_nutrientes}
Outros Custos,R$ ${marketParams.custos_operacionais_misc}
Preço de Venda,R$ ${marketParams.preco_venda_por_grama}/g
  `

  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" })
  const url = URL.createObjectURL(blob)
  const a = document.createElement("a")
  a.href = url
  a.download = `analise-financeira-${new Date().toISOString().split("T")[0]}.csv`
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
}

export async function generateExecutiveSummary(results: any, setupParams: any, cycleParams: any, marketParams: any) {
  const doc = new jsPDF()

  const pageWidth = doc.internal.pageSize.width
  const pageHeight = doc.internal.pageSize.height
  let yPosition = 20

  // Cabeçalho com estilo profissional
  doc.setFillColor(34, 197, 94)
  doc.rect(0, 0, pageWidth, 40, "F")

  doc.setTextColor(255, 255, 255)
  doc.setFontSize(24)
  doc.setFont("helvetica", "bold")
  doc.text("RESUMO EXECUTIVO", pageWidth / 2, 20, { align: "center" })

  doc.setFontSize(14)
      doc.text("Análise de Viabilidade - ErvApp", pageWidth / 2, 30, { align: "center" })

  // Resetar cores e posição
  doc.setTextColor(0, 0, 0)
  yPosition = 60

  // Data e informações da empresa
  doc.setFontSize(10)
  doc.text(`Data: ${new Date().toLocaleDateString("pt-BR")}`, 20, yPosition)
  doc.text(`Documento: ${Math.random().toString(36).substr(2, 9).toUpperCase()}`, pageWidth - 20, yPosition, {
    align: "right",
  })
  yPosition += 20

  // Caixa de Resumo Executivo
  doc.setFillColor(248, 250, 252)
  doc.rect(15, yPosition - 5, pageWidth - 30, 60, "F")
  doc.setDrawColor(203, 213, 225)
  doc.rect(15, yPosition - 5, pageWidth - 30, 60, "S")

  // Status de Viabilidade
  const isViable = results.lucro_liquido_ciclo > 0
  doc.setFontSize(16)
  doc.setFont("helvetica", "bold")
  doc.setTextColor(isViable ? 34 : 239, isViable ? 197 : 68, isViable ? 94 : 68)
  doc.text(isViable ? "✓ PROJETO VIÁVEL" : "✗ PROJETO INVIÁVEL", pageWidth / 2, yPosition + 10, { align: "center" })

  doc.setTextColor(0, 0, 0)
  doc.setFontSize(12)
  doc.setFont("helvetica", "normal")

  const summaryText = isViable
    ? "O projeto apresenta viabilidade financeira positiva com potencial de retorno atrativo."
    : "O projeto requer ajustes nos parâmetros para alcançar viabilidade financeira."

  doc.text(summaryText, pageWidth / 2, yPosition + 25, { align: "center", maxWidth: pageWidth - 40 })

  // Métricas chave em um layout profissional
  yPosition += 45
  doc.setFontSize(14)
  doc.setFont("helvetica", "bold")
  doc.text("INDICADORES PRINCIPAIS", pageWidth / 2, yPosition, { align: "center" })
  yPosition += 15

  // Criar caixas de métricas
  const metrics = [
    {
      label: "Lucro por Ciclo",
      value: `R$ ${results.lucro_liquido_ciclo.toFixed(2)}`,
      color: isViable ? [34, 197, 94] : [239, 68, 68],
    },
    { label: "ROI Anual", value: `${results.roi_investimento_1_ano.toFixed(1)}%`, color: [59, 130, 246] },
    { label: "Payback", value: `${results.periodo_payback_ciclos.toFixed(1)} ciclos`, color: [245, 158, 11] },
    { label: "Eficiência", value: `${results.gramas_por_watt.toFixed(2)} g/W`, color: [139, 92, 246] },
  ]

  const boxWidth = (pageWidth - 60) / 2
  const boxHeight = 35

  metrics.forEach((metric, index) => {
    const x = 20 + (index % 2) * (boxWidth + 20)
    const y = yPosition + Math.floor(index / 2) * (boxHeight + 10)

    // Fundo da caixa
    doc.setFillColor(248, 250, 252)
    doc.rect(x, y, boxWidth, boxHeight, "F")
    doc.setDrawColor(metric.color[0], metric.color[1], metric.color[2])
    doc.setLineWidth(2)
    doc.rect(x, y, boxWidth, boxHeight, "S")

    // Valor da métrica
    doc.setTextColor(metric.color[0], metric.color[1], metric.color[2])
    doc.setFontSize(16)
    doc.setFont("helvetica", "bold")
    doc.text(metric.value, x + boxWidth / 2, y + 15, { align: "center" })

    // Rótulo da métrica
    doc.setTextColor(0, 0, 0)
    doc.setFontSize(10)
    doc.setFont("helvetica", "normal")
    doc.text(metric.label, x + boxWidth / 2, y + 25, { align: "center" })
  })

  yPosition += 90

  // Análise de Investimento
  doc.setFontSize(14)
  doc.setFont("helvetica", "bold")
  doc.text("ANÁLISE DE INVESTIMENTO", 20, yPosition)
  yPosition += 15

  const investmentData = [
    `Investimento Inicial: R$ ${results.custo_total_investimento.toFixed(2)}`,
    `Custo Operacional/Ciclo: R$ ${results.custo_operacional_total_ciclo.toFixed(2)}`,
    `Receita Projetada/Ciclo: R$ ${results.receita_bruta_ciclo.toFixed(2)}`,
    `Margem de Lucro: ${((results.lucro_liquido_ciclo / results.receita_bruta_ciclo) * 100).toFixed(1)}%`,
  ]

  doc.setFontSize(11)
  doc.setFont("helvetica", "normal")
  investmentData.forEach((text) => {
    doc.text(`• ${text}`, 25, yPosition)
    yPosition += 8
  })

  yPosition += 10

  // Recomendações
  doc.setFontSize(14)
  doc.setFont("helvetica", "bold")
  doc.text("RECOMENDAÇÕES ESTRATÉGICAS", 20, yPosition)
  yPosition += 15

  const getRecommendations = () => {
    const recs: string[] = []

    if (results.roi_investimento_1_ano > 20) {
      recs.push("INVESTIR IMEDIATAMENTE - Excelente oportunidade com alto retorno.")
    } else if (results.roi_investimento_1_ano > 10) {
      recs.push("CONSIDERAR INVESTIMENTO - Boa oportunidade, avaliar otimizações.")
    } else {
      recs.push("REVISAR PARÂMETROS - Ajustar configurações para melhorar viabilidade.")
    }

    if (results.gramas_por_watt < 1) {
      recs.push("Otimizar sistema de iluminação para maior eficiência energética.")
    }

    if (results.periodo_payback_ciclos > 10) {
      recs.push("Reduzir custos operacionais ou aumentar preço de venda.")
    }

    if (results.lucro_liquido_ciclo > 0) {
      recs.push("Considerar expansão da operação após validação inicial.")
    }

    return recs
  }

  const recommendations = getRecommendations()
  doc.setFontSize(11)
  doc.setFont("helvetica", "normal")

  recommendations.forEach((rec) => {
    doc.text(`• ${rec}`, 25, yPosition, { maxWidth: pageWidth - 50 })
    yPosition += 12
  })

  // Avaliação de Riscos
  yPosition += 10
  doc.setFontSize(14)
  doc.setFont("helvetica", "bold")
  doc.text("AVALIAÇÃO DE RISCOS", 20, yPosition)
  yPosition += 15

  const riskLevel =
    results.roi_investimento_1_ano > 15 ? "BAIXO" : results.roi_investimento_1_ano > 5 ? "MÉDIO" : "ALTO"
  const riskColor =
    results.roi_investimento_1_ano > 15
      ? [34, 197, 94]
      : results.roi_investimento_1_ano > 5
        ? [245, 158, 11]
        : [239, 68, 68]

  doc.setTextColor(riskColor[0], riskColor[1], riskColor[2])
  doc.setFontSize(12)
  doc.setFont("helvetica", "bold")
  doc.text(`Nível de Risco: ${riskLevel}`, 25, yPosition)

  doc.setTextColor(0, 0, 0)
  doc.setFont("helvetica", "normal")
  yPosition += 10

  const riskFactors = [
    "Flutuações no preço de energia elétrica",
    "Variações na produtividade das plantas",
    "Mudanças na regulamentação do setor",
    "Custos de manutenção de equipamentos",
  ]

  riskFactors.forEach((factor) => {
    doc.text(`• ${factor}`, 30, yPosition)
    yPosition += 8
  })

  // Rodapé
  doc.setFillColor(248, 250, 252)
  doc.rect(0, pageHeight - 20, pageWidth, 20, "F")
  doc.setTextColor(100, 116, 139)
  doc.setFontSize(8)
  doc.text(
          "Este documento foi gerado automaticamente pelo sistema ErvApp",
    pageWidth / 2,
    pageHeight - 12,
    {
      align: "center",
    },
  )

  // Salvar o PDF
  doc.save(`resumo-executivo-${new Date().toISOString().split("T")[0]}.pdf`)
}

export async function generateAnomalyAnalysisPDF(analysis: any, cultivation: any) {
  const doc = new jsPDF()

  const pageWidth = doc.internal.pageSize.width
  const pageHeight = doc.internal.pageSize.height
  const maxWidth = pageWidth - 40
  let yPosition = 20

  // Cabeçalho com estilo profissional
  doc.setFillColor(34, 197, 94)
  doc.rect(0, 0, pageWidth, 40, "F")

  doc.setTextColor(255, 255, 255)
  doc.setFontSize(24)
  doc.setFont("helvetica", "bold")
  doc.text("RELATÓRIO DE ANÁLISE DE ALERTAS IA", pageWidth / 2, 20, { align: "center" })

  doc.setFontSize(14)
  doc.text("Google Gemini AI - ErvApp", pageWidth / 2, 30, { align: "center" })

  // Resetar cores e posição
  doc.setTextColor(0, 0, 0)
  yPosition = 60

  // Informações do cultivo
  doc.setFontSize(12)
  doc.setFont("helvetica", "bold")
  doc.text("INFORMAÇÕES DO CULTIVO", 20, yPosition)
  yPosition += 15

  doc.setFontSize(10)
  doc.setFont("helvetica", "normal")
  doc.text(`Nome: ${cultivation.name}`, 25, yPosition)
  yPosition += 8
  doc.text(`Strain: ${cultivation.strain}`, 25, yPosition)
  yPosition += 8
  doc.text(`Fase: ${cultivation.phase}`, 25, yPosition)
  yPosition += 8
  doc.text(`Data da Análise: ${new Date(analysis.timestamp).toLocaleString("pt-BR")}`, 25, yPosition)
  yPosition += 15

  // Análise Geral
  if (analysis.analysis) {
    doc.setFontSize(12)
    doc.setFont("helvetica", "bold")
    doc.text("ANÁLISE", 20, yPosition)
    yPosition += 15

    doc.setFontSize(10)
    doc.setFont("helvetica", "normal")
    
    // Quebrar o texto em linhas para caber na página
    const analysisText = analysis.analysis
    const lines = doc.splitTextToSize(analysisText, maxWidth)
    
    lines.forEach((line: string) => {
      if (yPosition > pageHeight - 60) {
        doc.addPage()
        yPosition = 20
      }
      doc.text(line, 25, yPosition)
      yPosition += 6
    })
    yPosition += 10
  }

  // Recomendações
  if (analysis.recommendations && analysis.recommendations.length > 0) {
    if (yPosition > pageHeight - 100) {
      doc.addPage()
      yPosition = 20
    }

    doc.setFontSize(12)
    doc.setFont("helvetica", "bold")
    doc.text("RECOMENDAÇÕES", 20, yPosition)
    yPosition += 15

    analysis.recommendations.forEach((recommendation: string, index: number) => {
      if (yPosition > pageHeight - 60) {
        doc.addPage()
        yPosition = 20
      }

      doc.setFontSize(10)
      doc.setFont("helvetica", "normal")
      const recLines = doc.splitTextToSize(`${index + 1}. ${recommendation}`, maxWidth - 10)
      recLines.forEach((line: string) => {
        doc.text(line, 25, yPosition)
        yPosition += 6
      })
      yPosition += 3
    })
  }

  // Alertas
  if (analysis.anomalies && analysis.anomalies.length > 0) {
    if (yPosition > pageHeight - 100) {
      doc.addPage()
      yPosition = 20
    }

    doc.setFontSize(12)
    doc.setFont("helvetica", "bold")
    doc.text("ALERTAS", 20, yPosition)
    yPosition += 15

    analysis.anomalies.forEach((anomaly: any, index: number) => {
      if (yPosition > pageHeight - 80) {
        doc.addPage()
        yPosition = 20
      }

      // Cabeçalho do alerta
      doc.setFontSize(11)
      doc.setFont("helvetica", "bold")
      const parameterName = anomaly.parameter === 'humidity' ? 'Umidade' :
                           anomaly.parameter === 'temperature' ? 'Temperatura' :
                           anomaly.parameter === 'ph' ? 'pH' :
                           anomaly.parameter === 'ec' ? 'EC' :
                           anomaly.parameter
      doc.text(`${index + 1}. ${parameterName}`, 25, yPosition)
      yPosition += 8

      // Severidade
      const severityColors = {
        low: [59, 130, 246],
        medium: [245, 158, 11],
        high: [239, 68, 68],
        critical: [220, 38, 127]
      }
      const color = severityColors[anomaly.severity as keyof typeof severityColors] || [100, 116, 139]
      doc.setTextColor(color[0], color[1], color[2])
      doc.setFontSize(10)
      doc.text(`Severidade: ${anomaly.severity.toUpperCase()}`, 30, yPosition)
      yPosition += 8

      // Descrição
      doc.setTextColor(0, 0, 0)
      doc.setFont("helvetica", "normal")
      const descLines = doc.splitTextToSize(anomaly.description, maxWidth - 10)
      descLines.forEach((line: string) => {
        doc.text(line, 30, yPosition)
        yPosition += 6
      })

      // Recomendação
      yPosition += 3
      doc.setFont("helvetica", "bold")
      doc.text("AJUSTE:", 30, yPosition)
      yPosition += 6
      doc.setFont("helvetica", "normal")
      const recLines = doc.splitTextToSize(anomaly.recommendation, maxWidth - 10)
      recLines.forEach((line: string) => {
        doc.text(line, 30, yPosition)
        yPosition += 6
      })

      yPosition += 8
    })
  }

  // Rodapé
  doc.setFillColor(248, 250, 252)
  doc.rect(0, pageHeight - 20, pageWidth, 20, "F")
  doc.setTextColor(100, 116, 139)
  doc.setFontSize(8)
  doc.text(
    "Relatório gerado automaticamente pelo sistema ErvApp com Google Gemini AI",
    pageWidth / 2,
    pageHeight - 12,
    { align: "center" }
  )

  // Salvar o PDF
  const fileName = `analise-alertas-${cultivation.name.replace(/\s+/g, '-').toLowerCase()}-${new Date().toISOString().split("T")[0]}.pdf`
  doc.save(fileName)
}
