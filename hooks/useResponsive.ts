"use client"
import { useState, useEffect } from 'react'

type Breakpoint = 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl'

interface BreakpointConfig {
  xs: number
  sm: number
  md: number
  lg: number
  xl: number
  '2xl': number
}

const defaultBreakpoints: BreakpointConfig = {
  xs: 0,
  sm: 640,
  md: 768,
  lg: 1024,
  xl: 1280,
  '2xl': 1536,
}

export function useResponsive(customBreakpoints?: Partial<BreakpointConfig>) {
  const breakpoints = { ...defaultBreakpoints, ...customBreakpoints }
  
  const [windowSize, setWindowSize] = useState({
    width: typeof window !== 'undefined' ? window.innerWidth : 1024,
    height: typeof window !== 'undefined' ? window.innerHeight : 768,
  })

  const [currentBreakpoint, setCurrentBreakpoint] = useState<Breakpoint>('lg')

  useEffect(() => {
    if (typeof window === 'undefined') return

    const handleResize = () => {
      const width = window.innerWidth
      const height = window.innerHeight
      
      setWindowSize({ width, height })

      // Determinar breakpoint atual
      if (width >= breakpoints['2xl']) {
        setCurrentBreakpoint('2xl')
      } else if (width >= breakpoints.xl) {
        setCurrentBreakpoint('xl')
      } else if (width >= breakpoints.lg) {
        setCurrentBreakpoint('lg')
      } else if (width >= breakpoints.md) {
        setCurrentBreakpoint('md')
      } else if (width >= breakpoints.sm) {
        setCurrentBreakpoint('sm')
      } else {
        setCurrentBreakpoint('xs')
      }
    }

    // Definir valores iniciais
    handleResize()

    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [breakpoints])

  // Funções utilitárias
  const isMobile = currentBreakpoint === 'xs' || currentBreakpoint === 'sm'
  const isTablet = currentBreakpoint === 'md'
  const isDesktop = currentBreakpoint === 'lg' || currentBreakpoint === 'xl' || currentBreakpoint === '2xl'
  
  const isBreakpoint = (bp: Breakpoint) => currentBreakpoint === bp
  const isBreakpointUp = (bp: Breakpoint) => windowSize.width >= breakpoints[bp]
  const isBreakpointDown = (bp: Breakpoint) => windowSize.width < breakpoints[bp]

  // Função para obter número de colunas baseado no breakpoint
  const getColumns = (config: Partial<Record<Breakpoint, number>>) => {
    const breakpointOrder: Breakpoint[] = ['2xl', 'xl', 'lg', 'md', 'sm', 'xs']
    
    for (const bp of breakpointOrder) {
      if (isBreakpointUp(bp) && config[bp] !== undefined) {
        return config[bp]!
      }
    }
    
    return config.xs || 1
  }

  // Função para obter valor responsivo
  const getResponsiveValue = <T>(config: Partial<Record<Breakpoint, T>>) => {
    const breakpointOrder: Breakpoint[] = ['2xl', 'xl', 'lg', 'md', 'sm', 'xs']
    
    for (const bp of breakpointOrder) {
      if (isBreakpointUp(bp) && config[bp] !== undefined) {
        return config[bp]!
      }
    }
    
    return config.xs
  }

  return {
    windowSize,
    currentBreakpoint,
    isMobile,
    isTablet,
    isDesktop,
    isBreakpoint,
    isBreakpointUp,
    isBreakpointDown,
    getColumns,
    getResponsiveValue,
    breakpoints,
  }
}