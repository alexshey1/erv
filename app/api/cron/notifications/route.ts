import { NextRequest, NextResponse } from 'next/server'
import { NotificationCronJobs } from '@/lib/notifications/cron-jobs'
import { createLogger } from '@/lib/safe-logger'

const logger = createLogger('CronNotifications')

// Chave secreta para autenticar cron jobs (em produção usar variável de ambiente)
const CRON_SECRET = process.env.CRON_SECRET || 'your-cron-secret-key'

/**
 * Endpoint para execução de cron jobs de notificações
 * Pode ser chamado por serviços externos como Vercel Cron ou GitHub Actions
 */
export async function POST(request: NextRequest) {
  try {
    // Verificar autenticação (apenas para chamadas externas, Vercel Cron é automático)
    const authHeader = request.headers.get('authorization')
    const isVercelCron = request.headers.get('user-agent')?.includes('vercel-cron')
    
    if (!isVercelCron) {
      const providedSecret = authHeader?.replace('Bearer ', '')
      
      if (providedSecret !== CRON_SECRET) {
        logger.warn('Unauthorized cron job attempt')
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
      }
    }

    // Obter tipo de job da query string ou body
    const { searchParams } = new URL(request.url)
    const jobType = searchParams.get('job') || 'reminders'

    logger.info(`Executing cron job: ${jobType}`)

    let result: any = {}

    switch (jobType) {
      case 'reminders':
        await NotificationCronJobs.checkReminders()
        result = { job: 'reminders', status: 'completed' }
        break

      case 'alerts':
        await NotificationCronJobs.checkAlerts()
        result = { job: 'alerts', status: 'completed' }
        break

      case 'achievements':
        await NotificationCronJobs.checkAchievements()
        result = { job: 'achievements', status: 'completed' }
        break

      case 'cleanup':
        await NotificationCronJobs.cleanupOldNotifications()
        result = { job: 'cleanup', status: 'completed' }
        break

      case 'maintenance':
        await NotificationCronJobs.runMaintenanceJobs()
        result = { job: 'maintenance', status: 'completed' }
        break

      case 'all':
        // Executar todos os jobs principais
        await Promise.all([
          NotificationCronJobs.checkReminders(),
          NotificationCronJobs.checkAlerts(),
          NotificationCronJobs.checkAchievements()
        ])
        result = { job: 'all', status: 'completed' }
        break

      default:
        return NextResponse.json({ 
          error: `Unknown job type: ${jobType}`,
          availableJobs: ['reminders', 'alerts', 'achievements', 'cleanup', 'maintenance', 'all']
        }, { status: 400 })
    }

    // Adicionar estatísticas
    result.stats = NotificationCronJobs.getJobStats()
    result.timestamp = new Date().toISOString()

    logger.info(`Cron job ${jobType} completed successfully`)

    return NextResponse.json(result)

  } catch (error) {
    logger.error('Error executing cron job:', error)
    
    return NextResponse.json({
      error: 'Internal server error',
      message: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString()
    }, { status: 500 })
  }
}

/**
 * Endpoint GET para verificar status dos jobs
 */
export async function GET(request: NextRequest) {
  try {
    const stats = NotificationCronJobs.getJobStats()
    
    return NextResponse.json({
      status: 'healthy',
      stats,
      timestamp: new Date().toISOString(),
      availableJobs: ['reminders', 'alerts', 'achievements', 'cleanup', 'maintenance', 'all']
    })

  } catch (error) {
    logger.error('Error getting cron job status:', error)
    
    return NextResponse.json({
      status: 'error',
      error: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString()
    }, { status: 500 })
  }
}