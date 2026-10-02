import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
  studentService,
  submissionService,
  subjectService
} from '../../services/dataService';
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Tooltip
} from 'recharts';

export default function FacultyDashboard() {
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [submissions, setSubmissions] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      studentService.getFacultyDashboard().catch(() => ({ data: null })),
      submissionService.getFacultySubmissions().catch(() => ({ data: [] })),
      subjectService.getForFaculty().catch(() => ({ data: [] }))
    ])
      .then(([dashRes, subRes, subjsRes]) => {
        setStats(dashRes.data);
        setSubmissions(subRes.data || []);
        setSubjects(subjsRes.data || []);
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

  // Count submissions by status
  const approvedCount = submissions.filter((s) => s.status === 'APPROVED').length;
  const pendingCount = submissions.filter((s) => s.status === 'SUBMITTED' || s.status === 'UNDER_REVIEW').length;
  const rejectedCount = submissions.filter((s) => s.status === 'REJECTED' || s.status === 'RESUBMIT').length;

  const submissionBreakdown = [
    { name: 'Approved', value: approvedCount, color: '#10b981' },
    { name: 'Pending Review', value: pendingCount, color: '#f59e0b' },
    { name: 'Revision Needed', value: rejectedCount, color: '#ef4444' }
  ].filter(item => item.value > 0);

  const pendingQueue = submissions.filter(
    (s) => s.status === 'SUBMITTED' || s.status === 'UNDER_REVIEW'
  ).slice(0, 5);

  return (
    <div className="dashboard-content-wrapper">
      {/* Welcome Banner */}
      <div className="welcome-banner faculty-banner">
        <div className="welcome-text">
          <h2>Welcome back, {user?.fullName || 'Faculty Member'}! 👨‍🏫</h2>
          <p>
            Monitor lab enrollments, publish new curriculum experiments, and evaluate student submissions in real time.
          </p>
        </div>
        <div className="welcome-meta-pill faculty-meta">
          <span>🏛 Faculty Portal</span>
          <span className="dot-sep">•</span>
          <span>{user?.email}</span>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="stats-grid-enhanced">
        <div className="stat-card-modern">
          <div className="stat-header">
            <span className="stat-title">Enrolled Students</span>
            <div className="stat-icon-pill icon-blue">👥</div>
          </div>
          <div className="stat-number">{stats?.totalStudents || 0}</div>
          <div className="stat-footer">
            <span className="stat-subtext">Active practical candidates</span>
          </div>
        </div>

        <div className="stat-card-modern">
          <div className="stat-header">
            <span className="stat-title">Lab Subjects</span>
            <div className="stat-icon-pill icon-purple">📖</div>
          </div>
          <div className="stat-number">{stats?.totalSubjects || subjects.length || 0}</div>
          <div className="stat-footer">
            <span className="stat-subtext">Assigned course modules</span>
          </div>
        </div>

        <div className="stat-card-modern">
          <div className="stat-header">
            <span className="stat-title">Published Experiments</span>
            <div className="stat-icon-pill icon-orange">🔬</div>
          </div>
          <div className="stat-number">{stats?.totalExperimentsCreated || 0}</div>
          <div className="stat-footer">
            <span className="stat-subtext">Across all active subjects</span>
          </div>
        </div>

        <div className="stat-card-modern alert-stat-card">
          <div className="stat-header">
            <span className="stat-title">Pending Reviews</span>
            <div className="stat-icon-pill icon-red">📝</div>
          </div>
          <div className="stat-number alert-number">{stats?.pendingSubmissionsCount || pendingCount}</div>
          <div className="stat-footer">
            <span className="alert-pulse-badge">Requires your evaluation</span>
          </div>
        </div>
      </div>

      {/* Analytics & Queue Grid */}
      <div className="charts-grid-two">
        {/* Submissions Evaluation Status Breakdown */}
        <div className="dashboard-card">
          <div className="card-header-flex">
            <div>
              <h3>Submissions Breakdown</h3>
              <p className="card-subtitle">Distribution of student submission statuses</p>
            </div>
            <Link to="/faculty/submissions" className="card-action-link">Review All →</Link>
          </div>

          <div className="donut-and-legend-flex" style={{ marginTop: 20 }}>
            {submissionBreakdown.length > 0 ? (
              <>
                <div style={{ width: 170, height: 170 }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={submissionBreakdown}
                        cx="50%"
                        cy="50%"
                        innerRadius={46}
                        outerRadius={70}
                        paddingAngle={4}
                        dataKey="value"
                      >
                        {submissionBreakdown.map((entry, index) => (
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
                    <span className="legend-label">Approved</span>
                    <span className="legend-val">{approvedCount}</span>
                  </div>
                  <div className="legend-row">
                    <span className="legend-indicator" style={{ background: '#f59e0b' }}></span>
                    <span className="legend-label">Pending Review</span>
                    <span className="legend-val">{pendingCount}</span>
                  </div>
                  <div className="legend-row">
                    <span className="legend-indicator" style={{ background: '#ef4444' }}></span>
                    <span className="legend-label">Revision Needed</span>
                    <span className="legend-val">{rejectedCount}</span>
                  </div>
                  <div className="attendance-percentage-badge">
                    Total Records: <strong>{submissions.length}</strong>
                  </div>
                </div>
              </>
            ) : (
              <div className="empty-chart-state" style={{ width: '100%' }}>
                <span>📁</span>
                <p>No student submissions logged yet.</p>
              </div>
            )}
          </div>
        </div>

        {/* Quick Action Hub */}
        <div className="dashboard-card">
          <div className="card-header-flex">
            <div>
              <h3>Faculty Quick Hub</h3>
              <p className="card-subtitle">Manage curriculum, grades, and laboratory sessions</p>
            </div>
          </div>

          <div className="quick-actions-grid" style={{ marginTop: 16 }}>
            <Link to="/faculty/experiments" className="quick-action-card action-primary">
              <span className="qa-icon">🔬</span>
              <div className="qa-info">
                <h4>Manage Experiments</h4>
                <p>Create & publish lab exercises</p>
              </div>
            </Link>
            <Link to="/faculty/submissions" className="quick-action-card action-accent">
              <span className="qa-icon">📝</span>
              <div className="qa-info">
                <h4>Review Submissions</h4>
                <p>Evaluate code & award marks</p>
              </div>
            </Link>
            <Link to="/faculty/subjects" className="quick-action-card action-secondary">
              <span className="qa-icon">📖</span>
              <div className="qa-info">
                <h4>Manage Subjects</h4>
                <p>Configure course lab modules</p>
              </div>
            </Link>
            <Link to="/faculty/attendance" className="quick-action-card action-warning">
              <span className="qa-icon">📋</span>
              <div className="qa-info">
                <h4>Mark Attendance</h4>
                <p>Record practical attendance</p>
              </div>
            </Link>
            <Link to="/faculty/lab-manuals" className="quick-action-card action-info">
              <span className="qa-icon">📚</span>
              <div className="qa-info">
                <h4>Lab Manuals</h4>
                <p>Upload digital syllabus guides</p>
              </div>
            </Link>
            <Link to="/faculty/students" className="quick-action-card action-success">
              <span className="qa-icon">👥</span>
              <div className="qa-info">
                <h4>Student Directory</h4>
                <p>Track student performance metrics</p>
              </div>
            </Link>
          </div>
        </div>
      </div>

      {/* Review Queue Table */}
      <div className="dashboard-card" style={{ marginTop: 24 }}>
        <div className="card-header-flex">
          <div>
            <h3>Urgent Review Queue</h3>
            <p className="card-subtitle">Submissions awaiting your evaluation and grading</p>
          </div>
          <Link to="/faculty/submissions" className="btn btn-primary btn-sm">
            Open Grading Panel →
          </Link>
        </div>

        {pendingQueue.length === 0 ? (
          <div className="empty-feed-state">
            <span>🎉</span>
            <p>All student submissions have been evaluated! No pending items.</p>
          </div>
        ) : (
          <div className="data-table-container" style={{ marginTop: 14 }}>
            <table className="data-table">
              <thead>
                <tr>
                  <th>Student</th>
                  <th>Experiment</th>
                  <th>Subject</th>
                  <th>Submitted At</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {pendingQueue.map((item) => (
                  <tr key={item.id}>
                    <td>
                      <strong>{item.studentName}</strong>
                      <div style={{ fontSize: '.75rem', color: 'var(--text-secondary)' }}>
                        {item.studentRegisterNumber}
                      </div>
                    </td>
                    <td>
                      <strong>#{item.experimentNumber}</strong> {item.experimentTitle}
                    </td>
                    <td>{item.subjectName}</td>
                    <td style={{ fontSize: '.82rem', color: 'var(--text-secondary)' }}>
                      {new Date(item.submittedAt).toLocaleDateString()}
                    </td>
                    <td>
                      <Link to="/faculty/submissions" className="btn btn-accent btn-sm">
                        Grade Now →
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
