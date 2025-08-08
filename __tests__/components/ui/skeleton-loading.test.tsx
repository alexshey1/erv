import { render, screen } from '@testing-library/react'
import { Skeleton } from '@/components/ui/skeleton'

describe('Skeleton Loading', () => {
  it('should render skeleton with default classes', () => {
    const { container } = render(<Skeleton />)
    
    const skeleton = container.firstChild
    expect(skeleton).toHaveClass('animate-pulse')
    expect(skeleton).toHaveClass('rounded-md')
    expect(skeleton).toHaveClass('bg-muted')
  })

  it('should apply custom className', () => {
    const { container } = render(<Skeleton className="w-full h-4" />)
    
    const skeleton = container.firstChild
    expect(skeleton).toHaveClass('w-full')
    expect(skeleton).toHaveClass('h-4')
    expect(skeleton).toHaveClass('animate-pulse')
  })

  it('should render multiple skeletons for loading states', () => {
    render(
      <div data-testid="skeleton-container">
        <Skeleton className="h-4 w-[250px]" />
        <Skeleton className="h-4 w-[200px]" />
        <Skeleton className="h-4 w-[150px]" />
      </div>
    )
    
    const container = screen.getByTestId('skeleton-container')
    expect(container.children).toHaveLength(3)
  })
})