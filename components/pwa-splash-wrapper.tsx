'use client'

import { useEffect, useState } from 'react'
import SplashScreen from './splash-screen'

interface PWASplashWrapperProps {
  children: React.ReactNode
}

export default function PWASplashWrapper({ children }: PWASplashWrapperProps) {
  const [isClient, setIsClient] = useState(false)
  const [showSplash, setShowSplash] = useState(false)

  // This effect runs only on the client, after the initial render
  useEffect(() => {
    const isPWA = window.matchMedia('(display-mode: standalone)').matches || 
                  (window.navigator as any).standalone || 
                  document.referrer.includes('android-app://') ||
                  window.location.href.includes('?source=pwa')

    const hasSeenSplash = localStorage.getItem('ervapp-splash-shown')
    
    if (isPWA || !hasSeenSplash) {
      setShowSplash(true)
      localStorage.setItem('ervapp-splash-shown', 'true')
    }
    
    // Mark that we are on the client and the logic has run
    setIsClient(true)
  }, [])

  const handleSplashFinish = () => {
    setShowSplash(false)
  }

  // During SSR, `isClient` is false, so we render nothing to avoid mismatch.
  // Once on the client, if we should show the splash, show it.
  if (isClient && showSplash) {
    return <SplashScreen onFinish={handleSplashFinish} />
  }

  // After splash (or if not needed), render children, but only on the client.
  // This prevents rendering children on the server and then flashing the splash on the client.
  if (isClient) {
    return <>{children}</>
  }

  // Render null on the server to prevent any hydration errors.
  return null
}
