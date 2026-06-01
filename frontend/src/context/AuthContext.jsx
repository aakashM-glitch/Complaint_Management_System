import React, { createContext, useState, useContext, useEffect } from 'react'
import api from '../services/api'

const AuthContext = createContext()

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const token = localStorage.getItem('token')
    const userData = localStorage.getItem('user')

    if (token && userData) {
      try {
        setUser(JSON.parse(userData))
        api.defaults.headers.common['Authorization'] = `Bearer ${token}`
      } catch (error) {
        localStorage.removeItem('token')
        localStorage.removeItem('user')
      }
    }
    setLoading(false)
  }, [])

  const login = async (email, password) => {
    try {
      const response = await api.post('/auth/login', { email, password })
      const { token, ...userData } = response.data

      localStorage.setItem('token', token)
      localStorage.setItem('user', JSON.stringify(userData))
      api.defaults.headers.common['Authorization'] = `Bearer ${token}`
      setUser(userData)

      return { success: true }
    } catch (error) {
      console.error('Login error:', error)
      return {
        success: false,
        error: error.response?.data?.message || error.response?.data?.error || error.message || 'Login failed'
      }
    }
  }

  const register = async (name, email, password, role) => {
    try {
      await api.post('/auth/register', {
        name,
        email,
        password,
        role: role || 'USER'
      })
      // Don't auto-login, just return success
      return { success: true }
    } catch (error) {
      console.error('Registration error:', error)
      return {
        success: false,
        error: error.response?.data?.message || error.response?.data?.error || error.message || 'Registration failed'
      }
    }
  }

  const logout = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    delete api.defaults.headers.common['Authorization']
    setUser(null)
  }

  const value = {
    user,
    login,
    register,
    logout,
    isAuthenticated: !!user,
    loading
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
