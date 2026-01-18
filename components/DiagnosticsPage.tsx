
import React, { useState } from 'react';
import { testApiConnection } from '../services/geminiService';

const DiagnosticsPage: React.FC = () => {
  const [logs, setLogs] = useState<string[]>([]);
  const [testing, setTesting] = useState(false);
  const [status, setStatus] = useState<'idle' | 'success' | 'error'>('idle');

  const addLog = (msg: string) => {
    setLogs(prev => [...prev, `[${new Date().toLocaleTimeString()}] ${msg}`]);
  };

  const runTest = async () => {
    setTesting(true);
    setStatus('idle');
    setLogs(["Initializing System Health Check..."]);
    
    const result = await testApiConnection(addLog);
    setStatus(result ? 'success' : 'error');
    setTesting(false);
  };

  return (
    <div className="max-w-3xl mx-auto space-y-12 animate-in fade-in zoom-in-95 duration-500 py-4">
      <div className="text-center space-y-4">
        <div className={`w-20 h-20 rounded-[2rem] flex items-center justify-center text-white text-3xl mx-auto shadow-2xl transition-colors duration-500 ${status === 'success' ? 'bg-green-500 shadow-green-500/20' : status === 'error' ? 'bg-red-500 shadow-red-500/20' : 'bg-slate-900 shadow-slate-900/20'}`}>
          <i className={`fas ${testing ? 'fa-spinner fa-spin' : status === 'success' ? 'fa-check' : status === 'error' ? 'fa-triangle-exclamation' : 'fa-satellite-dish'}`}></i>
        </div>
        <h2 className="text-3xl font-black text-slate-900 tracking-tight">API Diagnostics</h2>
        <p className="text-slate-500 font-medium">Test the connection between this application and Google's AI servers.</p>
      </div>

      <div className="bg-white p-8 rounded-[2rem] shadow-xl border border-slate-200 space-y-6">
        <div className="p-6 bg-slate-50 rounded-2xl border border-slate-200 space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-sm font-bold text-slate-600 uppercase tracking-widest">Environment Status</span>
            <span className="px-3 py-1 bg-green-100 text-green-700 text-[10px] font-black rounded-full uppercase">Runtime Active</span>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="p-4 bg-white rounded-xl border border-slate-200 shadow-sm">
              <span className="block text-[10px] font-black text-slate-400 uppercase mb-1">API Model</span>
              <span className="text-sm font-bold text-slate-800">Gemini 3 Flash</span>
            </div>
            <div className="p-4 bg-white rounded-xl border border-slate-200 shadow-sm">
              <span className="block text-[10px] font-black text-slate-400 uppercase mb-1">Auth Type</span>
              <span className="text-sm font-bold text-slate-800">process.env.API_KEY</span>
            </div>
          </div>
        </div>

        <button 
          onClick={runTest}
          disabled={testing}
          className="w-full py-5 bg-slate-900 text-white rounded-2xl font-black text-lg flex items-center justify-center gap-4 hover:bg-black transition-all disabled:opacity-50 shadow-lg active:scale-95"
        >
          {testing ? "Executing Ping..." : "Run Connection Test"}
        </button>
      </div>

      {(logs.length > 0) && (
        <div className="bg-slate-900 rounded-[2rem] p-8 shadow-2xl border border-slate-800">
          <div className="flex items-center gap-3 mb-6 border-b border-slate-800 pb-4">
            <div className="flex gap-1.5">
              <div className="w-3 h-3 rounded-full bg-red-500/80"></div>
              <div className="w-3 h-3 rounded-full bg-yellow-500/80"></div>
              <div className="w-3 h-3 rounded-full bg-green-500/80"></div>
            </div>
            <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Diagnostic Log Stream</span>
          </div>
          <div className="font-mono text-[13px] text-slate-300 space-y-2 h-64 overflow-y-auto custom-scrollbar">
            {logs.map((log, i) => (
              <div key={i} className={`${log.includes('FATAL') || log.includes('Error') ? 'text-red-400' : log.includes('Success') ? 'text-green-400' : 'text-slate-300'}`}>
                <span className="text-slate-600 mr-2">[{i}]</span>
                {log}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default DiagnosticsPage;
