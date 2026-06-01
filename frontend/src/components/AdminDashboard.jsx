import React, { useState, useEffect } from 'react'
import { useAuth } from '../context/AuthContext'
import api from '../services/api'
import '../styles/Dashboard.css'

function AdminDashboard() {
  const { user, logout } = useAuth()
  const [complaints, setComplaints] = useState([])
  const [engineers, setEngineers] = useState([])
  const [loading, setLoading] = useState(true)
  const [selectedComplaint, setSelectedComplaint] = useState(null)
  const [showAssignModal, setShowAssignModal] = useState(false)
  const [assignData, setAssignData] = useState({ engineerId: '' })
  const [selectedMonth, setSelectedMonth] = useState('')
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear())

  useEffect(() => {
    fetchComplaints()
    fetchEngineers()
    // Set current month as default
    const now = new Date()
    setSelectedMonth(String(now.getMonth() + 1).padStart(2, '0'))
  }, [])

  const fetchComplaints = async () => {
    try {
      const response = await api.get('/admin/complaints')
      setComplaints(response.data)
    } catch (error) {
      console.error('Error fetching complaints:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchEngineers = async () => {
    try {
      const response = await api.get('/admin/engineers')
      setEngineers(response.data)
    } catch (error) {
      console.error('Error fetching engineers:', error)
    }
  }

  const handleAssign = async () => {
    try {
      await api.post(`/admin/complaints/${selectedComplaint.id}/assign`, {
        engineerId: parseInt(assignData.engineerId)
      })
      setShowAssignModal(false)
      setSelectedComplaint(null)
      fetchComplaints()
    } catch (error) {
      alert(error.response?.data?.error || 'Failed to assign complaint')
    }
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
      alert('Failed to download PDF report')
    }
  }

  const downloadMonthlyReport = async () => {
    if (!selectedMonth || !selectedYear) {
      alert('Please select month and year')
      return
    }

    try {
      const response = await api.get(`/reports/monthly/${selectedYear}/${selectedMonth}/pdf`, {
        responseType: 'blob'
      })

      const blob = new Blob([response.data], { type: 'application/pdf' })
      const url = window.URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = `monthly_report_${selectedYear}_${selectedMonth}.pdf`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      window.URL.revokeObjectURL(url)
    } catch (error) {
      console.error('Error downloading monthly report:', error)
      alert('Failed to download monthly report')
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
          <h1>CMS Admin</h1>
        </div>
        <ul className="nav-links">
          <li className="nav-link active">Overview</li>
          <li className="nav-link">Complaints</li>
          <li className="nav-link">Engineers</li>
          <li className="nav-link">Settings</li>
        </ul>
        <div className="sidebar-footer">
          <div className="user-profile">
            <div className="avatar">{user.name.charAt(0)}</div>
            <div className="user-details">
              <h4>{user.name}</h4>
              <p>System Administrator</p>
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
            <h1>Admin Dashboard</h1>
            <p className="text-muted">Monitor and manage all system complaints</p>
          </div>
          <div className="flex gap-2">
            <select
              className="form-group"
              style={{ width: 'auto', marginBottom: 0 }}
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(e.target.value)}
            >
              <option value="01">January</option>
              <option value="02">February</option>
              <option value="03">March</option>
              <option value="04">April</option>
              <option value="05">May</option>
              <option value="06">June</option>
              <option value="07">July</option>
              <option value="08">August</option>
              <option value="09">September</option>
              <option value="10">October</option>
              <option value="11">November</option>
              <option value="12">December</option>
            </select>
            <input
              type="number"
              className="form-group"
              style={{ width: '100px', marginBottom: 0 }}
              value={selectedYear}
              onChange={(e) => setSelectedYear(e.target.value)}
              min="2020"
              max="2030"
            />
            <button className="btn btn-primary" onClick={downloadMonthlyReport}>
              Download Monthly Report
            </button>
          </div>
        </header>

        <div className="dashboard-grid">
          <div className="stat-card">
            <h3>Active Complaints</h3>
            <div className="value">
              {complaints.filter(c => c.status !== 'RESOLVED' && c.status !== 'CLOSED').length}
            </div>
          </div>
          <div className="stat-card">
            <h3>Unassigned</h3>
            <div className="value">
              {complaints.filter(c => !c.engineerId && c.status === 'PENDING').length}
            </div>
          </div>
          <div className="stat-card">
            <h3>Total Engineers</h3>
            <div className="value">{engineers.length}</div>
          </div>
        </div>

        <div className="card">
          <h2 className="mb-4">System Components</h2>
          {loading ? (
            <div className="text-muted">Loading master data...</div>
          ) : (
            <div className="table-container">
              <table className="table">
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Issue Details</th>
                    <th>Priority</th>
                    <th>Status</th>
                    <th>Deadline</th>
                    <th>Assigned To</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {complaints.map((complaint) => (
                    <tr key={complaint.id}>
                      <td>#{complaint.id}</td>
                      <td>
                        <div style={{ fontWeight: 500 }}>{complaint.title}</div>
                        <div className="text-muted" style={{ fontSize: '0.75rem' }}>User: {complaint.userName}</div>
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
                      <td>{complaint.engineerName || <span style={{ color: 'var(--danger)', fontWeight: 500 }}>Unassigned</span>}</td>
                      <td>
                        <div className="flex gap-2">
                          {complaint.status !== 'RESOLVED' ? (
                            <button
                              className="btn btn-primary btn-sm"
                              onClick={() => {
                                setSelectedComplaint(complaint)
                                setShowAssignModal(true)
                              }}
                            >
                              Assign
                            </button>
                          ) : (
                            <span className="text-muted" style={{ fontSize: '0.75rem' }}>Resolved</span>
                          )}
                          <button
                            className="btn btn-secondary btn-sm"
                            onClick={() => downloadComplaintPdf(complaint.id)}
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

        {showAssignModal && (
          <div className="modal" onClick={(e) => e.target.className === 'modal' && setShowAssignModal(false)}>
            <div className="modal-content">
              <div className="modal-header">
                <h3>Assign Engineer</h3>
                <button className="close-btn" onClick={() => setShowAssignModal(false)}>&times;</button>
              </div>
              <p className="mb-4 text-muted">Select an engineer to handle complaint #{selectedComplaint?.id}</p>
              <div className="form-group">
                <label>Available Engineers</label>
                <select
                  value={assignData.engineerId}
                  onChange={(e) => setAssignData({ engineerId: e.target.value })}
                >
                  <option value="">Choose an engineer...</option>
                  {engineers.map((engineer) => (
                    <option key={engineer.id} value={engineer.id}>
                      {engineer.name} — {engineer.specialization || 'General'}
                    </option>
                  ))}
                </select>
              </div>
              <div className="flex gap-2 mt-4" style={{ justifyContent: 'flex-end' }}>
                <button type="button" className="btn btn-secondary" onClick={() => setShowAssignModal(false)}>Cancel</button>
                <button type="button" className="btn btn-primary" onClick={handleAssign}>Confirm Assignment</button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default AdminDashboard
