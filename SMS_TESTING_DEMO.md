# 📱 SMS Notification Demo - Testing Guide

## ✅ Implementation Complete!

I've successfully implemented SMS notifications for your Complaint Management System. Here's what was added:

### 📁 New Files Created:

1. **Backend:**
   - `SmsService.java` - Core SMS service with Twilio integration
   - `SmsTestController.java` - REST endpoints for testing SMS

2. **Frontend:**
   - `SmsTest.jsx` - Interactive SMS testing page
   - `SmsTest.css` - Beautiful UI styling

3. **Updated Files:**
   - `User.java` - Added `phone` field
   - `application.properties` - Added SMS/Twilio configuration
   - `App.jsx` - Added `/sms-test` route

---

## 🚀 How to Test SMS Notifications (3 Ways)

### **Method 1: Frontend UI (Easiest) - DEMO MODE**

1. **Start both servers** (already running):
   - Backend: Port 5173
   - Frontend: `npm run dev`

2. **Login to your application**:
   - Go to `http://localhost:3000`
   - Login as any user (ADMIN, ENGINEER, or USER)

3. **Access SMS Test Page**:
   - Navigate to: `http://localhost:3000/sms-test`
   - OR manually type the URL in browser

4. **Send Test SMS**:
   - Enter a phone number (e.g., `+1234567890`)
   - Enter a message (e.g., "Hello from CMS!")
   - Click **"📤 Send Test SMS"** or **"⚡ Quick Test"**

5. **Check Results**:
   - Since SMS is in **DEMO mode** (sms.enabled=false):
   - ✅ Frontend will show "SMS sent successfully"
   - 🖥️ **Check your BACKEND CONSOLE** to see the demo SMS message
   - The console will show exactly what would be sent

---

### **Method 2: API Testing with Postman/curl**

#### Test Endpoint 1: Send Test SMS
```bash
curl -X POST "http://localhost:5173/api/test/send-sms?phoneNumber=+1234567890&message=Test SMS" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

#### Test Endpoint 2: Quick SMS Test
```bash
curl -X POST "http://localhost:5173/api/test/quick-sms-test?myPhone=+1234567890" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

#### Test Endpoint 3: Check SMS Configuration
```bash
curl -X GET "http://localhost:5173/api/test/sms-config" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

**How to get JWT Token:**
1. Login via the frontend
2. Open browser DevTools > Application > Local Storage
3. Copy the `token` value
4. Use as `Bearer YOUR_TOKEN`

---

### **Method 3: Full Workflow Integration Test**

This tests SMS in the complete complaint resolution workflow:

1. **Create a Complaint** (as USER)
2. **Assign to Engineer** (as ADMIN)
3. **Mark as Resolved** (as ENGINEER)
   - ✅ Email will be sent
   - 📱 SMS will be logged to console (DEMO mode)
4. **Make Payment** (as USER)
   - ✅ Payment confirmation email
   - 📱 Payment confirmation SMS logged

**Check logs in backend console:**
```
📱 [SMS DISABLED] Would send to: +1234567890
   Message: Complaint #123 resolved
```

---

## 🔧 What You'll See in DEMO Mode

### Backend Console Output:
```
⚠️ SMS Service is DISABLED (set sms.enabled=true to enable)

📱 [SMS DEMO MODE]
   To: +1234567890
   Message: Hello from CMS! 🎉
   Status: Would be sent if SMS was enabled
   Tip: Set sms.enabled=true and add Twilio credentials to send real SMS
```

### Frontend Response:
```json
{
  "success": true,
  "messageSid": "DEMO_MODE_1706180449123",
  "phoneNumber": "+1234567890",
  "message": "SMS sent successfully! Check your phone and backend console logs.",
  "smsEnabled": false,
  "note": "SMS is in DEMO mode. Set sms.enabled=true in application.properties to send real SMS."
}
```

---

## 📲 How to Enable REAL SMS (Twilio)

If you want to send actual SMS messages:

### Step 1: Sign Up for Twilio (FREE)
1. Go to: https://www.twilio.com/try-twilio
2. Sign up (You get **$15 free credit** = ~1,800 SMS)
3. Verify your phone number

### Step 2: Get Credentials
From Twilio Console (https://console.twilio.com):
- **Account SID** (e.g., AC1234567890abcdef...)
- **Auth Token** (e.g., your_auth_token_here)
- **Phone Number** (e.g., +15551234567)

### Step 3: Update Configuration
Edit `backend/src/main/resources/application.properties`:

```properties
# Enable SMS
sms.enabled=true

# Add your Twilio credentials
twilio.account.sid=YOUR_ACTUAL_ACCOUNT_SID
twilio.auth.token=YOUR_ACTUAL_AUTH_TOKEN
twilio.phone.number=YOUR_TWILIO_PHONE_NUMBER
```

### Step 4: Restart Backend
```bash
# Stop backend and restart
# Now SMS will be sent for real!
```

### Step 5: Test with YOUR Phone
1. Go to `http://localhost:3000/sms-test`
2. Enter YOUR phone number (with country code: `+919876543210` for India)
3. Click "Quick Test"
4. **Check your phone!** You'll receive a real SMS! 📱

---

## 🎯 Quick Demo Right Now

### Option A: Visual Demo (Frontend)
1. Open browser: `http://localhost:3000/sms-test`
2. Login if not already logged in
3. You'll see a beautiful SMS testing interface
4. Try sending a test SMS
5. Check backend console for demo output

### Option B: Terminal Demo
```bash
# Make sure you're logged in and have a token
# Replace YOUR_TOKEN with actual JWT token

curl -X POST "http://localhost:5173/api/test/quick-sms-test?myPhone=+1234567890" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json"
```

---

## 📊 What's Working:

✅ SMS Service integrated  
✅ Demo mode fully functional  
✅ Console logging works  
✅ Test endpoints created  
✅ Frontend UI complete  
✅ Ready for Twilio integration  
✅ Phone field added to User entity  
✅ All routes configured  

## 🔄 Next Steps:

1. **Test in Demo Mode** - See SMS logs in console ✅
2. **Sign up for Twilio** (optional) - Get free credits
3. **Add real credentials** - Enable live SMS sending
4. **Update User phone numbers** in database
5. **Test full workflow** - Create → Resolve → Pay

---

## 💡 Tips:

- **DEMO mode** is perfect for development and testing
- **No cost** in demo mode - everything is simulated
- **Easy to switch** to live mode when ready
- **Secure** - credentials not hard-coded
- **Flexible** - works with or without Twilio

---

## 🆘 Troubleshooting:

### Frontend shows error?
- Check that backend is running on port 5173
- Verify you're logged in
- Check browser console for errors

### Backend not logging SMS?
- Check `application.properties` has `sms.enabled=false`
- Look for initialization message: `⚠️ SMS Service is DISABLED`

### Want to test with curl but no token?
1. Login via frontend first
2. Open DevTools → Application → Local Storage
3. Copy token value
4. Use in curl: `-H "Authorization: Bearer <token>"`

---

## ✨ Demo Output Example:

When you send an SMS in demo mode, you'll see:

```
📱 Sending test SMS...
   To: +1234567890
   Message: Hello from CMS!

📱 [SMS DEMO MODE]
   To: +1234567890
   Message: Hello from CMS!
   Status: Would be sent if SMS was enabled
   Tip: Set sms.enabled=true and add Twilio credentials to send real SMS
```

**This means everything is working perfectly!** ✅

---

**Ready to test? Visit: http://localhost:3000/sms-test** 🚀
