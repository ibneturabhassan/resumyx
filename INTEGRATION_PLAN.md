# Multi-AI Provider Integration Plan

## Current Status
✅ Dependencies added to requirements.txt (openai, httpx)
✅ New service files created but not yet integrated
⏳ Need to integrate without breaking existing functionality

## Problem
We created many new files but they're not yet connected to the main application. Deploying them all at once could break things.

## Solution: Phased Integration

### Phase 1: Backend Foundation (SAFE - No breaking changes)
Files ready but not yet integrated:
- `backend/app/models/ai_config.py` - New models for AI configuration
- `backend/app/services/base_ai_service.py` - Base class for all AI providers
- `backend/app/services/ai_service_factory.py` - Factory pattern
- `backend/app/services/ai_settings_service.py` - User settings storage
- `backend/supabase_ai_settings_migration.sql` - Database migration

**Action:** Add these files, they won't affect existing code.

### Phase 2: Refactor Gemini Service (CAREFUL - Could break)
- Replace `backend/app/services/gemini_service.py` with `gemini_service_new.py`
- This changes from static methods to instance methods

**Action:** Test thoroughly before deploying.

### Phase 3: Add New Providers (SAFE - Optional features)
- `backend/app/services/openai_service.py`
- `backend/app/services/openrouter_service.py`

**Action:** These are new features, won't break existing.

### Phase 4: Update API Routes (CAREFUL - Could break)
- Replace `backend/app/api/routes.py` with `routes_updated.py`
- Add `backend/app/api/ai_settings_routes.py`
- Update `backend/app/main.py` to include new routes

**Action:** Test API endpoints before deploying.

### Phase 5: Frontend UI (SAFE - New feature)
- Create AI Settings page component
- Add to navigation
- Update API service

## Current Deployment Issue

The deployment likely failed because:
1. ❌ httpx version conflict (we added 0.28.1, but httpx is already installed via supabase dependency)
2. ❌ openai dependency might conflict with existing packages

## Fix Strategy

### Option 1: Check Version Compatibility
```bash
cd backend
pip install -r requirements.txt --dry-run
```

### Option 2: Let Dependencies Resolve Automatically
Remove specific versions for httpx since it's already a transitive dependency:
```
openai==1.57.4
# httpx will be installed by supabase and openai automatically
```

### Option 3: Check Render Build Logs
Look at the actual error message from Render to see what failed.

## Safe Next Steps

1. **Monitor Current Deployment** - Check if the requirements.txt update deploys successfully
2. **If Successful** - Proceed with Phase 1 (adding new files that don't affect existing code)
3. **If Failed** - Check Render logs and fix dependency conflicts
4. **Test Locally** - Run backend locally to ensure no import errors

## Testing Checklist Before Deploying Each Phase

- [ ] Backend starts without errors
- [ ] Health endpoint works: `GET /api/health`
- [ ] Existing AI endpoints still work
- [ ] No import errors in logs
- [ ] Test with actual API call

## Rollback Plan

If deployment fails at any phase:
```bash
git revert HEAD
git push origin main
```

This will immediately restore the previous working version.

## Current File Status

**Safe to deploy (won't break anything):**
- ✅ `backend/requirements.txt` - Already pushed
- ✅ `docs/MULTI_AI_PROVIDER_GUIDE.md` - Documentation only
- ✅ New model files (not imported anywhere yet)
- ✅ New service files (not imported anywhere yet)

**Risky to deploy (could break):**
- ⚠️ Replacing `gemini_service.py`
- ⚠️ Replacing `routes.py`
- ⚠️ Modifying `main.py`

**Recommendation:** Wait for current deployment to succeed, then proceed with Phase 1.
