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
   - **Start Command**: `bash start.sh`

   **Important**: Use `bash start.sh` as the start command. This script properly handles the PORT environment variable. If you encounter port-related errors, see [RENDER_DEPLOYMENT_FIX.md](RENDER_DEPLOYMENT_FIX.md).

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
# Vercel Deployment Steps - Frontend with Authentication

## Current Status

✅ Backend code pushed to GitHub
✅ Backend JWT secret added to Render
⏳ Render deployment in progress: `dep-d5nq9j29mqds73bci330`

## Step 1: Configure Vercel Environment Variable

Your frontend needs to know the production backend URL. You need to set this in Vercel:

### Option A: Vercel Dashboard (Recommended)

1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Select your project (resumyx or similar)
3. Go to **Settings** → **Environment Variables**
4. Add new variable:
   - **Name:** `VITE_API_URL`
   - **Value:** `https://resumyx-api.onrender.com/api`
   - **Environments:** Select all (Production, Preview, Development)
5. Click **Save**

### Option B: Vercel CLI

```bash
# Install Vercel CLI if not already installed
npm i -g vercel

# Login to Vercel
vercel login

# Set environment variable
vercel env add VITE_API_URL production
# When prompted, enter: https://resumyx-api.onrender.com/api

# Also set for preview and development
vercel env add VITE_API_URL preview
vercel env add VITE_API_URL development
```

## Step 2: Deploy to Vercel

Your code is already pushed to GitHub. Vercel should automatically deploy if:
- Your GitHub repository is connected to Vercel
- Auto-deploy is enabled

### Check Deployment Status

1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Select your project
3. Look for recent deployments
4. Should see deployment triggered by commit: "feat: Add Supabase password authentication"

### Manual Deployment (if auto-deploy is off)

```bash
# Deploy to production
vercel --prod

# Follow prompts
```

## Step 3: Verify Render Backend is Live

Before testing the frontend, ensure the backend is deployed:

