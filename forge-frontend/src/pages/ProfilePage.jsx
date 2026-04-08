// forge-frontend/src/pages/ProfilePage.jsx
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useAuthStore } from '../store/authStore.js';
import api from '../services/api.js';
import { Zap, User, Key, ArrowLeft, Save, Eye, EyeOff, Mail, Lock, AlertCircle, RefreshCw } from 'lucide-react';
import toast from 'react-hot-toast';

export default function ProfilePage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { user, updateUser, setGeminiApiKey } = useAuthStore();

  // Fetch profile with React Query caching
  const { data: profileData, isLoading, refetch: refetchProfile } = useQuery({
    queryKey: ['profile'],
    queryFn: async () => {
      const response = await api.get('/users/profile');
      return response.data?.user || response.data;
    },
    staleTime: 10 * 60 * 1000, // Cache for 10 minutes
    gcTime: 15 * 60 * 1000, // Garbage collect after 15 minutes
    refetchOnWindowFocus: false, // Don't refetch automatically
    enabled: !!user?.id, // Only fetch if user is logged in
  });

  // Sync profile data to store immediately
  useEffect(() => {
    if (profileData) {
      updateUser(profileData);
      setUsername(profileData.name || '');
      setEmail(profileData.email || '');
      setUserGeminiKey(profileData.geminiApiKey || '');
    }
  }, [profileData, updateUser]);

  // Basic Info
  const [username, setUsername] = useState(() => user?.name || '');
  const [email, setEmail] = useState(() => user?.email || '');
  const [bio, setBio] = useState('');
  const [isEditingBasicInfo, setIsEditingBasicInfo] = useState(false);
  const [isSavingBasicInfo, setIsSavingBasicInfo] = useState(false);

  // Gemini API Key
  const [userGeminiKey, setUserGeminiKey] = useState(() => user?.geminiApiKey || '');
  const [showKey, setShowKey] = useState(false);
  const [isSavingKey, setIsSavingKey] = useState(false);

  // Password & Security
  const [showPasswordForm, setShowPasswordForm] = useState(false);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPasswords, setShowPasswords] = useState({ current: false, new: false, confirm: false });
  const [isChangingPassword, setIsChangingPassword] = useState(false);

  // Load user data on mount
  useEffect(() => {
    if (profileData || user) {
      setUsername(profileData?.name || user?.name || '');
      setEmail(profileData?.email || user?.email || '');
      setUserGeminiKey(profileData?.geminiApiKey || user?.geminiApiKey || '');
    }
  }, [profileData, user]);

  // ── Basic Info Handler ──
  const handleSaveBasicInfo = async () => {
    if (!username.trim()) {
      toast.error('Username cannot be empty');
      return;
    }

    setIsSavingBasicInfo(true);
    try {
      const response = await api.patch('/users/profile', {
        name: username.trim(),
        bio: bio.trim() || null,
      });

      if (response.data?.user) {
        updateUser(response.data.user);
        toast.success('✅ Profile updated successfully!');
        setIsEditingBasicInfo(false);
      }
    } catch (err) {
      console.error('Failed to update profile:', err);
      toast.error(err.response?.data?.message || 'Failed to update profile');
    } finally {
      setIsSavingBasicInfo(false);
    }
  };

  // ── Gemini API Key Handler ──
  const handleSaveKey = async () => {
    setIsSavingKey(true);
    try {
      const response = await api.patch('/users/gemini-key', {
        geminiApiKey: userGeminiKey.trim() || null,
      });

      if (response.data?.user) {
        updateUser(response.data.user);
        setGeminiApiKey(response.data.user.geminiApiKey);
        toast.success('✅ Gemini API key saved successfully!');
      }
    } catch (err) {
      console.error('Failed to save API key:', err);
      toast.error(err.response?.data?.message || 'Failed to save API key');
    } finally {
      setIsSavingKey(false);
    }
  };

  // ── Password Change Handler ──
  const handleChangePassword = async () => {
    if (!currentPassword.trim()) {
      toast.error('Current password is required');
      return;
    }
    if (!newPassword.trim()) {
      toast.error('New password is required');
      return;
    }
    if (newPassword !== confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }
    if (newPassword.length < 6) {
      toast.error('Password must be at least 6 characters');
      return;
    }

    setIsChangingPassword(true);
    try {
      const response = await api.patch('/users/change-password', {
        currentPassword,
        newPassword,
      });

      toast.success('✅ Password changed successfully!');
      setShowPasswordForm(false);
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err) {
      console.error('Failed to change password:', err);
      toast.error(err.response?.data?.message || 'Failed to change password');
    } finally {
      setIsChangingPassword(false);
    }
  };

  return (
    <div className="page-container max-w-3xl mx-auto py-8">
      {/* Header */}
      <div className="flex items-center justify-between gap-3 mb-8">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate('/dashboard')}
            className="btn-ghost p-2"
          >
            <ArrowLeft size={20} />
          </button>
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-2xl bg-purple/20 border border-purple/30 flex items-center justify-center">
              <Zap size={22} className="text-purple-light" />
            </div>
            <h1 className="text-3xl font-display font-700 text-white">Profile</h1>
          </div>
        </div>
        <button
          onClick={() => refetchProfile()}
          title="Refresh profile data"
          className="btn-ghost p-2"
        >
          <RefreshCw size={18} />
        </button>
      </div>

      {/* 1. 👤 BASIC USER INFO ──────────────────────────────────────────── */}
      <div className="card mb-8">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-purple/15 border border-purple/25 flex items-center justify-center flex-shrink-0">
              <User size={20} className="text-purple-light" />
            </div>
            <div>
              <h2 className="text-xl font-600 text-white">Basic User Info</h2>
              <p className="text-xs text-[#5f5f80]">Manage your account information</p>
            </div>
          </div>
          <button
            onClick={() => setIsEditingBasicInfo(!isEditingBasicInfo)}
            className="text-sm px-3 py-1.5 rounded-lg text-purple-light hover:bg-purple/10 border border-purple/20 transition-all"
          >
            {isEditingBasicInfo ? 'Cancel' : 'Edit'}
          </button>
        </div>

        {isEditingBasicInfo ? (
          <div className="space-y-4">
            <div>
              <label className="label-base">Username</label>
              <input
                type="text"
                className="input-base"
                placeholder="Your name"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
              />
            </div>

            <div>
              <label className="label-base flex items-center gap-2">
                <Mail size={14} />
                Email (Read-only)
              </label>
              <input
                type="email"
                className="input-base opacity-50 cursor-not-allowed"
                value={email}
                disabled
              />
              <p className="text-xs text-[#5f5f80] mt-1">✅ Verified email cannot be changed</p>
            </div>

            <div>
              <label className="label-base">Bio (Optional)</label>
              <textarea
                className="input-base resize-none"
                placeholder="Tell us about yourself..."
                rows={3}
                value={bio}
                onChange={(e) => setBio(e.target.value)}
              />
              <p className="text-xs text-[#5f5f80] mt-1">{bio.length}/200 characters</p>
            </div>

            <button
              onClick={handleSaveBasicInfo}
              disabled={isSavingBasicInfo}
              className="btn-primary w-full flex items-center justify-center gap-2"
            >
              {isSavingBasicInfo ? (
                <>Saving...</>
              ) : (
                <>
                  <Save size={18} />
                  Save Changes
                </>
              )}
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            <div>
              <p className="text-xs text-[#5f5f80] mb-1">Username</p>
              <p className="text-lg font-500 text-white">{username || 'Not set'}</p>
            </div>
            <div>
              <p className="text-xs text-[#5f5f80] mb-1">Email</p>
              <div className="flex items-center gap-2">
                <p className="text-lg font-500 text-white">{email}</p>
                <span className="text-xs px-2 py-1 bg-teal/20 text-teal-400 rounded border border-teal/30">
                  ✓ Verified
                </span>
              </div>
            </div>
            {bio && (
              <div>
                <p className="text-xs text-[#5f5f80] mb-1">Bio</p>
                <p className="text-white">{bio}</p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* 2. 🔐 PASSWORD & SECURITY ──────────────────────────────────────────── */}
      <div className="card mb-8">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-lg bg-coral/15 border border-coral/25 flex items-center justify-center flex-shrink-0">
            <Lock size={20} className="text-coral-light" />
          </div>
          <div>
            <h2 className="text-xl font-600 text-white">Password & Security</h2>
            <p className="text-xs text-[#5f5f80]">Manage your account security</p>
          </div>
        </div>

        {!showPasswordForm ? (
          <button
            onClick={() => setShowPasswordForm(true)}
            className="btn-secondary w-full flex items-center justify-center gap-2"
          >
            <Lock size={18} />
            Change Password
          </button>
        ) : (
          <div className="space-y-4 border-t border-white/[0.07] pt-4">
            <div className="bg-coral/5 border border-coral/20 rounded-lg p-3 flex gap-2 items-start">
              <AlertCircle size={16} className="text-coral-light flex-shrink-0 mt-0.5" />
              <p className="text-xs text-coral-light">
                For security, you must confirm your current password before changing it.
              </p>
            </div>

            <div className="relative">
              <label className="label-base">Current Password</label>
              <div className="relative">
                <input
                  type={showPasswords.current ? 'text' : 'password'}
                  className="input-base pr-12"
                  placeholder="Enter current password"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  disabled={isChangingPassword}
                />
                <button
                  type="button"
                  onClick={() => setShowPasswords({ ...showPasswords, current: !showPasswords.current })}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-[#9999b8] hover:text-white"
                >
                  {showPasswords.current ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            <div className="relative">
              <label className="label-base">New Password</label>
              <div className="relative">
                <input
                  type={showPasswords.new ? 'text' : 'password'}
                  className="input-base pr-12"
                  placeholder="Enter new password (min 6 characters)"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  disabled={isChangingPassword}
                />
                <button
                  type="button"
                  onClick={() => setShowPasswords({ ...showPasswords, new: !showPasswords.new })}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-[#9999b8] hover:text-white"
                >
                  {showPasswords.new ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            <div className="relative">
              <label className="label-base">Confirm New Password</label>
              <div className="relative">
                <input
                  type={showPasswords.confirm ? 'text' : 'password'}
                  className="input-base pr-12"
                  placeholder="Confirm new password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  disabled={isChangingPassword}
                />
                <button
                  type="button"
                  onClick={() => setShowPasswords({ ...showPasswords, confirm: !showPasswords.confirm })}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-[#9999b8] hover:text-white"
                >
                  {showPasswords.confirm ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            <div className="flex gap-3">
              <button
                onClick={handleChangePassword}
                disabled={isChangingPassword}
                className="btn-primary flex-1 flex items-center justify-center gap-2"
              >
                {isChangingPassword ? 'Changing...' : <>
                  <Lock size={18} />
                  Change Password
                </>}
              </button>
              <button
                onClick={() => setShowPasswordForm(false)}
                disabled={isChangingPassword}
                className="btn-secondary flex-1"
              >
                Cancel
              </button>
            </div>
          </div>
        )}
      </div>

      {/* 3. 🔑 GEMINI API KEY ──────────────────────────────────────────── */}
      <div className="card mb-8">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-lg bg-teal/15 border border-teal/25 flex items-center justify-center flex-shrink-0">
            <Key size={20} className="text-teal-400" />
          </div>
          <div>
            <h2 className="text-xl font-600 text-white">Personal Gemini API Key</h2>
            <p className="text-xs text-[#5f5f80]">Highest priority when generating blueprints</p>
          </div>
        </div>

        <div className="relative">
          <label className="label-base">Your API Key</label>
          <input
            type={showKey ? 'text' : 'password'}
            className="input-base font-mono text-sm pr-12"
            placeholder="AIzaSyBxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
            value={userGeminiKey}
            onChange={(e) => setUserGeminiKey(e.target.value)}
            disabled={isSavingKey}
          />
          <button
            type="button"
            onClick={() => setShowKey(!showKey)}
            className="absolute right-4 top-[38px] text-[#9999b8] hover:text-white"
          >
            {showKey ? <EyeOff size={18} /> : <Eye size={18} />}
          </button>
        </div>

        <p className="text-xs text-[#5f5f80] mt-2">
          Get your key at: <a href="https://makersuite.google.com/app/apikey" target="_blank" rel="noopener noreferrer" className="text-purple-light hover:underline">makersuite.google.com</a>
        </p>

        <button
          onClick={handleSaveKey}
          disabled={isSavingKey}
          className="btn-primary w-full mt-6 flex items-center justify-center gap-2"
        >
          {isSavingKey ? (
            <>Saving...</>
          ) : (
            <>
              <Save size={18} />
              Save API Key
            </>
          )}
        </button>

        {userGeminiKey && (
          <p className="text-xs text-teal-400 mt-3 flex items-center gap-1">
            <span className="w-2 h-2 bg-teal-400 rounded-full animate-pulse"></span>
            Your personal key is active
          </p>
        )}

        <div className="bg-teal/5 border border-teal/20 rounded-lg p-3 mt-4 text-xs text-teal-400">
          💡 <strong>Tip:</strong> Your key is encrypted and stored securely. It's only used for your projects and never shared with other users.
        </div>
      </div>

      <div className="text-center text-xs text-[#5f5f80] mt-12">
        Forge • Made with ❤️ for fast product building
      </div>
    </div>
  );
}