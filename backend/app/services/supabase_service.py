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

supabase_service = SupabaseService()
