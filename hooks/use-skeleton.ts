'use client'

import { useState, useEffect, useCallback } from 'react'

interface UseSkeletonOptions {
  delay?: number
  minDuration?: number
  autoHide?: boolean
}

export function useSkeleton(options: UseSkeletonOptions = {}) {
  const {
    delay = 0,
    minDuration = 500,
    autoHide = true,
  } = options

  const [isLoading, setIsLoading] = useState(true)
  const [showSkeleton, setShowSkeleton] = useState(true)
  const [startTime, setStartTime] = useState<number | null>(null)

  const startLoading = useCallback(() => {
    setIsLoading(true)
    setShowSkeleton(true)
    setStartTime(Date.now())
  }, [])

  const stopLoading = useCallback(() => {
    setIsLoading(false)
    
    if (startTime) {
      const elapsed = Date.now() - startTime
      const remaining = Math.max(0, minDuration - elapsed)
      
      if (remaining > 0) {
        setTimeout(() => {
          if (autoHide) {
            setShowSkeleton(false)
          }
        }, remaining)
      } else {
        if (autoHide) {
          setShowSkeleton(false)
        }
      }
    }
  }, [startTime, minDuration, autoHide])

  const reset = useCallback(() => {
    setIsLoading(true)
    setShowSkeleton(true)
    setStartTime(null)
  }, [])

  // Auto-start loading with delay
  useEffect(() => {
    if (delay > 0) {
      const timer = setTimeout(() => {
        startLoading()
      }, delay)
      
      return () => clearTimeout(timer)
    } else {
      startLoading()
      return undefined
    }
  }, [delay, startLoading])

  return {
    isLoading,
    showSkeleton,
    startLoading,
    stopLoading,
    reset,
  }
}

// Hook para loading de dados com skeleton
export function useDataLoading<T>(
  dataFetcher: () => Promise<T>,
  options: UseSkeletonOptions = {}
) {
  const [data, setData] = useState<T | null>(null)
  const [error, setError] = useState<string | null>(null)
  const skeleton = useSkeleton(options)

  const loadData = useCallback(async () => {
    try {
      skeleton.startLoading()
      setError(null)
      
      const result = await dataFetcher()
      setData(result)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao carregar dados')
    } finally {
      skeleton.stopLoading()
    }
  }, [dataFetcher, skeleton])

  const reload = useCallback(() => {
    setData(null)
    setError(null)
    skeleton.reset()
    loadData()
  }, [loadData, skeleton])

  return {
    data,
    error,
    isLoading: skeleton.isLoading,
    showSkeleton: skeleton.showSkeleton,
    loadData,
    reload,
  }
}

// Hook para loading de listas com paginação
export function useListLoading<T>(
  dataFetcher: (page: number, limit: number) => Promise<{
    data: T[]
    total: number
    page: number
    limit: number
  }>,
  options: UseSkeletonOptions = {}
) {
  const [data, setData] = useState<T[]>([])
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(1)
  const [limit, setLimit] = useState(10)
  const [error, setError] = useState<string | null>(null)
  const skeleton = useSkeleton(options)

  const loadData = useCallback(async (pageNum: number = 1) => {
    try {
      skeleton.startLoading()
      setError(null)
      
      const result = await dataFetcher(pageNum, limit)
      setData(result.data)
      setTotal(result.total)
      setPage(result.page)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao carregar dados')
    } finally {
      skeleton.stopLoading()
    }
  }, [dataFetcher, limit, skeleton])

  const loadMore = useCallback(async () => {
    try {
      const result = await dataFetcher(page + 1, limit)
      setData(prev => [...prev, ...result.data])
      setPage(result.page)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao carregar mais dados')
    }
  }, [dataFetcher, page, limit])

  const reload = useCallback(() => {
    setData([])
    setTotal(0)
    setPage(1)
    setError(null)
    skeleton.reset()
    loadData(1)
  }, [loadData, skeleton])

  return {
    data,
    total,
    page,
    limit,
    error,
    isLoading: skeleton.isLoading,
    showSkeleton: skeleton.showSkeleton,
    loadData,
    loadMore,
    reload,
    setLimit,
  }
} 