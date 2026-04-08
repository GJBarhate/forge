// src/components/shared/ExportButton.jsx
import { useState } from 'react';
import { Copy, Download, Check } from 'lucide-react';
import toast from 'react-hot-toast';

export default function ExportButton({ content, filename = 'forge-export.txt', label = 'Export' }) {
  const [copied, setCopied] = useState(false);

  const text = typeof content === 'string' ? content : JSON.stringify(content, null, 2);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      toast.success('Copied to clipboard');
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error('Copy failed');
    }
  };

  const handleDownload = () => {
    const blob = new Blob([text], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
    toast.success(`Downloaded ${filename}`);
  };

  return (
    <div className="flex items-center gap-2">
      <button onClick={handleCopy} className="btn-ghost text-xs gap-1.5">
        {copied ? <Check size={13} className="text-teal" /> : <Copy size={13} />}
        {copied ? 'Copied!' : 'Copy'}
      </button>
      <button onClick={handleDownload} className="btn-ghost text-xs gap-1.5">
        <Download size={13} />
        {label}
      </button>
    </div>
  );
}
