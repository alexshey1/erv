'use client'

import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { createClient } from '@/lib/supabase/client'
import { Lock, Eye, EyeOff, CheckCircle } from 'lucide-react'

export default function ResetPasswordPage() {
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  const [isValidToken, setIsValidToken] = useState(false)
  
  const router = useRouter()
  const searchParams = useSearchParams()
  const supabase = createClient()

  useEffect(() => {
    // Verificar se há token de recuperação na URL
    const checkRecoveryToken = async () => {
      try {
        // O Supabase automaticamente processa o token da URL
        const { data, error } = await supabase.auth.getSession()
        
        if (error) {
          console.error('Erro ao verificar sessão:', error)
          setError('Link de recuperação inválido ou expirado. Solicite um novo link.')
          return
        }

        // Se não há sessão, verificar se há token na URL
        if (!data.session) {
          // Tentar recuperar a sessão do token da URL
          const { data: recoveryData, error: recoveryError } = await supabase.auth.getUser()
          
          if (recoveryError || !recoveryData.user) {
            setError('Link de recuperação inválido ou expirado. Solicite um novo link.')
            return
          }
        }

        setIsValidToken(true)
      } catch (err) {
        console.error('Erro ao verificar token:', err)
        setError('Link de recuperação inválido ou expirado. Solicite um novo link.')
      }
    }
    
    checkRecoveryToken()
  }, [supabase.auth])

  const validatePassword = (password: string) => {
    if (password.length < 6) {
      return 'A senha deve ter pelo menos 6 caracteres'
    }
    if (!/(?=.*[a-z])/.test(password)) {
      return 'A senha deve conter pelo menos uma letra minúscula'
    }
    if (!/(?=.*[A-Z])/.test(password)) {
      return 'A senha deve conter pelo menos uma letra maiúscula'
    }
    if (!/(?=.*\d)/.test(password)) {
      return 'A senha deve conter pelo menos um número'
    }
    return null
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!isValidToken) {
      setError('Link de recuperação inválido ou expirado. Solicite um novo link.')
      return
    }
    
    if (password !== confirmPassword) {
      setError('As senhas não coincidem.')
      return
    }
    
    const passwordError = validatePassword(password)
    if (passwordError) {
      setError(passwordError)
      return
    }
    
    setLoading(true)
    setError('')
    
    try {
      // Atualizar a senha do usuário
      const { error } = await supabase.auth.updateUser({
        password: password
      })
      
      if (error) {
        console.error('Erro ao atualizar senha:', error)
        setError(error.message || 'Erro ao alterar senha. Tente novamente.')
      } else {
        setSuccess(true)
        // Fazer logout para garantir que o usuário faça login com a nova senha
        await supabase.auth.signOut()
      }
    } catch (err) {
      console.error('Erro de conexão:', err)
      setError('Erro de conexão. Tente novamente.')
    } finally {
      setLoading(false)
    }
  }

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 to-emerald-100 p-4">
        <Card className="w-full max-w-md shadow-lg">
          <CardContent className="text-center py-8">
            <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-800 mb-2">Senha alterada!</h2>
            <p className="text-gray-600 mb-6">
              Sua senha foi alterada com sucesso. Você já pode fazer login com sua nova senha.
            </p>
            <Button 
              onClick={() => router.push('/auth/login')}
              className="bg-green-600 hover:bg-green-700"
            >
              Ir para Login
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 to-emerald-100 p-4">
      <Card className="w-full max-w-md shadow-lg">
        <CardHeader className="text-center">
          <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
            <Lock className="w-8 h-8 text-green-600" />
          </div>
          <CardTitle className="text-2xl font-bold text-gray-800">Nova Senha</CardTitle>
          <p className="text-gray-600">Digite sua nova senha</p>
        </CardHeader>
        
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <div className="relative">
                <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Nova senha"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="pl-10 pr-10"
                  required
                  disabled={!isValidToken}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-3 text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              <div className="text-xs text-gray-500 space-y-1">
                <p>A senha deve conter:</p>
                <ul className="list-disc list-inside space-y-0.5 ml-2">
                  <li>Pelo menos 6 caracteres</li>
                  <li>Uma letra maiúscula e minúscula</li>
                  <li>Um número</li>
                </ul>
              </div>
            </div>
            
            <div className="space-y-2">
              <div className="relative">
                <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  type="password"
                  placeholder="Confirmar nova senha"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="pl-10"
                  required
                  disabled={!isValidToken}
                />
              </div>
            </div>
            
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-md text-sm">
                {error}
              </div>
            )}
            
            <Button 
              type="submit" 
              className="w-full bg-green-600 hover:bg-green-700" 
              disabled={loading || !isValidToken}
            >
              {loading ? 'Alterando...' : 'Alterar Senha'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}