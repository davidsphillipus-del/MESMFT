import React, { createContext, useContext, useReducer, useEffect } from 'react'
import { authAPI } from '../services/api'

interface User {
  id: string
  email: string
  role: 'PATIENT' | 'DOCTOR' | 'NURSE' | 'RECEPTIONIST' | 'PHARMACIST' | 'ADMIN'
  firstName: string
  lastName: string
  name: string
  avatar?: string
  profile?: {
    firstName: string
    lastName: string
    phone?: string
    address?: string
  }
}

interface LoginCredentials {
  email: string
  password: string
}

interface RegisterData {
  email: string
  password: string
  role: string
  name: string
  firstName: string
  lastName: string
  phone: string
}

interface AuthState {
  user: User | null
  token: string | null
  isAuthenticated: boolean
  isLoading: boolean
  error: string | null
}

type AuthAction =
  | { type: 'LOGIN_START' }
  | { type: 'LOGIN_SUCCESS'; payload: { user: User; token: string } }
  | { type: 'LOGIN_FAILURE'; payload: string }
  | { type: 'REGISTER_START' }
  | { type: 'REGISTER_SUCCESS'; payload: { user: User; token: string } }
  | { type: 'REGISTER_FAILURE'; payload: string }
  | { type: 'LOGOUT' }
  | { type: 'CLEAR_ERROR' }
  | { type: 'RESTORE_SESSION'; payload: { user: User; token: string } }

const initialState: AuthState = {
  user: null,
  token: null,
  isAuthenticated: false,
  isLoading: false,
  error: null
}

function authReducer(state: AuthState, action: AuthAction): AuthState {
  switch (action.type) {
    case 'LOGIN_START':
    case 'REGISTER_START':
      return {
        ...state,
        isLoading: true,
        error: null
      }

    case 'LOGIN_SUCCESS':
    case 'REGISTER_SUCCESS':
      return {
        ...state,
        user: action.payload.user,
        token: action.payload.token,
        isAuthenticated: true,
        isLoading: false,
        error: null
      }

    case 'LOGIN_FAILURE':
    case 'REGISTER_FAILURE':
      return {
        ...state,
        user: null,
        token: null,
        isAuthenticated: false,
        isLoading: false,
        error: action.payload
      }

    case 'LOGOUT':
      return {
        ...initialState
      }

    case 'CLEAR_ERROR':
      return {
        ...state,
        error: null
      }

    case 'RESTORE_SESSION':
      return {
        ...state,
        user: action.payload.user,
        token: action.payload.token,
        isAuthenticated: true,
        isLoading: false
      }

    default:
      return state
  }
}

interface AuthContextType extends AuthState {
  login: (credentials: LoginCredentials) => Promise<void>
  register: (data: RegisterData) => Promise<void>
  logout: () => Promise<void>
  clearError: () => void
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

interface AuthProviderProps {
  children: React.ReactNode
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [state, dispatch] = useReducer(authReducer, initialState)

  // Restore session on app load
  useEffect(() => {
    const restoreSession = async () => {
      const token = localStorage.getItem('accessToken')
      if (token) {
        try {
          const response = await authAPI.getProfile()
          const firstName = response.data.firstName || ''
          const lastName = response.data.lastName || ''
          const user = {
            id: response.data.id.toString(),
            email: response.data.email,
            role: response.data.role,
            firstName,
            lastName,
            name: `${firstName} ${lastName}`.trim(),
            profile: {
              firstName,
              lastName,
              phone: response.data.phone || ''
            }
          }
          dispatch({ type: 'RESTORE_SESSION', payload: { user, token } })
        } catch (error) {
          // Token is invalid, remove it
          localStorage.removeItem('accessToken')
          localStorage.removeItem('refreshToken')
          localStorage.removeItem('user')
        }
      }
    }

    restoreSession()
  }, [])

  // Save to localStorage when authentication state changes
  useEffect(() => {
    if (state.isAuthenticated && state.token && state.user) {
      localStorage.setItem('accessToken', state.token)
      localStorage.setItem('user', JSON.stringify(state.user))
    } else {
      localStorage.removeItem('accessToken')
      localStorage.removeItem('refreshToken')
      localStorage.removeItem('user')
    }
  }, [state.isAuthenticated, state.token, state.user])

  const login = async (credentials: LoginCredentials) => {
    dispatch({ type: 'LOGIN_START' })
    try {
      const response = await authAPI.login(credentials.email, credentials.password)

      // Store tokens
      localStorage.setItem('accessToken', response.data.accessToken)
      localStorage.setItem('refreshToken', response.data.refreshToken)

      // Create user object
      const firstName = response.data.user.firstName || ''
      const lastName = response.data.user.lastName || ''
      const user = {
        id: response.data.user.id.toString(),
        email: response.data.user.email,
        role: response.data.user.role,
        firstName,
        lastName,
        name: `${firstName} ${lastName}`.trim(),
        profile: {
          firstName,
          lastName,
          phone: response.data.user.phone || ''
        }
      }

      dispatch({ type: 'LOGIN_SUCCESS', payload: { user, token: response.data.accessToken } })
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || error.message || 'Login failed'
      dispatch({ type: 'LOGIN_FAILURE', payload: errorMessage })
      throw error
    }
  }

  const register = async (data: RegisterData) => {
    dispatch({ type: 'REGISTER_START' })
    try {
      const response = await authAPI.register(data)

      // Store tokens
      localStorage.setItem('accessToken', response.data.accessToken)
      localStorage.setItem('refreshToken', response.data.refreshToken)

      // Create user object
      const firstName = response.data.user.firstName || ''
      const lastName = response.data.user.lastName || ''
      const user = {
        id: response.data.user.id.toString(),
        email: response.data.user.email,
        role: response.data.user.role,
        firstName,
        lastName,
        name: `${firstName} ${lastName}`.trim(),
        profile: {
          firstName,
          lastName,
          phone: response.data.user.phone || ''
        }
      }

      dispatch({ type: 'REGISTER_SUCCESS', payload: { user, token: response.data.accessToken } })
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || error.message || 'Registration failed'
      dispatch({ type: 'REGISTER_FAILURE', payload: errorMessage })
      throw error
    }
  }

  const logout = async () => {
    try {
      if (state.token) {
        await authAPI.logout()
      }
    } catch (error) {
      console.error('Logout error:', error)
    } finally {
      localStorage.removeItem('accessToken')
      localStorage.removeItem('refreshToken')
      localStorage.removeItem('user')
      dispatch({ type: 'LOGOUT' })
    }
  }

  const clearError = () => {
    dispatch({ type: 'CLEAR_ERROR' })
  }

  const value: AuthContextType = {
    ...state,
    login,
    register,
    logout,
    clearError
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}
