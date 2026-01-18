# Render Deployment Fix

## Issue

The deployment fails with:
```
Error: Option '--port' requires an argument.
```

This happens because Render isn't properly expanding the `$PORT` environment variable in the start command.

## Solution 1: Use the Start Script (Recommended)

The repository now includes a `backend/start.sh` script that properly handles the PORT variable.

### Steps:

1. **In Render Dashboard**, go to your service settings
2. **Update Start Command** to:
   ```bash
   bash start.sh
   ```
3. **Save Changes** and redeploy

The script will automatically use Render's `$PORT` environment variable.

## Solution 2: Manual Configuration in Dashboard

If you're not using `render.yaml` and configuring via the Render dashboard:

### Steps:

1. Go to your service in Render Dashboard
2. Navigate to **Settings**
3. Update **Start Command** to one of these options:

   **Option A - Using sh (most compatible):**
   ```bash
   sh -c 'uvicorn app.main:app --host 0.0.0.0 --port ${PORT:-10000}'
   ```

   **Option B - Direct command:**
   ```bash
   uvicorn app.main:app --host 0.0.0.0 --port 10000
   ```

   Note: Render typically assigns port 10000, so hardcoding it works too.

4. **Save Changes**

## Solution 3: Use render.yaml (Infrastructure as Code)

The repository includes `backend/render.yaml`. To use it:

### Steps:

1. **In Render Dashboard**, create a new Web Service
2. Choose **"Use existing YAML"**
3. Select the repository
4. **Root Directory**: Set to `backend`
5. Render will automatically use the `render.yaml` configuration
6. **Add Environment Variables** in the Render dashboard:
   - `GEMINI_API_KEY`: Your Gemini API key
   - `SUPABASE_URL`: Your Supabase project URL
   - `SUPABASE_SERVICE_KEY`: Your Supabase service role key
   - `CORS_ORIGINS`: Your frontend URL (e.g., `https://your-app.vercel.app`)

## Verify Deployment

After deploying, verify it works:

### 1. Check Health Endpoint
```bash
curl https://your-service.onrender.com/api/health
```

Expected response:
```json
{"status": "healthy", "service": "resumyx-api"}
```

### 2. Check API Documentation
Visit: `https://your-service.onrender.com/docs`

You should see the interactive Swagger UI.

### 3. Test from Frontend
Update your frontend `.env.production` or Vercel environment variables:
```env
VITE_API_URL=https://your-service.onrender.com/api
```

## Common Issues

### Issue: Service keeps sleeping (Free Tier)
**Solution**:
- Upgrade to paid plan ($7/month) for always-on service
- Or use a service like UptimeRobot to ping your API every 5 minutes

### Issue: CORS errors
**Solution**:
- Verify `CORS_ORIGINS` environment variable includes your frontend URL
- Format: `https://your-app.vercel.app,https://www.your-domain.com`
- No trailing slashes
- Must use HTTPS (not HTTP) for production

### Issue: Database connection fails
**Solution**:
- Verify `SUPABASE_SERVICE_KEY` (not anon key!)
- Check Supabase project is active
- Ensure `resume_profiles` table exists

### Issue: Gemini API errors
**Solution**:
- Verify `GEMINI_API_KEY` is correct
- Check API quota at https://makersuite.google.com
- Ensure no extra spaces in the key

## Environment Variables Checklist

In Render dashboard, ensure these are set:

- ✅ `GEMINI_API_KEY` - Your Gemini API key
- ✅ `SUPABASE_URL` - Your Supabase project URL
- ✅ `SUPABASE_SERVICE_KEY` - Service role key (NOT anon key)
- ✅ `CORS_ORIGINS` - Frontend URL(s), comma-separated
- ✅ `ENVIRONMENT` - Set to `production`
- ✅ `PORT` - Usually auto-set by Render (10000)

## Test Locally First

Before deploying, always test locally:

```bash
# Set environment variables
export PORT=8000
export ENVIRONMENT=production
export GEMINI_API_KEY=your_key
export SUPABASE_URL=your_url
export SUPABASE_SERVICE_KEY=your_key
export CORS_ORIGINS=http://localhost:5173

# Run the server
cd backend
uvicorn app.main:app --host 0.0.0.0 --port $PORT
```

Visit http://localhost:8000/docs to verify it works.

## Deployment Steps Summary

1. **Push code to GitHub**
   ```bash
   git add .
   git commit -m "Fix Render deployment"
   git push origin main
   ```

2. **In Render Dashboard:**
   - Go to your service
   - Settings → **Start Command**: `bash start.sh`
   - Environment → Add all required variables
   - Save and wait for redeployment

3. **Verify deployment:**
   ```bash
   curl https://your-service.onrender.com/api/health
   ```

4. **Update frontend:**
   - In Vercel: Set `VITE_API_URL=https://your-service.onrender.com/api`
   - Redeploy frontend

5. **Test end-to-end:**
   - Open your frontend
   - Go to Diagnostics page
   - Click "Run Connection Test"
   - Should show: ✅ Backend API connection successful

## Need More Help?

- **Render Logs**: Dashboard → Logs tab
- **Render Docs**: https://render.com/docs/deploy-fastapi
- **FastAPI Docs**: https://fastapi.tiangolo.com/deployment/
- **Our Docs**: See [DEPLOYMENT_GUIDE.md](DEPLOYMENT_GUIDE.md)

## Quick Fix Command

If deploying manually via Render dashboard, use this start command:

```bash
bash start.sh
```

That's it! This should resolve the PORT argument error.
