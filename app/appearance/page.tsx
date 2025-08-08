import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { Palette, Moon, Sun, Monitor, Eye, EyeOff, Smartphone, Laptop } from "lucide-react"

export default function AppearancePage() {
  return (
    <div className="container mx-auto px-4 py-8 max-w-2xl">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold mb-4 flex items-center justify-center gap-2">
          <Palette className="h-8 w-8 text-purple-600" />
          Aparência
        </h1>
        <p className="text-muted-foreground">
          Personalize a aparência do ErvApp de acordo com suas preferências
        </p>
      </div>

      <div className="space-y-6">
        {/* Tema */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Moon className="h-5 w-5" />
              Tema
            </CardTitle>
            <CardDescription>
              Escolha entre tema claro, escuro ou automático
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Button variant="outline" className="h-20 flex flex-col gap-2">
                <Sun className="h-6 w-6" />
                <span className="text-sm">Claro</span>
              </Button>
              <Button variant="outline" className="h-20 flex flex-col gap-2">
                <Moon className="h-6 w-6" />
                <span className="text-sm">Escuro</span>
              </Button>
              <Button variant="outline" className="h-20 flex flex-col gap-2">
                <Monitor className="h-6 w-6" />
                <span className="text-sm">Automático</span>
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Configurações de Interface */}
        <Card>
          <CardHeader>
            <CardTitle>Configurações de Interface</CardTitle>
            <CardDescription>
              Ajuste como o ErvApp se comporta e aparece
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="animations">Animações</Label>
                <p className="text-sm text-muted-foreground">
                  Habilitar transições e animações suaves
                </p>
              </div>
              <Switch id="animations" defaultChecked />
            </div>
            
            <Separator />
            
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="notifications">Notificações Visuais</Label>
                <p className="text-sm text-muted-foreground">
                  Mostrar notificações toast e alertas
                </p>
              </div>
              <Switch id="notifications" defaultChecked />
            </div>
            
            <Separator />
            
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="compact">Modo Compacto</Label>
                <p className="text-sm text-muted-foreground">
                  Reduzir espaçamentos para mais conteúdo
                </p>
              </div>
              <Switch id="compact" />
            </div>
          </CardContent>
        </Card>

        {/* Responsividade */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Smartphone className="h-5 w-5" />
              Responsividade
            </CardTitle>
            <CardDescription>
              Configurações para diferentes tamanhos de tela
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Layout em Dispositivos Móveis</Label>
                <div className="flex items-center gap-2">
                  <Switch id="mobile-optimized" defaultChecked />
                  <span className="text-sm text-muted-foreground">
                    Otimizar para telas pequenas
                  </span>
                </div>
              </div>
              
              <div className="space-y-2">
                <Label>Sidebar Responsiva</Label>
                <div className="flex items-center gap-2">
                  <Switch id="responsive-sidebar" defaultChecked />
                  <span className="text-sm text-muted-foreground">
                    Ocultar automaticamente em telas pequenas
                  </span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Acessibilidade */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Eye className="h-5 w-5" />
              Acessibilidade
            </CardTitle>
            <CardDescription>
              Configurações para melhorar a acessibilidade
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="high-contrast">Alto Contraste</Label>
                <p className="text-sm text-muted-foreground">
                  Aumentar contraste para melhor visibilidade
                </p>
              </div>
              <Switch id="high-contrast" />
            </div>
            
            <Separator />
            
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="reduced-motion">Movimento Reduzido</Label>
                <p className="text-sm text-muted-foreground">
                  Reduzir animações para usuários sensíveis
                </p>
              </div>
              <Switch id="reduced-motion" />
            </div>
            
            <Separator />
            
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="focus-indicators">Indicadores de Foco</Label>
                <p className="text-sm text-muted-foreground">
                  Destacar elementos em foco para navegação por teclado
                </p>
              </div>
              <Switch id="focus-indicators" defaultChecked />
            </div>
          </CardContent>
        </Card>

        {/* Ações */}
        <Card>
          <CardHeader>
            <CardTitle>Ações</CardTitle>
            <CardDescription>
              Aplicar ou redefinir configurações
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex gap-4">
              <Button className="flex-1">
                Aplicar Configurações
              </Button>
              <Button variant="outline" className="flex-1">
                Redefinir Padrões
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
} 