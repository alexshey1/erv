"use client"

import { ReactNode } from 'react'
import { canAccess } from '@/lib/permissions-supabase'
import { UpgradeModal } from './upgrade-modal'
import { useState } from 'react'
import { AlertTriangle, Lock } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'

interface PermissionGuardProps {
  user: any
  permission: string
  children: ReactNode
  fallback?: ReactNode
  showUpgradeModal?: boolean
}

export function PermissionGuard({ 
  user, 
  permission, 
  children, 
  fallback,
  showUpgradeModal = true 
}: PermissionGuardProps) {
  const [showModal, setShowModal] = useState(false)

  // Se o usuário ainda está carregando, não mostrar nada para evitar flash
  if (!user) {
    return null
  }

  if (!canAccess(user, permission as any)) {
    if (showUpgradeModal) {
      return (
        <>
          <Card className="w-full max-w-xl mx-auto my-4 shadow-none border-2 border-dashed border-yellow-300 bg-yellow-50/80 dark:bg-yellow-900/30 cursor-pointer transition hover:shadow-md rounded-2xl" onClick={() => setShowModal(true)}>
            <CardContent className="flex flex-col items-center justify-center py-8 gap-2 text-center">
              <Lock className="h-8 w-8 text-yellow-500 mb-2 mx-auto" />
              <span className="font-semibold text-lg text-yellow-900 dark:text-yellow-200">
                {permission === 'canUseVisualAnalysis' 
                  ? 'Análise Visual IA disponível apenas para planos Premium e Enterprise'
                  : 'Recurso disponível apenas para planos Premium e Enterprise'
                }
              </span>
              <span className="text-sm text-yellow-800 dark:text-yellow-300">
                {permission === 'canUseVisualAnalysis'
                  ? 'Faça upgrade para desbloquear análise visual com IA das suas plantas.'
                  : 'Faça upgrade para desbloquear este recurso avançado.'
                }
              </span>
            </CardContent>
          </Card>
          <UpgradeModal 
            isOpen={showModal} 
            onClose={() => setShowModal(false)}
            requiredPermission={permission}
          />
        </>
      )
    }
    return fallback || null
  }

  return <>{children}</>
}

interface FeatureGuardProps {
  user: any
  feature: string
  children: ReactNode
  showUpgradeModal?: boolean
}

export function FeatureGuard({ user, feature, children, showUpgradeModal = true }: FeatureGuardProps) {
  const [showModal, setShowModal] = useState(false)

  const hasAccess = canAccess(user, feature as any)

  if (!hasAccess && showUpgradeModal) {
    return (
      <>
        <div 
          className="cursor-pointer opacity-50 hover:opacity-75 transition-opacity"
          onClick={() => setShowModal(true)}
        >
          {children}
        </div>
        <UpgradeModal 
          isOpen={showModal} 
          onClose={() => setShowModal(false)}
          requiredFeature={feature}
        />
      </>
    )
  }

  if (!hasAccess) {
    return null
  }

  return <>{children}</>
} 