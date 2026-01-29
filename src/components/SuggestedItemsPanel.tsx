import React from 'react';

interface Props {
  suggestedExperience?: string[];
  suggestedProjects?: string[];
}

const SuggestedItemsPanel: React.FC<Props> = ({ suggestedExperience = [], suggestedProjects = [] }) => {
  const hasSuggestions = suggestedExperience.length > 0 || suggestedProjects.length > 0;

  return (
    <div className="h-full bg-slate-50 overflow-y-auto p-8">
      <div className="max-w-2xl mx-auto">
        <div className="mb-8">
          <h2 className="text-xl font-bold text-slate-800 mb-2">Relevant Profile Items</h2>
          <p className="text-sm text-slate-600">
            AI-suggested experience and projects that match this freelance job
          </p>
        </div>

        {!hasSuggestions && (
          <div className="bg-white rounded-xl border border-slate-200 p-12 text-center">
            <div className="w-16 h-16 rounded-full bg-slate-100 mx-auto mb-4 flex items-center justify-center">
              <i className="fas fa-wand-magic-sparkles text-2xl text-slate-400"></i>
            </div>
            <h3 className="text-lg font-semibold text-slate-700 mb-2">Generate a proposal first</h3>
            <p className="text-sm text-slate-500">
              Once you generate a proposal, the AI will suggest relevant experience and projects from your profile
            </p>
          </div>
        )}

        {suggestedExperience.length > 0 && (
          <div className="bg-white rounded-xl border border-slate-200 p-6 mb-6 shadow-sm">
            <div className="flex items-center gap-3 mb-4 pb-4 border-b border-slate-100">
              <div className="w-10 h-10 rounded-lg bg-blue-600 flex items-center justify-center text-white">
                <i className="fas fa-briefcase text-sm"></i>
              </div>
              <div>
                <h3 className="text-lg font-bold text-slate-800">Relevant Experience</h3>
                <p className="text-xs text-slate-500">Most matching work history</p>
              </div>
            </div>
            <div className="space-y-3">
              {suggestedExperience.map((exp, idx) => (
                <div
                  key={idx}
                  className="flex items-start gap-3 p-3 bg-blue-50 rounded-lg border border-blue-100"
                >
                  <div className="flex-shrink-0 w-6 h-6 rounded-full bg-blue-600 text-white flex items-center justify-center text-xs font-bold">
                    {idx + 1}
                  </div>
                  <div className="flex-1">
                    <p className="text-sm text-slate-800 font-medium">{exp}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {suggestedProjects.length > 0 && (
          <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
            <div className="flex items-center gap-3 mb-4 pb-4 border-b border-slate-100">
              <div className="w-10 h-10 rounded-lg bg-indigo-600 flex items-center justify-center text-white">
                <i className="fas fa-diagram-project text-sm"></i>
              </div>
              <div>
                <h3 className="text-lg font-bold text-slate-800">Relevant Projects</h3>
                <p className="text-xs text-slate-500">Most matching portfolio items</p>
              </div>
            </div>
            <div className="space-y-3">
              {suggestedProjects.map((proj, idx) => (
                <div
                  key={idx}
                  className="flex items-start gap-3 p-3 bg-indigo-50 rounded-lg border border-indigo-100"
                >
                  <div className="flex-shrink-0 w-6 h-6 rounded-full bg-indigo-600 text-white flex items-center justify-center text-xs font-bold">
                    {idx + 1}
                  </div>
                  <div className="flex-1">
                    <p className="text-sm text-slate-800 font-medium">{proj}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {hasSuggestions && (
          <div className="mt-6 bg-emerald-50 border border-emerald-200 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <i className="fas fa-lightbulb text-emerald-600 mt-0.5"></i>
              <div>
                <p className="text-sm text-emerald-900 font-semibold">Pro Tip</p>
                <p className="text-xs text-emerald-700 mt-1">
                  These items were automatically selected by AI based on how well they match the job requirements.
                  The AI has already incorporated them into your proposal.
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default SuggestedItemsPanel;
