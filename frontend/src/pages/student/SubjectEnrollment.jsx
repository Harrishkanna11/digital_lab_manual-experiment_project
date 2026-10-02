import { useState, useEffect } from 'react';
import { subjectService } from '../../services/dataService';
import toast from 'react-hot-toast';

export default function SubjectEnrollment() {
  const [allSubjects, setAllSubjects] = useState([]);
  const [enrolledSubjects, setEnrolledSubjects] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetch = async () => {
    setLoading(true);
    try {
      const [all, enrolled] = await Promise.all([subjectService.getAll(), subjectService.getForStudent()]);
      setAllSubjects(all.data);
      setEnrolledSubjects(enrolled.data);
    } catch {} finally { setLoading(false); }
  };

  useEffect(() => { fetch(); }, []);

  const enrolledIds = new Set(enrolledSubjects.map(s => s.id));

  const handleEnroll = async (id) => {
    try { await subjectService.enroll(id); toast.success('Enrolled successfully!'); fetch(); } catch (err) { toast.error(err.response?.data?.message || 'Failed'); }
  };

  const handleUnenroll = async (id) => {
    try { await subjectService.unenroll(id); toast.success('Unenrolled'); fetch(); } catch { toast.error('Failed'); }
  };

  if (loading) return <div className="loading-spinner"><div className="spinner"></div></div>;

  return (
    <div>
      <h2 style={{ marginBottom: 24, fontWeight: 800 }}>🎓 Subject Enrollment</h2>

      {enrolledSubjects.length > 0 && (
        <div style={{ marginBottom: 32 }}>
          <h3 style={{ marginBottom: 12, fontSize: '1rem', fontWeight: 700 }}>Your Enrolled Subjects</h3>
          <div className="experiments-grid">
            {enrolledSubjects.map(s => (
              <div key={s.id} className="experiment-card">
                <div className="card-top">
                  <div className="exp-number">{s.courseCode}</div>
                  <h4>{s.subjectName}</h4>
                  <div className="exp-meta">
                    <span>🏫 {s.department}</span>
                    <span>📅 Year {s.year}, Sem {s.semester}</span>
                  </div>
                </div>
                <div className="card-bottom">
                  <span className="badge badge-success">✓ Enrolled</span>
                  <button className="btn btn-danger btn-sm" onClick={() => handleUnenroll(s.id)}>Unenroll</button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <h3 style={{ marginBottom: 12, fontSize: '1rem', fontWeight: 700 }}>Available Subjects</h3>
      <div className="experiments-grid">
        {allSubjects.filter(s => !enrolledIds.has(s.id)).map(s => (
          <div key={s.id} className="experiment-card">
            <div className="card-top">
              <div className="exp-number">{s.courseCode}</div>
              <h4>{s.subjectName}</h4>
              <div className="exp-meta">
                <span>🏫 {s.department}</span>
                <span>📅 Year {s.year}, Sem {s.semester}</span>
                {s.facultyName && <span>👨‍🏫 {s.facultyName}</span>}
              </div>
            </div>
            <div className="card-bottom">
              <span className="badge badge-gray">Not Enrolled</span>
              <button className="btn btn-primary btn-sm" onClick={() => handleEnroll(s.id)}>Enroll</button>
            </div>
          </div>
        ))}
        {allSubjects.filter(s => !enrolledIds.has(s.id)).length === 0 && (
          <div className="empty-state"><p>No more subjects available to enroll.</p></div>
        )}
      </div>
    </div>
  );
}
