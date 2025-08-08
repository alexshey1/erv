'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { useAuth } from '@/hooks/use-auth'
import { Eye, EyeOff, Mail, Lock, User, Chrome, CheckCircle } from 'lucide-react'

export default function RegisterPage() {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  const [acceptedTerms, setAcceptedTerms] = useState(false)
  
  const router = useRouter()
  const { signUp, signInWithGoogle } = useAuth()

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
    setLoading(true)
    setError('')
    
    // Validações
    if (password !== confirmPassword) {
      setError('As senhas não coincidem')
      setLoading(false)
      return
    }
    
    const passwordError = validatePassword(password)
    if (passwordError) {
      setError(passwordError)
      setLoading(false)
      return
    }
    
    try {
      const { error } = await signUp(email, password, name)
      
      if (error) {
        setError(error.message)
      } else {
        setSuccess(true)
      }
    } catch (err) {
      setError('Erro de conexão. Tente novamente.')
    } finally {
      setLoading(false)
    }
  }

  const handleGoogleSignup = async () => {
    setLoading(true)
    setError('')
    
    try {
      const { error } = await signInWithGoogle()
      if (error) {
        setError(error.message)
      }
    } catch (err) {
      setError('Erro ao registrar com Google.')
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
            <h2 className="text-2xl font-bold text-gray-800 mb-2">Conta criada com sucesso!</h2>
            <p className="text-gray-600 mb-6">
              Enviamos um email de confirmação para <strong>{email}</strong>. 
              Verifique sua caixa de entrada e clique no link para ativar sua conta.
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
          <div className="mx-auto mb-4 flex items-center justify-center">
            <Image src="/ervapp-logo.png" alt="Logo ErvApp" width={128} height={128} className="object-contain" />
          </div>
          <CardTitle className="text-2xl font-bold text-gray-800">Criar Conta</CardTitle>
          <p className="text-gray-600">Comece sua jornada de cultivo</p>
        </CardHeader>
        
        <CardContent className="space-y-4">
          {/* Formulário de registro */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <div className="relative">
                <User className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  type="text"
                  placeholder="Seu nome completo"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="pl-10"
                  required
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <div className="relative">
                <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  type="email"
                  placeholder="seu@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="pl-10"
                  required
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <div className="relative">
                <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Sua senha"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="pl-10 pr-10"
                  required
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
                  placeholder="Confirme sua senha"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="pl-10"
                  required
                />
              </div>
            </div>
            
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-md text-sm">
                {error}
              </div>
            )}
            
            <div className="flex items-start mb-2">
              <input
                id="terms"
                type="checkbox"
                checked={acceptedTerms}
                onChange={(e) => setAcceptedTerms(e.target.checked)}
                className="mt-1 mr-2"
                required
              />
              <label htmlFor="terms" className="text-xs text-gray-500 select-none">
                Eu li e aceito os
                <Link href="/terms" className="text-green-600 hover:underline ml-1" target="_blank">Termos de Uso</Link>
                {' '}e{' '}
                <Link href="/privacy" className="text-green-600 hover:underline" target="_blank">Política de Privacidade</Link>.
              </label>
            </div>
            <Button 
              type="submit" 
              className="w-full bg-green-600 hover:bg-green-700" 
              disabled={loading || !acceptedTerms}
            >
              {loading ? 'Criando conta...' : 'Criar Conta'}
            </Button>
          </form>

          <div className="text-center">
            <p className="text-sm text-gray-600">
              Já tem uma conta?{' '}
              <Link 
                href="/auth/login" 
                className="text-green-600 hover:text-green-700 font-medium hover:underline"
              >
                Faça login
              </Link>
            </p>
          </div>


          <div className="relative mt-6">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-white px-2 text-gray-500">Ou registre-se com Google</span>
            </div>
          </div>

          {/* Registro com Google */}
          <Button
            type="button"
            variant="outline"
            className="w-full mt-2"
            onClick={handleGoogleSignup}
            disabled={loading}
          >
            <Chrome className="w-4 h-4 mr-2" />
            Continuar com Google
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}