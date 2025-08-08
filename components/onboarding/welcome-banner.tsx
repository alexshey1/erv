'use client'

import { useState } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { 
  X, 
  Sprout, 
  Heart, 
  BookOpen, 
  ArrowRight,
  Sparkles,
  Sun,
  Moon,
  Coffee,
  Compass
} from 'lucide-react'

interface WelcomeBannerProps {
  user: any
  onDismiss: () => void
  onStartCultivation: () => void
}

export function WelcomeBanner({ user, onDismiss, onStartCultivation }: WelcomeBannerProps) {
  const [isVisible, setIsVisible] = useState(true)

  if (!isVisible) return null

  const handleDismiss = () => {
    setIsVisible(false)
    onDismiss()
  }

  const journeyMoments = [
    {
      icon: <Compass className="w-5 h-5" />,
      title: "Descobrir",
      description: "Encontre sua genética ideal"
    },
    {
      icon: <Sprout className="w-5 h-5" />,
      title: "Cultivar",
      description: "Acompanhe cada crescimento"
    },
    {
      icon: <Heart className="w-5 h-5" />,
      title: "Conectar",
      description: "Desenvolva sua paixão"
    }
  ]

  return (
    <Card className="relative overflow-hidden bg-gradient-to-br from-slate-800 via-gray-800 to-slate-900 text-white border-0 shadow-2xl mb-6">
      {/* Subtle Background Pattern */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute top-8 left-8 w-24 h-24 border border-white rounded-full" />
        <div className="absolute top-16 right-12 w-16 h-16 border border-white rounded-full" />
        <div className="absolute bottom-8 left-1/4 w-12 h-12 border border-white rounded-full" />
      </div>

      {/* Close Button */}
      <Button
        variant="ghost"
        size="sm"
        onClick={handleDismiss}
        className="absolute top-4 right-4 text-white/70 hover:text-white hover:bg-white/10 z-10"
      >
        <X className="w-4 h-4" />
      </Button>

      <CardContent className="p-8 relative">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
          
          {/* Left Content */}
          <div>
            <div className="flex items-center mb-6">
              <div className="w-12 h-12 bg-gradient-to-br from-green-400 to-emerald-500 rounded-2xl flex items-center justify-center mr-4 rotate-3">
                <Sprout className="w-6 h-6 text-white" />
              </div>
              <Badge variant="secondary" className="bg-white/10 text-white border-white/20 backdrop-blur-sm">
                <Sparkles className="w-3 h-3 mr-1" />
                Bem-vindo ao ErvApp
              </Badge>
            </div>

            <h2 className="text-3xl font-bold mb-4 leading-tight">
              Olá, {user?.name || 'Cultivador'}! 
              <span className="block text-2xl text-gray-300 font-normal mt-1">
                Sua jornada verde começa aqui 🌱
              </span>
            </h2>
            
            <p className="text-gray-300 text-lg mb-8 leading-relaxed">
              Cada cultivo é uma história única. Cada planta tem sua personalidade. 
              Vamos descobrir juntos o que a sua tem para contar.
            </p>

            <div className="space-y-4 mb-8">
              {journeyMoments.map((moment, index) => (
                <div key={index} className="flex items-center group">
                  <div className="w-10 h-10 bg-white/10 rounded-xl flex items-center justify-center mr-4 group-hover:bg-white/20 transition-colors">
                    {moment.icon}
                  </div>
                  <div>
                    <span className="font-semibold text-white">{moment.title}</span>
                    <span className="text-gray-300 ml-3">• {moment.description}</span>
                  </div>
                </div>
              ))}
            </div>

            <div className="flex flex-col sm:flex-row gap-4">
              <Button
                onClick={onStartCultivation}
                size="lg"
                className="bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white font-semibold px-8 py-3 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
              >
                <Sprout className="w-5 h-5 mr-2" />
                Começar Minha História
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
              
              <Button
                variant="ghost"
                size="lg"
                className="text-white border-white/20 hover:bg-white/10 px-6 py-3 rounded-2xl backdrop-blur-sm"
              >
                <BookOpen className="w-5 h-5 mr-2" />
                Explorar Guias
              </Button>
            </div>
          </div>

          {/* Right Content - Artistic Visual */}
          <div className="relative">
            <div className="relative w-full max-w-sm mx-auto">
              {/* Artistic Plant Representation */}
              <div className="relative">
                {/* Day/Night Cycle */}
                <div className="flex justify-between items-center mb-8">
                  <div className="flex flex-col items-center">
                    <div className="w-16 h-16 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full flex items-center justify-center mb-2 shadow-lg">
                      <Sun className="w-8 h-8 text-white" />
                    </div>
                    <span className="text-xs text-gray-400">Dia</span>
                  </div>
                  
                  <div className="flex-1 mx-4">
                    <div className="h-px bg-gradient-to-r from-yellow-400 via-green-400 to-blue-400 rounded-full" />
                  </div>
                  
                  <div className="flex flex-col items-center">
                    <div className="w-16 h-16 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full flex items-center justify-center mb-2 shadow-lg">
                      <Moon className="w-8 h-8 text-white" />
                    </div>
                    <span className="text-xs text-gray-400">Noite</span>
                  </div>
                </div>

                {/* Central Plant */}
                <div className="text-center">
                  <div className="text-6xl mb-4 animate-pulse">🌿</div>
                  <p className="text-sm text-gray-400 italic">
                    "Cada dia é uma nova página da sua história"
                  </p>
                </div>
              </div>
            </div>

            {/* Floating Elements */}
            <div className="absolute top-4 right-4 bg-white/10 backdrop-blur-sm rounded-xl p-3 border border-white/20">
              <div className="flex items-center">
                <Coffee className="w-4 h-4 mr-2 text-yellow-400" />
                <span className="text-xs text-gray-300">Ritual diário</span>
              </div>
            </div>

            <div className="absolute bottom-4 left-4 bg-white/10 backdrop-blur-sm rounded-xl p-3 border border-white/20">
              <div className="flex items-center">
                <Heart className="w-4 h-4 mr-2 text-red-400" />
                <span className="text-xs text-gray-300">Com amor</span>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}