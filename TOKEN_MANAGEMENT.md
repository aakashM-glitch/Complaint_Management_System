# JWT Token Management with Database Storage

## Overview

This implementation stores JWT access tokens in the MySQL database, allowing for:
- Token persistence and tracking
- Token validation against database records
- Token revocation (single token or all user tokens)
- Automatic cleanup of expired tokens
- Enhanced security through token lifecycle management

## Architecture

### Components

1. **Token Entity** (`Token.java`)
   - Stores JWT token string
   - Links to User via foreign key
   - Tracks creation time, expiration time
   - Flags for expired and revoked status

2. **TokenRepository** (`TokenRepository.java`)
   - JPA repository for token operations
   - Custom queries for token management
   - Methods for finding, revoking, and cleaning up tokens

3. **TokenService** (`TokenService.java`)
   - Business logic for token operations
   - Token creation and persistence
   - Token validation
   - Token revocation (single/all)
   - Scheduled cleanup of expired tokens

4. **Updated AuthService**
   - Saves tokens to database on registration/login
   - Provides logout functionality

5. **Updated JwtAuthenticationFilter**
   - Validates tokens against database
   - Checks if token is revoked or expired

## Database Schema

```sql
CREATE TABLE tokens (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    token VARCHAR(500) NOT NULL UNIQUE,
    user_id BIGINT NOT NULL,
    created_at DATETIME NOT NULL,
    expires_at DATETIME NOT NULL,
    expired BOOLEAN NOT NULL DEFAULT FALSE,
    revoked BOOLEAN NOT NULL DEFAULT FALSE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_token (token),
    INDEX idx_user_id (user_id),
    INDEX idx_expired (expired)
);
```

## Token Lifecycle

### 1. Token Creation
- On successful registration or login
- JWT token is generated using `JwtUtil`
- Token is saved to database with:
  - Token string
  - Associated user
  - Creation timestamp
  - Expiration timestamp (from JWT expiration config)
  - `expired = false`
  - `revoked = false`

### 2. Token Validation
- JWT structure is validated first (signature, expiration)
- Database lookup to verify token exists
- Check `expired` and `revoked` flags
- Check if `expiresAt` is in the future
- Token is valid only if all checks pass

### 3. Token Revocation
- **Single Token**: Mark specific token as revoked
- **All User Tokens**: Revoke all active tokens for a user
- Revoked tokens are marked with `revoked = true` and `expired = true`

### 4. Token Cleanup
- Scheduled task runs every hour
- Marks expired tokens (past `expiresAt`)
- Deletes old expired/revoked tokens (older than 7 days)
- Keeps database clean and performant

## API Endpoints

### Logout (Single Token)
**POST** `/api/auth/logout`

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

### Logout All Devices
**POST** `/api/auth/logout-all`

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

## Usage Examples

### Registration Flow
```java
1. User registers → AuthService.register()
2. JWT token generated → JwtUtil.generateToken()
3. Token saved to database → TokenService.saveToken()
4. Token returned to client
```

### Login Flow
```java
1. User logs in → AuthService.login()
2. Credentials validated
3. JWT token generated → JwtUtil.generateToken()
4. Token saved to database → TokenService.saveToken()
5. Token returned to client
```

### Request Authentication Flow
```java
1. Client sends request with Bearer token
2. JwtAuthenticationFilter intercepts
3. JWT structure validated → JwtUtil.validateToken()
4. Database lookup → TokenService.isTokenValid()
5. Check expired/revoked flags
6. If valid, set authentication context
7. Request proceeds
```

### Logout Flow
```java
1. Client calls /api/auth/logout
2. Token extracted from Authorization header
3. TokenService.revokeToken() called
4. Token marked as revoked and expired
5. Future requests with this token will be rejected
```

## Security Features

1. **Token Persistence**: All tokens are tracked in database
2. **Revocation Support**: Tokens can be revoked immediately
3. **Expiration Tracking**: Database tracks token expiration
4. **Automatic Cleanup**: Expired tokens are cleaned up automatically
5. **Multi-Device Support**: Can revoke all user tokens at once
6. **Cascade Deletion**: User deletion removes all associated tokens

## Configuration

### Application Properties
```properties
# JWT Configuration
jwt.secret=your-secret-key-here
jwt.expiration=86400000  # 24 hours in milliseconds
```

### Scheduled Cleanup
The cleanup task runs every hour automatically:
```java
@Scheduled(fixedRate = 3600000) // 1 hour
public void cleanupExpiredTokens()
```

## Best Practices

1. **Token Storage**: Store full JWT token string (can be long, use VARCHAR(500))
2. **Indexing**: Index on `token`, `user_id`, and `expired` for performance
3. **Cleanup**: Regularly delete old expired/revoked tokens
4. **Revocation**: Always check database before validating token
5. **Expiration**: Use both JWT expiration and database expiration for double-check

## Advantages

1. **Revocation**: Can immediately revoke tokens
2. **Audit Trail**: Track all issued tokens
3. **Multi-Device**: Manage tokens across devices
4. **Security**: Enhanced security through database validation
5. **Compliance**: Better compliance with token lifecycle requirements

## Performance Considerations

1. **Indexing**: Proper indexes on token, user_id, expired
2. **Cleanup**: Regular cleanup prevents database bloat
3. **Caching**: Consider caching active tokens for better performance
4. **Connection Pooling**: Ensure proper database connection pooling

## Testing

### Test Token Creation
```bash
POST /api/auth/login
# Verify token is saved in database
```

### Test Token Validation
```bash
GET /api/user/complaints
Authorization: Bearer <token>
# Verify token is validated from database
```

### Test Token Revocation
```bash
POST /api/auth/logout
Authorization: Bearer <token>
# Verify token is marked as revoked
# Try using token again - should fail
```

## Troubleshooting

### Token Not Found in Database
- Check if token was saved during login/registration
- Verify database connection
- Check for transaction rollback issues

### Token Validation Failing
- Verify token exists in database
- Check expired/revoked flags
- Verify expiration time is correct

### Cleanup Not Working
- Verify @EnableScheduling is enabled
- Check scheduled task is running
- Verify database permissions for DELETE operations
