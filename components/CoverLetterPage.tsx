
import React, { useState, useRef, useEffect } from 'react';
import { ResumeData } from '../types';
import { apiService } from '../services/apiService';

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
      addLog("📝 Analyzing your profile and job description...");
      addLog("✍️ Crafting personalized cover letter...");
      const letter = await apiService.generateCoverLetter(
        profileData,
        jd,
        instructions
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
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-6 duration-700">
      <div className="bg-white p-8 rounded-2xl shadow-lg border border-slate-100">
        <div className="flex items-center gap-3 mb-8 pb-5 border-b border-slate-100">
          <div className="w-10 h-10 rounded-lg bg-violet-600 flex items-center justify-center text-white">
            <i className="fas fa-pen-nib text-sm"></i>
          </div>
          <div>
            <h2 className="text-xl font-bold text-slate-800">Cover Letter Generator</h2>
            <p className="text-sm text-slate-500">Create a personalized cover letter with AI</p>
          </div>
        </div>

        <div className="space-y-6">
          <div className="space-y-3">
            <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wide">Target Job Description</label>
            <textarea
              className="w-full h-44 p-4 bg-slate-50/80 border border-slate-200 rounded-xl focus:ring-4 focus:ring-blue-500/20 focus:border-blue-400 focus:bg-white focus:outline-none transition-all duration-200 text-sm leading-relaxed placeholder-slate-400 hover:border-slate-300 resize-none"
              placeholder="Paste the job description here (this carries over from the resume tab)..."
              value={jd}
              onChange={(e) => setJd(e.target.value)}
            />
          </div>

          <div className="space-y-3">
            <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wide">Special Instructions (Optional)</label>
            <textarea
              className="w-full h-28 p-4 bg-slate-50/80 border border-slate-200 rounded-xl focus:ring-4 focus:ring-blue-500/20 focus:border-blue-400 focus:bg-white focus:outline-none transition-all duration-200 text-sm leading-relaxed placeholder-slate-400 hover:border-slate-300 resize-none"
              placeholder="e.g. Highlight my experience with multi-tenant SaaS architecture or explain my career gap in 2022..."
              value={instructions}
              onChange={(e) => setInstructions(e.target.value)}
            />
          </div>

          <button
            onClick={handleGenerate}
            disabled={loading}
            className={`w-full py-5 rounded-xl font-semibold text-base flex items-center justify-center gap-3 transition-all duration-200 shadow-lg active:scale-[0.98] ${loading ? 'bg-slate-100 text-slate-400 shadow-none' : 'bg-slate-900 text-white hover:bg-slate-800 hover:shadow-xl hover:-translate-y-0.5'}`}
          >
            {loading ? <i className="fas fa-circle-notch fa-spin text-violet-500"></i> : <i className="fas fa-wand-magic-sparkles text-violet-400"></i>}
            {loading ? "Generating..." : "Generate Cover Letter"}
          </button>
        </div>
      </div>

      <div className="bg-white p-8 rounded-2xl shadow-lg border border-slate-100">
        <div className="flex items-center gap-3 mb-6 pb-5 border-b border-slate-100">
          <div className="w-8 h-8 rounded-lg bg-slate-700 flex items-center justify-center text-white">
            <i className="fas fa-edit text-xs"></i>
          </div>
          <h2 className="text-xl font-bold text-slate-800">Direct Editor</h2>
        </div>
        <textarea
          className="w-full h-96 p-6 bg-slate-50/80 border border-slate-200 rounded-xl focus:ring-4 focus:ring-blue-500/20 focus:border-blue-400 focus:bg-white focus:outline-none transition-all duration-200 text-sm leading-relaxed font-serif placeholder-slate-400 hover:border-slate-300 resize-none"
          value={profileData.coverLetter}
          onChange={(e) => onUpdate(e.target.value)}
          placeholder="AI-generated cover letter will appear here for you to edit in real-time..."
        />
      </div>

      {logs.length > 0 && (
        <div className="bg-slate-800 rounded-2xl p-6 shadow-xl border border-slate-700">
          <div className="flex items-center gap-3 mb-4 pb-3 border-b border-slate-700">
            <div className="w-8 h-8 rounded-lg bg-slate-700 flex items-center justify-center">
              <i className="fas fa-terminal text-violet-400 text-sm"></i>
            </div>
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wide">Generation Log</span>
          </div>
          <div className="font-mono text-xs text-slate-400 space-y-1.5 h-28 overflow-y-auto custom-scrollbar pr-4">
            {logs.map((log, i) => (
              <div key={i} className="flex gap-3 py-1 px-2 rounded hover:bg-slate-700/50 transition-colors">
                <span className="text-slate-600 shrink-0 w-5">{i.toString().padStart(2, '0')}</span>
                <span className={log.includes('✅') || log.includes('synced') ? 'text-emerald-400' : log.includes('❌') ? 'text-red-400' : 'text-slate-300'}>{log}</span>
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
