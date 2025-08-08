"use client"
import { useState, useRef, useEffect } from 'react'
import Image from 'next/image'
import { Skeleton } from './skeleton'

interface LazyImageProps {
  src: string
  alt: string
  width?: number
  height?: number
  className?: string
  fallback?: string
  priority?: boolean
}

export function LazyImage({ 
  src, 
  alt, 
  width = 400, 
  height = 300, 
  className = '',
  fallback = '/placeholder.jpg',
  priority = false
}: LazyImageProps) {
  const [isLoading, setIsLoading] = useState(true)
  const [hasError, setHasError] = useState(false)
  const [isInView, setIsInView] = useState(false)
  const imgRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsInView(true)
          observer.disconnect()
        }
      },
      { threshold: 0.1 }
    )

    if (imgRef.current) {
      observer.observe(imgRef.current)
    }

    return () => observer.disconnect()
  }, [])

  if (!isInView && !priority) {
    return (
      <div ref={imgRef} className={className} style={{ width, height }}>
        <Skeleton className="w-full h-full" />
      </div>
    )
  }

  return (
    <div ref={imgRef} className={`relative ${className}`}>
      {isLoading && <Skeleton className="absolute inset-0 w-full h-full" />}
      <Image
        src={hasError ? fallback : src}
        alt={alt}
        width={width}
        height={height}
        priority={priority}
        className={`transition-opacity duration-300 ${isLoading ? 'opacity-0' : 'opacity-100'}`}
        onLoad={() => setIsLoading(false)}
        onError={() => {
          setHasError(true)
          setIsLoading(false)
        }}
      />
    </div>
  )
}