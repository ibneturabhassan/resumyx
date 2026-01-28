
import React, { useState, useEffect, useRef } from 'react';
import { ResumeData } from '../types/index';
import { apiService } from '../services/apiService';
import TailoredResumeEditor from './TailoredResumeEditor';

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
  const [completedSteps, setCompletedSteps] = useState<Set<number>>(new Set());
  const [logs, setLogs] = useState<string[]>([]);
  const [done, setDone] = useState(false);
  const [showEditor, setShowEditor] = useState(false);
  const [tailoredData, setTailoredData] = useState<ResumeData | null>(null);
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
      addLog("🚀 Starting parallel optimization of all resume sections...");
      setCompletedSteps(new Set());

      // Call all tailoring endpoints in parallel
      const [summaryResult, experienceResult, skillsResult, projectsResult, educationResult] = await Promise.allSettled([
        // Step 1: Summary
        apiService.tailorSummary(profileData, jd).then(summary => {
          setCompletedSteps(prev => new Set(prev).add(1));
          onAgentChange?.('Summary');
          addLog("✅ Professional summary optimized");
          return summary;
        }),

        // Step 2: Experience
        apiService.tailorExperience(profileData, jd).then(experience => {
          setCompletedSteps(prev => new Set(prev).add(2));
          onAgentChange?.('Experience');
          addLog("✅ Work experience optimized");
          return experience;
        }),

        // Step 3: Skills
        apiService.tailorSkills(profileData, jd).then(skills => {
          setCompletedSteps(prev => new Set(prev).add(3));
          onAgentChange?.('Skills');
          addLog("✅ Skills prioritized");
          return skills;
        }),

        // Step 4: Projects
        apiService.tailorProjects(profileData, jd).then(projects => {
          setCompletedSteps(prev => new Set(prev).add(4));
          onAgentChange?.('Projects');
          addLog("✅ Projects enhanced");
          return projects;
        }),

        // Step 5: Education
        apiService.tailorEducation(profileData, jd).then(education => {
          setCompletedSteps(prev => new Set(prev).add(5));
          onAgentChange?.('Education');
          addLog("✅ Education reviewed");
          return education;
        })
      ]);

      // Extract results or use fallbacks
      const summary = summaryResult.status === 'fulfilled' ? summaryResult.value : '';
      const experience = experienceResult.status === 'fulfilled' ? experienceResult.value : profileData.experience;
      const skills = skillsResult.status === 'fulfilled' ? skillsResult.value : profileData.skills;
      const projects = projectsResult.status === 'fulfilled' ? projectsResult.value : profileData.projects;
      const education = educationResult.status === 'fulfilled' ? educationResult.value : profileData.education;

      // Log any failures
      if (summaryResult.status === 'rejected') addLog(`⚠️ Summary optimization failed: ${summaryResult.reason}`);
      if (experienceResult.status === 'rejected') addLog(`⚠️ Experience optimization failed: ${experienceResult.reason}`);
      if (skillsResult.status === 'rejected') addLog(`⚠️ Skills optimization failed: ${skillsResult.reason}`);
      if (projectsResult.status === 'rejected') addLog(`⚠️ Projects optimization failed: ${projectsResult.reason}`);
      if (educationResult.status === 'rejected') addLog(`⚠️ Education optimization failed: ${educationResult.reason}`);

      // Build tailored resume
      tailoredResume = {
        ...profileData,
        additionalInfo: summary,
        experience,
        skills,
        projects,
        education
      };

      setTailoredData({ ...tailoredResume });
      onResult({ ...tailoredResume });
      addLog("✨ All resume sections optimized!");

      // Step 6: Scoring - Use LLM to analyze complete assembled resume
      setCurrentStep(6);
      onAgentChange?.('Scoring');
      addLog("📋 Assembling complete resume for analysis...");
      addLog("🎯 Using AI to calculate ATS compatibility score...");
      const scoreResult = await apiService.calculateATSScoreLLM(tailoredResume, jd);
      console.log('Received LLM ATS score:', scoreResult);

      if (!scoreResult || typeof scoreResult.score !== 'number') {
        throw new Error('Invalid response from ATS score API');
      }

      onScoreUpdate?.(scoreResult.score);
      addLog(`🎯 Optimization complete! ATS Match Score: ${scoreResult.score}%`);
      setCompletedSteps(prev => new Set(prev).add(6));

      onAgentChange?.(null);
      addLog("✨ Agent workflow finished successfully.");
      setDone(true);
    } catch (err: any) {
      console.error('Full error details:', err);
      console.error('Error stack:', err.stack);
      addLog(`❌ CRITICAL FAILURE: ${err.message || 'Sequence interrupted'}`);
      addLog(`💡 Check browser console for detailed error information`);
      onAgentChange?.(null);
    } finally {
      setLoading(false);
      setCurrentStep(0);
      // Keep completedSteps visible to show what was accomplished
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
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-6 duration-700">
      <div className="bg-white p-8 xl:p-10 rounded-2xl shadow-lg border border-slate-100">
        <div className="flex items-center gap-3 mb-8 pb-5 border-b border-slate-100">
          <div className="w-10 h-10 rounded-lg bg-blue-600 flex items-center justify-center text-white">
            <i className="fas fa-wand-magic-sparkles text-sm"></i>
          </div>
          <div>
            <h2 className="text-xl font-bold text-slate-800">AI Resume Tailor</h2>
            <p className="text-sm text-slate-500">Optimize your resume for any job description</p>
          </div>
        </div>

        <div className="flex flex-col lg:flex-row gap-8 items-start">
          <div className="flex-1 space-y-6 w-full">
            <div className="space-y-3">
              <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wide">Target Job Description</label>
              <textarea
                className="w-full h-72 p-5 bg-slate-50/80 border border-slate-200 rounded-xl focus:ring-4 focus:ring-blue-500/20 focus:border-blue-400 focus:bg-white focus:outline-none transition-all duration-200 text-sm text-slate-800 placeholder-slate-400 leading-relaxed resize-none hover:border-slate-300"
                placeholder="Paste the job description here to start the AI agents..."
                value={jd}
                onChange={(e) => setJd(e.target.value)}
                disabled={loading}
              />
            </div>

            <button
              onClick={handleTailor}
              disabled={loading || !jd.trim()}
              className={`w-full py-5 rounded-xl font-semibold text-base flex items-center justify-center gap-3 transition-all duration-200 shadow-lg active:scale-[0.98] ${loading ? 'bg-slate-100 text-slate-400 shadow-none' : 'bg-slate-900 text-white hover:bg-slate-800 hover:shadow-xl hover:-translate-y-0.5'}`}
            >
              {loading ? (
                <>
                  <i className="fas fa-circle-notch fa-spin text-blue-500"></i>
                  <span>Processing...</span>
                </>
              ) : (
                <>
                  <i className="fas fa-bolt-lightning text-amber-400"></i>
                  <span>Tailor My Resume</span>
                </>
              )}
            </button>

            {done && (
              <div className="space-y-3">
                <button
                  onClick={() => setShowEditor(true)}
                  className="w-full py-4 bg-gradient-to-r from-emerald-50 to-teal-50 border-2 border-emerald-200 text-emerald-700 rounded-xl font-semibold text-sm hover:from-emerald-100 hover:to-teal-100 transition-all duration-200 flex items-center justify-center gap-2 group hover:shadow-md"
                >
                  <i className="fas fa-edit"></i>
                  <span>Edit Tailored Resume</span>
                </button>

                {onProceed && (
                  <button
                    onClick={onProceed}
                    className="w-full py-4 bg-gradient-to-r from-blue-50 to-indigo-50 border-2 border-blue-200 text-blue-600 rounded-xl font-semibold text-sm hover:from-blue-100 hover:to-indigo-100 transition-all duration-200 flex items-center justify-center gap-2 group hover:shadow-md"
                  >
                    <span>Next: Create Cover Letter</span>
                    <i className="fas fa-arrow-right group-hover:translate-x-1 transition-transform duration-200"></i>
                  </button>
                )}
              </div>
            )}
          </div>

          <div className="w-full lg:w-52 space-y-4 shrink-0">
            <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wide px-1">Optimization Steps</h3>
            <div className="space-y-2">
              {steps.map((step, idx) => {
                const stepNum = idx + 1;
                const isCompleted = completedSteps.has(stepNum);
                const isInProgress = loading && !isCompleted && stepNum <= 5; // Steps 1-5 are parallel processing

                return (
                  <div key={idx} className={`flex items-center gap-3 p-3 rounded-xl transition-all duration-300 border ${
                    isCompleted
                      ? 'bg-emerald-50 border-emerald-200'
                      : isInProgress
                        ? 'bg-blue-50 border-blue-200 scale-[1.02] shadow-sm'
                        : stepNum === 6 && currentStep === 6
                          ? 'bg-blue-50 border-blue-200 scale-[1.02] shadow-sm'
                          : 'bg-slate-50/50 border-transparent opacity-50'
                  }`}>
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 transition-all duration-300 ${
                      isCompleted
                        ? 'bg-emerald-500 text-white'
                        : isInProgress
                          ? 'bg-blue-600 text-white shadow-md shadow-blue-500/30'
                          : stepNum === 6 && currentStep === 6
                            ? 'bg-blue-600 text-white shadow-md shadow-blue-500/30'
                            : 'bg-slate-200 text-slate-400'
                    }`}>
                      {isCompleted ? (
                        <i className="fas fa-check text-xs"></i>
                      ) : isInProgress ? (
                        <i className="fas fa-circle-notch fa-spin text-xs"></i>
                      ) : (
                        <i className={`fas ${step.icon} text-xs`}></i>
                      )}
                    </div>
                    <span className={`text-xs font-semibold ${
                      isCompleted
                        ? 'text-emerald-700'
                        : isInProgress || (stepNum === 6 && currentStep === 6)
                          ? 'text-blue-700'
                          : 'text-slate-400'
                    }`}>{step.label}</span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {logs.length > 0 && (
        <div className="bg-slate-800 rounded-2xl p-6 shadow-xl border border-slate-700">
          <div className="flex items-center gap-3 mb-4 pb-3 border-b border-slate-700">
            <div className="w-8 h-8 rounded-lg bg-slate-700 flex items-center justify-center">
              <i className="fas fa-terminal text-blue-400 text-sm"></i>
            </div>
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wide">Agent Log Stream</span>
          </div>
          <div className="font-mono text-xs text-slate-400 space-y-1.5 h-44 overflow-y-auto custom-scrollbar pr-4">
            {logs.map((log, i) => (
              <div key={i} className="flex gap-3 py-1 px-2 rounded hover:bg-slate-700/50 transition-colors">
                <span className="text-slate-600 shrink-0 w-6">{i.toString().padStart(2, '0')}</span>
                <span className={`${log.includes('✅') || log.includes('✨') || log.includes('🎯') || log.includes('complete') ? 'text-emerald-400' : log.includes('❌') || log.includes('FAILURE') ? 'text-red-400' : log.includes('Agent') || log.includes('Launching') ? 'text-blue-400' : 'text-slate-300'}`}>{log}</span>
              </div>
            ))}
            <div ref={logEndRef} />
          </div>
        </div>
      )}

      {/* Tailored Resume Editor Modal */}
      {showEditor && tailoredData && (
        <TailoredResumeEditor
          data={tailoredData}
          originalData={profileData}
          onChange={(updatedData) => {
            setTailoredData(updatedData);
            onResult(updatedData);
          }}
          onClose={() => setShowEditor(false)}
        />
      )}
    </div>
  );
};

export default AIBuildPage;
