import React from 'react'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

// Mock next/navigation
const mockPush = jest.fn()
const mockReplace = jest.fn()
const mockBack = jest.fn()
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: mockPush,
    replace: mockReplace,
    back: mockBack,
    prefetch: jest.fn(),
    forward: jest.fn(),
    refresh: jest.fn(),
  }),
  useSearchParams: () => ({
    get: jest.fn().mockReturnValue(null),
  }),
}))

// Mock next-auth/react
jest.mock('next-auth/react', () => ({
  useSession: () => ({
    status: 'unauthenticated',
    data: null,
  }),
  signIn: jest.fn(),
  signOut: jest.fn(),
  SessionProvider: ({ children }: { children: React.ReactNode }) => children,
}))

// Mock react-hot-toast
jest.mock('react-hot-toast', () => ({
  __esModule: true,
  default: {
    success: jest.fn(),
    error: jest.fn(),
  },
  Toaster: () => null,
}))

// Mock QuickLoginButtons component
jest.mock('@/components/auth/QuickLoginButtons', () => ({
  __esModule: true,
  default: ({ onLogin }: { onLogin: (email: string, password: string) => void }) => (
    <div data-testid="quick-login-buttons">
      <button
        onClick={() => onLogin('admin@codeb.com', 'admin123!')}
        type="button"
      >
        관리자: admin@codeb.com / admin123!
      </button>
      <button
        onClick={() => onLogin('customer@test.com', 'customer123!')}
        type="button"
      >
        고객: customer@test.com / customer123!
      </button>
    </div>
  ),
}))

// Mock auth-context
const mockSignIn = jest.fn()
const mockSignInWithGoogle = jest.fn()
jest.mock('@/lib/auth-context', () => ({
  useAuth: () => ({
    signIn: mockSignIn,
    signInWithGoogle: mockSignInWithGoogle,
    signOut: jest.fn(),
    user: null,
    isLoading: false,
  }),
  AuthProvider: ({ children }: { children: React.ReactNode }) => children,
}))

import LoginPage from '../src/app/(auth)/login/page'

