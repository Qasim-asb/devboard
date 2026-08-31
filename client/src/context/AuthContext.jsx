import { useCallback, useEffect, useState } from 'react'
import api from '../lib/api'
import AuthContext from './AuthContext'

function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [isCheckingAuth, setIsCheckingAuth] = useState(true)

  const refreshUser = useCallback(async signal => {
    try {
      const { data } = await api.get('/auth/me', { signal })

      if (signal?.aborted) {
        return false
      }

      setUser(data.user)

      return true
    } catch (error) {
      if (error.code === 'ERR_CANCELED' || signal?.aborted) {
        return false
      }

      setUser(null)

      return false
    }
  }, [])

  useEffect(() => {
    const controller = new AbortController()

    async function validateSession() {
      await refreshUser(controller.signal)

      if (!controller.signal.aborted) {
        setIsCheckingAuth(false)
      }
    }

    validateSession()

    return () => {
      controller.abort()
    }
  }, [refreshUser])

  const login = useCallback(async (email, password) => {
    const { data } = await api.post('/auth/login', { email, password })

    setUser(data.user)
    setIsCheckingAuth(false)
  }, [])

  const signup = useCallback(
    async (name, email, password) => {
      const { data } = await api.post('/auth/signup', { name, email, password })

      setUser(data.user)
      setIsCheckingAuth(false)
    }, [])

  const logout = useCallback(async () => {
    try {
      await api.post('/auth/logout')
    } catch (error) {
      if (error.response?.status !== 401) {
        console.error('Unable to logout:', error)
      }
    } finally {
      setUser(null)
      setIsCheckingAuth(false)
    }
  }, [])

  const value = { user, isAuthenticated: Boolean(user), isCheckingAuth, login, signup, logout, refreshUser }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export { AuthProvider }
