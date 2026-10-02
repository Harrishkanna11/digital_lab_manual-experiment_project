import { useState, useEffect } from 'react';
import { labManualService } from '../../services/dataService';
import { useNavigate } from 'react-router-dom';

export default function LabManuals() {
  const [manuals, setManuals] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    labManualService.getPublished().then(res => setManuals(res.data)).catch(() => {}).finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="loading-spinner"><div className="spinner"></div></div>;

  return (
    <div>
      <h2 style={{ marginBottom: 24, fontWeight: 800 }}>📚 Lab Manuals</h2>
      {manuals.length === 0 ? (
        <div className="empty-state"><div className="empty-icon">📚</div><h3>No lab manuals available</h3><p>Lab manuals will appear here once published by faculty.</p></div>
      ) : (
        <div className="experiments-grid">
          {manuals.map(m => (
            <div key={m.id} className="experiment-card" style={{ cursor: 'pointer' }} onClick={() => navigate('/student/experiments')}>
              <div className="card-top">
                <div className="exp-number">{m.courseCode}</div>
                <h4>{m.title}</h4>
                <div className="subject-tag">📖 {m.subjectName}</div>
                <div className="exp-meta">
                  <span>📅 {m.academicYear}</span>
                  <span>🏫 {m.department}</span>
                  <span>📝 {m.experimentCount} experiments</span>
                </div>
              </div>
              <div className="card-bottom">
                <span className="badge badge-info">Year {m.year}, Sem {m.semester}</span>
                <span style={{ fontSize: '.8rem', color: 'var(--text-light)' }}>By {m.facultyName}</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
