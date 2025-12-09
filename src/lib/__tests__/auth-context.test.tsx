import React from 'react'
import { render, screen, waitFor } from '@testing-library/react'
import { AuthProvider, useAuth } from '../auth-context'

// Mock next/navigation
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: jest.fn(),
    replace: jest.fn(),
    refresh: jest.fn(),
  }),
}))

// Mock next-auth
const mockUseSession = jest.fn()
jest.mock('next-auth/react', () => ({
  useSession: () => mockUseSession(),
  signIn: jest.fn(() => Promise.resolve({ ok: true })),
  signOut: jest.fn(() => Promise.resolve()),
  SessionProvider: ({ children }: { children: React.ReactNode }) => children,
}))

// Mock localStorage
const localStorageMock = (() => {
  let store: Record<string, string> = {}
  return {
    getItem: jest.fn((key: string) => store[key] || null),
    setItem: jest.fn((key: string, value: string) => { store[key] = value }),
    removeItem: jest.fn((key: string) => { delete store[key] }),
    clear: jest.fn(() => { store = {} }),
  }
})()

Object.defineProperty(window, 'localStorage', {
  value: localStorageMock,
  writable: true,
})

// Test component that uses the auth context
const TestComponent = () => {
  const { user, userProfile, loading } = useAuth()

  return (
    <div>
      {loading && <div data-testid="loading">Loading...</div>}
      {!loading && user ? (
        <div>
          <div>Welcome, {userProfile?.displayName}!</div>
          <div>Role: {userProfile?.role}</div>
        </div>
      ) : !loading ? (
        <div>
          <div>Not logged in</div>
        </div>
      ) : null}
    </div>
  )
}

const renderWithAuthProvider = (ui: React.ReactElement) => {
  return render(<AuthProvider>{ui}</AuthProvider>)
}

describe('AuthContext', () => {
  beforeEach(() => {
    localStorageMock.clear()
    jest.clearAllMocks()
    // Default: unauthenticated state
    mockUseSession.mockReturnValue({ data: null, status: 'unauthenticated' })
  })

  it('renders loading state when session is loading', () => {
    mockUseSession.mockReturnValue({ data: null, status: 'loading' })
    renderWithAuthProvider(<TestComponent />)

    expect(screen.getByTestId('loading')).toBeInTheDocument()
  })

  it('shows not logged in state when no user', async () => {
    mockUseSession.mockReturnValue({ data: null, status: 'unauthenticated' })
    renderWithAuthProvider(<TestComponent />)

    await waitFor(() => {
      expect(screen.getByText('Not logged in')).toBeInTheDocument()
    })
  })

  it('shows user info when authenticated', async () => {
    mockUseSession.mockReturnValue({
      data: {
        user: {
          id: 'user-123',
          email: 'test@example.com',
          name: 'Test User',
          role: 'member',
        },
      },
      status: 'authenticated',
    })

    renderWithAuthProvider(<TestComponent />)

    await waitFor(() => {
      expect(screen.getByText('Welcome, Test User!')).toBeInTheDocument()
      expect(screen.getByText('Role: member')).toBeInTheDocument()
    })
  })

  it('throws error when used outside provider', () => {
    const originalError = console.error
    console.error = jest.fn()

    expect(() => {
      render(<TestComponent />)
    }).toThrow('useAuth must be used within an AuthProvider')

    console.error = originalError
  })
})
