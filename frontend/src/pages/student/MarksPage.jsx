import { useState, useEffect } from 'react';
import { markService } from '../../services/dataService';

export default function MarksPage() {
  const [marks, setMarks] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    markService.getStudentMarks().then(res => setMarks(res.data)).catch(() => {}).finally(() => setLoading(false));
  }, []);

  const average = marks.length > 0 ? (marks.reduce((a, m) => a + m.percentage, 0) / marks.length).toFixed(1) : 0;

  if (loading) return <div className="loading-spinner"><div className="spinner"></div></div>;

  return (
    <div>
      <h2 style={{ marginBottom: 24, fontWeight: 800 }}>🏆 Marks & Feedback</h2>

      <div className="stats-grid" style={{ marginBottom: 28 }}>
        <div className="stat-card"><div className="stat-value">{marks.length}</div><div className="stat-label">Total Evaluated</div></div>
        <div className="stat-card"><div className="stat-value" style={{ color: 'var(--primary)' }}>{average}%</div><div className="stat-label">Average Score</div></div>
      </div>

      {marks.length === 0 ? (
        <div className="empty-state"><div className="empty-icon">🏆</div><h3>No marks yet</h3><p>Marks will appear after faculty review.</p></div>
      ) : (
        <div className="data-table-container">
          <table className="data-table">
            <thead><tr><th>Experiment</th><th>Marks</th><th>Percentage</th><th>Feedback</th><th>Faculty</th></tr></thead>
            <tbody>
              {marks.map(m => (
                <tr key={m.id}>
                  <td><strong>#{m.experimentNumber}</strong> {m.experimentTitle}</td>
                  <td><strong>{m.marksObtained}/{m.maxMarks}</strong></td>
                  <td><span className={`badge ${m.percentage >= 80 ? 'badge-success' : m.percentage >= 50 ? 'badge-warning' : 'badge-danger'}`}>{m.percentage}%</span></td>
                  <td style={{ maxWidth: 200, fontSize: '.82rem', color: 'var(--text-secondary)' }}>{m.feedback || '-'}</td>
                  <td>{m.givenByFacultyName || '-'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
