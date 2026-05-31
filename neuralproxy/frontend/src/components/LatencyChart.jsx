import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  Cell
} from 'recharts'

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null
  return (
    <div className="bg-white dark:bg-[#1A1A18] border border-[#E5E4DF] dark:border-[#2C2C2A] rounded-lg shadow-lg p-3 text-sm">
      <p className="font-medium text-[#1A1A18] dark:text-[#E8E6DF] mb-1">{label}</p>
      {payload.map((entry) => (
        <p key={entry.dataKey} className="flex items-center gap-2" style={{ color: entry.fill }}>
          <span className="w-2 h-2 rounded-full" style={{ backgroundColor: entry.fill }} />
          {entry.name}: {entry.value}ms
        </p>
      ))}
    </div>
  )
}

export default function LatencyChart({ data = [] }) {
  const chartData = Object.entries(data).map(([provider, stats]) => ({
    provider,
    p50: stats.p50 || 0,
    p99: stats.p99 || 0
  }))

  const hasData = chartData.length > 0

  return (
    <div className="bg-white dark:bg-[#1A1A18] rounded-2xl p-5 border border-[#E5E4DF] dark:border-[#2C2C2A]">
      <h3 className="text-sm font-semibold text-[#1A1A18] dark:text-[#E8E6DF] mb-4">Latency by Provider</h3>
      {hasData ? (
        <ResponsiveContainer width="100%" height={200}>
          <BarChart data={chartData} margin={{ top: 4, right: 8, left: 0, bottom: 0 }}>
            <XAxis
              dataKey="provider"
              tick={{ fontSize: 11, fill: '#6B6A65' }}
              axisLine={false}
              tickLine={false}
            />
            <YAxis
              tick={{ fontSize: 11, fill: '#6B6A65' }}
              axisLine={false}
              tickLine={false}
              tickFormatter={(v) => `${v}ms`}
              width={50}
            />
            <Tooltip content={<CustomTooltip />} />
            <Legend wrapperStyle={{ fontSize: 12, paddingTop: 8 }} />
            <Bar dataKey="p50" name="p50" fill="#7F77DD" radius={[4, 4, 0, 0]} />
            <Bar dataKey="p99" name="p99" fill="#AFA9EC" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      ) : (
        <div className="h-[200px] flex items-center justify-center text-[#6B6A65] dark:text-[#9A9890] text-sm">
          No latency data yet
        </div>
      )}
    </div>
  )
}
