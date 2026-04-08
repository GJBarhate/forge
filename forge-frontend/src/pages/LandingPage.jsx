// src/pages/LandingPage.jsx
import { Link } from 'react-router-dom';
import { Zap, Mic, Image, GitBranch, FileText, Database, LayoutGrid, ArrowRight } from 'lucide-react';

const features = [
  { icon: Mic, color: 'purple', label: 'Voice brain-dump', desc: 'Speak your idea — Web Speech API transcribes it live.' },
  { icon: Image, color: 'teal', label: 'Whiteboard vision', desc: 'Upload a sketch photo. Gemini reads your diagrams.' },
  { icon: FileText, color: 'coral', label: 'PRD generation', desc: 'Full Product Requirements Doc with features & acceptance criteria.' },
  { icon: Database, color: 'amber', label: 'Prisma schema', desc: 'Copy-paste-ready schema.prisma — run migrate and go.' },
  { icon: LayoutGrid, color: 'purple', label: 'Sprint board', desc: 'Three-sprint task board with hours and priority for every task.' },
  { icon: GitBranch, color: 'teal', label: 'Idea versioning', desc: 'Fork any blueprint like a Git branch and compare iterations.' },
];

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-bg text-[#e8e8f0]">
      {/* Nav */}
      <header className="flex items-center justify-between px-8 py-5 border-b border-white/[0.05]">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-purple/20 border border-purple/30 flex items-center justify-center">
            <Zap size={15} className="text-purple-light" />
          </div>
          <span className="font-display font-800 text-lg text-white">Forge</span>
        </div>
        <div className="flex items-center gap-3">
          <Link to="/login" className="btn-ghost text-sm">Sign in</Link>
          <Link to="/register" className="btn-primary text-sm">Get started free</Link>
        </div>
      </header>

      {/* Hero */}
      <section className="max-w-5xl mx-auto px-8 pt-24 pb-20 text-center">
        <div className="inline-flex items-center gap-2 bg-purple/10 border border-purple/25 rounded-full px-4 py-1.5 text-xs text-purple-light font-mono mb-8">
          <Zap size={11} /> Powered by Gemini 2.5 Pro · Web Speech API
        </div>

        <h1 className="font-display font-800 text-[64px] leading-[1.05] tracking-tight text-white mb-6">
          From idea to<br />
          <span className="text-purple-light">production blueprint</span><br />
          in 30 seconds.
        </h1>
        <p className="text-lg text-[#9999b8] max-w-xl mx-auto mb-10 leading-relaxed">
          Speak your idea, drop your whiteboard photo, paste a competitor URL.
          Forge generates a full PRD, Prisma schema, component tree, and sprint board — instantly.
        </p>

        <div className="flex items-center justify-center gap-4">
          <Link to="/register" className="btn-primary text-base px-7 py-3 gap-2.5">
            Start forging <ArrowRight size={16} />
          </Link>
          <Link to="/login" className="btn-secondary text-base px-7 py-3">
            Sign in
          </Link>
        </div>
      </section>

      {/* Features */}
      <section className="max-w-5xl mx-auto px-8 pb-24">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {features.map(({ icon: Icon, color, label, desc }) => (
            <div key={label} className="card-hover">
              <div className={`w-9 h-9 rounded-xl bg-${color}/15 border border-${color}/25 flex items-center justify-center mb-4`}>
                <Icon size={16} className={`text-${color}-light`} />
              </div>
              <p className="font-display font-600 text-sm text-[#e8e8f0] mb-1.5">{label}</p>
              <p className="text-xs text-[#9999b8] leading-relaxed">{desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="border-t border-white/[0.05] py-20 text-center">
        <h2 className="font-display font-700 text-3xl text-white mb-4">
          Stop planning. Start forging.
        </h2>
        <p className="text-[#9999b8] mb-8">Free to start. No credit card required.</p>
        <Link to="/register" className="btn-primary text-base px-8 py-3">
          Create your first blueprint →
        </Link>
      </section>
    </div>
  );
}
