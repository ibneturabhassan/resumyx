from app.services.base_ai_service import BaseAIService
from app.services.gemini_service import GeminiService
from app.services.openai_service import OpenAIService
from app.services.openrouter_service import OpenRouterService
from app.models.ai_config import AIProviderConfig, OpenRouterConfig

class AIServiceFactory:
    """Factory class to create appropriate AI service based on configuration"""

    @staticmethod
    def create_service(config: AIProviderConfig) -> BaseAIService:
        """Create and return appropriate AI service instance"""

        if config.provider == "gemini":
            return GeminiService(
                api_key=config.api_key,
                model=config.model or "gemini-2.0-flash-exp"
            )

        elif config.provider == "openai":
            return OpenAIService(
                api_key=config.api_key,
                model=config.model or "gpt-4o-mini"
            )

        elif config.provider == "openrouter":
            openrouter_config = config if isinstance(config, OpenRouterConfig) else OpenRouterConfig(**config.model_dump())
            return OpenRouterService(
                api_key=config.api_key,
                model=config.model or "anthropic/claude-3.5-sonnet",
                site_url=openrouter_config.site_url,
                app_name=openrouter_config.app_name
            )

        else:
            raise ValueError(f"Unsupported AI provider: {config.provider}")

# Available models for each provider
PROVIDER_MODELS = {
    "gemini": [
        {"value": "gemini-2.0-flash-exp", "label": "Gemini 2.0 Flash (Experimental)", "description": "Fast and efficient"},
        {"value": "gemini-1.5-pro", "label": "Gemini 1.5 Pro", "description": "Most capable"},
        {"value": "gemini-1.5-flash", "label": "Gemini 1.5 Flash", "description": "Fast responses"},
    ],
    "openai": [
        {"value": "gpt-4o", "label": "GPT-4o", "description": "Most capable, multimodal"},
        {"value": "gpt-4o-mini", "label": "GPT-4o Mini", "description": "Affordable and intelligent"},
        {"value": "gpt-4-turbo", "label": "GPT-4 Turbo", "description": "Previous flagship"},
        {"value": "gpt-3.5-turbo", "label": "GPT-3.5 Turbo", "description": "Fast and affordable"},
    ],
    "openrouter": [
        {"value": "anthropic/claude-3.5-sonnet", "label": "Claude 3.5 Sonnet", "description": "Best overall"},
        {"value": "anthropic/claude-3-opus", "label": "Claude 3 Opus", "description": "Most capable"},
        {"value": "openai/gpt-4o", "label": "GPT-4o", "description": "Via OpenRouter"},
        {"value": "google/gemini-pro-1.5", "label": "Gemini Pro 1.5", "description": "Via OpenRouter"},
        {"value": "meta-llama/llama-3.1-70b-instruct", "label": "Llama 3.1 70B", "description": "Open source"},
        {"value": "mistralai/mixtral-8x7b-instruct", "label": "Mixtral 8x7B", "description": "Fast and capable"},
    ]
}
