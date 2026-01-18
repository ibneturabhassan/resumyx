# Resumyx Deployment Guide

This guide will help you deploy Resumyx with the frontend on Vercel and backend on Render.

## Architecture Overview

```
Frontend (Vercel)  →  Backend API (Render)  →  Supabase Database
   React/Vite           FastAPI/Python          PostgreSQL
```

## Prerequisites

1. **Accounts**:
   - Vercel account (https://vercel.com)
   - Render account (https://render.com)
   - Supabase account (https://supabase.com)
   - GitHub account (for deployment)

2. **API Keys**:
   - Gemini API Key
   - Supabase credentials (URL and Service Role Key)

## Part 1: Deploy Backend to Render

### Step 1: Prepare Backend Environment

1. Create `backend/.env` file with your credentials:
```env
GEMINI_API_KEY=your_gemini_api_key
SUPABASE_URL=your_supabase_url
SUPABASE_SERVICE_KEY=your_supabase_service_role_key
CORS_ORIGINS=https://your-frontend-domain.vercel.app
ENVIRONMENT=production
PORT=8000
```

### Step 2: Push to GitHub

```bash
git add .
git commit -m "Prepare for deployment"
git push origin main
```

### Step 3: Deploy on Render

1. Go to [Render Dashboard](https://dashboard.render.com/)
2. Click "New +" → "Web Service"
3. Connect your GitHub repository
4. Configure the service:
   - **Name**: `resumyx-api`
   - **Root Directory**: `backend`
   - **Environment**: `Python 3`
   - **Build Command**: `pip install -r requirements.txt`
   - **Start Command**: `uvicorn app.main:app --host 0.0.0.0 --port $PORT`

5. Add Environment Variables:
   - `GEMINI_API_KEY`: Your Gemini API key
   - `SUPABASE_URL`: Your Supabase project URL
   - `SUPABASE_SERVICE_KEY`: Your Supabase service role key
   - `ENVIRONMENT`: `production`
   - `CORS_ORIGINS`: (Will update after deploying frontend)

6. Click "Create Web Service"
7. Wait for deployment to complete
8. Copy your service URL (e.g., `https://resumyx-api.onrender.com`)

### Step 4: Test Backend

```bash
curl https://resumyx-api.onrender.com/api/health
```

Should return: `{"status":"healthy","service":"resumyx-api"}`

## Part 2: Deploy Frontend to Vercel

### Step 1: Update Frontend Configuration

1. Update `.env.local` to `.env.production`:
```env
VITE_API_URL=https://resumyx-api.onrender.com/api
```

2. Create `.env.production` file:
```env
VITE_API_URL=https://resumyx-api.onrender.com/api
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### Step 2: Deploy on Vercel

#### Option A: Using Vercel CLI

```bash
# Install Vercel CLI
npm install -g vercel

# Login
vercel login

# Deploy
vercel --prod
```

#### Option B: Using Vercel Dashboard

1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Click "Add New..." → "Project"
3. Import your GitHub repository
4. Configure:
   - **Framework Preset**: Vite
   - **Root Directory**: `./` (leave as root)
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`

5. Add Environment Variables:
   - `VITE_API_URL`: `https://resumyx-api.onrender.com/api`
   - `VITE_SUPABASE_URL`: Your Supabase URL
   - `VITE_SUPABASE_ANON_KEY`: Your Supabase anon key

6. Click "Deploy"
7. Wait for deployment to complete
8. Copy your deployment URL (e.g., `https://resumyx.vercel.app`)

### Step 3: Update CORS Origins

1. Go back to Render Dashboard
2. Open your `resumyx-api` service
3. Go to "Environment"
4. Update `CORS_ORIGINS`:
   ```
   https://resumyx.vercel.app,https://www.yourdomain.com
   ```
5. Save changes (service will auto-redeploy)

## Part 3: Verify Deployment

### Test Frontend
1. Open `https://resumyx.vercel.app`
2. Should load without errors

### Test API Connection
1. Open browser console (F12)
2. Go to Diagnostics page
3. Click "Run Connection Test"
4. Should show successful connections to both Gemini and Supabase

### Test Full Flow
1. Create/edit profile
2. Use AI Resume Tailor
3. Generate cover letter
4. Export PDF
5. Verify data persists (refresh page)

## Troubleshooting

### Backend Issues

**Problem**: 500 Internal Server Error
- Check Render logs: Dashboard → Your Service → Logs
- Verify environment variables are set correctly
- Check Python dependencies in `requirements.txt`

**Problem**: CORS Error
- Ensure `CORS_ORIGINS` includes your Vercel domain
- Check frontend is making requests to correct API URL

**Problem**: Database connection fails
- Verify `SUPABASE_SERVICE_KEY` (not anon key!)
- Check Supabase project is active
- Verify table `resume_profiles` exists

### Frontend Issues

**Problem**: API requests fail
- Check `VITE_API_URL` points to Render service
- Open browser console for error messages
- Verify backend is running (check `/api/health`)

**Problem**: Build fails on Vercel
- Check build logs in Vercel dashboard
- Ensure all dependencies are in `package.json`
- Verify TypeScript has no errors locally

**Problem**: Environment variables not working
- In Vercel, go to Project Settings → Environment Variables
- Add variables without quotes
- Redeploy after adding variables

## Custom Domain Setup

### For Frontend (Vercel)
1. Vercel Dashboard → Your Project → Settings → Domains
2. Add your custom domain
3. Follow DNS configuration instructions

### For Backend (Render)
1. Render Dashboard → Your Service → Settings → Custom Domain
2. Add your custom domain
3. Follow DNS configuration instructions
4. Update `CORS_ORIGINS` to include new domain

## Monitoring & Maintenance

### Backend (Render)
- Free tier: Service sleeps after 15 min of inactivity
- Logs available in Dashboard → Logs
- Can set up health check pings to keep awake

### Frontend (Vercel)
- Automatic HTTPS
- Global CDN
- Analytics available in dashboard
- Automatic deployments on git push

### Database (Supabase)
- Monitor usage in Supabase Dashboard
- Free tier: 500MB database, 2GB bandwidth
- Regular backups recommended

## Environment Variables Summary

### Backend (.env on Render)
```
GEMINI_API_KEY=<your_key>
SUPABASE_URL=<your_url>
SUPABASE_SERVICE_KEY=<service_role_key>
CORS_ORIGINS=https://your-app.vercel.app
ENVIRONMENT=production
PORT=8000
```

### Frontend (.env.production on Vercel)
```
VITE_API_URL=https://your-api.onrender.com/api
VITE_SUPABASE_URL=<your_url>
VITE_SUPABASE_ANON_KEY=<anon_key>
```

## Cost Estimation

### Free Tier (All Services)
- **Vercel**: 100GB bandwidth/month
- **Render**: 750 hours/month (sleeps after 15min inactivity)
- **Supabase**: 500MB database, 2GB file storage
- **Total**: $0/month for personal use

### Paid Plans (Optional)
- **Vercel Pro**: $20/month - Custom domains, more bandwidth
- **Render Starter**: $7/month - Always-on service, no sleep
- **Supabase Pro**: $25/month - More storage and features

## Next Steps

1. Set up monitoring (e.g., UptimeRobot for backend)
2. Configure automatic backups for Supabase
3. Set up error tracking (e.g., Sentry)
4. Add Google Analytics or similar
5. Set up email notifications for errors

## Support

- Backend logs: Render Dashboard → Logs
- Frontend logs: Browser Console + Vercel Dashboard
- Database logs: Supabase Dashboard → Logs

For issues, check:
1. Service health endpoints
2. Environment variables
3. CORS configuration
4. API connectivity
