import { useState, useEffect } from 'react';
import { submissionService } from '../../services/dataService';

export default function MyLabJournal() {
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    submissionService.getStudentSubmissions().then(res => setSubmissions(res.data)).catch(() => {}).finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="loading-spinner"><div className="spinner"></div></div>;

  return (
    <div>
      <h2 style={{ marginBottom: 24, fontWeight: 800 }}>📓 My Lab Journal</h2>
      <p style={{ color: 'var(--text-secondary)', marginBottom: 24 }}>A consolidated view of your lab work, including all submissions and their review status.</p>

      {submissions.length === 0 ? (
        <div className="empty-state"><div className="empty-icon">📓</div><h3>Your journal is empty</h3><p>Submit experiments to see them here.</p></div>
      ) : (
        <div className="progress-tracker">
          {submissions.map((s, i) => (
            <div key={s.id} className="progress-item" style={{ alignItems: 'flex-start' }}>
              <div className={`progress-dot ${s.status === 'APPROVED' ? 'completed' : s.status === 'SUBMITTED' ? 'pending' : 'not-started'}`}>
                {s.status === 'APPROVED' ? '✓' : i + 1}
              </div>
              <div style={{ flex: 1 }}>
                <div className="progress-label" style={{ fontWeight: 600 }}>#{s.experimentNumber} — {s.experimentTitle}</div>
                <div style={{ fontSize: '.82rem', color: 'var(--text-secondary)', marginTop: 4 }}>{s.subjectName}</div>
                <div style={{ fontSize: '.82rem', color: 'var(--text-light)', marginTop: 2 }}>Submitted: {new Date(s.submittedAt).toLocaleString()}</div>
                {s.feedback && <div style={{ fontSize: '.82rem', color: 'var(--primary)', marginTop: 4 }}>💬 {s.feedback}</div>}
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 4 }}>
                <span className={`badge ${s.status === 'APPROVED' ? 'badge-success' : s.status === 'REJECTED' ? 'badge-danger' : 'badge-warning'}`}>{s.status}</span>
                {s.marks != null && <span style={{ fontSize: '.82rem', fontWeight: 600 }}>{s.marks}/{s.maxMarks}</span>}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
