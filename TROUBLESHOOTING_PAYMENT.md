# Payment Modal Troubleshooting Guide

## Issue: White Screen After Clicking "Pay Now"

### Fixed Issues ✅

1. **API Token Configuration**
   - Fixed: API now dynamically adds JWT token to each request using interceptor
   - File: `frontend/src/services/api.js`

2. **Null Payment Amount**
   - Fixed: Added safety checks for `complaint.paymentAmount`
   - Default value: $50.00 if amount is not set
   - Files: `frontend/src/components/PaymentModal.jsx`

3. **Component Error Handling**
   - Added: Console logging for debugging
   - Added: Null checks for complaint object
   - Added: Early return if complaint is invalid

### How to Debug 🔍

1. **Open Browser Console**
   - Press `F12` in your browser
   - Go to "Console" tab
   - Look for error messages

2. **Check for Errors**
   When you click "Pay Now", you should see:
   ```
   Selected complaint for payment: {id: 1, title: "...", ...}
   PaymentModal rendering with complaint: {id: 1, ...}
   ```

3. **Common Errors and Solutions**

   **Error: "Cannot read property 'toFixed' of undefined"**
   - ✅ FIXED: Added default values for paymentAmount

   **Error: "Network Error" or 401 Unauthorized**
   - ✅ FIXED: Added request interceptor for JWT token

   **Error: White screen with no console error**
   - Check if PaymentModal.css is loading
   - Check browser network tab for failed CSS loads

### Testing Steps 🧪

1. **Restart Frontend**
   ```bash
   cd frontend
   npm run dev
   ```

2. **Clear Browser Cache**
   - Press `Ctrl + Shift + Delete`
   - Clear cached images and files
   - Reload page

3. **Test Payment Flow**
   - Login as user
   - Find a RESOLVED complaint
   - Click "💳 Pay Now"
   - Payment modal should open smoothly

### What to Check in Console 📝

When you click "Pay Now", you should see these logs:

```javascript
Selected complaint for payment: {
  id: 1,
  title: "Test complaint",
  status: "RESOLVED",
  paymentRequired: true,
  paymentCompleted: false,
  paymentAmount: 50
}

PaymentModal rendering with complaint: { ... }
```

### If Modal Still Doesn't Open

1. **Check Complaint Data**
   Add this in UserDashboard before the table:
   ```jsx
   <pre>{JSON.stringify(complaints, null, 2)}</pre>
   ```
   This will show you exactly what data you have.

2. **Check CSS Loading**
   In browser DevTools:
   - Go to Network tab
   - Filter by "CSS"
   - Reload page
   - Verify `PaymentModal.css` loads successfully

3. **Test with Simple Modal**
   Replace PaymentModal temporarily with:
   ```jsx
   {showPaymentModal && (
     <div className="modal">
       <div className="modal-content">
         <h2>Test Modal</h2>
         <p>Complaint ID: {selectedComplaint?.id}</p>
         <button onClick={() => setShowPaymentModal(false)}>Close</button>
       </div>
     </div>
   )}
   ```

### Backend Check ✅

Make sure backend is running and responsive:

```bash
# Test payment endpoint
curl -X POST http://localhost:5173/api/payments/process \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "complaintId": 1,
    "amount": 50,
    "paymentMethod": "CARD",
    "cardNumber": "1234567812345678",
    "cardholderName": "Test User",
    "cardExpiry": "12/25",
    "cardCvv": "123"
  }'
```

### Files Modified for Fix 📄

1. `frontend/src/services/api.js` - Added request interceptor
2. `frontend/src/components/PaymentModal.jsx` - Added null checks
3. `frontend/src/components/UserDashboard.jsx` - Added error handling

### Next Steps 🚀

1. Stop frontend server (Ctrl+C)
2. Restart: `npm run dev`
3. Clear browser cache
4. Try clicking "Pay Now" again
5. Check console for logs
6. Modal should open successfully!

### Expected Behavior ✨

When working correctly:
1. Click "💳 Pay Now" button
2. Screen slightly darkens (modal overlay)
3. Payment modal slides in from center
4. Form fields are visible and functional
5. No errors in console

### Still Having Issues?

Share these details:
1. Screenshot of browser console when clicking "Pay Now"
2. Screenshot of Network tab showing API calls
3. Screenshot of the white screen
4. Any error messages from console

---

**Quick Fix Command:**
```bash
cd frontend
rm -rf node_modules package-lock.json
npm install
npm run dev
```

This will reinstall all dependencies and restart fresh.
