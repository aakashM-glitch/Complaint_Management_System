# Payment and Email Notification Features

This document describes the new features added to the Complaint Management System:
1. **Email Notifications** - When engineers complete work
2. **Payment Processing** - Demo payment system for resolved complaints

## 🚀 New Features

### 1. Email Notifications

When an engineer marks a complaint as **RESOLVED**, the system automatically sends an email notification to the user who filed the complaint.

#### Email Content Includes:
- Complaint ID and Title
- Description
- Engineer who resolved it
- Resolved date
- Instructions to proceed with payment

#### Configuration
Email settings are configured in `backend/src/main/resources/application.properties`:
```properties
spring.mail.host=smtp.gmail.com
spring.mail.port=587
spring.mail.username=your-email@gmail.com
spring.mail.password=your-app-password
```

**Note**: For Gmail, you need to use an [App Password](https://support.google.com/accounts/answer/185833).

### 2. Demo Payment System

After a complaint is resolved, users can make a payment through an integrated payment interface.

#### Supported Payment Methods:
1. **💳 Card Payment** - Demo card processing
2. **📱 UPI** - Demo UPI payment
3. **🏦 Net Banking** - Demo bank transfer

#### Payment Flow:
1. Engineer marks complaint as RESOLVED
2. User receives email notification
3. Complaint status shows "Payment Pending"
4. User clicks "💳 Pay Now" button
5. Payment modal opens with payment options
6. User enters payment details
7. Payment is processed (demo mode)
8. Confirmation email sent to user
9. Complaint marked as PAID

#### Demo Payment Testing:
- **Card Numbers**: Any 16-digit number EXCEPT those ending in `0000`
  - ✅ Success: `1234567812345678`
  - ❌ Failure: `1234567812340000`
- **UPI**: Any UPI ID will work
- **Net Banking**: Any bank selection will work

## 📁 New Files Created

### Backend Files:
```
backend/src/main/java/com/complaint/
├── controller/
│   └── PaymentController.java          # REST endpoints for payments
├── dto/
│   ├── PaymentRequest.java             # Payment request DTO
│   └── PaymentResponse.java            # Payment response DTO
├── entity/
│   └── Payment.java                    # Payment entity
├── repository/
│   └── PaymentRepository.java          # Payment data access
└── service/
    ├── EmailService.java               # Email sending service
    └── PaymentService.java             # Payment processing logic
```

### Frontend Files:
```
frontend/src/
├── components/
│   └── PaymentModal.jsx                # Payment modal component
└── styles/
    └── PaymentModal.css                # Payment modal styles
```

## 🔧 Database Changes

New table: `payments`
```sql
CREATE TABLE payments (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    complaint_id BIGINT NOT NULL,
    user_id BIGINT NOT NULL,
    amount DOUBLE NOT NULL,
    transaction_id VARCHAR(255) UNIQUE NOT NULL,
    payment_method VARCHAR(50) NOT NULL,
    status VARCHAR(20) NOT NULL,
    description VARCHAR(500),
    created_date TIMESTAMP NOT NULL,
    updated_date TIMESTAMP NOT NULL,
    FOREIGN KEY (complaint_id) REFERENCES complaints(id),
    FOREIGN KEY (user_id) REFERENCES users(id)
);
```

Updated `complaints` table with new columns:
- `payment_required` BOOLEAN
- `payment_completed` BOOLEAN
- `payment_amount` DOUBLE
- `transaction_id` VARCHAR(255)

## 🔌 API Endpoints

### Payment Endpoints:

#### Process Payment
```http
POST /api/payments/process
Authorization: Bearer {token}
Content-Type: application/json

{
  "complaintId": 1,
  "amount": 50.0,
  "paymentMethod": "CARD",
  "cardNumber": "1234567812345678",
  "cardholderName": "John Doe",
  "cardExpiry": "12/25",
  "cardCvv": "123"
}
```

#### Get User Payments
```http
GET /api/payments/my-payments
Authorization: Bearer {token}
```

#### Get Payment by Transaction ID
```http
GET /api/payments/transaction/{transactionId}
Authorization: Bearer {token}
```

#### Get Payment by Complaint ID
```http
GET /api/payments/complaint/{complaintId}
Authorization: Bearer {token}
```

## 🎨 UI Updates

### User Dashboard
- Added "Payment Status" column showing:
  - ✓ Paid (green badge)
  - ⏳ Pending (yellow badge)
  - N/A (gray badge)
- Added "Action" column with "💳 Pay Now" button for resolved, unpaid complaints
- Payment button has a pulsing animation to draw attention

### Payment Modal
- Clean, modern design with gradient header
- Three payment method tabs
- Form validation for card details
- Real-time input formatting (card number, expiry, CVV)
- Demo notice clearly displayed
- Success/error messaging

## 💡 Usage Instructions

### For Users:
1. Create a complaint through the dashboard
2. Wait for an engineer to be assigned and resolve your complaint
3. You'll receive an email when the complaint is resolved
4. Click "💳 Pay Now" in your dashboard
5. Select payment method and enter details
6. Submit payment
7. Receive payment confirmation email

### For Engineers:
1. View assigned complaints
2. Mark complaint as "RESOLVED"
3. System automatically:
   - Sends email to user
   - Sets payment requirement
   - Sets default payment amount ($50)

### For Admins:
1. View all payments: `GET /api/payments/all`
2. Monitor payment status for all complaints

## 🔒 Security Notes

**IMPORTANT**: This is a DEMO payment system for development/testing purposes only!

⚠️ **Do NOT use in production without:**
1. Integrating a real payment gateway (Stripe, PayPal, Razorpay, etc.)
2. Implementing proper PCI DSS compliance
3. Adding fraud detection and prevention
4. Securing sensitive payment data
5. Adding SSL/TLS encryption
6. Implementing proper authentication and authorization

## 🧪 Testing the Features

### Test Email Notifications:
1. Start the backend server
2. Create a complaint as a user
3. Assign it to an engineer (as admin)
4. Mark as resolved (as engineer)
5. Check the user's email inbox

### Test Payment Flow:
1. Create and resolve a complaint
2. Login as the user who created the complaint
3. Click "💳 Pay Now" button
4. Try different payment methods:
   - Card with valid number
   - Card with invalid number (ending in 0000)
   - UPI payment
   - Net banking
5. Verify payment confirmation

## 📧 Email Configuration Troubleshooting

If emails are not sending:
1. Check SMTP credentials in `application.properties`
2. Enable "Less secure app access" or use App Password (Gmail)
3. Check firewall/antivirus settings
4. Verify email server allows SMTP connections
5. Check application logs for error messages

## 🚀 Future Enhancements

Potential improvements for production:
1. Real payment gateway integration (Stripe/Razorpay)
2. Payment history and invoices
3. Refund processing
4. Multiple currency support
5. Email templates with HTML formatting
6. SMS notifications
7. Payment reminders
8. Partial payments
9. Payment plans
10. Receipt generation (PDF)

## 📝 Notes

- Default payment amount is set to $50 (configurable in code)
- Transaction IDs are auto-generated with format: `TXN-XXXXXXXXXXXX`
- Email sending is non-blocking (failures won't affect complaint resolution)
- Payment processing includes a simulated 500ms delay for realism
- All payment methods in demo mode have same success criteria

## 🆘 Support

For issues or questions:
1. Check application logs
2. Verify database schema is up to date
3. Ensure all dependencies are installed
4. Review configuration files
5. Test API endpoints with Postman/curl

---

**Version**: 2.0.0  
**Last Updated**: January 2026  
**Author**: Complaint Management System Team
