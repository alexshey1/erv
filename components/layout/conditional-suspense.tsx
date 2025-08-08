'use client'

import { Suspense } from 'react'
import { usePathname } from 'next/navigation'

type ConditionalSuspenseProps = {
  fallback: React.ReactNode
  children: React.ReactNode
}

export default function ConditionalSuspense({ fallback, children }: ConditionalSuspenseProps) {
  const pathname = usePathname()
  if (pathname === '/') {
    return <>{children}</>
  }
  return <Suspense fallback={fallback}>{children}</Suspense>
} 