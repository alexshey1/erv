"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
// Dados dos planos extraídos da landing page
const LANDING_PLANS_DATA = [
  {
    name: "Grátis",
    plan: "free" as const,
    price: 0,
    description: "Ideal para quem está começando.",
    features: [
      "Dashboard Inteligente",
      "Histórico de Cultivos",
      "Até 6 cultivos ativos",
      "Suporte básico",
    ],
    popular: false,
    color: "from-white/70 to-green-50/60 border-green-200",
    icon: <Star className="h-8 w-8" />,
    ai: false,
    cta: "Plano Atual",
    ctaIcon: null,
    locked: ["Gráficos Avançados", "Comparação de Cultivos", "Analytics Preditivo", "IA Integrada para Analytics"],
  },
  {
    name: "Básico",
    plan: "basic" as const,
    price: 29,
    description: "Para quem quer mais controle.",
    features: [
      "Tudo do Grátis",
      "Analytics Avançado",
      "Relatórios Básicos",
      "Exportação de dados",
      "Até 20 cultivos ativos",
      "Suporte prioritário",
    ],
    popular: false,
    color: "from-white/80 to-blue-100/70 border-blue-300",
    icon: <Zap className="h-8 w-8" />,
    ai: false,
    cta: "Escolher Básico",
    ctaIcon: <ArrowRight className="ml-2 h-5 w-5" />,
    locked: ["Analytics Preditivo", "IA Integrada para Analytics"],
  },
  {
    name: "Premium",
    plan: "premium" as const,
    price: 69,
    description: "Recursos avançados e IA.",
    features: [
      "Tudo do Básico",
      "Alertas Inteligentes IA",
      "Relatórios Detalhados",
      "Até 50 cultivos ativos",
      "Suporte premium",
    ],
    popular: true,
    color: "from-white/90 to-purple-100/80 border-purple-400",
    icon: <Crown className="h-8 w-8" />,
    ai: true,
    cta: "Obter Premium",
    ctaIcon: <Sparkles className="ml-2 h-5 w-5" />,
    locked: [],
  },
  {
    name: "Enterprise",
    plan: "enterprise" as const,
    price: 149,
    description: "Para grandes operações.",
    features: [
      "Tudo do Premium",
      "Equipe e permissões",
      "API e integrações",
      "Cultivos ilimitados",
      "Suporte dedicado",
    ],
    popular: false,
    color: "from-white/95 to-yellow-200/90 border-yellow-500",
    icon: <Users className="h-8 w-8" />,
    ai: true,
    cta: "Escolher Enterprise",
    ctaIcon: <ArrowRight className="ml-2 h-5 w-5" />,
    locked: [],
  },
]
import { BrainCircuit, Check, Star, Zap, Crown, Users, ArrowRight, Lock, Sparkles } from "lucide-react"

