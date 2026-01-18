
import React from 'react';
import { ResumeData } from '../types';

interface Props {
  data: ResumeData;
  highlightedSection?: string | null;
}

const ResumePreview: React.FC<Props> = ({ data, highlightedSection }) => {
  const safePersonalInfo = data?.personalInfo || {};
  const safeSkills = data?.skills || { languages: [], databases: [], cloud: [], tools: [] };
  const safeExperience = data?.experience || [];
  const safeEducation = data?.education || [];
  const safeProjects = data?.projects || [];
  const safeCertifications = data?.certifications || [];

  const sectionClass = (name: string) => `
    mb-6 transition-all duration-300 relative
    ${highlightedSection === name ? 'bg-blue-50/50 ring-1 ring-blue-100 p-2 -mx-2 rounded-md' : 'p-0'}
  `;

  return (
    <div className="resume-canvas bg-slate-100 p-4 lg:p-12 min-h-full">
      <style>{`
        .resume-canvas {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 2rem;
        }

        .resume-continuous {
          width: 210mm;
          min-height: 297mm;
          background-color: white;
          position: relative;
          padding: 0.75in;
          box-sizing: border-box;
          font-family: 'Inter', sans-serif;
          color: #111;
          line-height: 1.4;
          box-shadow: 0 20px 50px rgba(0,0,0,0.1);
        }

        /* Visual indicator for page breaks in preview */
        .page-break-marker {
           position: absolute;
           left: 0;
           right: 0;
           height: 2px;
           background: repeating-linear-gradient(to right, transparent, transparent 5px, #cbd5e1 5px, #cbd5e1 10px);
           z-index: 10;
           pointer-events: none;
        }
        
        .page-label {
           position: absolute;
           right: 15px;
           font-size: 9px;
           text-transform: uppercase;
           letter-spacing: 2px;
           color: #94a3b8;
           font-weight: 900;
           margin-top: -14px;
           background: white;
           padding: 2px 8px;
           border-radius: 4px;
           border: 1px solid #e2e8f0;
        }

        h2 {
          font-size: 11pt;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.1em;
          border-bottom: 1.5pt solid #222;
          padding-bottom: 2px;
          margin-bottom: 12px;
          color: #000;
          display: block;
          width: 100%;
        }

        .section-content { font-size: 10pt; color: #222; }
        .item-title { font-weight: 700; font-size: 10.5pt; color: #000; }
        .item-subtitle { font-weight: 600; color: #444; font-size: 10pt; }
        .item-date { font-weight: 600; font-size: 9.5pt; color: #333; }

        .bullet-list {
          list-style-type: disc;
          padding-left: 1.1rem;
          margin-top: 4px;
        }

        .bullet-item {
          font-size: 9.8pt;
          margin-bottom: 3px;
          line-height: 1.35;
          text-align: left;
          page-break-inside: avoid;
        }

        section {
           page-break-inside: avoid;
        }

        @media print {
          .resume-canvas { padding: 0 !important; background: white !important; gap: 0 !important; }
          .resume-continuous { 
            box-shadow: none !important; 
            padding: 0.75in !important; 
            margin: 0 !important;
            width: 100% !important;
          }
          .page-break-marker, .page-label { display: none !important; }
          
          @page {
            margin: 0;
            size: A4;
          }
        }
      `}</style>

      <div className="resume-continuous">
        {/* Page Break Indicators for preview (every 297mm) */}
        <div className="page-break-marker no-print" style={{ top: '297mm' }}>
           <span className="page-label">Page 1 End</span>
        </div>
        <div className="page-break-marker no-print" style={{ top: '594mm' }}>
           <span className="page-label">Page 2 End</span>
        </div>

        {/* Header */}
        <header className="text-center mb-8">
          <h1 className="text-[26pt] font-extrabold text-black mb-1 tracking-tight uppercase leading-tight">
            {safePersonalInfo.fullName || 'Candidate Name'}
          </h1>
          <div className="flex flex-wrap justify-center items-center gap-x-4 gap-y-1 text-[10.5pt] text-gray-800 font-semibold mb-1">
            {safePersonalInfo.location && <span>{safePersonalInfo.location}</span>}
            {safePersonalInfo.phone && <span>{safePersonalInfo.phone}</span>}
            {safePersonalInfo.email && <span className="underline">{safePersonalInfo.email}</span>}
          </div>
          <div className="flex flex-wrap justify-center items-center gap-x-6 text-[9.5pt] text-gray-600 font-medium">
            {safePersonalInfo.linkedin && <span>LinkedIn: {safePersonalInfo.linkedin.replace(/^https?:\/\/(www\.)?/, '')}</span>}
            {safePersonalInfo.github && <span>GitHub: {safePersonalInfo.github.replace(/^https?:\/\/(www\.)?/, '')}</span>}
          </div>
        </header>

        {/* Summary */}
        <section className={sectionClass('Summary')}>
          <h2>Professional Profile</h2>
          <div className="section-content leading-relaxed font-medium">
            {data.summary || 'Senior Data Engineer with expertise in building scalable data architectures.'}
          </div>
        </section>

        {/* Skills */}
        <section className={sectionClass('Skills')}>
          <h2>Technical Skills</h2>
          <div className="section-content space-y-1.5">
            {safeSkills.languages?.length > 0 && <p><span className="font-bold">Languages:</span> {safeSkills.languages.join(', ')}</p>}
            {safeSkills.databases?.length > 0 && <p><span className="font-bold">Databases:</span> {safeSkills.databases.join(', ')}</p>}
            {safeSkills.cloud?.length > 0 && <p><span className="font-bold">Cloud:</span> {safeSkills.cloud.join(', ')}</p>}
            {safeSkills.tools?.length > 0 && <p><span className="font-bold">Tools:</span> {safeSkills.tools.join(', ')}</p>}
          </div>
        </section>

        {/* Experience */}
        <section className={sectionClass('Experience')}>
          <h2>Professional Experience</h2>
          <div className="space-y-6">
            {safeExperience.map((exp) => (
              <div key={exp.id}>
                <div className="flex justify-between items-baseline mb-0.5">
                  <span className="item-title">{exp.company}</span>
                  <span className="item-date">{exp.startDate} – {exp.endDate}</span>
                </div>
                <div className="flex justify-between items-baseline mb-2">
                  <span className="item-subtitle italic">{exp.role}</span>
                  <span className="text-[9pt] text-gray-500 font-bold uppercase tracking-wider">{exp.location}</span>
                </div>
                <ul className="bullet-list">
                  {(exp.description || []).map((bullet, idx) => (
                    bullet.trim() && <li key={idx} className="bullet-item">{bullet.replace(/^[•\-\*]\s*/, '')}</li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </section>

        {/* Projects */}
        {safeProjects.length > 0 && (
          <section className={sectionClass('Projects')}>
            <h2>Technical Projects</h2>
            <div className="space-y-5">
              {safeProjects.map((proj) => (
                <div key={proj.id}>
                  <div className="flex justify-between items-baseline mb-1">
                    <span className="item-title">{proj.name}</span>
                    <span className="text-[9pt] font-black text-gray-400 uppercase tracking-widest">{(proj.technologies || []).join(' • ')}</span>
                  </div>
                  <ul className="bullet-list">
                    {(proj.description || []).map((bullet, idx) => (
                      bullet.trim() && <li key={idx} className="bullet-item">{bullet}</li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Education */}
        <section className={sectionClass('Education')}>
          <h2>Education</h2>
          <div className="space-y-4">
            {safeEducation.map((edu) => (
              <div key={edu.id} className="flex justify-between items-start">
                <div>
                  <div className="item-title">{edu.institution}</div>
                  <div className="item-subtitle">{edu.degree}</div>
                </div>
                <div className="text-right">
                  <div className="item-date">{edu.graduationDate}</div>
                  <div className="text-[9.5pt] text-gray-500 font-bold uppercase tracking-wider">{edu.location}</div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Certifications */}
        {safeCertifications.length > 0 && (
          <section className="mt-8">
            <h2>Certifications</h2>
            <div className="section-content grid grid-cols-2 gap-x-10 gap-y-1.5 font-medium">
              {safeCertifications.map((cert, idx) => (
                <div key={idx} className="flex items-start gap-2">
                  <span className="text-gray-900">•</span>
                  <span>{cert}</span>
                </div>
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  );
};

export default ResumePreview;
