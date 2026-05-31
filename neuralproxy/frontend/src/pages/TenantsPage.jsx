import { useState, useEffect, useCallback } from 'react'
import api from '../api/axios.js'

function CopyButton({ text }) {
  const [copied, setCopied] = useState(false)

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(text)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      setCopied(false)
    }
  }

  return (
    <button
      onClick={handleCopy}
      title="Copy"
      className={`flex items-center gap-1 text-xs px-2 py-1 rounded-lg transition-all duration-200 cursor-pointer ${
        copied
          ? 'text-brand-teal bg-teal-50 dark:bg-teal-950/30'
          : 'text-[#6B6A65] dark:text-[#9A9890] hover:text-brand-purple hover:bg-purple-50 dark:hover:bg-purple-950/20'
      }`}
    >
      {copied ? (
        <>
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <polyline points="20 6 9 17 4 12" />
          </svg>
          Copied!
        </>
      ) : (
        <>
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
            <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
          </svg>
          Copy
        </>
      )}
    </button>
  )
}

function TenantCard({ tenant, onGenerateKey }) {
  const [keys, setKeys] = useState([])
  const [loadingKeys, setLoadingKeys] = useState(false)
  const [generatingKey, setGeneratingKey] = useState(false)
  const [newKey, setNewKey] = useState(null)

  const fetchKeys = useCallback(async () => {
    setLoadingKeys(true)
    try {
      const res = await api.get(`/tenants/${tenant.id}/api-keys`)
      setKeys(res.data)
    } catch {}
    finally { setLoadingKeys(false) }
  }, [tenant.id])

  useEffect(() => { fetchKeys() }, [fetchKeys])

  const handleGenerateKey = async () => {
    setGeneratingKey(true)
    try {
      const res = await api.post(`/tenants/${tenant.id}/api-keys`)
      setNewKey(res.data.key)
      await fetchKeys()
      setTimeout(() => setNewKey(null), 30000) // Hide after 30s
    } catch {}
    finally { setGeneratingKey(false) }
  }

  return (
    <div className="bg-white dark:bg-[#1A1A18] rounded-2xl p-5 border border-[#E5E4DF] dark:border-[#2C2C2A] hover:-translate-y-0.5 hover:shadow-md transition-all duration-200">
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div>
          <h3 className="font-bold text-[#1A1A18] dark:text-[#E8E6DF]">{tenant.name}</h3>
          <p className="text-xs text-[#6B6A65] dark:text-[#9A9890] mt-0.5 font-mono">{tenant.id?.slice(0, 8)}…</p>
        </div>
        <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
          tenant.plan === 'PRO'
            ? 'bg-teal-100 dark:bg-teal-900/30 text-brand-teal'
            : 'bg-gray-100 dark:bg-gray-800 text-[#6B6A65] dark:text-[#9A9890]'
        }`}>
          {tenant.plan || 'FREE'}
        </span>
      </div>

      {/* New key banner */}
      {newKey && (
        <div className="mb-4 p-3 rounded-xl bg-teal-50 dark:bg-teal-950/20 border border-teal-200 dark:border-teal-800 animate-slide-up">
          <p className="text-xs font-medium text-brand-teal mb-1">New API Key — copy it now, it won't be shown again</p>
          <div className="flex items-center gap-2">
            <code className="text-xs font-mono text-[#1A1A18] dark:text-[#E8E6DF] break-all">{newKey}</code>
            <CopyButton text={newKey} />
          </div>
        </div>
      )}

      {/* API Keys */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <p className="text-xs font-medium text-[#6B6A65] dark:text-[#9A9890] uppercase tracking-wider">API Keys</p>
          <button
            onClick={handleGenerateKey}
            disabled={generatingKey}
            className="text-xs text-brand-purple hover:text-purple-700 font-medium cursor-pointer disabled:opacity-50 transition-colors"
          >
            {generatingKey ? 'Generating…' : '+ Generate'}
          </button>
        </div>

        {loadingKeys ? (
          <div className="animate-pulse h-8 bg-gray-100 dark:bg-gray-800 rounded-lg" />
        ) : keys.length === 0 ? (
          <p className="text-xs text-[#6B6A65] dark:text-[#9A9890] py-1">No API keys yet</p>
        ) : (
          keys.map((k) => (
            <div key={k.id} className="flex items-center justify-between bg-[#F8F7F4] dark:bg-[#0F0F0D] rounded-lg px-3 py-2">
              <code className="text-xs font-mono text-[#1A1A18] dark:text-[#E8E6DF]">
                {k.key_prefix || k.keyPrefix || 'np_xxxxx'}…
                <span className="text-[#6B6A65]">xxxx</span>
              </code>
              <div className="flex items-center gap-2">
                {(k.active === true || k.active === 't') ? (
                  <span className="w-1.5 h-1.5 rounded-full bg-brand-teal" title="Active" />
                ) : (
                  <span className="w-1.5 h-1.5 rounded-full bg-gray-400" title="Inactive" />
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}

export default function TenantsPage() {
  const [tenants, setTenants] = useState([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [newName, setNewName] = useState('')
  const [newPlan, setNewPlan] = useState('FREE')
  const [creating, setCreating] = useState(false)
  const [formError, setFormError] = useState(null)

  const fetchTenants = useCallback(async () => {
    try {
      const res = await api.get('/tenants')
      setTenants(res.data)
    } catch {}
    finally { setLoading(false) }
  }, [])

  useEffect(() => { fetchTenants() }, [fetchTenants])

  const handleCreate = async (e) => {
    e.preventDefault()
    if (!newName.trim()) return
    setFormError(null)
    setCreating(true)
    try {
      await api.post('/tenants', { name: newName.trim(), plan: newPlan })
      setNewName('')
      setNewPlan('FREE')
      setShowForm(false)
      await fetchTenants()
    } catch (err) {
      setFormError(err.response?.data?.message || 'Failed to create tenant')
    } finally {
      setCreating(false)
    }
  }

  return (
    <div className="pt-20 pb-8 px-4 max-w-7xl mx-auto animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-[#1A1A18] dark:text-[#E8E6DF]">Tenants</h1>
          <p className="text-sm text-[#6B6A65] dark:text-[#9A9890] mt-0.5">
            Manage tenants and their API keys
          </p>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-brand-purple text-white text-sm font-semibold hover:bg-purple-700 active:scale-95 focus:outline-none focus:ring-2 focus:ring-brand-purple focus:ring-offset-2 transition-all duration-200 cursor-pointer"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <line x1="12" y1="5" x2="12" y2="19" />
            <line x1="5" y1="12" x2="19" y2="12" />
          </svg>
          New Tenant
        </button>
      </div>

      {/* Inline create form */}
      {showForm && (
        <div className="mb-6 animate-slide-up">
          <form
            onSubmit={handleCreate}
            className="bg-white dark:bg-[#1A1A18] rounded-2xl p-5 border border-brand-purple/30 shadow-sm"
          >
            <h3 className="text-sm font-semibold text-[#1A1A18] dark:text-[#E8E6DF] mb-4">Create New Tenant</h3>

            {formError && (
              <div className="mb-3 px-3 py-2 rounded-lg border-l-4 border-brand-coral bg-red-50 dark:bg-red-950/20">
                <p className="text-sm text-brand-coral">{formError}</p>
              </div>
            )}

            <div className="flex flex-col sm:flex-row gap-3">
              <input
                type="text"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                placeholder="Tenant name"
                required
                className="flex-1 px-4 py-2.5 rounded-xl border border-[#E5E4DF] dark:border-[#2C2C2A] bg-[#F8F7F4] dark:bg-[#0F0F0D] text-sm text-[#1A1A18] dark:text-[#E8E6DF] focus:outline-none focus:ring-2 focus:ring-brand-purple placeholder:text-[#6B6A65] transition-all duration-200"
              />
              <select
                value={newPlan}
                onChange={(e) => setNewPlan(e.target.value)}
                className="px-4 py-2.5 rounded-xl border border-[#E5E4DF] dark:border-[#2C2C2A] bg-[#F8F7F4] dark:bg-[#0F0F0D] text-sm text-[#1A1A18] dark:text-[#E8E6DF] focus:outline-none focus:ring-2 focus:ring-brand-purple transition-all duration-200 cursor-pointer"
              >
                <option value="FREE">FREE</option>
                <option value="PRO">PRO</option>
              </select>
              <div className="flex gap-2">
                <button
                  type="submit"
                  disabled={creating}
                  className="px-5 py-2.5 rounded-xl bg-brand-purple text-white text-sm font-semibold hover:bg-purple-700 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 cursor-pointer"
                >
                  {creating ? 'Creating…' : 'Create'}
                </button>
                <button
                  type="button"
                  onClick={() => { setShowForm(false); setFormError(null) }}
                  className="px-5 py-2.5 rounded-xl border border-[#E5E4DF] dark:border-[#2C2C2A] text-sm font-medium text-[#6B6A65] dark:text-[#9A9890] hover:text-brand-coral hover:border-brand-coral transition-all duration-200 cursor-pointer"
                >
                  Cancel
                </button>
              </div>
            </div>
          </form>
        </div>
      )}

      {/* Tenant cards */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="bg-white dark:bg-[#1A1A18] rounded-2xl p-5 border border-[#E5E4DF] dark:border-[#2C2C2A] animate-pulse">
              <div className="h-5 bg-gray-200 dark:bg-gray-700 rounded w-1/2 mb-3" />
              <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/3 mb-4" />
              <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded" />
            </div>
          ))}
        </div>
      ) : tenants.length === 0 ? (
        <div className="text-center py-16 text-[#6B6A65] dark:text-[#9A9890]">
          <p className="text-lg font-medium mb-1">No tenants yet</p>
          <p className="text-sm">Create your first tenant to get started</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {tenants.map((tenant) => (
            <TenantCard key={tenant.id} tenant={tenant} />
          ))}
        </div>
      )}
    </div>
  )
}
