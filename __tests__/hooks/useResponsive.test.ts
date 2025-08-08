import { renderHook, act } from '@testing-library/react'
import { useResponsive } from '@/hooks/useResponsive'

// Mock window object
const mockWindow = (width: number, height: number = 768) => {
  Object.defineProperty(window, 'innerWidth', {
    writable: true,
    configurable: true,
    value: width,
  })
  Object.defineProperty(window, 'innerHeight', {
    writable: true,
    configurable: true,
    value: height,
  })
}

describe('useResponsive', () => {
  beforeEach(() => {
    // Reset window size
    mockWindow(1024, 768)
  })

  it('should return correct initial values', () => {
    const { result } = renderHook(() => useResponsive())
    
    expect(result.current.windowSize.width).toBe(1024)
    expect(result.current.windowSize.height).toBe(768)
    expect(result.current.currentBreakpoint).toBe('lg')
    expect(result.current.isDesktop).toBe(true)
    expect(result.current.isMobile).toBe(false)
    expect(result.current.isTablet).toBe(false)
  })

  it('should detect mobile breakpoint', () => {
    mockWindow(480)
    const { result } = renderHook(() => useResponsive())
    
    expect(result.current.currentBreakpoint).toBe('xs')
    expect(result.current.isMobile).toBe(true)
    expect(result.current.isDesktop).toBe(false)
  })

  it('should detect tablet breakpoint', () => {
    mockWindow(768)
    const { result } = renderHook(() => useResponsive())
    
    expect(result.current.currentBreakpoint).toBe('md')
    expect(result.current.isTablet).toBe(true)
    expect(result.current.isMobile).toBe(false)
    expect(result.current.isDesktop).toBe(false)
  })

  it('should detect desktop breakpoint', () => {
    mockWindow(1280)
    const { result } = renderHook(() => useResponsive())
    
    expect(result.current.currentBreakpoint).toBe('xl')
    expect(result.current.isDesktop).toBe(true)
    expect(result.current.isMobile).toBe(false)
  })

  it('should handle window resize', () => {
    const { result } = renderHook(() => useResponsive())
    
    // Initial desktop
    expect(result.current.currentBreakpoint).toBe('lg')
    
    // Resize to mobile
    act(() => {
      mockWindow(480)
      window.dispatchEvent(new Event('resize'))
    })
    
    expect(result.current.currentBreakpoint).toBe('xs')
    expect(result.current.isMobile).toBe(true)
  })

  it('should return correct breakpoint checks', () => {
    mockWindow(1024)
    const { result } = renderHook(() => useResponsive())
    
    expect(result.current.isBreakpoint('lg')).toBe(true)
    expect(result.current.isBreakpoint('md')).toBe(false)
    expect(result.current.isBreakpointUp('md')).toBe(true)
    expect(result.current.isBreakpointUp('xl')).toBe(false)
    expect(result.current.isBreakpointDown('xl')).toBe(true)
    expect(result.current.isBreakpointDown('sm')).toBe(false)
  })

  it('should return correct columns based on breakpoint', () => {
    mockWindow(768)
    const { result } = renderHook(() => useResponsive())
    
    const columns = result.current.getColumns({
      xs: 1,
      sm: 2,
      md: 3,
      lg: 4,
    })
    
    expect(columns).toBe(3) // md breakpoint
  })

  it('should return responsive values correctly', () => {
    mockWindow(640)
    const { result } = renderHook(() => useResponsive())
    
    const value = result.current.getResponsiveValue({
      xs: 'small',
      sm: 'medium',
      lg: 'large',
    })
    
    expect(value).toBe('medium') // sm breakpoint
  })

  it('should use custom breakpoints', () => {
    const customBreakpoints = {
      sm: 500,
      md: 900,
    }
    
    mockWindow(600)
    const { result } = renderHook(() => useResponsive(customBreakpoints))
    
    expect(result.current.currentBreakpoint).toBe('sm')
  })

  it('should fallback to xs value when no match found', () => {
    mockWindow(320)
    const { result } = renderHook(() => useResponsive())
    
    const value = result.current.getResponsiveValue({
      xs: 'fallback',
      lg: 'large',
    })
    
    expect(value).toBe('fallback')
  })
})