import { NotificationPayload } from '@/lib/types/notifications'
import type { PushSubscription as WebPushSubscription } from 'web-push'
const VAPID_PUBLIC_KEY = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY || 'BEl62iUYgUivxIkv69yViEuiBIa40HI2BNNfvdDUPGrhidG7_VCyUHPFjushXzqOUzjQ7Ck1Zt8Qs0Qs0Qs0Qs0Qs'
const VAPID_PRIVATE_KEY = process.env.VAPID_PRIVATE_KEY || 'your-private-key-here'

export class PushNotificationService {
  static async sendPush(
    subscription: WebPushSubscription,
    payload: NotificationPayload
  ): Promise<void> {
    const webpush = await import('web-push')
    webpush.setVapidDetails(
      'mailto:your-email@example.com',
      VAPID_PUBLIC_KEY,
      VAPID_PRIVATE_KEY
    )
    await webpush.sendNotification(subscription, JSON.stringify(payload))
  }
} 