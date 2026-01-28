import React, { useState } from 'react';
import { ResumeData } from '../types/index';

interface Props {
  data: ResumeData;
  originalData: ResumeData;
  onChange: (newData: ResumeData) => void;
  onClose: () => void;
}

const TailoredResumeEditor: React.FC<Props> = ({ data, originalData, onChange, onClose }) => {
  const [editingData, setEditingData] = useState<ResumeData>(data);
  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set(['summary', 'skills']));

  const toggleSection = (section: string) => {
    const newExpanded = new Set(expandedSections);
    if (newExpanded.has(section)) {
      newExpanded.delete(section);
    } else {
      newExpanded.add(section);
    }
    setExpandedSections(newExpanded);
  };

  const handleSave = () => {
    onChange(editingData);
    onClose();
  };

  const handleDiscard = () => {
    setEditingData(data);
    onClose();
  };

  const updateSummary = (value: string) => {
    setEditingData({ ...editingData, additionalInfo: value });
  };

  const updateSkills = (category: string, value: string) => {
    const skills = value.split(',').map(s => s.trim()).filter(Boolean);
    setEditingData({
      ...editingData,
      skills: {
        ...editingData.skills,
        [category]: skills
      }
    });
  };

  const updateSkillCategory = (oldCategory: string, newCategory: string, value: string) => {
    const skills = value.split(',').map(s => s.trim()).filter(Boolean);
    const updatedSkills = { ...editingData.skills };

    // Remove old category
    delete updatedSkills[oldCategory as keyof typeof updatedSkills];

    // Add new category
    updatedSkills[newCategory as keyof typeof updatedSkills] = skills as any;

    setEditingData({
      ...editingData,
      skills: updatedSkills
    });
  };

  const removeSkillCategory = (category: string) => {
    const updatedSkills = { ...editingData.skills };
    delete updatedSkills[category as keyof typeof updatedSkills];
    setEditingData({
      ...editingData,
      skills: updatedSkills
    });
  };

  const addSkillCategory = () => {
    const newCategory = prompt('Enter new skill category name (e.g., "Frameworks", "DevOps Tools"):');
    if (newCategory && newCategory.trim()) {
      const categoryKey = newCategory.trim().toLowerCase().replace(/\s+/g, '_');
      setEditingData({
        ...editingData,
        skills: {
          ...editingData.skills,
          [categoryKey]: []
        }
      });
    }
  };

  const updateExperience = (id: string, field: string, value: any) => {
    const updated = editingData.experience.map(exp =>
      exp.id === id ? { ...exp, [field]: value } : exp
    );
    setEditingData({ ...editingData, experience: updated });
  };

  const removeExperience = (id: string) => {
    const updated = editingData.experience.filter(exp => exp.id !== id);
    setEditingData({ ...editingData, experience: updated });
  };

  const updateEducation = (id: string, field: string, value: any) => {
    const updated = editingData.education.map(edu =>
      edu.id === id ? { ...edu, [field]: value } : edu
    );
    setEditingData({ ...editingData, education: updated });
  };

  const removeEducation = (id: string) => {
    const updated = editingData.education.filter(edu => edu.id !== id);
    setEditingData({ ...editingData, education: updated });
  };

  const updateProject = (id: string, field: string, value: any) => {
    const updated = editingData.projects.map(proj =>
      proj.id === id ? { ...proj, [field]: value } : proj
    );
    setEditingData({ ...editingData, projects: updated });
  };

  const removeProject = (id: string) => {
    const updated = editingData.projects.filter(proj => proj.id !== id);
    setEditingData({ ...editingData, projects: updated });
  };

  const updateCertifications = (value: string) => {
    const certs = value.split('\n').map(c => c.trim()).filter(Boolean);
    setEditingData({ ...editingData, certifications: certs });
  };

  const removeCertification = (index: number) => {
    const updated = editingData.certifications.filter((_, i) => i !== index);
    setEditingData({ ...editingData, certifications: updated });
  };

  const inputClass = "w-full p-3 bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:outline-none transition-all text-sm text-slate-900";
  const labelClass = "block text-xs font-semibold text-slate-700 mb-2";

  const hasChanges = (section: string, value: any, originalValue: any): boolean => {
    return JSON.stringify(value) !== JSON.stringify(originalValue);
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col animate-in zoom-in-95 slide-in-from-bottom-4 duration-300">
        {/* Header */}
        <div className="px-8 py-6 border-b border-slate-200 flex items-center justify-between bg-gradient-to-r from-blue-50 to-purple-50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-blue-600 flex items-center justify-center text-white">
              <i className="fas fa-edit"></i>
            </div>
            <div>
              <h2 className="text-xl font-bold text-slate-900">Edit Tailored Resume</h2>
              <p className="text-sm text-slate-600">Review and refine your AI-optimized content</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg hover:bg-slate-200 transition-colors flex items-center justify-center text-slate-500 hover:text-slate-700"
          >
            <i className="fas fa-times"></i>
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-8 space-y-4">
          {/* Professional Summary Section */}
          <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-shadow">
            <button
              onClick={() => toggleSection('summary')}
              className="w-full px-6 py-4 flex items-center justify-between hover:bg-slate-50 transition-colors"
            >
              <div className="flex items-center gap-3">
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                  hasChanges('summary', editingData.additionalInfo, originalData.additionalInfo)
                    ? 'bg-emerald-100 text-emerald-600'
                    : 'bg-slate-100 text-slate-600'
                }`}>
                  <i className="fas fa-user text-sm"></i>
                </div>
                <div className="text-left">
                  <h3 className="font-bold text-slate-900">Professional Summary</h3>
                  {hasChanges('summary', editingData.additionalInfo, originalData.additionalInfo) && (
                    <span className="text-xs text-emerald-600 font-medium">Modified</span>
                  )}
                </div>
              </div>
              <i className={`fas fa-chevron-${expandedSections.has('summary') ? 'up' : 'down'} text-slate-400`}></i>
            </button>

            {expandedSections.has('summary') && (
              <div className="px-6 pb-6 pt-2 space-y-3">
                <label className={labelClass}>AI-Generated Summary</label>
                <textarea
                  className={`${inputClass} h-32 resize-none leading-relaxed`}
                  value={editingData.additionalInfo || ''}
                  onChange={(e) => updateSummary(e.target.value)}
                  placeholder="The AI-generated professional summary will appear here..."
                />
                <p className="text-xs text-slate-500">
                  This summary was generated by AI based on the job description and your profile.
                </p>
              </div>
            )}
          </div>

          {/* Skills Section */}
          <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-shadow">
            <button
              onClick={() => toggleSection('skills')}
              className="w-full px-6 py-4 flex items-center justify-between hover:bg-slate-50 transition-colors"
            >
              <div className="flex items-center gap-3">
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                  hasChanges('skills', editingData.skills, originalData.skills)
                    ? 'bg-emerald-100 text-emerald-600'
                    : 'bg-slate-100 text-slate-600'
                }`}>
                  <i className="fas fa-code text-sm"></i>
                </div>
                <div className="text-left">
                  <h3 className="font-bold text-slate-900">Technical Skills</h3>
                  {hasChanges('skills', editingData.skills, originalData.skills) && (
                    <span className="text-xs text-emerald-600 font-medium">Modified</span>
                  )}
                </div>
              </div>
              <i className={`fas fa-chevron-${expandedSections.has('skills') ? 'up' : 'down'} text-slate-400`}></i>
            </button>

            {expandedSections.has('skills') && (
              <div className="px-6 pb-6 pt-2 space-y-4">
                {Object.entries(editingData.skills || {}).map(([category, skills]) => {
                  // Skip if skills is not an array
                  if (!Array.isArray(skills)) return null;

                  return (
                    <div key={category} className="relative bg-slate-50 p-4 rounded-lg border border-slate-200">
                      <div className="flex items-center justify-between mb-2">
                        <input
                          type="text"
                          className="text-xs font-semibold text-slate-700 bg-white border border-slate-300 rounded px-2 py-1 hover:border-blue-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all"
                          defaultValue={category.charAt(0).toUpperCase() + category.slice(1).replace(/_/g, ' ')}
                          onBlur={(e) => {
                            const newCategory = e.target.value.trim().toLowerCase().replace(/\s+/g, '_');
                            if (newCategory && newCategory !== category) {
                              updateSkillCategory(category, newCategory, skills.join(', '));
                            }
                          }}
                          placeholder="Category name"
                        />
                        <button
                          onClick={() => removeSkillCategory(category)}
                          className="px-2 py-1 bg-red-50 text-red-600 rounded hover:bg-red-100 transition-colors text-xs font-medium"
                          title="Remove category"
                        >
                          <i className="fas fa-trash text-xs mr-1"></i>
                          Remove
                        </button>
                      </div>
                      <textarea
                        className={`${inputClass} h-20 resize-none`}
                        value={skills.join(', ')}
                        onChange={(e) => updateSkills(category, e.target.value)}
                        placeholder={`Enter ${category.replace(/_/g, ' ')} skills (comma-separated)...`}
                      />
                      <p className="text-xs text-slate-500 mt-2">
                        {skills.filter(s => s.trim()).length} skill{skills.filter(s => s.trim()).length !== 1 ? 's' : ''}
                      </p>
                    </div>
                  );
                })}

                <button
                  onClick={addSkillCategory}
                  className="w-full py-3 bg-gradient-to-r from-blue-50 to-indigo-50 border-2 border-blue-200 text-blue-600 rounded-lg hover:from-blue-100 hover:to-indigo-100 transition-all text-sm font-semibold flex items-center justify-center gap-2 hover:shadow-md"
                >
                  <i className="fas fa-plus"></i>
                  <span>Add New Skill Category</span>
                </button>
              </div>
            )}
          </div>

          {/* Experience Section */}
          {editingData.experience.map((exp, index) => (
            <div key={exp.id} className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-shadow">
              <button
                onClick={() => toggleSection(`experience-${exp.id}`)}
                className="w-full px-6 py-4 flex items-center justify-between hover:bg-slate-50 transition-colors"
              >
                <div className="flex items-center gap-3 flex-1">
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                    hasChanges(`experience-${exp.id}`, exp, originalData.experience[index])
                      ? 'bg-emerald-100 text-emerald-600'
                      : 'bg-slate-100 text-slate-600'
                  }`}>
                    <i className="fas fa-briefcase text-sm"></i>
                  </div>
                  <div className="text-left flex-1">
                    <h3 className="font-bold text-slate-900">{exp.role || 'Experience'}</h3>
                    <p className="text-xs text-slate-600">{exp.company}</p>
                    {hasChanges(`experience-${exp.id}`, exp, originalData.experience[index]) && (
                      <span className="text-xs text-emerald-600 font-medium">Modified</span>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      removeExperience(exp.id);
                    }}
                    className="px-3 py-1.5 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors text-xs font-medium"
                    title="Remove this experience"
                  >
                    <i className="fas fa-trash text-xs mr-1"></i>
                    Remove
                  </button>
                  <i className={`fas fa-chevron-${expandedSections.has(`experience-${exp.id}`) ? 'up' : 'down'} text-slate-400`}></i>
                </div>
              </button>

              {expandedSections.has(`experience-${exp.id}`) && (
                <div className="px-6 pb-6 pt-2 space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className={labelClass}>Company</label>
                      <input
                        className={inputClass}
                        value={exp.company}
                        onChange={(e) => updateExperience(exp.id, 'company', e.target.value)}
                      />
                    </div>
                    <div>
                      <label className={labelClass}>Role</label>
                      <input
                        className={inputClass}
                        value={exp.role}
                        onChange={(e) => updateExperience(exp.id, 'role', e.target.value)}
                      />
                    </div>
                  </div>

                  <div>
                    <label className={labelClass}>Bullet Points (one per line)</label>
                    <textarea
                      className={`${inputClass} h-48 resize-none leading-relaxed font-mono text-xs`}
                      value={exp.description.join('\n')}
                      onChange={(e) => updateExperience(exp.id, 'description', e.target.value.split('\n'))}
                      placeholder="• Achievement 1&#10;• Achievement 2&#10;• Achievement 3"
                    />
                    <p className="mt-2 text-xs text-slate-500">
                      {exp.description.filter(d => d.trim()).length} bullet points
                    </p>
                  </div>
                </div>
              )}
            </div>
          ))}

          {/* Projects Section */}
          {editingData.projects && editingData.projects.length > 0 && editingData.projects.map((proj, index) => (
            <div key={proj.id} className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-shadow">
              <button
                onClick={() => toggleSection(`project-${proj.id}`)}
                className="w-full px-6 py-4 flex items-center justify-between hover:bg-slate-50 transition-colors"
              >
                <div className="flex items-center gap-3 flex-1">
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                    hasChanges(`project-${proj.id}`, proj, originalData.projects?.[index])
                      ? 'bg-emerald-100 text-emerald-600'
                      : 'bg-slate-100 text-slate-600'
                  }`}>
                    <i className="fas fa-diagram-project text-sm"></i>
                  </div>
                  <div className="text-left flex-1">
                    <h3 className="font-bold text-slate-900">{proj.name || 'Project'}</h3>
                    {hasChanges(`project-${proj.id}`, proj, originalData.projects?.[index]) && (
                      <span className="text-xs text-emerald-600 font-medium">Modified</span>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      removeProject(proj.id);
                    }}
                    className="px-3 py-1.5 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors text-xs font-medium"
                    title="Remove this project"
                  >
                    <i className="fas fa-trash text-xs mr-1"></i>
                    Remove
                  </button>
                  <i className={`fas fa-chevron-${expandedSections.has(`project-${proj.id}`) ? 'up' : 'down'} text-slate-400`}></i>
                </div>
              </button>

              {expandedSections.has(`project-${proj.id}`) && (
                <div className="px-6 pb-6 pt-2 space-y-4">
                  <div>
                    <label className={labelClass}>Project Name</label>
                    <input
                      className={inputClass}
                      value={proj.name}
                      onChange={(e) => updateProject(proj.id, 'name', e.target.value)}
                    />
                  </div>

                  <div>
                    <label className={labelClass}>Description (one per line)</label>
                    <textarea
                      className={`${inputClass} h-32 resize-none leading-relaxed`}
                      value={proj.description.join('\n')}
                      onChange={(e) => updateProject(proj.id, 'description', e.target.value.split('\n'))}
                      placeholder="• Feature 1&#10;• Feature 2"
                    />
                  </div>
                </div>
              )}
            </div>
          ))}

          {/* Education Section */}
          {editingData.education && editingData.education.length > 0 && editingData.education.map((edu, index) => (
            <div key={edu.id} className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-shadow">
              <button
                onClick={() => toggleSection(`education-${edu.id}`)}
                className="w-full px-6 py-4 flex items-center justify-between hover:bg-slate-50 transition-colors"
              >
                <div className="flex items-center gap-3 flex-1">
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                    hasChanges(`education-${edu.id}`, edu, originalData.education?.[index])
                      ? 'bg-emerald-100 text-emerald-600'
                      : 'bg-slate-100 text-slate-600'
                  }`}>
                    <i className="fas fa-graduation-cap text-sm"></i>
                  </div>
                  <div className="text-left flex-1">
                    <h3 className="font-bold text-slate-900">{edu.degree || 'Education'}</h3>
                    <p className="text-xs text-slate-600">{edu.institution}</p>
                    {hasChanges(`education-${edu.id}`, edu, originalData.education?.[index]) && (
                      <span className="text-xs text-emerald-600 font-medium">Modified</span>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      removeEducation(edu.id);
                    }}
                    className="px-3 py-1.5 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors text-xs font-medium"
                    title="Remove this education"
                  >
                    <i className="fas fa-trash text-xs mr-1"></i>
                    Remove
                  </button>
                  <i className={`fas fa-chevron-${expandedSections.has(`education-${edu.id}`) ? 'up' : 'down'} text-slate-400`}></i>
                </div>
              </button>

              {expandedSections.has(`education-${edu.id}`) && (
                <div className="px-6 pb-6 pt-2 space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className={labelClass}>Institution</label>
                      <input
                        className={inputClass}
                        value={edu.institution}
                        onChange={(e) => updateEducation(edu.id, 'institution', e.target.value)}
                      />
                    </div>
                    <div>
                      <label className={labelClass}>Degree</label>
                      <input
                        className={inputClass}
                        value={edu.degree}
                        onChange={(e) => updateEducation(edu.id, 'degree', e.target.value)}
                      />
                    </div>
                  </div>
                </div>
              )}
            </div>
          ))}

          {/* Certifications Section */}
          {editingData.certifications && editingData.certifications.length > 0 && (
            <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-shadow">
              <button
                onClick={() => toggleSection('certifications')}
                className="w-full px-6 py-4 flex items-center justify-between hover:bg-slate-50 transition-colors"
              >
                <div className="flex items-center gap-3 flex-1">
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                    hasChanges('certifications', editingData.certifications, originalData.certifications)
                      ? 'bg-emerald-100 text-emerald-600'
                      : 'bg-slate-100 text-slate-600'
                  }`}>
                    <i className="fas fa-certificate text-sm"></i>
                  </div>
                  <div className="text-left flex-1">
                    <h3 className="font-bold text-slate-900">Certifications</h3>
                    <p className="text-xs text-slate-600">{editingData.certifications.length} certification{editingData.certifications.length !== 1 ? 's' : ''}</p>
                    {hasChanges('certifications', editingData.certifications, originalData.certifications) && (
                      <span className="text-xs text-emerald-600 font-medium">Modified</span>
                    )}
                  </div>
                </div>
                <i className={`fas fa-chevron-${expandedSections.has('certifications') ? 'up' : 'down'} text-slate-400`}></i>
              </button>

              {expandedSections.has('certifications') && (
                <div className="px-6 pb-6 pt-2 space-y-3">
                  <label className={labelClass}>Certifications (one per line)</label>
                  <textarea
                    className={`${inputClass} h-32 resize-none leading-relaxed`}
                    value={editingData.certifications.join('\n')}
                    onChange={(e) => updateCertifications(e.target.value)}
                    placeholder="AWS Certified Solutions Architect&#10;Google Cloud Professional&#10;PMP Certification"
                  />
                  <p className="text-xs text-slate-500">
                    {editingData.certifications.filter(c => c.trim()).length} certification{editingData.certifications.filter(c => c.trim()).length !== 1 ? 's' : ''}
                  </p>
                  <div className="flex flex-wrap gap-2 mt-3">
                    {editingData.certifications.map((cert, index) => (
                      <div key={index} className="flex items-center gap-2 bg-blue-50 text-blue-700 px-3 py-1.5 rounded-lg text-xs">
                        <i className="fas fa-certificate"></i>
                        <span>{cert}</span>
                        <button
                          onClick={() => removeCertification(index)}
                          className="ml-1 text-red-500 hover:text-red-700 transition-colors"
                          title="Remove certification"
                        >
                          <i className="fas fa-times text-xs"></i>
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="px-8 py-6 border-t border-slate-200 flex items-center justify-between bg-slate-50">
          <button
            onClick={handleDiscard}
            className="px-6 py-3 rounded-lg font-semibold text-sm text-slate-700 bg-white border-2 border-slate-200 hover:bg-slate-50 transition-all flex items-center gap-2"
          >
            <i className="fas fa-times"></i>
            <span>Cancel</span>
          </button>

          <div className="flex items-center gap-3">
            <div className="text-xs text-slate-600 bg-white px-4 py-2 rounded-lg border border-slate-200">
              <i className="fas fa-info-circle text-blue-500 mr-2"></i>
              Changes will update your resume preview
            </div>
            <button
              onClick={handleSave}
              className="px-8 py-3 rounded-lg font-semibold text-sm text-white bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 shadow-lg hover:shadow-xl transition-all flex items-center gap-2 active:scale-95"
            >
              <i className="fas fa-check"></i>
              <span>Save Changes</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TailoredResumeEditor;
