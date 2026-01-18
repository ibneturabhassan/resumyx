<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

# Resumyx - AI-Powered Resume Builder

A full-stack AI-powered resume builder with React frontend and FastAPI backend, designed for deployment on Vercel and Render with Supabase database.

## 🚀 Quick Start

Get up and running in 5 minutes - see [QUICKSTART.md](QUICKSTART.md)

## 🏗️ Architecture

```
Frontend (Vercel)  →  Backend API (Render)  →  Supabase Database
  React + Vite          FastAPI + Python          PostgreSQL
```

- **Frontend**: React 19 + TypeScript + Tailwind CSS
- **Backend**: FastAPI (Python 3.11+) with async operations
- **Database**: Supabase (PostgreSQL)
- **AI**: Google Gemini 2.0 Flash

See [ARCHITECTURE.md](ARCHITECTURE.md) for detailed system design.

## ✨ Features

- 🤖 **AI-Powered Resume Tailoring** - Optimize your resume for any job description using Gemini AI
- 📝 **Smart Cover Letter Generator** - Create personalized cover letters with AI
- 💾 **Cloud Storage** - Automatic sync with Supabase database
- 📄 **Professional PDF Export** - Download ATS-friendly PDF resumes
- 🎯 **ATS Compatibility Score** - Get real-time scoring and feedback
- 💼 **Clean Templates** - Professional, ATS-optimized designs
- 🔒 **Secure Architecture** - API keys and credentials hidden in backend

## 🛠️ Local Development

### Prerequisites

- Node.js 18+
- Python 3.11+
- Gemini API key ([Get one here](https://makersuite.google.com/app/apikey))
- Supabase account ([Sign up](https://supabase.com))

### Setup

1. **Install dependencies:**
   ```bash
   # Frontend
   npm install

   # Backend
   cd backend
   pip install -r requirements.txt
   cd ..
   ```

2. **Configure environment:**

   Create `.env.local` in root:
   ```env
   VITE_API_URL=http://localhost:8000/api
   ```

   Create `backend/.env`:
   ```env
   GEMINI_API_KEY=your_gemini_api_key
   SUPABASE_URL=your_supabase_url
   SUPABASE_SERVICE_KEY=your_supabase_service_key
   CORS_ORIGINS=http://localhost:5173
   ENVIRONMENT=development
   PORT=8000
   ```

3. **Set up database:**

   Run the SQL script in [SUPABASE_SETUP.md](SUPABASE_SETUP.md) to create tables.

4. **Start the application:**

   Terminal 1 - Backend:
   ```bash
   cd backend
   uvicorn app.main:app --reload
   ```

   Terminal 2 - Frontend:
   ```bash
   npm run dev
   ```

5. **Open** http://localhost:5173

## 📚 Documentation

- [QUICKSTART.md](QUICKSTART.md) - Get running in 5 minutes
- [ARCHITECTURE.md](ARCHITECTURE.md) - Complete system architecture
- [DEPLOYMENT_GUIDE.md](DEPLOYMENT_GUIDE.md) - Deploy to production (Vercel + Render)
- [SUPABASE_SETUP.md](SUPABASE_SETUP.md) - Database configuration
- [backend/README.md](backend/README.md) - Backend API documentation
- [FRONTEND_MIGRATION.md](FRONTEND_MIGRATION.md) - Frontend migration details

## 🚀 Deployment

### Production Stack

- **Frontend**: Vercel (automatic deployments from Git)
- **Backend**: Render (free tier available)
- **Database**: Supabase (free tier: 500MB)

See [DEPLOYMENT_GUIDE.md](DEPLOYMENT_GUIDE.md) for step-by-step production deployment.

## 🔧 Tech Stack

### Frontend
- React 19 with TypeScript
- Vite for fast builds
- Tailwind CSS for styling
- jsPDF + html2canvas for PDF export
- Fetch API for backend communication

### Backend
- FastAPI with async/await
- Pydantic for data validation
- Google Gemini AI (gemini-2.0-flash-exp)
- Supabase client for database
- Uvicorn ASGI server

### Database
- Supabase (PostgreSQL)
- Row Level Security (RLS)
- JSONB for flexible resume data storage

## 📁 Project Structure

```
resumyx/
├── src/                    # Frontend React application
│   ├── components/         # UI components
│   ├── services/           # API service layer
│   └── types.ts            # TypeScript definitions
├── backend/               # FastAPI backend
│   └── app/
│       ├── api/          # API endpoints
│       ├── services/     # AI & database services
│       ├── models/       # Pydantic models
│       └── core/         # Configuration
├── .env.local            # Frontend environment
├── backend/.env          # Backend environment
└── docs/                 # Documentation
```

## 🧪 Testing

### Test Backend
```bash
cd backend
pytest
```

### Test Frontend
```bash
npm run test
```

### Test API Endpoints
Visit http://localhost:8000/docs for interactive Swagger UI

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test locally
5. Submit a pull request

## 📄 License

MIT License - See LICENSE file for details

## 🆘 Support

- Check [QUICKSTART.md](QUICKSTART.md) for setup help
- See [ARCHITECTURE.md](ARCHITECTURE.md) for system design
- Review [DEPLOYMENT_GUIDE.md](DEPLOYMENT_GUIDE.md) for deployment issues
- Check backend logs: `backend/` directory
- Check frontend console: Browser DevTools (F12)

## 🎯 Roadmap

- [ ] Authentication (JWT)
- [ ] Multiple resume templates
- [ ] Real-time collaboration
- [ ] Export to Word format
- [ ] LinkedIn import
- [ ] Resume analytics

---

Built with ❤️ using React, FastAPI, and Gemini AI
