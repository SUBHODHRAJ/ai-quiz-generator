import { useState, useEffect } from 'react';
import { NavLink, useNavigate, useLocation } from 'react-router-dom';
import {
  Brain,
  LayoutDashboard,
  PlusCircle,
  BookOpen,
  BookMarked,
  Settings,
  LogOut,
  Menu,
  X,
  GraduationCap,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

interface NavItemDef {
  to: string;
  label: string;
  icon: React.ReactNode;
}

const teacherNav: NavItemDef[] = [
  { to: '/teacher/dashboard', label: 'Dashboard',   icon: <LayoutDashboard size={18} /> },
  { to: '/teacher/upload',    label: 'Create Quiz',  icon: <PlusCircle size={18} /> },
  { to: '/teacher/quizzes',   label: 'My Quizzes',   icon: <BookOpen size={18} /> },
];

const studentNav: NavItemDef[] = [
  { to: '/student/dashboard', label: 'Dashboard',  icon: <LayoutDashboard size={18} /> },
  { to: '/student/quizzes',   label: 'Quizzes',    icon: <BookMarked size={18} /> },
];

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Close sidebar on route change (mobile)
  useEffect(() => {
    setSidebarOpen(false);
  }, [location.pathname]);

  // Prevent body scroll when sidebar is open on mobile
  useEffect(() => {
    if (sidebarOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [sidebarOpen]);

  const navItems = user?.role === 'TEACHER' ? teacherNav : studentNav;
  const initials = user?.name
    ? user.name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()
    : '?';

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const SidebarContent = () => (
    <>
      {/* Logo */}
      <div className="sidebar-logo">
        <div className="sidebar-logo-icon">
          <Brain size={20} />
        </div>
        <div>
          <div className="sidebar-logo-text">QuizMind</div>
          <div className="sidebar-logo-tagline">AI-powered learning</div>
        </div>
      </div>

      {/* Nav */}
      <nav className="sidebar-nav">
        <div className="sidebar-section-label">Navigation</div>
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) =>
              `nav-item ${isActive ? 'active' : ''}`
            }
          >
            <span className="nav-item-icon">{item.icon}</span>
            {item.label}
          </NavLink>
        ))}

        <div className="sidebar-section-label" style={{ marginTop: 'var(--sp-4)' }}>Account</div>
        <NavLink
          to="/settings"
          className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
        >
          <span className="nav-item-icon"><Settings size={18} /></span>
          Settings
        </NavLink>
      </nav>

      {/* Footer */}
      <div className="sidebar-footer">
        <div className="sidebar-user">
          <div className="sidebar-user-avatar">{initials}</div>
          <div className="sidebar-user-info">
            <div className="sidebar-user-name">{user?.name || 'User'}</div>
            <div className="sidebar-user-role">
              {user?.role === 'TEACHER' ? (
                <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                  <GraduationCap size={11} /> Teacher
                </span>
              ) : 'Student'}
            </div>
          </div>
        </div>
        <button className="logout-btn" onClick={handleLogout}>
          <LogOut size={18} />
          Logout
        </button>
      </div>
    </>
  );

  return (
    <div className="app-layout">
      {/* Desktop Sidebar */}
      <aside className="sidebar">
        <SidebarContent />
      </aside>

      {/* Mobile Sidebar */}
      {sidebarOpen && (
        <>
          <div
            className="sidebar-overlay"
            onClick={() => setSidebarOpen(false)}
          />
          <aside className="sidebar open">
            <SidebarContent />
          </aside>
        </>
      )}

      {/* Main */}
      <div className="main-content">
        <header className="top-header">
          <button
            className="mobile-menu-btn"
            onClick={() => setSidebarOpen(prev => !prev)}
            aria-label="Toggle menu"
          >
            {sidebarOpen ? <X size={20} /> : <Menu size={20} />}
          </button>

          <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 'var(--sp-3)' }}>
            <div style={{ textAlign: 'right', display: 'flex', flexDirection: 'column' }}>
              <span style={{ fontSize: 'var(--text-sm)', fontWeight: 600, color: 'var(--color-text)' }}>
                {user?.name || 'User'}
              </span>
              <span style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)' }}>
                {user?.email}
              </span>
            </div>
            <div className="sidebar-user-avatar">{initials}</div>
          </div>
        </header>

        <main className="page-content">
          {children}
        </main>
      </div>
    </div>
  );
}
