import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import '../styles/Dashboard.css';

function Profile() {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const [isEditing, setIsEditing] = useState(false);
    const [profileData, setProfileData] = useState({
        name: user.name || '',
        email: user.email || '',
        phone: '+91 1234567890',
        address: '123 Main Street, City, State - 600001',
        role: user.role || ''
    });

    const handleSave = () => {
        // TODO: API call to update profile
        setIsEditing(false);
        alert('Profile updated successfully!');
    };

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
                <div className="profile-container">
                    <div className="profile-header">
                        <div className="profile-avatar">
                            {user.name?.charAt(0).toUpperCase()}
                        </div>
                        <div>
                            <h2>{profileData.name}</h2>
                            <p className="profile-role">{profileData.role}</p>
                        </div>
                        <button
                            className="btn btn-primary"
                            onClick={() => setIsEditing(!isEditing)}
                        >
                            {isEditing ? '✕ Cancel' : '✏️ Edit Profile'}
                        </button>
                    </div>

                    <div className="profile-card">
                        <h3>👤 Personal Information</h3>
                        <div className="profile-grid">
                            <div className="profile-field">
                                <label>Full Name</label>
                                {isEditing ? (
                                    <input
                                        type="text"
                                        value={profileData.name}
                                        onChange={(e) => setProfileData({ ...profileData, name: e.target.value })}
                                    />
                                ) : (
                                    <p>{profileData.name}</p>
                                )}
                            </div>

                            <div className="profile-field">
                                <label>Email Address</label>
                                <p>{profileData.email}</p>
                            </div>

                            <div className="profile-field">
                                <label>Phone Number</label>
                                {isEditing ? (
                                    <input
                                        type="tel"
                                        value={profileData.phone}
                                        onChange={(e) => setProfileData({ ...profileData, phone: e.target.value })}
                                    />
                                ) : (
                                    <p>{profileData.phone}</p>
                                )}
                            </div>

                            <div className="profile-field">
                                <label>Role</label>
                                <p><span className="role-badge">{profileData.role}</span></p>
                            </div>

                            <div className="profile-field full-width">
                                <label>Address</label>
                                {isEditing ? (
                                    <textarea
                                        value={profileData.address}
                                        onChange={(e) => setProfileData({ ...profileData, address: e.target.value })}
                                        rows="3"
                                    />
                                ) : (
                                    <p>{profileData.address}</p>
                                )}
                            </div>
                        </div>

                        {isEditing && (
                            <div className="profile-actions">
                                <button className="btn btn-primary" onClick={handleSave}>
                                    💾 Save Changes
                                </button>
                                <button className="btn" onClick={() => setIsEditing(false)}>
                                    Cancel
                                </button>
                            </div>
                        )}
                    </div>

                    <div className="profile-card">
                        <h3>📊 Account Statistics</h3>
                        <div className="stats-grid">
                            <div className="stat-item">
                                <div className="stat-value">12</div>
                                <div className="stat-label">Total Complaints</div>
                            </div>
                            <div className="stat-item">
                                <div className="stat-value">8</div>
                                <div className="stat-label">Resolved</div>
                            </div>
                            <div className="stat-item">
                                <div className="stat-value">3</div>
                                <div className="stat-label">Pending</div>
                            </div>
                            <div className="stat-item">
                                <div className="stat-value">1</div>
                                <div className="stat-label">In Progress</div>
                            </div>
                        </div>
                    </div>

                    <div className="profile-card">
                        <h3>🔒 Account Security</h3>
                        <div className="security-options">
                            <button className="btn security-btn">
                                🔑 Change Password
                            </button>
                            <button className="btn security-btn">
                                📧 Update Email
                            </button>
                            <button className="btn btn-danger security-btn">
                                🗑️ Delete Account
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            <style jsx>{`
        .profile-container {
          max-width: 900px;
          margin: 0 auto;
        }

        .profile-header {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
          padding: 40px;
          border-radius: 15px;
          display: flex;
          gap: 25px;
          align-items: center;
          margin-bottom: 30px;
          box-shadow: 0 8px 24px rgba(102, 126, 234, 0.3);
        }

        .profile-avatar {
          width: 100px;
          height: 100px;
          border-radius: 50%;
          background: rgba(255, 255, 255, 0.3);
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 3em;
          font-weight: bold;
          border: 4px solid rgba(255, 255, 255, 0.5);
        }

        .profile-header h2 {
          margin: 0;
          font-size: 2em;
        }

        .profile-role {
          margin: 5px 0 0 0;
          opacity: 0.9;
          font-size: 1.1em;
        }

        .profile-header button {
          margin-left: auto;
        }

        .profile-card {
          background: white;
          padding: 30px;
          border-radius: 15px;
          box-shadow: 0 2px 8px rgba(0,0,0,0.1);
          margin-bottom: 20px;
        }

        .profile-card h3 {
          margin: 0 0 25px 0;
          color: #333;
          font-size: 1.4em;
        }

        .profile-grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 25px;
        }

        .profile-field.full-width {
          grid-column: 1 / -1;
        }

        .profile-field label {
          display: block;
          font-weight: 600;
          color: #666;
          margin-bottom: 8px;
          font-size: 0.95em;
        }

        .profile-field p {
          margin: 0;
          color: #333;
          font-size: 1.05em;
        }

        .profile-field input,
        .profile-field textarea {
          width: 100%;
          padding: 12px;
          border: 2px solid #ddd;
          border-radius: 8px;
          font-size: 1em;
          transition: border-color 0.3s;
        }

        .profile-field input:focus,
        .profile-field textarea:focus {
          outline: none;
          border-color: #667eea;
        }

        .role-badge {
          background: #667eea;
          color: white;
          padding: 6px 16px;
          border-radius: 20px;
          font-size: 0.9em;
          font-weight: 600;
        }

        .profile-actions {
          display: flex;
          gap: 15px;
          margin-top: 30px;
          padding-top: 30px;
          border-top: 2px solid #f0f0f0;
        }

        .stats-grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 20px;
        }

        .stat-item {
          text-align: center;
          padding: 20px;
          background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
          border-radius: 10px;
        }

        .stat-value {
          font-size: 2.5em;
          font-weight: bold;
          color: #667eea;
          margin-bottom: 5px;
        }

        .stat-label {
          color: #666;
          font-size: 0.9em;
        }

        .security-options {
          display: flex;
          flex-direction: column;
          gap: 15px;
        }

        .security-btn {
          justify-content: flex-start;
          text-align: left;
          padding: 15px 20px;
        }

        @media (max-width: 768px) {
          .profile-grid {
            grid-template-columns: 1fr;
          }

          .stats-grid {
            grid-template-columns: repeat(2, 1fr);
          }
        }
      `}</style>
        </div>
    );
}

export default Profile;
