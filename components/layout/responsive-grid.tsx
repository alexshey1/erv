"use client"
import { ReactNode } from 'react'
import { useResponsive } from '@/hooks/useResponsive'
import { cn } from '@/lib/utils'

interface ResponsiveGridProps {
  children: ReactNode
  columns?: {
    xs?: number
    sm?: number
    md?: number
    lg?: number
    xl?: number
    '2xl'?: number
  }
  gap?: string
  className?: string
}

export function ResponsiveGrid({ 
  children, 
  columns = { xs: 1, sm: 2, md: 3, lg: 4 },
  gap = 'gap-4',
  className = ''
}: ResponsiveGridProps) {
  const { getColumns } = useResponsive()
  
  const columnCount = getColumns(columns)
  
  const gridClasses = cn(
    'grid',
    gap,
    `grid-cols-${columnCount}`,
    className
  )
  
  return (
    <div className={gridClasses}>
      {children}
    </div>
  )
}

interface ResponsiveContainerProps {
  children: ReactNode
  className?: string
  maxWidth?: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | 'full'
}

export function ResponsiveContainer({ 
  children, 
  className = '',
  maxWidth = 'xl'
}: ResponsiveContainerProps) {
  const maxWidthClasses = {
    sm: 'max-w-sm',
    md: 'max-w-md', 
    lg: 'max-w-lg',
    xl: 'max-w-xl',
    '2xl': 'max-w-2xl',
    full: 'max-w-full'
  }
  
  return (
    <div className={cn(
      'mx-auto px-4 sm:px-6 lg:px-8',
      maxWidthClasses[maxWidth],
      className
    )}>
      {children}
    </div>
  )
}

interface MobileFirstCardProps {
  children: ReactNode
  className?: string
  padding?: 'sm' | 'md' | 'lg'
}

export function MobileFirstCard({ 
  children, 
  className = '',
  padding = 'md'
}: MobileFirstCardProps) {
  const { isMobile } = useResponsive()
  
  const paddingClasses = {
    sm: isMobile ? 'p-2' : 'p-3',
    md: isMobile ? 'p-3' : 'p-4',
    lg: isMobile ? 'p-4' : 'p-6'
  }
  
  return (
    <div className={cn(
      'bg-white border border-gray-200 rounded-xl shadow-sm',
      paddingClasses[padding],
      isMobile ? 'text-sm' : 'text-base',
      className
    )}>
      {children}
    </div>
  )
}