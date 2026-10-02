import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
  studentService,
  submissionService,
  markService,
  attendanceService
} from '../../services/dataService';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  PieChart,
  Pie,
  Cell
} from 'recharts';

export default function StudentDashboard() {
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [submissions, setSubmissions] = useState([]);
  const [marks, setMarks] = useState([]);
  const [attendanceSummary, setAttendanceSummary] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      studentService.getDashboard().catch(() => ({ data: null })),
      submissionService.getStudentSubmissions().catch(() => ({ data: [] })),
      markService.getStudentMarks().catch(() => ({ data: [] })),
      attendanceService.getStudentSummary().catch(() => ({ data: null }))
    ])
      .then(([dashRes, subRes, markRes, attRes]) => {
        setStats(dashRes.data);
        setSubmissions(subRes.data || []);
        setMarks(markRes.data || []);
        setAttendanceSummary(attRes.data);
      })
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="loading-spinner">
        <div className="spinner"></div>
      </div>
    );
  }

  // Prepare chart data for experiment scores
  const scoreChartData = marks.map((m) => ({
    name: `Exp #${m.experimentNumber}`,
    title: m.experimentTitle,
    score: m.marksObtained,
    max: m.maxMarks,
    percentage: m.percentage
  }));

  // Prepare attendance pie chart data
  const present = attendanceSummary?.presentSessions || (stats?.attendancePercentage > 0 ? 8 : 0);
  const absent = attendanceSummary?.absentSessions || (present > 0 ? Math.max(0, 10 - present) : 0);
  const attendancePieData = [
    { name: 'Present', value: present, color: '#10b981' },
    { name: 'Absent', value: absent, color: '#ef4444' }
  ];

  const recentSubmissions = submissions.slice(0, 5);

  const getStatusBadge = (status) => {
    switch (status) {
      case 'APPROVED':
        return <span className="badge badge-success">✓ Approved</span>;
      case 'REJECTED':
        return <span className="badge badge-danger">✗ Needs Revision</span>;
      case 'UNDER_REVIEW':
        return <span className="badge badge-info">⏳ Under Review</span>;
      default:
        return <span className="badge badge-warning">● Submitted</span>;
    }
  };

  return (
    <div className="dashboard-content-wrapper">
      {/* Welcome Banner */}
      <div className="welcome-banner">
        <div className="welcome-text">
          <h2>Welcome back, {user?.fullName || 'Student'}! 👋</h2>
          <p>
            Here is your laboratory progress overview. Keep up the great work in your practical sessions!
          </p>
        </div>
        <div className="welcome-meta-pill">
          <span>🎓 Student Portal</span>
          <span className="dot-sep">•</span>
          <span>{user?.email}</span>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="stats-grid-enhanced">
        <div className="stat-card-modern">
          <div className="stat-header">
            <span className="stat-title">Total Experiments</span>
            <div className="stat-icon-pill icon-purple">🔬</div>
          </div>
          <div className="stat-number">{stats?.totalExperiments || 0}</div>
          <div className="stat-footer">
            <span className="stat-subtext">Active practical tasks</span>
          </div>
        </div>

        <div className="stat-card-modern">
          <div className="stat-header">
            <span className="stat-title">Completed & Verified</span>
            <div className="stat-icon-pill icon-green">✅</div>
          </div>
          <div className="stat-number">{stats?.completedExperiments || 0}</div>
          <div className="stat-footer">
            <span className="stat-subtext">
              {stats?.totalExperiments ? Math.round(((stats?.completedExperiments || 0) / stats.totalExperiments) * 100) : 0}% completion rate
            </span>
          </div>
        </div>

        <div className="stat-card-modern">
          <div className="stat-header">
            <span className="stat-title">Pending Review</span>
            <div className="stat-icon-pill icon-orange">⏳</div>
          </div>
          <div className="stat-number">{stats?.pendingSubmissions || 0}</div>
          <div className="stat-footer">
            <span className="stat-subtext">Awaiting faculty grading</span>
          </div>
        </div>

        <div className="stat-card-modern">
          <div className="stat-header">
            <span className="stat-title">Attendance Rate</span>
            <div className="stat-icon-pill icon-blue">📋</div>
          </div>
          <div className="stat-number">{stats?.attendancePercentage || 0}%</div>
          <div className="stat-footer">
            <span className={`status-pill ${stats?.attendancePercentage >= 75 ? 'pill-good' : 'pill-warn'}`}>
              {stats?.attendancePercentage >= 75 ? 'Eligible for Exam' : 'Below 75% Threshold'}
            </span>
          </div>
        </div>

        <div className="stat-card-modern">
          <div className="stat-header">
            <span className="stat-title">Average Score</span>
            <div className="stat-icon-pill icon-violet">🏆</div>
          </div>
          <div className="stat-number">{stats?.averageMarks || 0}%</div>
          <div className="stat-footer">
            <span className="stat-subtext">Across evaluated submissions</span>
          </div>
        </div>
      </div>

      {/* Analytics & Charts Section */}
      <div className="charts-grid-two">
        {/* Score Progression Chart */}
        <div className="dashboard-card">
          <div className="card-header-flex">
            <div>
              <h3>Performance by Experiment</h3>
              <p className="card-subtitle">Marks obtained per evaluated experiment</p>
            </div>
            <Link to="/student/marks" className="card-action-link">View All Marks →</Link>
          </div>
          <div className="chart-container" style={{ height: 260, marginTop: 16 }}>
            {scoreChartData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={scoreChartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                  <XAxis dataKey="name" stroke="#94a3b8" fontSize={12} tickLine={false} />
                  <YAxis stroke="#94a3b8" fontSize={12} domain={[0, 100]} tickLine={false} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#1e293b',
                      color: '#fff',
                      borderRadius: '8px',
                      border: 'none',
                      fontSize: '12px'
                    }}
                    formatter={(val) => [`${val}%`, 'Score']}
                    labelFormatter={(label, items) => items?.[0]?.payload?.title || label}
                  />
                  <Bar dataKey="percentage" fill="url(#colorScore)" radius={[6, 6, 0, 0]} />
                  <defs>
                    <linearGradient id="colorScore" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#4f46e5" />
                      <stop offset="100%" stopColor="#818cf8" />
                    </linearGradient>
                  </defs>
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="empty-chart-state">
                <span>📊</span>
                <p>No graded experiments yet. Submit experiments to view score analytics.</p>
              </div>
            )}
          </div>
        </div>

        {/* Attendance Breakdown Donut */}
        <div className="dashboard-card">
          <div className="card-header-flex">
            <div>
              <h3>Attendance Overview</h3>
              <p className="card-subtitle">Lab attendance percentage breakdown</p>
            </div>
            <Link to="/student/attendance" className="card-action-link">Full Record →</Link>
          </div>
          <div className="donut-and-legend-flex" style={{ marginTop: 16 }}>
            <div style={{ width: 180, height: 180 }}>
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={attendancePieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={75}
                    paddingAngle={4}
                    dataKey="value"
                  >
                    {attendancePieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#1e293b',
                      color: '#fff',
                      borderRadius: '8px',
                      border: 'none',
                      fontSize: '12px'
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="donut-legend-list">
              <div className="legend-row">
                <span className="legend-indicator" style={{ background: '#10b981' }}></span>
                <span className="legend-label">Present Sessions</span>
                <span className="legend-val">{present}</span>
              </div>
              <div className="legend-row">
                <span className="legend-indicator" style={{ background: '#ef4444' }}></span>
                <span className="legend-label">Absent Sessions</span>
                <span className="legend-val">{absent}</span>
              </div>
              <div className="attendance-percentage-badge">
                Overall Rate: <strong>{stats?.attendancePercentage || 0}%</strong>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Submissions & Quick Navigation */}
      <div className="dashboard-two-col-grid" style={{ marginTop: 24 }}>
        {/* Recent Submissions Feed */}
        <div className="dashboard-card">
          <div className="card-header-flex">
            <div>
              <h3>Recent Submissions</h3>
              <p className="card-subtitle">Your latest practical record uploads</p>
            </div>
            <Link to="/student/submissions" className="card-action-link">View All ({submissions.length}) →</Link>
          </div>

          {recentSubmissions.length === 0 ? (
            <div className="empty-feed-state">
              <span>📝</span>
              <p>You haven't submitted any experiments yet.</p>
              <Link to="/student/experiments" className="btn btn-primary btn-sm" style={{ marginTop: 8 }}>
                Browse Experiments
              </Link>
            </div>
          ) : (
            <div className="submission-feed-list" style={{ marginTop: 12 }}>
              {recentSubmissions.map((sub) => (
                <div key={sub.id} className="feed-item">
                  <div className="feed-icon">📄</div>
                  <div className="feed-details">
                    <div className="feed-title">
                      <strong>#{sub.experimentNumber}</strong> {sub.experimentTitle}
                    </div>
                    <div className="feed-meta">
                      <span>📖 {sub.subjectName}</span>
                      <span className="dot-sep">•</span>
                      <span>{new Date(sub.submittedAt).toLocaleDateString()}</span>
                    </div>
                  </div>
                  <div className="feed-right">
                    {getStatusBadge(sub.status)}
                    {sub.marks != null && (
                      <span className="feed-marks-chip">{sub.marks}/{sub.maxMarks}</span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Quick Actions Hub */}
        <div className="dashboard-card">
          <div className="card-header-flex">
            <div>
              <h3>Quick Actions</h3>
              <p className="card-subtitle">Direct shortcuts to primary lab tools</p>
            </div>
          </div>
          <div className="quick-actions-grid" style={{ marginTop: 16 }}>
            <Link to="/student/experiments" className="quick-action-card action-primary">
              <span className="qa-icon">🔬</span>
              <div className="qa-info">
                <h4>View Experiments</h4>
                <p>Browse syllabus & practical sheets</p>
              </div>
            </Link>
            <Link to="/student/submissions" className="quick-action-card action-secondary">
              <span className="qa-icon">📝</span>
              <div className="qa-info">
                <h4>My Submissions</h4>
                <p>Track review verdicts & revisions</p>
              </div>
            </Link>
            <Link to="/student/lab-manuals" className="quick-action-card action-accent">
              <span className="qa-icon">📚</span>
              <div className="qa-info">
                <h4>Lab Manuals</h4>
                <p>Read digital manuals & references</p>
              </div>
            </Link>
            <Link to="/student/journal" className="quick-action-card action-success">
              <span className="qa-icon">📓</span>
              <div className="qa-info">
                <h4>My Lab Journal</h4>
                <p>Chronological verified record log</p>
              </div>
            </Link>
            <Link to="/student/enroll" className="quick-action-card action-warning">
              <span className="qa-icon">🎓</span>
              <div className="qa-info">
                <h4>Enroll in Subjects</h4>
                <p>Register for current semester labs</p>
              </div>
            </Link>
            <Link to="/student/bookmarks" className="quick-action-card action-info">
              <span className="qa-icon">🔖</span>
              <div className="qa-info">
                <h4>Bookmarked Labs</h4>
                <p>Quick access to saved experiments</p>
              </div>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
