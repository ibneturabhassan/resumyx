from fastapi import APIRouter, HTTPException, status, Depends
from app.models.ai_config import AIProviderConfig, GeminiConfig, OpenAIConfig, OpenRouterConfig
from app.services.ai_settings_service import ai_settings_service
from app.services.ai_service_factory import PROVIDER_MODELS
from app.core.auth_middleware import get_current_user
from typing import Dict, Any

router = APIRouter()

@router.get("/ai/settings")
async def get_ai_settings(current_user: Dict[str, Any] = Depends(get_current_user)):
    """Get user's AI provider settings"""
    try:
        print(f"DEBUG: current_user = {current_user}")
        user_id = current_user["user_id"]
        print(f"DEBUG: user_id = {user_id}")
        settings = await ai_settings_service.get_user_settings(user_id)
        print(f"DEBUG: settings = {settings}")
    except Exception as e:
        print(f"ERROR in get_ai_settings: {e}")
        raise

    if not settings:
        # Return default Gemini settings if none configured
        return {
            "provider": "gemini",
            "model": "gemini-2.0-flash-exp",
            "api_key": ""  # Don't return actual key
        }

    # Don't return the API key for security
    settings_dict = settings.model_dump()
    settings_dict["api_key"] = ""  # Mask the key

    return settings_dict

@router.post("/ai/settings")
async def save_ai_settings(
    config: AIProviderConfig,
    current_user: Dict[str, Any] = Depends(get_current_user)
):
    """Save user's AI provider settings"""
    user_id = current_user["user_id"]

    # Validate API key is provided
    if not config.api_key or config.api_key.strip() == "":
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="API key is required"
        )

    success = await ai_settings_service.save_user_settings(user_id, config)

    if not success:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to save AI settings"
        )

    return {"message": "AI settings saved successfully"}

@router.delete("/ai/settings")
async def delete_ai_settings(current_user: Dict[str, Any] = Depends(get_current_user)):
    """Delete user's AI provider settings (revert to default)"""
    user_id = current_user["user_id"]

    success = await ai_settings_service.delete_user_settings(user_id)

    if not success:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to delete AI settings"
        )

    return {"message": "AI settings deleted successfully"}

@router.get("/ai/providers")
async def get_available_providers():
    """Get list of available AI providers and their models"""
    return {
        "providers": [
            {
                "value": "gemini",
                "label": "Google Gemini",
                "description": "Google's powerful AI models",
                "requiresKey": True,
                "models": PROVIDER_MODELS["gemini"]
            },
            {
                "value": "openai",
                "label": "OpenAI",
                "description": "GPT models from OpenAI",
                "requiresKey": True,
                "models": PROVIDER_MODELS["openai"]
            },
            {
                "value": "openrouter",
                "label": "OpenRouter",
                "description": "Access multiple AI models through one API",
                "requiresKey": True,
                "models": PROVIDER_MODELS["openrouter"]
            }
        ]
    }
