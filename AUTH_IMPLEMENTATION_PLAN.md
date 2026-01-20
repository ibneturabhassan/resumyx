# Authentication Implementation Plan

## Overview

Implementing password-based authentication using Supabase Auth with the existing architecture.

## Architecture

```
Frontend (React)
    ↓
Auth Context (manages auth state)
    ↓
Backend API (FastAPI)
    ↓
Supabase Auth (handles authentication)
    ↓
Supabase Database (stores user data)
```

## Features to Implement

### 1. User Authentication
- ✅ Email/Password Registration
- ✅ Email/Password Login
- ✅ Session Management
- ✅ Logout
- ✅ Protected Routes
- ✅ Auto-login (remember session)

### 2. User Profile Management
- ✅ Link resume data to authenticated user
- ✅ User-specific data isolation
- ✅ Automatic user ID from auth token

### 3. Security
- ✅ JWT token validation
- ✅ Row Level Security (RLS) policies
- ✅ Password hashing (handled by Supabase)
- ✅ CORS configuration

## Implementation Steps

### Phase 1: Supabase Setup

**1. Enable Supabase Auth**
- Auth is already enabled in Supabase by default
- Configure email settings
- Set up auth policies

**2. Update Database Schema**
- Add `auth.users` table (already exists in Supabase)
- Update `resume_profiles` table to link to `auth.uid`
- Add RLS policies for user isolation

**3. Create Auth Tables**
```sql
-- Update resume_profiles to use auth user ID
ALTER TABLE resume_profiles
ADD COLUMN auth_user_id UUID REFERENCES auth.users(id);

-- Create index
CREATE INDEX idx_auth_user_id ON resume_profiles(auth_user_id);

-- Update RLS policies
DROP POLICY IF EXISTS "Allow all operations" ON resume_profiles;

CREATE POLICY "Users can view own profiles"
ON resume_profiles FOR SELECT
USING (auth.uid() = auth_user_id);

CREATE POLICY "Users can insert own profiles"
ON resume_profiles FOR INSERT
WITH CHECK (auth.uid() = auth_user_id);

CREATE POLICY "Users can update own profiles"
ON resume_profiles FOR UPDATE
USING (auth.uid() = auth_user_id);

CREATE POLICY "Users can delete own profiles"
ON resume_profiles FOR DELETE
USING (auth.uid() = auth_user_id);
```

### Phase 2: Backend Implementation

**1. Add Auth Dependencies**
```bash
pip install pyjwt python-jose[cryptography]
```

**2. Create Auth Service** (`backend/app/services/auth_service.py`)
- Integrate with Supabase Auth
- Token validation
- User registration/login

**3. Add Auth Endpoints** (`backend/app/api/auth.py`)
- POST `/api/auth/register` - Register new user
- POST `/api/auth/login` - Login user
- POST `/api/auth/logout` - Logout user
- GET `/api/auth/me` - Get current user
- POST `/api/auth/refresh` - Refresh token

**4. Add Auth Middleware**
- JWT token validation
- Extract user from token
- Attach user to request

**5. Update Existing Endpoints**
- Use authenticated user ID instead of localStorage ID
- Add authentication requirement

### Phase 3: Frontend Implementation

**1. Create Auth Context** (`src/contexts/AuthContext.tsx`)
- Manage auth state
- Store JWT token
- Auto-login on page load
- Logout functionality

**2. Create Auth Components**
- `LoginPage.tsx` - Login form
- `RegisterPage.tsx` - Registration form
- `ProtectedRoute.tsx` - Route wrapper for auth

**3. Update API Service** (`src/services/apiService.ts`)
- Add JWT token to requests
- Handle 401 responses
- Add auth endpoints

**4. Update App.tsx**
- Wrap with AuthProvider
- Add login/register routes
- Redirect unauthenticated users

**5. Update Components**
- Remove localStorage user ID
- Use authenticated user from context
- Show user info in UI

### Phase 4: Testing

**1. Manual Testing**
- Register new user
- Login with credentials
- Access protected routes
- Logout and verify session cleared
- Try accessing without login

