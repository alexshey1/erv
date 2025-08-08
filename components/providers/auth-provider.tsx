'use client'

import { createContext, useContext, useEffect, useState, ReactNode } from 'react'
import { useAuth } from '@/hooks/use-auth'

interface AuthContextType {
  user: any
  loading: boolean
  isAuthenticated: boolean
  refetch: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const { user: authUser, loading: authLoading } = useAuth()
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  const fetchUserData = async () => {
    if (!authUser) {
      setUser(null)
      setLoading(false)
      return
    }

    try {
      const response = await fetch('/api/auth/supabase/me')
      
      if (!response.ok) {
        console.warn('Erro na API de usuário:', response.status)
        setUser(null)
        setLoading(false)
        return
      }
      
      const data = await response.json()
      
      if (data.user) {
        setUser(data.user)
      } else {
        setUser(null)
      }
    } catch (err) {
      console.error('Erro ao buscar dados do usuário:', err)
      setUser(null)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (!authLoading) {
      fetchUserData()
    }
  }, [authUser, authLoading])

  const refetch = async () => {
    if (!authUser) return
    
    setLoading(true)
    await fetchUserData()
  }

  return (
    <AuthContext.Provider value={{
      user,
      loading: authLoading || loading,
      isAuthenticated: !!authUser,
      refetch
    }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuthContext() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuthContext must be used within an AuthProvider')
  }
  return context
}