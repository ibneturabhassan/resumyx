# Authentication Testing Guide

## Quick Start Testing

### Prerequisites
1. Backend running with auth dependencies installed
2. Supabase configured with auth tables and JWT secret
3. Frontend running

### Setup Checklist

- [ ] **Backend Dependencies Installed**
  ```bash
  cd backend
  pip install -r requirements.txt
  ```

- [ ] **Supabase JWT Secret Added**
  In `backend/.env`:
  ```env
  SUPABASE_JWT_SECRET=your_jwt_secret_from_supabase_dashboard
  ```

- [ ] **Supabase Auth Tables Created**
  Run SQL from [SUPABASE_AUTH_SETUP.md](SUPABASE_AUTH_SETUP.md):
  ```sql
  ALTER TABLE resume_profiles ADD COLUMN auth_user_id UUID REFERENCES auth.users(id);
  -- ... (rest of SQL)
  ```

- [ ] **Backend Running**
  ```bash
  cd backend
  uvicorn app.main:app --reload
  ```
  Should see: `INFO:     Uvicorn running on http://127.0.0.1:8000`

- [ ] **Frontend Running**
  ```bash
  npm run dev
  ```
  Should see: `Local:   http://localhost:5173/`

## Test Scenarios

### Scenario 1: New User Registration

**Steps:**
1. Open http://localhost:5173
2. You should see the Login page
3. Click **"Create one"** (Create account link)
4. Enter test credentials:
   - Email: `test@example.com`
   - Password: `test123456`
   - Confirm Password: `test123456`
5. Click **"Create Account"**

**Expected Results:**
- ✅ Loading spinner shows
- ✅ Registration succeeds
- ✅ Automatically logged in
- ✅ Redirected to Profile page
- ✅ Can see "Logout" button at bottom of sidebar
- ✅ Tokens stored in localStorage (check DevTools → Application → Local Storage)

**If Email Confirmation Enabled in Supabase:**
- ⚠️ Shows message: "Please check your email to confirm your account"
- Need to confirm email before logging in
- To disable: Supabase Dashboard → Authentication → Settings → Disable "Enable email confirmations"

### Scenario 2: Login with Existing Account

**Steps:**
1. If logged in, click **Logout** button
2. Enter credentials:
   - Email: `test@example.com`
   - Password: `test123456`
3. Click **"Sign In"**

**Expected Results:**
- ✅ Loading spinner shows
- ✅ Login succeeds
- ✅ Redirected to Profile page
- ✅ Can see main app interface

**Error Cases:**
- Wrong password → Shows "Invalid email or password"
- Non-existent email → Shows "Invalid email or password"
- Empty fields → Browser validation prevents submit

### Scenario 3: Auto-Login (Session Persistence)

**Steps:**
1. Login successfully
2. Note: You're on the Profile page
3. Refresh the page (F5 or Ctrl+R)

**Expected Results:**
- ✅ Brief "Loading..." screen
- ✅ NO login page shown
- ✅ Automatically logs back in
- ✅ Returns to same page (Profile)
- ✅ All data still there

**How It Works:**
- Tokens stored in localStorage
- On page load, AuthContext checks for tokens
- Verifies token with backend
- If valid, auto-logs in

### Scenario 4: Logout

**Steps:**
1. While logged in, locate the logout button
   - Bottom of left sidebar
   - Red icon with "Logout" text
2. Click **Logout**

**Expected Results:**
- ✅ Immediately redirected to Login page
- ✅ Tokens cleared from localStorage
- ✅ Cannot access Profile page anymore
- ✅ Must login again to use app

### Scenario 5: Protected Routes

**Steps:**
1. Logout if logged in
2. Try to access any feature without logging in
3. Open DevTools → Console
4. Try to manually navigate (if applicable)

**Expected Results:**
- ✅ Always shows login page when not authenticated
- ✅ Cannot access Profile, AI Tailor, Cover Letter pages
- ✅ All API calls include Authorization header (when logged in)

### Scenario 6: Token Refresh (Automatic)

**Note:** Access tokens expire after 1 hour. Testing this requires waiting or simulating.

**Method 1: Wait (Real Test)**
1. Login successfully
2. Wait 1 hour
3. Try to use any feature (e.g., AI Resume Tailor)

