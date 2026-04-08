// src/components/shared/EnhancedLoadingState.jsx
import { useEffect, useState } from 'react';
import { Sparkles, Zap, Database, Code2, FileText, LayoutGrid, CheckCircle2, AlertTriangle, RotateCcw } from 'lucide-react';

const PHASES = [
  { id: 1, label: 'Initializing', icon: Zap, delay: 0 },
  { id: 2, label: 'Analyzing', icon: Sparkles, delay: 0.2 },
  { id: 3, label: 'Designing', icon: Database, delay: 0.4 },
  { id: 4, label: 'Building', icon: Code2, delay: 0.6 },
  { id: 5, label: 'Documenting', icon: FileText, delay: 0.8 },
  { id: 6, label: 'Completing', icon: LayoutGrid, delay: 1.0 },
];

export default function EnhancedLoadingState({ 
  status = 'PROCESSING', 
  progress = 45, 
  currentPhase = 'Analyzing Requirements',
  projectName = 'Project',
  onRetry = null,
}) {
  const [displayProgress, setDisplayProgress] = useState(0);

  useEffect(() => {
    setDisplayProgress(progress);
  }, [progress]);

  const isFailed = status === 'FAILED';
  const isComplete = status === 'COMPLETE';

  // Failed state
  if (isFailed) {
    return (
      <div className="fixed inset-0 bg-gradient-to-br from-bg-1 via-bg-2 to-bg-1 flex items-center justify-center z-50">
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-coral/10 rounded-full blur-3xl opacity-50" />
          <div className="absolute bottom-1/3 right-1/3 w-80 h-80 bg-amber/5 rounded-full blur-3xl opacity-50" />
        </div>

        <div className="relative max-w-2xl w-full mx-4 text-center">
          <div className="mb-8 relative">
            <div className="w-32 h-32 mx-auto relative">
              <div className="absolute inset-0 rounded-full bg-gradient-to-r from-coral to-amber opacity-20 blur-2xl animate-pulse" />
              <div className="absolute inset-0 rounded-full border-2 border-coral/30 flex items-center justify-center">
                <AlertTriangle className="w-16 h-16 text-coral animate-bounce" />
              </div>
            </div>
          </div>

          <h1 className="text-4xl font-display font-700 text-white mb-3">Generation Failed</h1>
          <p className="text-lg text-[#9999b8] mb-2">Something went wrong while generating your blueprint</p>
          <p className="text-sm text-[#5f5f80] mb-12">Please check your inputs and try again, or contact support if the problem persists.</p>

          {onRetry && (
            <button
              onClick={onRetry}
              className="inline-flex items-center gap-3 px-8 py-4 rounded-lg bg-gradient-to-r from-coral to-amber hover:from-coral/80 hover:to-amber/80 text-white font-semibold transition-all transform hover:scale-105"
            >
              <RotateCcw size={20} />
              <span>Try Again</span>
            </button>
          )}

          <div className="mt-8 pt-8 border-t border-white/10">
            <p className="text-xs text-[#5f5f80]">Error: Blueprint generation interrupted</p>
          </div>
        </div>
      </div>
    );
  }

  // Success state
  if (isComplete) {
    return (
      <div className="fixed inset-0 bg-gradient-to-br from-bg-1 via-bg-2 to-bg-1 flex items-center justify-center z-50">
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-teal/15 rounded-full blur-3xl opacity-60" />
          <div className="absolute bottom-1/3 right-1/3 w-96 h-96 bg-cyan/10 rounded-full blur-3xl opacity-60" />
        </div>

        <div className="relative max-w-2xl w-full mx-4 text-center">
          <div className="mb-8 relative">
            <div className="w-32 h-32 mx-auto relative">
              <div className="absolute inset-0 rounded-full bg-gradient-to-r from-teal to-cyan opacity-30 blur-2xl animate-pulse" />
              <div className="absolute inset-0 rounded-full border-2 border-teal/50 flex items-center justify-center">
                <CheckCircle2 className="w-16 h-16 text-teal animate-bounce" style={{ animationDelay: '0s' }} />
              </div>
            </div>
          </div>

          <h1 className="text-4xl font-display font-700 text-white mb-3">Blueprint Ready! 🚀</h1>
          <p className="text-lg text-[#9999b8] mb-2">Your comprehensive development blueprint has been generated</p>
          <p className="text-sm text-[#5f5f80] mb-8">for <span className="text-teal font-semibold">{projectName}</span></p>

          <div className="flex justify-center items-center gap-2 mb-12">
            <div className="w-3 h-3 rounded-full bg-teal animate-pulse" />
            <div className="w-3 h-3 rounded-full bg-teal animate-pulse" style={{ animationDelay: '0.2s' }} />
            <div className="w-3 h-3 rounded-full bg-teal animate-pulse" style={{ animationDelay: '0.4s' }} />
          </div>

          <p className="text-xs text-[#5f5f80]">Redirecting to your project...</p>
        </div>
      </div>
    );
  }

  // Processing state
  return (
    <div className="fixed inset-0 bg-gradient-to-br from-bg-1 via-bg-2 to-bg-1 flex items-center justify-center z-50">
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-1/3 left-1/4 w-96 h-96 bg-purple/10 rounded-full blur-3xl opacity-50" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-teal/8 rounded-full blur-3xl opacity-50" />
        <div className="absolute top-1/4 right-1/3 w-72 h-72 bg-cyan/5 rounded-full blur-3xl opacity-40" />
      </div>

      <div className="relative w-full max-w-2xl mx-4">
        {/* Header */}
        <div className="text-center mb-16">
          <h1 className="text-4xl font-display font-700 text-white mb-2">Forging Your Blueprint</h1>
          <p className="text-lg text-[#9999b8]">Generating AI-powered development architecture</p>
        </div>

        {/* Main content */}
        <div className="space-y-8">
          {/* Large animated icon */}
          <div className="flex justify-center mb-12">
            <div className="relative w-40 h-40">
              <div className="absolute inset-0 rounded-full bg-gradient-to-r from-purple via-teal to-cyan opacity-20 blur-2xl animate-pulse" />
              <div className="absolute inset-0 rounded-full border-2 border-purple/40 flex items-center justify-center bg-gradient-to-br from-purple/10 to-teal/5">
                <Sparkles className="w-20 h-20 text-purple-light animate-pulse" />
              </div>
            </div>
          </div>

          {/* Progress bar */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-mono text-[#5f5f80] uppercase tracking-wider">Progress</span>
              <span className="text-sm font-mono font-bold bg-gradient-to-r from-purple to-teal bg-clip-text text-transparent">
                {displayProgress}%
              </span>
            </div>
            <div className="h-2 bg-white/5 rounded-full overflow-hidden border border-white/10">
              <div
                className="h-full bg-gradient-to-r from-purple via-teal to-purple transition-all duration-500"
                style={{ width: `${displayProgress}%` }}
              />
            </div>
          </div>

          {/* Current phase */}
          <div className="p-5 rounded-xl bg-gradient-to-r from-purple/5 via-transparent to-teal/5 border border-purple/20">
            <p className="text-xs text-[#5f5f80] uppercase tracking-wider font-mono mb-2">Current Phase</p>
            <p className="text-lg font-semibold text-white">{currentPhase}</p>
          </div>

          {/* Phase indicators */}
          <div className="space-y-3 max-h-48 overflow-y-auto custom-scrollbar">
            {PHASES.map((phase, idx) => {
              const Icon = phase.icon;
              const isActive = idx < Math.floor(displayProgress / 15);
              const isCurrent = Math.floor(displayProgress / 15) === idx;

              return (
                <div
                  key={phase.id}
                  className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${
                    isCurrent
                      ? 'bg-purple/15 border border-purple/40 scale-105'
                      : isActive
                      ? 'bg-teal/10 border border-teal/30'
                      : 'bg-white/2 border border-white/5'
                  }`}
                  style={{ animation: isCurrent ? 'pulse 2s infinite' : 'none' }}
                >
                  <Icon className={`w-5 h-5 ${isCurrent ? 'text-purple-light animate-spin' : isActive ? 'text-teal' : 'text-[#5f5f80]'}`} />
                  <span className={`text-sm font-medium ${isCurrent ? 'text-white' : isActive ? 'text-teal' : 'text-[#9999b8]'}`}>
                    {phase.label}
                  </span>
                  {isActive && !isCurrent && <CheckCircle2 className="w-4 h-4 text-teal ml-auto" />}
                </div>
              );
            })}
          </div>

          {/* Tips */}
          <div className="pt-4 border-t border-white/10 space-y-2">
            <p className="text-xs text-[#5f5f80] text-center">
              💡 Tip: This usually takes 25-45 seconds. Don't close this window.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
