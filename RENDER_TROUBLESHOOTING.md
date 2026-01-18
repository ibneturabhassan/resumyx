# Render Deployment Troubleshooting

## Common Deployment Issues & Fixes

Based on the error pattern with `bash start.sh`, here are the most likely issues:

### Issue 1: start.sh Not Found or Not Executable

**Symptom**:
```
bash: start.sh: No such file or directory
```

**Fix**: Ensure start.sh is in the correct location

The file should be at `backend/start.sh` and needs to be committed to Git:

```bash
# Check if file exists
ls -la backend/start.sh

# Make sure it's executable
chmod +x backend/start.sh

# Commit to Git (IMPORTANT!)
git add backend/start.sh
git commit -m "Add start script for Render deployment"
git push origin main
```

**In Render Dashboard**:
- Trigger a manual deploy after pushing

### Issue 2: Line Endings (Windows CRLF vs Unix LF)

**Symptom**:
```
/bin/bash^M: bad interpreter
```

**Fix**: Convert line endings to Unix format

```bash
# On Windows with Git
git config --global core.autocrlf input

# Convert the file
dos2unix backend/start.sh
# OR
sed -i 's/\r$//' backend/start.sh

# Commit the fix
git add backend/start.sh
git commit -m "Fix line endings in start.sh"
git push origin main
```

### Issue 3: Working Directory Issue

**Symptom**: Script runs but can't find app module

**Fix**: Use absolute paths in start.sh or ensure correct working directory

Update `backend/start.sh`:

```bash
#!/bin/bash
# Get the directory where this script is located
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"

# Change to the backend directory
cd "$SCRIPT_DIR"

# Render provides PORT as an environment variable
PORT=${PORT:-10000}

echo "Starting Resumyx API on port $PORT from $SCRIPT_DIR..."
uvicorn app.main:app --host 0.0.0.0 --port $PORT
```

### Issue 4: Render Not Using Correct Root Directory

**Symptom**: Can't find requirements.txt or Python modules

**Fix**: Verify Root Directory in Render Dashboard

1. Go to your service in Render
2. Settings → **Root Directory**
3. Should be set to: `backend`
4. Save and redeploy

### Issue 5: Python Path Issues

**Symptom**: `ModuleNotFoundError: No module named 'app'`

**Fix**: Ensure Python can find the app module

Update `backend/start.sh`:

```bash
#!/bin/bash
export PYTHONPATH="${PYTHONPATH}:/opt/render/project/src"
PORT=${PORT:-10000}
echo "Starting Resumyx API on port $PORT..."
uvicorn app.main:app --host 0.0.0.0 --port $PORT
```

## Recommended Solution: Simplify Start Command

Instead of using `bash start.sh`, try this simpler approach:

### Option 1: Direct Command (Most Reliable)

**In Render Dashboard** → Settings → Start Command:

```bash
uvicorn app.main:app --host 0.0.0.0 --port 10000
```

Render typically assigns port 10000, so hardcoding it is usually fine.

### Option 2: Shell Inline (Second Best)

```bash
sh -c "uvicorn app.main:app --host 0.0.0.0 --port \${PORT:-10000}"
```

### Option 3: Python Runner

Create `backend/run.py`:

```python
import os
import uvicorn

if __name__ == "__main__":
    port = int(os.environ.get("PORT", 10000))
    uvicorn.run(
        "app.main:app",
        host="0.0.0.0",
        port=port,
        workers=1
    )
```

**Start Command**: `python run.py`

## Debugging Steps

### 1. Check Render Build Logs

In Render Dashboard:
1. Go to your service
2. Click on the latest deploy
3. Look for:
   - ✅ Build successful
   - ❌ Deploy failed

### 2. Check Environment Variables

Verify these are set in Render:
- `GEMINI_API_KEY`
- `SUPABASE_URL`
- `SUPABASE_SERVICE_KEY`
- `CORS_ORIGINS`
- `ENVIRONMENT=production`

### 3. Test Locally First

Before deploying, test the exact command locally:

```bash
cd backend

# Test with environment variables
export PORT=10000
export ENVIRONMENT=production
export GEMINI_API_KEY=your_key
export SUPABASE_URL=your_url
export SUPABASE_SERVICE_KEY=your_key
export CORS_ORIGINS=http://localhost:5173

# Test the start script
bash start.sh

# OR test direct command
uvicorn app.main:app --host 0.0.0.0 --port 10000
```

### 4. Check File Permissions

```bash
# Should show: -rwxr-xr-x (executable)
ls -la backend/start.sh

# If not executable:
chmod +x backend/start.sh
git add backend/start.sh
git commit -m "Make start.sh executable"
git push
```

## Quick Fix: Use Python Direct

The most reliable approach is to run Python directly. Update your Render settings:

**Start Command**:
```bash
python -m uvicorn app.main:app --host 0.0.0.0 --port 10000
```

This avoids all shell script issues.

## Get Actual Logs

To see what's actually failing:

1. **Render Dashboard** → Your Service → **Logs** tab
2. Look for the error after "Deploying..."
3. Common errors:
   ```
   bash: start.sh: No such file or directory
   /bin/bash^M: bad interpreter
   ModuleNotFoundError: No module named 'app'
   Error: Option '--port' requires an argument
   ```

## Need More Help?

Share the specific error from Render logs (from the Logs tab in dashboard), and I can provide a targeted fix.

## Recommended Next Steps

1. **Simplest fix** - In Render Dashboard, change Start Command to:
   ```
   uvicorn app.main:app --host 0.0.0.0 --port 10000
   ```

2. **Commit and push** any file changes:
   ```bash
   git add .
   git commit -m "Fix Render deployment"
   git push origin main
   ```

3. **Manual deploy** in Render Dashboard:
   - Click "Manual Deploy" → "Clear build cache & deploy"

4. **Test the deployment**:
   ```bash
   curl https://your-service.onrender.com/api/health
   ```
