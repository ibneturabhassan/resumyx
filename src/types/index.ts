
export interface Experience {
  id: string;
  company: string;
  role: string;
  location: string;
  startDate: string;
  endDate: string;
  description: string[];
}

export interface Education {
  id: string;
  institution: string;
  degree: string;
  location: string;
  graduationDate: string;
}

export interface Project {
  id: string;
  name: string;
  technologies: string[];
  description: string[];
}

export interface ResumeData {
  personalInfo: {
    fullName: string;
    email: string;
    phone: string;
    location: string;
    linkedin: string;
    github: string;
  };
  additionalInfo: string;
  coverLetter: string;
  skillsRaw?: string;
  skills: {
    languages: string[];
    databases: string[];
    cloud: string[];
    tools: string[];
  };
  experience: Experience[];
  education: Education[];
  projects: Project[];
  certifications: string[];
}

export interface TailoredResumeData {
  personalInfo: {
    fullName: string;
    email: string;
    phone: string;
    location: string;
    linkedin: string;
    github: string;
  };
  summary: string;
  coverLetter: string;
  skills: {
    languages: string[];
    databases: string[];
    cloud: string[];
    tools: string[];
  };
  experience: Experience[];
  education: Education[];
  projects: Project[];
  certifications: string[];
}

export enum ViewMode {
  PROFILE = 'profile',
  AI_BUILD = 'ai_build',
  COVER_LETTER = 'cover_letter',
  PROPOSAL = 'proposal',
  DIAGNOSTICS = 'diagnostics'
}

export enum GenerationType {
  SUMMARY = 'summary',
  FULL = 'full',
  COVER_LETTER = 'cover_letter'
}