**2. End-to-End Testing**
- Create profile as authenticated user
- Verify data isolation (can't see other users' data)
- Test auto-login
- Test token refresh

## Database Schema Changes

### Current Schema
```sql
CREATE TABLE resume_profiles (
  id UUID PRIMARY KEY,
  user_id TEXT NOT NULL,  -- localStorage ID
  profile_data JSONB,
  target_jd TEXT,
  created_at TIMESTAMP,
  updated_at TIMESTAMP
);
```

### New Schema
```sql
CREATE TABLE resume_profiles (
  id UUID PRIMARY KEY,
  auth_user_id UUID REFERENCES auth.users(id),  -- Authenticated user
  user_id TEXT,  -- Legacy (for migration)
  profile_data JSONB,
  target_jd TEXT,
  created_at TIMESTAMP,
  updated_at TIMESTAMP
);
```

## Migration Strategy

**Option 1: Fresh Start (Recommended)**
- Start with new auth-based system
- Users re-create profiles after signup

**Option 2: Migrate Existing Data**
- Keep old data with `user_id`
- On first login, claim existing profile
- Migrate `user_id` to `auth_user_id`

## API Endpoints Changes

### New Auth Endpoints
```
POST   /api/auth/register       # Register new user
POST   /api/auth/login          # Login and get token
POST   /api/auth/logout         # Logout (client-side mostly)
GET    /api/auth/me             # Get current user info
POST   /api/auth/refresh        # Refresh access token
```

### Updated Endpoints (now require auth)
```
GET    /api/profile             # Get current user's profile
POST   /api/profile             # Save current user's profile
DELETE /api/profile             # Delete current user's profile
POST   /api/ai/*                # All AI endpoints require auth
```

## Frontend Flow

### Unauthenticated User
1. Visit site → Redirect to login page
2. Choose to register or login
3. After login → Redirect to profile page

### Authenticated User
1. Visit site → Auto-login from stored token
2. Access all features
3. Profile data tied to their account
4. Logout → Clear token, redirect to login

## Security Considerations

### Backend
- ✅ Validate JWT tokens on all protected routes
- ✅ Use Supabase service key for admin operations
- ✅ Never expose service key to frontend
- ✅ Implement rate limiting on auth endpoints
- ✅ Use HTTPS in production

### Frontend
- ✅ Store JWT in localStorage (or httpOnly cookie)
- ✅ Clear token on logout
- ✅ Handle 401 responses (token expired)
- ✅ Don't store sensitive data in localStorage

### Database
- ✅ Enable Row Level Security
- ✅ Users can only access their own data
- ✅ Use `auth.uid()` in RLS policies

## Environment Variables

### Backend (add to `.env`)
```env
SUPABASE_JWT_SECRET=your_jwt_secret  # From Supabase dashboard
```

### Frontend (no changes needed)
```env
VITE_API_URL=http://localhost:8000/api
```

## Testing Checklist

- [ ] User can register with email/password
- [ ] User can login with correct credentials
- [ ] Login fails with wrong credentials
- [ ] User stays logged in after page refresh
- [ ] User can logout
- [ ] Unauthenticated users redirected to login
- [ ] Users can only see their own profiles
- [ ] Token expires and refreshes properly
- [ ] All AI features work with authentication
- [ ] Data isolation works (users can't access others' data)

## Benefits

### Security
- Proper user authentication
- Data isolation per user
- No more localStorage user IDs

### User Experience
- Users can access from any device
- Secure account management
- Professional authentication system

### Scalability
- Ready for multi-tenant features
- Can add OAuth (Google, GitHub) later
- Proper user management

## Next Steps After Auth

Once authentication is working:
1. Add email verification
2. Add password reset
3. Add OAuth providers (Google, GitHub)
4. Add user profile settings
5. Add team/collaboration features

## Timeline

- **Phase 1** (Supabase Setup): 30 minutes
- **Phase 2** (Backend): 1-2 hours
- **Phase 3** (Frontend): 2-3 hours
- **Phase 4** (Testing): 30 minutes

**Total**: 4-6 hours

Let's start implementing!
