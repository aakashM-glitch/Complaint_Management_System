# Complaint Management System - API Documentation

## Base URL
```
http://localhost:8080/api
```

## Authentication
All protected endpoints require a JWT token in the Authorization header:
```
Authorization: Bearer <token>
```

---

## Authentication Endpoints

### 1. Register User
**POST** `/auth/register`

**Request Body:**
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "password123",
  "role": "USER"
}
```

**Response:**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "email": "john@example.com",
  "name": "John Doe",
  "role": "USER",
  "userId": 1
}
```

### 2. Login
**POST** `/auth/login`

**Request Body:**
```json
{
  "email": "john@example.com",
  "password": "password123"
}
```

**Response:**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "email": "john@example.com",
  "name": "John Doe",
  "role": "USER",
  "userId": 1
}
```

**Note:** The token is automatically saved to the database and linked to the user.

### 3. Logout
**POST** `/auth/logout`

**Headers:**
```
Authorization: Bearer <token>
```

**Response:**
```json
{
  "message": "Logged out successfully"
}
```

**Note:** This revokes the current token. The token will no longer be valid for authentication.

### 4. Logout All Devices
**POST** `/auth/logout-all`

**Headers:**
```
Authorization: Bearer <token>
```

**Response:**
```json
{
  "message": "Logged out from all devices successfully"
}
```

**Note:** This revokes all active tokens for the user across all devices.

---

## User Endpoints

### 5. Create Complaint
**POST** `/user/complaints`

**Headers:**
```
Authorization: Bearer <token>
```

**Request Body:**
```json
{
  "title": "Network Issue",
  "description": "Unable to connect to the network. Please investigate."
}
```

**Response:**
```json
{
  "id": 1,
  "title": "Network Issue",
  "description": "Unable to connect to the network. Please investigate.",
  "status": "PENDING",
  "createdDate": "2024-01-15T10:30:00",
  "updatedDate": "2024-01-15T10:30:00",
  "userId": 1,
  "userName": "John Doe",
  "engineerId": null,
  "engineerName": null
}
```

### 6. Get User Complaints
**GET** `/user/complaints`

**Headers:**
```
Authorization: Bearer <token>
```

**Response:**
```json
[
  {
    "id": 1,
    "title": "Network Issue",
    "description": "Unable to connect to the network.",
    "status": "ASSIGNED",
    "createdDate": "2024-01-15T10:30:00",
    "updatedDate": "2024-01-15T11:00:00",
    "userId": 1,
    "userName": "John Doe",
    "engineerId": 2,
    "engineerName": "Engineer User"
  }
]
```

### 7. Get Complaint by ID
**GET** `/user/complaints/{id}`

**Headers:**
```
Authorization: Bearer <token>
```

**Response:**
```json
{
  "id": 1,
  "title": "Network Issue",
  "description": "Unable to connect to the network.",
  "status": "ASSIGNED",
  "createdDate": "2024-01-15T10:30:00",
  "updatedDate": "2024-01-15T11:00:00",
  "userId": 1,
  "userName": "John Doe",
  "engineerId": 2,
  "engineerName": "Engineer User"
}
```

---

## Admin Endpoints

### 8. Get All Complaints
**GET** `/admin/complaints`

**Headers:**
```
Authorization: Bearer <token>
```

**Response:**
```json
[
  {
    "id": 1,
    "title": "Network Issue",
    "description": "Unable to connect to the network.",
    "status": "PENDING",
    "createdDate": "2024-01-15T10:30:00",
    "updatedDate": "2024-01-15T10:30:00",
    "userId": 1,
    "userName": "John Doe",
    "engineerId": null,
    "engineerName": null
  }
]
```

### 9. Assign Complaint to Engineer
**POST** `/admin/complaints/{id}/assign`

**Headers:**
```
Authorization: Bearer <token>
```

**Request Body:**
```json
{
  "engineerId": 2
}
```

**Response:**
```json
{
  "id": 1,
  "title": "Network Issue",
  "description": "Unable to connect to the network.",
  "status": "ASSIGNED",
  "createdDate": "2024-01-15T10:30:00",
  "updatedDate": "2024-01-15T11:00:00",
  "userId": 1,
  "userName": "John Doe",
  "engineerId": 2,
  "engineerName": "Engineer User"
}
```

### 10. Update Complaint Status
**PUT** `/admin/complaints/{id}/status`

**Headers:**
```
Authorization: Bearer <token>
```

**Request Body:**
```json
{
  "status": "IN_PROGRESS"
}
```

**Valid Status Values:**
- PENDING
- ASSIGNED
- IN_PROGRESS
- RESOLVED
- CLOSED

**Response:**
```json
{
  "id": 1,
  "title": "Network Issue",
  "description": "Unable to connect to the network.",
  "status": "IN_PROGRESS",
  "createdDate": "2024-01-15T10:30:00",
  "updatedDate": "2024-01-15T11:30:00",
  "userId": 1,
  "userName": "John Doe",
  "engineerId": 2,
  "engineerName": "Engineer User"
}
```

### 11. Get Engineers List
**GET** `/admin/engineers`

**Headers:**
```
Authorization: Bearer <token>
```

**Response:**
```json
[
  {
    "id": 2,
    "name": "Engineer User",
    "email": "engineer@example.com",
    "role": "ENGINEER"
  }
]
```

### 12. Get Complaint by ID (Admin)
**GET** `/admin/complaints/{id}`

**Headers:**
```
Authorization: Bearer <token>
```

**Response:** Same as User endpoint

---

## Engineer Endpoints

### 13. Get Assigned Complaints
**GET** `/engineer/complaints`

**Headers:**
```
Authorization: Bearer <token>
```

**Response:**
```json
[
  {
    "id": 1,
    "title": "Network Issue",
    "description": "Unable to connect to the network.",
    "status": "ASSIGNED",
    "createdDate": "2024-01-15T10:30:00",
    "updatedDate": "2024-01-15T11:00:00",
    "userId": 1,
    "userName": "John Doe",
    "engineerId": 2,
    "engineerName": "Engineer User"
  }
]
```

### 14. Mark Complaint as Resolved
**PUT** `/engineer/complaints/{id}/resolve`

**Headers:**
```
Authorization: Bearer <token>
```

**Response:**
```json
{
  "id": 1,
  "title": "Network Issue",
  "description": "Unable to connect to the network.",
  "status": "RESOLVED",
  "createdDate": "2024-01-15T10:30:00",
  "updatedDate": "2024-01-15T12:00:00",
  "userId": 1,
  "userName": "John Doe",
  "engineerId": 2,
  "engineerName": "Engineer User"
}
```

### 15. Get Complaint by ID (Engineer)
**GET** `/engineer/complaints/{id}`

**Headers:**
```
Authorization: Bearer <token>
```

**Response:** Same as User endpoint

---

## Error Responses

### Validation Error (400)
```json
{
  "title": "Title is required",
  "description": "Description must be between 10 and 1000 characters"
}
```

### Unauthorized (401)
```json
{
  "error": "Invalid email or password"
}
```

### Forbidden (403)
```json
{
  "error": "Access denied"
}
```

### Not Found (404)
```json
{
  "error": "Complaint not found"
}
```

### Internal Server Error (500)
```json
{
  "error": "An unexpected error occurred: ..."
}
```

---

## Status Codes

- `200 OK` - Request successful
- `201 Created` - Resource created successfully
- `400 Bad Request` - Validation error or bad request
- `401 Unauthorized` - Authentication required
- `403 Forbidden` - Insufficient permissions
- `404 Not Found` - Resource not found
- `500 Internal Server Error` - Server error
