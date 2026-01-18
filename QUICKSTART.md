# Quick Start Guide

Get Resumyx running on your local machine in 5 minutes.

## Prerequisites

- Node.js 18+ and npm
- Python 3.11+
- Git

## Step 1: Clone and Install

```bash
# Clone the repository (if not already done)
git clone <your-repo-url>
cd resumyx

# Install frontend dependencies
npm install

# Install backend dependencies
cd backend
pip install -r requirements.txt
cd ..
```

## Step 2: Configure Environment

### Frontend Configuration

Create `.env.local` in the root directory:

```env
VITE_API_URL=http://localhost:8000/api
```

### Backend Configuration

Create `backend/.env`:

```env
# API Configuration
PORT=8000
ENVIRONMENT=development

# Get your Gemini API key from: https://makersuite.google.com/app/apikey
GEMINI_API_KEY=your_gemini_api_key_here

# Get from Supabase project settings
SUPABASE_URL=your_supabase_url
SUPABASE_SERVICE_KEY=your_supabase_service_role_key

# Allow frontend to connect
CORS_ORIGINS=http://localhost:5173,http://localhost:3000
```

**Important:** Use the **Service Role Key** for `SUPABASE_SERVICE_KEY`, not the anon key!

## Step 3: Set Up Database

1. Go to [Supabase](https://supabase.com) and create a new project
2. Go to SQL Editor and run:

```sql
CREATE TABLE IF NOT EXISTS resume_profiles (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id TEXT NOT NULL UNIQUE,
  profile_data JSONB NOT NULL,
  target_jd TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_user_id ON resume_profiles(user_id);

ALTER TABLE resume_profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow all operations"
ON resume_profiles
FOR ALL
USING (true)
WITH CHECK (true);
```

3. Get your credentials:
   - **URL**: Project Settings → API → Project URL
   - **Service Key**: Project Settings → API → `service_role` key

## Step 4: Start the Application

Open two terminal windows:

### Terminal 1: Start Backend

```bash
cd backend
uvicorn app.main:app --reload --port 8000
```

You should see:
```
INFO:     Uvicorn running on http://127.0.0.1:8000
```

### Terminal 2: Start Frontend

```bash
npm run dev
```

You should see:
```
➜  Local:   http://localhost:5173/
```

## Step 5: Test the Application

1. Open http://localhost:5173 in your browser
2. Go to the **System** (gear icon) page
3. Click "Run Connection Test"
4. You should see: ✅ Backend API connection successful

## Usage

### Edit Your Profile
1. Click the **Profile** (user icon) tab
2. Fill in your personal information, experience, skills, etc.
3. Data auto-saves to the database

### Tailor Your Resume
1. Click the **Tailor** (wand icon) tab
2. Paste a job description
3. Click "Optimize Resume"
4. Watch as AI tailors your resume for that specific job

### Generate Cover Letter
1. Click the **Letter** (document icon) tab
2. Add any special instructions (optional)
3. Click "Generate Cover Letter"
4. AI creates a personalized cover letter

### Export PDF
1. Click "Export PDF" button in the preview panel
2. Get a professional PDF of your resume or cover letter

## Troubleshooting

### Backend won't start
- **Python version**: Make sure you have Python 3.11+
  ```bash
  python --version
  ```
- **Dependencies**: Reinstall requirements
  ```bash
  cd backend
  pip install --upgrade -r requirements.txt
  ```

### Frontend can't connect to backend
- Check backend is running on http://localhost:8000
- Check `.env.local` has correct `VITE_API_URL`
- Check browser console (F12) for errors

### Database connection fails
- Verify Supabase credentials in `backend/.env`
- Make sure you used **Service Role Key** (not anon key)
- Check table `resume_profiles` exists in Supabase

### Gemini API errors
- Verify API key: https://makersuite.google.com/app/apikey
- Check API quota/limits
- Ensure model name is correct in backend code

## API Documentation

Once backend is running, visit:
- **Swagger UI**: http://localhost:8000/docs
- **ReDoc**: http://localhost:8000/redoc

## Architecture

```
┌─────────────┐      HTTP       ┌─────────────┐      ┌──────────┐
│   Browser   │ ←────────────→  │   FastAPI   │ ←──→ │ Supabase │
│ (Frontend)  │   REST API      │  (Backend)  │      │   (DB)   │
└─────────────┘                 └─────────────┘      └──────────┘
                                       ↓
                                  ┌─────────┐
                                  │ Gemini  │
                                  │   AI    │
                                  └─────────┘
```

## Project Structure

```
resumyx/
├── src/                    # Frontend React code
│   ├── components/         # UI components
│   └── services/           # API service
├── backend/               # FastAPI backend
│   └── app/
│       ├── api/          # API routes
│       ├── services/     # AI & DB services
│       └── models/       # Data models
├── .env.local            # Frontend config
└── backend/.env          # Backend config
```

## Need Help?

- **Architecture**: See [ARCHITECTURE.md](ARCHITECTURE.md)
- **Deployment**: See [DEPLOYMENT_GUIDE.md](DEPLOYMENT_GUIDE.md)
- **Backend API**: See [backend/README.md](backend/README.md)
- **Database**: See [SUPABASE_SETUP.md](SUPABASE_SETUP.md)

## Next Steps

1. ✅ Application running locally
2. 📝 Customize your profile
3. 🤖 Try AI features
4. 🚀 Deploy to production (Vercel + Render)

Happy resume building! 🎉
