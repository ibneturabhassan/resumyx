# Deploy to Render - Step by Step

## Immediate Fix for Your Deployment

Your deployment is failing because Render can't execute the start command properly. Here's the fix:

### Option 1: Use Python Runner (RECOMMENDED)

The repository now includes `backend/run.py` which is more reliable than bash scripts.

**Steps:**

1. **Commit the new files:**
   ```bash
   git add backend/run.py backend/render.yaml
   git commit -m "Add Python runner for Render deployment"
   git push origin main
   ```

2. **In Render Dashboard:**
   - Go to your service
   - Click **Settings**
   - Find **Start Command**
   - Change to: `python run.py`
   - Click **Save Changes**
   - Render will automatically redeploy

3. **Wait for deployment** (2-3 minutes)

4. **Test it:**
   ```bash
   curl https://your-service.onrender.com/api/health
   ```

### Option 2: Direct Uvicorn (SIMPLEST)

If Option 1 fails, use this foolproof approach:

**In Render Dashboard** → Settings → Start Command:
```bash
uvicorn app.main:app --host 0.0.0.0 --port 10000
```

This bypasses all script issues by hardcoding the port Render typically uses.

### Option 3: Shell Wrapper

If you prefer keeping bash:

**Start Command:**
```bash
sh -c 'uvicorn app.main:app --host 0.0.0.0 --port ${PORT:-10000}'
```

## Verify Your Settings

Before deploying, ensure these are correct in Render Dashboard:

### Build & Deploy Settings

- ✅ **Root Directory**: `backend`
- ✅ **Environment**: `Python 3`
- ✅ **Build Command**: `pip install -r requirements.txt`
- ✅ **Start Command**: `python run.py` (or one of the options above)

### Environment Variables

Required (click "Add Environment Variable" for each):

| Variable | Value | Where to Get It |
|----------|-------|-----------------|
| `GEMINI_API_KEY` | Your key | https://makersuite.google.com/app/apikey |
| `SUPABASE_URL` | Your project URL | Supabase Dashboard → Settings → API → Project URL |
| `SUPABASE_SERVICE_KEY` | Service role key | Supabase Dashboard → Settings → API → `service_role` key (NOT anon!) |
| `CORS_ORIGINS` | Your frontend URL | e.g., `https://your-app.vercel.app` |
| `ENVIRONMENT` | `production` | Just type this |

**IMPORTANT**: For `SUPABASE_SERVICE_KEY`, use the **service_role** key, NOT the **anon** key!

## Troubleshooting

### If deployment still fails:

1. **Check Build Logs**:
   - Render Dashboard → Your Service → Click the latest deploy
   - Look for any errors during `pip install`

2. **Check Deploy Logs**:
   - Look for the section after "Build successful"
   - The error will show after "Running 'your-start-command'"

3. **Common Errors**:

   **Error**: `bash: start.sh: No such file or directory`
   **Fix**: Use Option 1 (Python runner) or Option 2 (Direct uvicorn)

   **Error**: `ModuleNotFoundError: No module named 'app'`
   **Fix**: Verify Root Directory is set to `backend`

   **Error**: `Option '--port' requires an argument`
   **Fix**: Use Option 2 with hardcoded port 10000

   **Error**: Connection refused
   **Fix**: Check CORS_ORIGINS includes your frontend URL

## Test Local First

Before pushing to Render, test locally:

```bash
cd backend

# Set environment variables
export PORT=8000
export ENVIRONMENT=production
export GEMINI_API_KEY=your_key_here
export SUPABASE_URL=your_url_here
export SUPABASE_SERVICE_KEY=your_service_key_here
export CORS_ORIGINS=http://localhost:5173

# Test the Python runner
python run.py
```

Should see:
```
Starting Resumyx API on 0.0.0.0:8000...
INFO:     Started server process
INFO:     Uvicorn running on http://0.0.0.0:8000
```

Then test in another terminal:
```bash
curl http://localhost:8000/api/health
```

Should return:
```json
{"status":"healthy","service":"resumyx-api"}
```

## After Successful Deployment

1. **Get your service URL** from Render (e.g., `https://resumyx-api.onrender.com`)

2. **Update CORS**:
   - In Render Dashboard → Environment Variables
   - Update `CORS_ORIGINS` to include your frontend URL:
     ```
     https://your-frontend.vercel.app,https://www.your-domain.com
     ```

3. **Test the deployed API**:
   ```bash
   curl https://your-service.onrender.com/api/health
   ```

4. **Update frontend**:
   - In Vercel → Settings → Environment Variables
   - Add/update: `VITE_API_URL=https://your-service.onrender.com/api`
   - Redeploy frontend

5. **Test end-to-end**:
   - Open your frontend
   - Go to Diagnostics page
   - Click "Run Connection Test"
   - Should show: ✅ Backend API connection successful

## Quick Checklist

- [ ] Code committed and pushed to GitHub
- [ ] Render service created and connected to repo
- [ ] Root Directory set to `backend`
- [ ] Start Command set to `python run.py`
- [ ] All environment variables added
- [ ] Deployment successful (green checkmark)
- [ ] Health check passes: `curl https://your-service.onrender.com/api/health`
- [ ] Frontend updated with backend URL
- [ ] End-to-end test passes

## Still Having Issues?

If you're still stuck, share:
1. The exact error from Render logs (Deploy section)
2. Your current Start Command
3. Screenshot of Environment Variables (hide sensitive values)

And I can provide specific guidance!

---

**Pro Tip**: Render's free tier sleeps after 15 minutes of inactivity. The first request after sleep takes 30-60 seconds to wake up. Consider upgrading to the $7/month plan for always-on service.
