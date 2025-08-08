import { render, screen, fireEvent } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import ListaTarefas from '@/components/dashboard/ListaTarefas'

describe('ListaTarefas', () => {
  const mockTarefas = [
    { nome: 'Regar plantas', prazo: 'Hoje', concluida: false },
    { nome: 'Verificar pH', prazo: 'Amanhã', concluida: true },
    { nome: 'Podar folhas', prazo: 'Sexta-feira', concluida: false },
  ]

  const mockProps = {
    tarefas: mockTarefas,
    onToggleTarefa: jest.fn(),
    onAddTarefa: jest.fn(),
    onDeleteTarefa: jest.fn(),
  }

  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('should render task list with correct title', () => {
    render(<ListaTarefas {...mockProps} />)
    
    expect(screen.getByText('Próximas Tarefas')).toBeInTheDocument()
  })

  it('should render all tasks with correct information', () => {
    render(<ListaTarefas {...mockProps} />)
    
    expect(screen.getByText('Regar plantas')).toBeInTheDocument()
    expect(screen.getByText('Hoje')).toBeInTheDocument()
    expect(screen.getByText('Verificar pH')).toBeInTheDocument()
    expect(screen.getByText('Amanhã')).toBeInTheDocument()
    expect(screen.getByText('Podar folhas')).toBeInTheDocument()
    expect(screen.getByText('Sexta-feira')).toBeInTheDocument()
  })

  it('should show completed tasks with correct styling', () => {
    render(<ListaTarefas {...mockProps} />)
    
    const completedTask = screen.getByText('Verificar pH')
    expect(completedTask).toHaveClass('text-green-600')
    expect(completedTask).toHaveClass('line-through')
  })

  it('should show incomplete tasks with correct styling', () => {
    render(<ListaTarefas {...mockProps} />)
    
    const incompleteTask = screen.getByText('Regar plantas')
    expect(incompleteTask).toHaveClass('text-gray-900')
    expect(incompleteTask).not.toHaveClass('line-through')
  })

  it('should call onToggleTarefa when checkbox is clicked', async () => {
    const user = userEvent.setup()
    render(<ListaTarefas {...mockProps} />)
    
    const checkboxes = screen.getAllByRole('checkbox')
    await user.click(checkboxes[0])
    
    expect(mockProps.onToggleTarefa).toHaveBeenCalledWith(0)
  })

  it('should call onDeleteTarefa when delete button is clicked', async () => {
    const user = userEvent.setup()
    render(<ListaTarefas {...mockProps} />)
    
    const deleteButtons = screen.getAllByLabelText('Excluir tarefa')
    await user.click(deleteButtons[0])
    
    expect(mockProps.onDeleteTarefa).toHaveBeenCalledWith(0)
  })

  it('should add new task when form is submitted', async () => {
    const user = userEvent.setup()
    render(<ListaTarefas {...mockProps} />)
    
    const taskInput = screen.getByPlaceholderText('Nova tarefa')
    const deadlineInput = screen.getByPlaceholderText('Prazo')
    const addButton = screen.getByRole('button', { name: '' })
    
    await user.type(taskInput, 'Nova tarefa teste')
    await user.type(deadlineInput, 'Segunda-feira')
    await user.click(addButton)
    
    expect(mockProps.onAddTarefa).toHaveBeenCalledWith('Nova tarefa teste', 'Segunda-feira')
  })

  it('should add task with default deadline when deadline is empty', async () => {
    const user = userEvent.setup()
    render(<ListaTarefas {...mockProps} />)
    
    const taskInput = screen.getByPlaceholderText('Nova tarefa')
    const addButton = screen.getByRole('button', { name: '' })
    
    await user.type(taskInput, 'Tarefa sem prazo')
    await user.click(addButton)
    
    expect(mockProps.onAddTarefa).toHaveBeenCalledWith('Tarefa sem prazo', 'Sem prazo')
  })

  it('should not add task when task name is empty', async () => {
    const user = userEvent.setup()
    render(<ListaTarefas {...mockProps} />)
    
    const addButton = screen.getByRole('button', { name: '' })
    await user.click(addButton)
    
    expect(mockProps.onAddTarefa).not.toHaveBeenCalled()
  })

  it('should clear inputs after adding task', async () => {
    const user = userEvent.setup()
    render(<ListaTarefas {...mockProps} />)
    
    const taskInput = screen.getByPlaceholderText('Nova tarefa') as HTMLInputElement
    const deadlineInput = screen.getByPlaceholderText('Prazo') as HTMLInputElement
    const addButton = screen.getByRole('button', { name: '' })
    
    await user.type(taskInput, 'Test task')
    await user.type(deadlineInput, 'Test deadline')
    await user.click(addButton)
    
    expect(taskInput.value).toBe('')
    expect(deadlineInput.value).toBe('')
  })

  it('should render with empty tasks array', () => {
    render(<ListaTarefas tarefas={[]} />)
    
    expect(screen.getByText('Próximas Tarefas')).toBeInTheDocument()
    expect(screen.getByPlaceholderText('Nova tarefa')).toBeInTheDocument()
  })

  it('should handle form submission with Enter key', async () => {
    const user = userEvent.setup()
    render(<ListaTarefas {...mockProps} />)
    
    const taskInput = screen.getByPlaceholderText('Nova tarefa')
    
    await user.type(taskInput, 'Task via Enter')
    await user.keyboard('{Enter}')
    
    expect(mockProps.onAddTarefa).toHaveBeenCalledWith('Task via Enter', 'Sem prazo')
  })
})