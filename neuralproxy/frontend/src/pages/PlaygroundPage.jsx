import { useState } from 'react'
import axios from 'axios'
import useStore from '../store/useStore.js'
import ProviderBadge from '../components/ProviderBadge.jsx'

const PROVIDERS = [
  { value: '', label: 'Auto', icon: '⚡', desc: 'Lowest latency' },
  { value: 'GEMINI', label: 'Gemini', icon: '✦', desc: 'Google Gemini 2.0 Flash' },
  { value: 'OPENAI', label: 'OpenAI', icon: '◎', desc: 'GPT-4o Mini' }
]

export default function PlaygroundPage() {
  const token = useStore((s) => s.token)
  const [prompt, setPrompt] = useState('')
  const [provider, setProvider] = useState('')
  const [apiKey, setApiKey] = useState('')
  const [showApiKey, setShowApiKey] = useState(false)
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState(null)
  const [error, setError] = useState(null)

  const MAX_CHARS = 4000

  const handleSubmit = async () => {
    if (!prompt.trim()) return
    setError(null)
    setResult(null)
    setLoading(true)

    try {
      const headers = { 'Content-Type': 'application/json' }
      if (apiKey.trim()) {
        headers['X-API-Key'] = apiKey.trim()
      } else if (token) {
        headers['Authorization'] = `Bearer ${token}`
      }

      const res = await axios.post(
        '/gateway/prompt',
        { prompt: prompt.trim(), provider: provider || null },
        { headers, timeout: 60000 }
      )
      setResult(res.data)
    } catch (err) {
      if (err.response?.status === 429) {
        setError('Rate limit exceeded. Please wait a moment.')
      } else if (err.response?.status === 401) {
        setError('Authentication failed. Check your API key or login again.')
      } else {
        setError(err.response?.data?.message || err.message || 'Request failed')
      }
    } finally {
      setLoading(false)
    }
  }

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
      handleSubmit()
    }
  }

  return (
    <div className="pt-20 pb-8 px-4 max-w-7xl mx-auto animate-fade-in">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-[#1A1A18] dark:text-[#E8E6DF]">Prompt Playground</h1>
        <p className="text-sm text-[#6B6A65] dark:text-[#9A9890] mt-0.5">
          Test prompts across providers with real-time cost and latency tracking
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left panel — Input */}
        <div className="bg-white dark:bg-[#1A1A18] rounded-2xl p-5 border border-[#E5E4DF] dark:border-[#2C2C2A] flex flex-col gap-5">
          <h2 className="text-sm font-semibold text-[#1A1A18] dark:text-[#E8E6DF]">Input</h2>

          {/* Prompt textarea */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-medium text-[#6B6A65] dark:text-[#9A9890] uppercase tracking-wider">
                Prompt
              </label>
              <span className={`text-xs ${prompt.length > MAX_CHARS * 0.9 ? 'text-brand-coral' : 'text-[#6B6A65] dark:text-[#9A9890]'}`}>
                {prompt.length}/{MAX_CHARS}
              </span>
            </div>
            <textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value.slice(0, MAX_CHARS))}
              onKeyDown={handleKeyDown}
              placeholder="Enter your prompt here... (Ctrl+Enter to send)"
              className="w-full min-h-[160px] px-4 py-3 rounded-xl border border-[#E5E4DF] dark:border-[#2C2C2A] bg-[#F8F7F4] dark:bg-[#0F0F0D] text-[#1A1A18] dark:text-[#E8E6DF] text-sm resize-none focus:outline-none focus:ring-2 focus:ring-brand-purple focus:border-transparent transition-all duration-200 placeholder:text-[#6B6A65]"
            />
          </div>

          {/* Provider selector */}
          <div>
            <label className="text-xs font-medium text-[#6B6A65] dark:text-[#9A9890] uppercase tracking-wider mb-2 block">
              Provider
            </label>
            <div className="flex gap-2 flex-wrap">
              {PROVIDERS.map((p) => (
                <button
                  key={p.value}
                  onClick={() => setProvider(p.value)}
                  className={`flex items-center gap-2 px-3 py-2 rounded-xl border text-sm font-medium transition-all duration-200 cursor-pointer ${
                    provider === p.value
                      ? 'border-brand-purple bg-purple-50 dark:bg-purple-950/30 text-brand-purple'
                      : 'border-[#E5E4DF] dark:border-[#2C2C2A] text-[#6B6A65] dark:text-[#9A9890] hover:border-brand-purple hover:text-brand-purple'
                  }`}
                >
                  <span>{p.icon}</span>
                  <div className="text-left">
                    <div className="leading-none">{p.label}</div>
                    <div className="text-xs opacity-70 mt-0.5">{p.desc}</div>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* API Key input */}
          <div>
            <label className="text-xs font-medium text-[#6B6A65] dark:text-[#9A9890] uppercase tracking-wider mb-1.5 block">
              API Key <span className="normal-case text-[#6B6A65]">(optional — uses your session if blank)</span>
            </label>
            <div className="relative">
              <input
                type={showApiKey ? 'text' : 'password'}
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                placeholder="np_xxxxxxxxxxxx"
                className="w-full px-4 py-2.5 pr-11 rounded-xl border border-[#E5E4DF] dark:border-[#2C2C2A] bg-[#F8F7F4] dark:bg-[#0F0F0D] text-[#1A1A18] dark:text-[#E8E6DF] text-sm focus:outline-none focus:ring-2 focus:ring-brand-purple focus:border-transparent transition-all duration-200 placeholder:text-[#6B6A65] font-mono"
              />
              <button
                type="button"
                onClick={() => setShowApiKey(!showApiKey)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-[#6B6A65] hover:text-brand-purple transition-colors cursor-pointer"
                title={showApiKey ? 'Hide' : 'Show'}
              >
                {showApiKey ? (
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
                    <line x1="1" y1="1" x2="23" y2="23" />
                  </svg>
                ) : (
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                    <circle cx="12" cy="12" r="3" />
                  </svg>
                )}
              </button>
            </div>
          </div>

          {/* Submit button */}
          <button
            onClick={handleSubmit}
            disabled={loading || !prompt.trim()}
            className="w-full py-3 rounded-xl bg-brand-purple text-white font-semibold text-sm hover:bg-purple-700 active:scale-95 focus:outline-none focus:ring-2 focus:ring-brand-purple focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 cursor-pointer flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <svg className="animate-spin" width="16" height="16" viewBox="0 0 24 24" fill="none">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="white" strokeWidth="4" />
                  <path className="opacity-75" fill="white" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
                Generating...
              </>
            ) : (
              <>
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" />
                </svg>
                Send Prompt
              </>
            )}
          </button>
        </div>

        {/* Right panel — Result */}
        <div className="bg-white dark:bg-[#1A1A18] rounded-2xl p-5 border border-[#E5E4DF] dark:border-[#2C2C2A] flex flex-col gap-4">
          <h2 className="text-sm font-semibold text-[#1A1A18] dark:text-[#E8E6DF]">Response</h2>

          {error && (
            <div className="px-4 py-3 rounded-xl border-l-4 border-brand-coral bg-red-50 dark:bg-red-950/20 animate-fade-in">
              <p className="text-sm text-brand-coral font-medium">{error}</p>
            </div>
          )}

          {!result && !error && !loading && (
            <div className="flex-1 flex flex-col items-center justify-center min-h-[300px] text-center">
              <div className="w-14 h-14 rounded-2xl bg-[#F8F7F4] dark:bg-[#0F0F0D] flex items-center justify-center mb-3">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#6B6A65" strokeWidth="1.5">
                  <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                </svg>
              </div>
              <p className="text-sm text-[#6B6A65] dark:text-[#9A9890] font-medium">Send a prompt to see results</p>
              <p className="text-xs text-[#6B6A65] dark:text-[#9A9890] mt-1">Press Ctrl+Enter to submit quickly</p>
            </div>
          )}

          {loading && !result && (
            <div className="flex-1 flex flex-col items-center justify-center min-h-[300px]">
              <svg className="animate-spin mb-3" width="28" height="28" viewBox="0 0 24 24" fill="none">
                <circle className="opacity-20" cx="12" cy="12" r="10" stroke="#7F77DD" strokeWidth="4" />
                <path className="opacity-80" fill="#7F77DD" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
              <p className="text-sm text-[#6B6A65] dark:text-[#9A9890]">Routing your prompt...</p>
            </div>
          )}

          {result && (
            <div className="animate-slide-up flex flex-col gap-4">
              {/* Badges */}
              <div className="flex flex-wrap gap-2">
                <ProviderBadge provider={result.provider} />
                <span className="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium bg-purple-100 dark:bg-purple-900/30 text-brand-purple">
                  {result.latencyMs ?? 0}ms
                </span>
                <span className="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium bg-amber-100 dark:bg-amber-900/30 text-brand-amber">
                  ${Number(result.costUsd ?? 0).toFixed(4)}
                </span>
                {result.cacheHit && (
                  <span className="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium bg-teal-100 dark:bg-teal-900/30 text-brand-teal">
                    ⚡ Cache Hit
                  </span>
                )}
                {result.tokenCount > 0 && (
                  <span className="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium bg-gray-100 dark:bg-gray-800 text-[#6B6A65] dark:text-[#9A9890]">
                    {result.tokenCount} tokens
                  </span>
                )}
              </div>

              {/* Response text */}
              <div className="flex-1 bg-[#F8F7F4] dark:bg-[#0F0F0D] rounded-xl border border-[#E5E4DF] dark:border-[#2C2C2A] p-4 max-h-[500px] overflow-y-auto">
                <pre className="text-sm text-[#1A1A18] dark:text-[#E8E6DF] whitespace-pre-wrap font-sans leading-relaxed">
                  {result.text}
                </pre>
              </div>

              {/* Copy button */}
              <button
                onClick={() => navigator.clipboard?.writeText(result.text)}
                className="self-start flex items-center gap-1.5 text-xs text-[#6B6A65] dark:text-[#9A9890] hover:text-brand-purple transition-colors cursor-pointer px-3 py-1.5 rounded-lg hover:bg-purple-50 dark:hover:bg-purple-950/20"
              >
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
                  <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
                </svg>
                Copy response
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
