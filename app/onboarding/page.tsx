"use client"

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { 
  Sprout, 
  TrendingUp,
  Zap,
  Layers,
  AlertTriangle,
  Wifi,
  Lightbulb,
  BookOpen,
  Plus,
  Sparkles,
  Clock,
  CheckCircle,
  ArrowRight,
  Brain,
  Bell,
  BarChart3,
  Trophy,
  DollarSign
} from 'lucide-react'

export default function OnboardingPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)

  const handleActivateDashboard = async () => {
    setLoading(true)
    
    try {
      // Marcar que o usuário passou pelo onboarding
      localStorage.setItem('ervapp_onboarding_completed', 'true')
      
      // Pequeno delay para UX
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      // Redirecionar para o dashboard
      router.push('/dashboard')
    } catch (error) {
      console.error('Erro ao ativar dashboard:', error)
    } finally {
      setLoading(false)
    }
  }

  const platformBenefits = [
    {
      title: "Monitoramento 24/7",
      icon: <TrendingUp className="w-6 h-6" />,
      emoji: "📊",
      description: "Acompanhe temperatura, umidade, pH e EC em tempo real com alertas automáticos",
      features: ["Alertas em tempo real", "Controle remoto", "Histórico completo"],
      color: "from-emerald-500 to-green-600",
      bgColor: "bg-emerald-50",
      borderColor: "border-emerald-200",
      status: "Ativo e funcionando"
    },
    {
      title: "IA Preditiva",
      icon: <Brain className="w-6 h-6" />,
      emoji: "🤖",
      description: "Análises avançadas com Gemini AI para detectar problemas antes que aconteçam",
      features: ["Análise preditiva", "Detecção de problemas", "Recomendações automáticas"],
      color: "from-purple-500 to-indigo-600",
      bgColor: "bg-purple-50",
      borderColor: "border-purple-200",
      status: "Pronto para análise"
    },
    {
      title: "Analytics Avançado",
      icon: <BarChart3 className="w-6 h-6" />,
      emoji: "📈",
      description: "Gráficos interativos, ROI, yield tracking e comparativos históricos",
      features: ["Yield tracking", "Análise de custos", "Comparativo histórico"],
      color: "from-blue-500 to-cyan-600",
      bgColor: "bg-blue-50",
      borderColor: "border-blue-200",
      status: "Aguardando dados"
    },
    {
      title: "Notificações Inteligentes",
      icon: <Bell className="w-6 h-6" />,
      emoji: "🔔",
      description: "Sistema automatizado de lembretes e alertas baseado em IA",
      features: ["Lembretes de rega", "Alertas de nutrição", "Mudanças de fase"],
      color: "from-orange-500 to-red-600",
      bgColor: "bg-orange-50",
      borderColor: "border-orange-200",
      status: "Sistema ativo"
    },
    {
      title: "Automação IoT",
      icon: <Wifi className="w-6 h-6" />,
      emoji: "📡",
      description: "Conecte sensores e dispositivos para controle automático do ambiente",
      features: ["Sensores integrados", "Controle automático", "Monitoramento remoto"],
      color: "from-indigo-500 to-purple-600",
      bgColor: "bg-indigo-50",
      borderColor: "border-indigo-200",
      status: "Pronto para conectar"
    },
    {
      title: "Sistema de Conquistas",
      icon: <Trophy className="w-6 h-6" />,
      emoji: "🏆",
      description: "Desbloqueie achievements, compare performance e evolua como cultivador",
      features: ["Sistema de conquistas", "Ranking de performance", "Badges exclusivos"],
      color: "from-yellow-500 to-orange-600",
      bgColor: "bg-yellow-50",
      borderColor: "border-yellow-200",
      status: "Aguardando primeiro cultivo"
    }
  ]

  const quickStartSteps = [
    {
      step: 1,
      title: "Adicionar Cultivo",
      description: "Cadastre sua primeira planta com informações básicas",
      icon: <Plus className="w-5 h-5" />,
      time: "2 minutos"
    },
    {
      step: 2,
      title: "Registrar Dados",
      description: "Documente eventos, fotos e medições para análise da IA",
      icon: <BookOpen className="w-5 h-5" />,
      time: "Diário"
    },
    {
      step: 3,
      title: "Ativar IA",
      description: "Receba insights automáticos e recomendações personalizadas",
      icon: <Brain className="w-5 h-5" />,
      time: "Automático"
    }
  ]

  const successMetrics = [
    { 
      icon: <TrendingUp className="w-5 h-5" />, 
      label: "+40%", 
      desc: "Aumento médio no yield",
      color: "text-emerald-600"
    },
    { 
      icon: <DollarSign className="w-5 h-5" />, 
      label: "R$ 2k+", 
      desc: "Economia por cultivo",
      color: "text-blue-600"
    },
    { 
      icon: <Clock className="w-5 h-5" />, 
      label: "-60%", 
      desc: "Tempo de gestão",
      color: "text-purple-600"
    },
    { 
      icon: <AlertTriangle className="w-5 h-5" />, 
      label: "95%", 
      desc: "Problemas evitados",
      color: "text-orange-600"
    }
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-green-50 p-8">
      <div className="max-w-7xl mx-auto">
        {/* Hero Section */}
        <div className="text-center mb-16">
          <div className="relative mb-8">
            <div className="inline-flex items-center justify-center w-24 h-24 bg-gradient-to-br from-emerald-500 to-green-600 rounded-3xl shadow-xl mb-6">
              <Sprout className="w-12 h-12 text-white" />
            </div>
            <div className="absolute -top-2 -right-2 w-6 h-6 bg-yellow-400 rounded-full flex items-center justify-center">
              <Sparkles className="w-3 h-3 text-yellow-800" />
            </div>
          </div>
          
          <div className="mb-6">
            <Badge className="bg-emerald-100 text-emerald-800 px-4 py-2 text-sm font-medium mb-4">
              <Zap className="w-4 h-4 mr-2" />
              Dashboard Inteligente Pronto
            </Badge>
          </div>
          
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold bg-gradient-to-r from-emerald-600 to-green-700 bg-clip-text text-transparent mb-6 tracking-tight">
            Bem-vindo ao Futuro
            <br />
            <span className="text-3xl md:text-4xl lg:text-5xl">do Cultivo Inteligente</span>
          </h1>
          
          <p className="text-xl md:text-2xl text-gray-600 max-w-4xl mx-auto leading-relaxed mb-8">
            Sua plataforma profissional está configurada e pronta. Transforme dados em decisões inteligentes com 
            <strong className="text-emerald-600"> IA avançada</strong>, 
            <strong className="text-green-600"> automação completa</strong> e 
            <strong className="text-blue-600"> analytics profissionais</strong>.
          </p>

          {/* Quick Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-12 max-w-4xl mx-auto">
            {successMetrics.map((metric, index) => (
              <div key={index} className="bg-white/70 backdrop-blur-sm rounded-xl p-4 border border-emerald-100 hover:shadow-lg transition-all duration-300">
                <div className={`${metric.color} mb-2 flex justify-center`}>
                  {metric.icon}
                </div>
                <div className="text-2xl font-bold text-gray-900 mb-1">{metric.label}</div>
                <div className="text-xs text-gray-600">{metric.desc}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Dashboard Features Preview */}
        <div className="mb-16">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Seu Dashboard Inclui Tudo Isso
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Ferramentas profissionais configuradas e prontas para uso
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {platformBenefits.map((benefit, index) => (
              <Card 
                key={index}
                className={`relative overflow-hidden transition-all duration-500 cursor-pointer group hover:scale-102 hover:shadow-xl ${benefit.bgColor} ${benefit.borderColor} border-2`}
              >
                <CardHeader className="pb-4">
                  <div className="flex items-center gap-4">
                    <div className={`w-12 h-12 bg-gradient-to-br ${benefit.color} rounded-xl flex items-center justify-center text-white shadow-lg`}>
                      {benefit.icon}
                    </div>
                    <div>
                      <CardTitle className="text-xl text-gray-800">{benefit.title}</CardTitle>
                      <div className="text-2xl">{benefit.emoji}</div>
                    </div>
                  </div>
                </CardHeader>
                
                <CardContent className="pt-0">
                  <p className="text-gray-600 mb-4 leading-relaxed">{benefit.description}</p>
                  
                  <div className="space-y-2 mb-4">
                    {benefit.features.map((feature, featureIndex) => (
                      <div key={featureIndex} className="flex items-center gap-2">
                        <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0" />
                        <span className="text-sm text-gray-700">{feature}</span>
                      </div>
                    ))}
                  </div>

                  <div className="flex items-center gap-2 text-xs text-emerald-600">
                    <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></div>
                    <span>{benefit.status}</span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Quick Start Guide */}
        <div className="mb-16">
          <div className="text-center mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              Ative em 3 Passos Simples
            </h2>
            <p className="text-gray-600">
              Comece a usar todas as funcionalidades em minutos
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
            {quickStartSteps.map((step, index) => (
              <div key={index} className="relative text-center">
                <div className="w-16 h-16 bg-gradient-to-br from-emerald-500 to-green-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
                  {step.icon}
                  <div className="absolute -top-2 -right-2 w-8 h-8 bg-emerald-100 rounded-full flex items-center justify-center">
                    <span className="text-emerald-600 font-bold text-sm">{step.step}</span>
                  </div>
                </div>
                <h3 className="font-bold text-gray-900 mb-2">{step.title}</h3>
                <p className="text-sm text-gray-600 mb-2">{step.description}</p>
                <Badge variant="secondary" className="text-xs">
                  <Clock className="w-3 h-3 mr-1" />
                  {step.time}
                </Badge>
                
                {/* Connector Arrow */}
                {index < quickStartSteps.length - 1 && (
                  <div className="hidden md:block absolute top-8 -right-3 transform -translate-y-1/2 z-10">
                    <ArrowRight className="w-6 h-6 text-emerald-400" />
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* CTA Section */}
        <div className="text-center space-y-6 max-w-2xl mx-auto">
          <div className="space-y-4">
            <h3 className="text-2xl font-bold text-gray-900">
              Tudo Pronto! Vamos Começar?
            </h3>
            <p className="text-gray-600">
              Seu dashboard inteligente está configurado e todas as ferramentas estão ativas. 
              Clique no botão abaixo para acessar sua central de comando.
            </p>
            
            <Button
              onClick={handleActivateDashboard}
              disabled={loading}
              size="lg"
              className="bg-gradient-to-r from-emerald-500 to-green-600 hover:from-emerald-600 hover:to-green-700 text-white font-bold text-xl px-12 py-6 rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:scale-105"
            >
              {loading ? (
                <div className="flex items-center gap-3">
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  Ativando Dashboard...
                </div>
              ) : (
                <div className="flex items-center gap-3">
                  <Sparkles className="w-6 h-6" />
                  Acessar Meu Dashboard
                  <ArrowRight className="w-6 h-6" />
                </div>
              )}
            </Button>
            
            <div className="flex items-center justify-center gap-6 text-sm text-gray-500 mt-6">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                <span>Sistema ativo</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
                <span>IA configurada</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-purple-500 rounded-full animate-pulse"></div>
                <span>Pronto para usar</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}