import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useState, useEffect } from 'react';
import { notificationService } from '../services/dataService';

export default function StudentLayout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [unreadCount, setUnreadCount] = useState(0);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    notificationService.getUnreadCount()
      .then(res => setUnreadCount(res.data.count || 0))
      .catch(() => {});

    const interval = setInterval(() => {
      notificationService.getUnreadCount()
        .then(res => setUnreadCount(res.data.count || 0))
        .catch(() => {});
    }, 30000);
    return () => clearInterval(interval);
  }, []);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const navItems = [
    { path: '/student/dashboard', icon: '📊', label: 'Dashboard' },
    { path: '/student/lab-manuals', icon: '📚', label: 'Lab Manuals' },
    { path: '/student/experiments', icon: '🔬', label: 'Experiments' },
    { path: '/student/submissions', icon: '📝', label: 'My Submissions' },
    { path: '/student/attendance', icon: '📋', label: 'Attendance' },
    { path: '/student/marks', icon: '🏆', label: 'Marks & Feedback' },
    { path: '/student/journal', icon: '📓', label: 'My Lab Journal' },
    { path: '/student/bookmarks', icon: '🔖', label: 'Bookmarks' },
    { path: '/student/enroll', icon: '🎓', label: 'Enroll / Unenroll' },
    { path: '/student/notifications', icon: '🔔', label: 'Notifications' },
    { path: '/student/profile', icon: '👤', label: 'Profile' },
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
          <div className="logo-container" onClick={() => navigate('/student/dashboard')} style={{ cursor: 'pointer' }}>
            <div className="logo-icon-pill">🔬</div>
            <span className="logo-text">DLME</span>
          </div>
          <div className="role-badge role-badge-student">🎓 Student Portal</div>
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
              {item.label === 'Notifications' && unreadCount > 0 && (
                <span className="badge badge-danger sidebar-notif-pill">{unreadCount}</span>
              )}
            </NavLink>
          ))}
        </nav>

        <div className="sidebar-footer">
          <div className="user-profile-summary">
            <div className="user-avatar-sm">
              {user?.fullName?.charAt(0) || 'S'}
            </div>
            <div className="user-info-text">
              <span className="user-name-label">{user?.fullName || 'Student'}</span>
              <span className="user-role-label">Student</span>
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
              <span className="page-greeting">Welcome,</span>
              <h2 className="page-user-name">{user?.fullName || 'Student'}</h2>
            </div>
          </div>

          <div className="navbar-actions">
            <div
              className="notification-bell"
              onClick={() => navigate('/student/notifications')}
              title="Notifications"
            >
              🔔
              {unreadCount > 0 && <span className="notification-badge">{unreadCount}</span>}
            </div>

            <div
              className="user-profile-badge"
              onClick={() => navigate('/student/profile')}
              title="View Profile"
            >
              <div className="user-avatar">{user?.fullName?.charAt(0) || 'S'}</div>
              <span className="user-full-name-chip">{user?.fullName || 'Student'}</span>
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
