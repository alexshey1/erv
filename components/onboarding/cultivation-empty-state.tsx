'use client'

import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { 
  Camera,
  ArrowRight,
  Sparkles,
  Brain,
  Bell,
  Leaf,
  CheckCircle
} from 'lucide-react'

interface CultivationEmptyStateProps {
  user: any
  onCreateCultivation?: () => void
}

export function CultivationEmptyState({ user, onCreateCultivation }: CultivationEmptyStateProps) {

  const cultivationSteps = [
    {
      step: 1,
      title: "Cadastre seu Cultivo",
      description: "Nome, strain e data de início",
      icon: <Leaf className="w-6 h-6" />
    },
    {
      step: 2,
      title: "Configure Alertas",
      description: "Notificações inteligentes",
      icon: <Bell className="w-6 h-6" />
    },
    {
      step: 3,
      title: "Documente Eventos",
      description: "Fotos e observações",
      icon: <Camera className="w-6 h-6" />
    },
    {
      step: 4,
      title: "Analise com IA",
      description: "Insights e otimizações",
      icon: <Brain className="w-6 h-6" />
    }
  ]

  return (
    <div className="min-h-[400px] flex flex-col items-center justify-center p-8 bg-gradient-to-br from-emerald-50/80 via-white to-green-50/80 backdrop-blur-sm rounded-2xl border border-emerald-200/60">
      
      {/* Hero Section */}
      <div className="text-center mb-8 max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">
          Comece Seu Primeiro Cultivo
        </h1>
        
        <p className="text-lg text-gray-600 mb-6">
          Siga estes 4 passos simples para começar a usar nossa plataforma com IA
        </p>
      </div>

      {/* 4 Passos */}
      <div className="w-full max-w-4xl mx-auto mb-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {cultivationSteps.map((step, index) => (
            <div key={index} className="relative">
              <Card className="h-full bg-white/70 backdrop-blur-sm border border-gray-200/50 hover:border-green-300/50 transition-all duration-300">
                <CardContent className="p-6 text-center">
                  <div className="w-12 h-12 bg-gradient-to-br from-green-400 to-emerald-500 rounded-xl flex items-center justify-center text-white mx-auto mb-4 shadow-lg">
                    {step.icon}
                  </div>
                  
                  <Badge variant="outline" className="mb-3">
                    Passo {step.step}
                  </Badge>
                  <h3 className="font-bold text-gray-800 text-sm mb-2">{step.title}</h3>
                  <p className="text-xs text-gray-600">{step.description}</p>
                </CardContent>
              </Card>
              
              {/* Connector Arrow */}
              {index < cultivationSteps.length - 1 && (
                <div className="hidden lg:block absolute top-1/2 -right-3 transform -translate-y-1/2 z-10">
                  <ArrowRight className="w-5 h-5 text-green-400" />
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* CTA Principal */}
      <div className="text-center space-y-6">
        <Button
          onClick={onCreateCultivation}
          size="lg"
          className="bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white px-8 py-4 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 text-lg font-semibold"
        >
          <Sparkles className="w-5 h-5 mr-2" />
          Criar Meu Primeiro Cultivo
          <ArrowRight className="w-5 h-5 ml-2" />
        </Button>
        
        <div className="flex items-center justify-center gap-4 text-sm text-gray-500">
          <div className="flex items-center gap-1">
            <CheckCircle className="w-4 h-4 text-green-500" />
            <span>Gratuito</span>
          </div>
          <div className="flex items-center gap-1">
            <CheckCircle className="w-4 h-4 text-green-500" />
            <span>2 minutos</span>
          </div>
          <div className="flex items-center gap-1">
            <CheckCircle className="w-4 h-4 text-green-500" />
            <span>Com IA</span>
          </div>
        </div>
      </div>


    </div>
  )
}