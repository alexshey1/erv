import { prisma } from '@/lib/prisma'
import { createLogger } from '@/lib/safe-logger'
import {
  NotificationType,
  NotificationPriority,
  NotificationChannel,
  CreateNotificationRequest,
  Notification,
  NotificationContext
} from '@/lib/types/notifications'

const logger = createLogger('NotificationService')

export class NotificationService {
  /**
   * Cria uma nova notificação
   */
  static async createNotification(request: CreateNotificationRequest): Promise<Notification> {
    try {
      logger.info('Criando notificação', {
        type: request.type,
        userId: request.userId,
        title: request.title
      })

      const notification = await prisma.notification.create({
        data: {
          type: request.type,
          title: request.title,
          message: request.message,
          priority: request.priority || NotificationPriority.MEDIUM,
          channels: request.channels || [NotificationChannel.IN_APP],
          metadata: request.metadata,
          actionUrl: request.actionUrl,
          userId: request.userId
        }
      })

      logger.info('Notificação criada com sucesso', { notificationId: notification.id })
      return notification as Notification

    } catch (error) {
      logger.error('Erro ao criar notificação:', error)
      throw new Error('Falha ao criar notificação')
    }
  }

  /**
   * Busca notificações do usuário
   */
  static async getUserNotifications(
    userId: string,
    options: {
      limit?: number
      offset?: number
      unreadOnly?: boolean
    } = {}
  ): Promise<Notification[]> {
    try {
      const { limit = 50, offset = 0, unreadOnly = false } = options

      const notifications = await prisma.notification.findMany({
        where: {
          userId,
          ...(unreadOnly && { isRead: false })
        },
        orderBy: { createdAt: 'desc' },
        take: limit,
        skip: offset
      })

      return notifications as Notification[]

    } catch (error) {
      logger.error('Erro ao buscar notificações:', error)
      throw new Error('Falha ao buscar notificações')
    }
  }

  /**
   * Marca notificação como lida
   */
  static async markAsRead(notificationId: string, userId: string): Promise<void> {
    try {
      await prisma.notification.updateMany({
        where: {
          id: notificationId,
          userId // Garantir que usuário só pode marcar suas próprias notificações
        },
        data: {
          isRead: true,
          readAt: new Date()
        }
      })

      logger.info('Notificação marcada como lida', { notificationId, userId })

    } catch (error) {
      logger.error('Erro ao marcar notificação como lida:', error)
      throw new Error('Falha ao marcar notificação como lida')
    }
  }

  /**
   * Marca todas as notificações como lidas
   */
  static async markAllAsRead(userId: string): Promise<void> {
    try {
      await prisma.notification.updateMany({
        where: {
          userId,
          isRead: false
        },
        data: {
          isRead: true,
          readAt: new Date()
        }
      })

      logger.info('Todas as notificações marcadas como lidas', { userId })

    } catch (error) {
      logger.error('Erro ao marcar todas as notificações como lidas:', error)
      throw new Error('Falha ao marcar todas as notificações como lidas')
    }
  }

  /**
   * Conta notificações não lidas
   */
  static async getUnreadCount(userId: string): Promise<number> {
    try {
      const count = await prisma.notification.count({
        where: {
          userId,
          isRead: false
        }
      })

      return count

    } catch (error) {
      logger.error('Erro ao contar notificações não lidas:', error)
      return 0
    }
  }

  /**
   * Remove notificação
   */
  static async deleteNotification(notificationId: string, userId: string): Promise<void> {
    try {
      await prisma.notification.deleteMany({
        where: {
          id: notificationId,
          userId // Garantir que usuário só pode deletar suas próprias notificações
        }
      })

      logger.info('Notificação removida', { notificationId, userId })

    } catch (error) {
      logger.error('Erro ao remover notificação:', error)
      throw new Error('Falha ao remover notificação')
    }
  }

