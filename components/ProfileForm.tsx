
import React, { useState } from 'react';
import { ResumeData, GenerationType } from '../types';
import { generateResumeContent } from '../services/geminiService';

interface Props {
  data: ResumeData;
  onChange: (newData: ResumeData) => void;
}

const ProfileForm: React.FC<Props> = ({ data, onChange }) => {
  const [loading, setLoading] = useState(false);

  const updatePersonalInfo = (field: string, value: string) => {
    onChange({
      ...data,
      personalInfo: { ...data.personalInfo, [field]: value }
    });
  };

  const handleAISummary = async () => {
    setLoading(true);
    try {
      const prompt = `${data.personalInfo.fullName}, a Data Engineer with focus on ${data.skills.languages.join(', ')}`;
      const result = await generateResumeContent(GenerationType.SUMMARY, prompt);
      onChange({ ...data, summary: result });
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const inputClass = "w-full p-3 bg-white border border-slate-300 rounded-xl focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 focus:outline-none transition-all text-sm text-slate-900 shadow-sm placeholder-slate-400";
  const labelClass = "block text-xs font-bold text-slate-500 uppercase mb-2 tracking-wider ml-1";

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-200">
        <h2 className="text-2xl font-black text-slate-900 mb-2">Personal Profile</h2>
        <p className="text-sm text-slate-500 mb-8 font-medium">Manage your identity and contact information.</p>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="md:col-span-2">
            <label className={labelClass}>Full Name</label>
            <input 
              className={inputClass} 
              value={data.personalInfo.fullName} 
              onChange={e => updatePersonalInfo('fullName', e.target.value)}
              placeholder="Jane Doe"
            />
          </div>
          <div>
            <label className={labelClass}>Email Address</label>
            <input 
              className={inputClass} 
              type="email"
              value={data.personalInfo.email} 
              onChange={e => updatePersonalInfo('email', e.target.value)}
              placeholder="jane@example.com"
            />
          </div>
          <div>
            <label className={labelClass}>Phone Number</label>
            <input 
              className={inputClass} 
              value={data.personalInfo.phone} 
              onChange={e => updatePersonalInfo('phone', e.target.value)}
              placeholder="(555) 000-0000"
            />
          </div>
          <div className="md:col-span-2">
            <label className={labelClass}>Location</label>
            <input 
              className={inputClass} 
              value={data.personalInfo.location} 
              onChange={e => updatePersonalInfo('location', e.target.value)}
              placeholder="San Francisco, CA"
            />
          </div>
          <div>
            <label className={labelClass}>LinkedIn URL</label>
            <input 
              className={inputClass} 
              value={data.personalInfo.linkedin} 
              onChange={e => updatePersonalInfo('linkedin', e.target.value)}
              placeholder="linkedin.com/in/username"
            />
          </div>
          <div>
            <label className={labelClass}>GitHub Profile</label>
            <input 
              className={inputClass} 
              value={data.personalInfo.github} 
              onChange={e => updatePersonalInfo('github', e.target.value)}
              placeholder="github.com/username"
            />
          </div>
        </div>
      </div>

      <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-200">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h2 className="text-2xl font-black text-slate-900">Professional Summary</h2>
            <p className="text-sm text-slate-500 font-medium">Your high-level career pitch.</p>
          </div>
          <button 
            onClick={handleAISummary}
            disabled={loading}
            className="text-xs font-bold text-blue-600 bg-blue-50 px-4 py-2 rounded-full hover:bg-blue-100 transition-all flex items-center gap-2 border border-blue-100 active:scale-95 disabled:opacity-50"
          >
            {loading ? <i className="fas fa-spinner fa-spin"></i> : <i className="fas fa-wand-magic-sparkles"></i>}
            Refine with AI
          </button>
        </div>
        <textarea 
          className={`${inputClass} h-44 resize-none leading-relaxed`}
          value={data.summary}
          onChange={e => onChange({ ...data, summary: e.target.value })}
          placeholder="Briefly describe your core expertise and achievements..."
        />
      </div>
    </div>
  );
};

export default ProfileForm;
