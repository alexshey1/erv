"use client"

import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Check, Star, Zap, Crown, Users, Rocket, Sparkles, Shield, Clock, BrainCircuit, ArrowRight, TrendingUp, BarChart3, Bell, FileText, Download, Share2, Cpu, Headphones, X } from "lucide-react"
import { useState } from "react"

// Planos com design minimalista e moderno
const PLANS = [
  {
    name: "Grátis",
    plan: "free",
    price: 0,
    description: "Para começar",
    features: [
      "Dashboard básico",
      "Até 6 cultivos",
      "Relatórios simples",
      "Suporte por email"
    ],
    current: true,
    color: "gray"
  },
  {
    name: "Básico",
    plan: "basic",
    price: 29,
    description: "Mais recursos",
    features: [
      "Tudo do Grátis",
      "Analytics avançado",
      "Até 20 cultivos",
      "Exportação de dados",
      "Suporte prioritário"
    ],
    color: "blue"
  },
  {
    name: "Premium",
    plan: "premium",
    price: 69,
    description: "Com IA integrada",
    features: [
      "Tudo do Básico",
      "Alertas inteligentes IA",
      "Análise preditiva",
      "Até 50 cultivos",
      "Suporte 24/7",
      "Análise visual IA"
    ],
    popular: true,
    color: "green"
  },
  {
    name: "Enterprise",
    plan: "enterprise",
    price: 149,
    description: "Para empresas",
    features: [
      "Tudo do Premium",
      "Gestão de equipes",
      "API completa",
      "Cultivos ilimitados",
      "Suporte dedicado",
      "Integrações custom"
    ],
    color: "purple"
  }
]

interface UpgradeModalProps {
  isOpen: boolean
  onClose: () => void
  requiredPermission?: string
  requiredFeature?: string
}

