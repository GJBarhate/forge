// src/components/input/CompetitorInput.jsx
import { useState } from 'react';
import { Globe, Loader2, CheckCircle, X } from 'lucide-react';
import { competitorService } from '../../services/forgeService.js';
import toast from 'react-hot-toast';

export default function CompetitorInput({ value, onChange, onAnalyzed }) {
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analyzed, setAnalyzed] = useState(null);

  const isValidUrl = (s) => {
    try { new URL(s); return true; } catch { return false; }
  };

  const handleAnalyze = async () => {
    if (!isValidUrl(value)) {
      toast.error('Please enter a valid URL');
      return;
    }
    setIsAnalyzing(true);
    try {
      const result = await competitorService.analyze(value);
      setAnalyzed(result);
      onAnalyzed?.(result);
      toast.success('Competitor analyzed');
    } catch (err) {
      toast.error(err?.response?.data?.error || 'Failed to analyze competitor');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const clear = () => {
    onChange('');
    setAnalyzed(null);
    onAnalyzed?.(null);
  };

  return (
    <div className="space-y-3">
      <div className="flex gap-2">
        <div className="relative flex-1">
          <Globe size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#5f5f80]" />
          <input
            type="url"
            className="input-base pl-9 pr-8"
            placeholder="https://competitor.com"
            value={value}
            onChange={(e) => onChange(e.target.value)}
          />
          {value && (
            <button type="button" onClick={clear} className="absolute right-3 top-1/2 -translate-y-1/2 text-[#5f5f80] hover:text-coral">
              <X size={13} />
            </button>
          )}
        </div>
        <button
          type="button"
          onClick={handleAnalyze}
          disabled={!value || isAnalyzing}
          className="btn-secondary text-xs px-4 flex-shrink-0"
        >
          {isAnalyzing ? <Loader2 size={13} className="animate-spin" /> : 'Analyze'}
        </button>
      </div>

      {analyzed && (
        <div className="bg-teal/5 border border-teal/20 rounded-xl p-4 space-y-3 animate-fade-up">
          <div className="flex items-center gap-2 text-xs text-teal font-mono font-500">
            <CheckCircle size={12} /> Competitor insights extracted
          </div>
          {analyzed.gaps?.length > 0 && (
            <div>
              <p className="text-[11px] text-[#5f5f80] uppercase tracking-wider mb-1.5">Gaps &amp; weaknesses</p>
              <div className="flex flex-wrap gap-1.5">
                {analyzed.gaps.slice(0, 4).map((gap, i) => (
                  <span key={i} className="badge-coral text-[11px] px-2 py-0.5">{gap}</span>
                ))}
              </div>
            </div>
          )}
          {analyzed.features?.length > 0 && (
            <div>
              <p className="text-[11px] text-[#5f5f80] uppercase tracking-wider mb-1.5">Key features</p>
              <div className="flex flex-wrap gap-1.5">
                {analyzed.features.slice(0, 4).map((f, i) => (
                  <span key={i} className="badge-teal text-[11px] px-2 py-0.5">{f}</span>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
