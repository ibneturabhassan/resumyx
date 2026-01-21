# Supabase Authentication Setup

## Step 1: Enable Email Auth

Supabase Auth is enabled by default. Configure it:

1. Go to **Supabase Dashboard** → Your Project
2. Navigate to **Authentication** → **Providers**
3. Ensure **Email** is enabled
4. Configure email settings (or use default)

## Step 2: Get JWT Secret

You'll need this for the backend to validate tokens:

1. Go to **Project Settings** → **API**
2. Scroll to **JWT Settings**
3. Copy the **JWT Secret** (it's a long string)
4. Add to `backend/.env`:
   ```env
   SUPABASE_JWT_SECRET=your_jwt_secret_here
   ```

## Step 3: Update Database Schema

Run this SQL in **SQL Editor** (Dashboard → SQL Editor):

```sql
-- Add auth_user_id column to resume_profiles
ALTER TABLE resume_profiles
ADD COLUMN IF NOT EXISTS auth_user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_auth_user_id ON resume_profiles(auth_user_id);

-- Make user_id nullable (for migration)
ALTER TABLE resume_profiles ALTER COLUMN user_id DROP NOT NULL;

-- Remove old RLS policy
DROP POLICY IF EXISTS "Allow all operations" ON resume_profiles;

-- Create new user-specific RLS policies
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

-- Allow users to insert their first profile (they might not have auth_user_id set yet)
CREATE POLICY "Users can create profiles for themselves"
ON resume_profiles FOR INSERT
WITH CHECK (auth.uid() IS NOT NULL);
```

## Step 4: Configure Auth Settings (Optional)

### Email Templates

1. Go to **Authentication** → **Email Templates**
2. Customize:
   - Confirmation email
   - Password reset email
   - Magic link email

### Auth Settings

1. Go to **Authentication** → **Settings**
2. Configure:
   - **Site URL**: Your frontend URL (e.g., `https://your-app.vercel.app`)
   - **Redirect URLs**: Add allowed redirect URLs
   - **JWT Expiry**: Default is 1 hour (good)
   - **Refresh Token Expiry**: Default is 30 days (good)

### Disable Email Confirmation (Development Only)

For faster development, you can disable email confirmation:

1. Go to **Authentication** → **Settings**
2. Under **Email Auth**, toggle **Enable email confirmations** to OFF
3. **IMPORTANT**: Re-enable in production!

## Step 5: Test Auth in Supabase Dashboard

Before implementing in app, test auth works:

1. Go to **Authentication** → **Users**
2. Click **Add user** → **Create new user**
3. Enter email and password
4. Click **Create user**
5. Verify user appears in the list

## Step 6: Verify RLS Policies

Test that RLS is working:

```sql
-- Test 1: Check if auth is enabled
SELECT * FROM auth.users LIMIT 1;

-- Test 2: Check if policies exist
SELECT * FROM pg_policies WHERE tablename = 'resume_profiles';

-- Test 3: Try to access as anonymous (should return nothing if RLS is working)
SET request.jwt.claim.sub = '';
SELECT * FROM resume_profiles;
```

## Environment Variables Summary

### Backend (`backend/.env`)

Add this new variable:

```env
# Existing variables
GEMINI_API_KEY=...
SUPABASE_URL=...
SUPABASE_SERVICE_KEY=...
CORS_ORIGINS=...
ENVIRONMENT=...
PORT=...

# New for auth
SUPABASE_JWT_SECRET=your_jwt_secret_from_dashboard
```

### Frontend (`.env.local`) - No changes needed

```env
VITE_API_URL=http://localhost:8000/api
```

The frontend will get auth tokens from the backend and include them in requests.

## Verification Checklist

- [ ] Email auth is enabled in Supabase
- [ ] JWT Secret copied to backend `.env`
- [ ] Database schema updated with `auth_user_id` column
- [ ] RLS policies created and enabled
- [ ] Old "Allow all" policy removed
- [ ] Test user created successfully
- [ ] Site URL configured in Auth settings

## Troubleshooting

### Issue: Can't create users
- Check if email auth is enabled
- Verify email domain isn't blocked
- Check Supabase logs for errors

### Issue: RLS blocks everything
- Verify policies are created correctly
- Check `auth.uid()` returns a valid UUID
- Test with SQL Editor using `SET request.jwt.claim.sub`

### Issue: JWT validation fails in backend
- Verify JWT Secret is correct (from API settings)
- Check no extra spaces in the secret
- Ensure Supabase project is active

## Next Steps

Once Supabase is configured:
1. Implement backend auth service
2. Create auth endpoints
3. Build frontend auth UI
4. Test the complete flow

Ready to proceed with backend implementation!
