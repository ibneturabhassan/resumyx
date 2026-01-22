from supabase import create_client, Client
from app.core.config import settings
from app.models.resume import ResumeData, ResumeProfile
from typing import Optional
from datetime import datetime

class SupabaseService:
    def __init__(self):
        self.client: Client = create_client(
            settings.SUPABASE_URL,
            settings.SUPABASE_SERVICE_KEY
        )
        self.table_name = "resume_profiles"
        self.ai_settings_table = "ai_settings"

    async def get_profile(self, user_id: str) -> Optional[dict]:
        """Get user profile from database"""
        try:
            response = self.client.table(self.table_name)\
                .select("*")\
                .eq("user_id", user_id)\
                .execute()

            if response.data and len(response.data) > 0:
                return response.data[0]
            return None
        except Exception as e:
            print(f"Error fetching profile: {e}")
            return None

    async def save_profile(
        self,
        user_id: str,
        profile_data: ResumeData,
        target_jd: str = ""
    ) -> bool:
        """Save or update user profile"""
        try:
            data = {
                "user_id": user_id,
                "profile_data": profile_data.model_dump(),
                "target_jd": target_jd,
                "updated_at": datetime.utcnow().isoformat()
            }

            response = self.client.table(self.table_name)\
                .upsert(data)\
                .execute()

            return True
        except Exception as e:
            print(f"Error saving profile: {e}")
            return False

    async def delete_profile(self, user_id: str) -> bool:
        """Delete user profile"""
        try:
            self.client.table(self.table_name)\
                .delete()\
                .eq("user_id", user_id)\
                .execute()
            return True
        except Exception as e:
            print(f"Error deleting profile: {e}")
            return False

    async def get_ai_settings(self, user_id: str) -> Optional[dict]:
        """Get AI settings for a user"""
        try:
            response = self.client.table(self.ai_settings_table)\
                .select("*")\
                .eq("user_id", user_id)\
                .execute()

            if response.data and len(response.data) > 0:
                return response.data[0]
            return None
        except Exception as e:
            print(f"Error fetching AI settings: {e}")
            return None

    async def save_ai_settings(self, user_id: str, config: dict) -> bool:
        """Save or update AI settings"""
        try:
            data = {
                "user_id": user_id,
                "provider": config.get("provider"),
                "api_key": config.get("api_key"),
                "model": config.get("model"),
                "site_url": config.get("site_url"),
                "app_name": config.get("app_name"),
                "updated_at": datetime.utcnow().isoformat()
            }

            self.client.table(self.ai_settings_table)\
                .upsert(data)\
                .execute()
            return True
        except Exception as e:
            print(f"Error saving AI settings: {e}")
            return False

    async def delete_ai_settings(self, user_id: str) -> bool:
        """Delete AI settings for a user"""
        try:
            self.client.table(self.ai_settings_table)\
                .delete()\
                .eq("user_id", user_id)\
                .execute()
            return True
        except Exception as e:
            print(f"Error deleting AI settings: {e}")
            return False

supabase_service = SupabaseService()
