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
