# Supabase Setup Guide for Resumyx

This guide will help you set up Supabase to store and sync your resume data in the cloud.

## Why Use Supabase?

- **Cloud Storage**: Your resume data is stored in the cloud and accessible from any device
- **Automatic Sync**: Changes are automatically synced to the database
- **Backup**: Your data is safely backed up in Supabase
- **Free Tier**: Supabase offers a generous free tier for personal projects

## Setup Steps

### 1. Create a Supabase Account

1. Go to [https://supabase.com](https://supabase.com)
2. Click "Start your project" and sign up with GitHub or email
3. Create a new project:
   - Give it a name (e.g., "resumyx")
   - Choose a database password (save this!)
   - Select a region close to you
   - Click "Create new project"
4. Wait a few minutes for the project to be created

### 2. Create the Database Table

1. In your Supabase project dashboard, go to the **SQL Editor** (left sidebar)
2. Click "+ New query"
3. Copy and paste this SQL code:

```sql
-- Create the resume profiles table
CREATE TABLE IF NOT EXISTS resume_profiles (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id TEXT NOT NULL UNIQUE,
  profile_data JSONB NOT NULL,
  target_jd TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index for faster lookups
CREATE INDEX idx_user_id ON resume_profiles(user_id);

-- Enable Row Level Security (RLS)
ALTER TABLE resume_profiles ENABLE ROW LEVEL SECURITY;

-- Create a policy that allows all operations for now
-- In production, you'd want proper authentication
CREATE POLICY "Allow all operations"
ON resume_profiles
FOR ALL
USING (true)
WITH CHECK (true);
```

4. Click "Run" to execute the SQL
5. You should see a success message

### 3. Get Your API Keys

1. In your Supabase project, go to **Settings** (gear icon in left sidebar)
2. Click on **API** in the settings menu
3. You'll see two important values:
   - **Project URL**: Starts with `https://` and ends with `.supabase.co`
   - **anon public** key: A long string starting with `eyJ...`

### 4. Configure Your Local Environment

1. Open the `.env.local` file in your Resumyx project folder
2. Replace the placeholder values with your actual keys:

```env
GEMINI_API_KEY=your_existing_gemini_key

# Supabase Configuration
VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

3. Save the file

### 5. Restart Your Development Server

1. Stop your current dev server (Ctrl+C in terminal)
2. Start it again:
   ```bash
   npm run dev
   ```

3. Open the app in your browser

## Verification

Once set up, you should see:

- A "Synced" indicator with a green cloud icon in the top-right of the app
- When you make changes, it briefly shows "Syncing..." then "Synced"
- Your data is now being saved to Supabase!

## Testing Your Setup

1. Make a change to your profile (e.g., update your name)
2. Check the "Synced" indicator appears
3. Go to your Supabase dashboard → **Table Editor** → `resume_profiles`
4. You should see your data stored in the table!

## Troubleshooting

### "Synced" indicator doesn't appear
- Make sure you've added the correct URL and Anon Key to `.env.local`
- Check that the values don't have quotes around them
- Restart your dev server after updating `.env.local`

### "Table doesn't exist" error
- Make sure you ran the SQL script in the SQL Editor
- Check that the table name is exactly `resume_profiles`

### Data not saving
- Open browser console (F12) and check for errors
- Make sure your Supabase project is active (not paused)
- Verify the RLS policy was created correctly

## Data Migration

When you first set up Supabase with existing localStorage data:
- The app will automatically migrate your existing data from localStorage to Supabase
- Your data remains in localStorage as a backup
- Future changes sync to both localStorage and Supabase

## Security Note

The current setup uses a permissive RLS policy for simplicity. In a production environment, you should:
- Implement proper user authentication (e.g., with Supabase Auth)
- Update RLS policies to restrict access based on authenticated users
- Never commit your `.env.local` file to version control

## Need Help?

- Supabase Documentation: [https://supabase.com/docs](https://supabase.com/docs)
- Supabase Discord: [https://discord.supabase.com](https://discord.supabase.com)
