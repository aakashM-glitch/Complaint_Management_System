import React, { useState } from 'react'
import api from '../services/api'
import { Link } from 'react-router-dom'
import '../styles/Login.css'

function ForgotPassword() {
    const [email, setEmail] = useState('')
    const [loading, setLoading] = useState(false)
    const [message, setMessage] = useState('')
    const [error, setError] = useState('')

    const handleSubmit = async (e) => {
        e.preventDefault()
        setLoading(true)
        setError('')
        setMessage('')

        try {
            const response = await api.post('/auth/forgot-password', { email })
            setMessage(response.data.message)
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to request reset link. Please try again.')
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="login-container">
            <div className="login-card">
                <h1>Forgot Password</h1>
                <h2>Enter your email to receive a reset link</h2>

                {message && <div className="success-message">{message}</div>}
                {error && <div className="error-message">{error}</div>}

                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label>Email Address</label>
                        <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                            placeholder="your@email.com"
                        />
                    </div>

                    <button type="submit" className="btn btn-primary" disabled={loading}>
                        {loading ? 'Sending...' : 'Send Reset Link'}
                    </button>
                </form>

                <p className="toggle-form">
                    Remembered your password? <Link to="/login" style={{ color: 'var(--primary)', fontWeight: 600 }}>Login</Link>
                </p>
            </div>
        </div>
    )
}

export default ForgotPassword
