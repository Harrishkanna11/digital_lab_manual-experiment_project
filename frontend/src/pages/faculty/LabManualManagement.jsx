import { useState, useEffect } from 'react';
import { labManualService, subjectService } from '../../services/dataService';
import toast from 'react-hot-toast';

export default function LabManualManagement() {
  const [manuals, setManuals] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editId, setEditId] = useState(null);
  const [form, setForm] = useState({ title: '', description: '', academicYear: '2024-25', subjectId: '', published: false });
  const [submitting, setSubmitting] = useState(false);

  const fetch = () => {
    setLoading(true);
    Promise.all([
      labManualService.getAll().catch(() => ({ data: [] })),
      subjectService.getForFaculty().then(res => res.data?.length ? res : subjectService.getAll()).catch(() => subjectService.getAll())
    ])
      .then(([m, s]) => { setManuals(m.data || []); setSubjects(s.data || []); })
      .catch(() => {}).finally(() => setLoading(false));
  };
  useEffect(() => { fetch(); }, []);

  const openCreate = () => { setEditId(null); setForm({ title: '', description: '', academicYear: '2024-25', subjectId: '', published: false }); setShowModal(true); };
  const openEdit = (m) => { setEditId(m.id); setForm({ title: m.title, description: m.description || '', academicYear: m.academicYear, subjectId: m.subjectId, published: m.published }); setShowModal(true); };

  const handleSubmit = async (e) => {
    e.preventDefault(); setSubmitting(true);
    try {
      if (editId) { await labManualService.update(editId, form); toast.success('Updated!'); }
      else { await labManualService.create(form); toast.success('Created!'); }
      setShowModal(false); fetch();
    } catch (err) { toast.error(err.response?.data?.message || 'Failed'); }
    finally { setSubmitting(false); }
  };

  const handleDelete = async (id) => { if (!confirm('Delete?')) return; try { await labManualService.delete(id); toast.success('Deleted'); fetch(); } catch { toast.error('Failed'); } };

  if (loading) return <div className="loading-spinner"><div className="spinner"></div></div>;

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <h2 style={{ fontWeight: 800 }}>📚 Lab Manual Management</h2>
        <button className="btn btn-primary" onClick={openCreate}>+ Create Manual</button>
      </div>
      {manuals.length === 0 ? (
        <div className="empty-state"><div className="empty-icon">📚</div><h3>No lab manuals</h3><button className="btn btn-primary" onClick={openCreate}>+ Create Manual</button></div>
      ) : (
        <div className="experiments-grid">
          {manuals.map(m => (
            <div key={m.id} className="experiment-card">
              <div className="card-top">
                <div className="exp-number">{m.courseCode}</div>
                <h4>{m.title}</h4>
                <div className="subject-tag">📖 {m.subjectName}</div>
                <div className="exp-meta"><span>📅 {m.academicYear}</span><span>📝 {m.experimentCount} experiments</span></div>
              </div>
              <div className="card-bottom">
                <span className={`badge ${m.published ? 'badge-success' : 'badge-gray'}`}>{m.published ? 'Published' : 'Draft'}</span>
                <div style={{ display: 'flex', gap: 6 }}>
                  <button className="btn btn-secondary btn-sm" onClick={() => openEdit(m)}>Edit</button>
                  <button className="btn btn-danger btn-sm" onClick={() => handleDelete(m.id)}>Delete</button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
      {showModal && (
        <div className="modal-overlay" onClick={e => e.target === e.currentTarget && setShowModal(false)}>
          <div className="modal">
            <div className="modal-header"><h2>{editId ? 'Edit' : 'Create'} Lab Manual</h2><button className="modal-close" onClick={() => setShowModal(false)}>✕</button></div>
            <form onSubmit={handleSubmit}>
              <div className="modal-body">
                <div className="form-group"><label>Title *</label><input className="form-control" value={form.title} onChange={e => setForm({...form, title: e.target.value})} required /></div>
                <div className="form-group"><label>Subject *</label><select className="form-control" value={form.subjectId} onChange={e => setForm({...form, subjectId: e.target.value})} required><option value="">Select</option>{subjects.map(s => <option key={s.id} value={s.id}>{s.subjectName}</option>)}</select></div>
                <div className="form-group"><label>Academic Year</label><input className="form-control" value={form.academicYear} onChange={e => setForm({...form, academicYear: e.target.value})} /></div>
                <div className="form-group"><label>Description</label><textarea className="form-control" value={form.description} onChange={e => setForm({...form, description: e.target.value})} /></div>
                <div className="form-group"><label><input type="checkbox" checked={form.published} onChange={e => setForm({...form, published: e.target.checked})} style={{ marginRight: 8 }} />Publish immediately</label></div>
              </div>
              <div className="modal-footer"><button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>Cancel</button><button type="submit" className="btn btn-primary" disabled={submitting}>{submitting ? 'Saving...' : editId ? 'Update' : 'Create'}</button></div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
