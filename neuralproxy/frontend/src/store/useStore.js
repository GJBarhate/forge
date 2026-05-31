import { create } from 'zustand'
import { persist } from 'zustand/middleware'

const useStore = create(
  persist(
    (set, get) => ({
      // Auth state
      token: null,
      user: null,

      // Theme
      theme: 'light',

      // Analytics
      analytics: {
        totalRequests: 0,
        cacheHitRate: 0,
        avgLatency: 0,
        totalCost: 0,
        recentRequests: [],
        costOverTime: [],
        latencyByProvider: {}
      },

      // Actions
      setToken: (token) => set({ token }),
      setUser: (user) => set({ user }),

      setTheme: (theme) => {
        set({ theme })
        if (theme === 'dark') {
          document.documentElement.classList.add('dark')
        } else {
          document.documentElement.classList.remove('dark')
        }
      },

      updateAnalytics: (data) => set((state) => {
        const recentRequests = data.recentRequest
          ? [data.recentRequest, ...state.analytics.recentRequests].slice(0, 50)
          : state.analytics.recentRequests

        return {
          analytics: {
            ...state.analytics,
            totalRequests: data.totalRequests ?? state.analytics.totalRequests,
            cacheHitRate: data.cacheHitRate ?? state.analytics.cacheHitRate,
            avgLatency: data.avgLatency ?? state.analytics.avgLatency,
            totalCost: data.totalCost ?? state.analytics.totalCost,
            recentRequests
          }
        }
      }),

      setAnalyticsFull: (analytics) => set((state) => ({
        analytics: { ...state.analytics, ...analytics }
      })),

      logout: () => set({
        token: null,
        user: null
      })
    }),
    {
      name: 'neural-proxy-store',
      partialize: (state) => ({
        token: state.token,
        user: state.user,
        theme: state.theme
      })
    }
  )
)

export default useStore
