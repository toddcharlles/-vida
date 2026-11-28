import { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { authApi, type User } from '../services/api'

interface AuthContextType {
  user: User | null
  token: string | null
  loading: boolean
  login: (email: string, password: string) => Promise<void>
  register: (data: { name: string; email: string; password: string; phone?: string }) => Promise<void>
  logout: () => void
  refreshUser: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [token, setToken] = useState<string | null>(() => localStorage.getItem('ceasa_token'))
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const initAuth = async () => {
      const storedToken = localStorage.getItem('ceasa_token')
      if (storedToken) {
        try {
          const { user: userData } = await authApi.me(storedToken)
          setUser(userData)
          setToken(storedToken)
        } catch {
          localStorage.removeItem('ceasa_token')
        }
      }
      setLoading(false)
    }
    initAuth()
  }, [])

  const login = async (email: string, password: string) => {
    const { token: newToken, user: userData } = await authApi.login(email, password)
    localStorage.setItem('ceasa_token', newToken)
    setToken(newToken)
    setUser(userData)
  }

  const register = async (data: { name: string; email: string; password: string; phone?: string }) => {
    const { token: newToken, user: userData } = await authApi.register(data)
    localStorage.setItem('ceasa_token', newToken)
    setToken(newToken)
    setUser(userData)
  }

  const logout = () => {
    localStorage.removeItem('ceasa_token')
    setToken(null)
    setUser(null)
  }

  const refreshUser = async () => {
    if (token) {
      try {
        const { user: userData } = await authApi.me(token)
        setUser(userData)
      } catch {
        logout()
      }
    }
  }

  return (
    <AuthContext.Provider value={{ user, token, loading, login, register, logout, refreshUser }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth deve ser usado dentro de AuthProvider')
  }
  return context
}