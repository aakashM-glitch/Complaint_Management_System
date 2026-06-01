# Complaint Management System

A full-stack Complaint Management System built with Spring Boot (Backend) and React (Frontend).

## Features

- **User Registration & Authentication** with JWT
- **Database-Stored JWT Tokens** - All tokens are persisted in MySQL
- **Token Management** - Create, validate, revoke tokens with full lifecycle tracking
- **Role-Based Access Control** (USER, ADMIN, ENGINEER)
- **Complaint Management**:
  - Users can create and view their complaints
  - Admins can view all complaints, assign to engineers, and update status
  - Engineers can view assigned complaints and mark them as resolved
- **Real-time Status Updates**
- **Token Revocation** - Logout single device or all devices
- **Automatic Token Cleanup** - Scheduled cleanup of expired tokens
- **Notification Hooks** (prepared for AWS SNS integration)

## Tech Stack

### Backend
- Java 17
- Spring Boot 3.2.0
- Spring Data JPA (Hibernate)
- Spring Security with JWT
- MySQL Database
- Maven

### Frontend
- React 18
- Vite
- React Router
- osos
- CSS3

## Project Structure

```
complaint-management-system/
├── backend/
│   ├── src/
│   │   ├── main/
│   │   │   ├── java/com/complaint/
│   │   │   │   ├── entity/          # JPA Entities
│   │   │   │   ├── dto/              # Data Transfer Objects
│   │   │   │   ├── repository/       # JPA Repositories
│   │   │   │   ├── service/          # Business Logic
│   │   │   │   ├── controller/       # REST Controllers
│   │   │   │   ├── security/          # Security Configuration
│   │   │   │   ├── util/             # Utility Classes
│   │   │   │   └── exception/        # Exception Handlers
│   │   │   └── resources/
│   │   │       └── application.properties
│   │   └── test/
│   ├── database/
│   │   └── schema.sql
│   └── pom.xml
├── frontend/
│   ├── src/
│   │   ├── components/       # React Components
│   │   ├── context/          # React Context
│   │   ├── services/         # API Services
│   │   ├── styles/           # CSS Files
│   │   ├── App.jsx
│   │   ├── main.jsx
│   │   └── index.css
│   ├── package.json
│   └── vite.config.js
├── API_DOCUMENTATION.md
└── README.md
```

## Prerequisites

- Java 17 or higher
- Maven 3.6+
- MySQL 8.0+
- Node.js 16+ and npm
- Eclipse IDE (for backend)

## Setup Instructions

### Backend Setup

1. **Import Project in Eclipse:**
   - Open Eclipse IDE
   - File → Import → Maven → Existing Maven Projects
   - Select the `backend` folder
   - Click Finish

2. **Database Setup:**
   - Create MySQL database:
     ```sql
     CREATE DATABASE complaint_db;
     ```
   - Or run the schema file:
     ```bash
     mysql -u root -p < backend/database/schema.sql
     ```

3. **Configure Database:**
   - Update `backend/src/main/resources/application.properties`:
     ```properties
     spring.datasource.username=your_username
     spring.datasource.password=your_password
     ```

4. **Run the Application:**
   - Right-click on `ComplaintManagementSystemApplication.java`
   - Run As → Java Application
   - Backend will start on `http://localhost:8080`

### Frontend Setup

1. **Install Dependencies:**
   ```bash
   cd frontend
   npm install
   ```

2. **Run Development Server:**
   ```bash
   npm run dev
   ```
   - Frontend will start on `http://localhost:3000`

3. **Build for Production:**
   ```bash
   npm run build
   ```

## Default Users

The database schema includes sample users (you may need to create them manually):

- **Admin:**
  - Email: `admin@example.com`
  - Password: `admin123`
  - Role: ADMIN

- **Engineer:**
  - Email: `engineer@example.com`
  - Password: `engineer123`
  - Role: ENGINEER

**Note:** For production, use proper password hashing. The sample passwords above are for testing only.

## API Endpoints

See [API_DOCUMENTATION.md](API_DOCUMENTATION.md) for complete API documentation.

### Quick Reference:

