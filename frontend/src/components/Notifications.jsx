import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import '../styles/Dashboard.css';

function Notifications() {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const [filter, setFilter] = useState('ALL');

    // Dummy notifications
    const notifications = [
        {
            id: 1,
            type: 'success',
            title: 'Complaint Resolved',
            message: 'Your complaint #101 "Water Leakage" has been resolved',
            time: '2 hours ago',
            read: false,
            icon: '✅'
        },
        {
            id: 2,
            type: 'info',
            title: 'Engineer Assigned',
            message: 'Engineer John Doe has been assigned to your complaint #102',
            time: '5 hours ago',
            read: false,
            icon: '👷'
        },
        {
            id: 3,
            type: 'warning',
            title: 'Payment Pending',
            message: 'Payment of $50.00 is pending for complaint #101',
            time: '1 day ago',
            read: true,
            icon: '💳'
        },
        {
            id: 4,
            type: 'success',
            title: 'Payment Successful',
            message: 'Payment of $50.00 completed for complaint #100. Transaction ID: TXN-ABC123',
            time: '2 days ago',
            read: true,
            icon: '✅'
        },
        {
            id: 5,
            type: 'info',
            title: 'Status Update',
            message: 'Your complaint #102 status changed to IN_PROGRESS',
            time: '3 days ago',
            read: true,
            icon: '🔄'
        }
    ];

    const unreadCount = notifications.filter(n => !n.read).length;

    const filteredNotifications = filter === 'UNREAD'
        ? notifications.filter(n => !n.read)
        : notifications;

    const getNotificationClass = (type) => {
        const classes = {
            success: 'notification-success',
            info: 'notification-info',
            warning: 'notification-warning',
            error: 'notification-error'
        };
        return classes[type] || 'notification-info';
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
                <div className="notifications-container">
                    <div className="notifications-header">
                        <div>
                            <h2>🔔 Notifications</h2>
                            <p className="notification-count">You have {unreadCount} unread notifications</p>
                        </div>
                        <div className="notification-actions">
                            <button className="btn">Mark all as read</button>
                            <button className="btn btn-danger">Clear all</button>
                        </div>
                    </div>

                    <div className="filter-tabs">
                        <button
                            className={`filter-tab ${filter === 'ALL' ? 'active' : ''}`}
                            onClick={() => setFilter('ALL')}
                        >
                            All Notifications
                            <span className="count">{notifications.length}</span>
                        </button>
                        <button
                            className={`filter-tab ${filter === 'UNREAD' ? 'active' : ''}`}
                            onClick={() => setFilter('UNREAD')}
                        >
                            Unread
                            <span className="count">{unreadCount}</span>
                        </button>
                    </div>

                    <div className="notifications-list">
                        {filteredNotifications.length === 0 ? (
                            <div className="empty-state">
                                <h3>📭 No Notifications</h3>
                                <p>You're all caught up!</p>
                            </div>
                        ) : (
                            filteredNotifications.map((notification) => (
                                <div
                                    key={notification.id}
                                    className={`notification-item ${getNotificationClass(notification.type)} ${notification.read ? 'read' : 'unread'}`}
                                >
                                    <div className="notification-icon">{notification.icon}</div>
                                    <div className="notification-content">
                                        <h4>{notification.title}</h4>
                                        <p>{notification.message}</p>
                                        <span className="notification-time">⏰ {notification.time}</span>
                                    </div>
                                    {!notification.read && <div className="unread-dot"></div>}
                                    <button className="notification-delete">🗑️</button>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            </div>

            <style jsx>{`
        .notifications-container {
          max-width: 900px;
          margin: 0 auto;
        }

        .notifications-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 30px;
        }

        .notifications-header h2 {
          margin: 0 0 5px 0;
        }

        .notification-count {
          margin: 0;
          color: #666;
          font-size: 0.95em;
        }

        .notification-actions {
          display: flex;
          gap: 10px;
        }

        .notifications-list {
          background: white;
          border-radius: 15px;
          overflow: hidden;
          box-shadow: 0 2px 8px rgba(0,0,0,0.1);
        }

        .notification-item {
          display: flex;
          gap: 20px;
          align-items: start;
          padding: 20px;
          border-bottom: 1px solid #f0f0f0;
          transition: background-color 0.3s;
          position: relative;
        }

        .notification-item:hover {
          background-color: #f8f9ff;
        }

        .notification-item:last-child {
          border-bottom: none;
        }

        .notification-item.unread {
          background-color: #f0f4ff;
        }

        .notification-item.read {
          opacity: 0.7;
        }

        .notification-icon {
          font-size: 2em;
          width: 50px;
          height: 50px;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 50%;
          flex-shrink: 0;
        }

        .notification-success .notification-icon {
          background: #e8f5e9;
        }

        .notification-info .notification-icon {
          background: #e3f2fd;
        }

        .notification-warning .notification-icon {
          background: #fff3e0;
        }

        .notification-content {
          flex: 1;
        }

        .notification-content h4 {
          margin: 0 0 8px 0;
          color: #333;
          font-size: 1.1em;
        }

        .notification-content p {
          margin: 0 0 8px 0;
          color: #666;
          line-height: 1.5;
        }

        .notification-time {
          font-size: 0.85em;
          color: #999;
        }

        .unread-dot {
          width: 12px;
          height: 12px;
          border-radius: 50%;
          background: #667eea;
          position: absolute;
          top: 25px;
          right: 60px;
        }

        .notification-delete {
          border: none;
          background: none;
          cursor: pointer;
          font-size: 1.2em;
          opacity: 0.5;
          transition: opacity 0.3s;
          padding: 5px;
        }

        .notification-delete:hover {
          opacity: 1;
        }

        .empty-state {
          text-align: center;
          padding: 80px 20px;
        }

        .empty-state h3 {
          color: #666;
          margin-bottom: 10px;
        }

        .empty-state p {
          color: #999;
        }
      `}</style>
        </div>
    );
}

export default Notifications;
