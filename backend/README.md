# Resumyx Backend API

FastAPI-based backend for Resumyx resume builder application.

## Features

- 🚀 **FastAPI** - Modern, fast Python web framework
- 🤖 **Gemini AI Integration** - AI-powered resume optimization
- 💾 **Supabase** - PostgreSQL database for data persistence
- 🔒 **CORS Enabled** - Secure cross-origin requests
- 📝 **Auto-generated API Docs** - Swagger UI at `/docs`

## Project Structure

```
backend/
├── app/
│   ├── api/
│   │   └── routes.py          # API endpoints
│   ├── core/
│   │   └── config.py          # Configuration settings
│   ├── models/
│   │   └── resume.py          # Pydantic models
│   ├── services/
│   │   ├── gemini_service.py  # Gemini AI integration
│   │   └── supabase_service.py # Database operations
│   └── main.py                # FastAPI application
├── requirements.txt           # Python dependencies
├── .env.example              # Environment variables template
└── README.md                 # This file
```

## Local Development Setup

### Prerequisites

- Python 3.11 or higher
- pip (Python package manager)
- Gemini API key
- Supabase project

### Installation

1. Navigate to backend directory:
```bash
cd backend
```

2. Create virtual environment:
```bash
python -m venv venv

# Activate on Windows
venv\Scripts\activate

# Activate on Mac/Linux
source venv/bin/activate
```

3. Install dependencies:
```bash
pip install -r requirements.txt
```

4. Create `.env` file:
```bash
cp .env.example .env
```

5. Update `.env` with your credentials:
```env
GEMINI_API_KEY=your_gemini_api_key_here
SUPABASE_URL=your_supabase_project_url
SUPABASE_SERVICE_KEY=your_supabase_service_role_key
CORS_ORIGINS=http://localhost:5173,http://localhost:3000
ENVIRONMENT=development
PORT=8000
```

### Running the Server

```bash
# Development mode with auto-reload
uvicorn app.main:app --reload --port 8000

# Or using Python
python -m app.main
```

Server will start at: `http://localhost:8000`

## API Documentation

Once the server is running, visit:

- **Swagger UI**: http://localhost:8000/docs
- **ReDoc**: http://localhost:8000/redoc

## API Endpoints

### Health Check
```
GET /api/health
```

### Profile Management
```
GET    /api/profile/{user_id}     - Get user profile
POST   /api/profile               - Save/update profile
DELETE /api/profile/{user_id}     - Delete profile
```

### AI Operations
```
POST /api/ai/generate-summary      - Generate summary from experience
POST /api/ai/tailor-resume         - Tailor resume for job description
POST /api/ai/ats-score            - Calculate ATS compatibility score
POST /api/ai/generate-cover-letter - Generate personalized cover letter
```

## Testing the API

### Using curl

```bash
# Health check
curl http://localhost:8000/api/health

# Generate summary
curl -X POST http://localhost:8000/api/ai/generate-summary \
  -H "Content-Type: application/json" \
  -d '{"experience": "Senior Developer at Tech Corp..."}'

# Get profile
curl http://localhost:8000/api/profile/user_123
```

### Using Python

```python
import requests

# Health check
response = requests.get("http://localhost:8000/api/health")
print(response.json())

# Generate summary
response = requests.post(
    "http://localhost:8000/api/ai/generate-summary",
    json={"experience": "5 years as software engineer..."}
)
print(response.json())
```

## Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `GEMINI_API_KEY` | Google Gemini API key | Yes |
| `SUPABASE_URL` | Supabase project URL | Yes |
| `SUPABASE_SERVICE_KEY` | Supabase service role key | Yes |
| `CORS_ORIGINS` | Allowed origins (comma-separated) | Yes |
| `ENVIRONMENT` | development/production | No (default: development) |
| `PORT` | Server port | No (default: 8000) |

## Database Setup

Ensure you have created the `resume_profiles` table in Supabase:

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

## Common Issues

### Import Errors
**Problem**: `ModuleNotFoundError`
**Solution**: Ensure virtual environment is activated and all dependencies installed

### CORS Errors
**Problem**: Frontend can't connect
**Solution**: Add frontend URL to `CORS_ORIGINS` in `.env`

### Database Connection Fails
**Problem**: Can't connect to Supabase
**Solution**:
- Verify `SUPABASE_SERVICE_KEY` (not anon key!)
- Check Supabase project is active
- Ensure table exists

### Gemini API Errors
**Problem**: AI operations fail
**Solution**:
- Verify `GEMINI_API_KEY` is valid
- Check API quota/limits
- Ensure model name is correct

## Development Tips

### Auto-reload
Server automatically reloads on code changes in development mode.

### Logging
Add logging for debugging:
```python
import logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

logger.info("Processing request...")
```

### Testing with Frontend
1. Start backend: `uvicorn app.main:app --reload`
2. Start frontend: `npm run dev` (in root directory)
3. Frontend will connect to `http://localhost:8000/api`

## Deployment

See [DEPLOYMENT_GUIDE.md](../DEPLOYMENT_GUIDE.md) for production deployment instructions.

### Quick Deploy to Render

1. Push code to GitHub
2. Connect repository on Render
3. Set root directory to `backend`
4. Add environment variables
5. Deploy!

## Performance

- Uses async/await for non-blocking operations
- Efficient Pydantic validation
- Connection pooling for database
- Optimized Gemini API calls

## Security

- CORS protection
- Input validation with Pydantic
- Environment-based configuration
- Service key (not anon key) for Supabase

## Contributing

1. Create feature branch
2. Make changes
3. Test locally
4. Submit pull request

## Support

For issues:
1. Check logs
2. Verify environment variables
3. Test endpoints in Swagger UI
4. Check database connection

## License

MIT License - See LICENSE file for details
