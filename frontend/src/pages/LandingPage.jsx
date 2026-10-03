import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

const features = [
  {
    icon: '📚',
    title: 'Digital Lab Manuals',
    desc: 'Access comprehensive curriculum manuals digitally. View experiments, procedures, viva questions, and reference materials anytime, anywhere.',
    tag: 'Curriculum'
  },
  {
    icon: '🔬',
    title: 'Interactive Experiments',
    desc: 'Browse categorized experiments by subject with clear aims, theory, sample code, expected outputs, and estimated duration.',
    tag: 'Hands-on'
  },
  {
    icon: '📤',
    title: 'Paperless Submissions',
    desc: 'Submit experiment observations and code directly online. Track live review verdicts with status badges (Submitted, Approved, Resubmit).',
    tag: 'Workflow'
  },
  {
    icon: '📋',
    title: 'Smart Attendance Tracking',
    desc: 'Automated attendance logging per session and subject. Monitor attendance percentage and history with automated thresholds.',
    tag: 'Accountability'
  },
  {
    icon: '🏆',
    title: 'Instant Marks & Feedback',
    desc: 'Receive transparent grades and line-by-line feedback from faculty. Track performance metrics across semesters and labs.',
    tag: 'Evaluation'
  },
  {
    icon: '📊',
    title: 'Visual Analytics & Journal',
    desc: 'Dynamic charts and comprehensive lab journal timelines for both student portfolios and faculty gradebook analytics.',
    tag: 'Insights'
  },
];

const workflowSteps = [
  {
    step: '01',
    title: 'Lab & Subject Setup',
    role: 'Faculty',
    desc: 'Faculty creates subjects, attaches digital lab manuals, and publishes detailed experiments with viva questions.'
  },
  {
    step: '02',
    title: 'Enroll & Execute',
    role: 'Student',
    desc: 'Students enroll in relevant lab subjects, view procedures, execute experiments, and submit results & code.'
  },
  {
    step: '03',
    title: 'Grading & Live Journal',
    role: 'Both',
    desc: 'Faculty grades submissions with marks and actionable feedback, while the student lab journal updates automatically.'
  }
];

