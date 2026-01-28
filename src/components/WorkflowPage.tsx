import React, { useState, useCallback } from 'react';
import ReactFlow, {
  Node,
  Edge,
  Controls,
  Background,
  BackgroundVariant,
  useNodesState,
  useEdgesState,
  NodeProps,
  Handle,
  Position,
} from 'reactflow';
import 'reactflow/dist/style.css';

// Custom node component with editable prompt
const PromptNode: React.FC<NodeProps> = ({ data, id }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [prompt, setPrompt] = useState(data.prompt);

  const handleSave = () => {
    setIsEditing(false);
    if (data.onPromptChange) {
      data.onPromptChange(id, prompt);
    }
  };

  return (
    <div className="bg-white border-2 border-slate-300 rounded-xl shadow-lg p-4 min-w-[320px] max-w-[400px]">
      <Handle type="target" position={Position.Top} className="!bg-blue-500 !w-3 !h-3" />

      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-3">
          <div className={`w-10 h-10 rounded-lg flex items-center justify-center text-white ${data.color || 'bg-blue-600'}`}>
            <i className={`fas ${data.icon} text-sm`}></i>
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-800">{data.label}</h3>
            <p className="text-xs text-slate-500">{data.description}</p>
          </div>
        </div>
        <button
          onClick={() => setIsEditing(!isEditing)}
          className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
          title="Edit prompt"
        >
          <i className={`fas ${isEditing ? 'fa-times' : 'fa-pen'} text-xs`}></i>
        </button>
      </div>

      {isEditing ? (
        <div className="space-y-2">
          <textarea
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            className="w-full h-32 p-3 text-xs border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-400 focus:outline-none resize-none font-mono"
            placeholder="Enter prompt..."
          />
          <div className="flex gap-2">
            <button
              onClick={handleSave}
              className="flex-1 px-3 py-2 bg-blue-600 text-white text-xs font-semibold rounded-lg hover:bg-blue-700 transition-colors"
            >
              <i className="fas fa-check mr-1"></i>
              Save
            </button>
            <button
              onClick={() => {
                setPrompt(data.prompt);
                setIsEditing(false);
              }}
              className="flex-1 px-3 py-2 bg-slate-100 text-slate-600 text-xs font-semibold rounded-lg hover:bg-slate-200 transition-colors"
            >
              <i className="fas fa-undo mr-1"></i>
              Reset
            </button>
          </div>
        </div>
      ) : (
        <div className="mt-3 p-3 bg-slate-50 rounded-lg border border-slate-200">
          <p className="text-xs text-slate-600 font-mono line-clamp-3">{prompt}</p>
          <p className="text-[10px] text-slate-400 mt-2">Click the edit icon to customize</p>
        </div>
      )}

      <Handle type="source" position={Position.Bottom} className="!bg-blue-500 !w-3 !h-3" />
    </div>
  );
};

const nodeTypes = {
  promptNode: PromptNode,
};

interface Props {}

