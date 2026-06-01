import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import '../styles/Dashboard.css';

function Feedback() {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const [submitted, setSubmitted] = useState(false);
    const [rating, setRating] = useState(0);
    const [hoveredRating, setHoveredRating] = useState(0);
    const [formData, setFormData] = useState({
        category: 'SERVICE_QUALITY',
        subject: '',
        message: '',
        email: user.email || '',
        preferredContact: 'EMAIL'
    });

    const categories = [
        { value: 'SERVICE_QUALITY', label: '⭐ Service Quality', emoji: '⭐' },
        { value: 'APP_EXPERIENCE', label: '📱 App Experience', emoji: '📱' },
        { value: 'SUGGESTION', label: '💡 Suggestion', emoji: '💡' },
        { value: 'BUG_REPORT', label: '🐛 Bug Report', emoji: '🐛' },
        { value: 'OTHER', label: '📝 Other', emoji: '📝' }
    ];

    const handleSubmit = async (e) => {
        e.preventDefault();

        // TODO: API call to submit feedback
        console.log('Feedback submitted:', { ...formData, rating });

        // Show success state
        setSubmitted(true);

        // Reset after 3 seconds
        setTimeout(() => {
            setSubmitted(false);
            setFormData({
                category: 'SERVICE_QUALITY',
                subject: '',
                message: '',
                email: user.email || '',
                preferredContact: 'EMAIL'
            });
            setRating(0);
        }, 3000);
    };

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
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
                <div className="feedback-container">
                    {!submitted ? (
                        <>
                            <div className="feedback-header">
                                <div className="feedback-title">
                                    <h2>💬 We Value Your Feedback</h2>
                                    <p>Help us improve our service by sharing your thoughts and suggestions</p>
                                </div>
                            </div>

                            <form onSubmit={handleSubmit} className="feedback-form">
                                {/* Rating Section */}
                                <div className="form-card">
                                    <h3>⭐ How would you rate our service?</h3>
                                    <div className="rating-container">
                                        {[1, 2, 3, 4, 5].map((star) => (
                                            <button
                                                key={star}
                                                type="button"
                                                className={`star ${star <= (hoveredRating || rating) ? 'active' : ''}`}
                                                onClick={() => setRating(star)}
                                                onMouseEnter={() => setHoveredRating(star)}
                                                onMouseLeave={() => setHoveredRating(0)}
                                            >
                                                ★
                                            </button>
                                        ))}
                                    </div>
                                    <p className="rating-label">
                                        {rating === 0 && 'Click to rate'}
                                        {rating === 1 && '😞 Poor'}
                                        {rating === 2 && '😐 Fair'}
                                        {rating === 3 && '🙂 Good'}
                                        {rating === 4 && '😊 Very Good'}
                                        {rating === 5 && '🤩 Excellent'}
                                    </p>
                                </div>

                                {/* Feedback Category */}
                                <div className="form-card">
                                    <h3>📋 Feedback Category</h3>
                                    <div className="category-grid">
                                        {categories.map((cat) => (
                                            <label
                                                key={cat.value}
                                                className={`category-option ${formData.category === cat.value ? 'selected' : ''}`}
                                            >
                                                <input
                                                    type="radio"
                                                    name="category"
                                                    value={cat.value}
                                                    checked={formData.category === cat.value}
                                                    onChange={handleChange}
                                                />
                                                <span className="category-emoji">{cat.emoji}</span>
                                                <span className="category-label">{cat.label.replace(/^[^\s]+ /, '')}</span>
                                            </label>
                                        ))}
                                    </div>
                                </div>

                                {/* Subject */}
                                <div className="form-card">
                                    <div className="form-group">
                                        <label>Subject *</label>
                                        <input
                                            type="text"
                                            name="subject"
                                            value={formData.subject}
                                            onChange={handleChange}
                                            placeholder="Brief summary of your feedback"
                                            required
                                        />
                                    </div>
                                </div>

                                {/* Message */}
                                <div className="form-card">
                                    <div className="form-group">
                                        <label>Your Feedback *</label>
                                        <textarea
                                            name="message"
                                            value={formData.message}
                                            onChange={handleChange}
                                            rows="6"
                                            placeholder="Please share your detailed feedback, suggestions, or concerns..."
                                            required
                                        />
                                        <small className="char-count">{formData.message.length} characters</small>
                                    </div>
                                </div>

                                {/* Contact Information */}
                                <div className="form-card">
                                    <h3>📧 Contact Information</h3>
                                    <div className="form-group">
                                        <label>Email Address</label>
                                        <input
                                            type="email"
                                            name="email"
                                            value={formData.email}
                                            onChange={handleChange}
                                            placeholder="your.email@example.com"
                                            required
                                        />
                                    </div>
                                    <div className="form-group">
                                        <label>Preferred Contact Method</label>
                                        <div className="radio-group">
                                            <label className="radio-option">
                                                <input
                                                    type="radio"
                                                    name="preferredContact"
                                                    value="EMAIL"
                                                    checked={formData.preferredContact === 'EMAIL'}
                                                    onChange={handleChange}
                                                />
                                                <span>📧 Email</span>
                                            </label>
                                            <label className="radio-option">
                                                <input
                                                    type="radio"
                                                    name="preferredContact"
                                                    value="SMS"
                                                    checked={formData.preferredContact === 'SMS'}
                                                    onChange={handleChange}
                                                />
                                                <span>📱 SMS</span>
                                            </label>
                                            <label className="radio-option">
                                                <input
                                                    type="radio"
                                                    name="preferredContact"
                                                    value="NONE"
                                                    checked={formData.preferredContact === 'NONE'}
                                                    onChange={handleChange}
                                                />
                                                <span>🚫 No Response Needed</span>
                                            </label>
                                        </div>
                                    </div>
                                </div>

                                {/* Submit Button */}
                                <div className="form-actions">
                                    <button type="button" className="btn" onClick={() => navigate(-1)}>
                                        Cancel
                                    </button>
                                    <button type="submit" className="btn btn-primary btn-large">
                                        📤 Submit Feedback
                                    </button>
                                </div>
                            </form>
                        </>
                    ) : (
                        <div className="success-screen">
                            <div className="success-animation">✓</div>
                            <h2>Thank You for Your Feedback! 🎉</h2>
                            <p>We appreciate you taking the time to help us improve.</p>
                            <p className="success-detail">
                                Your feedback has been submitted successfully and our team will review it shortly.
                            </p>
                            <div className="success-actions">
                                <button className="btn btn-primary" onClick={() => navigate(-1)}>
                                    ← Back to Dashboard
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            <style jsx>{`
        .feedback-container {
          max-width: 800px;
          margin: 0 auto;
        }

        .feedback-header {
          text-align: center;
          margin-bottom: 40px;
        }

        .feedback-title h2 {
          margin: 0 0 10px 0;
          color: #333;
          font-size: 2.2em;
        }

        .feedback-title p {
          margin: 0;
          color: #666;
          font-size: 1.1em;
        }

        .feedback-form {
          display: flex;
          flex-direction: column;
          gap: 25px;
        }

        .form-card {
          background: white;
          padding: 30px;
          border-radius: 15px;
          box-shadow: 0 2px 8px rgba(0,0,0,0.1);
        }

        .form-card h3 {
          margin: 0 0 20px 0;
          color: #333;
          font-size: 1.3em;
        }

        /* Rating Stars */
        .rating-container {
          display: flex;
          gap: 10px;
          justify-content: center;
          margin: 20px 0;
        }

        .star {
          border: none;
          background: none;
          font-size: 3em;
          cursor: pointer;
          color: #ddd;
          transition: all 0.3s ease;
          padding: 0;
        }

        .star:hover,
        .star.active {
          color: #ffd700;
          transform: scale(1.2);
        }

        .rating-label {
          text-align: center;
          font-size: 1.2em;
          color: #667eea;
          font-weight: 600;
          margin: 10px 0 0 0;
        }

        /* Category Grid */
        .category-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(140px, 1fr));
          gap: 15px;
        }

        .category-option {
          border: 2px solid #e0e0e0;
          border-radius: 12px;
          padding: 20px 15px;
          text-align: center;
          cursor: pointer;
          transition: all 0.3s ease;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 10px;
        }

        .category-option input {
          display: none;
        }

        .category-option:hover {
          border-color: #667eea;
          background: #f8f9ff;
          transform: translateY(-3px);
        }

        .category-option.selected {
          border-color: #667eea;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
        }

        .category-emoji {
          font-size: 2em;
        }

        .category-label {
          font-weight: 600;
          font-size: 0.95em;
        }

        /* Form Fields */
        .form-group {
          margin-bottom: 20px;
        }

        .form-group:last-child {
          margin-bottom: 0;
        }

        .form-group label {
          display: block;
          font-weight: 600;
          color: #555;
          margin-bottom: 8px;
        }

        .form-group input,
        .form-group textarea {
          width: 100%;
          padding: 12px;
          border: 2px solid #e0e0e0;
          border-radius: 8px;
          font-size: 1em;
          font-family: inherit;
          transition: border-color 0.3s;
        }

        .form-group input:focus,
        .form-group textarea:focus {
          outline: none;
          border-color: #667eea;
          box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
        }

        .form-group textarea {
          resize: vertical;
          min-height: 150px;
        }

        .char-count {
          display: block;
          text-align: right;
          color: #999;
          font-size: 0.85em;
          margin-top: 5px;
        }

        /* Radio Group */
        .radio-group {
          display: flex;
          flex-direction: column;
          gap: 12px;
        }

        .radio-option {
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 12px;
          border: 2px solid #e0e0e0;
          border-radius: 8px;
          cursor: pointer;
          transition: all 0.3s;
        }

        .radio-option:hover {
          border-color: #667eea;
          background: #f8f9ff;
        }

        .radio-option input {
          width: auto;
        }

        .radio-option span {
          flex: 1;
        }

        /* Form Actions */
        .form-actions {
          display: flex;
          gap: 15px;
          justify-content: flex-end;
          margin-top: 10px;
        }

        .btn-large {
          padding: 15px 40px;
          font-size: 1.1em;
        }

        /* Success Screen */
        .success-screen {
          background: white;
          padding: 60px 40px;
          border-radius: 20px;
          text-align: center;
          box-shadow: 0 4px 16px rgba(0,0,0,0.1);
        }

        .success-animation {
          width: 120px;
          height: 120px;
          margin: 0 auto 30px;
          background: linear-gradient(135deg, #4caf50 0%, #45a049 100%);
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 4em;
          color: white;
          animation: popIn 0.6s ease-out;
          box-shadow: 0 10px 30px rgba(76, 175, 80, 0.3);
        }

        @keyframes popIn {
          0% {
            transform: scale(0);
          }
          50% {
            transform: scale(1.2);
          }
          100% {
            transform: scale(1);
          }
        }

        .success-screen h2 {
          color: #4caf50;
          margin: 0 0 15px 0;
          font-size: 2em;
        }

        .success-screen p {
          color: #666;
          margin: 10px 0;
          font-size: 1.1em;
        }

        .success-detail {
          color: #999;
          font-size: 1em !important;
        }

        .success-actions {
          margin-top: 30px;
        }
      `}</style>
        </div>
    );
}

export default Feedback;
