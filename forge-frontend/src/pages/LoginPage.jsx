// src/pages/LoginPage.jsx
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Eye, EyeOff, Zap, Loader2 } from 'lucide-react';
import { authService } from '../services/authService.js';
import { useAuthStore } from '../store/authStore.js';
import toast from 'react-hot-toast';

export default function LoginPage() {
  const navigate = useNavigate();
  const { setAuth, isAuthenticated } = useAuthStore();
  const [form, setForm] = useState({ email: '', password: '' });
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);

  // If already authenticated, redirect to dashboard
  if (isAuthenticated) {
    setTimeout(() => navigate('/dashboard', { replace: true }), 0);
    return null;
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { user, accessToken } = await authService.login(form.email, form.password);
      setAuth(user, accessToken);
      toast.success(`Welcome back, ${user.name || user.email}!`);
      // Use replace to prevent back button going to login
      navigate('/dashboard', { replace: true });
    } catch (err) {
      toast.error(err?.response?.data?.error || 'Login failed');
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
        <div>
          <blockquote className="text-[#9999b8] italic text-sm leading-relaxed mb-4">
            "I went from whiteboard sketch to a copy-paste-ready Prisma schema in under a minute. 
            This is the planning tool I've been waiting for."
          </blockquote>
          <p className="text-xs text-[#5f5f80]">— Senior engineer, SF startup</p>
        </div>
        <p className="text-[11px] text-[#5f5f80] font-mono">forge.dev · developer force multiplier</p>
      </div>

      {/* Right panel */}
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="w-full max-w-sm">
          <div className="mb-8">
            <h1 className="font-display font-700 text-2xl text-white mb-1">Welcome back</h1>
            <p className="text-sm text-[#9999b8]">
              Don't have an account?{' '}
              <Link to="/register" className="text-purple-light hover:underline">Sign up free</Link>
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
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
              <div className="flex justify-between items-center mb-2">
                <label className="label-base !mb-0">Password</label>
              </div>
              <div className="relative">
                <input
                  type={showPass ? 'text' : 'password'}
                  required
                  className="input-base pr-10"
                  placeholder="••••••••"
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
              {loading ? <Loader2 size={16} className="animate-spin" /> : 'Sign in'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
