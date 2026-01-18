
import React, { useState, useEffect, useRef } from 'react';
import { ResumeData } from '../types';
import * as GeminiService from '../services/geminiService';

interface Props {
  profileData: ResumeData;
  jd: string;
  setJd: (val: string) => void;
  onResult: (tailoredData: ResumeData) => void;
  onAgentChange?: (agentName: string | null) => void;
  onScoreUpdate?: (score: number | null) => void;
  onProceed?: () => void;
}

const AIBuildPage: React.FC<Props> = ({ profileData, jd, setJd, onResult, onAgentChange, onScoreUpdate, onProceed }) => {
  const [loading, setLoading] = useState(false);
  const [currentStep, setCurrentStep] = useState<number>(0);
  const [logs, setLogs] = useState<string[]>([]);
  const [done, setDone] = useState(false);
  const logEndRef = useRef<HTMLDivElement>(null);

  const addLog = (msg: string) => {
    setLogs(prev => [...prev, `[${new Date().toLocaleTimeString()}] ${msg}`]);
  };

  useEffect(() => {
    logEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [logs]);

  const handleTailor = async () => {
    if (!jd.trim()) return;
    setLoading(true);
    setDone(false);
    setLogs(["🚀 Launching Resume Optimization Sequence..."]);
    onScoreUpdate?.(null);
    
    let tailoredResume: ResumeData = { ...profileData };

    try {
      setCurrentStep(1);
      onAgentChange?.('Summary');
      tailoredResume.summary = await GeminiService.generateTailoredSummary(
        profileData.summary,
        profileData.skills,
        jd,
        addLog
      );
      onResult({ ...tailoredResume }); 

      setCurrentStep(2);
      onAgentChange?.('Experience');
      tailoredResume.experience = await GeminiService.generateTailoredExperience(
        profileData.experience,
        jd,
        addLog
      );
      onResult({ ...tailoredResume });

      setCurrentStep(3);
      onAgentChange?.('Skills');
      tailoredResume.skills = await GeminiService.generateTailoredSkills(
        profileData.skills,
        jd,
        addLog
      );
      onResult({ ...tailoredResume });

      setCurrentStep(4);
      onAgentChange?.('Projects');
      tailoredResume.projects = await GeminiService.generateTailoredProjects(
        profileData.projects,
        jd,
        addLog
      );
      onResult({ ...tailoredResume });

      setCurrentStep(5);
      onAgentChange?.('Education');
      tailoredResume.education = await GeminiService.generateTailoredEducation(
        profileData.education,
        jd,
        addLog
      );
      onResult({ ...tailoredResume });

      setCurrentStep(6);
      onAgentChange?.('Scoring');
      const scoreResult = await GeminiService.calculateATSScore(tailoredResume, jd, addLog);
      onScoreUpdate?.(scoreResult.score);
      addLog(`🎯 Optimization complete! ATS Match Score: ${scoreResult.score}%`);
      
      onAgentChange?.(null);
      addLog("✨ Agent workflow finished successfully.");
      setDone(true);
    } catch (err: any) {
      console.error(err);
      addLog(`❌ CRITICAL FAILURE: ${err.message || 'Sequence interrupted'}`);
      onAgentChange?.(null);
    } finally {
      setLoading(false);
      setCurrentStep(0);
    }
  };

  const steps = [
    { label: 'Summary', icon: 'fa-align-left' },
    { label: 'Experience', icon: 'fa-briefcase' },
    { label: 'Skills', icon: 'fa-code' },
    { label: 'Projects', icon: 'fa-diagram-project' },
    { label: 'Education', icon: 'fa-graduation-cap' },
    { label: 'Scoring', icon: 'fa-bullseye' }
  ];

  return (
    <div className="space-y-12 animate-in fade-in slide-in-from-bottom-6 duration-700">
      <div className="bg-white p-8 xl:p-12 rounded-[2.5rem] shadow-xl border border-slate-200/60">
        <div className="flex flex-col md:flex-row gap-10 items-start">
          <div className="flex-1 space-y-6 w-full">
            <div className="space-y-3">
              <label className="block text-xs font-black text-slate-400 uppercase tracking-[0.3em] ml-1">Target Job Description</label>
              <textarea 
                className="w-full h-80 p-6 bg-slate-50 border border-slate-200 rounded-[2rem] focus:ring-8 focus:ring-blue-500/5 focus:border-blue-500 focus:bg-white focus:outline-none transition-all text-slate-800 placeholder-slate-300 leading-relaxed shadow-inner font-medium resize-none"
                placeholder="Paste the Job Description to start the agents..."
                value={jd}
                onChange={(e) => setJd(e.target.value)}
                disabled={loading}
              />
            </div>
            
            <button 
              onClick={handleTailor}
              disabled={loading || !jd.trim()}
              className={`w-full py-6 rounded-2xl font-black text-lg flex items-center justify-center gap-4 transition-all shadow-xl active:scale-[0.98] ${loading ? 'bg-slate-100 text-slate-400' : 'bg-slate-900 text-white hover:bg-black'}`}
            >
              {loading ? (
                <>
                  <i className="fas fa-circle-notch fa-spin text-blue-500"></i>
                  Agents Processing...
                </>
              ) : (
                <>
                  <i className="fas fa-bolt-lightning text-amber-400"></i>
                  Tailor My Resume
                </>
              )}
            </button>

            {done && onProceed && (
              <button 
                onClick={onProceed}
                className="w-full py-4 border-2 border-dashed border-blue-200 text-blue-600 rounded-2xl font-bold text-sm uppercase tracking-widest hover:bg-blue-50 transition-all flex items-center justify-center gap-2 group"
              >
                Next Step: Create Cover Letter
                <i className="fas fa-arrow-right group-hover:translate-x-1 transition-transform"></i>
              </button>
            )}
          </div>

          <div className="w-full md:w-56 space-y-4 shrink-0">
            <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Optimization Flow</h3>
            <div className="space-y-2">
              {steps.map((step, idx) => (
                <div key={idx} className={`flex items-center gap-3 p-3 rounded-xl transition-all border duration-500 ${currentStep === idx + 1 ? 'bg-blue-50 border-blue-100 scale-105 shadow-sm' : currentStep > idx + 1 ? 'bg-emerald-50 border-emerald-100' : 'bg-slate-50 border-transparent opacity-40'}`}>
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${currentStep === idx + 1 ? 'bg-blue-600 text-white animate-pulse' : currentStep > idx + 1 ? 'bg-emerald-500 text-white' : 'bg-slate-200 text-slate-400'}`}>
                    <i className={`fas ${step.icon} text-[10px]`}></i>
                  </div>
                  <span className={`text-[10px] font-black uppercase tracking-widest ${currentStep === idx + 1 ? 'text-blue-700' : currentStep > idx + 1 ? 'text-emerald-700' : 'text-slate-400'}`}>{step.label}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {logs.length > 0 && (
        <div className="bg-slate-900 rounded-[2.5rem] p-8 shadow-2xl border border-slate-800">
          <div className="flex items-center gap-3 mb-6 border-b border-slate-800 pb-4">
            <i className="fas fa-terminal text-blue-500 text-xs"></i>
            <span className="text-[10px] font-black text-slate-500 uppercase tracking-[0.4em]">Agentic Log Stream</span>
          </div>
          <div className="font-mono text-[11px] text-slate-400 space-y-2 h-40 overflow-y-auto custom-scrollbar pr-4">
            {logs.map((log, i) => (
              <div key={i} className="flex gap-4">
                <span className="text-slate-700 shrink-0">[{i.toString().padStart(2, '0')}]</span>
                <span className={`${log.includes('✅') || log.includes('✨') || log.includes('🎯') ? 'text-emerald-400' : log.includes('Agent') ? 'text-blue-400' : 'text-slate-400'}`}>{log}</span>
              </div>
            ))}
            <div ref={logEndRef} />
          </div>
        </div>
      )}
    </div>
  );
};

export default AIBuildPage;
