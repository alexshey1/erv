'use client'

import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import type { User } from '@supabase/supabase-js'

export function useAuth() {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    // Verificar usuário atual
    const getUser = async () => {
      try {
        const { data: { user }, error } = await supabase.auth.getUser()
        
        if (error) {
          console.warn('Erro ao verificar usuário:', error.message)
          // Se o token está inválido, limpar e redirecionar
          if (error.message.includes('refresh_token_not_found') || error.message.includes('Invalid Refresh Token')) {
            await supabase.auth.signOut()
            setUser(null)
            setLoading(false)
            return
          }
        }
        
        setUser(user)
        setLoading(false)
      } catch (error) {
        console.error('Erro inesperado ao verificar usuário:', error)
        setUser(null)
        setLoading(false)
      }
    }

    getUser()

    // Escutar mudanças de autenticação
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('Auth state changed:', event)
        
        setUser(session?.user ?? null)
        setLoading(false)
        
        if (event === 'SIGNED_OUT' || event === 'TOKEN_REFRESHED') {
          if (event === 'SIGNED_OUT') {
            router.push('/auth/login')
          }
        }
      }
    )

    return () => subscription.unsubscribe()
  }, [router, supabase.auth])

  // Função de login
  const signIn = async (email: string, password: string) => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })
    return { data, error }
  }

  // Função de registro
  const signUp = async (email: string, password: string, name: string) => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          name: name,
        }
      }
    })
    return { data, error }
  }

  // Função de logout
  const signOut = async () => {
    const { error } = await supabase.auth.signOut()
    return { error }
  }

  // Login com Google
  const signInWithGoogle = async () => {
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/auth/callback`
      }
    })
    return { data, error }
  }

  // Reset de senha
  const resetPassword = async (email: string) => {
    const { data, error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/auth/reset-password`
    })
    return { data, error }
  }

  return {
    user,
    loading,
    signIn,
    signUp,
    signOut,
    signInWithGoogle,
    resetPassword,
  }
}