- **Authentication:**
  - `POST /api/auth/register` - Register new user (token saved to DB)
  - `POST /api/auth/login` - Login user (token saved to DB)
  - `POST /api/auth/logout` - Logout (revoke current token)
  - `POST /api/auth/logout-all` - Logout all devices (revoke all user tokens)

- **User:**
  - `POST /api/user/complaints` - Create complaint
  - `GET /api/user/complaints` - Get user's complaints

- **Admin:**
  - `GET /api/admin/complaints` - Get all complaints
  - `POST /api/admin/complaints/{id}/assign` - Assign complaint
  - `PUT /api/admin/complaints/{id}/status` - Update status
  - `GET /api/admin/engineers` - Get engineers list

- **Engineer:**
  - `GET /api/engineer/complaints` - Get assigned complaints
  - `PUT /api/engineer/complaints/{id}/resolve` - Mark as resolved

## Usage

1. **Register/Login:**
   - Open `http://localhost:3000`
   - Register a new user or login with existing credentials
   - Select appropriate role during registration

2. **User Flow:**
   - Login as USER
   - Create complaints
   - View complaint status

3. **Admin Flow:**
   - Login as ADMIN
   - View all complaints
   - Assign complaints to engineers
   - Update complaint status

4. **Engineer Flow:**
   - Login as ENGINEER
   - View assigned complaints
   - Mark complaints as resolved

## Security Features

- JWT-based authentication with database storage
- Token persistence and lifecycle management
- Token revocation (single or all devices)
- BCrypt password encryption
- Role-based access control (RBAC)
- Database-validated token authentication
- Automatic token cleanup
- CORS configuration
- Input validation

## Database Schema

### Users Table
- `id` (BIGINT, Primary Key)
- `name` (VARCHAR(100))
- `email` (VARCHAR(100), Unique)
- `password` (VARCHAR(255))
- `role` (ENUM: USER, ADMIN, ENGINEER)

### Tokens Table
- `id` (BIGINT, Primary Key)
- `token` (VARCHAR(500), Unique) - JWT token string
- `user_id` (BIGINT, Foreign Key)
- `created_at` (DATETIME)
- `expires_at` (DATETIME)
- `expired` (BOOLEAN)
- `revoked` (BOOLEAN)

### Complaints Table
- `id` (BIGINT, Primary Key)
- `title` (VARCHAR(200))
- `description` (VARCHAR(1000))
- `status` (ENUM: PENDING, ASSIGNED, IN_PROGRESS, RESOLVED, CLOSED)
- `created_date` (DATETIME)
- `updated_date` (DATETIME)
- `user_id` (BIGINT, Foreign Key)
- `engineer_id` (BIGINT, Foreign Key, Nullable)

## Token Management

All JWT tokens are stored in the database with full lifecycle tracking:
- **Token Creation**: Automatically saved on registration/login
- **Token Validation**: Validated against database on each request
- **Token Revocation**: Can revoke single token or all user tokens
- **Automatic Cleanup**: Expired tokens are cleaned up hourly

See [TOKEN_MANAGEMENT.md](TOKEN_MANAGEMENT.md) for detailed documentation.

## Future Enhancements

- AWS SNS integration for notifications
- Email notifications
- File attachments for complaints
- Complaint comments/updates
- Dashboard analytics
- Export functionality
- Advanced filtering and search
- Token refresh mechanism

## Troubleshooting

### Backend Issues

1. **Port 8080 already in use:**
   - Change port in `application.properties`: `server.port=8081`

2. **Database connection error:**
   - Verify MySQL is running
   - Check credentials in `application.properties`
   - Ensure database exists

3. **Maven dependencies not downloading:**
   - Right-click project → Maven → Update Project
   - Check internet connection

### Frontend Issues

1. **CORS errors:**
   - Verify backend CORS configuration
   - Check API base URL in `frontend/src/services/api.js`

2. **API calls failing:**
   - Ensure backend is running
   - Check browser console for errors
   - Verify JWT token is being sent

## License

This project is for educational purposes.

## Author

Senior Java Full Stack Developer
