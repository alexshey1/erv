'use client'

import { useState } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { 
  Lightbulb, 
  Droplets, 
  Thermometer, 
  Wind, 
  Clock, 
  Leaf,
  ChevronLeft,
  ChevronRight,
  Star
} from 'lucide-react'

const cannabisTips = [
  {
    category: "Iluminação",
    icon: <Lightbulb className="w-5 h-5" />,
    color: "from-yellow-400 to-orange-500",
    tips: [
      {
        title: "Ciclo de Luz Vegetativo",
        description: "18 horas de luz, 6 horas de escuridão para crescimento vigoroso",
        level: "Iniciante"
      },
      {
        title: "Ciclo de Luz Floração",
        description: "12 horas de luz, 12 horas de escuridão para induzir floração",
        level: "Iniciante"
      },
      {
        title: "Distância da Luz",
        description: "LED: 30-60cm | HPS: 60-90cm da copa das plantas",
        level: "Intermediário"
      }
    ]
  },
  {
    category: "Irrigação",
    icon: <Droplets className="w-5 h-5" />,
    color: "from-blue-400 to-cyan-500",
    tips: [
      {
        title: "Frequência de Rega",
        description: "Regue quando o substrato estiver seco 2-3cm abaixo da superfície",
        level: "Iniciante"
      },
      {
        title: "pH da Água",
        description: "Mantenha pH entre 6.0-7.0 para solo, 5.5-6.5 para hidroponia",
        level: "Intermediário"
      },
      {
        title: "Drenagem",
        description: "Sempre use vasos com furos para evitar encharcamento",
        level: "Iniciante"
      }
    ]
  },
  {
    category: "Nutrição",
    icon: <Leaf className="w-5 h-5" />,
    color: "from-green-400 to-emerald-500",
    tips: [
      {
        title: "NPK Vegetativo",
        description: "Use fertilizante rico em Nitrogênio (N) na fase vegetativa",
        level: "Iniciante"
      },
      {
        title: "NPK Floração",
        description: "Mude para fertilizante rico em Fósforo (P) e Potássio (K)",
        level: "Iniciante"
      },
      {
        title: "Flush Final",
        description: "2 semanas antes da colheita, use apenas água para limpar nutrientes",
        level: "Avançado"
      }
    ]
  },
  {
    category: "Ambiente",
    icon: <Thermometer className="w-5 h-5" />,
    color: "from-purple-400 to-pink-500",
    tips: [
      {
        title: "Temperatura Ideal",
        description: "22-26°C durante o dia, 18-22°C durante a noite",
        level: "Iniciante"
      },
      {
        title: "Umidade Relativa",
        description: "60-70% vegetativo, 40-50% floração para evitar mofo",
        level: "Intermediário"
      },
      {
        title: "Ventilação",
        description: "Mantenha ar circulando para fortalecer caules e prevenir pragas",
        level: "Iniciante"
      }
    ]
  }
]

export function CannabisTips() {
  const [currentCategory, setCurrentCategory] = useState(0)

  const nextCategory = () => {
    setCurrentCategory((prev) => (prev + 1) % cannabisTips.length)
  }

  const prevCategory = () => {
    setCurrentCategory((prev) => (prev - 1 + cannabisTips.length) % cannabisTips.length)
  }

  const currentTips = cannabisTips[currentCategory]

  const getLevelColor = (level: string) => {
    switch (level) {
      case 'Iniciante':
        return 'bg-green-100 text-green-800'
      case 'Intermediário':
        return 'bg-yellow-100 text-yellow-800'
      case 'Avançado':
        return 'bg-red-100 text-red-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  return (
    <Card className="bg-white border-gray-200 shadow-lg">
      <CardContent className="p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center">
            <div className={`w-10 h-10 rounded-lg bg-gradient-to-br ${currentTips.color} flex items-center justify-center text-white mr-3`}>
              {currentTips.icon}
            </div>
            <div>
              <h3 className="text-lg font-bold text-gray-800">{currentTips.category}</h3>
              <p className="text-sm text-gray-600">Dicas essenciais para cultivo</p>
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={prevCategory}
              className="w-8 h-8 p-0"
            >
              <ChevronLeft className="w-4 h-4" />
            </Button>
            
            <div className="flex space-x-1">
              {cannabisTips.map((_, index) => (
                <div
                  key={index}
                  className={`w-2 h-2 rounded-full transition-colors ${
                    index === currentCategory ? 'bg-green-500' : 'bg-gray-300'
                  }`}
                />
              ))}
            </div>
            
            <Button
              variant="ghost"
              size="sm"
              onClick={nextCategory}
              className="w-8 h-8 p-0"
            >
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
        </div>

        <div className="space-y-4">
          {currentTips.tips.map((tip, index) => (
            <div
              key={index}
              className="p-4 bg-gray-50 rounded-lg border border-gray-200 hover:border-green-300 transition-colors"
            >
              <div className="flex items-start justify-between mb-2">
                <h4 className="font-semibold text-gray-800">{tip.title}</h4>
                <Badge variant="secondary" className={`text-xs ${getLevelColor(tip.level)}`}>
                  {tip.level}
                </Badge>
              </div>
              <p className="text-sm text-gray-600 leading-relaxed">{tip.description}</p>
            </div>
          ))}
        </div>

        <div className="mt-6 p-4 bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg border border-green-200">
          <div className="flex items-center">
            <Star className="w-5 h-5 text-green-600 mr-2" />
            <span className="text-sm font-medium text-green-800">
              Dica Pro: Documente tudo! Anote mudanças e observe como suas plantas respondem.
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}