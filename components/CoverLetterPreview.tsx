
import React from 'react';
import { ResumeData } from '../types';

interface Props {
  data: ResumeData;
}

const CoverLetterPreview: React.FC<Props> = ({ data }) => {
  const { personalInfo, coverLetter } = data;
  const date = new Date().toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

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
          padding: 1in;
          box-sizing: border-box;
          font-family: 'Merriweather', serif;
          -webkit-font-smoothing: antialiased;
          color: #111;
          line-height: 1.6;
          box-shadow: 0 20px 50px rgba(0,0,0,0.1);
        }

        .page-break-marker {
           position: absolute;
           left: 0;
           right: 0;
           height: 2px;
           background: repeating-linear-gradient(to right, transparent, transparent 5px, #ef4444 5px, #ef4444 10px);
           z-index: 10;
           pointer-events: none;
        }
        
        .page-label {
           position: absolute;
           right: 15px;
           font-size: 9px;
           text-transform: uppercase;
           letter-spacing: 2px;
           color: #ef4444;
           font-weight: 900;
           margin-top: -14px;
           background: white;
           padding: 2px 8px;
           border-radius: 4px;
           border: 1px solid #fee2e2;
        }

        .header-name {
          font-family: 'Inter', sans-serif;
          font-weight: 800;
          font-size: 24pt;
          text-transform: uppercase;
          letter-spacing: -0.02em;
          margin-bottom: 4px;
          color: #000;
        }

        .header-info {
          font-family: 'Inter', sans-serif;
          font-size: 10pt;
          color: #444;
          font-weight: 600;
          margin-bottom: 50px;
        }

        .letter-content {
          font-size: 11pt;
          color: #111;
          white-space: pre-wrap;
          text-align: justify;
          font-weight: 400;
        }

        .letter-date {
          margin-bottom: 35px;
          font-family: 'Inter', sans-serif;
          font-weight: 700;
          color: #000;
          font-size: 11pt;
        }

        .signature {
          margin-top: 50px;
        }

        @media print {
          .resume-canvas { padding: 0 !important; background: white !important; gap: 0 !important; }
          .resume-continuous { 
            box-shadow: none !important; 
            padding: 1in !important; 
            width: 100% !important;
          }
          .page-break-marker, .page-label { display: none !important; }
        }
      `}</style>

      <div className="resume-continuous">
        {/* Page Break Indicator */}
        <div className="page-break-marker no-print" style={{ top: '297mm' }}>
           <span className="page-label">Page 1 Boundary</span>
        </div>

        {/* Header */}
        <div className="text-right border-b-4 border-black pb-4 mb-12">
          <h1 className="header-name">{personalInfo.fullName || 'Candidate Name'}</h1>
          <div className="header-info space-y-0.5">
            <p>{personalInfo.location}</p>
            <p>{personalInfo.phone} • {personalInfo.email}</p>
            {personalInfo.linkedin && <p>{personalInfo.linkedin.replace(/^https?:\/\/(www\.)?/, '')}</p>}
          </div>
        </div>

        <div className="letter-date">{date}</div>

        <div className="letter-content">
          {coverLetter || "Your tailored cover letter will appear here. Start the Agent workflow to generate a professional, single-page narrative."}
        </div>

        <div className="signature">
          <p className="font-bold text-lg">Sincerely,</p>
          <div className="mt-8 text-2xl" style={{ fontFamily: 'cursive' }}>{personalInfo.fullName}</div>
          <p className="mt-2 font-bold text-gray-900">{personalInfo.fullName}</p>
        </div>
      </div>
    </div>
  );
};

export default CoverLetterPreview;
