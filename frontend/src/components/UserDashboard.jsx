import React, { useState, useEffect } from 'react'
import { useAuth } from '../context/AuthContext'
import api from '../services/api'
import PaymentModal from './PaymentModal'
import '../styles/Dashboard.css'

function UserDashboard() {
  const { user, logout } = useAuth()
  const [complaints, setComplaints] = useState([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [showPaymentModal, setShowPaymentModal] = useState(false)
  const [selectedComplaint, setSelectedComplaint] = useState(null)
  const [formData, setFormData] = useState({ title: '', description: '', phone: '', address: '', priority: 'NORMAL' })
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [activeTab, setActiveTab] = useState('dashboard')

  useEffect(() => {
    fetchComplaints()
  }, [])

  const fetchComplaints = async () => {
    try {
      const response = await api.get('/user/complaints')
      setComplaints(response.data)
    } catch (error) {
      console.error('Error fetching complaints:', error)
    } finally {
      setLoading(false)
    }
  }



  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setSuccess('')
    setLoading(true)

    try {
      // 1. Create the complaint
      const response = await api.post('/user/complaints', formData)
      setSuccess('Complaint created successfully!')
      setFormData({ title: '', description: '', phone: '', address: '', priority: 'NORMAL' })
      setShowModal(false)
      fetchComplaints()
    } catch (error) {
      console.error('Complaint creation error:', error)
      const errorData = error.response?.data
      if (typeof errorData === 'object' && errorData !== null) {
        // If it's a validation error map, join the messages
        const messages = Object.values(errorData).join(', ')
        setError(messages || 'Failed to create complaint')
      } else {
        setError(error.response?.data?.error || 'Failed to create complaint')
      }
    } finally {
      setLoading(false)
    }
  }

  const getStatusClass = (status) => {
    return `status-badge status-${status.toLowerCase().replace('_', '-')}`
  }

  const formatDeadline = (deadline) => {
    if (!deadline) return 'Not Set';
    const date = new Date(deadline);
    if (isNaN(date.getTime())) return 'Invalid Date';
    if (date.getFullYear() <= 1970) return 'Calculating...';
    return `${date.toLocaleDateString()} ${date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
  }

  const handlePayment = (complaint) => {
    console.log('Selected complaint for payment:', complaint);

    // Safety check  
    if (!complaint || !complaint.id) {
      console.error('Invalid complaint data:', complaint);
      setError('Unable to process payment. Please try again.');
      return;
    }

    setSelectedComplaint(complaint);
    setShowPaymentModal(true);
  }

  const handlePaymentSuccess = () => {
    fetchComplaints()
    setSuccess('Payment completed successfully!')
    setTimeout(() => setSuccess(''), 3000)
  }

  const downloadComplaintPdf = async (complaintId) => {
    try {
      const response = await api.get(`/reports/complaint/${complaintId}/pdf`, {
        responseType: 'blob'
      })

      const blob = new Blob([response.data], { type: 'application/pdf' })
      const url = window.URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = `complaint_${complaintId}.pdf`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      window.URL.revokeObjectURL(url)
    } catch (error) {
      console.error('Error downloading PDF:', error)
      setError('Failed to download PDF report')
    }
  }

  return (
    <div className="app-container">
      <div className="sidebar">
        <div className="sidebar-header">
          <h1>CMS Portal</h1>
        </div>
        <ul className="nav-links">
          <li
            className={`nav-link ${activeTab === 'dashboard' ? 'active' : ''}`}
            onClick={() => setActiveTab('dashboard')}
          >
            Dashboard
          </li>
          <li
            className={`nav-link ${activeTab === 'profile' ? 'active' : ''}`}
            onClick={() => setActiveTab('profile')}
          >
            My Profile
          </li>
        </ul>
        <div className="sidebar-footer">
          <div className="user-profile">
            <div className="avatar">{user.name.charAt(0)}</div>
            <div className="user-details">
              <h4>{user.name}</h4>
              <p>{user.role}</p>
            </div>
          </div>
          <button className="btn btn-secondary" style={{ width: '100%' }} onClick={logout}>
            Logout
          </button>
        </div>
      </div>

      <div className="main-content">
        {activeTab === 'dashboard' ? (
          <>
            <header className="flex justify-between items-center mb-4">
              <div>
                <h1>User Dashboard</h1>
                <p className="text-muted">Manage and track your service requests</p>
              </div>
              <button className="btn btn-primary" onClick={() => setShowModal(true)}>
                + Create Complaint
              </button>
            </header>

            <div className="dashboard-grid">
              <div className="stat-card">
                <h3>Total Complaints</h3>
                <div className="value">{complaints.length}</div>
              </div>
              <div className="stat-card">
                <h3>Resolved</h3>
                <div className="value">
                  {complaints.filter(c => c.status === 'RESOLVED' || c.status === 'CLOSED').length}
                </div>
              </div>
              <div className="stat-card">
                <h3>Pending Payment</h3>
                <div className="value">
                  {complaints.filter(c => c.paymentRequired && !c.paymentCompleted).length}
                </div>
              </div>
            </div>

            {error && <div className="error-message">{error}</div>}
            {success && <div className="success-message">{success}</div>}

            <div className="card">
              <h2 className="mb-4">My Complaints</h2>
              {loading ? (
                <div className="text-muted">Loading complaints...</div>
              ) : complaints.length === 0 ? (
                <div className="text-muted">No complaints found. Create your first complaint!</div>
              ) : (
                <div className="table-container">
                  <table className="table">
                    <thead>
                      <tr>
                        <th>ID</th>
                        <th>Title</th>
                        <th>Priority</th>
                        <th>Status</th>
                        <th>Deadline</th>
                        <th>Payment</th>
                        <th>Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {complaints.map((complaint) => (
                        <tr key={complaint.id}>
                          <td>#{complaint.id}</td>
                          <td>
                            <div style={{ fontWeight: 500 }}>{complaint.title}</div>
                            <div className="text-muted" style={{ fontSize: '0.75rem' }}>{complaint.description.substring(0, 50)}...</div>
                          </td>
                          <td>
                            <span className={`status-badge priority-${complaint.priority.toLowerCase()}`}>
                              {complaint.priority}
                            </span>
                          </td>
                          <td>
                            <span className={getStatusClass(complaint.status)}>
                              {complaint.status.replace('_', ' ')}
                            </span>
                          </td>
                          <td>
                            <div style={{
                              fontSize: '0.875rem',
                              fontWeight: 500,
                              color: complaint.deadline && new Date(complaint.deadline) < new Date() && complaint.status !== 'RESOLVED' ? 'var(--danger)' : 'inherit'
                            }}>
                              {formatDeadline(complaint.deadline)}
                            </div>
                            {complaint.deadline && new Date(complaint.deadline) < new Date() && complaint.status !== 'RESOLVED' && (
                              <div style={{ fontSize: '0.65rem', color: 'var(--danger)', fontWeight: 600 }}>OVERDUE</div>
                            )}
                          </td>
                          <td>
                            {complaint.paymentRequired ? (
                              complaint.paymentCompleted ? (
                                <span className="status-badge status-resolved" style={{ background: '#d1fae5', color: '#065f46' }}>Paid</span>
                              ) : (
                                <span className="status-badge status-pending" style={{ background: '#fef3c7', color: '#92400e' }}>Pending</span>
                              )
                            ) : (
                              <span className="text-muted">—</span>
                            )}
                          </td>
                          <td>
                            <div className="flex gap-2">
                              {complaint.status === 'RESOLVED' && !complaint.paymentCompleted && (
                                <button
                                  className="btn btn-primary btn-sm"
                                  onClick={() => handlePayment(complaint)}
                                >
                                  Pay
                                </button>
                              )}
                              <button
                                className="btn btn-secondary btn-sm"
                                onClick={() => downloadComplaintPdf(complaint.id)}
                                title="Download PDF"
                              >
                                {complaint.status === 'RESOLVED' ? 'Download Bill' : 'PDF'}
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </>
        ) : (
          <div className="card" style={{ maxWidth: '600px', margin: '0 auto' }}>
            <h2 className="mb-4">My Profile</h2>
            <div className="profile-section" style={{ textAlign: 'center', marginBottom: '2rem' }}>
              <div className="avatar" style={{ width: '80px', height: '80px', fontSize: '2rem', margin: '0 auto 1rem' }}>
                {user.name.charAt(0)}
              </div>
              <h3>{user.name}</h3>
              <p className="text-muted">{user.email}</p>
            </div>
            <div className="profile-details">
              <div className="form-group">
                <label>User Role</label>
                <input type="text" value={user.role} readOnly disabled />
              </div>
              <div className="form-group">
                <label>Phone Number</label>
                <input type="text" value={user.phone || 'Not provided'} readOnly disabled />
              </div>
              <div className="form-group">
                <label>Account Status</label>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#065f46', fontWeight: 600 }}>
                  <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#10b981' }}></div>
                  Active Verified
                </div>
              </div>
            </div>
            <button className="btn btn-secondary mt-4" style={{ width: '100%' }} onClick={() => setActiveTab('dashboard')}>
              Back to Dashboard
            </button>
          </div>
        )}

        {showModal && (
          <div className="modal" onClick={(e) => e.target.className === 'modal' && setShowModal(false)}>
            <div className="modal-content">
              <div className="modal-header">
                <h3>Submit New Complaint</h3>
                <button className="close-btn" onClick={() => setShowModal(false)}>&times;</button>
              </div>
              <form onSubmit={handleSubmit}>
                <div className="form-group">
                  <label>Problem Title</label>
                  <input
                    type="text"
                    placeholder="Brief summary of the issue"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Room / Area / Asset ID</label>
                  <textarea
                    placeholder="e.g. Room 402, Block B, or Asset AC-001"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    required
                    rows="2"
                  />
                </div>
                <div className="form-group">
                  <label>Service Address</label>
                  <textarea
                    placeholder="Where should the engineer visit?"
                    value={formData.address}
                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                    required
                    rows="2"
                  />
                </div>
                <div className="form-group">
                  <label>Urgency / Priority</label>
                  <select
                    value={formData.priority}
                    onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
                    required
                  >
                    <option value="NORMAL">Normal Priority (Solve within 3 days)</option>
                    <option value="HIGH">High Priority (Solve within 24 hours)</option>
                  </select>
                </div>
                <div className="form-group">
                  <label>Contact Phone</label>
                  <input
                    type="tel"
                    placeholder="+91 XXXXX XXXXX"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    required
                  />
                </div>
                <div className="flex gap-2 mt-4" style={{ justifyContent: 'flex-end' }}>
                  <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>Cancel</button>
                  <button type="submit" className="btn btn-primary" disabled={loading}>
                    {loading ? 'Submitting...' : 'Submit Complaint'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {showPaymentModal && selectedComplaint && (
          <PaymentModal
            complaint={selectedComplaint}
            onClose={() => setShowPaymentModal(false)}
            onSuccess={handlePaymentSuccess}
          />
        )}
      </div>
    </div>
  )
}

export default UserDashboard

