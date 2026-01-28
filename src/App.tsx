
import React, { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';
import ProfilePage from './components/ProfilePage';
import AIBuildPage from './components/AIBuildPage';
import SettingsPage from './components/SettingsPage';
import CoverLetterPage from './components/CoverLetterPage';
import WorkflowPage from './components/WorkflowPage';
import ResumePreview from './components/ResumePreview';
import CoverLetterPreview from './components/CoverLetterPreview';
import AuthPage from './components/AuthPage';
import LandingPage from './components/LandingPage';
import { ResumeData, ViewMode } from './types/index';
import { apiService } from './services/apiService';
import { AuthProvider, useAuth } from './contexts/AuthContext';

const PROFILE_KEY = 'resumyx_profile_data_v1';
const JD_KEY = 'resumyx_target_jd_v1';

// Simple user ID generation (stored in localStorage)
const getUserId = (): string => {
  let userId = localStorage.getItem('resumyx_user_id');
  if (!userId) {
    userId = `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    localStorage.setItem('resumyx_user_id', userId);
  }
  return userId;
};

const initialData: ResumeData = {
  personalInfo: {
    fullName: 'Alex Rivera',
    email: 'alex.rivera.dev@example.com',
    phone: '(555) 123-4567',
    location: 'San Francisco, CA',
    linkedin: 'linkedin.com/in/alexrivera-data',
    github: 'github.com/arivera-data'
  },
  additionalInfo: 'I have 6+ years of experience in data engineering, specializing in building scalable ETL pipelines and distributed systems. I am passionate about optimizing data workflows and have a strong background in cloud architecture. I have led multiple teams and mentored junior engineers. I am looking for senior or lead data engineering roles where I can make significant impact on data infrastructure.',
  coverLetter: '',
  skills: {
    languages: ['Python', 'SQL', 'Scala', 'Java', 'Go'],
    databases: ['PostgreSQL', 'MongoDB', 'Redis', 'Cassandra', 'Elasticsearch'],
    cloud: ['AWS (S3, Redshift, Lambda, EMR)', 'GCP (BigQuery, GCS)', 'Snowflake', 'Databricks'],
    tools: ['Apache Spark', 'Apache Kafka', 'Airflow', 'Terraform', 'Docker', 'Kubernetes', 'dbt']
  },
  experience: [
    {
      id: 'exp1',
      company: 'DataStream Systems',
      role: 'Senior Data Engineer',
      location: 'Palo Alto, CA',
      startDate: 'Jan 2021',
      endDate: 'Present',
      description: [
        'Architected and implemented a real-time data processing pipeline using Spark Streaming and Kafka, processing 500M+ events daily.',
        'Migrated legacy on-premise Hadoop cluster to AWS Redshift, resulting in a 30% reduction in monthly infrastructure costs.',
        'Developed custom Airflow operators to automate complex ETL workflows, improving deployment speed by 50%.',
        'Optimized SQL queries and indexing strategies for multi-terabyte datasets, reducing report generation time from hours to minutes.'
      ]
    }
  ],
  education: [
    {
      id: 'edu1',
      institution: 'Georgia Institute of Technology',
      degree: 'Master of Science in Computer Science',
      location: 'Atlanta, GA',
      graduationDate: 'May 2018'
    }
  ],
  projects: [],
  certifications: ['AWS Certified Data Engineer']
};

const safeLoad = (key: string, defaultVal: any): any => {
  const saved = localStorage.getItem(key);
  if (!saved) return defaultVal;
  try {
    return JSON.parse(saved);
  } catch (e) {
    return defaultVal;
  }
};

const MainApp: React.FC = () => {
  const { isAuthenticated, loading: authLoading, user, logout } = useAuth();
  const [showAuthPage, setShowAuthPage] = useState(false);
  const [authMode, setAuthMode] = useState<'login' | 'register'>('login');
  const [profileData, setProfileData] = useState<ResumeData>(() => safeLoad(PROFILE_KEY, initialData));
  const [targetJd, setTargetJd] = useState<string>(() => localStorage.getItem(JD_KEY) || '');
  const [targetInstructions, setTargetInstructions] = useState<string>('');
  const [previewData, setPreviewData] = useState<ResumeData>(profileData);
  const [view, setView] = useState<ViewMode>(ViewMode.PROFILE);
  const [activeAgent, setActiveAgent] = useState<string | null>(null);
  const [matchScore, setMatchScore] = useState<number | null>(null);
  const [scale, setScale] = useState(0.8);
  const [isLoading, setIsLoading] = useState(true);
  const [isSyncing, setIsSyncing] = useState(false);
  const previewContainerRef = useRef<HTMLDivElement>(null);
  const userId = getUserId();

  const handleNavigateToAuth = (mode: 'login' | 'register') => {
    setAuthMode(mode);
    setShowAuthPage(true);
  };

  // Load data from backend on mount
  useEffect(() => {
    const loadFromBackend = async () => {
      setIsLoading(true);
      try {
        const response = await apiService.getProfile(userId);

        if (response && response.profile_data) {
          // Use backend data if available
          setProfileData(response.profile_data);
          setPreviewData(response.profile_data);
          setTargetJd(response.target_jd || '');
          // Also save to localStorage as backup
          localStorage.setItem(PROFILE_KEY, JSON.stringify(response.profile_data));
          localStorage.setItem(JD_KEY, response.target_jd || '');
        } else {
          // No data in backend, check localStorage
          const localProfile = safeLoad(PROFILE_KEY, null);
          const localJd = localStorage.getItem(JD_KEY) || '';

          if (localProfile) {
            // Migrate from localStorage to backend
            setProfileData(localProfile);
            setPreviewData(localProfile);
            setTargetJd(localJd);
            await apiService.saveProfile(userId, localProfile, localJd);
          } else {
            // Use initial data
            setProfileData(initialData);
            setPreviewData(initialData);
          }
        }
      } catch (error) {
        console.error('Error loading from backend:', error);
        // Fallback to localStorage
        const localProfile = safeLoad(PROFILE_KEY, initialData);
        const localJd = localStorage.getItem(JD_KEY) || '';
        setProfileData(localProfile);
        setPreviewData(localProfile);
        setTargetJd(localJd);
      } finally {
        setIsLoading(false);
      }
    };

    loadFromBackend();
  }, [userId]);

  // Save to both localStorage and backend when profileData changes
  useEffect(() => {
    if (isLoading) return; // Don't save during initial load

    const saveData = async () => {
      localStorage.setItem(PROFILE_KEY, JSON.stringify(profileData));

      try {
        setIsSyncing(true);
        await apiService.saveProfile(userId, profileData, targetJd);
        setIsSyncing(false);
      } catch (error) {
        console.error('Error syncing profile:', error);
        setIsSyncing(false);
      }
    };

    saveData();
  }, [profileData, userId, isLoading]);

  // Save targetJd to both localStorage and backend
  useEffect(() => {
    if (isLoading) return; // Don't save during initial load

    const saveJd = async () => {
      localStorage.setItem(JD_KEY, targetJd);

      try {
        setIsSyncing(true);
        await apiService.saveProfile(userId, profileData, targetJd);
        setIsSyncing(false);
      } catch (error) {
        console.error('Error syncing job description:', error);
        setIsSyncing(false);
      }
    };

    saveJd();
  }, [targetJd, userId, profileData, isLoading]);

  useEffect(() => {
    const handleResize = () => {
      if (previewContainerRef.current) {
        const containerWidth = previewContainerRef.current.clientWidth - 60;
        const newScale = Math.min(containerWidth / 800, 1);
        setScale(newScale);
      }
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);

  const handleDownload = () => {
    // Use browser's native print dialog for perfect PDF generation
    window.print();
  };

  const handleReset = async () => {
    if (confirm('Are you sure you want to reset your profile data? This will delete your data from the database.')) {
      setProfileData(initialData);
      setPreviewData(initialData);
      setTargetJd('');
      setTargetInstructions('');
      setMatchScore(null);
      localStorage.removeItem(PROFILE_KEY);
      localStorage.removeItem(JD_KEY);

      // Also delete from backend
      try {
        await apiService.deleteProfile(userId);
      } catch (error) {
        console.error('Error deleting profile from backend:', error);
      }
    }
  };

  const navItemClass = (mode: ViewMode) => `
    w-full flex items-center justify-center rounded-lg transition-all duration-200
    ${view === mode
      ? 'bg-blue-600 text-white'
      : 'text-slate-400 hover:text-slate-600 hover:bg-slate-50'
    }
  `;

  const navLabels: Record<ViewMode, string> = {
    [ViewMode.PROFILE]: 'Profile',
    [ViewMode.AI_BUILD]: 'Tailor',
    [ViewMode.COVER_LETTER]: 'Letter',
    [ViewMode.WORKFLOW]: 'Workflow',
    [ViewMode.DIAGNOSTICS]: 'Settings'
  };

  // Show loading while checking authentication
  if (authLoading) {
    return (
      <div className="min-h-screen bg-slate-100 flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="w-16 h-16 rounded-xl bg-blue-600 flex items-center justify-center text-white text-2xl mx-auto">
            <i className="fas fa-circle-notch fa-spin"></i>
          </div>
          <h2 className="text-xl font-bold text-slate-800">Loading...</h2>
        </div>
      </div>
    );
  }

  // Show landing page or auth page if not authenticated
  if (!isAuthenticated) {
    if (showAuthPage) {
      return (
        <div>
          <button
            onClick={() => setShowAuthPage(false)}
            className="absolute top-6 left-6 z-50 px-4 py-2 text-sm font-medium text-slate-600 hover:text-slate-900 flex items-center gap-2 bg-white rounded-lg shadow-md hover:shadow-lg transition-all duration-200"
          >
            <i className="fas fa-arrow-left"></i>
            <span>Back to Home</span>
          </button>
          <AuthPage />
        </div>
      );
    }
    return <LandingPage onNavigateToAuth={handleNavigateToAuth} />;
  }

  // Show loading for profile data
  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-100 flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="w-16 h-16 rounded-xl bg-blue-600 flex items-center justify-center text-white text-2xl mx-auto">
            <i className="fas fa-circle-notch fa-spin"></i>
          </div>
          <h2 className="text-xl font-bold text-slate-800">Loading your profile...</h2>
          <p className="text-sm text-slate-500">Syncing with database</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-100 flex overflow-hidden relative">
      {createPortal(
        view === ViewMode.COVER_LETTER
          ? <CoverLetterPreview data={previewData} />
          : <ResumePreview data={previewData} />,
        document.getElementById('print-portal-root')!
      )}

      <aside className="no-print w-[72px] flex flex-col items-center py-6 bg-white border-r border-slate-200 sticky top-0 h-screen z-50 shrink-0">
        <div
          className="w-10 h-10 bg-slate-900 rounded-lg flex items-center justify-center text-white font-bold text-base mb-8 cursor-pointer hover:bg-slate-800 transition-colors"
          onClick={() => setView(ViewMode.PROFILE)}
        >
          R
        </div>
        <nav className="flex-1 flex flex-col gap-1 w-full px-2">
          {[
            { mode: ViewMode.PROFILE, icon: 'fa-user' },
            { mode: ViewMode.AI_BUILD, icon: 'fa-wand-magic-sparkles' },
            { mode: ViewMode.COVER_LETTER, icon: 'fa-file-lines' },
            { mode: ViewMode.WORKFLOW, icon: 'fa-diagram-project' },
            { mode: ViewMode.DIAGNOSTICS, icon: 'fa-gear' }
          ].map(({ mode, icon }) => (
            <button
              key={mode}
              onClick={() => setView(mode)}
              className={`${navItemClass(mode)} flex-col gap-1 py-3`}
              title={navLabels[mode]}
            >
              <i className={`fas ${icon} text-sm`}></i>
              <span className="text-[10px] font-medium">
                {navLabels[mode]}
              </span>
            </button>
          ))}
        </nav>

        {/* User menu at bottom */}
        <div className="w-full px-2 pb-2">
          <button
            onClick={logout}
            className="w-full py-3 flex flex-col items-center justify-center gap-1 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all duration-200"
            title={`Logout (${user?.email})`}
          >
            <i className="fas fa-sign-out-alt text-sm"></i>
            <span className="text-[10px] font-medium">Logout</span>
          </button>
        </div>
      </aside>

      <main className="flex-1 flex min-w-0 no-print">
        <div className="flex-1 overflow-y-auto px-8 py-8 xl:px-12 xl:py-10 bg-slate-100">
          <div className="max-w-4xl mx-auto">
            <header className="mb-8">
              <div className="flex items-center justify-between">
                <div>
                  <h1 className="text-lg font-semibold text-slate-800">
                    {view === ViewMode.PROFILE ? 'Your Profile' :
                     view === ViewMode.AI_BUILD ? 'AI Resume Tailor' :
                     view === ViewMode.COVER_LETTER ? 'Cover Letter' :
                     view === ViewMode.WORKFLOW ? 'Workflow Designer' :
                     'Settings'}
                  </h1>
                  <p className="text-sm text-slate-500 mt-1">
                    {view === ViewMode.PROFILE ? 'Manage your personal information and experience' :
                     view === ViewMode.AI_BUILD ? 'Optimize your resume for any job description' :
                     view === ViewMode.COVER_LETTER ? 'Generate a personalized cover letter' :
                     view === ViewMode.WORKFLOW ? 'Visualize and customize the AI optimization workflow' :
                     'AI configuration, account security, and system diagnostics'}
                  </p>
                </div>
                <div className="flex items-center gap-2 text-xs text-slate-500">
                  {isSyncing ? (
                    <>
                      <i className="fas fa-circle-notch fa-spin text-blue-500"></i>
                      <span>Syncing...</span>
                    </>
                  ) : (
                    <>
                      <i className="fas fa-cloud-check text-emerald-500"></i>
                      <span>Synced</span>
                    </>
                  )}
                </div>
              </div>
            </header>

            {view === ViewMode.PROFILE && <ProfilePage data={profileData} onChange={(data) => { setProfileData(data); setPreviewData(data); }} />}
            {view === ViewMode.AI_BUILD && (
              <AIBuildPage
                profileData={profileData}
                jd={targetJd}
                setJd={setTargetJd}
                onResult={(res) => { setProfileData(res); setPreviewData(res); }}
                onAgentChange={setActiveAgent}
                onScoreUpdate={setMatchScore}
                onProceed={() => setView(ViewMode.COVER_LETTER)}
              />
            )}
            {view === ViewMode.COVER_LETTER && (
              <CoverLetterPage
                profileData={profileData}
                jd={targetJd}
                setJd={setTargetJd}
                instructions={targetInstructions}
                setInstructions={setTargetInstructions}
                onUpdate={(letter) => { setProfileData({ ...profileData, coverLetter: letter }); setPreviewData({ ...profileData, coverLetter: letter }); }}
                onAgentChange={setActiveAgent}
              />
            )}
            {view === ViewMode.WORKFLOW && <WorkflowPage />}
            {view === ViewMode.DIAGNOSTICS && <SettingsPage />}
          </div>
        </div>

        {view !== ViewMode.WORKFLOW && (
          <div
            ref={previewContainerRef}
            className="hidden lg:flex w-[450px] xl:w-[550px] 2xl:w-[700px] bg-slate-100 border-l border-slate-200 overflow-hidden flex-col"
          >
            <div className="h-14 bg-white border-b border-slate-100 px-6 flex items-center justify-between shrink-0">
              <div className="flex items-center gap-3">
                <span className="text-xs font-semibold text-slate-500">
                  {view === ViewMode.COVER_LETTER ? 'Cover Letter Preview' : 'Resume Preview'}
                </span>
                {view !== ViewMode.COVER_LETTER && matchScore !== null && (
                  <div className="bg-emerald-50 text-emerald-600 px-2.5 py-1 rounded-md border border-emerald-100 flex items-center gap-1.5">
                    <i className="fas fa-check-circle text-xs"></i>
                    <span className="text-xs font-semibold">{matchScore}% Match</span>
                  </div>
                )}
              </div>

              <button
                onClick={handleDownload}
                disabled={isGeneratingPdf}
                className="bg-slate-900 text-white px-4 py-2 rounded-lg font-semibold text-xs shadow-md hover:bg-slate-800 hover:shadow-lg active:scale-[0.98] transition-all duration-200 flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isGeneratingPdf ? (
                  <>
                    <i className="fas fa-circle-notch fa-spin"></i>
                    <span>Generating...</span>
                  </>
                ) : (
                  <>
                    <i className="fas fa-download"></i>
                    <span>Export PDF</span>
                  </>
                )}
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-8 custom-scrollbar flex justify-center bg-slate-100">
              <div
                style={{ transform: `scale(${scale})`, transformOrigin: 'top center' }}
                className="transition-transform duration-300"
              >
                <div className="shadow-2xl rounded-lg overflow-hidden">
                   {view === ViewMode.COVER_LETTER
                     ? <CoverLetterPreview data={previewData} />
                     : <ResumePreview data={previewData} highlightedSection={activeAgent} />
                   }
                </div>
                <div className="h-32 w-full"></div>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

// Wrap MainApp with AuthProvider
const App: React.FC = () => {
  return (
    <AuthProvider>
      <MainApp />
    </AuthProvider>
  );
};

export default App;