  /**
   * Limpa notificações antigas (mais de 30 dias)
   */
  static async cleanupOldNotifications(): Promise<number> {
    try {
      const thirtyDaysAgo = new Date()
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)

      const result = await prisma.notification.deleteMany({
        where: {
          createdAt: {
            lt: thirtyDaysAgo
          },
          isRead: true // Só remove notificações já lidas
        }
      })

      logger.info(`Limpeza concluída: ${result.count} notificações antigas removidas`)
      return result.count

    } catch (error) {
      logger.error('Erro na limpeza de notificações antigas:', error)
      return 0
    }
  }

  /**
   * Cria notificação de lembrete
   */
  static async createReminder(
    userId: string,
    title: string,
    message: string,
    context?: NotificationContext
  ): Promise<Notification> {
    return this.createNotification({
      type: NotificationType.REMINDER,
      title,
      message,
      priority: NotificationPriority.MEDIUM,
      channels: [NotificationChannel.IN_APP, NotificationChannel.PUSH],
      metadata: context,
      userId
    })
  }

  /**
   * Cria notificação de alerta
   */
  static async createAlert(
    userId: string,
    title: string,
    message: string,
    priority: NotificationPriority = NotificationPriority.HIGH,
    context?: NotificationContext
  ): Promise<Notification> {
    return this.createNotification({
      type: NotificationType.ALERT,
      title,
      message,
      priority,
      channels: [NotificationChannel.IN_APP, NotificationChannel.PUSH],
      metadata: context,
      userId
    })
  }

  /**
   * Cria notificação de conquista
   */
  static async createAchievement(
    userId: string,
    title: string,
    message: string,
    context?: NotificationContext
  ): Promise<Notification> {
    return this.createNotification({
      type: NotificationType.ACHIEVEMENT,
      title,
      message,
      priority: NotificationPriority.MEDIUM,
      channels: [NotificationChannel.IN_APP, NotificationChannel.PUSH],
      metadata: context,
      userId
    })
  }

  /**
   * Verifica se usuário deve receber notificação baseado em preferências
   */
  static async shouldSendNotification(
    userId: string,
    type: NotificationType,
    channel: NotificationChannel
  ): Promise<boolean> {
    try {
      const preferences = await prisma.notificationPreferences.findUnique({
        where: { userId }
      })

      // Se não tem preferências, usar padrões
      if (!preferences) {
        return true
      }

      // Verificar se tipo está habilitado
      const typeEnabled = {
        [NotificationType.REMINDER]: preferences.reminders,
        [NotificationType.ALERT]: preferences.alerts,
        [NotificationType.ACHIEVEMENT]: preferences.achievements,
        [NotificationType.MARKETING]: preferences.marketing,
        [NotificationType.SYSTEM]: true // Sistema sempre habilitado
      }[type]

      if (!typeEnabled) {
        return false
      }

      // Verificar se canal está habilitado
      const channelEnabled = {
        [NotificationChannel.IN_APP]: true, // In-app sempre habilitado
        [NotificationChannel.PUSH]: preferences.pushEnabled,
        [NotificationChannel.EMAIL]: preferences.emailEnabled,
        [NotificationChannel.SMS]: false // SMS não implementado ainda
      }[channel]

      if (!channelEnabled) {
        return false
      }

      // Verificar horário de silêncio para push notifications
      if (channel === NotificationChannel.PUSH && preferences.quietHoursStart && preferences.quietHoursEnd) {
        const now = new Date()
        const currentHour = now.getHours()
        
        if (preferences.quietHoursStart <= preferences.quietHoursEnd) {
          // Horário normal (ex: 22h às 8h)
          if (currentHour >= preferences.quietHoursStart && currentHour < preferences.quietHoursEnd) {
            return false
          }
        } else {
          // Horário que cruza meia-noite (ex: 22h às 8h)
          if (currentHour >= preferences.quietHoursStart || currentHour < preferences.quietHoursEnd) {
            return false
          }
        }
      }

      return true

    } catch (error) {
      logger.error('Erro ao verificar preferências de notificação:', error)
      return true // Em caso de erro, enviar notificação
    }
  }
}