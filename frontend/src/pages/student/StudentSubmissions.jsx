import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { submissionService, experimentService } from '../../services/dataService';
import toast from 'react-hot-toast';

export default function StudentSubmissions() {
  const navigate = useNavigate();
  const [submissions, setSubmissions] = useState([]);
  const [experiments, setExperiments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('ALL');
  const [selectedSub, setSelectedSub] = useState(null);

  // New submission modal state
  const [showSubmitModal, setShowSubmitModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitForm, setSubmitForm] = useState({
    experimentId: '',
    sourceCode: '',
    observation: '',
    result: '',
    additionalNotes: ''
  });

  const fetchSubmissions = () => {
    setLoading(true);
    submissionService.getStudentSubmissions()
      .then(res => setSubmissions(res.data || []))
      .catch(() => toast.error('Failed to load submissions'))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchSubmissions();
    experimentService.getForStudent()
      .then(res => setExperiments(res.data || []))
      .catch(() => {});
  }, []);

  const openSubmitModal = () => {
    // If experiments not loaded, attempt reload
    if (experiments.length === 0) {
      experimentService.getForStudent()
        .then(res => setExperiments(res.data || []))
        .catch(() => {});
    }
    setSubmitForm({
      experimentId: '',
      sourceCode: '',
      observation: '',
      result: '',
      additionalNotes: ''
    });
    setShowSubmitModal(true);
  };

  const handleExperimentSelect = (expId) => {
    const chosenExp = experiments.find(e => String(e.id) === String(expId));
    setSubmitForm(prev => ({
      ...prev,
      experimentId: expId,
      // If code is empty and experiment provides template/sample, prefill or keep current
      sourceCode: prev.sourceCode ? prev.sourceCode : (chosenExp?.sourceCode || '')
    }));
  };

  const handleSubmitNew = async (e) => {
    e.preventDefault();
    if (!submitForm.experimentId) {
      toast.error('Please select an experiment');
      return;
    }
    if (!submitForm.sourceCode.trim()) {
      toast.error('Source code is required');
      return;
    }
    if (!submitForm.observation.trim()) {
      toast.error('Observation is required');
      return;
    }
    if (!submitForm.result.trim()) {
      toast.error('Result is required');
      return;
    }

    setSubmitting(true);
    try {
      await submissionService.submit({
        experimentId: parseInt(submitForm.experimentId),
        sourceCode: submitForm.sourceCode.trim(),
        observation: submitForm.observation.trim(),
        result: submitForm.result.trim(),
        additionalNotes: submitForm.additionalNotes ? submitForm.additionalNotes.trim() : ''
      });
      toast.success('Experiment submitted successfully!');
      setShowSubmitModal(false);
      fetchSubmissions();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Submission failed');
    } finally {
      setSubmitting(false);
    }
  };

  const filtered = filter === 'ALL' ? submissions : submissions.filter(s => s.status === filter);

  if (loading) return <div className="loading-spinner"><div className="spinner"></div></div>;

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24, flexWrap: 'wrap', gap: 12 }}>
        <div>
          <h2 style={{ fontWeight: 800, margin: 0 }}>📝 My Lab Submissions</h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '.9rem', margin: '4px 0 0 0' }}>
            Submit experiments and track faculty reviews
          </p>
        </div>
        <div style={{ display: 'flex', gap: 12, alignItems: 'center', flexWrap: 'wrap' }}>
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
          <button className="btn btn-primary" onClick={openSubmitModal}>
            + Submit Experiment
          </button>
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">📝</div>
          <h3>No submissions matching this filter</h3>
          <p>Submit experiments to have them reviewed by your faculty.</p>
          <button className="btn btn-primary" onClick={openSubmitModal} style={{ marginTop: 12 }}>
            + Submit an Experiment
          </button>
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
                      <span style={{ color: 'var(--text-light)' }}>Pending</span>
                    )}
                  </td>
                  <td style={{ fontSize: '.82rem', color: 'var(--text-secondary)' }}>
                    {s.submittedAt ? new Date(s.submittedAt).toLocaleDateString() : '-'}
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

      {/* New Submission Modal */}
      {showSubmitModal && (
        <div className="modal-backdrop" onClick={() => !submitting && setShowSubmitModal(false)}>
          <div className="modal-dialog modal-lg" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Submit Experiment</h2>
              <button className="modal-close-btn" onClick={() => !submitting && setShowSubmitModal(false)}>✕</button>
            </div>
            <form onSubmit={handleSubmitNew}>
              <div className="modal-body">
                <div className="form-group">
                  <label>Select Experiment *</label>
                  <select
                    className="form-control"
                    value={submitForm.experimentId}
                    onChange={e => handleExperimentSelect(e.target.value)}
                    required
                  >
                    <option value="">-- Choose an Experiment --</option>
                    {experiments.map(exp => (
                      <option key={exp.id} value={exp.id}>
                        Exp #{exp.experimentNumber}: {exp.title} ({exp.subjectName})
                      </option>
                    ))}
                  </select>
                </div>

                <div className="form-group">
                  <label>Source Code *</label>
                  <textarea
                    className="form-control"
                    rows={7}
                    placeholder="Paste your implementation source code here..."
                    value={submitForm.sourceCode}
                    onChange={e => setSubmitForm({ ...submitForm, sourceCode: e.target.value })}
                    required
                    style={{ fontFamily: 'var(--font-mono, monospace)', fontSize: '.88rem' }}
                  />
                </div>

                <div className="form-group">
                  <label>Observation *</label>
                  <textarea
                    className="form-control"
                    rows={3}
                    placeholder="Describe your experimental observations and findings..."
                    value={submitForm.observation}
                    onChange={e => setSubmitForm({ ...submitForm, observation: e.target.value })}
                    required
                  />
                </div>

                <div className="form-group">
                  <label>Result *</label>
                  <textarea
                    className="form-control"
                    rows={2}
                    placeholder="State the final outcome/result of the experiment..."
                    value={submitForm.result}
                    onChange={e => setSubmitForm({ ...submitForm, result: e.target.value })}
                    required
                  />
                </div>

                <div className="form-group">
                  <label>Additional Notes (Optional)</label>
                  <textarea
                    className="form-control"
                    rows={2}
                    placeholder="Any edge cases handled, special libraries used, or notes for faculty..."
                    value={submitForm.additionalNotes}
                    onChange={e => setSubmitForm({ ...submitForm, additionalNotes: e.target.value })}
                  />
                </div>
              </div>
              <div className="modal-footer" style={{ display: 'flex', justifyContent: 'flex-end', gap: 10 }}>
                <button
                  type="button"
                  className="btn btn-secondary"
                  disabled={submitting}
                  onClick={() => setShowSubmitModal(false)}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn btn-primary"
                  disabled={submitting}
                >
                  {submitting ? 'Submitting...' : 'Submit Experiment'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Submission Detail Modal */}
      {selectedSub && (
        <div className="modal-backdrop" onClick={() => setSelectedSub(null)}>
          <div className="modal-dialog modal-lg" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <div>
                <h3 style={{ margin: 0 }}>#{selectedSub.experimentNumber} - {selectedSub.experimentTitle}</h3>
                <span style={{ fontSize: '.85rem', color: 'var(--text-secondary)' }}>
                  Subject: {selectedSub.subjectName} | Submitted: {selectedSub.submittedAt ? new Date(selectedSub.submittedAt).toLocaleString() : '-'}
                </span>
              </div>
              <button className="modal-close-btn" onClick={() => setSelectedSub(null)}>✕</button>
            </div>
            <div className="modal-body">
              <div className="submission-meta-strip">
                <div>
                  <span className="meta-label">Evaluation Verdict:</span>
                  <span className={`badge ${
                    selectedSub.status === 'APPROVED' ? 'badge-success' :
                    selectedSub.status === 'REJECTED' ? 'badge-danger' :
                    selectedSub.status === 'RESUBMIT' ? 'badge-warning' : 'badge-warning'
                  }`}>
                    {selectedSub.status === 'RESUBMIT' ? 'RESUBMIT REQUESTED' : selectedSub.status}
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
            <div className="modal-footer" style={{ display: 'flex', justifyContent: 'flex-end', gap: 10 }}>
              {(selectedSub.status === 'REJECTED' || selectedSub.status === 'RESUBMIT') && (
                <button
                  className="btn btn-primary"
                  onClick={() => {
                    navigate(`/student/experiments/${selectedSub.experimentId}`);
                  }}
                >
                  ✏️ Edit & Resubmit
                </button>
              )}
              <button className="btn btn-secondary" onClick={() => setSelectedSub(null)}>Close</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
