import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { Badge } from "@/components/ui/badge"
import { Shield, Lock, Key, Eye, EyeOff, Smartphone, AlertTriangle, CheckCircle } from "lucide-react"

export default function SecurityPage() {
  return (
    <div className="container mx-auto px-4 py-8 max-w-2xl">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold mb-4 flex items-center justify-center gap-2">
          <Shield className="h-8 w-8 text-red-600" />
          Segurança
        </h1>
        <p className="text-muted-foreground">
          Gerencie a segurança da sua conta e dados
        </p>
      </div>

      <div className="space-y-6">
        {/* Status de Segurança */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-green-600" />
              Status de Segurança
            </CardTitle>
            <CardDescription>
              Verificação do nível de segurança da sua conta
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 rounded-lg border">
                <div className="flex items-center gap-3">
                  <CheckCircle className="h-5 w-5 text-green-600" />
                  <div>
                    <p className="font-medium">Senha Forte</p>
                    <p className="text-sm text-muted-foreground">Sua senha atende aos critérios de segurança</p>
                  </div>
                </div>
                <Badge variant="secondary">Concluído</Badge>
              </div>

              <div className="flex items-center justify-between p-3 rounded-lg border">
                <div className="flex items-center gap-3">
                  <CheckCircle className="h-5 w-5 text-green-600" />
                  <div>
                    <p className="font-medium">Email Verificado</p>
                    <p className="text-sm text-muted-foreground">Seu email foi confirmado</p>
                  </div>
                </div>
                <Badge variant="secondary">Concluído</Badge>
              </div>

              <div className="flex items-center justify-between p-3 rounded-lg border">
                <div className="flex items-center gap-3">
                  <AlertTriangle className="h-5 w-5 text-orange-600" />
                  <div>
                    <p className="font-medium">Autenticação de Dois Fatores</p>
                    <p className="text-sm text-muted-foreground">Recomendamos ativar para maior segurança</p>
                  </div>
                </div>
                <Button variant="outline" size="sm">Ativar</Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Alterar Senha */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Lock className="h-5 w-5" />
              Alterar Senha
            </CardTitle>
            <CardDescription>
              Atualize sua senha para manter a conta segura
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="current-password">Senha Atual</Label>
              <Input id="current-password" type="password" placeholder="Digite sua senha atual" />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="new-password">Nova Senha</Label>
              <Input id="new-password" type="password" placeholder="Digite a nova senha" />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="confirm-password">Confirmar Nova Senha</Label>
              <Input id="confirm-password" type="password" placeholder="Confirme a nova senha" />
            </div>
            
            <Button className="w-full">
              Alterar Senha
            </Button>
          </CardContent>
        </Card>

        {/* Autenticação de Dois Fatores */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Key className="h-5 w-5" />
              Autenticação de Dois Fatores
            </CardTitle>
            <CardDescription>
              Adicione uma camada extra de segurança à sua conta
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="p-4 rounded-lg bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800">
              <div className="flex items-start gap-3">
                <Smartphone className="h-5 w-5 text-blue-600 mt-0.5" />
                <div>
                  <p className="font-medium text-blue-900 dark:text-blue-100">
                    Autenticação por Aplicativo
                  </p>
                  <p className="text-sm text-blue-700 dark:text-blue-300">
                    Use um aplicativo como Google Authenticator ou Authy para gerar códigos de verificação.
                  </p>
                </div>
              </div>
            </div>
            
            <div className="flex gap-4">
              <Button className="flex-1">
                Configurar 2FA
              </Button>
              <Button variant="outline" className="flex-1">
                Saiba Mais
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Sessões Ativas */}
        <Card>
          <CardHeader>
            <CardTitle>Sessões Ativas</CardTitle>
            <CardDescription>
              Gerencie dispositivos conectados à sua conta
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 rounded-lg border">
                <div className="flex items-center gap-3">
                  <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                  <div>
                    <p className="font-medium">Chrome - Windows</p>
                    <p className="text-sm text-muted-foreground">São Paulo, Brasil • Ativo agora</p>
                  </div>
                </div>
                <Button variant="outline" size="sm">Encerrar</Button>
              </div>

              <div className="flex items-center justify-between p-3 rounded-lg border">
                <div className="flex items-center gap-3">
                  <div className="w-3 h-3 bg-gray-400 rounded-full"></div>
                  <div>
                    <p className="font-medium">Safari - iPhone</p>
                    <p className="text-sm text-muted-foreground">São Paulo, Brasil • Há 2 horas</p>
                  </div>
                </div>
                <Button variant="outline" size="sm">Encerrar</Button>
              </div>
            </div>
            
            <Button variant="outline" className="w-full">
              Encerrar Todas as Sessões
            </Button>
          </CardContent>
        </Card>

        {/* Logs de Segurança */}
        <Card>
          <CardHeader>
            <CardTitle>Logs de Segurança</CardTitle>
            <CardDescription>
              Histórico de atividades de segurança da sua conta
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 rounded-lg border">
                <div>
                  <p className="font-medium">Login realizado</p>
                  <p className="text-sm text-muted-foreground">Chrome - Windows • São Paulo, Brasil</p>
                </div>
                <Badge variant="secondary" className="text-xs">Há 2h</Badge>
              </div>

              <div className="flex items-center justify-between p-3 rounded-lg border">
                <div>
                  <p className="font-medium">Senha alterada</p>
                  <p className="text-sm text-muted-foreground">Chrome - Windows • São Paulo, Brasil</p>
                </div>
                <Badge variant="secondary" className="text-xs">Há 1d</Badge>
              </div>

              <div className="flex items-center justify-between p-3 rounded-lg border">
                <div>
                  <p className="font-medium">Conta criada</p>
                  <p className="text-sm text-muted-foreground">Chrome - Windows • São Paulo, Brasil</p>
                </div>
                <Badge variant="secondary" className="text-xs">Há 1sem</Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Ações */}
        <Card>
          <CardHeader>
            <CardTitle>Ações de Segurança</CardTitle>
            <CardDescription>
              Ações importantes para manter sua conta segura
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <Button variant="outline" className="w-full justify-start">
                <Eye className="h-4 w-4 mr-2" />
                Ver Dados da Conta
              </Button>
              <Button variant="outline" className="w-full justify-start">
                <AlertTriangle className="h-4 w-4 mr-2" />
                Reportar Problema de Segurança
              </Button>
              <Button variant="destructive" className="w-full justify-start">
                <Lock className="h-4 w-4 mr-2" />
                Excluir Conta
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
} 