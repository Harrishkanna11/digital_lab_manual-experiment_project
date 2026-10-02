import { useState, useEffect } from 'react';
import { experimentService, subjectService } from '../../services/dataService';
import toast from 'react-hot-toast';

const emptyForm = { subjectId: '', experimentNumber: '', title: '', aim: '', theory: '', procedure: '', sourceCode: '', expectedOutput: '', vivaQuestions: '', difficulty: 'MEDIUM' };

export default function ExperimentManagement() {
  const [experiments, setExperiments] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editId, setEditId] = useState(null);
  const [form, setForm] = useState({ ...emptyForm });
  const [submitting, setSubmitting] = useState(false);

  const fetch = () => {
    setLoading(true);
    Promise.all([
      experimentService.getForFaculty().then(res => res.data?.length ? res : experimentService.getAll()).catch(() => experimentService.getAll()),
      subjectService.getForFaculty().then(res => res.data?.length ? res : subjectService.getAll()).catch(() => subjectService.getAll())
    ])
      .then(([e, s]) => { setExperiments(e.data || []); setSubjects(s.data || []); })
      .catch(() => {}).finally(() => setLoading(false));
  };

  useEffect(() => { fetch(); }, []);

  const openCreate = () => { setEditId(null); setForm({ ...emptyForm }); setShowModal(true); };
  const openEdit = (exp) => {
    setEditId(exp.id);
    setForm({ subjectId: exp.subjectId, experimentNumber: exp.experimentNumber, title: exp.title, aim: exp.aim || '', theory: exp.theory || '', procedure: exp.procedure || '', sourceCode: exp.sourceCode || '', expectedOutput: exp.expectedOutput || '', vivaQuestions: exp.vivaQuestions || '', difficulty: exp.difficulty || 'MEDIUM' });
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault(); setSubmitting(true);
    try {
      if (editId) { await experimentService.update(editId, form); toast.success('Updated!'); }
      else { await experimentService.create(form); toast.success('Created!'); }
      setShowModal(false); fetch();
    } catch (err) { toast.error(err.response?.data?.message || 'Failed'); }
    finally { setSubmitting(false); }
  };

  const handlePublish = async (id) => { try { await experimentService.publish(id); toast.success('Published!'); fetch(); } catch { toast.error('Failed'); } };
  const handleUnpublish = async (id) => { try { await experimentService.unpublish(id); toast.success('Unpublished'); fetch(); } catch { toast.error('Failed'); } };
  const handleDelete = async (id) => { if (!confirm('Delete this experiment?')) return; try { await experimentService.delete(id); toast.success('Deleted'); fetch(); } catch { toast.error('Failed'); } };

  if (loading) return <div className="loading-spinner"><div className="spinner"></div></div>;

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <h2 style={{ fontWeight: 800 }}>🔬 Experiment Management</h2>
        <button className="btn btn-primary" onClick={openCreate}>+ Create Experiment</button>
      </div>

      {experiments.length === 0 ? (
        <div className="empty-state"><div className="empty-icon">🔬</div><h3>No experiments yet</h3><p>Create your first experiment to get started.</p><button className="btn btn-primary" onClick={openCreate}>+ Create Experiment</button></div>
      ) : (
        <div className="data-table-container">
          <table className="data-table">
            <thead><tr><th>#</th><th>Title</th><th>Subject</th><th>Difficulty</th><th>Status</th><th>Actions</th></tr></thead>
            <tbody>
              {experiments.map(exp => (
                <tr key={exp.id}>
                  <td>{exp.experimentNumber}</td>
                  <td><strong>{exp.title}</strong></td>
                  <td>{exp.subjectName}</td>
                  <td><span className={`badge badge-${exp.difficulty === 'EASY' ? 'success' : exp.difficulty === 'MEDIUM' ? 'warning' : 'danger'}`}>{exp.difficulty}</span></td>
                  <td><span className={`badge ${exp.published ? 'badge-success' : 'badge-gray'}`}>{exp.published ? 'Published' : 'Draft'}</span></td>
                  <td>
                    <div style={{ display: 'flex', gap: 6 }}>
                      <button className="btn btn-secondary btn-sm" onClick={() => openEdit(exp)}>Edit</button>
                      {exp.published ? <button className="btn btn-warning btn-sm" onClick={() => handleUnpublish(exp.id)}>Unpublish</button> : <button className="btn btn-success btn-sm" onClick={() => handlePublish(exp.id)}>Publish</button>}
                      <button className="btn btn-danger btn-sm" onClick={() => handleDelete(exp.id)}>Delete</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {showModal && (
        <div className="modal-overlay" onClick={e => e.target === e.currentTarget && setShowModal(false)}>
          <div className="modal">
            <div className="modal-header"><h2>{editId ? 'Edit' : 'Create'} Experiment</h2><button className="modal-close" onClick={() => setShowModal(false)}>✕</button></div>
            <form onSubmit={handleSubmit}>
              <div className="modal-body">
                <div className="form-row">
                  <div className="form-group"><label>Subject *</label><select className="form-control" value={form.subjectId} onChange={e => setForm({...form, subjectId: e.target.value})} required><option value="">Select subject</option>{subjects.map(s => <option key={s.id} value={s.id}>{s.subjectName}</option>)}</select></div>
                  <div className="form-group"><label>Exp Number *</label><input className="form-control" type="number" value={form.experimentNumber} onChange={e => setForm({...form, experimentNumber: e.target.value})} required /></div>
                </div>
                <div className="form-group"><label>Title *</label><input className="form-control" value={form.title} onChange={e => setForm({...form, title: e.target.value})} required /></div>
                <div className="form-group"><label>Aim</label><textarea className="form-control" value={form.aim} onChange={e => setForm({...form, aim: e.target.value})} style={{ minHeight: 60 }} /></div>
                <div className="form-group"><label>Theory</label><textarea className="form-control" value={form.theory} onChange={e => setForm({...form, theory: e.target.value})} /></div>
                <div className="form-group"><label>Procedure</label><textarea className="form-control" value={form.procedure} onChange={e => setForm({...form, procedure: e.target.value})} /></div>
                <div className="form-group"><label>Source Code</label><textarea className="form-control" value={form.sourceCode} onChange={e => setForm({...form, sourceCode: e.target.value})} style={{ fontFamily: 'monospace' }} /></div>
                <div className="form-group"><label>Expected Output</label><textarea className="form-control" value={form.expectedOutput} onChange={e => setForm({...form, expectedOutput: e.target.value})} style={{ minHeight: 60 }} /></div>
                <div className="form-group"><label>Viva Questions</label><textarea className="form-control" value={form.vivaQuestions} onChange={e => setForm({...form, vivaQuestions: e.target.value})} style={{ minHeight: 60 }} /></div>
                <div className="form-group"><label>Difficulty</label><select className="form-control" value={form.difficulty} onChange={e => setForm({...form, difficulty: e.target.value})}><option value="EASY">Easy</option><option value="MEDIUM">Medium</option><option value="HARD">Hard</option></select></div>
              </div>
              <div className="modal-footer"><button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>Cancel</button><button type="submit" className="btn btn-primary" disabled={submitting}>{submitting ? 'Saving...' : editId ? 'Update' : 'Create'}</button></div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
