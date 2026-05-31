import { useEffect, useState, useCallback } from 'react'
import useStore from '../store/useStore.js'
import api from '../api/axios.js'
import StatCard from '../components/StatCard.jsx'
import CostChart from '../components/CostChart.jsx'
import LatencyChart from '../components/LatencyChart.jsx'
import RequestTable from '../components/RequestTable.jsx'

export default function DashboardPage() {
  const analytics = useStore((s) => s.analytics)
  const setAnalyticsFull = useStore((s) => s.setAnalyticsFull)

  const [summary, setSummary] = useState(null)
  const [requests, setRequests] = useState([])
  const [costData, setCostData] = useState([])
  const [latencyData, setLatencyData] = useState({})
  const [loading, setLoading] = useState(true)
  const [tableLoading, setTableLoading] = useState(false)

  const fetchAll = useCallback(async () => {
    try {
      const [summaryRes, requestsRes, costRes, latencyRes] = await Promise.all([
        api.get('/analytics/summary'),
        api.get('/analytics/requests?limit=20'),
        api.get('/analytics/cost-over-time'),
        api.get('/analytics/latency-by-provider')
      ])

      setSummary(summaryRes.data)
      setRequests(requestsRes.data)
      setCostData(costRes.data)
      setLatencyData(latencyRes.data)

      setAnalyticsFull({
        totalRequests: summaryRes.data.totalRequests,
        cacheHitRate: summaryRes.data.cacheHitRate,
        avgLatency: summaryRes.data.avgLatency,
        totalCost: summaryRes.data.totalCost,
        costOverTime: costRes.data,
        latencyByProvider: latencyRes.data
      })
    } catch (e) {
      // Silently handle
    } finally {
      setLoading(false)
    }
  }, [setAnalyticsFull])

  const refreshTable = async () => {
    setTableLoading(true)
    try {
      const res = await api.get('/analytics/requests?limit=20')
      setRequests(res.data)
    } catch (e) {}
    finally {
      setTableLoading(false)
    }
  }

  useEffect(() => {
    fetchAll()
  }, [fetchAll])

  // Merge live WS analytics into summary
  const displaySummary = {
    totalRequests: analytics.totalRequests || summary?.totalRequests || 0,
    cacheHitRate: analytics.cacheHitRate || summary?.cacheHitRate || 0,
    avgLatency: analytics.avgLatency || summary?.avgLatency || 0,
    totalCost: analytics.totalCost || summary?.totalCost || 0
  }

  // Merge live requests
  const displayRequests = analytics.recentRequests.length > 0
    ? analytics.recentRequests
    : requests

  return (
    <div className="pt-20 pb-8 px-4 max-w-7xl mx-auto animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-[#1A1A18] dark:text-[#E8E6DF]">Dashboard</h1>
          <p className="text-sm text-[#6B6A65] dark:text-[#9A9890] mt-0.5">
            Real-time analytics and request monitoring
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-brand-teal animate-pulse" />
          <span className="text-xs font-medium text-brand-teal">Live</span>
        </div>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 mb-6">
        <StatCard
          label="Total Requests"
          value={displaySummary.totalRequests.toLocaleString()}
          accentColor="purple"
          loading={loading}
        />
        <StatCard
          label="Cache Hit Rate"
          value={Number(displaySummary.cacheHitRate).toFixed(1)}
          unit="%"
          accentColor="teal"
          loading={loading}
        />
        <StatCard
          label="Avg Latency"
          value={displaySummary.avgLatency}
          unit="ms"
          accentColor="amber"
          loading={loading}
        />
        <StatCard
          label="Total Cost"
          value={`$${Number(displaySummary.totalCost).toFixed(4)}`}
          accentColor="coral"
          loading={loading}
        />
      </div>

      {/* Cost chart */}
      <div className="mb-6">
        <CostChart data={costData} />
      </div>

      {/* Latency + Provider summary */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-6">
        <div className="lg:col-span-2">
          <LatencyChart data={latencyData} />
        </div>

        {/* Top providers mini card */}
        <div className="bg-white dark:bg-[#1A1A18] rounded-2xl p-5 border border-[#E5E4DF] dark:border-[#2C2C2A]">
          <h3 className="text-sm font-semibold text-[#1A1A18] dark:text-[#E8E6DF] mb-4">Provider Stats</h3>
          {Object.entries(latencyData).length === 0 ? (
            <p className="text-sm text-[#6B6A65] dark:text-[#9A9890]">No provider data yet</p>
          ) : (
            <div className="space-y-3">
              {Object.entries(latencyData).map(([provider, stats]) => (
                <div key={provider} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span
                      className="w-2.5 h-2.5 rounded-full"
                      style={{ backgroundColor: provider === 'GEMINI' ? '#EF9F27' : provider === 'OPENAI' ? '#D85A30' : '#7F77DD' }}
                    />
                    <span className="text-sm font-medium text-[#1A1A18] dark:text-[#E8E6DF]">{provider}</span>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-[#6B6A65] dark:text-[#9A9890]">p50: <span className="font-medium text-brand-purple">{stats.p50}ms</span></p>
                    <p className="text-xs text-[#6B6A65] dark:text-[#9A9890]">p99: <span className="font-medium text-[#AFA9EC]">{stats.p99}ms</span></p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Request table */}
      <RequestTable
        requests={displayRequests}
        onRefresh={refreshTable}
        loading={tableLoading}
      />
    </div>
  )
}
