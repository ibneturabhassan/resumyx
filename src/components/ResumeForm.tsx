
import React from 'react';
import { ResumeData } from '../types/index';

interface Props {
  data: ResumeData;
  onChange: (newData: ResumeData) => void;
}

const ResumeForm: React.FC<Props> = ({ data, onChange }) => {
  const addExperience = () => {
    const newExp = {
      id: Math.random().toString(36).substr(2, 9),
      company: '',
      role: '',
      location: '',
      startDate: '',
      endDate: '',
      description: ['']
    };
    onChange({ ...data, experience: [...data.experience, newExp] });
  };

  const updateExperience = (id: string, field: string, value: any) => {
    const updated = data.experience.map(exp => 
      exp.id === id ? { ...exp, [field]: value } : exp
    );
    onChange({ ...data, experience: updated });
  };

  const removeExperience = (id: string) => {
    onChange({ ...data, experience: data.experience.filter(e => e.id !== id) });
  };

  const inputClass = "w-full p-3 bg-white border border-slate-300 rounded-xl focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 focus:outline-none transition-all text-sm text-slate-900 shadow-sm placeholder-slate-400";
  const labelClass = "block text-xs font-bold text-slate-500 uppercase mb-2 tracking-wider ml-1";
  const btnClass = "px-6 py-2.5 bg-slate-900 text-white rounded-xl hover:bg-black transition-all text-sm font-bold shadow-md active:scale-95";
  const skillsData = data.skills || { languages: [], databases: [], cloud: [], tools: [] };
  const normalizedSkillList = (value: string) => {
    const tokens = value
      .split(/[,\\n]/g)
      .map((item) => item.trim())
      .filter(Boolean);

    const unique = new Map<string, string>();
    tokens.forEach((item) => {
      const key = item.toLowerCase();
      if (!unique.has(key)) {
        unique.set(key, item);
      }
    });

    return Array.from(unique.values());
  };

  const deriveSkillsText = () => {
    if (data.skillsRaw?.trim()) {
      return data.skillsRaw;
    }

    const combined = [
      ...skillsData.languages,
      ...skillsData.databases,
      ...skillsData.cloud,
      ...skillsData.tools
    ];

    return Array.from(new Set(combined)).join(', ');
  };

  return (
    <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Skills Section */}
      <section className="bg-white p-8 rounded-3xl shadow-sm border border-slate-200">
        <h2 className="text-2xl font-black text-slate-900 mb-2">Technical Skills</h2>
        <p className="text-sm text-slate-500 mb-8 font-medium">List your tools and technologies for ATS parsing.</p>
        <div className="space-y-3">
          <label className={labelClass}>Skills (comma separated)</label>
          <textarea
            className={`${inputClass} h-32 resize-none leading-relaxed`}
            placeholder="e.g. Python, SQL, Spark, AWS, Kubernetes, TensorFlow, Docker, React, Node.js, PostgreSQL, MongoDB, Git, CI/CD"
            value={deriveSkillsText()}
            onChange={(e) => {
              const normalized = normalizedSkillList(e.target.value);
              onChange({
                ...data,
                skillsRaw: e.target.value,
                skills: {
                  languages: [],
                  databases: [],
                  cloud: [],
                  tools: normalized
                }
              });
            }}
          />
          <p className="text-xs text-slate-500">
            Enter skills separated by commas or new lines. The AI will categorize and format them automatically.
          </p>
        </div>
      </section>

      {/* Experience Section */}
      <section>
        <div className="flex justify-between items-end mb-8">
          <div>
            <h2 className="text-2xl font-black text-slate-900">Work Experience</h2>
            <p className="text-sm text-slate-500 font-medium">Your professional history and accomplishments.</p>
          </div>
          <button onClick={addExperience} className={btnClass}>
            <i className="fas fa-plus mr-2"></i> Add Position
          </button>
        </div>
        
        <div className="space-y-6">
          {data.experience.map((exp) => (
            <div key={exp.id} className="p-8 border border-slate-200 rounded-3xl bg-white shadow-sm relative group transition-all hover:border-slate-300">
              <button 
                onClick={() => removeExperience(exp.id)}
                className="absolute top-6 right-6 text-slate-300 hover:text-red-500 transition-colors p-2"
                title="Remove Entry"
              >
                <i className="fas fa-trash-alt text-lg"></i>
              </button>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="md:col-span-2">
                  <label className={labelClass}>Company Name</label>
                  <input className={inputClass} value={exp.company} onChange={e => updateExperience(exp.id, 'company', e.target.value)} placeholder="Google" />
                </div>
                <div>
                  <label className={labelClass}>Job Title</label>
                  <input className={inputClass} value={exp.role} onChange={e => updateExperience(exp.id, 'role', e.target.value)} placeholder="Lead Data Engineer" />
                </div>
                <div>
                  <label className={labelClass}>Location</label>
                  <input className={inputClass} value={exp.location} onChange={e => updateExperience(exp.id, 'location', e.target.value)} placeholder="Mountain View, CA" />
                </div>
                <div>
                  <label className={labelClass}>Start Date</label>
                  <input className={inputClass} value={exp.startDate} onChange={e => updateExperience(exp.id, 'startDate', e.target.value)} placeholder="Jan 2020" />
                </div>
                <div>
                  <label className={labelClass}>End Date</label>
                  <input className={inputClass} value={exp.endDate} onChange={e => updateExperience(exp.id, 'endDate', e.target.value)} placeholder="Present" />
                </div>
                <div className="md:col-span-2">
                  <label className={labelClass}>Key Contributions (Bullet points per line)</label>
                  <textarea 
                    className={`${inputClass} h-48 resize-none leading-relaxed`}
                    value={exp.description.join('\n')}
                    onChange={e => updateExperience(exp.id, 'description', e.target.value.split('\n'))}
                    placeholder="• Built a real-time analytics platform using Kafka and Spark Streaming..."
                  />
                </div>
              </div>
            </div>
          ))}
          {data.experience.length === 0 && (
            <div className="text-center py-16 bg-slate-100/50 border-2 border-dashed border-slate-200 rounded-3xl">
              <p className="text-slate-400 font-medium">No experience added yet. Click "Add Position" to begin.</p>
            </div>
          )}
        </div>
      </section>
    </div>
  );
};

export default ResumeForm;
