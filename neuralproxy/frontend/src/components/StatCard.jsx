const accentClasses = {
  purple: {
    dot: 'bg-brand-purple',
    value: 'text-brand-purple',
    trend: 'text-brand-purple'
  },
  teal: {
    dot: 'bg-brand-teal',
    value: 'text-brand-teal',
    trend: 'text-brand-teal'
  },
  amber: {
    dot: 'bg-brand-amber',
    value: 'text-brand-amber',
    trend: 'text-brand-amber'
  },
  coral: {
    dot: 'bg-brand-coral',
    value: 'text-brand-coral',
    trend: 'text-brand-coral'
  }
}

export default function StatCard({ label, value, unit, trend, accentColor = 'purple', loading = false }) {
  const accent = accentClasses[accentColor] || accentClasses.purple

  if (loading) {
    return (
      <div className="bg-white dark:bg-[#1A1A18] rounded-2xl p-5 border border-[#E5E4DF] dark:border-[#2C2C2A]">
        <div className="animate-pulse space-y-3">
          <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/2" />
          <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-3/4" />
          <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/3" />
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white dark:bg-[#1A1A18] rounded-2xl p-5 border border-[#E5E4DF] dark:border-[#2C2C2A] hover:-translate-y-0.5 hover:shadow-md transition-all duration-200 cursor-default">
      {/* Top row */}
      <div className="flex items-center justify-between mb-3">
        <span className="text-xs font-medium text-[#6B6A65] dark:text-[#9A9890] uppercase tracking-wider">
          {label}
        </span>
        <span className={`w-2.5 h-2.5 rounded-full ${accent.dot}`} />
      </div>

      {/* Value */}
      <div className="flex items-baseline gap-1.5 mb-2">
        <span className={`text-3xl font-bold ${accent.value}`}>
          {value ?? '—'}
        </span>
        {unit && (
          <span className="text-sm text-[#6B6A65] dark:text-[#9A9890] font-medium">
            {unit}
          </span>
        )}
      </div>

      {/* Trend */}
      {trend !== undefined && (
        <div className="flex items-center gap-1">
          {trend >= 0 ? (
            <>
              <span className="text-brand-teal text-xs">▲</span>
              <span className="text-xs text-brand-teal font-medium">{trend}% this hour</span>
            </>
          ) : (
            <>
              <span className="text-brand-coral text-xs">▼</span>
              <span className="text-xs text-brand-coral font-medium">{Math.abs(trend)}% this hour</span>
            </>
          )}
        </div>
      )}
    </div>
  )
}
