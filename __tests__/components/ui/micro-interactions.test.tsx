import { render, screen, fireEvent } from '@testing-library/react'
import { 
  HoverScale, 
  FadeIn, 
  SlideInLeft, 
  BounceButton, 
  StaggerContainer, 
  StaggerItem 
} from '@/components/ui/micro-interactions'

// Mock framer-motion
jest.mock('framer-motion', () => ({
  motion: {
    div: ({ children, ...props }: any) => <div {...props}>{children}</div>,
    button: ({ children, onClick, ...props }: any) => (
      <button onClick={onClick} {...props}>{children}</button>
    ),
  },
}))

describe('Micro Interactions', () => {
  describe('HoverScale', () => {
    it('should render children correctly', () => {
      render(
        <HoverScale>
          <div>Test Content</div>
        </HoverScale>
      )
      
      expect(screen.getByText('Test Content')).toBeInTheDocument()
    })

    it('should apply motion props', () => {
      const { container } = render(
        <HoverScale scale={1.1}>
          <div>Test Content</div>
        </HoverScale>
      )
      
      expect(container.firstChild).toBeInTheDocument()
    })
  })

  describe('FadeIn', () => {
    it('should render children with fade in animation', () => {
      render(
        <FadeIn delay={0.2}>
          <div>Fade In Content</div>
        </FadeIn>
      )
      
      expect(screen.getByText('Fade In Content')).toBeInTheDocument()
    })
  })

  describe('SlideInLeft', () => {
    it('should render children with slide animation', () => {
      render(
        <SlideInLeft delay={0.1}>
          <div>Slide Content</div>
        </SlideInLeft>
      )
      
      expect(screen.getByText('Slide Content')).toBeInTheDocument()
    })
  })

  describe('BounceButton', () => {
    it('should render button with bounce animation', () => {
      const mockClick = jest.fn()
      
      render(
        <BounceButton onClick={mockClick}>
          Click Me
        </BounceButton>
      )
      
      const button = screen.getByRole('button', { name: 'Click Me' })
      expect(button).toBeInTheDocument()
    })

    it('should call onClick when clicked', () => {
      const mockClick = jest.fn()
      
      render(
        <BounceButton onClick={mockClick}>
          Click Me
        </BounceButton>
      )
      
      const button = screen.getByRole('button', { name: 'Click Me' })
      fireEvent.click(button)
      
      expect(mockClick).toHaveBeenCalledTimes(1)
    })
  })

  describe('StaggerContainer and StaggerItem', () => {
    it('should render stagger container with items', () => {
      render(
        <StaggerContainer>
          <StaggerItem>
            <div>Item 1</div>
          </StaggerItem>
          <StaggerItem>
            <div>Item 2</div>
          </StaggerItem>
        </StaggerContainer>
      )
      
      expect(screen.getByText('Item 1')).toBeInTheDocument()
      expect(screen.getByText('Item 2')).toBeInTheDocument()
    })
  })
})