**Expected Results:**
- ✅ First API call gets 401 Unauthorized
- ✅ apiService automatically refreshes token
- ✅ Original request retries with new token
- ✅ Feature works normally
- ✅ User doesn't notice anything

**Method 2: Simulate (Quick Test)**
1. Login successfully
2. Open DevTools → Application → Local Storage
3. Delete `access_token` (keep `refresh_token`)
4. Try to use any feature

**Expected Results:**
- ✅ API call fails with 401
- ✅ Token automatically refreshes
- ✅ Feature works

**Method 3: Simulate Expired Refresh Token**
1. Login successfully
2. Delete both `access_token` AND `refresh_token`
3. Try to use any feature

**Expected Results:**
- ✅ API call fails with 401
- ✅ Refresh attempt fails (no refresh token)
- ✅ Redirected to login page
- ✅ Shows "Session expired" message

### Scenario 7: Use All Features with Auth

**Steps:**
1. Login successfully
2. Test each feature:

**a) Profile Page**
- Edit personal info
- Add experience, education, skills
- Data should auto-save
- Check DevTools → Network → See Authorization header

**b) AI Resume Tailor**
- Paste job description
- Click "Optimize Resume"
- Should work normally
- AI should generate tailored resume

**c) Cover Letter**
- Paste job description
- Click "Generate Cover Letter"
- Should generate letter

**d) Diagnostics**
- Click "Run Connection Test"
- Should show backend connection success

**Expected Results:**
- ✅ All features work normally
- ✅ All API calls include `Authorization: Bearer <token>`
- ✅ No 401 errors
- ✅ Data saves and loads properly

### Scenario 8: Multiple Tabs/Windows

**Steps:**
1. Login in Tab 1
2. Open app in Tab 2 (same browser)
3. Note: Tab 2 also shows logged in
4. Logout in Tab 1
5. Try to use feature in Tab 2

**Expected Results:**
- ✅ Tab 2 also logged in (shares localStorage)
- ✅ After logout in Tab 1, Tab 2 session still valid until page refresh
- ✅ Refresh Tab 2 → Will stay logged in (tokens still in localStorage)
- ✅ Need to logout in each tab separately

**Note:** This is expected behavior with localStorage-based auth.

### Scenario 9: Data Isolation (Security Test)

**Setup:**
1. Create two accounts:
   - User 1: test1@example.com
   - User 2: test2@example.com

**Steps:**
1. Login as User 1
2. Create some resume data
3. Note the profile info
4. Logout
5. Login as User 2
6. Check profile data

**Expected Results:**
- ✅ User 2 should NOT see User 1's data
- ✅ Each user has their own isolated profile
- ✅ RLS policies enforce data isolation
- ✅ Users start with empty/default profile

**How to Verify RLS Works:**
Open Supabase Dashboard → SQL Editor:
```sql
-- This should only return profiles for the authenticated user
SELECT * FROM resume_profiles WHERE auth_user_id = auth.uid();
```

## Testing with DevTools

### Check Tokens (Application Tab)

**Local Storage:**
```
access_token: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
refresh_token: abc123...
user: {"id":"uuid","email":"test@example.com"}
```

### Monitor API Calls (Network Tab)

**Look for:**
1. Login request:
   ```
   POST /api/auth/login
   Request: {"email":"test@example.com","password":"test123456"}
   Response: {"user":{...},"session":{"access_token":...}}
   Status: 200 OK
   ```

2. Protected endpoint:
   ```
   GET /api/profile
   Headers: Authorization: Bearer eyJhbGci...
   Status: 200 OK
   ```

3. Token refresh (if expired):
   ```
   POST /api/auth/refresh
   Request: {"refresh_token":"..."}
   Response: {"access_token":"...","refresh_token":"..."}
   Status: 200 OK
   ```

### Check Console Errors

**Should NOT see:**
- ❌ 401 Unauthorized (unless testing expired token)
- ❌ CORS errors
- ❌ "Failed to fetch"
- ❌ Any auth-related errors during normal use

## Backend Testing (API Direct)

### Test Auth Endpoints with Swagger UI

1. Open http://localhost:8000/docs
2. Test each endpoint:

**Register:**
```
POST /api/auth/register
Body: {
  "email": "test2@example.com",
  "password": "test123456"
}
Response: 201 Created
{
  "user": {...},
  "session": {...}
}
```

