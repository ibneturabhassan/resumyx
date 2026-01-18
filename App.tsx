
import React, { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import ProfilePage from './components/ProfilePage';
import AIBuildPage from './components/AIBuildPage';
import DiagnosticsPage from './components/DiagnosticsPage';
import CoverLetterPage from './components/CoverLetterPage';
import ResumePreview from './components/ResumePreview';
import CoverLetterPreview from './components/CoverLetterPreview';
import { ResumeData, ViewMode } from './types';

const PROFILE_KEY = 'resumyx_profile_data_v1';
const JD_KEY = 'resumyx_target_jd_v1';

const initialData: ResumeData = {
  personalInfo: {
    fullName: 'Alex Rivera',
    email: 'alex.rivera.dev@example.com',
    phone: '(555) 123-4567',
    location: 'San Francisco, CA',
    linkedin: 'linkedin.com/in/alexrivera-data',
    github: 'github.com/arivera-data'
  },
  summary: 'Senior Data Engineer with 6+ years of experience building scalable ETL pipelines and distributed systems. Expert in architecting high-performance data lakes and real-time streaming solutions using Spark, Kafka, and AWS. Proven track record of reducing data latency by 40% and optimizing cloud infrastructure costs.',
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

const App: React.FC = () => {
  const [profileData, setProfileData] = useState<ResumeData>(() => safeLoad(PROFILE_KEY, initialData));
  const [targetJd, setTargetJd] = useState<string>(() => localStorage.getItem(JD_KEY) || '');
  const [targetInstructions, setTargetInstructions] = useState<string>('');
  const [previewData, setPreviewData] = useState<ResumeData>(profileData);
  const [view, setView] = useState<ViewMode>(ViewMode.PROFILE);
  const [activeAgent, setActiveAgent] = useState<string | null>(null);
  const [matchScore, setMatchScore] = useState<number | null>(null);
  const [scale, setScale] = useState(0.8);
  const previewContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    localStorage.setItem(PROFILE_KEY, JSON.stringify(profileData));
  }, [profileData]);

  useEffect(() => {
    localStorage.setItem(JD_KEY, targetJd);
  }, [targetJd]);

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

  const handleDownload = () => {
    const originalTitle = document.title;
    const name = previewData.personalInfo.fullName.replace(/\s+/g, '_') || 'Candidate';
    const type = view === ViewMode.COVER_LETTER ? 'Cover_Letter' : 'Resume';
    document.title = `${name}_${type}`;
    window.print();
    setTimeout(() => { document.title = originalTitle; }, 500);
  };

  const handleReset = () => {
    if (confirm('Are you sure you want to reset your profile data?')) {
      setProfileData(initialData);
      setPreviewData(initialData);
      setTargetJd('');
      setTargetInstructions('');
      setMatchScore(null);
      localStorage.removeItem(PROFILE_KEY);
      localStorage.removeItem(JD_KEY);
    }
  };

  const navItemClass = (mode: ViewMode) => `
    w-12 h-12 xl:w-14 xl:h-14 flex items-center justify-center rounded-2xl transition-all duration-300 group relative
    ${view === mode 
      ? 'bg-blue-600 text-white shadow-xl shadow-blue-500/30 scale-105' 
      : 'text-slate-400 hover:text-slate-900 hover:bg-slate-100'
    }
  `;

  return (
    <div className="min-h-screen bg-[#f1f5f9] flex overflow-hidden relative">
      {createPortal(
        view === ViewMode.COVER_LETTER 
          ? <CoverLetterPreview data={previewData} />
          : <ResumePreview data={previewData} />,
        document.getElementById('print-portal-root')!
      )}

      <aside className="no-print w-20 xl:w-24 flex flex-col items-center py-10 bg-white border-r border-slate-200 sticky top-0 h-screen z-50 shrink-0 shadow-sm">
        <div className="w-10 h-10 xl:w-12 xl:h-12 bg-slate-900 rounded-[1.25rem] flex items-center justify-center text-white font-black text-xl xl:text-2xl mb-14 shadow-lg hover:rotate-12 transition-transform cursor-pointer" onClick={() => setView(ViewMode.PROFILE)}>
          R
        </div>
        <nav className="flex-1 flex flex-col gap-6 xl:gap-8">
          <button onClick={() => setView(ViewMode.PROFILE)} className={navItemClass(ViewMode.PROFILE)} title="Base Profile">
            <i className="fas fa-id-card text-xl"></i>
          </button>
          <button onClick={() => setView(ViewMode.AI_BUILD)} className={navItemClass(ViewMode.AI_BUILD)} title="Tailor Resume">
            <i className="fas fa-wand-magic-sparkles text-xl"></i>
          </button>
          <button onClick={() => setView(ViewMode.COVER_LETTER)} className={navItemClass(ViewMode.COVER_LETTER)} title="Cover Letter">
            <i className="fas fa-file-signature text-xl"></i>
          </button>
          <button onClick={() => setView(ViewMode.DIAGNOSTICS)} className={navItemClass(ViewMode.DIAGNOSTICS)} title="Diagnostics">
            <i className="fas fa-shield-heart text-xl"></i>
          </button>
        </nav>
      </aside>

      <main className="flex-1 flex min-w-0 no-print">
        <div className="flex-1 overflow-y-auto px-6 py-10 xl:px-16 xl:py-16 bg-slate-50/50">
          <div className="max-w-4xl mx-auto pb-24">
            <header className="mb-10 flex items-center justify-between">
              <div>
                <h1 className="text-[10px] xl:text-xs font-black uppercase tracking-[0.4em] text-blue-600 mb-2">
                  {view === ViewMode.PROFILE ? 'Resumyx Profile' : 
                   view === ViewMode.AI_BUILD ? 'Resumyx Intelligence' : 
                   view === ViewMode.COVER_LETTER ? 'Resumyx Narrative' :
                   'Environment Status'}
                </h1>
                <div className="h-1 w-16 bg-blue-600 rounded-full"></div>
              </div>
              <button 
                onClick={handleReset}
                className="text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-red-500 transition-colors px-4 py-2"
              >
                Reset System
              </button>
            </header>

            {view === ViewMode.PROFILE && <ProfilePage data={profileData} onChange={setProfileData} />}
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
            {view === ViewMode.DIAGNOSTICS && <DiagnosticsPage />}
          </div>
        </div>

        <div 
          ref={previewContainerRef}
          className="hidden lg:flex w-[450px] xl:w-[600px] 2xl:w-[850px] bg-slate-200/40 border-l border-slate-200 overflow-hidden flex-col shadow-[inset_1px_0_10px_rgba(0,0,0,0.02)]"
        >
          <div className="h-16 bg-white border-b border-slate-200 px-8 flex items-center justify-between shrink-0">
            <div className="flex items-center gap-4">
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em]">
                {view === ViewMode.COVER_LETTER ? 'Cover Letter View' : 'Resume View'}
              </span>
              {view !== ViewMode.COVER_LETTER && matchScore !== null && (
                <div className="bg-emerald-50 text-emerald-700 px-3 py-1 rounded-lg border border-emerald-100 flex items-center gap-2">
                  <span className="text-[10px] font-black uppercase tracking-widest">{matchScore}% Match</span>
                </div>
              )}
            </div>
            
            <button 
              onClick={handleDownload}
              className="bg-slate-900 text-white px-5 py-2.5 rounded-xl font-black text-[10px] uppercase tracking-[0.2em] shadow-lg hover:bg-black active:scale-95 transition-all flex items-center gap-2"
            >
              <i className="fas fa-file-pdf"></i>
              Export PDF
            </button>
          </div>
          
          <div className="flex-1 overflow-y-auto p-12 custom-scrollbar flex justify-center bg-slate-100/20">
            <div 
              style={{ transform: `scale(${scale})`, transformOrigin: 'top center' }}
              className="transition-transform duration-300"
            >
              <div className="shadow-[0_40px_100px_-20px_rgba(0,0,0,0.15)] rounded-sm overflow-hidden">
                 {view === ViewMode.COVER_LETTER 
                   ? <CoverLetterPreview data={previewData} />
                   : <ResumePreview data={previewData} highlightedSection={activeAgent} />
                 }
              </div>
              <div className="h-40 w-full"></div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default App;
