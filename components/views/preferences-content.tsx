import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"

export function PreferencesContent() {
  return (
    <div className="max-w-2xl mx-auto py-8 px-4">
      <h1 className="text-2xl font-bold mb-6">Preferências Gerais</h1>
      <Card>
        <CardHeader>
          <CardTitle>Preferências do Sistema</CardTitle>
          <CardDescription>Configurações gerais do seu uso no ErvApp</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="dark-mode">Modo escuro automático</Label>
              <p className="text-sm text-muted-foreground">Ativar/desativar modo escuro conforme o sistema</p>
            </div>
            <Switch id="dark-mode" />
          </div>
          <Separator />
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="email-updates">Receber atualizações por email</Label>
              <p className="text-sm text-muted-foreground">Receba novidades e dicas do ErvApp</p>
            </div>
            <Switch id="email-updates" />
          </div>
        </CardContent>
      </Card>
    </div>
  )
} 