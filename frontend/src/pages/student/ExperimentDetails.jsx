import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { experimentService, submissionService, bookmarkService } from '../../services/dataService';
import toast from 'react-hot-toast';

export default function ExperimentDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [exp, setExp] = useState(null);
  const [showSubmit, setShowSubmit] = useState(false);
  const [form, setForm] = useState({ experimentId: id, sourceCode: '', observation: '', result: '', additionalNotes: '' });
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    experimentService.getById(id).then(res => setExp(res.data)).catch(() => toast.error('Failed to load')).finally(() => setLoading(false));
  }, [id]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await submissionService.submit({ ...form, experimentId: parseInt(id) });
      toast.success('Submission successful!');
      setShowSubmit(false);
      navigate('/student/submissions');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Submission failed');
    } finally { setSubmitting(false); }
  };

  if (loading) return <div className="loading-spinner"><div className="spinner"></div></div>;
  if (!exp) return <div className="empty-state"><h3>Experiment not found</h3></div>;

  return (
    <div className="experiment-detail">
      <button className="btn btn-secondary btn-sm" onClick={() => navigate(-1)} style={{ marginBottom: 16 }}>← Back</button>
      <div className="detail-header">
        <div style={{ display: 'flex', gap: 8, marginBottom: 8 }}>
          <span className="badge badge-purple">Exp #{exp.experimentNumber}</span>
          <span className={`badge badge-${exp.difficulty === 'EASY' ? 'success' : exp.difficulty === 'MEDIUM' ? 'warning' : 'danger'}`}>{exp.difficulty}</span>
        </div>
        <h1>{exp.title}</h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: '.9rem' }}>📖 {exp.subjectName} | ⏱ {exp.estimatedDuration || '-'} min</p>
      </div>

      {exp.aim && <div className="detail-section"><h3>🎯 Aim</h3><div className="content">{exp.aim}</div></div>}
      {exp.theory && <div className="detail-section"><h3>📖 Theory</h3><div className="content">{exp.theory}</div></div>}
      {exp.procedure && <div className="detail-section"><h3>📝 Procedure</h3><div className="content">{exp.procedure}</div></div>}
      {exp.sourceCode && <div className="detail-section"><h3>💻 Sample Code</h3><div className="code-block">{exp.sourceCode}</div></div>}
      {exp.expectedOutput && <div className="detail-section"><h3>📤 Expected Output</h3><div className="content">{exp.expectedOutput}</div></div>}
      {exp.vivaQuestions && <div className="detail-section"><h3>❓ Viva Questions</h3><div className="content">{exp.vivaQuestions}</div></div>}
      {exp.references && <div className="detail-section"><h3>📎 References</h3><div className="content">{exp.references}</div></div>}

      <div className="detail-actions">
        <button className="btn btn-primary" onClick={() => setShowSubmit(true)}>📤 Submit Experiment</button>
        <button className="btn btn-secondary" onClick={async () => { try { await bookmarkService.add(exp.id); toast.success('Bookmarked!'); } catch { toast.error('Already bookmarked'); } }}>🔖 Bookmark</button>
      </div>

      {showSubmit && (
        <div className="modal-overlay" onClick={e => e.target === e.currentTarget && setShowSubmit(false)}>
          <div className="modal">
            <div className="modal-header">
              <h2>Submit: {exp.title}</h2>
              <button className="modal-close" onClick={() => setShowSubmit(false)}>✕</button>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="modal-body">
                <div className="form-group"><label>Source Code *</label><textarea className="form-control" placeholder="Paste your source code here..." value={form.sourceCode} onChange={e => setForm({...form, sourceCode: e.target.value})} required /></div>
                <div className="form-group"><label>Observation *</label><textarea className="form-control" placeholder="Write your observations..." value={form.observation} onChange={e => setForm({...form, observation: e.target.value})} required style={{ minHeight: 80 }} /></div>
                <div className="form-group"><label>Result *</label><textarea className="form-control" placeholder="Write the result..." value={form.result} onChange={e => setForm({...form, result: e.target.value})} required style={{ minHeight: 80 }} /></div>
                <div className="form-group"><label>Additional Notes</label><textarea className="form-control" placeholder="Any additional notes..." value={form.additionalNotes} onChange={e => setForm({...form, additionalNotes: e.target.value})} style={{ minHeight: 60 }} /></div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setShowSubmit(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary" disabled={submitting}>{submitting ? 'Submitting...' : 'Submit'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
