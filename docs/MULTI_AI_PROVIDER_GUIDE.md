# Multi-AI Provider Integration Guide

This guide explains how to use and configure multiple AI providers in Resumyx.

## Overview

Resumyx now supports multiple AI providers:
- **Google Gemini** - Fast and efficient AI models
- **OpenAI** - GPT models (GPT-4o, GPT-4o-mini, GPT-3.5-turbo)
- **OpenRouter** - Access to multiple AI models through one API (Claude, GPT, Llama, Mixtral, etc.)

## Architecture

### Backend Structure

```
backend/app/
├── models/
│   └── ai_config.py          # AI provider configuration models
├── services/
│   ├── base_ai_service.py    # Base class for all AI providers
│   ├── gemini_service_new.py # Google Gemini implementation
│   ├── openai_service.py     # OpenAI implementation
│   ├── openrouter_service.py # OpenRouter implementation
│   ├── ai_service_factory.py # Factory to create AI service instances
│   └── ai_settings_service.py # Store/retrieve user AI preferences
└── api/
    └── ai_settings_routes.py  # API endpoints for AI settings
```

### Database Schema

```sql
CREATE TABLE ai_settings (
    id UUID PRIMARY KEY,
    user_id TEXT UNIQUE NOT NULL,
    provider_config JSONB NOT NULL,
    created_at TIMESTAMP,
    updated_at TIMESTAMP
);
```

The `provider_config` stores:
```json
{
  "provider": "openai|gemini|openrouter",
  "api_key": "your-api-key",
  "model": "gpt-4o-mini",
  // OpenRouter specific:
  "site_url": "https://yoursite.com",
  "app_name": "Resumyx"
}
```

## Setup Instructions

### Step 1: Install Dependencies

```bash
cd backend
pip install -r requirements.txt
```

New dependencies added:
- `openai==1.57.4` - OpenAI Python client
- `httpx==0.28.1` - For OpenRouter API calls

### Step 2: Create Supabase Table

Run the SQL migration in your Supabase SQL editor:

```sql
-- See: backend/supabase_ai_settings_migration.sql
```

This creates the `ai_settings` table with proper RLS policies.

### Step 3: Get API Keys

