// src/pages/RegisterPage.jsx
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Eye, EyeOff, Zap, Loader2, CheckCircle } from 'lucide-react';
import { authService } from '../services/authService.js';
import { useAuthStore } from '../store/authStore.js';
import toast from 'react-hot-toast';

const perks = [
  'Voice-to-blueprint in 30 seconds',
  'Auto-generated Prisma schemas',
  'Git-like idea version history',
  'Sprint boards from your ideas',
];

export default function RegisterPage() {
  const navigate = useNavigate();
  const { setAuth, isAuthenticated } = useAuthStore();
  const [form, setForm] = useState({ name: '', email: '', password: '' });
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);

  // If already authenticated, redirect to dashboard
  if (isAuthenticated) {
    navigate('/dashboard', { replace: true });
    return null;
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (form.password.length < 8) {
      toast.error('Password must be at least 8 characters');
      return;
    }
    setLoading(true);
    try {
      const { user, accessToken } = await authService.register(form.name, form.email, form.password);
      setAuth(user, accessToken);
      toast.success('Account created! Welcome to Forge.');
      navigate('/dashboard', { replace: true });
    } catch (err) {
      toast.error(err?.response?.data?.error || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-bg flex">
      {/* Left panel */}
      <div className="hidden lg:flex flex-col justify-between w-96 bg-bg-2 border-r border-white/[0.07] p-10">
        <Link to="/" className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-purple/20 border border-purple/30 flex items-center justify-center">
            <Zap size={15} className="text-purple-light" />
          </div>
          <span className="font-display font-800 text-white">Forge</span>
        </Link>
        <div className="space-y-4">
          <p className="text-sm text-[#9999b8] font-display font-600">Everything you get, free:</p>
          <ul className="space-y-3">
            {perks.map((p) => (
              <li key={p} className="flex items-center gap-3 text-sm text-[#e8e8f0]">
                <CheckCircle size={15} className="text-teal flex-shrink-0" />
                {p}
              </li>
            ))}
          </ul>
        </div>
        <p className="text-[11px] text-[#5f5f80] font-mono">forge.dev · developer force multiplier</p>
      </div>

      {/* Right panel */}
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="w-full max-w-sm">
          <div className="mb-8">
            <h1 className="font-display font-700 text-2xl text-white mb-1">Create your account</h1>
            <p className="text-sm text-[#9999b8]">
              Already have one?{' '}
              <Link to="/login" className="text-purple-light hover:underline">Sign in</Link>
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="label-base">Name</label>
              <input
                type="text"
                className="input-base"
                placeholder="Your name"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
              />
            </div>

            <div>
              <label className="label-base">Email</label>
              <input
                type="email"
                required
                className="input-base"
                placeholder="you@example.com"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
              />
            </div>

            <div>
              <label className="label-base">Password</label>
              <div className="relative">
                <input
                  type={showPass ? 'text' : 'password'}
                  required
                  minLength={8}
                  className="input-base pr-10"
                  placeholder="Min 8 characters"
                  value={form.password}
                  onChange={(e) => setForm({ ...form, password: e.target.value })}
                />
                <button
                  type="button"
                  onClick={() => setShowPass(!showPass)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[#5f5f80] hover:text-[#9999b8]"
                >
                  {showPass ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>
            </div>

            <button type="submit" disabled={loading} className="btn-primary w-full justify-center py-3">
              {loading ? <Loader2 size={16} className="animate-spin" /> : 'Create account'}
            </button>

            <p className="text-[11px] text-[#5f5f80] text-center">
              By signing up you agree to our terms of service.
            </p>
          </form>
        </div>
      </div>
    </div>
  );
}
