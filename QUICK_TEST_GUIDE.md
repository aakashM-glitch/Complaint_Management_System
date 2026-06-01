# 🚀 QUICK TEST GUIDE - Verify All Fixes

## ✅ Test 1: Registration Flow (2 minutes)

**Steps:**
1. Go to `http://localhost:3000`
2. Click "Register" (toggle at bottom)
3. Fill form:
   - Name: Test User
   - Email: test@test.com
   - Password: test123
   - Role: USER
4. Click "Register"

**Expected Result:**
- ✅ Green success message: "Registration successful! Please login with your credentials."
- ✅ Form switches to login after 2 seconds
- ✅ Should NOT be logged in automatically

5. Now login with test@test.com / test123
6. Should see User Dashboard

**✅ PASS if you had to login manually after registration**

---

## ✅ Test 2: Phone Number & SMS (3 minutes)

**Steps:**
1. Login as USER (test@test.com)
2. Click "Create Complaint"
3. Fill form:
   - Title: "Test Complaint SMS"
   - Description: "Testing SMS functionality with phone number"
   - **Phone Number: +1234567890** ← IMPORTANT!
4. Click "Submit"

**Expected Result:**
- ✅ Complaint created successfully
- ✅ Phone number saved

5. Now login as ADMIN (admin@example.com / admin123)
6. Find the complaint you created
7. Assign it to an engineer
8. Login as ENGINEER (engineer@example.com / engineer123)
9. Find assigned complaint
10. Click "Mark as Resolved"

**Expected Result in Backend Console:**
```
📱 [SMS DISABLED] Would send to: +1234567890
   Message: Complaint #X resolved
```

**✅ PASS if you see SMS demo message in backend logs**

---

## ✅ Test 3: Payment Flow (2 minutes)

**Steps:**
1. Login as the USER who created the complaint
2. Find the complaint (status should be "RESOLVED")
3. Payment Status should show "⏳ Pending"
4. Click "💳 Pay Now" button
5. Payment modal opens:
   - Try "💳 Card" method
   - Cardholder Name: Test User
   - Card Number: 1234567812345678
   - Expiry: 12/25
   - CVV: 123
6. Click "Pay $50.00"

**Expected Result:**
- ✅ Alert shows: "Payment successful! Transaction ID: TXN-XXXXXX"
- ✅ Modal closes
- ✅ Payment Status changes to "✓ Paid" (green)
- ✅ "Pay Now" button disappears

**Backend Console Should Show:**
```
=== Payment Processing Started ===
User ID: X
Complaint ID: X
Payment Method: CARD
Amount: 50.0
...
=== Payment Processing Completed Successfully ===
```

**✅ PASS if payment completes and status shows "Paid"**

---

## ✅ Test 4: Try COD Payment

**Steps:**
1. Create another complaint (with phone!)
2. Get it resolved (Admin → Engineer flow)
3. Click "Pay Now"
4. Select "💵 Cash on Delivery"
5. Click "Confirm Order"

**Expected Result:**
- ✅ COD payment succeeds immediately
- ✅ Status shows "✓ Paid"

**✅ PASS if COD works**

---

## 🎯 Quick Success Checklist:

- [ ] Registration requires manual login (no auto-login)
- [ ] Phone number field appears in complaint form
- [ ] Phone number is required when creating complaint
- [ ] Backend console shows SMS demo message when resolved
- [ ] Payment modal opens correctly
- [ ] Card payment succeeds
- [ ] COD payment succeeds  
- [ ] Payment status updates to "Paid"
- [ ] No errors in browser console
- [ ] No errors in backend console

**If all checked ✅ - ALL FIXES WORKING!** 🎉

---

## 🆘 Troubleshooting:

### Issue: Registration still auto-logs in
**Fix:** Clear browser cache, hard reload (Ctrl+Shift+R)

### Issue: Phone field not showing
**Fix:** Check frontend is running, refresh page

### Issue: SMS not logging
**Fix:** Check backend console output, verify SmsService is loaded

### Issue: Payment fails
**Fix:** Check backend logs for specific error, verify complaint is RESOLVED

### Issue: Backend won't start
**Fix:** Check Eclipse console, verify MySQL is running

---

## 📊 Expected Console Outputs:

### Backend Startup (should see):
```
⚠️ SMS Service is DISABLED (set sms.enabled=true to enable)
```

### When Complaint Resolved (should see):
```
📱 [SMS DISABLED] Would send to: +1234567890
   Message: Complaint #X resolved
```

### When Payment Processed (should see):
```
=== Payment Processing Started ===
...
Payment simulation result: true
Complaint updated successfully
Email sent successfully
=== Payment Processing Completed Successfully ===
```

---

**All tests should complete in under 10 minutes!** 🚀

Good luck testing! 🎊
