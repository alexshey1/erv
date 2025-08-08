"use client";
import { useState, useEffect } from "react";
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { User, Save, LogOut, Key, Loader2, CreditCard } from "lucide-react";

type ProfileFormProps = {
  user: any; // Aceitar usuário com suas propriedades completas
};

export function ProfileForm({ user }: ProfileFormProps) {
  // Estado para os campos do formulário
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [empresa, setEmpresa] = useState("");
  
  // Estados para controle do modal e mensagens
  const [showModal, setShowModal] = useState(false);
  const [senha, setSenha] = useState("");
  const [confirmSenha, setConfirmSenha] = useState("");
  const [msg, setMsg] = useState("");
  const [senhaAtual, setSenhaAtual] = useState("");
  
  // Estados para carregamento
  const [isLoading, setIsLoading] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);
  const router = useRouter();

  // Estado para o usuário completo
  const [fullUser, setFullUser] = useState<any>(user || null);

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const response = await fetch('/api/auth/supabase/me');
        if (response.ok) {
          const data = await response.json();
          if (data.user) {
            setFullUser(data.user);
            setName(data.user.name || "");
            setEmail(data.user.email || "");
            setEmpresa(data.user.avatar || "");
          }
        }
      } catch (error) {
        console.error("Erro ao buscar dados do usuário:", error);
      } finally {
        setIsInitialized(true);
      }
    };
    fetchUserData();
  }, []);

  // Verificar se o usuário tem plano Enterprise
  const isEnterprise = user?.subscription?.plan === "enterprise";
  
  // Obter informações do plano
  const planName = getPlanName(user?.subscription?.plan || user?.role || "free");
  const limiteCultivos = getLimiteCultivos(user?.subscription?.plan || user?.role || "free");
  const armazenamento = getArmazenamento(user?.subscription?.plan || user?.role || "free");

  async function handleSave(e: any) {
    e.preventDefault();
    setMsg("");
    setIsLoading(true);
    
    try {
      // Incluir empresa apenas se for plano enterprise
      const userData = isEnterprise 
        ? { name, email, avatar: empresa } // Salvar empresa no campo avatar por enquanto
        : { name, email };
        
      const res = await fetch("/api/auth/profile", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(userData),
      });
      
      const result = await res.json();
      if (result.success) {
        setMsg("Perfil atualizado com sucesso!");
      } else setMsg(result.error || "Erro ao atualizar perfil.");
    } catch (error) {
      setMsg("Erro de conexão. Tente novamente.");
    } finally {
      setIsLoading(false);
    }
  }

  async function handleLogout() {
    setIsLoggingOut(true);
    
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
      router.push('/auth/login');
    } catch (error) {
      console.error('Erro no logout:', error);
      setIsLoggingOut(false);
    }
  }

  async function handleRedefinirSenha(e: any) {
    e.preventDefault();
    setMsg("");
    if (senha !== confirmSenha) {
      setMsg("As senhas não coincidem");
      return;
    }
    // Aqui você pode enviar senhaAtual junto para o backend
    const res = await fetch('/api/auth/reset', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password: senha, currentPassword: senhaAtual }),
    });
    const result = await res.json();
    if (result.success) {
      setMsg("Senha redefinida com sucesso!");
      setShowModal(false);
      setSenha("");
      setConfirmSenha("");
      setSenhaAtual("");
    } else {
      setMsg(result.error || "Erro ao redefinir senha.");
    }
  }
  
  // Funções auxiliares para obter informações do plano
  function getPlanName(plan: string): string {
    const planNames: Record<string, string> = {
      'free': 'Gratuito',
      'basic': 'Básico',
      'premium': 'Premium',
      'enterprise': 'Enterprise'
    };
    return planNames[plan] || 'Gratuito';
  }
  
  function getLimiteCultivos(plan: string): string {
    const limites: Record<string, string> = {
      'free': '3',
      'basic': '10',
      'premium': '50',
      'enterprise': 'Ilimitado'
    };
    return limites[plan] || '3';
  }
  
  function getArmazenamento(plan: string): string {
    const armazenamento: Record<string, string> = {
      'free': '1GB',
      'basic': '5GB',
      'premium': '20GB',
      'enterprise': '100GB'
    };
    return armazenamento[plan] || '1GB';
  }

  // Função para determinar o nome do plano de acordo com as permissões reais
  function getPlanoByPermissions(user: any): string {
    if (!user) return 'Gratuito';
    if (user.role === 'admin') return 'Enterprise';
    if (user.permissions?.maxCultivations === -1) return 'Enterprise';
    if (user.permissions?.maxCultivations === 50) return 'Premium';
    if (user.permissions?.maxCultivations === 10) return 'Básico';
    return 'Gratuito';
  }

  function getLimiteCultivosByPermissions(user: any): string {
    if (!user) return '3';
    if (user.permissions?.maxCultivations === -1) return 'Ilimitado';
    return String(user.permissions?.maxCultivations ?? 3);
  }

  function getArmazenamentoByPermissions(user: any): string {
    if (!user) return '1GB';
    if (user.permissions?.maxStorageGB === 100) return '100GB';
    if (user.permissions?.maxStorageGB === 20) return '20GB';
    if (user.permissions?.maxStorageGB === 5) return '5GB';
    return '1GB';
  }

  // Exibir estado de carregamento durante a inicialização ou se não tem permissions
  if (!isInitialized || !fullUser || !fullUser.permissions) {
    return (
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="flex flex-col items-center justify-center mb-4">
            <div className="w-12 h-12 flex items-center justify-center">
              <Loader2 className="h-8 w-8 text-green-600 animate-spin" />
            </div>
          </div>
          <CardTitle className="text-xl font-bold text-green-900">Carregando perfil...</CardTitle>
        </CardHeader>
        <CardContent className="flex justify-center items-center py-12">
          <div className="flex flex-col items-center">
            <p className="text-sm text-green-700">Aguarde, estamos carregando seu perfil...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mb-4">
            <User className="h-6 w-6 text-green-600" />
          </div>
          <CardTitle className="text-xl font-bold">Perfil do Usuário</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSave} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Nome</Label>
              <Input
                id="name"
                value={name}
                onChange={e => setName(e.target.value)}
                placeholder="Seu nome"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="seu@email.com"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="empresa">Empresa</Label>
              <Input
                id="empresa"
                value={empresa}
                onChange={e => setEmpresa(e.target.value)}
                placeholder="Nome da empresa"
                disabled={!isEnterprise}
                title={!isEnterprise ? "Disponível apenas no plano Enterprise" : ""}
                className={!isEnterprise ? "opacity-60 cursor-not-allowed" : ""}
              />
              {!isEnterprise && (
                <p className="text-xs text-muted-foreground mt-1">
                  Campo disponível apenas no plano Enterprise
                </p>
              )}
            </div>
            
            {/* Informações do plano */}
            <div className="border rounded-md p-4 mt-6 bg-gray-50 dark:bg-gray-800">
              <h3 className="text-sm font-medium mb-3 flex items-center">
                <CreditCard className="h-4 w-4 mr-1.5" />
                Informações do Plano
              </h3>
              
              <div className="space-y-1 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Plano atual:</span>
                  <span className="font-medium">{getPlanoByPermissions(fullUser)}</span>
                </div>
                
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Limite de cultivos:</span>
                  <span className="font-medium">{getLimiteCultivosByPermissions(fullUser)}</span>
                </div>
                
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Armazenamento:</span>
                  <span className="font-medium">{getArmazenamentoByPermissions(fullUser)}</span>
                </div>
              </div>
              
              <div className="mt-3 pt-2 border-t">
                <Button
                  type="button"
                  onClick={() => router.push('/plans')}
                  className="w-full bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white"
                  size="sm"
                >
                  <CreditCard className="h-4 w-4 mr-2" />
                  Fazer Upgrade
                </Button>
              </div>
            </div>

            <Separator className="my-6" />

            <div className="flex gap-3 flex-wrap">
              <Button 
                type="submit" 
                disabled={isLoading}
                className="flex-1 min-w-0 bg-green-600 hover:bg-green-700"
              >
                {isLoading ? (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <Save className="h-4 w-4 mr-2" />
                )}
                {isLoading ? "Salvando..." : "Salvar Alterações"}
              </Button>
              
              <Button 
                type="button" 
                onClick={() => setShowModal(true)}
                variant="outline"
                className="flex-1 min-w-0"
              >
                <Key className="h-4 w-4 mr-2" />
                Redefinir Senha
              </Button>
            </div>

            {msg && (
              <div className={`mt-4 p-3 rounded-md text-sm text-center ${
                msg.includes('sucesso') 
                  ? 'bg-green-50 text-green-700 border border-green-200' 
                  : 'bg-red-50 text-red-700 border border-red-200'
              }`}>
                {msg}
              </div>
            )}
          </form>
        </CardContent>
      </Card>

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
          <div className="bg-gradient-to-br from-white/70 to-green-50/60 border-2 border-green-200 shadow-xl backdrop-blur-md rounded-2xl p-8 max-w-md w-full mx-4 flex flex-col">
            <div className="flex items-center gap-2 mb-6">
              <Key className="h-5 w-5 text-green-600" />
              <span className="text-lg font-bold text-green-900">Redefinir Senha</span>
            </div>
            <form onSubmit={handleRedefinirSenha} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="senha-atual">Senha atual</Label>
                <Input
                  id="senha-atual"
                  type="password"
                  value={senhaAtual}
                  onChange={e => setSenhaAtual(e.target.value)}
                  placeholder="Digite sua senha atual"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="nova-senha">Nova senha</Label>
                <Input
                  id="nova-senha"
                  type="password"
                  value={senha}
                  onChange={e => setSenha(e.target.value)}
                  placeholder="Nova senha"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="confirmar-senha">Confirmar nova senha</Label>
                <Input
                  id="confirmar-senha"
                  type="password"
                  value={confirmSenha}
                  onChange={e => setConfirmSenha(e.target.value)}
                  placeholder="Confirme a nova senha"
                />
              </div>
              <div className="flex gap-3 pt-4">
                <Button type="submit" className="flex-1 bg-gradient-to-r from-green-500 to-green-400 hover:from-green-600 hover:to-green-500 text-white rounded-xl shadow-lg">
                  Salvar
                </Button>
                <Button 
                  type="button" 
                  onClick={() => setShowModal(false)}
                  variant="destructive"
                  className="flex-1 rounded-xl"
                >
                  Cancelar
                </Button>
              </div>
              {msg && (
                <div className={`mt-4 p-3 rounded-md text-sm text-center ${
                  msg.includes('sucesso') 
                    ? 'bg-green-50 text-green-700 border border-green-200' 
                    : 'bg-red-50 text-red-700 border border-red-200'
                }`}>
                  {msg}
                </div>
              )}
            </form>
          </div>
        </div>
      )}
    </>
  );
} 