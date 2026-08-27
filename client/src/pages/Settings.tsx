import { useState, useEffect } from 'react';
import {
  User,
  Lock,
  Moon,
  Sun,
  Bell,
  CheckCircle,
  AlertCircle,
  Shield,
  Briefcase,
  GraduationCap
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import api from '../services/api';

export default function Settings() {
  const { user, updateUser } = useAuth();
  const toast = useToast();

  // Profile Form State
  const [name, setName] = useState(user?.name || '');
  const [profileLoading, setProfileLoading] = useState(false);
  const [profileSuccess, setProfileSuccess] = useState('');
  const [profileError, setProfileError] = useState('');

  // Password Form State
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [passwordSuccess, setPasswordSuccess] = useState('');
  const [passwordError, setPasswordError] = useState('');

  // Preferences State
  const [theme, setTheme] = useState<'dark' | 'light'>(() => {
    return (localStorage.getItem('quizmind_theme') as 'dark' | 'light') || 'light';
  });
  const [notifications, setNotifications] = useState<boolean>(() => {
    return localStorage.getItem('quizmind_notifications') !== 'false';
  });

  useEffect(() => {
    if (user?.name) {
      setName(user.name);
    }
  }, [user]);

  // Apply theme changes to html element
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('quizmind_theme', theme);
  }, [theme]);

  const handleProfileSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setProfileSuccess('');
    setProfileError('');

    if (!name.trim() || name.trim().length < 2) {
      setProfileError('Name must be at least 2 characters long.');
      return;
    }

    setProfileLoading(true);
    try {
      const res = await api.put('/auth/me', { name: name.trim() });
      updateUser({ name: res.data.data.user.name });
      setProfileSuccess('Profile updated successfully.');
      toast.success('Workspace profile updated.');
    } catch (err: any) {
      const msg = err?.response?.data?.message || 'Failed to update profile. Please try again.';
      setProfileError(msg);
      toast.error(msg);
    } finally {
      setProfileLoading(false);
    }
  };

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordSuccess('');
    setPasswordError('');

    if (!currentPassword) {
      setPasswordError('Current password is required.');
      return;
    }

    if (newPassword.length < 6) {
      setPasswordError('New password must be at least 6 characters long.');
      return;
    }

    if (newPassword !== confirmPassword) {
      setPasswordError('New passwords do not match.');
      return;
    }

    setPasswordLoading(true);
    try {
      await api.put('/auth/password', {
        currentPassword,
        newPassword
      });
      setPasswordSuccess('Password changed successfully.');
      toast.success('Security password updated successfully.');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err: any) {
      const msg = err?.response?.data?.message || 'Failed to change password. Please verify current password.';
      setPasswordError(msg);
      toast.error(msg);
    } finally {
      setPasswordLoading(false);
    }
  };

  const toggleNotifications = () => {
    const next = !notifications;
    setNotifications(next);
    localStorage.setItem('quizmind_notifications', String(next));
    toast.info(next ? 'Assessment notifications enabled.' : 'Notifications muted.');
  };

  return (
    <div className="settings-page" style={{ maxWidth: 860, margin: '0 auto' }}>
      {/* Header */}
      <div className="page-header">
        <div className="page-eyebrow">
          <Shield size={14} /> Account & Workspace Preferences
        </div>
        <h1 className="page-title">Platform Settings</h1>
        <p className="page-subtitle">
          Manage your personal profile, security credentials, and workforce training preferences.
        </p>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--sp-6)' }}>
        {/* ── 1. Profile Section ── */}
        <div className="card" style={{ padding: 'var(--sp-6)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--sp-3)', marginBottom: 'var(--sp-5)' }}>
            <div style={{
              width: 38,
              height: 38,
              borderRadius: 'var(--radius-md)',
              background: 'var(--color-primary-subtle)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'var(--color-primary)'
            }}>
              <User size={20} />
            </div>
            <div>
              <h2 style={{ fontSize: 'var(--text-base)', fontWeight: 700, color: 'var(--color-text)', margin: 0 }}>
                Profile Information
              </h2>
              <p style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)', margin: 0 }}>
                Update your display name and view account privileges
              </p>
            </div>
          </div>

          {profileSuccess && (
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              padding: '10px 14px',
              borderRadius: 'var(--radius-md)',
              background: 'var(--color-success-subtle)',
              border: '1px solid rgba(21, 128, 61, 0.3)',
              color: 'var(--color-success)',
              fontSize: 'var(--text-sm)',
              marginBottom: 'var(--sp-4)'
            }}>
              <CheckCircle size={16} />
              {profileSuccess}
            </div>
          )}

          {profileError && (
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              padding: '10px 14px',
              borderRadius: 'var(--radius-md)',
              background: 'var(--color-danger-subtle)',
              border: '1px solid rgba(185, 28, 28, 0.3)',
              color: 'var(--color-danger)',
              fontSize: 'var(--text-sm)',
              marginBottom: 'var(--sp-4)'
            }}>
              <AlertCircle size={16} />
              {profileError}
            </div>
          )}

          <form onSubmit={handleProfileSubmit}>
            <div className="form-group" style={{ marginBottom: 'var(--sp-4)' }}>
              <label className="form-label">Full Name</label>
              <input
                type="text"
                className="form-input"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Your full name"
                required
              />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 'var(--sp-4)', marginBottom: 'var(--sp-5)' }}>
              <div className="form-group">
                <label className="form-label">Email Address</label>
                <input
                  type="email"
                  className="form-input"
                  value={user?.email || ''}
                  disabled
                  style={{ opacity: 0.7, cursor: 'not-allowed', background: 'var(--color-surface-low)' }}
                />
                <span style={{ fontSize: '11px', color: 'var(--color-text-subtle)', marginTop: 4, display: 'block' }}>
                  Managed by organization administration.
                </span>
              </div>

              <div className="form-group">
                <label className="form-label">Platform Role</label>
                <div style={{
                  height: 42,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8,
                  padding: '0 14px',
                  borderRadius: 'var(--radius-md)',
                  background: 'var(--color-surface-low)',
                  border: '1px solid var(--color-border)',
                  color: 'var(--color-text)',
                  fontSize: 'var(--text-sm)',
                  fontWeight: 600
                }}>
                  {user?.role === 'TEACHER' ? (
                    <>
                      <GraduationCap size={16} style={{ color: 'var(--color-primary)' }} />
                      <span>Trainer / Training Manager</span>
                    </>
                  ) : (
                    <>
                      <Briefcase size={16} style={{ color: 'var(--color-primary)' }} />
                      <span>Learner / Trainee</span>
                    </>
                  )}
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
              <button
                type="submit"
                className="btn btn-primary btn-md"
                disabled={profileLoading || name === user?.name}
                style={{ background: 'var(--color-primary)', color: '#fff' }}
              >
                {profileLoading ? 'Saving...' : 'Save Profile Changes'}
              </button>
            </div>
          </form>
        </div>

        {/* ── 2. Password & Security Section ── */}
        <div className="card" style={{ padding: 'var(--sp-6)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--sp-3)', marginBottom: 'var(--sp-5)' }}>
            <div style={{
              width: 38,
              height: 38,
              borderRadius: 'var(--radius-md)',
              background: 'var(--color-ai-subtle)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'var(--color-ai)'
            }}>
              <Lock size={20} />
            </div>
            <div>
              <h2 style={{ fontSize: 'var(--text-base)', fontWeight: 700, color: 'var(--color-text)', margin: 0 }}>
                Security & Credentials
              </h2>
              <p style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)', margin: 0 }}>
                Update your login password regularly for account security
              </p>
            </div>
          </div>

          {passwordSuccess && (
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              padding: '10px 14px',
              borderRadius: 'var(--radius-md)',
              background: 'var(--color-success-subtle)',
              border: '1px solid rgba(21, 128, 61, 0.3)',
              color: 'var(--color-success)',
              fontSize: 'var(--text-sm)',
              marginBottom: 'var(--sp-4)'
            }}>
              <CheckCircle size={16} />
              {passwordSuccess}
            </div>
          )}

          {passwordError && (
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              padding: '10px 14px',
              borderRadius: 'var(--radius-md)',
              background: 'var(--color-danger-subtle)',
              border: '1px solid rgba(185, 28, 28, 0.3)',
              color: 'var(--color-danger)',
              fontSize: 'var(--text-sm)',
              marginBottom: 'var(--sp-4)'
            }}>
              <AlertCircle size={16} />
              {passwordError}
            </div>
          )}

          <form onSubmit={handlePasswordSubmit}>
            <div className="form-group" style={{ marginBottom: 'var(--sp-4)' }}>
              <label className="form-label">Current Password</label>
              <input
                type="password"
                className="form-input"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                placeholder="Enter current password"
                required
              />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 'var(--sp-4)', marginBottom: 'var(--sp-5)' }}>
              <div className="form-group">
                <label className="form-label">New Password</label>
                <input
                  type="password"
                  className="form-input"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Min 6 characters"
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Confirm New Password</label>
                <input
                  type="password"
                  className="form-input"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Repeat new password"
                  required
                />
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
              <button
                type="submit"
                className="btn btn-primary btn-md"
                disabled={passwordLoading || !currentPassword || !newPassword || !confirmPassword}
                style={{ background: 'var(--color-primary)', color: '#fff' }}
              >
                {passwordLoading ? 'Updating...' : 'Update Password'}
              </button>
            </div>
          </form>
        </div>

        {/* ── 3. App Preferences & Workspace ── */}
        <div className="card" style={{ padding: 'var(--sp-6)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--sp-3)', marginBottom: 'var(--sp-5)' }}>
            <div style={{
              width: 38,
              height: 38,
              borderRadius: 'var(--radius-md)',
              background: 'var(--color-primary-subtle)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'var(--color-primary)'
            }}>
              <Moon size={20} />
            </div>
            <div>
              <h2 style={{ fontSize: 'var(--text-base)', fontWeight: 700, color: 'var(--color-text)', margin: 0 }}>
                Visual & Notification Preferences
              </h2>
              <p style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)', margin: 0 }}>
                Customize visual theme and training notifications
              </p>
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--sp-4)' }}>
            {/* Theme Toggle */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: 'var(--sp-3) var(--sp-4)',
              background: 'var(--color-surface-low)',
              border: '1px solid var(--color-border)',
              borderRadius: 'var(--radius-md)',
            }}>
              <div>
                <div style={{ fontWeight: 700, fontSize: 'var(--text-sm)', color: 'var(--color-text)' }}>
                  Visual Theme
                </div>
                <div style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)' }}>
                  Enterprise Warm Cream (Default) or Dark mode
                </div>
              </div>
              <div style={{ display: 'flex', gap: 6 }}>
                <button
                  type="button"
                  className={`btn btn-sm ${theme === 'light' ? 'btn-primary' : 'btn-ghost'}`}
                  onClick={() => setTheme('light')}
                  style={{ display: 'flex', alignItems: 'center', gap: 6 }}
                >
                  <Sun size={14} /> Warm Cream
                </button>
                <button
                  type="button"
                  className={`btn btn-sm ${theme === 'dark' ? 'btn-primary' : 'btn-ghost'}`}
                  onClick={() => setTheme('dark')}
                  style={{ display: 'flex', alignItems: 'center', gap: 6 }}
                >
                  <Moon size={14} /> Dark
                </button>
              </div>
            </div>

            {/* Notification Toggle */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: 'var(--sp-3) var(--sp-4)',
              background: 'var(--color-surface-low)',
              border: '1px solid var(--color-border)',
              borderRadius: 'var(--radius-md)',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <Bell size={16} style={{ color: 'var(--color-text-muted)' }} />
                <div>
                  <div style={{ fontWeight: 700, fontSize: 'var(--text-sm)', color: 'var(--color-text)' }}>
                    Assessment Notifications
                  </div>
                  <div style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)' }}>
                    Receive real-time alerts when new quizzes are published
                  </div>
                </div>
              </div>
              <button
                type="button"
                className={`btn btn-sm ${notifications ? 'btn-primary' : 'btn-secondary'}`}
                onClick={toggleNotifications}
              >
                {notifications ? 'Enabled' : 'Disabled'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
