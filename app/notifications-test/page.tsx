import { Metadata } from 'next'
import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { NotificationDemo } from '@/components/notifications/notification-demo'
import { PushNotificationSetup } from '@/components/notifications/push-notification-setup'
import { NotificationPreferencesComponent } from '@/components/notifications/notification-preferences'

export const metadata: Metadata = {
  title: 'Teste de Notificações - ErvApp',
  description: 'Teste e configure o sistema de notificações inteligentes'
}

export default async function NotificationsTestPage() {
  const supabase = await createClient()
  
  // Verificar autenticação
  const { data: { user }, error } = await supabase.auth.getUser()
  
  if (error || !user) {
    redirect('/auth/login')
  }

  return (
    <div className="container mx-auto py-8 px-4 max-w-4xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Sistema de Notificações Inteligentes
        </h1>
        <p className="text-gray-600">
          Configure e teste o sistema de notificações do ErvApp
        </p>
      </div>

      <div className="space-y-8">
        {/* Setup de Push Notifications */}
        <section>
          <h2 className="text-xl font-semibold mb-4">Push Notifications</h2>
          <PushNotificationSetup userId={user.id} />
        </section>

        {/* Preferências */}
        <section>
          <h2 className="text-xl font-semibold mb-4">Preferências</h2>
          <NotificationPreferencesComponent userId={user.id} />
        </section>

        {/* Demo/Teste */}
        <section>
          <h2 className="text-xl font-semibold mb-4">Teste do Sistema</h2>
          <NotificationDemo />
        </section>

        {/* Informações técnicas */}
        <section className="bg-gray-50 p-6 rounded-lg">
          <h3 className="text-lg font-semibold mb-4">ℹ️ Informações Técnicas</h3>
          <div className="space-y-3 text-sm text-gray-700">
            <div>
              <strong>✅ Implementado:</strong>
              <ul className="list-disc list-inside ml-4 mt-1 space-y-1">
                <li>Central de notificações com badge no header</li>
                <li>Push notifications com Service Worker</li>
                <li>Sistema de preferências granular</li>
                <li>APIs REST completas com rate limiting</li>
                <li>Tipos de notificação (Lembrete, Alerta, Conquista, Sistema)</li>
                <li>Prioridades e canais configuráveis</li>
              </ul>
            </div>
            
            <div>
              <strong>🚧 Próximas implementações:</strong>
              <ul className="list-disc list-inside ml-4 mt-1 space-y-1">
                <li>Cron jobs para lembretes automáticos</li>
                <li>Regras baseadas em dados de cultivo</li>
                <li>Sistema de conquistas e gamificação</li>
                <li>Analytics de engajamento</li>
                <li>Integração com IA para alertas inteligentes</li>
              </ul>
            </div>

            <div>
              <strong>🔧 Como testar:</strong>
              <ul className="list-disc list-inside ml-4 mt-1 space-y-1">
                <li>1. Ative as push notifications acima</li>
                <li>2. Configure suas preferências</li>
                <li>3. Crie notificações de teste</li>
                <li>4. Verifique o badge no header (sino)</li>
                <li>5. Teste as push notifications no navegador</li>
              </ul>
            </div>
          </div>
        </section>
      </div>
    </div>
  )
}