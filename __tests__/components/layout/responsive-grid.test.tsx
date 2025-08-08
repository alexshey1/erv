import { render, screen } from '@testing-library/react'
import { ResponsiveGrid, ResponsiveContainer, MobileFirstCard } from '@/components/layout/responsive-grid'

// Mock useResponsive hook
jest.mock('@/hooks/useResponsive', () => ({
  useResponsive: () => ({
    getColumns: jest.fn((config) => config.md || 3),
    isMobile: false,
  }),
}))

describe('ResponsiveGrid', () => {
  it('should render children correctly', () => {
    render(
      <ResponsiveGrid>
        <div>Item 1</div>
        <div>Item 2</div>
        <div>Item 3</div>
      </ResponsiveGrid>
    )
    
    expect(screen.getByText('Item 1')).toBeInTheDocument()
    expect(screen.getByText('Item 2')).toBeInTheDocument()
    expect(screen.getByText('Item 3')).toBeInTheDocument()
  })

  it('should apply grid classes correctly', () => {
    const { container } = render(
      <ResponsiveGrid columns={{ xs: 1, md: 3, lg: 4 }}>
        <div>Item</div>
      </ResponsiveGrid>
    )
    
    const gridElement = container.firstChild
    expect(gridElement).toHaveClass('grid')
    expect(gridElement).toHaveClass('gap-4')
    expect(gridElement).toHaveClass('grid-cols-3')
  })

  it('should apply custom gap and className', () => {
    const { container } = render(
      <ResponsiveGrid gap="gap-6" className="custom-class">
        <div>Item</div>
      </ResponsiveGrid>
    )
    
    const gridElement = container.firstChild
    expect(gridElement).toHaveClass('gap-6')
    expect(gridElement).toHaveClass('custom-class')
  })
})

describe('ResponsiveContainer', () => {
  it('should render children with container classes', () => {
    const { container } = render(
      <ResponsiveContainer>
        <div>Container Content</div>
      </ResponsiveContainer>
    )
    
    expect(screen.getByText('Container Content')).toBeInTheDocument()
    expect(container.firstChild).toHaveClass('mx-auto')
    expect(container.firstChild).toHaveClass('px-4')
    expect(container.firstChild).toHaveClass('sm:px-6')
    expect(container.firstChild).toHaveClass('lg:px-8')
    expect(container.firstChild).toHaveClass('max-w-xl')
  })

  it('should apply custom maxWidth', () => {
    const { container } = render(
      <ResponsiveContainer maxWidth="2xl">
        <div>Content</div>
      </ResponsiveContainer>
    )
    
    expect(container.firstChild).toHaveClass('max-w-2xl')
  })

  it('should apply custom className', () => {
    const { container } = render(
      <ResponsiveContainer className="custom-container">
        <div>Content</div>
      </ResponsiveContainer>
    )
    
    expect(container.firstChild).toHaveClass('custom-container')
  })
})

describe('MobileFirstCard', () => {
  it('should render children with card styling', () => {
    const { container } = render(
      <MobileFirstCard>
        <div>Card Content</div>
      </MobileFirstCard>
    )
    
    expect(screen.getByText('Card Content')).toBeInTheDocument()
    expect(container.firstChild).toHaveClass('bg-white')
    expect(container.firstChild).toHaveClass('border')
    expect(container.firstChild).toHaveClass('border-gray-200')
    expect(container.firstChild).toHaveClass('rounded-xl')
    expect(container.firstChild).toHaveClass('shadow-sm')
  })

  it('should apply correct padding for desktop', () => {
    const { container } = render(
      <MobileFirstCard padding="lg">
        <div>Content</div>
      </MobileFirstCard>
    )
    
    // Since isMobile is false in mock, should use desktop padding
    expect(container.firstChild).toHaveClass('p-6')
  })

  it('should apply desktop text size', () => {
    const { container } = render(
      <MobileFirstCard>
        <div>Content</div>
      </MobileFirstCard>
    )
    
    // Since isMobile is false in mock, should use desktop text size
    expect(container.firstChild).toHaveClass('text-base')
  })

  it('should apply custom className', () => {
    const { container } = render(
      <MobileFirstCard className="custom-card">
        <div>Content</div>
      </MobileFirstCard>
    )
    
    expect(container.firstChild).toHaveClass('custom-card')
  })
})

// Test with mobile context
describe('MobileFirstCard - Mobile Context', () => {
  beforeEach(() => {
    // Mock mobile context
    jest.doMock('@/hooks/useResponsive', () => ({
      useResponsive: () => ({
        getColumns: jest.fn((config) => config.xs || 1),
        isMobile: true,
      }),
    }))
  })

  it('should apply mobile-specific styling', () => {
    // Re-import to get mocked version
    const { MobileFirstCard: MobileMobileFirstCard } = require('@/components/layout/responsive-grid')
    
    const { container } = render(
      <MobileMobileFirstCard padding="lg">
        <div>Mobile Content</div>
      </MobileMobileFirstCard>
    )
    
    expect(container.firstChild).toHaveClass('p-4')
    expect(container.firstChild).toHaveClass('text-sm')
  })
})