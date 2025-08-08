'use client'

import { useEffect, useState } from 'react'
import { useAuth } from './use-auth'

interface UserData {
  id: string
  email: string
  name: string
  role: string
  avatar?: string
  permissions: any
  subscription?: any
  cultivationCount: number
  canCreateMoreCultivations: boolean
  isEmailVerified: boolean
}

export function useUser() {
  const { user: authUser, loading: authLoading } = useAuth()
  const [user, setUser] = useState<UserData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchUserData = async () => {
      if (!authUser) {
        setUser(null)
        setLoading(false)
        return
      }

      try {
        const response = await fetch('/api/auth/supabase/me')
        const data = await response.json()
        
        if (data.user) {
          setUser(data.user)
        } else {
          setUser(null)
        }
      } catch (err) {
        setError('Erro ao carregar dados do usuário')
        console.error('Erro ao buscar dados do usuário:', err)
      } finally {
        setLoading(false)
      }
    }

    if (!authLoading) {
      fetchUserData()
    }
  }, [authUser, authLoading])

  const refetch = async () => {
    if (!authUser) return
    
    setLoading(true)
    try {
      const response = await fetch('/api/auth/supabase/me')
      const data = await response.json()
      
      if (data.user) {
        setUser(data.user)
      }
    } catch (err) {
      setError('Erro ao recarregar dados do usuário')
    } finally {
      setLoading(false)
    }
  }

  return {
    user,
    loading: authLoading || loading,
    error,
    refetch,
    isAuthenticated: !!authUser,
  }
}