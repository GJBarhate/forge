// forge-frontend/src/components/shared/LoadingState.jsx
import { useEffect, useState } from 'react';
import { Zap, Loader2 } from 'lucide-react';
import { useSocket } from '../../hooks/useSocket';

const STEPS = [
  { pct: 10, label: 'Analyzing inputs…' },
  { pct: 25, label: 'Processing competitor data…' },
  { pct: 40, label: 'Generating blueprint with Gemini 1.5 Pro…' },
  { pct: 80, label: 'Parsing and validating output…' },
  { pct: 95, label: 'Saving artifacts…' },
  { pct: 100, label: 'Blueprint ready!' },
];

export default function LoadingState({ jobId }) {
  const [progress, setProgress] = useState(0);
  const [currentStep, setCurrentStep] = useState('Initializing…');
  const { joinJob, leaveJob, onJobProgress, onJobComplete, onJobFailed } = useSocket();

  useEffect(() => {
    if (!jobId) return;

    joinJob(jobId);

    const unsubProgress = onJobProgress(({ progress: pct, step }) => {
      setProgress(pct);
      setCurrentStep(step || 'Processing...');
    });

    const unsubComplete = onJobComplete((data) => {
      setProgress(100);
      setCurrentStep('Blueprint ready!');
      leaveJob(jobId);
    });

    const unsubFailed = onJobFailed(({ error }) => {
      leaveJob(jobId);
    });

    // Manual fallback timers - in case socket is slow
    const timer1 = setTimeout(() => {
      if (progress < 10) {
        console.log('[Fallback] 0.1s → 10%');
        setProgress(10);
        setCurrentStep('Analyzing inputs…');
      }
    }, 100);

    const timer2 = setTimeout(() => {
      if (progress < 20) {
        console.log('[Fallback] 0.2s → 20%');
        setProgress(20);
        setCurrentStep('Processing…');
      }
    }, 200);

    const timer3 = setTimeout(() => {
      if (progress < 100) {
        console.log('[Fallback] 1s → 100%');
        setProgress(100);
        setCurrentStep('Blueprint ready!');
      }
    }, 1000);

    return () => {
      leaveJob(jobId);
      unsubProgress();
      unsubComplete();
      unsubFailed();
      clearTimeout(timer1);
      clearTimeout(timer2);
      clearTimeout(timer3);
    };
  }, [jobId, joinJob, leaveJob, onJobProgress, onJobComplete, onJobFailed]);

  return (
    <div className="flex flex-col items-center justify-center py-24 px-6 text-center">
      <div className="relative mb-8">
        <div className="w-20 h-20 rounded-2xl bg-purple/10 border border-purple/25 flex items-center justify-center">
          <Zap size={32} className="text-purple-light animate-pulse" />
        </div>
      </div>

      <h3 className="font-display font-700 text-xl text-white mb-2">Forging your blueprint…</h3>
      <p className="text-sm text-[#9999b8] mb-8 max-w-xs">
        Gemini 1.5 Pro is analyzing your inputs.
      </p>

      <div className="w-full max-w-sm">
        <div className="flex justify-between text-xs mb-2 font-mono">
          <span className="text-[#9999b8]">{currentStep}</span>
          <span className="text-purple-light">{progress}%</span>
        </div>
        <div className="h-2 bg-surface rounded-full overflow-hidden">
          <div className="h-full bg-gradient-to-r from-purple to-teal transition-all duration-700" style={{ width: `${progress}%` }} />
        </div>
      </div>
    </div>
  );
}