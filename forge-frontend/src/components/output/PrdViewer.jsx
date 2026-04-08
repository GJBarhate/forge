// src/components/output/PrdViewer.jsx
import { FileText } from 'lucide-react';
import ExportButton from '../shared/ExportButton.jsx';

function PriorityBadge({ p }) {
  const styles = {
    P0: 'badge-coral', P1: 'badge-amber', P2: 'badge-teal',
  };
  return <span className={`${styles[p] || 'badge-teal'} text-[11px]`}>{p}</span>;
}

export default function PrdViewer({ prd }) {
  if (!prd) return null;

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 className="font-display font-700 text-2xl text-white">{prd.title}</h2>
          <p className="text-[#9999b8] italic mt-1">{prd.tagline}</p>
        </div>
        <ExportButton content={JSON.stringify(prd, null, 2)} filename="prd.json" label="PRD" />
      </div>

      {/* Problem */}
      <div className="card">
        <p className="text-xs font-mono text-[#5f5f80] uppercase tracking-wider mb-2">Problem</p>
        <p className="text-sm text-[#e8e8f0]">{prd.problem}</p>
      </div>

      {/* Users */}
      {prd.users?.length > 0 && (
        <div>
          <p className="text-xs font-mono text-[#5f5f80] uppercase tracking-wider mb-3">Target users</p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {prd.users.map((u, i) => (
              <div key={i} className="card border-l-2 border-l-purple/60">
                <p className="text-sm font-600 text-[#e8e8f0] mb-1">{u.persona}</p>
                <p className="text-xs text-[#9999b8]">{u.pain}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Features */}
      {prd.features?.length > 0 && (
        <div>
          <p className="text-xs font-mono text-[#5f5f80] uppercase tracking-wider mb-3">Features</p>
          <div className="space-y-3">
            {prd.features.map((f, i) => (
              <div key={i} className="card">
                <div className="flex items-center gap-2 mb-2">
                  <p className="text-sm font-600 text-[#e8e8f0]">{f.name}</p>
                  <PriorityBadge p={f.priority} />
                </div>
                <p className="text-xs text-[#9999b8] mb-3">{f.description}</p>
                {f.acceptance?.length > 0 && (
                  <ul className="space-y-1">
                    {f.acceptance.map((a, j) => (
                      <li key={j} className="text-xs text-[#5f5f80] flex items-start gap-2">
                        <span className="text-teal mt-0.5">✓</span>
                        {a}
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Positioning */}
      {prd.positioning && (
        <div className="bg-purple/5 border border-purple/20 rounded-xl p-4">
          <p className="text-xs font-mono text-[#5f5f80] uppercase tracking-wider mb-2">Positioning</p>
          <p className="text-sm text-[#e8e8f0] italic">"{prd.positioning}"</p>
        </div>
      )}
    </div>
  );
}
