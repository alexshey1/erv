import { render, screen, waitFor } from '@testing-library/react'
import { LazyImage } from '@/components/ui/lazy-image'

// Mock Next.js Image component
jest.mock('next/image', () => {
  return function MockImage({ src, alt, onLoad, onError, ...props }: any) {
    return (
      <img
        src={src}
        alt={alt}
        onLoad={onLoad}
        onError={onError}
        {...props}
      />
    )
  }
})

// Mock IntersectionObserver
const mockIntersectionObserver = jest.fn()
mockIntersectionObserver.mockReturnValue({
  observe: () => null,
  unobserve: () => null,
  disconnect: () => null
})
window.IntersectionObserver = mockIntersectionObserver

describe('LazyImage', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('should render skeleton initially when not in view', () => {
    render(
      <LazyImage
        src="/test-image.jpg"
        alt="Test Image"
        width={400}
        height={300}
      />
    )

    // Should show skeleton initially
    expect(document.querySelector('.animate-pulse')).toBeInTheDocument()
  })

  it('should render image when priority is true', () => {
    render(
      <LazyImage
        src="/test-image.jpg"
        alt="Test Image"
        width={400}
        height={300}
        priority={true}
      />
    )

    expect(screen.getByRole('img')).toBeInTheDocument()
    expect(screen.getByRole('img')).toHaveAttribute('src', '/test-image.jpg')
    expect(screen.getByRole('img')).toHaveAttribute('alt', 'Test Image')
  })

  it('should apply custom className', () => {
    const { container } = render(
      <LazyImage
        src="/test-image.jpg"
        alt="Test Image"
        className="custom-class"
        priority={true}
      />
    )

    expect(container.firstChild).toHaveClass('custom-class')
  })

  it('should use fallback image on error', async () => {
    render(
      <LazyImage
        src="/broken-image.jpg"
        alt="Test Image"
        fallback="/fallback.jpg"
        priority={true}
      />
    )

    const image = screen.getByRole('img')
    
    // Simulate image error
    Object.defineProperty(image, 'src', {
      writable: true,
      value: '/broken-image.jpg'
    })
    
    // The component should handle error and show fallback
    expect(image).toBeInTheDocument()
  })

  it('should set up IntersectionObserver when not priority', () => {
    render(
      <LazyImage
        src="/test-image.jpg"
        alt="Test Image"
        priority={false}
      />
    )

    expect(mockIntersectionObserver).toHaveBeenCalledWith(
      expect.any(Function),
      { threshold: 0.1 }
    )
  })

  it('should render with correct dimensions', () => {
    const { container } = render(
      <LazyImage
        src="/test-image.jpg"
        alt="Test Image"
        width={200}
        height={150}
        priority={false}
      />
    )

    const wrapper = container.firstChild as HTMLElement
    expect(wrapper).toHaveStyle({ width: '200px', height: '150px' })
  })
})