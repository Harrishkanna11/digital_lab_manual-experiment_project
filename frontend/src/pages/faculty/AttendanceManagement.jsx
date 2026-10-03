import { useState, useEffect, useCallback } from 'react';
import {
  attendanceService,
  studentService as studentSvc,
  subjectService,
  experimentService
} from '../../services/dataService';
import toast from 'react-hot-toast';

export default function AttendanceManagement() {
  const [subjects, setSubjects] = useState([]);
  const [experiments, setExperiments] = useState([]);
  const [selectedSubject, setSelectedSubject] = useState('');
  const [selectedDate, setSelectedDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [selectedExperiment, setSelectedExperiment] = useState('');

  const [enrolledStudents, setEnrolledStudents] = useState([]);
  const [attendanceMap, setAttendanceMap] = useState({});
  const [existingDateRecords, setExistingDateRecords] = useState({});
  const [loadingStudents, setLoadingStudents] = useState(false);
  const [saving, setSaving] = useState(false);

  // Historical records
  const [records, setRecords] = useState([]);
  const [historySubjectFilter, setHistorySubjectFilter] = useState('');
  const [loadingInitial, setLoadingInitial] = useState(true);

  // Edit modal for individual historical record
  const [editingRecord, setEditingRecord] = useState(null);
  const [editStatus, setEditStatus] = useState('PRESENT');
  const [updatingRecord, setUpdatingRecord] = useState(false);

  // Initial load: subjects, experiments, all faculty records
  useEffect(() => {
    Promise.all([
      subjectService.getForFaculty().then(res => res.data?.length ? res : subjectService.getAll()).catch(() => subjectService.getAll()),
      experimentService.getForFaculty().then(res => res.data?.length ? res : experimentService.getAll()).catch(() => experimentService.getAll()),
      attendanceService.getForFaculty().catch(() => ({ data: [] }))
    ])
      .then(([subRes, expRes, attRes]) => {
        const subs = subRes.data || [];
        setSubjects(subs);
        setExperiments(expRes.data || []);
        setRecords(attRes.data || []);
        if (subs.length > 0) {
          setSelectedSubject(String(subs[0].id));
        }
      })
      .catch(() => {})
      .finally(() => setLoadingInitial(false));
  }, []);

  // Fetch enrolled students and attendance for chosen subject + date
  const loadSubjectAttendance = useCallback(async (subjectId, date) => {
    if (!subjectId) {
      setEnrolledStudents([]);
      setAttendanceMap({});
      setExistingDateRecords({});
      return;
    }

    setLoadingStudents(true);
    try {
      const [studentsRes, dateAttendanceRes] = await Promise.all([
        studentSvc.getBySubject(subjectId).catch(() => ({ data: [] })),
        date ? attendanceService.getBySubjectAndDate(subjectId, date).catch(() => ({ data: [] })) : Promise.resolve({ data: [] })
      ]);

      const students = studentsRes.data || [];
      const dateRecords = dateAttendanceRes.data || [];

      // Map studentId -> existing record
      const recordMap = {};
      dateRecords.forEach(r => {
        recordMap[r.studentId] = r;
      });
      setExistingDateRecords(recordMap);

      // Initialize attendance statuses: if already marked use saved status, else default to PRESENT
      const initialMap = {};
      students.forEach(st => {
        if (recordMap[st.id]) {
          initialMap[st.id] = recordMap[st.id].status;
        } else {
          initialMap[st.id] = 'PRESENT';
        }
      });

      setEnrolledStudents(students);
      setAttendanceMap(initialMap);
    } catch {
      toast.error('Failed to load students for this subject');
    } finally {
      setLoadingStudents(false);
    }
  }, []);

  // Reload students & date records whenever subject or date changes
  useEffect(() => {
    if (selectedSubject) {
      loadSubjectAttendance(selectedSubject, selectedDate);
    }
  }, [selectedSubject, selectedDate, loadSubjectAttendance]);

  // Reload historical records
  const reloadHistory = (subjectId) => {
    if (!subjectId) {
      attendanceService.getForFaculty()
        .then(res => setRecords(res.data || []))
        .catch(() => setRecords([]));
    } else {
      attendanceService.getBySubject(subjectId)
        .then(res => setRecords(res.data || []))
        .catch(() => setRecords([]));
    }
  };

  // Bulk mark all
  const handleMarkAll = (status) => {
    const updated = {};
    enrolledStudents.forEach(st => {
      updated[st.id] = status;
    });
    setAttendanceMap(updated);
  };

  // Toggle individual student status
  const handleToggleStatus = (studentId, status) => {
    setAttendanceMap(prev => ({
      ...prev,
      [studentId]: status
    }));
  };

  // Save / Submit attendance for all enrolled students
  const handleSaveAttendance = async () => {
    if (!selectedSubject) {
      toast.error('Please select a subject');
      return;
    }
    if (!selectedDate) {
      toast.error('Please select a date');
      return;
    }
    if (enrolledStudents.length === 0) {
      toast.error('No students enrolled in this subject to mark');
      return;
    }

    setSaving(true);
    try {
      const recordsToSubmit = enrolledStudents.map(st => ({
        studentId: st.id,
        subjectId: parseInt(selectedSubject),
        experimentId: selectedExperiment ? parseInt(selectedExperiment) : null,
        date: selectedDate,
        status: attendanceMap[st.id] || 'PRESENT'
      }));

      await attendanceService.markBulk(recordsToSubmit);
      toast.success(`Attendance successfully saved for ${recordsToSubmit.length} student(s)!`);

      // Refresh both current sheet and history
      loadSubjectAttendance(selectedSubject, selectedDate);
      reloadHistory(historySubjectFilter);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to save attendance');
    } finally {
      setSaving(false);
    }
  };

  // Handle single record update from history table
  const handleOpenEditModal = (record) => {
    setEditingRecord(record);
    setEditStatus(record.status);
  };

  const handleUpdateRecord = async (e) => {
    e.preventDefault();
    if (!editingRecord) return;

    setUpdatingRecord(true);
    try {
      await attendanceService.update(editingRecord.id, {
        studentId: editingRecord.studentId,
        subjectId: editingRecord.subjectId,
        experimentId: editingRecord.experimentId,
        date: editingRecord.date,
        status: editStatus
      });
      toast.success('Attendance record updated successfully!');
      setEditingRecord(null);

      // Refresh
      if (selectedSubject === String(editingRecord.subjectId) && selectedDate === editingRecord.date) {
        loadSubjectAttendance(selectedSubject, selectedDate);
      }
      reloadHistory(historySubjectFilter);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update record');
    } finally {
      setUpdatingRecord(false);
    }
  };

  if (loadingInitial) {
    return <div className="loading-spinner"><div className="spinner"></div></div>;
  }

  // Count present vs absent in current sheet
  const presentCount = enrolledStudents.filter(s => attendanceMap[s.id] === 'PRESENT').length;
  const absentCount = enrolledStudents.filter(s => attendanceMap[s.id] === 'ABSENT').length;
  const isPreviouslyMarked = Object.keys(existingDateRecords).length > 0;

  const relevantExperiments = experiments.filter(ex => String(ex.subjectId) === String(selectedSubject));

  return (
    <div>
      <div style={{ marginBottom: 24 }}>
        <h2 style={{ fontWeight: 800 }}>📋 Attendance Management</h2>
        <p style={{ color: 'var(--text-secondary)', fontSize: '.95rem' }}>
          Select a subject and date to mark or review student attendance.
        </p>
      </div>

      {/* Attendance Sheet Controls Card */}
      <div className="stat-card" style={{ marginBottom: 28, padding: 24 }}>
        <h3 style={{ marginBottom: 18, fontWeight: 700, fontSize: '1.1rem' }}>
          🎯 Mark Subject Attendance
        </h3>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 16, marginBottom: 20 }}>
          {/* Subject Dropdown */}
          <div className="form-group" style={{ marginBottom: 0 }}>
            <label style={{ fontWeight: 600, fontSize: '.85rem' }}>Subject / Course *</label>
            <select
              className="form-control"
              value={selectedSubject}
              onChange={e => setSelectedSubject(e.target.value)}
            >
              <option value="">-- Select Subject --</option>
              {subjects.map(s => (
                <option key={s.id} value={s.id}>{s.courseCode} - {s.subjectName}</option>
              ))}
            </select>
          </div>

          {/* Date Picker */}
          <div className="form-group" style={{ marginBottom: 0 }}>
            <label style={{ fontWeight: 600, fontSize: '.85rem' }}>Attendance Date *</label>
            <input
              type="date"
              className="form-control"
              value={selectedDate}
              onChange={e => setSelectedDate(e.target.value)}
            />
          </div>

          {/* Optional Experiment */}
          <div className="form-group" style={{ marginBottom: 0 }}>
            <label style={{ fontWeight: 600, fontSize: '.85rem' }}>Experiment (Optional)</label>
            <select
              className="form-control"
              value={selectedExperiment}
              onChange={e => setSelectedExperiment(e.target.value)}
            >
              <option value="">None (General Class)</option>
              {relevantExperiments.map(ex => (
                <option key={ex.id} value={ex.id}>#{ex.experimentNumber} {ex.title}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Status notice if already marked */}
        {selectedSubject && (
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12, borderTop: '1px solid var(--border)', paddingTop: 16 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
              {isPreviouslyMarked ? (
                <span className="badge badge-warning" style={{ fontSize: '.85rem', padding: '6px 12px' }}>
                  ⚠️ Attendance already recorded for this date (editing mode)
                </span>
              ) : (
                <span className="badge badge-info" style={{ fontSize: '.85rem', padding: '6px 12px' }}>
                  ℹ️ New attendance session
                </span>
              )}
              {enrolledStudents.length > 0 && (
                <span style={{ fontSize: '.9rem', color: 'var(--text-secondary)' }}>
                  Total Enrolled: <strong>{enrolledStudents.length}</strong> | Present: <strong style={{ color: 'var(--success)' }}>{presentCount}</strong> | Absent: <strong style={{ color: 'var(--danger)' }}>{absentCount}</strong>
                </span>
              )}
            </div>

            {/* Quick Bulk Action Buttons */}
            {enrolledStudents.length > 0 && (
              <div style={{ display: 'flex', gap: 8 }}>
                <button
                  type="button"
                  className="btn btn-secondary btn-sm"
                  onClick={() => handleMarkAll('PRESENT')}
                  title="Mark all enrolled students as Present"
                >
                  ✓ All Present
                </button>
                <button
                  type="button"
                  className="btn btn-secondary btn-sm"
                  onClick={() => handleMarkAll('ABSENT')}
                  title="Mark all enrolled students as Absent"
                >
                  ✕ All Absent
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Enrolled Students Attendance List */}
      <div style={{ marginBottom: 36 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
          <h3 style={{ fontWeight: 700 }}>
            👥 Enrolled Students ({enrolledStudents.length})
          </h3>
          {enrolledStudents.length > 0 && (
            <button
              className="btn btn-primary"
              onClick={handleSaveAttendance}
              disabled={saving || loadingStudents}
              style={{ padding: '8px 20px', fontWeight: 600 }}
            >
              {saving ? 'Saving Attendance...' : '💾 Save Attendance'}
            </button>
          )}
        </div>

        {loadingStudents ? (
          <div className="loading-spinner"><div className="spinner"></div></div>
        ) : !selectedSubject ? (
          <div className="empty-state">
            <div className="empty-icon">👆</div>
            <h3>Please select a subject</h3>
            <p>Select a subject above to view enrolled students and mark attendance.</p>
          </div>
        ) : enrolledStudents.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">👥</div>
            <h3>No students enrolled in this subject</h3>
            <p>Students must be enrolled in this subject before attendance can be recorded.</p>
          </div>
        ) : (
          <div className="data-table-container">
            <table className="data-table">
              <thead>
                <tr>
                  <th style={{ width: '60px' }}>#</th>
                  <th>Reg. Number</th>
                  <th>Student Name</th>
                  <th>Department / Year</th>
                  <th style={{ width: '260px', textAlign: 'center' }}>Attendance Status</th>
                </tr>
              </thead>
              <tbody>
                {enrolledStudents.map((st, index) => {
                  const currentStatus = attendanceMap[st.id] || 'PRESENT';
                  return (
                    <tr key={st.id} style={{ background: currentStatus === 'ABSENT' ? 'rgba(239, 68, 68, 0.04)' : undefined }}>
                      <td>{index + 1}</td>
                      <td><strong>{st.registerNumber}</strong></td>
                      <td>
                        <strong>{st.fullName}</strong>
                        <div style={{ fontSize: '.75rem', color: 'var(--text-secondary)' }}>{st.email}</div>
                      </td>
                      <td>{st.department || '-'} {st.year ? `(Year ${st.year})` : ''}</td>
                      <td style={{ textAlign: 'center' }}>
                        <div style={{ display: 'inline-flex', borderRadius: '8px', overflow: 'hidden', border: '1px solid var(--border)' }}>
                          <button
                            type="button"
                            onClick={() => handleToggleStatus(st.id, 'PRESENT')}
                            style={{
                              padding: '6px 16px',
                              fontWeight: 600,
                              fontSize: '.85rem',
                              cursor: 'pointer',
                              border: 'none',
                              background: currentStatus === 'PRESENT' ? 'var(--success)' : 'var(--bg)',
                              color: currentStatus === 'PRESENT' ? '#fff' : 'var(--text-secondary)',
                              transition: 'all 0.2s'
                            }}
                          >
                            ✓ Present
                          </button>
                          <button
                            type="button"
                            onClick={() => handleToggleStatus(st.id, 'ABSENT')}
                            style={{
                              padding: '6px 16px',
                              fontWeight: 600,
                              fontSize: '.85rem',
                              cursor: 'pointer',
                              border: 'none',
                              borderLeft: '1px solid var(--border)',
                              background: currentStatus === 'ABSENT' ? 'var(--danger)' : 'var(--bg)',
                              color: currentStatus === 'ABSENT' ? '#fff' : 'var(--text-secondary)',
                              transition: 'all 0.2s'
                            }}
                          >
                            ✕ Absent
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {enrolledStudents.length > 0 && (
          <div style={{ marginTop: 16, display: 'flex', justifyContent: 'flex-end' }}>
            <button
              className="btn btn-primary"
              onClick={handleSaveAttendance}
              disabled={saving || loadingStudents}
              style={{ padding: '10px 24px', fontWeight: 600 }}
            >
              {saving ? 'Saving Attendance...' : '💾 Save Attendance'}
            </button>
          </div>
        )}
      </div>

      {/* Historical Attendance Records */}
      <div style={{ borderTop: '1px solid var(--border)', paddingTop: 28 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 18, flexWrap: 'wrap', gap: 12 }}>
          <div>
            <h3 style={{ fontWeight: 700 }}>📜 Past Attendance Records</h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: '.85rem' }}>
              View and edit previously recorded student attendance sessions.
            </p>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <label style={{ fontSize: '.85rem', fontWeight: 600 }}>Filter by Subject:</label>
            <select
              className="form-control"
              style={{ width: 260 }}
              value={historySubjectFilter}
              onChange={e => {
                setHistorySubjectFilter(e.target.value);
                reloadHistory(e.target.value);
              }}
            >
              <option value="">-- All Subjects --</option>
              {subjects.map(s => (
                <option key={s.id} value={s.id}>{s.courseCode} - {s.subjectName}</option>
              ))}
            </select>
          </div>
        </div>

        {records.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">📋</div>
            <h3>No attendance records recorded yet</h3>
          </div>
        ) : (
          <div className="data-table-container">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Student</th>
                  <th>Reg. Number</th>
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
                    <td>
                      <span className={`badge ${r.status === 'PRESENT' ? 'badge-success' : 'badge-danger'}`}>
                        {r.status}
                      </span>
                    </td>
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
      </div>

      {/* Edit Single Record Modal */}
      {editingRecord && (
        <div className="modal-overlay" onClick={e => e.target === e.currentTarget && setEditingRecord(null)}>
          <div className="modal">
            <div className="modal-header">
              <h2>Edit Attendance Record</h2>
              <button className="modal-close" onClick={() => setEditingRecord(null)}>✕</button>
            </div>
            <form onSubmit={handleUpdateRecord}>
              <div className="modal-body">
                <div style={{ marginBottom: 16 }}>
                  <div style={{ fontSize: '.85rem', color: 'var(--text-secondary)' }}>Student:</div>
                  <strong>{editingRecord.studentName} ({editingRecord.registerNumber})</strong>
                </div>
                <div style={{ marginBottom: 16 }}>
                  <div style={{ fontSize: '.85rem', color: 'var(--text-secondary)' }}>Subject:</div>
                  <strong>{editingRecord.subjectName}</strong>
                </div>
                <div style={{ marginBottom: 16 }}>
                  <div style={{ fontSize: '.85rem', color: 'var(--text-secondary)' }}>Date:</div>
                  <strong>{new Date(editingRecord.date).toLocaleDateString()}</strong>
                </div>

                <div className="form-group">
                  <label style={{ fontWeight: 600 }}>Attendance Status *</label>
                  <select
                    className="form-control"
                    value={editStatus}
                    onChange={e => setEditStatus(e.target.value)}
                  >
                    <option value="PRESENT">Present</option>
                    <option value="ABSENT">Absent</option>
                  </select>
                </div>
              </div>
              <div className="modal-footer">
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => setEditingRecord(null)}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn btn-primary"
                  disabled={updatingRecord}
                >
                  {updatingRecord ? 'Saving...' : 'Update Status'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
