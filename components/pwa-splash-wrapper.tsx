'use client'

import { useEffect, useState } from 'react'
import SplashScreen from './splash-screen'

interface PWASplashWrapperProps {
  children: React.ReactNode
}

export default function PWASplashWrapper({ children }: PWASplashWrapperProps) {
  const [showSplash, setShowSplash] = useState(false)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // Check if app is running as PWA
    const isPWA = window.matchMedia('(display-mode: standalone)').matches || 
                  (window.navigator as any).standalone || 
                  document.referrer.includes('android-app://') ||
                  window.location.href.includes('?source=pwa')

    // Show splash only for PWA or first visit
    const hasSeenSplash = localStorage.getItem('ervapp-splash-shown')
    
    if (isPWA || !hasSeenSplash) {
      setShowSplash(true)
      localStorage.setItem('ervapp-splash-shown', 'true')
    } else {
      setIsLoading(false)
    }
  }, [])

  const handleSplashFinish = () => {
    setShowSplash(false)
    setIsLoading(false)
  }

  if (isLoading && showSplash) {
    return <SplashScreen onFinish={handleSplashFinish} />
  }

  return <>{children}</>
}
