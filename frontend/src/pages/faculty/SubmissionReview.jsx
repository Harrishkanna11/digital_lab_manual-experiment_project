import { useState, useEffect } from 'react';
import { submissionService } from '../../services/dataService';
import toast from 'react-hot-toast';

export default function SubmissionReview() {
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('ALL');
  const [reviewModal, setReviewModal] = useState(null);
  const [reviewForm, setReviewForm] = useState({ status: 'APPROVED', feedback: '', marks: '', maxMarks: '' });
  const [submitting, setSubmitting] = useState(false);

  const fetch = () => { setLoading(true); submissionService.getFacultySubmissions().then(res => setSubmissions(res.data)).catch(() => {}).finally(() => setLoading(false)); };
  useEffect(() => { fetch(); }, []);

  const filtered = filter === 'ALL' ? submissions : submissions.filter(s => s.status === filter);

  const openReview = (s) => { setReviewModal(s); setReviewForm({ status: 'APPROVED', feedback: '', marks: '', maxMarks: '100' }); };

  const handleReview = async (e) => {
    e.preventDefault(); setSubmitting(true);
    try {
      const data = { ...reviewForm, marks: reviewForm.marks ? parseInt(reviewForm.marks) : null, maxMarks: reviewForm.maxMarks ? parseInt(reviewForm.maxMarks) : null };
      await submissionService.review(reviewModal.id, data);
      toast.success('Review submitted!');
      setReviewModal(null); fetch();
    } catch (err) { toast.error(err.response?.data?.message || 'Failed'); }
    finally { setSubmitting(false); }
  };

  if (loading) return <div className="loading-spinner"><div className="spinner"></div></div>;

  return (
    <div>
      <h2 style={{ marginBottom: 24, fontWeight: 800 }}>📝 Submission Review</h2>
      <div className="filter-bar">
        {['ALL', 'SUBMITTED', 'APPROVED', 'REJECTED'].map(f => (
          <button key={f} className={`filter-item ${filter === f ? 'active' : ''}`} onClick={() => setFilter(f)}>{f === 'ALL' ? 'All' : f.charAt(0) + f.slice(1).toLowerCase()}</button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <div className="empty-state"><div className="empty-icon">📝</div><h3>No submissions</h3></div>
      ) : (
        <div className="data-table-container">
          <table className="data-table">
            <thead><tr><th>Student</th><th>Reg No.</th><th>Experiment</th><th>Subject</th><th>Status</th><th>Submitted</th><th>Actions</th></tr></thead>
            <tbody>
              {filtered.map(s => (
                <tr key={s.id}>
                  <td><strong>{s.studentName}</strong></td>
                  <td>{s.studentRegisterNumber}</td>
                  <td>#{s.experimentNumber} {s.experimentTitle}</td>
                  <td>{s.subjectName}</td>
                  <td><span className={`badge ${s.status === 'APPROVED' ? 'badge-success' : s.status === 'REJECTED' ? 'badge-danger' : 'badge-warning'}`}>{s.status}</span></td>
                  <td style={{ fontSize: '.82rem', color: 'var(--text-secondary)' }}>{new Date(s.submittedAt).toLocaleString()}</td>
                  <td>
                    <div style={{ display: 'flex', gap: 6 }}>
                      <button className="btn btn-primary btn-sm" onClick={() => openReview(s)}>Review</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {reviewModal && (
        <div className="modal-overlay" onClick={e => e.target === e.currentTarget && setReviewModal(null)}>
          <div className="modal">
            <div className="modal-header"><h2>Review Submission</h2><button className="modal-close" onClick={() => setReviewModal(null)}>✕</button></div>
            <div className="modal-body">
              <div style={{ marginBottom: 20, padding: 16, background: 'var(--bg)', borderRadius: 'var(--radius)' }}>
                <p><strong>Student:</strong> {reviewModal.studentName} ({reviewModal.studentRegisterNumber})</p>
                <p><strong>Experiment:</strong> #{reviewModal.experimentNumber} — {reviewModal.experimentTitle}</p>
              </div>
              {reviewModal.sourceCode && <div className="detail-section"><h3 style={{ fontSize: '.9rem' }}>💻 Source Code</h3><div className="code-block">{reviewModal.sourceCode}</div></div>}
              {reviewModal.observation && <div className="detail-section"><h3 style={{ fontSize: '.9rem' }}>👁 Observation</h3><div className="content">{reviewModal.observation}</div></div>}
              {reviewModal.result && <div className="detail-section"><h3 style={{ fontSize: '.9rem' }}>📤 Result</h3><div className="content">{reviewModal.result}</div></div>}
              {reviewModal.additionalNotes && <div className="detail-section"><h3 style={{ fontSize: '.9rem' }}>📝 Notes</h3><div className="content">{reviewModal.additionalNotes}</div></div>}
              <hr style={{ margin: '20px 0', borderColor: 'var(--border-light)' }} />
              <form onSubmit={handleReview}>
                <div className="form-group"><label>Verdict *</label><select className="form-control" value={reviewForm.status} onChange={e => setReviewForm({...reviewForm, status: e.target.value})}><option value="APPROVED">Approve</option><option value="REJECTED">Reject</option><option value="RESUBMIT">Request Resubmission</option></select></div>
                <div className="form-row">
                  <div className="form-group"><label>Marks</label><input className="form-control" type="number" placeholder="e.g. 85" value={reviewForm.marks} onChange={e => setReviewForm({...reviewForm, marks: e.target.value})} /></div>
                  <div className="form-group"><label>Max Marks</label><input className="form-control" type="number" placeholder="e.g. 100" value={reviewForm.maxMarks} onChange={e => setReviewForm({...reviewForm, maxMarks: e.target.value})} /></div>
                </div>
                <div className="form-group"><label>Feedback</label><textarea className="form-control" placeholder="Write feedback for the student..." value={reviewForm.feedback} onChange={e => setReviewForm({...reviewForm, feedback: e.target.value})} /></div>
                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 12, marginTop: 16 }}>
                  <button type="button" className="btn btn-secondary" onClick={() => setReviewModal(null)}>Cancel</button>
                  <button type="submit" className="btn btn-primary" disabled={submitting}>{submitting ? 'Submitting...' : 'Submit Review'}</button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
