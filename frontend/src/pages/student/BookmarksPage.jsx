import { useState, useEffect } from 'react';
import { bookmarkService } from '../../services/dataService';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';

export default function BookmarksPage() {
  const [bookmarks, setBookmarks] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const fetch = () => {
    setLoading(true);
    bookmarkService.getAll().then(res => setBookmarks(res.data)).catch(() => {}).finally(() => setLoading(false));
  };

  useEffect(() => { fetch(); }, []);

  const handleRemove = async (id) => {
    try { await bookmarkService.remove(id); toast.success('Bookmark removed'); fetch(); } catch { toast.error('Failed'); }
  };

  if (loading) return <div className="loading-spinner"><div className="spinner"></div></div>;

  return (
    <div>
      <h2 style={{ marginBottom: 24, fontWeight: 800 }}>🔖 Bookmarked Experiments</h2>
      {bookmarks.length === 0 ? (
        <div className="empty-state"><div className="empty-icon">🔖</div><h3>No bookmarks</h3><p>Bookmark experiments to save them for later.</p></div>
      ) : (
        <div className="experiments-grid">
          {bookmarks.map(exp => (
            <div key={exp.id} className="experiment-card">
              <div className="card-top">
                <div className="exp-number">Experiment #{exp.experimentNumber}</div>
                <h4>{exp.title}</h4>
                <div className="subject-tag">📖 {exp.subjectName}</div>
              </div>
              <div className="card-bottom">
                <button className="btn btn-primary btn-sm" onClick={() => navigate(`/student/experiments/${exp.id}`)}>View</button>
                <button className="btn btn-danger btn-sm" onClick={() => handleRemove(exp.id)}>Remove</button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
