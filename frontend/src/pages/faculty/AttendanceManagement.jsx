import { useState, useEffect } from 'react';
import { attendanceService, studentService as studentSvc, subjectService, experimentService } from '../../services/dataService';
import toast from 'react-hot-toast';

export default function AttendanceManagement() {
  const [records, setRecords] = useState([]);
  const [students, setStudents] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [experiments, setExperiments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState(() => ({
    studentId: '',
    subjectId: '',
    experimentId: '',
    date: new Date().toISOString().split('T')[0],
    status: 'PRESENT'
  }));
  const [editingId, setEditingId] = useState(null);
  const [selectedSubject, setSelectedSubject] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    Promise.all([
      studentSvc.getAll().catch(() => ({ data: [] })),
      subjectService.getForFaculty().then(res => res.data?.length ? res : subjectService.getAll()).catch(() => subjectService.getAll()),
      experimentService.getForFaculty().then(res => res.data?.length ? res : experimentService.getAll()).catch(() => experimentService.getAll()),
      attendanceService.getForFaculty().catch(() => ({ data: [] }))
    ])
      .then(([st, su, ex, att]) => {
        setStudents(st.data || []);
        const subs = su.data || [];
        setSubjects(subs);
        setExperiments(ex.data || []);
        setRecords(att.data || []);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const loadRecords = (subjectId) => {
    setSelectedSubject(subjectId);
    if (!subjectId) {
      attendanceService.getForFaculty()
        .then(res => setRecords(res.data || []))
        .catch(() => setRecords([]));
      return;
    }
    attendanceService.getBySubject(subjectId)
      .then(res => setRecords(res.data || []))
      .catch(() => setRecords([]));
  };

  const handleOpenMarkModal = () => {
    if (students.length === 0) {
      toast.error('No registered students found to mark attendance');
      return;
    }
    setEditingId(null);
    setForm({
      studentId: students[0]?.id ? String(students[0].id) : '',
      subjectId: selectedSubject ? String(selectedSubject) : (subjects[0]?.id ? String(subjects[0].id) : ''),
      experimentId: '',
      date: new Date().toISOString().split('T')[0],
      status: 'PRESENT'
    });
    setShowModal(true);
  };

  const handleOpenEditModal = (r) => {
    setEditingId(r.id);
    setForm({
      studentId: String(r.studentId),
      subjectId: String(r.subjectId),
      experimentId: r.experimentId ? String(r.experimentId) : '',
      date: r.date,
      status: r.status
    });
    setShowModal(true);
  };

  const handleMark = async (e) => {
    e.preventDefault();
    if (!form.studentId) {
      toast.error('Please select a student');
      return;
    }
    if (!form.subjectId) {
      toast.error('Please select a subject');
      return;
    }
    if (!form.date) {
      toast.error('Please select an attendance date');
      return;
    }

    setSubmitting(true);
    try {
      const payload = {
        studentId: parseInt(form.studentId),
        subjectId: parseInt(form.subjectId),
        experimentId: form.experimentId ? parseInt(form.experimentId) : null,
        date: form.date,
        status: form.status
      };

      if (editingId) {
        await attendanceService.update(editingId, payload);
        toast.success('Attendance record updated!');
      } else {
        await attendanceService.mark(payload);
        toast.success('Attendance recorded successfully!');
      }

      setShowModal(false);
      setEditingId(null);
      loadRecords(selectedSubject || form.subjectId);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to save attendance');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <div className="loading-spinner"><div className="spinner"></div></div>;

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24, flexWrap: 'wrap', gap: 12 }}>
        <h2 style={{ fontWeight: 800 }}>📋 Attendance Management</h2>
        <button className="btn btn-primary" onClick={handleOpenMarkModal}>
          + Mark Attendance
        </button>
      </div>

      <div style={{ marginBottom: 20 }}>
        <label style={{ fontSize: '.85rem', fontWeight: 600, marginRight: 8 }}>Filter by Subject:</label>
        <select className="form-control" style={{ display: 'inline-block', width: 320 }} value={selectedSubject} onChange={e => loadRecords(e.target.value)}>
          <option value="">-- All Subjects --</option>
          {subjects.map(s => <option key={s.id} value={s.id}>{s.courseCode} - {s.subjectName}</option>)}
        </select>
      </div>

      {records.length === 0 ? (
        <div className="empty-state"><div className="empty-icon">📋</div><h3>{selectedSubject ? 'No attendance records for this subject' : 'No attendance records recorded yet'}</h3></div>
      ) : (
        <div className="data-table-container">
          <table className="data-table">
            <thead>
              <tr>
                <th>Date</th>
                <th>Student</th>
                <th>Reg No.</th>
                <th>Subject</th>
                <th>Experiment</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {records.map(r => (
                <tr key={r.id}>
                  <td>{new Date(r.date).toLocaleDateString()}</td>
                  <td><strong>{r.studentName}</strong></td>
                  <td>{r.registerNumber}</td>
                  <td>{r.subjectName}</td>
                  <td>{r.experimentTitle || '-'}</td>
                  <td><span className={`badge ${r.status === 'PRESENT' ? 'badge-success' : r.status === 'ABSENT' ? 'badge-danger' : 'badge-warning'}`}>{r.status}</span></td>
                  <td>
                    <button
                      className="btn btn-secondary btn-sm"
                      onClick={() => handleOpenEditModal(r)}
                    >
                      ✏️ Edit
                    </button>
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
            <div className="modal-header">
              <h2>{editingId ? 'Edit Attendance Record' : 'Mark Attendance'}</h2>
              <button className="modal-close" onClick={() => setShowModal(false)}>✕</button>
            </div>
            <form onSubmit={handleMark}>
              <div className="modal-body">
                <div className="form-group">
                  <label>Student *</label>
                  <select
                    className="form-control"
                    value={form.studentId}
                    onChange={e => setForm({...form, studentId: e.target.value})}
                    required
                    disabled={!!editingId}
                  >
                    <option value="">Select student</option>
                    {students.map(s => <option key={s.id} value={s.id}>{s.fullName} ({s.registerNumber})</option>)}
                  </select>
                </div>
                <div className="form-group">
                  <label>Subject *</label>
                  <select
                    className="form-control"
                    value={form.subjectId}
                    onChange={e => setForm({...form, subjectId: e.target.value, experimentId: ''})}
                    required
                    disabled={!!editingId}
                  >
                    <option value="">Select subject</option>
                    {subjects.map(s => <option key={s.id} value={s.id}>{s.courseCode} - {s.subjectName}</option>)}
                  </select>
                </div>
                <div className="form-group">
                  <label>Experiment (Optional)</label>
                  <select className="form-control" value={form.experimentId} onChange={e => setForm({...form, experimentId: e.target.value})}>
                    <option value="">None</option>
                    {experiments.filter(ex => String(ex.subjectId) === String(form.subjectId)).map(ex => (
                      <option key={ex.id} value={ex.id}>#{ex.experimentNumber} {ex.title}</option>
                    ))}
                  </select>
                </div>
                <div className="form-row">
                  <div className="form-group">
                    <label>Date *</label>
                    <input
                      type="date"
                      className="form-control"
                      value={form.date}
                      onChange={e => setForm({...form, date: e.target.value})}
                      required
                      disabled={!!editingId}
                    />
                  </div>
                  <div className="form-group">
                    <label>Status *</label>
                    <select className="form-control" value={form.status} onChange={e => setForm({...form, status: e.target.value})}>
                      <option value="PRESENT">Present</option>
                      <option value="ABSENT">Absent</option>
                      <option value="LATE">Late</option>
                    </select>
                  </div>
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary" disabled={submitting}>
                  {submitting ? 'Saving...' : editingId ? 'Update Attendance' : 'Save Attendance'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