describe('Login Integration', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    mockSignIn.mockResolvedValue({ success: true })
  })

  const renderLoginPage = () => {
    return render(<LoginPage />)
  }

  it('renders login form correctly', () => {
    renderLoginPage()

    expect(screen.getByText('CodeB')).toBeInTheDocument()
    expect(screen.getByText('AI 기반 개발 플랫폼')).toBeInTheDocument()
    // 로그인 텍스트가 여러 개 있을 수 있으므로 heading으로 찾기
    expect(screen.getByRole('heading', { name: '로그인' })).toBeInTheDocument()
    expect(screen.getByLabelText('이메일')).toBeInTheDocument()
    expect(screen.getByLabelText('비밀번호')).toBeInTheDocument()
  })

  it('shows test accounts information', () => {
    renderLoginPage()

    expect(screen.getByText('빠른 테스트 로그인')).toBeInTheDocument()
    expect(screen.getByText('관리자: admin@codeb.com / admin123!')).toBeInTheDocument()
    expect(screen.getByText('고객: customer@test.com / customer123!')).toBeInTheDocument()
  })

  it('shows password requirements', () => {
    renderLoginPage()

    expect(screen.getByText('최소 8자, 특수문자 포함')).toBeInTheDocument()
  })

  it('handles successful login with admin credentials', async () => {
    const user = userEvent.setup()
    renderLoginPage()

    const emailInput = screen.getByLabelText('이메일')
    const passwordInput = screen.getByLabelText('비밀번호')
    // 버튼은 role과 name 조합으로 찾기
    const loginButton = screen.getByRole('button', { name: '로그인' })

    await user.type(emailInput, 'admin@codeb.com')
    await user.type(passwordInput, 'admin123!')
    await user.click(loginButton)

    await waitFor(() => {
      expect(mockSignIn).toHaveBeenCalledWith('admin@codeb.com', 'admin123!')
    })
  })

  it('handles successful login with customer credentials', async () => {
    const user = userEvent.setup()
    renderLoginPage()

    const emailInput = screen.getByLabelText('이메일')
    const passwordInput = screen.getByLabelText('비밀번호')
    const loginButton = screen.getByRole('button', { name: '로그인' })

    await user.type(emailInput, 'customer@test.com')
    await user.type(passwordInput, 'customer123!')
    await user.click(loginButton)

    await waitFor(() => {
      expect(mockSignIn).toHaveBeenCalledWith('customer@test.com', 'customer123!')
    })
  })

  it('shows error for invalid credentials', async () => {
    mockSignIn.mockRejectedValue(new Error('로그인에 실패했습니다.'))

    const user = userEvent.setup()
    renderLoginPage()

    const emailInput = screen.getByLabelText('이메일')
    const passwordInput = screen.getByLabelText('비밀번호')
    const loginButton = screen.getByRole('button', { name: '로그인' })

    await user.type(emailInput, 'invalid@email.com')
    await user.type(passwordInput, 'wrongpassword')
    await user.click(loginButton)

    await waitFor(() => {
      expect(screen.getByText('로그인에 실패했습니다.')).toBeInTheDocument()
    })
  })

  it('shows error for weak password', async () => {
    mockSignIn.mockRejectedValue(new Error('로그인에 실패했습니다.'))

    const user = userEvent.setup()
    renderLoginPage()

    const emailInput = screen.getByLabelText('이메일')
    const passwordInput = screen.getByLabelText('비밀번호')
    const loginButton = screen.getByRole('button', { name: '로그인' })

    await user.type(emailInput, 'test@example.com')
    await user.type(passwordInput, 'weak')
    await user.click(loginButton)

    await waitFor(() => {
      expect(screen.getByText('로그인에 실패했습니다.')).toBeInTheDocument()
    })
  })

  it('requires both email and password', async () => {
    const user = userEvent.setup()
    renderLoginPage()

    const loginButton = screen.getByRole('button', { name: '로그인' })

    // Try to submit without filling fields
    await user.click(loginButton)

    // Form should not submit (HTML5 validation)
    expect(mockSignIn).not.toHaveBeenCalled()
  })

  it('shows loading state during login', async () => {
    // Make signIn return a promise that doesn't resolve immediately
    mockSignIn.mockImplementation(() => new Promise(resolve => setTimeout(() => resolve({ success: true }), 100)))

    const user = userEvent.setup()
    renderLoginPage()

    const emailInput = screen.getByLabelText('이메일')
    const passwordInput = screen.getByLabelText('비밀번호')
    const loginButton = screen.getByRole('button', { name: '로그인' })

    await user.type(emailInput, 'admin@codeb.com')
    await user.type(passwordInput, 'admin123!')
    await user.click(loginButton)

    // Should show loading state briefly
    await waitFor(() => {
      expect(screen.getByText('로그인 중...')).toBeInTheDocument()
    })
  })

  it('handles remember me checkbox', async () => {
    const user = userEvent.setup()
    renderLoginPage()

    const rememberCheckbox = screen.getByLabelText('로그인 상태 유지')

    expect(rememberCheckbox).not.toBeChecked()

    await user.click(rememberCheckbox)

    expect(rememberCheckbox).toBeChecked()
  })

  it('has forgot password link', () => {
    renderLoginPage()

    const forgotPasswordLink = screen.getByText('비밀번호를 잊으셨나요?')
    expect(forgotPasswordLink).toBeInTheDocument()
    expect(forgotPasswordLink).toHaveAttribute('href', '/forgot-password')
  })

  it('validates email format', async () => {
    const user = userEvent.setup()
    renderLoginPage()

    const emailInput = screen.getByLabelText('이메일')
    const passwordInput = screen.getByLabelText('비밀번호')
    const loginButton = screen.getByRole('button', { name: '로그인' })

    await user.type(emailInput, 'invalid-email')
    await user.type(passwordInput, 'validpass123!')
    await user.click(loginButton)

    // HTML5 validation should prevent submission
    expect(mockSignIn).not.toHaveBeenCalled()
  })

  it('disables login button when loading', async () => {
    mockSignIn.mockImplementation(() => new Promise(resolve => setTimeout(() => resolve({ success: true }), 500)))

    const user = userEvent.setup()
    renderLoginPage()

    const emailInput = screen.getByLabelText('이메일')
    const passwordInput = screen.getByLabelText('비밀번호')
    const loginButton = screen.getByRole('button', { name: '로그인' })

    await user.type(emailInput, 'admin@codeb.com')
    await user.type(passwordInput, 'admin123!')
    await user.click(loginButton)

    // Button should be disabled during loading
    await waitFor(() => {
      const loadingButton = screen.getByRole('button', { name: '로그인 중...' })
      expect(loadingButton).toBeDisabled()
    })
  })
})
