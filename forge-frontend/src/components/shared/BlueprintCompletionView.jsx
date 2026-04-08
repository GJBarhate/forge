// BlueprintCompletionView.jsx
// Shows beautiful success/failure UI after generation completes
// Displays all artifacts: PRD, Schema, Components, Sprints, File structure
import { useState, useEffect } from 'react';
import { 
  CheckCircle2, 
  AlertTriangle, 
  Download, 
  FolderOpen, 
  Database, 
  Box, 
  Layers, 
  FileText,
  ChevronDown,
  ChevronRight,
  Copy,
  RotateCcw
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

// Confetti animation component (simple CSS-based)
function Confetti() {
  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden">
      {[...Array(30)].map((_, i) => (
        <div
          key={i}
          className="absolute animate-pulse"
          style={{
            left: Math.random() * 100 + '%',
            top: -10,
            width: '8px',
            height: '8px',
            backgroundColor: ['#7c3aed', '#06b6d4', '#ec4899', '#f59e0b'][Math.floor(Math.random() * 4)],
            borderRadius: '50%',
            animation: `fall ${2 + Math.random() * 3}s linear infinite`,
            opacity: 0.8,
          }}
        />
      ))}
      <style>{`
        @keyframes fall {
          to {
            transform: translateY(100vh) rotate(720deg);
            opacity: 0;
          }
        }
      `}</style>
    </div>
  );
}

// File tree node component
function FileTreeNode({ name, type, content, depth = 0 }) {
  const [expanded, setExpanded] = useState(depth < 2);
  const isFolder = type === 'folder' || content?.children;
  const children = content?.children || [];
  const hasChildren = children && children.length > 0;

  const getIcon = (nodeType, nodeName) => {
    if (nodeType === 'folder') return <FolderOpen size={14} className="text-amber" />;
    if (nodeName?.endsWith('.ts') || nodeName?.endsWith('.tsx')) return <FileText size={14} className="text-blue-400" />;
    if (nodeName?.endsWith('.sql')) return <Database size={14} className="text-cyan" />;
    if (nodeName?.endsWith('.json')) return <Box size={14} className="text-yellow-500" />;
    return <FileText size={14} className="text-gray-400" />;
  };

  return (
    <div className="select-none">
      <div
        className="flex items-center gap-1 px-2 py-1 hover:bg-white/5 rounded cursor-pointer group"
        onClick={() => hasChildren && setExpanded(!expanded)}
      >
        {hasChildren ? (
          expanded ? <ChevronDown size={14} /> : <ChevronRight size={14} />
        ) : (
          <div className="w-3" />
        )}
        {getIcon(type, name)}
        <span className="text-xs text-gray-300 font-mono flex-1">{name}</span>
        {!hasChildren && (
          <button
            className="opacity-0 group-hover:opacity-100 transition-opacity text-[10px] text-gray-500 hover:text-cyan"
            onClick={(e) => {
              e.stopPropagation();
              navigator.clipboard.writeText(name);
            }}
          >
            Copy
          </button>
        )}
      </div>
      {expanded && hasChildren && (
        <div className="ml-2 border-l border-white/10">
          {children.map((child, idx) => (
            <FileTreeNode
              key={idx}
              name={child.name || child}
              type={child.type || 'file'}
              content={child}
              depth={depth + 1}
            />
          ))}
        </div>
      )}
    </div>
  );
}