**Login:**
```
POST /api/auth/login
Body: {
  "email": "test2@example.com",
  "password": "test123456"
}
Response: 200 OK
{
  "user": {...},
  "session": {...}
}
```

**Get Current User:**
1. Copy `access_token` from login response
2. Click "Authorize" button in Swagger UI
3. Enter: `Bearer <access_token>`
4. Click "Authorize"
5. Try `GET /api/auth/me`

**Expected:** 200 OK with user data

### Test with cURL

**Register:**
```bash
curl -X POST http://localhost:8000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"curl@example.com","password":"test123456"}'
```

**Login:**
```bash
curl -X POST http://localhost:8000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"curl@example.com","password":"test123456"}'
```

**Save the token from response, then:**
```bash
TOKEN="your_access_token_here"

curl -X GET http://localhost:8000/api/auth/me \
  -H "Authorization: Bearer $TOKEN"
```

## Common Issues & Solutions

### Issue: "Invalid or expired token"
**Cause:** Token expired or invalid JWT secret
**Solution:**
1. Check `SUPABASE_JWT_SECRET` in `backend/.env`
2. Copy from Supabase Dashboard → Settings → API → JWT Secret
3. Restart backend
4. Login again

### Issue: Registration works but can't login
**Cause:** Email confirmation enabled
**Solution:**
1. Supabase Dashboard → Authentication → Settings
2. Toggle "Enable email confirmations" to OFF
3. Or confirm email in inbox

### Issue: 401 on all requests
**Cause:** Backend not validating tokens correctly
**Solution:**
1. Check backend logs for JWT errors
2. Verify Supabase JWT secret is correct
3. Check token format in DevTools

### Issue: Login page shows but user is logged in
**Cause:** AuthContext not checking auth state
**Solution:**
1. Check browser console for errors
2. Verify tokens in localStorage
3. Check AuthContext loading state

### Issue: Data not saving
**Cause:** Auth middleware blocking requests
**Solution:**
1. Check Network tab for 401 errors
2. Verify Authorization header present
3. Check backend endpoint requires auth

### Issue: Can see other users' data
**Cause:** RLS policies not working
**Solution:**
1. Verify RLS is enabled: `ALTER TABLE resume_profiles ENABLE ROW LEVEL SECURITY;`
2. Check policies exist: `SELECT * FROM pg_policies WHERE tablename = 'resume_profiles';`
3. Re-run SQL script from SUPABASE_AUTH_SETUP.md

## Success Criteria

Authentication is working correctly if:

- ✅ Can register new account
- ✅ Can login with credentials
- ✅ Auto-login works (page refresh)
- ✅ All features work while authenticated
- ✅ Token refresh is automatic
- ✅ Logout clears session
- ✅ Cannot access app without login
- ✅ Each user sees only their own data
- ✅ No CORS errors
- ✅ No 401 errors during normal use

## Next Steps After Testing

Once all tests pass:

1. **Update Profile Endpoints**
   - Make backend profile endpoints use `auth_user_id`
   - Remove old `user_id` parameter

2. **Deploy to Production**
   - Push code to GitHub
   - Deploy backend to Render
   - Deploy frontend to Vercel
   - Test production auth flow

3. **Optional Enhancements**
   - Add email verification
   - Add password reset
   - Add OAuth providers
   - Add user settings page

## Quick Test Script

Run this to test all auth endpoints:

```bash
#!/bin/bash
API="http://localhost:8000/api"

echo "1. Testing registration..."
REGISTER=$(curl -s -X POST "$API/auth/register" \
  -H "Content-Type: application/json" \
  -d '{"email":"quicktest@example.com","password":"test123456"}')

echo $REGISTER | jq .

TOKEN=$(echo $REGISTER | jq -r .session.access_token)

echo "\n2. Testing /auth/me..."
curl -s "$API/auth/me" \
  -H "Authorization: Bearer $TOKEN" | jq .

echo "\n3. Testing /auth/verify..."
curl -s "$API/auth/verify" \
  -H "Authorization: Bearer $TOKEN" | jq .

echo "\n4. Testing health check..."
curl -s "$API/health" | jq .

echo "\n✅ All tests complete!"
```

Save as `test_auth.sh`, make executable with `chmod +x test_auth.sh`, and run `./test_auth.sh`

Happy testing! 🎉
