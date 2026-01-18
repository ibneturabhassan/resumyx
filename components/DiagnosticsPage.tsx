
import React, { useState } from 'react';
import { apiService } from '../services/apiService';

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

    try {
      // Test backend API
      addLog("Testing backend API connection...");
      const healthCheck = await apiService.healthCheck();

      if (healthCheck && healthCheck.status === 'healthy') {
        addLog("✅ Backend API connection successful");
        addLog(`📡 Service: ${healthCheck.service || 'resumyx-api'}`);
        addLog("✅ All backend services (AI, Database) are operational");
        setStatus('success');
      } else {
        addLog("⚠️ Backend API responded but status unclear");
        setStatus('error');
      }
    } catch (error: any) {
      addLog(`❌ Backend API connection failed: ${error.message}`);
      addLog("💡 Make sure the backend server is running");
      addLog("💡 Expected at: http://localhost:8000 (dev) or your production URL");
      setStatus('error');
    }

    setTesting(false);
  };

  return (
    <div className="max-w-3xl mx-auto space-y-8 animate-in fade-in zoom-in-95 duration-500 py-4">
      <div className="text-center space-y-4">
        <div className={`w-16 h-16 rounded-xl flex items-center justify-center text-white text-2xl mx-auto transition-all duration-500 ${status === 'success' ? 'bg-emerald-600' : status === 'error' ? 'bg-red-600' : 'bg-slate-700'}`}>
          <i className={`fas ${testing ? 'fa-spinner fa-spin' : status === 'success' ? 'fa-check' : status === 'error' ? 'fa-triangle-exclamation' : 'fa-satellite-dish'}`}></i>
        </div>
        <h2 className="text-2xl font-bold text-slate-800 tracking-tight">API Diagnostics</h2>
        <p className="text-slate-500 text-sm">Test the connection between this application and Google's AI servers.</p>
      </div>

      <div className="bg-white p-8 rounded-2xl shadow-lg border border-slate-100 space-y-6">
        <div className="p-5 bg-slate-50/80 rounded-xl border border-slate-200 space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-600 uppercase tracking-wide">Environment Status</span>
            <span className="px-3 py-1.5 bg-emerald-50 text-emerald-600 text-xs font-semibold rounded-lg border border-emerald-100">Active</span>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="p-4 bg-white rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow duration-200">
              <span className="block text-xs font-semibold text-slate-400 uppercase mb-1.5">Backend</span>
              <span className="text-sm font-semibold text-slate-800">FastAPI</span>
            </div>
            <div className="p-4 bg-white rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow duration-200">
              <span className="block text-xs font-semibold text-slate-400 uppercase mb-1.5">AI Model</span>
              <span className="text-sm font-semibold text-slate-800">Gemini 2.0 Flash</span>
            </div>
          </div>
        </div>

        <button
          onClick={runTest}
          disabled={testing}
          className="w-full py-5 bg-slate-900 text-white rounded-xl font-semibold text-base flex items-center justify-center gap-3 hover:bg-slate-800 transition-all duration-200 disabled:opacity-50 shadow-lg hover:shadow-xl active:scale-[0.98] hover:-translate-y-0.5"
        >
          {testing ? (
            <>
              <i className="fas fa-circle-notch fa-spin"></i>
              <span>Testing Connection...</span>
            </>
          ) : (
            <>
              <i className="fas fa-plug"></i>
              <span>Run Connection Test</span>
            </>
          )}
        </button>
      </div>

      {(logs.length > 0) && (
        <div className="bg-slate-800 rounded-2xl p-6 shadow-xl border border-slate-700">
          <div className="flex items-center gap-3 mb-4 pb-3 border-b border-slate-700">
            <div className="w-8 h-8 rounded-lg bg-slate-700 flex items-center justify-center">
              <i className="fas fa-terminal text-emerald-400 text-sm"></i>
            </div>
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wide">Diagnostic Log</span>
          </div>
          <div className="font-mono text-xs text-slate-400 space-y-1.5 h-56 overflow-y-auto custom-scrollbar pr-4">
            {logs.map((log, i) => (
              <div key={i} className="flex gap-3 py-1 px-2 rounded hover:bg-slate-700/50 transition-colors">
                <span className="text-slate-600 shrink-0 w-5">{i.toString().padStart(2, '0')}</span>
                <span className={`${log.includes('FATAL') || log.includes('Error') || log.includes('❌') ? 'text-red-400' : log.includes('Success') || log.includes('✅') ? 'text-emerald-400' : 'text-slate-300'}`}>{log}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default DiagnosticsPage;
