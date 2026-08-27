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
import api from '../services/api';

export default function Settings() {
  const { user, updateUser } = useAuth();

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
    return (localStorage.getItem('quizmind_theme') as 'dark' | 'light') || 'dark';
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
    } catch (err: any) {
      setProfileError(
        err?.response?.data?.message || 'Failed to update profile. Please try again.'
      );
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
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err: any) {
      setPasswordError(
        err?.response?.data?.message || 'Failed to change password. Please verify current password.'
      );
    } finally {
      setPasswordLoading(false);
    }
  };

  const toggleNotifications = () => {
    const next = !notifications;
    setNotifications(next);
    localStorage.setItem('quizmind_notifications', String(next));
  };

  return (
    <div className="settings-page" style={{ maxWidth: 860, margin: '0 auto' }}>
      {/* Header */}
      <div className="page-header">
        <div className="page-eyebrow">
          <Shield size={14} />
          Account & Preferences
        </div>
        <h1 className="page-title">Settings</h1>
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
              background: 'rgba(99, 102, 241, 0.15)',
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
                Update your display name and view account details
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
              background: 'rgba(16, 185, 129, 0.12)',
              border: '1px solid rgba(16, 185, 129, 0.3)',
              color: '#34d399',
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
              background: 'rgba(239, 68, 68, 0.12)',
              border: '1px solid rgba(239, 68, 68, 0.3)',
              color: '#f87171',
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
                  style={{ opacity: 0.7, cursor: 'not-allowed', background: 'var(--color-surface-mid)' }}
                />
                <span style={{ fontSize: '11px', color: 'var(--color-text-subtle)', marginTop: 4, display: 'block' }}>
                  Email cannot be modified directly.
                </span>
              </div>

              <div className="form-group">
                <label className="form-label">Assigned Role</label>
                <div style={{
                  height: 42,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8,
                  padding: '0 14px',
                  borderRadius: 'var(--radius-md)',
                  background: 'var(--color-surface-mid)',
                  border: '1px solid var(--color-border)',
                  color: 'var(--color-text)',
                  fontSize: 'var(--text-sm)',
                  fontWeight: 600
                }}>
                  {user?.role === 'TEACHER' ? (
                    <>
                      <GraduationCap size={16} style={{ color: 'var(--color-primary)' }} />
                      <span>Teacher / Training Manager</span>
                    </>
                  ) : (
                    <>
                      <Briefcase size={16} style={{ color: 'var(--color-success)' }} />
                      <span>Student / Trainee</span>
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
              background: 'rgba(236, 72, 153, 0.15)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#ec4899'
            }}>
              <Lock size={20} />
            </div>
            <div>
              <h2 style={{ fontSize: 'var(--text-base)', fontWeight: 700, color: 'var(--color-text)', margin: 0 }}>
                Security & Password
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
              background: 'rgba(16, 185, 129, 0.12)',
              border: '1px solid rgba(16, 185, 129, 0.3)',
              color: '#34d399',
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
              background: 'rgba(239, 68, 68, 0.12)',
              border: '1px solid rgba(239, 68, 68, 0.3)',
              color: '#f87171',
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
              background: 'rgba(59, 130, 246, 0.15)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#3b82f6'
            }}>
              <Moon size={20} />
            </div>
            <div>
              <h2 style={{ fontSize: 'var(--text-base)', fontWeight: 700, color: 'var(--color-text)', margin: 0 }}>
                Application Preferences
              </h2>
              <p style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)', margin: 0 }}>
                Customize visual theme and notifications
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
              background: 'var(--color-surface-mid)',
              border: '1px solid var(--color-border)',
              borderRadius: 'var(--radius-md)',
            }}>
              <div>
                <div style={{ fontWeight: 600, fontSize: 'var(--text-sm)', color: 'var(--color-text)' }}>
                  Interface Theme
                </div>
                <div style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)' }}>
                  Switch between Dark (Neural Navy) and Light mode
                </div>
              </div>
              <div style={{ display: 'flex', gap: 6 }}>
                <button
                  type="button"
                  className={`btn btn-sm ${theme === 'dark' ? 'btn-primary' : 'btn-ghost'}`}
                  onClick={() => setTheme('dark')}
                  style={{ display: 'flex', alignItems: 'center', gap: 6 }}
                >
                  <Moon size={14} /> Dark
                </button>
                <button
                  type="button"
                  className={`btn btn-sm ${theme === 'light' ? 'btn-primary' : 'btn-ghost'}`}
                  onClick={() => setTheme('light')}
                  style={{ display: 'flex', alignItems: 'center', gap: 6 }}
                >
                  <Sun size={14} /> Light
                </button>
              </div>
            </div>

            {/* Notification Toggle */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: 'var(--sp-3) var(--sp-4)',
              background: 'var(--color-surface-mid)',
              border: '1px solid var(--color-border)',
              borderRadius: 'var(--radius-md)',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <Bell size={16} style={{ color: 'var(--color-text-muted)' }} />
                <div>
                  <div style={{ fontWeight: 600, fontSize: 'var(--text-sm)', color: 'var(--color-text)' }}>
                    Assessment Notifications
                  </div>
                  <div style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)' }}>
                    Receive alerts when new quizzes are published
                  </div>
                </div>
              </div>
              <button
                type="button"
                className={`btn btn-sm ${notifications ? 'btn-primary' : 'btn-ghost'}`}
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
