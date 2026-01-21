# Resumyx Documentation

## Quick Links
- [Deployment Guide](./DEPLOYMENT.md)
- [Authentication Setup](./AUTHENTICATION.md)
- [Architecture Overview](./ARCHITECTURE.md)

## Getting Started

### Local Development

1. **Install Dependencies**
   ```bash
   npm install
   cd backend && pip install -r requirements.txt
   ```

2. **Configure Environment**
   - Copy `.env.example` to `.env.local` for frontend
   - Copy `backend/.env.example` to `backend/.env`
   - Add your API keys

3. **Run Development Servers**
   ```bash
   # Frontend
   npm run dev

   # Backend
   cd backend
   uvicorn app.main:app --reload
   ```

## Project Structure

```
resumyx/
├── src/                    # Frontend source code
│   ├── components/        # React components
│   ├── contexts/          # React contexts (auth, etc.)
│   ├── services/          # API services
│   ├── types/             # TypeScript type definitions
│   ├── App.tsx           # Main app component
│   └── index.tsx         # Entry point
├── backend/               # Python FastAPI backend
│   ├── app/
│   │   ├── api/          # API routes
│   │   ├── core/         # Core config
│   │   ├── models/       # Pydantic models
│   │   └── services/     # Business logic
│   └── run.py            # Entry point
├── docs/                  # Documentation
└── dist/                  # Build output
```

## Features

- **AI-Powered Resume Tailoring**: Customize resumes for specific job descriptions
- **Cover Letter Generation**: Generate personalized cover letters
- **ATS Score Analysis**: Check resume compatibility with ATS systems
- **User Authentication**: Secure login with Supabase
- **Profile Management**: Save and manage multiple resume profiles

## Tech Stack

- **Frontend**: React, TypeScript, Vite, TailwindCSS
- **Backend**: Python, FastAPI, Google Gemini AI
- **Database**: Supabase (PostgreSQL)
- **Deployment**: Vercel (Frontend), Render (Backend)
