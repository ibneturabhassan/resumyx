
import React, { useState } from 'react';
import { ResumeData, GenerationType } from '../types/index';
import { generateResumeContent } from '../services/geminiService';

interface Props {
  onGenerated: (data: ResumeData) => void;
}

const AIArchitect: React.FC<Props> = ({ onGenerated }) => {
  const [prompt, setPrompt] = useState('');
  const [loading, setLoading] = useState(false);

  const handleGenerate = async () => {
    if (!prompt.trim()) return;
    setLoading(true);
    try {
      const result = await generateResumeContent(GenerationType.FULL, prompt);
      onGenerated(result);
      setPrompt('');
    } catch (err) {
      console.error(err);
      alert('AI Generation failed. Please try a more detailed prompt.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-12 animate-in fade-in zoom-in-95 duration-500 py-4">
      <div className="text-center space-y-6">
        <div className="w-24 h-24 bg-blue-600 rounded-[2.5rem] flex items-center justify-center text-white text-4xl mx-auto shadow-2xl shadow-blue-500/30 rotate-3 hover:rotate-0 transition-transform cursor-default">
          <i className="fas fa-wand-magic-sparkles"></i>
        </div>
        <div className="space-y-2">
          <h2 className="text-4xl font-black text-slate-900 tracking-tight">AI Resume Architect</h2>
          <p className="text-slate-500 text-lg font-medium max-w-md mx-auto leading-relaxed">
            Paste your rough notes or LinkedIn bio, and we'll build a structured, high-impact resume.
          </p>
        </div>
      </div>

      <div className="bg-white p-8 rounded-[2rem] shadow-xl shadow-slate-200/40 border border-slate-200 space-y-6">
        <div className="space-y-3">
          <label className="block text-sm font-bold text-slate-700 uppercase tracking-widest ml-1">Input Career Details</label>
          <textarea 
            className="w-full h-64 p-5 bg-white border border-slate-300 rounded-2xl focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 focus:outline-none transition-all text-slate-800 placeholder-slate-400 leading-relaxed shadow-inner"
            placeholder="Example: I've been a data engineer for 4 years at Spotify working on music recommendation pipelines using Scala and Airflow. Before that, I graduated from MIT in 2019..."
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
          />
        </div>
        
        <button 
          onClick={handleGenerate}
          disabled={loading || !prompt.trim()}
          className="w-full py-5 bg-slate-900 text-white rounded-2xl font-black text-lg flex items-center justify-center gap-4 hover:bg-black transition-all disabled:opacity-50 shadow-lg active:scale-95"
        >
          {loading ? (
            <>
              <i className="fas fa-circle-notch fa-spin"></i>
              Architecting...
            </>
          ) : (
            <>
              <i className="fas fa-bolt-lightning text-yellow-400"></i>
              Build Professional Resume
            </>
          )}
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {[
          { icon: 'fa-microchip', label: 'Tech Stack Audit', color: 'text-blue-500' },
          { icon: 'fa-chart-line', label: 'Quantifiable Metrics', color: 'text-indigo-500' },
          { icon: 'fa-file-shield', label: 'ATS Compliance', color: 'text-emerald-500' }
        ].map((feat, i) => (
          <div key={i} className="bg-white p-4 rounded-2xl border border-slate-100 flex flex-col items-center gap-2 shadow-sm">
            <i className={`fas ${feat.icon} ${feat.color} text-xl`}></i>
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">{feat.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AIArchitect;
