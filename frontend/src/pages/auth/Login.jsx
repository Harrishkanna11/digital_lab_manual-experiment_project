import { useState, useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import toast from 'react-hot-toast';

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const roleParam = searchParams.get('role');

  const [form, setForm] = useState({
    email: roleParam === 'faculty' ? 'faculty@digitallab.edu' : 'student@digitallab.edu',
    password: 'password123'
  });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState(roleParam === 'faculty' ? 'FACULTY' : 'STUDENT');

  useEffect(() => {
    if (roleParam === 'faculty') {
      setActiveTab('FACULTY');
      setForm({ email: 'faculty@digitallab.edu', password: 'password123' });
    } else if (roleParam === 'student') {
      setActiveTab('STUDENT');
      setForm({ email: 'student@digitallab.edu', password: 'password123' });
    }
  }, [roleParam]);

  const handleTabSwitch = (role) => {
    setActiveTab(role);
    if (role === 'STUDENT') {
      setForm({ email: 'student@digitallab.edu', password: 'password123' });
    } else {
      setForm({ email: 'faculty@digitallab.edu', password: 'password123' });
    }
  };

  const handleQuickLogin = async (email, password) => {
    setLoading(true);
    try {
      const user = await login({ email, password });
      toast.success(`Welcome back, ${user.fullName || user.email}!`);
      navigate(user.role === 'STUDENT' ? '/student/dashboard' : '/faculty/dashboard');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Quick login failed. Check backend connection.');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const user = await login(form);
      toast.success(`Welcome back, ${user.fullName || user.email}!`);
      navigate(user.role === 'STUDENT' ? '/student/dashboard' : '/faculty/dashboard');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Invalid email or password');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card enhanced-auth-card">
        <Link to="/" className="auth-logo-link">
          <div className="logo-icon-pill">🔬</div>
          <span className="logo-text">DLME</span>
        </Link>
        <h1>Welcome Back</h1>
        <p className="auth-subtitle">Sign in to your digital laboratory workspace</p>

        {/* Role Selection Tabs */}
        <div className="auth-tabs role-selector-tabs">
          <button
            type="button"
            className={`auth-tab ${activeTab === 'STUDENT' ? 'active' : ''}`}
            onClick={() => handleTabSwitch('STUDENT')}
          >
            🎓 Student Portal
          </button>
          <button
            type="button"
            className={`auth-tab ${activeTab === 'FACULTY' ? 'active' : ''}`}
            onClick={() => handleTabSwitch('FACULTY')}
          >
            👨‍🏫 Faculty Portal
          </button>
        </div>

        {/* Quick 1-Click Demo Login Box */}
        <div className="demo-credentials-box">
          <div className="demo-header">
            <span className="demo-pill">⚡ 1-Click Demo Access</span>
            <span className="demo-hint">No typing required</span>
          </div>
          <div className="demo-buttons-row">
            <button
              type="button"
              className={`demo-btn ${activeTab === 'STUDENT' ? 'demo-btn-active' : ''}`}
              onClick={() => handleQuickLogin('student@digitallab.edu', 'password123')}
              disabled={loading}
            >
              <span className="demo-btn-role">Student</span>
              <span className="demo-btn-name">Ada Lovelace</span>
            </button>
            <button
              type="button"
              className={`demo-btn ${activeTab === 'FACULTY' ? 'demo-btn-active' : ''}`}
              onClick={() => handleQuickLogin('faculty@digitallab.edu', 'password123')}
              disabled={loading}
            >
              <span className="demo-btn-role">Faculty</span>
              <span className="demo-btn-name">Dr. Alan Turing</span>
            </button>
          </div>
        </div>

        <div className="auth-divider">
          <span>or sign in manually</span>
        </div>

        <form onSubmit={handleSubmit} className="auth-form">
          <div className="form-group">
            <label>Email Address</label>
            <div className="input-with-icon">
              <span className="input-icon">✉️</span>
              <input
                type="email"
                className="form-control"
                placeholder="e.g. user@digitallab.edu"
                value={form.email}
                onChange={e => setForm({...form, email: e.target.value})}
                required
              />
            </div>
          </div>

          <div className="form-group">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <label>Password</label>
              <button
                type="button"
                className="toggle-password-btn"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? 'Hide' : 'Show'}
              </button>
            </div>
            <div className="input-with-icon">
              <span className="input-icon">🔒</span>
              <input
                type={showPassword ? 'text' : 'password'}
                className="form-control"
                placeholder="Enter password"
                value={form.password}
                onChange={e => setForm({...form, password: e.target.value})}
                required
              />
            </div>
          </div>

          <button
            type="submit"
            className="btn btn-primary btn-submit-auth"
            disabled={loading}
          >
            {loading ? (
              <span className="btn-loading-content">
                <span className="mini-spinner"></span> Authenticating...
              </span>
            ) : (
              `Sign In as ${activeTab === 'STUDENT' ? 'Student' : 'Faculty'} →`
            )}
          </button>
        </form>

        <div className="auth-footer">
          Don't have an account? <Link to="/register">Create new account</Link>
        </div>
      </div>
    </div>
  );
}
