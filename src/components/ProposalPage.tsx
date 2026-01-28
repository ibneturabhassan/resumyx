
import React, { useState, useRef, useEffect } from 'react';
import { ResumeData } from '../types/index';
import { apiService } from '../services/apiService';

interface Props {
  profileData: ResumeData;
  jd: string;
  setJd: (val: string) => void;
  onUpdate: (content: string) => void;
  onAgentChange?: (agent: string | null) => void;
  onSuggestedExperience?: (experience: any[]) => void;
  onSuggestedProjects?: (projects: any[]) => void;
}

const ProposalPage: React.FC<Props> = ({
  profileData,
  jd,
  setJd,
  onUpdate,
  onAgentChange,
  onSuggestedExperience,
  onSuggestedProjects
}) => {
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
      alert("Please provide a freelance job description.");
      return;
    }
    setLoading(true);
    setLogs(["✨ Initializing Freelance Proposal Generator..."]);
    onAgentChange?.('Drafting Proposal');

    try {
      addLog("📝 Analyzing freelance job requirements...");
      addLog("🎯 Identifying relevant experience and projects...");
      addLog("💡 Crafting creative hook...");
      addLog("🔧 Formulating solution approach...");
      addLog("❓ Generating intelligent questions...");
      addLog("✍️ Writing personalized proposal...");

      const result = await apiService.generateProposal(
        profileData,
        jd
      );

      onUpdate(result.proposal);

      if (result.suggestedExperience && result.suggestedExperience.length > 0) {
        addLog(`💼 Found ${result.suggestedExperience.length} relevant experience(s)`);
        onSuggestedExperience?.(result.suggestedExperience);
      }

      if (result.suggestedProjects && result.suggestedProjects.length > 0) {
        addLog(`🚀 Found ${result.suggestedProjects.length} relevant project(s)`);
        onSuggestedProjects?.(result.suggestedProjects);
      }

      addLog("✅ Proposal crafted successfully!");
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
          <div className="w-10 h-10 rounded-lg bg-emerald-600 flex items-center justify-center text-white">
            <i className="fas fa-handshake text-sm"></i>
          </div>
          <div>
            <h2 className="text-xl font-bold text-slate-800">Freelance Proposal Writer</h2>
            <p className="text-sm text-slate-500">Create winning proposals for freelance jobs</p>
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
            <div className="flex items-start gap-3">
              <i className="fas fa-lightbulb text-blue-600 mt-0.5"></i>
              <div>
                <p className="text-sm text-blue-900 font-semibold">Proposal Structure</p>
                <p className="text-xs text-blue-700 mt-1">
                  Your proposal will include: creative hook, solution approach, relevant experience,
                  intelligent questions, and a call to action.
                </p>
              </div>
            </div>
          </div>

          <div className="space-y-3">
            <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wide">
              Freelance Job Description
            </label>
            <textarea
              className="w-full h-64 p-4 bg-slate-50/80 border border-slate-200 rounded-xl focus:ring-4 focus:ring-emerald-500/20 focus:border-emerald-400 focus:bg-white focus:outline-none transition-all duration-200 text-sm leading-relaxed placeholder-slate-400 hover:border-slate-300 resize-none font-mono"
              placeholder="Paste the freelance job description here (from Upwork, Fiverr, Freelancer, etc.)..."
              value={jd}
              onChange={(e) => setJd(e.target.value)}
            />
          </div>

          <button
            onClick={handleGenerate}
            disabled={loading}
            className={`w-full py-5 rounded-xl font-semibold text-base flex items-center justify-center gap-3 transition-all duration-200 shadow-lg active:scale-[0.98] ${loading ? 'bg-slate-100 text-slate-400 shadow-none' : 'bg-emerald-600 text-white hover:bg-emerald-700 hover:shadow-xl hover:-translate-y-0.5'}`}
          >
            {loading ? <i className="fas fa-circle-notch fa-spin text-emerald-500"></i> : <i className="fas fa-wand-magic-sparkles text-emerald-200"></i>}
            {loading ? "Generating Proposal..." : "Generate Winning Proposal"}
          </button>
        </div>
      </div>

      {/* Agent Activity Log */}
      {logs.length > 0 && (
        <div className="bg-white p-8 rounded-2xl shadow-lg border border-slate-100">
          <div className="flex items-center gap-3 mb-6 pb-4 border-b border-slate-100">
            <div className="w-8 h-8 rounded-lg bg-slate-900 flex items-center justify-center text-white">
              <i className="fas fa-terminal text-xs"></i>
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-800">Agent Activity</h3>
              <p className="text-xs text-slate-500">Real-time generation progress</p>
            </div>
          </div>
          <div className="bg-slate-900 rounded-xl p-6 font-mono text-xs leading-relaxed text-slate-300 max-h-80 overflow-y-auto space-y-1">
            {logs.map((log, idx) => (
              <div key={idx} className="hover:text-white transition-colors">{log}</div>
            ))}
            <div ref={logEndRef} />
          </div>
        </div>
      )}
    </div>
  );
};

export default ProposalPage;
