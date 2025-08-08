"use client"

import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { RotateCcw, ArrowRight } from 'lucide-react'

export default function ResetOnboardingPage() {
  const router = useRouter()

  const resetOnboarding = () => {
    localStorage.removeItem('ervapp_onboarding_completed')
    router.push('/onboarding')
  }

  const goToDashboard = () => {
    router.push('/dashboard')
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 to-green-50 flex items-center justify-center p-8">
      <Card className="max-w-md w-full">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold text-gray-900">
            Reset Onboarding
          </CardTitle>
          <p className="text-gray-600">
            Página para testar o fluxo de onboarding
          </p>
        </CardHeader>
        <CardContent className="space-y-4">
          <Button
            onClick={resetOnboarding}
            className="w-full bg-gradient-to-r from-emerald-500 to-green-600 hover:from-emerald-600 hover:to-green-700"
          >
            <RotateCcw className="w-4 h-4 mr-2" />
            Resetar e Ver Onboarding
          </Button>
          
          <Button
            onClick={goToDashboard}
            variant="outline"
            className="w-full"
          >
            <ArrowRight className="w-4 h-4 mr-2" />
            Ir para Dashboard
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}