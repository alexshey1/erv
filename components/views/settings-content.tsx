import { ProfileForm } from '@/components/auth/profile-form';
import { Button } from '@/components/ui/button';

export function SettingsContent({ user }: { user: { id: string; name: string; email: string } | null }) {
  return (
    <div className="p-4 sm:p-8">
      <div className="mb-8">
        <h1 className="text-3xl sm:text-4xl font-bold text-foreground">Configurações</h1>
        <p className="text-muted-foreground mt-2 text-base sm:text-lg">Personalize suas preferências e configurações do sistema</p>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Card padronizado para Perfil do Usuário */}
        <div className="bg-white rounded-2xl shadow border border-zinc-200 flex flex-col">
          <div className="p-6 pb-0 border-b border-zinc-100">
            <div className="flex items-center gap-2 mb-3">
              <span className="inline-flex items-center justify-center bg-green-100 text-green-700 rounded-full w-7 h-7">
                <svg width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><circle cx="12" cy="7" r="4"/><path d="M5.5 21a7.5 7.5 0 0 1 13 0"/></svg>
              </span>
              <h2 className="text-xl font-semibold">Perfil do Usuário</h2>
            </div>
          </div>
          <div className="p-6">
            <ProfileForm user={user} />
          </div>
        </div>
        {/* Notificações */}
        <div className="bg-white rounded-2xl shadow border border-zinc-200 flex flex-col">
          <div className="p-6 pb-0 border-b border-zinc-100">
            <div className="flex items-center gap-2 mb-3">
              <span className="inline-flex items-center justify-center bg-blue-100 text-blue-700 rounded-full w-7 h-7">
                <svg width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M18 8a6 6 0 1 0-12 0c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></svg>
              </span>
              <h2 className="text-xl font-semibold">Notificações</h2>
            </div>
          </div>
          <div className="p-6 space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <div className="font-medium">Alertas de Viabilidade</div>
                <div className="text-sm text-muted-foreground">Receber alertas quando o projeto se tornar inviável</div>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input type="checkbox" checked className="sr-only peer" readOnly />
                <div className="w-11 h-6 bg-gray-200 rounded-full peer peer-checked:bg-green-500 transition-all"></div>
                <div className="absolute left-1 top-1 bg-white border border-gray-300 rounded-full w-4 h-4 transition-transform peer-checked:translate-x-5"></div>
              </label>
            </div>
            <div className="flex items-center justify-between">
              <div>
                <div className="font-medium">Relatórios Automáticos</div>
                <div className="text-sm text-muted-foreground">Gerar relatórios semanais automaticamente</div>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input type="checkbox" className="sr-only peer" />
                <div className="w-11 h-6 bg-gray-200 rounded-full peer peer-checked:bg-green-500 transition-all"></div>
                <div className="absolute left-1 top-1 bg-white border border-gray-300 rounded-full w-4 h-4 transition-transform peer-checked:translate-x-5"></div>
              </label>
            </div>
            <div className="flex items-center justify-between">
              <div>
                <div className="font-medium">Notificações por Email</div>
                <div className="text-sm text-muted-foreground">Receber atualizações por email</div>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input type="checkbox" checked className="sr-only peer" readOnly />
                <div className="w-11 h-6 bg-gray-200 rounded-full peer peer-checked:bg-green-500 transition-all"></div>
                <div className="absolute left-1 top-1 bg-white border border-gray-300 rounded-full w-4 h-4 transition-transform peer-checked:translate-x-5"></div>
              </label>
            </div>
          </div>
        </div>
        {/* Sistema */}
        <div className="bg-white rounded-2xl shadow border border-zinc-200 flex flex-col">
          <div className="p-6 pb-0 border-b border-zinc-100">
            <div className="flex items-center gap-2 mb-3">
              <span className="inline-flex items-center justify-center bg-zinc-100 text-zinc-700 rounded-full w-7 h-7">
                <svg width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/></svg>
              </span>
              <h2 className="text-xl font-semibold">Sistema</h2>
            </div>
          </div>
          <div className="p-6 space-y-4">
            <div>
              <div className="font-medium">Tema</div>
              <div className="flex items-center gap-2 mt-2">
                <span className="text-yellow-500">☀️</span>
                <span>Modo Claro (Fixo)</span>
              </div>
              <div className="text-xs text-muted-foreground mt-1">O tema está configurado para sempre usar o modo claro</div>
            </div>
            <div>
              <div className="font-medium">Moeda Padrão</div>
              <select className="w-full border rounded p-2 mt-2">
                <option>Real Brasileiro (R$)</option>
                <option>Dólar Americano (USD)</option>
                <option>Euro (EUR)</option>
              </select>
            </div>
            <div>
              <div className="font-medium">Idioma</div>
              <select className="w-full border rounded p-2 mt-2">
                <option>Português (BR)</option>
                <option>English (EN)</option>
                <option>Español (ES)</option>
              </select>
            </div>
          </div>
        </div>
        {/* Gerenciamento de Dados */}
        <div className="bg-white rounded-2xl shadow border border-zinc-200 flex flex-col">
          <div className="p-6 pb-0 border-b border-zinc-100">
            <div className="flex items-center gap-2 mb-3">
              <span className="inline-flex items-center justify-center bg-zinc-100 text-zinc-700 rounded-full w-7 h-7">
                <svg width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><rect x="3" y="3" width="18" height="18" rx="2"/><path d="M9 9h6v6H9z"/></svg>
              </span>
              <h2 className="text-xl font-semibold">Gerenciamento de Dados</h2>
            </div>
          </div>
          <div className="p-6 space-y-4">
            <div>
              <Button variant="outline" className="w-full mb-1">Exportar Dados</Button>
              <div className="text-xs text-muted-foreground mt-1 text-center">Baixar todos os seus dados em formato JSON</div>
            </div>
            <div>
              <Button variant="outline" className="w-full mb-1">Importar Configurações</Button>
              <div className="text-xs text-muted-foreground mt-1 text-center">Importar configurações de um arquivo</div>
            </div>
            <div>
              <Button variant="destructive" className="w-full mb-1">Limpar Dados</Button>
              <div className="text-xs text-muted-foreground mt-1 text-center">Remover todos os dados salvos (irreversível)</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
