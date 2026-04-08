// src/components/shared/ShareButton.jsx
import { useState } from 'react';
import { Share2, Link as LinkIcon, Check, Copy } from 'lucide-react';
import toast from 'react-hot-toast';

export default function ShareButton({ projectId, projectName }) {
  const [isOpen, setIsOpen] = useState(false);
  const [copied, setCopied] = useState(false);

  const shareUrl = `${window.location.origin}/project/${projectId}`;

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      toast.success('Link copied to clipboard');
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error('Copy failed');
    }
  };

  return (
    <div className="relative group">
      <button
        className="btn-ghost gap-2 text-xs"
        onMouseEnter={() => setIsOpen(true)}
        onMouseLeave={() => setIsOpen(false)}
      >
        <Share2 size={13} />
        Share
      </button>

      {isOpen && (
        <div
          className="absolute top-full right-0 mt-1 w-56 bg-bg-2 border border-white/[0.07] rounded-lg shadow-lg z-50 overflow-hidden"
          onMouseEnter={() => setIsOpen(true)}
          onMouseLeave={() => setIsOpen(false)}
        >
          <div className="px-4 py-3 border-b border-white/[0.07]">
            <p className="text-xs font-mono text-[#5f5f80] uppercase tracking-wider mb-2">
              Shareable link
            </p>
            <div className="flex items-center gap-1 bg-bg-3 border border-white/[0.07] rounded px-2 py-1.5">
              <LinkIcon size={12} className="text-[#5f5f80] flex-shrink-0" />
              <input
                type="text"
                value={shareUrl}
                readOnly
                className="flex-1 bg-transparent text-xs text-[#9999b8] outline-none truncate"
              />
              <button
                onClick={handleCopyLink}
                className="flex-shrink-0 p-0.5 hover:bg-white/5 rounded transition-colors"
              >
                {copied ? <Check size={12} className="text-teal" /> : <Copy size={12} className="text-[#5f5f80]" />}
              </button>
            </div>
          </div>

          <div className="px-4 py-3">
            <p className="text-xs text-[#5f5f80] mb-2">Share on:</p>
            <div className="flex gap-2">
              <a
                href={`https://twitter.com/intent/tweet?text=Check%20out%20${projectName}%20blueprint%20generated%20with%20Forge&url=${encodeURIComponent(shareUrl)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 px-3 py-1.5 text-xs bg-blue-900/20 border border-blue-500/30 rounded hover:bg-blue-900/40 text-blue-300 transition-colors text-center"
              >
                Twitter
              </a>
              <a
                href={`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(shareUrl)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 px-3 py-1.5 text-xs bg-blue-800/20 border border-blue-600/30 rounded hover:bg-blue-800/40 text-blue-300 transition-colors text-center"
              >
                LinkedIn
              </a>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
