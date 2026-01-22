from app.services.supabase_service import supabase_service
from app.models.ai_config import AIProviderConfig, UserAISettings
from typing import Optional
import json

class AISettingsService:
    """Service for managing user AI provider settings"""

    TABLE_NAME = "ai_settings"

    async def get_user_settings(self, user_id: str) -> Optional[AIProviderConfig]:
        """Get AI provider settings for a user"""
        try:
            response = supabase_service.client.table(self.TABLE_NAME).select("*").eq("user_id", user_id).execute()

            if response.data and len(response.data) > 0:
                settings_data = response.data[0]
                # Parse provider_config JSON
                provider_config = json.loads(settings_data["provider_config"])
                return AIProviderConfig(**provider_config)

            return None
        except Exception as e:
            print(f"Error getting user AI settings: {e}")
            return None

    async def save_user_settings(self, user_id: str, config: AIProviderConfig) -> bool:
        """Save AI provider settings for a user"""
        try:
            # Convert config to JSON string
            config_json = json.dumps(config.model_dump())

            # Check if settings exist
            existing = await self.get_user_settings(user_id)

            if existing:
                # Update existing
                response = supabase_service.client.table(self.TABLE_NAME).update({
                    "provider_config": config_json,
                    "updated_at": "now()"
                }).eq("user_id", user_id).execute()
            else:
                # Insert new
                response = supabase_service.client.table(self.TABLE_NAME).insert({
                    "user_id": user_id,
                    "provider_config": config_json
                }).execute()

            return True
        except Exception as e:
            print(f"Error saving user AI settings: {e}")
            return False

    async def delete_user_settings(self, user_id: str) -> bool:
        """Delete AI provider settings for a user"""
        try:
            supabase_service.client.table(self.TABLE_NAME).delete().eq("user_id", user_id).execute()
            return True
        except Exception as e:
            print(f"Error deleting user AI settings: {e}")
            return False

ai_settings_service = AISettingsService()
