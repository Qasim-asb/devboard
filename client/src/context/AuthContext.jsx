import { useCallback, useEffect, useState } from 'react'
import api from '../lib/api'
import AuthContext from './AuthContext'

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

function hasStoredToken() {
  return Boolean(localStorage.getItem('devboard-token'))
}

function AuthProvider({ children }) {
  const [user, setUser] = useState(getStoredUser)
  const [isCheckingAuth, setIsCheckingAuth] = useState(hasStoredToken)

  const refreshUser = useCallback(async (signal) => {
    const token = localStorage.getItem('devboard-token')

    if (!token) {
      return false
    }

    try {
      const { data } = await api.get('/auth/me', { signal })

      if (signal?.aborted) {
        return false
      }

      localStorage.setItem('devboard-user', JSON.stringify(data.user))

      setUser(data.user)

      return true
    } catch (error) {
      if (error.code === 'ERR_CANCELED') {
        return false
      }

      if (signal?.aborted) {
        return false
      }

      localStorage.removeItem('devboard-token')
      localStorage.removeItem('devboard-user')

      setUser(null)

      return false
    }
  }, [])

  useEffect(() => {
    if (!hasStoredToken()) {
      return
    }

    const controller = new AbortController()
    let isMounted = true

    async function validateSession() {
      await refreshUser(controller.signal)

      if (isMounted && !controller.signal.aborted) {
        setIsCheckingAuth(false)
      }
    }

    validateSession()

    return () => {
      isMounted = false
      controller.abort()
    }
  }, [refreshUser])

  const login = useCallback(async (email, password) => {
    const { data } = await api.post('/auth/login', { email, password })

    localStorage.setItem('devboard-token', data.token)

    localStorage.setItem('devboard-user', JSON.stringify(data.user))

    setUser(data.user)
    setIsCheckingAuth(false)
  }, [])

  const signup = useCallback(async (name, email, password) => {
    const { data } = await api.post('/auth/signup', { name, email, password })

    localStorage.setItem('devboard-token', data.token)

    localStorage.setItem('devboard-user', JSON.stringify(data.user))

    setUser(data.user)
    setIsCheckingAuth(false)
  }, [])

  const logout = useCallback(() => {
    localStorage.removeItem('devboard-token')
    localStorage.removeItem('devboard-user')

    setUser(null)
    setIsCheckingAuth(false)
  }, [])

  const value = { user, isAuthenticated: Boolean(user), isCheckingAuth, login, signup, logout, refreshUser }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export { AuthProvider }
