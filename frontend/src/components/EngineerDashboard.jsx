import React, { useState, useEffect } from 'react'
import { useAuth } from '../context/AuthContext'
import api from '../services/api'
import '../styles/Dashboard.css'

function EngineerDashboard() {
  const { user, logout } = useAuth()
  const [complaints, setComplaints] = useState([])
  const [loading, setLoading] = useState(true)
  const [showFinishModal, setShowFinishModal] = useState(false)
  const [selectedComplaint, setSelectedComplaint] = useState(null)
  const [payMethod, setPayMethod] = useState('CASH') // CASH or GPAY
  const [payAmount, setPayAmount] = useState(50.0)
  const [transactionId, setTransactionId] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [activeTab, setActiveTab] = useState('tasks')

  useEffect(() => {
    fetchComplaints()
  }, [])

  const fetchComplaints = async () => {
    try {
      const response = await api.get('/engineer/complaints')
      setComplaints(response.data)
    } catch (error) {
      console.error('Error fetching complaints:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleOpenFinishModal = (complaint) => {
    setSelectedComplaint(complaint)
    setShowFinishModal(true)
    setPayAmount(complaint.paymentAmount || 50.0)
    setPayMethod('CASH')
    setTransactionId('')
  }

  const handleFinishTask = async (e) => {
    e.preventDefault()
    setIsSubmitting(true)
    try {
      const payload = {
        amount: payAmount,
        paymentMethod: payMethod,
        transactionId: payMethod === 'GPAY' ? transactionId : `CASH-${Date.now()}`
      }
      await api.put(`/engineer/complaints/${selectedComplaint.id}/resolve-with-payment`, payload)
      setShowFinishModal(false)
      fetchComplaints()
      alert('Task marked as Resolved and Bill Generated!')
    } catch (error) {
      console.error('Error finishing task:', error)
      alert(error.response?.data?.error || 'Failed to finish task')
    } finally {
      setIsSubmitting(false)
    }
  }

  const downloadBill = async (complaintId) => {
    try {
      const response = await api.get(`/reports/complaint/${complaintId}/pdf`, {
        responseType: 'blob'
      })
      const url = window.URL.createObjectURL(new Blob([response.data]))
      const link = document.createElement('a')
      link.href = url
      link.setAttribute('download', `bill_${complaintId}.pdf`)
      document.body.appendChild(link)
      link.click()
      link.remove()
    } catch (error) {
      console.error('Error downloading bill:', error)
      alert('Failed to download bill')
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

  return (
    <div className="app-container">
      <div className="sidebar">
        <div className="sidebar-header">
          <h1>CMS Tech</h1>
        </div>
        <ul className="nav-links">
          <li
            className={`nav-link ${activeTab === 'tasks' ? 'active' : ''}`}
            onClick={() => setActiveTab('tasks')}
          >
            Assigned Tasks
          </li>
          <li
            className={`nav-link ${activeTab === 'profile' ? 'active' : ''}`}
            onClick={() => setActiveTab('profile')}
          >
            Personal Profile
          </li>
        </ul>
        <div className="sidebar-footer">
          <div className="user-profile">
            <div className="avatar">{user.name.charAt(0)}</div>
            <div className="user-details">
              <h4>{user.name}</h4>
              <p>Field Engineer</p>
            </div>
          </div>
          <button className="btn btn-secondary" style={{ width: '100%' }} onClick={logout}>
            Logout
          </button>
        </div>
      </div>

      <div className="main-content">
        <header className="flex justify-between items-center mb-4">
          <div>
            <h1>Engineer Dashboard</h1>
            <p className="text-muted">Manage your assigned service requests</p>
          </div>
        </header>

        {activeTab === 'tasks' ? (
          <>
            <div className="dashboard-grid">
              <div className="stat-card">
                <h3>Active Tasks</h3>
                <div className="value">
                  {complaints.filter(c => c.status === 'PENDING' || c.status === 'ASSIGNED' || c.status === 'IN_PROGRESS').length}
                </div>
              </div>
              <div className="stat-card">
                <h3>Completed Today</h3>
                <div className="value">
                  {complaints.filter(c => c.status === 'RESOLVED').length}
                </div>
              </div>
              <div className="stat-card">
                <h3>Job Specialization</h3>
                <div className="value" style={{ fontSize: '1rem', color: 'var(--primary)' }}>
                  {user.specialization || 'General Technician'}
                </div>
              </div>
            </div>

            <div className="card">
              <h2 className="mb-4">Task List</h2>
              {loading ? (
                <div className="text-muted">Loading your tasks...</div>
              ) : complaints.length === 0 ? (
                <div className="text-muted">No complaints assigned to you. Enjoy your time!</div>
              ) : (
                <div className="table-container">
                  <table className="table">
                    <thead>
                      <tr>
                        <th>ID</th>
                        <th>Issue & Location</th>
                        <th>Priority</th>
                        <th>Status</th>
                        <th>Deadline</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {complaints.map((complaint) => (
                        <tr key={complaint.id}>
                          <td>#{complaint.id}</td>
                          <td>
                            <div style={{ fontWeight: 600 }}>{complaint.title}</div>
                            <div className="text-muted" style={{ fontSize: '0.75rem' }}>{complaint.address || 'No address provided'}</div>
                            <div className="text-muted" style={{ fontSize: '0.75rem' }}>Customer: {complaint.userName}</div>
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
                            {complaint.status !== 'RESOLVED' ? (
                              <button
                                className="btn btn-success btn-sm"
                                onClick={() => handleOpenFinishModal(complaint)}
                                style={{ padding: '0.4rem 0.8rem', fontSize: '0.75rem' }}
                              >
                                Finish Task & Generate Bill
                              </button>
                            ) : (
                              <div className="flex flex-col gap-1">
                                <span className="text-muted" style={{ fontSize: '0.75rem' }}>
                                  Task Completed
                                </span>
                                <button
                                  className="btn btn-secondary btn-sm"
                                  style={{ fontSize: '0.65rem', padding: '0.2rem' }}
                                  onClick={() => downloadBill(complaint.id)}
                                >
                                  Download Bill
                                </button>
                              </div>
                            )}
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
            <h2 className="mb-4">Engineer Profile</h2>
            <div className="profile-section" style={{ textAlign: 'center', marginBottom: '2rem' }}>
              <div className="avatar" style={{ width: '80px', height: '80px', fontSize: '2rem', margin: '0 auto 1rem' }}>
                {user.name.charAt(0)}
              </div>
              <h3>{user.name}</h3>
              <p className="text-muted">{user.email}</p>
              <div className="status-badge status-resolved" style={{ display: 'inline-block', marginTop: '10px' }}>
                Field Engineer
              </div>
            </div>
            <div className="profile-details">
              <div className="form-group">
                <label>Specialization</label>
                <input type="text" value={user.specialization || 'General Maintenance'} readOnly disabled />
              </div>
              <div className="form-group">
                <label>Phone Number</label>
                <input type="text" value={user.phone || 'Not provided'} readOnly disabled />
              </div>
              <div className="form-group">
                <label>Performance Rating</label>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#854d0e', fontWeight: 600 }}>
                  ⭐ 4.8 / 5.0 (Excellent)
                </div>
              </div>
              <div className="form-group">
                <label>Service Area</label>
                <input type="text" value="Zone A - Metropolitan" readOnly disabled />
              </div>
            </div>
            <button className="btn btn-secondary mt-4" style={{ width: '100%' }} onClick={() => setActiveTab('tasks')}>
              Back to Task List
            </button>
          </div>
        )}
      </div>

      {showFinishModal && selectedComplaint && (
        <div className="modal" onClick={(e) => e.target.className === 'modal' && setShowFinishModal(false)}>
          <div className="modal-content" style={{ maxWidth: '450px' }}>
            <div className="modal-header">
              <h3>Resolve Complaint & Payment</h3>
              <button className="close-btn" onClick={() => setShowFinishModal(false)}>&times;</button>
            </div>
            <form onSubmit={handleFinishTask}>
              <p className="text-muted mb-4">
                Finish task for <strong>#{selectedComplaint.id}: {selectedComplaint.title}</strong>
              </p>

              <div className="form-group">
                <label>Billing Amount ($)</label>
                <input
                  type="number"
                  value={payAmount}
                  onChange={(e) => setPayAmount(e.target.value)}
                  required
                  min="0"
                  step="0.01"
                />
              </div>

              <div className="form-group">
                <label>Payment Method</label>
                <div className="flex gap-4 mt-2">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name="payMethod"
                      value="CASH"
                      checked={payMethod === 'CASH'}
                      onChange={() => setPayMethod('CASH')}
                    />
                    <span>Cash</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name="payMethod"
                      value="GPAY"
                      checked={payMethod === 'GPAY'}
                      onChange={() => setPayMethod('GPAY')}
                    />
                    <span>GPay</span>
                  </label>
                </div>
              </div>

              {payMethod === 'GPAY' && (
                <div className="gpay-scanner-container text-center mt-4 p-4" style={{ background: '#f8fafc', borderRadius: '8px' }}>
                  <img
                    src="https://upload.wikimedia.org/wikipedia/commons/thumb/c/c7/Google_Pay_Logo_%282020%29.svg/512px-Google_Pay_Logo_%282020%29.svg.png"
                    alt="GPay QR"
                    style={{ width: '120px', margin: '0 auto', display: 'block' }}
                  />
                  <div style={{ width: '150px', height: '150px', border: '4px solid var(--primary)', margin: '15px auto', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <span style={{ fontSize: '0.75rem', color: 'var(--primary)', fontWeight: 600 }}>[ SCANNER ACTIVE ]</span>
                  </div>
                  <p className="text-muted mt-2" style={{ fontSize: '0.75rem' }}>Scan to pay ${payAmount}</p>
                  <div className="form-group mt-3" style={{ textAlign: 'left' }}>
                    <label>Transaction ID (from GPay)</label>
                    <input
                      type="text"
                      placeholder="Enter GPay Ref Number"
                      value={transactionId}
                      onChange={(e) => setTransactionId(e.target.value)}
                      required={payMethod === 'GPAY'}
                    />
                  </div>
                </div>
              )}

              {payMethod === 'CASH' && (
                <div className="cash-confirm text-center mt-4 p-4" style={{ background: '#f0fdf4', borderRadius: '8px', border: '1px solid #dcfce7' }}>
                  <p style={{ color: '#166534', fontWeight: 500 }}>Receive ${payAmount} in Cash</p>
                  <p className="text-muted" style={{ fontSize: '0.75rem' }}>Ask user to hand over the cash before clicking Resolve.</p>
                </div>
              )}

              <div className="flex gap-2 mt-6" style={{ justifyContent: 'flex-end' }}>
                <button type="button" className="btn btn-secondary" onClick={() => setShowFinishModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-success" disabled={isSubmitting}>
                  {isSubmitting ? 'Processing...' : payMethod === 'CASH' ? 'Accept Cash & Resolve' : 'Confirm GPay & Resolve'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

export default EngineerDashboard

