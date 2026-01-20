# Authentication API Documentation

## Overview

Resumyx now includes full authentication using Supabase Auth with JWT tokens.

## Authentication Flow

```
1. User registers/logs in
2. Backend returns JWT tokens (access_token + refresh_token)
3. Frontend stores tokens (localStorage)
4. Frontend includes access_token in Authorization header
5. Backend validates token and grants access
```

## API Endpoints

### Base URL
- Development: `http://localhost:8000/api`
- Production: `https://your-api.onrender.com/api`

### Register

**POST** `/auth/register`

Register a new user account.

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "securepassword123"
}
```

**Response (201 Created):**
```json
{
  "user": {
    "id": "uuid-here",
    "email": "user@example.com",
    "created_at": "2024-01-19T10:00:00Z"
  },
  "session": {
    "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "refresh_token": "refresh-token-here",
    "expires_at": 1705662000,
    "expires_in": 3600
  },
  "message": "Registration successful!"
}
```

**Note**: If email confirmation is enabled in Supabase, `session` will be null and user must confirm email first.

### Login

**POST** `/auth/login`

Login with email and password.

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "securepassword123"
}
```

**Response (200 OK):**
```json
{
  "user": {
    "id": "uuid-here",
    "email": "user@example.com",
    "created_at": "2024-01-19T10:00:00Z"
  },
  "session": {
    "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "refresh_token": "refresh-token-here",
    "expires_at": 1705662000,
    "expires_in": 3600
  }
}
```

**Error Responses:**
- `401 Unauthorized`: Invalid email or password
- `500 Internal Server Error`: Server error

### Refresh Token

**POST** `/auth/refresh`

Refresh an expired access token.

**Request Body:**
```json
{
  "refresh_token": "your-refresh-token-here"
}
```

**Response (200 OK):**
```json
{
  "access_token": "new-access-token",
  "refresh_token": "new-refresh-token",
  "expires_at": 1705662000,
  "expires_in": 3600
}
```

### Logout

**POST** `/auth/logout`

Logout current user.

**Headers:**
```
Authorization: Bearer your-access-token
```

**Response (200 OK):**
```json
{
  "message": "Logged out successfully"
}
```

### Get Current User

**GET** `/auth/me`

Get current authenticated user's information.

**Headers:**
```
Authorization: Bearer your-access-token
```

**Response (200 OK):**
```json
{
  "id": "uuid-here",
  "email": "user@example.com",
  "created_at": "2024-01-19T10:00:00Z"
}
```

**Error Responses:**
- `401 Unauthorized`: Invalid or expired token

### Verify Token

**GET** `/auth/verify`

Verify if a token is valid.

**Headers:**
```
Authorization: Bearer your-access-token
```

**Response (200 OK):**
```json
{
  "valid": true,
  "user_id": "uuid-here",
  "email": "user@example.com"
}
```

**Error Responses:**
- `401 Unauthorized`: Invalid or expired token

## Protected Endpoints

All existing resume and AI endpoints now require authentication:

### Profile Endpoints
- `GET /api/profile` - Get current user's profile
- `POST /api/profile` - Save current user's profile
- `DELETE /api/profile` - Delete current user's profile

### AI Endpoints
- `POST /api/ai/generate-summary`
- `POST /api/ai/tailor-resume`
- `POST /api/ai/ats-score`
- `POST /api/ai/generate-cover-letter`

**All require:**
```
Authorization: Bearer your-access-token
```

## Using Authentication in Requests

### Example: Login and Use Token

```bash
# 1. Login
curl -X POST http://localhost:8000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "password": "password123"
  }'

# Response includes access_token
# {
#   "user": {...},
#   "session": {
#     "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
#   }
# }

# 2. Use token in subsequent requests
curl -X GET http://localhost:8000/api/profile \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
```

### Example: JavaScript/TypeScript

