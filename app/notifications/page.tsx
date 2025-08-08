import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { Badge } from "@/components/ui/badge"
import { Bell, AlertTriangle, CheckCircle, Info, X, Settings } from "lucide-react"
import ErvaBotChatSuspense from "@/components/erva-bot-chat"

export default function NotificationsPage() {
  return (
    <div className="container mx-auto px-4 py-8 max-w-2xl">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold mb-4 flex items-center justify-center gap-2">
          <Bell className="h-8 w-8 text-blue-600" />
          Notificações
        </h1>
        <p className="text-muted-foreground">
          Gerencie suas notificações e alertas do ErvApp
        </p>
      </div>

      <div className="space-y-6">
        {/* Configurações Gerais */}
        <Card>
          <CardHeader>
            <CardTitle>Configurações Gerais</CardTitle>
            <CardDescription>
              Controle como e quando você recebe notificações
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="email-notifications">Notificações por Email</Label>
                <p className="text-sm text-muted-foreground">
                  Receber alertas importantes por email
                </p>
              </div>
              <Switch id="email-notifications" defaultChecked />
            </div>
            
            <Separator />
            
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="browser-notifications">Notificações do Navegador</Label>
                <p className="text-sm text-muted-foreground">
                  Mostrar notificações push no navegador
                </p>
              </div>
              <Switch id="browser-notifications" defaultChecked />
            </div>
            
            <Separator />
            
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="sound-notifications">Sons de Notificação</Label>
                <p className="text-sm text-muted-foreground">
                  Reproduzir sons para notificações importantes
                </p>
              </div>
              <Switch id="sound-notifications" />
            </div>
          </CardContent>
        </Card>

        {/* Tipos de Notificação */}
        <Card>
          <CardHeader>
            <CardTitle>Tipos de Notificação</CardTitle>
            <CardDescription>
              Escolha quais tipos de notificação você quer receber
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="cultivation-alerts">Alertas de Cultivo</Label>
                <p className="text-sm text-muted-foreground">
                  Notificações sobre eventos importantes dos cultivos
                </p>
              </div>
              <Switch id="cultivation-alerts" defaultChecked />
            </div>
            
            <Separator />
            
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="anomaly-alerts">Alertas de Anomalias</Label>
                <p className="text-sm text-muted-foreground">
                  Alertas quando o sistema detecta padrões anômalos
                </p>
              </div>
              <Switch id="anomaly-alerts" defaultChecked />
            </div>
            
            <Separator />
            
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="system-updates">Atualizações do Sistema</Label>
                <p className="text-sm text-muted-foreground">
                  Notificações sobre novas funcionalidades e melhorias
                </p>
              </div>
              <Switch id="system-updates" />
            </div>
            
            <Separator />
            
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="security-alerts">Alertas de Segurança</Label>
                <p className="text-sm text-muted-foreground">
                  Notificações sobre atividades de segurança da conta
                </p>
              </div>
              <Switch id="security-alerts" defaultChecked />
            </div>
          </CardContent>
        </Card>

        {/* Frequência */}
        <Card>
          <CardHeader>
            <CardTitle>Frequência de Notificações</CardTitle>
            <CardDescription>
              Configure com que frequência você quer receber notificações
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Button variant="outline" className="h-16 flex flex-col gap-2">
                <span className="text-sm font-medium">Imediato</span>
                <span className="text-xs text-muted-foreground">Receber instantaneamente</span>
              </Button>
              <Button variant="default" className="h-16 flex flex-col gap-2">
                <span className="text-sm font-medium">Resumo Diário</span>
                <span className="text-xs text-muted-foreground">Uma vez por dia</span>
              </Button>
              <Button variant="outline" className="h-16 flex flex-col gap-2">
                <span className="text-sm font-medium">Resumo Semanal</span>
                <span className="text-xs text-muted-foreground">Uma vez por semana</span>
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Notificações Recentes */}
        <Card>
          <CardHeader>
            <CardTitle>Notificações Recentes</CardTitle>
            <CardDescription>
              Suas notificações mais recentes
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <div className="flex items-start gap-3 p-3 rounded-lg border">
                <CheckCircle className="h-5 w-5 text-green-600 mt-0.5" />
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <p className="font-medium">Cultivo "Gorrila Glue #1" atualizado</p>
                    <Badge variant="secondary" className="text-xs">Há 2h</Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Evento de fertilização registrado com sucesso
                  </p>
                </div>
                <Button variant="ghost" size="sm">
                  <X className="h-4 w-4" />
                </Button>
              </div>

              <div className="flex items-start gap-3 p-3 rounded-lg border">
                <AlertTriangle className="h-5 w-5 text-orange-600 mt-0.5" />
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <p className="font-medium">Anomalia detectada</p>
                    <Badge variant="destructive" className="text-xs">Há 1d</Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Padrão incomum detectado no cultivo "Gorrila Glue #1"
                  </p>
                </div>
                <Button variant="ghost" size="sm">
                  <X className="h-4 w-4" />
                </Button>
              </div>

              <div className="flex items-start gap-3 p-3 rounded-lg border">
                <Info className="h-5 w-5 text-blue-600 mt-0.5" />
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <p className="font-medium">Bem-vindo ao ErvApp!</p>
                    <Badge variant="secondary" className="text-xs">Há 3d</Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Sua conta foi criada com sucesso. Comece explorando o dashboard.
                  </p>
                </div>
                <Button variant="ghost" size="sm">
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Ações */}
        <Card>
          <CardHeader>
            <CardTitle>Ações</CardTitle>
            <CardDescription>
              Gerenciar notificações
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex gap-4">
              <Button className="flex-1">
                Salvar Configurações
              </Button>
              <Button variant="outline" className="flex-1">
                Limpar Todas as Notificações
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Chat ErvaBot IA */}
      <div className="mt-10 flex justify-center">
        <ErvaBotChatSuspense />
      </div>
    </div>
  )
} 