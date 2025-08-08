import { NextRequest, NextResponse } from 'next/server'
import { CSPUtils } from '@/lib/security-headers'

interface CSPReport {
  'csp-report': {
    'document-uri': string
    referrer: string
    'violated-directive': string
    'effective-directive': string
    'original-policy': string
    disposition: string
    'blocked-uri': string
    'line-number': number
    'column-number': number
    'source-file': string
    'status-code': number
    'script-sample': string
  }
}

// Armazenamento em memória para relatórios (em produção, usar banco de dados)
const cspReports: Array<CSPReport & { timestamp: Date; userAgent: string; ip: string }> = []

export async function POST(request: NextRequest) {
  try {
    const report: CSPReport = await request.json()
    const userAgent = request.headers.get('user-agent') || 'unknown'
    const ip = request.headers.get('x-forwarded-for') || 
               request.headers.get('x-real-ip') || 
               'unknown'

    // Armazenar relatório com metadados
    const fullReport = {
      ...report,
      timestamp: new Date(),
      userAgent,
      ip
    }

    cspReports.push(fullReport)

    // Manter apenas os 100 relatórios mais recentes
    if (cspReports.length > 100) {
      cspReports.splice(0, cspReports.length - 100)
    }

    // Analisar violação
    const analysis = CSPUtils.analyzeViolation(report['csp-report'])
    
    // Log para desenvolvimento
    if (process.env.NODE_ENV === 'development') {
      console.log('🚨 CSP Violation Report:', {
        violatedDirective: report['csp-report']['violated-directive'],
        blockedURI: report['csp-report']['blocked-uri'],
        sourceFile: report['csp-report']['source-file'],
        analysis
      })
    }

    // Em produção, você pode enviar para serviços como Sentry
    if (process.env.NODE_ENV === 'production' && analysis.severity === 'high') {
      // Exemplo: enviar para Sentry ou outro serviço de monitoramento
      console.error('High severity CSP violation:', report)
    }

    return NextResponse.json({ 
      success: true, 
      message: 'CSP report received',
      analysis 
    })

  } catch (error) {
    console.error('Error processing CSP report:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to process CSP report' },
      { status: 400 }
    )
  }
}

// Endpoint para visualizar relatórios (apenas em desenvolvimento)
export async function GET(request: NextRequest) {
  if (process.env.NODE_ENV !== 'development') {
    return NextResponse.json(
      { error: 'Reports only available in development' },
      { status: 403 }
    )
  }

  const url = new URL(request.url)
  const limit = parseInt(url.searchParams.get('limit') || '10')
  const severity = url.searchParams.get('severity')

  let filteredReports = [...cspReports]

  // Filtrar por severidade se especificado
  if (severity) {
    filteredReports = filteredReports.filter(report => {
      const analysis = CSPUtils.analyzeViolation(report['csp-report'])
      return analysis.severity === severity
    })
  }

  // Ordenar por timestamp (mais recentes primeiro)
  filteredReports.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())

  // Limitar resultados
  const limitedReports = filteredReports.slice(0, limit)

  // Adicionar análise a cada relatório
  const reportsWithAnalysis = limitedReports.map(report => ({
    ...report,
    analysis: CSPUtils.analyzeViolation(report['csp-report'])
  }))

  return NextResponse.json({
    success: true,
    total: cspReports.length,
    filtered: filteredReports.length,
    reports: reportsWithAnalysis,
    summary: {
      high: filteredReports.filter(r => CSPUtils.analyzeViolation(r['csp-report']).severity === 'high').length,
      medium: filteredReports.filter(r => CSPUtils.analyzeViolation(r['csp-report']).severity === 'medium').length,
      low: filteredReports.filter(r => CSPUtils.analyzeViolation(r['csp-report']).severity === 'low').length,
    }
  })
}