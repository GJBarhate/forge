// src/components/shared/ExportDropdown.jsx
import { useState } from 'react';
import { Download, Copy, FileJson, Check } from 'lucide-react';
import toast from 'react-hot-toast';

export default function ExportDropdown({ 
  prd, 
  schema, 
  components, 
  sprints, 
  projectName = "Untitled Project" 
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [copied, setCopied] = useState(false);

  const safeProjectName = String(projectName || 'Untitled Project').trim();

  const combineAllContent = () => {
    const sections = [];
    if (prd) sections.push(`# PRD\n\n${prd}`);
    if (schema) sections.push(`# Schema\n\n${schema}`);
    if (components) sections.push(`# Components\n\n${components}`);
    if (sprints) sections.push(`# Sprints\n\n${sprints}`);
    return sections.join('\n\n---\n\n');
  };

  const combineAllJson = () => {
    return JSON.stringify({
      projectName: safeProjectName,
      generatedAt: new Date().toISOString(),
      prd,
      schema,
      components,
      sprints,
    }, null, 2);
  };

  const handleDownloadJSON = () => {
    const content = combineAllJson();
    const blob = new Blob([content], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${safeProjectName.replace(/[^a-zA-Z0-9]/g, '_')}.json`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success('JSON downloaded');
    setIsOpen(false);
  };

  const handleCopyAll = async () => {
    try {
      await navigator.clipboard.writeText(combineAllContent());
      setCopied(true);
      toast.success('All content copied!');
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error('Copy failed');
    }
  };

  return (
    <div className="relative group">
      <button
        className="btn-ghost gap-2 text-xs relative"
        onMouseEnter={() => setIsOpen(true)}
        onMouseLeave={() => setIsOpen(false)}
      >
        <Download size={13} />
        Export
      </button>

      {isOpen && (
        <div
          className="absolute top-full right-0 mt-1 w-52 bg-bg-2 border border-white/[0.07] rounded-lg shadow-lg z-50 overflow-hidden"
          onMouseEnter={() => setIsOpen(true)}
          onMouseLeave={() => setIsOpen(false)}
        >
          <button
            onClick={handleDownloadJSON}
            className="w-full flex items-center gap-2 px-4 py-2.5 text-sm text-[#9999b8] hover:bg-purple/10 hover:text-white transition-colors"
          >
            <FileJson size={14} />
            Download JSON
          </button>
          <div className="border-t border-white/[0.07]" />
          <button
            onClick={handleCopyAll}
            className="w-full flex items-center gap-2 px-4 py-2.5 text-sm text-[#9999b8] hover:bg-teal/10 hover:text-white transition-colors"
          >
            {copied ? <Check size={14} className="text-teal" /> : <Copy size={14} />}
            {copied ? 'Copied All!' : 'Copy All'}
          </button>
        </div>
      )}
    </div>
  );
}