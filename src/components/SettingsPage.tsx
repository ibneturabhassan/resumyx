import React, { useState, useEffect } from 'react';
import { apiService } from '../services/apiService';
import { AIProvider, AIProviderInfo, AIProviderConfig } from '../types/ai-config';
import { useAuth } from '../contexts/AuthContext';
import WorkflowPage from './WorkflowPage';

const fallbackProviders: AIProviderInfo[] = [
  {
    value: 'gemini',
    label: 'Google Gemini',
    description: 'Google\'s multimodal AI models',
    requiresKey: true,
    models: [
      { value: 'gemini-2.0-flash-exp', label: 'Gemini 2.0 Flash (Experimental)', description: 'Fast and efficient' },
      { value: 'gemini-1.5-pro', label: 'Gemini 1.5 Pro', description: 'Most capable' },
      { value: 'gemini-1.5-flash', label: 'Gemini 1.5 Flash', description: 'Fast responses' }
    ]
  },
  {
    value: 'openai',
    label: 'OpenAI',
    description: 'GPT models for natural language',
    requiresKey: true,
    models: [
      { value: 'gpt-4o', label: 'GPT-4o', description: 'Most capable, multimodal' },
      { value: 'gpt-4o-mini', label: 'GPT-4o Mini', description: 'Affordable and intelligent' },
      { value: 'gpt-4-turbo', label: 'GPT-4 Turbo', description: 'Previous flagship' },
      { value: 'gpt-3.5-turbo', label: 'GPT-3.5 Turbo', description: 'Fast and affordable' }
    ]
  },
  {
    value: 'openrouter',
    label: 'OpenRouter',
    description: 'Access multiple AI models',
    requiresKey: true,
    models: [
      { value: 'anthropic/claude-3.5-sonnet', label: 'Claude 3.5 Sonnet', description: 'Best overall' },
      { value: 'anthropic/claude-3-opus', label: 'Claude 3 Opus', description: 'Most capable' },
      { value: 'openai/gpt-4o', label: 'GPT-4o', description: 'Via OpenRouter' },
      { value: 'google/gemini-pro-1.5', label: 'Gemini Pro 1.5', description: 'Via OpenRouter' },
      { value: 'meta-llama/llama-3.1-70b-instruct', label: 'Llama 3.1 70B', description: 'Open source' },
      { value: 'mistralai/mixtral-8x7b-instruct', label: 'Mixtral 8x7B', description: 'Fast and capable' }
    ]
  }
];

interface Props {
  onResetProfile?: () => void;
}

