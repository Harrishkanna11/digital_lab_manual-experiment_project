import { useState, useEffect } from 'react';
import { attendanceService } from '../../services/dataService';

export default function AttendancePage() {
  const [records, setRecords] = useState([]);
  const [summary, setSummary] = useState(null);
  const [subjectSummaries, setSubjectSummaries] = useState([]);
  const [selectedSubjectFilter, setSelectedSubjectFilter] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      attendanceService.getStudentAttendance().catch(() => ({ data: [] })),
      attendanceService.getStudentSummary().catch(() => ({ data: null })),
      attendanceService.getStudentSubjectSummary().catch(() => ({ data: [] }))
    ])
      .then(([r, s, sub]) => {
        setRecords(r.data || []);
        setSummary(s.data || null);
        setSubjectSummaries(sub.data || []);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="loading-spinner"><div className="spinner"></div></div>;

  const filteredRecords = selectedSubjectFilter
    ? records.filter(r => String(r.subjectId) === String(selectedSubjectFilter))
    : records;

  return (
    <div>
      <h2 style={{ marginBottom: 24, fontWeight: 800 }}>📋 My Attendance</h2>

      {/* Overall Summary Cards */}
      {summary && (
        <div className="stats-grid" style={{ marginBottom: 28 }}>
          <div className="stat-card">
            <div className="stat-value">{summary.totalSessions}</div>
            <div className="stat-label">Total Sessions</div>
          </div>
          <div className="stat-card">
            <div className="stat-value" style={{ color: 'var(--success)' }}>{summary.presentSessions}</div>
            <div className="stat-label">Present</div>
          </div>
          <div className="stat-card">
            <div className="stat-value" style={{ color: 'var(--danger)' }}>{summary.absentSessions}</div>
            <div className="stat-label">Absent</div>
          </div>
          <div className="stat-card">
            <div
              className="stat-value"
              style={{ color: summary.attendancePercentage >= 75 ? 'var(--success)' : 'var(--danger)' }}
            >
              {summary.attendancePercentage}%
            </div>
            <div className="stat-label">Overall Attendance</div>
          </div>
        </div>
      )}

      {/* Per-Subject Breakdown Table */}
      <div style={{ marginBottom: 32 }}>
        <h3 style={{ marginBottom: 16, fontWeight: 700 }}>📚 Subject-wise Attendance</h3>
        {subjectSummaries.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">📚</div>
            <h3>No enrolled subjects found</h3>
            <p>Subject attendance details will appear here once you are enrolled.</p>
          </div>
        ) : (
          <div className="data-table-container">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Course Code</th>
                  <th>Subject Name</th>
                  <th>Total Classes</th>
                  <th>Present</th>
                  <th>Absent</th>
                  <th>Attendance %</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {subjectSummaries.map(sub => {
                  const isEligible = sub.attendancePercentage >= 75;
                  return (
                    <tr key={sub.subjectId}>
                      <td><strong>{sub.courseCode}</strong></td>
                      <td>{sub.subjectName}</td>
                      <td>{sub.totalClasses}</td>
                      <td style={{ color: 'var(--success)', fontWeight: 600 }}>{sub.presentCount}</td>
                      <td style={{ color: 'var(--danger)', fontWeight: 600 }}>{sub.absentCount}</td>
                      <td>
                        <span
                          style={{
                            fontWeight: 700,
                            color: sub.totalClasses === 0 ? 'inherit' : isEligible ? 'var(--success)' : 'var(--danger)'
                          }}
                        >
                          {sub.totalClasses > 0 ? `${sub.attendancePercentage}%` : 'N/A'}
                        </span>
                      </td>
                      <td>
                        {sub.totalClasses === 0 ? (
                          <span className="badge badge-secondary">No Classes</span>
                        ) : isEligible ? (
                          <span className="badge badge-success">Eligible (≥75%)</span>
                        ) : (
                          <span className="badge badge-danger">Shortage (&lt;75%)</span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Detailed Session History */}
      <div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16, flexWrap: 'wrap', gap: 12 }}>
          <h3 style={{ fontWeight: 700 }}>📅 Attendance History</h3>
          {subjectSummaries.length > 0 && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <label style={{ fontSize: '.85rem', fontWeight: 600 }}>Filter by Subject:</label>
              <select
                className="form-control"
                style={{ width: 220 }}
                value={selectedSubjectFilter}
                onChange={e => setSelectedSubjectFilter(e.target.value)}
              >
                <option value="">All Subjects</option>
                {subjectSummaries.map(s => (
                  <option key={s.subjectId} value={s.subjectId}>{s.courseCode} - {s.subjectName}</option>
                ))}
              </select>
            </div>
          )}
        </div>

        {filteredRecords.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">📋</div>
            <h3>No attendance records</h3>
            <p>Individual class attendance sessions will appear here once marked by faculty.</p>
          </div>
        ) : (
          <div className="data-table-container">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Subject</th>
                  <th>Experiment</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {filteredRecords.map(r => (
                  <tr key={r.id}>
                    <td>{new Date(r.date).toLocaleDateString()}</td>
                    <td>{r.subjectName}</td>
                    <td>{r.experimentTitle || '-'}</td>
                    <td>
                      <span className={`badge ${r.status === 'PRESENT' ? 'badge-success' : 'badge-danger'}`}>
                        {r.status}
                      </span>
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
