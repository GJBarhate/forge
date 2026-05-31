import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  Legend
} from 'recharts'

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null
  return (
    <div className="bg-white dark:bg-[#1A1A18] border border-[#E5E4DF] dark:border-[#2C2C2A] rounded-lg shadow-lg p-3 text-sm">
      <p className="font-medium text-[#1A1A18] dark:text-[#E8E6DF] mb-1">{label}</p>
      {payload.map((entry) => (
        <p key={entry.dataKey} style={{ color: entry.color }} className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full" style={{ backgroundColor: entry.color }} />
          {entry.name}: ${Number(entry.value).toFixed(4)}
        </p>
      ))}
    </div>
  )
}

export default function CostChart({ data = [] }) {
  const hasData = data.length > 0

  return (
    <div className="bg-white dark:bg-[#1A1A18] rounded-2xl p-5 border border-[#E5E4DF] dark:border-[#2C2C2A]">
      <h3 className="text-sm font-semibold text-[#1A1A18] dark:text-[#E8E6DF] mb-4">Cost Over Time (24h)</h3>
      {hasData ? (
        <ResponsiveContainer width="100%" height={220}>
          <LineChart data={data} margin={{ top: 4, right: 8, left: 0, bottom: 0 }}>
            <XAxis
              dataKey="timestamp"
              tick={{ fontSize: 11, fill: '#6B6A65' }}
              axisLine={false}
              tickLine={false}
            />
            <YAxis
              tick={{ fontSize: 11, fill: '#6B6A65' }}
              axisLine={false}
              tickLine={false}
              tickFormatter={(v) => `$${v.toFixed(3)}`}
              width={55}
            />
            <Tooltip content={<CustomTooltip />} />
            <Legend
              wrapperStyle={{ fontSize: 12, paddingTop: 8 }}
            />
            <Line
              type="monotone"
              dataKey="gemini"
              name="Gemini"
              stroke="#EF9F27"
              strokeWidth={2}
              dot={false}
              activeDot={{ r: 4 }}
            />
            <Line
              type="monotone"
              dataKey="openai"
              name="OpenAI"
              stroke="#D85A30"
              strokeWidth={2}
              dot={false}
              activeDot={{ r: 4 }}
            />
          </LineChart>
        </ResponsiveContainer>
      ) : (
        <div className="h-[220px] flex items-center justify-center text-[#6B6A65] dark:text-[#9A9890] text-sm">
          No cost data yet — send some prompts to see analytics
        </div>
      )}
    </div>
  )
}
