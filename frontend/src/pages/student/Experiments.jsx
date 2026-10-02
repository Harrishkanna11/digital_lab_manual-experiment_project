import { useState, useEffect, useCallback } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { experimentService, bookmarkService } from '../../services/dataService';
import toast from 'react-hot-toast';

export default function Experiments() {
  const [experiments, setExperiments] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const fetchExperiments = useCallback((searchTerm = '') => {
    setLoading(true);
    experimentService.getForStudent(searchTerm)
      .then(res => setExperiments(res.data || []))
      .catch(() => toast.error('Failed to load experiments'))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    fetchExperiments();
  }, [fetchExperiments]);

  const handleSearch = (e) => {
    e.preventDefault();
    fetchExperiments(search);
  };

  const handleBookmark = async (id) => {
    try {
      await bookmarkService.add(id);
      toast.success('Experiment bookmarked!');
    } catch {
      toast.error('Already bookmarked or failed');
    }
  };

  if (loading) return <div className="loading-spinner"><div className="spinner"></div></div>;

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24, flexWrap: 'wrap', gap: 12 }}>
        <h2 style={{ fontWeight: 800 }}>🔬 Practical Experiments</h2>
        <form onSubmit={handleSearch} className="search-box">
          <span>🔍</span>
          <input
            placeholder="Search experiments by title or number..."
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </form>
      </div>

      {experiments.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">🔬</div>
          <h3>No experiments available</h3>
          <p>Enroll in subjects to see published experiments and lab guides.</p>
          <Link to="/student/enroll" className="btn btn-primary" style={{ marginTop: 12 }}>
            Enroll in Subjects →
          </Link>
        </div>
      ) : (
        <div className="experiments-grid">
          {experiments.map(exp => (
            <div key={exp.id} className="experiment-card">
              <div className="card-top">
                <div className="exp-number">Experiment #{exp.experimentNumber}</div>
                <h4>{exp.title}</h4>
                <div className="subject-tag">📖 {exp.subjectName}</div>
                <div className="exp-meta">
                  {exp.difficulty && (
                    <span className={`badge badge-${exp.difficulty === 'EASY' ? 'success' : exp.difficulty === 'MEDIUM' ? 'warning' : 'danger'}`}>
                      {exp.difficulty}
                    </span>
                  )}
                  <span>⏱ {exp.estimatedDuration || '-'} min</span>
                </div>
              </div>
              <div className="card-bottom">
                <button className="btn btn-primary btn-sm" onClick={() => navigate(`/student/experiments/${exp.id}`)}>
                  View Details & Submit →
                </button>
                <button className="btn btn-secondary btn-sm" onClick={() => handleBookmark(exp.id)}>
                  🔖 Bookmark
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
