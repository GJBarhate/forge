// src/components/layout/Navbar.jsx
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Zap, LayoutDashboard, PlusCircle, LogOut, User, X, Zap as ZapIcon } from 'lucide-react';
import { useAuthStore } from '../../store/authStore.js';
import { authService } from '../../services/authService.js';
import api from '../../services/api.js';
import toast from 'react-hot-toast';

const navLinks = [
  { to: '/dashboard', label: 'Dashboard', Icon: LayoutDashboard },
  { to: '/project/new', label: 'New Project', Icon: PlusCircle },
  { to: '/credits', label: 'Credits', Icon: ZapIcon },
];

export default function Navbar() {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, clearAuth, updateUser } = useAuthStore();

  const [showConfirmLogout, setShowConfirmLogout] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);

  // ✅ Fetch fresh user profile data
  const { data: profileData } = useQuery({
    queryKey: ['navbar-profile'],
    queryFn: async () => {
      const response = await api.get('/users/profile');
      return response.data?.user || response.data;
    },
    staleTime: 10 * 60 * 1000, // Cache for 10 minutes instead of 5
    gcTime: 30 * 60 * 1000, // Keep in cache for 30 minutes
    refetchOnWindowFocus: false, // Don't refetch when window regains focus
    refetchOnReconnect: false, // Don't refetch on reconnect
    refetchOnMount: false, // Don't refetch on mount if data exists
    enabled: !!user?.id,
  });

  // Update store when profile data arrives
  useEffect(() => {
    if (profileData) {
      updateUser(profileData);
    }
  }, [profileData, updateUser]);

  // Use profileData if available, otherwise fallback to user from store
  const displayName = profileData?.name || user?.name;
  const displayEmail = profileData?.email || user?.email;

  const handleLogoutClick = () => {
    setShowConfirmLogout(true);
  };

  const handleConfirmLogout = async () => {
    try {
      await authService.logout();
      toast.success('Signed out successfully');
    } catch (err) {
      // ignore
    } finally {
      clearAuth();
      setShowConfirmLogout(false);
    }
  };

  const toggleUserMenu = () => {
    setShowUserMenu(!showUserMenu);
  };

  return (
    <aside className="fixed left-0 top-0 bottom-0 w-60 bg-bg-2 border-r border-white/[0.07] flex flex-col z-50">
      {/* Logo */}
      <Link to="/dashboard" className="flex items-center gap-3 px-6 py-5 border-b border-white/[0.07]">
        <div className="w-8 h-8 rounded-lg bg-purple/20 border border-purple/30 flex items-center justify-center">
          <Zap size={16} className="text-purple-light" />
        </div>
        <span className="font-display font-800 text-lg text-white tracking-tight">Forge</span>
      </Link>

      {/* Nav links */}
      <nav className="flex-1 px-3 py-4 space-y-1">
        {navLinks.map(({ to, label, Icon }) => {
          const active = location.pathname === to || (to !== '/dashboard' && location.pathname.startsWith(to));
          return (
            <Link
              key={to}
              to={to}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-500 transition-all duration-150 ${
                active
                  ? 'bg-purple/15 text-purple-light border border-purple/20'
                  : 'text-[#9999b8] hover:text-[#e8e8f0] hover:bg-white/5'
              }`}
            >
              <Icon size={16} />
              {label}
            </Link>
          );
        })}
      </nav>

      {/* User footer - now clickable */}
      <div className="px-3 py-4 border-t border-white/[0.07] relative">
        <button
          onClick={toggleUserMenu}
          className="w-full flex items-center gap-3 px-3 py-2 hover:bg-white/5 rounded-lg transition-all text-left"
        >
          <div className="w-7 h-7 rounded-full bg-purple/20 border border-purple/30 flex items-center justify-center flex-shrink-0">
            <User size={13} className="text-purple-light" />
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-xs font-500 text-[#e8e8f0] truncate">{displayName || 'Loading...'}</p>
            <p className="text-[11px] text-[#5f5f80] truncate">{displayEmail}</p>
          </div>
        </button>

        {/* User dropdown menu */}
        {showUserMenu && (
          <div className="absolute bottom-16 left-4 right-4 bg-bg-3 border border-white/[0.1] rounded-xl shadow-xl p-3 z-50">
            <div className="flex items-center gap-3 px-2 py-2">
              <div className="w-8 h-8 rounded-full bg-purple/20 border border-purple/30 flex items-center justify-center">
                <User size={18} className="text-purple-light" />
              </div>
              <div>
                <p className="font-500 text-white">{displayName}</p>
                <p className="text-xs text-[#5f5f80]">{displayEmail}</p>
              </div>
            </div>
            <div className="border-t border-white/[0.07] my-2"></div>
            <button
              onClick={() => {
                setShowUserMenu(false);
                navigate('/credits');
              }}
              className="w-full text-left px-3 py-2 text-sm hover:bg-white/10 rounded-lg flex items-center gap-2 text-[#e8e8f0]"
            >
              <Zap size={14} />
              Credits & Billing
            </button>
            <button
              onClick={() => {
                setShowUserMenu(false);
                navigate('/profile');
              }}
              className="w-full text-left px-3 py-2 text-sm hover:bg-white/10 rounded-lg flex items-center gap-2 text-[#e8e8f0]"
            >
              <User size={14} />
              Account Settings
            </button>
          </div>
        )}

        {/* Sign out button */}
        <button
          onClick={handleLogoutClick}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-[#9999b8] hover:text-coral-light hover:bg-coral/10 transition-all duration-150"
        >
          <LogOut size={15} />
          Sign out
        </button>
      </div>

      {/* Confirmation Modal */}
      {showConfirmLogout && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-[100]">
          <div className="bg-bg-3 rounded-2xl w-full max-w-xs mx-4 p-6">
            <div className="flex justify-end">
              <button
                onClick={() => setShowConfirmLogout(false)}
                className="text-[#5f5f80] hover:text-white"
              >
                <X size={20} />
              </button>
            </div>

            <div className="text-center mt-2">
              <LogOut size={32} className="mx-auto text-coral mb-4" />
              <h3 className="text-lg font-600 text-white mb-1">Sign out?</h3>
              <p className="text-sm text-[#9999b8]">Are you sure you want to sign out?</p>
            </div>

            <div className="mt-8 flex gap-3">
              <button
                onClick={() => setShowConfirmLogout(false)}
                className="flex-1 py-3 text-sm font-500 rounded-xl border border-white/[0.1] hover:bg-white/5"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmLogout}
                className="flex-1 py-3 text-sm font-500 rounded-xl bg-coral text-white hover:bg-coral/90"
              >
                Yes, Sign out
              </button>
            </div>
          </div>
        </div>
      )}
    </aside>
  );
}