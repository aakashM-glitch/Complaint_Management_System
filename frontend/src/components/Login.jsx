import React, { useState } from 'react'
import { useAuth } from '../context/AuthContext'
import { useNavigate, Link } from 'react-router-dom'
import '../styles/Login.css'

function Login() {
  const [isLogin, setIsLogin] = useState(true)
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    role: 'USER',
    specialization: ''
  })
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [loading, setLoading] = useState(false)

  const { login, register } = useAuth()
  const navigate = useNavigate()

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
    setError('')
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setSuccess('')
    setLoading(true)

    try {
      let result
      if (isLogin) {
        console.log('Attempting login...')
        result = await login(formData.email, formData.password)
        console.log('Login result:', result)
        if (result.success) {
          const user = JSON.parse(localStorage.getItem('user'))
          navigate(`/${user.role.toLowerCase()}`)
        } else {
          setError(result.error)
        }
      } else {
        // Registration - don't auto-login
        if (!formData.name) {
          setError('Name is required')
          setLoading(false)
          return
        }
        console.log('Attempting registration...')
        result = await register(formData.name, formData.email, formData.password, formData.role)
        console.log('Registration result:', result)
        if (result.success) {
          setSuccess('Registration successful! Please login with your credentials.')
          setFormData({ name: '', email: '', password: '', role: 'USER', specialization: '' })
          // Switch to login form after 2 seconds
          setTimeout(() => {
            setIsLogin(true)
            setSuccess('')
          }, 2000)
        } else {
          setError(result.error)
        }
      }
    } catch (err) {
      console.error('Submit error:', err)
      setError('An error occurred. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="login-container">
      <div className="login-card">
        <h1>Complaint Management System</h1>
        <h2>{isLogin ? 'Login' : 'Register'}</h2>

        {error && <div className="error-message">{error}</div>}
        {success && <div className="success-message">{success}</div>}

        <form onSubmit={handleSubmit}>
          {!isLogin && (
            <div className="form-group">
              <label>Name</label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required={!isLogin}
              />
            </div>
          )}

          {!isLogin && (
            <div className="form-group">
              <label>Role</label>
              <select
                name="role"
                value={formData.role}
                onChange={handleChange}
              >
                <option value="USER">User</option>
                <option value="ADMIN">Admin</option>
                <option value="ENGINEER">Engineer</option>
              </select>
            </div>
          )}

          {!isLogin && formData.role === 'ENGINEER' && (
            <div className="form-group">
              <label>Engineer Specialization *</label>
              <select
                name="specialization"
                value={formData.specialization}
                onChange={handleChange}
                required={formData.role === 'ENGINEER'}
              >
                <option value="">Select Specialization</option>
                <option value="Electrician">Electrician</option>
                <option value="Plumber">Plumber</option>
                <option value="HVAC Technician">HVAC Technician</option>
                <option value="Carpenter">Carpenter</option>
                <option value="General Maintenance">General Maintenance</option>
                <option value="Network Technician">Network Technician</option>
                <option value="Other">Other</option>
              </select>
            </div>
          )}

          <div className="form-group">
            <label>Email</label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <label>Password</label>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              required
            />
          </div>

          <button type="submit" className="btn btn-primary" disabled={loading}>
            {loading ? 'Processing...' : (isLogin ? 'Login' : 'Register')}
          </button>

          {isLogin && (
            <div style={{ textAlign: 'center', marginTop: '1rem' }}>
              <Link to="/forgot-password" style={{ fontSize: '0.875rem', color: 'var(--primary)', textDecoration: 'none', fontWeight: 500 }}>
                Forgot Password?
              </Link>
            </div>
          )}
        </form>

        <p className="toggle-form">
          {isLogin ? "Don't have an account? " : "Already have an account? "}
          <span onClick={() => {
            setIsLogin(!isLogin)
            setError('')
            setFormData({ name: '', email: '', password: '', role: 'USER', specialization: '' })
          }}>
            {isLogin ? 'Register' : 'Login'}
          </span>
        </p>
      </div>
    </div>
  )
}

export default Login
