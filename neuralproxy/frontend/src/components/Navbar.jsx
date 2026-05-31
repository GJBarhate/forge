import { useState } from 'react'
import { NavLink, useNavigate } from 'react-router-dom'
import useStore from '../store/useStore'
import ThemeToggle from './ThemeToggle.jsx'

export default function Navbar({ wsConnected }) {
  const [mobileOpen, setMobileOpen] = useState(false)
  const user = useStore((s) => s.user)
  const logout = useStore((s) => s.logout)
  const navigate = useNavigate()

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  const navLinks = [
    { to: '/', label: 'Dashboard' },
    { to: '/playground', label: 'Playground' },
    { to: '/tenants', label: 'Tenants' }
  ]

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-white dark:bg-[#1A1A18] border-b border-[#E5E4DF] dark:border-[#2C2C2A] shadow-sm h-16">
      <div className="max-w-7xl mx-auto px-4 h-full flex items-center justify-between">
        {/* Logo */}
        <div className="flex items-center gap-2">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" className="text-brand-purple">
            <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" fill="#7F77DD" />
          </svg>
          <span className="font-bold text-lg text-brand-purple tracking-tight">NeuralProxy</span>
          {wsConnected && (
            <span className="w-2 h-2 rounded-full bg-brand-teal animate-pulse ml-1" title="Live connected" />
          )}
        </div>

        {/* Desktop nav links */}
        <div className="hidden md:flex items-center gap-1">
          {navLinks.map(({ to, label }) => (
            <NavLink
              key={to}
              to={to}
              end={to === '/'}
              className={({ isActive }) =>
                `px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 cursor-pointer ${
                  isActive
                    ? 'text-brand-purple bg-purple-50 dark:bg-purple-950/40 border-b-2 border-brand-purple'
                    : 'text-[#6B6A65] dark:text-[#9A9890] hover:text-brand-purple hover:bg-purple-50 dark:hover:bg-purple-950/20'
                }`
              }
            >
              {label}
            </NavLink>
          ))}
        </div>

        {/* Right side */}
        <div className="flex items-center gap-3">
          <ThemeToggle />

          {user && (
            <span className="hidden sm:flex items-center gap-2 text-sm text-[#6B6A65] dark:text-[#9A9890] bg-[#F8F7F4] dark:bg-[#2C2C2A] px-3 py-1.5 rounded-full">
              <span className="w-2 h-2 rounded-full bg-brand-teal" />
              {user.email}
            </span>
          )}

          <button
            onClick={handleLogout}
            className="flex items-center gap-1.5 text-sm text-[#6B6A65] dark:text-[#9A9890] hover:text-brand-coral dark:hover:text-brand-coral transition-colors duration-200 cursor-pointer px-3 py-1.5 rounded-lg hover:bg-red-50 dark:hover:bg-red-950/20"
            title="Logout"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
              <polyline points="16 17 21 12 16 7" />
              <line x1="21" y1="12" x2="9" y2="12" />
            </svg>
            <span className="hidden sm:inline">Logout</span>
          </button>

          {/* Mobile hamburger */}
          <button
            className="md:hidden p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-[#2C2C2A] cursor-pointer"
            onClick={() => setMobileOpen(!mobileOpen)}
            title="Menu"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              {mobileOpen ? (
                <path d="M18 6L6 18M6 6l12 12" />
              ) : (
                <>
                  <line x1="3" y1="6" x2="21" y2="6" />
                  <line x1="3" y1="12" x2="21" y2="12" />
                  <line x1="3" y1="18" x2="21" y2="18" />
                </>
              )}
            </svg>
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="md:hidden bg-white dark:bg-[#1A1A18] border-t border-[#E5E4DF] dark:border-[#2C2C2A] px-4 py-3 flex flex-col gap-1 animate-fade-in">
          {navLinks.map(({ to, label }) => (
            <NavLink
              key={to}
              to={to}
              end={to === '/'}
              onClick={() => setMobileOpen(false)}
              className={({ isActive }) =>
                `px-4 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 ${
                  isActive
                    ? 'text-brand-purple bg-purple-50 dark:bg-purple-950/40'
                    : 'text-[#6B6A65] dark:text-[#9A9890] hover:text-brand-purple'
                }`
              }
            >
              {label}
            </NavLink>
          ))}
        </div>
      )}
    </nav>
  )
}
