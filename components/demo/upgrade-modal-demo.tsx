"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { UpgradeModal } from "@/components/auth/upgrade-modal"

export function UpgradeModalDemo() {
  const [isOpen, setIsOpen] = useState(false)
  const [requiredPermission, setRequiredPermission] = useState<string | undefined>()

  const openModal = (permission?: string) => {
    setRequiredPermission(permission)
    setIsOpen(true)
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-8 text-center">
          Novo Modal de Upgrade - Design Minimalista
        </h1>
        
        <div className="bg-white rounded-2xl p-8 shadow-lg">
          <h2 className="text-xl font-semibold mb-6">Teste o Modal</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Button 
              onClick={() => openModal()}
              className="bg-primary hover:bg-primary/90 text-white"
            >
              Modal Geral
            </Button>
            
            <Button 
              onClick={() => openModal("canAccessAnalytics")} 
              variant="outline"
              className="border-primary text-primary hover:bg-primary hover:text-white"
            >
              Bloqueio - Analytics
            </Button>
            
            <Button 
              onClick={() => openModal("canUseVisualAnalysis")} 
              variant="outline"
              className="border-primary text-primary hover:bg-primary hover:text-white"
            >
              Bloqueio - IA Visual
            </Button>
          </div>

          <div className="mt-8 p-6 bg-gray-50 rounded-xl">
            <h3 className="font-semibold text-gray-900 mb-3">Características do Novo Design:</h3>
            <ul className="space-y-2 text-sm text-gray-700">
              <li>✅ Design minimalista e clean</li>
              <li>✅ Cores alinhadas com o projeto (verde primário)</li>
              <li>✅ Layout responsivo e moderno</li>
              <li>✅ Foco na usabilidade e conversão</li>
              <li>✅ Animações suaves e profissionais</li>
              <li>✅ Hierarquia visual clara</li>
            </ul>
          </div>
        </div>
      </div>

      <UpgradeModal
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        requiredPermission={requiredPermission}
      />
    </div>
  )
}