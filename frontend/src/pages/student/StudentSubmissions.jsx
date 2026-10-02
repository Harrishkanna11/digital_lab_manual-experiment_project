import { useState, useEffect } from 'react';
import { submissionService } from '../../services/dataService';
import toast from 'react-hot-toast';

export default function StudentSubmissions() {
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('ALL');
  const [selectedSub, setSelectedSub] = useState(null);

  useEffect(() => {
    submissionService.getStudentSubmissions()
      .then(res => setSubmissions(res.data || []))
      .catch(() => toast.error('Failed to load submissions'))
      .finally(() => setLoading(false));
  }, []);

  const filtered = filter === 'ALL' ? submissions : submissions.filter(s => s.status === filter);

  if (loading) return <div className="loading-spinner"><div className="spinner"></div></div>;

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24, flexWrap: 'wrap', gap: 12 }}>
        <h2 style={{ fontWeight: 800 }}>📝 My Lab Submissions</h2>
        <div className="filter-bar">
          {['ALL', 'SUBMITTED', 'UNDER_REVIEW', 'APPROVED', 'REJECTED'].map(f => (
            <button
              key={f}
              className={`filter-item ${filter === f ? 'active' : ''}`}
              onClick={() => setFilter(f)}
            >
              {f === 'ALL' ? 'All' : f.replace('_', ' ')}
            </button>
          ))}
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">📝</div>
          <h3>No submissions matching this filter</h3>
          <p>Submit experiments from the Experiments page to track your practical evaluations.</p>
        </div>
      ) : (
        <div className="data-table-container">
          <table className="data-table">
            <thead>
              <tr>
                <th>Experiment</th>
                <th>Subject</th>
                <th>Status</th>
                <th>Marks</th>
                <th>Submitted</th>
                <th>Feedback</th>
                <th>Details</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(s => (
                <tr key={s.id}>
                  <td>
                    <strong>#{s.experimentNumber}</strong> {s.experimentTitle}
                  </td>
                  <td>{s.subjectName}</td>
                  <td>
                    <span className={`badge ${
                      s.status === 'APPROVED' ? 'badge-success' :
                      s.status === 'REJECTED' ? 'badge-danger' :
                      s.status === 'SUBMITTED' ? 'badge-warning' : 'badge-info'
                    }`}>
                      {s.status}
                    </span>
                  </td>
                  <td>
                    {s.marks != null ? (
                      <span className="marks-badge">{s.marks}/{s.maxMarks}</span>
                    ) : (
                      <span style={{ color: 'var(--text-light)' }}>Pending</span>
                    )}
                  </td>
                  <td style={{ fontSize: '.82rem', color: 'var(--text-secondary)' }}>
                    {new Date(s.submittedAt).toLocaleDateString()}
                  </td>
                  <td style={{ maxWidth: 220, fontSize: '.82rem', color: 'var(--text-secondary)' }}>
                    {s.feedback || <span style={{ color: 'var(--text-light)' }}>-</span>}
                  </td>
                  <td>
                    <button
                      className="btn btn-secondary btn-sm"
                      onClick={() => setSelectedSub(s)}
                    >
                      View Code & Details
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Submission Detail Modal */}
      {selectedSub && (
        <div className="modal-backdrop" onClick={() => setSelectedSub(null)}>
          <div className="modal-dialog modal-lg" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <div>
                <h3>#{selectedSub.experimentNumber} - {selectedSub.experimentTitle}</h3>
                <span style={{ fontSize: '.85rem', color: 'var(--text-secondary)' }}>
                  Subject: {selectedSub.subjectName} | Submitted: {new Date(selectedSub.submittedAt).toLocaleString()}
                </span>
              </div>
              <button className="modal-close-btn" onClick={() => setSelectedSub(null)}>✕</button>
            </div>
            <div className="modal-body">
              <div className="submission-meta-strip">
                <div>
                  <span className="meta-label">Evaluation Verdict:</span>
                  <span className={`badge ${selectedSub.status === 'APPROVED' ? 'badge-success' : selectedSub.status === 'REJECTED' ? 'badge-danger' : 'badge-warning'}`}>
                    {selectedSub.status}
                  </span>
                </div>
                <div>
                  <span className="meta-label">Marks Awarded:</span>
                  <strong>{selectedSub.marks != null ? `${selectedSub.marks} / ${selectedSub.maxMarks}` : 'Not evaluated yet'}</strong>
                </div>
                {selectedSub.reviewedByFacultyName && (
                  <div>
                    <span className="meta-label">Reviewed By:</span>
                    <span>{selectedSub.reviewedByFacultyName}</span>
                  </div>
                )}
              </div>

              {selectedSub.feedback && (
                <div className="detail-section" style={{ marginTop: 16 }}>
                  <h4>💬 Faculty Feedback</h4>
                  <div className="content alert-box-neutral">{selectedSub.feedback}</div>
                </div>
              )}

              {selectedSub.sourceCode && (
                <div className="detail-section" style={{ marginTop: 16 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                    <h4>💻 Submitted Source Code</h4>
                    <button
                      className="btn btn-secondary btn-sm"
                      onClick={() => {
                        navigator.clipboard.writeText(selectedSub.sourceCode);
                        toast.success('Code copied to clipboard!');
                      }}
                    >
                      📋 Copy Code
                    </button>
                  </div>
                  <pre className="code-block">{selectedSub.sourceCode}</pre>
                </div>
              )}

              {selectedSub.observation && (
                <div className="detail-section" style={{ marginTop: 16 }}>
                  <h4>🔍 Observations</h4>
                  <div className="content">{selectedSub.observation}</div>
                </div>
              )}

              {selectedSub.result && (
                <div className="detail-section" style={{ marginTop: 16 }}>
                  <h4>📊 Result</h4>
                  <div className="content">{selectedSub.result}</div>
                </div>
              )}

              {selectedSub.additionalNotes && (
                <div className="detail-section" style={{ marginTop: 16 }}>
                  <h4>📝 Additional Notes</h4>
                  <div className="content">{selectedSub.additionalNotes}</div>
                </div>
              )}
            </div>
            <div className="modal-footer">
              <button className="btn btn-secondary" onClick={() => setSelectedSub(null)}>Close</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
