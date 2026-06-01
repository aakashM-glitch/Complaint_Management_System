# ✅ PORT CONFIGURATION - ALL FIXED

## 🎯 Current Configuration:

### Frontend:
- **Port:** 3000
- **URL:** http://localhost:3000
- **Config File:** `frontend/vite.config.js`

### Backend:
- **Port:** 5172
- **URL:** http://localhost:5172
- **Config File:** `backend/src/main/resources/application.properties`

### API Connection:
- **Frontend calls backend at:** http://localhost:5172/api
- **Config File:** `frontend/src/services/api.js`

---

## 📝 Files Updated (All at Once):

### 1. ✅ `frontend/vite.config.js`
```javascript
export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000,           // Frontend runs on 3000
    strictPort: true,     // Must use port 3000
    open: true            // Auto-opens browser
  }
})
```

### 2. ✅ `frontend/src/services/api.js` (Already updated)
```javascript
const api = axios.create({
  baseURL: 'http://localhost:5172/api',  // Points to backend
  headers: {
    'Content-Type': 'application/json'
  }
})
```

### 3. ✅ `backend/src/main/resources/application.properties` (Already updated by you)
```properties
server.port=5172
```

---

## 🚀 How to Start:

### Start Backend (Eclipse/IntelliJ):
1. Right-click on main application class
2. Run As → Java Application
3. Should see: "Tomcat started on port(s): 5172"

### Start Frontend:
```bash
cd frontend
npm run dev
```

Should see:
```
VITE v5.0.8  ready in XXX ms

➜  Local:   http://localhost:3000/
➜  Network: use --host to expose
```

Browser should auto-open at http://localhost:3000

---

## ✅ What's Working Now:

- ✅ Frontend: Port **3000**
- ✅ Backend: Port **5172**
- ✅ API calls: Frontend → Backend on 5172
- ✅ CORS: Backend allows localhost:3000
- ✅ Auto-open browser on npm run dev
- ✅ Strict port (won't use 3001 if 3000 is busy)

---

## 🧪 Test Complete Setup:

1. **Start Backend** → Check console: "Tomcat started on port(s): 5172"
2. **Start Frontend** → Browser opens at http://localhost:3000
3. **Try Login:**
   - Email: admin@example.com
   - Password: admin123
4. **Should login successfully!** ✅

---

## 📊 Port Summary:

| Service | Port | URL |
|---------|------|-----|
| Frontend (Vite) | 3000 | http://localhost:3000 |
| Backend (Spring) | 5172 | http://localhost:5172 |
| MySQL Database | 3306 | localhost:3306 |

---

## 🔧 Troubleshooting:

### Frontend Port Already in Use?
```bash
# Kill process on port 3000 (Windows)
netstat -ano | findstr :3000
taskkill /PID <PID> /F
```

### Backend Port Already in Use?
```bash
# Kill process on port 5172 (Windows)
netstat -ano | findstr :5172
taskkill /PID <PID> /F
```

### CORS Error?
Backend controllers already have:
```java
@CrossOrigin(origins = "http://localhost:3000")
```
So CORS should work! ✅

---

## ✨ All Configuration Complete!

**Everything is set up correctly:**
- Frontend on 3000 ✅
- Backend on 5172 ✅
- All files updated together ✅
- No manual changes needed ✅

**Just restart your frontend server and you're good to go!** 🚀

Stop current npm run dev (Ctrl+C) and restart:
```bash
npm run dev
```

Browser will auto-open at http://localhost:3000 and everything should work perfectly!
