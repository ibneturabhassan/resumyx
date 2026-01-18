# Resumyx Architecture

## Overview

Resumyx is a full-stack AI-powered resume builder with separated frontend and backend, designed for deployment on Vercel (frontend) and Render (backend) with Supabase as the database.

## System Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                         CLIENT BROWSER                          │
│                    (React + TypeScript + Vite)                  │
└────────────────────────────┬────────────────────────────────────┘
                             │
                             │ HTTPS
                             ▼
┌─────────────────────────────────────────────────────────────────┐
│                       VERCEL (Frontend)                         │
│  ┌────────────────────────────────────────────────────────────┐ │
│  │  - Static React App (SPA)                                  │ │
│  │  - Vite Build                                              │ │
│  │  - Global CDN                                              │ │
│  │  - Automatic HTTPS                                         │ │
│  └────────────────────────────────────────────────────────────┘ │
└────────────────────────────┬────────────────────────────────────┘
                             │
                             │ REST API
                             ▼
┌─────────────────────────────────────────────────────────────────┐
│                       RENDER (Backend)                          │
│  ┌────────────────────────────────────────────────────────────┐ │
│  │  FastAPI Server                                            │ │
│  │  ├── API Routes                                            │ │
│  │  ├── Gemini AI Service                                     │ │
│  │  ├── Supabase Service                                      │ │
│  │  └── CORS Middleware                                       │ │
│  └────────────────────────────────────────────────────────────┘ │
└─────────────┬───────────────────────────────┬───────────────────┘
              │                               │
              │ PostgreSQL                    │ HTTP
              ▼                               ▼
┌──────────────────────────────┐  ┌──────────────────────────────┐
│   SUPABASE (Database)        │  │   GEMINI AI API              │
│  - PostgreSQL                │  │  - Resume Generation         │
│  - Row Level Security        │  │  - Cover Letter Generation   │
│  - Realtime (optional)       │  │  - ATS Scoring               │
└──────────────────────────────┘  └──────────────────────────────┘
```

## Technology Stack

### Frontend
- **Framework**: React 19 with TypeScript
- **Build Tool**: Vite
- **UI**: Tailwind CSS
- **PDF Generation**: jsPDF + html2canvas
- **State Management**: React Hooks
- **Hosting**: Vercel

### Backend
- **Framework**: FastAPI (Python 3.11+)
- **API Docs**: Auto-generated Swagger UI
- **ASGI Server**: Uvicorn
- **Hosting**: Render

### Database
- **Provider**: Supabase
- **Database**: PostgreSQL
- **Features**: RLS, Realtime capabilities

### AI
- **Provider**: Google Gemini
- **Model**: gemini-2.0-flash-exp
- **Use Cases**: Resume tailoring, cover letters, ATS scoring

## Directory Structure

```
resumyx/
├── frontend (root)
│   ├── src/
│   │   ├── components/          # React components
│   │   ├── services/
│   │   │   ├── apiService.ts    # Backend API calls
│   │   │   ├── geminiService.ts # (Legacy - to be removed)
│   │   │   └── supabaseService.ts # (Legacy - to be removed)
│   │   ├── types.ts             # TypeScript types
│   │   └── App.tsx              # Main application
│   ├── public/                  # Static assets
│   ├── index.html
│   ├── package.json
│   └── vite.config.ts
│
└── backend/
    ├── app/
    │   ├── api/
    │   │   └── routes.py        # API endpoints
    │   ├── core/
    │   │   └── config.py        # Configuration
    │   ├── models/
    │   │   └── resume.py        # Pydantic models
    │   ├── services/
    │   │   ├── gemini_service.py    # AI operations
    │   │   └── supabase_service.py  # Database operations
    │   └── main.py              # FastAPI app
    ├── requirements.txt
    ├── .env.example
    └── README.md
```

## Data Flow

### 1. User Profile Management

```
User → Frontend → Backend API → Supabase
                     ↓
               Profile saved
                     ↓
Frontend ← Success ← Backend
```

### 2. AI Resume Tailoring

```
User submits JD → Frontend → Backend API
                                ↓
                          Parse request
                                ↓
                          Call Gemini AI
                                ↓
                    Generate tailored sections
                                ↓
                          Return result
                                ↓
Frontend ← Display ← Backend
     ↓
Save to Supabase
```

### 3. Cover Letter Generation

```
User → Frontend → Backend API → Gemini AI
                                    ↓
                              Generate letter
                                    ↓
Frontend ← Letter text ← Backend
     ↓