// Tab component
function Tabs({ tabs, activeTab, setActiveTab }) {
  return (
    <div className="border-b border-white/10">
      <div className="flex gap-1 overflow-x-auto">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-4 py-3 text-sm font-medium transition-all whitespace-nowrap ${
              activeTab === tab.id
                ? 'text-purple-light border-b-2 border-purple'
                : 'text-gray-400 hover:text-gray-300'
            }`}
          >
            <div className="flex items-center gap-2">
              {tab.icon && <tab.icon size={14} />}
              {tab.label}
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}

export default function BlueprintCompletionView({ data, isFailed, failureReason, projectName, onRetry, onNewIteration }) {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('overview');
  const [copied, setCopied] = useState('');

  if (isFailed) {
    return (
      <div className="fixed inset-0 bg-gradient-to-br from-bg-1 via-bg-2 to-bg-1 flex items-center justify-center z-50 p-4">
        <div className="max-w-2xl w-full">
          <div className="bg-gradient-to-br from-bg-2 to-bg-3 border border-coral/30 rounded-2xl p-8 text-center">
            <AlertTriangle className="w-16 h-16 text-coral mx-auto mb-4" />
            <h2 className="text-2xl font-display font-700 text-white mb-2">Generation Failed</h2>
            <p className="text-gray-400 mb-8">{failureReason || 'An unexpected error occurred during blueprint generation.'}</p>
            <div className="flex gap-3 justify-center">
              <button
                onClick={onRetry}
                className="px-6 py-2 rounded-lg bg-gradient-to-r from-purple to-teal text-white font-semibold hover:from-purple/80 hover:to-teal/80 transition-all flex items-center gap-2"
              >
                <RotateCcw size={16} />
                Retry Generation
              </button>
              <button
                onClick={() => navigate('/dashboard')}
                className="px-6 py-2 rounded-lg border border-white/20 text-white font-semibold hover:bg-white/5 transition-all"
              >
                Go to Dashboard
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!data) return null;

  const tabs = [
    { id: 'overview', label: 'Overview', icon: FileText },
    { id: 'structure', label: 'File Structure', icon: FolderOpen },
    { id: 'schema', label: 'Database', icon: Database },
    { id: 'components', label: 'Components', icon: Box },
    { id: 'sprints', label: 'Sprints', icon: Layers },
  ];

  const copyToClipboard = (text, id) => {
    navigator.clipboard.writeText(text);
    setCopied(id);
    setTimeout(() => setCopied(''), 2000);
  };

  return (
    <div className="fixed inset-0 bg-gradient-to-br from-bg-1 via-bg-2 to-bg-1 overflow-y-auto z-50 pb-20">
      <Confetti />

      {/* Header */}
      <div className="sticky top-0 z-10 bg-gradient-to-b from-bg-1 via-bg-1 to-transparent border-b border-white/10 backdrop-blur">
        <div className="max-w-6xl mx-auto px-6 py-8">
          <div className="flex items-start justify-between mb-4">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <CheckCircle2 className="w-8 h-8 text-teal animate-bounce" />
                <h1 className="text-4xl font-display font-700 text-white">Blueprint Ready! 🎉</h1>
              </div>
              <p className="text-gray-400">
                {projectName || 'Your project'} has been successfully generated with Gemini 2.5 Flash AI
              </p>
            </div>
            <button
              onClick={() => navigate('/dashboard')}
              className="text-gray-400 hover:text-white transition-colors"
            >
              ✕
            </button>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 flex-wrap">
            <button
              onClick={() => navigate(`/project/${data.projectId}`)}
              className="px-6 py-2 rounded-lg bg-gradient-to-r from-purple to-teal text-white font-semibold hover:from-purple/80 hover:to-teal/80 transition-all"
            >
              View Full Project
            </button>
            <button
              onClick={onNewIteration}
              className="px-6 py-2 rounded-lg border border-white/20 text-white font-semibold hover:bg-white/5 transition-all"
            >
              New Iteration
            </button>
            <button
              className="px-6 py-2 rounded-lg border border-white/20 text-white font-semibold hover:bg-white/5 transition-all flex items-center gap-2"
            >
              <Download size={16} />
              Export
            </button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-6xl mx-auto px-6 py-8">
        <div className="bg-gradient-to-br from-bg-2 to-bg-3 border border-white/10 rounded-2xl overflow-hidden">
          <Tabs tabs={tabs} activeTab={activeTab} setActiveTab={setActiveTab} />

          <div className="p-6">
            {/* Overview Tab */}
            {activeTab === 'overview' && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                    <FileText size={18} className="text-purple-light" />
                    Product Requirements Document
                  </h3>
                  <div className="bg-black/40 rounded-lg p-4 border border-white/10 max-h-96 overflow-y-auto">
                    <pre className="text-xs text-gray-300 whitespace-pre-wrap font-mono">
                      {data.artifacts?.prd?.substring(0, 1000)}...
                    </pre>
                  </div>
                  <button
                    onClick={() => copyToClipboard(data.artifacts?.prd || '', 'prd')}
                    className="mt-3 text-sm text-purple-light hover:text-purple transition-colors flex items-center gap-1"
                  >
                    <Copy size={14} />
                    {copied === 'prd' ? 'Copied!' : 'Copy PRD'}
                  </button>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-black/40 rounded-lg p-4 border border-white/10">
                    <p className="text-sm text-gray-400 mb-2">Tech Stack</p>
                    <p className="text-white font-semibold">React + Node.js + PostgreSQL</p>
                  </div>
                  <div className="bg-black/40 rounded-lg p-4 border border-white/10">
                    <p className="text-sm text-gray-400 mb-2">Estimated Timeline</p>
                    <p className="text-white font-semibold">8-12 weeks</p>
                  </div>
                </div>
              </div>
            )}

            {/* File Structure Tab */}
            {activeTab === 'structure' && (
              <div>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                    <FolderOpen size={18} className="text-amber" />
                    Project Structure
                  </h3>
                </div>
                <div className="bg-black/40 rounded-lg p-4 border border-white/10 font-mono text-sm">
                  {data.artifacts?.componentTree ? (
                    typeof data.artifacts.componentTree === 'string' ? (
                      <pre className="text-xs text-gray-300 whitespace-pre-wrap">
                        {data.artifacts.componentTree.substring(0, 3000)}
                      </pre>
                    ) : (
                      <FileTreeNode
                        name="project-root"
                        type="folder"
                        content={data.artifacts.componentTree}
                      />
                    )
                  ) : (
                    <p className="text-gray-400">File structure not available</p>
                  )}
                </div>
              </div>
            )}

            {/* Database Schema Tab */}
            {activeTab === 'schema' && (
              <div>
                <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                  <Database size={18} className="text-cyan" />
                  Database Schema
                </h3>
                <div className="bg-black/40 rounded-lg p-4 border border-white/10 max-h-96 overflow-y-auto">
                  <pre className="text-xs text-gray-300 whitespace-pre-wrap font-mono">
                    {data.artifacts?.prismaSchema?.substring(0, 2000)}...
                  </pre>
                </div>
                <button
                  onClick={() => copyToClipboard(data.artifacts?.prismaSchema || '', 'schema')}
                  className="mt-3 text-sm text-cyan hover:text-cyan/80 transition-colors flex items-center gap-1"
                >
                  <Copy size={14} />
                  {copied === 'schema' ? 'Copied!' : 'Copy Schema'}
                </button>
              </div>
            )}

            {/* Components Tab */}
            {activeTab === 'components' && (
              <div>
                <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                  <Box size={18} className="text-blue-400" />
                  Component Tree
                </h3>
                <div className="bg-black/40 rounded-lg p-4 border border-white/10 max-h-96 overflow-y-auto">
                  {data.artifacts?.componentTree ? (
                    <pre className="text-xs text-gray-300 whitespace-pre-wrap font-mono">
                      {typeof data.artifacts.componentTree === 'string' 
                        ? data.artifacts.componentTree.substring(0, 2000) 
                        : JSON.stringify(data.artifacts.componentTree, null, 2)?.substring(0, 2000)}
                    </pre>
                  ) : (
                    <p className="text-gray-400">Component tree not available</p>
                  )}
                </div>
              </div>
            )}

            {/* Sprints Tab */}
            {activeTab === 'sprints' && (
              <div>
                <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                  <Layers size={18} className="text-emerald-400" />
                  Sprint Board
                </h3>
                <div className="bg-black/40 rounded-lg p-4 border border-white/10 max-h-96 overflow-y-auto">
                  <pre className="text-xs text-gray-300 whitespace-pre-wrap font-mono">
                    {data.artifacts?.taskBoard?.substring(0, 2000)}...
                  </pre>
                </div>
                <button
                  onClick={() => copyToClipboard(data.artifacts?.taskBoard || '', 'board')}
                  className="mt-3 text-sm text-emerald-400 hover:text-emerald-300 transition-colors flex items-center gap-1"
                >
                  <Copy size={14} />
                  {copied === 'board' ? 'Copied!' : 'Copy Board'}
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
