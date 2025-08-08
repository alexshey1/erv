"use client"

import { ReactNode, useEffect, useState } from "react"
import { cn } from "@/lib/utils"

interface TransitionProps {
  children: ReactNode
  className?: string
}

// Transição suave de entrada para páginas
export function SmoothPageTransition({ children, className = "" }: TransitionProps) {
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    // Pequeno delay para garantir que o DOM está pronto
    const timer = setTimeout(() => setIsVisible(true), 50)
    return () => clearTimeout(timer)
  }, [])

  return (
    <div
      className={cn(
        "transition-all duration-700 ease-out",
        isVisible 
          ? "opacity-100 translate-y-0 scale-100" 
          : "opacity-0 translate-y-6 scale-95",
        className
      )}
    >
      {children}
    </div>
  )
}

// Container para animações em cascata
export function StaggerContainer({ children, className = "" }: TransitionProps) {
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    const timer = setTimeout(() => setIsVisible(true), 100)
    return () => clearTimeout(timer)
  }, [])

  return (
    <div
      className={cn(
        "transition-opacity duration-800 ease-out",
        isVisible ? "opacity-100" : "opacity-0",
        className
      )}
    >
      {children}
    </div>
  )
}

// Item individual com delay progressivo
export function StaggerItem({ 
  children, 
  className = "", 
  delay = 0 
}: TransitionProps & { delay?: number }) {
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    const timer = setTimeout(() => setIsVisible(true), 200 + (delay * 100))
    return () => clearTimeout(timer)
  }, [delay])

  return (
    <div
      className={cn(
        "transition-all duration-600 ease-out",
        isVisible 
          ? "opacity-100 translate-y-0" 
          : "opacity-0 translate-y-4",
        className
      )}
    >
      {children}
    </div>
  )
}

// Fade in com delay configurável
export function FadeIn({ 
  children, 
  className = "", 
  delay = 0 
}: TransitionProps & { delay?: number }) {
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    const timer = setTimeout(() => setIsVisible(true), delay * 1000)
    return () => clearTimeout(timer)
  }, [delay])

  return (
    <div
      className={cn(
        "transition-all duration-500 ease-out",
        isVisible 
          ? "opacity-100 translate-y-0" 
          : "opacity-0 translate-y-3",
        className
      )}
    >
      {children}
    </div>
  )
}

// Slide in com direções
export function SlideIn({ 
  children, 
  className = "", 
  direction = "up" 
}: TransitionProps & { direction?: "up" | "down" | "left" | "right" }) {
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    const timer = setTimeout(() => setIsVisible(true), 100)
    return () => clearTimeout(timer)
  }, [])

  const directionClasses = {
    up: isVisible ? "translate-y-0" : "translate-y-8",
    down: isVisible ? "translate-y-0" : "-translate-y-8",
    left: isVisible ? "translate-x-0" : "translate-x-8",
    right: isVisible ? "translate-x-0" : "-translate-x-8"
  }

  return (
    <div
      className={cn(
        "transition-all duration-500 ease-out",
        isVisible ? "opacity-100" : "opacity-0",
        directionClasses[direction],
        className
      )}
    >
      {children}
    </div>
  )
}

// Spinner de loading animado
export function SmoothLoadingSpinner({ size = "md" }: { size?: "sm" | "md" | "lg" }) {
  const sizeClasses = {
    sm: "h-6 w-6",
    md: "h-12 w-12",
    lg: "h-16 w-16"
  }

  return (
    <div className={cn(
      sizeClasses[size],
      "border-2 border-gray-300 border-t-green-500 rounded-full animate-spin mx-auto"
    )} />
  )
}

// Overlay de loading suave
export function SmoothLoadingOverlay({ 
  isLoading, 
  message = "Carregando..." 
}: { 
  isLoading: boolean
  message?: string 
}) {
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    if (isLoading) {
      setIsVisible(true)
    } else {
      setIsVisible(false)
    }
  }, [isLoading])

  if (!isLoading) return null

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
      <div 
        className={cn(
          "bg-white rounded-lg p-8 shadow-xl flex flex-col items-center gap-4 transition-all duration-300",
          isVisible ? "opacity-100 scale-100" : "opacity-0 scale-95"
        )}
      >
        <SmoothLoadingSpinner size="lg" />
        <p className="text-gray-600 font-medium text-lg">{message}</p>
      </div>
    </div>
  )
}

// Spinner de página completa
export function PageLoadingSpinner() {
  return (
    <div className="fixed inset-0 bg-gray-50 flex items-center justify-center z-50">
      <div className="text-center">
        <SmoothLoadingSpinner size="lg" />
        <FadeIn delay={0.3}>
          <p className="text-gray-600 mt-4 text-lg">Carregando aplicação...</p>
        </FadeIn>
      </div>
    </div>
  )
} 

// Centralizador de conteúdo na tela
export function ScreenCenter({ 
  children, 
  className = "" 
}: TransitionProps) {
  return (
    <div className={cn(
      "fixed inset-0 bg-gray-50 flex items-center justify-center z-50",
      className
    )}>
      <div className="text-center">
        {children}
      </div>
    </div>
  )
}

// Centralizador de conteúdo na área de conteúdo (sem sidebar)
export function ContentCenter({ 
  children, 
  className = "" 
}: TransitionProps) {
  return (
    <div className={cn(
      "flex-1 flex items-center justify-center bg-gray-50",
      className
    )}>
      <div className="text-center">
        {children}
      </div>
    </div>
  )
}

// Loading centralizado na tela
export function ScreenLoading({ 
  message = "Carregando...",
  className = "" 
}: { 
  message?: string
  className?: string 
}) {
  return (
    <div className={cn(
      "fixed inset-0 bg-gray-50 flex items-center justify-center z-50",
      className
    )}>
      <div className="text-center">
        <SmoothLoadingSpinner size="lg" />
        <FadeIn delay={0.2}>
          <p className="text-gray-600 mt-4 text-lg">{message}</p>
        </FadeIn>
      </div>
    </div>
  )
}

// Loading centralizado no conteúdo (sem sidebar)
export function ContentLoading({ 
  message = "Carregando...",
  className = "" 
}: { 
  message?: string
  className?: string 
}) {
  return (
    <div className={cn(
      "flex-1 flex items-center justify-center bg-gray-50",
      className
    )}>
      <div className="text-center">
        <SmoothLoadingSpinner size="lg" />
        <FadeIn delay={0.2}>
          <p className="text-gray-600 mt-4 text-lg">{message}</p>
        </FadeIn>
      </div>
    </div>
  )
}

// Overlay de loading com backdrop
export function LoadingOverlay({ 
  isLoading, 
  message = "Carregando..." 
}: { 
  isLoading: boolean
  message?: string 
}) {
  if (!isLoading) return null

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-8 shadow-xl flex flex-col items-center gap-4">
        <SmoothLoadingSpinner size="lg" />
        <p className="text-gray-600 font-medium text-lg">{message}</p>
      </div>
    </div>
  )
} 