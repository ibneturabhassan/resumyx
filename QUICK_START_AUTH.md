# Quick Start - Authentication Testing

## Prerequisites Checklist

Before testing authentication locally, complete these steps:

### ✅ 1. Backend Dependencies (COMPLETE)
The required authentication packages have been installed:
- pyjwt==2.9.0
- python-jose[cryptography]==3.3.0
- email-validator==2.2.0

### ⚠️ 2. Get JWT Secret from Supabase (ACTION REQUIRED)

You need to add your Supabase JWT Secret to [backend/.env](backend/.env):

**Steps:**
1. Go to [Supabase Dashboard](https://supabase.com/dashboard)
2. Select your project: `mgacdlloatifvbxotprr`
3. Go to: **Project Settings** → **API** → **JWT Settings**
4. Copy the **JWT Secret** (long string starting with uppercase letters)
5. Open [backend/.env](backend/.env)
6. Replace `your_jwt_secret_here` with the actual JWT secret:
   ```env
   SUPABASE_JWT_SECRET=your_actual_jwt_secret_from_dashboard
   ```

### 3. Run Supabase SQL Script (ACTION REQUIRED)

You need to set up the database schema for authentication:

**Steps:**
1. Go to [Supabase Dashboard](https://supabase.com/dashboard) → SQL Editor
2. Copy and paste this SQL script:

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

3. Click **Run** to execute the script
4. Verify success (should see "Success. No rows returned")

### 4. Enable Supabase Auth (VERIFY)

Make sure Supabase Auth is enabled:

**Steps:**
1. Go to [Supabase Dashboard](https://supabase.com/dashboard) → **Authentication** → **Providers**
2. Verify **Email** provider is **Enabled**
3. **Optional:** Disable email confirmation for testing:
   - Go to **Authentication** → **Email Templates**
   - Uncheck "Confirm email" (you can re-enable later)
   - This allows instant login after registration

## Starting the Application

Once the above steps are complete:

### Start Backend
```bash
cd backend
uvicorn app.main:app --reload
```

Backend will run at: http://localhost:8000
API Docs available at: http://localhost:8000/docs

### Start Frontend
```bash
npm run dev
```

Frontend will run at: http://localhost:5173

## Testing Authentication

Once both servers are running, follow [AUTH_TESTING_GUIDE.md](AUTH_TESTING_GUIDE.md) for comprehensive testing instructions.

### Quick Test:
1. Visit http://localhost:5173
2. Should see login page
3. Click "Create one" → Register
4. Enter:
   - Email: test@example.com
   - Password: test123456
   - Confirm password: test123456
5. Click "Create Account"
6. Should automatically login and see main app
7. Try using features (AI Resume Tailor, etc.)
8. Click logout button → Should return to login page
9. Login again with same credentials → Should work

## Troubleshooting

### Issue: Can't start backend
- Check that JWT secret is added to `.env`
- Check that all dependencies are installed
- Look for error in terminal

### Issue: Can't login
- Check backend terminal for errors
- Verify Supabase Auth is enabled
- Check that SQL script ran successfully
- Verify JWT secret matches Supabase dashboard

### Issue: 401 errors
- Check that access_token exists in localStorage (DevTools → Application)
- Check Authorization header in Network tab (DevTools)
- Verify backend is running

## Next Steps

After testing locally:
1. Update backend profile endpoints to use `auth_user_id`
2. Deploy to production (Render + Vercel)
3. Test production authentication flow

## Support

- [AUTH_COMPLETE_SUMMARY.md](AUTH_COMPLETE_SUMMARY.md) - Complete overview
- [AUTH_TESTING_GUIDE.md](AUTH_TESTING_GUIDE.md) - Detailed testing instructions
- [SUPABASE_AUTH_SETUP.md](SUPABASE_AUTH_SETUP.md) - Database setup details
- [backend/AUTH_API_DOCS.md](backend/AUTH_API_DOCS.md) - API documentation
