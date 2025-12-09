import React from 'react'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import ChatInput from '../chat/ChatInput'

// Mock framer-motion to avoid issues with whileHover/whileTap props
jest.mock('framer-motion', () => ({
  motion: {
    button: ({ children, whileHover, whileTap, ...props }: any) => (
      <button {...props}>{children}</button>
    ),
    div: ({ children, initial, animate, exit, ...props }: any) => (
      <div {...props}>{children}</div>
    ),
  },
}))

describe('ChatInput', () => {
  const mockOnSend = jest.fn()
  const mockOnTyping = jest.fn()

  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('renders correctly', () => {
    render(<ChatInput onSend={mockOnSend} />)
    
    expect(screen.getByPlaceholderText('메시지를 입력하세요...')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /전송/i })).toBeInTheDocument()
  })

  it('sends message when form is submitted', async () => {
    const user = userEvent.setup()
    render(<ChatInput onSend={mockOnSend} />)
    
    const input = screen.getByPlaceholderText('메시지를 입력하세요...')
    const submitButton = screen.getByRole('button', { name: /전송/i })

    await user.type(input, '테스트 메시지')
    await user.click(submitButton)

    expect(mockOnSend).toHaveBeenCalledWith('테스트 메시지', undefined)
  })

  it('sends message when Enter is pressed', async () => {
    const user = userEvent.setup()
    render(<ChatInput onSend={mockOnSend} />)
    
    const input = screen.getByPlaceholderText('메시지를 입력하세요...')

    await user.type(input, '테스트 메시지{enter}')

    expect(mockOnSend).toHaveBeenCalledWith('테스트 메시지', undefined)
  })

  it('does not send empty messages', async () => {
    const user = userEvent.setup()
    render(<ChatInput onSend={mockOnSend} />)
    
    const submitButton = screen.getByRole('button', { name: /전송/i })
    await user.click(submitButton)

    expect(mockOnSend).not.toHaveBeenCalled()
  })

  it('clears input after sending message', async () => {
    const user = userEvent.setup()
    render(<ChatInput onSend={mockOnSend} />)
    
    const input = screen.getByPlaceholderText('메시지를 입력하세요...')

    await user.type(input, '테스트 메시지')
    await user.click(screen.getByRole('button', { name: /전송/i }))

    expect(input).toHaveValue('')
  })

  it('handles typing events', async () => {
    const user = userEvent.setup()
    render(<ChatInput onSend={mockOnSend} onTyping={mockOnTyping} />)
    
    const input = screen.getByPlaceholderText('메시지를 입력하세요...')

    await user.type(input, 'a')

    expect(mockOnTyping).toHaveBeenCalledWith(true)
  })

  it('handles file attachment', async () => {
    const user = userEvent.setup()
    render(<ChatInput onSend={mockOnSend} />)
    
    const fileInput = screen.getByRole('button', { name: /파일 첨부/i })
    
    expect(fileInput).toBeInTheDocument()
  })

  it('shows quick reply buttons', () => {
    render(<ChatInput onSend={mockOnSend} />)
    
    expect(screen.getByText('안녕하세요')).toBeInTheDocument()
    expect(screen.getByText('감사합니다')).toBeInTheDocument()
    expect(screen.getByText('확인했습니다')).toBeInTheDocument()
    expect(screen.getByText('언제 완료되나요?')).toBeInTheDocument()
  })

  it('fills input with quick reply text when clicked', async () => {
    const user = userEvent.setup()
    render(<ChatInput onSend={mockOnSend} />)
    
    const quickReply = screen.getByText('안녕하세요')
    const input = screen.getByPlaceholderText('메시지를 입력하세요...')

    await user.click(quickReply)

    expect(input).toHaveValue('안녕하세요')
  })

  it('disables input when disabled prop is true', () => {
    render(<ChatInput onSend={mockOnSend} disabled={true} />)
    
    const input = screen.getByPlaceholderText('메시지를 입력하세요...')
    const submitButton = screen.getByRole('button', { name: /전송/i })

    expect(input).toBeDisabled()
    expect(submitButton).toBeDisabled()
  })
})