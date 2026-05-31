import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../api/axios.js'
import useStore from '../store/useStore.js'

export default function LoginPage() {
  const [email, setEmail] = useState('admin@neuralproxy.dev')
  const [password, setPassword] = useState('admin123')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const setToken = useStore((s) => s.setToken)
  const setUser = useStore((s) => s.setUser)
  const navigate = useNavigate()

  const handleLogin = async (e) => {
    e.preventDefault()
    setError(null)
    setLoading(true)

    try {
      const res = await api.post('/auth/login', { email, password })
      const { token, ...user } = res.data
      setToken(token)
      setUser(user)
      navigate('/')
    } catch (err) {
      setError(err.response?.data?.message || 'Invalid email or password')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4"
      style={{ background: 'linear-gradient(135deg, #f0efff 0%, #F8F7F4 50%, #f0faf6 100%)' }}>
      <div className="w-full max-w-md animate-fade-in">
        {/* Card */}
        <div className="bg-white dark:bg-[#1A1A18] rounded-2xl shadow-lg border border-[#E5E4DF] dark:border-[#2C2C2A] p-8">
          {/* Logo */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-purple-50 dark:bg-purple-950/30 mb-4">
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
                <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" fill="#7F77DD" />
              </svg>
            </div>
            <h1 className="text-2xl font-bold text-brand-purple">NeuralProxy</h1>
            <p className="text-sm text-[#6B6A65] dark:text-[#9A9890] mt-1">
              Multi-tenant AI Gateway
            </p>
          </div>

          {/* Error */}
          {error && (
            <div className="mb-4 px-4 py-3 rounded-xl border-l-4 border-brand-coral bg-red-50 dark:bg-red-950/20 animate-fade-in">
              <p className="text-sm text-brand-coral font-medium">{error}</p>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-[#1A1A18] dark:text-[#E8E6DF] mb-1.5">
                Email
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full px-4 py-2.5 rounded-xl border border-[#E5E4DF] dark:border-[#2C2C2A] bg-[#F8F7F4] dark:bg-[#0F0F0D] text-[#1A1A18] dark:text-[#E8E6DF] text-sm focus:outline-none focus:ring-2 focus:ring-brand-purple focus:border-transparent transition-all duration-200 placeholder:text-[#6B6A65]"
                placeholder="you@example.com"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-[#1A1A18] dark:text-[#E8E6DF] mb-1.5">
                Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="w-full px-4 py-2.5 pr-11 rounded-xl border border-[#E5E4DF] dark:border-[#2C2C2A] bg-[#F8F7F4] dark:bg-[#0F0F0D] text-[#1A1A18] dark:text-[#E8E6DF] text-sm focus:outline-none focus:ring-2 focus:ring-brand-purple focus:border-transparent transition-all duration-200 placeholder:text-[#6B6A65]"
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[#6B6A65] hover:text-brand-purple transition-colors duration-200 cursor-pointer"
                  title={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? (
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
                      <line x1="1" y1="1" x2="23" y2="23" />
                    </svg>
                  ) : (
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                      <circle cx="12" cy="12" r="3" />
                    </svg>
                  )}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 rounded-xl bg-brand-purple text-white font-semibold text-sm hover:bg-purple-700 active:scale-95 focus:outline-none focus:ring-2 focus:ring-brand-purple focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 cursor-pointer flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <svg className="animate-spin" width="16" height="16" viewBox="0 0 24 24" fill="none">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="white" strokeWidth="4" />
                    <path className="opacity-75" fill="white" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  Signing in...
                </>
              ) : (
                'Sign in'
              )}
            </button>
          </form>

          {/* Demo hint */}
          <div className="mt-6 pt-5 border-t border-[#E5E4DF] dark:border-[#2C2C2A] text-center">
            <p className="text-xs text-[#6B6A65] dark:text-[#9A9890]">
              Demo credentials pre-filled above
            </p>
            <p className="text-xs text-[#6B6A65] dark:text-[#9A9890] mt-0.5">
              <span className="font-mono bg-[#F8F7F4] dark:bg-[#0F0F0D] px-1.5 py-0.5 rounded">admin@neuralproxy.dev</span>
              {' / '}
              <span className="font-mono bg-[#F8F7F4] dark:bg-[#0F0F0D] px-1.5 py-0.5 rounded">admin123</span>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