Display in editor
```

## API Endpoints

### Profile Management
- `GET /api/profile/{user_id}` - Retrieve user profile
- `POST /api/profile` - Save/update profile
- `DELETE /api/profile/{user_id}` - Delete profile

### AI Operations
- `POST /api/ai/generate-summary` - Generate professional summary
- `POST /api/ai/tailor-resume` - Tailor entire resume for job
- `POST /api/ai/ats-score` - Calculate ATS compatibility
- `POST /api/ai/generate-cover-letter` - Generate personalized letter

### System
- `GET /api/health` - Health check endpoint
- `GET /docs` - Swagger UI documentation
- `GET /redoc` - ReDoc documentation

## Database Schema

### Table: `resume_profiles`

| Column | Type | Description |
|--------|------|-------------|
| id | UUID | Primary key (auto-generated) |
| user_id | TEXT | User identifier (unique) |
| profile_data | JSONB | Resume data in JSON format |
| target_jd | TEXT | Target job description |
| created_at | TIMESTAMP | Creation timestamp |
| updated_at | TIMESTAMP | Last update timestamp |

### Indexes
- `idx_user_id` on `user_id` for fast lookups

### Row Level Security
- Currently: Allow all operations
- Production: Should implement user-based policies

## Security

### Frontend
- Environment variables prefixed with `VITE_`
- HTTPS only in production (Vercel)
- Client-side input validation

### Backend
- CORS configuration for allowed origins
- Pydantic validation for all inputs
- Service key for Supabase (not exposed to frontend)
- Environment-based configuration
- No sensitive data in logs

### Database
- Row Level Security (RLS) enabled
- Service key authentication
- Encrypted connections

## Performance Considerations

### Frontend
- Code splitting with Vite
- Lazy loading components
- Optimized PDF generation
- Debounced auto-save

### Backend
- Async/await for non-blocking I/O
- Connection pooling (Supabase)
- Efficient JSON parsing
- Streaming responses for large data

### AI Operations
- Optimized prompts for faster responses
- Error handling with fallbacks
- Rate limiting considerations

## Deployment

### Development
```bash
# Frontend
npm run dev           # http://localhost:5173

# Backend
cd backend
uvicorn app.main:app --reload  # http://localhost:8000
```

### Production

#### Frontend (Vercel)
- Auto-deploy on git push
- Environment variables in Vercel dashboard
- Global CDN distribution
- Automatic HTTPS

#### Backend (Render)
- Deploy from GitHub
- Environment variables in Render dashboard
- Auto-scaling
- Health checks

## Environment Variables

### Frontend (.env.local / .env.production)
```env
VITE_API_URL=http://localhost:8000/api  # Backend URL
VITE_SUPABASE_URL=...                   # Supabase project URL
VITE_SUPABASE_ANON_KEY=...              # Supabase anon key
```

### Backend (.env)
```env
GEMINI_API_KEY=...          # Google Gemini API key
SUPABASE_URL=...            # Supabase project URL
SUPABASE_SERVICE_KEY=...    # Supabase service role key
CORS_ORIGINS=...            # Allowed frontend origins
ENVIRONMENT=development     # development | production
PORT=8000                   # Server port
```

## Monitoring & Logging

### Frontend
- Browser console for client errors
- Vercel Analytics
- Error boundaries for React

### Backend
- Uvicorn access logs
- Python logging module
- Render logs dashboard
- API endpoint metrics

### Database
- Supabase Dashboard
- Query performance monitoring
- Connection pool stats

## Scalability

### Current Limits (Free Tier)
- Vercel: 100GB bandwidth/month
- Render: 750 hours/month (sleeps after 15min)
- Supabase: 500MB database, 2GB storage
- Gemini: API quota limits

### Scaling Strategy
1. Upgrade Render to paid plan (no sleep)
2. Implement caching layer (Redis)
3. Add rate limiting
4. Optimize database queries
5. Implement CDN for assets

## Future Enhancements

### Backend
- [ ] Add authentication (JWT)
- [ ] Implement rate limiting
- [ ] Add Redis caching
- [ ] WebSocket support for realtime
- [ ] Background job queue (Celery)
- [ ] Email notifications
- [ ] Analytics endpoints

### Frontend
- [ ] Offline mode with service workers
- [ ] Multiple resume templates
- [ ] Drag-and-drop section reordering
- [ ] Real-time collaboration
- [ ] Import from LinkedIn
- [ ] Export to multiple formats

### Database
- [ ] Add version history table
- [ ] Implement soft deletes
- [ ] Add analytics table
- [ ] User preferences table

## Migration from Old Architecture

### Before
```
Frontend → Direct Gemini API calls
        → Direct Supabase calls
```

### After
```
Frontend → Backend API → Gemini AI
                      → Supabase DB
```

### Benefits
1. **Security**: API keys hidden in backend
2. **Control**: Rate limiting, validation
3. **Flexibility**: Easy to switch AI providers
4. **Monitoring**: Centralized logging
5. **Performance**: Server-side caching
6. **Cost**: Better quota management

## Testing

### Frontend
```bash
npm run test        # Unit tests
npm run build       # Production build test
```

### Backend
```bash
pytest              # Run tests
pytest --cov        # Coverage report
```

### Integration
```bash
# Start both services
cd backend && uvicorn app.main:app &
cd .. && npm run dev

# Test full flow
curl http://localhost:8000/api/health
```

## Troubleshooting

See [DEPLOYMENT_GUIDE.md](DEPLOYMENT_GUIDE.md) for common issues and solutions.

## Documentation

- [Backend README](backend/README.md) - Backend setup and API docs
- [Deployment Guide](DEPLOYMENT_GUIDE.md) - Production deployment
- [Supabase Setup](SUPABASE_SETUP.md) - Database configuration

## Support

For issues or questions:
1. Check documentation
2. Review logs (Frontend: browser console, Backend: Render logs)
3. Test API endpoints in Swagger UI
4. Verify environment variables