export function UpgradeModal({ isOpen, onClose, requiredPermission, requiredFeature }: UpgradeModalProps) {
  const getFeatureName = (permission: string) => {
    const features: Record<string, string> = {
      canAccessAnalytics: "Analytics Avançado",
      canAccessReports: "Relatórios Detalhados",
      canAccessAnomalies: "Alertas Inteligentes",
      canAccessComparison: "Comparação de Cultivos",
      canCreateCultivations: "Mais Cultivos",
      canExportData: "Exportação de Dados",
      canShareCultivations: "Compartilhamento",
      canUseAdvancedFeatures: "Recursos Avançados",
      canAccessAPI: "Acesso à API",
      canUseRealTimeData: "Dados em Tempo Real",
      canUsePredictiveAnalytics: "Analytics Preditivo",
      canUseCustomReports: "Relatórios Customizados",
      canUseTeamFeatures: "Recursos de Equipe",
      canUsePrioritySupport: "Suporte Prioritário",
      canUseVisualAnalysis: "Análise Visual IA",
    }
    return features[permission] || "Recurso Premium"
  }

  const blockedFeature = requiredPermission ? getFeatureName(requiredPermission) : requiredFeature

  const handleUpgrade = (plan: string) => {
    console.log(`Upgrading to ${plan}`)
    onClose()
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-5xl p-0 bg-white rounded-3xl border-0 shadow-xl overflow-hidden">
        <DialogTitle className="sr-only">Escolha seu plano</DialogTitle>

        {/* Header minimalista */}
        <div className="relative px-8 py-8 text-center bg-gradient-to-b from-gray-50 to-white">
          <button
            onClick={onClose}
            className="absolute top-6 right-6 p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X className="h-5 w-5 text-gray-400" />
          </button>

          {blockedFeature && (
            <div className="inline-flex items-center gap-2 bg-red-50 text-red-700 px-4 py-2 rounded-full text-sm font-medium mb-6 border border-red-200">
              <Shield className="h-4 w-4" />
              Recurso bloqueado: {blockedFeature}
            </div>
          )}

          <div className="w-16 h-16 bg-primary/10 rounded-2xl mx-auto flex items-center justify-center mb-6">
            <Rocket className="h-8 w-8 text-primary" />
          </div>

          <h1 className="text-3xl font-bold text-gray-900 mb-3">
            {blockedFeature ? "Desbloqueie este recurso" : "Escolha seu plano"}
          </h1>

          <p className="text-gray-600 text-lg max-w-2xl mx-auto">
            {blockedFeature
              ? "Faça upgrade para acessar recursos avançados e IA"
              : "Planos flexíveis para cada necessidade"}
          </p>
        </div>
        {/* Grid de planos minimalista */}
        <div className="px-8 pb-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 max-w-6xl mx-auto">
            {PLANS.map((plan) => {
              const isPopular = plan.popular
              const isCurrent = plan.current

              return (
                <div
                  key={plan.plan}
                  className={`relative bg-white border-2 rounded-2xl p-6 transition-all duration-300 hover:shadow-lg ${isPopular
                      ? 'border-primary shadow-lg scale-105'
                      : isCurrent
                        ? 'border-gray-200 bg-gray-50'
                        : 'border-gray-200 hover:border-primary/50'
                    }`}
                >
                  {/* Badge popular */}
                  {isPopular && (
                    <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                      <Badge className="bg-primary text-white px-3 py-1 text-xs font-semibold">
                        Mais Popular
                      </Badge>
                    </div>
                  )}

                  {/* Header do plano */}
                  <div className="text-center mb-6">
                    <h3 className="text-xl font-bold text-gray-900 mb-1">{plan.name}</h3>
                    <p className="text-sm text-gray-600 mb-4">{plan.description}</p>

                    <div className="mb-4">
                      <span className="text-4xl font-bold text-gray-900">R$ {plan.price}</span>
                      <span className="text-gray-600 ml-1">/mês</span>
                    </div>
                  </div>

                  {/* Features */}
                  <ul className="space-y-3 mb-8">
                    {plan.features.map((feature, i) => (
                      <li key={i} className="flex items-start text-sm">
                        <Check className={`h-4 w-4 mr-3 mt-0.5 flex-shrink-0 ${isCurrent ? 'text-gray-400' : 'text-primary'
                          }`} />
                        <span className={isCurrent ? 'text-gray-600' : 'text-gray-700'}>
                          {feature}
                        </span>
                      </li>
                    ))}
                  </ul>

                  {/* Botão */}
                  <Button
                    onClick={() => !isCurrent ? handleUpgrade(plan.plan) : undefined}
                    disabled={isCurrent}
                    className={`w-full py-3 rounded-xl font-semibold transition-all ${isCurrent
                        ? 'bg-gray-100 text-gray-500 cursor-not-allowed'
                        : isPopular
                          ? 'bg-primary hover:bg-primary/90 text-white shadow-lg hover:shadow-xl'
                          : 'bg-white border-2 border-primary text-primary hover:bg-primary hover:text-white'
                      }`}
                  >
                    {isCurrent ? 'Plano Atual' : `Escolher ${plan.name}`}
                  </Button>
                </div>
              )
            })}
          </div>

          {/* Footer simples */}
          <div className="text-center mt-12 pt-8 border-t border-gray-200">
            <div className="flex flex-wrap justify-center items-center gap-8 text-sm text-gray-600 mb-4">
              <div className="flex items-center">
                <Shield className="h-4 w-4 mr-2 text-primary" />
                <span>Garantia de 30 dias</span>
              </div>
              <div className="flex items-center">
                <Zap className="h-4 w-4 mr-2 text-primary" />
                <span>Ativação instantânea</span>
              </div>
              <div className="flex items-center">
                <Clock className="h-4 w-4 mr-2 text-primary" />
                <span>Cancele quando quiser</span>
              </div>
            </div>

            <p className="text-xs text-gray-500 max-w-lg mx-auto">
              Todos os planos incluem suporte técnico e atualizações gratuitas.
              Sem taxas de cancelamento.
            </p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
} 