import { useState, useEffect } from 'react';
import { studentService } from '../../services/dataService';
import toast from 'react-hot-toast';

export default function StudentManagement() {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  const fetchStudents = () => {
    studentService.getAll().then(res => setStudents(res.data)).catch(() => {}).finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchStudents();
  }, []);

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this student?')) return;
    try {
      await studentService.delete(id);
      toast.success('Student deleted successfully.');
      fetchStudents();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to delete student');
    }
  };

  const filtered = (students || []).filter(s =>
    (s.fullName || '').toLowerCase().includes((search || '').toLowerCase()) ||
    (s.registerNumber || '').toLowerCase().includes((search || '').toLowerCase()) ||
    (s.email || '').toLowerCase().includes((search || '').toLowerCase())
  );

  if (loading) return <div className="loading-spinner"><div className="spinner"></div></div>;

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <h2 style={{ fontWeight: 800 }}>👥 Students</h2>
        <div className="search-box"><span>🔍</span><input placeholder="Search students..." value={search} onChange={e => setSearch(e.target.value)} /></div>
      </div>

      {filtered.length === 0 ? (
        <div className="empty-state"><div className="empty-icon">👥</div><h3>No students found</h3></div>
      ) : (
        <div className="data-table-container">
          <table className="data-table">
            <thead><tr><th>Name</th><th>Register No.</th><th>Email</th><th>Dept</th><th>Year</th><th>Section</th><th>Experiments</th><th>Attendance</th><th>Avg Marks</th><th>Actions</th></tr></thead>
            <tbody>
              {filtered.map(s => (
                <tr key={s.id}>
                  <td><strong>{s.fullName}</strong></td>
                  <td><span className="badge badge-purple">{s.registerNumber}</span></td>
                  <td style={{ fontSize: '.82rem', color: 'var(--text-secondary)' }}>{s.email}</td>
                  <td>{s.department}</td>
                  <td>{s.year}</td>
                  <td>{s.section}</td>
                  <td>{s.completedExperiments}/{s.totalExperiments}</td>
                  <td><span className={`badge ${s.attendancePercentage >= 75 ? 'badge-success' : 'badge-danger'}`}>{s.attendancePercentage}%</span></td>
                  <td><span className={`badge ${s.averageMarks >= 60 ? 'badge-success' : s.averageMarks >= 40 ? 'badge-warning' : 'badge-gray'}`}>{s.averageMarks}%</span></td>
                  <td>
                    <button className="btn btn-danger btn-sm" onClick={() => handleDelete(s.id)}>Delete</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
