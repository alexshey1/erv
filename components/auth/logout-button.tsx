'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { useAuth } from '@/hooks/use-auth'
import { LogOut } from 'lucide-react'

interface LogoutButtonProps {
  variant?: 'default' | 'ghost' | 'outline'
  size?: 'default' | 'sm' | 'lg'
  className?: string
  showIcon?: boolean
  children?: React.ReactNode
}

export function LogoutButton({ 
  variant = 'ghost', 
  size = 'default',
  className = '',
  showIcon = true,
  children 
}: LogoutButtonProps) {
  const [loading, setLoading] = useState(false)
  const { signOut } = useAuth()
  const router = useRouter()

  const handleLogout = async () => {
    setLoading(true)
    
    try {
      await signOut()
      router.push('/auth/login')
    } catch (error) {
      console.error('Erro no logout:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Button
      variant={variant}
      size={size}
      onClick={handleLogout}
      disabled={loading}
      className={className}
    >
      {showIcon && <LogOut className="w-4 h-4 mr-2" />}
      {children || (loading ? 'Saindo...' : 'Sair')}
    </Button>
  )
}