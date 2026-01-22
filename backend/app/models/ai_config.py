from pydantic import BaseModel
from typing import Optional, Literal

class AIProviderConfig(BaseModel):
    """Configuration for AI provider"""
    provider: Literal["gemini", "openai", "openrouter"]
    api_key: str
    model: Optional[str] = None

class GeminiConfig(AIProviderConfig):
    provider: Literal["gemini"] = "gemini"
    model: str = "gemini-2.0-flash-exp"

class OpenAIConfig(AIProviderConfig):
    provider: Literal["openai"] = "openai"
    model: str = "gpt-4o-mini"  # Default to cost-effective model

class OpenRouterConfig(AIProviderConfig):
    provider: Literal["openrouter"] = "openrouter"
    model: str = "anthropic/claude-3.5-sonnet"  # Default model
    site_url: Optional[str] = None
    app_name: Optional[str] = "Resumyx"

class UserAISettings(BaseModel):
    """User's AI provider settings"""
    user_id: str
    provider_config: AIProviderConfig