const WorkflowPage: React.FC<Props> = () => {
  const handlePromptChange = useCallback((nodeId: string, newPrompt: string) => {
    console.log(`Prompt updated for ${nodeId}:`, newPrompt);
    // TODO: Save to backend or localStorage
  }, []);

  const initialNodes: Node[] = [
    {
      id: 'start',
      type: 'input',
      data: { label: 'Start: User Profile & Job Description' },
      position: { x: 250, y: 0 },
      className: 'bg-gradient-to-r from-emerald-500 to-emerald-600 text-white font-bold rounded-lg px-4 py-3 shadow-lg border-0',
    },
    {
      id: 'summary',
      type: 'promptNode',
      data: {
        label: 'Professional Summary',
        description: 'Parallel Step 1',
        icon: 'fa-align-left',
        color: 'bg-violet-600',
        prompt: 'Create a compelling 2-3 sentence professional summary. Highlight the most relevant skills and experiences for THIS specific job. Use keywords from the job description naturally.',
        onPromptChange: handlePromptChange,
      },
      position: { x: 50, y: 120 },
    },
    {
      id: 'experience',
      type: 'promptNode',
      data: {
        label: 'Work Experience',
        description: 'Parallel Step 2',
        icon: 'fa-briefcase',
        color: 'bg-blue-600',
        prompt: 'SELECT and prioritize the 4-6 most relevant bullet points per role. Rewrite bullets to emphasize achievements that align with the job description. Use strong action verbs and quantify results.',
        onPromptChange: handlePromptChange,
      },
      position: { x: 250, y: 120 },
    },
    {
      id: 'skills',
      type: 'promptNode',
      data: {
        label: 'Skills',
        description: 'Parallel Step 3',
        icon: 'fa-code',
        color: 'bg-cyan-600',
        prompt: 'SELECT only the most relevant skills (5-8 per category) from the original list that match the job requirements. Remove skills that are NOT mentioned or relevant to the job description.',
        onPromptChange: handlePromptChange,
      },
      position: { x: 450, y: 120 },
    },
    {
      id: 'projects',
      type: 'promptNode',
      data: {
        label: 'Projects',
        description: 'Parallel Step 4',
        icon: 'fa-diagram-project',
        color: 'bg-indigo-600',
        prompt: 'Rewrite project descriptions to emphasize relevant technologies and achievements. Incorporate keywords from the job description naturally while maintaining authenticity.',
        onPromptChange: handlePromptChange,
      },
      position: { x: 650, y: 120 },
    },
    {
      id: 'education',
      type: 'promptNode',
      data: {
        label: 'Education',
        description: 'Parallel Step 5',
        icon: 'fa-graduation-cap',
        color: 'bg-purple-600',
        prompt: 'Review education section for relevance. Typically no modifications needed unless specific coursework or honors align with job requirements.',
        onPromptChange: handlePromptChange,
      },
      position: { x: 850, y: 120 },
    },
    {
      id: 'assembly',
      type: 'default',
      data: { label: '📋 Assemble Complete Resume' },
      position: { x: 250, y: 400 },
      className: 'bg-gradient-to-r from-blue-500 to-blue-600 text-white font-bold rounded-lg px-6 py-4 shadow-lg border-0',
    },
    {
      id: 'ats-score',
      type: 'promptNode',
      data: {
        label: 'ATS Scoring',
        description: 'Final Analysis',
        icon: 'fa-bullseye',
        color: 'bg-rose-600',
        prompt: 'Analyze the COMPLETE assembled resume against the job description. Evaluate keyword matching, skills alignment, experience relevance, and format compatibility. Provide a score from 0-100 and specific feedback.',
        onPromptChange: handlePromptChange,
      },
      position: { x: 250, y: 640 },
    },
    {
      id: 'cover-letter',
      type: 'promptNode',
      data: {
        label: 'Cover Letter',
        description: 'Optional',
        icon: 'fa-file-lines',
        color: 'bg-amber-600',
        prompt: 'Create a complete, professional cover letter (300 words max) including greeting, 3-4 body paragraphs, closing, and candidate name. Keep it concise and tailored to the job.',
        onPromptChange: handlePromptChange,
      },
      position: { x: 250, y: 900 },
    },
    {
      id: 'end',
      type: 'output',
      data: { label: 'Optimized Resume & Cover Letter' },
      position: { x: 250, y: 1160 },
      className: 'bg-gradient-to-r from-emerald-500 to-emerald-600 text-white font-bold rounded-lg px-4 py-3 shadow-lg border-0',
    },
  ];

  const initialEdges: Edge[] = [
    // Start to all parallel nodes
    { id: 'e-start-summary', source: 'start', target: 'summary', animated: true, style: { stroke: '#8b5cf6' } },
    { id: 'e-start-experience', source: 'start', target: 'experience', animated: true, style: { stroke: '#3b82f6' } },
    { id: 'e-start-skills', source: 'start', target: 'skills', animated: true, style: { stroke: '#06b6d4' } },
    { id: 'e-start-projects', source: 'start', target: 'projects', animated: true, style: { stroke: '#6366f1' } },
    { id: 'e-start-education', source: 'start', target: 'education', animated: true, style: { stroke: '#a855f7' } },

    // All parallel nodes to assembly
    { id: 'e-summary-assembly', source: 'summary', target: 'assembly', animated: true, style: { stroke: '#3b82f6' } },
    { id: 'e-experience-assembly', source: 'experience', target: 'assembly', animated: true, style: { stroke: '#3b82f6' } },
    { id: 'e-skills-assembly', source: 'skills', target: 'assembly', animated: true, style: { stroke: '#3b82f6' } },
    { id: 'e-projects-assembly', source: 'projects', target: 'assembly', animated: true, style: { stroke: '#3b82f6' } },
    { id: 'e-education-assembly', source: 'education', target: 'assembly', animated: true, style: { stroke: '#3b82f6' } },

    // Assembly to ATS scoring
    { id: 'e-assembly-ats', source: 'assembly', target: 'ats-score', animated: true, style: { stroke: '#f43f5e', strokeWidth: 3 } },

    // ATS to cover letter
    { id: 'e-ats-cover', source: 'ats-score', target: 'cover-letter', animated: true, style: { stroke: '#f59e0b' } },

    // Cover letter to end
    { id: 'e-cover-end', source: 'cover-letter', target: 'end', animated: true, style: { stroke: '#10b981' } },
  ];

  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-6 duration-700">
      <div className="bg-white p-8 rounded-2xl shadow-lg border border-slate-100">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold text-slate-800">AI Workflow Designer</h2>
            <p className="text-sm text-slate-500 mt-1">
              Visualize and customize how AI optimizes your resume for each job
            </p>
          </div>
          <button className="px-4 py-2 bg-blue-600 text-white text-sm font-semibold rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2">
            <i className="fas fa-save"></i>
            Save Workflow
          </button>
        </div>

        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
          <div className="flex items-start gap-3">
            <i className="fas fa-info-circle text-blue-600 mt-0.5"></i>
            <div>
              <p className="text-sm text-blue-900 font-semibold">How it works</p>
              <p className="text-xs text-blue-700 mt-1">
                Each node represents an AI operation in the resume tailoring process. Click the edit icon on any node to customize the prompt that guides the AI. Changes are saved automatically.
              </p>
            </div>
          </div>
        </div>

        <div className="h-[800px] bg-slate-50 border-2 border-slate-200 rounded-xl overflow-hidden">
          <ReactFlow
            nodes={nodes}
            edges={edges}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            nodeTypes={nodeTypes}
            fitView
            className="bg-slate-50"
          >
            <Background variant={BackgroundVariant.Dots} gap={16} size={1} color="#cbd5e1" />
            <Controls className="!bg-white !border-slate-300 !rounded-lg !shadow-lg" />
          </ReactFlow>
        </div>

        <div className="mt-6 grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-slate-50 p-4 rounded-lg border border-slate-200">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-violet-600 flex items-center justify-center text-white">
                <i className="fas fa-bolt text-xs"></i>
              </div>
              <div>
                <p className="text-xs text-slate-500">Total Nodes</p>
                <p className="text-lg font-bold text-slate-800">{nodes.length}</p>
              </div>
            </div>
          </div>
          <div className="bg-slate-50 p-4 rounded-lg border border-slate-200">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center text-white">
                <i className="fas fa-arrows-split-up-and-left text-xs"></i>
              </div>
              <div>
                <p className="text-xs text-slate-500">Connections</p>
                <p className="text-lg font-bold text-slate-800">{edges.length}</p>
              </div>
            </div>
          </div>
          <div className="bg-slate-50 p-4 rounded-lg border border-slate-200">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-emerald-600 flex items-center justify-center text-white">
                <i className="fas fa-sync text-xs"></i>
              </div>
              <div>
                <p className="text-xs text-slate-500">Parallel Steps</p>
                <p className="text-lg font-bold text-slate-800">5</p>
              </div>
            </div>
          </div>
          <div className="bg-slate-50 p-4 rounded-lg border border-slate-200">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-amber-600 flex items-center justify-center text-white">
                <i className="fas fa-gauge-high text-xs"></i>
              </div>
              <div>
                <p className="text-xs text-slate-500">Avg. Time</p>
                <p className="text-lg font-bold text-slate-800">~15s</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WorkflowPage;
