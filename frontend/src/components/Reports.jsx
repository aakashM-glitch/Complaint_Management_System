import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import '../styles/Dashboard.css';

function Reports() {
    const { user, logout } = useAuth();
    const navigate = useNavigate();

    // Dummy data for reports
    const stats = {
        totalComplaints: 156,
        resolved: 98,
        pending: 35,
        inProgress: 23,
        totalRevenue: 4900.00,
        activeEngineers: 12,
        averageResolutionTime: '2.5 days'
    };

    const monthlyData = [
        { month: 'Jan', complaints: 45, resolved: 38 },
        { month: 'Feb', complaints: 52, resolved: 45 },
        { month: 'Mar', complaints: 48, resolved: 42 },
        { month: 'Apr', complaints: 59, resolved: 51 }
    ];

    const statusDistribution = [
        { status: 'Resolved', count: 98, color: '#4caf50' },
        { status: 'In Progress', count: 23, color: '#ff9800' },
        { status: 'Pending', count: 35, color: '#f44336' }
    ];

    const topEngineers = [
        { name: 'John Doe', resolved: 45, rating: 4.8 },
        { name: 'Jane Smith', resolved: 38, rating: 4.9 },
        { name: 'Mike Johnson', resolved: 32, rating: 4.7 },
        { name: 'Sarah Williams', resolved: 28, rating: 4.6 }
    ];

    return (
        <div className="app">
            <div className="header">
                <h1>🏠 Complaint Management System</h1>
                <div className="user-info">
                    <span>Welcome, {user.name} (ADMIN)</span>
                    <button className="btn btn-secondary" onClick={() => navigate('/admin')}>← Back</button>
                    <button className="btn logout-btn" onClick={logout}>Logout</button>
                </div>
            </div>

            <div className="dashboard">
                <div className="reports-container">
                    <div className="reports-header">
                        <h2>📊 Reports & Analytics</h2>
                        <div className="report-actions">
                            <button className="btn">📥 Download PDF</button>
                            <button className="btn btn-primary">📧 Email Report</button>
                        </div>
                    </div>

                    {/* Key Metrics */}
                    <div className="metrics-grid">
                        <div className="metric-card primary">
                            <div className="metric-icon">📋</div>
                            <div className="metric-info">
                                <div className="metric-value">{stats.totalComplaints}</div>
                                <div className="metric-label">Total Complaints</div>
                                <div className="metric-trend">↗️ +12% from last month</div>
                            </div>
                        </div>

                        <div className="metric-card success">
                            <div className="metric-icon">✅</div>
                            <div className="metric-info">
                                <div className="metric-value">{stats.resolved}</div>
                                <div className="metric-label">Resolved</div>
                                <div className="metric-trend">↗️ +8% from last month</div>
                            </div>
                        </div>

                        <div className="metric-card warning">
                            <div className="metric-icon">⏳</div>
                            <div className="metric-info">
                                <div className="metric-value">{stats.pending}</div>
                                <div className="metric-label">Pending</div>
                                <div className="metric-trend">↘️ -5% from last month</div>
                            </div>
                        </div>

                        <div className="metric-card revenue">
                            <div className="metric-icon">💰</div>
                            <div className="metric-info">
                                <div className="metric-value">${stats.totalRevenue.toLocaleString()}</div>
                                <div className="metric-label">Total Revenue</div>
                                <div className="metric-trend">↗️ +15% from last month</div>
                            </div>
                        </div>
                    </div>

                    {/* Charts Section */}
                    <div className="charts-container">
                        <div className="chart-card">
                            <h3>📈 Monthly Trend</h3>
                            <div className="bar-chart">
                                {monthlyData.map((data, index) => (
                                    <div key={index} className="bar-group">
                                        <div className="bars">
                                            <div
                                                className="bar complaints"
                                                style={{ height: `${(data.complaints / 60) * 200}px` }}
                                                title={`${data.complaints} complaints`}
                                            ></div>
                                            <div
                                                className="bar resolved"
                                                style={{ height: `${(data.resolved / 60) * 200}px` }}
                                                title={`${data.resolved} resolved`}
                                            ></div>
                                        </div>
                                        <div className="bar-label">{data.month}</div>
                                    </div>
                                ))}
                            </div>
                            <div className="chart-legend">
                                <span><span className="legend-box complaints"></span> Complaints</span>
                                <span><span className="legend-box resolved"></span> Resolved</span>
                            </div>
                        </div>

                        <div className="chart-card">
                            <h3>🎯 Status Distribution</h3>
                            <div className="pie-chart">
                                {statusDistribution.map((item, index) => (
                                    <div key={index} className="pie-item">
                                        <div
                                            className="pie-bar"
                                            style={{
                                                width: `${(item.count / stats.totalComplaints) * 100}%`,
                                                background: item.color
                                            }}
                                        ></div>
                                        <div className="pie-label">
                                            <span>{item.status}</span>
                                            <strong>{item.count}</strong>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Top Engineers */}
                    <div className="chart-card full-width">
                        <h3>🏆 Top Performing Engineers</h3>
                        <div className="engineers-grid">
                            {topEngineers.map((engineer, index) => (
                                <div key={index} className="engineer-card">
                                    <div className="engineer-rank">#{index + 1}</div>
                                    <div className="engineer-info">
                                        <h4>{engineer.name}</h4>
                                        <div className="engineer-stats">
                                            <span>✅ {engineer.resolved} completed</span>
                                            <span>⭐ {engineer.rating}/5.0</span>
                                        </div>
                                    </div>
                                    <div className="progress-bar">
                                        <div
                                            className="progress-fill"
                                            style={{ width: `${(engineer.resolved / 50) * 100}%` }}
                                        ></div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Additional Info */}
                    <div className="info-cards">
                        <div className="info-card">
                            <h4>⏱️ Average Resolution Time</h4>
                            <p className="info-value">{stats.averageResolutionTime}</p>
                            <span className="info-trend">↘️ 10% faster than last month</span>
                        </div>
                        <div className="info-card">
                            <h4>👷 Active Engineers</h4>
                            <p className="info-value">{stats.activeEngineers}</p>
                            <span className="info-trend">→ Same as last month</span>
                        </div>
                        <div className="info-card">
                            <h4>😊 Customer Satisfaction</h4>
                            <p className="info-value">4.7/5.0</p>
                            <span className="info-trend">↗️ +0.2 from last month</span>
                        </div>
                    </div>
                </div>
            </div>

            <style jsx>{`
        .reports-container {
          max-width: 1400px;
          margin: 0 auto;
        }

        .reports-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 30px;
        }

        .report-actions {
          display: flex;
          gap: 10px;
        }

        .metrics-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
          gap: 20px;
          margin-bottom: 30px;
        }

        .metric-card {
          background: white;
          padding: 25px;
          border-radius: 15px;
          box-shadow: 0 2px 8px rgba(0,0,0,0.1);
          display: flex;
          gap: 20px;
          align-items: center;
          border-left: 4px solid;
        }

        .metric-card.primary { border-left-color: #667eea; }
        .metric-card.success { border-left-color: #4caf50; }
        .metric-card.warning { border-left-color: #ff9800; }
        .metric-card.revenue { border-left-color: #2196f3; }

        .metric-icon {
          font-size: 2.5em;
          width: 60px;
          height: 60px;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 10px;
          background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
        }

        .metric-value {
          font-size: 2em;
          font-weight: bold;
          color: #333;
          margin-bottom: 5px;
        }

        .metric-label {
          color: #666;
          font-size: 0.95em;
        }

        .metric-trend {
          color: #4caf50;
          font-size: 0.85em;
          margin-top: 5px;
        }

        .charts-container {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(400px, 1fr));
          gap: 20px;
          margin-bottom: 20px;
        }

        .chart-card {
          background: white;
          padding: 25px;
          border-radius: 15px;
          box-shadow: 0 2px 8px rgba(0,0,0,0.1);
        }

        .chart-card.full-width {
          grid-column: 1 / -1;
        }

        .chart-card h3 {
          margin: 0 0 25px 0;
          color: #333;
        }

        .bar-chart {
          display: flex;
          justify-content: space-around;
          align-items: flex-end;
          height: 250px;
          padding: 20px 0;
        }

        .bar-group {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 10px;
        }

        .bars {
          display: flex;
          gap: 5px;
          align-items: flex-end;
        }

        .bar {
          width: 30px;
          border-radius: 5px 5px 0 0;
          transition: transform 0.3s;
        }

        .bar:hover {
          transform: scaleY(1.05);
        }

        .bar.complaints {
          background: linear-gradient(180deg, #667eea 0%, #764ba2 100%);
        }

        .bar.resolved {
          background: linear-gradient(180deg, #4caf50 0%, #45a049 100%);
        }

        .bar-label {
          font-weight: 600;
          color: #666;
        }

        .chart-legend {
          display: flex;
          justify-content: center;
          gap: 30px;
          margin-top: 20px;
          font-size: 0.9em;
        }

        .legend-box {
          display: inline-block;
          width: 20px;
          height: 20px;
          border-radius: 4px;
          margin-right: 8px;
        }

        .legend-box.complaints {
          background: linear-gradient(180deg, #667eea 0%, #764ba2 100%);
        }

        .legend-box.resolved {
          background: linear-gradient(180deg, #4caf50 0%, #45a049 100%);
        }

        .pie-chart {
          display: flex;
          flex-direction: column;
          gap: 15px;
        }

        .pie-item {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }

        .pie-bar {
          height: 40px;
          border-radius: 8px;
          transition: all 0.3s;
        }

        .pie-bar:hover {
          transform: scaleX(1.02);
          box-shadow: 0 2px 8px rgba(0,0,0,0.2);
        }

        .pie-label {
          display: flex;
          justify-content: space-between;
          font-size: 0.95em;
          color: #666;
        }

        .engineers-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
          gap: 20px;
        }

        .engineer-card {
          background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
          padding: 20px;
          border-radius: 12px;
          display: flex;
          flex-direction: column;
          gap: 12px;
        }

        .engineer-rank {
          font-size: 2em;
          font-weight: bold;
          color: #667eea;
        }

        .engineer-info h4 {
          margin: 0 0 8px 0;
          color: #333;
        }

        .engineer-stats {
          display: flex;
          gap: 15px;
          font-size: 0.9em;
          color: #666;
        }

        .progress-bar {
          background: rgba(255, 255, 255, 0.5);
          height: 8px;
          border-radius: 4px;
          overflow: hidden;
        }

        .progress-fill {
          height: 100%;
          background: linear-gradient(90deg, #667eea 0%, #764ba2 100%);
          border-radius: 4px;
        }

        .info-cards {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
          gap: 20px;
        }

        .info-card {
          background: white;
          padding: 25px;
          border-radius: 15px;
          box-shadow: 0 2px 8px rgba(0,0,0,0.1);
          text-align: center;
        }

        .info-card h4 {
          margin: 0 0 15px 0;
          color: #666;
          font-size: 1em;
        }

        .info-value {
          font-size: 2.5em;
          font-weight: bold;
          color: #667eea;
          margin: 10px 0;
        }

        .info-trend {
          color: #4caf50;
          font-size: 0.9em;
        }
      `}</style>
        </div>
    );
}

export default Reports;