export default function LandingPage() {
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleQuickDemo = async (email, password, role) => {
    try {
      const user = await login({ email, password });
      toast.success(`Logged in as ${user.fullName}!`);
      navigate(role === 'STUDENT' ? '/student/dashboard' : '/faculty/dashboard');
    } catch {
      toast.error('Quick login failed. Ensure backend is running.');
      navigate(`/login?role=${role.toLowerCase()}`);
    }
  };

  return (
    <div className="landing-page">
      {/* Navigation */}
      <nav className="landing-nav glass-nav">
        <div className="logo-container">
          <div className="logo-icon-pill">🔬</div>
          <span className="logo-text">DLME</span>
          <span className="logo-badge">v2.0</span>
        </div>
        <div className="nav-links">
          <a href="#home">Home</a>
          <a href="#features">Features</a>
          <a href="#workflow">Workflow</a>
          <a href="#about">About</a>
        </div>
        <div className="nav-actions">
          <Link to="/login" className="btn btn-secondary btn-nav">Sign In</Link>
          <Link to="/register" className="btn btn-primary btn-nav">Register Free →</Link>
        </div>
      </nav>

      {/* Hero Section */}
      <section id="home" className="hero-modern">
        <div className="hero-glow-sphere"></div>
        <div className="hero-content">
          <div className="hero-badge-pill">
            <span className="badge-pulse-dot"></span>
            Next-Gen Digital Lab & Experiment Management Platform
          </div>

          <h1 className="hero-title">
            Transform Your Engineering Labs Into A{' '}
            <span className="gradient-text">Modern Digital Hub</span>
          </h1>

          <p className="hero-description">
            Say goodbye to paper records and physical lab manuals. Access rich syllabi, submit code and observations online, track attendance, and receive instant faculty feedback in real time.
          </p>

          {/* Quick Demo Launchers */}
          <div className="hero-cta-group">
            <Link to="/register" className="btn btn-primary btn-xl">
              Get Started Now →
            </Link>
            <div className="quick-demo-container">
              <span className="demo-label">Instant Demo Access:</span>
              <button
                type="button"
                className="btn btn-demo-student"
                onClick={() => handleQuickDemo('student@digitallab.edu', 'password123', 'STUDENT')}
              >
                🎓 Student Portal
              </button>
              <button
                type="button"
                className="btn btn-demo-faculty"
                onClick={() => handleQuickDemo('faculty@digitallab.edu', 'password123', 'FACULTY')}
              >
                👨‍🏫 Faculty Portal
              </button>
            </div>
          </div>

          {/* Key Metrics Strip */}
          <div className="metrics-strip">
            <div className="metric-item">
              <div className="metric-number">100%</div>
              <div className="metric-text">Paperless Records</div>
            </div>
            <div className="metric-divider"></div>
            <div className="metric-item">
              <div className="metric-number">Real-Time</div>
              <div className="metric-text">Faculty Evaluation</div>
            </div>
            <div className="metric-divider"></div>
            <div className="metric-item">
              <div className="metric-number">Automatic</div>
              <div className="metric-text">Journal & Marks Sync</div>
            </div>
            <div className="metric-divider"></div>
            <div className="metric-item">
              <div className="metric-number">Role-Based</div>
              <div className="metric-text">Secure Portals</div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="features-section-modern">
        <div className="section-header">
          <div className="section-subtitle">PLATFORM CAPABILITIES</div>
          <h2>Designed for Academia, Built for Engineers</h2>
          <p>Everything students and faculty need to manage practical coursework effortlessly.</p>
        </div>

        <div className="features-grid-modern">
          {features.map((f, i) => (
            <div key={i} className="feature-card-modern">
              <div className="card-tag">{f.tag}</div>
              <div className="feature-icon-wrapper">{f.icon}</div>
              <h3>{f.title}</h3>
              <p>{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* How It Works / Workflow Section */}
      <section id="workflow" className="workflow-section">
        <div className="section-header">
          <div className="section-subtitle">HOW IT WORKS</div>
          <h2>Seamless 3-Step Practical Lifecycle</h2>
          <p>Connecting students and faculty from day one of the semester to final viva examinations.</p>
        </div>

        <div className="workflow-grid">
          {workflowSteps.map((step, idx) => (
            <div key={idx} className="workflow-card">
              <div className="workflow-step-num">{step.step}</div>
              <span className="workflow-role-pill">{step.role}</span>
              <h3>{step.title}</h3>
              <p>{step.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* About Section */}
      <section id="about" className="about-section-modern">
        <div className="about-card-modern">
          <div className="about-badge">🏛 Academic Excellence</div>
          <h2>Built for Colleges, Universities & Research Labs</h2>
          <p>
            The Digital Lab Manual & Experiment Management System (DLME) bridges the gap between laboratory coursework and modern software tooling. Backed by Spring Boot 3, Java 17, JPA, and a responsive React frontend, it powers reliable laboratory execution, seamless plagiarism-aware submissions, and transparent grading.
          </p>
          <div className="about-actions">
            <Link to="/login?role=student" className="btn btn-primary">Try Student Experience</Link>
            <Link to="/login?role=faculty" className="btn btn-secondary">Try Faculty Experience</Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="landing-footer-modern">
        <div className="footer-content">
          <div className="footer-brand">
            <div className="logo-container">
              <div className="logo-icon-pill">🔬</div>
              <span className="logo-text">DLME</span>
            </div>
            <p>Digital Laboratory Manual and Experiment Management System</p>
          </div>
          <div className="footer-links">
            <div className="footer-col">
              <h4>Portals</h4>
              <Link to="/login?role=student">Student Portal</Link>
              <Link to="/login?role=faculty">Faculty Portal</Link>
              <Link to="/register">Create Account</Link>
            </div>
            <div className="footer-col">
              <h4>System</h4>
              <a href="#features">Features</a>
              <a href="#workflow">Workflow</a>
              <a href="#about">Architecture</a>
            </div>
          </div>
        </div>
        <div className="footer-bottom">
          <p>© 2024-2026 DLME. All rights reserved. Designed for digital education.</p>
        </div>
      </footer>
    </div>
  );
}
