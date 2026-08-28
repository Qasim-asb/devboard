import { createContext, useCallback, useContext, useState } from 'react'
import api from '../lib/api'

const AuthContext = createContext(null)

function getStoredUser() {
  const storedUser = localStorage.getItem('devboard-user')

  if (!storedUser) {
    return null
  }

  try {
    return JSON.parse(storedUser)
  } catch {
    localStorage.removeItem('devboard-user')
    return null
  }
}

function AuthProvider({ children }) {
  const [user, setUser] = useState(getStoredUser)

  const login = useCallback(async (email, password) => {
    const { data } = await api.post('/auth/login', { email, password })

    const { user: authenticatedUser, token } = data

    localStorage.setItem('devboard-token', token)
    localStorage.setItem('devboard-user', JSON.stringify(authenticatedUser))

    setUser(authenticatedUser)
  }, [])

  const signup = useCallback(async (name, email, password) => {
    const { data } = await api.post('/auth/signup', { name, email, password })

    const { user: authenticatedUser, token } = data

    localStorage.setItem('devboard-token', token)
    localStorage.setItem('devboard-user', JSON.stringify(authenticatedUser))

    setUser(authenticatedUser)
  }, [])

  const logout = useCallback(() => {
    localStorage.removeItem('devboard-token')
    localStorage.removeItem('devboard-user')

    setUser(null)
  }, [])

  const value = { user, isAuthenticated: Boolean(user), login, signup, logout }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

function useAuth() {
  const context = useContext(AuthContext)

  if (!context) {
    throw new Error('useAuth must be used inside AuthProvider')
  }

  return context
}

export { AuthProvider, useAuth }
