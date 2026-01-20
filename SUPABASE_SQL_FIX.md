# Supabase SQL Script - Safe Version

## Run this script in Supabase SQL Editor

This version safely handles existing policies and columns.

```sql
-- Add auth_user_id column if it doesn't exist
ALTER TABLE resume_profiles
ADD COLUMN IF NOT EXISTS auth_user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;

-- Create index if it doesn't exist
CREATE INDEX IF NOT EXISTS idx_auth_user_id ON resume_profiles(auth_user_id);

-- Make old user_id nullable (if it exists and is NOT NULL)
DO $$
BEGIN
    ALTER TABLE resume_profiles ALTER COLUMN user_id DROP NOT NULL;
EXCEPTION
    WHEN OTHERS THEN NULL;
END $$;

-- Drop all existing policies
DROP POLICY IF EXISTS "Allow all operations" ON resume_profiles;
DROP POLICY IF EXISTS "Users can view own profiles" ON resume_profiles;
DROP POLICY IF EXISTS "Users can insert own profiles" ON resume_profiles;
DROP POLICY IF EXISTS "Users can update own profiles" ON resume_profiles;
DROP POLICY IF EXISTS "Users can delete own profiles" ON resume_profiles;

-- Create RLS policies
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

## Expected Result

You should see: **"Success. No rows returned"**

## What This Does

1. ✅ Adds `auth_user_id` column (safely, only if missing)
2. ✅ Creates index for faster queries
3. ✅ Makes `user_id` nullable (to allow transition to `auth_user_id`)
4. ✅ Drops ALL existing policies (including duplicates)
5. ✅ Creates fresh RLS policies for data isolation

## Verify Policies Were Created

After running the script, verify in Supabase:

1. Go to **Database** → **Tables** → **resume_profiles**
2. Click **Policies** tab
3. Should see 4 policies:
   - Users can view own profiles
   - Users can insert own profiles
   - Users can update own profiles
   - Users can delete own profiles

## Next Steps

Once this script runs successfully:
1. ✅ Policies are set up
2. Continue with Vercel deployment
3. Test authentication in production
