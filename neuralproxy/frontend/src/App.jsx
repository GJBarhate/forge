import { useEffect } from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import useStore from './store/useStore'
import { useWebSocket } from './hooks/useWebSocket'
import Navbar from './components/Navbar.jsx'
import ProtectedRoute from './components/ProtectedRoute.jsx'
import LoginPage from './pages/LoginPage.jsx'
import DashboardPage from './pages/DashboardPage.jsx'
import PlaygroundPage from './pages/PlaygroundPage.jsx'
import TenantsPage from './pages/TenantsPage.jsx'

function AppContent() {
  const theme = useStore((s) => s.theme)
  const token = useStore((s) => s.token)
  const { connected } = useWebSocket()

  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark')
    } else {
      document.documentElement.classList.remove('dark')
    }
  }, [theme])

  return (
    <div className="min-h-screen bg-[#F8F7F4] dark:bg-[#0F0F0D] text-[#1A1A18] dark:text-[#E8E6DF]">
      {token && <Navbar wsConnected={connected} />}
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route element={<ProtectedRoute />}>
          <Route path="/" element={<DashboardPage />} />
          <Route path="/playground" element={<PlaygroundPage />} />
          <Route path="/tenants" element={<TenantsPage />} />
        </Route>
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </div>
  )
}

export default function App() {
  return (
    <BrowserRouter>
      <AppContent />
    </BrowserRouter>
  )
}
