import { useState, useEffect } from 'react';
import { attendanceService } from '../../services/dataService';

export default function AttendancePage() {
  const [records, setRecords] = useState([]);
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      attendanceService.getStudentAttendance(),
      attendanceService.getStudentSummary()
    ]).then(([r, s]) => { setRecords(r.data); setSummary(s.data); })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="loading-spinner"><div className="spinner"></div></div>;

  return (
    <div>
      <h2 style={{ marginBottom: 24, fontWeight: 800 }}>📋 Attendance</h2>

      {summary && (
        <div className="stats-grid" style={{ marginBottom: 28 }}>
          <div className="stat-card"><div className="stat-value">{summary.totalSessions}</div><div className="stat-label">Total Sessions</div></div>
          <div className="stat-card"><div className="stat-value" style={{ color: 'var(--success)' }}>{summary.presentSessions}</div><div className="stat-label">Present</div></div>
          <div className="stat-card"><div className="stat-value" style={{ color: 'var(--danger)' }}>{summary.absentSessions}</div><div className="stat-label">Absent</div></div>
          <div className="stat-card"><div className="stat-value" style={{ color: summary.attendancePercentage >= 75 ? 'var(--success)' : 'var(--danger)' }}>{summary.attendancePercentage}%</div><div className="stat-label">Attendance %</div></div>
        </div>
      )}

      {records.length === 0 ? (
        <div className="empty-state"><div className="empty-icon">📋</div><h3>No attendance records</h3><p>Attendance records will appear here.</p></div>
      ) : (
        <div className="data-table-container">
          <table className="data-table">
            <thead><tr><th>Date</th><th>Subject</th><th>Experiment</th><th>Status</th></tr></thead>
            <tbody>
              {records.map(r => (
                <tr key={r.id}>
                  <td>{new Date(r.date).toLocaleDateString()}</td>
                  <td>{r.subjectName}</td>
                  <td>{r.experimentTitle || '-'}</td>
                  <td><span className={`badge ${r.status === 'PRESENT' ? 'badge-success' : r.status === 'ABSENT' ? 'badge-danger' : 'badge-warning'}`}>{r.status}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