### Check Render Dashboard
1. Go to [Render Dashboard](https://dashboard.render.com/web/srv-d5mm7akoud1c739g64pg)
2. Look for deployment: `dep-d5nq9j29mqds73bci330`
3. Wait for status: **Live** (green)
4. Check logs for any errors

### Test Backend API
```bash
# Test health endpoint
curl https://resumyx-api.onrender.com/api/health

# Expected response:
# {"status":"healthy"}

# Test auth endpoints exist (should return 405 Method Not Allowed - which is good!)
curl https://resumyx-api.onrender.com/api/auth/register

# Expected response showing endpoint exists:
# {"detail":"Method Not Allowed"}
```

## Step 4: Update Render CORS (Important!)

Once you have your Vercel URL, you need to add it to Render CORS settings:

1. Get your Vercel production URL (e.g., `https://resumyx.vercel.app`)
2. Go to [Render Dashboard](https://dashboard.render.com/web/srv-d5mm7akoud1c739g64pg)
3. Go to **Environment** tab
4. Find `CORS_ORIGINS` variable
5. Update value to include your Vercel URL:
   ```
   http://localhost:5173,http://localhost:3000,https://your-vercel-url.vercel.app
   ```
6. Click **Save Changes** (this will trigger a new deployment)

## Step 5: Test Production Authentication

Once both deployments are complete:

### 1. Visit Your Vercel URL
Navigate to your production frontend URL

### 2. Should See Login Page
- Beautiful login form with Resumyx branding
- "Create one" link to register

### 3. Test Registration
- Click "Create one"
- Enter test credentials:
  - Email: `test@yourdomain.com`
  - Password: `SecureTest123!`
  - Confirm password: `SecureTest123!`
- Click "Create Account"
- Should automatically login and see main app

### 4. Test Features
- Try "AI Resume Tailor"
- Try "Cover Letter Generator"
- Create and save a profile
- Verify data persists

### 5. Test Logout
- Click logout button in bottom left
- Should return to login page
- All auth tokens should be cleared

### 6. Test Login
- Enter same credentials used for registration
- Should successfully login
- Should see previously created data

### 7. Browser DevTools Checks

**Application → Local Storage:**
```
access_token: <JWT token>
refresh_token: <JWT token>
user: {"id": "...", "email": "..."}
```

**Network Tab:**
- API requests should include `Authorization: Bearer <token>`
- Successful responses should be 200
- No 401 errors (or if they occur, automatic refresh should happen)

**Console:**
- No JavaScript errors
- No CORS errors

## Troubleshooting

### Issue: CORS Error
**Symptom:** Console shows "CORS policy blocked"
**Fix:**
- Add your Vercel URL to `CORS_ORIGINS` in Render (Step 4 above)
- Wait for Render to redeploy
- Clear browser cache and try again

### Issue: Can't connect to backend
**Symptom:** Network errors, "Failed to fetch"
**Fix:**
- Verify `VITE_API_URL` is set in Vercel to `https://resumyx-api.onrender.com/api`
- Redeploy Vercel after adding environment variable
- Check Render backend is live and responding

### Issue: 500 errors on auth endpoints
**Symptom:** Login/register return 500 errors
**Fix:**
- Check Render logs for errors
- Verify `SUPABASE_JWT_SECRET` is set in Render
- Verify Supabase SQL script was run (RLS policies)
- Check backend dependencies are installed

### Issue: Can't login after registration
**Symptom:** Registration succeeds but login fails
**Fix:**
- Check if email confirmation is required in Supabase
- Go to Supabase Dashboard → Authentication → Email Templates
- Disable "Confirm email" for testing
- Try registering with a new email

### Issue: Data not showing/persisting
**Symptom:** Created profiles don't show up
**Fix:**
- Verify RLS policies are set in Supabase
- Check that `auth_user_id` is being set correctly
- View Supabase Table Editor to see if data exists
- Check browser console for errors

## Monitoring

### Render Logs
Watch for:
- Successful deployments
- Auth endpoint calls
- JWT validation messages
- Any errors or warnings

### Vercel Logs
Watch for:
- Build success
- Runtime errors
- Edge function errors (if any)

### Supabase Logs
Go to Supabase Dashboard → Logs:
- Watch for auth events (signup, signin)
- Check for RLS policy errors
- Monitor database queries

## Rollback Plan

If issues occur:

### Rollback Backend (Render)
```bash
# Revert to previous commit
git revert ec8d546
git push origin main

# Or in Render Dashboard:
# Deployments → Find last working deployment → Redeploy
```

### Rollback Frontend (Vercel)
In Vercel Dashboard:
1. Go to Deployments
2. Find last working deployment
3. Click "..." → "Promote to Production"

## Next Steps After Successful Deployment

1. ✅ Test all authentication flows in production
2. Update profile endpoints to use `auth_user_id`
3. Add password reset flow
4. Add email verification flow
5. Consider social login (Google, GitHub)
6. Set up monitoring/alerts
7. Enable production email confirmations in Supabase

## Support Links

- [Render Dashboard](https://dashboard.render.com/web/srv-d5mm7akoud1c739g64pg)
- [Vercel Dashboard](https://vercel.com/dashboard)
- [Supabase Dashboard](https://supabase.com/dashboard)
- Backend URL: https://resumyx-api.onrender.com
- API Docs: https://resumyx-api.onrender.com/docs

## Documentation

- [PRODUCTION_DEPLOYMENT.md](PRODUCTION_DEPLOYMENT.md) - Overall deployment guide
- [AUTH_COMPLETE_SUMMARY.md](AUTH_COMPLETE_SUMMARY.md) - Auth system overview
- [AUTH_TESTING_GUIDE.md](AUTH_TESTING_GUIDE.md) - Testing instructions
- [backend/AUTH_API_DOCS.md](backend/AUTH_API_DOCS.md) - API documentation
