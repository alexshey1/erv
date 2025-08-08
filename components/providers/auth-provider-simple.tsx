'use client'

import { createContext, useContext, useState, ReactNode } from 'react'

interface AuthContextType {
  user: any
  loading: boolean
  isAuthenticated: boolean
  refetch: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProviderSimple({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(false)

  const refetch = async () => {
    // Simulação simples
    console.log('Refetch chamado')
  }

  return (
    <AuthContext.Provider value={{
      user,
      loading,
      isAuthenticated: false,
      refetch
    }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuthContextSimple() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuthContextSimple must be used within an AuthProviderSimple')
  }
  return context
} 