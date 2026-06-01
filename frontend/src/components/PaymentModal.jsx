import React, { useState } from 'react';
import api from '../services/api';
import '../styles/PaymentModal.css';

function PaymentModal({ complaint, onClose, onSuccess }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [paymentSuccess, setPaymentSuccess] = useState(false);
  const [showFeedback, setShowFeedback] = useState(false);
  const [transactionId, setTransactionId] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('CARD');
  const [cardDetails, setCardDetails] = useState({
    cardNumber: '',
    cardholderName: '',
    cardExpiry: '',
    cardCvv: ''
  });
  const [feedback, setFeedback] = useState({
    rating: 0,
    hoveredRating: 0,
    comment: ''
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      // Log complaint object for debugging
      console.log('Complaint object:', complaint);
      console.log('Complaint ID:', complaint.id);
      console.log('Complaint paymentAmount:', complaint.paymentAmount);

      // Base payment data
      const paymentData = {
        complaintId: complaint.id,
        amount: complaint.paymentAmount || 50.0,
        paymentMethod: paymentMethod
      };

      // Only include card details if payment method is CARD
      if (paymentMethod === 'CARD') {
        paymentData.cardNumber = cardDetails.cardNumber;
        paymentData.cardholderName = cardDetails.cardholderName;
        paymentData.cardExpiry = cardDetails.cardExpiry;
        paymentData.cardCvv = cardDetails.cardCvv;
      }

      console.log('Sending payment data:', paymentData);

      const response = await api.post('/payments/process', paymentData);

      if (response.data.success) {
        // Show success message
        setTransactionId(response.data.payment.transactionId);
        setPaymentSuccess(true);
        setLoading(false);

        // Call onSuccess callback
        onSuccess();

        // Show feedback form after 2 seconds
        setTimeout(() => {
          setShowFeedback(true);
        }, 2000);
      } else {
        setError('Payment failed. Please try again.');
        setLoading(false);
      }
    } catch (error) {
      console.error('Payment error:', error);
      console.error('Error response:', error.response);

      // Extract the actual error message from backend
      let errorMessage = 'Payment processing failed. Please try again.';

      if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error.response?.data) {
        errorMessage = JSON.stringify(error.response.data);
      } else if (error.message) {
        errorMessage = error.message;
      }

      setError(errorMessage);
      setLoading(false);
    }
  };

  const handleCardNumberChange = (e) => {
    const value = e.target.value.replace(/\s/g, '');
    if (value.length <= 16) {
      setCardDetails({ ...cardDetails, cardNumber: value });
    }
  };

  const handleExpiryChange = (e) => {
    let value = e.target.value.replace(/\s/g, '');
    if (value.length >= 2 && !value.includes('/')) {
      value = value.slice(0, 2) + '/' + value.slice(2);
    }
    if (value.length <= 5) {
      setCardDetails({ ...cardDetails, cardExpiry: value });
    }
  };

  const handleCvvChange = (e) => {
    const value = e.target.value.replace(/\D/g, '');
    if (value.length <= 3) {
      setCardDetails({ ...cardDetails, cardCvv: value });
    }
  };

  // Safety check for required props
  if (!complaint) {
    console.error('PaymentModal: No complaint provided');
    return null;
  }

  console.log('PaymentModal rendering with complaint:', complaint);

  return (
    <div className="modal" onClick={(e) => e.target.className === 'modal' && onClose()}>
      <div className="modal-content payment-modal">
        <div className="modal-header">
          <h3>💳 Payment</h3>
          <button className="close-btn" onClick={onClose}>&times;</button>
        </div>

        {/* Show success message if payment completed */}
        {paymentSuccess ? (
          showFeedback ? (
            /* Feedback Form */
            <div className="feedback-section">
              <div className="feedback-header-icon">⭐</div>
              <h2>How was your experience?</h2>
              <p className="feedback-subtitle">Help us improve by rating our service</p>

              <div className="rating-stars">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    className={`star ${star <= (feedback.hoveredRating || feedback.rating) ? 'active' : ''}`}
                    onClick={() => setFeedback({ ...feedback, rating: star })}
                    onMouseEnter={() => setFeedback({ ...feedback, hoveredRating: star })}
                    onMouseLeave={() => setFeedback({ ...feedback, hoveredRating: 0 })}
                  >
                    ★
                  </button>
                ))}
              </div>
              <p className="rating-text">
                {feedback.rating === 0 && 'Tap to rate'}
                {feedback.rating === 1 && '😞 Poor'}
                {feedback.rating === 2 && '😐 Fair'}
                {feedback.rating === 3 && '🙂 Good'}
                {feedback.rating === 4 && '😊 Very Good'}
                {feedback.rating === 5 && '🤩 Excellent'}
              </p>

              <textarea
                className="feedback-comment"
                placeholder="Share your thoughts with us (optional)..."
                value={feedback.comment}
                onChange={(e) => setFeedback({ ...feedback, comment: e.target.value })}
                rows="3"
              />

              <div className="feedback-actions">
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={onClose}
                >
                  Skip
                </button>
                <button
                  type="button"
                  className="btn btn-primary"
                  onClick={() => {
                    console.log('Feedback submitted:', feedback);
                    // TODO: API call to submit feedback
                    onClose();
                  }}
                  disabled={feedback.rating === 0}
                >
                  Submit Feedback
                </button>
              </div>
            </div>
          ) : (
            /* Payment Success Screen */
            <div className="payment-success">
              <div className="success-icon">✓</div>
              <h2>Payment Finished!</h2>
              <p className="success-message">Your payment has been processed successfully.</p>
              <div className="transaction-details">
                <p><strong>Transaction ID:</strong></p>
                <p className="transaction-id">{transactionId}</p>
                <p className="amount"><strong>Amount Paid:</strong> ${complaint.paymentAmount ? complaint.paymentAmount.toFixed(2) : '50.00'}</p>
              </div>
              <p className="auto-close-msg">Preparing feedback form...</p>
            </div>
          )
        ) : (
          <>
            <div className="payment-info">
              <div className="info-row">
                <span>Complaint ID:</span>
                <strong>#{complaint.id}</strong>
              </div>
              <div className="info-row">
                <span>Title:</span>
                <strong>{complaint.title}</strong>
              </div>
              <div className="info-row payment-amount">
                <span>Amount:</span>
                <strong>${complaint.paymentAmount ? complaint.paymentAmount.toFixed(2) : '50.00'}</strong>
              </div>
            </div>

            {error && <div className="error">{error}</div>}

            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label>Payment Method</label>
                <div className="payment-methods">
                  <button
                    type="button"
                    className={`payment-method-btn ${paymentMethod === 'CARD' ? 'active' : ''}`}
                    onClick={() => setPaymentMethod('CARD')}
                  >
                    💳 Card
                  </button>
                  <button
                    type="button"
                    className={`payment-method-btn ${paymentMethod === 'UPI' ? 'active' : ''}`}
                    onClick={() => setPaymentMethod('UPI')}
                  >
                    📱 UPI
                  </button>
                  <button
                    type="button"
                    className={`payment-method-btn ${paymentMethod === 'NET_BANKING' ? 'active' : ''}`}
                    onClick={() => setPaymentMethod('NET_BANKING')}
                  >
                    🏦 Net Banking
                  </button>
                  <button
                    type="button"
                    className={`payment-method-btn ${paymentMethod === 'COD' ? 'active' : ''}`}
                    onClick={() => setPaymentMethod('COD')}
                  >
                    💵 Cash on Delivery
                  </button>
                </div>
              </div>

              {paymentMethod === 'CARD' && (
                <>
                  <div className="form-group">
                    <label>Cardholder Name</label>
                    <input
                      type="text"
                      value={cardDetails.cardholderName}
                      onChange={(e) => setCardDetails({ ...cardDetails, cardholderName: e.target.value })}
                      placeholder="John Doe"
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label>Card Number</label>
                    <input
                      type="text"
                      value={cardDetails.cardNumber}
                      onChange={handleCardNumberChange}
                      placeholder="1234 5678 9012 3456"
                      required
                    />
                  </div>

                  <div className="form-row">
                    <div className="form-group">
                      <label>Expiry Date</label>
                      <input
                        type="text"
                        value={cardDetails.cardExpiry}
                        onChange={handleExpiryChange}
                        placeholder="MM/YY"
                        required
                      />
                    </div>
                    <div className="form-group">
                      <label>CVV</label>
                      <input
                        type="text"
                        value={cardDetails.cardCvv}
                        onChange={handleCvvChange}
                        placeholder="123"
                        required
                      />
                    </div>
                  </div>
                </>
              )}

              {paymentMethod === 'UPI' && (
                <div className="form-group">
                  <label>UPI ID</label>
                  <input type="text" placeholder="yourname@upi" required />
                </div>
              )}

              {paymentMethod === 'NET_BANKING' && (
                <div className="form-group">
                  <label>Select Bank</label>
                  <select required>
                    <option value="">Select your bank</option>
                    <option value="sbi">State Bank of India</option>
                    <option value="hdfc">HDFC Bank</option>
                    <option value="icici">ICICI Bank</option>
                    <option value="axis">Axis Bank</option>
                    <option value="pnb">Punjab National Bank</option>
                    <option value="bob">Bank of Baroda</option>
                  </select>
                </div>
              )}

              {paymentMethod === 'COD' && (
                <div className="form-group">
                  <div className="cod-info">
                    <p>✓ You have selected Cash on Delivery</p>
                    <p>Please keep the exact amount ready when the service is completed.</p>
                    <p><strong>Amount to pay: ${complaint.paymentAmount ? complaint.paymentAmount.toFixed(2) : '50.00'}</strong></p>
                  </div>
                </div>
              )}

              <div className="modal-footer">
                <button type="button" className="btn" onClick={onClose} disabled={loading}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary" disabled={loading}>
                  {loading ? 'Processing...' :
                    paymentMethod === 'COD' ? 'Confirm Order' :
                      `Pay $${complaint.paymentAmount ? complaint.paymentAmount.toFixed(2) : '50.00'}`}
                </button>
              </div>
            </form>
          </>
        )}
      </div>
    </div>
  );
}

export default PaymentModal;
