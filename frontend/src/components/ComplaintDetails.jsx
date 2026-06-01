import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import '../styles/Dashboard.css';

function ComplaintDetails() {
    const { id } = useParams();
    const navigate = useNavigate();
    const { user, logout } = useAuth();
    const [complaint, setComplaint] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchComplaintDetails();
    }, [id]);

    const fetchComplaintDetails = async () => {
        try {
            const response = await api.get(`/user/complaints`);
            const found = response.data.find(c => c.id === parseInt(id));
            setComplaint(found);
        } catch (error) {
            console.error('Error fetching complaint:', error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return <div className="loading">Loading complaint details...</div>;
    }

    if (!complaint) {
        return (
            <div className="app">
                <div className="card">
                    <h2>Complaint Not Found</h2>
                    <button onClick={() => navigate(-1)} className="btn">Go Back</button>
                </div>
            </div>
        );
    }

    const getStatusClass = (status) => `status-${status.toLowerCase().replace('_', '-')}`;

    return (
        <div className="app">
            <div className="header">
                <h1>🏠 Complaint Management System</h1>
                <div className="user-info">
                    <span>Welcome, {user.name}</span>
                    <button className="btn btn-secondary" onClick={() => navigate(-1)}>← Back</button>
                    <button className="btn logout-btn" onClick={logout}>Logout</button>
                </div>
            </div>

            <div className="dashboard">
                <div className="complaint-details-container">
                    <div className="detail-header">
                        <div>
                            <h2>Complaint #{complaint.id}</h2>
                            <span className={`status-badge ${getStatusClass(complaint.status)}`}>
                                {complaint.status}
                            </span>
                        </div>
                    </div>

                    <div className="detail-card">
                        <h3>📝 Complaint Information</h3>
                        <div className="detail-grid">
                            <div className="detail-item">
                                <label>Title:</label>
                                <p>{complaint.title}</p>
                            </div>
                            <div className="detail-item">
                                <label>Description:</label>
                                <p>{complaint.description}</p>
                            </div>
                            <div className="detail-item">
                                <label>Status:</label>
                                <p><span className={`status-badge ${getStatusClass(complaint.status)}`}>{complaint.status}</span></p>
                            </div>
                            <div className="detail-item">
                                <label>Created Date:</label>
                                <p>{new Date(complaint.createdDate).toLocaleString()}</p>
                            </div>
                            {complaint.engineerName && (
                                <div className="detail-item">
                                    <label>Assigned Engineer:</label>
                                    <p>👷 {complaint.engineerName}</p>
                                </div>
                            )}
                            {complaint.phone && (
                                <div className="detail-item">
                                    <label>Contact:</label>
                                    <p>📞 {complaint.phone}</p>
                                </div>
                            )}
                        </div>
                    </div>

                    {complaint.paymentRequired && (
                        <div className="detail-card">
                            <h3>💳 Payment Information</h3>
                            <div className="detail-grid">
                                <div className="detail-item">
                                    <label>Payment Amount:</label>
                                    <p>${complaint.paymentAmount?.toFixed(2) || '50.00'}</p>
                                </div>
                                <div className="detail-item">
                                    <label>Payment Status:</label>
                                    <p>
                                        {complaint.paymentCompleted ? (
                                            <span className="status-badge status-resolved">✓ Paid</span>
                                        ) : (
                                            <span className="status-badge status-pending">⏳ Pending</span>
                                        )}
                                    </p>
                                </div>
                                {complaint.transactionId && (
                                    <div className="detail-item">
                                        <label>Transaction ID:</label>
                                        <p>{complaint.transactionId}</p>
                                    </div>
                                )}
                            </div>
                            {!complaint.paymentCompleted && complaint.status === 'RESOLVED' && (
                                <button className="btn btn-primary">💳 Pay Now</button>
                            )}
                        </div>
                    )}

                    <div className="detail-card timeline">
                        <h3>📅 Timeline</h3>
                        <div className="timeline-item">
                            <div className="timeline-dot"></div>
                            <div className="timeline-content">
                                <strong>Complaint Created</strong>
                                <span>{new Date(complaint.createdDate).toLocaleString()}</span>
                            </div>
                        </div>
                        {complaint.engineerName && (
                            <div className="timeline-item">
                                <div className="timeline-dot"></div>
                                <div className="timeline-content">
                                    <strong>Assigned to Engineer</strong>
                                    <span>{complaint.engineerName}</span>
                                </div>
                            </div>
                        )}
                        {complaint.status === 'RESOLVED' && (
                            <div className="timeline-item">
                                <div className="timeline-dot completed"></div>
                                <div className="timeline-content">
                                    <strong>Complaint Resolved</strong>
                                    <span>{new Date(complaint.updatedDate).toLocaleString()}</span>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            <style jsx>{`
        .complaint-details-container {
          max-width: 1000px;
          margin: 0 auto;
        }

        .detail-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 30px;
        }

        .detail-header h2 {
          margin: 0 0 10px 0;
        }

        .detail-card {
          background: white;
          padding: 25px;
          border-radius: 10px;
          box-shadow: 0 2px 8px rgba(0,0,0,0.1);
          margin-bottom: 20px;
        }

        .detail-card h3 {
          margin: 0 0 20px 0;
          color: #333;
          font-size: 1.3em;
        }

        .detail-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
          gap: 20px;
        }

        .detail-item label {
          font-weight: 600;
          color: #666;
          display: block;
          margin-bottom: 5px;
        }

        .detail-item p {
          margin: 0;
          color: #333;
          font-size: 1.05em;
        }

        .timeline {
          position: relative;
        }

        .timeline-item {
          display: flex;
          gap: 20px;
          margin: 20px 0;
          position: relative;
        }

        .timeline-dot {
          width: 16px;
          height: 16px;
          border-radius: 50%;
          background: #667eea;
          border: 3px solid #e0e7ff;
          flex-shrink: 0;
          margin-top: 4px;
        }

        .timeline-dot.completed {
          background: #4caf50;
          border-color: #c8e6c9;
        }

        .timeline-content {
          flex: 1;
        }

        .timeline-content strong {
          display: block;
          margin-bottom: 5px;
          color: #333;
        }

        .timeline-content span {
          color: #666;
          font-size: 0.9em;
        }

        .loading {
          text-align: center;
          padding: 60px;
          font-size: 1.2em;
          color: #666;
        }
      `}</style>
        </div>
    );
}

export default ComplaintDetails;
