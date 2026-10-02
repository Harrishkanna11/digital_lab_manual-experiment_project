import { useState, useEffect } from 'react';
import { subjectService } from '../../services/dataService';
import toast from 'react-hot-toast';

const emptyForm = { subjectName: '', courseCode: '', department: '', year: 1, semester: 1 };

export default function SubjectManagement() {
  const [subjects, setSubjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editId, setEditId] = useState(null);
  const [form, setForm] = useState({ ...emptyForm });
  const [submitting, setSubmitting] = useState(false);

  const fetch = () => { setLoading(true); subjectService.getForFaculty().then(res => setSubjects(res.data)).catch(() => {}).finally(() => setLoading(false)); };
  useEffect(() => { fetch(); }, []);

  const openCreate = () => { setEditId(null); setForm({ ...emptyForm }); setShowModal(true); };
  const openEdit = (s) => { setEditId(s.id); setForm({ subjectName: s.subjectName, courseCode: s.courseCode, department: s.department, year: s.year, semester: s.semester }); setShowModal(true); };

  const handleSubmit = async (e) => {
    e.preventDefault(); setSubmitting(true);
    try {
      if (editId) { await subjectService.update(editId, form); toast.success('Updated!'); }
      else { await subjectService.create(form); toast.success('Created!'); }
      setShowModal(false); fetch();
    } catch (err) { toast.error(err.response?.data?.message || 'Failed'); }
    finally { setSubmitting(false); }
  };

  const handleDelete = async (id) => { if (!confirm('Delete?')) return; try { await subjectService.delete(id); toast.success('Deleted'); fetch(); } catch { toast.error('Failed'); } };

  if (loading) return <div className="loading-spinner"><div className="spinner"></div></div>;

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <h2 style={{ fontWeight: 800 }}>📖 Subject Management</h2>
        <button className="btn btn-primary" onClick={openCreate}>+ Add Subject</button>
      </div>
      {subjects.length === 0 ? (
        <div className="empty-state"><div className="empty-icon">📖</div><h3>No subjects</h3><p>Create your first subject.</p><button className="btn btn-primary" onClick={openCreate}>+ Add Subject</button></div>
      ) : (
        <div className="data-table-container">
          <table className="data-table">
            <thead><tr><th>Code</th><th>Subject</th><th>Department</th><th>Year</th><th>Semester</th><th>Actions</th></tr></thead>
            <tbody>
              {subjects.map(s => (
                <tr key={s.id}>
                  <td><span className="badge badge-purple">{s.courseCode}</span></td>
                  <td><strong>{s.subjectName}</strong></td>
                  <td>{s.department}</td>
                  <td>{s.year}</td>
                  <td>{s.semester}</td>
                  <td><div style={{ display: 'flex', gap: 6 }}><button className="btn btn-secondary btn-sm" onClick={() => openEdit(s)}>Edit</button><button className="btn btn-danger btn-sm" onClick={() => handleDelete(s.id)}>Delete</button></div></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      {showModal && (
        <div className="modal-overlay" onClick={e => e.target === e.currentTarget && setShowModal(false)}>
          <div className="modal">
            <div className="modal-header"><h2>{editId ? 'Edit' : 'Add'} Subject</h2><button className="modal-close" onClick={() => setShowModal(false)}>✕</button></div>
            <form onSubmit={handleSubmit}>
              <div className="modal-body">
                <div className="form-group"><label>Subject Name *</label><input className="form-control" value={form.subjectName} onChange={e => setForm({...form, subjectName: e.target.value})} required /></div>
                <div className="form-row">
                  <div className="form-group"><label>Course Code *</label><input className="form-control" value={form.courseCode} onChange={e => setForm({...form, courseCode: e.target.value})} required /></div>
                  <div className="form-group"><label>Department *</label><input className="form-control" value={form.department} onChange={e => setForm({...form, department: e.target.value})} required /></div>
                </div>
                <div className="form-row">
                  <div className="form-group"><label>Year</label><select className="form-control" value={form.year} onChange={e => setForm({...form, year: parseInt(e.target.value)})}><option value={1}>1</option><option value={2}>2</option><option value={3}>3</option><option value={4}>4</option></select></div>
                  <div className="form-group"><label>Semester</label><select className="form-control" value={form.semester} onChange={e => setForm({...form, semester: parseInt(e.target.value)})}><option value={1}>1</option><option value={2}>2</option><option value={3}>3</option><option value={4}>4</option><option value={5}>5</option><option value={6}>6</option><option value={7}>7</option><option value={8}>8</option></select></div>
                </div>
              </div>
              <div className="modal-footer"><button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>Cancel</button><button type="submit" className="btn btn-primary" disabled={submitting}>{submitting ? 'Saving...' : editId ? 'Update' : 'Create'}</button></div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
