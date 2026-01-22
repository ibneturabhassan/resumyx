export type AIProvider = 'gemini' | 'openai' | 'openrouter';

export interface AIModel {
  value: string;
  label: string;
  description: string;
}

export interface AIProviderInfo {
  value: AIProvider;
  label: string;
  description: string;
  requiresKey: boolean;
  models: AIModel[];
}

export interface AIProviderConfig {
  provider: AIProvider;
  api_key: string;
  model: string;
  // OpenRouter specific
  site_url?: string;
  app_name?: string;
}

export interface AIProvidersResponse {
  providers: AIProviderInfo[];
}
