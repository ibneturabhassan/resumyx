
import React from 'react';
import { ResumeData } from '../types/index';
import { apiService } from '../services/apiService';

interface Props {
  data: ResumeData;
  onChange: (newData: ResumeData) => void;
}

const ProfilePage: React.FC<Props> = ({ data, onChange }) => {
  const inputClass = "w-full p-3.5 bg-slate-50/80 border border-slate-200 rounded-xl focus:ring-4 focus:ring-blue-500/20 focus:border-blue-400 focus:bg-white focus:outline-none transition-all duration-200 text-sm text-slate-800 shadow-sm placeholder-slate-400 hover:border-slate-300 hover:bg-slate-50";
  const labelClass = "block text-xs font-semibold text-slate-500 uppercase mb-2.5 tracking-wide";
  const sectionClass = "bg-white p-8 rounded-2xl shadow-md border border-slate-100 mb-8 hover:shadow-lg transition-shadow duration-300";
  const btnClass = "px-5 py-2.5 bg-slate-900 text-white rounded-xl hover:bg-slate-800 transition-all duration-200 text-sm font-semibold shadow-lg hover:shadow-xl active:scale-[0.98] hover:-translate-y-0.5";

  const updatePersonalInfo = (field: string, value: string) => {
    onChange({ ...data, personalInfo: { ...data.personalInfo, [field]: value } });
  };

  const addItem = (field: 'experience' | 'education' | 'projects') => {
    const newItem: any = { id: Math.random().toString(36).substr(2, 9) };
    if (field === 'experience') {
      Object.assign(newItem, { company: '', role: '', location: '', startDate: '', endDate: '', description: [''] });
    } else if (field === 'education') {
      Object.assign(newItem, { institution: '', degree: '', location: '', graduationDate: '' });
    } else {
      Object.assign(newItem, { name: '', technologies: [], description: [''] });
    }
    onChange({ ...data, [field]: [...(data[field] || []), newItem] });
  };

  const removeItem = (field: 'experience' | 'education' | 'projects', id: string) => {
    onChange({ ...data, [field]: (data[field] || []).filter((item: any) => item.id !== id) });
  };

  const updateItem = (field: 'experience' | 'education' | 'projects', id: string, key: string, value: any) => {
    const updated = (data[field] || []).map((item: any) => item.id === id ? { ...item, [key]: value } : item);
    onChange({ ...data, [field]: updated });
  };

  // Ensure skills object exists to avoid crash
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
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Personal Info */}
      <section className={sectionClass}>
        <div className="flex items-center gap-3 mb-6 pb-4 border-b border-slate-100">
          <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center text-white">
            <i className="fas fa-user text-xs"></i>
          </div>
          <h2 className="text-xl font-bold text-slate-800">Personal Details</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="md:col-span-2">
            <label className={labelClass}>Full Name</label>
            <input className={inputClass} value={data.personalInfo.fullName} onChange={e => updatePersonalInfo('fullName', e.target.value)} placeholder="Alex Rivera" />
          </div>
          <div>
            <label className={labelClass}>Email</label>
            <input className={inputClass} value={data.personalInfo.email} onChange={e => updatePersonalInfo('email', e.target.value)} placeholder="alex@example.com" />
          </div>
          <div>
            <label className={labelClass}>Phone</label>
            <input className={inputClass} value={data.personalInfo.phone} onChange={e => updatePersonalInfo('phone', e.target.value)} placeholder="(555) 000-0000" />
          </div>
          <div>
            <label className={labelClass}>Location</label>
            <input className={inputClass} value={data.personalInfo.location} onChange={e => updatePersonalInfo('location', e.target.value)} placeholder="New York, NY" />
          </div>
          <div>
            <label className={labelClass}>LinkedIn</label>
            <input className={inputClass} value={data.personalInfo.linkedin} onChange={e => updatePersonalInfo('linkedin', e.target.value)} placeholder="linkedin.com/in/alex" />
          </div>
          <div>
            <label className={labelClass}>GitHub</label>
            <input className={inputClass} value={data.personalInfo.github} onChange={e => updatePersonalInfo('github', e.target.value)} placeholder="github.com/alex" />
          </div>
        </div>
      </section>

      {/* Additional Info */}
      <section className={sectionClass}>
        <div className="flex justify-between items-center mb-6 pb-4 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-violet-600 flex items-center justify-center text-white">
              <i className="fas fa-info-circle text-xs"></i>
            </div>
            <h2 className="text-xl font-bold text-slate-800">Additional Information</h2>
          </div>
          <div className="text-xs text-slate-500 bg-slate-50 px-4 py-2 rounded-lg border border-slate-200">
            <i className="fas fa-lightbulb mr-1.5 text-amber-500"></i>
            Used by AI to tailor your resume
          </div>
        </div>
        <div className="mb-3">
          <p className="text-sm text-slate-600 mb-2">
            Share additional context about yourself that won't appear directly in your resume but will help the AI create tailored summaries for specific job roles.
          </p>
          <p className="text-xs text-slate-500 italic">
            Examples: Career goals, preferred work environment, leadership experience, specific interests, unique strengths, etc.
          </p>
        </div>
        <textarea
          className={`${inputClass} h-40 resize-none`}
          value={data.additionalInfo}
          onChange={e => onChange({ ...data, additionalInfo: e.target.value })}
          placeholder="e.g., I am passionate about building scalable systems and mentoring junior engineers. I thrive in fast-paced environments and have experience leading cross-functional teams. I am particularly interested in roles that involve architectural decision-making and technical leadership..."
        />
      </section>

      {/* Skills */}
      <section className={sectionClass}>
        <div className="flex items-center gap-3 mb-6 pb-4 border-b border-slate-100">
          <div className="w-8 h-8 rounded-lg bg-emerald-600 flex items-center justify-center text-white">
            <i className="fas fa-code text-xs"></i>
          </div>
          <h2 className="text-xl font-bold text-slate-800">Technical Skills</h2>
        </div>
        <div className="space-y-3">
          <label className={labelClass}>Skills (comma separated)</label>
          <textarea
            className={`${inputClass} h-32 resize-none leading-relaxed`}
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
            placeholder="e.g. Python, SQL, Spark, AWS, Kubernetes, TensorFlow, Docker, React, Node.js, PostgreSQL, MongoDB, Git, CI/CD"
          />
          <p className="text-xs text-slate-500">
            Enter skills separated by commas or new lines. The AI will categorize and format them automatically.
          </p>
        </div>
      </section>

      {/* Experience */}
      <section className={sectionClass}>
        <div className="flex justify-between items-center mb-6 pb-4 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-amber-600 flex items-center justify-center text-white">
              <i className="fas fa-briefcase text-xs"></i>
            </div>
            <h2 className="text-xl font-bold text-slate-800">Work History</h2>
          </div>
          <button onClick={() => addItem('experience')} className={btnClass}>
            <i className="fas fa-plus mr-2"></i>Add Position
          </button>
        </div>
        <div className="space-y-4">
          {(data.experience || []).map((exp) => (
            <div key={exp.id} className="p-6 border border-slate-200 rounded-xl bg-slate-50/50 relative group hover:bg-slate-50 transition-all duration-200">
              <button onClick={() => removeItem('experience', exp.id)} className="absolute top-6 right-6 w-9 h-9 rounded-lg bg-slate-50 text-slate-400 hover:bg-red-50 hover:text-red-500 flex items-center justify-center transition-all duration-200"><i className="fas fa-trash-can text-sm"></i></button>
              <div className="grid grid-cols-2 gap-6">
                <div className="col-span-2">
                  <label className={labelClass}>Company</label>
                  <input className={inputClass} value={exp.company} onChange={e => updateItem('experience', exp.id, 'company', e.target.value)} />
                </div>
                <div>
                  <label className={labelClass}>Role</label>
                  <input className={inputClass} value={exp.role} onChange={e => updateItem('experience', exp.id, 'role', e.target.value)} />
                </div>
                <div>
                  <label className={labelClass}>Location</label>
                  <input className={inputClass} value={exp.location} onChange={e => updateItem('experience', exp.id, 'location', e.target.value)} />
                </div>
                <div>
                  <label className={labelClass}>Start Date</label>
                  <input className={inputClass} value={exp.startDate} onChange={e => updateItem('experience', exp.id, 'startDate', e.target.value)} />
                </div>
                <div>
                  <label className={labelClass}>End Date</label>
                  <input className={inputClass} value={exp.endDate} onChange={e => updateItem('experience', exp.id, 'endDate', e.target.value)} />
                </div>
                <div className="col-span-2">
                  <label className={labelClass}>Description (one per line)</label>
                  <textarea 
                    className={`${inputClass} h-32`}
                    value={(exp.description || []).join('\n')}
                    onChange={e => updateItem('experience', exp.id, 'description', e.target.value.split('\n'))}
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Projects */}
      <section className={sectionClass}>
        <div className="flex justify-between items-center mb-6 pb-4 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-cyan-600 flex items-center justify-center text-white">
              <i className="fas fa-diagram-project text-xs"></i>
            </div>
            <h2 className="text-xl font-bold text-slate-800">Projects</h2>
          </div>
          <button onClick={() => addItem('projects')} className={btnClass}>
            <i className="fas fa-plus mr-2"></i>Add Project
          </button>
        </div>
        <div className="space-y-4">
          {(data.projects || []).map((proj) => (
            <div key={proj.id} className="p-6 border border-slate-200 rounded-xl bg-slate-50/50 relative group hover:bg-slate-50 transition-all duration-200">
              <button onClick={() => removeItem('projects', proj.id)} className="absolute top-6 right-6 w-9 h-9 rounded-lg bg-slate-50 text-slate-400 hover:bg-red-50 hover:text-red-500 flex items-center justify-center transition-all duration-200"><i className="fas fa-trash-can text-sm"></i></button>
              <div className="grid grid-cols-2 gap-6">
                <div className="col-span-2">
                  <label className={labelClass}>Project Name</label>
                  <input className={inputClass} value={proj.name} onChange={e => updateItem('projects', proj.id, 'name', e.target.value)} />
                </div>
                <div className="col-span-2">
                  <label className={labelClass}>Technologies (Comma separated)</label>
                  <input 
                    className={inputClass} 
                    value={(proj.technologies || []).join(', ')} 
                    onChange={e => updateItem('projects', proj.id, 'technologies', e.target.value.split(',').map(s => s.trim()))} 
                  />
                </div>
                <div className="col-span-2">
                  <label className={labelClass}>Description (one per line)</label>
                  <textarea 
                    className={`${inputClass} h-32`}
                    value={(proj.description || []).join('\n')}
                    onChange={e => updateItem('projects', proj.id, 'description', e.target.value.split('\n'))}
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Education */}
      <section className={sectionClass}>
        <div className="flex justify-between items-center mb-6 pb-4 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-rose-600 flex items-center justify-center text-white">
              <i className="fas fa-graduation-cap text-xs"></i>
            </div>
            <h2 className="text-xl font-bold text-slate-800">Education</h2>
          </div>
          <button onClick={() => addItem('education')} className={btnClass}>
            <i className="fas fa-plus mr-2"></i>Add Education
          </button>
        </div>
        <div className="space-y-4">
          {(data.education || []).map((edu) => (
            <div key={edu.id} className="p-6 border border-slate-200 rounded-xl bg-slate-50/50 relative group hover:bg-slate-50 transition-all duration-200">
              <button onClick={() => removeItem('education', edu.id)} className="absolute top-6 right-6 w-9 h-9 rounded-lg bg-slate-50 text-slate-400 hover:bg-red-50 hover:text-red-500 flex items-center justify-center transition-all duration-200"><i className="fas fa-trash-can text-sm"></i></button>
              <div className="grid grid-cols-2 gap-6">
                <div className="col-span-2">
                  <label className={labelClass}>Institution</label>
                  <input className={inputClass} value={edu.institution} onChange={e => updateItem('education', edu.id, 'institution', e.target.value)} />
                </div>
                <div>
                  <label className={labelClass}>Degree</label>
                  <input className={inputClass} value={edu.degree} onChange={e => updateItem('education', edu.id, 'degree', e.target.value)} />
                </div>
                <div>
                  <label className={labelClass}>Location</label>
                  <input className={inputClass} value={edu.location} onChange={e => updateItem('education', edu.id, 'location', e.target.value)} />
                </div>
                <div>
                  <label className={labelClass}>Graduation Date</label>
                  <input className={inputClass} value={edu.graduationDate} onChange={e => updateItem('education', edu.id, 'graduationDate', e.target.value)} />
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Certifications */}
      <section className={sectionClass}>
        <div className="flex items-center gap-3 mb-6 pb-4 border-b border-slate-100">
          <div className="w-8 h-8 rounded-lg bg-amber-600 flex items-center justify-center text-white">
            <i className="fas fa-certificate text-xs"></i>
          </div>
          <h2 className="text-xl font-bold text-slate-800">Certifications</h2>
        </div>
        <div className="space-y-3">
          <label className={labelClass}>Certifications (one per line)</label>
          <textarea
            className={`${inputClass} h-32 resize-none leading-relaxed`}
            value={(data.certifications || []).join('\n')}
            onChange={(e) => {
              const certList = e.target.value.split('\n').filter(cert => cert.trim());
              onChange({ ...data, certifications: certList });
            }}
            placeholder="e.g., AWS Certified Solutions Architect&#10;Google Cloud Professional Data Engineer&#10;Certified Kubernetes Administrator (CKA)"
          />
          <p className="text-xs text-slate-500 italic">Enter one certification per line</p>
        </div>
      </section>
    </div>
  );
};

export default ProfilePage;
