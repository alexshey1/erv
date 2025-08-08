import { render, screen } from '@testing-library/react'
import CardPlanta from '@/components/dashboard/CardPlanta'

// Mock do Next.js Link
jest.mock('next/link', () => {
  return ({ children, href }: { children: React.ReactNode; href: string }) => (
    <a href={href}>{children}</a>
  )
})

describe('CardPlanta', () => {
  const defaultProps = {
    imagem: '/test-image.jpg',
    cepa: 'Northern Lights',
    nome: 'Planta 01',
    idade: 42,
    fase: 'Floração (Semana 2)',
    progresso: 60,
    id: 'test-id-123',
    onRegar: jest.fn(),
    onFertilizar: jest.fn(),
    onObservar: jest.fn(),
  }

  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('should render plant card with correct information', () => {
    render(<CardPlanta {...defaultProps} />)
    
    expect(screen.getByText('Northern Lights')).toBeInTheDocument()
    expect(screen.getByText('Planta 01')).toBeInTheDocument()
    expect(screen.getByText('Dia 42')).toBeInTheDocument()
    expect(screen.getByText('Floração (Semana 2)')).toBeInTheDocument()
  })

  it('should render image with correct src and alt', () => {
    render(<CardPlanta {...defaultProps} />)
    
    const image = screen.getByRole('img')
    expect(image).toHaveAttribute('src', '/test-image.jpg')
    expect(image).toHaveAttribute('alt', 'Planta 01')
  })

  it('should render progress bar with correct width', () => {
    render(<CardPlanta {...defaultProps} />)
    
    const progressBar = screen.getByRole('progressbar')
    expect(progressBar.querySelector('div')).toHaveStyle('width: 60%')
  })

  it('should render link when id is provided', () => {
    render(<CardPlanta {...defaultProps} />)
    
    const link = screen.getByRole('link')
    expect(link).toHaveAttribute('href', '/history/test-id-123')
  })

  it('should not render link when id is null', () => {
    render(<CardPlanta {...defaultProps} id={null} />)
    
    expect(screen.queryByRole('link')).not.toBeInTheDocument()
    expect(screen.getByText('Planta 01')).toBeInTheDocument()
  })

  it('should use default values when props are not provided', () => {
    render(<CardPlanta />)
    
    expect(screen.getByText('Northern Lights')).toBeInTheDocument()
    expect(screen.getByText('Planta 01')).toBeInTheDocument()
    expect(screen.getByText('Dia 42')).toBeInTheDocument()
  })

  it('should handle active phase correctly', () => {
    render(<CardPlanta {...defaultProps} fase="active" />)
    
    expect(screen.getByText('ativo')).toBeInTheDocument()
  })

  it('should apply hover effects with correct classes', () => {
    const { container } = render(<CardPlanta {...defaultProps} />)
    
    const card = container.firstChild
    expect(card).toHaveClass('hover:shadow-xl')
    expect(card).toHaveClass('hover:scale-105')
    expect(card).toHaveClass('hover:z-10')
  })
})