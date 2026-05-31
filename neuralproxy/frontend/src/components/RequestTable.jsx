import ProviderBadge from './ProviderBadge.jsx'

function LatencyBadge({ ms }) {
  if (ms == null) return <span className="text-[#6B6A65]">—</span>
  if (ms < 100) return <span className="text-brand-teal font-medium">{ms}ms</span>
  if (ms < 500) return <span className="text-brand-amber font-medium">{ms}ms</span>
  return <span className="text-brand-coral font-medium">{ms}ms</span>
}

function formatTime(dateStr) {
  if (!dateStr) return '—'
  try {
    const d = new Date(dateStr)
    return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })
  } catch {
    return '—'
  }
}

export default function RequestTable({ requests = [], onRefresh, loading = false }) {
  return (
    <div className="bg-white dark:bg-[#1A1A18] rounded-2xl border border-[#E5E4DF] dark:border-[#2C2C2A] overflow-hidden">
      <div className="flex items-center justify-between px-5 py-4 border-b border-[#E5E4DF] dark:border-[#2C2C2A]">
        <h3 className="text-sm font-semibold text-[#1A1A18] dark:text-[#E8E6DF]">Recent Requests</h3>
        <button
          onClick={onRefresh}
          title="Refresh"
          className="p-1.5 rounded-lg text-[#6B6A65] dark:text-[#9A9890] hover:text-brand-purple hover:bg-purple-50 dark:hover:bg-purple-950/20 transition-all duration-200 cursor-pointer"
        >
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M23 4v6h-6M1 20v-6h6" />
            <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15" />
          </svg>
        </button>
      </div>

      <div className="max-h-80 overflow-y-auto">
        {loading ? (
          <div className="p-5 space-y-3">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="animate-pulse flex gap-4">
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-16" />
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-20" />
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-16" />
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-12" />
              </div>
            ))}
          </div>
        ) : requests.length === 0 ? (
          <div className="py-12 text-center text-[#6B6A65] dark:text-[#9A9890] text-sm">
            No requests yet — try the Playground!
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead className="sticky top-0 bg-[#F8F7F4] dark:bg-[#0F0F0D]">
              <tr>
                {['Time', 'Provider', 'Latency', 'Tokens', 'Cost', 'Cache'].map((h) => (
                  <th
                    key={h}
                    className="px-4 py-2.5 text-left text-xs font-semibold text-[#6B6A65] dark:text-[#9A9890] uppercase tracking-wider"
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {requests.map((req, i) => (
                <tr
                  key={req.id || i}
                  className="border-t border-[#E5E4DF] dark:border-[#2C2C2A] hover:bg-purple-50 dark:hover:bg-purple-950/10 transition-colors duration-150"
                >
                  <td className="px-4 py-3 text-[#6B6A65] dark:text-[#9A9890] whitespace-nowrap">
                    {formatTime(req.createdAt)}
                  </td>
                  <td className="px-4 py-3">
                    <ProviderBadge provider={req.provider} />
                  </td>
                  <td className="px-4 py-3">
                    <LatencyBadge ms={req.latencyMs} />
                  </td>
                  <td className="px-4 py-3 text-[#6B6A65] dark:text-[#9A9890]">
                    {req.tokenCount ?? '—'}
                  </td>
                  <td className="px-4 py-3 text-[#6B6A65] dark:text-[#9A9890]">
                    {req.costUsd != null ? `$${Number(req.costUsd).toFixed(4)}` : '—'}
                  </td>
                  <td className="px-4 py-3">
                    {req.cacheHit ? (
                      <span className="inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium bg-teal-100 dark:bg-teal-900/30 text-brand-teal">
                        Hit
                      </span>
                    ) : (
                      <span className="inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium bg-gray-100 dark:bg-gray-800 text-[#6B6A65] dark:text-[#9A9890]">
                        Miss
                      </span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  )
}
