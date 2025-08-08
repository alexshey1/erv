'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/hooks/use-auth'
import { Card, CardContent } from '@/components/ui/card'
import { Loader2 } from 'lucide-react'

interface AuthGuardProps {
  children: React.ReactNode
  redirectTo?: string
  requireEmailVerification?: boolean
}

export function AuthGuard({ 
  children, 
  redirectTo = '/auth/login',
  requireEmailVerification = false 
}: AuthGuardProps) {
  const { user, loading } = useAuth()
  const router = useRouter()
  const [isChecking, setIsChecking] = useState(true)

  useEffect(() => {
    if (!loading) {
      if (!user) {
        router.push(redirectTo)
      } else if (requireEmailVerification && !user.email_confirmed_at) {
        router.push('/auth/verify-email')
      } else {
        setIsChecking(false)
      }
    }
  }, [user, loading, router, redirectTo, requireEmailVerification])

  if (loading || isChecking) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Card className="w-full max-w-sm">
          <CardContent className="flex flex-col items-center justify-center py-8">
            <Loader2 className="w-8 h-8 animate-spin text-green-600 mb-4" />
            <p className="text-gray-600">Verificando autenticação...</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (!user) {
    return null // Será redirecionado
  }

  return <>{children}</>
}