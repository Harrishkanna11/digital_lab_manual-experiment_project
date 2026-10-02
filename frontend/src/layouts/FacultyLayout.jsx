import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useState } from 'react';

export default function FacultyLayout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const navItems = [
    { path: '/faculty/dashboard', icon: '📊', label: 'Dashboard' },
    { path: '/faculty/subjects', icon: '📖', label: 'Subjects' },
    { path: '/faculty/lab-manuals', icon: '📚', label: 'Lab Manuals' },
    { path: '/faculty/experiments', icon: '🔬', label: 'Experiments' },
    { path: '/faculty/students', icon: '👥', label: 'Students' },
    { path: '/faculty/submissions', icon: '📝', label: 'Submissions' },
    { path: '/faculty/attendance', icon: '📋', label: 'Attendance' },
    { path: '/faculty/marks', icon: '🏆', label: 'Marks' },
  ];

  return (
    <div className="dashboard-layout">
      {/* Mobile Backdrop */}
      {mobileMenuOpen && (
        <div
          className="sidebar-mobile-backdrop"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={`sidebar ${mobileMenuOpen ? 'sidebar-open' : ''}`}>
        <div className="sidebar-header">
          <div className="logo-container" onClick={() => navigate('/faculty/dashboard')} style={{ cursor: 'pointer' }}>
            <div className="logo-icon-pill">🔬</div>
            <span className="logo-text">DLME</span>
          </div>
          <div className="role-badge role-badge-faculty">🏛 Faculty Portal</div>
        </div>

        <nav className="sidebar-nav">
          {navItems.map(item => (
            <NavLink
              key={item.path}
              to={item.path}
              onClick={() => setMobileMenuOpen(false)}
              className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
            >
              <span className="nav-icon">{item.icon}</span>
              <span className="nav-label">{item.label}</span>
            </NavLink>
          ))}
        </nav>

        <div className="sidebar-footer">
          <div className="user-profile-summary">
            <div className="user-avatar-sm" style={{ background: 'linear-gradient(135deg, #8b5cf6, #6366f1)' }}>
              {user?.fullName?.charAt(0) || 'F'}
            </div>
            <div className="user-info-text">
              <span className="user-name-label">{user?.fullName || 'Faculty'}</span>
              <span className="user-role-label">Faculty Member</span>
            </div>
          </div>
          <button className="nav-item btn-logout-sidebar" onClick={handleLogout}>
            <span className="nav-icon">🚪</span>
            <span>Sign Out</span>
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="main-content">
        <header className="top-navbar">
          <div className="navbar-left">
            <button
              type="button"
              className="mobile-menu-btn"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-label="Toggle navigation"
            >
              ☰
            </button>
            <div className="page-title-group">
              <span className="page-greeting">Faculty Workspace:</span>
              <h2 className="page-user-name">{user?.fullName || 'Faculty Member'}</h2>
            </div>
          </div>

          <div className="navbar-actions">
            <div className="user-profile-badge">
              <div className="user-avatar" style={{ background: 'linear-gradient(135deg, #8b5cf6, #6366f1)' }}>
                {user?.fullName?.charAt(0) || 'F'}
              </div>
              <span className="user-full-name-chip">{user?.fullName || 'Faculty Member'}</span>
            </div>
          </div>
        </header>

        <div className="page-content">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
