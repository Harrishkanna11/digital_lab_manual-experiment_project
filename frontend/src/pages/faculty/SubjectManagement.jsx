import { useState, useEffect, useCallback } from 'react';
import { subjectService, studentService } from '../../services/dataService';
import toast from 'react-hot-toast';

const emptyForm = {
  subjectName: '',
  courseCode: '',
  department: '',
  year: 1,
  semester: 1,
  academicYear: '2024-2025'
};

export default function SubjectManagement() {
  const [subjects, setSubjects] = useState([]);
  const [loading, setLoading] = useState(true);

  // Create / Edit modal state
  const [showModal, setShowModal] = useState(false);
  const [editId, setEditId] = useState(null);
  const [form, setForm] = useState({ ...emptyForm });
  const [submitting, setSubmitting] = useState(false);

  // Assign Students modal state
  const [assignSubject, setAssignSubject] = useState(null);
  const [allStudents, setAllStudents] = useState([]);
  const [selectedStudentIds, setSelectedStudentIds] = useState(new Set());
  const [searchStudent, setSearchStudent] = useState('');
  const [loadingStudents, setLoadingStudents] = useState(false);
  const [savingAssignment, setSavingAssignment] = useState(false);

  const fetchSubjects = useCallback(() => {
    setLoading(true);
    subjectService.getForFaculty()
      .then(res => setSubjects(res.data || []))
      .catch(() => setSubjects([]))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    fetchSubjects();
  }, [fetchSubjects]);

  const openCreate = () => {
    setEditId(null);
    setForm({ ...emptyForm });
    setShowModal(true);
  };

  const openEdit = (s) => {
    setEditId(s.id);
    setForm({
      subjectName: s.subjectName || '',
      courseCode: s.courseCode || '',
      department: s.department || '',
      year: s.year || 1,
      semester: s.semester || 1,
      academicYear: s.academicYear || '2024-2025'
    });
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.subjectName.trim() || !form.courseCode.trim() || !form.department.trim()) {
      toast.error('Please fill in all required fields');
      return;
    }

    setSubmitting(true);
    try {
      if (editId) {
        await subjectService.update(editId, form);
        toast.success('Subject updated successfully!');
      } else {
        await subjectService.create(form);
        toast.success(`Subject "${form.subjectName}" created successfully!`);
      }
      setShowModal(false);
      fetchSubjects();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to save subject');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id, name) => {
    if (!window.confirm(`Are you sure you want to delete subject "${name}"?`)) return;
    try {
      await subjectService.delete(id);
      toast.success('Subject deleted successfully!');
      fetchSubjects();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to delete subject');
    }
  };

  // Open Assign Students modal for a subject
  const openAssignModal = async (subject) => {
    setAssignSubject(subject);
    setSearchStudent('');
    setLoadingStudents(true);
    try {
      const [studentsRes, enrolledRes] = await Promise.all([
        studentService.getAll().catch(() => ({ data: [] })),
        subjectService.getSubjectStudents(subject.id).catch(() => ({ data: [] }))
      ]);

      const students = studentsRes.data || [];
      const enrolled = enrolledRes.data || [];

      setAllStudents(students);
      const enrolledIds = new Set(enrolled.map(s => s.id));
      setSelectedStudentIds(enrolledIds);
    } catch {
      toast.error('Failed to load students');
    } finally {
      setLoadingStudents(false);
    }
  };

  const toggleStudent = (studentId) => {
    setSelectedStudentIds(prev => {
      const next = new Set(prev);
      if (next.has(studentId)) {
        next.delete(studentId);
      } else {
        next.add(studentId);
      }
      return next;
    });
  };

  const handleSelectAll = (select) => {
    if (select) {
      setSelectedStudentIds(new Set(filteredStudents.map(s => s.id)));
    } else {
      setSelectedStudentIds(new Set());
    }
  };

  const handleSaveAssignment = async () => {
    if (!assignSubject) return;
    setSavingAssignment(true);
    try {
      const ids = Array.from(selectedStudentIds);
      await subjectService.assignStudents(assignSubject.id, ids);
      toast.success(`Successfully assigned ${ids.length} student(s) to ${assignSubject.subjectName}!`);
      setAssignSubject(null);
      fetchSubjects();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to assign students');
    } finally {
      setSavingAssignment(false);
    }
  };

  const filteredStudents = allStudents.filter(st => {
    const q = searchStudent.toLowerCase().trim();
    if (!q) return true;
    return (
      st.fullName?.toLowerCase().includes(q) ||
      st.registerNumber?.toLowerCase().includes(q) ||
      st.email?.toLowerCase().includes(q) ||
      st.department?.toLowerCase().includes(q)
    );
  });

  if (loading) return <div className="loading-spinner"><div className="spinner"></div></div>;

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24, flexWrap: 'wrap', gap: 12 }}>
        <div>
          <h2 style={{ fontWeight: 800 }}>📖 Subject Management</h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '.9rem' }}>
            Create subjects and assign enrolled students to your courses.
          </p>
        </div>
        <button className="btn btn-primary" onClick={openCreate}>
          + Add Subject
        </button>
      </div>

      {subjects.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">📖</div>
          <h3>No subjects created yet</h3>
          <p>Create your first subject and assign it to students.</p>
          <button className="btn btn-primary" onClick={openCreate} style={{ marginTop: 12 }}>
            + Add Subject
          </button>
        </div>
      ) : (
        <div className="data-table-container">
          <table className="data-table">
            <thead>
              <tr>
                <th>Code</th>
                <th>Subject Name</th>
                <th>Department</th>
                <th>Year / Sem</th>
                <th>Academic Year</th>
                <th>Students Enrolled</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {subjects.map(s => (
                <tr key={s.id}>
                  <td><span className="badge badge-purple">{s.courseCode}</span></td>
                  <td><strong>{s.subjectName}</strong></td>
                  <td>{s.department}</td>
                  <td>Year {s.year}, Sem {s.semester}</td>
                  <td>{s.academicYear || '-'}</td>
                  <td>
                    <span className="badge badge-success" style={{ fontWeight: 600 }}>
                      👥 {s.enrolledStudentsCount ?? 0} Enrolled
                    </span>
                  </td>
                  <td>
                    <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                      <button
                        className="btn btn-primary btn-sm"
                        onClick={() => openAssignModal(s)}
                        title="Assign students to this subject"
                      >
                        👥 Assign Students
                      </button>
                      <button
                        className="btn btn-secondary btn-sm"
                        onClick={() => openEdit(s)}
                      >
                        ✏️ Edit
                      </button>
                      <button
                        className="btn btn-danger btn-sm"
                        onClick={() => handleDelete(s.id, s.subjectName)}
                      >
                        🗑️ Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Create / Edit Subject Modal */}
      {showModal && (
        <div className="modal-overlay" onClick={e => e.target === e.currentTarget && setShowModal(false)}>
          <div className="modal">
            <div className="modal-header">
              <h2>{editId ? 'Edit Subject' : 'Add New Subject'}</h2>
              <button className="modal-close" onClick={() => setShowModal(false)}>✕</button>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="modal-body">
                <div className="form-group">
                  <label>Subject Name *</label>
                  <input
                    className="form-control"
                    placeholder="e.g. Database Management Systems"
                    value={form.subjectName}
                    onChange={e => setForm({...form, subjectName: e.target.value})}
                    required
                  />
                </div>
                <div className="form-row">
                  <div className="form-group">
                    <label>Course Code *</label>
                    <input
                      className="form-control"
                      placeholder="e.g. CS302"
                      value={form.courseCode}
                      onChange={e => setForm({...form, courseCode: e.target.value})}
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label>Department *</label>
                    <input
                      className="form-control"
                      placeholder="e.g. Computer Science and Engineering"
                      value={form.department}
                      onChange={e => setForm({...form, department: e.target.value})}
                      required
                    />
                  </div>
                </div>
                <div className="form-row">
                  <div className="form-group">
                    <label>Year *</label>
                    <select
                      className="form-control"
                      value={form.year}
                      onChange={e => setForm({...form, year: parseInt(e.target.value)})}
                    >
                      <option value={1}>1st Year</option>
                      <option value={2}>2nd Year</option>
                      <option value={3}>3rd Year</option>
                      <option value={4}>4th Year</option>
                    </select>
                  </div>
                  <div className="form-group">
                    <label>Semester *</label>
                    <select
                      className="form-control"
                      value={form.semester}
                      onChange={e => setForm({...form, semester: parseInt(e.target.value)})}
                    >
                      <option value={1}>Semester 1</option>
                      <option value={2}>Semester 2</option>
                      <option value={3}>Semester 3</option>
                      <option value={4}>Semester 4</option>
                      <option value={5}>Semester 5</option>
                      <option value={6}>Semester 6</option>
                      <option value={7}>Semester 7</option>
                      <option value={8}>Semester 8</option>
                    </select>
                  </div>
                </div>
                <div className="form-group">
                  <label>Academic Year</label>
                  <input
                    className="form-control"
                    placeholder="e.g. 2024-2025"
                    value={form.academicYear}
                    onChange={e => setForm({...form, academicYear: e.target.value})}
                  />
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary" disabled={submitting}>
                  {submitting ? 'Saving Subject...' : editId ? 'Update Subject' : 'Create Subject'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Assign Students Modal */}
      {assignSubject && (
        <div className="modal-overlay" onClick={e => e.target === e.currentTarget && setAssignSubject(null)}>
          <div className="modal" style={{ maxWidth: 720 }}>
            <div className="modal-header">
              <div>
                <h2>👥 Assign Students</h2>
                <p style={{ fontSize: '.85rem', color: 'var(--text-secondary)', marginTop: 4 }}>
                  Subject: <strong>[{assignSubject.courseCode}] {assignSubject.subjectName}</strong>
                </p>
              </div>
              <button className="modal-close" onClick={() => setAssignSubject(null)}>✕</button>
            </div>

            <div className="modal-body">
              {loadingStudents ? (
                <div className="loading-spinner"><div className="spinner"></div></div>
              ) : (
                <>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16, flexWrap: 'wrap', gap: 10 }}>
                    <input
                      type="text"
                      className="form-control"
                      style={{ width: '280px' }}
                      placeholder="🔍 Search student name, reg no..."
                      value={searchStudent}
                      onChange={e => setSearchStudent(e.target.value)}
                    />
                    <div style={{ display: 'flex', gap: 8 }}>
                      <button
                        type="button"
                        className="btn btn-secondary btn-sm"
                        onClick={() => handleSelectAll(true)}
                      >
                        Select All
                      </button>
                      <button
                        type="button"
                        className="btn btn-secondary btn-sm"
                        onClick={() => handleSelectAll(false)}
                      >
                        Clear All
                      </button>
                    </div>
                  </div>

                  {filteredStudents.length === 0 ? (
                    <div className="empty-state" style={{ padding: 24 }}>
                      <p>No registered students found.</p>
                    </div>
                  ) : (
                    <div style={{ maxHeight: 340, overflowY: 'auto', border: '1px solid var(--border)', borderRadius: 8 }}>
                      <table className="data-table" style={{ margin: 0 }}>
                        <thead>
                          <tr>
                            <th style={{ width: 40 }}></th>
                            <th>Reg. Number</th>
                            <th>Student Name</th>
                            <th>Department</th>
                            <th>Status</th>
                          </tr>
                        </thead>
                        <tbody>
                          {filteredStudents.map(st => {
                            const isSelected = selectedStudentIds.has(st.id);
                            return (
                              <tr
                                key={st.id}
                                onClick={() => toggleStudent(st.id)}
                                style={{
                                  cursor: 'pointer',
                                  background: isSelected ? 'rgba(79, 70, 229, 0.05)' : undefined
                                }}
                              >
                                <td>
                                  <input
                                    type="checkbox"
                                    checked={isSelected}
                                    onChange={() => toggleStudent(st.id)}
                                    onClick={e => e.stopPropagation()}
                                  />
                                </td>
                                <td><strong>{st.registerNumber}</strong></td>
                                <td>
                                  <strong>{st.fullName}</strong>
                                  <div style={{ fontSize: '.75rem', color: 'var(--text-secondary)' }}>{st.email}</div>
                                </td>
                                <td>{st.department || '-'}</td>
                                <td>
                                  {isSelected ? (
                                    <span className="badge badge-success">✓ Assigned</span>
                                  ) : (
                                    <span className="badge badge-gray">Not Assigned</span>
                                  )}
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  )}

                  <div style={{ marginTop: 12, fontSize: '.85rem', color: 'var(--text-secondary)' }}>
                    Selected: <strong>{selectedStudentIds.size}</strong> of {allStudents.length} students
                  </div>
                </>
              )}
            </div>

            <div className="modal-footer">
              <button
                type="button"
                className="btn btn-secondary"
                onClick={() => setAssignSubject(null)}
              >
                Cancel
              </button>
              <button
                type="button"
                className="btn btn-primary"
                onClick={handleSaveAssignment}
                disabled={savingAssignment || loadingStudents}
              >
                {savingAssignment ? 'Saving Assignments...' : `Save & Assign (${selectedStudentIds.size}) Students`}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