export default function PlansPage() {
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null)

  const plans = LANDING_PLANS_DATA

  // Recursos premium para badges
  const premiumFeatures = [
    "Gráficos Avançados",
    "Comparação de Cultivos",
    "Analytics Preditivo",
    "IA Integrada para Analytics",
    "IA Avançada para Analytics e Automações"
  ]

  const handleSelectPlan = (plan: string) => {
    setSelectedPlan(plan)
    // Aqui você integraria com seu sistema de pagamento
    console.log(`Selected plan: ${plan}`)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-green-100 dark:from-gray-900 dark:to-gray-800 flex flex-col">
      <div className="container mx-auto px-2 py-8 flex-1">
        {/* Header */}
        <div className="text-center mb-10">
          <h1 className="text-4xl font-extrabold text-green-900 dark:text-green-200 mb-2 tracking-tight">
            Escolha seu Plano
          </h1>
          <p className="text-lg text-green-700 dark:text-green-300 max-w-2xl mx-auto">
            Comece grátis e escale conforme sua operação cresce.<br />Todos os planos incluem atualizações gratuitas.
          </p>
        </div>

        {/* Planos */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 max-w-7xl mx-auto">
          {plans.map((plan) => (
            <div
              key={plan.plan}
              className={`relative group transition-all duration-300 rounded-3xl border-2 ${plan.color} bg-gradient-to-br ${plan.color} shadow-xl hover:scale-105 hover:shadow-2xl overflow-visible flex flex-col min-h-[560px] backdrop-blur-md bg-opacity-70`}
              style={{ borderImage: 'linear-gradient(135deg, #22c55e 0%, #bbf7d0 100%) 1' }}
            >
              {/* Badge Mais Popular */}
              {plan.popular && (
                <Badge className="absolute -top-4 left-1/2 -translate-x-1/2 bg-green-600 text-white shadow-md z-10 px-4 py-1 rounded-full text-sm font-bold">
                  Mais Popular
                </Badge>
              )}
              {/* Badge IA */}
              {plan.ai && (
                <span className="absolute top-5 right-5 flex items-center gap-1 bg-green-100 text-green-700 px-3 py-1 rounded-full text-xs font-semibold shadow-sm">
                  <BrainCircuit className="h-4 w-4" /> IA Integrada
                </span>
              )}
              <div className="flex flex-col items-center pt-10 pb-2 px-4">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-green-50 border border-green-200 mb-3 mx-auto shadow-sm">
                  {plan.icon}
                </div>
                <span className="text-xl font-bold text-green-900 dark:text-green-200 mb-1">{plan.name}</span>
                <span className="text-green-700 dark:text-green-300 text-sm mb-2">{plan.description}</span>
              </div>
              <div className="flex-1 flex flex-col justify-between px-6 pb-8">
                {/* Preço */}
                <div className="text-center mb-2">
                  <span className="text-4xl font-extrabold text-green-900 dark:text-green-200">
                    R$ {plan.price.toFixed(0)}
                  </span>
                  <span className="text-green-700 dark:text-green-300 text-base ml-1">/mês</span>
                </div>
                {/* Features */}
                <ul className="space-y-3 mb-4 mt-4">
                  {plan.features.map((feature, index) => (
                    <li key={index} className="flex items-center gap-3 text-base text-green-900 dark:text-green-100">
                      {/* Badge para recursos premium */}
                      {premiumFeatures.includes(feature) ? (
                        <span className="inline-flex items-center gap-1 bg-green-100 text-green-700 px-2 py-0.5 rounded-lg text-xs font-semibold">
                          <Sparkles className="h-4 w-4" />
                          {feature}
                        </span>
                      ) : (
                        <Check className="h-5 w-5 text-green-500 flex-shrink-0" />
                      )}
                      {!premiumFeatures.includes(feature) && feature}
                    </li>
                  ))}
                  {/* Recursos bloqueados */}
                  {plan.locked && plan.locked.map((locked, i) => (
                    <li key={"locked-"+i} className="flex items-center gap-2 text-base text-gray-400 line-through">
                      <Lock className="h-4 w-4 text-gray-400" /> {locked}
                    </li>
                  ))}
                </ul>
                {/* Botão */}
                <Button
                  onClick={() => handleSelectPlan(plan.plan)}
                  className={`w-full py-5 text-base font-bold rounded-xl transition-all duration-200 flex items-center justify-center gap-2 shadow-lg
                    ${plan.plan === 'premium' ? 'bg-gradient-to-r from-green-500 to-green-400 text-white hover:from-green-600 hover:to-green-500' : ''}
                    ${plan.plan === 'enterprise' ? 'bg-gradient-to-r from-green-700 to-green-500 text-white hover:from-green-800 hover:to-green-600' : ''}
                    ${plan.plan === 'basic' ? 'bg-gradient-to-r from-green-400 to-green-300 text-green-900 hover:from-green-500 hover:to-green-400' : ''}
                    ${plan.plan === 'free' ? 'bg-green-100 text-green-700 border border-green-200 cursor-not-allowed' : ''}
                  `}
                  disabled={plan.plan === 'free'}
                >
                  {plan.cta}
                  {plan.ctaIcon}
                </Button>
              </div>
            </div>
          ))}
        </div>

        {/* FAQ */}
        <div className="mt-20 max-w-4xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-12 text-green-900 dark:text-green-200">
            Perguntas Frequentes
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-6">
              <div>
                <h3 className="font-semibold text-lg mb-2">Posso cancelar a qualquer momento?</h3>
                <p className="text-green-800 dark:text-green-200">
                  Sim! Você pode cancelar sua assinatura a qualquer momento sem taxas adicionais.
                </p>
              </div>
              <div>
                <h3 className="font-semibold text-lg mb-2">Há período de teste?</h3>
                <p className="text-green-800 dark:text-green-200">
                  Oferecemos 7 dias de teste gratuito em todos os planos pagos.
                </p>
              </div>
            </div>
            <div className="space-y-6">
              <div>
                <h3 className="font-semibold text-lg mb-2">Os dados são seguros?</h3>
                <p className="text-green-800 dark:text-green-200">
                  Sim! Utilizamos criptografia de ponta a ponta e backups automáticos.
                </p>
              </div>
              <div>
                <h3 className="font-semibold text-lg mb-2">Posso mudar de plano?</h3>
                <p className="text-green-800 dark:text-green-200">
                  Sim! Você pode fazer upgrade ou downgrade a qualquer momento.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* CTA */}
        <div className="mt-16 text-center">
          <p className="text-green-700 dark:text-green-300 mb-4">
            Ainda tem dúvidas? Entre em contato conosco
          </p>
          <Button variant="outline" size="lg" className="border-green-400 text-green-700 hover:bg-green-50">
            Falar com Suporte
          </Button>
        </div>
      </div>
      {/* Footer minimalista */}
      <footer className="w-full py-6 border-t border-green-100 bg-green-50 dark:bg-gray-900 text-center text-xs text-green-700 dark:text-green-200 flex flex-col gap-2">
        <div className="flex flex-wrap justify-center gap-4 mb-1">
          <a href="/terms" className="hover:underline">Termos de Serviço</a>
          <a href="/privacy" className="hover:underline">Política de Privacidade</a>
          <a href="mailto:suporte@ervapp.com" className="hover:underline">Suporte</a>
        </div>
        <span>Garantia de satisfação ou seu dinheiro de volta.</span>
      </footer>
    </div>
  )
} 