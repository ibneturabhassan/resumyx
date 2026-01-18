
import React, { useState, useRef, useEffect } from 'react';
import { ResumeData } from '../types';
import * as GeminiService from '../services/geminiService';

interface Props {
  profileData: ResumeData;
  jd: string;
  setJd: (val: string) => void;
  instructions: string;
  setInstructions: (val: string) => void;
  onUpdate: (content: string) => void;
  onAgentChange?: (agent: string | null) => void;
}

const CoverLetterPage: React.FC<Props> = ({ profileData, jd, setJd, instructions, setInstructions, onUpdate, onAgentChange }) => {
  const [loading, setLoading] = useState(false);
  const [logs, setLogs] = useState<string[]>([]);
  const logEndRef = useRef<HTMLDivElement>(null);

  const addLog = (msg: string) => {
    setLogs(prev => [...prev, `[${new Date().toLocaleTimeString()}] ${msg}`]);
  };

  useEffect(() => {
    logEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [logs]);

  const handleGenerate = async () => {
    if (!jd.trim()) {
      alert("Please provide a job description for context.");
      return;
    }
    setLoading(true);
    setLogs(["✨ Initializing Cover Letter Generation Agent..."]);
    onAgentChange?.('Drafting Cover Letter');

    try {
      const letter = await GeminiService.generateCoverLetter(
        profileData,
        jd,
        instructions,
        addLog
      );
      onUpdate(letter);
      addLog("✅ Cover letter crafted and synced to preview.");
    } catch (err: any) {
      addLog(`❌ ERROR: ${err.message}`);
    } finally {
      setLoading(false);
      onAgentChange?.(null);
    }
  };

  return (
    <div className="space-y-12 animate-in fade-in slide-in-from-bottom-6 duration-700">
      <div className="bg-white p-8 xl:p-10 rounded-[2.5rem] shadow-xl border border-slate-200/60">
        <h2 className="text-2xl font-black text-slate-900 mb-6 flex items-center gap-3">
          <i className="fas fa-pen-nib text-blue-600"></i>
          Tailor Your Narrative
        </h2>
        
        <div className="space-y-8">
          <div className="space-y-3">
            <label className="block text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] ml-1">Target Job Description</label>
            <textarea 
              className="w-full h-48 p-5 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-4 focus:ring-blue-500/5 focus:border-blue-500 focus:bg-white focus:outline-none transition-all text-sm leading-relaxed"
              placeholder="Paste the job description here (this carries over from the resume tab)..."
              value={jd}
              onChange={(e) => setJd(e.target.value)}
            />
          </div>

          <div className="space-y-3">
            <label className="block text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] ml-1">Special Instructions (Optional)</label>
            <textarea 
              className="w-full h-32 p-5 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-4 focus:ring-blue-500/5 focus:border-blue-500 focus:bg-white focus:outline-none transition-all text-sm leading-relaxed"
              placeholder="e.g. Highlight my experience with multi-tenant SaaS architecture or explain my career gap in 2022..."
              value={instructions}
              onChange={(e) => setInstructions(e.target.value)}
            />
          </div>

          <button 
            onClick={handleGenerate}
            disabled={loading}
            className={`w-full py-5 rounded-2xl font-black text-sm uppercase tracking-widest flex items-center justify-center gap-3 transition-all ${loading ? 'bg-slate-100 text-slate-400' : 'bg-blue-600 text-white hover:bg-blue-700 shadow-lg active:scale-[0.98]'}`}
          >
            {loading ? <i className="fas fa-spinner fa-spin"></i> : <i className="fas fa-magic"></i>}
            {loading ? "Agent is Drafting..." : "Generate Professional Cover Letter"}
          </button>
        </div>
      </div>

      <div className="bg-white p-8 xl:p-10 rounded-[2.5rem] shadow-xl border border-slate-200/60">
        <h2 className="text-2xl font-black text-slate-900 mb-6 flex items-center gap-3">
          <i className="fas fa-edit text-slate-400"></i>
          Direct Editor
        </h2>
        <textarea 
          className="w-full h-[500px] p-8 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-4 focus:ring-blue-500/5 focus:border-blue-500 focus:bg-white focus:outline-none transition-all text-sm leading-relaxed font-serif"
          value={profileData.coverLetter}
          onChange={(e) => onUpdate(e.target.value)}
          placeholder="AI-generated cover letter will appear here for you to edit in real-time..."
        />
      </div>

      {logs.length > 0 && (
        <div className="bg-slate-900 rounded-[2rem] p-6 shadow-2xl border border-slate-800">
          <div className="font-mono text-[10px] text-slate-500 space-y-1 h-24 overflow-y-auto custom-scrollbar">
            {logs.map((log, i) => (
              <div key={i} className="flex gap-2">
                <span className="text-slate-700">{i}</span>
                <span className={log.includes('✅') ? 'text-emerald-400' : 'text-slate-400'}>{log}</span>
              </div>
            ))}
            <div ref={logEndRef} />
          </div>
        </div>
      )}
    </div>
  );
};

export default CoverLetterPage;
