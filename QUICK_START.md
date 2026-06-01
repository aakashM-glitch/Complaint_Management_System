# Quick Start Guide

## Prerequisites Check
- [ ] Java 17 installed (`java -version`)
- [ ] Maven installed (`mvn -version`)
- [ ] MySQL 8.0+ installed and running
- [ ] Node.js 16+ installed (`node -v`)
- [ ] Eclipse IDE installed

## 5-Minute Setup

### 1. Database Setup (2 minutes)
```bash
# Start MySQL
mysql -u root -p

# Create database
CREATE DATABASE complaint_db;

# Exit MySQL
exit;
```

Or run the schema file:
```bash
mysql -u root -p < backend/database/schema.sql
```

### 2. Backend Setup (2 minutes)

**In Eclipse:**
1. File → Import → Maven → Existing Maven Projects
2. Select `backend` folder → Finish
3. Update `application.properties` with your MySQL password
4. Right-click `ComplaintManagementSystemApplication.java`
5. Run As → Spring Boot App
6. Wait for: `Started ComplaintManagementSystemApplication`

**Verify:** Open http://localhost:8080/api/auth/login (should return error, but connection works)

### 3. Frontend Setup (1 minute)
```bash
cd frontend
npm install
npm run dev
```

**Verify:** Open http://localhost:3000 (should show login page)

## Test the Application

### 1. Register a User
- Open http://localhost:3000
- Click "Register"
- Fill in:
  - Name: Test User
  - Email: test@example.com
  - Password: test123
  - Role: USER
- Click Register
- You'll be redirected to User Dashboard

### 2. Create a Complaint
- Click "Create Complaint"
- Fill in:
  - Title: Test Complaint
  - Description: This is a test complaint
- Click Submit
- Complaint appears in the table

### 3. Test Admin (Optional)
- Logout
- Register as ADMIN
- Login and view all complaints
- Assign complaint to an engineer

### 4. Test Engineer (Optional)
- Logout
- Register as ENGINEER
- Login and view assigned complaints
- Mark complaint as resolved

## Default Test Accounts

You can create these manually in the database or register them:

**Admin:**
- Email: admin@example.com
- Password: admin123
- Role: ADMIN

**Engineer:**
- Email: engineer@example.com
- Password: engineer123
- Role: ENGINEER

## Common Issues

### Backend won't start
- Check MySQL is running
- Verify database credentials
- Check port 8080 is free

### Frontend can't connect to backend
- Verify backend is running on port 8080
- Check browser console for CORS errors
- Verify API URL in `frontend/src/services/api.js`

### Database connection error
- Verify MySQL is running: `mysql -u root -p`
- Check database exists: `SHOW DATABASES;`
- Verify credentials in `application.properties`

## Next Steps

1. Read [README.md](README.md) for detailed documentation
2. Check [API_DOCUMENTATION.md](API_DOCUMENTATION.md) for API details
3. Review [ECLIPSE_SETUP.md](ECLIPSE_SETUP.md) for Eclipse configuration

## Project Structure

```
complaint-management-system/
├── backend/          # Spring Boot application
├── frontend/         # React application
├── README.md         # Main documentation
├── API_DOCUMENTATION.md
├── ECLIPSE_SETUP.md
└── QUICK_START.md    # This file
```

## Support

If you encounter issues:
1. Check the error message in console/logs
2. Verify all prerequisites are installed
3. Review the troubleshooting sections in README.md
4. Ensure all services (MySQL, Backend, Frontend) are running