#### Google Gemini
1. Go to [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Create an API key
3. Free tier: 15 requests/minute, 1500 requests/day

#### OpenAI
1. Go to [OpenAI Platform](https://platform.openai.com/api-keys)
2. Create an API key
3. Pricing: Pay-as-you-go (GPT-4o-mini is most cost-effective)

#### OpenRouter
1. Go to [OpenRouter](https://openrouter.ai/)
2. Sign up and get an API key
3. Add credits to your account
4. Access to Claude, GPT, Llama, and many more models

### Step 4: Replace Backend Files

The implementation created several new files. To integrate:

1. **Replace `app/services/gemini_service.py`** with `gemini_service_new.py`
2. **Replace `app/api/routes.py`** with `routes_updated.py`
3. **Update `app/main.py`**:

```python
from app.api.ai_settings_routes import router as ai_settings_router

# Add this line after existing routers:
app.include_router(ai_settings_router, prefix="/api")
```

## API Endpoints

### Get Available Providers
```http
GET /api/ai/providers
```

Response:
```json
{
  "providers": [
    {
      "value": "gemini",
      "label": "Google Gemini",
      "description": "Google's powerful AI models",
      "requiresKey": true,
      "models": [...]
    },
    ...
  ]
}
```

### Get User's AI Settings
```http
GET /api/ai/settings
Authorization: Bearer <token>
```

### Save AI Settings
```http
POST /api/ai/settings
Authorization: Bearer <token>
Content-Type: application/json

{
  "provider": "openai",
  "api_key": "sk-...",
  "model": "gpt-4o-mini"
}
```

### Delete AI Settings (Revert to Default)
```http
DELETE /api/ai/settings
Authorization: Bearer <token>
```

## Available Models

### Gemini Models
- `gemini-2.0-flash-exp` - Experimental, fast
- `gemini-1.5-pro` - Most capable
- `gemini-1.5-flash` - Fast responses

### OpenAI Models
- `gpt-4o` - Most capable, multimodal
- `gpt-4o-mini` - Affordable and intelligent (recommended)
- `gpt-4-turbo` - Previous flagship
- `gpt-3.5-turbo` - Fast and affordable

### OpenRouter Models
- `anthropic/claude-3.5-sonnet` - Best overall (recommended)
- `anthropic/claude-3-opus` - Most capable
- `openai/gpt-4o` - Via OpenRouter
- `google/gemini-pro-1.5` - Via OpenRouter
- `meta-llama/llama-3.1-70b-instruct` - Open source
- `mistralai/mixtral-8x7b-instruct` - Fast and capable
- Many more available at [OpenRouter](https://openrouter.ai/models)

## Frontend Integration (To Be Implemented)

### AI Settings Page Component

Create `src/components/AISettingsPage.tsx`:
- Provider selector (Gemini, OpenAI, OpenRouter)
- API key input (secured)
- Model dropdown (dynamic based on provider)
- Save/Delete buttons
- Test connection button

### Add to Navigation

Add "AI Settings" to the sidebar navigation in `App.tsx`.

### API Service Updates

Update `src/services/apiService.ts`:
```typescript
async getAIProviders() {
  return this.request('/ai/providers');
}

async getAISettings() {
  return this.request('/ai/settings');
}

async saveAISettings(config: AIProviderConfig) {
  return this.request('/ai/settings', {
    method: 'POST',
    body: JSON.stringify(config)
  });
}

async deleteAISettings() {
  return this.request('/ai/settings', {
    method: 'DELETE'
  });
}
```

## Usage Flow

1. **Default Behavior**: Uses Gemini with the API key from environment variables
2. **User Configures**: User goes to AI Settings page
3. **Selects Provider**: Choose from Gemini, OpenAI, or OpenRouter
4. **Enters API Key**: Provides their own API key
5. **Selects Model**: Choose preferred model for that provider
6. **Saves Settings**: Settings stored in Supabase
7. **Resume Tailoring**: All AI operations now use the user's configured provider

## Error Handling

All providers implement consistent error handling:
- Rate limit errors: Clear message to wait and retry
- Invalid API key: Authentication error
- Model not available: Specific error about model
- Network errors: Connection timeout messages

## Security Considerations

1. **API Keys**: Stored encrypted in Supabase
2. **RLS Policies**: Users can only access their own settings
3. **No Key Exposure**: API keys not returned in GET requests
4. **Validation**: API key format validated before saving

## Cost Comparison

### Gemini (Free Tier)
- 15 requests/minute
- 1500 requests/day
- Best for: Personal use, testing

### OpenAI (Pay-per-use)
- GPT-4o-mini: $0.15/1M input tokens, $0.60/1M output tokens
- GPT-4o: $2.50/1M input tokens, $10/1M output tokens
- Best for: Production use, quality results

### OpenRouter (Pay-per-use)
- Variable pricing by model
- Claude 3.5 Sonnet: ~$3/1M input, ~$15/1M output
- Llama 3.1 70B: ~$0.88/1M tokens (cheaper)
- Best for: Access to multiple models, flexibility

## Troubleshooting

### Provider Not Working
1. Check API key is valid
2. Verify you have credits/quota
3. Check rate limits
4. Test with a different model

### Settings Not Saving
1. Check Supabase table exists
2. Verify RLS policies are set
3. Check authentication token is valid
4. View browser console for errors

### Rate Limit Errors
1. Wait for the specified retry delay
2. Consider upgrading to paid tier
3. Use a different provider temporarily
4. Reduce request frequency

## Future Enhancements

- [ ] Usage tracking and cost estimation
- [ ] Model performance comparison
- [ ] Automatic fallback to alternative provider
- [ ] Caching frequently used responses
- [ ] Batch processing for multiple resumes
- [ ] Provider health monitoring

## Support

For issues:
1. Check provider status pages
2. Review backend logs
3. Test API keys directly with provider
4. Check Supabase table has correct data

## References

- [Google Gemini API Docs](https://ai.google.dev/docs)
- [OpenAI API Reference](https://platform.openai.com/docs/api-reference)
- [OpenRouter Documentation](https://openrouter.ai/docs)
- [Supabase RLS Guide](https://supabase.com/docs/guides/auth/row-level-security)
