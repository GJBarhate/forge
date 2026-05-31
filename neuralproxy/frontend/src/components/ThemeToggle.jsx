import useStore from '../store/useStore'

export default function ThemeToggle() {
  const theme = useStore((s) => s.theme)
  const setTheme = useStore((s) => s.setTheme)

  const isDark = theme === 'dark'

  const toggle = () => {
    setTheme(isDark ? 'light' : 'dark')
  }

  return (
    <button
      onClick={toggle}
      title={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
      className="relative flex items-center w-12 h-6 rounded-full cursor-pointer focus:outline-none focus:ring-2 focus:ring-brand-purple focus:ring-offset-1 transition-colors duration-200"
      style={{ backgroundColor: isDark ? '#7F77DD' : '#D1D5DB' }}
    >
      {/* Track icons */}
      <span className="absolute left-1 text-xs">
        {!isDark && (
          <svg width="12" height="12" viewBox="0 0 24 24" fill="#EF9F27">
            <circle cx="12" cy="12" r="4" />
            <path stroke="#EF9F27" strokeWidth="2" d="M12 2v2M12 20v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M2 12h2M20 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42" />
          </svg>
        )}
      </span>
      <span className="absolute right-1 text-xs">
        {isDark && (
          <svg width="12" height="12" viewBox="0 0 24 24" fill="#E8E6DF">
            <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
          </svg>
        )}
      </span>
      {/* Thumb */}
      <span
        className="absolute w-5 h-5 rounded-full bg-white shadow-sm transition-transform duration-200"
        style={{ transform: isDark ? 'translateX(24px)' : 'translateX(2px)' }}
      />
    </button>
  )
}