```typescript
// Login
const loginResponse = await fetch('http://localhost:8000/api/auth/login', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    email: 'user@example.com',
    password: 'password123'
  })
});

const { session } = await loginResponse.json();
const accessToken = session.access_token;

// Store token
localStorage.setItem('access_token', accessToken);

// Use token in requests
const profileResponse = await fetch('http://localhost:8000/api/profile', {
  headers: {
    'Authorization': `Bearer ${accessToken}`
  }
});
```

## Token Lifecycle

### Access Token
- **Lifespan**: 1 hour (3600 seconds)
- **Usage**: Include in all API requests
- **Storage**: localStorage or httpOnly cookie
- **Refresh**: Use refresh token when expired

### Refresh Token
- **Lifespan**: 30 days
- **Usage**: Get new access token when it expires
- **Storage**: localStorage (secure) or httpOnly cookie (more secure)
- **Refresh**: Automatically rotated when used

### Token Expiry Handling

```typescript
async function makeAuthenticatedRequest(url: string, options: RequestInit = {}) {
  let token = localStorage.getItem('access_token');

  // Add token to request
  const response = await fetch(url, {
    ...options,
    headers: {
      ...options.headers,
      'Authorization': `Bearer ${token}`
    }
  });

  // If token expired, refresh it
  if (response.status === 401) {
    const refreshToken = localStorage.getItem('refresh_token');

    const refreshResponse = await fetch('/api/auth/refresh', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refresh_token: refreshToken })
    });

    if (refreshResponse.ok) {
      const { session } = await refreshResponse.json();
      localStorage.setItem('access_token', session.access_token);
      localStorage.setItem('refresh_token', session.refresh_token);

      // Retry original request with new token
      return makeAuthenticatedRequest(url, options);
    } else {
      // Refresh failed, redirect to login
      window.location.href = '/login';
    }
  }

  return response;
}
```

## Error Responses

### 400 Bad Request
```json
{
  "detail": "User already registered"
}
```

### 401 Unauthorized
```json
{
  "detail": "Invalid or expired token"
}
```

### 500 Internal Server Error
```json
{
  "detail": "Error message here"
}
```

## Security Best Practices

### Backend
- ✅ JWT tokens validated on every request
- ✅ Tokens expire after 1 hour
- ✅ Passwords hashed by Supabase (bcrypt)
- ✅ HTTPS required in production
- ✅ CORS configured for specific origins

### Frontend
- ✅ Store tokens in localStorage or httpOnly cookies
- ✅ Clear tokens on logout
- ✅ Handle 401 errors (token expired)
- ✅ Use HTTPS in production
- ❌ Don't store tokens in regular cookies (XSS vulnerable)

## Testing Authentication

### 1. Test Registration
```bash
curl -X POST http://localhost:8000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email": "test@example.com", "password": "test123456"}'
```

### 2. Test Login
```bash
curl -X POST http://localhost:8000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email": "test@example.com", "password": "test123456"}'
```

### 3. Test Protected Endpoint
```bash
TOKEN="your-access-token-here"

curl -X GET http://localhost:8000/api/auth/me \
  -H "Authorization: Bearer $TOKEN"
```

### 4. Test Token Verification
```bash
curl -X GET http://localhost:8000/api/auth/verify \
  -H "Authorization: Bearer $TOKEN"
```

## Interactive API Docs

Visit the Swagger UI for interactive testing:
- **Local**: http://localhost:8000/docs
- **Production**: https://your-api.onrender.com/docs

The Swagger UI includes:
- Try out all endpoints
- Automatic request/response examples
- Built-in authentication (click "Authorize" button)

## Next Steps

1. ✅ Backend authentication implemented
2. 🔄 Frontend auth UI (in progress)
3. 📝 Update existing components to use auth
4. 🧪 End-to-end testing

See [AUTH_IMPLEMENTATION_PLAN.md](../AUTH_IMPLEMENTATION_PLAN.md) for complete implementation details.
