'use client'

import { ReactNode } from 'react'

interface PWASplashWrapperProps {
  children: ReactNode
}

export default function PWASplashWrapper({ children }: PWASplashWrapperProps) {
  // Temporariamente simplificado para evitar erros de hidratação
  return <div>{children}</div>
}
