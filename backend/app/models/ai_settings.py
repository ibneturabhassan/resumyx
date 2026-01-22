from pydantic import BaseModel, Field
from typing import Literal, Optional

AIProvider = Literal["gemini", "openai", "openrouter"]

class AISettingsConfig(BaseModel):
    provider: AIProvider
    api_key: str = Field(..., min_length=1)
    model: str = Field(..., min_length=1)
    site_url: Optional[str] = None
    app_name: Optional[str] = None

class AISettingsResponse(BaseModel):
    provider: AIProvider
    model: str
    site_url: Optional[str] = None
    app_name: Optional[str] = None
