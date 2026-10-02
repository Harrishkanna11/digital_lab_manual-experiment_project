import { useState, useEffect } from 'react';
import { markService, studentService as studentSvc, experimentService, subjectService } from '../../services/dataService';
import toast from 'react-hot-toast';

export default function MarksManagement() {
  const [marks, setMarks] = useState([]);
  const [students, setStudents] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [experiments, setExperiments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ studentId: '', subjectId: '', experimentId: '', marksObtained: '', maxMarks: '100', feedback: '' });
  const [selectedSubject, setSelectedSubject] = useState('');
  const [selectedExperiment, setSelectedExperiment] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    Promise.all([
      studentSvc.getAll().catch(() => ({ data: [] })),
      subjectService.getForFaculty().then(res => res.data?.length ? res : subjectService.getAll()).catch(() => subjectService.getAll()),
      experimentService.getForFaculty().then(res => res.data?.length ? res : experimentService.getAll()).catch(() => experimentService.getAll())
    ])
      .then(([st, su, ex]) => {
        setStudents(st.data || []);
        const subs = su.data || [];
        setSubjects(subs);
        const exps = ex.data || [];
        setExperiments(exps);

        if (subs.length > 0) {
          setSelectedSubject(subs[0].id);
          markService.getBySubject(subs[0].id).then(res => setMarks(res.data)).catch(() => {});
        } else if (exps.length > 0) {
          setSelectedExperiment(exps[0].id);
          markService.getByExperiment(exps[0].id).then(res => setMarks(res.data)).catch(() => {});
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const handleSubjectFilterChange = (subjId) => {
    setSelectedSubject(subjId);
    setSelectedExperiment('');
    if (!subjId) {
      setMarks([]);
      return;
    }
    markService.getBySubject(subjId).then(res => setMarks(res.data)).catch(() => {});
  };

  const handleExperimentFilterChange = (expId) => {
    setSelectedExperiment(expId);
    if (expId) {
      markService.getByExperiment(expId).then(res => setMarks(res.data)).catch(() => {});
    } else if (selectedSubject) {
      markService.getBySubject(selectedSubject).then(res => setMarks(res.data)).catch(() => {});
    } else {
      setMarks([]);
    }
  };

  const openModal = () => {
    const defaultSubject = selectedSubject || (subjects.length > 0 ? subjects[0].id : '');
    const availableExps = experiments.filter(ex => !defaultSubject || String(ex.subjectId) === String(defaultSubject));
    setForm({
      studentId: students.length > 0 ? students[0].id : '',
      subjectId: defaultSubject,
      experimentId: availableExps.length > 0 ? availableExps[0].id : '',
      marksObtained: '',
      maxMarks: '100',
      feedback: ''
    });
    setShowModal(true);
  };

  const handleGive = async (e) => {
    e.preventDefault(); setSubmitting(true);
    try {
      await markService.give({
        ...form,
        studentId: parseInt(form.studentId),
        experimentId: parseInt(form.experimentId),
        marksObtained: parseInt(form.marksObtained),
        maxMarks: parseInt(form.maxMarks)
      });
      toast.success('Marks awarded!');
      setShowModal(false);
      if (selectedExperiment) {
        markService.getByExperiment(selectedExperiment).then(res => setMarks(res.data)).catch(() => {});
      } else if (selectedSubject) {
        markService.getBySubject(selectedSubject).then(res => setMarks(res.data)).catch(() => {});
      } else if (form.subjectId) {
        setSelectedSubject(form.subjectId);
        markService.getBySubject(form.subjectId).then(res => setMarks(res.data)).catch(() => {});
      }
    } catch (err) { toast.error(err.response?.data?.message || 'Failed'); }
    finally { setSubmitting(false); }
  };

  if (loading) return <div className="loading-spinner"><div className="spinner"></div></div>;

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <h2 style={{ fontWeight: 800 }}>🏆 Marks Management</h2>
        <button className="btn btn-primary" onClick={openModal}>+ Give Marks</button>
      </div>

      <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap', marginBottom: 20 }}>
        <div>
          <label style={{ fontSize: '.85rem', fontWeight: 600, marginRight: 8 }}>Filter by Subject:</label>
          <select
            className="form-control"
            style={{ display: 'inline-block', width: 320 }}
            value={selectedSubject}
            onChange={e => handleSubjectFilterChange(e.target.value)}
          >
            <option value="">-- All / Select Subject --</option>
            {subjects.map(s => <option key={s.id} value={s.id}>{s.courseCode} - {s.subjectName}</option>)}
          </select>
        </div>

        <div>
          <label style={{ fontSize: '.85rem', fontWeight: 600, marginRight: 8 }}>Filter by Experiment:</label>
          <select
            className="form-control"
            style={{ display: 'inline-block', width: 360 }}
            value={selectedExperiment}
            onChange={e => handleExperimentFilterChange(e.target.value)}
          >
            <option value="">-- All Experiments in Subject --</option>
            {experiments
              .filter(ex => !selectedSubject || String(ex.subjectId) === String(selectedSubject))
              .map(ex => <option key={ex.id} value={ex.id}>#{ex.experimentNumber} {ex.title}</option>)}
          </select>
        </div>
      </div>

      {marks.length === 0 ? (
        <div className="empty-state"><div className="empty-icon">🏆</div><h3>{selectedSubject ? 'No marks recorded for this selection' : 'Select a subject to view marks'}</h3></div>
      ) : (
        <div className="data-table-container">
          <table className="data-table">
            <thead><tr><th>Student</th><th>Experiment</th><th>Marks</th><th>Percentage</th><th>Feedback</th></tr></thead>
            <tbody>
              {marks.map(m => (
                <tr key={m.id}>
                  <td><strong>{m.studentName}</strong></td>
                  <td>#{m.experimentNumber} {m.experimentTitle}</td>
                  <td><strong>{m.marksObtained}/{m.maxMarks}</strong></td>
                  <td><span className={`badge ${m.percentage >= 80 ? 'badge-success' : m.percentage >= 50 ? 'badge-warning' : 'badge-danger'}`}>{m.percentage}%</span></td>
                  <td style={{ maxWidth: 200, fontSize: '.82rem', color: 'var(--text-secondary)' }}>{m.feedback || '-'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {showModal && (
        <div className="modal-overlay" onClick={e => e.target === e.currentTarget && setShowModal(false)}>
          <div className="modal">
            <div className="modal-header"><h2>Give Marks</h2><button className="modal-close" onClick={() => setShowModal(false)}>✕</button></div>
            <form onSubmit={handleGive}>
              <div className="modal-body">
                <div className="form-group">
                  <label>Student *</label>
                  <select className="form-control" value={form.studentId} onChange={e => setForm({...form, studentId: e.target.value})} required>
                    <option value="">Select student</option>
                    {students.map(s => <option key={s.id} value={s.id}>{s.fullName} ({s.registerNumber})</option>)}
                  </select>
                </div>

                <div className="form-group">
                  <label>Subject *</label>
                  <select
                    className="form-control"
                    value={form.subjectId}
                    onChange={e => {
                      const newSubj = e.target.value;
                      const expsForSubj = experiments.filter(ex => !newSubj || String(ex.subjectId) === String(newSubj));
                      setForm({
                        ...form,
                        subjectId: newSubj,
                        experimentId: expsForSubj.length > 0 ? expsForSubj[0].id : ''
                      });
                    }}
                    required
                  >
                    <option value="">Select subject</option>
                    {subjects.map(s => <option key={s.id} value={s.id}>{s.courseCode} - {s.subjectName}</option>)}
                  </select>
                </div>

                <div className="form-group">
                  <label>Experiment *</label>
                  <select className="form-control" value={form.experimentId} onChange={e => setForm({...form, experimentId: e.target.value})} required>
                    <option value="">Select experiment</option>
                    {experiments
                      .filter(ex => !form.subjectId || String(ex.subjectId) === String(form.subjectId))
                      .map(ex => <option key={ex.id} value={ex.id}>#{ex.experimentNumber} {ex.title}</option>)}
                  </select>
                </div>

                <div className="form-row">
                  <div className="form-group"><label>Marks *</label><input className="form-control" type="number" min="0" value={form.marksObtained} onChange={e => setForm({...form, marksObtained: e.target.value})} required /></div>
                  <div className="form-group"><label>Max Marks *</label><input className="form-control" type="number" min="1" value={form.maxMarks} onChange={e => setForm({...form, maxMarks: e.target.value})} required /></div>
                </div>
                <div className="form-group"><label>Feedback</label><textarea className="form-control" value={form.feedback} onChange={e => setForm({...form, feedback: e.target.value})} /></div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary" disabled={submitting}>{submitting ? 'Saving...' : 'Save Marks'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
