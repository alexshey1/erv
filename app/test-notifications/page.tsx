import { Metadata } from 'next'
import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { SimpleNotificationTest } from '@/components/notifications/simple-notification-test'

export const metadata: Metadata = {
    title: 'Teste de Notificações - ErvApp',
    description: 'Teste simples do sistema de notificações'
}

export default async function TestNotificationsPage() {
    const supabase = await createClient()

    // Verificar autenticação
    const { data: { user }, error } = await supabase.auth.getUser()

    if (error || !user) {
        redirect('/auth/login')
    }

    return (
        <div className="container mx-auto py-8 px-4 max-w-2xl">
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-gray-900 mb-2">
                    🔔 Teste de Notificações
                </h1>
                <p className="text-gray-600">
                    Sistema de notificações integrado e funcionando!
                </p>
            </div>

            <div className="space-y-6">
                <SimpleNotificationTest />

                <div className="bg-green-50 border border-green-200 rounded-lg p-6">
                    <h3 className="text-lg font-semibold text-green-800 mb-3">
                        ✅ Sistema Integrado com Sucesso!
                    </h3>
                    <div className="space-y-2 text-sm text-green-700">
                        <p><strong>✅ Badge no Header:</strong> Sino com contador de notificações</p>
                        <p><strong>✅ Central de Notificações:</strong> Lista completa com ações</p>
                        <p><strong>✅ APIs Funcionais:</strong> CRUD completo de notificações</p>
                        <p><strong>✅ Banco de Dados:</strong> Tabelas criadas e sincronizadas</p>
                        <p><strong>✅ Tipos e Prioridades:</strong> Sistema completo implementado</p>
                    </div>
                </div>

                <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
                    <h3 className="text-lg font-semibold text-blue-800 mb-3">
                        🚀 Próximas Funcionalidades
                    </h3>
                    <div className="space-y-2 text-sm text-blue-700">
                        <p><strong>🤖 Automação:</strong> Lembretes baseados em dados de cultivo</p>
                        <p><strong>📱 Push Notifications:</strong> Notificações offline</p>
                        <p><strong>🏆 Conquistas:</strong> Sistema de gamificação</p>
                        <p><strong>⚙️ Preferências:</strong> Controle granular pelo usuário</p>
                        <p><strong>📊 Analytics:</strong> Métricas de engajamento</p>
                    </div>
                </div>
            </div>
        </div>
    )
}