import { ResumeData } from '../types';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';

class APIService {
  private async request(endpoint: string, options: RequestInit = {}) {
    const response = await fetch(`${API_URL}${endpoint}`, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ detail: 'Request failed' }));
      throw new Error(error.detail || 'Request failed');
    }

    return response.json();
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

  async tailorResume(profileData: ResumeData, jobDescription: string) {
    const response = await this.request('/ai/tailor-resume', {
      method: 'POST',
      body: JSON.stringify({
        profileData,
        jobDescription,
      }),
    });
    return response.tailoredResume;
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

  async healthCheck() {
    return this.request('/health');
  }
}

export const apiService = new APIService();
