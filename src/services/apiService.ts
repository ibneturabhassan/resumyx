import { ResumeData } from '../types/index';

const API_URL = import.meta.env.VITE_API_URL ||
  (import.meta.env.MODE === 'production'
    ? 'https://resumyx-api.onrender.com/api'
    : 'http://localhost:8000/api');

class APIService {
  private getAuthHeaders(): HeadersInit {
    const token = localStorage.getItem('access_token');
    return token ? { 'Authorization': `Bearer ${token}` } : {};
  }

  private async request(endpoint: string, options: RequestInit = {}) {
    const response = await fetch(`${API_URL}${endpoint}`, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...this.getAuthHeaders(),
        ...options.headers,
      },
    });

    // Handle 401 Unauthorized - token expired
    if (response.status === 401) {
      // Try to refresh token
      const refreshed = await this.tryRefreshToken();
      if (refreshed) {
        // Retry the original request with new token
        return this.request(endpoint, options);
      } else {
        // Refresh failed, redirect to login
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
        localStorage.removeItem('user');
        window.location.href = '/';
        throw new Error('Session expired. Please login again.');
      }
    }

    if (!response.ok) {
      const error = await response.json().catch(() => ({ detail: 'Request failed' }));
      throw new Error(error.detail || 'Request failed');
    }

    if (response.status === 204) {
      return null;
    }

    const contentType = response.headers.get('content-type') || '';
    if (contentType.includes('application/json')) {
      const text = await response.text();
      return text ? JSON.parse(text) : null;
    }

    return response.text();
  }

  private async tryRefreshToken(): Promise<boolean> {
    const refreshToken = localStorage.getItem('refresh_token');
    if (!refreshToken) return false;

    try {
      const response = await fetch(`${API_URL}/auth/refresh`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ refresh_token: refreshToken })
      });

      if (response.ok) {
        const data = await response.json();
        localStorage.setItem('access_token', data.access_token);
        localStorage.setItem('refresh_token', data.refresh_token);
        return true;
      }
    } catch (error) {
      console.error('Token refresh failed:', error);
    }

    return false;
  }

  // Profile endpoints
  async getProfile(userId: string) {
    return this.request(`/profile/${userId}`);
  }

  async saveProfile(userId: string, profileData: ResumeData, targetJd: string = '') {
    return this.request('/profile', {
      method: 'POST',
      body: JSON.stringify({
        userId,
        profileData,
        targetJd,
      }),
    });
  }

  async deleteProfile(userId: string) {
    return this.request(`/profile/${userId}`, {
      method: 'DELETE',
    });
  }

  // AI endpoints
  async generateSummary(experience: string) {
    const response = await this.request('/ai/generate-summary', {
      method: 'POST',
      body: JSON.stringify({ experience }),
    });
    return response.summary;
  }

  async tailorSummary(profileData: ResumeData, jobDescription: string) {
    const response = await this.request('/ai/tailor-summary', {
      method: 'POST',
      body: JSON.stringify({
        profileData,
        jobDescription,
      }),
    });
    return response.summary;
  }

  async tailorExperience(profileData: ResumeData, jobDescription: string) {
    const response = await this.request('/ai/tailor-experience', {
      method: 'POST',
      body: JSON.stringify({
        profileData,
        jobDescription,
      }),
    });
    return response.experience;
  }

  async tailorSkills(profileData: ResumeData, jobDescription: string) {
    const response = await this.request('/ai/tailor-skills', {
      method: 'POST',
      body: JSON.stringify({
        profileData,
        jobDescription,
      }),
    });
    return response.skills;
  }

  async tailorProjects(profileData: ResumeData, jobDescription: string) {
    const response = await this.request('/ai/tailor-projects', {
      method: 'POST',
      body: JSON.stringify({
        profileData,
        jobDescription,
      }),
    });
    return response.projects;
  }

  async tailorEducation(profileData: ResumeData, jobDescription: string) {
    const response = await this.request('/ai/tailor-education', {
      method: 'POST',
      body: JSON.stringify({
        profileData,
        jobDescription,
      }),
    });
    return response.education;
  }

  async tailorResume(profileData: ResumeData, jobDescription: string) {
    const response = await this.request('/ai/tailor-resume', {
      method: 'POST',
      body: JSON.stringify({
        profileData,
        jobDescription,
      }),
    });

    // Transform TailoredResumeData (with 'summary') to ResumeData (with 'additionalInfo')
    const tailored = response.tailoredResume;
    return {
      ...tailored,
      additionalInfo: tailored.summary || '',  // Map summary -> additionalInfo
      summary: undefined  // Remove summary field to avoid confusion
    };
  }

  async calculateATSScore(profileData: ResumeData, jobDescription: string) {
    return this.request('/ai/ats-score', {
      method: 'POST',
      body: JSON.stringify({
        profileData,
        jobDescription,
      }),
    });
  }

  async calculateATSScoreLLM(profileData: ResumeData, jobDescription: string) {
    return this.request('/ai/ats-score-llm', {
      method: 'POST',
      body: JSON.stringify({
        profileData,
        jobDescription,
      }),
    });
  }

  async generateCoverLetter(
    profileData: ResumeData,
    jobDescription: string,
    instructions: string = ''
  ) {
    const response = await this.request('/ai/generate-cover-letter', {
      method: 'POST',
      body: JSON.stringify({
        profileData,
        jobDescription,
        instructions,
      }),
    });
    return response.coverLetter;
  }

  async generateProposal(
    profileData: ResumeData,
    jobDescription: string
  ) {
    return this.request('/ai/generate-proposal', {
      method: 'POST',
      body: JSON.stringify({
        profileData,
        jobDescription,
      }),
    });
  }

  async healthCheck() {
    return this.request('/health');
  }

  // AI Settings endpoints
  async getAIProviders() {
    return this.request('/ai/providers');
  }

  async getAISettings() {
    return this.request('/ai/settings');
  }

  async saveAISettings(config: any) {
    return this.request('/ai/settings', {
      method: 'POST',
      body: JSON.stringify(config),
    });
  }

  async deleteAISettings() {
    return this.request('/ai/settings', {
      method: 'DELETE',
    });
  }
}

export const apiService = new APIService();
