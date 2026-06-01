import React, { useState } from 'react';
import api from '../services/api';
import '../styles/SmsTest.css';

const SmsTest = () => {
    const [phoneNumber, setPhoneNumber] = useState('');
    const [message, setMessage] = useState('Hello from CMS! 🎉');
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState(null);
    const [smsConfig, setSmsConfig] = useState(null);

    // Fetch SMS configuration on component mount
    React.useEffect(() => {
        fetchSmsConfig();
    }, []);

    const fetchSmsConfig = async () => {
        try {
            const response = await api.get('/api/test/sms-config');
            setSmsConfig(response.data);
        } catch (error) {
            console.error('Error fetching SMS config:', error);
        }
    };

    const sendTestSms = async (e) => {
        e.preventDefault();
        setLoading(true);
        setResult(null);

        try {
            const response = await api.post('/api/test/send-sms', null, {
                params: { phoneNumber, message }
            });

            setResult({
                success: true,
                ...response.data
            });

            console.log('SMS Response:', response.data);
        } catch (error) {
            setResult({
                success: false,
                error: error.response?.data?.error || error.message
            });
        } finally {
            setLoading(false);
        }
    };

    const quickTest = async () => {
        if (!phoneNumber) {
            alert('Please enter your phone number first!');
            return;
        }

        setLoading(true);
        setResult(null);

        try {
            const response = await api.post('/api/test/quick-sms-test', null, {
                params: { myPhone: phoneNumber }
            });

            setResult({
                success: true,
                ...response.data
            });
        } catch (error) {
            setResult({
                success: false,
                error: error.response?.data?.error || error.message
            });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="sms-test-container">
            <div className="sms-test-card">
                <h2>📱 SMS Notification Testing</h2>
                <p className="subtitle">Test SMS notifications for your Complaint Management System</p>

                {/* SMS Configuration Status */}
                {smsConfig && (
                    <div className={`config-status ${smsConfig.smsEnabled ? 'enabled' : 'demo'}`}>
                        <h3>{smsConfig.status}</h3>
                        <p>{smsConfig.message}</p>
                        {!smsConfig.smsEnabled && (
                            <div className="demo-note">
                                <strong>Demo Mode:</strong> SMS messages will be logged to the backend console.
                                <br />
                                <small>To send real SMS, configure Twilio in application.properties</small>
                            </div>
                        )}
                    </div>
                )}

                {/* Test Form */}
                <form onSubmit={sendTestSms} className="sms-form">
                    <div className="form-group">
                        <label htmlFor="phone">Phone Number (E.164 format)</label>
                        <input
                            type="text"
                            id="phone"
                            placeholder="+1234567890"
                            value={phoneNumber}
                            onChange={(e) => setPhoneNumber(e.target.value)}
                            required
                        />
                        <small>Include country code (e.g., +1 for US, +91 for India)</small>
                    </div>

                    <div className="form-group">
                        <label htmlFor="message">Message</label>
                        <textarea
                            id="message"
                            placeholder="Enter your test message..."
                            value={message}
                            onChange={(e) => setMessage(e.target.value)}
                            rows="3"
                            maxLength="160"
                            required
                        />
                        <small>{message.length}/160 characters</small>
                    </div>

                    <div className="button-group">
                        <button
                            type="submit"
                            className="btn-primary"
                            disabled={loading}
                        >
                            {loading ? '📤 Sending...' : '📤 Send Test SMS'}
                        </button>

                        <button
                            type="button"
                            className="btn-secondary"
                            onClick={quickTest}
                            disabled={loading}
                        >
                            {loading ? '⚡ Testing...' : '⚡ Quick Test'}
                        </button>
                    </div>
                </form>

                {/* Result Display */}
                {result && (
                    <div className={`result ${result.success ? 'success' : 'error'}`}>
                        <h3>{result.success ? '✅ Success!' : '❌ Error'}</h3>

                        {result.success ? (
                            <div>
                                <p><strong>Message:</strong> {result.message}</p>
                                <p><strong>Phone:</strong> {result.phoneNumber}</p>
                                <p><strong>Message SID:</strong> {result.messageSid}</p>
                                <p><strong>Mode:</strong> {result.mode || (result.smsEnabled ? 'LIVE' : 'DEMO')}</p>

                                {result.note && (
                                    <div className="note">
                                        <p><strong>Note:</strong> {result.note}</p>
                                    </div>
                                )}

                                {result.smsEnabled && (
                                    <div className="check-phone">
                                        📱 Check your phone for the SMS message!
                                    </div>
                                )}

                                {!result.smsEnabled && (
                                    <div className="check-console">
                                        🖥️ Check the backend console to see the demo SMS message!
                                    </div>
                                )}
                            </div>
                        ) : (
                            <div>
                                <p><strong>Error:</strong> {result.error}</p>
                                <p className="error-help">
                                    Make sure your phone number is in E.164 format (e.g., +1234567890)
                                </p>
                            </div>
                        )}
                    </div>
                )}

                {/* Instructions */}
                <div className="instructions">
                    <h3>📋 Instructions</h3>
                    <ol>
                        <li><strong>Demo Mode (Default):</strong> Messages are logged to backend console</li>
                        <li><strong>Live Mode:</strong> Configure Twilio credentials in application.properties</li>
                        <li><strong>Phone Format:</strong> Must include country code (e.g., +1234567890)</li>
                        <li><strong>Message Length:</strong> Keep under 160 characters for single SMS</li>
                    </ol>

                    <div className="setup-tip">
                        <strong>🚀 To Enable Real SMS:</strong>
                        <ol>
                            <li>Sign up at <a href="https://www.twilio.com/try-twilio" target="_blank" rel="noopener noreferrer">Twilio</a> (Free trial with $15 credit)</li>
                            <li>Get Account SID, Auth Token, and Phone Number</li>
                            <li>Update application.properties with your credentials</li>
                            <li>Set <code>sms.enabled=true</code></li>
                            <li>Restart backend server</li>
                        </ol>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SmsTest;
