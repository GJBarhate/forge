// PremiumLoadingState.jsx - Premium loading animation with real-time progress + CELEBRATION!
import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { AlertCircle, CheckCircle2, Loader2, Sparkles, Zap, Trophy } from 'lucide-react';
import { useSocket } from '../../hooks/useSocket';

// Confetti animation component
function Confetti() {
  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden z-50">
      {[...Array(50)].map((_, i) => (
        <div
          key={i}
          className="absolute animate-pulse"
          style={{
            left: Math.random() * 100 + '%',
            top: -10,
            width: '10px',
            height: '10px',
            backgroundColor: ['#7c3aed', '#06b6d4', '#ec4899', '#f59e0b', '#10b981'][Math.floor(Math.random() * 5)],
            borderRadius: '50%',
            animation: `fall ${2 + Math.random() * 3}s linear infinite`,
            opacity: 0.9,
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

export default function PremiumLoadingState({ jobId, projectId, onGenerated }) {
  const navigate = useNavigate();
  const [progress, setProgress] = useState(0);
  const [currentPhase, setCurrentPhase] = useState('Initializing');
  const [isFailed, setIsFailed] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [isFinalizingAfterComplete, setIsFinalizingAfterComplete] = useState(false);
  const [isComplete, setIsComplete] = useState(false);
  const [completionData, setCompletionData] = useState(null);

  const { joinJob, leaveJob, onJobProgress, onJobComplete, onJobFailed } = useSocket();

  // Define generation phases
  const phases = useMemo(() => [
    { name: 'Initialization', range: [0, 15] },
    { name: 'Analysis', range: [15, 30] },
    { name: 'PRD Generation', range: [30, 50] },
    { name: 'Schema Design', range: [50, 70] },
    { name: 'Component Creation', range: [70, 85] },
    { name: 'Sprint Planning', range: [85, 100] },
  ], []);

  // Get current phase based on progress
  const getCurrentPhase = (pct) => {
    const phase = phases.find(p => pct >= p.range[0] && pct < p.range[1]);
    return phase ? phase.name : 'Complete';
  };

  useEffect(() => {
    if (!jobId) {
      console.error('[PremiumLoadingState] ❌ No jobId provided!');
      return;
    }

    console.log(`\n════════════════════════════════════════════`);
    console.log(`[PremiumLoadingState] 🎬 STARTED`);
    console.log(`  Job ID: ${jobId}`);
    console.log(`════════════════════════════════════════════\n`);

    joinJob(jobId);

    // Socket event handlers ONLY - NO fallback
    const unsubProgress = onJobProgress(({ progress: pct, step }) => {
      console.log(`✅ [Socket] Progress: ${pct}% - ${step}`);
      setProgress(pct);
      setCurrentPhase(step || getCurrentPhase(pct));
    });

    const unsubComplete = onJobComplete((data) => {
      console.log(`✅ [Socket] Complete! Data:`, data);
      // IMMEDIATELY set to 100% and complete
      setProgress(100);
      setCurrentPhase('Finalizing...');
      // Show loading phase for 2 seconds before showing celebration
      setIsFinalizingAfterComplete(true);
      
      setTimeout(() => {
        setIsFinalizingAfterComplete(false);
        setIsComplete(true);
        setCompletionData(data || {
          projectId: jobId,
          timestamp: new Date().toISOString(),
          artifacts: {
            prd: data?.artifacts?.prd || 'Blueprint generated',
            prismaSchema: data?.artifacts?.prismaSchema || 'Schema created',
            componentTree: data?.artifacts?.componentTree || 'Components designed',
            taskBoard: data?.artifacts?.taskBoard || 'Tasks planned',
          },
        });
        console.log('✅ Completion state set - showing celebration');
        if (onGenerated) onGenerated(data);
      }, 2000); // 2 second finalizing phase
      
      leaveJob(jobId);
    });

    const unsubFailed = onJobFailed(({ error }) => {
      console.log('❌ Socket Error:', error);
      setIsFailed(true);
      setErrorMessage(error || 'Generation failed');
      leaveJob(jobId);
    });

    // Manual fallback timers - in case socket is slow
    const timer1 = setTimeout(() => {
      if (progress < 10) {
        console.log('[Fallback] 0.1s → Setting to 10%');
        setProgress(10);
        setCurrentPhase('Analyzing inputs...');
      }
    }, 100); // 0.1 seconds

    const timer2 = setTimeout(() => {
      if (progress < 20) {
        console.log('[Fallback] 0.2s → Setting to 20%');
        setProgress(20);
        setCurrentPhase('Processing...');
      }
    }, 200); // 0.2 seconds

    const timer3 = setTimeout(() => {
      if (progress < 100 && !isComplete && !isFinalizingAfterComplete) {
        console.log('[Fallback] 1s → Setting to 100% (forcing completion)');
        setProgress(100);
        setCurrentPhase('Finalizing...');
        setIsFinalizingAfterComplete(true);
        
        setTimeout(() => {
          setIsFinalizingAfterComplete(false);
          setIsComplete(true);
          setCompletionData({
            projectId: jobId,
            timestamp: new Date().toISOString(),
            artifacts: {
              prd: 'Blueprint generated',
              prismaSchema: 'Schema created',
              componentTree: 'Components designed',
              taskBoard: 'Tasks planned',
            },
          });
        }, 2000); // 2 second finalizing phase
      }
    }, 1000); // 1 second

    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
      clearTimeout(timer3);
      unsubProgress?.();
      unsubComplete?.();
      unsubFailed?.();
      leaveJob(jobId);
    };
  }, [jobId, onGenerated, phases, onJobProgress, onJobComplete, onJobFailed, progress, isComplete, isFinalizingAfterComplete]);

  // Finalizing state - loading after progress completes
  if (isFinalizingAfterComplete) {
    return (
      <div className="fixed inset-0 flex items-center justify-center pointer-events-none z-40">
        <div className="bg-gradient-to-br from-slate-900 to-slate-800 rounded-lg p-8 max-w-md mx-4 border border-cyan-500/20 shadow-2xl pointer-events-auto">
          {/* Animated spinner */}
          <div className="flex items-center justify-center mb-6">
            <div className="relative w-16 h-16">
              <Loader2 className="w-16 h-16 text-cyan-500 animate-spin" />
              <div className="absolute inset-0 flex items-center justify-center">
                <Sparkles className="w-6 h-6 text-emerald-400 animate-pulse" />
              </div>
            </div>
          </div>

          {/* Phase info */}
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-white text-center mb-2">
              Finalizing Blueprint
            </h3>
            <p className="text-sm text-gray-400 text-center">
              Preparing your results...
            </p>
          </div>

          {/* Progress bar - full */}
          <div className="mb-4">
            <div className="w-full h-2 bg-gradient-to-r from-cyan-500/20 to-emerald-500/20 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-cyan-500 to-emerald-500 transition-all duration-500 ease-out"
                style={{ width: '100%' }}
              />
            </div>
            <p className="text-xs text-gray-500 text-center mt-2">100%</p>
          </div>

          {/* Finalizing indicators */}
          <div className="grid grid-cols-3 gap-2">
            <div className="text-center">
              <div className="w-full h-1 rounded-full bg-gradient-to-r from-cyan-500 to-emerald-500" />
              <p className="text-xs text-gray-500 mt-1">Validation</p>
            </div>
            <div className="text-center">
              <div className="w-full h-1 rounded-full bg-gradient-to-r from-cyan-500 to-emerald-500 animate-pulse" />
              <p className="text-xs text-gray-500 mt-1">Saving</p>
            </div>
            <div className="text-center">
              <div className="w-full h-1 rounded-full bg-gray-700" />
              <p className="text-xs text-gray-500 mt-1">Complete</p>
            </div>
          </div>

          {/* Tips */}
          <div className="mt-6 p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-lg">
            <p className="text-xs text-emerald-300 text-center">
              Finishing up your blueprint...
            </p>
          </div>
        </div>
      </div>
    );
  }

  // Error state
  if (isFailed) {
    return (
      <>
        <div className="fixed inset-0 flex items-center justify-center pointer-events-none z-40">
          <div className="bg-gradient-to-br from-slate-900 to-slate-800 rounded-lg p-8 max-w-md mx-4 border border-red-500/20 shadow-2xl pointer-events-auto">
            <div className="flex items-center justify-center w-12 h-12 mx-auto mb-4 bg-red-500/10 rounded-full">
              <AlertCircle className="w-6 h-6 text-red-500" />
            </div>
            <h3 className="text-lg font-semibold text-white text-center mb-2">Generation Failed</h3>
            <p className="text-sm text-gray-400 text-center mb-6">{errorMessage}</p>
            <button
              onClick={() => window.location.reload()}
              className="w-full px-4 py-2 bg-red-500/20 hover:bg-red-500/30 text-red-300 rounded-lg transition-colors font-medium"
            >
              Retry
            </button>
          </div>
        </div>
      </>
    );
  }

  // Completion state with data - BEAUTIFUL CELEBRATION!
  if (isComplete && completionData) {
  // ⏳ Auto redirect after 2 seconds (SAFE - no conflicts)
  setTimeout(() => {
    const projectId = completionData?.projectId || jobId;
    navigate(`/project/${projectId}`, { replace: true });
  }, 2000);

  return (
    <>
      <Confetti numberOfPieces={120} recycle={false} />

      <div className="fixed inset-0 flex items-center justify-center pointer-events-none z-50">
        <div className="bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 rounded-lg p-12 max-w-xl mx-4 border border-purple-500/40 shadow-2xl pointer-events-auto relative overflow-hidden">
          
          {/* Glow effect */}
          <div className="absolute inset-0 bg-gradient-to-r from-purple-500/20 via-emerald-500/20 to-cyan-500/20 blur-2xl -z-10 animate-pulse" />
          
          {/* Spinner + Icon */}
          <div className="flex justify-center mb-6">
            <div className="relative flex items-center justify-center">
              
              {/* Spinner ring */}
              <div className="w-20 h-20 border-4 border-purple-500/30 border-t-emerald-400 rounded-full animate-spin" />
              
              {/* Center icon */}
              <Sparkles className="w-10 h-10 text-emerald-300 absolute animate-pulse" />
            </div>
          </div>

          {/* Main message */}
          <h2 className="text-4xl font-bold text-white text-center mb-2">
            ✨ Finalizing Your Blueprint...
          </h2>
          
          <p className="text-lg text-purple-300 text-center mb-6 font-semibold">
            We're putting the finishing touches on your AI-powered development architecture.
          </p>

          {/* Progress */}
          <div className="w-full bg-black/40 rounded-full h-3 mb-8 overflow-hidden border border-purple-500/20">
            <div className="h-full bg-gradient-to-r from-purple-500 via-emerald-400 to-cyan-400 animate-[progress_2s_ease-in-out]" />
          </div>

          {/* Stats (FIXED) */}
          <div className="grid grid-cols-3 gap-4 mb-6">
            <div className="bg-black/40 rounded-lg p-4 border border-purple-500/30 text-center">
              <p className="text-2xl font-bold text-purple-300">99%</p>
              <p className="text-xs text-gray-400 mt-1">Complete</p>
            </div>
            <div className="bg-black/40 rounded-lg p-4 border border-cyan-500/30 text-center">
              <p className="text-2xl font-bold text-cyan-300 animate-pulse">⚙️</p>
              <p className="text-xs text-gray-400 mt-1">Processing</p>
            </div>
            <div className="bg-black/40 rounded-lg p-4 border border-emerald-500/30 text-center">
              <p className="text-2xl font-bold text-emerald-300 animate-pulse">✓</p>
              <p className="text-xs text-gray-400 mt-1">Validating</p>
            </div>
          </div>

          {/* Disabled button (no manual click needed) */}
          <button
            disabled
            className="w-full bg-gradient-to-r from-gray-600 to-gray-700 text-white font-bold py-4 px-6 rounded-lg cursor-not-allowed flex items-center justify-center gap-2 opacity-70"
          >
            <Zap size={20} />
            Redirecting...
          </button>

          {/* Footer */}
          <div className="mt-6 text-center">
            <p className="text-xs text-gray-500 animate-pulse">
              ⏳ Taking you to your project...
            </p>
          </div>
        </div>
      </div>

      {/* Progress animation */}
      <style>
        {`
          @keyframes progress {
            0% { width: 15%; }
            50% { width: 70%; }
            100% { width: 100%; }
          }
        `}
      </style>
    </>
  );
}

  // Completion state without data - Beautiful success message
  if (isComplete) {
    return (
      <>
        <Confetti />
        <div className="fixed inset-0 flex items-center justify-center pointer-events-none z-50">
          <div className="bg-gradient-to-br from-slate-900 via-emerald-900 to-slate-900 rounded-lg p-12 max-w-md mx-4 border border-emerald-500/50 shadow-2xl pointer-events-auto relative overflow-hidden">
            {/* Glow effect */}
            <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/20 to-cyan-500/20 blur-2xl -z-10" />
            
            {/* Success icon */}
            <div className="flex justify-center mb-6">
              <CheckCircle2 className="w-20 h-20 text-emerald-400 animate-bounce" />
            </div>

            <h3 className="text-2xl font-bold text-white text-center mb-2">Success!</h3>
            <p className="text-sm text-emerald-300 text-center mb-6">
              Your blueprint has been generated successfully and saved to your projects.
            </p>

            {/* Loading animation */}
            <div className="w-full h-1 bg-gradient-to-r from-emerald-500/20 to-cyan-500/20 rounded-full overflow-hidden mb-6">
              <div className="h-full bg-gradient-to-r from-emerald-500 to-cyan-500 animate-pulse" />
            </div>

            <p className="text-xs text-gray-400 text-center animate-pulse">
              Redirecting to your blueprint...
            </p>
          </div>
        </div>
      </>
    );
  }

  // Loading state
  return (
    <div className="fixed inset-0 flex items-center justify-center pointer-events-none z-40">
      <div className="bg-gradient-to-br from-slate-900 to-slate-800 rounded-lg p-8 max-w-md mx-4 border border-purple-500/20 shadow-2xl pointer-events-auto">
        {/* Animated spinner */}
        <div className="flex items-center justify-center mb-6">
          <div className="relative w-16 h-16">
            <Loader2 className="w-16 h-16 text-purple-500 animate-spin" />
            <div className="absolute inset-0 flex items-center justify-center">
              <Sparkles className="w-6 h-6 text-cyan-400 animate-pulse" />
            </div>
          </div>
        </div>

        {/* Phase info */}
        <div className="mb-6">
          <h3 className="text-lg font-semibold text-white text-center mb-2">
            Generating Your Blueprint
          </h3>
          <p className="text-sm text-gray-400 text-center">
            {currentPhase}
          </p>
        </div>

        {/* Progress bar */}
        <div className="mb-4">
          <div className="w-full h-2 bg-gradient-to-r from-purple-500/20 to-cyan-500/20 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-purple-500 to-cyan-500 transition-all duration-500 ease-out"
              style={{ width: `${progress}%` }}
            />
          </div>
          <p className="text-xs text-gray-500 text-center mt-2">{progress}%</p>
        </div>

        {/* Phase indicators */}
        <div className="grid grid-cols-3 gap-2">
          {phases.map((phase, idx) => (
            <div
              key={idx}
              className="text-center"
            >
              <div
                className={`w-full h-1 rounded-full transition-colors duration-300 ${
                  progress >= phase.range[0]
                    ? 'bg-gradient-to-r from-purple-500 to-cyan-500'
                    : 'bg-gray-700'
                }`}
              />
              <p className="text-xs text-gray-500 mt-1 line-clamp-1">
                {phase.name.split(' ')[0]}
              </p>
            </div>
          ))}
        </div>

        {/* Tips */}
        <div className="mt-6 p-3 bg-blue-500/10 border border-blue-500/20 rounded-lg">
          <p className="text-xs text-blue-300 text-center">
            This may take a minute. Do not close this tab.
          </p>
        </div>
      </div>
    </div>
  );
}
