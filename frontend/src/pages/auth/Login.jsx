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
    email: '',
    password: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState(roleParam === 'faculty' ? 'FACULTY' : 'STUDENT');

  useEffect(() => {
    if (roleParam === 'faculty') {
      setActiveTab('FACULTY');
    } else if (roleParam === 'student') {
      setActiveTab('STUDENT');
    }
  }, [roleParam]);

  const handleTabSwitch = (role) => {
    setActiveTab(role);
    setForm({ email: '', password: '' });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const user = await login(form, activeTab);
      toast.success(`Welcome back, ${user.fullName || (user.role === 'STUDENT' ? 'Student' : 'Faculty')}!`);
      navigate(user.role === 'STUDENT' ? '/student/dashboard' : '/faculty/dashboard');
    } catch (err) {
      toast.error(err.message || err.response?.data?.message || 'Invalid email or password');
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

        <form onSubmit={handleSubmit} className="auth-form" autoComplete="off">
          <div className="form-group">
            <label htmlFor="login-email">Email Address</label>
            <div className="input-with-icon">
              <span className="input-icon">✉️</span>
              <input
                type="email"
                id="login-email"
                name="login-email"
                className="form-control"
                placeholder="e.g. user@digitallab.edu"
                value={form.email}
                onChange={e => setForm({...form, email: e.target.value})}
                autoComplete="off"
                required
              />
            </div>
          </div>

          <div className="form-group">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <label htmlFor="login-password">Password</label>
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
                id="login-password"
                name="login-password"
                className="form-control"
                placeholder="Enter password"
                value={form.password}
                onChange={e => setForm({...form, password: e.target.value})}
                autoComplete="new-password"
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
