'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { 
  CheckCircle, 
  Circle, 
  Sprout, 
  User, 
  Camera, 
  Calendar,
  Trophy,
  ArrowRight,
  Sparkles
} from 'lucide-react'

interface OnboardingProgressProps {
  user: any
  cultivationCount: number
  hasProfilePhoto: boolean
  hasFirstEvent: boolean
}

export function OnboardingProgress({ 
  user, 
  cultivationCount, 
  hasProfilePhoto, 
  hasFirstEvent 
}: OnboardingProgressProps) {
  const [progress, setProgress] = useState(0)

  const steps = [
    {
      id: 'profile',
      title: 'Complete seu perfil',
      description: 'Adicione foto e informações básicas',
      icon: <User className="w-5 h-5" />,
      completed: hasProfilePhoto && user?.name,
      action: 'Completar perfil',
      href: '/profile'
    },
    {
      id: 'first-cultivation',
      title: 'Crie seu primeiro cultivo',
      description: 'Registre sua primeira planta',
      icon: <Sprout className="w-5 h-5" />,
      completed: cultivationCount > 0,
      action: 'Criar cultivo',
      href: '#create-cultivation'
    },
    {
      id: 'first-photo',
      title: 'Adicione uma foto',
      description: 'Documente o crescimento',
      icon: <Camera className="w-5 h-5" />,
      completed: hasFirstEvent,
      action: 'Adicionar foto',
      href: '#add-photo'
    },
    {
      id: 'first-event',
      title: 'Registre um evento',
      description: 'Anote rega, nutrição ou observação',
      icon: <Calendar className="w-5 h-5" />,
      completed: hasFirstEvent,
      action: 'Registrar evento',
      href: '#add-event'
    }
  ]

  const completedSteps = steps.filter(step => step.completed).length
  const progressPercentage = (completedSteps / steps.length) * 100

  useEffect(() => {
    setProgress(progressPercentage)
  }, [progressPercentage])

  if (completedSteps === steps.length) {
    return (
      <Card className="bg-gradient-to-r from-green-500 to-emerald-600 text-white border-0 shadow-lg">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center mr-4">
                <Trophy className="w-6 h-6 text-yellow-300" />
              </div>
              <div>
                <h3 className="text-lg font-bold">Parabéns! 🎉</h3>
                <p className="text-green-100">Você completou o setup inicial</p>
              </div>
            </div>
            <Sparkles className="w-8 h-8 text-yellow-300 animate-pulse" />
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="bg-gradient-to-br from-green-50 to-emerald-50 border-green-200">
      <CardContent className="p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-lg font-bold text-gray-800">Primeiros Passos</h3>
            <p className="text-sm text-gray-600">
              {completedSteps} de {steps.length} concluídos
            </p>
          </div>
          <Badge variant="secondary" className="bg-green-100 text-green-800">
            {Math.round(progressPercentage)}%
          </Badge>
        </div>

        <Progress value={progress} className="mb-6 h-2" />

        <div className="space-y-3">
          {steps.map((step, index) => (
            <div
              key={step.id}
              className={`flex items-center p-3 rounded-lg transition-all duration-200 ${
                step.completed 
                  ? 'bg-green-100 border border-green-200' 
                  : 'bg-white border border-gray-200 hover:border-green-300'
              }`}
            >
              <div className="flex items-center flex-1">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center mr-3 ${
                  step.completed 
                    ? 'bg-green-500 text-white' 
                    : 'bg-gray-200 text-gray-500'
                }`}>
                  {step.completed ? (
                    <CheckCircle className="w-4 h-4" />
                  ) : (
                    step.icon
                  )}
                </div>
                <div className="flex-1">
                  <h4 className={`font-medium ${
                    step.completed ? 'text-green-800' : 'text-gray-800'
                  }`}>
                    {step.title}
                  </h4>
                  <p className={`text-xs ${
                    step.completed ? 'text-green-600' : 'text-gray-500'
                  }`}>
                    {step.description}
                  </p>
                </div>
              </div>
              
              {!step.completed && (
                <Button
                  size="sm"
                  variant="ghost"
                  className="text-green-600 hover:text-green-700 hover:bg-green-100"
                >
                  {step.action}
                  <ArrowRight className="w-3 h-3 ml-1" />
                </Button>
              )}
            </div>
          ))}
        </div>

        {completedSteps > 0 && completedSteps < steps.length && (
          <div className="mt-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
            <div className="flex items-center">
              <Sparkles className="w-4 h-4 text-blue-600 mr-2" />
              <span className="text-sm text-blue-800">
                Ótimo progresso! Continue para desbloquear mais recursos.
              </span>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}