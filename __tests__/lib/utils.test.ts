import { cn } from '@/lib/utils'

describe('Utils', () => {
  describe('cn (className utility)', () => {
    it('should merge class names correctly', () => {
      const result = cn('text-red-500', 'bg-blue-500')
      expect(result).toContain('text-red-500')
      expect(result).toContain('bg-blue-500')
    })

    it('should handle conditional classes', () => {
      const isActive = true
      const result = cn('base-class', isActive && 'active-class')
      expect(result).toContain('base-class')
      expect(result).toContain('active-class')
    })

    it('should handle false conditional classes', () => {
      const isActive = false
      const result = cn('base-class', isActive && 'active-class')
      expect(result).toContain('base-class')
      expect(result).not.toContain('active-class')
    })

    it('should handle undefined and null values', () => {
      const result = cn('base-class', undefined, null, 'other-class')
      expect(result).toContain('base-class')
      expect(result).toContain('other-class')
    })

    it('should handle empty strings', () => {
      const result = cn('base-class', '', 'other-class')
      expect(result).toContain('base-class')
      expect(result).toContain('other-class')
    })

    it('should handle arrays of classes', () => {
      const result = cn(['class1', 'class2'], 'class3')
      expect(result).toContain('class1')
      expect(result).toContain('class2')
      expect(result).toContain('class3')
    })

    it('should handle objects with boolean values', () => {
      const result = cn({
        'active': true,
        'disabled': false,
        'visible': true
      })
      expect(result).toContain('active')
      expect(result).toContain('visible')
      expect(result).not.toContain('disabled')
    })

    it('should resolve conflicting Tailwind classes', () => {
      const result = cn('text-red-500', 'text-blue-500')
      // Should keep the last one (blue) due to tailwind-merge
      expect(result).toContain('text-blue-500')
      expect(result).not.toContain('text-red-500')
    })
  })
})