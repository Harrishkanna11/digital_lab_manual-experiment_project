import { useState, useEffect } from 'react';
import { submissionService } from '../../services/dataService';
import toast from 'react-hot-toast';

export default function SubmissionReview() {
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('ALL');
  const [reviewModal, setReviewModal] = useState(null);
  const [reviewForm, setReviewForm] = useState({ status: 'APPROVED', feedback: '', marks: '', maxMarks: '100' });
  const [submitting, setSubmitting] = useState(false);

  const fetchSubmissions = () => {
    setLoading(true);
    submissionService.getFacultySubmissions()
      .then(res => {
        setSubmissions(res.data || []);
      })
      .catch(() => {
        toast.error('Failed to load student submissions');
        setSubmissions([]);
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchSubmissions();
  }, []);

  const filtered = filter === 'ALL'
    ? submissions
    : submissions.filter(s => s.status === filter);

  const openReview = (s) => {
    setReviewModal(s);
    setReviewForm({
      status: s.status === 'SUBMITTED' || s.status === 'UNDER_REVIEW' ? 'APPROVED' : s.status,
      feedback: s.feedback || '',
      marks: s.marks != null ? String(s.marks) : '',
      maxMarks: s.maxMarks != null ? String(s.maxMarks) : '100'
    });
  };

  const handleReview = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const data = {
        status: reviewForm.status,
        feedback: reviewForm.feedback ? reviewForm.feedback.trim() : null,
        marks: reviewForm.marks !== '' ? parseInt(reviewForm.marks) : null,
        maxMarks: reviewForm.maxMarks !== '' ? parseInt(reviewForm.maxMarks) : null
      };
      await submissionService.review(reviewModal.id, data);
      toast.success('Review saved and student notified!');
      setReviewModal(null);
      fetchSubmissions();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to submit review');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="loading-spinner">
        <div className="spinner"></div>
      </div>
    );
  }

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24, flexWrap: 'wrap', gap: 12 }}>
        <div>
          <h2 style={{ fontWeight: 800, margin: 0 }}>📝 Student Submissions</h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '.9rem', margin: '4px 0 0 0' }}>
            Review, evaluate and provide feedback on laboratory practical submissions
          </p>
        </div>
        <div style={{ display: 'flex', gap: 10, alignItems: 'center', flexWrap: 'wrap' }}>
          <div className="filter-bar">
            {['ALL', 'SUBMITTED', 'UNDER_REVIEW', 'APPROVED', 'REJECTED', 'RESUBMIT'].map(f => (
              <button
                key={f}
                className={`filter-item ${filter === f ? 'active' : ''}`}
                onClick={() => setFilter(f)}
              >
                {f === 'ALL' ? 'All' : f === 'RESUBMIT' ? 'Resubmit' : f.replace('_', ' ')}
              </button>
            ))}
          </div>
          <button
            className="btn btn-secondary btn-sm"
            onClick={fetchSubmissions}
            title="Reload latest student submissions"
          >
            🔄 Refresh
          </button>
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">📝</div>
          <h3>No submissions matching this filter</h3>
          <p>When students submit their experiment implementations, they will appear here for your review.</p>
        </div>
      ) : (
        <div className="data-table-container">
          <table className="data-table">
            <thead>
              <tr>
                <th>Student</th>
                <th>Reg No. / ID</th>
                <th>Experiment</th>
                <th>Subject</th>
                <th>Status</th>
                <th>Marks</th>
                <th>Submitted</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(s => (
                <tr key={s.id}>
                  <td>
                    <strong>{s.studentName || 'Student'}</strong>
                  </td>
                  <td>
                    <span style={{ fontFamily: 'var(--font-mono, monospace)', fontSize: '.85rem' }}>
                      {s.studentRegisterNumber || (s.studentId ? `ID: ${s.studentId}` : '-')}
                    </span>
                  </td>
                  <td>
                    <strong>#{s.experimentNumber}</strong> {s.experimentTitle}
                  </td>
                  <td>{s.subjectName}</td>
                  <td>
                    <span className={`badge ${
                      s.status === 'APPROVED' ? 'badge-success' :
                      s.status === 'REJECTED' ? 'badge-danger' :
                      s.status === 'RESUBMIT' ? 'badge-warning' :
                      s.status === 'SUBMITTED' ? 'badge-warning' : 'badge-info'
                    }`}>
                      {s.status === 'RESUBMIT' ? 'RESUBMIT REQ' : s.status}
                    </span>
                  </td>
                  <td>
                    {s.marks != null ? (
                      <span className="marks-badge">{s.marks}/{s.maxMarks}</span>
                    ) : (
                      <span style={{ color: 'var(--text-light)', fontSize: '.82rem' }}>Pending</span>
                    )}
                  </td>
                  <td style={{ fontSize: '.82rem', color: 'var(--text-secondary)' }}>
                    {s.submittedAt ? new Date(s.submittedAt).toLocaleString() : '-'}
                  </td>
                  <td>
                    <button
                      className="btn btn-primary btn-sm"
                      onClick={() => openReview(s)}
                    >
                      View & Review
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Review & Details Modal */}
      {reviewModal && (
        <div className="modal-backdrop" onClick={() => !submitting && setReviewModal(null)}>
          <div className="modal-dialog modal-lg" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <div>
                <h3 style={{ margin: 0 }}>Review Student Submission</h3>
                <span style={{ fontSize: '.85rem', color: 'var(--text-secondary)' }}>
                  Submitted on {reviewModal.submittedAt ? new Date(reviewModal.submittedAt).toLocaleString() : '-'}
                </span>
              </div>
              <button className="modal-close-btn" onClick={() => !submitting && setReviewModal(null)}>✕</button>
            </div>
            <div className="modal-body">
              <div className="submission-meta-strip">
                <div>
                  <span className="meta-label">Student:</span>
                  <strong>{reviewModal.studentName}</strong> ({reviewModal.studentRegisterNumber || `ID: ${reviewModal.studentId}`})
                </div>
                <div>
                  <span className="meta-label">Experiment:</span>
                  <strong>#{reviewModal.experimentNumber}</strong> — {reviewModal.experimentTitle}
                </div>
                <div>
                  <span className="meta-label">Subject:</span>
                  <span>{reviewModal.subjectName}</span>
                </div>
                <div>
                  <span className="meta-label">Current Status:</span>
                  <span className={`badge ${
                    reviewModal.status === 'APPROVED' ? 'badge-success' :
                    reviewModal.status === 'REJECTED' ? 'badge-danger' :
                    reviewModal.status === 'RESUBMIT' ? 'badge-warning' : 'badge-warning'
                  }`}>
                    {reviewModal.status === 'RESUBMIT' ? 'RESUBMIT REQUESTED' : reviewModal.status}
                  </span>
                </div>
              </div>

              {reviewModal.sourceCode && (
                <div className="detail-section" style={{ marginTop: 16 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                    <h4 style={{ margin: 0 }}>💻 Submitted Source Code</h4>
                    <button
                      type="button"
                      className="btn btn-secondary btn-sm"
                      onClick={() => {
                        navigator.clipboard.writeText(reviewModal.sourceCode);
                        toast.success('Code copied to clipboard!');
                      }}
                    >
                      📋 Copy Code
                    </button>
                  </div>
                  <pre className="code-block" style={{ maxHeight: 280, overflowY: 'auto' }}>
                    {reviewModal.sourceCode}
                  </pre>
                </div>
              )}

              {reviewModal.observation && (
                <div className="detail-section" style={{ marginTop: 16 }}>
                  <h4>👁 Observations</h4>
                  <div className="content">{reviewModal.observation}</div>
                </div>
              )}

              {reviewModal.result && (
                <div className="detail-section" style={{ marginTop: 16 }}>
                  <h4>📤 Result</h4>
                  <div className="content">{reviewModal.result}</div>
                </div>
              )}

              {reviewModal.additionalNotes && (
                <div className="detail-section" style={{ marginTop: 16 }}>
                  <h4>📝 Student Notes</h4>
                  <div className="content">{reviewModal.additionalNotes}</div>
                </div>
              )}

              <hr style={{ margin: '24px 0 20px 0', borderColor: 'var(--border-light)' }} />

              <form onSubmit={handleReview}>
                <h4 style={{ marginBottom: 12, fontWeight: 700 }}>Faculty Evaluation</h4>
                <div className="form-group">
                  <label>Verdict *</label>
                  <select
                    className="form-control"
                    value={reviewForm.status}
                    onChange={e => setReviewForm({ ...reviewForm, status: e.target.value })}
                    required
                  >
                    <option value="APPROVED">Approve (Passed)</option>
                    <option value="RESUBMIT">Request Resubmission (Needs Work)</option>
                    <option value="REJECTED">Reject (Failed)</option>
                  </select>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label>Marks Awarded</label>
                    <input
                      className="form-control"
                      type="number"
                      placeholder="e.g. 85"
                      min="0"
                      max={reviewForm.maxMarks || 100}
                      value={reviewForm.marks}
                      onChange={e => setReviewForm({ ...reviewForm, marks: e.target.value })}
                    />
                  </div>
                  <div className="form-group">
                    <label>Maximum Marks</label>
                    <input
                      className="form-control"
                      type="number"
                      placeholder="e.g. 100"
                      min="1"
                      value={reviewForm.maxMarks}
                      onChange={e => setReviewForm({ ...reviewForm, maxMarks: e.target.value })}
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label>Feedback & Comments</label>
                  <textarea
                    className="form-control"
                    rows={3}
                    placeholder="Provide constructive feedback for the student..."
                    value={reviewForm.feedback}
                    onChange={e => setReviewForm({ ...reviewForm, feedback: e.target.value })}
                  />
                </div>

                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 12, marginTop: 16 }}>
                  <button
                    type="button"
                    className="btn btn-secondary"
                    disabled={submitting}
                    onClick={() => setReviewModal(null)}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="btn btn-primary"
                    disabled={submitting}
                  >
                    {submitting ? 'Submitting...' : 'Save Review & Grade'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
