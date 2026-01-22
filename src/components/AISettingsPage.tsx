import React, { useState, useEffect } from 'react';
import { apiService } from '../services/apiService';
import { AIProvider, AIProviderInfo, AIProviderConfig, AIModel } from '../types/ai-config';

const AISettingsPage: React.FC = () => {
  const [providers, setProviders] = useState<AIProviderInfo[]>([]);
  const [selectedProvider, setSelectedProvider] = useState<AIProvider>('gemini');
  const [apiKey, setApiKey] = useState('');
  const [selectedModel, setSelectedModel] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);
  const [showApiKey, setShowApiKey] = useState(false);

  // OpenRouter specific fields
  const [siteUrl, setSiteUrl] = useState('');
  const [appName, setAppName] = useState('Resumyx');

  useEffect(() => {
    loadProviders();
    loadCurrentSettings();
  }, []);

  const loadProviders = async () => {
    try {
      const response = await apiService.getAIProviders();
      setProviders(response.providers);
    } catch (error) {
      console.error('Error loading providers:', error);
      showMessage('error', 'Failed to load AI providers');
    }
  };

  const loadCurrentSettings = async () => {
    try {
      setLoading(true);
      const settings = await apiService.getAISettings();
      if (settings.provider) {
        setSelectedProvider(settings.provider);
        setSelectedModel(settings.model || '');
        // Don't load API key for security
        if (settings.site_url) setSiteUrl(settings.site_url);
        if (settings.app_name) setAppName(settings.app_name);
      }
    } catch (error) {
      console.error('Error loading settings:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleProviderChange = (provider: AIProvider) => {
    setSelectedProvider(provider);
    // Set default model for new provider
    const providerInfo = providers.find(p => p.value === provider);
    if (providerInfo && providerInfo.models.length > 0) {
      setSelectedModel(providerInfo.models[0].value);
    }
    setApiKey(''); // Clear API key when switching providers
  };

  const handleSave = async () => {
    if (!apiKey.trim()) {
      showMessage('error', 'Please enter an API key');
      return;
    }

    if (!selectedModel) {
      showMessage('error', 'Please select a model');
      return;
    }

    setSaving(true);
    try {
      const config: AIProviderConfig = {
        provider: selectedProvider,
        api_key: apiKey,
        model: selectedModel,
      };

      // Add OpenRouter specific fields
      if (selectedProvider === 'openrouter') {
        if (siteUrl) config.site_url = siteUrl;
        if (appName) config.app_name = appName;
      }

      await apiService.saveAISettings(config);
      showMessage('success', 'AI settings saved successfully! Your new provider will be used for all AI operations.');
      setApiKey(''); // Clear for security
    } catch (error: any) {
      showMessage('error', error.message || 'Failed to save settings');
    } finally {
      setSaving(false);
    }
  };

  const handleResetToDefault = async () => {
    if (!confirm('Reset to default Gemini settings? Your API key will be removed.')) {
      return;
    }

    setSaving(true);
    try {
      await apiService.deleteAISettings();
      setSelectedProvider('gemini');
      setApiKey('');
      setSelectedModel('gemini-2.0-flash-exp');
      setSiteUrl('');
      setAppName('Resumyx');
      showMessage('success', 'Reset to default Gemini settings');
    } catch (error: any) {
      showMessage('error', error.message || 'Failed to reset settings');
    } finally {
      setSaving(false);
    }
  };

  const showMessage = (type: 'success' | 'error', text: string) => {
    setMessage({ type, text });
    setTimeout(() => setMessage(null), 5000);
  };

  const currentProvider = providers.find(p => p.value === selectedProvider);
  const availableModels = currentProvider?.models || [];

  const inputClass = "w-full p-3.5 bg-slate-50/80 border border-slate-200 rounded-xl focus:ring-4 focus:ring-blue-500/20 focus:border-blue-400 focus:bg-white focus:outline-none transition-all duration-200 text-sm text-slate-800 shadow-sm placeholder-slate-400 hover:border-slate-300";
  const labelClass = "block text-xs font-semibold text-slate-500 uppercase mb-2.5 tracking-wide";
  const sectionClass = "bg-white p-8 rounded-2xl shadow-md border border-slate-100 mb-6";

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center space-y-4">
          <div className="w-12 h-12 rounded-xl bg-blue-600 flex items-center justify-center text-white mx-auto">
            <i className="fas fa-circle-notch fa-spin"></i>
          </div>
          <p className="text-slate-600">Loading AI settings...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-6 duration-700">
      {/* Header */}
      <div className={sectionClass}>
        <div className="flex items-start gap-4 mb-6 pb-6 border-b border-slate-100">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-600 to-blue-600 flex items-center justify-center text-white flex-shrink-0">
            <i className="fas fa-robot text-xl"></i>
          </div>
          <div className="flex-1">
            <h2 className="text-2xl font-bold text-slate-800 mb-2">AI Provider Settings</h2>
            <p className="text-slate-600 text-sm leading-relaxed">
              Choose your preferred AI provider and model. Your API key is encrypted and stored securely.
              The selected provider will be used for resume tailoring, ATS scoring, and cover letter generation.
            </p>
          </div>
        </div>

        {/* Success/Error Message */}
        {message && (
          <div className={`mb-6 p-4 rounded-xl border ${
            message.type === 'success'
              ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
              : 'bg-red-50 border-red-200 text-red-800'
          }`}>
            <div className="flex items-center gap-3">
              <i className={`fas ${message.type === 'success' ? 'fa-check-circle' : 'fa-exclamation-circle'}`}></i>
              <span className="text-sm font-medium">{message.text}</span>
            </div>
          </div>
        )}

        {/* Provider Selection */}
        <div className="mb-6">
          <label className={labelClass}>AI Provider</label>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {providers.map((provider) => (
              <button
                key={provider.value}
                onClick={() => handleProviderChange(provider.value)}
                className={`p-4 rounded-xl border-2 transition-all text-left ${
                  selectedProvider === provider.value
                    ? 'border-blue-500 bg-blue-50 shadow-md'
                    : 'border-slate-200 hover:border-slate-300 hover:shadow-sm'
                }`}
              >
                <div className="flex items-center gap-3 mb-2">
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                    selectedProvider === provider.value ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-600'
                  }`}>
                    <i className={`fas ${
                      provider.value === 'gemini' ? 'fa-google' :
                      provider.value === 'openai' ? 'fa-brain' :
                      'fa-network-wired'
                    }`}></i>
                  </div>
                  <div className="flex-1">
                    <h3 className="font-bold text-slate-800 text-sm">{provider.label}</h3>
                  </div>
                  {selectedProvider === provider.value && (
                    <i className="fas fa-check-circle text-blue-600"></i>
                  )}
                </div>
                <p className="text-xs text-slate-600">{provider.description}</p>
              </button>
            ))}
          </div>
        </div>

        {/* Model Selection */}
        <div className="mb-6">
          <label className={labelClass}>Model</label>
          <select
            value={selectedModel}
            onChange={(e) => setSelectedModel(e.target.value)}
            className={inputClass}
          >
            <option value="">Select a model...</option>
            {availableModels.map((model) => (
              <option key={model.value} value={model.value}>
                {model.label} - {model.description}
              </option>
            ))}
          </select>
          {selectedModel && (
            <p className="mt-2 text-xs text-slate-500 flex items-center gap-2">
              <i className="fas fa-info-circle"></i>
              {availableModels.find(m => m.value === selectedModel)?.description}
            </p>
          )}
        </div>

        {/* API Key Input */}
        <div className="mb-6">
          <label className={labelClass}>
            API Key
            {apiKey && (
              <span className="ml-2 text-emerald-600 normal-case font-normal">
                <i className="fas fa-check-circle"></i> Provided
              </span>
            )}
          </label>
          <div className="relative">
            <input
              type={showApiKey ? 'text' : 'password'}
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              placeholder={`Enter your ${currentProvider?.label} API key...`}
              className={inputClass}
            />
            <button
              type="button"
              onClick={() => setShowApiKey(!showApiKey)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
            >
              <i className={`fas ${showApiKey ? 'fa-eye-slash' : 'fa-eye'}`}></i>
            </button>
          </div>
          <div className="mt-3 space-y-2">
            <p className="text-xs text-slate-600 flex items-start gap-2">
              <i className="fas fa-lock mt-0.5 flex-shrink-0"></i>
              <span>Your API key is encrypted and stored securely. It's only used to make requests to {currentProvider?.label}.</span>
            </p>
            <p className="text-xs text-slate-600 flex items-start gap-2">
              <i className="fas fa-external-link-alt mt-0.5 flex-shrink-0"></i>
              <span>
                Get your API key from:{' '}
                {selectedProvider === 'gemini' && (
                  <a href="https://makersuite.google.com/app/apikey" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                    Google AI Studio
                  </a>
                )}
                {selectedProvider === 'openai' && (
                  <a href="https://platform.openai.com/api-keys" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                    OpenAI Platform
                  </a>
                )}
                {selectedProvider === 'openrouter' && (
                  <a href="https://openrouter.ai/keys" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                    OpenRouter Dashboard
                  </a>
                )}
              </span>
            </p>
          </div>
        </div>

        {/* OpenRouter Specific Fields */}
        {selectedProvider === 'openrouter' && (
          <div className="mb-6 p-4 bg-slate-50 rounded-xl border border-slate-200">
            <h3 className="text-sm font-semibold text-slate-700 mb-4 flex items-center gap-2">
              <i className="fas fa-cog"></i>
              OpenRouter Configuration (Optional)
            </h3>
            <div className="space-y-4">
              <div>
                <label className={labelClass}>Site URL</label>
                <input
                  type="url"
                  value={siteUrl}
                  onChange={(e) => setSiteUrl(e.target.value)}
                  placeholder="https://yoursite.com (optional)"
                  className={inputClass}
                />
                <p className="mt-1 text-xs text-slate-500">Your site URL for OpenRouter attribution</p>
              </div>
              <div>
                <label className={labelClass}>App Name</label>
                <input
                  type="text"
                  value={appName}
                  onChange={(e) => setAppName(e.target.value)}
                  placeholder="Resumyx"
                  className={inputClass}
                />
                <p className="mt-1 text-xs text-slate-500">Your app name for OpenRouter attribution</p>
              </div>
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex gap-3">
          <button
            onClick={handleSave}
            disabled={saving || !apiKey || !selectedModel}
            className={`flex-1 py-4 rounded-xl font-semibold text-sm flex items-center justify-center gap-3 transition-all duration-200 shadow-lg ${
              saving || !apiKey || !selectedModel
                ? 'bg-slate-100 text-slate-400 cursor-not-allowed'
                : 'bg-gradient-to-r from-blue-600 to-purple-600 text-white hover:shadow-xl hover:-translate-y-0.5 active:scale-[0.98]'
            }`}
          >
            {saving ? (
              <>
                <i className="fas fa-circle-notch fa-spin"></i>
                <span>Saving...</span>
              </>
            ) : (
              <>
                <i className="fas fa-save"></i>
                <span>Save Settings</span>
              </>
            )}
          </button>
          <button
            onClick={handleResetToDefault}
            disabled={saving}
            className="px-6 py-4 rounded-xl font-semibold text-sm text-slate-600 bg-slate-100 hover:bg-slate-200 transition-all duration-200 flex items-center gap-2"
          >
            <i className="fas fa-undo"></i>
            <span>Reset to Default</span>
          </button>
        </div>
      </div>

      {/* Information Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-5">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-lg bg-blue-600 flex items-center justify-center text-white">
              <i className="fas fa-shield-alt"></i>
            </div>
            <h3 className="font-bold text-blue-900 text-sm">Secure Storage</h3>
          </div>
          <p className="text-xs text-blue-800 leading-relaxed">
            Your API keys are encrypted using industry-standard encryption and stored securely in our database.
          </p>
        </div>

        <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-5">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-lg bg-emerald-600 flex items-center justify-center text-white">
              <i className="fas fa-sync-alt"></i>
            </div>
            <h3 className="font-bold text-emerald-900 text-sm">Instant Updates</h3>
          </div>
          <p className="text-xs text-emerald-800 leading-relaxed">
            Changes take effect immediately. All AI operations will use your selected provider and model.
          </p>
        </div>

        <div className="bg-purple-50 border border-purple-200 rounded-xl p-5">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-lg bg-purple-600 flex items-center justify-center text-white">
              <i className="fas fa-exchange-alt"></i>
            </div>
            <h3 className="font-bold text-purple-900 text-sm">Switch Anytime</h3>
          </div>
          <p className="text-xs text-purple-800 leading-relaxed">
            You can change providers or models at any time. Previous settings are safely replaced.
          </p>
        </div>
      </div>
    </div>
  );
};

export default AISettingsPage;
