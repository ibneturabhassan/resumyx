# Production Deployment Guide - Authentication

## Pre-Deployment Checklist

### ✅ Step 1: Run Supabase SQL Script (REQUIRED)

Before deploying, you **MUST** run this SQL script in Supabase to set up authentication:

1. Go to [Supabase Dashboard](https://supabase.com/dashboard) → **SQL Editor**
2. Click **New Query**
3. Copy and paste this script:

```sql
-- Add auth_user_id column to link profiles to authenticated users
ALTER TABLE resume_profiles
ADD COLUMN IF NOT EXISTS auth_user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_auth_user_id ON resume_profiles(auth_user_id);

-- Make old user_id nullable (we'll use auth_user_id instead)
ALTER TABLE resume_profiles ALTER COLUMN user_id DROP NOT NULL;

-- Remove old policy
DROP POLICY IF EXISTS "Allow all operations" ON resume_profiles;

-- Create Row Level Security (RLS) policies for data isolation
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

4. Click **Run** → Should see "Success. No rows returned"

### ✅ Step 2: Enable Supabase Email Auth (VERIFY)

1. Go to [Supabase Dashboard](https://supabase.com/dashboard) → **Authentication** → **Providers**
2. Verify **Email** provider is **Enabled**
3. **Recommended:** For production, enable email confirmation:
   - Go to **Authentication** → **Email Templates**
   - Ensure "Confirm email" is checked
   - Customize email templates if desired

---

## Backend Deployment (Render)

### Step 1: Update Render Environment Variables

You need to add the JWT secret to Render:

1. Go to [Render Dashboard](https://dashboard.render.com)
2. Select your backend service (resumyx-backend or similar)
3. Go to **Environment** tab
4. Add new environment variable:
   - **Key:** `SUPABASE_JWT_SECRET`
   - **Value:** `54fb643d-db18-4220-b52e-2ba25544eaab`
5. Click **Save Changes**

### Step 2: Commit and Push Changes

```bash
# Make sure you're on main branch
git status

# Stage all authentication files
git add .

# Commit with descriptive message
git commit -m "feat: Add Supabase password authentication

- Implement JWT-based auth with access/refresh tokens
- Add backend auth endpoints (register, login, logout, verify, refresh)
- Create frontend auth context and login/register pages
- Add automatic token refresh in API service
- Set up Row Level Security policies in Supabase
- Update dependencies: pyjwt, python-jose, email-validator

Co-Authored-By: Claude Sonnet 4.5 <noreply@anthropic.com>"

# Push to trigger Render deployment
git push origin main
```

### Step 3: Monitor Deployment

1. Watch Render dashboard for deployment logs
2. Wait for "Build successful" and "Deploy live"
3. Check logs for any errors

### Step 4: Verify Backend

Once deployed, test the backend API:

```bash
# Test health endpoint
curl https://your-backend-url.onrender.com/api/health

# Should return: {"status":"healthy"}
```

---

## Frontend Deployment (Vercel)

### Step 1: Ensure Frontend Points to Production Backend

Check that [services/apiService.ts](services/apiService.ts) uses the correct backend URL.

The API URL should be:
```typescript
const API_URL = import.meta.env.VITE_BACKEND_URL || 'https://your-backend-url.onrender.com';
```

### Step 2: Deploy to Vercel

```bash
# Make sure changes are committed
git status

# Push to trigger Vercel deployment (if auto-deploy is enabled)
git push origin main

# OR manually deploy with Vercel CLI
npx vercel --prod
```

### Step 3: Set Vercel Environment Variables (if needed)

If you're using environment variables in the frontend:

1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Select your project
3. Go to **Settings** → **Environment Variables**
4. Add variables if needed:
   - `VITE_BACKEND_URL`: Your Render backend URL

---

## Post-Deployment Testing

### Test Authentication Flow

1. Visit your production frontend URL
2. Should see login page
3. Click "Create one" → Register
4. Enter test credentials:
   - Email: test@yourdomain.com
   - Password: SecureTest123!
5. Check email for confirmation (if enabled)
6. Confirm email and login
7. Should see main app
8. Test features (AI Resume Tailor, etc.)
9. Logout and login again
10. Verify data persistence

### Check Browser DevTools

1. **Application → Local Storage:**
   - `access_token` should exist
   - `refresh_token` should exist
   - `user` should contain user data

2. **Network Tab:**
   - API requests should include `Authorization: Bearer <token>`
   - 401 errors should trigger automatic token refresh

### Monitor Backend Logs

Watch Render logs for:
- Successful logins
- Token verifications
- Any errors or warnings

---

## Troubleshooting

### Issue: 500 errors on login/register
- **Check:** Render environment variables include `SUPABASE_JWT_SECRET`
- **Check:** Supabase SQL script ran successfully
- **Check:** Backend logs in Render dashboard

### Issue: CORS errors
- **Check:** `CORS_ORIGINS` in Render includes your Vercel domain
- **Update:** Add Vercel URL to CORS_ORIGINS environment variable

### Issue: Users can see each other's data
- **Check:** RLS policies are active in Supabase
- **Check:** `auth_user_id` is being set correctly in profile creation

### Issue: Token refresh not working
- **Check:** `refresh_token` exists in localStorage
- **Check:** Backend `/api/auth/refresh` endpoint is accessible
- **Check:** Network tab shows refresh attempts

---

## Rollback Plan

If issues occur:

### Rollback Backend
```bash
# Find previous working commit
git log --oneline

# Revert to previous commit
git revert <commit-hash>
git push origin main
```

### Rollback Frontend
Same process, or use Vercel's rollback feature in dashboard.

---

## Next Steps After Deployment

1. ✅ Verify authentication works in production
2. Update profile endpoints to use `auth_user_id` instead of localStorage `user_id`
3. Test all features with authenticated users
4. Monitor for issues
5. Consider adding:
   - Password reset flow
   - Email verification flow
   - Social login (Google, GitHub)
   - Remember me functionality
   - Session management UI

---

## Support Documentation

- [AUTH_COMPLETE_SUMMARY.md](AUTH_COMPLETE_SUMMARY.md) - Complete overview
- [AUTH_TESTING_GUIDE.md](AUTH_TESTING_GUIDE.md) - Testing instructions
- [SUPABASE_AUTH_SETUP.md](SUPABASE_AUTH_SETUP.md) - Database setup
- [backend/AUTH_API_DOCS.md](backend/AUTH_API_DOCS.md) - API documentation
- [QUICK_START_AUTH.md](QUICK_START_AUTH.md) - Local setup guide