const SettingsPage: React.FC<Props> = ({ onResetProfile }) => {
  const { session } = useAuth();
  const [activeTab, setActiveTab] = useState<'ai' | 'account' | 'workflow' | 'system'>('ai');

  // AI Settings State
  const [providers, setProviders] = useState<AIProviderInfo[]>([]);
  const [selectedProvider, setSelectedProvider] = useState<AIProvider>('gemini');
  const [apiKey, setApiKey] = useState('');
  const [selectedModel, setSelectedModel] = useState('');
  const [showApiKey, setShowApiKey] = useState(false);
  const [siteUrl, setSiteUrl] = useState('');
  const [appName, setAppName] = useState('Resumyx');
  const [aiLoading, setAiLoading] = useState(true);
  const [aiSaving, setAiSaving] = useState(false);

  // Password Change State
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPasswords, setShowPasswords] = useState(false);
  const [passwordSaving, setPasswordSaving] = useState(false);

  // System Test State
  const [logs, setLogs] = useState<string[]>([]);
  const [testing, setTesting] = useState(false);
  const [status, setStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [aiProvider, setAiProvider] = useState('Not configured');
  const [aiModel, setAiModel] = useState('Select a model in AI settings');
  const [systemAiLoading, setSystemAiLoading] = useState(true);

  // Message State
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

  useEffect(() => {
    loadProviders();
    loadCurrentSettings();
    loadSystemInfo();
  }, []);

  const loadProviders = async () => {
    try {
      const response = await apiService.getAIProviders();
      if (response?.providers?.length) {
        setProviders(response.providers);
      } else {
        setProviders(fallbackProviders);
      }
    } catch (error) {
      console.error('Error loading providers:', error);
      setProviders(fallbackProviders);
    }
  };

  const loadCurrentSettings = async () => {
    try {
      setAiLoading(true);
      const settings = await apiService.getAISettings();
      if (settings.provider) {
        setSelectedProvider(settings.provider);
        setSelectedModel(settings.model || '');
        if (settings.site_url) setSiteUrl(settings.site_url);
        if (settings.app_name) setAppName(settings.app_name);
      }
    } catch (error) {
      console.error('Error loading settings:', error);
    } finally {
      setAiLoading(false);
    }
  };

  const loadSystemInfo = async () => {
    try {
      const settings = await apiService.getAISettings();
      if (settings?.provider) {
        const providerLabels: Record<string, string> = {
          gemini: 'Gemini',
          openai: 'OpenAI',
          openrouter: 'OpenRouter'
        };
        setAiProvider(providerLabels[settings.provider] || settings.provider);
      }
      if (settings?.model) {
        setAiModel(settings.model);
      }
    } catch (error) {
      console.error('Error loading system info:', error);
    } finally {
      setSystemAiLoading(false);
    }
  };

  const handleProviderChange = (provider: AIProvider) => {
    setSelectedProvider(provider);
    const providerInfo = providers.find(p => p.value === provider);
    if (providerInfo && providerInfo.models.length > 0) {
      setSelectedModel(providerInfo.models[0].value);
    }
    setApiKey('');
  };

  const handleAISave = async () => {
    if (!apiKey.trim()) {
      showMessage('error', 'Please enter an API key');
      return;
    }

    if (!selectedModel) {
      showMessage('error', 'Please select a model');
      return;
    }

    setAiSaving(true);
    try {
      const config: AIProviderConfig = {
        provider: selectedProvider,
        api_key: apiKey,
        model: selectedModel,
      };

      if (selectedProvider === 'openrouter') {
        if (siteUrl) config.site_url = siteUrl;
        if (appName) config.app_name = appName;
      }

      await apiService.saveAISettings(config);
      showMessage('success', 'AI settings saved successfully!');
      setApiKey('');
      // Reload system info
      await loadSystemInfo();
    } catch (error: any) {
      showMessage('error', error.message || 'Failed to save settings');
    } finally {
      setAiSaving(false);
    }
  };

  const handleAIReset = async () => {
    if (!confirm('Delete your AI settings? You will need to reconfigure before using AI features.')) {
      return;
    }

    setAiSaving(true);
    try {
      await apiService.deleteAISettings();
      setSelectedProvider('gemini');
      setApiKey('');
      setSelectedModel('');
      setSiteUrl('');
      setAppName('Resumyx');
      showMessage('success', 'AI settings removed.');
      await loadSystemInfo();
    } catch (error: any) {
      showMessage('error', error.message || 'Failed to delete settings');
    } finally {
      setAiSaving(false);
    }
  };

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!currentPassword || !newPassword || !confirmPassword) {
      showMessage('error', 'Please fill in all password fields');
      return;
    }

    if (newPassword !== confirmPassword) {
      showMessage('error', 'New passwords do not match');
      return;
    }

    if (newPassword.length < 6) {
      showMessage('error', 'New password must be at least 6 characters');
      return;
    }

    setPasswordSaving(true);
    try {
      const API_URL = import.meta.env.VITE_API_URL ||
        (import.meta.env.MODE === 'production'
          ? 'https://resumyx-api.onrender.com/api'
          : 'http://localhost:8000/api');

      const response = await fetch(`${API_URL}/auth/change-password`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session?.access_token}`
        },
        body: JSON.stringify({
          current_password: currentPassword,
          new_password: newPassword
        })
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.detail || 'Failed to change password');
      }

      showMessage('success', 'Password changed successfully!');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (error: any) {
      showMessage('error', error.message || 'Failed to change password');
    } finally {
      setPasswordSaving(false);
    }
  };

  const runTest = async () => {
    setTesting(true);
    setStatus('idle');
    setLogs(["Initializing System Health Check..."]);

    const addLog = (msg: string) => {
      setLogs(prev => [...prev, `[${new Date().toLocaleTimeString()}] ${msg}`]);
    };

    try {
      addLog("Testing backend API connection...");
      const healthCheck = await apiService.healthCheck();

      if (healthCheck && healthCheck.status === 'healthy') {
        addLog("✅ Backend API connection successful");
        addLog(`📡 Service: ${healthCheck.service || 'resumyx-api'}`);
        addLog("✅ All backend services (AI, Database) are operational");
        setStatus('success');
      } else {
        addLog("⚠️ Backend API responded but status unclear");
        setStatus('error');
      }
    } catch (error: any) {
      addLog(`❌ Backend API connection failed: ${error.message}`);
      addLog("💡 Make sure the backend server is running");
      setStatus('error');
    }

    setTesting(false);
  };

  const showMessage = (type: 'success' | 'error', text: string) => {
    setMessage({ type, text });
    setTimeout(() => setMessage(null), 5000);
  };

  const currentProvider = providers.find(p => p.value === selectedProvider);
  const availableModels = currentProvider?.models || [];

  const inputClass = "w-full p-3.5 bg-slate-50/80 border border-slate-200 rounded-xl focus:ring-4 focus:ring-blue-500/20 focus:border-blue-400 focus:bg-white focus:outline-none transition-all duration-200 text-sm text-slate-800 shadow-sm placeholder-slate-400 hover:border-slate-300";
  const labelClass = "block text-xs font-semibold text-slate-500 uppercase mb-2.5 tracking-wide";
  const sectionClass = "bg-white p-8 rounded-2xl shadow-md border border-slate-100";

  return (
    <div className="max-w-5xl mx-auto space-y-6 animate-in fade-in zoom-in-95 duration-500 py-4">
      {/* Header */}
      <div className="text-center space-y-4">
        <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-blue-600 to-purple-600 flex items-center justify-center text-white text-2xl mx-auto shadow-lg">
          <i className="fas fa-cog"></i>
        </div>
        <h2 className="text-2xl font-bold text-slate-800 tracking-tight">Settings</h2>
        <p className="text-slate-500 text-sm">Manage your AI provider, account security, and system diagnostics</p>
      </div>

      {/* Success/Error Message */}
      {message && (
        <div className={`p-4 rounded-xl border ${
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

      {/* Tabs */}
      <div className="flex gap-2 p-1.5 bg-slate-100 rounded-xl">
        <button
          onClick={() => setActiveTab('ai')}
          className={`flex-1 py-3 px-4 rounded-lg font-semibold text-sm transition-all duration-200 flex items-center justify-center gap-2 ${
            activeTab === 'ai'
              ? 'bg-white text-blue-600 shadow-md'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <i className="fas fa-robot"></i>
          <span>AI Provider</span>
        </button>
        <button
          onClick={() => setActiveTab('account')}
          className={`flex-1 py-3 px-4 rounded-lg font-semibold text-sm transition-all duration-200 flex items-center justify-center gap-2 ${
            activeTab === 'account'
              ? 'bg-white text-blue-600 shadow-md'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <i className="fas fa-user-shield"></i>
          <span>Account</span>
        </button>
        <button
          onClick={() => setActiveTab('workflow')}
          className={`flex-1 py-3 px-4 rounded-lg font-semibold text-sm transition-all duration-200 flex items-center justify-center gap-2 ${
            activeTab === 'workflow'
              ? 'bg-white text-blue-600 shadow-md'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <i className="fas fa-diagram-project"></i>
          <span>Workflow</span>
        </button>
        <button
          onClick={() => setActiveTab('system')}
          className={`flex-1 py-3 px-4 rounded-lg font-semibold text-sm transition-all duration-200 flex items-center justify-center gap-2 ${
            activeTab === 'system'
              ? 'bg-white text-blue-600 shadow-md'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <i className="fas fa-satellite-dish"></i>
          <span>System</span>
        </button>
      </div>

      {/* AI Provider Tab */}
      {activeTab === 'ai' && !aiLoading && (
        <div className="space-y-6">
          <div className={sectionClass}>
            <div className="flex items-start gap-4 mb-6 pb-6 border-b border-slate-100">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-600 to-blue-600 flex items-center justify-center text-white flex-shrink-0">
                <i className="fas fa-robot text-xl"></i>
              </div>
              <div className="flex-1">
                <h3 className="text-xl font-bold text-slate-800 mb-2">AI Provider Configuration</h3>
                <p className="text-slate-600 text-sm leading-relaxed">
                  Choose your preferred AI provider and model. Your API key is encrypted and stored securely.
                </p>
              </div>
            </div>

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
                        <h4 className="font-bold text-slate-800 text-sm">{provider.label}</h4>
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
            </div>

            {/* API Key Input */}
            <div className="mb-6">
              <label className={labelClass}>API Key</label>
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
              <p className="mt-3 text-xs text-slate-600 flex items-start gap-2">
                <i className="fas fa-lock mt-0.5 flex-shrink-0"></i>
                <span>Your API key is encrypted and stored securely. Get your key from:{' '}
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

            {/* OpenRouter Specific Fields */}
            {selectedProvider === 'openrouter' && (
              <div className="mb-6 p-4 bg-slate-50 rounded-xl border border-slate-200">
                <h4 className="text-sm font-semibold text-slate-700 mb-4 flex items-center gap-2">
                  <i className="fas fa-cog"></i>
                  OpenRouter Configuration (Optional)
                </h4>
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
                  </div>
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex gap-3">
              <button
                onClick={handleAISave}
                disabled={aiSaving || !apiKey || !selectedModel}
                className={`flex-1 py-4 rounded-xl font-semibold text-sm flex items-center justify-center gap-3 transition-all duration-200 shadow-lg ${
                  aiSaving || !apiKey || !selectedModel
                    ? 'bg-slate-100 text-slate-400 cursor-not-allowed'
                    : 'bg-gradient-to-r from-blue-600 to-purple-600 text-white hover:shadow-xl hover:-translate-y-0.5 active:scale-[0.98]'
                }`}
              >
                {aiSaving ? (
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
                onClick={handleAIReset}
                disabled={aiSaving}
                className="px-6 py-4 rounded-xl font-semibold text-sm text-slate-600 bg-slate-100 hover:bg-slate-200 transition-all duration-200 flex items-center gap-2"
              >
                <i className="fas fa-trash-alt"></i>
                <span>Delete</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Account Tab */}
      {activeTab === 'account' && (
        <div className={sectionClass}>
          <div className="flex items-start gap-4 mb-6 pb-6 border-b border-slate-100">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-emerald-600 to-green-600 flex items-center justify-center text-white flex-shrink-0">
              <i className="fas fa-key text-xl"></i>
            </div>
            <div className="flex-1">
              <h3 className="text-xl font-bold text-slate-800 mb-2">Change Password</h3>
              <p className="text-slate-600 text-sm leading-relaxed">
                Update your password to keep your account secure
              </p>
            </div>
          </div>

          <form onSubmit={handlePasswordChange} className="space-y-6">
            {/* Current Password */}
            <div>
              <label className={labelClass}>Current Password</label>
              <div className="relative">
                <input
                  type={showPasswords ? 'text' : 'password'}
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  placeholder="Enter your current password"
                  className={inputClass}
                  required
                />
              </div>
            </div>

            {/* New Password */}
            <div>
              <label className={labelClass}>New Password</label>
              <div className="relative">
                <input
                  type={showPasswords ? 'text' : 'password'}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Enter new password (min 6 characters)"
                  className={inputClass}
                  required
                  minLength={6}
                />
              </div>
            </div>

            {/* Confirm New Password */}
            <div>
              <label className={labelClass}>Confirm New Password</label>
              <div className="relative">
                <input
                  type={showPasswords ? 'text' : 'password'}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Confirm your new password"
                  className={inputClass}
                  required
                />
              </div>
            </div>

            {/* Show Passwords Toggle */}
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="showPasswords"
                checked={showPasswords}
                onChange={(e) => setShowPasswords(e.target.checked)}
                className="w-4 h-4 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
              />
              <label htmlFor="showPasswords" className="text-sm text-slate-600 cursor-pointer">
                Show passwords
              </label>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={passwordSaving}
              className={`w-full py-4 rounded-xl font-semibold text-sm flex items-center justify-center gap-3 transition-all duration-200 shadow-lg ${
                passwordSaving
                  ? 'bg-slate-100 text-slate-400 cursor-not-allowed'
                  : 'bg-gradient-to-r from-emerald-600 to-green-600 text-white hover:shadow-xl hover:-translate-y-0.5 active:scale-[0.98]'
              }`}
            >
              {passwordSaving ? (
                <>
                  <i className="fas fa-circle-notch fa-spin"></i>
                  <span>Changing Password...</span>
                </>
              ) : (
                <>
                  <i className="fas fa-check"></i>
                  <span>Change Password</span>
                </>
              )}
            </button>
          </form>
        </div>
      )}

      {/* Reset Profile Data Section */}
      {activeTab === 'account' && onResetProfile && (
        <div className={sectionClass}>
          <div className="flex items-start gap-4 mb-6 pb-6 border-b border-slate-100">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-red-600 to-orange-600 flex items-center justify-center text-white flex-shrink-0">
              <i className="fas fa-trash-restore text-xl"></i>
            </div>
            <div className="flex-1">
              <h3 className="text-xl font-bold text-slate-800 mb-2">Reset Profile Data</h3>
              <p className="text-slate-600 text-sm leading-relaxed">
                Clear all your profile information and start fresh. This will delete your personal info, experience, education, projects, skills, and certifications from both the database and local storage.
              </p>
            </div>
          </div>

          <div className="bg-red-50 border border-red-200 rounded-xl p-5 mb-6">
            <div className="flex gap-3">
              <i className="fas fa-exclamation-triangle text-red-600 mt-1"></i>
              <div>
                <h4 className="font-semibold text-red-900 mb-1 text-sm">Warning: This action cannot be undone!</h4>
                <p className="text-red-700 text-sm">
                  All your resume data will be permanently deleted. Make sure to download your resume before proceeding if you want to keep a copy.
                </p>
              </div>
            </div>
          </div>

          <button
            onClick={onResetProfile}
            className="w-full py-4 rounded-xl font-semibold text-sm flex items-center justify-center gap-3 transition-all duration-200 shadow-lg bg-gradient-to-r from-red-600 to-orange-600 text-white hover:shadow-xl hover:-translate-y-0.5 active:scale-[0.98]"
          >
            <i className="fas fa-trash-restore"></i>
            <span>Reset All Profile Data</span>
          </button>
        </div>
      )}

      {/* Workflow Tab */}
      {activeTab === 'workflow' && (
        <WorkflowPage />
      )}

      {/* System Tab */}
      {activeTab === 'system' && (
        <div className="space-y-6">
          <div className={sectionClass}>
            <div className="p-5 bg-slate-50/80 rounded-xl border border-slate-200 space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-600 uppercase tracking-wide">Environment Status</span>
                <span className="px-3 py-1.5 bg-emerald-50 text-emerald-600 text-xs font-semibold rounded-lg border border-emerald-100">Active</span>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 bg-white rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow duration-200">
                  <span className="block text-xs font-semibold text-slate-400 uppercase mb-1.5">Backend</span>
                  <span className="text-sm font-semibold text-slate-800">FastAPI</span>
                </div>
                <div className="p-4 bg-white rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow duration-200">
                  <span className="block text-xs font-semibold text-slate-400 uppercase mb-1.5">AI Provider</span>
                  <span className="text-sm font-semibold text-slate-800">{systemAiLoading ? 'Loading...' : aiProvider}</span>
                  <span className="text-xs text-slate-500 block mt-1">{systemAiLoading ? 'Loading model...' : aiModel}</span>
                </div>
              </div>
            </div>

            <button
              onClick={runTest}
              disabled={testing}
              className="w-full py-5 mt-6 bg-slate-900 text-white rounded-xl font-semibold text-base flex items-center justify-center gap-3 hover:bg-slate-800 transition-all duration-200 disabled:opacity-50 shadow-lg hover:shadow-xl active:scale-[0.98] hover:-translate-y-0.5"
            >
              {testing ? (
                <>
                  <i className="fas fa-circle-notch fa-spin"></i>
                  <span>Testing Connection...</span>
                </>
              ) : (
                <>
                  <i className="fas fa-plug"></i>
                  <span>Run Connection Test</span>
                </>
              )}
            </button>
          </div>

          {(logs.length > 0) && (
            <div className="bg-slate-800 rounded-2xl p-6 shadow-xl border border-slate-700">
              <div className="flex items-center gap-3 mb-4 pb-3 border-b border-slate-700">
                <div className="w-8 h-8 rounded-lg bg-slate-700 flex items-center justify-center">
                  <i className="fas fa-terminal text-emerald-400 text-sm"></i>
                </div>
                <span className="text-xs font-semibold text-slate-400 uppercase tracking-wide">Diagnostic Log</span>
                <div className={`ml-auto w-3 h-3 rounded-full ${status === 'success' ? 'bg-emerald-500' : status === 'error' ? 'bg-red-500' : 'bg-slate-500'}`}></div>
              </div>
              <div className="font-mono text-xs text-slate-400 space-y-1.5 h-56 overflow-y-auto custom-scrollbar pr-4">
                {logs.map((log, i) => (
                  <div key={i} className="flex gap-3 py-1 px-2 rounded hover:bg-slate-700/50 transition-colors">
                    <span className="text-slate-600 shrink-0 w-5">{i.toString().padStart(2, '0')}</span>
                    <span className={`${log.includes('FATAL') || log.includes('Error') || log.includes('❌') ? 'text-red-400' : log.includes('Success') || log.includes('✅') ? 'text-emerald-400' : 'text-slate-300'}`}>{log}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {aiLoading && activeTab === 'ai' && (
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center space-y-4">
            <div className="w-12 h-12 rounded-xl bg-blue-600 flex items-center justify-center text-white mx-auto">
              <i className="fas fa-circle-notch fa-spin"></i>
            </div>
            <p className="text-slate-600">Loading settings...</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default SettingsPage;
