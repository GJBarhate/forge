// BlueprintCelebration.jsx - Beautiful celebration page for completed blueprints
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Trophy, Sparkles, Zap, ArrowRight, RotateCcw } from 'lucide-react';

// Confetti animation component
function Confetti() {
  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden z-40">
      {[...Array(60)].map((_, i) => (
        <div
          key={i}
          className="absolute animate-pulse"
          style={{
            left: Math.random() * 100 + '%',
            top: -10,
            width: '12px',
            height: '12px',
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

export default function BlueprintCelebration({ projectName, projectId, onViewProject }) {
  const navigate = useNavigate();
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    // Auto-confetti animation timing
    const timer = setTimeout(() => {}, 5000);
    return () => clearTimeout(timer);
  }, []);

  const handleViewProject = () => {
    setIsVisible(false);
    if (onViewProject) {
      onViewProject();
    } else {
      navigate(`/project/${projectId}`);
    }
  };

  const handleRefresh = () => {
    window.location.reload();
  };

  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 z-50 bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-1/3 left-1/4 w-96 h-96 bg-purple-500/20 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '0.5s' }} />
        <div className="absolute top-1/4 right-1/3 w-72 h-72 bg-emerald-500/15 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
      </div>

      {/* Confetti */}
      <Confetti />

      {/* Main celebration content */}
      <div className="relative z-10 flex flex-col items-center justify-center text-center max-w-2xl mx-4">
        {/* Trophy with animation */}
        <div className="mb-8 relative">
          <div className="absolute inset-0 w-24 h-24 mx-auto bg-gradient-to-r from-yellow-400/30 to-yellow-300/20 rounded-full blur-2xl animate-pulse" />
          <div className="relative flex items-center justify-center">
            <Trophy className="w-24 h-24 text-yellow-400 animate-bounce" style={{ animationDuration: '1s' }} />
            <Sparkles className="w-12 h-12 text-yellow-300 absolute -top-3 -right-3 animate-spin" style={{ animationDuration: '2s' }} />
          </div>
        </div>

        {/* Main heading */}
        <h1 className="text-6xl font-display font-black text-white mb-3 animate-pulse">
          🎉 Blueprint Ready! 🎉
        </h1>

        {/* Subtitle */}
        <p className="text-xl text-emerald-300 font-semibold mb-2">
          Your AI-powered development architecture is complete!
        </p>

        <p className="text-lg text-gray-300 mb-8 max-w-xl">
          <span className="text-purple-300 font-bold">{projectName}</span> has been successfully generated with Gemini 2.5 Flash AI
        </p>

        {/* Stats grid */}
        <div className="grid grid-cols-3 gap-4 mb-12 w-full max-w-md">
          <div className="bg-black/40 rounded-xl p-4 border border-purple-500/30 backdrop-blur-sm hover:border-purple-500/60 transition-all transform hover:scale-105">
            <div className="text-3xl font-bold text-purple-300 mb-1">100%</div>
            <div className="text-xs text-gray-400">Complete</div>
          </div>

          <div className="bg-black/40 rounded-xl p-4 border border-cyan-500/30 backdrop-blur-sm hover:border-cyan-500/60 transition-all transform hover:scale-105">
            <div className="text-3xl font-bold text-cyan-300 mb-1">✓</div>
            <div className="text-xs text-gray-400">Verified</div>
          </div>

          <div className="bg-black/40 rounded-xl p-4 border border-emerald-500/30 backdrop-blur-sm hover:border-emerald-500/60 transition-all transform hover:scale-105">
            <div className="text-3xl font-bold text-emerald-300 mb-1">🚀</div>
            <div className="text-xs text-gray-400">Ready to Use</div>
          </div>
        </div>

        {/* What you got */}
        <div className="bg-gradient-to-r from-purple-500/10 to-cyan-500/10 border border-purple-500/20 rounded-xl p-6 mb-12 w-full max-w-md backdrop-blur-sm">
          <p className="text-sm text-gray-300 mb-4 font-semibold">✨ Your blueprint includes:</p>
          <div className="space-y-2 text-sm text-gray-400">
            <div className="flex items-center gap-2">
              <div className="w-1.5 h-1.5 rounded-full bg-purple-400" />
              <span>Product Requirements Document (PRD)</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-1.5 h-1.5 rounded-full bg-cyan-400" />
              <span>Database Schema (Prisma)</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
              <span>Component Architecture</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-1.5 h-1.5 rounded-full bg-yellow-400" />
              <span>Sprint Planning & Tasks</span>
            </div>
          </div>
        </div>

        {/* Action buttons */}
        <div className="flex flex-col sm:flex-row gap-4 w-full max-w-md">
          {/* View Project button */}
          <button
            onClick={handleViewProject}
            className="flex-1 group relative overflow-hidden rounded-lg px-6 py-4 font-bold text-white transition-all transform hover:scale-105 active:scale-95"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-emerald-500 to-cyan-500 group-hover:from-emerald-600 group-hover:to-cyan-600 transition-all" />
            <div className="relative flex items-center justify-center gap-2">
              <Zap size={20} />
              <span>View Your Blueprint</span>
              <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
            </div>
          </button>

          {/* Refresh button */}
          <button
            onClick={handleRefresh}
            className="flex items-center justify-center gap-2 px-6 py-4 rounded-lg bg-white/10 hover:bg-white/20 border border-white/20 hover:border-white/40 text-white font-bold transition-all transform hover:scale-105 active:scale-95 backdrop-blur-sm"
          >
            <RotateCcw size={18} />
            <span>Refresh</span>
          </button>
        </div>

        {/* Decorative elements */}
        <div className="mt-12 flex items-center justify-center gap-2">
          <div className="w-2 h-2 rounded-full bg-purple-400 animate-pulse" />
          <div className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" style={{ animationDelay: '0.2s' }} />
          <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" style={{ animationDelay: '0.4s' }} />
        </div>

        <p className="mt-6 text-xs text-gray-500">
          ✨ Generation completed successfully • Ready for development ✨
        </p>
      </div>
    </div>
  );
}
