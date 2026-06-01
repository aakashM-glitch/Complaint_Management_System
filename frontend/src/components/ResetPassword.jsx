import React, { useState } from 'react'
import { useSearchParams, useNavigate, Link } from 'react-router-dom'
import api from '../services/api'
import '../styles/Login.css'

function ResetPassword() {
    const [searchParams] = useSearchParams()
    const [password, setPassword] = useState('')
    const [confirmPassword, setConfirmPassword] = useState('')
    const [loading, setLoading] = useState(false)
    const [message, setMessage] = useState('')
    const [error, setError] = useState('')
    const navigate = useNavigate()

    const token = searchParams.get('token')

    const handleSubmit = async (e) => {
        e.preventDefault()
        if (password !== confirmPassword) {
            setError('Passwords do not match')
            return
        }

        setLoading(true)
        setError('')
        setMessage('')

        try {
            const response = await api.post('/auth/reset-password', {
                token,
                newPassword: password
            })
            setMessage(response.data.message)
            setTimeout(() => navigate('/login'), 3000)
        } catch (err) {
            setError(err.response?.data?.error || 'Failed to reset password. The link might be expired.')
        } finally {
            setLoading(false)
        }
    }

    if (!token) {
        return (
            <div className="login-container">
                <div className="login-card">
                    <h1>Invalid Link</h1>
                    <p className="error-message">Missing password reset token.</p>
                    <Link to="/login" className="btn btn-secondary" style={{ width: '100%', marginTop: '1rem' }}>Back to Login</Link>
                </div>
            </div>
        )
    }

    return (
        <div className="login-container">
            <div className="login-card">
                <h1>Reset Password</h1>
                <h2>Enter your new password below</h2>

                {message && <div className="success-message">{message} Redirecting to login...</div>}
                {error && <div className="error-message">{error}</div>}

                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label>New Password</label>
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                            minLength="6"
                            placeholder="Minimum 6 characters"
                        />
                    </div>

                    <div className="form-group">
                        <label>Confirm New Password</label>
                        <input
                            type="password"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            required
                            placeholder="Must match above"
                        />
                    </div>

                    <button type="submit" className="btn btn-primary" disabled={loading}>
                        {loading ? 'Resetting...' : 'Update Password'}
                    </button>
                </form>
            </div>
        </div>
    )
}

export default ResetPassword
