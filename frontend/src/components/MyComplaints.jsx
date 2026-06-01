import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import '../styles/Dashboard.css';

function MyComplaints() {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const [complaints, setComplaints] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('ALL');

    useEffect(() => {
        fetchComplaints();
    }, []);

    const fetchComplaints = async () => {
        try {
            const response = await api.get('/user/complaints');
            setComplaints(response.data);
        } catch (error) {
            console.error('Error fetching complaints:', error);
        } finally {
            setLoading(false);
        }
    };

    const getStatusClass = (status) => {
        return `status-badge status-${status.toLowerCase().replace('_', '-')}`;
    };

    const filteredComplaints = filter === 'ALL'
        ? complaints
        : complaints.filter(c => c.status === filter);

    return (
        <div className="app">
            <div className="header">
                <h1>🏠 Complaint Management System</h1>
                <div className="user-info">
                    <span>Welcome, {user.name} ({user.role})</span>
                    <button className="btn btn-secondary" onClick={() => navigate('/user')}>← Back</button>
                    <button className="btn logout-btn" onClick={logout}>Logout</button>
                </div>
            </div>

            <div className="dashboard">
                <div className="dashboard-header">
                    <h2>📋 My Complaints</h2>
                    <button className="btn btn-primary" onClick={() => navigate('/user')}>
                        + New Complaint
                    </button>
                </div>

                {/* Filter Tabs */}
                <div className="filter-tabs">
                    {['ALL', 'PENDING', 'IN_PROGRESS', 'RESOLVED'].map((status) => (
                        <button
                            key={status}
                            className={`filter-tab ${filter === status ? 'active' : ''}`}
                            onClick={() => setFilter(status)}
                        >
                            {status.replace('_', ' ')}
                            <span className="count">
                                {status === 'ALL' ? complaints.length : complaints.filter(c => c.status === status).length}
                            </span>
                        </button>
                    ))}
                </div>

                {loading ? (
                    <div className="loading">Loading complaints...</div>
                ) : filteredComplaints.length === 0 ? (
                    <div className="card empty-state">
                        <h3>📭 No {filter === 'ALL' ? '' : filter.replace('_', ' ')} Complaints</h3>
                        <p>You don't have any complaints yet.</p>
                    </div>
                ) : (
                    <div className="complaints-grid">
                        {filteredComplaints.map((complaint) => (
                            <div key={complaint.id} className="complaint-card">
                                <div className="complaint-header">
                                    <h3>#{complaint.id} - {complaint.title}</h3>
                                    <span className={getStatusClass(complaint.status)}>
                                        {complaint.status}
                                    </span>
                                </div>
                                <p className="complaint-description">{complaint.description}</p>
                                <div className="complaint-meta">
                                    <span>📅 {new Date(complaint.createdDate).toLocaleDateString()}</span>
                                    {complaint.engineerName && (
                                        <span>👷 {complaint.engineerName}</span>
                                    )}
                                </div>
                                <div className="complaint-actions">
                                    <button
                                        className="btn btn-sm"
                                        onClick={() => navigate(`/complaint/${complaint.id}`)}
                                    >
                                        View Details
                                    </button>
                                    {complaint.status === 'RESOLVED' && !complaint.paymentCompleted && (
                                        <button className="btn btn-primary btn-sm">
                                            💳 Pay Now
                                        </button>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            <style jsx>{`
        .filter-tabs {
          display: flex;
          gap: 10px;
          margin-bottom: 30px;
          border-bottom: 2px solid #eee;
          padding-bottom: 0;
        }

        .filter-tab {
          padding: 12px 24px;
          border: none;
          background: none;
          cursor: pointer;
          font-weight: 500;
          color: #666;
          border-bottom: 3px solid transparent;
          transition: all 0.3s;
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .filter-tab.active {
          color: #667eea;
          border-bottom-color: #667eea;
        }

        .filter-tab .count {
          background: #f0f0f0;
          padding: 2px 8px;
          border-radius: 12px;
          font-size: 0.85em;
        }

        .filter-tab.active .count {
          background: #667eea;
          color: white;
        }

        .complaints-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
          gap: 20px;
        }

        .complaint-card {
          background: white;
          padding: 20px;
          border-radius: 10px;
          box-shadow: 0 2px 8px rgba(0,0,0,0.1);
          transition: transform 0.3s, box-shadow 0.3s;
        }

        .complaint-card:hover {
          transform: translateY(-5px);
          box-shadow: 0 4px 16px rgba(0,0,0,0.15);
        }

        .complaint-header {
          display: flex;
          justify-content: space-between;
          align-items: start;
          margin-bottom: 15px;
        }

        .complaint-header h3 {
          margin: 0;
          font-size: 1.1em;
          color: #333;
        }

        .complaint-description {
          color: #666;
          margin: 15px 0;
          line-height: 1.6;
        }

        .complaint-meta {
          display: flex;
          gap: 15px;
          color: #999;
          font-size: 0.9em;
          margin: 15px 0;
        }

        .complaint-actions {
          display: flex;
          gap: 10px;
          margin-top: 15px;
        }

        .empty-state {
          text-align: center;
          padding: 60px 20px;
        }

        .empty-state h3 {
          color: #666;
          margin-bottom: 10px;
        }

        .loading {
          text-align: center;
          padding: 40px;
          color: #666;
        }
      `}</style>
        </div>
    );
}

export default MyComplaints;
